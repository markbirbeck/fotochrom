'use strict';

let d3 = require('d3');

let FCChart = require('./chart');

class ScatterChart extends FCChart.AxisChart {
  constructor(key1Name, key2Name, colorName) {
    super();

    this.key1Name = key1Name;
    this.key2Name = key2Name;
    this.colorName = colorName;

    this.color = d3.scale.category10().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  }

  convertData(data) {
    let self = this;

    return data.map(function(d) {
      return [+d[self.key1Name], +d[self.key2Name], d[self.colorName]];
    });
  };

  draw(svg, data) {
    let self = this;

    super.draw(svg, data);

    svg
    .select('g')
    .selectAll('.dot')
        .data(data)
      .enter().append('circle')
        .attr('class', 'dot')
        .attr('r', 3.5)
        .attr('cx', function(d) { return self.X(d); })
        .attr('cy', function(d) { return self.Y(d); })
        .style('fill', function(d) { return self.color(d[2]); });
  }
};

module.exports = ScatterChart;
