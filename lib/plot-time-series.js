'use strict';

let FCPlot = require('./plot');

class TimeSeriesPlot extends FCPlot.AreaPlot {
  constructor(margin) {
    super(margin);
  };
}

module.exports = TimeSeriesPlot;
