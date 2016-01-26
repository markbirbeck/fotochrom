'use strict';

class GeoChart {
  constructor() {
    google.charts.load('current', {'packages':['geochart']});

  };

  refresh(node, value) {
    if (google && google.visualization) {
      var chart = new google.visualization.GeoChart(node);

      // Create the data table.
      var data = google.visualization.arrayToDataTable(value);

      // Set chart options
      let options = {};

      chart.draw(data, options);
    };
  };
}

module.exports = GeoChart;
