/****************************************************************************
	leaflet-control-datetime.js, 

	(c) 2016, FCOO

	https://github.com/FCOO/leaflet-control-datetime
	https://github.com/FCOO

****************************************************************************/
;(function (/*$, */L, window, document, undefined) {
	"use strict";

	//Extend base leaflet class
	L.LeafletControlDatetime = L.Class.extend({
		includes: L.Mixin.Events,

	//or extend eq. L.Control
	//L.Control.LeafletControlDatetime = L.Control.extend({
		
    //Default options	
		options: {
			VERSION: "{VERSION}"
		
		},

		//initialize
		initialize: function(options) {
			L.setOptions(this, options);

		},

		//addTo
		addTo: function (map) {
			L.Control.prototype.addTo.call(this, map); //Extend eq. L.Control

			return this;
		},


		//onAdd
		onAdd: function (map) {
			this._map = map;
			var result = L.Control.Box.prototype.onAdd.call(this, map );
			
			//Create the object/control
                                                                                       

			return result;
		},

		//myMethod
		myMethod: function () {

		}
	});

}(/*jQuery, */L, this, document));



