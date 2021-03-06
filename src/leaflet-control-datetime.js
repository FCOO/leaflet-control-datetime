/****************************************************************************
    leaflet-control-datetime.js, 

    (c) 2016, FCOO

    https://github.com/FCOO/leaflet-control-datetime
    https://github.com/FCOO

****************************************************************************/
(function ($, L, window, document, undefined) {
    "use strict";
    /**
     * Adds a time selector to Leaflet based maps.
     **/
    if (console === undefined) {
        this.console = { log: function (/*msg*/) { /* do nothing since it would otherwise break IE */} };
    }
    
    L.Control.Datetime = L.Control.extend({
        options: {
              VERSION: "{VERSION}",
            datetimes: [],
            callback: null,
            title: null,
            language: null,
            position: 'topright',
            visibility: 'visible',
            vertical: false,
            localtime: false,
            prefetch: false,
            mobile: false,
            initialDatetime: null
        },
    
        initialize: function(options) {
            L.Util.setOptions(this, options);
            this._container = L.DomUtil.create('div',
                'leaflet-control-layers leaflet-control-layers-expanded leaflet-control-datetime');
            if (this.options.mobile) {
                $(this._container).addClass('leaflet-control-datetime-mobile');
            }
            if (this.options.visibility == 'hidden') {
                $(this._container).css("visibility", this.options.visibility);
            }

            L.DomEvent.disableClickPropagation(this._container);
            this._createDatetimeSelector(this._container);
        },
    
        onAdd: function(map) {
            this._map = map;
            this._map.on("overlayadd overlayremove", this._layersChanged, this);
    
            // Let subscribers know of initial timezone state
            var timezone = 'utc';
            if (this._timezone[0].checked) {
                timezone = 'local';
            }
            map.fire('timezonechange', {timezone: timezone});
    
            return this._container;
        },
    
        onRemove: function() {
            this._container.style.display = 'none';
            this._map.off("overlayadd overlayremove", this._layersChanged, this);
            this._map = null;
        },
    
        _createDatetimeSelector: function(container) {
            var that = this;
            if (this.options.title) {
                var titleDiv = L.DomUtil.create('div', 'leaflet-control-datetime-title', container);
                titleDiv.innerHTML = this.options.title;
            }
            var selectList = L.DomUtil.create('select', 'leaflet-control-datetime-dateselect', container);
            selectList._instance = this;
            var select_index = null;
            for (var i1=0; i1<this.options.datetimes.length; i1++) {
                var option = document.createElement("option");
                var date = this.options.datetimes[i1];
                option.value = date.toISOString();
                //option.text = date.toISOString().substr(0,16);
                var locmoment = moment(date);
                if (this.options.language !== null) {
                    locmoment.locale(this.options.language);
                }
                locmoment = locmoment.format('LLLL');
                locmoment = locmoment.charAt(0).toUpperCase() + locmoment.slice(1);
                $(option).text(locmoment);
                //option.text = date.toString().split(' (')[0];
                selectList.appendChild(option);
                if (this.options.initialDatetime !== null) {
                    if (this.options.initialDatetime.valueOf() == date.valueOf()) {
                        select_index = i1;
                        if (this.options.callback !== null) {
                            this.options.callback('datetime', option.value);
                        }
                    }
                }
            }
            if (select_index === null) {
                select_index = this._getNowIndex();
                if (this.options.callback !== null) {
                    if (select_index !== null) {
                        this.options.callback('datetime', selectList.options[select_index].value);
                    }
                }
            }
            selectList.onchange = this._datetimeChanged;
            selectList.selectedIndex = select_index;
            //L.DomEvent.addListener(selectList, 'onchange', this._datetimeChanged, L.DomEvent.stopPropagation);
    
            // Add slider control (jquery-ui)
            var sliderDiv = $(L.DomUtil.create('div', 'leaflet-control-datetime-sliderdiv', container));
            sliderDiv.slider({
                "class": "leaflet-control-datetime-slider",
                min: 0,
                max: this.options.datetimes.length-1,
                value: select_index,
                slide: this._sliderChanged
            });
            // Create time slider shade
            var sliderRange = $('<div id="leaflet-control-datetime-range"></div>');
            sliderDiv.append(sliderRange);
    
            // Add datetime button controls
            var buttonDiv = L.DomUtil.create('div', 'leaflet-control-datetime-buttondiv', container);
            var startButton = $('<button class="btn btn-default btn-lg"><i class="fa fa-fast-backward"></i></button>');
            startButton.click(this._datetimeStart);
            startButton.appendTo(buttonDiv);
    
            var backButton = $('<button class="btn btn-default btn-lg"><i class="fa fa-step-backward"></i></button>');
            backButton.click(this._datetimeBack);
            backButton.appendTo(buttonDiv);
    
            var nowstr = this._('Now');
            nowstr = '<button class="btn btn-default btn-lg"><span class="fa">' + nowstr + '</span></button>';
            var nowButton = $(nowstr);
            nowButton.click(this._datetimeNow);
            nowButton.appendTo(buttonDiv);
    
            var forwardButton = $('<button class="btn btn-default btn-lg"><i class="fa fa-step-forward"></i></button>');
            forwardButton.click(this._datetimeForward);
            forwardButton.appendTo(buttonDiv);
    
            var endButton = $('<button class="btn btn-default btn-lg"><i class="fa fa-fast-forward"></i></button>');
            endButton.click(this._datetimeEnd);
            endButton.appendTo(buttonDiv);
    
            /*
            // Add timezone selector
            // Find all timezones
            var timezones_all = moment.tz.names();
            // Filter only Atlantic and Europe timezones
            var timezones = $.grep(timezones_all, function(tz) {
                var regex = /(Atlantic|Europe)\//;
                return regex.test(tz);
            });
            // Set local timezone as first timezone
            var timezone_local = jstz.determine().name();
            var index_local = timezones.indexOf(timezone_local);
            if (index_local > -1) {
                timezones.splice(index_local, 1);
            }
            timezones.splice(0, 0, timezone_local);
            // Set UTC as second timezone
            timezones.splice(1, 0, 'UTC');
            var selectTimezone = $(L.DomUtil.create('select', 'leaflet-control-datetime-timezoneselect', container));
            selectTimezone.append($("<option>").attr('disabled', 'disabled').attr('selected', 'selected').text('Select timezone'));
            $(timezones).each(function() {
                selectTimezone.append($("<option>").attr('value', this).text(this));
            });
            */
            
            // Add local time checkbox
            var timecb = $('<input>', {
                            type: "checkbox",
                            checked: "checked",
                            "class": "leaflet-control-datetime-localtime-checkbox"
            });
            this._timezone = timecb;
            var callback = this.options.callback;
            timecb.click(function( /*pEvent*/ ) {
                var select = $('.leaflet-control-datetime-dateselect')[0];
                var datetimes = select._instance.options.datetimes;
                for (var i=0; i<datetimes.length; i++) {
                    var locmoment = moment(datetimes[i]);
                    if (select._instance.options.language !== null) {
                        locmoment.locale(select._instance.options.language);
                    }
                    if (this.checked) {
                        //select.options[i].text = datetimes[i].toString().split(' (')[0];
                        locmoment = locmoment.format('LLLL');
                        locmoment = locmoment.charAt(0).toUpperCase() + locmoment.slice(1);
                        select.options[i].text = locmoment;
                    } else {
                        locmoment = locmoment.utcOffset('+0000').format('LLLL');
                        locmoment = locmoment.charAt(0).toUpperCase() + locmoment.slice(1);
                        select.options[i].text = locmoment + ' GMT';
                        //select.options[i].text = datetimes[i].toUTCString();
                    }
                }
                // callback
                if (callback && typeof callback == 'function') {
                    callback('timezone', this.checked);
                }
    
                // We will migrate to Leaflet signals instead of a callback:
                var timezone = 'utc';
                if (this.checked) {
                    timezone = 'local';
                }
                that._map.fire('timezonechange', {timezone: timezone});
            });
            timecb._instance = this;
    
            var lbl = $('<label>');
            function pad(num) {
                var norm = Math.abs(Math.floor(num));
                return (norm < 10 ? '0' : '') + norm;
            }
            function formatTimezone() {
                var local = new Date();
                var tzo = -local.getTimezoneOffset();
                var sign = tzo >= 0 ? '+' : '-';
                return sign + pad(tzo / 60) + ':' + pad(tzo % 60);
            }
            var txt = this._('Use local time') + ' (GMT' + formatTimezone() + ')';
            var spn = lbl.append(timecb).append($('<span>' + txt + '</span>'));
            var localdiv = $('<div>', {"class": "leaflet-control-datetime-localtime"}).append(spn);
            localdiv.appendTo(container);
        },
    
        _layersChanged: function( /*pEvent*/ ) {
            // Find min and max time for selector (reversed)
            var datetimes = this.options.datetimes;
            var tmin = datetimes[datetimes.length-1];
            var tmax = datetimes[0];
            // Find min and max time
            this._map.eachLayer(function (layer) {
                if (layer._overlay !== undefined && layer._overlay === true) {
                    if (layer.timesteps !== undefined) {
                        var timesteps = layer.timesteps;
                        if (timesteps !== null && timesteps.length > 1) {
                            tmin = (timesteps[0] < tmin ? timesteps[0] : tmin);
                            tmax = (timesteps[timesteps.length-1] > tmax ? timesteps[timesteps.length-1] : tmax);
                        }
                    }
                }
            });
            // Find indices for min and max
            var minDiff = 10000000000;
            var imin = null;
            var i;
            var m;
            for (i in datetimes) {
                m = Math.abs(tmin - datetimes[i]);
                if (m < minDiff) { 
                    minDiff = m;
                    imin = parseInt(i);
                }
            }
            minDiff = 10000000000;
            var imax = null;
            for (i in datetimes) {
                m = Math.abs(tmax - datetimes[i]);
                if (m < minDiff) { 
                    minDiff = m;
                    imax = parseInt(i);
                }
            }
            // FIXME: Do not access the DOM
            var sliderRange = $("#leaflet-control-datetime-range");
            if (imax > imin) {
                // Calculate slider percentages
                var ifull = datetimes.length-1,
                                        pmin = imin/ifull*100.0,
                                        pmax = imax/ifull*100.0,
                                        pwidth = pmax - pmin;
                // Set slider range to span min to max
                sliderRange.css({"margin-left": pmin + "%", "width": pwidth + "%"});
            } else {
                // Unset slider range when no overlays are selected
                sliderRange.css({"margin-left": "", "width": ""});
            }
        },
    
        _datetimeUpdate: function(select) {
            var date = select.options[select.selectedIndex].value;
            //Never used: var container = select.parentElement;
            // callback
            if (this.options.callback && typeof this.options.callback == 'function') {
                this.options.callback('datetime', date);
            }
        },
    
        _datetimeChanged: function( /*pEvent*/ ) {
            var select = $('select.leaflet-control-datetime-dateselect')[0];
            var inst = select._instance;
            var index = select.selectedIndex;
            $('.leaflet-control-datetime-sliderdiv').slider("value", index);
            inst._datetimeUpdate(select);
        },
    
        _sliderChanged: function(pEvent, elem) {
            var select = $('select.leaflet-control-datetime-dateselect')[0];
            var index = Math.max(Math.min(elem.value, select.length - 1), 0);
            select.selectedIndex = index;
            elem.value = index;
            var inst = select._instance;
            inst._datetimeUpdate(select);
        },
    
        _datetimeStart: function( /*pEvent*/ ) {
            //Never used: var elem = pEvent.target;
            var index = 0;
            var select = $('select.leaflet-control-datetime-dateselect')[0];
            select.selectedIndex = index;
            $('.leaflet-control-datetime-sliderdiv').slider("value", index);
            var inst = select._instance;
            inst._datetimeUpdate(select);
        },
    
        _datetimeBack: function( /*pEvent*/ ) {
            var select = $('select.leaflet-control-datetime-dateselect')[0];
            var index = Math.max(select.selectedIndex - 1, 0);
            select.selectedIndex = index;
            $('.leaflet-control-datetime-sliderdiv').slider("value", index);
            var inst = select._instance;
            inst._datetimeUpdate(select);
        },
    
        _datetimeNow: function( /*pEvent*/ ) {
            var select = $('select.leaflet-control-datetime-dateselect')[0];
            var inst = select._instance;
            var index = inst._getNowIndex();
            select.selectedIndex = index;
            $('.leaflet-control-datetime-sliderdiv').slider("value", index);
            inst._datetimeUpdate(select);
        },
    
        _getNowIndex: function() {
            // Find nearest index
            var options = this.options.datetimes;
            var now = new Date();
            var minDiff = 10000000000;
            var index = null;
            var i;
            for (i in options) {
                var m = Math.abs(now - options[i]);
                if (m < minDiff) { 
                    minDiff = m; 
                    index = i; 
                }
            }
            return index;
        }, 
    
        _datetimeForward: function( /*pEvent*/ ) {
            var select = $('select.leaflet-control-datetime-dateselect')[0];
            var index = Math.min(select.selectedIndex + 1, select.length - 1);
            select.selectedIndex = index;
            $('.leaflet-control-datetime-sliderdiv').slider("value", index);
            var inst = select._instance;
            inst._datetimeUpdate(select);
    
            // Prefetch next timestep
            if (inst.options.prefetch) {
                if (index < select.length - 2) {
                    inst._map.eachLayer(function (layer) {
                        // Filter out base layers
                        if (layer._overlay !== undefined && layer._overlay === true) {
                            // Filter out layers with no time instance variable
                            if (layer.timesteps !== undefined) {
                                var timesteps = layer.timesteps;
                                // Filter out layers where timesteps are not yet
                                // initialized and those with only one timestep
                                if (timesteps !== null && timesteps.length > 1) {
                                    var wmsParams = {'time':  select.options[index+1].value};
                                    layer.prefetch(wmsParams);
                                }
                            }
                        }
                    });
                }
            }
        },
    
        _datetimeEnd: function( /*pEvent*/ ) {
            var select = $('select.leaflet-control-datetime-dateselect')[0];
            var index = select.length - 1;
            select.selectedIndex = index;
            $('.leaflet-control-datetime-sliderdiv').slider("value", index);
            var inst = select._instance;
            inst._datetimeUpdate(select);
        },
    
        _datetimeAnimate: function( /*pEvent*/ ) {
            // TODO: Perform animation. This method should not know
            // anything about caching.
        },
    
        _: function(key) {
            var lang = this.options.language;
            var i18n = {
                    en: {
                              'Use local time': 'Use local time',
                              'Now': 'Now'
                    },
                    da: {
                              'Use local time': 'Brug lokal tid',
                              'Now': 'Nu'
                    }
            };
            if (i18n[lang] !== undefined && i18n[lang][key] !== undefined) {
                return  i18n[lang][key];
            }
            return key;
        },
    });
    
    L.Control.datetime = function(options) { return new L.Control.Datetime(options); };

}(jQuery, L, this, document));
