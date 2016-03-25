'use strict';

let FCChart = require('./chart');

let d3 = require('d3');
let topojson = require('topojson');
let geohash = require('ngeohash');

let world = require('../geo/world.json');

class GeoChart extends FCChart.Chart {
  constructor() {
    super({ top: 0, right: 0, bottom: 0, left: 0 });
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 480 - this.margin.top - this.margin.bottom;

    /**
     * Get the country topologies:
     */

    this.countries = topojson.feature(world, world.objects.countries);
    this.places = topojson.feature(world, world.objects.places);


    /**
     * Set a projection:
     */

    this.projection = d3.geo.equirectangular()
    .scale(153)
    .translate([this.width / 2, this.height / 2])
    .precision(.1);

    /**
     * Create a path generator that uses this projection:
     */

    this.path = d3.geo.path()
    .projection(this.projection);
  };

  /**
   * The base class function is expecting an array of arrays, so keep our
   * objects intact:
   */

  convertData(data) {
    let ret = data.map(function(d) {
      var latlon = geohash.decode(d.key);
      return {
        'type': 'Point',
        'coordinates': [latlon.longitude, latlon.latitude]
      };
    });
    return ret;
  };

  draw(svg, data) {
    super.draw(svg, data);

    /**
     * Draw each country individually, giving its shape its own class:
     */

    this.gEnter.selectAll('.country')
    .data(this.countries.features)
    .enter().append('path')
      .attr('class', function(d) { return 'country ' + d.id; })
      .attr('d', this.path);

    this.gEnter.selectAll('.place')
    .data(data)
    .enter().append('path')
      .attr('class', 'place')
      .attr('d', this.path);
  };
}

module.exports = GeoChart;
