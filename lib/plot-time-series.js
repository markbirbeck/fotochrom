'use strict';

let EHPlot = require('./plot');

class TimeSeriesPlot extends EHPlot.AreaPlot {
  constructor(margin) {
    super(margin);
  };
}

module.exports = TimeSeriesPlot;
