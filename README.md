# leaflet-control-datetime
>


## Description
Leaflet control for changing date and time for Leaflet layers supporting this feature.

## Installation
### bower
`bower install https://github.com/FCOO/leaflet-control-datetime.git --save`

## Demo
http://FCOO.github.io/leaflet-control-datetime/demo/ 

## Usage
Install the dependencies and include the Javascript and CSS file in this repository in your application (note that the CSS file uses an image from the images directory):

### Example usage

        var myDates = [
            new Date(2015,2,26,1,0,0,0),
            new Date(2015,2,26,3,0,0,0),
            new Date(2015,2,26,6,0,0,0),
            new Date(2015,2,26,9,0,0,0),
            new Date(2015,2,27,3,0,0,0)];
        var $info_elem = $('#info');
        var myCallback = function(event_type, current_date) {
            $info_elem.html("Event type = " + event_type + '<br />Current date = ' + current_date);
        }
        map.addControl(new L.Control.Datetime({'datetimes': myDates,
                                               'callback': myCallback}));

## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/leaflet-control-datetime/LICENSE).

Copyright (c) 2015 [FCOO](https://github.com/FCOO)

## Contact information

Jesper Larsen jla@fcoo.dk


## Credits and acknowledgements


## Known bugs

## Troubleshooting

## Changelog



