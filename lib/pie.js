'use strict';

class PieChart {
  constructor() {
    google.load('visualization', '1.0', {'packages':['corechart']});
  };

  refresh(node, value) {
    if (google && google.visualization) {
      var chart = new google.visualization.PieChart(node);

      // Create the data table.
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Topping');
      data.addColumn('number', 'Slices');
      data.addRows(value);

      // Set chart options
      let options = {'title':'How Much Pizza I Ate Last Summer',
                     'width':400,
                     'height':300};

      chart.draw(data, options);
    };
  };
}

module.exports = PieChart;
