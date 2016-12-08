'use strict';

let FCChart = require('./chart');

let d3 = require('d3');

class TimeSeriesChart extends FCChart.AreaChart {
  constructor(margin) {
    super(margin);

    /**
     * This is a time series so the x-axis is a time scale:
     */

    this.xScale = d3.time.scale();
  };
}

module.exports = TimeSeriesChart;
