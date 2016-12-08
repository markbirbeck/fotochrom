'use strict';
let path = require('path');

module.exports = {
  entry: './browser.js',
  output: {
    path: './dist',
    filename: 'fotochrom.js'
  },
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json' }
    ]
  },
  resolveLoader: { root: path.join(__dirname, 'node_modules') }
};
