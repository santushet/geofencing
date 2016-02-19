'use strict';

window.mapboxgl = require('mapbox-gl');

/* global mapboxgl */
/* eslint-disable no-loop-func */
mapboxgl.accessToken = 'pk.eyJ1IjoibW9sbHltZXJwIiwiYSI6ImNpazdqbGtiZTAxbGNocm0ybXJ3MnNzOHAifQ.5_kJrEENbBWtqTZEv7g1-w';

var bounds = [
  [-0.02300262451171875, 51.453792970504495], // Southwest coordinates
  [-0.26882171630859375, 51.55167238691343], // Northeast coordinates
];

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v8',
  center: [-0.15003204345703125, 51.50489601254001],
  zoom: 10.5,
  // hash: true,
  maxBounds: bounds
});

var fs = require('fs');
var path = require('path');
var turf = require('turf');
var d3 = require('d3');

var zones = JSON.parse(fs.readFileSync(path.join(__dirname, 'zone.geojson'), 'utf8'));
var test_path = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample_path.json'), 'utf8'));

var start_point = [{ lng: test_path.features[0].geometry.coordinates[0][0], lat: test_path.features[0].geometry.coordinates[0][1] }] || [{ lng: -0.1764678955078125, lat: 51.53074643430678 }];

map.on('style.load', function() {
  var emptyGeojson = turf.featurecollection([]);
  // initialize the congestion zone data and layer
  map.addSource('zone', {
    type: 'geojson',
    data: zones
  });
  map.addSource('routes', {
    type: 'geojson',
    data: test_path //emptyGeojson
  });

  map.addLayer({
    id: "zone-polygons",
    source: "zone",
    type: "fill",
    paint: {
      "fill-color": "cyan",
      "fill-opacity": .2,
      "fill-outline-color": "white"
    }
  })
  map.addLayer({
    "id": "allroutes",
    "type": "line",
    "source": "routes",
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-width": {
        "base": 1.5,
        "stops": [
          [10, 1.5],
          [20, 20]
        ]
      },
      "line-color": 'rgba(10,186,245,1)',
      "line-opacity": 1,
    }
  })

  d3.select('#overlay')
    .selectAll('.endmarker')
    .data(start_point)
    .enter()
    .append('div')
    .attr('class', 'endmarker')
    .attr('id', function(d, i) {
      return 'marker' + i
    })
    .attr('style', function(d) {
      var pixelCoords = map.project([d.lng, d.lat]);
      return '-webkit-transform:translateX(' + pixelCoords.x + 'px) translateY(' + pixelCoords.y + 'px)'
    })
  }) // closes on('style.load') event listener
