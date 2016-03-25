'use strict';

let EHChart = require('./chart');

let d3 = require('d3');

class CohortChart extends EHChart.Chart {
  constructor(key1Name, key2Name, valueName) {
    super({ top: 50, right: 0, bottom: 100, left: 120 });
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 430 - this.margin.top - this.margin.bottom;

    this.key1Name = key1Name;
    this.key2Name = key2Name;
    this.valueName = valueName;

    this.gridSizeUnit = Math.floor(this.width / 18);
    this.gridSizeX = this.gridSizeUnit * 2;
    this.gridSizeY = this.gridSizeUnit;
    this.legendElementWidth = this.gridSizeUnit;

    this.buckets = 9;
    this.colors = ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']; // alternatively colorbrewer.YlGnBu[9]
    this.cohorts = ['1', '2', '3', '4', '5'];
    this.measures = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5'];
  };

  /**
   * The base class function is expecting an array of arrays, so keep our
   * objects intact:
   */

  convertData(data) {
    return data;
  };

  draw(svg, source) {
    let data = source.buckets;
    let monthsList = source.monthsList;
    super.draw(svg, data);

    let self = this;

    // Update the outer dimensions.
    svg
    .attr('width', self.width + self.margin.left + self.margin.right)
    .attr('height', self.height + self.margin.top + self.margin.bottom);

    var g = svg.select('g');

    g.selectAll('.measureLabel')
        .data(self.measures)
        .enter().append('text')
          .text(function(d) { return d; })
          .attr('x', function(d, i) { return i * self.gridSizeX; })
          .attr('y', 0)
          .style('text-anchor', 'middle')
          .attr('transform', 'translate(' + self.gridSizeX / 2 + ', -6)')
          .attr('class', 'measureLabel mono axis');

    g.selectAll('.cohortLabel')
        .data(monthsList)
        .enter().append('text')
          .text(function (d) { return d; })
          .attr('x', 0)
          .attr('y', function (d, i) { return i * self.gridSizeY; })
          .style('text-anchor', 'end')
          .attr('transform', 'translate(-6,' + self.gridSizeY / 1.5 + ')')
          .attr('class', 'cohortLabel mono axis');

    var colorScale = d3.scale.quantile()
        .domain([0, self.buckets - 1, d3.max(data, function (d) { return d[self.valueName]; })])
        .range(self.colors);

    var cards = g.selectAll('.hour')
        .data(data, function(d) {return d[self.key1Name]+':'+d[self.key2Name];});

    let cardsEnter = cards.enter().append('rect')
        .attr('x', function(d) { return (d[self.key2Name] - 1) * self.gridSizeX; })
        .attr('y', function(d) { return (d[self.key1Name] - 1) * self.gridSizeY; })
        .attr('class', 'hour bordered')
        .attr('width', self.gridSizeX)
        .attr('height', self.gridSizeY)
        .style('fill', self.colors[0]);

    cards.enter().append('text')
        .text(function (d) { return d[self.valueName]; })
        .attr('x', function(d) { return (d[self.key2Name] - 1) * self.gridSizeX; })
        .attr('y', function(d) { return (d[self.key1Name] - 1) * self.gridSizeY; })
        .attr('rx', 4)
        .attr('ry', 4)
        .style('text-anchor', 'middle')
        .attr('transform', 'translate(' + self.gridSizeX / 2 + ', ' + self.gridSizeY / 1.5 + ')')
        .attr('class', 'cardLabel mono');

    cardsEnter.append('title');

    cardsEnter.transition().duration(1000)
        .style('fill', function(d) { return colorScale(d[self.valueName]); });

    cards.select('title').text(function(d) { return d[self.valueName]; });

    cards.exit().remove();

    var legend = g.selectAll('.legend')
        .data([0].concat(colorScale.quantiles()), function(d) { return d; });

    let legendEnter = legend.enter().append('g')
        .attr('class', 'legend');

    legendEnter.append('rect')
      .attr('x', function(d, i) { return self.legendElementWidth * i; })
      .attr('y', self.height)
      .attr('width', self.legendElementWidth)
      .attr('height', self.gridSizeY / 2)
      .style('fill', function(d, i) { return self.colors[i]; });

    legendEnter.append('text')
      .attr('class', 'mono')
      .text(function(d) { return '≥ ' + Math.round(d); })
      .attr('x', function(d, i) { return self.legendElementWidth * i; })
      .attr('y', self.height + self.gridSizeY);

    legend.exit().remove();
  }
}

module.exports = CohortChart;
