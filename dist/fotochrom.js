/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	window.fotochrom = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  // bar: require('./lib/bar'),
	  geo: __webpack_require__(2),
	  cohort: __webpack_require__(8),
	  pie: __webpack_require__(9),
	  chartTimeSeries: __webpack_require__(10),
	  chartScatter: __webpack_require__(11),
	  plotTimeSeries: __webpack_require__(12),
	  plotScatter: __webpack_require__(14)
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	let FCChart = __webpack_require__(3);

	let d3 = __webpack_require__(4);
	let topojson = __webpack_require__(5);
	let geohash = __webpack_require__(6);

	let world = __webpack_require__(7);

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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	let d3 = __webpack_require__(4);

	class Chart {
	  constructor(/*title, subtitle, */margin) {
	    // this.plot = new Plot();
	    // this.legend = new Legend();

	    // this.chartBackground = new Background();

	    // this.title = title;
	    // this.subtitle = subtitle;

	    /**
	     * Set some default values:
	     */

	    margin = margin || {top: 20, right: 20, bottom: 20, left: 20};
	    this.margin = margin;
	    this.width = 760;
	    this.height = 120;
	    this.normaliseX = function(d) { return d[0]; };
	    this.normaliseY = function(d) { return d[1]; };
	  };

	  refresh(node, value) {
	    d3.select(node)
	      .datum(value)
	      .call(this.chart.bind(this));
	  }

	  draw(svg, data) {
	    this.gEnter = svg.enter().append('svg').append('g');

	    /**
	     * Set the dimensions of the view box:
	     */

	    svg
	    .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
	    .attr('preserveAspectRatio', 'none');
	  };

	  convertData(data) {
	    // Convert data to standard representation greedily;
	    // this is needed for nondeterministic accessors.
	    return data.map((d, i) => [this.normaliseX(d, i), this.normaliseY(d, i)]);
	  };

	  chart(selection) {
	    let self = this;

	    selection.each(function (data) {
	      if (data === '' || data === {}) {
	        return;
	      }

	      /**
	       * Provide an opportunity to convert the data, if necessary:
	       */

	      let convertedData = self.convertData(data);

	      /**
	       * Select the SVG element, if it exists:
	       */

	      var svg = d3
	      .select(this)
	      .selectAll('svg')
	      .data([convertedData]);

	      /**
	       * Call the chart-specific draw function with the SVG element and the data:
	       */

	      self.draw(svg, convertedData);
	    });
	  };

	  setNormaliseX(xFn) {
	    this.normaliseX = xFn;
	    return this;
	  };

	  setNormaliseXTimeFormat(format) {
	    var formatDate = d3.time.format(format);

	    this.setNormaliseX(function(d) { return formatDate.parse(d.date); })
	    return this;
	  };

	  setNormaliseY(yFn) {
	    this.normaliseY = yFn;
	    return this;
	  };

	  get normaliseX() { return this._normaliseX; }
	  set normaliseX(xFn) { this._normaliseX = xFn; }

	  get normaliseY() { return this._normaliseY; }
	  set normaliseY(yFn) { this._normaliseY = yFn; }

	  get margin() { return this._margin; }
	  set margin(m) {
	    this._margin = m;
	    return this;
	  }

	  get height() { return this._height; }
	  set height(m) {
	    this._height = m;
	    return this;
	  }

	  get width() { return this._width; }
	  set width(m) {
	    this._width = m;
	    return this;
	  }
	};

	class Background {

	};

	class Plot {
	  constructor() {
	    this.plotBackground = new Background();
	  };
	};

	class LegendItem {
	  constructor() {
	    this.legendItem = [];
	  };
	};

	class Legend {
	  constructor() {
	    this.legendItem = [];
	  };
	};

	class NonAxisChart extends Chart {
	  constructor() {
	    this.sectionLabel = [];
	    this.exploded = [];
	  }
	};

	class MajorTick {
	  constructor(label) {
	    this.label = label;
	  }
	};

	class MinorTick {

	};

	class Axis {
	  constructor(/*title, */scale, orientation, tickSize) {
	    // this.title = title;

	    return d3.svg.axis()
	    .scale(scale)
	    .orient(orientation)
	    .tickSize(tickSize[0], tickSize[1]);
	  };
	};

	class RangeAxis extends Axis {

	};

	class DomainAxis extends Axis {

	};

	class AxisChart extends Chart {
	  constructor() {
	    super();

	    /**
	     * Default to linear axis for x and y:
	     */

	    this.xScale = d3.scale.linear();
	    this.yScale = d3.scale.linear();

	    // this.domainAxis = new DomainAxis();
	    // this.rangeAxis = new RangeAxis();
	    this.origin = [0, 0];
	  }

	  draw(svg, data) {
	    super.draw(svg, data);
	    let self = this;

	    // Update the x-scale.
	    this.xScale
	        .domain(d3.extent(data, function(d) { return d[0]; }))
	        .range([0, this.width - this.margin.left - this.margin.right]);

	    // Update the y-scale.
	    this.yScale
	        .domain([0, d3.max(data, function(d) { return d[1]; })])
	        .range([this.height - this.margin.top - this.margin.bottom, 0]);

	    this.setDomainAxis(this.gEnter);

	    // Update the inner dimensions.
	    var g = svg.select('g')
	        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

	    this.refreshDomainAxis(g);
	  }

	  setDomainAxis(node) {
	    node.append('g')
	    .attr('class', 'domain-axis');
	  };

	  refreshDomainAxis(node) {
	    let xAxis = new Axis(this.xScale, 'bottom', [6, 0]);

	    // Update the domain-axis.
	    node.select('.domain-axis')
	    .attr('transform', 'translate(0,' + this.yScale.range()[0] + ')')
	    .call(xAxis.bind(this));
	  };

	  /**
	   * Used by path generators:
	   */

	  X(d) { return this.xScale(d[0]); }
	  Y(d) { return this.yScale(d[1]); }

	  get xScale() { return this._xScale; }
	  set xScale(xScale) { this._xScale = xScale; }

	  get yScale() { return this._yScale; }
	  set yScale(yScale) { this._yScale = yScale; }

	  get xAxis() { return this._xAxis; }
	  set xAxis(xAxis) { this._xAxis = xAxis; }
	};

	class LineChart extends AxisChart {
	  constructor() {
	    super();

	    this.line = d3.svg.line().x(this.X.bind(this)).y(this.Y.bind(this));
	  }

	  draw(svg, data) {
	    super.draw(svg, data);

	    this.gEnter.append('path').attr('class', 'line');

	    // Update the line path.
	    svg
	    .select('g')
	    .select('.line')
	      .attr('d', this.line);
	  }
	};

	class AreaChart extends LineChart {
	  constructor() {
	    super();

	    this.area = d3.svg.area().x(this.X.bind(this)).y1(this.Y.bind(this));
	  }

	  draw(svg, data) {
	    super.draw(svg, data);

	    // var gEnter = svg.enter().append('svg').append('g');
	    this.gEnter.append('path').attr('class', 'area');

	    // Update the area path.
	    svg
	    .select('g')
	    .select('.area')
	      .attr('d', this.area.y0(this.yScale.range()[0]));
	  }
	};

	module.exports = {
	  Chart,
	  AxisChart,
	  LineChart,
	  AreaChart
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;!function() {
	  var d3 = {
	    version: "3.5.16"
	  };
	  var d3_arraySlice = [].slice, d3_array = function(list) {
	    return d3_arraySlice.call(list);
	  };
	  var d3_document = this.document;
	  function d3_documentElement(node) {
	    return node && (node.ownerDocument || node.document || node).documentElement;
	  }
	  function d3_window(node) {
	    return node && (node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView);
	  }
	  if (d3_document) {
	    try {
	      d3_array(d3_document.documentElement.childNodes)[0].nodeType;
	    } catch (e) {
	      d3_array = function(list) {
	        var i = list.length, array = new Array(i);
	        while (i--) array[i] = list[i];
	        return array;
	      };
	    }
	  }
	  if (!Date.now) Date.now = function() {
	    return +new Date();
	  };
	  if (d3_document) {
	    try {
	      d3_document.createElement("DIV").style.setProperty("opacity", 0, "");
	    } catch (error) {
	      var d3_element_prototype = this.Element.prototype, d3_element_setAttribute = d3_element_prototype.setAttribute, d3_element_setAttributeNS = d3_element_prototype.setAttributeNS, d3_style_prototype = this.CSSStyleDeclaration.prototype, d3_style_setProperty = d3_style_prototype.setProperty;
	      d3_element_prototype.setAttribute = function(name, value) {
	        d3_element_setAttribute.call(this, name, value + "");
	      };
	      d3_element_prototype.setAttributeNS = function(space, local, value) {
	        d3_element_setAttributeNS.call(this, space, local, value + "");
	      };
	      d3_style_prototype.setProperty = function(name, value, priority) {
	        d3_style_setProperty.call(this, name, value + "", priority);
	      };
	    }
	  }
	  d3.ascending = d3_ascending;
	  function d3_ascending(a, b) {
	    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	  }
	  d3.descending = function(a, b) {
	    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
	  };
	  d3.min = function(array, f) {
	    var i = -1, n = array.length, a, b;
	    if (arguments.length === 1) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) {
	        a = b;
	        break;
	      }
	      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
	    } else {
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
	        a = b;
	        break;
	      }
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && a > b) a = b;
	    }
	    return a;
	  };
	  d3.max = function(array, f) {
	    var i = -1, n = array.length, a, b;
	    if (arguments.length === 1) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) {
	        a = b;
	        break;
	      }
	      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
	    } else {
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
	        a = b;
	        break;
	      }
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b > a) a = b;
	    }
	    return a;
	  };
	  d3.extent = function(array, f) {
	    var i = -1, n = array.length, a, b, c;
	    if (arguments.length === 1) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) {
	        a = c = b;
	        break;
	      }
	      while (++i < n) if ((b = array[i]) != null) {
	        if (a > b) a = b;
	        if (c < b) c = b;
	      }
	    } else {
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
	        a = c = b;
	        break;
	      }
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null) {
	        if (a > b) a = b;
	        if (c < b) c = b;
	      }
	    }
	    return [ a, c ];
	  };
	  function d3_number(x) {
	    return x === null ? NaN : +x;
	  }
	  function d3_numeric(x) {
	    return !isNaN(x);
	  }
	  d3.sum = function(array, f) {
	    var s = 0, n = array.length, a, i = -1;
	    if (arguments.length === 1) {
	      while (++i < n) if (d3_numeric(a = +array[i])) s += a;
	    } else {
	      while (++i < n) if (d3_numeric(a = +f.call(array, array[i], i))) s += a;
	    }
	    return s;
	  };
	  d3.mean = function(array, f) {
	    var s = 0, n = array.length, a, i = -1, j = n;
	    if (arguments.length === 1) {
	      while (++i < n) if (d3_numeric(a = d3_number(array[i]))) s += a; else --j;
	    } else {
	      while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) s += a; else --j;
	    }
	    if (j) return s / j;
	  };
	  d3.quantile = function(values, p) {
	    var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
	    return e ? v + e * (values[h] - v) : v;
	  };
	  d3.median = function(array, f) {
	    var numbers = [], n = array.length, a, i = -1;
	    if (arguments.length === 1) {
	      while (++i < n) if (d3_numeric(a = d3_number(array[i]))) numbers.push(a);
	    } else {
	      while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) numbers.push(a);
	    }
	    if (numbers.length) return d3.quantile(numbers.sort(d3_ascending), .5);
	  };
	  d3.variance = function(array, f) {
	    var n = array.length, m = 0, a, d, s = 0, i = -1, j = 0;
	    if (arguments.length === 1) {
	      while (++i < n) {
	        if (d3_numeric(a = d3_number(array[i]))) {
	          d = a - m;
	          m += d / ++j;
	          s += d * (a - m);
	        }
	      }
	    } else {
	      while (++i < n) {
	        if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) {
	          d = a - m;
	          m += d / ++j;
	          s += d * (a - m);
	        }
	      }
	    }
	    if (j > 1) return s / (j - 1);
	  };
	  d3.deviation = function() {
	    var v = d3.variance.apply(this, arguments);
	    return v ? Math.sqrt(v) : v;
	  };
	  function d3_bisector(compare) {
	    return {
	      left: function(a, x, lo, hi) {
	        if (arguments.length < 3) lo = 0;
	        if (arguments.length < 4) hi = a.length;
	        while (lo < hi) {
	          var mid = lo + hi >>> 1;
	          if (compare(a[mid], x) < 0) lo = mid + 1; else hi = mid;
	        }
	        return lo;
	      },
	      right: function(a, x, lo, hi) {
	        if (arguments.length < 3) lo = 0;
	        if (arguments.length < 4) hi = a.length;
	        while (lo < hi) {
	          var mid = lo + hi >>> 1;
	          if (compare(a[mid], x) > 0) hi = mid; else lo = mid + 1;
	        }
	        return lo;
	      }
	    };
	  }
	  var d3_bisect = d3_bisector(d3_ascending);
	  d3.bisectLeft = d3_bisect.left;
	  d3.bisect = d3.bisectRight = d3_bisect.right;
	  d3.bisector = function(f) {
	    return d3_bisector(f.length === 1 ? function(d, x) {
	      return d3_ascending(f(d), x);
	    } : f);
	  };
	  d3.shuffle = function(array, i0, i1) {
	    if ((m = arguments.length) < 3) {
	      i1 = array.length;
	      if (m < 2) i0 = 0;
	    }
	    var m = i1 - i0, t, i;
	    while (m) {
	      i = Math.random() * m-- | 0;
	      t = array[m + i0], array[m + i0] = array[i + i0], array[i + i0] = t;
	    }
	    return array;
	  };
	  d3.permute = function(array, indexes) {
	    var i = indexes.length, permutes = new Array(i);
	    while (i--) permutes[i] = array[indexes[i]];
	    return permutes;
	  };
	  d3.pairs = function(array) {
	    var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
	    while (i < n) pairs[i] = [ p0 = p1, p1 = array[++i] ];
	    return pairs;
	  };
	  d3.transpose = function(matrix) {
	    if (!(n = matrix.length)) return [];
	    for (var i = -1, m = d3.min(matrix, d3_transposeLength), transpose = new Array(m); ++i < m; ) {
	      for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n; ) {
	        row[j] = matrix[j][i];
	      }
	    }
	    return transpose;
	  };
	  function d3_transposeLength(d) {
	    return d.length;
	  }
	  d3.zip = function() {
	    return d3.transpose(arguments);
	  };
	  d3.keys = function(map) {
	    var keys = [];
	    for (var key in map) keys.push(key);
	    return keys;
	  };
	  d3.values = function(map) {
	    var values = [];
	    for (var key in map) values.push(map[key]);
	    return values;
	  };
	  d3.entries = function(map) {
	    var entries = [];
	    for (var key in map) entries.push({
	      key: key,
	      value: map[key]
	    });
	    return entries;
	  };
	  d3.merge = function(arrays) {
	    var n = arrays.length, m, i = -1, j = 0, merged, array;
	    while (++i < n) j += arrays[i].length;
	    merged = new Array(j);
	    while (--n >= 0) {
	      array = arrays[n];
	      m = array.length;
	      while (--m >= 0) {
	        merged[--j] = array[m];
	      }
	    }
	    return merged;
	  };
	  var abs = Math.abs;
	  d3.range = function(start, stop, step) {
	    if (arguments.length < 3) {
	      step = 1;
	      if (arguments.length < 2) {
	        stop = start;
	        start = 0;
	      }
	    }
	    if ((stop - start) / step === Infinity) throw new Error("infinite range");
	    var range = [], k = d3_range_integerScale(abs(step)), i = -1, j;
	    start *= k, stop *= k, step *= k;
	    if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
	    return range;
	  };
	  function d3_range_integerScale(x) {
	    var k = 1;
	    while (x * k % 1) k *= 10;
	    return k;
	  }
	  function d3_class(ctor, properties) {
	    for (var key in properties) {
	      Object.defineProperty(ctor.prototype, key, {
	        value: properties[key],
	        enumerable: false
	      });
	    }
	  }
	  d3.map = function(object, f) {
	    var map = new d3_Map();
	    if (object instanceof d3_Map) {
	      object.forEach(function(key, value) {
	        map.set(key, value);
	      });
	    } else if (Array.isArray(object)) {
	      var i = -1, n = object.length, o;
	      if (arguments.length === 1) while (++i < n) map.set(i, object[i]); else while (++i < n) map.set(f.call(object, o = object[i], i), o);
	    } else {
	      for (var key in object) map.set(key, object[key]);
	    }
	    return map;
	  };
	  function d3_Map() {
	    this._ = Object.create(null);
	  }
	  var d3_map_proto = "__proto__", d3_map_zero = "\x00";
	  d3_class(d3_Map, {
	    has: d3_map_has,
	    get: function(key) {
	      return this._[d3_map_escape(key)];
	    },
	    set: function(key, value) {
	      return this._[d3_map_escape(key)] = value;
	    },
	    remove: d3_map_remove,
	    keys: d3_map_keys,
	    values: function() {
	      var values = [];
	      for (var key in this._) values.push(this._[key]);
	      return values;
	    },
	    entries: function() {
	      var entries = [];
	      for (var key in this._) entries.push({
	        key: d3_map_unescape(key),
	        value: this._[key]
	      });
	      return entries;
	    },
	    size: d3_map_size,
	    empty: d3_map_empty,
	    forEach: function(f) {
	      for (var key in this._) f.call(this, d3_map_unescape(key), this._[key]);
	    }
	  });
	  function d3_map_escape(key) {
	    return (key += "") === d3_map_proto || key[0] === d3_map_zero ? d3_map_zero + key : key;
	  }
	  function d3_map_unescape(key) {
	    return (key += "")[0] === d3_map_zero ? key.slice(1) : key;
	  }
	  function d3_map_has(key) {
	    return d3_map_escape(key) in this._;
	  }
	  function d3_map_remove(key) {
	    return (key = d3_map_escape(key)) in this._ && delete this._[key];
	  }
	  function d3_map_keys() {
	    var keys = [];
	    for (var key in this._) keys.push(d3_map_unescape(key));
	    return keys;
	  }
	  function d3_map_size() {
	    var size = 0;
	    for (var key in this._) ++size;
	    return size;
	  }
	  function d3_map_empty() {
	    for (var key in this._) return false;
	    return true;
	  }
	  d3.nest = function() {
	    var nest = {}, keys = [], sortKeys = [], sortValues, rollup;
	    function map(mapType, array, depth) {
	      if (depth >= keys.length) return rollup ? rollup.call(nest, array) : sortValues ? array.sort(sortValues) : array;
	      var i = -1, n = array.length, key = keys[depth++], keyValue, object, setter, valuesByKey = new d3_Map(), values;
	      while (++i < n) {
	        if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
	          values.push(object);
	        } else {
	          valuesByKey.set(keyValue, [ object ]);
	        }
	      }
	      if (mapType) {
	        object = mapType();
	        setter = function(keyValue, values) {
	          object.set(keyValue, map(mapType, values, depth));
	        };
	      } else {
	        object = {};
	        setter = function(keyValue, values) {
	          object[keyValue] = map(mapType, values, depth);
	        };
	      }
	      valuesByKey.forEach(setter);
	      return object;
	    }
	    function entries(map, depth) {
	      if (depth >= keys.length) return map;
	      var array = [], sortKey = sortKeys[depth++];
	      map.forEach(function(key, keyMap) {
	        array.push({
	          key: key,
	          values: entries(keyMap, depth)
	        });
	      });
	      return sortKey ? array.sort(function(a, b) {
	        return sortKey(a.key, b.key);
	      }) : array;
	    }
	    nest.map = function(array, mapType) {
	      return map(mapType, array, 0);
	    };
	    nest.entries = function(array) {
	      return entries(map(d3.map, array, 0), 0);
	    };
	    nest.key = function(d) {
	      keys.push(d);
	      return nest;
	    };
	    nest.sortKeys = function(order) {
	      sortKeys[keys.length - 1] = order;
	      return nest;
	    };
	    nest.sortValues = function(order) {
	      sortValues = order;
	      return nest;
	    };
	    nest.rollup = function(f) {
	      rollup = f;
	      return nest;
	    };
	    return nest;
	  };
	  d3.set = function(array) {
	    var set = new d3_Set();
	    if (array) for (var i = 0, n = array.length; i < n; ++i) set.add(array[i]);
	    return set;
	  };
	  function d3_Set() {
	    this._ = Object.create(null);
	  }
	  d3_class(d3_Set, {
	    has: d3_map_has,
	    add: function(key) {
	      this._[d3_map_escape(key += "")] = true;
	      return key;
	    },
	    remove: d3_map_remove,
	    values: d3_map_keys,
	    size: d3_map_size,
	    empty: d3_map_empty,
	    forEach: function(f) {
	      for (var key in this._) f.call(this, d3_map_unescape(key));
	    }
	  });
	  d3.behavior = {};
	  function d3_identity(d) {
	    return d;
	  }
	  d3.rebind = function(target, source) {
	    var i = 1, n = arguments.length, method;
	    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
	    return target;
	  };
	  function d3_rebind(target, source, method) {
	    return function() {
	      var value = method.apply(source, arguments);
	      return value === source ? target : value;
	    };
	  }
	  function d3_vendorSymbol(object, name) {
	    if (name in object) return name;
	    name = name.charAt(0).toUpperCase() + name.slice(1);
	    for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
	      var prefixName = d3_vendorPrefixes[i] + name;
	      if (prefixName in object) return prefixName;
	    }
	  }
	  var d3_vendorPrefixes = [ "webkit", "ms", "moz", "Moz", "o", "O" ];
	  function d3_noop() {}
	  d3.dispatch = function() {
	    var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
	    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
	    return dispatch;
	  };
	  function d3_dispatch() {}
	  d3_dispatch.prototype.on = function(type, listener) {
	    var i = type.indexOf("."), name = "";
	    if (i >= 0) {
	      name = type.slice(i + 1);
	      type = type.slice(0, i);
	    }
	    if (type) return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
	    if (arguments.length === 2) {
	      if (listener == null) for (type in this) {
	        if (this.hasOwnProperty(type)) this[type].on(name, null);
	      }
	      return this;
	    }
	  };
	  function d3_dispatch_event(dispatch) {
	    var listeners = [], listenerByName = new d3_Map();
	    function event() {
	      var z = listeners, i = -1, n = z.length, l;
	      while (++i < n) if (l = z[i].on) l.apply(this, arguments);
	      return dispatch;
	    }
	    event.on = function(name, listener) {
	      var l = listenerByName.get(name), i;
	      if (arguments.length < 2) return l && l.on;
	      if (l) {
	        l.on = null;
	        listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
	        listenerByName.remove(name);
	      }
	      if (listener) listeners.push(listenerByName.set(name, {
	        on: listener
	      }));
	      return dispatch;
	    };
	    return event;
	  }
	  d3.event = null;
	  function d3_eventPreventDefault() {
	    d3.event.preventDefault();
	  }
	  function d3_eventSource() {
	    var e = d3.event, s;
	    while (s = e.sourceEvent) e = s;
	    return e;
	  }
	  function d3_eventDispatch(target) {
	    var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
	    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
	    dispatch.of = function(thiz, argumentz) {
	      return function(e1) {
	        try {
	          var e0 = e1.sourceEvent = d3.event;
	          e1.target = target;
	          d3.event = e1;
	          dispatch[e1.type].apply(thiz, argumentz);
	        } finally {
	          d3.event = e0;
	        }
	      };
	    };
	    return dispatch;
	  }
	  d3.requote = function(s) {
	    return s.replace(d3_requote_re, "\\$&");
	  };
	  var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
	  var d3_subclass = {}.__proto__ ? function(object, prototype) {
	    object.__proto__ = prototype;
	  } : function(object, prototype) {
	    for (var property in prototype) object[property] = prototype[property];
	  };
	  function d3_selection(groups) {
	    d3_subclass(groups, d3_selectionPrototype);
	    return groups;
	  }
	  var d3_select = function(s, n) {
	    return n.querySelector(s);
	  }, d3_selectAll = function(s, n) {
	    return n.querySelectorAll(s);
	  }, d3_selectMatches = function(n, s) {
	    var d3_selectMatcher = n.matches || n[d3_vendorSymbol(n, "matchesSelector")];
	    d3_selectMatches = function(n, s) {
	      return d3_selectMatcher.call(n, s);
	    };
	    return d3_selectMatches(n, s);
	  };
	  if (typeof Sizzle === "function") {
	    d3_select = function(s, n) {
	      return Sizzle(s, n)[0] || null;
	    };
	    d3_selectAll = Sizzle;
	    d3_selectMatches = Sizzle.matchesSelector;
	  }
	  d3.selection = function() {
	    return d3.select(d3_document.documentElement);
	  };
	  var d3_selectionPrototype = d3.selection.prototype = [];
	  d3_selectionPrototype.select = function(selector) {
	    var subgroups = [], subgroup, subnode, group, node;
	    selector = d3_selection_selector(selector);
	    for (var j = -1, m = this.length; ++j < m; ) {
	      subgroups.push(subgroup = []);
	      subgroup.parentNode = (group = this[j]).parentNode;
	      for (var i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) {
	          subgroup.push(subnode = selector.call(node, node.__data__, i, j));
	          if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
	        } else {
	          subgroup.push(null);
	        }
	      }
	    }
	    return d3_selection(subgroups);
	  };
	  function d3_selection_selector(selector) {
	    return typeof selector === "function" ? selector : function() {
	      return d3_select(selector, this);
	    };
	  }
	  d3_selectionPrototype.selectAll = function(selector) {
	    var subgroups = [], subgroup, node;
	    selector = d3_selection_selectorAll(selector);
	    for (var j = -1, m = this.length; ++j < m; ) {
	      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) {
	          subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i, j)));
	          subgroup.parentNode = node;
	        }
	      }
	    }
	    return d3_selection(subgroups);
	  };
	  function d3_selection_selectorAll(selector) {
	    return typeof selector === "function" ? selector : function() {
	      return d3_selectAll(selector, this);
	    };
	  }
	  var d3_nsXhtml = "http://www.w3.org/1999/xhtml";
	  var d3_nsPrefix = {
	    svg: "http://www.w3.org/2000/svg",
	    xhtml: d3_nsXhtml,
	    xlink: "http://www.w3.org/1999/xlink",
	    xml: "http://www.w3.org/XML/1998/namespace",
	    xmlns: "http://www.w3.org/2000/xmlns/"
	  };
	  d3.ns = {
	    prefix: d3_nsPrefix,
	    qualify: function(name) {
	      var i = name.indexOf(":"), prefix = name;
	      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
	      return d3_nsPrefix.hasOwnProperty(prefix) ? {
	        space: d3_nsPrefix[prefix],
	        local: name
	      } : name;
	    }
	  };
	  d3_selectionPrototype.attr = function(name, value) {
	    if (arguments.length < 2) {
	      if (typeof name === "string") {
	        var node = this.node();
	        name = d3.ns.qualify(name);
	        return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
	      }
	      for (value in name) this.each(d3_selection_attr(value, name[value]));
	      return this;
	    }
	    return this.each(d3_selection_attr(name, value));
	  };
	  function d3_selection_attr(name, value) {
	    name = d3.ns.qualify(name);
	    function attrNull() {
	      this.removeAttribute(name);
	    }
	    function attrNullNS() {
	      this.removeAttributeNS(name.space, name.local);
	    }
	    function attrConstant() {
	      this.setAttribute(name, value);
	    }
	    function attrConstantNS() {
	      this.setAttributeNS(name.space, name.local, value);
	    }
	    function attrFunction() {
	      var x = value.apply(this, arguments);
	      if (x == null) this.removeAttribute(name); else this.setAttribute(name, x);
	    }
	    function attrFunctionNS() {
	      var x = value.apply(this, arguments);
	      if (x == null) this.removeAttributeNS(name.space, name.local); else this.setAttributeNS(name.space, name.local, x);
	    }
	    return value == null ? name.local ? attrNullNS : attrNull : typeof value === "function" ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
	  }
	  function d3_collapse(s) {
	    return s.trim().replace(/\s+/g, " ");
	  }
	  d3_selectionPrototype.classed = function(name, value) {
	    if (arguments.length < 2) {
	      if (typeof name === "string") {
	        var node = this.node(), n = (name = d3_selection_classes(name)).length, i = -1;
	        if (value = node.classList) {
	          while (++i < n) if (!value.contains(name[i])) return false;
	        } else {
	          value = node.getAttribute("class");
	          while (++i < n) if (!d3_selection_classedRe(name[i]).test(value)) return false;
	        }
	        return true;
	      }
	      for (value in name) this.each(d3_selection_classed(value, name[value]));
	      return this;
	    }
	    return this.each(d3_selection_classed(name, value));
	  };
	  function d3_selection_classedRe(name) {
	    return new RegExp("(?:^|\\s+)" + d3.requote(name) + "(?:\\s+|$)", "g");
	  }
	  function d3_selection_classes(name) {
	    return (name + "").trim().split(/^|\s+/);
	  }
	  function d3_selection_classed(name, value) {
	    name = d3_selection_classes(name).map(d3_selection_classedName);
	    var n = name.length;
	    function classedConstant() {
	      var i = -1;
	      while (++i < n) name[i](this, value);
	    }
	    function classedFunction() {
	      var i = -1, x = value.apply(this, arguments);
	      while (++i < n) name[i](this, x);
	    }
	    return typeof value === "function" ? classedFunction : classedConstant;
	  }
	  function d3_selection_classedName(name) {
	    var re = d3_selection_classedRe(name);
	    return function(node, value) {
	      if (c = node.classList) return value ? c.add(name) : c.remove(name);
	      var c = node.getAttribute("class") || "";
	      if (value) {
	        re.lastIndex = 0;
	        if (!re.test(c)) node.setAttribute("class", d3_collapse(c + " " + name));
	      } else {
	        node.setAttribute("class", d3_collapse(c.replace(re, " ")));
	      }
	    };
	  }
	  d3_selectionPrototype.style = function(name, value, priority) {
	    var n = arguments.length;
	    if (n < 3) {
	      if (typeof name !== "string") {
	        if (n < 2) value = "";
	        for (priority in name) this.each(d3_selection_style(priority, name[priority], value));
	        return this;
	      }
	      if (n < 2) {
	        var node = this.node();
	        return d3_window(node).getComputedStyle(node, null).getPropertyValue(name);
	      }
	      priority = "";
	    }
	    return this.each(d3_selection_style(name, value, priority));
	  };
	  function d3_selection_style(name, value, priority) {
	    function styleNull() {
	      this.style.removeProperty(name);
	    }
	    function styleConstant() {
	      this.style.setProperty(name, value, priority);
	    }
	    function styleFunction() {
	      var x = value.apply(this, arguments);
	      if (x == null) this.style.removeProperty(name); else this.style.setProperty(name, x, priority);
	    }
	    return value == null ? styleNull : typeof value === "function" ? styleFunction : styleConstant;
	  }
	  d3_selectionPrototype.property = function(name, value) {
	    if (arguments.length < 2) {
	      if (typeof name === "string") return this.node()[name];
	      for (value in name) this.each(d3_selection_property(value, name[value]));
	      return this;
	    }
	    return this.each(d3_selection_property(name, value));
	  };
	  function d3_selection_property(name, value) {
	    function propertyNull() {
	      delete this[name];
	    }
	    function propertyConstant() {
	      this[name] = value;
	    }
	    function propertyFunction() {
	      var x = value.apply(this, arguments);
	      if (x == null) delete this[name]; else this[name] = x;
	    }
	    return value == null ? propertyNull : typeof value === "function" ? propertyFunction : propertyConstant;
	  }
	  d3_selectionPrototype.text = function(value) {
	    return arguments.length ? this.each(typeof value === "function" ? function() {
	      var v = value.apply(this, arguments);
	      this.textContent = v == null ? "" : v;
	    } : value == null ? function() {
	      this.textContent = "";
	    } : function() {
	      this.textContent = value;
	    }) : this.node().textContent;
	  };
	  d3_selectionPrototype.html = function(value) {
	    return arguments.length ? this.each(typeof value === "function" ? function() {
	      var v = value.apply(this, arguments);
	      this.innerHTML = v == null ? "" : v;
	    } : value == null ? function() {
	      this.innerHTML = "";
	    } : function() {
	      this.innerHTML = value;
	    }) : this.node().innerHTML;
	  };
	  d3_selectionPrototype.append = function(name) {
	    name = d3_selection_creator(name);
	    return this.select(function() {
	      return this.appendChild(name.apply(this, arguments));
	    });
	  };
	  function d3_selection_creator(name) {
	    function create() {
	      var document = this.ownerDocument, namespace = this.namespaceURI;
	      return namespace === d3_nsXhtml && document.documentElement.namespaceURI === d3_nsXhtml ? document.createElement(name) : document.createElementNS(namespace, name);
	    }
	    function createNS() {
	      return this.ownerDocument.createElementNS(name.space, name.local);
	    }
	    return typeof name === "function" ? name : (name = d3.ns.qualify(name)).local ? createNS : create;
	  }
	  d3_selectionPrototype.insert = function(name, before) {
	    name = d3_selection_creator(name);
	    before = d3_selection_selector(before);
	    return this.select(function() {
	      return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments) || null);
	    });
	  };
	  d3_selectionPrototype.remove = function() {
	    return this.each(d3_selectionRemove);
	  };
	  function d3_selectionRemove() {
	    var parent = this.parentNode;
	    if (parent) parent.removeChild(this);
	  }
	  d3_selectionPrototype.data = function(value, key) {
	    var i = -1, n = this.length, group, node;
	    if (!arguments.length) {
	      value = new Array(n = (group = this[0]).length);
	      while (++i < n) {
	        if (node = group[i]) {
	          value[i] = node.__data__;
	        }
	      }
	      return value;
	    }
	    function bind(group, groupData) {
	      var i, n = group.length, m = groupData.length, n0 = Math.min(n, m), updateNodes = new Array(m), enterNodes = new Array(m), exitNodes = new Array(n), node, nodeData;
	      if (key) {
	        var nodeByKeyValue = new d3_Map(), keyValues = new Array(n), keyValue;
	        for (i = -1; ++i < n; ) {
	          if (node = group[i]) {
	            if (nodeByKeyValue.has(keyValue = key.call(node, node.__data__, i))) {
	              exitNodes[i] = node;
	            } else {
	              nodeByKeyValue.set(keyValue, node);
	            }
	            keyValues[i] = keyValue;
	          }
	        }
	        for (i = -1; ++i < m; ) {
	          if (!(node = nodeByKeyValue.get(keyValue = key.call(groupData, nodeData = groupData[i], i)))) {
	            enterNodes[i] = d3_selection_dataNode(nodeData);
	          } else if (node !== true) {
	            updateNodes[i] = node;
	            node.__data__ = nodeData;
	          }
	          nodeByKeyValue.set(keyValue, true);
	        }
	        for (i = -1; ++i < n; ) {
	          if (i in keyValues && nodeByKeyValue.get(keyValues[i]) !== true) {
	            exitNodes[i] = group[i];
	          }
	        }
	      } else {
	        for (i = -1; ++i < n0; ) {
	          node = group[i];
	          nodeData = groupData[i];
	          if (node) {
	            node.__data__ = nodeData;
	            updateNodes[i] = node;
	          } else {
	            enterNodes[i] = d3_selection_dataNode(nodeData);
	          }
	        }
	        for (;i < m; ++i) {
	          enterNodes[i] = d3_selection_dataNode(groupData[i]);
	        }
	        for (;i < n; ++i) {
	          exitNodes[i] = group[i];
	        }
	      }
	      enterNodes.update = updateNodes;
	      enterNodes.parentNode = updateNodes.parentNode = exitNodes.parentNode = group.parentNode;
	      enter.push(enterNodes);
	      update.push(updateNodes);
	      exit.push(exitNodes);
	    }
	    var enter = d3_selection_enter([]), update = d3_selection([]), exit = d3_selection([]);
	    if (typeof value === "function") {
	      while (++i < n) {
	        bind(group = this[i], value.call(group, group.parentNode.__data__, i));
	      }
	    } else {
	      while (++i < n) {
	        bind(group = this[i], value);
	      }
	    }
	    update.enter = function() {
	      return enter;
	    };
	    update.exit = function() {
	      return exit;
	    };
	    return update;
	  };
	  function d3_selection_dataNode(data) {
	    return {
	      __data__: data
	    };
	  }
	  d3_selectionPrototype.datum = function(value) {
	    return arguments.length ? this.property("__data__", value) : this.property("__data__");
	  };
	  d3_selectionPrototype.filter = function(filter) {
	    var subgroups = [], subgroup, group, node;
	    if (typeof filter !== "function") filter = d3_selection_filter(filter);
	    for (var j = 0, m = this.length; j < m; j++) {
	      subgroups.push(subgroup = []);
	      subgroup.parentNode = (group = this[j]).parentNode;
	      for (var i = 0, n = group.length; i < n; i++) {
	        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
	          subgroup.push(node);
	        }
	      }
	    }
	    return d3_selection(subgroups);
	  };
	  function d3_selection_filter(selector) {
	    return function() {
	      return d3_selectMatches(this, selector);
	    };
	  }
	  d3_selectionPrototype.order = function() {
	    for (var j = -1, m = this.length; ++j < m; ) {
	      for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
	        if (node = group[i]) {
	          if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
	          next = node;
	        }
	      }
	    }
	    return this;
	  };
	  d3_selectionPrototype.sort = function(comparator) {
	    comparator = d3_selection_sortComparator.apply(this, arguments);
	    for (var j = -1, m = this.length; ++j < m; ) this[j].sort(comparator);
	    return this.order();
	  };
	  function d3_selection_sortComparator(comparator) {
	    if (!arguments.length) comparator = d3_ascending;
	    return function(a, b) {
	      return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
	    };
	  }
	  d3_selectionPrototype.each = function(callback) {
	    return d3_selection_each(this, function(node, i, j) {
	      callback.call(node, node.__data__, i, j);
	    });
	  };
	  function d3_selection_each(groups, callback) {
	    for (var j = 0, m = groups.length; j < m; j++) {
	      for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
	        if (node = group[i]) callback(node, i, j);
	      }
	    }
	    return groups;
	  }
	  d3_selectionPrototype.call = function(callback) {
	    var args = d3_array(arguments);
	    callback.apply(args[0] = this, args);
	    return this;
	  };
	  d3_selectionPrototype.empty = function() {
	    return !this.node();
	  };
	  d3_selectionPrototype.node = function() {
	    for (var j = 0, m = this.length; j < m; j++) {
	      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
	        var node = group[i];
	        if (node) return node;
	      }
	    }
	    return null;
	  };
	  d3_selectionPrototype.size = function() {
	    var n = 0;
	    d3_selection_each(this, function() {
	      ++n;
	    });
	    return n;
	  };
	  function d3_selection_enter(selection) {
	    d3_subclass(selection, d3_selection_enterPrototype);
	    return selection;
	  }
	  var d3_selection_enterPrototype = [];
	  d3.selection.enter = d3_selection_enter;
	  d3.selection.enter.prototype = d3_selection_enterPrototype;
	  d3_selection_enterPrototype.append = d3_selectionPrototype.append;
	  d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
	  d3_selection_enterPrototype.node = d3_selectionPrototype.node;
	  d3_selection_enterPrototype.call = d3_selectionPrototype.call;
	  d3_selection_enterPrototype.size = d3_selectionPrototype.size;
	  d3_selection_enterPrototype.select = function(selector) {
	    var subgroups = [], subgroup, subnode, upgroup, group, node;
	    for (var j = -1, m = this.length; ++j < m; ) {
	      upgroup = (group = this[j]).update;
	      subgroups.push(subgroup = []);
	      subgroup.parentNode = group.parentNode;
	      for (var i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) {
	          subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i, j));
	          subnode.__data__ = node.__data__;
	        } else {
	          subgroup.push(null);
	        }
	      }
	    }
	    return d3_selection(subgroups);
	  };
	  d3_selection_enterPrototype.insert = function(name, before) {
	    if (arguments.length < 2) before = d3_selection_enterInsertBefore(this);
	    return d3_selectionPrototype.insert.call(this, name, before);
	  };
	  function d3_selection_enterInsertBefore(enter) {
	    var i0, j0;
	    return function(d, i, j) {
	      var group = enter[j].update, n = group.length, node;
	      if (j != j0) j0 = j, i0 = 0;
	      if (i >= i0) i0 = i + 1;
	      while (!(node = group[i0]) && ++i0 < n) ;
	      return node;
	    };
	  }
	  d3.select = function(node) {
	    var group;
	    if (typeof node === "string") {
	      group = [ d3_select(node, d3_document) ];
	      group.parentNode = d3_document.documentElement;
	    } else {
	      group = [ node ];
	      group.parentNode = d3_documentElement(node);
	    }
	    return d3_selection([ group ]);
	  };
	  d3.selectAll = function(nodes) {
	    var group;
	    if (typeof nodes === "string") {
	      group = d3_array(d3_selectAll(nodes, d3_document));
	      group.parentNode = d3_document.documentElement;
	    } else {
	      group = d3_array(nodes);
	      group.parentNode = null;
	    }
	    return d3_selection([ group ]);
	  };
	  d3_selectionPrototype.on = function(type, listener, capture) {
	    var n = arguments.length;
	    if (n < 3) {
	      if (typeof type !== "string") {
	        if (n < 2) listener = false;
	        for (capture in type) this.each(d3_selection_on(capture, type[capture], listener));
	        return this;
	      }
	      if (n < 2) return (n = this.node()["__on" + type]) && n._;
	      capture = false;
	    }
	    return this.each(d3_selection_on(type, listener, capture));
	  };
	  function d3_selection_on(type, listener, capture) {
	    var name = "__on" + type, i = type.indexOf("."), wrap = d3_selection_onListener;
	    if (i > 0) type = type.slice(0, i);
	    var filter = d3_selection_onFilters.get(type);
	    if (filter) type = filter, wrap = d3_selection_onFilter;
	    function onRemove() {
	      var l = this[name];
	      if (l) {
	        this.removeEventListener(type, l, l.$);
	        delete this[name];
	      }
	    }
	    function onAdd() {
	      var l = wrap(listener, d3_array(arguments));
	      onRemove.call(this);
	      this.addEventListener(type, this[name] = l, l.$ = capture);
	      l._ = listener;
	    }
	    function removeAll() {
	      var re = new RegExp("^__on([^.]+)" + d3.requote(type) + "$"), match;
	      for (var name in this) {
	        if (match = name.match(re)) {
	          var l = this[name];
	          this.removeEventListener(match[1], l, l.$);
	          delete this[name];
	        }
	      }
	    }
	    return i ? listener ? onAdd : onRemove : listener ? d3_noop : removeAll;
	  }
	  var d3_selection_onFilters = d3.map({
	    mouseenter: "mouseover",
	    mouseleave: "mouseout"
	  });
	  if (d3_document) {
	    d3_selection_onFilters.forEach(function(k) {
	      if ("on" + k in d3_document) d3_selection_onFilters.remove(k);
	    });
	  }
	  function d3_selection_onListener(listener, argumentz) {
	    return function(e) {
	      var o = d3.event;
	      d3.event = e;
	      argumentz[0] = this.__data__;
	      try {
	        listener.apply(this, argumentz);
	      } finally {
	        d3.event = o;
	      }
	    };
	  }
	  function d3_selection_onFilter(listener, argumentz) {
	    var l = d3_selection_onListener(listener, argumentz);
	    return function(e) {
	      var target = this, related = e.relatedTarget;
	      if (!related || related !== target && !(related.compareDocumentPosition(target) & 8)) {
	        l.call(target, e);
	      }
	    };
	  }
	  var d3_event_dragSelect, d3_event_dragId = 0;
	  function d3_event_dragSuppress(node) {
	    var name = ".dragsuppress-" + ++d3_event_dragId, click = "click" + name, w = d3.select(d3_window(node)).on("touchmove" + name, d3_eventPreventDefault).on("dragstart" + name, d3_eventPreventDefault).on("selectstart" + name, d3_eventPreventDefault);
	    if (d3_event_dragSelect == null) {
	      d3_event_dragSelect = "onselectstart" in node ? false : d3_vendorSymbol(node.style, "userSelect");
	    }
	    if (d3_event_dragSelect) {
	      var style = d3_documentElement(node).style, select = style[d3_event_dragSelect];
	      style[d3_event_dragSelect] = "none";
	    }
	    return function(suppressClick) {
	      w.on(name, null);
	      if (d3_event_dragSelect) style[d3_event_dragSelect] = select;
	      if (suppressClick) {
	        var off = function() {
	          w.on(click, null);
	        };
	        w.on(click, function() {
	          d3_eventPreventDefault();
	          off();
	        }, true);
	        setTimeout(off, 0);
	      }
	    };
	  }
	  d3.mouse = function(container) {
	    return d3_mousePoint(container, d3_eventSource());
	  };
	  var d3_mouse_bug44083 = this.navigator && /WebKit/.test(this.navigator.userAgent) ? -1 : 0;
	  function d3_mousePoint(container, e) {
	    if (e.changedTouches) e = e.changedTouches[0];
	    var svg = container.ownerSVGElement || container;
	    if (svg.createSVGPoint) {
	      var point = svg.createSVGPoint();
	      if (d3_mouse_bug44083 < 0) {
	        var window = d3_window(container);
	        if (window.scrollX || window.scrollY) {
	          svg = d3.select("body").append("svg").style({
	            position: "absolute",
	            top: 0,
	            left: 0,
	            margin: 0,
	            padding: 0,
	            border: "none"
	          }, "important");
	          var ctm = svg[0][0].getScreenCTM();
	          d3_mouse_bug44083 = !(ctm.f || ctm.e);
	          svg.remove();
	        }
	      }
	      if (d3_mouse_bug44083) point.x = e.pageX, point.y = e.pageY; else point.x = e.clientX, 
	      point.y = e.clientY;
	      point = point.matrixTransform(container.getScreenCTM().inverse());
	      return [ point.x, point.y ];
	    }
	    var rect = container.getBoundingClientRect();
	    return [ e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop ];
	  }
	  d3.touch = function(container, touches, identifier) {
	    if (arguments.length < 3) identifier = touches, touches = d3_eventSource().changedTouches;
	    if (touches) for (var i = 0, n = touches.length, touch; i < n; ++i) {
	      if ((touch = touches[i]).identifier === identifier) {
	        return d3_mousePoint(container, touch);
	      }
	    }
	  };
	  d3.behavior.drag = function() {
	    var event = d3_eventDispatch(drag, "drag", "dragstart", "dragend"), origin = null, mousedown = dragstart(d3_noop, d3.mouse, d3_window, "mousemove", "mouseup"), touchstart = dragstart(d3_behavior_dragTouchId, d3.touch, d3_identity, "touchmove", "touchend");
	    function drag() {
	      this.on("mousedown.drag", mousedown).on("touchstart.drag", touchstart);
	    }
	    function dragstart(id, position, subject, move, end) {
	      return function() {
	        var that = this, target = d3.event.target.correspondingElement || d3.event.target, parent = that.parentNode, dispatch = event.of(that, arguments), dragged = 0, dragId = id(), dragName = ".drag" + (dragId == null ? "" : "-" + dragId), dragOffset, dragSubject = d3.select(subject(target)).on(move + dragName, moved).on(end + dragName, ended), dragRestore = d3_event_dragSuppress(target), position0 = position(parent, dragId);
	        if (origin) {
	          dragOffset = origin.apply(that, arguments);
	          dragOffset = [ dragOffset.x - position0[0], dragOffset.y - position0[1] ];
	        } else {
	          dragOffset = [ 0, 0 ];
	        }
	        dispatch({
	          type: "dragstart"
	        });
	        function moved() {
	          var position1 = position(parent, dragId), dx, dy;
	          if (!position1) return;
	          dx = position1[0] - position0[0];
	          dy = position1[1] - position0[1];
	          dragged |= dx | dy;
	          position0 = position1;
	          dispatch({
	            type: "drag",
	            x: position1[0] + dragOffset[0],
	            y: position1[1] + dragOffset[1],
	            dx: dx,
	            dy: dy
	          });
	        }
	        function ended() {
	          if (!position(parent, dragId)) return;
	          dragSubject.on(move + dragName, null).on(end + dragName, null);
	          dragRestore(dragged);
	          dispatch({
	            type: "dragend"
	          });
	        }
	      };
	    }
	    drag.origin = function(x) {
	      if (!arguments.length) return origin;
	      origin = x;
	      return drag;
	    };
	    return d3.rebind(drag, event, "on");
	  };
	  function d3_behavior_dragTouchId() {
	    return d3.event.changedTouches[0].identifier;
	  }
	  d3.touches = function(container, touches) {
	    if (arguments.length < 2) touches = d3_eventSource().touches;
	    return touches ? d3_array(touches).map(function(touch) {
	      var point = d3_mousePoint(container, touch);
	      point.identifier = touch.identifier;
	      return point;
	    }) : [];
	  };
	  var ε = 1e-6, ε2 = ε * ε, π = Math.PI, τ = 2 * π, τε = τ - ε, halfπ = π / 2, d3_radians = π / 180, d3_degrees = 180 / π;
	  function d3_sgn(x) {
	    return x > 0 ? 1 : x < 0 ? -1 : 0;
	  }
	  function d3_cross2d(a, b, c) {
	    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
	  }
	  function d3_acos(x) {
	    return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
	  }
	  function d3_asin(x) {
	    return x > 1 ? halfπ : x < -1 ? -halfπ : Math.asin(x);
	  }
	  function d3_sinh(x) {
	    return ((x = Math.exp(x)) - 1 / x) / 2;
	  }
	  function d3_cosh(x) {
	    return ((x = Math.exp(x)) + 1 / x) / 2;
	  }
	  function d3_tanh(x) {
	    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
	  }
	  function d3_haversin(x) {
	    return (x = Math.sin(x / 2)) * x;
	  }
	  var ρ = Math.SQRT2, ρ2 = 2, ρ4 = 4;
	  d3.interpolateZoom = function(p0, p1) {
	    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
	    if (d2 < ε2) {
	      S = Math.log(w1 / w0) / ρ;
	      i = function(t) {
	        return [ ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(ρ * t * S) ];
	      };
	    } else {
	      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + ρ4 * d2) / (2 * w0 * ρ2 * d1), b1 = (w1 * w1 - w0 * w0 - ρ4 * d2) / (2 * w1 * ρ2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
	      S = (r1 - r0) / ρ;
	      i = function(t) {
	        var s = t * S, coshr0 = d3_cosh(r0), u = w0 / (ρ2 * d1) * (coshr0 * d3_tanh(ρ * s + r0) - d3_sinh(r0));
	        return [ ux0 + u * dx, uy0 + u * dy, w0 * coshr0 / d3_cosh(ρ * s + r0) ];
	      };
	    }
	    i.duration = S * 1e3;
	    return i;
	  };
	  d3.behavior.zoom = function() {
	    var view = {
	      x: 0,
	      y: 0,
	      k: 1
	    }, translate0, center0, center, size = [ 960, 500 ], scaleExtent = d3_behavior_zoomInfinity, duration = 250, zooming = 0, mousedown = "mousedown.zoom", mousemove = "mousemove.zoom", mouseup = "mouseup.zoom", mousewheelTimer, touchstart = "touchstart.zoom", touchtime, event = d3_eventDispatch(zoom, "zoomstart", "zoom", "zoomend"), x0, x1, y0, y1;
	    if (!d3_behavior_zoomWheel) {
	      d3_behavior_zoomWheel = "onwheel" in d3_document ? (d3_behavior_zoomDelta = function() {
	        return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1);
	      }, "wheel") : "onmousewheel" in d3_document ? (d3_behavior_zoomDelta = function() {
	        return d3.event.wheelDelta;
	      }, "mousewheel") : (d3_behavior_zoomDelta = function() {
	        return -d3.event.detail;
	      }, "MozMousePixelScroll");
	    }
	    function zoom(g) {
	      g.on(mousedown, mousedowned).on(d3_behavior_zoomWheel + ".zoom", mousewheeled).on("dblclick.zoom", dblclicked).on(touchstart, touchstarted);
	    }
	    zoom.event = function(g) {
	      g.each(function() {
	        var dispatch = event.of(this, arguments), view1 = view;
	        if (d3_transitionInheritId) {
	          d3.select(this).transition().each("start.zoom", function() {
	            view = this.__chart__ || {
	              x: 0,
	              y: 0,
	              k: 1
	            };
	            zoomstarted(dispatch);
	          }).tween("zoom:zoom", function() {
	            var dx = size[0], dy = size[1], cx = center0 ? center0[0] : dx / 2, cy = center0 ? center0[1] : dy / 2, i = d3.interpolateZoom([ (cx - view.x) / view.k, (cy - view.y) / view.k, dx / view.k ], [ (cx - view1.x) / view1.k, (cy - view1.y) / view1.k, dx / view1.k ]);
	            return function(t) {
	              var l = i(t), k = dx / l[2];
	              this.__chart__ = view = {
	                x: cx - l[0] * k,
	                y: cy - l[1] * k,
	                k: k
	              };
	              zoomed(dispatch);
	            };
	          }).each("interrupt.zoom", function() {
	            zoomended(dispatch);
	          }).each("end.zoom", function() {
	            zoomended(dispatch);
	          });
	        } else {
	          this.__chart__ = view;
	          zoomstarted(dispatch);
	          zoomed(dispatch);
	          zoomended(dispatch);
	        }
	      });
	    };
	    zoom.translate = function(_) {
	      if (!arguments.length) return [ view.x, view.y ];
	      view = {
	        x: +_[0],
	        y: +_[1],
	        k: view.k
	      };
	      rescale();
	      return zoom;
	    };
	    zoom.scale = function(_) {
	      if (!arguments.length) return view.k;
	      view = {
	        x: view.x,
	        y: view.y,
	        k: null
	      };
	      scaleTo(+_);
	      rescale();
	      return zoom;
	    };
	    zoom.scaleExtent = function(_) {
	      if (!arguments.length) return scaleExtent;
	      scaleExtent = _ == null ? d3_behavior_zoomInfinity : [ +_[0], +_[1] ];
	      return zoom;
	    };
	    zoom.center = function(_) {
	      if (!arguments.length) return center;
	      center = _ && [ +_[0], +_[1] ];
	      return zoom;
	    };
	    zoom.size = function(_) {
	      if (!arguments.length) return size;
	      size = _ && [ +_[0], +_[1] ];
	      return zoom;
	    };
	    zoom.duration = function(_) {
	      if (!arguments.length) return duration;
	      duration = +_;
	      return zoom;
	    };
	    zoom.x = function(z) {
	      if (!arguments.length) return x1;
	      x1 = z;
	      x0 = z.copy();
	      view = {
	        x: 0,
	        y: 0,
	        k: 1
	      };
	      return zoom;
	    };
	    zoom.y = function(z) {
	      if (!arguments.length) return y1;
	      y1 = z;
	      y0 = z.copy();
	      view = {
	        x: 0,
	        y: 0,
	        k: 1
	      };
	      return zoom;
	    };
	    function location(p) {
	      return [ (p[0] - view.x) / view.k, (p[1] - view.y) / view.k ];
	    }
	    function point(l) {
	      return [ l[0] * view.k + view.x, l[1] * view.k + view.y ];
	    }
	    function scaleTo(s) {
	      view.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
	    }
	    function translateTo(p, l) {
	      l = point(l);
	      view.x += p[0] - l[0];
	      view.y += p[1] - l[1];
	    }
	    function zoomTo(that, p, l, k) {
	      that.__chart__ = {
	        x: view.x,
	        y: view.y,
	        k: view.k
	      };
	      scaleTo(Math.pow(2, k));
	      translateTo(center0 = p, l);
	      that = d3.select(that);
	      if (duration > 0) that = that.transition().duration(duration);
	      that.call(zoom.event);
	    }
	    function rescale() {
	      if (x1) x1.domain(x0.range().map(function(x) {
	        return (x - view.x) / view.k;
	      }).map(x0.invert));
	      if (y1) y1.domain(y0.range().map(function(y) {
	        return (y - view.y) / view.k;
	      }).map(y0.invert));
	    }
	    function zoomstarted(dispatch) {
	      if (!zooming++) dispatch({
	        type: "zoomstart"
	      });
	    }
	    function zoomed(dispatch) {
	      rescale();
	      dispatch({
	        type: "zoom",
	        scale: view.k,
	        translate: [ view.x, view.y ]
	      });
	    }
	    function zoomended(dispatch) {
	      if (!--zooming) dispatch({
	        type: "zoomend"
	      }), center0 = null;
	    }
	    function mousedowned() {
	      var that = this, dispatch = event.of(that, arguments), dragged = 0, subject = d3.select(d3_window(that)).on(mousemove, moved).on(mouseup, ended), location0 = location(d3.mouse(that)), dragRestore = d3_event_dragSuppress(that);
	      d3_selection_interrupt.call(that);
	      zoomstarted(dispatch);
	      function moved() {
	        dragged = 1;
	        translateTo(d3.mouse(that), location0);
	        zoomed(dispatch);
	      }
	      function ended() {
	        subject.on(mousemove, null).on(mouseup, null);
	        dragRestore(dragged);
	        zoomended(dispatch);
	      }
	    }
	    function touchstarted() {
	      var that = this, dispatch = event.of(that, arguments), locations0 = {}, distance0 = 0, scale0, zoomName = ".zoom-" + d3.event.changedTouches[0].identifier, touchmove = "touchmove" + zoomName, touchend = "touchend" + zoomName, targets = [], subject = d3.select(that), dragRestore = d3_event_dragSuppress(that);
	      started();
	      zoomstarted(dispatch);
	      subject.on(mousedown, null).on(touchstart, started);
	      function relocate() {
	        var touches = d3.touches(that);
	        scale0 = view.k;
	        touches.forEach(function(t) {
	          if (t.identifier in locations0) locations0[t.identifier] = location(t);
	        });
	        return touches;
	      }
	      function started() {
	        var target = d3.event.target;
	        d3.select(target).on(touchmove, moved).on(touchend, ended);
	        targets.push(target);
	        var changed = d3.event.changedTouches;
	        for (var i = 0, n = changed.length; i < n; ++i) {
	          locations0[changed[i].identifier] = null;
	        }
	        var touches = relocate(), now = Date.now();
	        if (touches.length === 1) {
	          if (now - touchtime < 500) {
	            var p = touches[0];
	            zoomTo(that, p, locations0[p.identifier], Math.floor(Math.log(view.k) / Math.LN2) + 1);
	            d3_eventPreventDefault();
	          }
	          touchtime = now;
	        } else if (touches.length > 1) {
	          var p = touches[0], q = touches[1], dx = p[0] - q[0], dy = p[1] - q[1];
	          distance0 = dx * dx + dy * dy;
	        }
	      }
	      function moved() {
	        var touches = d3.touches(that), p0, l0, p1, l1;
	        d3_selection_interrupt.call(that);
	        for (var i = 0, n = touches.length; i < n; ++i, l1 = null) {
	          p1 = touches[i];
	          if (l1 = locations0[p1.identifier]) {
	            if (l0) break;
	            p0 = p1, l0 = l1;
	          }
	        }
	        if (l1) {
	          var distance1 = (distance1 = p1[0] - p0[0]) * distance1 + (distance1 = p1[1] - p0[1]) * distance1, scale1 = distance0 && Math.sqrt(distance1 / distance0);
	          p0 = [ (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 ];
	          l0 = [ (l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2 ];
	          scaleTo(scale1 * scale0);
	        }
	        touchtime = null;
	        translateTo(p0, l0);
	        zoomed(dispatch);
	      }
	      function ended() {
	        if (d3.event.touches.length) {
	          var changed = d3.event.changedTouches;
	          for (var i = 0, n = changed.length; i < n; ++i) {
	            delete locations0[changed[i].identifier];
	          }
	          for (var identifier in locations0) {
	            return void relocate();
	          }
	        }
	        d3.selectAll(targets).on(zoomName, null);
	        subject.on(mousedown, mousedowned).on(touchstart, touchstarted);
	        dragRestore();
	        zoomended(dispatch);
	      }
	    }
	    function mousewheeled() {
	      var dispatch = event.of(this, arguments);
	      if (mousewheelTimer) clearTimeout(mousewheelTimer); else d3_selection_interrupt.call(this), 
	      translate0 = location(center0 = center || d3.mouse(this)), zoomstarted(dispatch);
	      mousewheelTimer = setTimeout(function() {
	        mousewheelTimer = null;
	        zoomended(dispatch);
	      }, 50);
	      d3_eventPreventDefault();
	      scaleTo(Math.pow(2, d3_behavior_zoomDelta() * .002) * view.k);
	      translateTo(center0, translate0);
	      zoomed(dispatch);
	    }
	    function dblclicked() {
	      var p = d3.mouse(this), k = Math.log(view.k) / Math.LN2;
	      zoomTo(this, p, location(p), d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1);
	    }
	    return d3.rebind(zoom, event, "on");
	  };
	  var d3_behavior_zoomInfinity = [ 0, Infinity ], d3_behavior_zoomDelta, d3_behavior_zoomWheel;
	  d3.color = d3_color;
	  function d3_color() {}
	  d3_color.prototype.toString = function() {
	    return this.rgb() + "";
	  };
	  d3.hsl = d3_hsl;
	  function d3_hsl(h, s, l) {
	    return this instanceof d3_hsl ? void (this.h = +h, this.s = +s, this.l = +l) : arguments.length < 2 ? h instanceof d3_hsl ? new d3_hsl(h.h, h.s, h.l) : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl) : new d3_hsl(h, s, l);
	  }
	  var d3_hslPrototype = d3_hsl.prototype = new d3_color();
	  d3_hslPrototype.brighter = function(k) {
	    k = Math.pow(.7, arguments.length ? k : 1);
	    return new d3_hsl(this.h, this.s, this.l / k);
	  };
	  d3_hslPrototype.darker = function(k) {
	    k = Math.pow(.7, arguments.length ? k : 1);
	    return new d3_hsl(this.h, this.s, k * this.l);
	  };
	  d3_hslPrototype.rgb = function() {
	    return d3_hsl_rgb(this.h, this.s, this.l);
	  };
	  function d3_hsl_rgb(h, s, l) {
	    var m1, m2;
	    h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
	    s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
	    l = l < 0 ? 0 : l > 1 ? 1 : l;
	    m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
	    m1 = 2 * l - m2;
	    function v(h) {
	      if (h > 360) h -= 360; else if (h < 0) h += 360;
	      if (h < 60) return m1 + (m2 - m1) * h / 60;
	      if (h < 180) return m2;
	      if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
	      return m1;
	    }
	    function vv(h) {
	      return Math.round(v(h) * 255);
	    }
	    return new d3_rgb(vv(h + 120), vv(h), vv(h - 120));
	  }
	  d3.hcl = d3_hcl;
	  function d3_hcl(h, c, l) {
	    return this instanceof d3_hcl ? void (this.h = +h, this.c = +c, this.l = +l) : arguments.length < 2 ? h instanceof d3_hcl ? new d3_hcl(h.h, h.c, h.l) : h instanceof d3_lab ? d3_lab_hcl(h.l, h.a, h.b) : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b) : new d3_hcl(h, c, l);
	  }
	  var d3_hclPrototype = d3_hcl.prototype = new d3_color();
	  d3_hclPrototype.brighter = function(k) {
	    return new d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
	  };
	  d3_hclPrototype.darker = function(k) {
	    return new d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
	  };
	  d3_hclPrototype.rgb = function() {
	    return d3_hcl_lab(this.h, this.c, this.l).rgb();
	  };
	  function d3_hcl_lab(h, c, l) {
	    if (isNaN(h)) h = 0;
	    if (isNaN(c)) c = 0;
	    return new d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
	  }
	  d3.lab = d3_lab;
	  function d3_lab(l, a, b) {
	    return this instanceof d3_lab ? void (this.l = +l, this.a = +a, this.b = +b) : arguments.length < 2 ? l instanceof d3_lab ? new d3_lab(l.l, l.a, l.b) : l instanceof d3_hcl ? d3_hcl_lab(l.h, l.c, l.l) : d3_rgb_lab((l = d3_rgb(l)).r, l.g, l.b) : new d3_lab(l, a, b);
	  }
	  var d3_lab_K = 18;
	  var d3_lab_X = .95047, d3_lab_Y = 1, d3_lab_Z = 1.08883;
	  var d3_labPrototype = d3_lab.prototype = new d3_color();
	  d3_labPrototype.brighter = function(k) {
	    return new d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
	  };
	  d3_labPrototype.darker = function(k) {
	    return new d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
	  };
	  d3_labPrototype.rgb = function() {
	    return d3_lab_rgb(this.l, this.a, this.b);
	  };
	  function d3_lab_rgb(l, a, b) {
	    var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
	    x = d3_lab_xyz(x) * d3_lab_X;
	    y = d3_lab_xyz(y) * d3_lab_Y;
	    z = d3_lab_xyz(z) * d3_lab_Z;
	    return new d3_rgb(d3_xyz_rgb(3.2404542 * x - 1.5371385 * y - .4985314 * z), d3_xyz_rgb(-.969266 * x + 1.8760108 * y + .041556 * z), d3_xyz_rgb(.0556434 * x - .2040259 * y + 1.0572252 * z));
	  }
	  function d3_lab_hcl(l, a, b) {
	    return l > 0 ? new d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l) : new d3_hcl(NaN, NaN, l);
	  }
	  function d3_lab_xyz(x) {
	    return x > .206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
	  }
	  function d3_xyz_lab(x) {
	    return x > .008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
	  }
	  function d3_xyz_rgb(r) {
	    return Math.round(255 * (r <= .00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - .055));
	  }
	  d3.rgb = d3_rgb;
	  function d3_rgb(r, g, b) {
	    return this instanceof d3_rgb ? void (this.r = ~~r, this.g = ~~g, this.b = ~~b) : arguments.length < 2 ? r instanceof d3_rgb ? new d3_rgb(r.r, r.g, r.b) : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb) : new d3_rgb(r, g, b);
	  }
	  function d3_rgbNumber(value) {
	    return new d3_rgb(value >> 16, value >> 8 & 255, value & 255);
	  }
	  function d3_rgbString(value) {
	    return d3_rgbNumber(value) + "";
	  }
	  var d3_rgbPrototype = d3_rgb.prototype = new d3_color();
	  d3_rgbPrototype.brighter = function(k) {
	    k = Math.pow(.7, arguments.length ? k : 1);
	    var r = this.r, g = this.g, b = this.b, i = 30;
	    if (!r && !g && !b) return new d3_rgb(i, i, i);
	    if (r && r < i) r = i;
	    if (g && g < i) g = i;
	    if (b && b < i) b = i;
	    return new d3_rgb(Math.min(255, r / k), Math.min(255, g / k), Math.min(255, b / k));
	  };
	  d3_rgbPrototype.darker = function(k) {
	    k = Math.pow(.7, arguments.length ? k : 1);
	    return new d3_rgb(k * this.r, k * this.g, k * this.b);
	  };
	  d3_rgbPrototype.hsl = function() {
	    return d3_rgb_hsl(this.r, this.g, this.b);
	  };
	  d3_rgbPrototype.toString = function() {
	    return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
	  };
	  function d3_rgb_hex(v) {
	    return v < 16 ? "0" + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
	  }
	  function d3_rgb_parse(format, rgb, hsl) {
	    var r = 0, g = 0, b = 0, m1, m2, color;
	    m1 = /([a-z]+)\((.*)\)/.exec(format = format.toLowerCase());
	    if (m1) {
	      m2 = m1[2].split(",");
	      switch (m1[1]) {
	       case "hsl":
	        {
	          return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
	        }

	       case "rgb":
	        {
	          return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]));
	        }
	      }
	    }
	    if (color = d3_rgb_names.get(format)) {
	      return rgb(color.r, color.g, color.b);
	    }
	    if (format != null && format.charAt(0) === "#" && !isNaN(color = parseInt(format.slice(1), 16))) {
	      if (format.length === 4) {
	        r = (color & 3840) >> 4;
	        r = r >> 4 | r;
	        g = color & 240;
	        g = g >> 4 | g;
	        b = color & 15;
	        b = b << 4 | b;
	      } else if (format.length === 7) {
	        r = (color & 16711680) >> 16;
	        g = (color & 65280) >> 8;
	        b = color & 255;
	      }
	    }
	    return rgb(r, g, b);
	  }
	  function d3_rgb_hsl(r, g, b) {
	    var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
	    if (d) {
	      s = l < .5 ? d / (max + min) : d / (2 - max - min);
	      if (r == max) h = (g - b) / d + (g < b ? 6 : 0); else if (g == max) h = (b - r) / d + 2; else h = (r - g) / d + 4;
	      h *= 60;
	    } else {
	      h = NaN;
	      s = l > 0 && l < 1 ? 0 : h;
	    }
	    return new d3_hsl(h, s, l);
	  }
	  function d3_rgb_lab(r, g, b) {
	    r = d3_rgb_xyz(r);
	    g = d3_rgb_xyz(g);
	    b = d3_rgb_xyz(b);
	    var x = d3_xyz_lab((.4124564 * r + .3575761 * g + .1804375 * b) / d3_lab_X), y = d3_xyz_lab((.2126729 * r + .7151522 * g + .072175 * b) / d3_lab_Y), z = d3_xyz_lab((.0193339 * r + .119192 * g + .9503041 * b) / d3_lab_Z);
	    return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
	  }
	  function d3_rgb_xyz(r) {
	    return (r /= 255) <= .04045 ? r / 12.92 : Math.pow((r + .055) / 1.055, 2.4);
	  }
	  function d3_rgb_parseNumber(c) {
	    var f = parseFloat(c);
	    return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
	  }
	  var d3_rgb_names = d3.map({
	    aliceblue: 15792383,
	    antiquewhite: 16444375,
	    aqua: 65535,
	    aquamarine: 8388564,
	    azure: 15794175,
	    beige: 16119260,
	    bisque: 16770244,
	    black: 0,
	    blanchedalmond: 16772045,
	    blue: 255,
	    blueviolet: 9055202,
	    brown: 10824234,
	    burlywood: 14596231,
	    cadetblue: 6266528,
	    chartreuse: 8388352,
	    chocolate: 13789470,
	    coral: 16744272,
	    cornflowerblue: 6591981,
	    cornsilk: 16775388,
	    crimson: 14423100,
	    cyan: 65535,
	    darkblue: 139,
	    darkcyan: 35723,
	    darkgoldenrod: 12092939,
	    darkgray: 11119017,
	    darkgreen: 25600,
	    darkgrey: 11119017,
	    darkkhaki: 12433259,
	    darkmagenta: 9109643,
	    darkolivegreen: 5597999,
	    darkorange: 16747520,
	    darkorchid: 10040012,
	    darkred: 9109504,
	    darksalmon: 15308410,
	    darkseagreen: 9419919,
	    darkslateblue: 4734347,
	    darkslategray: 3100495,
	    darkslategrey: 3100495,
	    darkturquoise: 52945,
	    darkviolet: 9699539,
	    deeppink: 16716947,
	    deepskyblue: 49151,
	    dimgray: 6908265,
	    dimgrey: 6908265,
	    dodgerblue: 2003199,
	    firebrick: 11674146,
	    floralwhite: 16775920,
	    forestgreen: 2263842,
	    fuchsia: 16711935,
	    gainsboro: 14474460,
	    ghostwhite: 16316671,
	    gold: 16766720,
	    goldenrod: 14329120,
	    gray: 8421504,
	    green: 32768,
	    greenyellow: 11403055,
	    grey: 8421504,
	    honeydew: 15794160,
	    hotpink: 16738740,
	    indianred: 13458524,
	    indigo: 4915330,
	    ivory: 16777200,
	    khaki: 15787660,
	    lavender: 15132410,
	    lavenderblush: 16773365,
	    lawngreen: 8190976,
	    lemonchiffon: 16775885,
	    lightblue: 11393254,
	    lightcoral: 15761536,
	    lightcyan: 14745599,
	    lightgoldenrodyellow: 16448210,
	    lightgray: 13882323,
	    lightgreen: 9498256,
	    lightgrey: 13882323,
	    lightpink: 16758465,
	    lightsalmon: 16752762,
	    lightseagreen: 2142890,
	    lightskyblue: 8900346,
	    lightslategray: 7833753,
	    lightslategrey: 7833753,
	    lightsteelblue: 11584734,
	    lightyellow: 16777184,
	    lime: 65280,
	    limegreen: 3329330,
	    linen: 16445670,
	    magenta: 16711935,
	    maroon: 8388608,
	    mediumaquamarine: 6737322,
	    mediumblue: 205,
	    mediumorchid: 12211667,
	    mediumpurple: 9662683,
	    mediumseagreen: 3978097,
	    mediumslateblue: 8087790,
	    mediumspringgreen: 64154,
	    mediumturquoise: 4772300,
	    mediumvioletred: 13047173,
	    midnightblue: 1644912,
	    mintcream: 16121850,
	    mistyrose: 16770273,
	    moccasin: 16770229,
	    navajowhite: 16768685,
	    navy: 128,
	    oldlace: 16643558,
	    olive: 8421376,
	    olivedrab: 7048739,
	    orange: 16753920,
	    orangered: 16729344,
	    orchid: 14315734,
	    palegoldenrod: 15657130,
	    palegreen: 10025880,
	    paleturquoise: 11529966,
	    palevioletred: 14381203,
	    papayawhip: 16773077,
	    peachpuff: 16767673,
	    peru: 13468991,
	    pink: 16761035,
	    plum: 14524637,
	    powderblue: 11591910,
	    purple: 8388736,
	    rebeccapurple: 6697881,
	    red: 16711680,
	    rosybrown: 12357519,
	    royalblue: 4286945,
	    saddlebrown: 9127187,
	    salmon: 16416882,
	    sandybrown: 16032864,
	    seagreen: 3050327,
	    seashell: 16774638,
	    sienna: 10506797,
	    silver: 12632256,
	    skyblue: 8900331,
	    slateblue: 6970061,
	    slategray: 7372944,
	    slategrey: 7372944,
	    snow: 16775930,
	    springgreen: 65407,
	    steelblue: 4620980,
	    tan: 13808780,
	    teal: 32896,
	    thistle: 14204888,
	    tomato: 16737095,
	    turquoise: 4251856,
	    violet: 15631086,
	    wheat: 16113331,
	    white: 16777215,
	    whitesmoke: 16119285,
	    yellow: 16776960,
	    yellowgreen: 10145074
	  });
	  d3_rgb_names.forEach(function(key, value) {
	    d3_rgb_names.set(key, d3_rgbNumber(value));
	  });
	  function d3_functor(v) {
	    return typeof v === "function" ? v : function() {
	      return v;
	    };
	  }
	  d3.functor = d3_functor;
	  d3.xhr = d3_xhrType(d3_identity);
	  function d3_xhrType(response) {
	    return function(url, mimeType, callback) {
	      if (arguments.length === 2 && typeof mimeType === "function") callback = mimeType, 
	      mimeType = null;
	      return d3_xhr(url, mimeType, response, callback);
	    };
	  }
	  function d3_xhr(url, mimeType, response, callback) {
	    var xhr = {}, dispatch = d3.dispatch("beforesend", "progress", "load", "error"), headers = {}, request = new XMLHttpRequest(), responseType = null;
	    if (this.XDomainRequest && !("withCredentials" in request) && /^(http(s)?:)?\/\//.test(url)) request = new XDomainRequest();
	    "onload" in request ? request.onload = request.onerror = respond : request.onreadystatechange = function() {
	      request.readyState > 3 && respond();
	    };
	    function respond() {
	      var status = request.status, result;
	      if (!status && d3_xhrHasResponse(request) || status >= 200 && status < 300 || status === 304) {
	        try {
	          result = response.call(xhr, request);
	        } catch (e) {
	          dispatch.error.call(xhr, e);
	          return;
	        }
	        dispatch.load.call(xhr, result);
	      } else {
	        dispatch.error.call(xhr, request);
	      }
	    }
	    request.onprogress = function(event) {
	      var o = d3.event;
	      d3.event = event;
	      try {
	        dispatch.progress.call(xhr, request);
	      } finally {
	        d3.event = o;
	      }
	    };
	    xhr.header = function(name, value) {
	      name = (name + "").toLowerCase();
	      if (arguments.length < 2) return headers[name];
	      if (value == null) delete headers[name]; else headers[name] = value + "";
	      return xhr;
	    };
	    xhr.mimeType = function(value) {
	      if (!arguments.length) return mimeType;
	      mimeType = value == null ? null : value + "";
	      return xhr;
	    };
	    xhr.responseType = function(value) {
	      if (!arguments.length) return responseType;
	      responseType = value;
	      return xhr;
	    };
	    xhr.response = function(value) {
	      response = value;
	      return xhr;
	    };
	    [ "get", "post" ].forEach(function(method) {
	      xhr[method] = function() {
	        return xhr.send.apply(xhr, [ method ].concat(d3_array(arguments)));
	      };
	    });
	    xhr.send = function(method, data, callback) {
	      if (arguments.length === 2 && typeof data === "function") callback = data, data = null;
	      request.open(method, url, true);
	      if (mimeType != null && !("accept" in headers)) headers["accept"] = mimeType + ",*/*";
	      if (request.setRequestHeader) for (var name in headers) request.setRequestHeader(name, headers[name]);
	      if (mimeType != null && request.overrideMimeType) request.overrideMimeType(mimeType);
	      if (responseType != null) request.responseType = responseType;
	      if (callback != null) xhr.on("error", callback).on("load", function(request) {
	        callback(null, request);
	      });
	      dispatch.beforesend.call(xhr, request);
	      request.send(data == null ? null : data);
	      return xhr;
	    };
	    xhr.abort = function() {
	      request.abort();
	      return xhr;
	    };
	    d3.rebind(xhr, dispatch, "on");
	    return callback == null ? xhr : xhr.get(d3_xhr_fixCallback(callback));
	  }
	  function d3_xhr_fixCallback(callback) {
	    return callback.length === 1 ? function(error, request) {
	      callback(error == null ? request : null);
	    } : callback;
	  }
	  function d3_xhrHasResponse(request) {
	    var type = request.responseType;
	    return type && type !== "text" ? request.response : request.responseText;
	  }
	  d3.dsv = function(delimiter, mimeType) {
	    var reFormat = new RegExp('["' + delimiter + "\n]"), delimiterCode = delimiter.charCodeAt(0);
	    function dsv(url, row, callback) {
	      if (arguments.length < 3) callback = row, row = null;
	      var xhr = d3_xhr(url, mimeType, row == null ? response : typedResponse(row), callback);
	      xhr.row = function(_) {
	        return arguments.length ? xhr.response((row = _) == null ? response : typedResponse(_)) : row;
	      };
	      return xhr;
	    }
	    function response(request) {
	      return dsv.parse(request.responseText);
	    }
	    function typedResponse(f) {
	      return function(request) {
	        return dsv.parse(request.responseText, f);
	      };
	    }
	    dsv.parse = function(text, f) {
	      var o;
	      return dsv.parseRows(text, function(row, i) {
	        if (o) return o(row, i - 1);
	        var a = new Function("d", "return {" + row.map(function(name, i) {
	          return JSON.stringify(name) + ": d[" + i + "]";
	        }).join(",") + "}");
	        o = f ? function(row, i) {
	          return f(a(row), i);
	        } : a;
	      });
	    };
	    dsv.parseRows = function(text, f) {
	      var EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;
	      function token() {
	        if (I >= N) return EOF;
	        if (eol) return eol = false, EOL;
	        var j = I;
	        if (text.charCodeAt(j) === 34) {
	          var i = j;
	          while (i++ < N) {
	            if (text.charCodeAt(i) === 34) {
	              if (text.charCodeAt(i + 1) !== 34) break;
	              ++i;
	            }
	          }
	          I = i + 2;
	          var c = text.charCodeAt(i + 1);
	          if (c === 13) {
	            eol = true;
	            if (text.charCodeAt(i + 2) === 10) ++I;
	          } else if (c === 10) {
	            eol = true;
	          }
	          return text.slice(j + 1, i).replace(/""/g, '"');
	        }
	        while (I < N) {
	          var c = text.charCodeAt(I++), k = 1;
	          if (c === 10) eol = true; else if (c === 13) {
	            eol = true;
	            if (text.charCodeAt(I) === 10) ++I, ++k;
	          } else if (c !== delimiterCode) continue;
	          return text.slice(j, I - k);
	        }
	        return text.slice(j);
	      }
	      while ((t = token()) !== EOF) {
	        var a = [];
	        while (t !== EOL && t !== EOF) {
	          a.push(t);
	          t = token();
	        }
	        if (f && (a = f(a, n++)) == null) continue;
	        rows.push(a);
	      }
	      return rows;
	    };
	    dsv.format = function(rows) {
	      if (Array.isArray(rows[0])) return dsv.formatRows(rows);
	      var fieldSet = new d3_Set(), fields = [];
	      rows.forEach(function(row) {
	        for (var field in row) {
	          if (!fieldSet.has(field)) {
	            fields.push(fieldSet.add(field));
	          }
	        }
	      });
	      return [ fields.map(formatValue).join(delimiter) ].concat(rows.map(function(row) {
	        return fields.map(function(field) {
	          return formatValue(row[field]);
	        }).join(delimiter);
	      })).join("\n");
	    };
	    dsv.formatRows = function(rows) {
	      return rows.map(formatRow).join("\n");
	    };
	    function formatRow(row) {
	      return row.map(formatValue).join(delimiter);
	    }
	    function formatValue(text) {
	      return reFormat.test(text) ? '"' + text.replace(/\"/g, '""') + '"' : text;
	    }
	    return dsv;
	  };
	  d3.csv = d3.dsv(",", "text/csv");
	  d3.tsv = d3.dsv("	", "text/tab-separated-values");
	  var d3_timer_queueHead, d3_timer_queueTail, d3_timer_interval, d3_timer_timeout, d3_timer_frame = this[d3_vendorSymbol(this, "requestAnimationFrame")] || function(callback) {
	    setTimeout(callback, 17);
	  };
	  d3.timer = function() {
	    d3_timer.apply(this, arguments);
	  };
	  function d3_timer(callback, delay, then) {
	    var n = arguments.length;
	    if (n < 2) delay = 0;
	    if (n < 3) then = Date.now();
	    var time = then + delay, timer = {
	      c: callback,
	      t: time,
	      n: null
	    };
	    if (d3_timer_queueTail) d3_timer_queueTail.n = timer; else d3_timer_queueHead = timer;
	    d3_timer_queueTail = timer;
	    if (!d3_timer_interval) {
	      d3_timer_timeout = clearTimeout(d3_timer_timeout);
	      d3_timer_interval = 1;
	      d3_timer_frame(d3_timer_step);
	    }
	    return timer;
	  }
	  function d3_timer_step() {
	    var now = d3_timer_mark(), delay = d3_timer_sweep() - now;
	    if (delay > 24) {
	      if (isFinite(delay)) {
	        clearTimeout(d3_timer_timeout);
	        d3_timer_timeout = setTimeout(d3_timer_step, delay);
	      }
	      d3_timer_interval = 0;
	    } else {
	      d3_timer_interval = 1;
	      d3_timer_frame(d3_timer_step);
	    }
	  }
	  d3.timer.flush = function() {
	    d3_timer_mark();
	    d3_timer_sweep();
	  };
	  function d3_timer_mark() {
	    var now = Date.now(), timer = d3_timer_queueHead;
	    while (timer) {
	      if (now >= timer.t && timer.c(now - timer.t)) timer.c = null;
	      timer = timer.n;
	    }
	    return now;
	  }
	  function d3_timer_sweep() {
	    var t0, t1 = d3_timer_queueHead, time = Infinity;
	    while (t1) {
	      if (t1.c) {
	        if (t1.t < time) time = t1.t;
	        t1 = (t0 = t1).n;
	      } else {
	        t1 = t0 ? t0.n = t1.n : d3_timer_queueHead = t1.n;
	      }
	    }
	    d3_timer_queueTail = t0;
	    return time;
	  }
	  function d3_format_precision(x, p) {
	    return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
	  }
	  d3.round = function(x, n) {
	    return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
	  };
	  var d3_formatPrefixes = [ "y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y" ].map(d3_formatPrefix);
	  d3.formatPrefix = function(value, precision) {
	    var i = 0;
	    if (value = +value) {
	      if (value < 0) value *= -1;
	      if (precision) value = d3.round(value, d3_format_precision(value, precision));
	      i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
	      i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
	    }
	    return d3_formatPrefixes[8 + i / 3];
	  };
	  function d3_formatPrefix(d, i) {
	    var k = Math.pow(10, abs(8 - i) * 3);
	    return {
	      scale: i > 8 ? function(d) {
	        return d / k;
	      } : function(d) {
	        return d * k;
	      },
	      symbol: d
	    };
	  }
	  function d3_locale_numberFormat(locale) {
	    var locale_decimal = locale.decimal, locale_thousands = locale.thousands, locale_grouping = locale.grouping, locale_currency = locale.currency, formatGroup = locale_grouping && locale_thousands ? function(value, width) {
	      var i = value.length, t = [], j = 0, g = locale_grouping[0], length = 0;
	      while (i > 0 && g > 0) {
	        if (length + g + 1 > width) g = Math.max(1, width - length);
	        t.push(value.substring(i -= g, i + g));
	        if ((length += g + 1) > width) break;
	        g = locale_grouping[j = (j + 1) % locale_grouping.length];
	      }
	      return t.reverse().join(locale_thousands);
	    } : d3_identity;
	    return function(specifier) {
	      var match = d3_format_re.exec(specifier), fill = match[1] || " ", align = match[2] || ">", sign = match[3] || "-", symbol = match[4] || "", zfill = match[5], width = +match[6], comma = match[7], precision = match[8], type = match[9], scale = 1, prefix = "", suffix = "", integer = false, exponent = true;
	      if (precision) precision = +precision.substring(1);
	      if (zfill || fill === "0" && align === "=") {
	        zfill = fill = "0";
	        align = "=";
	      }
	      switch (type) {
	       case "n":
	        comma = true;
	        type = "g";
	        break;

	       case "%":
	        scale = 100;
	        suffix = "%";
	        type = "f";
	        break;

	       case "p":
	        scale = 100;
	        suffix = "%";
	        type = "r";
	        break;

	       case "b":
	       case "o":
	       case "x":
	       case "X":
	        if (symbol === "#") prefix = "0" + type.toLowerCase();

	       case "c":
	        exponent = false;

	       case "d":
	        integer = true;
	        precision = 0;
	        break;

	       case "s":
	        scale = -1;
	        type = "r";
	        break;
	      }
	      if (symbol === "$") prefix = locale_currency[0], suffix = locale_currency[1];
	      if (type == "r" && !precision) type = "g";
	      if (precision != null) {
	        if (type == "g") precision = Math.max(1, Math.min(21, precision)); else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
	      }
	      type = d3_format_types.get(type) || d3_format_typeDefault;
	      var zcomma = zfill && comma;
	      return function(value) {
	        var fullSuffix = suffix;
	        if (integer && value % 1) return "";
	        var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign === "-" ? "" : sign;
	        if (scale < 0) {
	          var unit = d3.formatPrefix(value, precision);
	          value = unit.scale(value);
	          fullSuffix = unit.symbol + suffix;
	        } else {
	          value *= scale;
	        }
	        value = type(value, precision);
	        var i = value.lastIndexOf("."), before, after;
	        if (i < 0) {
	          var j = exponent ? value.lastIndexOf("e") : -1;
	          if (j < 0) before = value, after = ""; else before = value.substring(0, j), after = value.substring(j);
	        } else {
	          before = value.substring(0, i);
	          after = locale_decimal + value.substring(i + 1);
	        }
	        if (!zfill && comma) before = formatGroup(before, Infinity);
	        var length = prefix.length + before.length + after.length + (zcomma ? 0 : negative.length), padding = length < width ? new Array(length = width - length + 1).join(fill) : "";
	        if (zcomma) before = formatGroup(padding + before, padding.length ? width - after.length : Infinity);
	        negative += prefix;
	        value = before + after;
	        return (align === "<" ? negative + value + padding : align === ">" ? padding + negative + value : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + fullSuffix;
	      };
	    };
	  }
	  var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;
	  var d3_format_types = d3.map({
	    b: function(x) {
	      return x.toString(2);
	    },
	    c: function(x) {
	      return String.fromCharCode(x);
	    },
	    o: function(x) {
	      return x.toString(8);
	    },
	    x: function(x) {
	      return x.toString(16);
	    },
	    X: function(x) {
	      return x.toString(16).toUpperCase();
	    },
	    g: function(x, p) {
	      return x.toPrecision(p);
	    },
	    e: function(x, p) {
	      return x.toExponential(p);
	    },
	    f: function(x, p) {
	      return x.toFixed(p);
	    },
	    r: function(x, p) {
	      return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
	    }
	  });
	  function d3_format_typeDefault(x) {
	    return x + "";
	  }
	  var d3_time = d3.time = {}, d3_date = Date;
	  function d3_date_utc() {
	    this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
	  }
	  d3_date_utc.prototype = {
	    getDate: function() {
	      return this._.getUTCDate();
	    },
	    getDay: function() {
	      return this._.getUTCDay();
	    },
	    getFullYear: function() {
	      return this._.getUTCFullYear();
	    },
	    getHours: function() {
	      return this._.getUTCHours();
	    },
	    getMilliseconds: function() {
	      return this._.getUTCMilliseconds();
	    },
	    getMinutes: function() {
	      return this._.getUTCMinutes();
	    },
	    getMonth: function() {
	      return this._.getUTCMonth();
	    },
	    getSeconds: function() {
	      return this._.getUTCSeconds();
	    },
	    getTime: function() {
	      return this._.getTime();
	    },
	    getTimezoneOffset: function() {
	      return 0;
	    },
	    valueOf: function() {
	      return this._.valueOf();
	    },
	    setDate: function() {
	      d3_time_prototype.setUTCDate.apply(this._, arguments);
	    },
	    setDay: function() {
	      d3_time_prototype.setUTCDay.apply(this._, arguments);
	    },
	    setFullYear: function() {
	      d3_time_prototype.setUTCFullYear.apply(this._, arguments);
	    },
	    setHours: function() {
	      d3_time_prototype.setUTCHours.apply(this._, arguments);
	    },
	    setMilliseconds: function() {
	      d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
	    },
	    setMinutes: function() {
	      d3_time_prototype.setUTCMinutes.apply(this._, arguments);
	    },
	    setMonth: function() {
	      d3_time_prototype.setUTCMonth.apply(this._, arguments);
	    },
	    setSeconds: function() {
	      d3_time_prototype.setUTCSeconds.apply(this._, arguments);
	    },
	    setTime: function() {
	      d3_time_prototype.setTime.apply(this._, arguments);
	    }
	  };
	  var d3_time_prototype = Date.prototype;
	  function d3_time_interval(local, step, number) {
	    function round(date) {
	      var d0 = local(date), d1 = offset(d0, 1);
	      return date - d0 < d1 - date ? d0 : d1;
	    }
	    function ceil(date) {
	      step(date = local(new d3_date(date - 1)), 1);
	      return date;
	    }
	    function offset(date, k) {
	      step(date = new d3_date(+date), k);
	      return date;
	    }
	    function range(t0, t1, dt) {
	      var time = ceil(t0), times = [];
	      if (dt > 1) {
	        while (time < t1) {
	          if (!(number(time) % dt)) times.push(new Date(+time));
	          step(time, 1);
	        }
	      } else {
	        while (time < t1) times.push(new Date(+time)), step(time, 1);
	      }
	      return times;
	    }
	    function range_utc(t0, t1, dt) {
	      try {
	        d3_date = d3_date_utc;
	        var utc = new d3_date_utc();
	        utc._ = t0;
	        return range(utc, t1, dt);
	      } finally {
	        d3_date = Date;
	      }
	    }
	    local.floor = local;
	    local.round = round;
	    local.ceil = ceil;
	    local.offset = offset;
	    local.range = range;
	    var utc = local.utc = d3_time_interval_utc(local);
	    utc.floor = utc;
	    utc.round = d3_time_interval_utc(round);
	    utc.ceil = d3_time_interval_utc(ceil);
	    utc.offset = d3_time_interval_utc(offset);
	    utc.range = range_utc;
	    return local;
	  }
	  function d3_time_interval_utc(method) {
	    return function(date, k) {
	      try {
	        d3_date = d3_date_utc;
	        var utc = new d3_date_utc();
	        utc._ = date;
	        return method(utc, k)._;
	      } finally {
	        d3_date = Date;
	      }
	    };
	  }
	  d3_time.year = d3_time_interval(function(date) {
	    date = d3_time.day(date);
	    date.setMonth(0, 1);
	    return date;
	  }, function(date, offset) {
	    date.setFullYear(date.getFullYear() + offset);
	  }, function(date) {
	    return date.getFullYear();
	  });
	  d3_time.years = d3_time.year.range;
	  d3_time.years.utc = d3_time.year.utc.range;
	  d3_time.day = d3_time_interval(function(date) {
	    var day = new d3_date(2e3, 0);
	    day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
	    return day;
	  }, function(date, offset) {
	    date.setDate(date.getDate() + offset);
	  }, function(date) {
	    return date.getDate() - 1;
	  });
	  d3_time.days = d3_time.day.range;
	  d3_time.days.utc = d3_time.day.utc.range;
	  d3_time.dayOfYear = function(date) {
	    var year = d3_time.year(date);
	    return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 6e4) / 864e5);
	  };
	  [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ].forEach(function(day, i) {
	    i = 7 - i;
	    var interval = d3_time[day] = d3_time_interval(function(date) {
	      (date = d3_time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
	      return date;
	    }, function(date, offset) {
	      date.setDate(date.getDate() + Math.floor(offset) * 7);
	    }, function(date) {
	      var day = d3_time.year(date).getDay();
	      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
	    });
	    d3_time[day + "s"] = interval.range;
	    d3_time[day + "s"].utc = interval.utc.range;
	    d3_time[day + "OfYear"] = function(date) {
	      var day = d3_time.year(date).getDay();
	      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7);
	    };
	  });
	  d3_time.week = d3_time.sunday;
	  d3_time.weeks = d3_time.sunday.range;
	  d3_time.weeks.utc = d3_time.sunday.utc.range;
	  d3_time.weekOfYear = d3_time.sundayOfYear;
	  function d3_locale_timeFormat(locale) {
	    var locale_dateTime = locale.dateTime, locale_date = locale.date, locale_time = locale.time, locale_periods = locale.periods, locale_days = locale.days, locale_shortDays = locale.shortDays, locale_months = locale.months, locale_shortMonths = locale.shortMonths;
	    function d3_time_format(template) {
	      var n = template.length;
	      function format(date) {
	        var string = [], i = -1, j = 0, c, p, f;
	        while (++i < n) {
	          if (template.charCodeAt(i) === 37) {
	            string.push(template.slice(j, i));
	            if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null) c = template.charAt(++i);
	            if (f = d3_time_formats[c]) c = f(date, p == null ? c === "e" ? " " : "0" : p);
	            string.push(c);
	            j = i + 1;
	          }
	        }
	        string.push(template.slice(j, i));
	        return string.join("");
	      }
	      format.parse = function(string) {
	        var d = {
	          y: 1900,
	          m: 0,
	          d: 1,
	          H: 0,
	          M: 0,
	          S: 0,
	          L: 0,
	          Z: null
	        }, i = d3_time_parse(d, template, string, 0);
	        if (i != string.length) return null;
	        if ("p" in d) d.H = d.H % 12 + d.p * 12;
	        var localZ = d.Z != null && d3_date !== d3_date_utc, date = new (localZ ? d3_date_utc : d3_date)();
	        if ("j" in d) date.setFullYear(d.y, 0, d.j); else if ("W" in d || "U" in d) {
	          if (!("w" in d)) d.w = "W" in d ? 1 : 0;
	          date.setFullYear(d.y, 0, 1);
	          date.setFullYear(d.y, 0, "W" in d ? (d.w + 6) % 7 + d.W * 7 - (date.getDay() + 5) % 7 : d.w + d.U * 7 - (date.getDay() + 6) % 7);
	        } else date.setFullYear(d.y, d.m, d.d);
	        date.setHours(d.H + (d.Z / 100 | 0), d.M + d.Z % 100, d.S, d.L);
	        return localZ ? date._ : date;
	      };
	      format.toString = function() {
	        return template;
	      };
	      return format;
	    }
	    function d3_time_parse(date, template, string, j) {
	      var c, p, t, i = 0, n = template.length, m = string.length;
	      while (i < n) {
	        if (j >= m) return -1;
	        c = template.charCodeAt(i++);
	        if (c === 37) {
	          t = template.charAt(i++);
	          p = d3_time_parsers[t in d3_time_formatPads ? template.charAt(i++) : t];
	          if (!p || (j = p(date, string, j)) < 0) return -1;
	        } else if (c != string.charCodeAt(j++)) {
	          return -1;
	        }
	      }
	      return j;
	    }
	    d3_time_format.utc = function(template) {
	      var local = d3_time_format(template);
	      function format(date) {
	        try {
	          d3_date = d3_date_utc;
	          var utc = new d3_date();
	          utc._ = date;
	          return local(utc);
	        } finally {
	          d3_date = Date;
	        }
	      }
	      format.parse = function(string) {
	        try {
	          d3_date = d3_date_utc;
	          var date = local.parse(string);
	          return date && date._;
	        } finally {
	          d3_date = Date;
	        }
	      };
	      format.toString = local.toString;
	      return format;
	    };
	    d3_time_format.multi = d3_time_format.utc.multi = d3_time_formatMulti;
	    var d3_time_periodLookup = d3.map(), d3_time_dayRe = d3_time_formatRe(locale_days), d3_time_dayLookup = d3_time_formatLookup(locale_days), d3_time_dayAbbrevRe = d3_time_formatRe(locale_shortDays), d3_time_dayAbbrevLookup = d3_time_formatLookup(locale_shortDays), d3_time_monthRe = d3_time_formatRe(locale_months), d3_time_monthLookup = d3_time_formatLookup(locale_months), d3_time_monthAbbrevRe = d3_time_formatRe(locale_shortMonths), d3_time_monthAbbrevLookup = d3_time_formatLookup(locale_shortMonths);
	    locale_periods.forEach(function(p, i) {
	      d3_time_periodLookup.set(p.toLowerCase(), i);
	    });
	    var d3_time_formats = {
	      a: function(d) {
	        return locale_shortDays[d.getDay()];
	      },
	      A: function(d) {
	        return locale_days[d.getDay()];
	      },
	      b: function(d) {
	        return locale_shortMonths[d.getMonth()];
	      },
	      B: function(d) {
	        return locale_months[d.getMonth()];
	      },
	      c: d3_time_format(locale_dateTime),
	      d: function(d, p) {
	        return d3_time_formatPad(d.getDate(), p, 2);
	      },
	      e: function(d, p) {
	        return d3_time_formatPad(d.getDate(), p, 2);
	      },
	      H: function(d, p) {
	        return d3_time_formatPad(d.getHours(), p, 2);
	      },
	      I: function(d, p) {
	        return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
	      },
	      j: function(d, p) {
	        return d3_time_formatPad(1 + d3_time.dayOfYear(d), p, 3);
	      },
	      L: function(d, p) {
	        return d3_time_formatPad(d.getMilliseconds(), p, 3);
	      },
	      m: function(d, p) {
	        return d3_time_formatPad(d.getMonth() + 1, p, 2);
	      },
	      M: function(d, p) {
	        return d3_time_formatPad(d.getMinutes(), p, 2);
	      },
	      p: function(d) {
	        return locale_periods[+(d.getHours() >= 12)];
	      },
	      S: function(d, p) {
	        return d3_time_formatPad(d.getSeconds(), p, 2);
	      },
	      U: function(d, p) {
	        return d3_time_formatPad(d3_time.sundayOfYear(d), p, 2);
	      },
	      w: function(d) {
	        return d.getDay();
	      },
	      W: function(d, p) {
	        return d3_time_formatPad(d3_time.mondayOfYear(d), p, 2);
	      },
	      x: d3_time_format(locale_date),
	      X: d3_time_format(locale_time),
	      y: function(d, p) {
	        return d3_time_formatPad(d.getFullYear() % 100, p, 2);
	      },
	      Y: function(d, p) {
	        return d3_time_formatPad(d.getFullYear() % 1e4, p, 4);
	      },
	      Z: d3_time_zone,
	      "%": function() {
	        return "%";
	      }
	    };
	    var d3_time_parsers = {
	      a: d3_time_parseWeekdayAbbrev,
	      A: d3_time_parseWeekday,
	      b: d3_time_parseMonthAbbrev,
	      B: d3_time_parseMonth,
	      c: d3_time_parseLocaleFull,
	      d: d3_time_parseDay,
	      e: d3_time_parseDay,
	      H: d3_time_parseHour24,
	      I: d3_time_parseHour24,
	      j: d3_time_parseDayOfYear,
	      L: d3_time_parseMilliseconds,
	      m: d3_time_parseMonthNumber,
	      M: d3_time_parseMinutes,
	      p: d3_time_parseAmPm,
	      S: d3_time_parseSeconds,
	      U: d3_time_parseWeekNumberSunday,
	      w: d3_time_parseWeekdayNumber,
	      W: d3_time_parseWeekNumberMonday,
	      x: d3_time_parseLocaleDate,
	      X: d3_time_parseLocaleTime,
	      y: d3_time_parseYear,
	      Y: d3_time_parseFullYear,
	      Z: d3_time_parseZone,
	      "%": d3_time_parseLiteralPercent
	    };
	    function d3_time_parseWeekdayAbbrev(date, string, i) {
	      d3_time_dayAbbrevRe.lastIndex = 0;
	      var n = d3_time_dayAbbrevRe.exec(string.slice(i));
	      return n ? (date.w = d3_time_dayAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	    }
	    function d3_time_parseWeekday(date, string, i) {
	      d3_time_dayRe.lastIndex = 0;
	      var n = d3_time_dayRe.exec(string.slice(i));
	      return n ? (date.w = d3_time_dayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	    }
	    function d3_time_parseMonthAbbrev(date, string, i) {
	      d3_time_monthAbbrevRe.lastIndex = 0;
	      var n = d3_time_monthAbbrevRe.exec(string.slice(i));
	      return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	    }
	    function d3_time_parseMonth(date, string, i) {
	      d3_time_monthRe.lastIndex = 0;
	      var n = d3_time_monthRe.exec(string.slice(i));
	      return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	    }
	    function d3_time_parseLocaleFull(date, string, i) {
	      return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
	    }
	    function d3_time_parseLocaleDate(date, string, i) {
	      return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
	    }
	    function d3_time_parseLocaleTime(date, string, i) {
	      return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
	    }
	    function d3_time_parseAmPm(date, string, i) {
	      var n = d3_time_periodLookup.get(string.slice(i, i += 2).toLowerCase());
	      return n == null ? -1 : (date.p = n, i);
	    }
	    return d3_time_format;
	  }
	  var d3_time_formatPads = {
	    "-": "",
	    _: " ",
	    "0": "0"
	  }, d3_time_numberRe = /^\s*\d+/, d3_time_percentRe = /^%/;
	  function d3_time_formatPad(value, fill, width) {
	    var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
	    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
	  }
	  function d3_time_formatRe(names) {
	    return new RegExp("^(?:" + names.map(d3.requote).join("|") + ")", "i");
	  }
	  function d3_time_formatLookup(names) {
	    var map = new d3_Map(), i = -1, n = names.length;
	    while (++i < n) map.set(names[i].toLowerCase(), i);
	    return map;
	  }
	  function d3_time_parseWeekdayNumber(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 1));
	    return n ? (date.w = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseWeekNumberSunday(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i));
	    return n ? (date.U = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseWeekNumberMonday(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i));
	    return n ? (date.W = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseFullYear(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 4));
	    return n ? (date.y = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseYear(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.y = d3_time_expandYear(+n[0]), i + n[0].length) : -1;
	  }
	  function d3_time_parseZone(date, string, i) {
	    return /^[+-]\d{4}$/.test(string = string.slice(i, i + 5)) ? (date.Z = -string, 
	    i + 5) : -1;
	  }
	  function d3_time_expandYear(d) {
	    return d + (d > 68 ? 1900 : 2e3);
	  }
	  function d3_time_parseMonthNumber(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.m = n[0] - 1, i + n[0].length) : -1;
	  }
	  function d3_time_parseDay(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.d = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseDayOfYear(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 3));
	    return n ? (date.j = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseHour24(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.H = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseMinutes(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.M = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseSeconds(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.S = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseMilliseconds(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 3));
	    return n ? (date.L = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_zone(d) {
	    var z = d.getTimezoneOffset(), zs = z > 0 ? "-" : "+", zh = abs(z) / 60 | 0, zm = abs(z) % 60;
	    return zs + d3_time_formatPad(zh, "0", 2) + d3_time_formatPad(zm, "0", 2);
	  }
	  function d3_time_parseLiteralPercent(date, string, i) {
	    d3_time_percentRe.lastIndex = 0;
	    var n = d3_time_percentRe.exec(string.slice(i, i + 1));
	    return n ? i + n[0].length : -1;
	  }
	  function d3_time_formatMulti(formats) {
	    var n = formats.length, i = -1;
	    while (++i < n) formats[i][0] = this(formats[i][0]);
	    return function(date) {
	      var i = 0, f = formats[i];
	      while (!f[1](date)) f = formats[++i];
	      return f[0](date);
	    };
	  }
	  d3.locale = function(locale) {
	    return {
	      numberFormat: d3_locale_numberFormat(locale),
	      timeFormat: d3_locale_timeFormat(locale)
	    };
	  };
	  var d3_locale_enUS = d3.locale({
	    decimal: ".",
	    thousands: ",",
	    grouping: [ 3 ],
	    currency: [ "$", "" ],
	    dateTime: "%a %b %e %X %Y",
	    date: "%m/%d/%Y",
	    time: "%H:%M:%S",
	    periods: [ "AM", "PM" ],
	    days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
	    shortDays: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
	    months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
	    shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
	  });
	  d3.format = d3_locale_enUS.numberFormat;
	  d3.geo = {};
	  function d3_adder() {}
	  d3_adder.prototype = {
	    s: 0,
	    t: 0,
	    add: function(y) {
	      d3_adderSum(y, this.t, d3_adderTemp);
	      d3_adderSum(d3_adderTemp.s, this.s, this);
	      if (this.s) this.t += d3_adderTemp.t; else this.s = d3_adderTemp.t;
	    },
	    reset: function() {
	      this.s = this.t = 0;
	    },
	    valueOf: function() {
	      return this.s;
	    }
	  };
	  var d3_adderTemp = new d3_adder();
	  function d3_adderSum(a, b, o) {
	    var x = o.s = a + b, bv = x - a, av = x - bv;
	    o.t = a - av + (b - bv);
	  }
	  d3.geo.stream = function(object, listener) {
	    if (object && d3_geo_streamObjectType.hasOwnProperty(object.type)) {
	      d3_geo_streamObjectType[object.type](object, listener);
	    } else {
	      d3_geo_streamGeometry(object, listener);
	    }
	  };
	  function d3_geo_streamGeometry(geometry, listener) {
	    if (geometry && d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
	      d3_geo_streamGeometryType[geometry.type](geometry, listener);
	    }
	  }
	  var d3_geo_streamObjectType = {
	    Feature: function(feature, listener) {
	      d3_geo_streamGeometry(feature.geometry, listener);
	    },
	    FeatureCollection: function(object, listener) {
	      var features = object.features, i = -1, n = features.length;
	      while (++i < n) d3_geo_streamGeometry(features[i].geometry, listener);
	    }
	  };
	  var d3_geo_streamGeometryType = {
	    Sphere: function(object, listener) {
	      listener.sphere();
	    },
	    Point: function(object, listener) {
	      object = object.coordinates;
	      listener.point(object[0], object[1], object[2]);
	    },
	    MultiPoint: function(object, listener) {
	      var coordinates = object.coordinates, i = -1, n = coordinates.length;
	      while (++i < n) object = coordinates[i], listener.point(object[0], object[1], object[2]);
	    },
	    LineString: function(object, listener) {
	      d3_geo_streamLine(object.coordinates, listener, 0);
	    },
	    MultiLineString: function(object, listener) {
	      var coordinates = object.coordinates, i = -1, n = coordinates.length;
	      while (++i < n) d3_geo_streamLine(coordinates[i], listener, 0);
	    },
	    Polygon: function(object, listener) {
	      d3_geo_streamPolygon(object.coordinates, listener);
	    },
	    MultiPolygon: function(object, listener) {
	      var coordinates = object.coordinates, i = -1, n = coordinates.length;
	      while (++i < n) d3_geo_streamPolygon(coordinates[i], listener);
	    },
	    GeometryCollection: function(object, listener) {
	      var geometries = object.geometries, i = -1, n = geometries.length;
	      while (++i < n) d3_geo_streamGeometry(geometries[i], listener);
	    }
	  };
	  function d3_geo_streamLine(coordinates, listener, closed) {
	    var i = -1, n = coordinates.length - closed, coordinate;
	    listener.lineStart();
	    while (++i < n) coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1], coordinate[2]);
	    listener.lineEnd();
	  }
	  function d3_geo_streamPolygon(coordinates, listener) {
	    var i = -1, n = coordinates.length;
	    listener.polygonStart();
	    while (++i < n) d3_geo_streamLine(coordinates[i], listener, 1);
	    listener.polygonEnd();
	  }
	  d3.geo.area = function(object) {
	    d3_geo_areaSum = 0;
	    d3.geo.stream(object, d3_geo_area);
	    return d3_geo_areaSum;
	  };
	  var d3_geo_areaSum, d3_geo_areaRingSum = new d3_adder();
	  var d3_geo_area = {
	    sphere: function() {
	      d3_geo_areaSum += 4 * π;
	    },
	    point: d3_noop,
	    lineStart: d3_noop,
	    lineEnd: d3_noop,
	    polygonStart: function() {
	      d3_geo_areaRingSum.reset();
	      d3_geo_area.lineStart = d3_geo_areaRingStart;
	    },
	    polygonEnd: function() {
	      var area = 2 * d3_geo_areaRingSum;
	      d3_geo_areaSum += area < 0 ? 4 * π + area : area;
	      d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
	    }
	  };
	  function d3_geo_areaRingStart() {
	    var λ00, φ00, λ0, cosφ0, sinφ0;
	    d3_geo_area.point = function(λ, φ) {
	      d3_geo_area.point = nextPoint;
	      λ0 = (λ00 = λ) * d3_radians, cosφ0 = Math.cos(φ = (φ00 = φ) * d3_radians / 2 + π / 4), 
	      sinφ0 = Math.sin(φ);
	    };
	    function nextPoint(λ, φ) {
	      λ *= d3_radians;
	      φ = φ * d3_radians / 2 + π / 4;
	      var dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, cosφ = Math.cos(φ), sinφ = Math.sin(φ), k = sinφ0 * sinφ, u = cosφ0 * cosφ + k * Math.cos(adλ), v = k * sdλ * Math.sin(adλ);
	      d3_geo_areaRingSum.add(Math.atan2(v, u));
	      λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
	    }
	    d3_geo_area.lineEnd = function() {
	      nextPoint(λ00, φ00);
	    };
	  }
	  function d3_geo_cartesian(spherical) {
	    var λ = spherical[0], φ = spherical[1], cosφ = Math.cos(φ);
	    return [ cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ) ];
	  }
	  function d3_geo_cartesianDot(a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	  }
	  function d3_geo_cartesianCross(a, b) {
	    return [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] ];
	  }
	  function d3_geo_cartesianAdd(a, b) {
	    a[0] += b[0];
	    a[1] += b[1];
	    a[2] += b[2];
	  }
	  function d3_geo_cartesianScale(vector, k) {
	    return [ vector[0] * k, vector[1] * k, vector[2] * k ];
	  }
	  function d3_geo_cartesianNormalize(d) {
	    var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
	    d[0] /= l;
	    d[1] /= l;
	    d[2] /= l;
	  }
	  function d3_geo_spherical(cartesian) {
	    return [ Math.atan2(cartesian[1], cartesian[0]), d3_asin(cartesian[2]) ];
	  }
	  function d3_geo_sphericalEqual(a, b) {
	    return abs(a[0] - b[0]) < ε && abs(a[1] - b[1]) < ε;
	  }
	  d3.geo.bounds = function() {
	    var λ0, φ0, λ1, φ1, λ_, λ__, φ__, p0, dλSum, ranges, range;
	    var bound = {
	      point: point,
	      lineStart: lineStart,
	      lineEnd: lineEnd,
	      polygonStart: function() {
	        bound.point = ringPoint;
	        bound.lineStart = ringStart;
	        bound.lineEnd = ringEnd;
	        dλSum = 0;
	        d3_geo_area.polygonStart();
	      },
	      polygonEnd: function() {
	        d3_geo_area.polygonEnd();
	        bound.point = point;
	        bound.lineStart = lineStart;
	        bound.lineEnd = lineEnd;
	        if (d3_geo_areaRingSum < 0) λ0 = -(λ1 = 180), φ0 = -(φ1 = 90); else if (dλSum > ε) φ1 = 90; else if (dλSum < -ε) φ0 = -90;
	        range[0] = λ0, range[1] = λ1;
	      }
	    };
	    function point(λ, φ) {
	      ranges.push(range = [ λ0 = λ, λ1 = λ ]);
	      if (φ < φ0) φ0 = φ;
	      if (φ > φ1) φ1 = φ;
	    }
	    function linePoint(λ, φ) {
	      var p = d3_geo_cartesian([ λ * d3_radians, φ * d3_radians ]);
	      if (p0) {
	        var normal = d3_geo_cartesianCross(p0, p), equatorial = [ normal[1], -normal[0], 0 ], inflection = d3_geo_cartesianCross(equatorial, normal);
	        d3_geo_cartesianNormalize(inflection);
	        inflection = d3_geo_spherical(inflection);
	        var dλ = λ - λ_, s = dλ > 0 ? 1 : -1, λi = inflection[0] * d3_degrees * s, antimeridian = abs(dλ) > 180;
	        if (antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
	          var φi = inflection[1] * d3_degrees;
	          if (φi > φ1) φ1 = φi;
	        } else if (λi = (λi + 360) % 360 - 180, antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
	          var φi = -inflection[1] * d3_degrees;
	          if (φi < φ0) φ0 = φi;
	        } else {
	          if (φ < φ0) φ0 = φ;
	          if (φ > φ1) φ1 = φ;
	        }
	        if (antimeridian) {
	          if (λ < λ_) {
	            if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
	          } else {
	            if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
	          }
	        } else {
	          if (λ1 >= λ0) {
	            if (λ < λ0) λ0 = λ;
	            if (λ > λ1) λ1 = λ;
	          } else {
	            if (λ > λ_) {
	              if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
	            } else {
	              if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
	            }
	          }
	        }
	      } else {
	        point(λ, φ);
	      }
	      p0 = p, λ_ = λ;
	    }
	    function lineStart() {
	      bound.point = linePoint;
	    }
	    function lineEnd() {
	      range[0] = λ0, range[1] = λ1;
	      bound.point = point;
	      p0 = null;
	    }
	    function ringPoint(λ, φ) {
	      if (p0) {
	        var dλ = λ - λ_;
	        dλSum += abs(dλ) > 180 ? dλ + (dλ > 0 ? 360 : -360) : dλ;
	      } else λ__ = λ, φ__ = φ;
	      d3_geo_area.point(λ, φ);
	      linePoint(λ, φ);
	    }
	    function ringStart() {
	      d3_geo_area.lineStart();
	    }
	    function ringEnd() {
	      ringPoint(λ__, φ__);
	      d3_geo_area.lineEnd();
	      if (abs(dλSum) > ε) λ0 = -(λ1 = 180);
	      range[0] = λ0, range[1] = λ1;
	      p0 = null;
	    }
	    function angle(λ0, λ1) {
	      return (λ1 -= λ0) < 0 ? λ1 + 360 : λ1;
	    }
	    function compareRanges(a, b) {
	      return a[0] - b[0];
	    }
	    function withinRange(x, range) {
	      return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
	    }
	    return function(feature) {
	      φ1 = λ1 = -(λ0 = φ0 = Infinity);
	      ranges = [];
	      d3.geo.stream(feature, bound);
	      var n = ranges.length;
	      if (n) {
	        ranges.sort(compareRanges);
	        for (var i = 1, a = ranges[0], b, merged = [ a ]; i < n; ++i) {
	          b = ranges[i];
	          if (withinRange(b[0], a) || withinRange(b[1], a)) {
	            if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
	            if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
	          } else {
	            merged.push(a = b);
	          }
	        }
	        var best = -Infinity, dλ;
	        for (var n = merged.length - 1, i = 0, a = merged[n], b; i <= n; a = b, ++i) {
	          b = merged[i];
	          if ((dλ = angle(a[1], b[0])) > best) best = dλ, λ0 = b[0], λ1 = a[1];
	        }
	      }
	      ranges = range = null;
	      return λ0 === Infinity || φ0 === Infinity ? [ [ NaN, NaN ], [ NaN, NaN ] ] : [ [ λ0, φ0 ], [ λ1, φ1 ] ];
	    };
	  }();
	  d3.geo.centroid = function(object) {
	    d3_geo_centroidW0 = d3_geo_centroidW1 = d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
	    d3.geo.stream(object, d3_geo_centroid);
	    var x = d3_geo_centroidX2, y = d3_geo_centroidY2, z = d3_geo_centroidZ2, m = x * x + y * y + z * z;
	    if (m < ε2) {
	      x = d3_geo_centroidX1, y = d3_geo_centroidY1, z = d3_geo_centroidZ1;
	      if (d3_geo_centroidW1 < ε) x = d3_geo_centroidX0, y = d3_geo_centroidY0, z = d3_geo_centroidZ0;
	      m = x * x + y * y + z * z;
	      if (m < ε2) return [ NaN, NaN ];
	    }
	    return [ Math.atan2(y, x) * d3_degrees, d3_asin(z / Math.sqrt(m)) * d3_degrees ];
	  };
	  var d3_geo_centroidW0, d3_geo_centroidW1, d3_geo_centroidX0, d3_geo_centroidY0, d3_geo_centroidZ0, d3_geo_centroidX1, d3_geo_centroidY1, d3_geo_centroidZ1, d3_geo_centroidX2, d3_geo_centroidY2, d3_geo_centroidZ2;
	  var d3_geo_centroid = {
	    sphere: d3_noop,
	    point: d3_geo_centroidPoint,
	    lineStart: d3_geo_centroidLineStart,
	    lineEnd: d3_geo_centroidLineEnd,
	    polygonStart: function() {
	      d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
	    },
	    polygonEnd: function() {
	      d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
	    }
	  };
	  function d3_geo_centroidPoint(λ, φ) {
	    λ *= d3_radians;
	    var cosφ = Math.cos(φ *= d3_radians);
	    d3_geo_centroidPointXYZ(cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ));
	  }
	  function d3_geo_centroidPointXYZ(x, y, z) {
	    ++d3_geo_centroidW0;
	    d3_geo_centroidX0 += (x - d3_geo_centroidX0) / d3_geo_centroidW0;
	    d3_geo_centroidY0 += (y - d3_geo_centroidY0) / d3_geo_centroidW0;
	    d3_geo_centroidZ0 += (z - d3_geo_centroidZ0) / d3_geo_centroidW0;
	  }
	  function d3_geo_centroidLineStart() {
	    var x0, y0, z0;
	    d3_geo_centroid.point = function(λ, φ) {
	      λ *= d3_radians;
	      var cosφ = Math.cos(φ *= d3_radians);
	      x0 = cosφ * Math.cos(λ);
	      y0 = cosφ * Math.sin(λ);
	      z0 = Math.sin(φ);
	      d3_geo_centroid.point = nextPoint;
	      d3_geo_centroidPointXYZ(x0, y0, z0);
	    };
	    function nextPoint(λ, φ) {
	      λ *= d3_radians;
	      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
	      d3_geo_centroidW1 += w;
	      d3_geo_centroidX1 += w * (x0 + (x0 = x));
	      d3_geo_centroidY1 += w * (y0 + (y0 = y));
	      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
	      d3_geo_centroidPointXYZ(x0, y0, z0);
	    }
	  }
	  function d3_geo_centroidLineEnd() {
	    d3_geo_centroid.point = d3_geo_centroidPoint;
	  }
	  function d3_geo_centroidRingStart() {
	    var λ00, φ00, x0, y0, z0;
	    d3_geo_centroid.point = function(λ, φ) {
	      λ00 = λ, φ00 = φ;
	      d3_geo_centroid.point = nextPoint;
	      λ *= d3_radians;
	      var cosφ = Math.cos(φ *= d3_radians);
	      x0 = cosφ * Math.cos(λ);
	      y0 = cosφ * Math.sin(λ);
	      z0 = Math.sin(φ);
	      d3_geo_centroidPointXYZ(x0, y0, z0);
	    };
	    d3_geo_centroid.lineEnd = function() {
	      nextPoint(λ00, φ00);
	      d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
	      d3_geo_centroid.point = d3_geo_centroidPoint;
	    };
	    function nextPoint(λ, φ) {
	      λ *= d3_radians;
	      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x, m = Math.sqrt(cx * cx + cy * cy + cz * cz), u = x0 * x + y0 * y + z0 * z, v = m && -d3_acos(u) / m, w = Math.atan2(m, u);
	      d3_geo_centroidX2 += v * cx;
	      d3_geo_centroidY2 += v * cy;
	      d3_geo_centroidZ2 += v * cz;
	      d3_geo_centroidW1 += w;
	      d3_geo_centroidX1 += w * (x0 + (x0 = x));
	      d3_geo_centroidY1 += w * (y0 + (y0 = y));
	      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
	      d3_geo_centroidPointXYZ(x0, y0, z0);
	    }
	  }
	  function d3_geo_compose(a, b) {
	    function compose(x, y) {
	      return x = a(x, y), b(x[0], x[1]);
	    }
	    if (a.invert && b.invert) compose.invert = function(x, y) {
	      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
	    };
	    return compose;
	  }
	  function d3_true() {
	    return true;
	  }
	  function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
	    var subject = [], clip = [];
	    segments.forEach(function(segment) {
	      if ((n = segment.length - 1) <= 0) return;
	      var n, p0 = segment[0], p1 = segment[n];
	      if (d3_geo_sphericalEqual(p0, p1)) {
	        listener.lineStart();
	        for (var i = 0; i < n; ++i) listener.point((p0 = segment[i])[0], p0[1]);
	        listener.lineEnd();
	        return;
	      }
	      var a = new d3_geo_clipPolygonIntersection(p0, segment, null, true), b = new d3_geo_clipPolygonIntersection(p0, null, a, false);
	      a.o = b;
	      subject.push(a);
	      clip.push(b);
	      a = new d3_geo_clipPolygonIntersection(p1, segment, null, false);
	      b = new d3_geo_clipPolygonIntersection(p1, null, a, true);
	      a.o = b;
	      subject.push(a);
	      clip.push(b);
	    });
	    clip.sort(compare);
	    d3_geo_clipPolygonLinkCircular(subject);
	    d3_geo_clipPolygonLinkCircular(clip);
	    if (!subject.length) return;
	    for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
	      clip[i].e = entry = !entry;
	    }
	    var start = subject[0], points, point;
	    while (1) {
	      var current = start, isSubject = true;
	      while (current.v) if ((current = current.n) === start) return;
	      points = current.z;
	      listener.lineStart();
	      do {
	        current.v = current.o.v = true;
	        if (current.e) {
	          if (isSubject) {
	            for (var i = 0, n = points.length; i < n; ++i) listener.point((point = points[i])[0], point[1]);
	          } else {
	            interpolate(current.x, current.n.x, 1, listener);
	          }
	          current = current.n;
	        } else {
	          if (isSubject) {
	            points = current.p.z;
	            for (var i = points.length - 1; i >= 0; --i) listener.point((point = points[i])[0], point[1]);
	          } else {
	            interpolate(current.x, current.p.x, -1, listener);
	          }
	          current = current.p;
	        }
	        current = current.o;
	        points = current.z;
	        isSubject = !isSubject;
	      } while (!current.v);
	      listener.lineEnd();
	    }
	  }
	  function d3_geo_clipPolygonLinkCircular(array) {
	    if (!(n = array.length)) return;
	    var n, i = 0, a = array[0], b;
	    while (++i < n) {
	      a.n = b = array[i];
	      b.p = a;
	      a = b;
	    }
	    a.n = b = array[0];
	    b.p = a;
	  }
	  function d3_geo_clipPolygonIntersection(point, points, other, entry) {
	    this.x = point;
	    this.z = points;
	    this.o = other;
	    this.e = entry;
	    this.v = false;
	    this.n = this.p = null;
	  }
	  function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
	    return function(rotate, listener) {
	      var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
	      var clip = {
	        point: point,
	        lineStart: lineStart,
	        lineEnd: lineEnd,
	        polygonStart: function() {
	          clip.point = pointRing;
	          clip.lineStart = ringStart;
	          clip.lineEnd = ringEnd;
	          segments = [];
	          polygon = [];
	        },
	        polygonEnd: function() {
	          clip.point = point;
	          clip.lineStart = lineStart;
	          clip.lineEnd = lineEnd;
	          segments = d3.merge(segments);
	          var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
	          if (segments.length) {
	            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
	            d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
	          } else if (clipStartInside) {
	            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
	            listener.lineStart();
	            interpolate(null, null, 1, listener);
	            listener.lineEnd();
	          }
	          if (polygonStarted) listener.polygonEnd(), polygonStarted = false;
	          segments = polygon = null;
	        },
	        sphere: function() {
	          listener.polygonStart();
	          listener.lineStart();
	          interpolate(null, null, 1, listener);
	          listener.lineEnd();
	          listener.polygonEnd();
	        }
	      };
	      function point(λ, φ) {
	        var point = rotate(λ, φ);
	        if (pointVisible(λ = point[0], φ = point[1])) listener.point(λ, φ);
	      }
	      function pointLine(λ, φ) {
	        var point = rotate(λ, φ);
	        line.point(point[0], point[1]);
	      }
	      function lineStart() {
	        clip.point = pointLine;
	        line.lineStart();
	      }
	      function lineEnd() {
	        clip.point = point;
	        line.lineEnd();
	      }
	      var segments;
	      var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygonStarted = false, polygon, ring;
	      function pointRing(λ, φ) {
	        ring.push([ λ, φ ]);
	        var point = rotate(λ, φ);
	        ringListener.point(point[0], point[1]);
	      }
	      function ringStart() {
	        ringListener.lineStart();
	        ring = [];
	      }
	      function ringEnd() {
	        pointRing(ring[0][0], ring[0][1]);
	        ringListener.lineEnd();
	        var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
	        ring.pop();
	        polygon.push(ring);
	        ring = null;
	        if (!n) return;
	        if (clean & 1) {
	          segment = ringSegments[0];
	          var n = segment.length - 1, i = -1, point;
	          if (n > 0) {
	            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
	            listener.lineStart();
	            while (++i < n) listener.point((point = segment[i])[0], point[1]);
	            listener.lineEnd();
	          }
	          return;
	        }
	        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
	        segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
	      }
	      return clip;
	    };
	  }
	  function d3_geo_clipSegmentLength1(segment) {
	    return segment.length > 1;
	  }
	  function d3_geo_clipBufferListener() {
	    var lines = [], line;
	    return {
	      lineStart: function() {
	        lines.push(line = []);
	      },
	      point: function(λ, φ) {
	        line.push([ λ, φ ]);
	      },
	      lineEnd: d3_noop,
	      buffer: function() {
	        var buffer = lines;
	        lines = [];
	        line = null;
	        return buffer;
	      },
	      rejoin: function() {
	        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
	      }
	    };
	  }
	  function d3_geo_clipSort(a, b) {
	    return ((a = a.x)[0] < 0 ? a[1] - halfπ - ε : halfπ - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfπ - ε : halfπ - b[1]);
	  }
	  var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate, [ -π, -π / 2 ]);
	  function d3_geo_clipAntimeridianLine(listener) {
	    var λ0 = NaN, φ0 = NaN, sλ0 = NaN, clean;
	    return {
	      lineStart: function() {
	        listener.lineStart();
	        clean = 1;
	      },
	      point: function(λ1, φ1) {
	        var sλ1 = λ1 > 0 ? π : -π, dλ = abs(λ1 - λ0);
	        if (abs(dλ - π) < ε) {
	          listener.point(λ0, φ0 = (φ0 + φ1) / 2 > 0 ? halfπ : -halfπ);
	          listener.point(sλ0, φ0);
	          listener.lineEnd();
	          listener.lineStart();
	          listener.point(sλ1, φ0);
	          listener.point(λ1, φ0);
	          clean = 0;
	        } else if (sλ0 !== sλ1 && dλ >= π) {
	          if (abs(λ0 - sλ0) < ε) λ0 -= sλ0 * ε;
	          if (abs(λ1 - sλ1) < ε) λ1 -= sλ1 * ε;
	          φ0 = d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1);
	          listener.point(sλ0, φ0);
	          listener.lineEnd();
	          listener.lineStart();
	          listener.point(sλ1, φ0);
	          clean = 0;
	        }
	        listener.point(λ0 = λ1, φ0 = φ1);
	        sλ0 = sλ1;
	      },
	      lineEnd: function() {
	        listener.lineEnd();
	        λ0 = φ0 = NaN;
	      },
	      clean: function() {
	        return 2 - clean;
	      }
	    };
	  }
	  function d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1) {
	    var cosφ0, cosφ1, sinλ0_λ1 = Math.sin(λ0 - λ1);
	    return abs(sinλ0_λ1) > ε ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1) - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0)) / (cosφ0 * cosφ1 * sinλ0_λ1)) : (φ0 + φ1) / 2;
	  }
	  function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
	    var φ;
	    if (from == null) {
	      φ = direction * halfπ;
	      listener.point(-π, φ);
	      listener.point(0, φ);
	      listener.point(π, φ);
	      listener.point(π, 0);
	      listener.point(π, -φ);
	      listener.point(0, -φ);
	      listener.point(-π, -φ);
	      listener.point(-π, 0);
	      listener.point(-π, φ);
	    } else if (abs(from[0] - to[0]) > ε) {
	      var s = from[0] < to[0] ? π : -π;
	      φ = direction * s / 2;
	      listener.point(-s, φ);
	      listener.point(0, φ);
	      listener.point(s, φ);
	    } else {
	      listener.point(to[0], to[1]);
	    }
	  }
	  function d3_geo_pointInPolygon(point, polygon) {
	    var meridian = point[0], parallel = point[1], meridianNormal = [ Math.sin(meridian), -Math.cos(meridian), 0 ], polarAngle = 0, winding = 0;
	    d3_geo_areaRingSum.reset();
	    for (var i = 0, n = polygon.length; i < n; ++i) {
	      var ring = polygon[i], m = ring.length;
	      if (!m) continue;
	      var point0 = ring[0], λ0 = point0[0], φ0 = point0[1] / 2 + π / 4, sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), j = 1;
	      while (true) {
	        if (j === m) j = 0;
	        point = ring[j];
	        var λ = point[0], φ = point[1] / 2 + π / 4, sinφ = Math.sin(φ), cosφ = Math.cos(φ), dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, antimeridian = adλ > π, k = sinφ0 * sinφ;
	        d3_geo_areaRingSum.add(Math.atan2(k * sdλ * Math.sin(adλ), cosφ0 * cosφ + k * Math.cos(adλ)));
	        polarAngle += antimeridian ? dλ + sdλ * τ : dλ;
	        if (antimeridian ^ λ0 >= meridian ^ λ >= meridian) {
	          var arc = d3_geo_cartesianCross(d3_geo_cartesian(point0), d3_geo_cartesian(point));
	          d3_geo_cartesianNormalize(arc);
	          var intersection = d3_geo_cartesianCross(meridianNormal, arc);
	          d3_geo_cartesianNormalize(intersection);
	          var φarc = (antimeridian ^ dλ >= 0 ? -1 : 1) * d3_asin(intersection[2]);
	          if (parallel > φarc || parallel === φarc && (arc[0] || arc[1])) {
	            winding += antimeridian ^ dλ >= 0 ? 1 : -1;
	          }
	        }
	        if (!j++) break;
	        λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ, point0 = point;
	      }
	    }
	    return (polarAngle < -ε || polarAngle < ε && d3_geo_areaRingSum < 0) ^ winding & 1;
	  }
	  function d3_geo_clipCircle(radius) {
	    var cr = Math.cos(radius), smallRadius = cr > 0, notHemisphere = abs(cr) > ε, interpolate = d3_geo_circleInterpolate(radius, 6 * d3_radians);
	    return d3_geo_clip(visible, clipLine, interpolate, smallRadius ? [ 0, -radius ] : [ -π, radius - π ]);
	    function visible(λ, φ) {
	      return Math.cos(λ) * Math.cos(φ) > cr;
	    }
	    function clipLine(listener) {
	      var point0, c0, v0, v00, clean;
	      return {
	        lineStart: function() {
	          v00 = v0 = false;
	          clean = 1;
	        },
	        point: function(λ, φ) {
	          var point1 = [ λ, φ ], point2, v = visible(λ, φ), c = smallRadius ? v ? 0 : code(λ, φ) : v ? code(λ + (λ < 0 ? π : -π), φ) : 0;
	          if (!point0 && (v00 = v0 = v)) listener.lineStart();
	          if (v !== v0) {
	            point2 = intersect(point0, point1);
	            if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
	              point1[0] += ε;
	              point1[1] += ε;
	              v = visible(point1[0], point1[1]);
	            }
	          }
	          if (v !== v0) {
	            clean = 0;
	            if (v) {
	              listener.lineStart();
	              point2 = intersect(point1, point0);
	              listener.point(point2[0], point2[1]);
	            } else {
	              point2 = intersect(point0, point1);
	              listener.point(point2[0], point2[1]);
	              listener.lineEnd();
	            }
	            point0 = point2;
	          } else if (notHemisphere && point0 && smallRadius ^ v) {
	            var t;
	            if (!(c & c0) && (t = intersect(point1, point0, true))) {
	              clean = 0;
	              if (smallRadius) {
	                listener.lineStart();
	                listener.point(t[0][0], t[0][1]);
	                listener.point(t[1][0], t[1][1]);
	                listener.lineEnd();
	              } else {
	                listener.point(t[1][0], t[1][1]);
	                listener.lineEnd();
	                listener.lineStart();
	                listener.point(t[0][0], t[0][1]);
	              }
	            }
	          }
	          if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) {
	            listener.point(point1[0], point1[1]);
	          }
	          point0 = point1, v0 = v, c0 = c;
	        },
	        lineEnd: function() {
	          if (v0) listener.lineEnd();
	          point0 = null;
	        },
	        clean: function() {
	          return clean | (v00 && v0) << 1;
	        }
	      };
	    }
	    function intersect(a, b, two) {
	      var pa = d3_geo_cartesian(a), pb = d3_geo_cartesian(b);
	      var n1 = [ 1, 0, 0 ], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
	      if (!determinant) return !two && a;
	      var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1), B = d3_geo_cartesianScale(n2, c2);
	      d3_geo_cartesianAdd(A, B);
	      var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u), t2 = w * w - uu * (d3_geo_cartesianDot(A, A) - 1);
	      if (t2 < 0) return;
	      var t = Math.sqrt(t2), q = d3_geo_cartesianScale(u, (-w - t) / uu);
	      d3_geo_cartesianAdd(q, A);
	      q = d3_geo_spherical(q);
	      if (!two) return q;
	      var λ0 = a[0], λ1 = b[0], φ0 = a[1], φ1 = b[1], z;
	      if (λ1 < λ0) z = λ0, λ0 = λ1, λ1 = z;
	      var δλ = λ1 - λ0, polar = abs(δλ - π) < ε, meridian = polar || δλ < ε;
	      if (!polar && φ1 < φ0) z = φ0, φ0 = φ1, φ1 = z;
	      if (meridian ? polar ? φ0 + φ1 > 0 ^ q[1] < (abs(q[0] - λ0) < ε ? φ0 : φ1) : φ0 <= q[1] && q[1] <= φ1 : δλ > π ^ (λ0 <= q[0] && q[0] <= λ1)) {
	        var q1 = d3_geo_cartesianScale(u, (-w + t) / uu);
	        d3_geo_cartesianAdd(q1, A);
	        return [ q, d3_geo_spherical(q1) ];
	      }
	    }
	    function code(λ, φ) {
	      var r = smallRadius ? radius : π - radius, code = 0;
	      if (λ < -r) code |= 1; else if (λ > r) code |= 2;
	      if (φ < -r) code |= 4; else if (φ > r) code |= 8;
	      return code;
	    }
	  }
	  function d3_geom_clipLine(x0, y0, x1, y1) {
	    return function(line) {
	      var a = line.a, b = line.b, ax = a.x, ay = a.y, bx = b.x, by = b.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
	      r = x0 - ax;
	      if (!dx && r > 0) return;
	      r /= dx;
	      if (dx < 0) {
	        if (r < t0) return;
	        if (r < t1) t1 = r;
	      } else if (dx > 0) {
	        if (r > t1) return;
	        if (r > t0) t0 = r;
	      }
	      r = x1 - ax;
	      if (!dx && r < 0) return;
	      r /= dx;
	      if (dx < 0) {
	        if (r > t1) return;
	        if (r > t0) t0 = r;
	      } else if (dx > 0) {
	        if (r < t0) return;
	        if (r < t1) t1 = r;
	      }
	      r = y0 - ay;
	      if (!dy && r > 0) return;
	      r /= dy;
	      if (dy < 0) {
	        if (r < t0) return;
	        if (r < t1) t1 = r;
	      } else if (dy > 0) {
	        if (r > t1) return;
	        if (r > t0) t0 = r;
	      }
	      r = y1 - ay;
	      if (!dy && r < 0) return;
	      r /= dy;
	      if (dy < 0) {
	        if (r > t1) return;
	        if (r > t0) t0 = r;
	      } else if (dy > 0) {
	        if (r < t0) return;
	        if (r < t1) t1 = r;
	      }
	      if (t0 > 0) line.a = {
	        x: ax + t0 * dx,
	        y: ay + t0 * dy
	      };
	      if (t1 < 1) line.b = {
	        x: ax + t1 * dx,
	        y: ay + t1 * dy
	      };
	      return line;
	    };
	  }
	  var d3_geo_clipExtentMAX = 1e9;
	  d3.geo.clipExtent = function() {
	    var x0, y0, x1, y1, stream, clip, clipExtent = {
	      stream: function(output) {
	        if (stream) stream.valid = false;
	        stream = clip(output);
	        stream.valid = true;
	        return stream;
	      },
	      extent: function(_) {
	        if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
	        clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
	        if (stream) stream.valid = false, stream = null;
	        return clipExtent;
	      }
	    };
	    return clipExtent.extent([ [ 0, 0 ], [ 960, 500 ] ]);
	  };
	  function d3_geo_clipExtent(x0, y0, x1, y1) {
	    return function(listener) {
	      var listener_ = listener, bufferListener = d3_geo_clipBufferListener(), clipLine = d3_geom_clipLine(x0, y0, x1, y1), segments, polygon, ring;
	      var clip = {
	        point: point,
	        lineStart: lineStart,
	        lineEnd: lineEnd,
	        polygonStart: function() {
	          listener = bufferListener;
	          segments = [];
	          polygon = [];
	          clean = true;
	        },
	        polygonEnd: function() {
	          listener = listener_;
	          segments = d3.merge(segments);
	          var clipStartInside = insidePolygon([ x0, y1 ]), inside = clean && clipStartInside, visible = segments.length;
	          if (inside || visible) {
	            listener.polygonStart();
	            if (inside) {
	              listener.lineStart();
	              interpolate(null, null, 1, listener);
	              listener.lineEnd();
	            }
	            if (visible) {
	              d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
	            }
	            listener.polygonEnd();
	          }
	          segments = polygon = ring = null;
	        }
	      };
	      function insidePolygon(p) {
	        var wn = 0, n = polygon.length, y = p[1];
	        for (var i = 0; i < n; ++i) {
	          for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
	            b = v[j];
	            if (a[1] <= y) {
	              if (b[1] > y && d3_cross2d(a, b, p) > 0) ++wn;
	            } else {
	              if (b[1] <= y && d3_cross2d(a, b, p) < 0) --wn;
	            }
	            a = b;
	          }
	        }
	        return wn !== 0;
	      }
	      function interpolate(from, to, direction, listener) {
	        var a = 0, a1 = 0;
	        if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
	          do {
	            listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
	          } while ((a = (a + direction + 4) % 4) !== a1);
	        } else {
	          listener.point(to[0], to[1]);
	        }
	      }
	      function pointVisible(x, y) {
	        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
	      }
	      function point(x, y) {
	        if (pointVisible(x, y)) listener.point(x, y);
	      }
	      var x__, y__, v__, x_, y_, v_, first, clean;
	      function lineStart() {
	        clip.point = linePoint;
	        if (polygon) polygon.push(ring = []);
	        first = true;
	        v_ = false;
	        x_ = y_ = NaN;
	      }
	      function lineEnd() {
	        if (segments) {
	          linePoint(x__, y__);
	          if (v__ && v_) bufferListener.rejoin();
	          segments.push(bufferListener.buffer());
	        }
	        clip.point = point;
	        if (v_) listener.lineEnd();
	      }
	      function linePoint(x, y) {
	        x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
	        y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
	        var v = pointVisible(x, y);
	        if (polygon) ring.push([ x, y ]);
	        if (first) {
	          x__ = x, y__ = y, v__ = v;
	          first = false;
	          if (v) {
	            listener.lineStart();
	            listener.point(x, y);
	          }
	        } else {
	          if (v && v_) listener.point(x, y); else {
	            var l = {
	              a: {
	                x: x_,
	                y: y_
	              },
	              b: {
	                x: x,
	                y: y
	              }
	            };
	            if (clipLine(l)) {
	              if (!v_) {
	                listener.lineStart();
	                listener.point(l.a.x, l.a.y);
	              }
	              listener.point(l.b.x, l.b.y);
	              if (!v) listener.lineEnd();
	              clean = false;
	            } else if (v) {
	              listener.lineStart();
	              listener.point(x, y);
	              clean = false;
	            }
	          }
	        }
	        x_ = x, y_ = y, v_ = v;
	      }
	      return clip;
	    };
	    function corner(p, direction) {
	      return abs(p[0] - x0) < ε ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < ε ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < ε ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
	    }
	    function compare(a, b) {
	      return comparePoints(a.x, b.x);
	    }
	    function comparePoints(a, b) {
	      var ca = corner(a, 1), cb = corner(b, 1);
	      return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
	    }
	  }
	  function d3_geo_conic(projectAt) {
	    var φ0 = 0, φ1 = π / 3, m = d3_geo_projectionMutator(projectAt), p = m(φ0, φ1);
	    p.parallels = function(_) {
	      if (!arguments.length) return [ φ0 / π * 180, φ1 / π * 180 ];
	      return m(φ0 = _[0] * π / 180, φ1 = _[1] * π / 180);
	    };
	    return p;
	  }
	  function d3_geo_conicEqualArea(φ0, φ1) {
	    var sinφ0 = Math.sin(φ0), n = (sinφ0 + Math.sin(φ1)) / 2, C = 1 + sinφ0 * (2 * n - sinφ0), ρ0 = Math.sqrt(C) / n;
	    function forward(λ, φ) {
	      var ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
	      return [ ρ * Math.sin(λ *= n), ρ0 - ρ * Math.cos(λ) ];
	    }
	    forward.invert = function(x, y) {
	      var ρ0_y = ρ0 - y;
	      return [ Math.atan2(x, ρ0_y) / n, d3_asin((C - (x * x + ρ0_y * ρ0_y) * n * n) / (2 * n)) ];
	    };
	    return forward;
	  }
	  (d3.geo.conicEqualArea = function() {
	    return d3_geo_conic(d3_geo_conicEqualArea);
	  }).raw = d3_geo_conicEqualArea;
	  d3.geo.albers = function() {
	    return d3.geo.conicEqualArea().rotate([ 96, 0 ]).center([ -.6, 38.7 ]).parallels([ 29.5, 45.5 ]).scale(1070);
	  };
	  d3.geo.albersUsa = function() {
	    var lower48 = d3.geo.albers();
	    var alaska = d3.geo.conicEqualArea().rotate([ 154, 0 ]).center([ -2, 58.5 ]).parallels([ 55, 65 ]);
	    var hawaii = d3.geo.conicEqualArea().rotate([ 157, 0 ]).center([ -3, 19.9 ]).parallels([ 8, 18 ]);
	    var point, pointStream = {
	      point: function(x, y) {
	        point = [ x, y ];
	      }
	    }, lower48Point, alaskaPoint, hawaiiPoint;
	    function albersUsa(coordinates) {
	      var x = coordinates[0], y = coordinates[1];
	      point = null;
	      (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || hawaiiPoint(x, y);
	      return point;
	    }
	    albersUsa.invert = function(coordinates) {
	      var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
	      return (y >= .12 && y < .234 && x >= -.425 && x < -.214 ? alaska : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii : lower48).invert(coordinates);
	    };
	    albersUsa.stream = function(stream) {
	      var lower48Stream = lower48.stream(stream), alaskaStream = alaska.stream(stream), hawaiiStream = hawaii.stream(stream);
	      return {
	        point: function(x, y) {
	          lower48Stream.point(x, y);
	          alaskaStream.point(x, y);
	          hawaiiStream.point(x, y);
	        },
	        sphere: function() {
	          lower48Stream.sphere();
	          alaskaStream.sphere();
	          hawaiiStream.sphere();
	        },
	        lineStart: function() {
	          lower48Stream.lineStart();
	          alaskaStream.lineStart();
	          hawaiiStream.lineStart();
	        },
	        lineEnd: function() {
	          lower48Stream.lineEnd();
	          alaskaStream.lineEnd();
	          hawaiiStream.lineEnd();
	        },
	        polygonStart: function() {
	          lower48Stream.polygonStart();
	          alaskaStream.polygonStart();
	          hawaiiStream.polygonStart();
	        },
	        polygonEnd: function() {
	          lower48Stream.polygonEnd();
	          alaskaStream.polygonEnd();
	          hawaiiStream.polygonEnd();
	        }
	      };
	    };
	    albersUsa.precision = function(_) {
	      if (!arguments.length) return lower48.precision();
	      lower48.precision(_);
	      alaska.precision(_);
	      hawaii.precision(_);
	      return albersUsa;
	    };
	    albersUsa.scale = function(_) {
	      if (!arguments.length) return lower48.scale();
	      lower48.scale(_);
	      alaska.scale(_ * .35);
	      hawaii.scale(_);
	      return albersUsa.translate(lower48.translate());
	    };
	    albersUsa.translate = function(_) {
	      if (!arguments.length) return lower48.translate();
	      var k = lower48.scale(), x = +_[0], y = +_[1];
	      lower48Point = lower48.translate(_).clipExtent([ [ x - .455 * k, y - .238 * k ], [ x + .455 * k, y + .238 * k ] ]).stream(pointStream).point;
	      alaskaPoint = alaska.translate([ x - .307 * k, y + .201 * k ]).clipExtent([ [ x - .425 * k + ε, y + .12 * k + ε ], [ x - .214 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
	      hawaiiPoint = hawaii.translate([ x - .205 * k, y + .212 * k ]).clipExtent([ [ x - .214 * k + ε, y + .166 * k + ε ], [ x - .115 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
	      return albersUsa;
	    };
	    return albersUsa.scale(1070);
	  };
	  var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
	    point: d3_noop,
	    lineStart: d3_noop,
	    lineEnd: d3_noop,
	    polygonStart: function() {
	      d3_geo_pathAreaPolygon = 0;
	      d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
	    },
	    polygonEnd: function() {
	      d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
	      d3_geo_pathAreaSum += abs(d3_geo_pathAreaPolygon / 2);
	    }
	  };
	  function d3_geo_pathAreaRingStart() {
	    var x00, y00, x0, y0;
	    d3_geo_pathArea.point = function(x, y) {
	      d3_geo_pathArea.point = nextPoint;
	      x00 = x0 = x, y00 = y0 = y;
	    };
	    function nextPoint(x, y) {
	      d3_geo_pathAreaPolygon += y0 * x - x0 * y;
	      x0 = x, y0 = y;
	    }
	    d3_geo_pathArea.lineEnd = function() {
	      nextPoint(x00, y00);
	    };
	  }
	  var d3_geo_pathBoundsX0, d3_geo_pathBoundsY0, d3_geo_pathBoundsX1, d3_geo_pathBoundsY1;
	  var d3_geo_pathBounds = {
	    point: d3_geo_pathBoundsPoint,
	    lineStart: d3_noop,
	    lineEnd: d3_noop,
	    polygonStart: d3_noop,
	    polygonEnd: d3_noop
	  };
	  function d3_geo_pathBoundsPoint(x, y) {
	    if (x < d3_geo_pathBoundsX0) d3_geo_pathBoundsX0 = x;
	    if (x > d3_geo_pathBoundsX1) d3_geo_pathBoundsX1 = x;
	    if (y < d3_geo_pathBoundsY0) d3_geo_pathBoundsY0 = y;
	    if (y > d3_geo_pathBoundsY1) d3_geo_pathBoundsY1 = y;
	  }
	  function d3_geo_pathBuffer() {
	    var pointCircle = d3_geo_pathBufferCircle(4.5), buffer = [];
	    var stream = {
	      point: point,
	      lineStart: function() {
	        stream.point = pointLineStart;
	      },
	      lineEnd: lineEnd,
	      polygonStart: function() {
	        stream.lineEnd = lineEndPolygon;
	      },
	      polygonEnd: function() {
	        stream.lineEnd = lineEnd;
	        stream.point = point;
	      },
	      pointRadius: function(_) {
	        pointCircle = d3_geo_pathBufferCircle(_);
	        return stream;
	      },
	      result: function() {
	        if (buffer.length) {
	          var result = buffer.join("");
	          buffer = [];
	          return result;
	        }
	      }
	    };
	    function point(x, y) {
	      buffer.push("M", x, ",", y, pointCircle);
	    }
	    function pointLineStart(x, y) {
	      buffer.push("M", x, ",", y);
	      stream.point = pointLine;
	    }
	    function pointLine(x, y) {
	      buffer.push("L", x, ",", y);
	    }
	    function lineEnd() {
	      stream.point = point;
	    }
	    function lineEndPolygon() {
	      buffer.push("Z");
	    }
	    return stream;
	  }
	  function d3_geo_pathBufferCircle(radius) {
	    return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
	  }
	  var d3_geo_pathCentroid = {
	    point: d3_geo_pathCentroidPoint,
	    lineStart: d3_geo_pathCentroidLineStart,
	    lineEnd: d3_geo_pathCentroidLineEnd,
	    polygonStart: function() {
	      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
	    },
	    polygonEnd: function() {
	      d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
	      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
	      d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
	    }
	  };
	  function d3_geo_pathCentroidPoint(x, y) {
	    d3_geo_centroidX0 += x;
	    d3_geo_centroidY0 += y;
	    ++d3_geo_centroidZ0;
	  }
	  function d3_geo_pathCentroidLineStart() {
	    var x0, y0;
	    d3_geo_pathCentroid.point = function(x, y) {
	      d3_geo_pathCentroid.point = nextPoint;
	      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
	    };
	    function nextPoint(x, y) {
	      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
	      d3_geo_centroidX1 += z * (x0 + x) / 2;
	      d3_geo_centroidY1 += z * (y0 + y) / 2;
	      d3_geo_centroidZ1 += z;
	      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
	    }
	  }
	  function d3_geo_pathCentroidLineEnd() {
	    d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
	  }
	  function d3_geo_pathCentroidRingStart() {
	    var x00, y00, x0, y0;
	    d3_geo_pathCentroid.point = function(x, y) {
	      d3_geo_pathCentroid.point = nextPoint;
	      d3_geo_pathCentroidPoint(x00 = x0 = x, y00 = y0 = y);
	    };
	    function nextPoint(x, y) {
	      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
	      d3_geo_centroidX1 += z * (x0 + x) / 2;
	      d3_geo_centroidY1 += z * (y0 + y) / 2;
	      d3_geo_centroidZ1 += z;
	      z = y0 * x - x0 * y;
	      d3_geo_centroidX2 += z * (x0 + x);
	      d3_geo_centroidY2 += z * (y0 + y);
	      d3_geo_centroidZ2 += z * 3;
	      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
	    }
	    d3_geo_pathCentroid.lineEnd = function() {
	      nextPoint(x00, y00);
	    };
	  }
	  function d3_geo_pathContext(context) {
	    var pointRadius = 4.5;
	    var stream = {
	      point: point,
	      lineStart: function() {
	        stream.point = pointLineStart;
	      },
	      lineEnd: lineEnd,
	      polygonStart: function() {
	        stream.lineEnd = lineEndPolygon;
	      },
	      polygonEnd: function() {
	        stream.lineEnd = lineEnd;
	        stream.point = point;
	      },
	      pointRadius: function(_) {
	        pointRadius = _;
	        return stream;
	      },
	      result: d3_noop
	    };
	    function point(x, y) {
	      context.moveTo(x + pointRadius, y);
	      context.arc(x, y, pointRadius, 0, τ);
	    }
	    function pointLineStart(x, y) {
	      context.moveTo(x, y);
	      stream.point = pointLine;
	    }
	    function pointLine(x, y) {
	      context.lineTo(x, y);
	    }
	    function lineEnd() {
	      stream.point = point;
	    }
	    function lineEndPolygon() {
	      context.closePath();
	    }
	    return stream;
	  }
	  function d3_geo_resample(project) {
	    var δ2 = .5, cosMinDistance = Math.cos(30 * d3_radians), maxDepth = 16;
	    function resample(stream) {
	      return (maxDepth ? resampleRecursive : resampleNone)(stream);
	    }
	    function resampleNone(stream) {
	      return d3_geo_transformPoint(stream, function(x, y) {
	        x = project(x, y);
	        stream.point(x[0], x[1]);
	      });
	    }
	    function resampleRecursive(stream) {
	      var λ00, φ00, x00, y00, a00, b00, c00, λ0, x0, y0, a0, b0, c0;
	      var resample = {
	        point: point,
	        lineStart: lineStart,
	        lineEnd: lineEnd,
	        polygonStart: function() {
	          stream.polygonStart();
	          resample.lineStart = ringStart;
	        },
	        polygonEnd: function() {
	          stream.polygonEnd();
	          resample.lineStart = lineStart;
	        }
	      };
	      function point(x, y) {
	        x = project(x, y);
	        stream.point(x[0], x[1]);
	      }
	      function lineStart() {
	        x0 = NaN;
	        resample.point = linePoint;
	        stream.lineStart();
	      }
	      function linePoint(λ, φ) {
	        var c = d3_geo_cartesian([ λ, φ ]), p = project(λ, φ);
	        resampleLineTo(x0, y0, λ0, a0, b0, c0, x0 = p[0], y0 = p[1], λ0 = λ, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
	        stream.point(x0, y0);
	      }
	      function lineEnd() {
	        resample.point = point;
	        stream.lineEnd();
	      }
	      function ringStart() {
	        lineStart();
	        resample.point = ringPoint;
	        resample.lineEnd = ringEnd;
	      }
	      function ringPoint(λ, φ) {
	        linePoint(λ00 = λ, φ00 = φ), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
	        resample.point = linePoint;
	      }
	      function ringEnd() {
	        resampleLineTo(x0, y0, λ0, a0, b0, c0, x00, y00, λ00, a00, b00, c00, maxDepth, stream);
	        resample.lineEnd = lineEnd;
	        lineEnd();
	      }
	      return resample;
	    }
	    function resampleLineTo(x0, y0, λ0, a0, b0, c0, x1, y1, λ1, a1, b1, c1, depth, stream) {
	      var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
	      if (d2 > 4 * δ2 && depth--) {
	        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c), φ2 = Math.asin(c /= m), λ2 = abs(abs(c) - 1) < ε || abs(λ0 - λ1) < ε ? (λ0 + λ1) / 2 : Math.atan2(b, a), p = project(λ2, φ2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0, dz = dy * dx2 - dx * dy2;
	        if (dz * dz / d2 > δ2 || abs((dx * dx2 + dy * dy2) / d2 - .5) > .3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
	          resampleLineTo(x0, y0, λ0, a0, b0, c0, x2, y2, λ2, a /= m, b /= m, c, depth, stream);
	          stream.point(x2, y2);
	          resampleLineTo(x2, y2, λ2, a, b, c, x1, y1, λ1, a1, b1, c1, depth, stream);
	        }
	      }
	    }
	    resample.precision = function(_) {
	      if (!arguments.length) return Math.sqrt(δ2);
	      maxDepth = (δ2 = _ * _) > 0 && 16;
	      return resample;
	    };
	    return resample;
	  }
	  d3.geo.path = function() {
	    var pointRadius = 4.5, projection, context, projectStream, contextStream, cacheStream;
	    function path(object) {
	      if (object) {
	        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
	        if (!cacheStream || !cacheStream.valid) cacheStream = projectStream(contextStream);
	        d3.geo.stream(object, cacheStream);
	      }
	      return contextStream.result();
	    }
	    path.area = function(object) {
	      d3_geo_pathAreaSum = 0;
	      d3.geo.stream(object, projectStream(d3_geo_pathArea));
	      return d3_geo_pathAreaSum;
	    };
	    path.centroid = function(object) {
	      d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
	      d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
	      return d3_geo_centroidZ2 ? [ d3_geo_centroidX2 / d3_geo_centroidZ2, d3_geo_centroidY2 / d3_geo_centroidZ2 ] : d3_geo_centroidZ1 ? [ d3_geo_centroidX1 / d3_geo_centroidZ1, d3_geo_centroidY1 / d3_geo_centroidZ1 ] : d3_geo_centroidZ0 ? [ d3_geo_centroidX0 / d3_geo_centroidZ0, d3_geo_centroidY0 / d3_geo_centroidZ0 ] : [ NaN, NaN ];
	    };
	    path.bounds = function(object) {
	      d3_geo_pathBoundsX1 = d3_geo_pathBoundsY1 = -(d3_geo_pathBoundsX0 = d3_geo_pathBoundsY0 = Infinity);
	      d3.geo.stream(object, projectStream(d3_geo_pathBounds));
	      return [ [ d3_geo_pathBoundsX0, d3_geo_pathBoundsY0 ], [ d3_geo_pathBoundsX1, d3_geo_pathBoundsY1 ] ];
	    };
	    path.projection = function(_) {
	      if (!arguments.length) return projection;
	      projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
	      return reset();
	    };
	    path.context = function(_) {
	      if (!arguments.length) return context;
	      contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
	      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
	      return reset();
	    };
	    path.pointRadius = function(_) {
	      if (!arguments.length) return pointRadius;
	      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
	      return path;
	    };
	    function reset() {
	      cacheStream = null;
	      return path;
	    }
	    return path.projection(d3.geo.albersUsa()).context(null);
	  };
	  function d3_geo_pathProjectStream(project) {
	    var resample = d3_geo_resample(function(x, y) {
	      return project([ x * d3_degrees, y * d3_degrees ]);
	    });
	    return function(stream) {
	      return d3_geo_projectionRadians(resample(stream));
	    };
	  }
	  d3.geo.transform = function(methods) {
	    return {
	      stream: function(stream) {
	        var transform = new d3_geo_transform(stream);
	        for (var k in methods) transform[k] = methods[k];
	        return transform;
	      }
	    };
	  };
	  function d3_geo_transform(stream) {
	    this.stream = stream;
	  }
	  d3_geo_transform.prototype = {
	    point: function(x, y) {
	      this.stream.point(x, y);
	    },
	    sphere: function() {
	      this.stream.sphere();
	    },
	    lineStart: function() {
	      this.stream.lineStart();
	    },
	    lineEnd: function() {
	      this.stream.lineEnd();
	    },
	    polygonStart: function() {
	      this.stream.polygonStart();
	    },
	    polygonEnd: function() {
	      this.stream.polygonEnd();
	    }
	  };
	  function d3_geo_transformPoint(stream, point) {
	    return {
	      point: point,
	      sphere: function() {
	        stream.sphere();
	      },
	      lineStart: function() {
	        stream.lineStart();
	      },
	      lineEnd: function() {
	        stream.lineEnd();
	      },
	      polygonStart: function() {
	        stream.polygonStart();
	      },
	      polygonEnd: function() {
	        stream.polygonEnd();
	      }
	    };
	  }
	  d3.geo.projection = d3_geo_projection;
	  d3.geo.projectionMutator = d3_geo_projectionMutator;
	  function d3_geo_projection(project) {
	    return d3_geo_projectionMutator(function() {
	      return project;
	    })();
	  }
	  function d3_geo_projectionMutator(projectAt) {
	    var project, rotate, projectRotate, projectResample = d3_geo_resample(function(x, y) {
	      x = project(x, y);
	      return [ x[0] * k + δx, δy - x[1] * k ];
	    }), k = 150, x = 480, y = 250, λ = 0, φ = 0, δλ = 0, δφ = 0, δγ = 0, δx, δy, preclip = d3_geo_clipAntimeridian, postclip = d3_identity, clipAngle = null, clipExtent = null, stream;
	    function projection(point) {
	      point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
	      return [ point[0] * k + δx, δy - point[1] * k ];
	    }
	    function invert(point) {
	      point = projectRotate.invert((point[0] - δx) / k, (δy - point[1]) / k);
	      return point && [ point[0] * d3_degrees, point[1] * d3_degrees ];
	    }
	    projection.stream = function(output) {
	      if (stream) stream.valid = false;
	      stream = d3_geo_projectionRadians(preclip(rotate, projectResample(postclip(output))));
	      stream.valid = true;
	      return stream;
	    };
	    projection.clipAngle = function(_) {
	      if (!arguments.length) return clipAngle;
	      preclip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle((clipAngle = +_) * d3_radians);
	      return invalidate();
	    };
	    projection.clipExtent = function(_) {
	      if (!arguments.length) return clipExtent;
	      clipExtent = _;
	      postclip = _ ? d3_geo_clipExtent(_[0][0], _[0][1], _[1][0], _[1][1]) : d3_identity;
	      return invalidate();
	    };
	    projection.scale = function(_) {
	      if (!arguments.length) return k;
	      k = +_;
	      return reset();
	    };
	    projection.translate = function(_) {
	      if (!arguments.length) return [ x, y ];
	      x = +_[0];
	      y = +_[1];
	      return reset();
	    };
	    projection.center = function(_) {
	      if (!arguments.length) return [ λ * d3_degrees, φ * d3_degrees ];
	      λ = _[0] % 360 * d3_radians;
	      φ = _[1] % 360 * d3_radians;
	      return reset();
	    };
	    projection.rotate = function(_) {
	      if (!arguments.length) return [ δλ * d3_degrees, δφ * d3_degrees, δγ * d3_degrees ];
	      δλ = _[0] % 360 * d3_radians;
	      δφ = _[1] % 360 * d3_radians;
	      δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
	      return reset();
	    };
	    d3.rebind(projection, projectResample, "precision");
	    function reset() {
	      projectRotate = d3_geo_compose(rotate = d3_geo_rotation(δλ, δφ, δγ), project);
	      var center = project(λ, φ);
	      δx = x - center[0] * k;
	      δy = y + center[1] * k;
	      return invalidate();
	    }
	    function invalidate() {
	      if (stream) stream.valid = false, stream = null;
	      return projection;
	    }
	    return function() {
	      project = projectAt.apply(this, arguments);
	      projection.invert = project.invert && invert;
	      return reset();
	    };
	  }
	  function d3_geo_projectionRadians(stream) {
	    return d3_geo_transformPoint(stream, function(x, y) {
	      stream.point(x * d3_radians, y * d3_radians);
	    });
	  }
	  function d3_geo_equirectangular(λ, φ) {
	    return [ λ, φ ];
	  }
	  (d3.geo.equirectangular = function() {
	    return d3_geo_projection(d3_geo_equirectangular);
	  }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
	  d3.geo.rotation = function(rotate) {
	    rotate = d3_geo_rotation(rotate[0] % 360 * d3_radians, rotate[1] * d3_radians, rotate.length > 2 ? rotate[2] * d3_radians : 0);
	    function forward(coordinates) {
	      coordinates = rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
	      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
	    }
	    forward.invert = function(coordinates) {
	      coordinates = rotate.invert(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
	      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
	    };
	    return forward;
	  };
	  function d3_geo_identityRotation(λ, φ) {
	    return [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
	  }
	  d3_geo_identityRotation.invert = d3_geo_equirectangular;
	  function d3_geo_rotation(δλ, δφ, δγ) {
	    return δλ ? δφ || δγ ? d3_geo_compose(d3_geo_rotationλ(δλ), d3_geo_rotationφγ(δφ, δγ)) : d3_geo_rotationλ(δλ) : δφ || δγ ? d3_geo_rotationφγ(δφ, δγ) : d3_geo_identityRotation;
	  }
	  function d3_geo_forwardRotationλ(δλ) {
	    return function(λ, φ) {
	      return λ += δλ, [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
	    };
	  }
	  function d3_geo_rotationλ(δλ) {
	    var rotation = d3_geo_forwardRotationλ(δλ);
	    rotation.invert = d3_geo_forwardRotationλ(-δλ);
	    return rotation;
	  }
	  function d3_geo_rotationφγ(δφ, δγ) {
	    var cosδφ = Math.cos(δφ), sinδφ = Math.sin(δφ), cosδγ = Math.cos(δγ), sinδγ = Math.sin(δγ);
	    function rotation(λ, φ) {
	      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδφ + x * sinδφ;
	      return [ Math.atan2(y * cosδγ - k * sinδγ, x * cosδφ - z * sinδφ), d3_asin(k * cosδγ + y * sinδγ) ];
	    }
	    rotation.invert = function(λ, φ) {
	      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδγ - y * sinδγ;
	      return [ Math.atan2(y * cosδγ + z * sinδγ, x * cosδφ + k * sinδφ), d3_asin(k * cosδφ - x * sinδφ) ];
	    };
	    return rotation;
	  }
	  d3.geo.circle = function() {
	    var origin = [ 0, 0 ], angle, precision = 6, interpolate;
	    function circle() {
	      var center = typeof origin === "function" ? origin.apply(this, arguments) : origin, rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
	      interpolate(null, null, 1, {
	        point: function(x, y) {
	          ring.push(x = rotate(x, y));
	          x[0] *= d3_degrees, x[1] *= d3_degrees;
	        }
	      });
	      return {
	        type: "Polygon",
	        coordinates: [ ring ]
	      };
	    }
	    circle.origin = function(x) {
	      if (!arguments.length) return origin;
	      origin = x;
	      return circle;
	    };
	    circle.angle = function(x) {
	      if (!arguments.length) return angle;
	      interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
	      return circle;
	    };
	    circle.precision = function(_) {
	      if (!arguments.length) return precision;
	      interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
	      return circle;
	    };
	    return circle.angle(90);
	  };
	  function d3_geo_circleInterpolate(radius, precision) {
	    var cr = Math.cos(radius), sr = Math.sin(radius);
	    return function(from, to, direction, listener) {
	      var step = direction * precision;
	      if (from != null) {
	        from = d3_geo_circleAngle(cr, from);
	        to = d3_geo_circleAngle(cr, to);
	        if (direction > 0 ? from < to : from > to) from += direction * τ;
	      } else {
	        from = radius + direction * τ;
	        to = radius - .5 * step;
	      }
	      for (var point, t = from; direction > 0 ? t > to : t < to; t -= step) {
	        listener.point((point = d3_geo_spherical([ cr, -sr * Math.cos(t), -sr * Math.sin(t) ]))[0], point[1]);
	      }
	    };
	  }
	  function d3_geo_circleAngle(cr, point) {
	    var a = d3_geo_cartesian(point);
	    a[0] -= cr;
	    d3_geo_cartesianNormalize(a);
	    var angle = d3_acos(-a[1]);
	    return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - ε) % (2 * Math.PI);
	  }
	  d3.geo.distance = function(a, b) {
	    var Δλ = (b[0] - a[0]) * d3_radians, φ0 = a[1] * d3_radians, φ1 = b[1] * d3_radians, sinΔλ = Math.sin(Δλ), cosΔλ = Math.cos(Δλ), sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), t;
	    return Math.atan2(Math.sqrt((t = cosφ1 * sinΔλ) * t + (t = cosφ0 * sinφ1 - sinφ0 * cosφ1 * cosΔλ) * t), sinφ0 * sinφ1 + cosφ0 * cosφ1 * cosΔλ);
	  };
	  d3.geo.graticule = function() {
	    var x1, x0, X1, X0, y1, y0, Y1, Y0, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
	    function graticule() {
	      return {
	        type: "MultiLineString",
	        coordinates: lines()
	      };
	    }
	    function lines() {
	      return d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) {
	        return abs(x % DX) > ε;
	      }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).filter(function(y) {
	        return abs(y % DY) > ε;
	      }).map(y));
	    }
	    graticule.lines = function() {
	      return lines().map(function(coordinates) {
	        return {
	          type: "LineString",
	          coordinates: coordinates
	        };
	      });
	    };
	    graticule.outline = function() {
	      return {
	        type: "Polygon",
	        coordinates: [ X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1)) ]
	      };
	    };
	    graticule.extent = function(_) {
	      if (!arguments.length) return graticule.minorExtent();
	      return graticule.majorExtent(_).minorExtent(_);
	    };
	    graticule.majorExtent = function(_) {
	      if (!arguments.length) return [ [ X0, Y0 ], [ X1, Y1 ] ];
	      X0 = +_[0][0], X1 = +_[1][0];
	      Y0 = +_[0][1], Y1 = +_[1][1];
	      if (X0 > X1) _ = X0, X0 = X1, X1 = _;
	      if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
	      return graticule.precision(precision);
	    };
	    graticule.minorExtent = function(_) {
	      if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
	      x0 = +_[0][0], x1 = +_[1][0];
	      y0 = +_[0][1], y1 = +_[1][1];
	      if (x0 > x1) _ = x0, x0 = x1, x1 = _;
	      if (y0 > y1) _ = y0, y0 = y1, y1 = _;
	      return graticule.precision(precision);
	    };
	    graticule.step = function(_) {
	      if (!arguments.length) return graticule.minorStep();
	      return graticule.majorStep(_).minorStep(_);
	    };
	    graticule.majorStep = function(_) {
	      if (!arguments.length) return [ DX, DY ];
	      DX = +_[0], DY = +_[1];
	      return graticule;
	    };
	    graticule.minorStep = function(_) {
	      if (!arguments.length) return [ dx, dy ];
	      dx = +_[0], dy = +_[1];
	      return graticule;
	    };
	    graticule.precision = function(_) {
	      if (!arguments.length) return precision;
	      precision = +_;
	      x = d3_geo_graticuleX(y0, y1, 90);
	      y = d3_geo_graticuleY(x0, x1, precision);
	      X = d3_geo_graticuleX(Y0, Y1, 90);
	      Y = d3_geo_graticuleY(X0, X1, precision);
	      return graticule;
	    };
	    return graticule.majorExtent([ [ -180, -90 + ε ], [ 180, 90 - ε ] ]).minorExtent([ [ -180, -80 - ε ], [ 180, 80 + ε ] ]);
	  };
	  function d3_geo_graticuleX(y0, y1, dy) {
	    var y = d3.range(y0, y1 - ε, dy).concat(y1);
	    return function(x) {
	      return y.map(function(y) {
	        return [ x, y ];
	      });
	    };
	  }
	  function d3_geo_graticuleY(x0, x1, dx) {
	    var x = d3.range(x0, x1 - ε, dx).concat(x1);
	    return function(y) {
	      return x.map(function(x) {
	        return [ x, y ];
	      });
	    };
	  }
	  function d3_source(d) {
	    return d.source;
	  }
	  function d3_target(d) {
	    return d.target;
	  }
	  d3.geo.greatArc = function() {
	    var source = d3_source, source_, target = d3_target, target_;
	    function greatArc() {
	      return {
	        type: "LineString",
	        coordinates: [ source_ || source.apply(this, arguments), target_ || target.apply(this, arguments) ]
	      };
	    }
	    greatArc.distance = function() {
	      return d3.geo.distance(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments));
	    };
	    greatArc.source = function(_) {
	      if (!arguments.length) return source;
	      source = _, source_ = typeof _ === "function" ? null : _;
	      return greatArc;
	    };
	    greatArc.target = function(_) {
	      if (!arguments.length) return target;
	      target = _, target_ = typeof _ === "function" ? null : _;
	      return greatArc;
	    };
	    greatArc.precision = function() {
	      return arguments.length ? greatArc : 0;
	    };
	    return greatArc;
	  };
	  d3.geo.interpolate = function(source, target) {
	    return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
	  };
	  function d3_geo_interpolate(x0, y0, x1, y1) {
	    var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1), kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1), ky1 = cy1 * Math.sin(x1), d = 2 * Math.asin(Math.sqrt(d3_haversin(y1 - y0) + cy0 * cy1 * d3_haversin(x1 - x0))), k = 1 / Math.sin(d);
	    var interpolate = d ? function(t) {
	      var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
	      return [ Math.atan2(y, x) * d3_degrees, Math.atan2(z, Math.sqrt(x * x + y * y)) * d3_degrees ];
	    } : function() {
	      return [ x0 * d3_degrees, y0 * d3_degrees ];
	    };
	    interpolate.distance = d;
	    return interpolate;
	  }
	  d3.geo.length = function(object) {
	    d3_geo_lengthSum = 0;
	    d3.geo.stream(object, d3_geo_length);
	    return d3_geo_lengthSum;
	  };
	  var d3_geo_lengthSum;
	  var d3_geo_length = {
	    sphere: d3_noop,
	    point: d3_noop,
	    lineStart: d3_geo_lengthLineStart,
	    lineEnd: d3_noop,
	    polygonStart: d3_noop,
	    polygonEnd: d3_noop
	  };
	  function d3_geo_lengthLineStart() {
	    var λ0, sinφ0, cosφ0;
	    d3_geo_length.point = function(λ, φ) {
	      λ0 = λ * d3_radians, sinφ0 = Math.sin(φ *= d3_radians), cosφ0 = Math.cos(φ);
	      d3_geo_length.point = nextPoint;
	    };
	    d3_geo_length.lineEnd = function() {
	      d3_geo_length.point = d3_geo_length.lineEnd = d3_noop;
	    };
	    function nextPoint(λ, φ) {
	      var sinφ = Math.sin(φ *= d3_radians), cosφ = Math.cos(φ), t = abs((λ *= d3_radians) - λ0), cosΔλ = Math.cos(t);
	      d3_geo_lengthSum += Math.atan2(Math.sqrt((t = cosφ * Math.sin(t)) * t + (t = cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ) * t), sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ);
	      λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ;
	    }
	  }
	  function d3_geo_azimuthal(scale, angle) {
	    function azimuthal(λ, φ) {
	      var cosλ = Math.cos(λ), cosφ = Math.cos(φ), k = scale(cosλ * cosφ);
	      return [ k * cosφ * Math.sin(λ), k * Math.sin(φ) ];
	    }
	    azimuthal.invert = function(x, y) {
	      var ρ = Math.sqrt(x * x + y * y), c = angle(ρ), sinc = Math.sin(c), cosc = Math.cos(c);
	      return [ Math.atan2(x * sinc, ρ * cosc), Math.asin(ρ && y * sinc / ρ) ];
	    };
	    return azimuthal;
	  }
	  var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function(cosλcosφ) {
	    return Math.sqrt(2 / (1 + cosλcosφ));
	  }, function(ρ) {
	    return 2 * Math.asin(ρ / 2);
	  });
	  (d3.geo.azimuthalEqualArea = function() {
	    return d3_geo_projection(d3_geo_azimuthalEqualArea);
	  }).raw = d3_geo_azimuthalEqualArea;
	  var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function(cosλcosφ) {
	    var c = Math.acos(cosλcosφ);
	    return c && c / Math.sin(c);
	  }, d3_identity);
	  (d3.geo.azimuthalEquidistant = function() {
	    return d3_geo_projection(d3_geo_azimuthalEquidistant);
	  }).raw = d3_geo_azimuthalEquidistant;
	  function d3_geo_conicConformal(φ0, φ1) {
	    var cosφ0 = Math.cos(φ0), t = function(φ) {
	      return Math.tan(π / 4 + φ / 2);
	    }, n = φ0 === φ1 ? Math.sin(φ0) : Math.log(cosφ0 / Math.cos(φ1)) / Math.log(t(φ1) / t(φ0)), F = cosφ0 * Math.pow(t(φ0), n) / n;
	    if (!n) return d3_geo_mercator;
	    function forward(λ, φ) {
	      if (F > 0) {
	        if (φ < -halfπ + ε) φ = -halfπ + ε;
	      } else {
	        if (φ > halfπ - ε) φ = halfπ - ε;
	      }
	      var ρ = F / Math.pow(t(φ), n);
	      return [ ρ * Math.sin(n * λ), F - ρ * Math.cos(n * λ) ];
	    }
	    forward.invert = function(x, y) {
	      var ρ0_y = F - y, ρ = d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y);
	      return [ Math.atan2(x, ρ0_y) / n, 2 * Math.atan(Math.pow(F / ρ, 1 / n)) - halfπ ];
	    };
	    return forward;
	  }
	  (d3.geo.conicConformal = function() {
	    return d3_geo_conic(d3_geo_conicConformal);
	  }).raw = d3_geo_conicConformal;
	  function d3_geo_conicEquidistant(φ0, φ1) {
	    var cosφ0 = Math.cos(φ0), n = φ0 === φ1 ? Math.sin(φ0) : (cosφ0 - Math.cos(φ1)) / (φ1 - φ0), G = cosφ0 / n + φ0;
	    if (abs(n) < ε) return d3_geo_equirectangular;
	    function forward(λ, φ) {
	      var ρ = G - φ;
	      return [ ρ * Math.sin(n * λ), G - ρ * Math.cos(n * λ) ];
	    }
	    forward.invert = function(x, y) {
	      var ρ0_y = G - y;
	      return [ Math.atan2(x, ρ0_y) / n, G - d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y) ];
	    };
	    return forward;
	  }
	  (d3.geo.conicEquidistant = function() {
	    return d3_geo_conic(d3_geo_conicEquidistant);
	  }).raw = d3_geo_conicEquidistant;
	  var d3_geo_gnomonic = d3_geo_azimuthal(function(cosλcosφ) {
	    return 1 / cosλcosφ;
	  }, Math.atan);
	  (d3.geo.gnomonic = function() {
	    return d3_geo_projection(d3_geo_gnomonic);
	  }).raw = d3_geo_gnomonic;
	  function d3_geo_mercator(λ, φ) {
	    return [ λ, Math.log(Math.tan(π / 4 + φ / 2)) ];
	  }
	  d3_geo_mercator.invert = function(x, y) {
	    return [ x, 2 * Math.atan(Math.exp(y)) - halfπ ];
	  };
	  function d3_geo_mercatorProjection(project) {
	    var m = d3_geo_projection(project), scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, clipAuto;
	    m.scale = function() {
	      var v = scale.apply(m, arguments);
	      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
	    };
	    m.translate = function() {
	      var v = translate.apply(m, arguments);
	      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
	    };
	    m.clipExtent = function(_) {
	      var v = clipExtent.apply(m, arguments);
	      if (v === m) {
	        if (clipAuto = _ == null) {
	          var k = π * scale(), t = translate();
	          clipExtent([ [ t[0] - k, t[1] - k ], [ t[0] + k, t[1] + k ] ]);
	        }
	      } else if (clipAuto) {
	        v = null;
	      }
	      return v;
	    };
	    return m.clipExtent(null);
	  }
	  (d3.geo.mercator = function() {
	    return d3_geo_mercatorProjection(d3_geo_mercator);
	  }).raw = d3_geo_mercator;
	  var d3_geo_orthographic = d3_geo_azimuthal(function() {
	    return 1;
	  }, Math.asin);
	  (d3.geo.orthographic = function() {
	    return d3_geo_projection(d3_geo_orthographic);
	  }).raw = d3_geo_orthographic;
	  var d3_geo_stereographic = d3_geo_azimuthal(function(cosλcosφ) {
	    return 1 / (1 + cosλcosφ);
	  }, function(ρ) {
	    return 2 * Math.atan(ρ);
	  });
	  (d3.geo.stereographic = function() {
	    return d3_geo_projection(d3_geo_stereographic);
	  }).raw = d3_geo_stereographic;
	  function d3_geo_transverseMercator(λ, φ) {
	    return [ Math.log(Math.tan(π / 4 + φ / 2)), -λ ];
	  }
	  d3_geo_transverseMercator.invert = function(x, y) {
	    return [ -y, 2 * Math.atan(Math.exp(x)) - halfπ ];
	  };
	  (d3.geo.transverseMercator = function() {
	    var projection = d3_geo_mercatorProjection(d3_geo_transverseMercator), center = projection.center, rotate = projection.rotate;
	    projection.center = function(_) {
	      return _ ? center([ -_[1], _[0] ]) : (_ = center(), [ _[1], -_[0] ]);
	    };
	    projection.rotate = function(_) {
	      return _ ? rotate([ _[0], _[1], _.length > 2 ? _[2] + 90 : 90 ]) : (_ = rotate(), 
	      [ _[0], _[1], _[2] - 90 ]);
	    };
	    return rotate([ 0, 0, 90 ]);
	  }).raw = d3_geo_transverseMercator;
	  d3.geom = {};
	  function d3_geom_pointX(d) {
	    return d[0];
	  }
	  function d3_geom_pointY(d) {
	    return d[1];
	  }
	  d3.geom.hull = function(vertices) {
	    var x = d3_geom_pointX, y = d3_geom_pointY;
	    if (arguments.length) return hull(vertices);
	    function hull(data) {
	      if (data.length < 3) return [];
	      var fx = d3_functor(x), fy = d3_functor(y), i, n = data.length, points = [], flippedPoints = [];
	      for (i = 0; i < n; i++) {
	        points.push([ +fx.call(this, data[i], i), +fy.call(this, data[i], i), i ]);
	      }
	      points.sort(d3_geom_hullOrder);
	      for (i = 0; i < n; i++) flippedPoints.push([ points[i][0], -points[i][1] ]);
	      var upper = d3_geom_hullUpper(points), lower = d3_geom_hullUpper(flippedPoints);
	      var skipLeft = lower[0] === upper[0], skipRight = lower[lower.length - 1] === upper[upper.length - 1], polygon = [];
	      for (i = upper.length - 1; i >= 0; --i) polygon.push(data[points[upper[i]][2]]);
	      for (i = +skipLeft; i < lower.length - skipRight; ++i) polygon.push(data[points[lower[i]][2]]);
	      return polygon;
	    }
	    hull.x = function(_) {
	      return arguments.length ? (x = _, hull) : x;
	    };
	    hull.y = function(_) {
	      return arguments.length ? (y = _, hull) : y;
	    };
	    return hull;
	  };
	  function d3_geom_hullUpper(points) {
	    var n = points.length, hull = [ 0, 1 ], hs = 2;
	    for (var i = 2; i < n; i++) {
	      while (hs > 1 && d3_cross2d(points[hull[hs - 2]], points[hull[hs - 1]], points[i]) <= 0) --hs;
	      hull[hs++] = i;
	    }
	    return hull.slice(0, hs);
	  }
	  function d3_geom_hullOrder(a, b) {
	    return a[0] - b[0] || a[1] - b[1];
	  }
	  d3.geom.polygon = function(coordinates) {
	    d3_subclass(coordinates, d3_geom_polygonPrototype);
	    return coordinates;
	  };
	  var d3_geom_polygonPrototype = d3.geom.polygon.prototype = [];
	  d3_geom_polygonPrototype.area = function() {
	    var i = -1, n = this.length, a, b = this[n - 1], area = 0;
	    while (++i < n) {
	      a = b;
	      b = this[i];
	      area += a[1] * b[0] - a[0] * b[1];
	    }
	    return area * .5;
	  };
	  d3_geom_polygonPrototype.centroid = function(k) {
	    var i = -1, n = this.length, x = 0, y = 0, a, b = this[n - 1], c;
	    if (!arguments.length) k = -1 / (6 * this.area());
	    while (++i < n) {
	      a = b;
	      b = this[i];
	      c = a[0] * b[1] - b[0] * a[1];
	      x += (a[0] + b[0]) * c;
	      y += (a[1] + b[1]) * c;
	    }
	    return [ x * k, y * k ];
	  };
	  d3_geom_polygonPrototype.clip = function(subject) {
	    var input, closed = d3_geom_polygonClosed(subject), i = -1, n = this.length - d3_geom_polygonClosed(this), j, m, a = this[n - 1], b, c, d;
	    while (++i < n) {
	      input = subject.slice();
	      subject.length = 0;
	      b = this[i];
	      c = input[(m = input.length - closed) - 1];
	      j = -1;
	      while (++j < m) {
	        d = input[j];
	        if (d3_geom_polygonInside(d, a, b)) {
	          if (!d3_geom_polygonInside(c, a, b)) {
	            subject.push(d3_geom_polygonIntersect(c, d, a, b));
	          }
	          subject.push(d);
	        } else if (d3_geom_polygonInside(c, a, b)) {
	          subject.push(d3_geom_polygonIntersect(c, d, a, b));
	        }
	        c = d;
	      }
	      if (closed) subject.push(subject[0]);
	      a = b;
	    }
	    return subject;
	  };
	  function d3_geom_polygonInside(p, a, b) {
	    return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
	  }
	  function d3_geom_polygonIntersect(c, d, a, b) {
	    var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3, y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3, ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
	    return [ x1 + ua * x21, y1 + ua * y21 ];
	  }
	  function d3_geom_polygonClosed(coordinates) {
	    var a = coordinates[0], b = coordinates[coordinates.length - 1];
	    return !(a[0] - b[0] || a[1] - b[1]);
	  }
	  var d3_geom_voronoiEdges, d3_geom_voronoiCells, d3_geom_voronoiBeaches, d3_geom_voronoiBeachPool = [], d3_geom_voronoiFirstCircle, d3_geom_voronoiCircles, d3_geom_voronoiCirclePool = [];
	  function d3_geom_voronoiBeach() {
	    d3_geom_voronoiRedBlackNode(this);
	    this.edge = this.site = this.circle = null;
	  }
	  function d3_geom_voronoiCreateBeach(site) {
	    var beach = d3_geom_voronoiBeachPool.pop() || new d3_geom_voronoiBeach();
	    beach.site = site;
	    return beach;
	  }
	  function d3_geom_voronoiDetachBeach(beach) {
	    d3_geom_voronoiDetachCircle(beach);
	    d3_geom_voronoiBeaches.remove(beach);
	    d3_geom_voronoiBeachPool.push(beach);
	    d3_geom_voronoiRedBlackNode(beach);
	  }
	  function d3_geom_voronoiRemoveBeach(beach) {
	    var circle = beach.circle, x = circle.x, y = circle.cy, vertex = {
	      x: x,
	      y: y
	    }, previous = beach.P, next = beach.N, disappearing = [ beach ];
	    d3_geom_voronoiDetachBeach(beach);
	    var lArc = previous;
	    while (lArc.circle && abs(x - lArc.circle.x) < ε && abs(y - lArc.circle.cy) < ε) {
	      previous = lArc.P;
	      disappearing.unshift(lArc);
	      d3_geom_voronoiDetachBeach(lArc);
	      lArc = previous;
	    }
	    disappearing.unshift(lArc);
	    d3_geom_voronoiDetachCircle(lArc);
	    var rArc = next;
	    while (rArc.circle && abs(x - rArc.circle.x) < ε && abs(y - rArc.circle.cy) < ε) {
	      next = rArc.N;
	      disappearing.push(rArc);
	      d3_geom_voronoiDetachBeach(rArc);
	      rArc = next;
	    }
	    disappearing.push(rArc);
	    d3_geom_voronoiDetachCircle(rArc);
	    var nArcs = disappearing.length, iArc;
	    for (iArc = 1; iArc < nArcs; ++iArc) {
	      rArc = disappearing[iArc];
	      lArc = disappearing[iArc - 1];
	      d3_geom_voronoiSetEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
	    }
	    lArc = disappearing[0];
	    rArc = disappearing[nArcs - 1];
	    rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, rArc.site, null, vertex);
	    d3_geom_voronoiAttachCircle(lArc);
	    d3_geom_voronoiAttachCircle(rArc);
	  }
	  function d3_geom_voronoiAddBeach(site) {
	    var x = site.x, directrix = site.y, lArc, rArc, dxl, dxr, node = d3_geom_voronoiBeaches._;
	    while (node) {
	      dxl = d3_geom_voronoiLeftBreakPoint(node, directrix) - x;
	      if (dxl > ε) node = node.L; else {
	        dxr = x - d3_geom_voronoiRightBreakPoint(node, directrix);
	        if (dxr > ε) {
	          if (!node.R) {
	            lArc = node;
	            break;
	          }
	          node = node.R;
	        } else {
	          if (dxl > -ε) {
	            lArc = node.P;
	            rArc = node;
	          } else if (dxr > -ε) {
	            lArc = node;
	            rArc = node.N;
	          } else {
	            lArc = rArc = node;
	          }
	          break;
	        }
	      }
	    }
	    var newArc = d3_geom_voronoiCreateBeach(site);
	    d3_geom_voronoiBeaches.insert(lArc, newArc);
	    if (!lArc && !rArc) return;
	    if (lArc === rArc) {
	      d3_geom_voronoiDetachCircle(lArc);
	      rArc = d3_geom_voronoiCreateBeach(lArc.site);
	      d3_geom_voronoiBeaches.insert(newArc, rArc);
	      newArc.edge = rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
	      d3_geom_voronoiAttachCircle(lArc);
	      d3_geom_voronoiAttachCircle(rArc);
	      return;
	    }
	    if (!rArc) {
	      newArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
	      return;
	    }
	    d3_geom_voronoiDetachCircle(lArc);
	    d3_geom_voronoiDetachCircle(rArc);
	    var lSite = lArc.site, ax = lSite.x, ay = lSite.y, bx = site.x - ax, by = site.y - ay, rSite = rArc.site, cx = rSite.x - ax, cy = rSite.y - ay, d = 2 * (bx * cy - by * cx), hb = bx * bx + by * by, hc = cx * cx + cy * cy, vertex = {
	      x: (cy * hb - by * hc) / d + ax,
	      y: (bx * hc - cx * hb) / d + ay
	    };
	    d3_geom_voronoiSetEdgeEnd(rArc.edge, lSite, rSite, vertex);
	    newArc.edge = d3_geom_voronoiCreateEdge(lSite, site, null, vertex);
	    rArc.edge = d3_geom_voronoiCreateEdge(site, rSite, null, vertex);
	    d3_geom_voronoiAttachCircle(lArc);
	    d3_geom_voronoiAttachCircle(rArc);
	  }
	  function d3_geom_voronoiLeftBreakPoint(arc, directrix) {
	    var site = arc.site, rfocx = site.x, rfocy = site.y, pby2 = rfocy - directrix;
	    if (!pby2) return rfocx;
	    var lArc = arc.P;
	    if (!lArc) return -Infinity;
	    site = lArc.site;
	    var lfocx = site.x, lfocy = site.y, plby2 = lfocy - directrix;
	    if (!plby2) return lfocx;
	    var hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
	    if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
	    return (rfocx + lfocx) / 2;
	  }
	  function d3_geom_voronoiRightBreakPoint(arc, directrix) {
	    var rArc = arc.N;
	    if (rArc) return d3_geom_voronoiLeftBreakPoint(rArc, directrix);
	    var site = arc.site;
	    return site.y === directrix ? site.x : Infinity;
	  }
	  function d3_geom_voronoiCell(site) {
	    this.site = site;
	    this.edges = [];
	  }
	  d3_geom_voronoiCell.prototype.prepare = function() {
	    var halfEdges = this.edges, iHalfEdge = halfEdges.length, edge;
	    while (iHalfEdge--) {
	      edge = halfEdges[iHalfEdge].edge;
	      if (!edge.b || !edge.a) halfEdges.splice(iHalfEdge, 1);
	    }
	    halfEdges.sort(d3_geom_voronoiHalfEdgeOrder);
	    return halfEdges.length;
	  };
	  function d3_geom_voronoiCloseCells(extent) {
	    var x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], x2, y2, x3, y3, cells = d3_geom_voronoiCells, iCell = cells.length, cell, iHalfEdge, halfEdges, nHalfEdges, start, end;
	    while (iCell--) {
	      cell = cells[iCell];
	      if (!cell || !cell.prepare()) continue;
	      halfEdges = cell.edges;
	      nHalfEdges = halfEdges.length;
	      iHalfEdge = 0;
	      while (iHalfEdge < nHalfEdges) {
	        end = halfEdges[iHalfEdge].end(), x3 = end.x, y3 = end.y;
	        start = halfEdges[++iHalfEdge % nHalfEdges].start(), x2 = start.x, y2 = start.y;
	        if (abs(x3 - x2) > ε || abs(y3 - y2) > ε) {
	          halfEdges.splice(iHalfEdge, 0, new d3_geom_voronoiHalfEdge(d3_geom_voronoiCreateBorderEdge(cell.site, end, abs(x3 - x0) < ε && y1 - y3 > ε ? {
	            x: x0,
	            y: abs(x2 - x0) < ε ? y2 : y1
	          } : abs(y3 - y1) < ε && x1 - x3 > ε ? {
	            x: abs(y2 - y1) < ε ? x2 : x1,
	            y: y1
	          } : abs(x3 - x1) < ε && y3 - y0 > ε ? {
	            x: x1,
	            y: abs(x2 - x1) < ε ? y2 : y0
	          } : abs(y3 - y0) < ε && x3 - x0 > ε ? {
	            x: abs(y2 - y0) < ε ? x2 : x0,
	            y: y0
	          } : null), cell.site, null));
	          ++nHalfEdges;
	        }
	      }
	    }
	  }
	  function d3_geom_voronoiHalfEdgeOrder(a, b) {
	    return b.angle - a.angle;
	  }
	  function d3_geom_voronoiCircle() {
	    d3_geom_voronoiRedBlackNode(this);
	    this.x = this.y = this.arc = this.site = this.cy = null;
	  }
	  function d3_geom_voronoiAttachCircle(arc) {
	    var lArc = arc.P, rArc = arc.N;
	    if (!lArc || !rArc) return;
	    var lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
	    if (lSite === rSite) return;
	    var bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx, cy = rSite.y - by;
	    var d = 2 * (ax * cy - ay * cx);
	    if (d >= -ε2) return;
	    var ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d, y = (ax * hc - cx * ha) / d, cy = y + by;
	    var circle = d3_geom_voronoiCirclePool.pop() || new d3_geom_voronoiCircle();
	    circle.arc = arc;
	    circle.site = cSite;
	    circle.x = x + bx;
	    circle.y = cy + Math.sqrt(x * x + y * y);
	    circle.cy = cy;
	    arc.circle = circle;
	    var before = null, node = d3_geom_voronoiCircles._;
	    while (node) {
	      if (circle.y < node.y || circle.y === node.y && circle.x <= node.x) {
	        if (node.L) node = node.L; else {
	          before = node.P;
	          break;
	        }
	      } else {
	        if (node.R) node = node.R; else {
	          before = node;
	          break;
	        }
	      }
	    }
	    d3_geom_voronoiCircles.insert(before, circle);
	    if (!before) d3_geom_voronoiFirstCircle = circle;
	  }
	  function d3_geom_voronoiDetachCircle(arc) {
	    var circle = arc.circle;
	    if (circle) {
	      if (!circle.P) d3_geom_voronoiFirstCircle = circle.N;
	      d3_geom_voronoiCircles.remove(circle);
	      d3_geom_voronoiCirclePool.push(circle);
	      d3_geom_voronoiRedBlackNode(circle);
	      arc.circle = null;
	    }
	  }
	  function d3_geom_voronoiClipEdges(extent) {
	    var edges = d3_geom_voronoiEdges, clip = d3_geom_clipLine(extent[0][0], extent[0][1], extent[1][0], extent[1][1]), i = edges.length, e;
	    while (i--) {
	      e = edges[i];
	      if (!d3_geom_voronoiConnectEdge(e, extent) || !clip(e) || abs(e.a.x - e.b.x) < ε && abs(e.a.y - e.b.y) < ε) {
	        e.a = e.b = null;
	        edges.splice(i, 1);
	      }
	    }
	  }
	  function d3_geom_voronoiConnectEdge(edge, extent) {
	    var vb = edge.b;
	    if (vb) return true;
	    var va = edge.a, x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], lSite = edge.l, rSite = edge.r, lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y, fx = (lx + rx) / 2, fy = (ly + ry) / 2, fm, fb;
	    if (ry === ly) {
	      if (fx < x0 || fx >= x1) return;
	      if (lx > rx) {
	        if (!va) va = {
	          x: fx,
	          y: y0
	        }; else if (va.y >= y1) return;
	        vb = {
	          x: fx,
	          y: y1
	        };
	      } else {
	        if (!va) va = {
	          x: fx,
	          y: y1
	        }; else if (va.y < y0) return;
	        vb = {
	          x: fx,
	          y: y0
	        };
	      }
	    } else {
	      fm = (lx - rx) / (ry - ly);
	      fb = fy - fm * fx;
	      if (fm < -1 || fm > 1) {
	        if (lx > rx) {
	          if (!va) va = {
	            x: (y0 - fb) / fm,
	            y: y0
	          }; else if (va.y >= y1) return;
	          vb = {
	            x: (y1 - fb) / fm,
	            y: y1
	          };
	        } else {
	          if (!va) va = {
	            x: (y1 - fb) / fm,
	            y: y1
	          }; else if (va.y < y0) return;
	          vb = {
	            x: (y0 - fb) / fm,
	            y: y0
	          };
	        }
	      } else {
	        if (ly < ry) {
	          if (!va) va = {
	            x: x0,
	            y: fm * x0 + fb
	          }; else if (va.x >= x1) return;
	          vb = {
	            x: x1,
	            y: fm * x1 + fb
	          };
	        } else {
	          if (!va) va = {
	            x: x1,
	            y: fm * x1 + fb
	          }; else if (va.x < x0) return;
	          vb = {
	            x: x0,
	            y: fm * x0 + fb
	          };
	        }
	      }
	    }
	    edge.a = va;
	    edge.b = vb;
	    return true;
	  }
	  function d3_geom_voronoiEdge(lSite, rSite) {
	    this.l = lSite;
	    this.r = rSite;
	    this.a = this.b = null;
	  }
	  function d3_geom_voronoiCreateEdge(lSite, rSite, va, vb) {
	    var edge = new d3_geom_voronoiEdge(lSite, rSite);
	    d3_geom_voronoiEdges.push(edge);
	    if (va) d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, va);
	    if (vb) d3_geom_voronoiSetEdgeEnd(edge, rSite, lSite, vb);
	    d3_geom_voronoiCells[lSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, lSite, rSite));
	    d3_geom_voronoiCells[rSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, rSite, lSite));
	    return edge;
	  }
	  function d3_geom_voronoiCreateBorderEdge(lSite, va, vb) {
	    var edge = new d3_geom_voronoiEdge(lSite, null);
	    edge.a = va;
	    edge.b = vb;
	    d3_geom_voronoiEdges.push(edge);
	    return edge;
	  }
	  function d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, vertex) {
	    if (!edge.a && !edge.b) {
	      edge.a = vertex;
	      edge.l = lSite;
	      edge.r = rSite;
	    } else if (edge.l === rSite) {
	      edge.b = vertex;
	    } else {
	      edge.a = vertex;
	    }
	  }
	  function d3_geom_voronoiHalfEdge(edge, lSite, rSite) {
	    var va = edge.a, vb = edge.b;
	    this.edge = edge;
	    this.site = lSite;
	    this.angle = rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x) : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y) : Math.atan2(va.x - vb.x, vb.y - va.y);
	  }
	  d3_geom_voronoiHalfEdge.prototype = {
	    start: function() {
	      return this.edge.l === this.site ? this.edge.a : this.edge.b;
	    },
	    end: function() {
	      return this.edge.l === this.site ? this.edge.b : this.edge.a;
	    }
	  };
	  function d3_geom_voronoiRedBlackTree() {
	    this._ = null;
	  }
	  function d3_geom_voronoiRedBlackNode(node) {
	    node.U = node.C = node.L = node.R = node.P = node.N = null;
	  }
	  d3_geom_voronoiRedBlackTree.prototype = {
	    insert: function(after, node) {
	      var parent, grandpa, uncle;
	      if (after) {
	        node.P = after;
	        node.N = after.N;
	        if (after.N) after.N.P = node;
	        after.N = node;
	        if (after.R) {
	          after = after.R;
	          while (after.L) after = after.L;
	          after.L = node;
	        } else {
	          after.R = node;
	        }
	        parent = after;
	      } else if (this._) {
	        after = d3_geom_voronoiRedBlackFirst(this._);
	        node.P = null;
	        node.N = after;
	        after.P = after.L = node;
	        parent = after;
	      } else {
	        node.P = node.N = null;
	        this._ = node;
	        parent = null;
	      }
	      node.L = node.R = null;
	      node.U = parent;
	      node.C = true;
	      after = node;
	      while (parent && parent.C) {
	        grandpa = parent.U;
	        if (parent === grandpa.L) {
	          uncle = grandpa.R;
	          if (uncle && uncle.C) {
	            parent.C = uncle.C = false;
	            grandpa.C = true;
	            after = grandpa;
	          } else {
	            if (after === parent.R) {
	              d3_geom_voronoiRedBlackRotateLeft(this, parent);
	              after = parent;
	              parent = after.U;
	            }
	            parent.C = false;
	            grandpa.C = true;
	            d3_geom_voronoiRedBlackRotateRight(this, grandpa);
	          }
	        } else {
	          uncle = grandpa.L;
	          if (uncle && uncle.C) {
	            parent.C = uncle.C = false;
	            grandpa.C = true;
	            after = grandpa;
	          } else {
	            if (after === parent.L) {
	              d3_geom_voronoiRedBlackRotateRight(this, parent);
	              after = parent;
	              parent = after.U;
	            }
	            parent.C = false;
	            grandpa.C = true;
	            d3_geom_voronoiRedBlackRotateLeft(this, grandpa);
	          }
	        }
	        parent = after.U;
	      }
	      this._.C = false;
	    },
	    remove: function(node) {
	      if (node.N) node.N.P = node.P;
	      if (node.P) node.P.N = node.N;
	      node.N = node.P = null;
	      var parent = node.U, sibling, left = node.L, right = node.R, next, red;
	      if (!left) next = right; else if (!right) next = left; else next = d3_geom_voronoiRedBlackFirst(right);
	      if (parent) {
	        if (parent.L === node) parent.L = next; else parent.R = next;
	      } else {
	        this._ = next;
	      }
	      if (left && right) {
	        red = next.C;
	        next.C = node.C;
	        next.L = left;
	        left.U = next;
	        if (next !== right) {
	          parent = next.U;
	          next.U = node.U;
	          node = next.R;
	          parent.L = node;
	          next.R = right;
	          right.U = next;
	        } else {
	          next.U = parent;
	          parent = next;
	          node = next.R;
	        }
	      } else {
	        red = node.C;
	        node = next;
	      }
	      if (node) node.U = parent;
	      if (red) return;
	      if (node && node.C) {
	        node.C = false;
	        return;
	      }
	      do {
	        if (node === this._) break;
	        if (node === parent.L) {
	          sibling = parent.R;
	          if (sibling.C) {
	            sibling.C = false;
	            parent.C = true;
	            d3_geom_voronoiRedBlackRotateLeft(this, parent);
	            sibling = parent.R;
	          }
	          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
	            if (!sibling.R || !sibling.R.C) {
	              sibling.L.C = false;
	              sibling.C = true;
	              d3_geom_voronoiRedBlackRotateRight(this, sibling);
	              sibling = parent.R;
	            }
	            sibling.C = parent.C;
	            parent.C = sibling.R.C = false;
	            d3_geom_voronoiRedBlackRotateLeft(this, parent);
	            node = this._;
	            break;
	          }
	        } else {
	          sibling = parent.L;
	          if (sibling.C) {
	            sibling.C = false;
	            parent.C = true;
	            d3_geom_voronoiRedBlackRotateRight(this, parent);
	            sibling = parent.L;
	          }
	          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
	            if (!sibling.L || !sibling.L.C) {
	              sibling.R.C = false;
	              sibling.C = true;
	              d3_geom_voronoiRedBlackRotateLeft(this, sibling);
	              sibling = parent.L;
	            }
	            sibling.C = parent.C;
	            parent.C = sibling.L.C = false;
	            d3_geom_voronoiRedBlackRotateRight(this, parent);
	            node = this._;
	            break;
	          }
	        }
	        sibling.C = true;
	        node = parent;
	        parent = parent.U;
	      } while (!node.C);
	      if (node) node.C = false;
	    }
	  };
	  function d3_geom_voronoiRedBlackRotateLeft(tree, node) {
	    var p = node, q = node.R, parent = p.U;
	    if (parent) {
	      if (parent.L === p) parent.L = q; else parent.R = q;
	    } else {
	      tree._ = q;
	    }
	    q.U = parent;
	    p.U = q;
	    p.R = q.L;
	    if (p.R) p.R.U = p;
	    q.L = p;
	  }
	  function d3_geom_voronoiRedBlackRotateRight(tree, node) {
	    var p = node, q = node.L, parent = p.U;
	    if (parent) {
	      if (parent.L === p) parent.L = q; else parent.R = q;
	    } else {
	      tree._ = q;
	    }
	    q.U = parent;
	    p.U = q;
	    p.L = q.R;
	    if (p.L) p.L.U = p;
	    q.R = p;
	  }
	  function d3_geom_voronoiRedBlackFirst(node) {
	    while (node.L) node = node.L;
	    return node;
	  }
	  function d3_geom_voronoi(sites, bbox) {
	    var site = sites.sort(d3_geom_voronoiVertexOrder).pop(), x0, y0, circle;
	    d3_geom_voronoiEdges = [];
	    d3_geom_voronoiCells = new Array(sites.length);
	    d3_geom_voronoiBeaches = new d3_geom_voronoiRedBlackTree();
	    d3_geom_voronoiCircles = new d3_geom_voronoiRedBlackTree();
	    while (true) {
	      circle = d3_geom_voronoiFirstCircle;
	      if (site && (!circle || site.y < circle.y || site.y === circle.y && site.x < circle.x)) {
	        if (site.x !== x0 || site.y !== y0) {
	          d3_geom_voronoiCells[site.i] = new d3_geom_voronoiCell(site);
	          d3_geom_voronoiAddBeach(site);
	          x0 = site.x, y0 = site.y;
	        }
	        site = sites.pop();
	      } else if (circle) {
	        d3_geom_voronoiRemoveBeach(circle.arc);
	      } else {
	        break;
	      }
	    }
	    if (bbox) d3_geom_voronoiClipEdges(bbox), d3_geom_voronoiCloseCells(bbox);
	    var diagram = {
	      cells: d3_geom_voronoiCells,
	      edges: d3_geom_voronoiEdges
	    };
	    d3_geom_voronoiBeaches = d3_geom_voronoiCircles = d3_geom_voronoiEdges = d3_geom_voronoiCells = null;
	    return diagram;
	  }
	  function d3_geom_voronoiVertexOrder(a, b) {
	    return b.y - a.y || b.x - a.x;
	  }
	  d3.geom.voronoi = function(points) {
	    var x = d3_geom_pointX, y = d3_geom_pointY, fx = x, fy = y, clipExtent = d3_geom_voronoiClipExtent;
	    if (points) return voronoi(points);
	    function voronoi(data) {
	      var polygons = new Array(data.length), x0 = clipExtent[0][0], y0 = clipExtent[0][1], x1 = clipExtent[1][0], y1 = clipExtent[1][1];
	      d3_geom_voronoi(sites(data), clipExtent).cells.forEach(function(cell, i) {
	        var edges = cell.edges, site = cell.site, polygon = polygons[i] = edges.length ? edges.map(function(e) {
	          var s = e.start();
	          return [ s.x, s.y ];
	        }) : site.x >= x0 && site.x <= x1 && site.y >= y0 && site.y <= y1 ? [ [ x0, y1 ], [ x1, y1 ], [ x1, y0 ], [ x0, y0 ] ] : [];
	        polygon.point = data[i];
	      });
	      return polygons;
	    }
	    function sites(data) {
	      return data.map(function(d, i) {
	        return {
	          x: Math.round(fx(d, i) / ε) * ε,
	          y: Math.round(fy(d, i) / ε) * ε,
	          i: i
	        };
	      });
	    }
	    voronoi.links = function(data) {
	      return d3_geom_voronoi(sites(data)).edges.filter(function(edge) {
	        return edge.l && edge.r;
	      }).map(function(edge) {
	        return {
	          source: data[edge.l.i],
	          target: data[edge.r.i]
	        };
	      });
	    };
	    voronoi.triangles = function(data) {
	      var triangles = [];
	      d3_geom_voronoi(sites(data)).cells.forEach(function(cell, i) {
	        var site = cell.site, edges = cell.edges.sort(d3_geom_voronoiHalfEdgeOrder), j = -1, m = edges.length, e0, s0, e1 = edges[m - 1].edge, s1 = e1.l === site ? e1.r : e1.l;
	        while (++j < m) {
	          e0 = e1;
	          s0 = s1;
	          e1 = edges[j].edge;
	          s1 = e1.l === site ? e1.r : e1.l;
	          if (i < s0.i && i < s1.i && d3_geom_voronoiTriangleArea(site, s0, s1) < 0) {
	            triangles.push([ data[i], data[s0.i], data[s1.i] ]);
	          }
	        }
	      });
	      return triangles;
	    };
	    voronoi.x = function(_) {
	      return arguments.length ? (fx = d3_functor(x = _), voronoi) : x;
	    };
	    voronoi.y = function(_) {
	      return arguments.length ? (fy = d3_functor(y = _), voronoi) : y;
	    };
	    voronoi.clipExtent = function(_) {
	      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent;
	      clipExtent = _ == null ? d3_geom_voronoiClipExtent : _;
	      return voronoi;
	    };
	    voronoi.size = function(_) {
	      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent && clipExtent[1];
	      return voronoi.clipExtent(_ && [ [ 0, 0 ], _ ]);
	    };
	    return voronoi;
	  };
	  var d3_geom_voronoiClipExtent = [ [ -1e6, -1e6 ], [ 1e6, 1e6 ] ];
	  function d3_geom_voronoiTriangleArea(a, b, c) {
	    return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
	  }
	  d3.geom.delaunay = function(vertices) {
	    return d3.geom.voronoi().triangles(vertices);
	  };
	  d3.geom.quadtree = function(points, x1, y1, x2, y2) {
	    var x = d3_geom_pointX, y = d3_geom_pointY, compat;
	    if (compat = arguments.length) {
	      x = d3_geom_quadtreeCompatX;
	      y = d3_geom_quadtreeCompatY;
	      if (compat === 3) {
	        y2 = y1;
	        x2 = x1;
	        y1 = x1 = 0;
	      }
	      return quadtree(points);
	    }
	    function quadtree(data) {
	      var d, fx = d3_functor(x), fy = d3_functor(y), xs, ys, i, n, x1_, y1_, x2_, y2_;
	      if (x1 != null) {
	        x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
	      } else {
	        x2_ = y2_ = -(x1_ = y1_ = Infinity);
	        xs = [], ys = [];
	        n = data.length;
	        if (compat) for (i = 0; i < n; ++i) {
	          d = data[i];
	          if (d.x < x1_) x1_ = d.x;
	          if (d.y < y1_) y1_ = d.y;
	          if (d.x > x2_) x2_ = d.x;
	          if (d.y > y2_) y2_ = d.y;
	          xs.push(d.x);
	          ys.push(d.y);
	        } else for (i = 0; i < n; ++i) {
	          var x_ = +fx(d = data[i], i), y_ = +fy(d, i);
	          if (x_ < x1_) x1_ = x_;
	          if (y_ < y1_) y1_ = y_;
	          if (x_ > x2_) x2_ = x_;
	          if (y_ > y2_) y2_ = y_;
	          xs.push(x_);
	          ys.push(y_);
	        }
	      }
	      var dx = x2_ - x1_, dy = y2_ - y1_;
	      if (dx > dy) y2_ = y1_ + dx; else x2_ = x1_ + dy;
	      function insert(n, d, x, y, x1, y1, x2, y2) {
	        if (isNaN(x) || isNaN(y)) return;
	        if (n.leaf) {
	          var nx = n.x, ny = n.y;
	          if (nx != null) {
	            if (abs(nx - x) + abs(ny - y) < .01) {
	              insertChild(n, d, x, y, x1, y1, x2, y2);
	            } else {
	              var nPoint = n.point;
	              n.x = n.y = n.point = null;
	              insertChild(n, nPoint, nx, ny, x1, y1, x2, y2);
	              insertChild(n, d, x, y, x1, y1, x2, y2);
	            }
	          } else {
	            n.x = x, n.y = y, n.point = d;
	          }
	        } else {
	          insertChild(n, d, x, y, x1, y1, x2, y2);
	        }
	      }
	      function insertChild(n, d, x, y, x1, y1, x2, y2) {
	        var xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym, i = below << 1 | right;
	        n.leaf = false;
	        n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
	        if (right) x1 = xm; else x2 = xm;
	        if (below) y1 = ym; else y2 = ym;
	        insert(n, d, x, y, x1, y1, x2, y2);
	      }
	      var root = d3_geom_quadtreeNode();
	      root.add = function(d) {
	        insert(root, d, +fx(d, ++i), +fy(d, i), x1_, y1_, x2_, y2_);
	      };
	      root.visit = function(f) {
	        d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
	      };
	      root.find = function(point) {
	        return d3_geom_quadtreeFind(root, point[0], point[1], x1_, y1_, x2_, y2_);
	      };
	      i = -1;
	      if (x1 == null) {
	        while (++i < n) {
	          insert(root, data[i], xs[i], ys[i], x1_, y1_, x2_, y2_);
	        }
	        --i;
	      } else data.forEach(root.add);
	      xs = ys = data = d = null;
	      return root;
	    }
	    quadtree.x = function(_) {
	      return arguments.length ? (x = _, quadtree) : x;
	    };
	    quadtree.y = function(_) {
	      return arguments.length ? (y = _, quadtree) : y;
	    };
	    quadtree.extent = function(_) {
	      if (!arguments.length) return x1 == null ? null : [ [ x1, y1 ], [ x2, y2 ] ];
	      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], 
	      y2 = +_[1][1];
	      return quadtree;
	    };
	    quadtree.size = function(_) {
	      if (!arguments.length) return x1 == null ? null : [ x2 - x1, y2 - y1 ];
	      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
	      return quadtree;
	    };
	    return quadtree;
	  };
	  function d3_geom_quadtreeCompatX(d) {
	    return d.x;
	  }
	  function d3_geom_quadtreeCompatY(d) {
	    return d.y;
	  }
	  function d3_geom_quadtreeNode() {
	    return {
	      leaf: true,
	      nodes: [],
	      point: null,
	      x: null,
	      y: null
	    };
	  }
	  function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
	    if (!f(node, x1, y1, x2, y2)) {
	      var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, children = node.nodes;
	      if (children[0]) d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
	      if (children[1]) d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
	      if (children[2]) d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
	      if (children[3]) d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
	    }
	  }
	  function d3_geom_quadtreeFind(root, x, y, x0, y0, x3, y3) {
	    var minDistance2 = Infinity, closestPoint;
	    (function find(node, x1, y1, x2, y2) {
	      if (x1 > x3 || y1 > y3 || x2 < x0 || y2 < y0) return;
	      if (point = node.point) {
	        var point, dx = x - node.x, dy = y - node.y, distance2 = dx * dx + dy * dy;
	        if (distance2 < minDistance2) {
	          var distance = Math.sqrt(minDistance2 = distance2);
	          x0 = x - distance, y0 = y - distance;
	          x3 = x + distance, y3 = y + distance;
	          closestPoint = point;
	        }
	      }
	      var children = node.nodes, xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym;
	      for (var i = below << 1 | right, j = i + 4; i < j; ++i) {
	        if (node = children[i & 3]) switch (i & 3) {
	         case 0:
	          find(node, x1, y1, xm, ym);
	          break;

	         case 1:
	          find(node, xm, y1, x2, ym);
	          break;

	         case 2:
	          find(node, x1, ym, xm, y2);
	          break;

	         case 3:
	          find(node, xm, ym, x2, y2);
	          break;
	        }
	      }
	    })(root, x0, y0, x3, y3);
	    return closestPoint;
	  }
	  d3.interpolateRgb = d3_interpolateRgb;
	  function d3_interpolateRgb(a, b) {
	    a = d3.rgb(a);
	    b = d3.rgb(b);
	    var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
	    return function(t) {
	      return "#" + d3_rgb_hex(Math.round(ar + br * t)) + d3_rgb_hex(Math.round(ag + bg * t)) + d3_rgb_hex(Math.round(ab + bb * t));
	    };
	  }
	  d3.interpolateObject = d3_interpolateObject;
	  function d3_interpolateObject(a, b) {
	    var i = {}, c = {}, k;
	    for (k in a) {
	      if (k in b) {
	        i[k] = d3_interpolate(a[k], b[k]);
	      } else {
	        c[k] = a[k];
	      }
	    }
	    for (k in b) {
	      if (!(k in a)) {
	        c[k] = b[k];
	      }
	    }
	    return function(t) {
	      for (k in i) c[k] = i[k](t);
	      return c;
	    };
	  }
	  d3.interpolateNumber = d3_interpolateNumber;
	  function d3_interpolateNumber(a, b) {
	    a = +a, b = +b;
	    return function(t) {
	      return a * (1 - t) + b * t;
	    };
	  }
	  d3.interpolateString = d3_interpolateString;
	  function d3_interpolateString(a, b) {
	    var bi = d3_interpolate_numberA.lastIndex = d3_interpolate_numberB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
	    a = a + "", b = b + "";
	    while ((am = d3_interpolate_numberA.exec(a)) && (bm = d3_interpolate_numberB.exec(b))) {
	      if ((bs = bm.index) > bi) {
	        bs = b.slice(bi, bs);
	        if (s[i]) s[i] += bs; else s[++i] = bs;
	      }
	      if ((am = am[0]) === (bm = bm[0])) {
	        if (s[i]) s[i] += bm; else s[++i] = bm;
	      } else {
	        s[++i] = null;
	        q.push({
	          i: i,
	          x: d3_interpolateNumber(am, bm)
	        });
	      }
	      bi = d3_interpolate_numberB.lastIndex;
	    }
	    if (bi < b.length) {
	      bs = b.slice(bi);
	      if (s[i]) s[i] += bs; else s[++i] = bs;
	    }
	    return s.length < 2 ? q[0] ? (b = q[0].x, function(t) {
	      return b(t) + "";
	    }) : function() {
	      return b;
	    } : (b = q.length, function(t) {
	      for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
	      return s.join("");
	    });
	  }
	  var d3_interpolate_numberA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, d3_interpolate_numberB = new RegExp(d3_interpolate_numberA.source, "g");
	  d3.interpolate = d3_interpolate;
	  function d3_interpolate(a, b) {
	    var i = d3.interpolators.length, f;
	    while (--i >= 0 && !(f = d3.interpolators[i](a, b))) ;
	    return f;
	  }
	  d3.interpolators = [ function(a, b) {
	    var t = typeof b;
	    return (t === "string" ? d3_rgb_names.has(b.toLowerCase()) || /^(#|rgb\(|hsl\()/i.test(b) ? d3_interpolateRgb : d3_interpolateString : b instanceof d3_color ? d3_interpolateRgb : Array.isArray(b) ? d3_interpolateArray : t === "object" && isNaN(b) ? d3_interpolateObject : d3_interpolateNumber)(a, b);
	  } ];
	  d3.interpolateArray = d3_interpolateArray;
	  function d3_interpolateArray(a, b) {
	    var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
	    for (i = 0; i < n0; ++i) x.push(d3_interpolate(a[i], b[i]));
	    for (;i < na; ++i) c[i] = a[i];
	    for (;i < nb; ++i) c[i] = b[i];
	    return function(t) {
	      for (i = 0; i < n0; ++i) c[i] = x[i](t);
	      return c;
	    };
	  }
	  var d3_ease_default = function() {
	    return d3_identity;
	  };
	  var d3_ease = d3.map({
	    linear: d3_ease_default,
	    poly: d3_ease_poly,
	    quad: function() {
	      return d3_ease_quad;
	    },
	    cubic: function() {
	      return d3_ease_cubic;
	    },
	    sin: function() {
	      return d3_ease_sin;
	    },
	    exp: function() {
	      return d3_ease_exp;
	    },
	    circle: function() {
	      return d3_ease_circle;
	    },
	    elastic: d3_ease_elastic,
	    back: d3_ease_back,
	    bounce: function() {
	      return d3_ease_bounce;
	    }
	  });
	  var d3_ease_mode = d3.map({
	    "in": d3_identity,
	    out: d3_ease_reverse,
	    "in-out": d3_ease_reflect,
	    "out-in": function(f) {
	      return d3_ease_reflect(d3_ease_reverse(f));
	    }
	  });
	  d3.ease = function(name) {
	    var i = name.indexOf("-"), t = i >= 0 ? name.slice(0, i) : name, m = i >= 0 ? name.slice(i + 1) : "in";
	    t = d3_ease.get(t) || d3_ease_default;
	    m = d3_ease_mode.get(m) || d3_identity;
	    return d3_ease_clamp(m(t.apply(null, d3_arraySlice.call(arguments, 1))));
	  };
	  function d3_ease_clamp(f) {
	    return function(t) {
	      return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
	    };
	  }
	  function d3_ease_reverse(f) {
	    return function(t) {
	      return 1 - f(1 - t);
	    };
	  }
	  function d3_ease_reflect(f) {
	    return function(t) {
	      return .5 * (t < .5 ? f(2 * t) : 2 - f(2 - 2 * t));
	    };
	  }
	  function d3_ease_quad(t) {
	    return t * t;
	  }
	  function d3_ease_cubic(t) {
	    return t * t * t;
	  }
	  function d3_ease_cubicInOut(t) {
	    if (t <= 0) return 0;
	    if (t >= 1) return 1;
	    var t2 = t * t, t3 = t2 * t;
	    return 4 * (t < .5 ? t3 : 3 * (t - t2) + t3 - .75);
	  }
	  function d3_ease_poly(e) {
	    return function(t) {
	      return Math.pow(t, e);
	    };
	  }
	  function d3_ease_sin(t) {
	    return 1 - Math.cos(t * halfπ);
	  }
	  function d3_ease_exp(t) {
	    return Math.pow(2, 10 * (t - 1));
	  }
	  function d3_ease_circle(t) {
	    return 1 - Math.sqrt(1 - t * t);
	  }
	  function d3_ease_elastic(a, p) {
	    var s;
	    if (arguments.length < 2) p = .45;
	    if (arguments.length) s = p / τ * Math.asin(1 / a); else a = 1, s = p / 4;
	    return function(t) {
	      return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * τ / p);
	    };
	  }
	  function d3_ease_back(s) {
	    if (!s) s = 1.70158;
	    return function(t) {
	      return t * t * ((s + 1) * t - s);
	    };
	  }
	  function d3_ease_bounce(t) {
	    return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
	  }
	  d3.interpolateHcl = d3_interpolateHcl;
	  function d3_interpolateHcl(a, b) {
	    a = d3.hcl(a);
	    b = d3.hcl(b);
	    var ah = a.h, ac = a.c, al = a.l, bh = b.h - ah, bc = b.c - ac, bl = b.l - al;
	    if (isNaN(bc)) bc = 0, ac = isNaN(ac) ? b.c : ac;
	    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
	    return function(t) {
	      return d3_hcl_lab(ah + bh * t, ac + bc * t, al + bl * t) + "";
	    };
	  }
	  d3.interpolateHsl = d3_interpolateHsl;
	  function d3_interpolateHsl(a, b) {
	    a = d3.hsl(a);
	    b = d3.hsl(b);
	    var ah = a.h, as = a.s, al = a.l, bh = b.h - ah, bs = b.s - as, bl = b.l - al;
	    if (isNaN(bs)) bs = 0, as = isNaN(as) ? b.s : as;
	    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
	    return function(t) {
	      return d3_hsl_rgb(ah + bh * t, as + bs * t, al + bl * t) + "";
	    };
	  }
	  d3.interpolateLab = d3_interpolateLab;
	  function d3_interpolateLab(a, b) {
	    a = d3.lab(a);
	    b = d3.lab(b);
	    var al = a.l, aa = a.a, ab = a.b, bl = b.l - al, ba = b.a - aa, bb = b.b - ab;
	    return function(t) {
	      return d3_lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + "";
	    };
	  }
	  d3.interpolateRound = d3_interpolateRound;
	  function d3_interpolateRound(a, b) {
	    b -= a;
	    return function(t) {
	      return Math.round(a + b * t);
	    };
	  }
	  d3.transform = function(string) {
	    var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
	    return (d3.transform = function(string) {
	      if (string != null) {
	        g.setAttribute("transform", string);
	        var t = g.transform.baseVal.consolidate();
	      }
	      return new d3_transform(t ? t.matrix : d3_transformIdentity);
	    })(string);
	  };
	  function d3_transform(m) {
	    var r0 = [ m.a, m.b ], r1 = [ m.c, m.d ], kx = d3_transformNormalize(r0), kz = d3_transformDot(r0, r1), ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
	    if (r0[0] * r1[1] < r1[0] * r0[1]) {
	      r0[0] *= -1;
	      r0[1] *= -1;
	      kx *= -1;
	      kz *= -1;
	    }
	    this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
	    this.translate = [ m.e, m.f ];
	    this.scale = [ kx, ky ];
	    this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
	  }
	  d3_transform.prototype.toString = function() {
	    return "translate(" + this.translate + ")rotate(" + this.rotate + ")skewX(" + this.skew + ")scale(" + this.scale + ")";
	  };
	  function d3_transformDot(a, b) {
	    return a[0] * b[0] + a[1] * b[1];
	  }
	  function d3_transformNormalize(a) {
	    var k = Math.sqrt(d3_transformDot(a, a));
	    if (k) {
	      a[0] /= k;
	      a[1] /= k;
	    }
	    return k;
	  }
	  function d3_transformCombine(a, b, k) {
	    a[0] += k * b[0];
	    a[1] += k * b[1];
	    return a;
	  }
	  var d3_transformIdentity = {
	    a: 1,
	    b: 0,
	    c: 0,
	    d: 1,
	    e: 0,
	    f: 0
	  };
	  d3.interpolateTransform = d3_interpolateTransform;
	  function d3_interpolateTransformPop(s) {
	    return s.length ? s.pop() + "," : "";
	  }
	  function d3_interpolateTranslate(ta, tb, s, q) {
	    if (ta[0] !== tb[0] || ta[1] !== tb[1]) {
	      var i = s.push("translate(", null, ",", null, ")");
	      q.push({
	        i: i - 4,
	        x: d3_interpolateNumber(ta[0], tb[0])
	      }, {
	        i: i - 2,
	        x: d3_interpolateNumber(ta[1], tb[1])
	      });
	    } else if (tb[0] || tb[1]) {
	      s.push("translate(" + tb + ")");
	    }
	  }
	  function d3_interpolateRotate(ra, rb, s, q) {
	    if (ra !== rb) {
	      if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360;
	      q.push({
	        i: s.push(d3_interpolateTransformPop(s) + "rotate(", null, ")") - 2,
	        x: d3_interpolateNumber(ra, rb)
	      });
	    } else if (rb) {
	      s.push(d3_interpolateTransformPop(s) + "rotate(" + rb + ")");
	    }
	  }
	  function d3_interpolateSkew(wa, wb, s, q) {
	    if (wa !== wb) {
	      q.push({
	        i: s.push(d3_interpolateTransformPop(s) + "skewX(", null, ")") - 2,
	        x: d3_interpolateNumber(wa, wb)
	      });
	    } else if (wb) {
	      s.push(d3_interpolateTransformPop(s) + "skewX(" + wb + ")");
	    }
	  }
	  function d3_interpolateScale(ka, kb, s, q) {
	    if (ka[0] !== kb[0] || ka[1] !== kb[1]) {
	      var i = s.push(d3_interpolateTransformPop(s) + "scale(", null, ",", null, ")");
	      q.push({
	        i: i - 4,
	        x: d3_interpolateNumber(ka[0], kb[0])
	      }, {
	        i: i - 2,
	        x: d3_interpolateNumber(ka[1], kb[1])
	      });
	    } else if (kb[0] !== 1 || kb[1] !== 1) {
	      s.push(d3_interpolateTransformPop(s) + "scale(" + kb + ")");
	    }
	  }
	  function d3_interpolateTransform(a, b) {
	    var s = [], q = [];
	    a = d3.transform(a), b = d3.transform(b);
	    d3_interpolateTranslate(a.translate, b.translate, s, q);
	    d3_interpolateRotate(a.rotate, b.rotate, s, q);
	    d3_interpolateSkew(a.skew, b.skew, s, q);
	    d3_interpolateScale(a.scale, b.scale, s, q);
	    a = b = null;
	    return function(t) {
	      var i = -1, n = q.length, o;
	      while (++i < n) s[(o = q[i]).i] = o.x(t);
	      return s.join("");
	    };
	  }
	  function d3_uninterpolateNumber(a, b) {
	    b = (b -= a = +a) || 1 / b;
	    return function(x) {
	      return (x - a) / b;
	    };
	  }
	  function d3_uninterpolateClamp(a, b) {
	    b = (b -= a = +a) || 1 / b;
	    return function(x) {
	      return Math.max(0, Math.min(1, (x - a) / b));
	    };
	  }
	  d3.layout = {};
	  d3.layout.bundle = function() {
	    return function(links) {
	      var paths = [], i = -1, n = links.length;
	      while (++i < n) paths.push(d3_layout_bundlePath(links[i]));
	      return paths;
	    };
	  };
	  function d3_layout_bundlePath(link) {
	    var start = link.source, end = link.target, lca = d3_layout_bundleLeastCommonAncestor(start, end), points = [ start ];
	    while (start !== lca) {
	      start = start.parent;
	      points.push(start);
	    }
	    var k = points.length;
	    while (end !== lca) {
	      points.splice(k, 0, end);
	      end = end.parent;
	    }
	    return points;
	  }
	  function d3_layout_bundleAncestors(node) {
	    var ancestors = [], parent = node.parent;
	    while (parent != null) {
	      ancestors.push(node);
	      node = parent;
	      parent = parent.parent;
	    }
	    ancestors.push(node);
	    return ancestors;
	  }
	  function d3_layout_bundleLeastCommonAncestor(a, b) {
	    if (a === b) return a;
	    var aNodes = d3_layout_bundleAncestors(a), bNodes = d3_layout_bundleAncestors(b), aNode = aNodes.pop(), bNode = bNodes.pop(), sharedNode = null;
	    while (aNode === bNode) {
	      sharedNode = aNode;
	      aNode = aNodes.pop();
	      bNode = bNodes.pop();
	    }
	    return sharedNode;
	  }
	  d3.layout.chord = function() {
	    var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
	    function relayout() {
	      var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
	      chords = [];
	      groups = [];
	      k = 0, i = -1;
	      while (++i < n) {
	        x = 0, j = -1;
	        while (++j < n) {
	          x += matrix[i][j];
	        }
	        groupSums.push(x);
	        subgroupIndex.push(d3.range(n));
	        k += x;
	      }
	      if (sortGroups) {
	        groupIndex.sort(function(a, b) {
	          return sortGroups(groupSums[a], groupSums[b]);
	        });
	      }
	      if (sortSubgroups) {
	        subgroupIndex.forEach(function(d, i) {
	          d.sort(function(a, b) {
	            return sortSubgroups(matrix[i][a], matrix[i][b]);
	          });
	        });
	      }
	      k = (τ - padding * n) / k;
	      x = 0, i = -1;
	      while (++i < n) {
	        x0 = x, j = -1;
	        while (++j < n) {
	          var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
	          subgroups[di + "-" + dj] = {
	            index: di,
	            subindex: dj,
	            startAngle: a0,
	            endAngle: a1,
	            value: v
	          };
	        }
	        groups[di] = {
	          index: di,
	          startAngle: x0,
	          endAngle: x,
	          value: groupSums[di]
	        };
	        x += padding;
	      }
	      i = -1;
	      while (++i < n) {
	        j = i - 1;
	        while (++j < n) {
	          var source = subgroups[i + "-" + j], target = subgroups[j + "-" + i];
	          if (source.value || target.value) {
	            chords.push(source.value < target.value ? {
	              source: target,
	              target: source
	            } : {
	              source: source,
	              target: target
	            });
	          }
	        }
	      }
	      if (sortChords) resort();
	    }
	    function resort() {
	      chords.sort(function(a, b) {
	        return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
	      });
	    }
	    chord.matrix = function(x) {
	      if (!arguments.length) return matrix;
	      n = (matrix = x) && matrix.length;
	      chords = groups = null;
	      return chord;
	    };
	    chord.padding = function(x) {
	      if (!arguments.length) return padding;
	      padding = x;
	      chords = groups = null;
	      return chord;
	    };
	    chord.sortGroups = function(x) {
	      if (!arguments.length) return sortGroups;
	      sortGroups = x;
	      chords = groups = null;
	      return chord;
	    };
	    chord.sortSubgroups = function(x) {
	      if (!arguments.length) return sortSubgroups;
	      sortSubgroups = x;
	      chords = null;
	      return chord;
	    };
	    chord.sortChords = function(x) {
	      if (!arguments.length) return sortChords;
	      sortChords = x;
	      if (chords) resort();
	      return chord;
	    };
	    chord.chords = function() {
	      if (!chords) relayout();
	      return chords;
	    };
	    chord.groups = function() {
	      if (!groups) relayout();
	      return groups;
	    };
	    return chord;
	  };
	  d3.layout.force = function() {
	    var force = {}, event = d3.dispatch("start", "tick", "end"), timer, size = [ 1, 1 ], drag, alpha, friction = .9, linkDistance = d3_layout_forceLinkDistance, linkStrength = d3_layout_forceLinkStrength, charge = -30, chargeDistance2 = d3_layout_forceChargeDistance2, gravity = .1, theta2 = .64, nodes = [], links = [], distances, strengths, charges;
	    function repulse(node) {
	      return function(quad, x1, _, x2) {
	        if (quad.point !== node) {
	          var dx = quad.cx - node.x, dy = quad.cy - node.y, dw = x2 - x1, dn = dx * dx + dy * dy;
	          if (dw * dw / theta2 < dn) {
	            if (dn < chargeDistance2) {
	              var k = quad.charge / dn;
	              node.px -= dx * k;
	              node.py -= dy * k;
	            }
	            return true;
	          }
	          if (quad.point && dn && dn < chargeDistance2) {
	            var k = quad.pointCharge / dn;
	            node.px -= dx * k;
	            node.py -= dy * k;
	          }
	        }
	        return !quad.charge;
	      };
	    }
	    force.tick = function() {
	      if ((alpha *= .99) < .005) {
	        timer = null;
	        event.end({
	          type: "end",
	          alpha: alpha = 0
	        });
	        return true;
	      }
	      var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
	      for (i = 0; i < m; ++i) {
	        o = links[i];
	        s = o.source;
	        t = o.target;
	        x = t.x - s.x;
	        y = t.y - s.y;
	        if (l = x * x + y * y) {
	          l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
	          x *= l;
	          y *= l;
	          t.x -= x * (k = s.weight + t.weight ? s.weight / (s.weight + t.weight) : .5);
	          t.y -= y * k;
	          s.x += x * (k = 1 - k);
	          s.y += y * k;
	        }
	      }
	      if (k = alpha * gravity) {
	        x = size[0] / 2;
	        y = size[1] / 2;
	        i = -1;
	        if (k) while (++i < n) {
	          o = nodes[i];
	          o.x += (x - o.x) * k;
	          o.y += (y - o.y) * k;
	        }
	      }
	      if (charge) {
	        d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
	        i = -1;
	        while (++i < n) {
	          if (!(o = nodes[i]).fixed) {
	            q.visit(repulse(o));
	          }
	        }
	      }
	      i = -1;
	      while (++i < n) {
	        o = nodes[i];
	        if (o.fixed) {
	          o.x = o.px;
	          o.y = o.py;
	        } else {
	          o.x -= (o.px - (o.px = o.x)) * friction;
	          o.y -= (o.py - (o.py = o.y)) * friction;
	        }
	      }
	      event.tick({
	        type: "tick",
	        alpha: alpha
	      });
	    };
	    force.nodes = function(x) {
	      if (!arguments.length) return nodes;
	      nodes = x;
	      return force;
	    };
	    force.links = function(x) {
	      if (!arguments.length) return links;
	      links = x;
	      return force;
	    };
	    force.size = function(x) {
	      if (!arguments.length) return size;
	      size = x;
	      return force;
	    };
	    force.linkDistance = function(x) {
	      if (!arguments.length) return linkDistance;
	      linkDistance = typeof x === "function" ? x : +x;
	      return force;
	    };
	    force.distance = force.linkDistance;
	    force.linkStrength = function(x) {
	      if (!arguments.length) return linkStrength;
	      linkStrength = typeof x === "function" ? x : +x;
	      return force;
	    };
	    force.friction = function(x) {
	      if (!arguments.length) return friction;
	      friction = +x;
	      return force;
	    };
	    force.charge = function(x) {
	      if (!arguments.length) return charge;
	      charge = typeof x === "function" ? x : +x;
	      return force;
	    };
	    force.chargeDistance = function(x) {
	      if (!arguments.length) return Math.sqrt(chargeDistance2);
	      chargeDistance2 = x * x;
	      return force;
	    };
	    force.gravity = function(x) {
	      if (!arguments.length) return gravity;
	      gravity = +x;
	      return force;
	    };
	    force.theta = function(x) {
	      if (!arguments.length) return Math.sqrt(theta2);
	      theta2 = x * x;
	      return force;
	    };
	    force.alpha = function(x) {
	      if (!arguments.length) return alpha;
	      x = +x;
	      if (alpha) {
	        if (x > 0) {
	          alpha = x;
	        } else {
	          timer.c = null, timer.t = NaN, timer = null;
	          event.end({
	            type: "end",
	            alpha: alpha = 0
	          });
	        }
	      } else if (x > 0) {
	        event.start({
	          type: "start",
	          alpha: alpha = x
	        });
	        timer = d3_timer(force.tick);
	      }
	      return force;
	    };
	    force.start = function() {
	      var i, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
	      for (i = 0; i < n; ++i) {
	        (o = nodes[i]).index = i;
	        o.weight = 0;
	      }
	      for (i = 0; i < m; ++i) {
	        o = links[i];
	        if (typeof o.source == "number") o.source = nodes[o.source];
	        if (typeof o.target == "number") o.target = nodes[o.target];
	        ++o.source.weight;
	        ++o.target.weight;
	      }
	      for (i = 0; i < n; ++i) {
	        o = nodes[i];
	        if (isNaN(o.x)) o.x = position("x", w);
	        if (isNaN(o.y)) o.y = position("y", h);
	        if (isNaN(o.px)) o.px = o.x;
	        if (isNaN(o.py)) o.py = o.y;
	      }
	      distances = [];
	      if (typeof linkDistance === "function") for (i = 0; i < m; ++i) distances[i] = +linkDistance.call(this, links[i], i); else for (i = 0; i < m; ++i) distances[i] = linkDistance;
	      strengths = [];
	      if (typeof linkStrength === "function") for (i = 0; i < m; ++i) strengths[i] = +linkStrength.call(this, links[i], i); else for (i = 0; i < m; ++i) strengths[i] = linkStrength;
	      charges = [];
	      if (typeof charge === "function") for (i = 0; i < n; ++i) charges[i] = +charge.call(this, nodes[i], i); else for (i = 0; i < n; ++i) charges[i] = charge;
	      function position(dimension, size) {
	        if (!neighbors) {
	          neighbors = new Array(n);
	          for (j = 0; j < n; ++j) {
	            neighbors[j] = [];
	          }
	          for (j = 0; j < m; ++j) {
	            var o = links[j];
	            neighbors[o.source.index].push(o.target);
	            neighbors[o.target.index].push(o.source);
	          }
	        }
	        var candidates = neighbors[i], j = -1, l = candidates.length, x;
	        while (++j < l) if (!isNaN(x = candidates[j][dimension])) return x;
	        return Math.random() * size;
	      }
	      return force.resume();
	    };
	    force.resume = function() {
	      return force.alpha(.1);
	    };
	    force.stop = function() {
	      return force.alpha(0);
	    };
	    force.drag = function() {
	      if (!drag) drag = d3.behavior.drag().origin(d3_identity).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
	      if (!arguments.length) return drag;
	      this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
	    };
	    function dragmove(d) {
	      d.px = d3.event.x, d.py = d3.event.y;
	      force.resume();
	    }
	    return d3.rebind(force, event, "on");
	  };
	  function d3_layout_forceDragstart(d) {
	    d.fixed |= 2;
	  }
	  function d3_layout_forceDragend(d) {
	    d.fixed &= ~6;
	  }
	  function d3_layout_forceMouseover(d) {
	    d.fixed |= 4;
	    d.px = d.x, d.py = d.y;
	  }
	  function d3_layout_forceMouseout(d) {
	    d.fixed &= ~4;
	  }
	  function d3_layout_forceAccumulate(quad, alpha, charges) {
	    var cx = 0, cy = 0;
	    quad.charge = 0;
	    if (!quad.leaf) {
	      var nodes = quad.nodes, n = nodes.length, i = -1, c;
	      while (++i < n) {
	        c = nodes[i];
	        if (c == null) continue;
	        d3_layout_forceAccumulate(c, alpha, charges);
	        quad.charge += c.charge;
	        cx += c.charge * c.cx;
	        cy += c.charge * c.cy;
	      }
	    }
	    if (quad.point) {
	      if (!quad.leaf) {
	        quad.point.x += Math.random() - .5;
	        quad.point.y += Math.random() - .5;
	      }
	      var k = alpha * charges[quad.point.index];
	      quad.charge += quad.pointCharge = k;
	      cx += k * quad.point.x;
	      cy += k * quad.point.y;
	    }
	    quad.cx = cx / quad.charge;
	    quad.cy = cy / quad.charge;
	  }
	  var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1, d3_layout_forceChargeDistance2 = Infinity;
	  d3.layout.hierarchy = function() {
	    var sort = d3_layout_hierarchySort, children = d3_layout_hierarchyChildren, value = d3_layout_hierarchyValue;
	    function hierarchy(root) {
	      var stack = [ root ], nodes = [], node;
	      root.depth = 0;
	      while ((node = stack.pop()) != null) {
	        nodes.push(node);
	        if ((childs = children.call(hierarchy, node, node.depth)) && (n = childs.length)) {
	          var n, childs, child;
	          while (--n >= 0) {
	            stack.push(child = childs[n]);
	            child.parent = node;
	            child.depth = node.depth + 1;
	          }
	          if (value) node.value = 0;
	          node.children = childs;
	        } else {
	          if (value) node.value = +value.call(hierarchy, node, node.depth) || 0;
	          delete node.children;
	        }
	      }
	      d3_layout_hierarchyVisitAfter(root, function(node) {
	        var childs, parent;
	        if (sort && (childs = node.children)) childs.sort(sort);
	        if (value && (parent = node.parent)) parent.value += node.value;
	      });
	      return nodes;
	    }
	    hierarchy.sort = function(x) {
	      if (!arguments.length) return sort;
	      sort = x;
	      return hierarchy;
	    };
	    hierarchy.children = function(x) {
	      if (!arguments.length) return children;
	      children = x;
	      return hierarchy;
	    };
	    hierarchy.value = function(x) {
	      if (!arguments.length) return value;
	      value = x;
	      return hierarchy;
	    };
	    hierarchy.revalue = function(root) {
	      if (value) {
	        d3_layout_hierarchyVisitBefore(root, function(node) {
	          if (node.children) node.value = 0;
	        });
	        d3_layout_hierarchyVisitAfter(root, function(node) {
	          var parent;
	          if (!node.children) node.value = +value.call(hierarchy, node, node.depth) || 0;
	          if (parent = node.parent) parent.value += node.value;
	        });
	      }
	      return root;
	    };
	    return hierarchy;
	  };
	  function d3_layout_hierarchyRebind(object, hierarchy) {
	    d3.rebind(object, hierarchy, "sort", "children", "value");
	    object.nodes = object;
	    object.links = d3_layout_hierarchyLinks;
	    return object;
	  }
	  function d3_layout_hierarchyVisitBefore(node, callback) {
	    var nodes = [ node ];
	    while ((node = nodes.pop()) != null) {
	      callback(node);
	      if ((children = node.children) && (n = children.length)) {
	        var n, children;
	        while (--n >= 0) nodes.push(children[n]);
	      }
	    }
	  }
	  function d3_layout_hierarchyVisitAfter(node, callback) {
	    var nodes = [ node ], nodes2 = [];
	    while ((node = nodes.pop()) != null) {
	      nodes2.push(node);
	      if ((children = node.children) && (n = children.length)) {
	        var i = -1, n, children;
	        while (++i < n) nodes.push(children[i]);
	      }
	    }
	    while ((node = nodes2.pop()) != null) {
	      callback(node);
	    }
	  }
	  function d3_layout_hierarchyChildren(d) {
	    return d.children;
	  }
	  function d3_layout_hierarchyValue(d) {
	    return d.value;
	  }
	  function d3_layout_hierarchySort(a, b) {
	    return b.value - a.value;
	  }
	  function d3_layout_hierarchyLinks(nodes) {
	    return d3.merge(nodes.map(function(parent) {
	      return (parent.children || []).map(function(child) {
	        return {
	          source: parent,
	          target: child
	        };
	      });
	    }));
	  }
	  d3.layout.partition = function() {
	    var hierarchy = d3.layout.hierarchy(), size = [ 1, 1 ];
	    function position(node, x, dx, dy) {
	      var children = node.children;
	      node.x = x;
	      node.y = node.depth * dy;
	      node.dx = dx;
	      node.dy = dy;
	      if (children && (n = children.length)) {
	        var i = -1, n, c, d;
	        dx = node.value ? dx / node.value : 0;
	        while (++i < n) {
	          position(c = children[i], x, d = c.value * dx, dy);
	          x += d;
	        }
	      }
	    }
	    function depth(node) {
	      var children = node.children, d = 0;
	      if (children && (n = children.length)) {
	        var i = -1, n;
	        while (++i < n) d = Math.max(d, depth(children[i]));
	      }
	      return 1 + d;
	    }
	    function partition(d, i) {
	      var nodes = hierarchy.call(this, d, i);
	      position(nodes[0], 0, size[0], size[1] / depth(nodes[0]));
	      return nodes;
	    }
	    partition.size = function(x) {
	      if (!arguments.length) return size;
	      size = x;
	      return partition;
	    };
	    return d3_layout_hierarchyRebind(partition, hierarchy);
	  };
	  d3.layout.pie = function() {
	    var value = Number, sort = d3_layout_pieSortByValue, startAngle = 0, endAngle = τ, padAngle = 0;
	    function pie(data) {
	      var n = data.length, values = data.map(function(d, i) {
	        return +value.call(pie, d, i);
	      }), a = +(typeof startAngle === "function" ? startAngle.apply(this, arguments) : startAngle), da = (typeof endAngle === "function" ? endAngle.apply(this, arguments) : endAngle) - a, p = Math.min(Math.abs(da) / n, +(typeof padAngle === "function" ? padAngle.apply(this, arguments) : padAngle)), pa = p * (da < 0 ? -1 : 1), sum = d3.sum(values), k = sum ? (da - n * pa) / sum : 0, index = d3.range(n), arcs = [], v;
	      if (sort != null) index.sort(sort === d3_layout_pieSortByValue ? function(i, j) {
	        return values[j] - values[i];
	      } : function(i, j) {
	        return sort(data[i], data[j]);
	      });
	      index.forEach(function(i) {
	        arcs[i] = {
	          data: data[i],
	          value: v = values[i],
	          startAngle: a,
	          endAngle: a += v * k + pa,
	          padAngle: p
	        };
	      });
	      return arcs;
	    }
	    pie.value = function(_) {
	      if (!arguments.length) return value;
	      value = _;
	      return pie;
	    };
	    pie.sort = function(_) {
	      if (!arguments.length) return sort;
	      sort = _;
	      return pie;
	    };
	    pie.startAngle = function(_) {
	      if (!arguments.length) return startAngle;
	      startAngle = _;
	      return pie;
	    };
	    pie.endAngle = function(_) {
	      if (!arguments.length) return endAngle;
	      endAngle = _;
	      return pie;
	    };
	    pie.padAngle = function(_) {
	      if (!arguments.length) return padAngle;
	      padAngle = _;
	      return pie;
	    };
	    return pie;
	  };
	  var d3_layout_pieSortByValue = {};
	  d3.layout.stack = function() {
	    var values = d3_identity, order = d3_layout_stackOrderDefault, offset = d3_layout_stackOffsetZero, out = d3_layout_stackOut, x = d3_layout_stackX, y = d3_layout_stackY;
	    function stack(data, index) {
	      if (!(n = data.length)) return data;
	      var series = data.map(function(d, i) {
	        return values.call(stack, d, i);
	      });
	      var points = series.map(function(d) {
	        return d.map(function(v, i) {
	          return [ x.call(stack, v, i), y.call(stack, v, i) ];
	        });
	      });
	      var orders = order.call(stack, points, index);
	      series = d3.permute(series, orders);
	      points = d3.permute(points, orders);
	      var offsets = offset.call(stack, points, index);
	      var m = series[0].length, n, i, j, o;
	      for (j = 0; j < m; ++j) {
	        out.call(stack, series[0][j], o = offsets[j], points[0][j][1]);
	        for (i = 1; i < n; ++i) {
	          out.call(stack, series[i][j], o += points[i - 1][j][1], points[i][j][1]);
	        }
	      }
	      return data;
	    }
	    stack.values = function(x) {
	      if (!arguments.length) return values;
	      values = x;
	      return stack;
	    };
	    stack.order = function(x) {
	      if (!arguments.length) return order;
	      order = typeof x === "function" ? x : d3_layout_stackOrders.get(x) || d3_layout_stackOrderDefault;
	      return stack;
	    };
	    stack.offset = function(x) {
	      if (!arguments.length) return offset;
	      offset = typeof x === "function" ? x : d3_layout_stackOffsets.get(x) || d3_layout_stackOffsetZero;
	      return stack;
	    };
	    stack.x = function(z) {
	      if (!arguments.length) return x;
	      x = z;
	      return stack;
	    };
	    stack.y = function(z) {
	      if (!arguments.length) return y;
	      y = z;
	      return stack;
	    };
	    stack.out = function(z) {
	      if (!arguments.length) return out;
	      out = z;
	      return stack;
	    };
	    return stack;
	  };
	  function d3_layout_stackX(d) {
	    return d.x;
	  }
	  function d3_layout_stackY(d) {
	    return d.y;
	  }
	  function d3_layout_stackOut(d, y0, y) {
	    d.y0 = y0;
	    d.y = y;
	  }
	  var d3_layout_stackOrders = d3.map({
	    "inside-out": function(data) {
	      var n = data.length, i, j, max = data.map(d3_layout_stackMaxIndex), sums = data.map(d3_layout_stackReduceSum), index = d3.range(n).sort(function(a, b) {
	        return max[a] - max[b];
	      }), top = 0, bottom = 0, tops = [], bottoms = [];
	      for (i = 0; i < n; ++i) {
	        j = index[i];
	        if (top < bottom) {
	          top += sums[j];
	          tops.push(j);
	        } else {
	          bottom += sums[j];
	          bottoms.push(j);
	        }
	      }
	      return bottoms.reverse().concat(tops);
	    },
	    reverse: function(data) {
	      return d3.range(data.length).reverse();
	    },
	    "default": d3_layout_stackOrderDefault
	  });
	  var d3_layout_stackOffsets = d3.map({
	    silhouette: function(data) {
	      var n = data.length, m = data[0].length, sums = [], max = 0, i, j, o, y0 = [];
	      for (j = 0; j < m; ++j) {
	        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
	        if (o > max) max = o;
	        sums.push(o);
	      }
	      for (j = 0; j < m; ++j) {
	        y0[j] = (max - sums[j]) / 2;
	      }
	      return y0;
	    },
	    wiggle: function(data) {
	      var n = data.length, x = data[0], m = x.length, i, j, k, s1, s2, s3, dx, o, o0, y0 = [];
	      y0[0] = o = o0 = 0;
	      for (j = 1; j < m; ++j) {
	        for (i = 0, s1 = 0; i < n; ++i) s1 += data[i][j][1];
	        for (i = 0, s2 = 0, dx = x[j][0] - x[j - 1][0]; i < n; ++i) {
	          for (k = 0, s3 = (data[i][j][1] - data[i][j - 1][1]) / (2 * dx); k < i; ++k) {
	            s3 += (data[k][j][1] - data[k][j - 1][1]) / dx;
	          }
	          s2 += s3 * data[i][j][1];
	        }
	        y0[j] = o -= s1 ? s2 / s1 * dx : 0;
	        if (o < o0) o0 = o;
	      }
	      for (j = 0; j < m; ++j) y0[j] -= o0;
	      return y0;
	    },
	    expand: function(data) {
	      var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
	      for (j = 0; j < m; ++j) {
	        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
	        if (o) for (i = 0; i < n; i++) data[i][j][1] /= o; else for (i = 0; i < n; i++) data[i][j][1] = k;
	      }
	      for (j = 0; j < m; ++j) y0[j] = 0;
	      return y0;
	    },
	    zero: d3_layout_stackOffsetZero
	  });
	  function d3_layout_stackOrderDefault(data) {
	    return d3.range(data.length);
	  }
	  function d3_layout_stackOffsetZero(data) {
	    var j = -1, m = data[0].length, y0 = [];
	    while (++j < m) y0[j] = 0;
	    return y0;
	  }
	  function d3_layout_stackMaxIndex(array) {
	    var i = 1, j = 0, v = array[0][1], k, n = array.length;
	    for (;i < n; ++i) {
	      if ((k = array[i][1]) > v) {
	        j = i;
	        v = k;
	      }
	    }
	    return j;
	  }
	  function d3_layout_stackReduceSum(d) {
	    return d.reduce(d3_layout_stackSum, 0);
	  }
	  function d3_layout_stackSum(p, d) {
	    return p + d[1];
	  }
	  d3.layout.histogram = function() {
	    var frequency = true, valuer = Number, ranger = d3_layout_histogramRange, binner = d3_layout_histogramBinSturges;
	    function histogram(data, i) {
	      var bins = [], values = data.map(valuer, this), range = ranger.call(this, values, i), thresholds = binner.call(this, range, values, i), bin, i = -1, n = values.length, m = thresholds.length - 1, k = frequency ? 1 : 1 / n, x;
	      while (++i < m) {
	        bin = bins[i] = [];
	        bin.dx = thresholds[i + 1] - (bin.x = thresholds[i]);
	        bin.y = 0;
	      }
	      if (m > 0) {
	        i = -1;
	        while (++i < n) {
	          x = values[i];
	          if (x >= range[0] && x <= range[1]) {
	            bin = bins[d3.bisect(thresholds, x, 1, m) - 1];
	            bin.y += k;
	            bin.push(data[i]);
	          }
	        }
	      }
	      return bins;
	    }
	    histogram.value = function(x) {
	      if (!arguments.length) return valuer;
	      valuer = x;
	      return histogram;
	    };
	    histogram.range = function(x) {
	      if (!arguments.length) return ranger;
	      ranger = d3_functor(x);
	      return histogram;
	    };
	    histogram.bins = function(x) {
	      if (!arguments.length) return binner;
	      binner = typeof x === "number" ? function(range) {
	        return d3_layout_histogramBinFixed(range, x);
	      } : d3_functor(x);
	      return histogram;
	    };
	    histogram.frequency = function(x) {
	      if (!arguments.length) return frequency;
	      frequency = !!x;
	      return histogram;
	    };
	    return histogram;
	  };
	  function d3_layout_histogramBinSturges(range, values) {
	    return d3_layout_histogramBinFixed(range, Math.ceil(Math.log(values.length) / Math.LN2 + 1));
	  }
	  function d3_layout_histogramBinFixed(range, n) {
	    var x = -1, b = +range[0], m = (range[1] - b) / n, f = [];
	    while (++x <= n) f[x] = m * x + b;
	    return f;
	  }
	  function d3_layout_histogramRange(values) {
	    return [ d3.min(values), d3.max(values) ];
	  }
	  d3.layout.pack = function() {
	    var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort), padding = 0, size = [ 1, 1 ], radius;
	    function pack(d, i) {
	      var nodes = hierarchy.call(this, d, i), root = nodes[0], w = size[0], h = size[1], r = radius == null ? Math.sqrt : typeof radius === "function" ? radius : function() {
	        return radius;
	      };
	      root.x = root.y = 0;
	      d3_layout_hierarchyVisitAfter(root, function(d) {
	        d.r = +r(d.value);
	      });
	      d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
	      if (padding) {
	        var dr = padding * (radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
	        d3_layout_hierarchyVisitAfter(root, function(d) {
	          d.r += dr;
	        });
	        d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
	        d3_layout_hierarchyVisitAfter(root, function(d) {
	          d.r -= dr;
	        });
	      }
	      d3_layout_packTransform(root, w / 2, h / 2, radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));
	      return nodes;
	    }
	    pack.size = function(_) {
	      if (!arguments.length) return size;
	      size = _;
	      return pack;
	    };
	    pack.radius = function(_) {
	      if (!arguments.length) return radius;
	      radius = _ == null || typeof _ === "function" ? _ : +_;
	      return pack;
	    };
	    pack.padding = function(_) {
	      if (!arguments.length) return padding;
	      padding = +_;
	      return pack;
	    };
	    return d3_layout_hierarchyRebind(pack, hierarchy);
	  };
	  function d3_layout_packSort(a, b) {
	    return a.value - b.value;
	  }
	  function d3_layout_packInsert(a, b) {
	    var c = a._pack_next;
	    a._pack_next = b;
	    b._pack_prev = a;
	    b._pack_next = c;
	    c._pack_prev = b;
	  }
	  function d3_layout_packSplice(a, b) {
	    a._pack_next = b;
	    b._pack_prev = a;
	  }
	  function d3_layout_packIntersects(a, b) {
	    var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
	    return .999 * dr * dr > dx * dx + dy * dy;
	  }
	  function d3_layout_packSiblings(node) {
	    if (!(nodes = node.children) || !(n = nodes.length)) return;
	    var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;
	    function bound(node) {
	      xMin = Math.min(node.x - node.r, xMin);
	      xMax = Math.max(node.x + node.r, xMax);
	      yMin = Math.min(node.y - node.r, yMin);
	      yMax = Math.max(node.y + node.r, yMax);
	    }
	    nodes.forEach(d3_layout_packLink);
	    a = nodes[0];
	    a.x = -a.r;
	    a.y = 0;
	    bound(a);
	    if (n > 1) {
	      b = nodes[1];
	      b.x = b.r;
	      b.y = 0;
	      bound(b);
	      if (n > 2) {
	        c = nodes[2];
	        d3_layout_packPlace(a, b, c);
	        bound(c);
	        d3_layout_packInsert(a, c);
	        a._pack_prev = c;
	        d3_layout_packInsert(c, b);
	        b = a._pack_next;
	        for (i = 3; i < n; i++) {
	          d3_layout_packPlace(a, b, c = nodes[i]);
	          var isect = 0, s1 = 1, s2 = 1;
	          for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
	            if (d3_layout_packIntersects(j, c)) {
	              isect = 1;
	              break;
	            }
	          }
	          if (isect == 1) {
	            for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
	              if (d3_layout_packIntersects(k, c)) {
	                break;
	              }
	            }
	          }
	          if (isect) {
	            if (s1 < s2 || s1 == s2 && b.r < a.r) d3_layout_packSplice(a, b = j); else d3_layout_packSplice(a = k, b);
	            i--;
	          } else {
	            d3_layout_packInsert(a, c);
	            b = c;
	            bound(c);
	          }
	        }
	      }
	    }
	    var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
	    for (i = 0; i < n; i++) {
	      c = nodes[i];
	      c.x -= cx;
	      c.y -= cy;
	      cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
	    }
	    node.r = cr;
	    nodes.forEach(d3_layout_packUnlink);
	  }
	  function d3_layout_packLink(node) {
	    node._pack_next = node._pack_prev = node;
	  }
	  function d3_layout_packUnlink(node) {
	    delete node._pack_next;
	    delete node._pack_prev;
	  }
	  function d3_layout_packTransform(node, x, y, k) {
	    var children = node.children;
	    node.x = x += k * node.x;
	    node.y = y += k * node.y;
	    node.r *= k;
	    if (children) {
	      var i = -1, n = children.length;
	      while (++i < n) d3_layout_packTransform(children[i], x, y, k);
	    }
	  }
	  function d3_layout_packPlace(a, b, c) {
	    var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
	    if (db && (dx || dy)) {
	      var da = b.r + c.r, dc = dx * dx + dy * dy;
	      da *= da;
	      db *= db;
	      var x = .5 + (db - da) / (2 * dc), y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
	      c.x = a.x + x * dx + y * dy;
	      c.y = a.y + x * dy - y * dx;
	    } else {
	      c.x = a.x + db;
	      c.y = a.y;
	    }
	  }
	  d3.layout.tree = function() {
	    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = null;
	    function tree(d, i) {
	      var nodes = hierarchy.call(this, d, i), root0 = nodes[0], root1 = wrapTree(root0);
	      d3_layout_hierarchyVisitAfter(root1, firstWalk), root1.parent.m = -root1.z;
	      d3_layout_hierarchyVisitBefore(root1, secondWalk);
	      if (nodeSize) d3_layout_hierarchyVisitBefore(root0, sizeNode); else {
	        var left = root0, right = root0, bottom = root0;
	        d3_layout_hierarchyVisitBefore(root0, function(node) {
	          if (node.x < left.x) left = node;
	          if (node.x > right.x) right = node;
	          if (node.depth > bottom.depth) bottom = node;
	        });
	        var tx = separation(left, right) / 2 - left.x, kx = size[0] / (right.x + separation(right, left) / 2 + tx), ky = size[1] / (bottom.depth || 1);
	        d3_layout_hierarchyVisitBefore(root0, function(node) {
	          node.x = (node.x + tx) * kx;
	          node.y = node.depth * ky;
	        });
	      }
	      return nodes;
	    }
	    function wrapTree(root0) {
	      var root1 = {
	        A: null,
	        children: [ root0 ]
	      }, queue = [ root1 ], node1;
	      while ((node1 = queue.pop()) != null) {
	        for (var children = node1.children, child, i = 0, n = children.length; i < n; ++i) {
	          queue.push((children[i] = child = {
	            _: children[i],
	            parent: node1,
	            children: (child = children[i].children) && child.slice() || [],
	            A: null,
	            a: null,
	            z: 0,
	            m: 0,
	            c: 0,
	            s: 0,
	            t: null,
	            i: i
	          }).a = child);
	        }
	      }
	      return root1.children[0];
	    }
	    function firstWalk(v) {
	      var children = v.children, siblings = v.parent.children, w = v.i ? siblings[v.i - 1] : null;
	      if (children.length) {
	        d3_layout_treeShift(v);
	        var midpoint = (children[0].z + children[children.length - 1].z) / 2;
	        if (w) {
	          v.z = w.z + separation(v._, w._);
	          v.m = v.z - midpoint;
	        } else {
	          v.z = midpoint;
	        }
	      } else if (w) {
	        v.z = w.z + separation(v._, w._);
	      }
	      v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
	    }
	    function secondWalk(v) {
	      v._.x = v.z + v.parent.m;
	      v.m += v.parent.m;
	    }
	    function apportion(v, w, ancestor) {
	      if (w) {
	        var vip = v, vop = v, vim = w, vom = vip.parent.children[0], sip = vip.m, sop = vop.m, sim = vim.m, som = vom.m, shift;
	        while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
	          vom = d3_layout_treeLeft(vom);
	          vop = d3_layout_treeRight(vop);
	          vop.a = v;
	          shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
	          if (shift > 0) {
	            d3_layout_treeMove(d3_layout_treeAncestor(vim, v, ancestor), v, shift);
	            sip += shift;
	            sop += shift;
	          }
	          sim += vim.m;
	          sip += vip.m;
	          som += vom.m;
	          sop += vop.m;
	        }
	        if (vim && !d3_layout_treeRight(vop)) {
	          vop.t = vim;
	          vop.m += sim - sop;
	        }
	        if (vip && !d3_layout_treeLeft(vom)) {
	          vom.t = vip;
	          vom.m += sip - som;
	          ancestor = v;
	        }
	      }
	      return ancestor;
	    }
	    function sizeNode(node) {
	      node.x *= size[0];
	      node.y = node.depth * size[1];
	    }
	    tree.separation = function(x) {
	      if (!arguments.length) return separation;
	      separation = x;
	      return tree;
	    };
	    tree.size = function(x) {
	      if (!arguments.length) return nodeSize ? null : size;
	      nodeSize = (size = x) == null ? sizeNode : null;
	      return tree;
	    };
	    tree.nodeSize = function(x) {
	      if (!arguments.length) return nodeSize ? size : null;
	      nodeSize = (size = x) == null ? null : sizeNode;
	      return tree;
	    };
	    return d3_layout_hierarchyRebind(tree, hierarchy);
	  };
	  function d3_layout_treeSeparation(a, b) {
	    return a.parent == b.parent ? 1 : 2;
	  }
	  function d3_layout_treeLeft(v) {
	    var children = v.children;
	    return children.length ? children[0] : v.t;
	  }
	  function d3_layout_treeRight(v) {
	    var children = v.children, n;
	    return (n = children.length) ? children[n - 1] : v.t;
	  }
	  function d3_layout_treeMove(wm, wp, shift) {
	    var change = shift / (wp.i - wm.i);
	    wp.c -= change;
	    wp.s += shift;
	    wm.c += change;
	    wp.z += shift;
	    wp.m += shift;
	  }
	  function d3_layout_treeShift(v) {
	    var shift = 0, change = 0, children = v.children, i = children.length, w;
	    while (--i >= 0) {
	      w = children[i];
	      w.z += shift;
	      w.m += shift;
	      shift += w.s + (change += w.c);
	    }
	  }
	  function d3_layout_treeAncestor(vim, v, ancestor) {
	    return vim.a.parent === v.parent ? vim.a : ancestor;
	  }
	  d3.layout.cluster = function() {
	    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = false;
	    function cluster(d, i) {
	      var nodes = hierarchy.call(this, d, i), root = nodes[0], previousNode, x = 0;
	      d3_layout_hierarchyVisitAfter(root, function(node) {
	        var children = node.children;
	        if (children && children.length) {
	          node.x = d3_layout_clusterX(children);
	          node.y = d3_layout_clusterY(children);
	        } else {
	          node.x = previousNode ? x += separation(node, previousNode) : 0;
	          node.y = 0;
	          previousNode = node;
	        }
	      });
	      var left = d3_layout_clusterLeft(root), right = d3_layout_clusterRight(root), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2;
	      d3_layout_hierarchyVisitAfter(root, nodeSize ? function(node) {
	        node.x = (node.x - root.x) * size[0];
	        node.y = (root.y - node.y) * size[1];
	      } : function(node) {
	        node.x = (node.x - x0) / (x1 - x0) * size[0];
	        node.y = (1 - (root.y ? node.y / root.y : 1)) * size[1];
	      });
	      return nodes;
	    }
	    cluster.separation = function(x) {
	      if (!arguments.length) return separation;
	      separation = x;
	      return cluster;
	    };
	    cluster.size = function(x) {
	      if (!arguments.length) return nodeSize ? null : size;
	      nodeSize = (size = x) == null;
	      return cluster;
	    };
	    cluster.nodeSize = function(x) {
	      if (!arguments.length) return nodeSize ? size : null;
	      nodeSize = (size = x) != null;
	      return cluster;
	    };
	    return d3_layout_hierarchyRebind(cluster, hierarchy);
	  };
	  function d3_layout_clusterY(children) {
	    return 1 + d3.max(children, function(child) {
	      return child.y;
	    });
	  }
	  function d3_layout_clusterX(children) {
	    return children.reduce(function(x, child) {
	      return x + child.x;
	    }, 0) / children.length;
	  }
	  function d3_layout_clusterLeft(node) {
	    var children = node.children;
	    return children && children.length ? d3_layout_clusterLeft(children[0]) : node;
	  }
	  function d3_layout_clusterRight(node) {
	    var children = node.children, n;
	    return children && (n = children.length) ? d3_layout_clusterRight(children[n - 1]) : node;
	  }
	  d3.layout.treemap = function() {
	    var hierarchy = d3.layout.hierarchy(), round = Math.round, size = [ 1, 1 ], padding = null, pad = d3_layout_treemapPadNull, sticky = false, stickies, mode = "squarify", ratio = .5 * (1 + Math.sqrt(5));
	    function scale(children, k) {
	      var i = -1, n = children.length, child, area;
	      while (++i < n) {
	        area = (child = children[i]).value * (k < 0 ? 0 : k);
	        child.area = isNaN(area) || area <= 0 ? 0 : area;
	      }
	    }
	    function squarify(node) {
	      var children = node.children;
	      if (children && children.length) {
	        var rect = pad(node), row = [], remaining = children.slice(), child, best = Infinity, score, u = mode === "slice" ? rect.dx : mode === "dice" ? rect.dy : mode === "slice-dice" ? node.depth & 1 ? rect.dy : rect.dx : Math.min(rect.dx, rect.dy), n;
	        scale(remaining, rect.dx * rect.dy / node.value);
	        row.area = 0;
	        while ((n = remaining.length) > 0) {
	          row.push(child = remaining[n - 1]);
	          row.area += child.area;
	          if (mode !== "squarify" || (score = worst(row, u)) <= best) {
	            remaining.pop();
	            best = score;
	          } else {
	            row.area -= row.pop().area;
	            position(row, u, rect, false);
	            u = Math.min(rect.dx, rect.dy);
	            row.length = row.area = 0;
	            best = Infinity;
	          }
	        }
	        if (row.length) {
	          position(row, u, rect, true);
	          row.length = row.area = 0;
	        }
	        children.forEach(squarify);
	      }
	    }
	    function stickify(node) {
	      var children = node.children;
	      if (children && children.length) {
	        var rect = pad(node), remaining = children.slice(), child, row = [];
	        scale(remaining, rect.dx * rect.dy / node.value);
	        row.area = 0;
	        while (child = remaining.pop()) {
	          row.push(child);
	          row.area += child.area;
	          if (child.z != null) {
	            position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
	            row.length = row.area = 0;
	          }
	        }
	        children.forEach(stickify);
	      }
	    }
	    function worst(row, u) {
	      var s = row.area, r, rmax = 0, rmin = Infinity, i = -1, n = row.length;
	      while (++i < n) {
	        if (!(r = row[i].area)) continue;
	        if (r < rmin) rmin = r;
	        if (r > rmax) rmax = r;
	      }
	      s *= s;
	      u *= u;
	      return s ? Math.max(u * rmax * ratio / s, s / (u * rmin * ratio)) : Infinity;
	    }
	    function position(row, u, rect, flush) {
	      var i = -1, n = row.length, x = rect.x, y = rect.y, v = u ? round(row.area / u) : 0, o;
	      if (u == rect.dx) {
	        if (flush || v > rect.dy) v = rect.dy;
	        while (++i < n) {
	          o = row[i];
	          o.x = x;
	          o.y = y;
	          o.dy = v;
	          x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
	        }
	        o.z = true;
	        o.dx += rect.x + rect.dx - x;
	        rect.y += v;
	        rect.dy -= v;
	      } else {
	        if (flush || v > rect.dx) v = rect.dx;
	        while (++i < n) {
	          o = row[i];
	          o.x = x;
	          o.y = y;
	          o.dx = v;
	          y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
	        }
	        o.z = false;
	        o.dy += rect.y + rect.dy - y;
	        rect.x += v;
	        rect.dx -= v;
	      }
	    }
	    function treemap(d) {
	      var nodes = stickies || hierarchy(d), root = nodes[0];
	      root.x = root.y = 0;
	      if (root.value) root.dx = size[0], root.dy = size[1]; else root.dx = root.dy = 0;
	      if (stickies) hierarchy.revalue(root);
	      scale([ root ], root.dx * root.dy / root.value);
	      (stickies ? stickify : squarify)(root);
	      if (sticky) stickies = nodes;
	      return nodes;
	    }
	    treemap.size = function(x) {
	      if (!arguments.length) return size;
	      size = x;
	      return treemap;
	    };
	    treemap.padding = function(x) {
	      if (!arguments.length) return padding;
	      function padFunction(node) {
	        var p = x.call(treemap, node, node.depth);
	        return p == null ? d3_layout_treemapPadNull(node) : d3_layout_treemapPad(node, typeof p === "number" ? [ p, p, p, p ] : p);
	      }
	      function padConstant(node) {
	        return d3_layout_treemapPad(node, x);
	      }
	      var type;
	      pad = (padding = x) == null ? d3_layout_treemapPadNull : (type = typeof x) === "function" ? padFunction : type === "number" ? (x = [ x, x, x, x ], 
	      padConstant) : padConstant;
	      return treemap;
	    };
	    treemap.round = function(x) {
	      if (!arguments.length) return round != Number;
	      round = x ? Math.round : Number;
	      return treemap;
	    };
	    treemap.sticky = function(x) {
	      if (!arguments.length) return sticky;
	      sticky = x;
	      stickies = null;
	      return treemap;
	    };
	    treemap.ratio = function(x) {
	      if (!arguments.length) return ratio;
	      ratio = x;
	      return treemap;
	    };
	    treemap.mode = function(x) {
	      if (!arguments.length) return mode;
	      mode = x + "";
	      return treemap;
	    };
	    return d3_layout_hierarchyRebind(treemap, hierarchy);
	  };
	  function d3_layout_treemapPadNull(node) {
	    return {
	      x: node.x,
	      y: node.y,
	      dx: node.dx,
	      dy: node.dy
	    };
	  }
	  function d3_layout_treemapPad(node, padding) {
	    var x = node.x + padding[3], y = node.y + padding[0], dx = node.dx - padding[1] - padding[3], dy = node.dy - padding[0] - padding[2];
	    if (dx < 0) {
	      x += dx / 2;
	      dx = 0;
	    }
	    if (dy < 0) {
	      y += dy / 2;
	      dy = 0;
	    }
	    return {
	      x: x,
	      y: y,
	      dx: dx,
	      dy: dy
	    };
	  }
	  d3.random = {
	    normal: function(µ, σ) {
	      var n = arguments.length;
	      if (n < 2) σ = 1;
	      if (n < 1) µ = 0;
	      return function() {
	        var x, y, r;
	        do {
	          x = Math.random() * 2 - 1;
	          y = Math.random() * 2 - 1;
	          r = x * x + y * y;
	        } while (!r || r > 1);
	        return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
	      };
	    },
	    logNormal: function() {
	      var random = d3.random.normal.apply(d3, arguments);
	      return function() {
	        return Math.exp(random());
	      };
	    },
	    bates: function(m) {
	      var random = d3.random.irwinHall(m);
	      return function() {
	        return random() / m;
	      };
	    },
	    irwinHall: function(m) {
	      return function() {
	        for (var s = 0, j = 0; j < m; j++) s += Math.random();
	        return s;
	      };
	    }
	  };
	  d3.scale = {};
	  function d3_scaleExtent(domain) {
	    var start = domain[0], stop = domain[domain.length - 1];
	    return start < stop ? [ start, stop ] : [ stop, start ];
	  }
	  function d3_scaleRange(scale) {
	    return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
	  }
	  function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
	    var u = uninterpolate(domain[0], domain[1]), i = interpolate(range[0], range[1]);
	    return function(x) {
	      return i(u(x));
	    };
	  }
	  function d3_scale_nice(domain, nice) {
	    var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], dx;
	    if (x1 < x0) {
	      dx = i0, i0 = i1, i1 = dx;
	      dx = x0, x0 = x1, x1 = dx;
	    }
	    domain[i0] = nice.floor(x0);
	    domain[i1] = nice.ceil(x1);
	    return domain;
	  }
	  function d3_scale_niceStep(step) {
	    return step ? {
	      floor: function(x) {
	        return Math.floor(x / step) * step;
	      },
	      ceil: function(x) {
	        return Math.ceil(x / step) * step;
	      }
	    } : d3_scale_niceIdentity;
	  }
	  var d3_scale_niceIdentity = {
	    floor: d3_identity,
	    ceil: d3_identity
	  };
	  function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
	    var u = [], i = [], j = 0, k = Math.min(domain.length, range.length) - 1;
	    if (domain[k] < domain[0]) {
	      domain = domain.slice().reverse();
	      range = range.slice().reverse();
	    }
	    while (++j <= k) {
	      u.push(uninterpolate(domain[j - 1], domain[j]));
	      i.push(interpolate(range[j - 1], range[j]));
	    }
	    return function(x) {
	      var j = d3.bisect(domain, x, 1, k) - 1;
	      return i[j](u[j](x));
	    };
	  }
	  d3.scale.linear = function() {
	    return d3_scale_linear([ 0, 1 ], [ 0, 1 ], d3_interpolate, false);
	  };
	  function d3_scale_linear(domain, range, interpolate, clamp) {
	    var output, input;
	    function rescale() {
	      var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear, uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
	      output = linear(domain, range, uninterpolate, interpolate);
	      input = linear(range, domain, uninterpolate, d3_interpolate);
	      return scale;
	    }
	    function scale(x) {
	      return output(x);
	    }
	    scale.invert = function(y) {
	      return input(y);
	    };
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      domain = x.map(Number);
	      return rescale();
	    };
	    scale.range = function(x) {
	      if (!arguments.length) return range;
	      range = x;
	      return rescale();
	    };
	    scale.rangeRound = function(x) {
	      return scale.range(x).interpolate(d3_interpolateRound);
	    };
	    scale.clamp = function(x) {
	      if (!arguments.length) return clamp;
	      clamp = x;
	      return rescale();
	    };
	    scale.interpolate = function(x) {
	      if (!arguments.length) return interpolate;
	      interpolate = x;
	      return rescale();
	    };
	    scale.ticks = function(m) {
	      return d3_scale_linearTicks(domain, m);
	    };
	    scale.tickFormat = function(m, format) {
	      return d3_scale_linearTickFormat(domain, m, format);
	    };
	    scale.nice = function(m) {
	      d3_scale_linearNice(domain, m);
	      return rescale();
	    };
	    scale.copy = function() {
	      return d3_scale_linear(domain, range, interpolate, clamp);
	    };
	    return rescale();
	  }
	  function d3_scale_linearRebind(scale, linear) {
	    return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
	  }
	  function d3_scale_linearNice(domain, m) {
	    d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
	    d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
	    return domain;
	  }
	  function d3_scale_linearTickRange(domain, m) {
	    if (m == null) m = 10;
	    var extent = d3_scaleExtent(domain), span = extent[1] - extent[0], step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step;
	    if (err <= .15) step *= 10; else if (err <= .35) step *= 5; else if (err <= .75) step *= 2;
	    extent[0] = Math.ceil(extent[0] / step) * step;
	    extent[1] = Math.floor(extent[1] / step) * step + step * .5;
	    extent[2] = step;
	    return extent;
	  }
	  function d3_scale_linearTicks(domain, m) {
	    return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
	  }
	  function d3_scale_linearTickFormat(domain, m, format) {
	    var range = d3_scale_linearTickRange(domain, m);
	    if (format) {
	      var match = d3_format_re.exec(format);
	      match.shift();
	      if (match[8] === "s") {
	        var prefix = d3.formatPrefix(Math.max(abs(range[0]), abs(range[1])));
	        if (!match[7]) match[7] = "." + d3_scale_linearPrecision(prefix.scale(range[2]));
	        match[8] = "f";
	        format = d3.format(match.join(""));
	        return function(d) {
	          return format(prefix.scale(d)) + prefix.symbol;
	        };
	      }
	      if (!match[7]) match[7] = "." + d3_scale_linearFormatPrecision(match[8], range);
	      format = match.join("");
	    } else {
	      format = ",." + d3_scale_linearPrecision(range[2]) + "f";
	    }
	    return d3.format(format);
	  }
	  var d3_scale_linearFormatSignificant = {
	    s: 1,
	    g: 1,
	    p: 1,
	    r: 1,
	    e: 1
	  };
	  function d3_scale_linearPrecision(value) {
	    return -Math.floor(Math.log(value) / Math.LN10 + .01);
	  }
	  function d3_scale_linearFormatPrecision(type, range) {
	    var p = d3_scale_linearPrecision(range[2]);
	    return type in d3_scale_linearFormatSignificant ? Math.abs(p - d3_scale_linearPrecision(Math.max(abs(range[0]), abs(range[1])))) + +(type !== "e") : p - (type === "%") * 2;
	  }
	  d3.scale.log = function() {
	    return d3_scale_log(d3.scale.linear().domain([ 0, 1 ]), 10, true, [ 1, 10 ]);
	  };
	  function d3_scale_log(linear, base, positive, domain) {
	    function log(x) {
	      return (positive ? Math.log(x < 0 ? 0 : x) : -Math.log(x > 0 ? 0 : -x)) / Math.log(base);
	    }
	    function pow(x) {
	      return positive ? Math.pow(base, x) : -Math.pow(base, -x);
	    }
	    function scale(x) {
	      return linear(log(x));
	    }
	    scale.invert = function(x) {
	      return pow(linear.invert(x));
	    };
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      positive = x[0] >= 0;
	      linear.domain((domain = x.map(Number)).map(log));
	      return scale;
	    };
	    scale.base = function(_) {
	      if (!arguments.length) return base;
	      base = +_;
	      linear.domain(domain.map(log));
	      return scale;
	    };
	    scale.nice = function() {
	      var niced = d3_scale_nice(domain.map(log), positive ? Math : d3_scale_logNiceNegative);
	      linear.domain(niced);
	      domain = niced.map(pow);
	      return scale;
	    };
	    scale.ticks = function() {
	      var extent = d3_scaleExtent(domain), ticks = [], u = extent[0], v = extent[1], i = Math.floor(log(u)), j = Math.ceil(log(v)), n = base % 1 ? 2 : base;
	      if (isFinite(j - i)) {
	        if (positive) {
	          for (;i < j; i++) for (var k = 1; k < n; k++) ticks.push(pow(i) * k);
	          ticks.push(pow(i));
	        } else {
	          ticks.push(pow(i));
	          for (;i++ < j; ) for (var k = n - 1; k > 0; k--) ticks.push(pow(i) * k);
	        }
	        for (i = 0; ticks[i] < u; i++) {}
	        for (j = ticks.length; ticks[j - 1] > v; j--) {}
	        ticks = ticks.slice(i, j);
	      }
	      return ticks;
	    };
	    scale.tickFormat = function(n, format) {
	      if (!arguments.length) return d3_scale_logFormat;
	      if (arguments.length < 2) format = d3_scale_logFormat; else if (typeof format !== "function") format = d3.format(format);
	      var k = Math.max(1, base * n / scale.ticks().length);
	      return function(d) {
	        var i = d / pow(Math.round(log(d)));
	        if (i * base < base - .5) i *= base;
	        return i <= k ? format(d) : "";
	      };
	    };
	    scale.copy = function() {
	      return d3_scale_log(linear.copy(), base, positive, domain);
	    };
	    return d3_scale_linearRebind(scale, linear);
	  }
	  var d3_scale_logFormat = d3.format(".0e"), d3_scale_logNiceNegative = {
	    floor: function(x) {
	      return -Math.ceil(-x);
	    },
	    ceil: function(x) {
	      return -Math.floor(-x);
	    }
	  };
	  d3.scale.pow = function() {
	    return d3_scale_pow(d3.scale.linear(), 1, [ 0, 1 ]);
	  };
	  function d3_scale_pow(linear, exponent, domain) {
	    var powp = d3_scale_powPow(exponent), powb = d3_scale_powPow(1 / exponent);
	    function scale(x) {
	      return linear(powp(x));
	    }
	    scale.invert = function(x) {
	      return powb(linear.invert(x));
	    };
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      linear.domain((domain = x.map(Number)).map(powp));
	      return scale;
	    };
	    scale.ticks = function(m) {
	      return d3_scale_linearTicks(domain, m);
	    };
	    scale.tickFormat = function(m, format) {
	      return d3_scale_linearTickFormat(domain, m, format);
	    };
	    scale.nice = function(m) {
	      return scale.domain(d3_scale_linearNice(domain, m));
	    };
	    scale.exponent = function(x) {
	      if (!arguments.length) return exponent;
	      powp = d3_scale_powPow(exponent = x);
	      powb = d3_scale_powPow(1 / exponent);
	      linear.domain(domain.map(powp));
	      return scale;
	    };
	    scale.copy = function() {
	      return d3_scale_pow(linear.copy(), exponent, domain);
	    };
	    return d3_scale_linearRebind(scale, linear);
	  }
	  function d3_scale_powPow(e) {
	    return function(x) {
	      return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
	    };
	  }
	  d3.scale.sqrt = function() {
	    return d3.scale.pow().exponent(.5);
	  };
	  d3.scale.ordinal = function() {
	    return d3_scale_ordinal([], {
	      t: "range",
	      a: [ [] ]
	    });
	  };
	  function d3_scale_ordinal(domain, ranger) {
	    var index, range, rangeBand;
	    function scale(x) {
	      return range[((index.get(x) || (ranger.t === "range" ? index.set(x, domain.push(x)) : NaN)) - 1) % range.length];
	    }
	    function steps(start, step) {
	      return d3.range(domain.length).map(function(i) {
	        return start + step * i;
	      });
	    }
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      domain = [];
	      index = new d3_Map();
	      var i = -1, n = x.length, xi;
	      while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
	      return scale[ranger.t].apply(scale, ranger.a);
	    };
	    scale.range = function(x) {
	      if (!arguments.length) return range;
	      range = x;
	      rangeBand = 0;
	      ranger = {
	        t: "range",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangePoints = function(x, padding) {
	      if (arguments.length < 2) padding = 0;
	      var start = x[0], stop = x[1], step = domain.length < 2 ? (start = (start + stop) / 2, 
	      0) : (stop - start) / (domain.length - 1 + padding);
	      range = steps(start + step * padding / 2, step);
	      rangeBand = 0;
	      ranger = {
	        t: "rangePoints",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangeRoundPoints = function(x, padding) {
	      if (arguments.length < 2) padding = 0;
	      var start = x[0], stop = x[1], step = domain.length < 2 ? (start = stop = Math.round((start + stop) / 2), 
	      0) : (stop - start) / (domain.length - 1 + padding) | 0;
	      range = steps(start + Math.round(step * padding / 2 + (stop - start - (domain.length - 1 + padding) * step) / 2), step);
	      rangeBand = 0;
	      ranger = {
	        t: "rangeRoundPoints",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangeBands = function(x, padding, outerPadding) {
	      if (arguments.length < 2) padding = 0;
	      if (arguments.length < 3) outerPadding = padding;
	      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = (stop - start) / (domain.length - padding + 2 * outerPadding);
	      range = steps(start + step * outerPadding, step);
	      if (reverse) range.reverse();
	      rangeBand = step * (1 - padding);
	      ranger = {
	        t: "rangeBands",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangeRoundBands = function(x, padding, outerPadding) {
	      if (arguments.length < 2) padding = 0;
	      if (arguments.length < 3) outerPadding = padding;
	      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding));
	      range = steps(start + Math.round((stop - start - (domain.length - padding) * step) / 2), step);
	      if (reverse) range.reverse();
	      rangeBand = Math.round(step * (1 - padding));
	      ranger = {
	        t: "rangeRoundBands",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangeBand = function() {
	      return rangeBand;
	    };
	    scale.rangeExtent = function() {
	      return d3_scaleExtent(ranger.a[0]);
	    };
	    scale.copy = function() {
	      return d3_scale_ordinal(domain, ranger);
	    };
	    return scale.domain(domain);
	  }
	  d3.scale.category10 = function() {
	    return d3.scale.ordinal().range(d3_category10);
	  };
	  d3.scale.category20 = function() {
	    return d3.scale.ordinal().range(d3_category20);
	  };
	  d3.scale.category20b = function() {
	    return d3.scale.ordinal().range(d3_category20b);
	  };
	  d3.scale.category20c = function() {
	    return d3.scale.ordinal().range(d3_category20c);
	  };
	  var d3_category10 = [ 2062260, 16744206, 2924588, 14034728, 9725885, 9197131, 14907330, 8355711, 12369186, 1556175 ].map(d3_rgbString);
	  var d3_category20 = [ 2062260, 11454440, 16744206, 16759672, 2924588, 10018698, 14034728, 16750742, 9725885, 12955861, 9197131, 12885140, 14907330, 16234194, 8355711, 13092807, 12369186, 14408589, 1556175, 10410725 ].map(d3_rgbString);
	  var d3_category20b = [ 3750777, 5395619, 7040719, 10264286, 6519097, 9216594, 11915115, 13556636, 9202993, 12426809, 15186514, 15190932, 8666169, 11356490, 14049643, 15177372, 8077683, 10834324, 13528509, 14589654 ].map(d3_rgbString);
	  var d3_category20c = [ 3244733, 7057110, 10406625, 13032431, 15095053, 16616764, 16625259, 16634018, 3253076, 7652470, 10607003, 13101504, 7695281, 10394312, 12369372, 14342891, 6513507, 9868950, 12434877, 14277081 ].map(d3_rgbString);
	  d3.scale.quantile = function() {
	    return d3_scale_quantile([], []);
	  };
	  function d3_scale_quantile(domain, range) {
	    var thresholds;
	    function rescale() {
	      var k = 0, q = range.length;
	      thresholds = [];
	      while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
	      return scale;
	    }
	    function scale(x) {
	      if (!isNaN(x = +x)) return range[d3.bisect(thresholds, x)];
	    }
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      domain = x.map(d3_number).filter(d3_numeric).sort(d3_ascending);
	      return rescale();
	    };
	    scale.range = function(x) {
	      if (!arguments.length) return range;
	      range = x;
	      return rescale();
	    };
	    scale.quantiles = function() {
	      return thresholds;
	    };
	    scale.invertExtent = function(y) {
	      y = range.indexOf(y);
	      return y < 0 ? [ NaN, NaN ] : [ y > 0 ? thresholds[y - 1] : domain[0], y < thresholds.length ? thresholds[y] : domain[domain.length - 1] ];
	    };
	    scale.copy = function() {
	      return d3_scale_quantile(domain, range);
	    };
	    return rescale();
	  }
	  d3.scale.quantize = function() {
	    return d3_scale_quantize(0, 1, [ 0, 1 ]);
	  };
	  function d3_scale_quantize(x0, x1, range) {
	    var kx, i;
	    function scale(x) {
	      return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
	    }
	    function rescale() {
	      kx = range.length / (x1 - x0);
	      i = range.length - 1;
	      return scale;
	    }
	    scale.domain = function(x) {
	      if (!arguments.length) return [ x0, x1 ];
	      x0 = +x[0];
	      x1 = +x[x.length - 1];
	      return rescale();
	    };
	    scale.range = function(x) {
	      if (!arguments.length) return range;
	      range = x;
	      return rescale();
	    };
	    scale.invertExtent = function(y) {
	      y = range.indexOf(y);
	      y = y < 0 ? NaN : y / kx + x0;
	      return [ y, y + 1 / kx ];
	    };
	    scale.copy = function() {
	      return d3_scale_quantize(x0, x1, range);
	    };
	    return rescale();
	  }
	  d3.scale.threshold = function() {
	    return d3_scale_threshold([ .5 ], [ 0, 1 ]);
	  };
	  function d3_scale_threshold(domain, range) {
	    function scale(x) {
	      if (x <= x) return range[d3.bisect(domain, x)];
	    }
	    scale.domain = function(_) {
	      if (!arguments.length) return domain;
	      domain = _;
	      return scale;
	    };
	    scale.range = function(_) {
	      if (!arguments.length) return range;
	      range = _;
	      return scale;
	    };
	    scale.invertExtent = function(y) {
	      y = range.indexOf(y);
	      return [ domain[y - 1], domain[y] ];
	    };
	    scale.copy = function() {
	      return d3_scale_threshold(domain, range);
	    };
	    return scale;
	  }
	  d3.scale.identity = function() {
	    return d3_scale_identity([ 0, 1 ]);
	  };
	  function d3_scale_identity(domain) {
	    function identity(x) {
	      return +x;
	    }
	    identity.invert = identity;
	    identity.domain = identity.range = function(x) {
	      if (!arguments.length) return domain;
	      domain = x.map(identity);
	      return identity;
	    };
	    identity.ticks = function(m) {
	      return d3_scale_linearTicks(domain, m);
	    };
	    identity.tickFormat = function(m, format) {
	      return d3_scale_linearTickFormat(domain, m, format);
	    };
	    identity.copy = function() {
	      return d3_scale_identity(domain);
	    };
	    return identity;
	  }
	  d3.svg = {};
	  function d3_zero() {
	    return 0;
	  }
	  d3.svg.arc = function() {
	    var innerRadius = d3_svg_arcInnerRadius, outerRadius = d3_svg_arcOuterRadius, cornerRadius = d3_zero, padRadius = d3_svg_arcAuto, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle, padAngle = d3_svg_arcPadAngle;
	    function arc() {
	      var r0 = Math.max(0, +innerRadius.apply(this, arguments)), r1 = Math.max(0, +outerRadius.apply(this, arguments)), a0 = startAngle.apply(this, arguments) - halfπ, a1 = endAngle.apply(this, arguments) - halfπ, da = Math.abs(a1 - a0), cw = a0 > a1 ? 0 : 1;
	      if (r1 < r0) rc = r1, r1 = r0, r0 = rc;
	      if (da >= τε) return circleSegment(r1, cw) + (r0 ? circleSegment(r0, 1 - cw) : "") + "Z";
	      var rc, cr, rp, ap, p0 = 0, p1 = 0, x0, y0, x1, y1, x2, y2, x3, y3, path = [];
	      if (ap = (+padAngle.apply(this, arguments) || 0) / 2) {
	        rp = padRadius === d3_svg_arcAuto ? Math.sqrt(r0 * r0 + r1 * r1) : +padRadius.apply(this, arguments);
	        if (!cw) p1 *= -1;
	        if (r1) p1 = d3_asin(rp / r1 * Math.sin(ap));
	        if (r0) p0 = d3_asin(rp / r0 * Math.sin(ap));
	      }
	      if (r1) {
	        x0 = r1 * Math.cos(a0 + p1);
	        y0 = r1 * Math.sin(a0 + p1);
	        x1 = r1 * Math.cos(a1 - p1);
	        y1 = r1 * Math.sin(a1 - p1);
	        var l1 = Math.abs(a1 - a0 - 2 * p1) <= π ? 0 : 1;
	        if (p1 && d3_svg_arcSweep(x0, y0, x1, y1) === cw ^ l1) {
	          var h1 = (a0 + a1) / 2;
	          x0 = r1 * Math.cos(h1);
	          y0 = r1 * Math.sin(h1);
	          x1 = y1 = null;
	        }
	      } else {
	        x0 = y0 = 0;
	      }
	      if (r0) {
	        x2 = r0 * Math.cos(a1 - p0);
	        y2 = r0 * Math.sin(a1 - p0);
	        x3 = r0 * Math.cos(a0 + p0);
	        y3 = r0 * Math.sin(a0 + p0);
	        var l0 = Math.abs(a0 - a1 + 2 * p0) <= π ? 0 : 1;
	        if (p0 && d3_svg_arcSweep(x2, y2, x3, y3) === 1 - cw ^ l0) {
	          var h0 = (a0 + a1) / 2;
	          x2 = r0 * Math.cos(h0);
	          y2 = r0 * Math.sin(h0);
	          x3 = y3 = null;
	        }
	      } else {
	        x2 = y2 = 0;
	      }
	      if (da > ε && (rc = Math.min(Math.abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments))) > .001) {
	        cr = r0 < r1 ^ cw ? 0 : 1;
	        var rc1 = rc, rc0 = rc;
	        if (da < π) {
	          var oc = x3 == null ? [ x2, y2 ] : x1 == null ? [ x0, y0 ] : d3_geom_polygonIntersect([ x0, y0 ], [ x3, y3 ], [ x1, y1 ], [ x2, y2 ]), ax = x0 - oc[0], ay = y0 - oc[1], bx = x1 - oc[0], by = y1 - oc[1], kc = 1 / Math.sin(Math.acos((ax * bx + ay * by) / (Math.sqrt(ax * ax + ay * ay) * Math.sqrt(bx * bx + by * by))) / 2), lc = Math.sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
	          rc0 = Math.min(rc, (r0 - lc) / (kc - 1));
	          rc1 = Math.min(rc, (r1 - lc) / (kc + 1));
	        }
	        if (x1 != null) {
	          var t30 = d3_svg_arcCornerTangents(x3 == null ? [ x2, y2 ] : [ x3, y3 ], [ x0, y0 ], r1, rc1, cw), t12 = d3_svg_arcCornerTangents([ x1, y1 ], [ x2, y2 ], r1, rc1, cw);
	          if (rc === rc1) {
	            path.push("M", t30[0], "A", rc1, ",", rc1, " 0 0,", cr, " ", t30[1], "A", r1, ",", r1, " 0 ", 1 - cw ^ d3_svg_arcSweep(t30[1][0], t30[1][1], t12[1][0], t12[1][1]), ",", cw, " ", t12[1], "A", rc1, ",", rc1, " 0 0,", cr, " ", t12[0]);
	          } else {
	            path.push("M", t30[0], "A", rc1, ",", rc1, " 0 1,", cr, " ", t12[0]);
	          }
	        } else {
	          path.push("M", x0, ",", y0);
	        }
	        if (x3 != null) {
	          var t03 = d3_svg_arcCornerTangents([ x0, y0 ], [ x3, y3 ], r0, -rc0, cw), t21 = d3_svg_arcCornerTangents([ x2, y2 ], x1 == null ? [ x0, y0 ] : [ x1, y1 ], r0, -rc0, cw);
	          if (rc === rc0) {
	            path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t21[1], "A", r0, ",", r0, " 0 ", cw ^ d3_svg_arcSweep(t21[1][0], t21[1][1], t03[1][0], t03[1][1]), ",", 1 - cw, " ", t03[1], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
	          } else {
	            path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
	          }
	        } else {
	          path.push("L", x2, ",", y2);
	        }
	      } else {
	        path.push("M", x0, ",", y0);
	        if (x1 != null) path.push("A", r1, ",", r1, " 0 ", l1, ",", cw, " ", x1, ",", y1);
	        path.push("L", x2, ",", y2);
	        if (x3 != null) path.push("A", r0, ",", r0, " 0 ", l0, ",", 1 - cw, " ", x3, ",", y3);
	      }
	      path.push("Z");
	      return path.join("");
	    }
	    function circleSegment(r1, cw) {
	      return "M0," + r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + -r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + r1;
	    }
	    arc.innerRadius = function(v) {
	      if (!arguments.length) return innerRadius;
	      innerRadius = d3_functor(v);
	      return arc;
	    };
	    arc.outerRadius = function(v) {
	      if (!arguments.length) return outerRadius;
	      outerRadius = d3_functor(v);
	      return arc;
	    };
	    arc.cornerRadius = function(v) {
	      if (!arguments.length) return cornerRadius;
	      cornerRadius = d3_functor(v);
	      return arc;
	    };
	    arc.padRadius = function(v) {
	      if (!arguments.length) return padRadius;
	      padRadius = v == d3_svg_arcAuto ? d3_svg_arcAuto : d3_functor(v);
	      return arc;
	    };
	    arc.startAngle = function(v) {
	      if (!arguments.length) return startAngle;
	      startAngle = d3_functor(v);
	      return arc;
	    };
	    arc.endAngle = function(v) {
	      if (!arguments.length) return endAngle;
	      endAngle = d3_functor(v);
	      return arc;
	    };
	    arc.padAngle = function(v) {
	      if (!arguments.length) return padAngle;
	      padAngle = d3_functor(v);
	      return arc;
	    };
	    arc.centroid = function() {
	      var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2, a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - halfπ;
	      return [ Math.cos(a) * r, Math.sin(a) * r ];
	    };
	    return arc;
	  };
	  var d3_svg_arcAuto = "auto";
	  function d3_svg_arcInnerRadius(d) {
	    return d.innerRadius;
	  }
	  function d3_svg_arcOuterRadius(d) {
	    return d.outerRadius;
	  }
	  function d3_svg_arcStartAngle(d) {
	    return d.startAngle;
	  }
	  function d3_svg_arcEndAngle(d) {
	    return d.endAngle;
	  }
	  function d3_svg_arcPadAngle(d) {
	    return d && d.padAngle;
	  }
	  function d3_svg_arcSweep(x0, y0, x1, y1) {
	    return (x0 - x1) * y0 - (y0 - y1) * x0 > 0 ? 0 : 1;
	  }
	  function d3_svg_arcCornerTangents(p0, p1, r1, rc, cw) {
	    var x01 = p0[0] - p1[0], y01 = p0[1] - p1[1], lo = (cw ? rc : -rc) / Math.sqrt(x01 * x01 + y01 * y01), ox = lo * y01, oy = -lo * x01, x1 = p0[0] + ox, y1 = p0[1] + oy, x2 = p1[0] + ox, y2 = p1[1] + oy, x3 = (x1 + x2) / 2, y3 = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, d2 = dx * dx + dy * dy, r = r1 - rc, D = x1 * y2 - x2 * y1, d = (dy < 0 ? -1 : 1) * Math.sqrt(Math.max(0, r * r * d2 - D * D)), cx0 = (D * dy - dx * d) / d2, cy0 = (-D * dx - dy * d) / d2, cx1 = (D * dy + dx * d) / d2, cy1 = (-D * dx + dy * d) / d2, dx0 = cx0 - x3, dy0 = cy0 - y3, dx1 = cx1 - x3, dy1 = cy1 - y3;
	    if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;
	    return [ [ cx0 - ox, cy0 - oy ], [ cx0 * r1 / r, cy0 * r1 / r ] ];
	  }
	  function d3_svg_line(projection) {
	    var x = d3_geom_pointX, y = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, tension = .7;
	    function line(data) {
	      var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);
	      function segment() {
	        segments.push("M", interpolate(projection(points), tension));
	      }
	      while (++i < n) {
	        if (defined.call(this, d = data[i], i)) {
	          points.push([ +fx.call(this, d, i), +fy.call(this, d, i) ]);
	        } else if (points.length) {
	          segment();
	          points = [];
	        }
	      }
	      if (points.length) segment();
	      return segments.length ? segments.join("") : null;
	    }
	    line.x = function(_) {
	      if (!arguments.length) return x;
	      x = _;
	      return line;
	    };
	    line.y = function(_) {
	      if (!arguments.length) return y;
	      y = _;
	      return line;
	    };
	    line.defined = function(_) {
	      if (!arguments.length) return defined;
	      defined = _;
	      return line;
	    };
	    line.interpolate = function(_) {
	      if (!arguments.length) return interpolateKey;
	      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
	      return line;
	    };
	    line.tension = function(_) {
	      if (!arguments.length) return tension;
	      tension = _;
	      return line;
	    };
	    return line;
	  }
	  d3.svg.line = function() {
	    return d3_svg_line(d3_identity);
	  };
	  var d3_svg_lineInterpolators = d3.map({
	    linear: d3_svg_lineLinear,
	    "linear-closed": d3_svg_lineLinearClosed,
	    step: d3_svg_lineStep,
	    "step-before": d3_svg_lineStepBefore,
	    "step-after": d3_svg_lineStepAfter,
	    basis: d3_svg_lineBasis,
	    "basis-open": d3_svg_lineBasisOpen,
	    "basis-closed": d3_svg_lineBasisClosed,
	    bundle: d3_svg_lineBundle,
	    cardinal: d3_svg_lineCardinal,
	    "cardinal-open": d3_svg_lineCardinalOpen,
	    "cardinal-closed": d3_svg_lineCardinalClosed,
	    monotone: d3_svg_lineMonotone
	  });
	  d3_svg_lineInterpolators.forEach(function(key, value) {
	    value.key = key;
	    value.closed = /-closed$/.test(key);
	  });
	  function d3_svg_lineLinear(points) {
	    return points.length > 1 ? points.join("L") : points + "Z";
	  }
	  function d3_svg_lineLinearClosed(points) {
	    return points.join("L") + "Z";
	  }
	  function d3_svg_lineStep(points) {
	    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
	    while (++i < n) path.push("H", (p[0] + (p = points[i])[0]) / 2, "V", p[1]);
	    if (n > 1) path.push("H", p[0]);
	    return path.join("");
	  }
	  function d3_svg_lineStepBefore(points) {
	    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
	    while (++i < n) path.push("V", (p = points[i])[1], "H", p[0]);
	    return path.join("");
	  }
	  function d3_svg_lineStepAfter(points) {
	    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
	    while (++i < n) path.push("H", (p = points[i])[0], "V", p[1]);
	    return path.join("");
	  }
	  function d3_svg_lineCardinalOpen(points, tension) {
	    return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, -1), d3_svg_lineCardinalTangents(points, tension));
	  }
	  function d3_svg_lineCardinalClosed(points, tension) {
	    return points.length < 3 ? d3_svg_lineLinearClosed(points) : points[0] + d3_svg_lineHermite((points.push(points[0]), 
	    points), d3_svg_lineCardinalTangents([ points[points.length - 2] ].concat(points, [ points[1] ]), tension));
	  }
	  function d3_svg_lineCardinal(points, tension) {
	    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
	  }
	  function d3_svg_lineHermite(points, tangents) {
	    if (tangents.length < 1 || points.length != tangents.length && points.length != tangents.length + 2) {
	      return d3_svg_lineLinear(points);
	    }
	    var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;
	    if (quad) {
	      path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
	      p0 = points[1];
	      pi = 2;
	    }
	    if (tangents.length > 1) {
	      t = tangents[1];
	      p = points[pi];
	      pi++;
	      path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
	      for (var i = 2; i < tangents.length; i++, pi++) {
	        p = points[pi];
	        t = tangents[i];
	        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
	      }
	    }
	    if (quad) {
	      var lp = points[pi];
	      path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
	    }
	    return path;
	  }
	  function d3_svg_lineCardinalTangents(points, tension) {
	    var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
	    while (++i < n) {
	      p0 = p1;
	      p1 = p2;
	      p2 = points[i];
	      tangents.push([ a * (p2[0] - p0[0]), a * (p2[1] - p0[1]) ]);
	    }
	    return tangents;
	  }
	  function d3_svg_lineBasis(points) {
	    if (points.length < 3) return d3_svg_lineLinear(points);
	    var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [ x0, x0, x0, (pi = points[1])[0] ], py = [ y0, y0, y0, pi[1] ], path = [ x0, ",", y0, "L", d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
	    points.push(points[n - 1]);
	    while (++i <= n) {
	      pi = points[i];
	      px.shift();
	      px.push(pi[0]);
	      py.shift();
	      py.push(pi[1]);
	      d3_svg_lineBasisBezier(path, px, py);
	    }
	    points.pop();
	    path.push("L", pi);
	    return path.join("");
	  }
	  function d3_svg_lineBasisOpen(points) {
	    if (points.length < 4) return d3_svg_lineLinear(points);
	    var path = [], i = -1, n = points.length, pi, px = [ 0 ], py = [ 0 ];
	    while (++i < 3) {
	      pi = points[i];
	      px.push(pi[0]);
	      py.push(pi[1]);
	    }
	    path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + "," + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
	    --i;
	    while (++i < n) {
	      pi = points[i];
	      px.shift();
	      px.push(pi[0]);
	      py.shift();
	      py.push(pi[1]);
	      d3_svg_lineBasisBezier(path, px, py);
	    }
	    return path.join("");
	  }
	  function d3_svg_lineBasisClosed(points) {
	    var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
	    while (++i < 4) {
	      pi = points[i % n];
	      px.push(pi[0]);
	      py.push(pi[1]);
	    }
	    path = [ d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
	    --i;
	    while (++i < m) {
	      pi = points[i % n];
	      px.shift();
	      px.push(pi[0]);
	      py.shift();
	      py.push(pi[1]);
	      d3_svg_lineBasisBezier(path, px, py);
	    }
	    return path.join("");
	  }
	  function d3_svg_lineBundle(points, tension) {
	    var n = points.length - 1;
	    if (n) {
	      var x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p, t;
	      while (++i <= n) {
	        p = points[i];
	        t = i / n;
	        p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
	        p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
	      }
	    }
	    return d3_svg_lineBasis(points);
	  }
	  function d3_svg_lineDot4(a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
	  }
	  var d3_svg_lineBasisBezier1 = [ 0, 2 / 3, 1 / 3, 0 ], d3_svg_lineBasisBezier2 = [ 0, 1 / 3, 2 / 3, 0 ], d3_svg_lineBasisBezier3 = [ 0, 1 / 6, 2 / 3, 1 / 6 ];
	  function d3_svg_lineBasisBezier(path, x, y) {
	    path.push("C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
	  }
	  function d3_svg_lineSlope(p0, p1) {
	    return (p1[1] - p0[1]) / (p1[0] - p0[0]);
	  }
	  function d3_svg_lineFiniteDifferences(points) {
	    var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1], d = m[0] = d3_svg_lineSlope(p0, p1);
	    while (++i < j) {
	      m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
	    }
	    m[i] = d;
	    return m;
	  }
	  function d3_svg_lineMonotoneTangents(points) {
	    var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;
	    while (++i < j) {
	      d = d3_svg_lineSlope(points[i], points[i + 1]);
	      if (abs(d) < ε) {
	        m[i] = m[i + 1] = 0;
	      } else {
	        a = m[i] / d;
	        b = m[i + 1] / d;
	        s = a * a + b * b;
	        if (s > 9) {
	          s = d * 3 / Math.sqrt(s);
	          m[i] = s * a;
	          m[i + 1] = s * b;
	        }
	      }
	    }
	    i = -1;
	    while (++i <= j) {
	      s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
	      tangents.push([ s || 0, m[i] * s || 0 ]);
	    }
	    return tangents;
	  }
	  function d3_svg_lineMonotone(points) {
	    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
	  }
	  d3.svg.line.radial = function() {
	    var line = d3_svg_line(d3_svg_lineRadial);
	    line.radius = line.x, delete line.x;
	    line.angle = line.y, delete line.y;
	    return line;
	  };
	  function d3_svg_lineRadial(points) {
	    var point, i = -1, n = points.length, r, a;
	    while (++i < n) {
	      point = points[i];
	      r = point[0];
	      a = point[1] - halfπ;
	      point[0] = r * Math.cos(a);
	      point[1] = r * Math.sin(a);
	    }
	    return points;
	  }
	  function d3_svg_area(projection) {
	    var x0 = d3_geom_pointX, x1 = d3_geom_pointX, y0 = 0, y1 = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, interpolateReverse = interpolate, L = "L", tension = .7;
	    function area(data) {
	      var segments = [], points0 = [], points1 = [], i = -1, n = data.length, d, fx0 = d3_functor(x0), fy0 = d3_functor(y0), fx1 = x0 === x1 ? function() {
	        return x;
	      } : d3_functor(x1), fy1 = y0 === y1 ? function() {
	        return y;
	      } : d3_functor(y1), x, y;
	      function segment() {
	        segments.push("M", interpolate(projection(points1), tension), L, interpolateReverse(projection(points0.reverse()), tension), "Z");
	      }
	      while (++i < n) {
	        if (defined.call(this, d = data[i], i)) {
	          points0.push([ x = +fx0.call(this, d, i), y = +fy0.call(this, d, i) ]);
	          points1.push([ +fx1.call(this, d, i), +fy1.call(this, d, i) ]);
	        } else if (points0.length) {
	          segment();
	          points0 = [];
	          points1 = [];
	        }
	      }
	      if (points0.length) segment();
	      return segments.length ? segments.join("") : null;
	    }
	    area.x = function(_) {
	      if (!arguments.length) return x1;
	      x0 = x1 = _;
	      return area;
	    };
	    area.x0 = function(_) {
	      if (!arguments.length) return x0;
	      x0 = _;
	      return area;
	    };
	    area.x1 = function(_) {
	      if (!arguments.length) return x1;
	      x1 = _;
	      return area;
	    };
	    area.y = function(_) {
	      if (!arguments.length) return y1;
	      y0 = y1 = _;
	      return area;
	    };
	    area.y0 = function(_) {
	      if (!arguments.length) return y0;
	      y0 = _;
	      return area;
	    };
	    area.y1 = function(_) {
	      if (!arguments.length) return y1;
	      y1 = _;
	      return area;
	    };
	    area.defined = function(_) {
	      if (!arguments.length) return defined;
	      defined = _;
	      return area;
	    };
	    area.interpolate = function(_) {
	      if (!arguments.length) return interpolateKey;
	      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
	      interpolateReverse = interpolate.reverse || interpolate;
	      L = interpolate.closed ? "M" : "L";
	      return area;
	    };
	    area.tension = function(_) {
	      if (!arguments.length) return tension;
	      tension = _;
	      return area;
	    };
	    return area;
	  }
	  d3_svg_lineStepBefore.reverse = d3_svg_lineStepAfter;
	  d3_svg_lineStepAfter.reverse = d3_svg_lineStepBefore;
	  d3.svg.area = function() {
	    return d3_svg_area(d3_identity);
	  };
	  d3.svg.area.radial = function() {
	    var area = d3_svg_area(d3_svg_lineRadial);
	    area.radius = area.x, delete area.x;
	    area.innerRadius = area.x0, delete area.x0;
	    area.outerRadius = area.x1, delete area.x1;
	    area.angle = area.y, delete area.y;
	    area.startAngle = area.y0, delete area.y0;
	    area.endAngle = area.y1, delete area.y1;
	    return area;
	  };
	  d3.svg.chord = function() {
	    var source = d3_source, target = d3_target, radius = d3_svg_chordRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
	    function chord(d, i) {
	      var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
	      return "M" + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.r, s.p1, s.r, s.p0) : curve(s.r, s.p1, t.r, t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(t.r, t.p1, s.r, s.p0)) + "Z";
	    }
	    function subgroup(self, f, d, i) {
	      var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i), a0 = startAngle.call(self, subgroup, i) - halfπ, a1 = endAngle.call(self, subgroup, i) - halfπ;
	      return {
	        r: r,
	        a0: a0,
	        a1: a1,
	        p0: [ r * Math.cos(a0), r * Math.sin(a0) ],
	        p1: [ r * Math.cos(a1), r * Math.sin(a1) ]
	      };
	    }
	    function equals(a, b) {
	      return a.a0 == b.a0 && a.a1 == b.a1;
	    }
	    function arc(r, p, a) {
	      return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + p;
	    }
	    function curve(r0, p0, r1, p1) {
	      return "Q 0,0 " + p1;
	    }
	    chord.radius = function(v) {
	      if (!arguments.length) return radius;
	      radius = d3_functor(v);
	      return chord;
	    };
	    chord.source = function(v) {
	      if (!arguments.length) return source;
	      source = d3_functor(v);
	      return chord;
	    };
	    chord.target = function(v) {
	      if (!arguments.length) return target;
	      target = d3_functor(v);
	      return chord;
	    };
	    chord.startAngle = function(v) {
	      if (!arguments.length) return startAngle;
	      startAngle = d3_functor(v);
	      return chord;
	    };
	    chord.endAngle = function(v) {
	      if (!arguments.length) return endAngle;
	      endAngle = d3_functor(v);
	      return chord;
	    };
	    return chord;
	  };
	  function d3_svg_chordRadius(d) {
	    return d.radius;
	  }
	  d3.svg.diagonal = function() {
	    var source = d3_source, target = d3_target, projection = d3_svg_diagonalProjection;
	    function diagonal(d, i) {
	      var p0 = source.call(this, d, i), p3 = target.call(this, d, i), m = (p0.y + p3.y) / 2, p = [ p0, {
	        x: p0.x,
	        y: m
	      }, {
	        x: p3.x,
	        y: m
	      }, p3 ];
	      p = p.map(projection);
	      return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
	    }
	    diagonal.source = function(x) {
	      if (!arguments.length) return source;
	      source = d3_functor(x);
	      return diagonal;
	    };
	    diagonal.target = function(x) {
	      if (!arguments.length) return target;
	      target = d3_functor(x);
	      return diagonal;
	    };
	    diagonal.projection = function(x) {
	      if (!arguments.length) return projection;
	      projection = x;
	      return diagonal;
	    };
	    return diagonal;
	  };
	  function d3_svg_diagonalProjection(d) {
	    return [ d.x, d.y ];
	  }
	  d3.svg.diagonal.radial = function() {
	    var diagonal = d3.svg.diagonal(), projection = d3_svg_diagonalProjection, projection_ = diagonal.projection;
	    diagonal.projection = function(x) {
	      return arguments.length ? projection_(d3_svg_diagonalRadialProjection(projection = x)) : projection;
	    };
	    return diagonal;
	  };
	  function d3_svg_diagonalRadialProjection(projection) {
	    return function() {
	      var d = projection.apply(this, arguments), r = d[0], a = d[1] - halfπ;
	      return [ r * Math.cos(a), r * Math.sin(a) ];
	    };
	  }
	  d3.svg.symbol = function() {
	    var type = d3_svg_symbolType, size = d3_svg_symbolSize;
	    function symbol(d, i) {
	      return (d3_svg_symbols.get(type.call(this, d, i)) || d3_svg_symbolCircle)(size.call(this, d, i));
	    }
	    symbol.type = function(x) {
	      if (!arguments.length) return type;
	      type = d3_functor(x);
	      return symbol;
	    };
	    symbol.size = function(x) {
	      if (!arguments.length) return size;
	      size = d3_functor(x);
	      return symbol;
	    };
	    return symbol;
	  };
	  function d3_svg_symbolSize() {
	    return 64;
	  }
	  function d3_svg_symbolType() {
	    return "circle";
	  }
	  function d3_svg_symbolCircle(size) {
	    var r = Math.sqrt(size / π);
	    return "M0," + r + "A" + r + "," + r + " 0 1,1 0," + -r + "A" + r + "," + r + " 0 1,1 0," + r + "Z";
	  }
	  var d3_svg_symbols = d3.map({
	    circle: d3_svg_symbolCircle,
	    cross: function(size) {
	      var r = Math.sqrt(size / 5) / 2;
	      return "M" + -3 * r + "," + -r + "H" + -r + "V" + -3 * r + "H" + r + "V" + -r + "H" + 3 * r + "V" + r + "H" + r + "V" + 3 * r + "H" + -r + "V" + r + "H" + -3 * r + "Z";
	    },
	    diamond: function(size) {
	      var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
	      return "M0," + -ry + "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" + "Z";
	    },
	    square: function(size) {
	      var r = Math.sqrt(size) / 2;
	      return "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r + "Z";
	    },
	    "triangle-down": function(size) {
	      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
	      return "M0," + ry + "L" + rx + "," + -ry + " " + -rx + "," + -ry + "Z";
	    },
	    "triangle-up": function(size) {
	      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
	      return "M0," + -ry + "L" + rx + "," + ry + " " + -rx + "," + ry + "Z";
	    }
	  });
	  d3.svg.symbolTypes = d3_svg_symbols.keys();
	  var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * d3_radians);
	  d3_selectionPrototype.transition = function(name) {
	    var id = d3_transitionInheritId || ++d3_transitionId, ns = d3_transitionNamespace(name), subgroups = [], subgroup, node, transition = d3_transitionInherit || {
	      time: Date.now(),
	      ease: d3_ease_cubicInOut,
	      delay: 0,
	      duration: 250
	    };
	    for (var j = -1, m = this.length; ++j < m; ) {
	      subgroups.push(subgroup = []);
	      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) d3_transitionNode(node, i, ns, id, transition);
	        subgroup.push(node);
	      }
	    }
	    return d3_transition(subgroups, ns, id);
	  };
	  d3_selectionPrototype.interrupt = function(name) {
	    return this.each(name == null ? d3_selection_interrupt : d3_selection_interruptNS(d3_transitionNamespace(name)));
	  };
	  var d3_selection_interrupt = d3_selection_interruptNS(d3_transitionNamespace());
	  function d3_selection_interruptNS(ns) {
	    return function() {
	      var lock, activeId, active;
	      if ((lock = this[ns]) && (active = lock[activeId = lock.active])) {
	        active.timer.c = null;
	        active.timer.t = NaN;
	        if (--lock.count) delete lock[activeId]; else delete this[ns];
	        lock.active += .5;
	        active.event && active.event.interrupt.call(this, this.__data__, active.index);
	      }
	    };
	  }
	  function d3_transition(groups, ns, id) {
	    d3_subclass(groups, d3_transitionPrototype);
	    groups.namespace = ns;
	    groups.id = id;
	    return groups;
	  }
	  var d3_transitionPrototype = [], d3_transitionId = 0, d3_transitionInheritId, d3_transitionInherit;
	  d3_transitionPrototype.call = d3_selectionPrototype.call;
	  d3_transitionPrototype.empty = d3_selectionPrototype.empty;
	  d3_transitionPrototype.node = d3_selectionPrototype.node;
	  d3_transitionPrototype.size = d3_selectionPrototype.size;
	  d3.transition = function(selection, name) {
	    return selection && selection.transition ? d3_transitionInheritId ? selection.transition(name) : selection : d3.selection().transition(selection);
	  };
	  d3.transition.prototype = d3_transitionPrototype;
	  d3_transitionPrototype.select = function(selector) {
	    var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnode, node;
	    selector = d3_selection_selector(selector);
	    for (var j = -1, m = this.length; ++j < m; ) {
	      subgroups.push(subgroup = []);
	      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
	        if ((node = group[i]) && (subnode = selector.call(node, node.__data__, i, j))) {
	          if ("__data__" in node) subnode.__data__ = node.__data__;
	          d3_transitionNode(subnode, i, ns, id, node[ns][id]);
	          subgroup.push(subnode);
	        } else {
	          subgroup.push(null);
	        }
	      }
	    }
	    return d3_transition(subgroups, ns, id);
	  };
	  d3_transitionPrototype.selectAll = function(selector) {
	    var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnodes, node, subnode, transition;
	    selector = d3_selection_selectorAll(selector);
	    for (var j = -1, m = this.length; ++j < m; ) {
	      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) {
	          transition = node[ns][id];
	          subnodes = selector.call(node, node.__data__, i, j);
	          subgroups.push(subgroup = []);
	          for (var k = -1, o = subnodes.length; ++k < o; ) {
	            if (subnode = subnodes[k]) d3_transitionNode(subnode, k, ns, id, transition);
	            subgroup.push(subnode);
	          }
	        }
	      }
	    }
	    return d3_transition(subgroups, ns, id);
	  };
	  d3_transitionPrototype.filter = function(filter) {
	    var subgroups = [], subgroup, group, node;
	    if (typeof filter !== "function") filter = d3_selection_filter(filter);
	    for (var j = 0, m = this.length; j < m; j++) {
	      subgroups.push(subgroup = []);
	      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
	        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
	          subgroup.push(node);
	        }
	      }
	    }
	    return d3_transition(subgroups, this.namespace, this.id);
	  };
	  d3_transitionPrototype.tween = function(name, tween) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 2) return this.node()[ns][id].tween.get(name);
	    return d3_selection_each(this, tween == null ? function(node) {
	      node[ns][id].tween.remove(name);
	    } : function(node) {
	      node[ns][id].tween.set(name, tween);
	    });
	  };
	  function d3_transition_tween(groups, name, value, tween) {
	    var id = groups.id, ns = groups.namespace;
	    return d3_selection_each(groups, typeof value === "function" ? function(node, i, j) {
	      node[ns][id].tween.set(name, tween(value.call(node, node.__data__, i, j)));
	    } : (value = tween(value), function(node) {
	      node[ns][id].tween.set(name, value);
	    }));
	  }
	  d3_transitionPrototype.attr = function(nameNS, value) {
	    if (arguments.length < 2) {
	      for (value in nameNS) this.attr(value, nameNS[value]);
	      return this;
	    }
	    var interpolate = nameNS == "transform" ? d3_interpolateTransform : d3_interpolate, name = d3.ns.qualify(nameNS);
	    function attrNull() {
	      this.removeAttribute(name);
	    }
	    function attrNullNS() {
	      this.removeAttributeNS(name.space, name.local);
	    }
	    function attrTween(b) {
	      return b == null ? attrNull : (b += "", function() {
	        var a = this.getAttribute(name), i;
	        return a !== b && (i = interpolate(a, b), function(t) {
	          this.setAttribute(name, i(t));
	        });
	      });
	    }
	    function attrTweenNS(b) {
	      return b == null ? attrNullNS : (b += "", function() {
	        var a = this.getAttributeNS(name.space, name.local), i;
	        return a !== b && (i = interpolate(a, b), function(t) {
	          this.setAttributeNS(name.space, name.local, i(t));
	        });
	      });
	    }
	    return d3_transition_tween(this, "attr." + nameNS, value, name.local ? attrTweenNS : attrTween);
	  };
	  d3_transitionPrototype.attrTween = function(nameNS, tween) {
	    var name = d3.ns.qualify(nameNS);
	    function attrTween(d, i) {
	      var f = tween.call(this, d, i, this.getAttribute(name));
	      return f && function(t) {
	        this.setAttribute(name, f(t));
	      };
	    }
	    function attrTweenNS(d, i) {
	      var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
	      return f && function(t) {
	        this.setAttributeNS(name.space, name.local, f(t));
	      };
	    }
	    return this.tween("attr." + nameNS, name.local ? attrTweenNS : attrTween);
	  };
	  d3_transitionPrototype.style = function(name, value, priority) {
	    var n = arguments.length;
	    if (n < 3) {
	      if (typeof name !== "string") {
	        if (n < 2) value = "";
	        for (priority in name) this.style(priority, name[priority], value);
	        return this;
	      }
	      priority = "";
	    }
	    function styleNull() {
	      this.style.removeProperty(name);
	    }
	    function styleString(b) {
	      return b == null ? styleNull : (b += "", function() {
	        var a = d3_window(this).getComputedStyle(this, null).getPropertyValue(name), i;
	        return a !== b && (i = d3_interpolate(a, b), function(t) {
	          this.style.setProperty(name, i(t), priority);
	        });
	      });
	    }
	    return d3_transition_tween(this, "style." + name, value, styleString);
	  };
	  d3_transitionPrototype.styleTween = function(name, tween, priority) {
	    if (arguments.length < 3) priority = "";
	    function styleTween(d, i) {
	      var f = tween.call(this, d, i, d3_window(this).getComputedStyle(this, null).getPropertyValue(name));
	      return f && function(t) {
	        this.style.setProperty(name, f(t), priority);
	      };
	    }
	    return this.tween("style." + name, styleTween);
	  };
	  d3_transitionPrototype.text = function(value) {
	    return d3_transition_tween(this, "text", value, d3_transition_text);
	  };
	  function d3_transition_text(b) {
	    if (b == null) b = "";
	    return function() {
	      this.textContent = b;
	    };
	  }
	  d3_transitionPrototype.remove = function() {
	    var ns = this.namespace;
	    return this.each("end.transition", function() {
	      var p;
	      if (this[ns].count < 2 && (p = this.parentNode)) p.removeChild(this);
	    });
	  };
	  d3_transitionPrototype.ease = function(value) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 1) return this.node()[ns][id].ease;
	    if (typeof value !== "function") value = d3.ease.apply(d3, arguments);
	    return d3_selection_each(this, function(node) {
	      node[ns][id].ease = value;
	    });
	  };
	  d3_transitionPrototype.delay = function(value) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 1) return this.node()[ns][id].delay;
	    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
	      node[ns][id].delay = +value.call(node, node.__data__, i, j);
	    } : (value = +value, function(node) {
	      node[ns][id].delay = value;
	    }));
	  };
	  d3_transitionPrototype.duration = function(value) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 1) return this.node()[ns][id].duration;
	    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
	      node[ns][id].duration = Math.max(1, value.call(node, node.__data__, i, j));
	    } : (value = Math.max(1, value), function(node) {
	      node[ns][id].duration = value;
	    }));
	  };
	  d3_transitionPrototype.each = function(type, listener) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 2) {
	      var inherit = d3_transitionInherit, inheritId = d3_transitionInheritId;
	      try {
	        d3_transitionInheritId = id;
	        d3_selection_each(this, function(node, i, j) {
	          d3_transitionInherit = node[ns][id];
	          type.call(node, node.__data__, i, j);
	        });
	      } finally {
	        d3_transitionInherit = inherit;
	        d3_transitionInheritId = inheritId;
	      }
	    } else {
	      d3_selection_each(this, function(node) {
	        var transition = node[ns][id];
	        (transition.event || (transition.event = d3.dispatch("start", "end", "interrupt"))).on(type, listener);
	      });
	    }
	    return this;
	  };
	  d3_transitionPrototype.transition = function() {
	    var id0 = this.id, id1 = ++d3_transitionId, ns = this.namespace, subgroups = [], subgroup, group, node, transition;
	    for (var j = 0, m = this.length; j < m; j++) {
	      subgroups.push(subgroup = []);
	      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
	        if (node = group[i]) {
	          transition = node[ns][id0];
	          d3_transitionNode(node, i, ns, id1, {
	            time: transition.time,
	            ease: transition.ease,
	            delay: transition.delay + transition.duration,
	            duration: transition.duration
	          });
	        }
	        subgroup.push(node);
	      }
	    }
	    return d3_transition(subgroups, ns, id1);
	  };
	  function d3_transitionNamespace(name) {
	    return name == null ? "__transition__" : "__transition_" + name + "__";
	  }
	  function d3_transitionNode(node, i, ns, id, inherit) {
	    var lock = node[ns] || (node[ns] = {
	      active: 0,
	      count: 0
	    }), transition = lock[id], time, timer, duration, ease, tweens;
	    function schedule(elapsed) {
	      var delay = transition.delay;
	      timer.t = delay + time;
	      if (delay <= elapsed) return start(elapsed - delay);
	      timer.c = start;
	    }
	    function start(elapsed) {
	      var activeId = lock.active, active = lock[activeId];
	      if (active) {
	        active.timer.c = null;
	        active.timer.t = NaN;
	        --lock.count;
	        delete lock[activeId];
	        active.event && active.event.interrupt.call(node, node.__data__, active.index);
	      }
	      for (var cancelId in lock) {
	        if (+cancelId < id) {
	          var cancel = lock[cancelId];
	          cancel.timer.c = null;
	          cancel.timer.t = NaN;
	          --lock.count;
	          delete lock[cancelId];
	        }
	      }
	      timer.c = tick;
	      d3_timer(function() {
	        if (timer.c && tick(elapsed || 1)) {
	          timer.c = null;
	          timer.t = NaN;
	        }
	        return 1;
	      }, 0, time);
	      lock.active = id;
	      transition.event && transition.event.start.call(node, node.__data__, i);
	      tweens = [];
	      transition.tween.forEach(function(key, value) {
	        if (value = value.call(node, node.__data__, i)) {
	          tweens.push(value);
	        }
	      });
	      ease = transition.ease;
	      duration = transition.duration;
	    }
	    function tick(elapsed) {
	      var t = elapsed / duration, e = ease(t), n = tweens.length;
	      while (n > 0) {
	        tweens[--n].call(node, e);
	      }
	      if (t >= 1) {
	        transition.event && transition.event.end.call(node, node.__data__, i);
	        if (--lock.count) delete lock[id]; else delete node[ns];
	        return 1;
	      }
	    }
	    if (!transition) {
	      time = inherit.time;
	      timer = d3_timer(schedule, 0, time);
	      transition = lock[id] = {
	        tween: new d3_Map(),
	        time: time,
	        timer: timer,
	        delay: inherit.delay,
	        duration: inherit.duration,
	        ease: inherit.ease,
	        index: i
	      };
	      inherit = null;
	      ++lock.count;
	    }
	  }
	  d3.svg.axis = function() {
	    var scale = d3.scale.linear(), orient = d3_svg_axisDefaultOrient, innerTickSize = 6, outerTickSize = 6, tickPadding = 3, tickArguments_ = [ 10 ], tickValues = null, tickFormat_;
	    function axis(g) {
	      g.each(function() {
	        var g = d3.select(this);
	        var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = scale.copy();
	        var ticks = tickValues == null ? scale1.ticks ? scale1.ticks.apply(scale1, tickArguments_) : scale1.domain() : tickValues, tickFormat = tickFormat_ == null ? scale1.tickFormat ? scale1.tickFormat.apply(scale1, tickArguments_) : d3_identity : tickFormat_, tick = g.selectAll(".tick").data(ticks, scale1), tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", ε), tickExit = d3.transition(tick.exit()).style("opacity", ε).remove(), tickUpdate = d3.transition(tick.order()).style("opacity", 1), tickSpacing = Math.max(innerTickSize, 0) + tickPadding, tickTransform;
	        var range = d3_scaleRange(scale1), path = g.selectAll(".domain").data([ 0 ]), pathUpdate = (path.enter().append("path").attr("class", "domain"), 
	        d3.transition(path));
	        tickEnter.append("line");
	        tickEnter.append("text");
	        var lineEnter = tickEnter.select("line"), lineUpdate = tickUpdate.select("line"), text = tick.select("text").text(tickFormat), textEnter = tickEnter.select("text"), textUpdate = tickUpdate.select("text"), sign = orient === "top" || orient === "left" ? -1 : 1, x1, x2, y1, y2;
	        if (orient === "bottom" || orient === "top") {
	          tickTransform = d3_svg_axisX, x1 = "x", y1 = "y", x2 = "x2", y2 = "y2";
	          text.attr("dy", sign < 0 ? "0em" : ".71em").style("text-anchor", "middle");
	          pathUpdate.attr("d", "M" + range[0] + "," + sign * outerTickSize + "V0H" + range[1] + "V" + sign * outerTickSize);
	        } else {
	          tickTransform = d3_svg_axisY, x1 = "y", y1 = "x", x2 = "y2", y2 = "x2";
	          text.attr("dy", ".32em").style("text-anchor", sign < 0 ? "end" : "start");
	          pathUpdate.attr("d", "M" + sign * outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + sign * outerTickSize);
	        }
	        lineEnter.attr(y2, sign * innerTickSize);
	        textEnter.attr(y1, sign * tickSpacing);
	        lineUpdate.attr(x2, 0).attr(y2, sign * innerTickSize);
	        textUpdate.attr(x1, 0).attr(y1, sign * tickSpacing);
	        if (scale1.rangeBand) {
	          var x = scale1, dx = x.rangeBand() / 2;
	          scale0 = scale1 = function(d) {
	            return x(d) + dx;
	          };
	        } else if (scale0.rangeBand) {
	          scale0 = scale1;
	        } else {
	          tickExit.call(tickTransform, scale1, scale0);
	        }
	        tickEnter.call(tickTransform, scale0, scale1);
	        tickUpdate.call(tickTransform, scale1, scale1);
	      });
	    }
	    axis.scale = function(x) {
	      if (!arguments.length) return scale;
	      scale = x;
	      return axis;
	    };
	    axis.orient = function(x) {
	      if (!arguments.length) return orient;
	      orient = x in d3_svg_axisOrients ? x + "" : d3_svg_axisDefaultOrient;
	      return axis;
	    };
	    axis.ticks = function() {
	      if (!arguments.length) return tickArguments_;
	      tickArguments_ = d3_array(arguments);
	      return axis;
	    };
	    axis.tickValues = function(x) {
	      if (!arguments.length) return tickValues;
	      tickValues = x;
	      return axis;
	    };
	    axis.tickFormat = function(x) {
	      if (!arguments.length) return tickFormat_;
	      tickFormat_ = x;
	      return axis;
	    };
	    axis.tickSize = function(x) {
	      var n = arguments.length;
	      if (!n) return innerTickSize;
	      innerTickSize = +x;
	      outerTickSize = +arguments[n - 1];
	      return axis;
	    };
	    axis.innerTickSize = function(x) {
	      if (!arguments.length) return innerTickSize;
	      innerTickSize = +x;
	      return axis;
	    };
	    axis.outerTickSize = function(x) {
	      if (!arguments.length) return outerTickSize;
	      outerTickSize = +x;
	      return axis;
	    };
	    axis.tickPadding = function(x) {
	      if (!arguments.length) return tickPadding;
	      tickPadding = +x;
	      return axis;
	    };
	    axis.tickSubdivide = function() {
	      return arguments.length && axis;
	    };
	    return axis;
	  };
	  var d3_svg_axisDefaultOrient = "bottom", d3_svg_axisOrients = {
	    top: 1,
	    right: 1,
	    bottom: 1,
	    left: 1
	  };
	  function d3_svg_axisX(selection, x0, x1) {
	    selection.attr("transform", function(d) {
	      var v0 = x0(d);
	      return "translate(" + (isFinite(v0) ? v0 : x1(d)) + ",0)";
	    });
	  }
	  function d3_svg_axisY(selection, y0, y1) {
	    selection.attr("transform", function(d) {
	      var v0 = y0(d);
	      return "translate(0," + (isFinite(v0) ? v0 : y1(d)) + ")";
	    });
	  }
	  d3.svg.brush = function() {
	    var event = d3_eventDispatch(brush, "brushstart", "brush", "brushend"), x = null, y = null, xExtent = [ 0, 0 ], yExtent = [ 0, 0 ], xExtentDomain, yExtentDomain, xClamp = true, yClamp = true, resizes = d3_svg_brushResizes[0];
	    function brush(g) {
	      g.each(function() {
	        var g = d3.select(this).style("pointer-events", "all").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)").on("mousedown.brush", brushstart).on("touchstart.brush", brushstart);
	        var background = g.selectAll(".background").data([ 0 ]);
	        background.enter().append("rect").attr("class", "background").style("visibility", "hidden").style("cursor", "crosshair");
	        g.selectAll(".extent").data([ 0 ]).enter().append("rect").attr("class", "extent").style("cursor", "move");
	        var resize = g.selectAll(".resize").data(resizes, d3_identity);
	        resize.exit().remove();
	        resize.enter().append("g").attr("class", function(d) {
	          return "resize " + d;
	        }).style("cursor", function(d) {
	          return d3_svg_brushCursor[d];
	        }).append("rect").attr("x", function(d) {
	          return /[ew]$/.test(d) ? -3 : null;
	        }).attr("y", function(d) {
	          return /^[ns]/.test(d) ? -3 : null;
	        }).attr("width", 6).attr("height", 6).style("visibility", "hidden");
	        resize.style("display", brush.empty() ? "none" : null);
	        var gUpdate = d3.transition(g), backgroundUpdate = d3.transition(background), range;
	        if (x) {
	          range = d3_scaleRange(x);
	          backgroundUpdate.attr("x", range[0]).attr("width", range[1] - range[0]);
	          redrawX(gUpdate);
	        }
	        if (y) {
	          range = d3_scaleRange(y);
	          backgroundUpdate.attr("y", range[0]).attr("height", range[1] - range[0]);
	          redrawY(gUpdate);
	        }
	        redraw(gUpdate);
	      });
	    }
	    brush.event = function(g) {
	      g.each(function() {
	        var event_ = event.of(this, arguments), extent1 = {
	          x: xExtent,
	          y: yExtent,
	          i: xExtentDomain,
	          j: yExtentDomain
	        }, extent0 = this.__chart__ || extent1;
	        this.__chart__ = extent1;
	        if (d3_transitionInheritId) {
	          d3.select(this).transition().each("start.brush", function() {
	            xExtentDomain = extent0.i;
	            yExtentDomain = extent0.j;
	            xExtent = extent0.x;
	            yExtent = extent0.y;
	            event_({
	              type: "brushstart"
	            });
	          }).tween("brush:brush", function() {
	            var xi = d3_interpolateArray(xExtent, extent1.x), yi = d3_interpolateArray(yExtent, extent1.y);
	            xExtentDomain = yExtentDomain = null;
	            return function(t) {
	              xExtent = extent1.x = xi(t);
	              yExtent = extent1.y = yi(t);
	              event_({
	                type: "brush",
	                mode: "resize"
	              });
	            };
	          }).each("end.brush", function() {
	            xExtentDomain = extent1.i;
	            yExtentDomain = extent1.j;
	            event_({
	              type: "brush",
	              mode: "resize"
	            });
	            event_({
	              type: "brushend"
	            });
	          });
	        } else {
	          event_({
	            type: "brushstart"
	          });
	          event_({
	            type: "brush",
	            mode: "resize"
	          });
	          event_({
	            type: "brushend"
	          });
	        }
	      });
	    };
	    function redraw(g) {
	      g.selectAll(".resize").attr("transform", function(d) {
	        return "translate(" + xExtent[+/e$/.test(d)] + "," + yExtent[+/^s/.test(d)] + ")";
	      });
	    }
	    function redrawX(g) {
	      g.select(".extent").attr("x", xExtent[0]);
	      g.selectAll(".extent,.n>rect,.s>rect").attr("width", xExtent[1] - xExtent[0]);
	    }
	    function redrawY(g) {
	      g.select(".extent").attr("y", yExtent[0]);
	      g.selectAll(".extent,.e>rect,.w>rect").attr("height", yExtent[1] - yExtent[0]);
	    }
	    function brushstart() {
	      var target = this, eventTarget = d3.select(d3.event.target), event_ = event.of(target, arguments), g = d3.select(target), resizing = eventTarget.datum(), resizingX = !/^(n|s)$/.test(resizing) && x, resizingY = !/^(e|w)$/.test(resizing) && y, dragging = eventTarget.classed("extent"), dragRestore = d3_event_dragSuppress(target), center, origin = d3.mouse(target), offset;
	      var w = d3.select(d3_window(target)).on("keydown.brush", keydown).on("keyup.brush", keyup);
	      if (d3.event.changedTouches) {
	        w.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
	      } else {
	        w.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
	      }
	      g.interrupt().selectAll("*").interrupt();
	      if (dragging) {
	        origin[0] = xExtent[0] - origin[0];
	        origin[1] = yExtent[0] - origin[1];
	      } else if (resizing) {
	        var ex = +/w$/.test(resizing), ey = +/^n/.test(resizing);
	        offset = [ xExtent[1 - ex] - origin[0], yExtent[1 - ey] - origin[1] ];
	        origin[0] = xExtent[ex];
	        origin[1] = yExtent[ey];
	      } else if (d3.event.altKey) center = origin.slice();
	      g.style("pointer-events", "none").selectAll(".resize").style("display", null);
	      d3.select("body").style("cursor", eventTarget.style("cursor"));
	      event_({
	        type: "brushstart"
	      });
	      brushmove();
	      function keydown() {
	        if (d3.event.keyCode == 32) {
	          if (!dragging) {
	            center = null;
	            origin[0] -= xExtent[1];
	            origin[1] -= yExtent[1];
	            dragging = 2;
	          }
	          d3_eventPreventDefault();
	        }
	      }
	      function keyup() {
	        if (d3.event.keyCode == 32 && dragging == 2) {
	          origin[0] += xExtent[1];
	          origin[1] += yExtent[1];
	          dragging = 0;
	          d3_eventPreventDefault();
	        }
	      }
	      function brushmove() {
	        var point = d3.mouse(target), moved = false;
	        if (offset) {
	          point[0] += offset[0];
	          point[1] += offset[1];
	        }
	        if (!dragging) {
	          if (d3.event.altKey) {
	            if (!center) center = [ (xExtent[0] + xExtent[1]) / 2, (yExtent[0] + yExtent[1]) / 2 ];
	            origin[0] = xExtent[+(point[0] < center[0])];
	            origin[1] = yExtent[+(point[1] < center[1])];
	          } else center = null;
	        }
	        if (resizingX && move1(point, x, 0)) {
	          redrawX(g);
	          moved = true;
	        }
	        if (resizingY && move1(point, y, 1)) {
	          redrawY(g);
	          moved = true;
	        }
	        if (moved) {
	          redraw(g);
	          event_({
	            type: "brush",
	            mode: dragging ? "move" : "resize"
	          });
	        }
	      }
	      function move1(point, scale, i) {
	        var range = d3_scaleRange(scale), r0 = range[0], r1 = range[1], position = origin[i], extent = i ? yExtent : xExtent, size = extent[1] - extent[0], min, max;
	        if (dragging) {
	          r0 -= position;
	          r1 -= size + position;
	        }
	        min = (i ? yClamp : xClamp) ? Math.max(r0, Math.min(r1, point[i])) : point[i];
	        if (dragging) {
	          max = (min += position) + size;
	        } else {
	          if (center) position = Math.max(r0, Math.min(r1, 2 * center[i] - min));
	          if (position < min) {
	            max = min;
	            min = position;
	          } else {
	            max = position;
	          }
	        }
	        if (extent[0] != min || extent[1] != max) {
	          if (i) yExtentDomain = null; else xExtentDomain = null;
	          extent[0] = min;
	          extent[1] = max;
	          return true;
	        }
	      }
	      function brushend() {
	        brushmove();
	        g.style("pointer-events", "all").selectAll(".resize").style("display", brush.empty() ? "none" : null);
	        d3.select("body").style("cursor", null);
	        w.on("mousemove.brush", null).on("mouseup.brush", null).on("touchmove.brush", null).on("touchend.brush", null).on("keydown.brush", null).on("keyup.brush", null);
	        dragRestore();
	        event_({
	          type: "brushend"
	        });
	      }
	    }
	    brush.x = function(z) {
	      if (!arguments.length) return x;
	      x = z;
	      resizes = d3_svg_brushResizes[!x << 1 | !y];
	      return brush;
	    };
	    brush.y = function(z) {
	      if (!arguments.length) return y;
	      y = z;
	      resizes = d3_svg_brushResizes[!x << 1 | !y];
	      return brush;
	    };
	    brush.clamp = function(z) {
	      if (!arguments.length) return x && y ? [ xClamp, yClamp ] : x ? xClamp : y ? yClamp : null;
	      if (x && y) xClamp = !!z[0], yClamp = !!z[1]; else if (x) xClamp = !!z; else if (y) yClamp = !!z;
	      return brush;
	    };
	    brush.extent = function(z) {
	      var x0, x1, y0, y1, t;
	      if (!arguments.length) {
	        if (x) {
	          if (xExtentDomain) {
	            x0 = xExtentDomain[0], x1 = xExtentDomain[1];
	          } else {
	            x0 = xExtent[0], x1 = xExtent[1];
	            if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
	            if (x1 < x0) t = x0, x0 = x1, x1 = t;
	          }
	        }
	        if (y) {
	          if (yExtentDomain) {
	            y0 = yExtentDomain[0], y1 = yExtentDomain[1];
	          } else {
	            y0 = yExtent[0], y1 = yExtent[1];
	            if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
	            if (y1 < y0) t = y0, y0 = y1, y1 = t;
	          }
	        }
	        return x && y ? [ [ x0, y0 ], [ x1, y1 ] ] : x ? [ x0, x1 ] : y && [ y0, y1 ];
	      }
	      if (x) {
	        x0 = z[0], x1 = z[1];
	        if (y) x0 = x0[0], x1 = x1[0];
	        xExtentDomain = [ x0, x1 ];
	        if (x.invert) x0 = x(x0), x1 = x(x1);
	        if (x1 < x0) t = x0, x0 = x1, x1 = t;
	        if (x0 != xExtent[0] || x1 != xExtent[1]) xExtent = [ x0, x1 ];
	      }
	      if (y) {
	        y0 = z[0], y1 = z[1];
	        if (x) y0 = y0[1], y1 = y1[1];
	        yExtentDomain = [ y0, y1 ];
	        if (y.invert) y0 = y(y0), y1 = y(y1);
	        if (y1 < y0) t = y0, y0 = y1, y1 = t;
	        if (y0 != yExtent[0] || y1 != yExtent[1]) yExtent = [ y0, y1 ];
	      }
	      return brush;
	    };
	    brush.clear = function() {
	      if (!brush.empty()) {
	        xExtent = [ 0, 0 ], yExtent = [ 0, 0 ];
	        xExtentDomain = yExtentDomain = null;
	      }
	      return brush;
	    };
	    brush.empty = function() {
	      return !!x && xExtent[0] == xExtent[1] || !!y && yExtent[0] == yExtent[1];
	    };
	    return d3.rebind(brush, event, "on");
	  };
	  var d3_svg_brushCursor = {
	    n: "ns-resize",
	    e: "ew-resize",
	    s: "ns-resize",
	    w: "ew-resize",
	    nw: "nwse-resize",
	    ne: "nesw-resize",
	    se: "nwse-resize",
	    sw: "nesw-resize"
	  };
	  var d3_svg_brushResizes = [ [ "n", "e", "s", "w", "nw", "ne", "se", "sw" ], [ "e", "w" ], [ "n", "s" ], [] ];
	  var d3_time_format = d3_time.format = d3_locale_enUS.timeFormat;
	  var d3_time_formatUtc = d3_time_format.utc;
	  var d3_time_formatIso = d3_time_formatUtc("%Y-%m-%dT%H:%M:%S.%LZ");
	  d3_time_format.iso = Date.prototype.toISOString && +new Date("2000-01-01T00:00:00.000Z") ? d3_time_formatIsoNative : d3_time_formatIso;
	  function d3_time_formatIsoNative(date) {
	    return date.toISOString();
	  }
	  d3_time_formatIsoNative.parse = function(string) {
	    var date = new Date(string);
	    return isNaN(date) ? null : date;
	  };
	  d3_time_formatIsoNative.toString = d3_time_formatIso.toString;
	  d3_time.second = d3_time_interval(function(date) {
	    return new d3_date(Math.floor(date / 1e3) * 1e3);
	  }, function(date, offset) {
	    date.setTime(date.getTime() + Math.floor(offset) * 1e3);
	  }, function(date) {
	    return date.getSeconds();
	  });
	  d3_time.seconds = d3_time.second.range;
	  d3_time.seconds.utc = d3_time.second.utc.range;
	  d3_time.minute = d3_time_interval(function(date) {
	    return new d3_date(Math.floor(date / 6e4) * 6e4);
	  }, function(date, offset) {
	    date.setTime(date.getTime() + Math.floor(offset) * 6e4);
	  }, function(date) {
	    return date.getMinutes();
	  });
	  d3_time.minutes = d3_time.minute.range;
	  d3_time.minutes.utc = d3_time.minute.utc.range;
	  d3_time.hour = d3_time_interval(function(date) {
	    var timezone = date.getTimezoneOffset() / 60;
	    return new d3_date((Math.floor(date / 36e5 - timezone) + timezone) * 36e5);
	  }, function(date, offset) {
	    date.setTime(date.getTime() + Math.floor(offset) * 36e5);
	  }, function(date) {
	    return date.getHours();
	  });
	  d3_time.hours = d3_time.hour.range;
	  d3_time.hours.utc = d3_time.hour.utc.range;
	  d3_time.month = d3_time_interval(function(date) {
	    date = d3_time.day(date);
	    date.setDate(1);
	    return date;
	  }, function(date, offset) {
	    date.setMonth(date.getMonth() + offset);
	  }, function(date) {
	    return date.getMonth();
	  });
	  d3_time.months = d3_time.month.range;
	  d3_time.months.utc = d3_time.month.utc.range;
	  function d3_time_scale(linear, methods, format) {
	    function scale(x) {
	      return linear(x);
	    }
	    scale.invert = function(x) {
	      return d3_time_scaleDate(linear.invert(x));
	    };
	    scale.domain = function(x) {
	      if (!arguments.length) return linear.domain().map(d3_time_scaleDate);
	      linear.domain(x);
	      return scale;
	    };
	    function tickMethod(extent, count) {
	      var span = extent[1] - extent[0], target = span / count, i = d3.bisect(d3_time_scaleSteps, target);
	      return i == d3_time_scaleSteps.length ? [ methods.year, d3_scale_linearTickRange(extent.map(function(d) {
	        return d / 31536e6;
	      }), count)[2] ] : !i ? [ d3_time_scaleMilliseconds, d3_scale_linearTickRange(extent, count)[2] ] : methods[target / d3_time_scaleSteps[i - 1] < d3_time_scaleSteps[i] / target ? i - 1 : i];
	    }
	    scale.nice = function(interval, skip) {
	      var domain = scale.domain(), extent = d3_scaleExtent(domain), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" && tickMethod(extent, interval);
	      if (method) interval = method[0], skip = method[1];
	      function skipped(date) {
	        return !isNaN(date) && !interval.range(date, d3_time_scaleDate(+date + 1), skip).length;
	      }
	      return scale.domain(d3_scale_nice(domain, skip > 1 ? {
	        floor: function(date) {
	          while (skipped(date = interval.floor(date))) date = d3_time_scaleDate(date - 1);
	          return date;
	        },
	        ceil: function(date) {
	          while (skipped(date = interval.ceil(date))) date = d3_time_scaleDate(+date + 1);
	          return date;
	        }
	      } : interval));
	    };
	    scale.ticks = function(interval, skip) {
	      var extent = d3_scaleExtent(scale.domain()), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" ? tickMethod(extent, interval) : !interval.range && [ {
	        range: interval
	      }, skip ];
	      if (method) interval = method[0], skip = method[1];
	      return interval.range(extent[0], d3_time_scaleDate(+extent[1] + 1), skip < 1 ? 1 : skip);
	    };
	    scale.tickFormat = function() {
	      return format;
	    };
	    scale.copy = function() {
	      return d3_time_scale(linear.copy(), methods, format);
	    };
	    return d3_scale_linearRebind(scale, linear);
	  }
	  function d3_time_scaleDate(t) {
	    return new Date(t);
	  }
	  var d3_time_scaleSteps = [ 1e3, 5e3, 15e3, 3e4, 6e4, 3e5, 9e5, 18e5, 36e5, 108e5, 216e5, 432e5, 864e5, 1728e5, 6048e5, 2592e6, 7776e6, 31536e6 ];
	  var d3_time_scaleLocalMethods = [ [ d3_time.second, 1 ], [ d3_time.second, 5 ], [ d3_time.second, 15 ], [ d3_time.second, 30 ], [ d3_time.minute, 1 ], [ d3_time.minute, 5 ], [ d3_time.minute, 15 ], [ d3_time.minute, 30 ], [ d3_time.hour, 1 ], [ d3_time.hour, 3 ], [ d3_time.hour, 6 ], [ d3_time.hour, 12 ], [ d3_time.day, 1 ], [ d3_time.day, 2 ], [ d3_time.week, 1 ], [ d3_time.month, 1 ], [ d3_time.month, 3 ], [ d3_time.year, 1 ] ];
	  var d3_time_scaleLocalFormat = d3_time_format.multi([ [ ".%L", function(d) {
	    return d.getMilliseconds();
	  } ], [ ":%S", function(d) {
	    return d.getSeconds();
	  } ], [ "%I:%M", function(d) {
	    return d.getMinutes();
	  } ], [ "%I %p", function(d) {
	    return d.getHours();
	  } ], [ "%a %d", function(d) {
	    return d.getDay() && d.getDate() != 1;
	  } ], [ "%b %d", function(d) {
	    return d.getDate() != 1;
	  } ], [ "%B", function(d) {
	    return d.getMonth();
	  } ], [ "%Y", d3_true ] ]);
	  var d3_time_scaleMilliseconds = {
	    range: function(start, stop, step) {
	      return d3.range(Math.ceil(start / step) * step, +stop, step).map(d3_time_scaleDate);
	    },
	    floor: d3_identity,
	    ceil: d3_identity
	  };
	  d3_time_scaleLocalMethods.year = d3_time.year;
	  d3_time.scale = function() {
	    return d3_time_scale(d3.scale.linear(), d3_time_scaleLocalMethods, d3_time_scaleLocalFormat);
	  };
	  var d3_time_scaleUtcMethods = d3_time_scaleLocalMethods.map(function(m) {
	    return [ m[0].utc, m[1] ];
	  });
	  var d3_time_scaleUtcFormat = d3_time_formatUtc.multi([ [ ".%L", function(d) {
	    return d.getUTCMilliseconds();
	  } ], [ ":%S", function(d) {
	    return d.getUTCSeconds();
	  } ], [ "%I:%M", function(d) {
	    return d.getUTCMinutes();
	  } ], [ "%I %p", function(d) {
	    return d.getUTCHours();
	  } ], [ "%a %d", function(d) {
	    return d.getUTCDay() && d.getUTCDate() != 1;
	  } ], [ "%b %d", function(d) {
	    return d.getUTCDate() != 1;
	  } ], [ "%B", function(d) {
	    return d.getUTCMonth();
	  } ], [ "%Y", d3_true ] ]);
	  d3_time_scaleUtcMethods.year = d3_time.year.utc;
	  d3_time.scale.utc = function() {
	    return d3_time_scale(d3.scale.linear(), d3_time_scaleUtcMethods, d3_time_scaleUtcFormat);
	  };
	  d3.text = d3_xhrType(function(request) {
	    return request.responseText;
	  });
	  d3.json = function(url, callback) {
	    return d3_xhr(url, "application/json", d3_json, callback);
	  };
	  function d3_json(request) {
	    return JSON.parse(request.responseText);
	  }
	  d3.html = function(url, callback) {
	    return d3_xhr(url, "text/html", d3_html, callback);
	  };
	  function d3_html(request) {
	    var range = d3_document.createRange();
	    range.selectNode(d3_document.body);
	    return range.createContextualFragment(request.responseText);
	  }
	  d3.xml = d3_xhrType(function(request) {
	    return request.responseXML;
	  });
	  if (true) this.d3 = d3, !(__WEBPACK_AMD_DEFINE_FACTORY__ = (d3), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); else if (typeof module === "object" && module.exports) module.exports = d3; else this.d3 = d3;
	}();

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	(function (global, factory) {
	   true ? factory(exports) :
	  typeof define === 'function' && define.amd ? define(['exports'], factory) :
	  (factory((global.topojson = {})));
	}(this, function (exports) { 'use strict';

	  function noop() {}

	  function absolute(transform) {
	    if (!transform) return noop;
	    var x0,
	        y0,
	        kx = transform.scale[0],
	        ky = transform.scale[1],
	        dx = transform.translate[0],
	        dy = transform.translate[1];
	    return function(point, i) {
	      if (!i) x0 = y0 = 0;
	      point[0] = (x0 += point[0]) * kx + dx;
	      point[1] = (y0 += point[1]) * ky + dy;
	    };
	  }

	  function relative(transform) {
	    if (!transform) return noop;
	    var x0,
	        y0,
	        kx = transform.scale[0],
	        ky = transform.scale[1],
	        dx = transform.translate[0],
	        dy = transform.translate[1];
	    return function(point, i) {
	      if (!i) x0 = y0 = 0;
	      var x1 = (point[0] - dx) / kx | 0,
	          y1 = (point[1] - dy) / ky | 0;
	      point[0] = x1 - x0;
	      point[1] = y1 - y0;
	      x0 = x1;
	      y0 = y1;
	    };
	  }

	  function reverse(array, n) {
	    var t, j = array.length, i = j - n;
	    while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
	  }

	  function bisect(a, x) {
	    var lo = 0, hi = a.length;
	    while (lo < hi) {
	      var mid = lo + hi >>> 1;
	      if (a[mid] < x) lo = mid + 1;
	      else hi = mid;
	    }
	    return lo;
	  }

	  function feature(topology, o) {
	    return o.type === "GeometryCollection" ? {
	      type: "FeatureCollection",
	      features: o.geometries.map(function(o) { return feature$1(topology, o); })
	    } : feature$1(topology, o);
	  }

	  function feature$1(topology, o) {
	    var f = {
	      type: "Feature",
	      id: o.id,
	      properties: o.properties || {},
	      geometry: object(topology, o)
	    };
	    if (o.id == null) delete f.id;
	    return f;
	  }

	  function object(topology, o) {
	    var absolute$$ = absolute(topology.transform),
	        arcs = topology.arcs;

	    function arc(i, points) {
	      if (points.length) points.pop();
	      for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length, p; k < n; ++k) {
	        points.push(p = a[k].slice());
	        absolute$$(p, k);
	      }
	      if (i < 0) reverse(points, n);
	    }

	    function point(p) {
	      p = p.slice();
	      absolute$$(p, 0);
	      return p;
	    }

	    function line(arcs) {
	      var points = [];
	      for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
	      if (points.length < 2) points.push(points[0].slice());
	      return points;
	    }

	    function ring(arcs) {
	      var points = line(arcs);
	      while (points.length < 4) points.push(points[0].slice());
	      return points;
	    }

	    function polygon(arcs) {
	      return arcs.map(ring);
	    }

	    function geometry(o) {
	      var t = o.type;
	      return t === "GeometryCollection" ? {type: t, geometries: o.geometries.map(geometry)}
	          : t in geometryType ? {type: t, coordinates: geometryType[t](o)}
	          : null;
	    }

	    var geometryType = {
	      Point: function(o) { return point(o.coordinates); },
	      MultiPoint: function(o) { return o.coordinates.map(point); },
	      LineString: function(o) { return line(o.arcs); },
	      MultiLineString: function(o) { return o.arcs.map(line); },
	      Polygon: function(o) { return polygon(o.arcs); },
	      MultiPolygon: function(o) { return o.arcs.map(polygon); }
	    };

	    return geometry(o);
	  }

	  function stitchArcs(topology, arcs) {
	    var stitchedArcs = {},
	        fragmentByStart = {},
	        fragmentByEnd = {},
	        fragments = [],
	        emptyIndex = -1;

	    // Stitch empty arcs first, since they may be subsumed by other arcs.
	    arcs.forEach(function(i, j) {
	      var arc = topology.arcs[i < 0 ? ~i : i], t;
	      if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
	        t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
	      }
	    });

	    arcs.forEach(function(i) {
	      var e = ends(i),
	          start = e[0],
	          end = e[1],
	          f, g;

	      if (f = fragmentByEnd[start]) {
	        delete fragmentByEnd[f.end];
	        f.push(i);
	        f.end = end;
	        if (g = fragmentByStart[end]) {
	          delete fragmentByStart[g.start];
	          var fg = g === f ? f : f.concat(g);
	          fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
	        } else {
	          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
	        }
	      } else if (f = fragmentByStart[end]) {
	        delete fragmentByStart[f.start];
	        f.unshift(i);
	        f.start = start;
	        if (g = fragmentByEnd[start]) {
	          delete fragmentByEnd[g.end];
	          var gf = g === f ? f : g.concat(f);
	          fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
	        } else {
	          fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
	        }
	      } else {
	        f = [i];
	        fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
	      }
	    });

	    function ends(i) {
	      var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
	      if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });
	      else p1 = arc[arc.length - 1];
	      return i < 0 ? [p1, p0] : [p0, p1];
	    }

	    function flush(fragmentByEnd, fragmentByStart) {
	      for (var k in fragmentByEnd) {
	        var f = fragmentByEnd[k];
	        delete fragmentByStart[f.start];
	        delete f.start;
	        delete f.end;
	        f.forEach(function(i) { stitchedArcs[i < 0 ? ~i : i] = 1; });
	        fragments.push(f);
	      }
	    }

	    flush(fragmentByEnd, fragmentByStart);
	    flush(fragmentByStart, fragmentByEnd);
	    arcs.forEach(function(i) { if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]); });

	    return fragments;
	  }

	  function mesh(topology) {
	    return object(topology, meshArcs.apply(this, arguments));
	  }

	  function meshArcs(topology, o, filter) {
	    var arcs = [];

	    function arc(i) {
	      var j = i < 0 ? ~i : i;
	      (geomsByArc[j] || (geomsByArc[j] = [])).push({i: i, g: geom});
	    }

	    function line(arcs) {
	      arcs.forEach(arc);
	    }

	    function polygon(arcs) {
	      arcs.forEach(line);
	    }

	    function geometry(o) {
	      if (o.type === "GeometryCollection") o.geometries.forEach(geometry);
	      else if (o.type in geometryType) geom = o, geometryType[o.type](o.arcs);
	    }

	    if (arguments.length > 1) {
	      var geomsByArc = [],
	          geom;

	      var geometryType = {
	        LineString: line,
	        MultiLineString: polygon,
	        Polygon: polygon,
	        MultiPolygon: function(arcs) { arcs.forEach(polygon); }
	      };

	      geometry(o);

	      geomsByArc.forEach(arguments.length < 3
	          ? function(geoms) { arcs.push(geoms[0].i); }
	          : function(geoms) { if (filter(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i); });
	    } else {
	      for (var i = 0, n = topology.arcs.length; i < n; ++i) arcs.push(i);
	    }

	    return {type: "MultiLineString", arcs: stitchArcs(topology, arcs)};
	  }

	  function triangle(triangle) {
	    var a = triangle[0], b = triangle[1], c = triangle[2];
	    return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]));
	  }

	  function ring(ring) {
	    var i = -1,
	        n = ring.length,
	        a,
	        b = ring[n - 1],
	        area = 0;

	    while (++i < n) {
	      a = b;
	      b = ring[i];
	      area += a[0] * b[1] - a[1] * b[0];
	    }

	    return area / 2;
	  }

	  function merge(topology) {
	    return object(topology, mergeArcs.apply(this, arguments));
	  }

	  function mergeArcs(topology, objects) {
	    var polygonsByArc = {},
	        polygons = [],
	        components = [];

	    objects.forEach(function(o) {
	      if (o.type === "Polygon") register(o.arcs);
	      else if (o.type === "MultiPolygon") o.arcs.forEach(register);
	    });

	    function register(polygon) {
	      polygon.forEach(function(ring$$) {
	        ring$$.forEach(function(arc) {
	          (polygonsByArc[arc = arc < 0 ? ~arc : arc] || (polygonsByArc[arc] = [])).push(polygon);
	        });
	      });
	      polygons.push(polygon);
	    }

	    function exterior(ring$$) {
	      return ring(object(topology, {type: "Polygon", arcs: [ring$$]}).coordinates[0]) > 0; // TODO allow spherical?
	    }

	    polygons.forEach(function(polygon) {
	      if (!polygon._) {
	        var component = [],
	            neighbors = [polygon];
	        polygon._ = 1;
	        components.push(component);
	        while (polygon = neighbors.pop()) {
	          component.push(polygon);
	          polygon.forEach(function(ring$$) {
	            ring$$.forEach(function(arc) {
	              polygonsByArc[arc < 0 ? ~arc : arc].forEach(function(polygon) {
	                if (!polygon._) {
	                  polygon._ = 1;
	                  neighbors.push(polygon);
	                }
	              });
	            });
	          });
	        }
	      }
	    });

	    polygons.forEach(function(polygon) {
	      delete polygon._;
	    });

	    return {
	      type: "MultiPolygon",
	      arcs: components.map(function(polygons) {
	        var arcs = [], n;

	        // Extract the exterior (unique) arcs.
	        polygons.forEach(function(polygon) {
	          polygon.forEach(function(ring$$) {
	            ring$$.forEach(function(arc) {
	              if (polygonsByArc[arc < 0 ? ~arc : arc].length < 2) {
	                arcs.push(arc);
	              }
	            });
	          });
	        });

	        // Stitch the arcs into one or more rings.
	        arcs = stitchArcs(topology, arcs);

	        // If more than one ring is returned,
	        // at most one of these rings can be the exterior;
	        // this exterior ring has the same winding order
	        // as any exterior ring in the original polygons.
	        if ((n = arcs.length) > 1) {
	          var sgn = exterior(polygons[0][0]);
	          for (var i = 0, t; i < n; ++i) {
	            if (sgn === exterior(arcs[i])) {
	              t = arcs[0], arcs[0] = arcs[i], arcs[i] = t;
	              break;
	            }
	          }
	        }

	        return arcs;
	      })
	    };
	  }

	  function neighbors(objects) {
	    var indexesByArc = {}, // arc index -> array of object indexes
	        neighbors = objects.map(function() { return []; });

	    function line(arcs, i) {
	      arcs.forEach(function(a) {
	        if (a < 0) a = ~a;
	        var o = indexesByArc[a];
	        if (o) o.push(i);
	        else indexesByArc[a] = [i];
	      });
	    }

	    function polygon(arcs, i) {
	      arcs.forEach(function(arc) { line(arc, i); });
	    }

	    function geometry(o, i) {
	      if (o.type === "GeometryCollection") o.geometries.forEach(function(o) { geometry(o, i); });
	      else if (o.type in geometryType) geometryType[o.type](o.arcs, i);
	    }

	    var geometryType = {
	      LineString: line,
	      MultiLineString: polygon,
	      Polygon: polygon,
	      MultiPolygon: function(arcs, i) { arcs.forEach(function(arc) { polygon(arc, i); }); }
	    };

	    objects.forEach(geometry);

	    for (var i in indexesByArc) {
	      for (var indexes = indexesByArc[i], m = indexes.length, j = 0; j < m; ++j) {
	        for (var k = j + 1; k < m; ++k) {
	          var ij = indexes[j], ik = indexes[k], n;
	          if ((n = neighbors[ij])[i = bisect(n, ik)] !== ik) n.splice(i, 0, ik);
	          if ((n = neighbors[ik])[i = bisect(n, ij)] !== ij) n.splice(i, 0, ij);
	        }
	      }
	    }

	    return neighbors;
	  }

	  function compareArea(a, b) {
	    return a[1][2] - b[1][2];
	  }

	  function minAreaHeap() {
	    var heap = {},
	        array = [],
	        size = 0;

	    heap.push = function(object) {
	      up(array[object._ = size] = object, size++);
	      return size;
	    };

	    heap.pop = function() {
	      if (size <= 0) return;
	      var removed = array[0], object;
	      if (--size > 0) object = array[size], down(array[object._ = 0] = object, 0);
	      return removed;
	    };

	    heap.remove = function(removed) {
	      var i = removed._, object;
	      if (array[i] !== removed) return; // invalid request
	      if (i !== --size) object = array[size], (compareArea(object, removed) < 0 ? up : down)(array[object._ = i] = object, i);
	      return i;
	    };

	    function up(object, i) {
	      while (i > 0) {
	        var j = ((i + 1) >> 1) - 1,
	            parent = array[j];
	        if (compareArea(object, parent) >= 0) break;
	        array[parent._ = i] = parent;
	        array[object._ = i = j] = object;
	      }
	    }

	    function down(object, i) {
	      while (true) {
	        var r = (i + 1) << 1,
	            l = r - 1,
	            j = i,
	            child = array[j];
	        if (l < size && compareArea(array[l], child) < 0) child = array[j = l];
	        if (r < size && compareArea(array[r], child) < 0) child = array[j = r];
	        if (j === i) break;
	        array[child._ = i] = child;
	        array[object._ = i = j] = object;
	      }
	    }

	    return heap;
	  }

	  function presimplify(topology, triangleArea) {
	    var absolute$$ = absolute(topology.transform),
	        relative$$ = relative(topology.transform),
	        heap = minAreaHeap();

	    if (!triangleArea) triangleArea = triangle;

	    topology.arcs.forEach(function(arc) {
	      var triangles = [],
	          maxArea = 0,
	          triangle,
	          i,
	          n,
	          p;

	      // To store each point’s effective area, we create a new array rather than
	      // extending the passed-in point to workaround a Chrome/V8 bug (getting
	      // stuck in smi mode). For midpoints, the initial effective area of
	      // Infinity will be computed in the next step.
	      for (i = 0, n = arc.length; i < n; ++i) {
	        p = arc[i];
	        absolute$$(arc[i] = [p[0], p[1], Infinity], i);
	      }

	      for (i = 1, n = arc.length - 1; i < n; ++i) {
	        triangle = arc.slice(i - 1, i + 2);
	        triangle[1][2] = triangleArea(triangle);
	        triangles.push(triangle);
	        heap.push(triangle);
	      }

	      for (i = 0, n = triangles.length; i < n; ++i) {
	        triangle = triangles[i];
	        triangle.previous = triangles[i - 1];
	        triangle.next = triangles[i + 1];
	      }

	      while (triangle = heap.pop()) {
	        var previous = triangle.previous,
	            next = triangle.next;

	        // If the area of the current point is less than that of the previous point
	        // to be eliminated, use the latter's area instead. This ensures that the
	        // current point cannot be eliminated without eliminating previously-
	        // eliminated points.
	        if (triangle[1][2] < maxArea) triangle[1][2] = maxArea;
	        else maxArea = triangle[1][2];

	        if (previous) {
	          previous.next = next;
	          previous[2] = triangle[2];
	          update(previous);
	        }

	        if (next) {
	          next.previous = previous;
	          next[0] = triangle[0];
	          update(next);
	        }
	      }

	      arc.forEach(relative$$);
	    });

	    function update(triangle) {
	      heap.remove(triangle);
	      triangle[1][2] = triangleArea(triangle);
	      heap.push(triangle);
	    }

	    return topology;
	  }

	  var version = "1.6.24";

	  exports.version = version;
	  exports.mesh = mesh;
	  exports.meshArcs = meshArcs;
	  exports.merge = merge;
	  exports.mergeArcs = mergeArcs;
	  exports.feature = feature;
	  exports.neighbors = neighbors;
	  exports.presimplify = presimplify;

	}));

/***/ },
/* 6 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2011, Sun Ning.
	 *
	 * Permission is hereby granted, free of charge, to any person
	 * obtaining a copy of this software and associated documentation
	 * files (the "Software"), to deal in the Software without
	 * restriction, including without limitation the rights to use, copy,
	 * modify, merge, publish, distribute, sublicense, and/or sell copies
	 * of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be
	 * included in all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
	 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	 * SOFTWARE.
	 *
	 */

	var BASE32_CODES = "0123456789bcdefghjkmnpqrstuvwxyz";
	var BASE32_CODES_DICT = {};
	for (var i = 0; i < BASE32_CODES.length; i++) {
	  BASE32_CODES_DICT[BASE32_CODES.charAt(i)] = i;
	}

	var ENCODE_AUTO = 'auto';
	/**
	 * Significant Figure Hash Length
	 *
	 * This is a quick and dirty lookup to figure out how long our hash
	 * should be in order to guarantee a certain amount of trailing
	 * significant figures. This was calculated by determining the error:
	 * 45/2^(n-1) where n is the number of bits for a latitude or
	 * longitude. Key is # of desired sig figs, value is minimum length of
	 * the geohash.
	 * @type Array
	 */
	//     Desired sig figs:  0  1  2  3  4   5   6   7   8   9  10
	var SIGFIG_HASH_LENGTH = [0, 5, 7, 8, 11, 12, 13, 15, 16, 17, 18];
	/**
	 * Encode
	 *
	 * Create a Geohash out of a latitude and longitude that is
	 * `numberOfChars` long.
	 *
	 * @param {Number|String} latitude
	 * @param {Number|String} longitude
	 * @param {Number} numberOfChars
	 * @returns {String}
	 */
	var encode = function (latitude, longitude, numberOfChars) {
	  if (numberOfChars === ENCODE_AUTO) {
	    if (typeof(latitude) === 'number' || typeof(longitude) === 'number') {
	      throw new Error('string notation required for auto precision.');
	    }
	    var decSigFigsLat = latitude.split('.')[1].length;
	    var decSigFigsLong = longitude.split('.')[1].length;
	    var numberOfSigFigs = Math.max(decSigFigsLat, decSigFigsLong);
	    numberOfChars = SIGFIG_HASH_LENGTH[numberOfSigFigs];
	  } else if (numberOfChars === undefined) {
	    numberOfChars = 9;
	  }

	  var chars = [],
	  bits = 0,
	  bitsTotal = 0,
	  hash_value = 0,
	  maxLat = 90,
	  minLat = -90,
	  maxLon = 180,
	  minLon = -180,
	  mid;
	  while (chars.length < numberOfChars) {
	    if (bitsTotal % 2 === 0) {
	      mid = (maxLon + minLon) / 2;
	      if (longitude > mid) {
	        hash_value = (hash_value << 1) + 1;
	        minLon = mid;
	      } else {
	        hash_value = (hash_value << 1) + 0;
	        maxLon = mid;
	      }
	    } else {
	      mid = (maxLat + minLat) / 2;
	      if (latitude > mid) {
	        hash_value = (hash_value << 1) + 1;
	        minLat = mid;
	      } else {
	        hash_value = (hash_value << 1) + 0;
	        maxLat = mid;
	      }
	    }

	    bits++;
	    bitsTotal++;
	    if (bits === 5) {
	      var code = BASE32_CODES[hash_value];
	      chars.push(code);
	      bits = 0;
	      hash_value = 0;
	    }
	  }
	  return chars.join('');
	};

	/**
	 * Encode Integer
	 *
	 * Create a Geohash out of a latitude and longitude that is of 'bitDepth'.
	 *
	 * @param {Number} latitude
	 * @param {Number} longitude
	 * @param {Number} bitDepth
	 * @returns {Number}
	 */
	var encode_int = function (latitude, longitude, bitDepth) {

	  bitDepth = bitDepth || 52;

	  var bitsTotal = 0,
	  maxLat = 90,
	  minLat = -90,
	  maxLon = 180,
	  minLon = -180,
	  mid,
	  combinedBits = 0;

	  while (bitsTotal < bitDepth) {
	    combinedBits *= 2;
	    if (bitsTotal % 2 === 0) {
	      mid = (maxLon + minLon) / 2;
	      if (longitude > mid) {
	        combinedBits += 1;
	        minLon = mid;
	      } else {
	        maxLon = mid;
	      }
	    } else {
	      mid = (maxLat + minLat) / 2;
	      if (latitude > mid) {
	        combinedBits += 1;
	        minLat = mid;
	      } else {
	        maxLat = mid;
	      }
	    }
	    bitsTotal++;
	  }
	  return combinedBits;
	};

	/**
	 * Decode Bounding Box
	 *
	 * Decode hashString into a bound box matches it. Data returned in a four-element array: [minlat, minlon, maxlat, maxlon]
	 * @param {String} hash_string
	 * @returns {Array}
	 */
	var decode_bbox = function (hash_string) {
	  var isLon = true,
	  maxLat = 90,
	  minLat = -90,
	  maxLon = 180,
	  minLon = -180,
	  mid;

	  var hashValue = 0;
	  for (var i = 0, l = hash_string.length; i < l; i++) {
	    var code = hash_string[i].toLowerCase();
	    hashValue = BASE32_CODES_DICT[code];

	    for (var bits = 4; bits >= 0; bits--) {
	      var bit = (hashValue >> bits) & 1;
	      if (isLon) {
	        mid = (maxLon + minLon) / 2;
	        if (bit === 1) {
	          minLon = mid;
	        } else {
	          maxLon = mid;
	        }
	      } else {
	        mid = (maxLat + minLat) / 2;
	        if (bit === 1) {
	          minLat = mid;
	        } else {
	          maxLat = mid;
	        }
	      }
	      isLon = !isLon;
	    }
	  }
	  return [minLat, minLon, maxLat, maxLon];
	};

	/**
	 * Decode Bounding Box Integer
	 *
	 * Decode hash number into a bound box matches it. Data returned in a four-element array: [minlat, minlon, maxlat, maxlon]
	 * @param {Number} hashInt
	 * @param {Number} bitDepth
	 * @returns {Array}
	 */
	var decode_bbox_int = function (hashInt, bitDepth) {

	  bitDepth = bitDepth || 52;

	  var maxLat = 90,
	  minLat = -90,
	  maxLon = 180,
	  minLon = -180;

	  var latBit = 0, lonBit = 0;
	  var step = bitDepth / 2;

	  for (var i = 0; i < step; i++) {

	    lonBit = get_bit(hashInt, ((step - i) * 2) - 1);
	    latBit = get_bit(hashInt, ((step - i) * 2) - 2);

	    if (latBit === 0) {
	      maxLat = (maxLat + minLat) / 2;
	    }
	    else {
	      minLat = (maxLat + minLat) / 2;
	    }

	    if (lonBit === 0) {
	      maxLon = (maxLon + minLon) / 2;
	    }
	    else {
	      minLon = (maxLon + minLon) / 2;
	    }
	  }
	  return [minLat, minLon, maxLat, maxLon];
	};

	function get_bit(bits, position) {
	  return (bits / Math.pow(2, position)) & 0x01;
	}

	/**
	 * Decode
	 *
	 * Decode a hash string into pair of latitude and longitude. A javascript object is returned with keys `latitude`,
	 * `longitude` and `error`.
	 * @param {String} hashString
	 * @returns {Object}
	 */
	var decode = function (hashString) {
	  var bbox = decode_bbox(hashString);
	  var lat = (bbox[0] + bbox[2]) / 2;
	  var lon = (bbox[1] + bbox[3]) / 2;
	  var latErr = bbox[2] - lat;
	  var lonErr = bbox[3] - lon;
	  return {latitude: lat, longitude: lon,
	          error: {latitude: latErr, longitude: lonErr}};
	};

	/**
	 * Decode Integer
	 *
	 * Decode a hash number into pair of latitude and longitude. A javascript object is returned with keys `latitude`,
	 * `longitude` and `error`.
	 * @param {Number} hash_int
	 * @param {Number} bitDepth
	 * @returns {Object}
	 */
	var decode_int = function (hash_int, bitDepth) {
	  var bbox = decode_bbox_int(hash_int, bitDepth);
	  var lat = (bbox[0] + bbox[2]) / 2;
	  var lon = (bbox[1] + bbox[3]) / 2;
	  var latErr = bbox[2] - lat;
	  var lonErr = bbox[3] - lon;
	  return {latitude: lat, longitude: lon,
	          error: {latitude: latErr, longitude: lonErr}};
	};

	/**
	 * Neighbor
	 *
	 * Find neighbor of a geohash string in certain direction. Direction is a two-element array, i.e. [1,0] means north, [-1,-1] means southwest.
	 * direction [lat, lon], i.e.
	 * [1,0] - north
	 * [1,1] - northeast
	 * ...
	 * @param {String} hashString
	 * @param {Array} Direction as a 2D normalized vector.
	 * @returns {String}
	 */
	var neighbor = function (hashString, direction) {
	  var lonLat = decode(hashString);
	  var neighborLat = lonLat.latitude
	    + direction[0] * lonLat.error.latitude * 2;
	  var neighborLon = lonLat.longitude
	    + direction[1] * lonLat.error.longitude * 2;
	  return encode(neighborLat, neighborLon, hashString.length);
	};

	/**
	 * Neighbor Integer
	 *
	 * Find neighbor of a geohash integer in certain direction. Direction is a two-element array, i.e. [1,0] means north, [-1,-1] means southwest.
	 * direction [lat, lon], i.e.
	 * [1,0] - north
	 * [1,1] - northeast
	 * ...
	 * @param {String} hash_string
	 * @returns {Array}
	*/
	var neighbor_int = function(hash_int, direction, bitDepth) {
	    bitDepth = bitDepth || 52;
	    var lonlat = decode_int(hash_int, bitDepth);
	    var neighbor_lat = lonlat.latitude + direction[0] * lonlat.error.latitude * 2;
	    var neighbor_lon = lonlat.longitude + direction[1] * lonlat.error.longitude * 2;
	    return encode_int(neighbor_lat, neighbor_lon, bitDepth);
	};

	/**
	 * Neighbors
	 *
	 * Returns all neighbors' hashstrings clockwise from north around to northwest
	 * 7 0 1
	 * 6 x 2
	 * 5 4 3
	 * @param {String} hash_string
	 * @returns {encoded neighborHashList|Array}
	 */
	var neighbors = function(hash_string){

	    var hashstringLength = hash_string.length;

	    var lonlat = decode(hash_string);
	    var lat = lonlat.latitude;
	    var lon = lonlat.longitude;
	    var latErr = lonlat.error.latitude * 2;
	    var lonErr = lonlat.error.longitude * 2;

	    var neighbor_lat,
	        neighbor_lon;

	    var neighborHashList = [
	                            encodeNeighbor(1,0),
	                            encodeNeighbor(1,1),
	                            encodeNeighbor(0,1),
	                            encodeNeighbor(-1,1),
	                            encodeNeighbor(-1,0),
	                            encodeNeighbor(-1,-1),
	                            encodeNeighbor(0,-1),
	                            encodeNeighbor(1,-1)
	                            ];

	    function encodeNeighbor(neighborLatDir, neighborLonDir){
	        neighbor_lat = lat + neighborLatDir * latErr;
	        neighbor_lon = lon + neighborLonDir * lonErr;
	        return encode(neighbor_lat, neighbor_lon, hashstringLength);
	    }

	    return neighborHashList;
	};

	/**
	 * Neighbors Integer
	 *
	 * Returns all neighbors' hash integers clockwise from north around to northwest
	 * 7 0 1
	 * 6 x 2
	 * 5 4 3
	 * @param {Number} hash_int
	 * @param {Number} bitDepth
	 * @returns {encode_int'd neighborHashIntList|Array}
	 */
	var neighbors_int = function(hash_int, bitDepth){

	    bitDepth = bitDepth || 52;

	    var lonlat = decode_int(hash_int, bitDepth);
	    var lat = lonlat.latitude;
	    var lon = lonlat.longitude;
	    var latErr = lonlat.error.latitude * 2;
	    var lonErr = lonlat.error.longitude * 2;

	    var neighbor_lat,
	        neighbor_lon;

	    var neighborHashIntList = [
	                            encodeNeighbor_int(1,0),
	                            encodeNeighbor_int(1,1),
	                            encodeNeighbor_int(0,1),
	                            encodeNeighbor_int(-1,1),
	                            encodeNeighbor_int(-1,0),
	                            encodeNeighbor_int(-1,-1),
	                            encodeNeighbor_int(0,-1),
	                            encodeNeighbor_int(1,-1)
	                            ];

	    function encodeNeighbor_int(neighborLatDir, neighborLonDir){
	        neighbor_lat = lat + neighborLatDir * latErr;
	        neighbor_lon = lon + neighborLonDir * lonErr;
	        return encode_int(neighbor_lat, neighbor_lon, bitDepth);
	    }

	    return neighborHashIntList;
	};


	/**
	 * Bounding Boxes
	 *
	 * Return all the hashString between minLat, minLon, maxLat, maxLon in numberOfChars
	 * @param {Number} minLat
	 * @param {Number} minLon
	 * @param {Number} maxLat
	 * @param {Number} maxLon
	 * @param {Number} numberOfChars
	 * @returns {bboxes.hashList|Array}
	 */
	var bboxes = function (minLat, minLon, maxLat, maxLon, numberOfChars) {
	  numberOfChars = numberOfChars || 9;

	  var hashSouthWest = encode(minLat, minLon, numberOfChars);
	  var hashNorthEast = encode(maxLat, maxLon, numberOfChars);

	  var latLon = decode(hashSouthWest);

	  var perLat = latLon.error.latitude * 2;
	  var perLon = latLon.error.longitude * 2;

	  var boxSouthWest = decode_bbox(hashSouthWest);
	  var boxNorthEast = decode_bbox(hashNorthEast);

	  var latStep = Math.round((boxNorthEast[0] - boxSouthWest[0]) / perLat);
	  var lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1]) / perLon);

	  var hashList = [];

	  for (var lat = 0; lat <= latStep; lat++) {
	    for (var lon = 0; lon <= lonStep; lon++) {
	      hashList.push(neighbor(hashSouthWest, [lat, lon]));
	    }
	  }

	  return hashList;
	};

	/**
	 * Bounding Boxes Integer
	 *
	 * Return all the hash integers between minLat, minLon, maxLat, maxLon in bitDepth
	 * @param {Number} minLat
	 * @param {Number} minLon
	 * @param {Number} maxLat
	 * @param {Number} maxLon
	 * @param {Number} bitDepth
	 * @returns {bboxes_int.hashList|Array}
	 */
	var bboxes_int = function(minLat, minLon, maxLat, maxLon, bitDepth){
	    bitDepth = bitDepth || 52;

	    var hashSouthWest = encode_int(minLat, minLon, bitDepth);
	    var hashNorthEast = encode_int(maxLat, maxLon, bitDepth);

	    var latlon = decode_int(hashSouthWest, bitDepth);

	    var perLat = latlon.error.latitude * 2;
	    var perLon = latlon.error.longitude * 2;

	    var boxSouthWest = decode_bbox_int(hashSouthWest, bitDepth);
	    var boxNorthEast = decode_bbox_int(hashNorthEast, bitDepth);

	    var latStep = Math.round((boxNorthEast[0] - boxSouthWest[0])/perLat);
	    var lonStep = Math.round((boxNorthEast[1] - boxSouthWest[1])/perLon);

	    var hashList = [];

	    for(var lat = 0; lat <= latStep; lat++){
	        for(var lon = 0; lon <= lonStep; lon++){
	            hashList.push(neighbor_int(hashSouthWest,[lat, lon], bitDepth));
	        }
	    }

	    return hashList;
	};

	var geohash = {
	  'ENCODE_AUTO': ENCODE_AUTO,
	  'encode': encode,
	  'encode_uint64': encode_int, // keeping for backwards compatibility, will deprecate
	  'encode_int': encode_int,
	  'decode': decode,
	  'decode_int': decode_int,
	  'decode_uint64': decode_int, // keeping for backwards compatibility, will deprecate
	  'decode_bbox': decode_bbox,
	  'decode_bbox_uint64': decode_bbox_int, // keeping for backwards compatibility, will deprecate
	  'decode_bbox_int': decode_bbox_int,
	  'neighbor': neighbor,
	  'neighbor_int': neighbor_int,
	  'neighbors': neighbors,
	  'neighbors_int': neighbors_int,
	  'bboxes': bboxes,
	  'bboxes_int': bboxes_int
	};

	module.exports = geohash;


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = {
		"type": "Topology",
		"objects": {
			"countries": {
				"type": "GeometryCollection",
				"geometries": [
					{
						"type": "Polygon",
						"properties": {
							"name": "Afghanistan"
						},
						"id": "AFG",
						"arcs": [
							[
								0,
								1,
								2,
								3,
								4,
								5
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Angola"
						},
						"id": "AGO",
						"arcs": [
							[
								[
									6,
									7,
									8,
									9
								]
							],
							[
								[
									10,
									11,
									12
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Albania"
						},
						"id": "ALB",
						"arcs": [
							[
								13,
								14,
								15,
								16,
								17
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "United Arab Emirates"
						},
						"id": "ARE",
						"arcs": [
							[
								18,
								19,
								20,
								21,
								22
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Argentina"
						},
						"id": "ARG",
						"arcs": [
							[
								[
									23,
									24
								]
							],
							[
								[
									25,
									26,
									27,
									28,
									29,
									30
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Armenia"
						},
						"id": "ARM",
						"arcs": [
							[
								31,
								32,
								33,
								34,
								35
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Antarctica"
						},
						"id": "ATA",
						"arcs": [
							[
								[
									36
								]
							],
							[
								[
									37
								]
							],
							[
								[
									38
								]
							],
							[
								[
									39
								]
							],
							[
								[
									40
								]
							],
							[
								[
									41
								]
							],
							[
								[
									42
								]
							],
							[
								[
									43
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Fr. S. Antarctic Lands"
						},
						"id": "ATF",
						"arcs": [
							[
								44
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Australia"
						},
						"id": "AUS",
						"arcs": [
							[
								[
									45
								]
							],
							[
								[
									46
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Austria"
						},
						"id": "AUT",
						"arcs": [
							[
								47,
								48,
								49,
								50,
								51,
								52,
								53
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Azerbaijan"
						},
						"id": "AZE",
						"arcs": [
							[
								[
									54,
									-35
								]
							],
							[
								[
									55,
									56,
									-33,
									57,
									58
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Burundi"
						},
						"id": "BDI",
						"arcs": [
							[
								59,
								60,
								61,
								62
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Belgium"
						},
						"id": "BEL",
						"arcs": [
							[
								63,
								64,
								65,
								66,
								67
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Benin"
						},
						"id": "BEN",
						"arcs": [
							[
								68,
								69,
								70,
								71,
								72
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Burkina Faso"
						},
						"id": "BFA",
						"arcs": [
							[
								73,
								74,
								75,
								-71,
								76,
								77
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Bangladesh"
						},
						"id": "BGD",
						"arcs": [
							[
								78,
								79,
								80
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Bulgaria"
						},
						"id": "BGR",
						"arcs": [
							[
								81,
								82,
								83,
								84,
								85,
								86
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Bahamas"
						},
						"id": "BHS",
						"arcs": [
							[
								[
									87
								]
							],
							[
								[
									88
								]
							],
							[
								[
									89
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Bosnia and Herz."
						},
						"id": "BIH",
						"arcs": [
							[
								90,
								91,
								92
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Belarus"
						},
						"id": "BLR",
						"arcs": [
							[
								93,
								94,
								95,
								96,
								97
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Belize"
						},
						"id": "BLZ",
						"arcs": [
							[
								98,
								99,
								100
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Bolivia"
						},
						"id": "BOL",
						"arcs": [
							[
								101,
								102,
								103,
								104,
								-31
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Brazil"
						},
						"id": "BRA",
						"arcs": [
							[
								-27,
								105,
								-104,
								106,
								107,
								108,
								109,
								110,
								111,
								112,
								113
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Brunei"
						},
						"id": "BRN",
						"arcs": [
							[
								114,
								115
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Bhutan"
						},
						"id": "BTN",
						"arcs": [
							[
								116,
								117
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Botswana"
						},
						"id": "BWA",
						"arcs": [
							[
								118,
								119,
								120,
								121
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Central African Rep."
						},
						"id": "CAF",
						"arcs": [
							[
								122,
								123,
								124,
								125,
								126,
								127,
								128
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Canada"
						},
						"id": "CAN",
						"arcs": [
							[
								[
									129
								]
							],
							[
								[
									130
								]
							],
							[
								[
									131
								]
							],
							[
								[
									132
								]
							],
							[
								[
									133
								]
							],
							[
								[
									134
								]
							],
							[
								[
									135
								]
							],
							[
								[
									136
								]
							],
							[
								[
									137
								]
							],
							[
								[
									138
								]
							],
							[
								[
									139,
									140,
									141,
									142
								]
							],
							[
								[
									143
								]
							],
							[
								[
									144
								]
							],
							[
								[
									145
								]
							],
							[
								[
									146
								]
							],
							[
								[
									147
								]
							],
							[
								[
									148
								]
							],
							[
								[
									149
								]
							],
							[
								[
									150
								]
							],
							[
								[
									151
								]
							],
							[
								[
									152
								]
							],
							[
								[
									153
								]
							],
							[
								[
									154
								]
							],
							[
								[
									155
								]
							],
							[
								[
									156
								]
							],
							[
								[
									157
								]
							],
							[
								[
									158
								]
							],
							[
								[
									159
								]
							],
							[
								[
									160
								]
							],
							[
								[
									161
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Switzerland"
						},
						"id": "CHE",
						"arcs": [
							[
								-51,
								162,
								163,
								164
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Chile"
						},
						"id": "CHL",
						"arcs": [
							[
								[
									-24,
									165
								]
							],
							[
								[
									-30,
									166,
									167,
									-102
								]
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "China"
						},
						"id": "CHN",
						"arcs": [
							[
								[
									168
								]
							],
							[
								[
									169,
									170,
									171,
									172,
									173,
									174,
									175,
									176,
									177,
									-118,
									178,
									179,
									180,
									181,
									-4,
									182,
									183,
									184,
									185,
									186,
									187,
									188,
									189
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Côte d'Ivoire"
						},
						"id": "CIV",
						"arcs": [
							[
								190,
								191,
								192,
								193,
								-74,
								194
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Cameroon"
						},
						"id": "CMR",
						"arcs": [
							[
								195,
								196,
								197,
								198,
								199,
								200,
								201,
								-129,
								202
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Dem. Rep. Congo"
						},
						"id": "COD",
						"arcs": [
							[
								203,
								204,
								-60,
								205,
								206,
								207,
								-10,
								208,
								-13,
								209,
								-127,
								210
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Congo"
						},
						"id": "COG",
						"arcs": [
							[
								-12,
								211,
								212,
								-203,
								-128,
								-210
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Colombia"
						},
						"id": "COL",
						"arcs": [
							[
								213,
								214,
								215,
								216,
								217,
								-108,
								218
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Costa Rica"
						},
						"id": "CRI",
						"arcs": [
							[
								219,
								220,
								221,
								222
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Cuba"
						},
						"id": "CUB",
						"arcs": [
							[
								223
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "N. Cyprus"
						},
						"id": "CYN",
						"arcs": [
							[
								224,
								225
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Cyprus"
						},
						"id": "CYP",
						"arcs": [
							[
								226,
								-226
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Czech Rep."
						},
						"id": "CZE",
						"arcs": [
							[
								-53,
								227,
								228,
								229
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Germany"
						},
						"id": "DEU",
						"arcs": [
							[
								230,
								231,
								-228,
								-52,
								-165,
								232,
								233,
								-65,
								234,
								235,
								236
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Djibouti"
						},
						"id": "DJI",
						"arcs": [
							[
								237,
								238,
								239,
								240
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Denmark"
						},
						"id": "DNK",
						"arcs": [
							[
								[
									241
								]
							],
							[
								[
									-237,
									242
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Dominican Rep."
						},
						"id": "DOM",
						"arcs": [
							[
								243,
								244
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Algeria"
						},
						"id": "DZA",
						"arcs": [
							[
								245,
								246,
								247,
								248,
								249,
								250,
								251,
								252
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Ecuador"
						},
						"id": "ECU",
						"arcs": [
							[
								253,
								-214,
								254
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Egypt"
						},
						"id": "EGY",
						"arcs": [
							[
								255,
								256,
								257,
								258,
								259
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Eritrea"
						},
						"id": "ERI",
						"arcs": [
							[
								260,
								261,
								262,
								263,
								264,
								-241
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Spain"
						},
						"id": "ESP",
						"arcs": [
							[
								265,
								266,
								267,
								268
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Estonia"
						},
						"id": "EST",
						"arcs": [
							[
								269,
								270,
								271,
								272,
								273
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Ethiopia"
						},
						"id": "ETH",
						"arcs": [
							[
								274,
								-261,
								-240,
								275,
								276,
								277,
								278,
								279,
								280,
								281,
								282,
								-263
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Finland"
						},
						"id": "FIN",
						"arcs": [
							[
								283,
								284,
								285,
								286
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Fiji"
						},
						"id": "FJI",
						"arcs": [
							[
								[
									287
								]
							],
							[
								[
									288
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Falkland Is."
						},
						"id": "FLK",
						"arcs": [
							[
								289
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "France"
						},
						"id": "FRA",
						"arcs": [
							[
								[
									290,
									291,
									292,
									-112
								]
							],
							[
								[
									293
								]
							],
							[
								[
									294,
									-233,
									-164,
									295,
									296,
									-267,
									297,
									-67
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Gabon"
						},
						"id": "GAB",
						"arcs": [
							[
								298,
								299,
								-196,
								-213
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "United Kingdom"
						},
						"id": "GBR",
						"arcs": [
							[
								[
									300,
									301
								]
							],
							[
								[
									302
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Georgia"
						},
						"id": "GEO",
						"arcs": [
							[
								303,
								304,
								-58,
								-32,
								305
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Ghana"
						},
						"id": "GHA",
						"arcs": [
							[
								306,
								-195,
								-78,
								307
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Guinea"
						},
						"id": "GIN",
						"arcs": [
							[
								308,
								309,
								310,
								311,
								312,
								313,
								-193
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Gambia"
						},
						"id": "GMB",
						"arcs": [
							[
								314,
								315
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Guinea-Bissau"
						},
						"id": "GNB",
						"arcs": [
							[
								316,
								317,
								-312
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Eq. Guinea"
						},
						"id": "GNQ",
						"arcs": [
							[
								318,
								-197,
								-300
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Greece"
						},
						"id": "GRC",
						"arcs": [
							[
								[
									319
								]
							],
							[
								[
									320,
									-15,
									321,
									-85,
									322
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Greenland"
						},
						"id": "GRL",
						"arcs": [
							[
								323
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Guatemala"
						},
						"id": "GTM",
						"arcs": [
							[
								324,
								325,
								-101,
								326,
								327,
								328
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Guyana"
						},
						"id": "GUY",
						"arcs": [
							[
								329,
								330,
								-110,
								331
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Honduras"
						},
						"id": "HND",
						"arcs": [
							[
								332,
								333,
								-328,
								334,
								335
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Croatia"
						},
						"id": "HRV",
						"arcs": [
							[
								336,
								-93,
								337,
								338,
								339,
								340
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Haiti"
						},
						"id": "HTI",
						"arcs": [
							[
								-245,
								341
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Hungary"
						},
						"id": "HUN",
						"arcs": [
							[
								-48,
								342,
								343,
								344,
								345,
								-341,
								346
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Indonesia"
						},
						"id": "IDN",
						"arcs": [
							[
								[
									347
								]
							],
							[
								[
									348,
									349
								]
							],
							[
								[
									350
								]
							],
							[
								[
									351
								]
							],
							[
								[
									352
								]
							],
							[
								[
									353
								]
							],
							[
								[
									354
								]
							],
							[
								[
									355
								]
							],
							[
								[
									356,
									357
								]
							],
							[
								[
									358
								]
							],
							[
								[
									359
								]
							],
							[
								[
									360,
									361
								]
							],
							[
								[
									362
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "India"
						},
						"id": "IND",
						"arcs": [
							[
								-181,
								363,
								-179,
								-117,
								-178,
								364,
								-81,
								365,
								366
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Ireland"
						},
						"id": "IRL",
						"arcs": [
							[
								367,
								-301
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Iran"
						},
						"id": "IRN",
						"arcs": [
							[
								368,
								-6,
								369,
								370,
								371,
								372,
								-55,
								-34,
								-57,
								373
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Iraq"
						},
						"id": "IRQ",
						"arcs": [
							[
								374,
								375,
								376,
								377,
								378,
								379,
								-372
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Iceland"
						},
						"id": "ISL",
						"arcs": [
							[
								380
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Israel"
						},
						"id": "ISR",
						"arcs": [
							[
								381,
								382,
								383,
								-260,
								384,
								385,
								386
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Italy"
						},
						"id": "ITA",
						"arcs": [
							[
								[
									387
								]
							],
							[
								[
									388
								]
							],
							[
								[
									389,
									390,
									-296,
									-163,
									-50
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Jamaica"
						},
						"id": "JAM",
						"arcs": [
							[
								391
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Jordan"
						},
						"id": "JOR",
						"arcs": [
							[
								-382,
								392,
								-378,
								393,
								394,
								-384,
								395
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Japan"
						},
						"id": "JPN",
						"arcs": [
							[
								[
									396
								]
							],
							[
								[
									397
								]
							],
							[
								[
									398
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Kazakhstan"
						},
						"id": "KAZ",
						"arcs": [
							[
								399,
								400,
								401,
								402,
								-185,
								403
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Kenya"
						},
						"id": "KEN",
						"arcs": [
							[
								404,
								405,
								406,
								407,
								-280,
								408
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Kyrgyzstan"
						},
						"id": "KGZ",
						"arcs": [
							[
								-404,
								-184,
								409,
								410
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Cambodia"
						},
						"id": "KHM",
						"arcs": [
							[
								411,
								412,
								413,
								414
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Korea"
						},
						"id": "KOR",
						"arcs": [
							[
								415,
								416
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Kosovo"
						},
						"id": "KOS",
						"arcs": [
							[
								-18,
								417,
								418,
								419
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Kuwait"
						},
						"id": "KWT",
						"arcs": [
							[
								420,
								421,
								-376
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Lao PDR"
						},
						"id": "LAO",
						"arcs": [
							[
								422,
								423,
								-176,
								424,
								-413
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Lebanon"
						},
						"id": "LBN",
						"arcs": [
							[
								-386,
								425,
								426
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Liberia"
						},
						"id": "LBR",
						"arcs": [
							[
								427,
								428,
								-309,
								-192
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Libya"
						},
						"id": "LBY",
						"arcs": [
							[
								429,
								-253,
								430,
								431,
								-258,
								432,
								433
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Sri Lanka"
						},
						"id": "LKA",
						"arcs": [
							[
								434
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Lesotho"
						},
						"id": "LSO",
						"arcs": [
							[
								435
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Lithuania"
						},
						"id": "LTU",
						"arcs": [
							[
								436,
								437,
								438,
								-94,
								439
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Luxembourg"
						},
						"id": "LUX",
						"arcs": [
							[
								-234,
								-295,
								-66
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Latvia"
						},
						"id": "LVA",
						"arcs": [
							[
								440,
								-274,
								441,
								-95,
								-439
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Morocco"
						},
						"id": "MAR",
						"arcs": [
							[
								-250,
								442,
								443,
								444
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Moldova"
						},
						"id": "MDA",
						"arcs": [
							[
								445,
								446
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Madagascar"
						},
						"id": "MDG",
						"arcs": [
							[
								447
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Mexico"
						},
						"id": "MEX",
						"arcs": [
							[
								448,
								-99,
								-326,
								449,
								450
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Macedonia"
						},
						"id": "MKD",
						"arcs": [
							[
								-420,
								451,
								-86,
								-322,
								-14
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Mali"
						},
						"id": "MLI",
						"arcs": [
							[
								452,
								-247,
								453,
								-75,
								-194,
								-314,
								454
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Myanmar"
						},
						"id": "MMR",
						"arcs": [
							[
								455,
								-79,
								-365,
								-177,
								-424,
								456
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Montenegro"
						},
						"id": "MNE",
						"arcs": [
							[
								457,
								-338,
								-92,
								458,
								-418,
								-17
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Mongolia"
						},
						"id": "MNG",
						"arcs": [
							[
								459,
								-187
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Mozambique"
						},
						"id": "MOZ",
						"arcs": [
							[
								460,
								461,
								462,
								463,
								464,
								465,
								466,
								467,
								468,
								469
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Mauritania"
						},
						"id": "MRT",
						"arcs": [
							[
								470,
								471,
								472,
								-248,
								-453
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Malawi"
						},
						"id": "MWI",
						"arcs": [
							[
								-470,
								473,
								474
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Malaysia"
						},
						"id": "MYS",
						"arcs": [
							[
								[
									475,
									476
								]
							],
							[
								[
									-361,
									477,
									-116,
									478
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Namibia"
						},
						"id": "NAM",
						"arcs": [
							[
								479,
								-8,
								480,
								-120,
								481
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "New Caledonia"
						},
						"id": "NCL",
						"arcs": [
							[
								482
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Niger"
						},
						"id": "NER",
						"arcs": [
							[
								-76,
								-454,
								-246,
								-430,
								483,
								-200,
								484,
								-72
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Nigeria"
						},
						"id": "NGA",
						"arcs": [
							[
								485,
								-73,
								-485,
								-199
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Nicaragua"
						},
						"id": "NIC",
						"arcs": [
							[
								486,
								-336,
								487,
								-221
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Netherlands"
						},
						"id": "NLD",
						"arcs": [
							[
								-235,
								-64,
								488
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Norway"
						},
						"id": "NOR",
						"arcs": [
							[
								[
									489,
									-287,
									490,
									491
								]
							],
							[
								[
									492
								]
							],
							[
								[
									493
								]
							],
							[
								[
									494
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Nepal"
						},
						"id": "NPL",
						"arcs": [
							[
								-364,
								-180
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "New Zealand"
						},
						"id": "NZL",
						"arcs": [
							[
								[
									495
								]
							],
							[
								[
									496
								]
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Oman"
						},
						"id": "OMN",
						"arcs": [
							[
								[
									497,
									498,
									-22,
									499
								]
							],
							[
								[
									-20,
									500
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Pakistan"
						},
						"id": "PAK",
						"arcs": [
							[
								-182,
								-367,
								501,
								-370,
								-5
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Panama"
						},
						"id": "PAN",
						"arcs": [
							[
								502,
								-223,
								503,
								-216
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Peru"
						},
						"id": "PER",
						"arcs": [
							[
								-168,
								504,
								-255,
								-219,
								-107,
								-103
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Philippines"
						},
						"id": "PHL",
						"arcs": [
							[
								[
									505
								]
							],
							[
								[
									506
								]
							],
							[
								[
									507
								]
							],
							[
								[
									508
								]
							],
							[
								[
									509
								]
							],
							[
								[
									510
								]
							],
							[
								[
									511
								]
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Papua New Guinea"
						},
						"id": "PN1",
						"arcs": [
							[
								[
									512
								]
							],
							[
								[
									513
								]
							],
							[
								[
									-357,
									514
								]
							],
							[
								[
									515
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Poland"
						},
						"id": "POL",
						"arcs": [
							[
								-232,
								516,
								517,
								-440,
								-98,
								518,
								519,
								-229
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Puerto Rico"
						},
						"id": "PRI",
						"arcs": [
							[
								520
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Dem. Rep. Korea"
						},
						"id": "PRK",
						"arcs": [
							[
								521,
								522,
								-417,
								523,
								-173
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Portugal"
						},
						"id": "PR1",
						"arcs": [
							[
								-269,
								524
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Paraguay"
						},
						"id": "PRY",
						"arcs": [
							[
								-105,
								-106,
								-26
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Palestine"
						},
						"id": "PSX",
						"arcs": [
							[
								-396,
								-383
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Qatar"
						},
						"id": "QAT",
						"arcs": [
							[
								525,
								526
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Romania"
						},
						"id": "ROU",
						"arcs": [
							[
								527,
								-447,
								528,
								529,
								-82,
								530,
								-345
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Russia"
						},
						"id": "RUS",
						"arcs": [
							[
								[
									531
								]
							],
							[
								[
									-518,
									532,
									-437
								]
							],
							[
								[
									533
								]
							],
							[
								[
									534
								]
							],
							[
								[
									535
								]
							],
							[
								[
									536
								]
							],
							[
								[
									537
								]
							],
							[
								[
									-522,
									-172,
									538,
									539,
									-190,
									540,
									-188,
									-460,
									-186,
									-403,
									541,
									-59,
									-305,
									542,
									543,
									-96,
									-442,
									-273,
									544,
									-271,
									545,
									-284,
									-490,
									546
								]
							],
							[
								[
									547
								]
							],
							[
								[
									548
								]
							],
							[
								[
									549
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Rwanda"
						},
						"id": "RWA",
						"arcs": [
							[
								550,
								-61,
								-205,
								551
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "W. Sahara"
						},
						"id": "SAH",
						"arcs": [
							[
								552,
								-249,
								-473,
								553,
								-444
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Saudi Arabia"
						},
						"id": "SAU",
						"arcs": [
							[
								554,
								-394,
								-377,
								-422,
								555,
								-527,
								556,
								-23,
								-499,
								557
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Sudan"
						},
						"id": "SDN",
						"arcs": [
							[
								558,
								559,
								-124,
								560,
								-433,
								-257,
								561,
								-264,
								-283,
								562
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "S. Sudan"
						},
						"id": "SDS",
						"arcs": [
							[
								563,
								-281,
								-408,
								564,
								-211,
								-126,
								565,
								-559
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Senegal"
						},
						"id": "SEN",
						"arcs": [
							[
								566,
								-471,
								-455,
								-313,
								-318,
								567,
								-316
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Solomon Is."
						},
						"id": "SLB",
						"arcs": [
							[
								[
									568
								]
							],
							[
								[
									569
								]
							],
							[
								[
									570
								]
							],
							[
								[
									571
								]
							],
							[
								[
									572
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Sierra Leone"
						},
						"id": "SLE",
						"arcs": [
							[
								573,
								-310,
								-429
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "El Salvador"
						},
						"id": "SLV",
						"arcs": [
							[
								574,
								-329,
								-334
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Somaliland"
						},
						"id": "SOL",
						"arcs": [
							[
								-278,
								575,
								-276,
								-239,
								576,
								577
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Somalia"
						},
						"id": "SOM",
						"arcs": [
							[
								-409,
								-279,
								-578,
								578
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Serbia"
						},
						"id": "SRB",
						"arcs": [
							[
								-87,
								-452,
								-419,
								-459,
								-91,
								-337,
								-346,
								-531
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Suriname"
						},
						"id": "SUR",
						"arcs": [
							[
								579,
								-292,
								580,
								-111,
								-331
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Slovakia"
						},
						"id": "SVK",
						"arcs": [
							[
								-520,
								581,
								-343,
								-54,
								-230
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Slovenia"
						},
						"id": "SVN",
						"arcs": [
							[
								-49,
								-347,
								-340,
								582,
								-390
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Sweden"
						},
						"id": "SWE",
						"arcs": [
							[
								-491,
								-286,
								583
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Swaziland"
						},
						"id": "SWZ",
						"arcs": [
							[
								584,
								-466
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Syria"
						},
						"id": "SYR",
						"arcs": [
							[
								-393,
								-387,
								-427,
								585,
								586,
								-379
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Chad"
						},
						"id": "TCD",
						"arcs": [
							[
								-484,
								-434,
								-561,
								-123,
								-202,
								587
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Togo"
						},
						"id": "TGO",
						"arcs": [
							[
								588,
								-308,
								-77,
								-70
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Thailand"
						},
						"id": "THA",
						"arcs": [
							[
								589,
								-477,
								590,
								-457,
								-423,
								-412
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Tajikistan"
						},
						"id": "TJK",
						"arcs": [
							[
								-410,
								-183,
								-3,
								591
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Turkmenistan"
						},
						"id": "TKM",
						"arcs": [
							[
								-369,
								592,
								-401,
								593,
								-1
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Timor-Leste"
						},
						"id": "TLS",
						"arcs": [
							[
								594,
								-349
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Trinidad and Tobago"
						},
						"id": "TTO",
						"arcs": [
							[
								595
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Tunisia"
						},
						"id": "TUN",
						"arcs": [
							[
								-252,
								596,
								-431
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Turkey"
						},
						"id": "TUR",
						"arcs": [
							[
								[
									-306,
									-36,
									-373,
									-380,
									-587,
									597
								]
							],
							[
								[
									-323,
									-84,
									598
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Taiwan"
						},
						"id": "TWN",
						"arcs": [
							[
								599
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Tanzania"
						},
						"id": "TZA",
						"arcs": [
							[
								-406,
								600,
								-463,
								601,
								-461,
								-475,
								602,
								603,
								-206,
								-63,
								604,
								-551,
								605
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Uganda"
						},
						"id": "UGA",
						"arcs": [
							[
								-552,
								-204,
								-565,
								-407,
								-606
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Ukraine"
						},
						"id": "UKR",
						"arcs": [
							[
								-544,
								606,
								-529,
								-446,
								-528,
								-344,
								-582,
								-519,
								-97
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Uruguay"
						},
						"id": "URY",
						"arcs": [
							[
								-114,
								607,
								-28
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "United States"
						},
						"id": "USA",
						"arcs": [
							[
								[
									608
								]
							],
							[
								[
									609
								]
							],
							[
								[
									610
								]
							],
							[
								[
									611
								]
							],
							[
								[
									612
								]
							],
							[
								[
									613,
									-451,
									614,
									-140
								]
							],
							[
								[
									615
								]
							],
							[
								[
									616
								]
							],
							[
								[
									617
								]
							],
							[
								[
									-142,
									618
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Uzbekistan"
						},
						"id": "UZB",
						"arcs": [
							[
								-594,
								-400,
								-411,
								-592,
								-2
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Venezuela"
						},
						"id": "VEN",
						"arcs": [
							[
								619,
								-332,
								-109,
								-218
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Vietnam"
						},
						"id": "VNM",
						"arcs": [
							[
								620,
								-414,
								-425,
								-175
							]
						]
					},
					{
						"type": "MultiPolygon",
						"properties": {
							"name": "Vanuatu"
						},
						"id": "VUT",
						"arcs": [
							[
								[
									621
								]
							],
							[
								[
									622
								]
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Yemen"
						},
						"id": "YEM",
						"arcs": [
							[
								623,
								-558,
								-498
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "South Africa"
						},
						"id": "ZAF",
						"arcs": [
							[
								-482,
								-119,
								624,
								-467,
								-585,
								-465,
								625
							],
							[
								-436
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Zambia"
						},
						"id": "ZMB",
						"arcs": [
							[
								-474,
								-469,
								626,
								-121,
								-481,
								-7,
								-208,
								-603
							]
						]
					},
					{
						"type": "Polygon",
						"properties": {
							"name": "Zimbabwe"
						},
						"id": "ZWE",
						"arcs": [
							[
								-625,
								-122,
								-627,
								-468
							]
						]
					}
				]
			},
			"places": {
				"type": "GeometryCollection",
				"geometries": [
					{
						"type": "Point",
						"properties": {
							"name": "San Marino"
						},
						"coordinates": [
							5345,
							7712
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Vaduz"
						},
						"coordinates": [
							5264,
							7897
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Lobamba"
						},
						"coordinates": [
							5866,
							3658
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Luxembourg"
						},
						"coordinates": [
							5170,
							8039
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Palikir"
						},
						"coordinates": [
							9392,
							5581
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Majuro"
						},
						"coordinates": [
							9760,
							5591
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Funafuti"
						},
						"coordinates": [
							9977,
							4692
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Melekeok"
						},
						"coordinates": [
							8739,
							5614
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bir Lehlou"
						},
						"coordinates": [
							4731,
							6686
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Monaco"
						},
						"coordinates": [
							5205,
							7701
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Tarawa"
						},
						"coordinates": [
							9805,
							5260
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Moroni"
						},
						"coordinates": [
							6201,
							4509
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Andorra"
						},
						"coordinates": [
							5042,
							7630
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Port-of-Spain"
						},
						"coordinates": [
							3291,
							5796
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Kigali"
						},
						"coordinates": [
							5834,
							5070
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Mbabane"
						},
						"coordinates": [
							5864,
							3667
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Juba"
						},
						"coordinates": [
							5877,
							5461
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "The Hague"
						},
						"coordinates": [
							5118,
							8181
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Ljubljana"
						},
						"coordinates": [
							5403,
							7834
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bratislava"
						},
						"coordinates": [
							5475,
							7955
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Doha"
						},
						"coordinates": [
							6431,
							6639
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Podgorica"
						},
						"coordinates": [
							5535,
							7628
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Sri Jawewardenepura Kotte"
						},
						"coordinates": [
							7220,
							5580
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Baguio City"
						},
						"coordinates": [
							8348,
							6129
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Dodoma"
						},
						"coordinates": [
							5992,
							4826
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bern"
						},
						"coordinates": [
							5207,
							7884
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Laayoune"
						},
						"coordinates": [
							4633,
							6746
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Pristina"
						},
						"coordinates": [
							5587,
							7639
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Roseau"
						},
						"coordinates": [
							3294,
							6064
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Djibouti"
						},
						"coordinates": [
							6198,
							5850
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Putrajaya"
						},
						"coordinates": [
							7824,
							5350
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Kyoto"
						},
						"coordinates": [
							8770,
							7200
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Banjul"
						},
						"coordinates": [
							4539,
							5957
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Skopje"
						},
						"coordinates": [
							5595,
							7601
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bridgetown"
						},
						"coordinates": [
							3344,
							5937
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Porto-Novo"
						},
						"coordinates": [
							5072,
							5556
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bujumbura"
						},
						"coordinates": [
							5815,
							4988
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Kingstown"
						},
						"coordinates": [
							3299,
							5940
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Castries"
						},
						"coordinates": [
							3305,
							5989
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Basseterre"
						},
						"coordinates": [
							3258,
							6179
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Port Louis"
						},
						"coordinates": [
							6597,
							4021
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Saint George's"
						},
						"coordinates": [
							3285,
							5876
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Manama"
						},
						"coordinates": [
							6404,
							6693
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Saint John's"
						},
						"coordinates": [
							3282,
							6168
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Montevideo"
						},
						"coordinates": [
							3439,
							3175
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Lome"
						},
						"coordinates": [
							5033,
							5536
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Tunis"
						},
						"coordinates": [
							5282,
							7302
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Abu Dhabi"
						},
						"coordinates": [
							6510,
							6591
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Ashgabat"
						},
						"coordinates": [
							6621,
							7368
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Lusaka"
						},
						"coordinates": [
							5785,
							4295
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Harare"
						},
						"coordinates": [
							5862,
							4157
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Dili"
						},
						"coordinates": [
							8487,
							4690
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Port Vila"
						},
						"coordinates": [
							9674,
							4161
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Tegucigalpa"
						},
						"coordinates": [
							2577,
							5995
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Georgetown"
						},
						"coordinates": [
							3384,
							5574
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Reykjavík"
						},
						"coordinates": [
							4390,
							8876
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Port-au-Prince"
						},
						"coordinates": [
							2990,
							6250
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Kampala"
						},
						"coordinates": [
							5904,
							5201
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Paramaribo"
						},
						"coordinates": [
							3467,
							5518
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Niamey"
						},
						"coordinates": [
							5058,
							5961
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Dushanbe"
						},
						"coordinates": [
							6910,
							7403
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Asuncion"
						},
						"coordinates": [
							3398,
							3726
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Managua"
						},
						"coordinates": [
							2603,
							5882
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Freetown"
						},
						"coordinates": [
							4632,
							5670
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Islamabad"
						},
						"coordinates": [
							7032,
							7123
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Kathmandu"
						},
						"coordinates": [
							7369,
							6779
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bloemfontein"
						},
						"coordinates": [
							5728,
							3506
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Pretoria"
						},
						"coordinates": [
							5784,
							3702
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Port Moresby"
						},
						"coordinates": [
							9088,
							4637
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Honiara"
						},
						"coordinates": [
							9442,
							4639
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Panama City"
						},
						"coordinates": [
							2790,
							5699
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Rabat"
						},
						"coordinates": [
							4810,
							7142
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Chisinau"
						},
						"coordinates": [
							5801,
							7889
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Maputo"
						},
						"coordinates": [
							5905,
							3688
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Mogadishu"
						},
						"coordinates": [
							6260,
							5302
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Muscat"
						},
						"coordinates": [
							6627,
							6542
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Colombo"
						},
						"coordinates": [
							7218,
							5582
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Ulaanbaatar"
						},
						"coordinates": [
							7969,
							7942
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Wellington"
						},
						"coordinates": [
							9854,
							2804
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Windhoek"
						},
						"coordinates": [
							5474,
							3883
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Abuja"
						},
						"coordinates": [
							5209,
							5706
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bissau"
						},
						"coordinates": [
							4566,
							5866
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Amman"
						},
						"coordinates": [
							5997,
							7022
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Vilnius"
						},
						"coordinates": [
							5703,
							8331
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Riga"
						},
						"coordinates": [
							5669,
							8462
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bishkek"
						},
						"coordinates": [
							7071,
							7651
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Maseru"
						},
						"coordinates": [
							5763,
							3494
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Antananarivo"
						},
						"coordinates": [
							6319,
							4093
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Quito"
						},
						"coordinates": [
							2819,
							5170
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "San Jose"
						},
						"coordinates": [
							2664,
							5755
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "San Salvador"
						},
						"coordinates": [
							2522,
							5972
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Kingston"
						},
						"coordinates": [
							2867,
							6218
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Ndjamena"
						},
						"coordinates": [
							5417,
							5880
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Malabo"
						},
						"coordinates": [
							5243,
							5398
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Asmara"
						},
						"coordinates": [
							6081,
							6065
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Zagreb"
						},
						"coordinates": [
							5444,
							7820
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Tallinn"
						},
						"coordinates": [
							5686,
							8605
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Lilongwe"
						},
						"coordinates": [
							5938,
							4377
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Guatemala"
						},
						"coordinates": [
							2485,
							6025
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Libreville"
						},
						"coordinates": [
							5262,
							5205
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Suva"
						},
						"coordinates": [
							9956,
							4138
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Valparaiso"
						},
						"coordinates": [
							3010,
							3280
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Nouakchott"
						},
						"coordinates": [
							4556,
							6224
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bamako"
						},
						"coordinates": [
							4777,
							5911
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Beirut"
						},
						"coordinates": [
							5986,
							7133
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Tbilisi"
						},
						"coordinates": [
							6244,
							7585
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Astana"
						},
						"coordinates": [
							6983,
							8130
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Vientiane"
						},
						"coordinates": [
							7849,
							6217
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Brazzaville"
						},
						"coordinates": [
							5424,
							4937
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Conakry"
						},
						"coordinates": [
							4619,
							5731
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Yamoussoukro"
						},
						"coordinates": [
							4853,
							5575
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Ottawa"
						},
						"coordinates": [
							2897,
							7798
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Belgrade"
						},
						"coordinates": [
							5568,
							7763
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bandar Seri Begawan"
						},
						"coordinates": [
							8192,
							5464
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Sucre"
						},
						"coordinates": [
							3187,
							4086
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Belmopan"
						},
						"coordinates": [
							2534,
							6176
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bangui"
						},
						"coordinates": [
							5515,
							5434
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Yaounde"
						},
						"coordinates": [
							5319,
							5405
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Tirana"
						},
						"coordinates": [
							5550,
							7562
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Yerevan"
						},
						"coordinates": [
							6236,
							7496
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Baku"
						},
						"coordinates": [
							6384,
							7509
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Phnom Penh"
						},
						"coordinates": [
							7914,
							5848
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "La Paz"
						},
						"coordinates": [
							3107,
							4233
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Cotonou"
						},
						"coordinates": [
							5069,
							5551
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Sofia"
						},
						"coordinates": [
							5647,
							7640
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Minsk"
						},
						"coordinates": [
							5765,
							8286
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Thimphu"
						},
						"coordinates": [
							7489,
							6764
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Gaborone"
						},
						"coordinates": [
							5719,
							3763
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Canberra"
						},
						"coordinates": [
							9142,
							3151
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Ouagadougou"
						},
						"coordinates": [
							4957,
							5895
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Sarajevo"
						},
						"coordinates": [
							5510,
							7707
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Naypyidaw"
						},
						"coordinates": [
							7669,
							6321
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Nukualofa"
						},
						"coordinates": [
							133,
							3965
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Hargeysa"
						},
						"coordinates": [
							6223,
							5733
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Victoria"
						},
						"coordinates": [
							6540,
							4917
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Sao Tome"
						},
						"coordinates": [
							5187,
							5202
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Apia"
						},
						"coordinates": [
							229,
							4385
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Valletta"
						},
						"coordinates": [
							5403,
							7250
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Male"
						},
						"coordinates": [
							7041,
							5422
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Jerusalem"
						},
						"coordinates": [
							5977,
							7012
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Praia"
						},
						"coordinates": [
							4346,
							6041
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Nassau"
						},
						"coordinates": [
							2851,
							6627
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Nicosia"
						},
						"coordinates": [
							5926,
							7207
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Hanoi"
						},
						"coordinates": [
							7939,
							6394
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Ankara"
						},
						"coordinates": [
							5912,
							7482
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Budapest"
						},
						"coordinates": [
							5529,
							7918
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Sanaa"
						},
						"coordinates": [
							6227,
							6067
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bucharest"
						},
						"coordinates": [
							5724,
							7741
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Damascus"
						},
						"coordinates": [
							6008,
							7112
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Lisbon"
						},
						"coordinates": [
							4745,
							7412
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Khartoum"
						},
						"coordinates": [
							5903,
							6080
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Oslo"
						},
						"coordinates": [
							5298,
							8633
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Warsaw"
						},
						"coordinates": [
							5583,
							8191
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Pyongyang"
						},
						"coordinates": [
							8492,
							7429
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Dar es Salaam"
						},
						"coordinates": [
							6090,
							4791
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Dublin"
						},
						"coordinates": [
							4826,
							8254
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Monrovia"
						},
						"coordinates": [
							4700,
							5546
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Kuala Lumpur"
						},
						"coordinates": [
							7824,
							5365
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Havana"
						},
						"coordinates": [
							2712,
							6515
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Prague"
						},
						"coordinates": [
							5401,
							8067
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Kuwait"
						},
						"coordinates": [
							6332,
							6874
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Santo Domingo"
						},
						"coordinates": [
							3058,
							6246
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Accra"
						},
						"coordinates": [
							4993,
							5502
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Tripoli"
						},
						"coordinates": [
							5366,
							7077
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Tel Aviv-Yafo"
						},
						"coordinates": [
							5965,
							7030
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Helsinki"
						},
						"coordinates": [
							5692,
							8648
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "København"
						},
						"coordinates": [
							5348,
							8389
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Abidjan"
						},
						"coordinates": [
							4887,
							5489
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Brasilia"
						},
						"coordinates": [
							3669,
							4274
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Brussels"
						},
						"coordinates": [
							5120,
							8110
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Dhaka"
						},
						"coordinates": [
							7511,
							6549
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Luanda"
						},
						"coordinates": [
							5367,
							4674
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Algiers"
						},
						"coordinates": [
							5084,
							7300
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Rangoon"
						},
						"coordinates": [
							7670,
							6149
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "San Francisco"
						},
						"coordinates": [
							1599,
							7357
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Denver"
						},
						"coordinates": [
							2084,
							7471
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Houston"
						},
						"coordinates": [
							2351,
							6900
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Miami"
						},
						"coordinates": [
							2771,
							6668
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Atlanta"
						},
						"coordinates": [
							2655,
							7131
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Chicago"
						},
						"coordinates": [
							2562,
							7591
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Caracas"
						},
						"coordinates": [
							3141,
							5787
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Kiev"
						},
						"coordinates": [
							5847,
							8087
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Dubai"
						},
						"coordinates": [
							6535,
							6635
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Tashkent"
						},
						"coordinates": [
							6924,
							7561
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Madrid"
						},
						"coordinates": [
							4897,
							7509
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Geneva"
						},
						"coordinates": [
							5170,
							7843
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Stockholm"
						},
						"coordinates": [
							5502,
							8600
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bangkok"
						},
						"coordinates": [
							7791,
							5974
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Lima"
						},
						"coordinates": [
							2859,
							4489
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Dakar"
						},
						"coordinates": [
							4514,
							6030
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Johannesburg"
						},
						"coordinates": [
							5778,
							3676
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Amsterdam"
						},
						"coordinates": [
							5136,
							8197
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Casablanca"
						},
						"coordinates": [
							4788,
							7117
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Seoul"
						},
						"coordinates": [
							8527,
							7346
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Manila"
						},
						"coordinates": [
							8360,
							6024
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Monterrey"
						},
						"coordinates": [
							2213,
							6661
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Auckland"
						},
						"coordinates": [
							9854,
							3061
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Berlin"
						},
						"coordinates": [
							5372,
							8207
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Urumqi"
						},
						"coordinates": [
							7432,
							7705
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Chengdu"
						},
						"coordinates": [
							7890,
							6949
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Osaka"
						},
						"coordinates": [
							8762,
							7184
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Kinshasa"
						},
						"coordinates": [
							5425,
							4933
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "New Delhi"
						},
						"coordinates": [
							7144,
							6829
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bangalore"
						},
						"coordinates": [
							7154,
							5929
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Athens"
						},
						"coordinates": [
							5659,
							7370
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Baghdad"
						},
						"coordinates": [
							6232,
							7102
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Addis Ababa"
						},
						"coordinates": [
							6074,
							5703
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Tehran"
						},
						"coordinates": [
							6428,
							7237
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Vancouver"
						},
						"coordinates": [
							1580,
							8020
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Toronto"
						},
						"coordinates": [
							2794,
							7699
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Buenos Aires"
						},
						"coordinates": [
							3377,
							3190
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Kabul"
						},
						"coordinates": [
							6921,
							7170
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Vienna"
						},
						"coordinates": [
							5454,
							7958
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Melbourne"
						},
						"coordinates": [
							9026,
							3005
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Taipei"
						},
						"coordinates": [
							8376,
							6624
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Los Angeles"
						},
						"coordinates": [
							1717,
							7140
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Washington, D.C."
						},
						"coordinates": [
							2861,
							7423
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "New York"
						},
						"coordinates": [
							2945,
							7529
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "London"
						},
						"coordinates": [
							4996,
							8148
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Istanbul"
						},
						"coordinates": [
							5805,
							7550
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Riyadh"
						},
						"coordinates": [
							6299,
							6601
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Cape Town"
						},
						"coordinates": [
							5511,
							3229
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Moscow"
						},
						"coordinates": [
							6044,
							8393
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Mexico City"
						},
						"coordinates": [
							2246,
							6302
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Lagos"
						},
						"coordinates": [
							5094,
							5554
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Rome"
						},
						"coordinates": [
							5346,
							7595
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Beijing"
						},
						"coordinates": [
							8232,
							7482
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Nairobi"
						},
						"coordinates": [
							6022,
							5109
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Jakarta"
						},
						"coordinates": [
							7967,
							4827
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Bogota"
						},
						"coordinates": [
							2942,
							5447
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Cairo"
						},
						"coordinates": [
							5867,
							6913
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Shanghai"
						},
						"coordinates": [
							8372,
							6980
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Tokyo"
						},
						"coordinates": [
							8881,
							7237
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Mumbai"
						},
						"coordinates": [
							7023,
							6278
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Paris"
						},
						"coordinates": [
							5064,
							7996
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Santiago"
						},
						"coordinates": [
							3037,
							3256
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Kolkata"
						},
						"coordinates": [
							7453,
							6478
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Rio de Janeiro"
						},
						"coordinates": [
							3799,
							3862
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Sao Paulo"
						},
						"coordinates": [
							3704,
							3826
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Sydney"
						},
						"coordinates": [
							9199,
							3229
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Singapore"
						},
						"coordinates": [
							7884,
							5257
						]
					},
					{
						"type": "Point",
						"properties": {
							"name": "Hong Kong"
						},
						"coordinates": [
							8171,
							6467
						]
					}
				]
			}
		},
		"arcs": [
			[
				[
					6700,
					7235
				],
				[
					28,
					-22
				],
				[
					21,
					8
				],
				[
					6,
					26
				],
				[
					22,
					9
				],
				[
					15,
					17
				],
				[
					6,
					46
				],
				[
					23,
					12
				],
				[
					5,
					20
				],
				[
					13,
					-15
				],
				[
					8,
					-2
				]
			],
			[
				[
					6847,
					7334
				],
				[
					16,
					0
				],
				[
					20,
					-13
				]
			],
			[
				[
					6883,
					7321
				],
				[
					9,
					-7
				],
				[
					20,
					19
				],
				[
					9,
					-11
				],
				[
					9,
					26
				],
				[
					17,
					-1
				],
				[
					4,
					8
				],
				[
					3,
					24
				],
				[
					12,
					20
				],
				[
					15,
					-13
				],
				[
					-3,
					-18
				],
				[
					9,
					-3
				],
				[
					-3,
					-48
				],
				[
					11,
					-19
				],
				[
					10,
					12
				],
				[
					12,
					6
				],
				[
					17,
					26
				],
				[
					19,
					-5
				],
				[
					29,
					0
				]
			],
			[
				[
					7082,
					7337
				],
				[
					5,
					-16
				]
			],
			[
				[
					7087,
					7321
				],
				[
					-16,
					-7
				],
				[
					-14,
					-10
				],
				[
					-32,
					-7
				],
				[
					-30,
					-12
				],
				[
					-16,
					-25
				],
				[
					6,
					-25
				],
				[
					4,
					-28
				],
				[
					-14,
					-24
				],
				[
					1,
					-23
				],
				[
					-8,
					-20
				],
				[
					-26,
					1
				],
				[
					11,
					-38
				],
				[
					-18,
					-14
				],
				[
					-12,
					-35
				],
				[
					2,
					-35
				],
				[
					-11,
					-16
				],
				[
					-10,
					6
				],
				[
					-22,
					-8
				],
				[
					-3,
					-16
				],
				[
					-20,
					0
				],
				[
					-16,
					-32
				],
				[
					-1,
					-49
				],
				[
					-36,
					-24
				],
				[
					-19,
					5
				],
				[
					-6,
					-13
				],
				[
					-16,
					7
				],
				[
					-28,
					-8
				],
				[
					-47,
					29
				]
			],
			[
				[
					6690,
					6900
				],
				[
					25,
					52
				],
				[
					-2,
					37
				],
				[
					-21,
					10
				],
				[
					-2,
					37
				],
				[
					-9,
					46
				],
				[
					12,
					31
				],
				[
					-12,
					9
				],
				[
					7,
					42
				],
				[
					12,
					71
				]
			],
			[
				[
					5664,
					4553
				],
				[
					3,
					-18
				],
				[
					-4,
					-28
				],
				[
					5,
					-27
				],
				[
					-4,
					-21
				],
				[
					3,
					-20
				],
				[
					-58,
					1
				],
				[
					-2,
					-183
				],
				[
					19,
					-48
				],
				[
					18,
					-36
				]
			],
			[
				[
					5644,
					4173
				],
				[
					-51,
					-23
				],
				[
					-67,
					8
				],
				[
					-19,
					28
				],
				[
					-113,
					-3
				],
				[
					-4,
					-4
				],
				[
					-17,
					26
				],
				[
					-18,
					2
				],
				[
					-16,
					-10
				],
				[
					-14,
					-11
				]
			],
			[
				[
					5325,
					4186
				],
				[
					-2,
					36
				],
				[
					4,
					51
				],
				[
					9,
					53
				],
				[
					2,
					24
				],
				[
					9,
					52
				],
				[
					6,
					24
				],
				[
					16,
					38
				],
				[
					9,
					25
				],
				[
					3,
					43
				],
				[
					-1,
					33
				],
				[
					-9,
					20
				],
				[
					-7,
					35
				],
				[
					-7,
					35
				],
				[
					2,
					12
				],
				[
					8,
					22
				],
				[
					-8,
					56
				],
				[
					-6,
					39
				],
				[
					-14,
					36
				],
				[
					3,
					11
				]
			],
			[
				[
					5342,
					4831
				],
				[
					11,
					8
				],
				[
					8,
					-1
				],
				[
					10,
					7
				],
				[
					82,
					-1
				],
				[
					7,
					-43
				],
				[
					8,
					-34
				],
				[
					6,
					-19
				],
				[
					11,
					-30
				],
				[
					18,
					5
				],
				[
					9,
					8
				],
				[
					16,
					-9
				],
				[
					4,
					15
				],
				[
					7,
					33
				],
				[
					17,
					3
				],
				[
					2,
					10
				],
				[
					14,
					0
				],
				[
					-3,
					-21
				],
				[
					34,
					1
				],
				[
					1,
					-37
				],
				[
					5,
					-22
				],
				[
					-4,
					-35
				],
				[
					2,
					-35
				],
				[
					9,
					-21
				],
				[
					-1,
					-69
				],
				[
					7,
					5
				],
				[
					12,
					-1
				],
				[
					17,
					9
				],
				[
					13,
					-4
				]
			],
			[
				[
					5338,
					4849
				],
				[
					-8,
					43
				]
			],
			[
				[
					5330,
					4892
				],
				[
					12,
					25
				],
				[
					8,
					10
				],
				[
					10,
					-20
				]
			],
			[
				[
					5360,
					4907
				],
				[
					-10,
					-12
				],
				[
					-4,
					-15
				],
				[
					-1,
					-25
				],
				[
					-7,
					-6
				]
			],
			[
				[
					5571,
					7593
				],
				[
					-3,
					-20
				],
				[
					4,
					-25
				],
				[
					11,
					-14
				]
			],
			[
				[
					5583,
					7534
				],
				[
					0,
					-15
				],
				[
					-9,
					-8
				],
				[
					-2,
					-19
				],
				[
					-13,
					-28
				]
			],
			[
				[
					5559,
					7464
				],
				[
					-5,
					4
				],
				[
					0,
					13
				],
				[
					-15,
					19
				],
				[
					-3,
					28
				],
				[
					2,
					39
				],
				[
					4,
					18
				],
				[
					-4,
					9
				]
			],
			[
				[
					5538,
					7594
				],
				[
					-2,
					18
				],
				[
					12,
					29
				],
				[
					1,
					-11
				],
				[
					8,
					5
				]
			],
			[
				[
					5557,
					7635
				],
				[
					6,
					-16
				],
				[
					7,
					-5
				],
				[
					1,
					-21
				]
			],
			[
				[
					6432,
					6579
				],
				[
					5,
					2
				],
				[
					1,
					-15
				],
				[
					22,
					9
				],
				[
					23,
					-2
				],
				[
					17,
					-2
				],
				[
					19,
					39
				],
				[
					20,
					37
				],
				[
					18,
					36
				]
			],
			[
				[
					6557,
					6683
				],
				[
					5,
					-20
				]
			],
			[
				[
					6562,
					6663
				],
				[
					4,
					-45
				]
			],
			[
				[
					6566,
					6618
				],
				[
					-14,
					-1
				],
				[
					-3,
					-37
				],
				[
					5,
					-8
				],
				[
					-12,
					-11
				],
				[
					0,
					-24
				],
				[
					-8,
					-24
				],
				[
					-1,
					-23
				]
			],
			[
				[
					6533,
					6490
				],
				[
					-6,
					-12
				],
				[
					-83,
					29
				],
				[
					-11,
					58
				],
				[
					-1,
					14
				]
			],
			[
				[
					3140,
					2021
				],
				[
					-17,
					2
				],
				[
					-30,
					0
				],
				[
					0,
					129
				]
			],
			[
				[
					3093,
					2152
				],
				[
					11,
					-27
				],
				[
					14,
					-43
				],
				[
					36,
					-35
				],
				[
					39,
					-14
				],
				[
					-13,
					-29
				],
				[
					-26,
					-3
				],
				[
					-14,
					20
				]
			],
			[
				[
					3258,
					3901
				],
				[
					51,
					-94
				],
				[
					23,
					-8
				],
				[
					34,
					-43
				],
				[
					29,
					-22
				],
				[
					4,
					-26
				],
				[
					-28,
					-87
				],
				[
					28,
					-16
				],
				[
					32,
					-9
				],
				[
					22,
					9
				],
				[
					25,
					45
				],
				[
					4,
					50
				]
			],
			[
				[
					3482,
					3700
				],
				[
					14,
					11
				],
				[
					14,
					-33
				],
				[
					-1,
					-46
				],
				[
					-23,
					-32
				],
				[
					-19,
					-23
				],
				[
					-31,
					-56
				],
				[
					-37,
					-78
				]
			],
			[
				[
					3399,
					3443
				],
				[
					-7,
					-47
				],
				[
					-7,
					-59
				],
				[
					0,
					-57
				],
				[
					-6,
					-13
				],
				[
					-2,
					-37
				]
			],
			[
				[
					3377,
					3230
				],
				[
					-2,
					-30
				],
				[
					35,
					-50
				],
				[
					-4,
					-39
				],
				[
					18,
					-25
				],
				[
					-2,
					-28
				],
				[
					-26,
					-74
				],
				[
					-42,
					-31
				],
				[
					-55,
					-12
				],
				[
					-31,
					6
				],
				[
					6,
					-35
				],
				[
					-6,
					-43
				],
				[
					5,
					-29
				],
				[
					-16,
					-20
				],
				[
					-29,
					-8
				],
				[
					-26,
					21
				],
				[
					-11,
					-15
				],
				[
					4,
					-57
				],
				[
					18,
					-18
				],
				[
					16,
					18
				],
				[
					8,
					-29
				],
				[
					-26,
					-18
				],
				[
					-22,
					-36
				],
				[
					-4,
					-58
				],
				[
					-7,
					-31
				],
				[
					-26,
					0
				],
				[
					-22,
					-30
				],
				[
					-8,
					-43
				],
				[
					28,
					-42
				],
				[
					26,
					-12
				],
				[
					-9,
					-51
				],
				[
					-33,
					-33
				],
				[
					-18,
					-67
				],
				[
					-25,
					-23
				],
				[
					-12,
					-27
				],
				[
					9,
					-60
				],
				[
					19,
					-33
				],
				[
					-12,
					3
				]
			],
			[
				[
					3095,
					2171
				],
				[
					-26,
					9
				],
				[
					-67,
					8
				],
				[
					-11,
					33
				],
				[
					0,
					43
				],
				[
					-18,
					-3
				],
				[
					-10,
					21
				],
				[
					-3,
					61
				],
				[
					22,
					25
				],
				[
					9,
					36
				],
				[
					-4,
					30
				],
				[
					15,
					49
				],
				[
					10,
					76
				],
				[
					-3,
					34
				],
				[
					12,
					11
				],
				[
					-3,
					21
				],
				[
					-13,
					12
				],
				[
					10,
					24
				],
				[
					-13,
					22
				],
				[
					-6,
					66
				],
				[
					11,
					12
				],
				[
					-5,
					70
				],
				[
					7,
					59
				],
				[
					7,
					52
				],
				[
					17,
					20
				],
				[
					-9,
					57
				],
				[
					0,
					53
				],
				[
					21,
					37
				],
				[
					-1,
					48
				],
				[
					16,
					57
				],
				[
					0,
					52
				],
				[
					-7,
					11
				],
				[
					-13,
					99
				],
				[
					18,
					60
				],
				[
					-3,
					55
				],
				[
					10,
					53
				],
				[
					18,
					54
				],
				[
					20,
					36
				],
				[
					-9,
					22
				],
				[
					6,
					19
				],
				[
					-1,
					96
				],
				[
					30,
					28
				],
				[
					10,
					60
				],
				[
					-3,
					14
				]
			],
			[
				[
					3136,
					3873
				],
				[
					23,
					52
				],
				[
					36,
					-14
				],
				[
					16,
					-41
				],
				[
					11,
					46
				],
				[
					32,
					-2
				],
				[
					4,
					-13
				]
			],
			[
				[
					6210,
					7549
				],
				[
					39,
					9
				]
			],
			[
				[
					6249,
					7558
				],
				[
					5,
					-15
				],
				[
					11,
					-10
				],
				[
					-6,
					-15
				],
				[
					15,
					-20
				],
				[
					-8,
					-18
				],
				[
					12,
					-16
				],
				[
					13,
					-9
				],
				[
					0,
					-40
				]
			],
			[
				[
					6291,
					7415
				],
				[
					-10,
					-2
				]
			],
			[
				[
					6281,
					7413
				],
				[
					-11,
					34
				],
				[
					0,
					9
				],
				[
					-12,
					-1
				],
				[
					-9,
					16
				],
				[
					-5,
					-2
				]
			],
			[
				[
					6244,
					7469
				],
				[
					-11,
					17
				],
				[
					-21,
					14
				],
				[
					3,
					28
				],
				[
					-5,
					21
				]
			],
			[
				[
					3345,
					574
				],
				[
					-8,
					-30
				],
				[
					-8,
					-26
				],
				[
					-59,
					8
				],
				[
					-62,
					-3
				],
				[
					-34,
					19
				],
				[
					0,
					2
				],
				[
					-16,
					17
				],
				[
					63,
					-2
				],
				[
					60,
					-6
				],
				[
					20,
					24
				],
				[
					15,
					20
				],
				[
					29,
					-23
				]
			],
			[
				[
					577,
					605
				],
				[
					-53,
					-8
				],
				[
					-36,
					20
				],
				[
					-17,
					21
				],
				[
					-1,
					3
				],
				[
					-18,
					16
				],
				[
					17,
					21
				],
				[
					52,
					-9
				],
				[
					28,
					-18
				],
				[
					21,
					-20
				],
				[
					7,
					-26
				]
			],
			[
				[
					3745,
					688
				],
				[
					35,
					-25
				],
				[
					12,
					-35
				],
				[
					3,
					-24
				],
				[
					1,
					-30
				],
				[
					-43,
					-18
				],
				[
					-45,
					-14
				],
				[
					-52,
					-14
				],
				[
					-59,
					-11
				],
				[
					-65,
					3
				],
				[
					-37,
					19
				],
				[
					5,
					24
				],
				[
					59,
					16
				],
				[
					24,
					19
				],
				[
					18,
					25
				],
				[
					12,
					21
				],
				[
					17,
					21
				],
				[
					18,
					23
				],
				[
					14,
					0
				],
				[
					41,
					13
				],
				[
					42,
					-13
				]
			],
			[
				[
					1633,
					950
				],
				[
					36,
					-9
				],
				[
					33,
					10
				],
				[
					-16,
					-20
				],
				[
					-26,
					-15
				],
				[
					-39,
					5
				],
				[
					-27,
					20
				],
				[
					6,
					19
				],
				[
					33,
					-10
				]
			],
			[
				[
					1512,
					951
				],
				[
					43,
					-22
				],
				[
					-17,
					2
				],
				[
					-36,
					6
				],
				[
					-38,
					15
				],
				[
					20,
					13
				],
				[
					28,
					-14
				]
			],
			[
				[
					2250,
					1040
				],
				[
					31,
					-8
				],
				[
					30,
					7
				],
				[
					17,
					-33
				],
				[
					-22,
					5
				],
				[
					-34,
					-2
				],
				[
					-34,
					2
				],
				[
					-38,
					-3
				],
				[
					-28,
					11
				],
				[
					-15,
					24
				],
				[
					18,
					10
				],
				[
					35,
					-8
				],
				[
					40,
					-5
				]
			],
			[
				[
					3098,
					1097
				],
				[
					4,
					-26
				],
				[
					-5,
					-23
				],
				[
					-8,
					-21
				],
				[
					-33,
					-8
				],
				[
					-31,
					-12
				],
				[
					-36,
					2
				],
				[
					14,
					22
				],
				[
					-33,
					-8
				],
				[
					-31,
					-8
				],
				[
					-21,
					17
				],
				[
					-2,
					24
				],
				[
					30,
					23
				],
				[
					20,
					6
				],
				[
					32,
					-2
				],
				[
					8,
					29
				],
				[
					1,
					22
				],
				[
					0,
					46
				],
				[
					16,
					27
				],
				[
					25,
					9
				],
				[
					15,
					-21
				],
				[
					6,
					-22
				],
				[
					12,
					-26
				],
				[
					10,
					-24
				],
				[
					7,
					-26
				]
			],
			[
				[
					0,
					304
				],
				[
					2,
					0
				],
				[
					24,
					33
				],
				[
					50,
					-18
				],
				[
					3,
					2
				],
				[
					30,
					19
				],
				[
					4,
					-1
				],
				[
					3,
					0
				],
				[
					40,
					-24
				],
				[
					35,
					24
				],
				[
					7,
					3
				],
				[
					81,
					10
				],
				[
					27,
					-13
				],
				[
					13,
					-7
				],
				[
					41,
					-19
				],
				[
					79,
					-15
				],
				[
					63,
					-18
				],
				[
					107,
					-14
				],
				[
					80,
					16
				],
				[
					118,
					-11
				],
				[
					67,
					-18
				],
				[
					73,
					17
				],
				[
					78,
					16
				],
				[
					6,
					27
				],
				[
					-110,
					2
				],
				[
					-89,
					13
				],
				[
					-24,
					23
				],
				[
					-74,
					12
				],
				[
					5,
					26
				],
				[
					10,
					24
				],
				[
					10,
					22
				],
				[
					-5,
					23
				],
				[
					-46,
					16
				],
				[
					-22,
					20
				],
				[
					-43,
					18
				],
				[
					68,
					-3
				],
				[
					64,
					9
				],
				[
					40,
					-19
				],
				[
					50,
					17
				],
				[
					45,
					21
				],
				[
					23,
					19
				],
				[
					-10,
					24
				],
				[
					-36,
					16
				],
				[
					-41,
					17
				],
				[
					-57,
					3
				],
				[
					-50,
					8
				],
				[
					-54,
					6
				],
				[
					-18,
					21
				],
				[
					-36,
					18
				],
				[
					-21,
					21
				],
				[
					-9,
					65
				],
				[
					14,
					-6
				],
				[
					25,
					-18
				],
				[
					45,
					6
				],
				[
					44,
					8
				],
				[
					23,
					-25
				],
				[
					44,
					6
				],
				[
					37,
					12
				],
				[
					35,
					16
				],
				[
					32,
					19
				],
				[
					41,
					6
				],
				[
					-1,
					21
				],
				[
					-9,
					22
				],
				[
					8,
					20
				],
				[
					36,
					10
				],
				[
					16,
					-19
				],
				[
					42,
					11
				],
				[
					32,
					15
				],
				[
					40,
					1
				],
				[
					38,
					6
				],
				[
					37,
					13
				],
				[
					30,
					12
				],
				[
					34,
					13
				],
				[
					22,
					-3
				],
				[
					19,
					-5
				],
				[
					41,
					8
				],
				[
					37,
					-10
				],
				[
					38,
					1
				],
				[
					37,
					8
				],
				[
					37,
					-6
				],
				[
					41,
					-6
				],
				[
					39,
					3
				],
				[
					40,
					-1
				],
				[
					42,
					-2
				],
				[
					38,
					3
				],
				[
					28,
					17
				],
				[
					34,
					9
				],
				[
					35,
					-13
				],
				[
					33,
					10
				],
				[
					30,
					21
				],
				[
					18,
					-18
				],
				[
					9,
					-21
				],
				[
					18,
					-19
				],
				[
					29,
					17
				],
				[
					33,
					-21
				],
				[
					38,
					-7
				],
				[
					32,
					-16
				],
				[
					39,
					4
				],
				[
					36,
					10
				],
				[
					41,
					-3
				],
				[
					38,
					-7
				],
				[
					38,
					-11
				],
				[
					15,
					25
				],
				[
					-18,
					19
				],
				[
					-14,
					21
				],
				[
					-36,
					4
				],
				[
					-15,
					22
				],
				[
					-6,
					21
				],
				[
					-10,
					43
				],
				[
					21,
					-8
				],
				[
					36,
					-3
				],
				[
					36,
					3
				],
				[
					33,
					-9
				],
				[
					28,
					-17
				],
				[
					12,
					-20
				],
				[
					38,
					-4
				],
				[
					36,
					8
				],
				[
					38,
					12
				],
				[
					34,
					6
				],
				[
					28,
					-13
				],
				[
					37,
					4
				],
				[
					24,
					44
				],
				[
					23,
					-26
				],
				[
					32,
					-10
				],
				[
					34,
					6
				],
				[
					23,
					-23
				],
				[
					37,
					-2
				],
				[
					33,
					-7
				],
				[
					34,
					-12
				],
				[
					21,
					21
				],
				[
					11,
					21
				],
				[
					28,
					-23
				],
				[
					38,
					6
				],
				[
					28,
					-13
				],
				[
					19,
					-19
				],
				[
					37,
					6
				],
				[
					29,
					12
				],
				[
					29,
					15
				],
				[
					33,
					8
				],
				[
					39,
					6
				],
				[
					36,
					8
				],
				[
					27,
					13
				],
				[
					16,
					18
				],
				[
					7,
					25
				],
				[
					-3,
					23
				],
				[
					-9,
					23
				],
				[
					-10,
					22
				],
				[
					-9,
					23
				],
				[
					-7,
					20
				],
				[
					-1,
					23
				],
				[
					2,
					23
				],
				[
					13,
					21
				],
				[
					11,
					24
				],
				[
					5,
					22
				],
				[
					-6,
					25
				],
				[
					-3,
					23
				],
				[
					14,
					26
				],
				[
					15,
					16
				],
				[
					18,
					22
				],
				[
					19,
					18
				],
				[
					22,
					17
				],
				[
					11,
					25
				],
				[
					15,
					16
				],
				[
					18,
					14
				],
				[
					26,
					4
				],
				[
					18,
					18
				],
				[
					19,
					11
				],
				[
					23,
					7
				],
				[
					20,
					14
				],
				[
					16,
					18
				],
				[
					22,
					7
				],
				[
					16,
					-15
				],
				[
					-10,
					-19
				],
				[
					-29,
					-17
				],
				[
					-11,
					-12
				],
				[
					-21,
					9
				],
				[
					-23,
					-6
				],
				[
					-19,
					-13
				],
				[
					-20,
					-15
				],
				[
					-14,
					-17
				],
				[
					-4,
					-22
				],
				[
					2,
					-22
				],
				[
					13,
					-19
				],
				[
					-19,
					-14
				],
				[
					-26,
					-4
				],
				[
					-15,
					-19
				],
				[
					-17,
					-18
				],
				[
					-17,
					-25
				],
				[
					-4,
					-22
				],
				[
					9,
					-23
				],
				[
					15,
					-18
				],
				[
					23,
					-14
				],
				[
					21,
					-18
				],
				[
					12,
					-22
				],
				[
					6,
					-22
				],
				[
					8,
					-22
				],
				[
					13,
					-20
				],
				[
					8,
					-21
				],
				[
					4,
					-53
				],
				[
					8,
					-22
				],
				[
					2,
					-22
				],
				[
					9,
					-23
				],
				[
					-4,
					-30
				],
				[
					-15,
					-24
				],
				[
					-17,
					-19
				],
				[
					-37,
					-8
				],
				[
					-12,
					-20
				],
				[
					-17,
					-19
				],
				[
					-42,
					-22
				],
				[
					-37,
					-9
				],
				[
					-35,
					-12
				],
				[
					-37,
					-13
				],
				[
					-22,
					-23
				],
				[
					-45,
					-3
				],
				[
					-49,
					3
				],
				[
					-44,
					-5
				],
				[
					-47,
					0
				],
				[
					9,
					-22
				],
				[
					42,
					-11
				],
				[
					31,
					-15
				],
				[
					18,
					-21
				],
				[
					-31,
					-18
				],
				[
					-48,
					6
				],
				[
					-40,
					-15
				],
				[
					-2,
					-23
				],
				[
					-1,
					-23
				],
				[
					33,
					-19
				],
				[
					6,
					-22
				],
				[
					35,
					-21
				],
				[
					59,
					-9
				],
				[
					50,
					-16
				],
				[
					40,
					-18
				],
				[
					50,
					-18
				],
				[
					70,
					-9
				],
				[
					68,
					-16
				],
				[
					47,
					-17
				],
				[
					52,
					-19
				],
				[
					27,
					-27
				],
				[
					13,
					-21
				],
				[
					34,
					20
				],
				[
					46,
					17
				],
				[
					48,
					18
				],
				[
					58,
					14
				],
				[
					49,
					16
				],
				[
					69,
					1
				],
				[
					68,
					-8
				],
				[
					57,
					-13
				],
				[
					17,
					25
				],
				[
					39,
					17
				],
				[
					70,
					1
				],
				[
					55,
					12
				],
				[
					52,
					13
				],
				[
					58,
					8
				],
				[
					62,
					10
				],
				[
					43,
					14
				],
				[
					-20,
					21
				],
				[
					-12,
					20
				],
				[
					0,
					21
				],
				[
					-54,
					-2
				],
				[
					-57,
					-9
				],
				[
					-54,
					0
				],
				[
					-8,
					22
				],
				[
					4,
					42
				],
				[
					12,
					13
				],
				[
					40,
					13
				],
				[
					47,
					14
				],
				[
					34,
					17
				],
				[
					33,
					17
				],
				[
					25,
					22
				],
				[
					38,
					11
				],
				[
					38,
					7
				],
				[
					19,
					5
				],
				[
					43,
					2
				],
				[
					41,
					8
				],
				[
					34,
					11
				],
				[
					34,
					14
				],
				[
					30,
					13
				],
				[
					39,
					19
				],
				[
					24,
					19
				],
				[
					26,
					17
				],
				[
					9,
					22
				],
				[
					-30,
					14
				],
				[
					10,
					23
				],
				[
					18,
					18
				],
				[
					29,
					12
				],
				[
					31,
					13
				],
				[
					28,
					18
				],
				[
					22,
					23
				],
				[
					13,
					27
				],
				[
					21,
					16
				],
				[
					33,
					-4
				],
				[
					13,
					-19
				],
				[
					34,
					-2
				],
				[
					1,
					21
				],
				[
					14,
					23
				],
				[
					30,
					-6
				],
				[
					7,
					-21
				],
				[
					33,
					-3
				],
				[
					36,
					10
				],
				[
					35,
					6
				],
				[
					31,
					-3
				],
				[
					12,
					-24
				],
				[
					31,
					20
				],
				[
					28,
					10
				],
				[
					31,
					8
				],
				[
					31,
					7
				],
				[
					29,
					14
				],
				[
					31,
					9
				],
				[
					24,
					12
				],
				[
					17,
					21
				],
				[
					20,
					-15
				],
				[
					29,
					8
				],
				[
					20,
					-27
				],
				[
					16,
					-20
				],
				[
					32,
					11
				],
				[
					12,
					22
				],
				[
					28,
					16
				],
				[
					37,
					-3
				],
				[
					11,
					-22
				],
				[
					22,
					22
				],
				[
					30,
					7
				],
				[
					33,
					2
				],
				[
					29,
					-1
				],
				[
					31,
					-7
				],
				[
					30,
					-3
				],
				[
					13,
					-20
				],
				[
					18,
					-16
				],
				[
					31,
					10
				],
				[
					32,
					2
				],
				[
					32,
					0
				],
				[
					31,
					1
				],
				[
					28,
					8
				],
				[
					29,
					7
				],
				[
					25,
					16
				],
				[
					26,
					10
				],
				[
					28,
					5
				],
				[
					21,
					16
				],
				[
					15,
					32
				],
				[
					16,
					19
				],
				[
					29,
					-9
				],
				[
					11,
					-20
				],
				[
					24,
					-14
				],
				[
					29,
					5
				],
				[
					19,
					-21
				],
				[
					21,
					-14
				],
				[
					28,
					13
				],
				[
					10,
					25
				],
				[
					25,
					10
				],
				[
					29,
					19
				],
				[
					27,
					8
				],
				[
					33,
					11
				],
				[
					22,
					13
				],
				[
					22,
					13
				],
				[
					22,
					13
				],
				[
					26,
					-7
				],
				[
					25,
					20
				],
				[
					18,
					16
				],
				[
					26,
					-1
				],
				[
					23,
					14
				],
				[
					6,
					20
				],
				[
					23,
					16
				],
				[
					23,
					11
				],
				[
					28,
					9
				],
				[
					25,
					4
				],
				[
					25,
					-3
				],
				[
					26,
					-6
				],
				[
					22,
					-15
				],
				[
					3,
					-25
				],
				[
					24,
					-19
				],
				[
					17,
					-16
				],
				[
					33,
					-7
				],
				[
					19,
					-16
				],
				[
					23,
					-16
				],
				[
					26,
					-3
				],
				[
					23,
					11
				],
				[
					24,
					24
				],
				[
					26,
					-12
				],
				[
					27,
					-7
				],
				[
					26,
					-7
				],
				[
					27,
					-4
				],
				[
					28,
					0
				],
				[
					23,
					-60
				],
				[
					-1,
					-15
				],
				[
					-4,
					-26
				],
				[
					-26,
					-14
				],
				[
					-22,
					-22
				],
				[
					4,
					-22
				],
				[
					31,
					1
				],
				[
					-4,
					-23
				],
				[
					-14,
					-21
				],
				[
					-13,
					-24
				],
				[
					21,
					-18
				],
				[
					32,
					-6
				],
				[
					32,
					10
				],
				[
					15,
					23
				],
				[
					10,
					21
				],
				[
					15,
					18
				],
				[
					17,
					17
				],
				[
					7,
					21
				],
				[
					15,
					28
				],
				[
					18,
					6
				],
				[
					31,
					2
				],
				[
					28,
					7
				],
				[
					28,
					9
				],
				[
					14,
					22
				],
				[
					8,
					22
				],
				[
					19,
					21
				],
				[
					27,
					15
				],
				[
					23,
					11
				],
				[
					16,
					19
				],
				[
					15,
					10
				],
				[
					21,
					9
				],
				[
					27,
					-5
				],
				[
					25,
					5
				],
				[
					28,
					7
				],
				[
					30,
					-3
				],
				[
					20,
					16
				],
				[
					14,
					38
				],
				[
					11,
					-16
				],
				[
					13,
					-27
				],
				[
					23,
					-11
				],
				[
					27,
					-5
				],
				[
					26,
					7
				],
				[
					29,
					-5
				],
				[
					26,
					-1
				],
				[
					17,
					6
				],
				[
					24,
					-3
				],
				[
					21,
					-13
				],
				[
					25,
					8
				],
				[
					30,
					0
				],
				[
					25,
					8
				],
				[
					29,
					-8
				],
				[
					19,
					19
				],
				[
					14,
					19
				],
				[
					19,
					16
				],
				[
					35,
					43
				],
				[
					18,
					-8
				],
				[
					21,
					-16
				],
				[
					18,
					-20
				],
				[
					36,
					-35
				],
				[
					27,
					-1
				],
				[
					25,
					0
				],
				[
					30,
					7
				],
				[
					30,
					8
				],
				[
					23,
					15
				],
				[
					19,
					17
				],
				[
					31,
					3
				],
				[
					21,
					12
				],
				[
					22,
					-11
				],
				[
					14,
					-18
				],
				[
					19,
					-18
				],
				[
					31,
					2
				],
				[
					19,
					-15
				],
				[
					33,
					-14
				],
				[
					35,
					-6
				],
				[
					29,
					4
				],
				[
					21,
					19
				],
				[
					19,
					18
				],
				[
					25,
					4
				],
				[
					25,
					-8
				],
				[
					29,
					-5
				],
				[
					26,
					9
				],
				[
					25,
					0
				],
				[
					24,
					-6
				],
				[
					26,
					-6
				],
				[
					25,
					10
				],
				[
					30,
					9
				],
				[
					28,
					3
				],
				[
					32,
					0
				],
				[
					25,
					5
				],
				[
					25,
					5
				],
				[
					8,
					28
				],
				[
					1,
					24
				],
				[
					18,
					-16
				],
				[
					4,
					-26
				],
				[
					10,
					-24
				],
				[
					11,
					-19
				],
				[
					23,
					-10
				],
				[
					32,
					3
				],
				[
					36,
					2
				],
				[
					25,
					3
				],
				[
					37,
					0
				],
				[
					26,
					1
				],
				[
					36,
					-2
				],
				[
					32,
					-5
				],
				[
					19,
					-18
				],
				[
					-5,
					-21
				],
				[
					18,
					-17
				],
				[
					30,
					-14
				],
				[
					31,
					-14
				],
				[
					35,
					-10
				],
				[
					38,
					-10
				],
				[
					28,
					-9
				],
				[
					32,
					-1
				],
				[
					18,
					20
				],
				[
					24,
					-16
				],
				[
					21,
					-18
				],
				[
					25,
					-14
				],
				[
					34,
					-6
				],
				[
					32,
					-6
				],
				[
					13,
					-23
				],
				[
					32,
					-13
				],
				[
					21,
					-21
				],
				[
					31,
					-9
				],
				[
					32,
					1
				],
				[
					30,
					-3
				],
				[
					33,
					1
				],
				[
					34,
					-4
				],
				[
					31,
					-8
				],
				[
					28,
					-14
				],
				[
					29,
					-11
				],
				[
					20,
					-17
				],
				[
					-3,
					-23
				],
				[
					-15,
					-20
				],
				[
					-13,
					-26
				],
				[
					-9,
					-20
				],
				[
					-14,
					-24
				],
				[
					-36,
					-9
				],
				[
					-16,
					-20
				],
				[
					-36,
					-13
				],
				[
					-13,
					-22
				],
				[
					-19,
					-22
				],
				[
					-20,
					-18
				],
				[
					-11,
					-23
				],
				[
					-7,
					-22
				],
				[
					-3,
					-26
				],
				[
					0,
					-21
				],
				[
					16,
					-23
				],
				[
					6,
					-21
				],
				[
					13,
					-21
				],
				[
					52,
					-7
				],
				[
					11,
					-25
				],
				[
					-50,
					-9
				],
				[
					-43,
					-13
				],
				[
					-52,
					-2
				],
				[
					-24,
					-33
				],
				[
					-5,
					-27
				],
				[
					-12,
					-21
				],
				[
					-14,
					-22
				],
				[
					37,
					-19
				],
				[
					14,
					-23
				],
				[
					24,
					-22
				],
				[
					33,
					-19
				],
				[
					39,
					-18
				],
				[
					42,
					-18
				],
				[
					64,
					-18
				],
				[
					14,
					-28
				],
				[
					80,
					-13
				],
				[
					5,
					-4
				],
				[
					21,
					-17
				],
				[
					77,
					14
				],
				[
					63,
					-18
				],
				[
					-9951,
					-14
				]
			],
			[
				[
					6914,
					2382
				],
				[
					18,
					-18
				],
				[
					26,
					-7
				],
				[
					1,
					-11
				],
				[
					-7,
					-26
				],
				[
					-43,
					-4
				],
				[
					-1,
					31
				],
				[
					4,
					24
				],
				[
					2,
					11
				]
			],
			[
				[
					9038,
					2834
				],
				[
					27,
					-20
				],
				[
					15,
					8
				],
				[
					22,
					11
				],
				[
					16,
					-4
				],
				[
					2,
					-69
				],
				[
					-9,
					-19
				],
				[
					-3,
					-47
				],
				[
					-10,
					16
				],
				[
					-19,
					-40
				],
				[
					-6,
					3
				],
				[
					-17,
					2
				],
				[
					-17,
					49
				],
				[
					-4,
					38
				],
				[
					-16,
					50
				],
				[
					1,
					27
				],
				[
					18,
					-5
				]
			],
			[
				[
					8987,
					4390
				],
				[
					10,
					-45
				],
				[
					18,
					21
				],
				[
					9,
					-24
				],
				[
					13,
					-22
				],
				[
					-3,
					-26
				],
				[
					6,
					-49
				],
				[
					5,
					-29
				],
				[
					7,
					-7
				],
				[
					7,
					-49
				],
				[
					-3,
					-30
				],
				[
					9,
					-39
				],
				[
					31,
					-30
				],
				[
					19,
					-28
				],
				[
					19,
					-25
				],
				[
					-4,
					-14
				],
				[
					16,
					-36
				],
				[
					11,
					-62
				],
				[
					11,
					13
				],
				[
					11,
					-25
				],
				[
					7,
					8
				],
				[
					5,
					-61
				],
				[
					19,
					-35
				],
				[
					13,
					-22
				],
				[
					22,
					-47
				],
				[
					8,
					-46
				],
				[
					1,
					-33
				],
				[
					-2,
					-35
				],
				[
					13,
					-49
				],
				[
					-2,
					-51
				],
				[
					-5,
					-27
				],
				[
					-7,
					-51
				],
				[
					1,
					-33
				],
				[
					-6,
					-41
				],
				[
					-12,
					-53
				],
				[
					-21,
					-28
				],
				[
					-10,
					-45
				],
				[
					-9,
					-28
				],
				[
					-8,
					-50
				],
				[
					-11,
					-29
				],
				[
					-7,
					-43
				],
				[
					-4,
					-39
				],
				[
					2,
					-19
				],
				[
					-16,
					-20
				],
				[
					-31,
					-2
				],
				[
					-26,
					-23
				],
				[
					-13,
					-23
				],
				[
					-17,
					-24
				],
				[
					-23,
					25
				],
				[
					-17,
					10
				],
				[
					5,
					30
				],
				[
					-15,
					-11
				],
				[
					-25,
					-41
				],
				[
					-24,
					15
				],
				[
					-15,
					9
				],
				[
					-16,
					5
				],
				[
					-27,
					16
				],
				[
					-18,
					36
				],
				[
					-5,
					43
				],
				[
					-7,
					30
				],
				[
					-13,
					23
				],
				[
					-27,
					7
				],
				[
					9,
					28
				],
				[
					-7,
					42
				],
				[
					-13,
					-39
				],
				[
					-25,
					-11
				],
				[
					14,
					32
				],
				[
					5,
					33
				],
				[
					10,
					28
				],
				[
					-2,
					43
				],
				[
					-22,
					-49
				],
				[
					-18,
					-20
				],
				[
					-10,
					-46
				],
				[
					-22,
					24
				],
				[
					1,
					31
				],
				[
					-18,
					41
				],
				[
					-14,
					22
				],
				[
					5,
					13
				],
				[
					-36,
					35
				],
				[
					-19,
					2
				],
				[
					-27,
					28
				],
				[
					-50,
					-6
				],
				[
					-36,
					-20
				],
				[
					-31,
					-19
				],
				[
					-27,
					3
				],
				[
					-29,
					-29
				],
				[
					-24,
					-13
				],
				[
					-6,
					-31
				],
				[
					-10,
					-23
				],
				[
					-23,
					-1
				],
				[
					-18,
					-6
				],
				[
					-24,
					11
				],
				[
					-20,
					-6
				],
				[
					-19,
					-3
				],
				[
					-17,
					-31
				],
				[
					-8,
					3
				],
				[
					-14,
					-16
				],
				[
					-13,
					-19
				],
				[
					-21,
					3
				],
				[
					-18,
					0
				],
				[
					-30,
					36
				],
				[
					-15,
					11
				],
				[
					1,
					33
				],
				[
					14,
					8
				],
				[
					4,
					13
				],
				[
					-1,
					21
				],
				[
					4,
					40
				],
				[
					-3,
					34
				],
				[
					-15,
					58
				],
				[
					-4,
					33
				],
				[
					1,
					33
				],
				[
					-11,
					37
				],
				[
					-1,
					17
				],
				[
					-12,
					23
				],
				[
					-4,
					45
				],
				[
					-16,
					46
				],
				[
					-4,
					25
				],
				[
					13,
					-25
				],
				[
					-10,
					53
				],
				[
					14,
					-17
				],
				[
					8,
					-22
				],
				[
					0,
					30
				],
				[
					-14,
					45
				],
				[
					-3,
					18
				],
				[
					-6,
					17
				],
				[
					3,
					34
				],
				[
					6,
					14
				],
				[
					4,
					29
				],
				[
					-3,
					33
				],
				[
					11,
					42
				],
				[
					2,
					-44
				],
				[
					12,
					39
				],
				[
					22,
					20
				],
				[
					14,
					24
				],
				[
					21,
					21
				],
				[
					13,
					5
				],
				[
					7,
					-7
				],
				[
					22,
					21
				],
				[
					17,
					7
				],
				[
					4,
					12
				],
				[
					8,
					6
				],
				[
					15,
					-2
				],
				[
					29,
					17
				],
				[
					15,
					26
				],
				[
					7,
					30
				],
				[
					17,
					30
				],
				[
					1,
					23
				],
				[
					1,
					31
				],
				[
					19,
					49
				],
				[
					12,
					-50
				],
				[
					12,
					12
				],
				[
					-10,
					27
				],
				[
					9,
					28
				],
				[
					12,
					-13
				],
				[
					3,
					44
				],
				[
					15,
					28
				],
				[
					7,
					23
				],
				[
					14,
					10
				],
				[
					0,
					16
				],
				[
					13,
					-7
				],
				[
					0,
					15
				],
				[
					12,
					8
				],
				[
					14,
					8
				],
				[
					20,
					-27
				],
				[
					16,
					-34
				],
				[
					17,
					0
				],
				[
					18,
					-6
				],
				[
					-6,
					32
				],
				[
					13,
					46
				],
				[
					13,
					15
				],
				[
					-5,
					15
				],
				[
					12,
					33
				],
				[
					17,
					20
				],
				[
					14,
					-7
				],
				[
					24,
					11
				],
				[
					-1,
					29
				],
				[
					-20,
					19
				],
				[
					15,
					9
				],
				[
					18,
					-15
				],
				[
					15,
					-23
				],
				[
					23,
					-15
				],
				[
					8,
					6
				],
				[
					17,
					-18
				],
				[
					17,
					17
				],
				[
					10,
					-5
				],
				[
					7,
					11
				],
				[
					12,
					-29
				],
				[
					-7,
					-31
				],
				[
					-11,
					-23
				],
				[
					-9,
					-2
				],
				[
					3,
					-23
				],
				[
					-8,
					-29
				],
				[
					-10,
					-28
				],
				[
					2,
					-16
				],
				[
					22,
					-32
				],
				[
					21,
					-18
				],
				[
					15,
					-20
				],
				[
					20,
					-34
				],
				[
					8,
					0
				],
				[
					14,
					-15
				],
				[
					4,
					-18
				],
				[
					27,
					-19
				],
				[
					18,
					19
				],
				[
					6,
					31
				],
				[
					5,
					26
				],
				[
					4,
					31
				],
				[
					8,
					46
				],
				[
					-4,
					28
				],
				[
					2,
					17
				],
				[
					-3,
					33
				],
				[
					4,
					43
				],
				[
					5,
					12
				],
				[
					-4,
					19
				],
				[
					7,
					31
				],
				[
					5,
					31
				],
				[
					1,
					17
				],
				[
					10,
					21
				],
				[
					8,
					-28
				],
				[
					2,
					-36
				],
				[
					7,
					-7
				],
				[
					1,
					-24
				],
				[
					10,
					-30
				],
				[
					2,
					-32
				],
				[
					-1,
					-21
				]
			],
			[
				[
					5471,
					7954
				],
				[
					-2,
					-24
				],
				[
					-16,
					0
				],
				[
					6,
					-13
				],
				[
					-9,
					-37
				]
			],
			[
				[
					5450,
					7880
				],
				[
					-6,
					-9
				],
				[
					-24,
					-2
				],
				[
					-14,
					-13
				],
				[
					-23,
					5
				]
			],
			[
				[
					5383,
					7861
				],
				[
					-40,
					14
				],
				[
					-6,
					21
				],
				[
					-27,
					-10
				],
				[
					-4,
					-11
				],
				[
					-16,
					8
				]
			],
			[
				[
					5290,
					7883
				],
				[
					-15,
					1
				],
				[
					-12,
					11
				],
				[
					4,
					14
				],
				[
					-1,
					10
				]
			],
			[
				[
					5266,
					7919
				],
				[
					8,
					3
				],
				[
					14,
					-16
				],
				[
					4,
					15
				],
				[
					25,
					-2
				],
				[
					20,
					10
				],
				[
					13,
					-1
				],
				[
					9,
					-12
				],
				[
					2,
					10
				],
				[
					-4,
					37
				],
				[
					10,
					7
				],
				[
					10,
					27
				]
			],
			[
				[
					5377,
					7997
				],
				[
					21,
					-19
				],
				[
					15,
					24
				],
				[
					10,
					4
				],
				[
					22,
					-17
				],
				[
					13,
					3
				],
				[
					13,
					-11
				]
			],
			[
				[
					5471,
					7981
				],
				[
					-3,
					-7
				],
				[
					3,
					-20
				]
			],
			[
				[
					6281,
					7413
				],
				[
					-19,
					8
				],
				[
					-14,
					27
				],
				[
					-4,
					21
				]
			],
			[
				[
					6332,
					7567
				],
				[
					17,
					23
				],
				[
					15,
					-30
				],
				[
					14,
					-41
				],
				[
					13,
					-3
				],
				[
					8,
					-15
				],
				[
					-23,
					-5
				],
				[
					-5,
					-45
				],
				[
					-4,
					-20
				],
				[
					-11,
					-13
				],
				[
					1,
					-29
				]
			],
			[
				[
					6357,
					7389
				],
				[
					-7,
					-3
				],
				[
					-17,
					30
				],
				[
					10,
					29
				],
				[
					-9,
					17
				],
				[
					-10,
					-5
				],
				[
					-33,
					-42
				]
			],
			[
				[
					6249,
					7558
				],
				[
					6,
					9
				],
				[
					21,
					-16
				],
				[
					15,
					-4
				],
				[
					4,
					7
				],
				[
					-14,
					31
				],
				[
					7,
					8
				]
			],
			[
				[
					6288,
					7593
				],
				[
					8,
					-2
				],
				[
					19,
					-35
				],
				[
					13,
					-4
				],
				[
					4,
					15
				]
			],
			[
				[
					5814,
					4923
				],
				[
					-1,
					70
				],
				[
					-7,
					26
				]
			],
			[
				[
					5806,
					5019
				],
				[
					17,
					-5
				],
				[
					8,
					33
				],
				[
					15,
					-4
				]
			],
			[
				[
					5846,
					5043
				],
				[
					1,
					-22
				],
				[
					6,
					-13
				]
			],
			[
				[
					5853,
					5008
				],
				[
					1,
					-19
				],
				[
					-7,
					-12
				],
				[
					-11,
					-30
				],
				[
					-10,
					-21
				],
				[
					-12,
					-3
				]
			],
			[
				[
					5092,
					8139
				],
				[
					20,
					-4
				],
				[
					26,
					12
				],
				[
					17,
					-26
				],
				[
					16,
					-13
				]
			],
			[
				[
					5171,
					8108
				],
				[
					-4,
					-39
				]
			],
			[
				[
					5167,
					8069
				],
				[
					-7,
					-2
				],
				[
					-3,
					-32
				]
			],
			[
				[
					5157,
					8035
				],
				[
					-24,
					26
				],
				[
					-14,
					-5
				],
				[
					-20,
					27
				],
				[
					-13,
					24
				],
				[
					-13,
					1
				],
				[
					-4,
					20
				]
			],
			[
				[
					5069,
					8128
				],
				[
					23,
					11
				]
			],
			[
				[
					5074,
					5543
				],
				[
					-23,
					-7
				]
			],
			[
				[
					5051,
					5536
				],
				[
					-7,
					40
				],
				[
					2,
					132
				],
				[
					-6,
					12
				],
				[
					-1,
					28
				],
				[
					-10,
					20
				],
				[
					-8,
					17
				],
				[
					3,
					31
				]
			],
			[
				[
					5024,
					5816
				],
				[
					10,
					6
				],
				[
					6,
					25
				],
				[
					13,
					6
				],
				[
					6,
					17
				]
			],
			[
				[
					5059,
					5870
				],
				[
					10,
					17
				],
				[
					10,
					0
				],
				[
					21,
					-33
				]
			],
			[
				[
					5100,
					5854
				],
				[
					-1,
					-19
				],
				[
					6,
					-34
				],
				[
					-6,
					-24
				],
				[
					3,
					-15
				],
				[
					-13,
					-36
				],
				[
					-9,
					-17
				],
				[
					-5,
					-37
				],
				[
					1,
					-36
				],
				[
					-2,
					-93
				]
			],
			[
				[
					4921,
					5738
				],
				[
					-19,
					15
				],
				[
					-13,
					-3
				],
				[
					-10,
					-14
				],
				[
					-12,
					12
				],
				[
					-5,
					19
				],
				[
					-13,
					13
				]
			],
			[
				[
					4849,
					5780
				],
				[
					-1,
					33
				],
				[
					7,
					24
				],
				[
					-1,
					20
				],
				[
					23,
					48
				],
				[
					4,
					39
				],
				[
					7,
					14
				],
				[
					14,
					-8
				],
				[
					11,
					12
				],
				[
					4,
					15
				],
				[
					22,
					26
				],
				[
					5,
					18
				],
				[
					26,
					24
				],
				[
					15,
					8
				],
				[
					7,
					-11
				],
				[
					18,
					0
				]
			],
			[
				[
					5010,
					6042
				],
				[
					-2,
					-28
				],
				[
					3,
					-26
				],
				[
					16,
					-38
				],
				[
					1,
					-27
				],
				[
					32,
					-14
				],
				[
					-1,
					-39
				]
			],
			[
				[
					5024,
					5816
				],
				[
					-24,
					1
				]
			],
			[
				[
					5000,
					5817
				],
				[
					-13,
					5
				],
				[
					-9,
					-10
				],
				[
					-12,
					4
				],
				[
					-48,
					-2
				],
				[
					-1,
					-33
				],
				[
					4,
					-43
				]
			],
			[
				[
					7573,
					6452
				],
				[
					0,
					-42
				],
				[
					-10,
					9
				],
				[
					2,
					-46
				]
			],
			[
				[
					7565,
					6373
				],
				[
					-8,
					30
				],
				[
					-1,
					29
				],
				[
					-6,
					28
				],
				[
					-11,
					33
				],
				[
					-26,
					3
				],
				[
					3,
					-24
				],
				[
					-9,
					-32
				],
				[
					-12,
					12
				],
				[
					-4,
					-11
				],
				[
					-8,
					6
				],
				[
					-11,
					6
				]
			],
			[
				[
					7472,
					6453
				],
				[
					-4,
					47
				],
				[
					-10,
					43
				],
				[
					5,
					35
				],
				[
					-17,
					15
				],
				[
					6,
					21
				],
				[
					18,
					22
				],
				[
					-20,
					30
				],
				[
					9,
					39
				],
				[
					22,
					-25
				],
				[
					14,
					-2
				],
				[
					2,
					-40
				],
				[
					26,
					-8
				],
				[
					26,
					1
				],
				[
					16,
					-10
				],
				[
					-13,
					-49
				],
				[
					-12,
					-3
				],
				[
					-9,
					-33
				],
				[
					16,
					-30
				],
				[
					4,
					37
				],
				[
					8,
					0
				],
				[
					14,
					-91
				]
			],
			[
				[
					5629,
					7730
				],
				[
					8,
					-24
				],
				[
					11,
					4
				],
				[
					21,
					-9
				],
				[
					41,
					-3
				],
				[
					13,
					15
				],
				[
					33,
					13
				],
				[
					20,
					-21
				],
				[
					17,
					-6
				]
			],
			[
				[
					5793,
					7699
				],
				[
					-15,
					-24
				],
				[
					-10,
					-41
				],
				[
					9,
					-33
				]
			],
			[
				[
					5777,
					7601
				],
				[
					-24,
					8
				],
				[
					-28,
					-18
				]
			],
			[
				[
					5725,
					7591
				],
				[
					0,
					-29
				],
				[
					-26,
					-5
				],
				[
					-19,
					20
				],
				[
					-22,
					-16
				],
				[
					-21,
					2
				]
			],
			[
				[
					5637,
					7563
				],
				[
					-2,
					38
				],
				[
					-14,
					18
				]
			],
			[
				[
					5621,
					7619
				],
				[
					5,
					9
				],
				[
					-3,
					6
				],
				[
					4,
					19
				],
				[
					11,
					18
				],
				[
					-14,
					25
				],
				[
					-2,
					21
				],
				[
					7,
					13
				]
			],
			[
				[
					2846,
					6551
				],
				[
					-7,
					-3
				],
				[
					-7,
					33
				],
				[
					-10,
					17
				],
				[
					6,
					36
				],
				[
					8,
					-2
				],
				[
					10,
					-48
				],
				[
					0,
					-33
				]
			],
			[
				[
					2838,
					6713
				],
				[
					-30,
					-9
				],
				[
					-2,
					21
				],
				[
					13,
					5
				],
				[
					18,
					-2
				],
				[
					1,
					-15
				]
			],
			[
				[
					2861,
					6714
				],
				[
					-5,
					-41
				],
				[
					-5,
					7
				],
				[
					0,
					30
				],
				[
					-12,
					23
				],
				[
					0,
					7
				],
				[
					22,
					-26
				]
			],
			[
				[
					5527,
					7766
				],
				[
					10,
					0
				],
				[
					-7,
					-26
				],
				[
					14,
					-22
				],
				[
					-4,
					-27
				],
				[
					-7,
					-2
				]
			],
			[
				[
					5533,
					7689
				],
				[
					-5,
					-6
				],
				[
					-9,
					-13
				],
				[
					-4,
					-32
				]
			],
			[
				[
					5515,
					7638
				],
				[
					-25,
					22
				],
				[
					-10,
					24
				],
				[
					-11,
					13
				],
				[
					-12,
					21
				],
				[
					-6,
					18
				],
				[
					-14,
					27
				],
				[
					6,
					24
				],
				[
					10,
					-13
				],
				[
					6,
					12
				],
				[
					13,
					1
				],
				[
					24,
					-9
				],
				[
					19,
					0
				],
				[
					12,
					-12
				]
			],
			[
				[
					5652,
					8287
				],
				[
					27,
					0
				],
				[
					30,
					21
				],
				[
					6,
					33
				],
				[
					23,
					18
				],
				[
					-3,
					26
				]
			],
			[
				[
					5735,
					8385
				],
				[
					17,
					10
				],
				[
					30,
					22
				]
			],
			[
				[
					5782,
					8417
				],
				[
					29,
					-15
				],
				[
					4,
					-14
				],
				[
					15,
					7
				],
				[
					27,
					-14
				],
				[
					3,
					-27
				],
				[
					-6,
					-15
				],
				[
					17,
					-38
				],
				[
					12,
					-11
				],
				[
					-2,
					-10
				],
				[
					19,
					-10
				],
				[
					8,
					-15
				],
				[
					-11,
					-13
				],
				[
					-23,
					2
				],
				[
					-5,
					-5
				],
				[
					7,
					-19
				],
				[
					6,
					-37
				]
			],
			[
				[
					5882,
					8183
				],
				[
					-23,
					-4
				],
				[
					-9,
					-12
				],
				[
					-2,
					-29
				],
				[
					-11,
					5
				],
				[
					-25,
					-3
				],
				[
					-7,
					14
				],
				[
					-11,
					-10
				],
				[
					-10,
					8
				],
				[
					-22,
					1
				],
				[
					-31,
					14
				],
				[
					-28,
					5
				],
				[
					-22,
					-2
				],
				[
					-15,
					-15
				],
				[
					-13,
					-2
				]
			],
			[
				[
					5653,
					8153
				],
				[
					-1,
					25
				],
				[
					-8,
					27
				],
				[
					17,
					12
				],
				[
					0,
					23
				],
				[
					-8,
					21
				],
				[
					-1,
					26
				]
			],
			[
				[
					2524,
					6208
				],
				[
					-1,
					8
				],
				[
					4,
					3
				],
				[
					5,
					-7
				],
				[
					10,
					35
				],
				[
					5,
					1
				]
			],
			[
				[
					2547,
					6248
				],
				[
					0,
					-9
				],
				[
					5,
					0
				],
				[
					0,
					-16
				],
				[
					-5,
					-25
				],
				[
					3,
					-8
				],
				[
					-3,
					-21
				],
				[
					2,
					-6
				],
				[
					-4,
					-29
				],
				[
					-5,
					-15
				],
				[
					-5,
					-2
				],
				[
					-6,
					-20
				]
			],
			[
				[
					2529,
					6097
				],
				[
					-8,
					0
				],
				[
					2,
					65
				],
				[
					1,
					46
				]
			],
			[
				[
					3136,
					3873
				],
				[
					-20,
					-8
				],
				[
					-11,
					80
				],
				[
					-15,
					64
				],
				[
					9,
					56
				],
				[
					-15,
					24
				],
				[
					-4,
					42
				],
				[
					-13,
					39
				]
			],
			[
				[
					3067,
					4170
				],
				[
					17,
					62
				],
				[
					-12,
					49
				],
				[
					7,
					19
				],
				[
					-5,
					21
				],
				[
					10,
					29
				],
				[
					1,
					49
				],
				[
					1,
					41
				],
				[
					6,
					19
				],
				[
					-24,
					93
				]
			],
			[
				[
					3068,
					4552
				],
				[
					21,
					-5
				],
				[
					14,
					1
				],
				[
					6,
					18
				],
				[
					25,
					23
				],
				[
					14,
					22
				],
				[
					37,
					9
				],
				[
					-3,
					-43
				],
				[
					3,
					-22
				],
				[
					-2,
					-39
				],
				[
					30,
					-51
				],
				[
					31,
					-10
				],
				[
					11,
					-21
				],
				[
					19,
					-12
				],
				[
					11,
					-16
				],
				[
					18,
					0
				],
				[
					16,
					-17
				],
				[
					1,
					-33
				],
				[
					6,
					-17
				],
				[
					0,
					-25
				],
				[
					-8,
					-1
				],
				[
					11,
					-67
				],
				[
					53,
					-2
				],
				[
					-4,
					-33
				],
				[
					3,
					-23
				],
				[
					15,
					-16
				],
				[
					6,
					-36
				],
				[
					-4,
					-45
				],
				[
					-8,
					-26
				],
				[
					3,
					-32
				],
				[
					-9,
					-12
				]
			],
			[
				[
					3384,
					4021
				],
				[
					-1,
					17
				],
				[
					-25,
					30
				],
				[
					-26,
					1
				],
				[
					-49,
					-17
				],
				[
					-13,
					-51
				],
				[
					-1,
					-31
				],
				[
					-11,
					-69
				]
			],
			[
				[
					3482,
					3700
				],
				[
					6,
					34
				],
				[
					4,
					34
				],
				[
					0,
					31
				],
				[
					-10,
					11
				],
				[
					-11,
					-10
				],
				[
					-10,
					3
				],
				[
					-3,
					22
				],
				[
					-3,
					53
				],
				[
					-5,
					17
				],
				[
					-19,
					16
				],
				[
					-11,
					-12
				],
				[
					-30,
					11
				],
				[
					2,
					79
				],
				[
					-8,
					32
				]
			],
			[
				[
					3068,
					4552
				],
				[
					-15,
					-10
				],
				[
					-13,
					7
				],
				[
					2,
					87
				],
				[
					-23,
					-34
				],
				[
					-24,
					2
				],
				[
					-11,
					30
				],
				[
					-18,
					4
				],
				[
					6,
					24
				],
				[
					-16,
					35
				],
				[
					-11,
					52
				],
				[
					7,
					11
				],
				[
					0,
					24
				],
				[
					17,
					17
				],
				[
					-3,
					31
				],
				[
					7,
					20
				],
				[
					2,
					27
				],
				[
					32,
					39
				],
				[
					22,
					11
				],
				[
					4,
					9
				],
				[
					25,
					-3
				]
			],
			[
				[
					3058,
					4935
				],
				[
					13,
					158
				],
				[
					0,
					25
				],
				[
					-4,
					33
				],
				[
					-12,
					21
				],
				[
					0,
					42
				],
				[
					15,
					9
				],
				[
					6,
					-6
				],
				[
					1,
					22
				],
				[
					-16,
					6
				],
				[
					-1,
					36
				],
				[
					54,
					-1
				],
				[
					10,
					20
				],
				[
					7,
					-18
				],
				[
					6,
					-34
				],
				[
					5,
					7
				]
			],
			[
				[
					3142,
					5255
				],
				[
					15,
					-31
				],
				[
					22,
					4
				],
				[
					5,
					18
				],
				[
					21,
					13
				],
				[
					11,
					9
				],
				[
					4,
					25
				],
				[
					19,
					16
				],
				[
					-1,
					12
				],
				[
					-24,
					5
				],
				[
					-3,
					37
				],
				[
					1,
					38
				],
				[
					-13,
					15
				],
				[
					5,
					5
				],
				[
					21,
					-7
				],
				[
					22,
					-14
				],
				[
					8,
					13
				],
				[
					20,
					9
				],
				[
					31,
					22
				],
				[
					10,
					22
				],
				[
					-3,
					16
				]
			],
			[
				[
					3313,
					5482
				],
				[
					14,
					2
				],
				[
					7,
					-13
				],
				[
					-4,
					-25
				],
				[
					9,
					-9
				],
				[
					7,
					-27
				],
				[
					-8,
					-20
				],
				[
					-4,
					-49
				],
				[
					7,
					-29
				],
				[
					2,
					-27
				],
				[
					17,
					-27
				],
				[
					14,
					-3
				],
				[
					3,
					12
				],
				[
					8,
					2
				],
				[
					13,
					10
				],
				[
					9,
					16
				],
				[
					15,
					-5
				],
				[
					7,
					2
				]
			],
			[
				[
					3429,
					5292
				],
				[
					15,
					-5
				],
				[
					3,
					12
				],
				[
					-5,
					11
				],
				[
					3,
					17
				],
				[
					11,
					-5
				],
				[
					13,
					6
				],
				[
					16,
					-12
				]
			],
			[
				[
					3485,
					5316
				],
				[
					12,
					-12
				],
				[
					9,
					15
				],
				[
					6,
					-2
				],
				[
					4,
					-16
				],
				[
					13,
					4
				],
				[
					11,
					22
				],
				[
					8,
					42
				],
				[
					17,
					53
				]
			],
			[
				[
					3565,
					5422
				],
				[
					9,
					3
				],
				[
					7,
					-32
				],
				[
					16,
					-101
				],
				[
					14,
					-10
				],
				[
					1,
					-39
				],
				[
					-21,
					-48
				],
				[
					9,
					-17
				],
				[
					49,
					-9
				],
				[
					1,
					-58
				],
				[
					21,
					38
				],
				[
					35,
					-21
				],
				[
					46,
					-35
				],
				[
					14,
					-34
				],
				[
					-5,
					-32
				],
				[
					33,
					18
				],
				[
					54,
					-30
				],
				[
					41,
					2
				],
				[
					41,
					-48
				],
				[
					36,
					-64
				],
				[
					21,
					-17
				],
				[
					24,
					-2
				],
				[
					10,
					-18
				],
				[
					9,
					-74
				],
				[
					5,
					-34
				],
				[
					-11,
					-96
				],
				[
					-14,
					-37
				],
				[
					-39,
					-80
				],
				[
					-18,
					-65
				],
				[
					-21,
					-50
				],
				[
					-7,
					-1
				],
				[
					-7,
					-43
				],
				[
					2,
					-108
				],
				[
					-8,
					-88
				],
				[
					-3,
					-38
				],
				[
					-9,
					-23
				],
				[
					-5,
					-77
				],
				[
					-28,
					-75
				],
				[
					-5,
					-60
				],
				[
					-22,
					-25
				],
				[
					-7,
					-34
				],
				[
					-30,
					0
				],
				[
					-44,
					-22
				],
				[
					-19,
					-26
				],
				[
					-31,
					-17
				],
				[
					-33,
					-45
				],
				[
					-23,
					-58
				],
				[
					-4,
					-43
				],
				[
					4,
					-31
				],
				[
					-5,
					-59
				],
				[
					-6,
					-28
				],
				[
					-20,
					-31
				],
				[
					-31,
					-102
				],
				[
					-24,
					-45
				],
				[
					-19,
					-27
				],
				[
					-13,
					-55
				],
				[
					-18,
					-33
				]
			],
			[
				[
					3517,
					3238
				],
				[
					-8,
					33
				],
				[
					13,
					27
				],
				[
					-16,
					39
				],
				[
					-22,
					32
				],
				[
					-29,
					37
				],
				[
					-10,
					-2
				],
				[
					-28,
					45
				],
				[
					-18,
					-6
				]
			],
			[
				[
					8172,
					5443
				],
				[
					11,
					22
				],
				[
					23,
					31
				]
			],
			[
				[
					8206,
					5496
				],
				[
					-1,
					-28
				],
				[
					-2,
					-37
				],
				[
					-13,
					2
				],
				[
					-6,
					-20
				],
				[
					-12,
					30
				]
			],
			[
				[
					7546,
					6782
				],
				[
					12,
					-19
				],
				[
					-2,
					-35
				],
				[
					-23,
					-2
				],
				[
					-23,
					4
				],
				[
					-18,
					-9
				],
				[
					-25,
					22
				],
				[
					-1,
					11
				]
			],
			[
				[
					7466,
					6754
				],
				[
					19,
					43
				],
				[
					15,
					15
				],
				[
					20,
					-13
				],
				[
					14,
					-2
				],
				[
					12,
					-15
				]
			],
			[
				[
					5817,
					3910
				],
				[
					-39,
					-42
				],
				[
					-25,
					-43
				],
				[
					-10,
					-38
				],
				[
					-8,
					-22
				],
				[
					-15,
					-5
				],
				[
					-5,
					-27
				],
				[
					-3,
					-18
				],
				[
					-17,
					-14
				],
				[
					-23,
					3
				],
				[
					-13,
					16
				],
				[
					-12,
					7
				],
				[
					-14,
					-13
				],
				[
					-6,
					-28
				],
				[
					-14,
					-17
				],
				[
					-13,
					-26
				],
				[
					-20,
					-5
				],
				[
					-6,
					20
				],
				[
					2,
					35
				],
				[
					-16,
					55
				],
				[
					-8,
					8
				]
			],
			[
				[
					5552,
					3756
				],
				[
					0,
					168
				],
				[
					27,
					2
				],
				[
					1,
					205
				],
				[
					21,
					2
				],
				[
					43,
					21
				],
				[
					10,
					-24
				],
				[
					18,
					22
				],
				[
					9,
					0
				],
				[
					15,
					13
				]
			],
			[
				[
					5696,
					4165
				],
				[
					5,
					-4
				]
			],
			[
				[
					5701,
					4161
				],
				[
					11,
					-46
				],
				[
					5,
					-10
				],
				[
					9,
					-33
				],
				[
					32,
					-64
				],
				[
					12,
					-6
				],
				[
					0,
					-20
				],
				[
					8,
					-37
				],
				[
					21,
					-9
				],
				[
					18,
					-26
				]
			],
			[
				[
					5424,
					5610
				],
				[
					23,
					4
				],
				[
					5,
					15
				],
				[
					5,
					-1
				],
				[
					7,
					-13
				],
				[
					34,
					22
				],
				[
					12,
					22
				],
				[
					15,
					20
				],
				[
					-3,
					21
				],
				[
					8,
					5
				],
				[
					27,
					-4
				],
				[
					26,
					27
				],
				[
					20,
					63
				],
				[
					14,
					23
				],
				[
					18,
					10
				]
			],
			[
				[
					5635,
					5824
				],
				[
					3,
					-25
				],
				[
					16,
					-36
				],
				[
					0,
					-23
				],
				[
					-5,
					-24
				],
				[
					2,
					-18
				],
				[
					10,
					-16
				]
			],
			[
				[
					5661,
					5682
				],
				[
					21,
					-26
				]
			],
			[
				[
					5682,
					5656
				],
				[
					15,
					-23
				],
				[
					0,
					-19
				],
				[
					19,
					-30
				],
				[
					12,
					-25
				],
				[
					7,
					-34
				],
				[
					20,
					-23
				],
				[
					5,
					-18
				]
			],
			[
				[
					5760,
					5484
				],
				[
					-9,
					-6
				],
				[
					-18,
					1
				],
				[
					-21,
					6
				],
				[
					-10,
					-5
				],
				[
					-5,
					-14
				],
				[
					-9,
					-2
				],
				[
					-10,
					13
				],
				[
					-31,
					-29
				],
				[
					-13,
					6
				],
				[
					-4,
					-5
				],
				[
					-8,
					-35
				],
				[
					-21,
					12
				],
				[
					-20,
					5
				],
				[
					-18,
					22
				],
				[
					-23,
					19
				],
				[
					-15,
					-18
				],
				[
					-10,
					-30
				],
				[
					-3,
					-40
				]
			],
			[
				[
					5512,
					5384
				],
				[
					-18,
					3
				],
				[
					-19,
					10
				],
				[
					-16,
					-30
				],
				[
					-15,
					-54
				]
			],
			[
				[
					5444,
					5313
				],
				[
					-3,
					17
				],
				[
					-1,
					26
				],
				[
					-13,
					19
				],
				[
					-10,
					29
				],
				[
					-2,
					21
				],
				[
					-13,
					30
				],
				[
					2,
					17
				],
				[
					-3,
					24
				],
				[
					2,
					45
				],
				[
					7,
					10
				],
				[
					14,
					59
				]
			],
			[
				[
					3231,
					7863
				],
				[
					20,
					-8
				],
				[
					26,
					2
				],
				[
					-14,
					-24
				],
				[
					-10,
					-4
				],
				[
					-35,
					25
				],
				[
					-7,
					19
				],
				[
					10,
					18
				],
				[
					10,
					-28
				]
			],
			[
				[
					3283,
					8010
				],
				[
					-14,
					-1
				],
				[
					-36,
					18
				],
				[
					-26,
					27
				],
				[
					10,
					5
				],
				[
					37,
					-14
				],
				[
					28,
					-24
				],
				[
					1,
					-11
				]
			],
			[
				[
					1569,
					7976
				],
				[
					-14,
					-8
				],
				[
					-46,
					26
				],
				[
					-8,
					20
				],
				[
					-25,
					21
				],
				[
					-5,
					16
				],
				[
					-28,
					10
				],
				[
					-11,
					32
				],
				[
					2,
					13
				],
				[
					30,
					-13
				],
				[
					17,
					-8
				],
				[
					26,
					-6
				],
				[
					9,
					-20
				],
				[
					14,
					-28
				],
				[
					28,
					-23
				],
				[
					11,
					-32
				]
			],
			[
				[
					3440,
					8101
				],
				[
					-18,
					-50
				],
				[
					18,
					19
				],
				[
					19,
					-12
				],
				[
					-10,
					-20
				],
				[
					25,
					-16
				],
				[
					12,
					14
				],
				[
					28,
					-18
				],
				[
					-8,
					-42
				],
				[
					19,
					10
				],
				[
					4,
					-30
				],
				[
					8,
					-36
				],
				[
					-11,
					-51
				],
				[
					-13,
					-2
				],
				[
					-18,
					11
				],
				[
					6,
					47
				],
				[
					-8,
					7
				],
				[
					-32,
					-50
				],
				[
					-17,
					2
				],
				[
					20,
					27
				],
				[
					-27,
					14
				],
				[
					-30,
					-3
				],
				[
					-54,
					2
				],
				[
					-4,
					17
				],
				[
					17,
					20
				],
				[
					-12,
					16
				],
				[
					24,
					34
				],
				[
					28,
					92
				],
				[
					18,
					33
				],
				[
					24,
					20
				],
				[
					13,
					-3
				],
				[
					-6,
					-16
				],
				[
					-15,
					-36
				]
			],
			[
				[
					1300,
					8302
				],
				[
					13,
					-8
				],
				[
					27,
					5
				],
				[
					-8,
					-66
				],
				[
					24,
					-46
				],
				[
					-11,
					0
				],
				[
					-17,
					27
				],
				[
					-10,
					26
				],
				[
					-14,
					18
				],
				[
					-5,
					25
				],
				[
					1,
					19
				]
			],
			[
				[
					2798,
					8762
				],
				[
					-11,
					-31
				],
				[
					-12,
					5
				],
				[
					-8,
					18
				],
				[
					2,
					4
				],
				[
					10,
					17
				],
				[
					12,
					-1
				],
				[
					7,
					-12
				]
			],
			[
				[
					2725,
					8794
				],
				[
					-33,
					-32
				],
				[
					-19,
					1
				],
				[
					-6,
					16
				],
				[
					20,
					26
				],
				[
					38,
					0
				],
				[
					0,
					-11
				]
			],
			[
				[
					2634,
					8963
				],
				[
					5,
					-25
				],
				[
					15,
					9
				],
				[
					16,
					-15
				],
				[
					30,
					-20
				],
				[
					32,
					-18
				],
				[
					2,
					-27
				],
				[
					21,
					4
				],
				[
					20,
					-19
				],
				[
					-25,
					-18
				],
				[
					-43,
					14
				],
				[
					-16,
					26
				],
				[
					-27,
					-31
				],
				[
					-40,
					-30
				],
				[
					-9,
					34
				],
				[
					-38,
					-6
				],
				[
					24,
					29
				],
				[
					4,
					45
				],
				[
					9,
					53
				],
				[
					20,
					-5
				]
			],
			[
				[
					2892,
					9049
				],
				[
					-31,
					-3
				],
				[
					-7,
					28
				],
				[
					12,
					33
				],
				[
					26,
					8
				],
				[
					21,
					-16
				],
				[
					1,
					-25
				],
				[
					-4,
					-8
				],
				[
					-18,
					-17
				]
			],
			[
				[
					2343,
					9162
				],
				[
					-17,
					-20
				],
				[
					-38,
					17
				],
				[
					-22,
					-6
				],
				[
					-38,
					26
				],
				[
					24,
					18
				],
				[
					19,
					25
				],
				[
					30,
					-17
				],
				[
					17,
					-10
				],
				[
					8,
					-11
				],
				[
					17,
					-22
				]
			],
			[
				[
					3135,
					7782
				],
				[
					-18,
					32
				],
				[
					0,
					79
				],
				[
					-13,
					16
				],
				[
					-18,
					-9
				],
				[
					-10,
					15
				],
				[
					-21,
					-44
				],
				[
					-8,
					-45
				],
				[
					-10,
					-26
				],
				[
					-12,
					-9
				],
				[
					-9,
					-3
				],
				[
					-3,
					-14
				],
				[
					-51,
					0
				],
				[
					-42,
					0
				],
				[
					-12,
					-11
				],
				[
					-30,
					-41
				],
				[
					-3,
					-5
				],
				[
					-9,
					-22
				],
				[
					-26,
					0
				],
				[
					-27,
					0
				],
				[
					-12,
					-10
				],
				[
					4,
					-11
				],
				[
					3,
					-17
				],
				[
					-1,
					-6
				],
				[
					-36,
					-29
				],
				[
					-29,
					-9
				],
				[
					-32,
					-31
				],
				[
					-7,
					0
				],
				[
					-10,
					9
				],
				[
					-3,
					9
				],
				[
					1,
					6
				],
				[
					6,
					20
				],
				[
					13,
					31
				],
				[
					8,
					34
				],
				[
					-5,
					50
				],
				[
					-6,
					53
				],
				[
					-29,
					27
				],
				[
					3,
					10
				],
				[
					-4,
					7
				],
				[
					-8,
					0
				],
				[
					-5,
					9
				],
				[
					-2,
					14
				],
				[
					-5,
					-6
				],
				[
					-7,
					2
				],
				[
					1,
					5
				],
				[
					-6,
					6
				],
				[
					-3,
					15
				],
				[
					-21,
					19
				],
				[
					-23,
					19
				],
				[
					-27,
					22
				],
				[
					-26,
					21
				],
				[
					-25,
					-16
				],
				[
					-9,
					-1
				],
				[
					-34,
					15
				],
				[
					-23,
					-7
				],
				[
					-27,
					17
				],
				[
					-28,
					10
				],
				[
					-19,
					3
				],
				[
					-9,
					10
				],
				[
					-5,
					31
				],
				[
					-9,
					0
				],
				[
					-1,
					-22
				],
				[
					-57,
					0
				],
				[
					-95,
					0
				],
				[
					-94,
					0
				],
				[
					-84,
					0
				],
				[
					-83,
					0
				],
				[
					-82,
					0
				],
				[
					-85,
					0
				],
				[
					-27,
					0
				],
				[
					-82,
					0
				],
				[
					-79,
					0
				]
			],
			[
				[
					1588,
					8004
				],
				[
					-4,
					0
				],
				[
					-54,
					57
				],
				[
					-20,
					25
				],
				[
					-50,
					23
				],
				[
					-15,
					51
				],
				[
					3,
					36
				],
				[
					-35,
					24
				],
				[
					-5,
					47
				],
				[
					-34,
					42
				],
				[
					0,
					29
				]
			],
			[
				[
					1374,
					8338
				],
				[
					15,
					28
				],
				[
					0,
					36
				],
				[
					-48,
					37
				],
				[
					-28,
					66
				],
				[
					-17,
					41
				],
				[
					-26,
					26
				],
				[
					-19,
					23
				],
				[
					-14,
					30
				],
				[
					-28,
					-18
				],
				[
					-27,
					-33
				],
				[
					-25,
					38
				],
				[
					-19,
					25
				],
				[
					-27,
					16
				],
				[
					-28,
					2
				],
				[
					0,
					328
				],
				[
					1,
					214
				]
			],
			[
				[
					1084,
					9197
				],
				[
					51,
					-14
				],
				[
					44,
					-28
				],
				[
					29,
					-5
				],
				[
					24,
					24
				],
				[
					34,
					18
				],
				[
					41,
					-7
				],
				[
					42,
					25
				],
				[
					45,
					14
				],
				[
					20,
					-23
				],
				[
					20,
					13
				],
				[
					6,
					27
				],
				[
					20,
					-6
				],
				[
					47,
					-52
				],
				[
					37,
					39
				],
				[
					3,
					-43
				],
				[
					34,
					9
				],
				[
					11,
					17
				],
				[
					34,
					-3
				],
				[
					42,
					-25
				],
				[
					65,
					-21
				],
				[
					38,
					-9
				],
				[
					28,
					3
				],
				[
					37,
					-29
				],
				[
					-39,
					-28
				],
				[
					50,
					-13
				],
				[
					75,
					7
				],
				[
					24,
					10
				],
				[
					29,
					-35
				],
				[
					31,
					30
				],
				[
					-29,
					24
				],
				[
					18,
					20
				],
				[
					34,
					2
				],
				[
					22,
					6
				],
				[
					23,
					-14
				],
				[
					28,
					-31
				],
				[
					31,
					5
				],
				[
					49,
					-26
				],
				[
					43,
					9
				],
				[
					40,
					-1
				],
				[
					-3,
					35
				],
				[
					25,
					10
				],
				[
					43,
					-19
				],
				[
					0,
					-55
				],
				[
					17,
					46
				],
				[
					23,
					-1
				],
				[
					12,
					58
				],
				[
					-30,
					35
				],
				[
					-32,
					23
				],
				[
					2,
					64
				],
				[
					33,
					42
				],
				[
					37,
					-9
				],
				[
					28,
					-26
				],
				[
					38,
					-65
				],
				[
					-25,
					-28
				],
				[
					52,
					-12
				],
				[
					-1,
					-59
				],
				[
					38,
					46
				],
				[
					33,
					-37
				],
				[
					-9,
					-43
				],
				[
					27,
					-39
				],
				[
					29,
					42
				],
				[
					21,
					49
				],
				[
					1,
					63
				],
				[
					40,
					-4
				],
				[
					41,
					-8
				],
				[
					37,
					-29
				],
				[
					2,
					-29
				],
				[
					-21,
					-30
				],
				[
					20,
					-31
				],
				[
					-4,
					-28
				],
				[
					-54,
					-40
				],
				[
					-39,
					-9
				],
				[
					-29,
					17
				],
				[
					-8,
					-29
				],
				[
					-27,
					-48
				],
				[
					-8,
					-26
				],
				[
					-32,
					-39
				],
				[
					-40,
					-3
				],
				[
					-22,
					-25
				],
				[
					-2,
					-37
				],
				[
					-32,
					-7
				],
				[
					-34,
					-47
				],
				[
					-30,
					-65
				],
				[
					-11,
					-45
				],
				[
					-1,
					-67
				],
				[
					40,
					-10
				],
				[
					13,
					-54
				],
				[
					13,
					-43
				],
				[
					39,
					11
				],
				[
					51,
					-25
				],
				[
					28,
					-22
				],
				[
					20,
					-27
				],
				[
					35,
					-16
				],
				[
					29,
					-24
				],
				[
					46,
					-3
				],
				[
					30,
					-6
				],
				[
					-4,
					-50
				],
				[
					8,
					-58
				],
				[
					21,
					-64
				],
				[
					41,
					-55
				],
				[
					21,
					19
				],
				[
					15,
					59
				],
				[
					-14,
					91
				],
				[
					-20,
					30
				],
				[
					45,
					27
				],
				[
					31,
					41
				],
				[
					16,
					40
				],
				[
					-3,
					38
				],
				[
					-19,
					49
				],
				[
					-33,
					44
				],
				[
					32,
					60
				],
				[
					-12,
					52
				],
				[
					-9,
					90
				],
				[
					19,
					13
				],
				[
					48,
					-15
				],
				[
					29,
					-6
				],
				[
					23,
					15
				],
				[
					25,
					-19
				],
				[
					35,
					-34
				],
				[
					8,
					-22
				],
				[
					50,
					-4
				],
				[
					-1,
					-49
				],
				[
					9,
					-73
				],
				[
					25,
					-9
				],
				[
					21,
					-34
				],
				[
					40,
					32
				],
				[
					26,
					64
				],
				[
					19,
					27
				],
				[
					21,
					-52
				],
				[
					37,
					-73
				],
				[
					30,
					-69
				],
				[
					-11,
					-36
				],
				[
					37,
					-33
				],
				[
					25,
					-33
				],
				[
					44,
					-15
				],
				[
					18,
					-18
				],
				[
					11,
					-49
				],
				[
					22,
					-7
				],
				[
					11,
					-22
				],
				[
					2,
					-65
				],
				[
					-20,
					-21
				],
				[
					-20,
					-21
				],
				[
					-46,
					-20
				],
				[
					-35,
					-47
				],
				[
					-47,
					-10
				],
				[
					-59,
					12
				],
				[
					-42,
					1
				],
				[
					-29,
					-4
				],
				[
					-23,
					-42
				],
				[
					-35,
					-25
				],
				[
					-40,
					-76
				],
				[
					-32,
					-53
				],
				[
					23,
					9
				],
				[
					45,
					76
				],
				[
					58,
					48
				],
				[
					42,
					5
				],
				[
					24,
					-28
				],
				[
					-26,
					-38
				],
				[
					9,
					-63
				],
				[
					9,
					-43
				],
				[
					36,
					-29
				],
				[
					46,
					9
				],
				[
					28,
					64
				],
				[
					2,
					-41
				],
				[
					17,
					-21
				],
				[
					-34,
					-38
				],
				[
					-61,
					-34
				],
				[
					-28,
					-24
				],
				[
					-31,
					-41
				],
				[
					-21,
					4
				],
				[
					-1,
					49
				],
				[
					48,
					48
				],
				[
					-44,
					-2
				],
				[
					-31,
					-7
				]
			],
			[
				[
					1829,
					9393
				],
				[
					-14,
					-27
				],
				[
					61,
					17
				],
				[
					39,
					-29
				],
				[
					31,
					30
				],
				[
					26,
					-19
				],
				[
					23,
					-57
				],
				[
					14,
					24
				],
				[
					-20,
					59
				],
				[
					24,
					9
				],
				[
					28,
					-10
				],
				[
					31,
					-23
				],
				[
					17,
					-56
				],
				[
					9,
					-41
				],
				[
					47,
					-28
				],
				[
					50,
					-27
				],
				[
					-3,
					-26
				],
				[
					-46,
					-4
				],
				[
					18,
					-22
				],
				[
					-9,
					-22
				],
				[
					-51,
					10
				],
				[
					-48,
					15
				],
				[
					-32,
					-3
				],
				[
					-52,
					-20
				],
				[
					-70,
					-9
				],
				[
					-50,
					-5
				],
				[
					-15,
					27
				],
				[
					-38,
					16
				],
				[
					-24,
					-7
				],
				[
					-35,
					46
				],
				[
					19,
					6
				],
				[
					43,
					10
				],
				[
					39,
					-3
				],
				[
					36,
					10
				],
				[
					-54,
					14
				],
				[
					-59,
					-5
				],
				[
					-39,
					1
				],
				[
					-15,
					22
				],
				[
					64,
					23
				],
				[
					-42,
					-1
				],
				[
					-49,
					15
				],
				[
					23,
					43
				],
				[
					20,
					23
				],
				[
					74,
					35
				],
				[
					29,
					-11
				]
			],
			[
				[
					2097,
					9410
				],
				[
					-24,
					-38
				],
				[
					-44,
					41
				],
				[
					10,
					8
				],
				[
					37,
					2
				],
				[
					21,
					-13
				]
			],
			[
				[
					2879,
					9392
				],
				[
					3,
					-16
				],
				[
					-30,
					2
				],
				[
					-30,
					1
				],
				[
					-30,
					-8
				],
				[
					-8,
					4
				],
				[
					-31,
					30
				],
				[
					1,
					21
				],
				[
					14,
					4
				],
				[
					63,
					-6
				],
				[
					48,
					-32
				]
			],
			[
				[
					2595,
					9395
				],
				[
					22,
					-36
				],
				[
					26,
					47
				],
				[
					70,
					23
				],
				[
					48,
					-59
				],
				[
					-4,
					-38
				],
				[
					55,
					17
				],
				[
					26,
					23
				],
				[
					62,
					-30
				],
				[
					38,
					-27
				],
				[
					3,
					-25
				],
				[
					52,
					13
				],
				[
					29,
					-37
				],
				[
					67,
					-22
				],
				[
					24,
					-24
				],
				[
					26,
					-54
				],
				[
					-51,
					-26
				],
				[
					66,
					-38
				],
				[
					44,
					-13
				],
				[
					40,
					-53
				],
				[
					44,
					-3
				],
				[
					-9,
					-41
				],
				[
					-49,
					-67
				],
				[
					-34,
					25
				],
				[
					-44,
					55
				],
				[
					-36,
					-7
				],
				[
					-3,
					-33
				],
				[
					29,
					-33
				],
				[
					38,
					-27
				],
				[
					11,
					-15
				],
				[
					18,
					-57
				],
				[
					-9,
					-42
				],
				[
					-35,
					16
				],
				[
					-70,
					46
				],
				[
					39,
					-49
				],
				[
					29,
					-35
				],
				[
					5,
					-20
				],
				[
					-76,
					23
				],
				[
					-59,
					33
				],
				[
					-34,
					28
				],
				[
					10,
					16
				],
				[
					-42,
					30
				],
				[
					-40,
					28
				],
				[
					0,
					-17
				],
				[
					-80,
					-9
				],
				[
					-23,
					20
				],
				[
					18,
					42
				],
				[
					52,
					1
				],
				[
					57,
					8
				],
				[
					-9,
					20
				],
				[
					10,
					29
				],
				[
					36,
					56
				],
				[
					-8,
					25
				],
				[
					-11,
					20
				],
				[
					-42,
					28
				],
				[
					-57,
					20
				],
				[
					18,
					14
				],
				[
					-29,
					36
				],
				[
					-25,
					3
				],
				[
					-22,
					20
				],
				[
					-14,
					-17
				],
				[
					-51,
					-8
				],
				[
					-101,
					13
				],
				[
					-59,
					17
				],
				[
					-45,
					9
				],
				[
					-23,
					20
				],
				[
					29,
					26
				],
				[
					-39,
					1
				],
				[
					-9,
					58
				],
				[
					21,
					51
				],
				[
					29,
					24
				],
				[
					72,
					15
				],
				[
					-21,
					-37
				]
			],
			[
				[
					2212,
					9435
				],
				[
					33,
					-13
				],
				[
					50,
					8
				],
				[
					7,
					-17
				],
				[
					-26,
					-28
				],
				[
					42,
					-24
				],
				[
					-5,
					-52
				],
				[
					-45,
					-22
				],
				[
					-27,
					4
				],
				[
					-19,
					22
				],
				[
					-69,
					45
				],
				[
					0,
					18
				],
				[
					57,
					-7
				],
				[
					-31,
					38
				],
				[
					33,
					28
				]
			],
			[
				[
					2411,
					9373
				],
				[
					-30,
					-43
				],
				[
					-32,
					2
				],
				[
					-17,
					51
				],
				[
					1,
					28
				],
				[
					14,
					25
				],
				[
					28,
					15
				],
				[
					58,
					-2
				],
				[
					53,
					-14
				],
				[
					-42,
					-51
				],
				[
					-33,
					-11
				]
			],
			[
				[
					1654,
					9293
				],
				[
					-73,
					-28
				],
				[
					-15,
					25
				],
				[
					-64,
					31
				],
				[
					12,
					24
				],
				[
					19,
					42
				],
				[
					24,
					38
				],
				[
					-27,
					35
				],
				[
					94,
					9
				],
				[
					39,
					-11
				],
				[
					71,
					-4
				],
				[
					27,
					-16
				],
				[
					30,
					-25
				],
				[
					-35,
					-14
				],
				[
					-68,
					-41
				],
				[
					-34,
					-40
				],
				[
					0,
					-25
				]
			],
			[
				[
					2399,
					9500
				],
				[
					-15,
					-22
				],
				[
					-40,
					4
				],
				[
					-34,
					15
				],
				[
					15,
					26
				],
				[
					40,
					15
				],
				[
					24,
					-20
				],
				[
					10,
					-18
				]
			],
			[
				[
					2264,
					9600
				],
				[
					21,
					-26
				],
				[
					1,
					-30
				],
				[
					-13,
					-43
				],
				[
					-46,
					-6
				],
				[
					-30,
					9
				],
				[
					1,
					34
				],
				[
					-45,
					-4
				],
				[
					-2,
					44
				],
				[
					30,
					-2
				],
				[
					41,
					20
				],
				[
					40,
					-3
				],
				[
					2,
					7
				]
			],
			[
				[
					1994,
					9570
				],
				[
					11,
					-20
				],
				[
					25,
					10
				],
				[
					29,
					-3
				],
				[
					5,
					-28
				],
				[
					-17,
					-28
				],
				[
					-94,
					-8
				],
				[
					-70,
					-25
				],
				[
					-43,
					-2
				],
				[
					-3,
					19
				],
				[
					57,
					26
				],
				[
					-125,
					-7
				],
				[
					-39,
					10
				],
				[
					38,
					56
				],
				[
					26,
					16
				],
				[
					78,
					-19
				],
				[
					50,
					-34
				],
				[
					48,
					-5
				],
				[
					-40,
					56
				],
				[
					26,
					21
				],
				[
					29,
					-7
				],
				[
					9,
					-28
				]
			],
			[
				[
					2370,
					9622
				],
				[
					30,
					-19
				],
				[
					55,
					1
				],
				[
					24,
					-19
				],
				[
					-6,
					-22
				],
				[
					32,
					-13
				],
				[
					17,
					-14
				],
				[
					38,
					-2
				],
				[
					40,
					-5
				],
				[
					44,
					12
				],
				[
					57,
					5
				],
				[
					45,
					-4
				],
				[
					30,
					-21
				],
				[
					6,
					-24
				],
				[
					-17,
					-16
				],
				[
					-42,
					-12
				],
				[
					-35,
					7
				],
				[
					-80,
					-9
				],
				[
					-57,
					-1
				],
				[
					-45,
					7
				],
				[
					-74,
					19
				],
				[
					-9,
					31
				],
				[
					-4,
					29
				],
				[
					-27,
					25
				],
				[
					-58,
					7
				],
				[
					-32,
					18
				],
				[
					10,
					24
				],
				[
					58,
					-4
				]
			],
			[
				[
					1772,
					9654
				],
				[
					-4,
					-45
				],
				[
					-21,
					-20
				],
				[
					-26,
					-3
				],
				[
					-52,
					-24
				],
				[
					-44,
					-9
				],
				[
					-38,
					12
				],
				[
					47,
					44
				],
				[
					57,
					37
				],
				[
					43,
					-1
				],
				[
					38,
					9
				]
			],
			[
				[
					2393,
					9646
				],
				[
					-13,
					-1
				],
				[
					-52,
					3
				],
				[
					-7,
					16
				],
				[
					56,
					0
				],
				[
					19,
					-11
				],
				[
					-3,
					-7
				]
			],
			[
				[
					1939,
					9656
				],
				[
					-52,
					-16
				],
				[
					-41,
					19
				],
				[
					23,
					18
				],
				[
					40,
					6
				],
				[
					39,
					-9
				],
				[
					-9,
					-18
				]
			],
			[
				[
					1954,
					9709
				],
				[
					-34,
					-12
				],
				[
					-46,
					0
				],
				[
					0,
					9
				],
				[
					29,
					17
				],
				[
					14,
					-3
				],
				[
					37,
					-11
				]
			],
			[
				[
					2338,
					9677
				],
				[
					-41,
					-12
				],
				[
					-23,
					14
				],
				[
					-12,
					21
				],
				[
					-2,
					24
				],
				[
					36,
					-2
				],
				[
					16,
					-4
				],
				[
					33,
					-20
				],
				[
					-7,
					-21
				]
			],
			[
				[
					2220,
					9693
				],
				[
					11,
					-24
				],
				[
					-45,
					6
				],
				[
					-46,
					19
				],
				[
					-62,
					2
				],
				[
					27,
					17
				],
				[
					-34,
					14
				],
				[
					-2,
					22
				],
				[
					55,
					-8
				],
				[
					75,
					-21
				],
				[
					21,
					-27
				]
			],
			[
				[
					2583,
					9770
				],
				[
					33,
					-19
				],
				[
					-38,
					-17
				],
				[
					-51,
					-44
				],
				[
					-50,
					-4
				],
				[
					-57,
					8
				],
				[
					-30,
					23
				],
				[
					0,
					21
				],
				[
					22,
					15
				],
				[
					-50,
					0
				],
				[
					-31,
					19
				],
				[
					-18,
					26
				],
				[
					20,
					26
				],
				[
					19,
					17
				],
				[
					28,
					4
				],
				[
					-12,
					14
				],
				[
					65,
					3
				],
				[
					35,
					-31
				],
				[
					47,
					-13
				],
				[
					46,
					-10
				],
				[
					22,
					-38
				]
			],
			[
				[
					3097,
					9968
				],
				[
					74,
					-5
				],
				[
					60,
					-7
				],
				[
					51,
					-16
				],
				[
					-2,
					-15
				],
				[
					-67,
					-25
				],
				[
					-68,
					-12
				],
				[
					-25,
					-12
				],
				[
					61,
					0
				],
				[
					-66,
					-35
				],
				[
					-45,
					-16
				],
				[
					-48,
					-47
				],
				[
					-57,
					-10
				],
				[
					-18,
					-12
				],
				[
					-84,
					-6
				],
				[
					39,
					-7
				],
				[
					-20,
					-10
				],
				[
					23,
					-29
				],
				[
					-26,
					-20
				],
				[
					-43,
					-16
				],
				[
					-13,
					-22
				],
				[
					-39,
					-18
				],
				[
					4,
					-13
				],
				[
					48,
					3
				],
				[
					0,
					-14
				],
				[
					-74,
					-35
				],
				[
					-73,
					16
				],
				[
					-81,
					-9
				],
				[
					-42,
					7
				],
				[
					-52,
					3
				],
				[
					-4,
					28
				],
				[
					52,
					13
				],
				[
					-14,
					41
				],
				[
					17,
					4
				],
				[
					74,
					-25
				],
				[
					-38,
					37
				],
				[
					-45,
					11
				],
				[
					23,
					23
				],
				[
					49,
					13
				],
				[
					8,
					20
				],
				[
					-39,
					23
				],
				[
					-12,
					30
				],
				[
					76,
					-3
				],
				[
					22,
					-6
				],
				[
					43,
					21
				],
				[
					-62,
					7
				],
				[
					-98,
					-4
				],
				[
					-49,
					19
				],
				[
					-23,
					24
				],
				[
					-32,
					17
				],
				[
					-6,
					19
				],
				[
					41,
					11
				],
				[
					32,
					2
				],
				[
					55,
					9
				],
				[
					41,
					22
				],
				[
					34,
					-3
				],
				[
					30,
					-16
				],
				[
					21,
					31
				],
				[
					37,
					9
				],
				[
					50,
					6
				],
				[
					85,
					3
				],
				[
					14,
					-6
				],
				[
					81,
					9
				],
				[
					60,
					-3
				],
				[
					60,
					-4
				]
			],
			[
				[
					5290,
					7883
				],
				[
					-3,
					-24
				],
				[
					-12,
					-10
				],
				[
					-20,
					8
				],
				[
					-6,
					-24
				],
				[
					-14,
					-1
				],
				[
					-5,
					9
				],
				[
					-15,
					-20
				],
				[
					-13,
					-3
				],
				[
					-12,
					13
				]
			],
			[
				[
					5190,
					7831
				],
				[
					-10,
					25
				],
				[
					-13,
					-9
				],
				[
					0,
					26
				],
				[
					21,
					32
				],
				[
					-1,
					15
				],
				[
					12,
					-5
				],
				[
					8,
					10
				]
			],
			[
				[
					5207,
					7925
				],
				[
					24,
					-1
				],
				[
					5,
					13
				],
				[
					30,
					-18
				]
			],
			[
				[
					3140,
					2021
				],
				[
					-10,
					-23
				],
				[
					-23,
					-18
				],
				[
					-14,
					2
				],
				[
					-16,
					5
				],
				[
					-21,
					17
				],
				[
					-29,
					8
				],
				[
					-35,
					32
				],
				[
					-28,
					31
				],
				[
					-38,
					65
				],
				[
					23,
					-12
				],
				[
					39,
					-39
				],
				[
					36,
					-20
				],
				[
					15,
					26
				],
				[
					9,
					40
				],
				[
					25,
					23
				],
				[
					20,
					-6
				]
			],
			[
				[
					3095,
					2171
				],
				[
					-25,
					0
				],
				[
					-13,
					-14
				],
				[
					-25,
					-21
				],
				[
					-5,
					-53
				],
				[
					-11,
					-2
				],
				[
					-32,
					19
				],
				[
					-32,
					40
				],
				[
					-34,
					33
				],
				[
					-9,
					37
				],
				[
					8,
					33
				],
				[
					-14,
					39
				],
				[
					-4,
					98
				],
				[
					12,
					55
				],
				[
					30,
					45
				],
				[
					-43,
					16
				],
				[
					27,
					51
				],
				[
					9,
					96
				],
				[
					31,
					-20
				],
				[
					15,
					119
				],
				[
					-19,
					15
				],
				[
					-9,
					-72
				],
				[
					-17,
					8
				],
				[
					9,
					83
				],
				[
					9,
					106
				],
				[
					13,
					40
				],
				[
					-8,
					56
				],
				[
					-2,
					65
				],
				[
					11,
					2
				],
				[
					17,
					93
				],
				[
					20,
					92
				],
				[
					11,
					86
				],
				[
					-6,
					86
				],
				[
					8,
					47
				],
				[
					-3,
					72
				],
				[
					16,
					70
				],
				[
					5,
					111
				],
				[
					9,
					120
				],
				[
					9,
					129
				],
				[
					-2,
					94
				],
				[
					-6,
					81
				]
			],
			[
				[
					3045,
					4126
				],
				[
					14,
					15
				],
				[
					8,
					29
				]
			],
			[
				[
					8064,
					6258
				],
				[
					-24,
					-28
				],
				[
					-23,
					18
				],
				[
					0,
					50
				],
				[
					13,
					26
				],
				[
					31,
					16
				],
				[
					16,
					-1
				],
				[
					6,
					-22
				],
				[
					-12,
					-26
				],
				[
					-7,
					-33
				]
			],
			[
				[
					8715,
					7838
				],
				[
					-19,
					-56
				],
				[
					-33,
					10
				]
			],
			[
				[
					8663,
					7792
				],
				[
					-24,
					-20
				],
				[
					7,
					-49
				]
			],
			[
				[
					8646,
					7723
				],
				[
					-4,
					-68
				],
				[
					-14,
					-2
				],
				[
					0,
					-29
				]
			],
			[
				[
					8628,
					7624
				],
				[
					-18,
					34
				],
				[
					-11,
					-33
				],
				[
					-43,
					-24
				],
				[
					4,
					-31
				],
				[
					-24,
					2
				],
				[
					-13,
					18
				],
				[
					-19,
					-40
				],
				[
					-30,
					-31
				],
				[
					-23,
					-37
				]
			],
			[
				[
					8451,
					7482
				],
				[
					-39,
					-17
				],
				[
					-20,
					-27
				],
				[
					-30,
					-16
				],
				[
					15,
					27
				],
				[
					-6,
					22
				],
				[
					22,
					39
				],
				[
					-15,
					30
				],
				[
					-24,
					-20
				],
				[
					-32,
					-40
				],
				[
					-17,
					-37
				],
				[
					-27,
					-3
				],
				[
					-14,
					-27
				],
				[
					15,
					-39
				],
				[
					22,
					-9
				],
				[
					1,
					-26
				],
				[
					22,
					-17
				],
				[
					31,
					41
				],
				[
					25,
					-22
				],
				[
					18,
					-2
				],
				[
					4,
					-30
				],
				[
					-39,
					-16
				],
				[
					-13,
					-31
				],
				[
					-27,
					-29
				],
				[
					-14,
					-40
				],
				[
					30,
					-32
				],
				[
					11,
					-57
				],
				[
					17,
					-52
				],
				[
					19,
					-45
				],
				[
					-1,
					-42
				],
				[
					-17,
					-16
				],
				[
					6,
					-31
				],
				[
					17,
					-18
				],
				[
					-5,
					-47
				],
				[
					-7,
					-45
				],
				[
					-15,
					-5
				],
				[
					-21,
					-63
				],
				[
					-22,
					-75
				],
				[
					-26,
					-69
				],
				[
					-38,
					-53
				],
				[
					-39,
					-49
				],
				[
					-31,
					-6
				],
				[
					-17,
					-26
				],
				[
					-10,
					19
				],
				[
					-15,
					-29
				],
				[
					-39,
					-29
				],
				[
					-29,
					-8
				],
				[
					-10,
					-61
				],
				[
					-15,
					-4
				],
				[
					-8,
					42
				],
				[
					7,
					22
				],
				[
					-37,
					19
				],
				[
					-13,
					-9
				]
			],
			[
				[
					8001,
					6424
				],
				[
					-28,
					14
				],
				[
					-14,
					24
				],
				[
					5,
					33
				],
				[
					-26,
					11
				],
				[
					-13,
					21
				],
				[
					-24,
					-31
				],
				[
					-27,
					-6
				],
				[
					-22,
					0
				],
				[
					-15,
					-14
				]
			],
			[
				[
					7837,
					6476
				],
				[
					-14,
					-8
				],
				[
					4,
					-66
				],
				[
					-15,
					1
				],
				[
					-2,
					14
				]
			],
			[
				[
					7810,
					6417
				],
				[
					-1,
					24
				],
				[
					-20,
					-17
				],
				[
					-12,
					10
				],
				[
					-21,
					22
				],
				[
					8,
					48
				],
				[
					-18,
					11
				],
				[
					-6,
					53
				],
				[
					-30,
					-9
				],
				[
					4,
					68
				],
				[
					26,
					48
				],
				[
					1,
					47
				],
				[
					-1,
					45
				],
				[
					-12,
					13
				],
				[
					-9,
					34
				],
				[
					-16,
					-4
				]
			],
			[
				[
					7703,
					6810
				],
				[
					-30,
					8
				],
				[
					9,
					25
				],
				[
					-13,
					35
				],
				[
					-20,
					-24
				],
				[
					-23,
					14
				],
				[
					-32,
					-36
				],
				[
					-25,
					-43
				],
				[
					-23,
					-7
				]
			],
			[
				[
					7466,
					6754
				],
				[
					-2,
					46
				],
				[
					-17,
					-12
				]
			],
			[
				[
					7447,
					6788
				],
				[
					-32,
					5
				],
				[
					-32,
					14
				],
				[
					-22,
					25
				],
				[
					-22,
					11
				],
				[
					-9,
					28
				],
				[
					-16,
					8
				],
				[
					-28,
					38
				],
				[
					-22,
					17
				],
				[
					-12,
					-13
				]
			],
			[
				[
					7252,
					6921
				],
				[
					-38,
					40
				],
				[
					-28,
					36
				],
				[
					-7,
					64
				],
				[
					20,
					-8
				],
				[
					1,
					29
				],
				[
					-12,
					30
				],
				[
					3,
					47
				],
				[
					-30,
					67
				]
			],
			[
				[
					7161,
					7226
				],
				[
					-45,
					24
				],
				[
					-8,
					44
				],
				[
					-21,
					27
				]
			],
			[
				[
					7082,
					7337
				],
				[
					-4,
					33
				],
				[
					1,
					22
				],
				[
					-17,
					14
				],
				[
					-9,
					-6
				],
				[
					-7,
					53
				]
			],
			[
				[
					7046,
					7453
				],
				[
					8,
					13
				],
				[
					-4,
					14
				],
				[
					26,
					27
				],
				[
					20,
					11
				],
				[
					29,
					-8
				],
				[
					11,
					37
				],
				[
					35,
					7
				],
				[
					10,
					23
				],
				[
					44,
					31
				],
				[
					4,
					13
				]
			],
			[
				[
					7229,
					7621
				],
				[
					-2,
					33
				],
				[
					19,
					15
				],
				[
					-25,
					100
				],
				[
					55,
					23
				],
				[
					14,
					13
				],
				[
					20,
					103
				],
				[
					55,
					-19
				],
				[
					15,
					26
				],
				[
					2,
					58
				],
				[
					23,
					5
				],
				[
					21,
					38
				]
			],
			[
				[
					7426,
					8016
				],
				[
					11,
					5
				]
			],
			[
				[
					7437,
					8021
				],
				[
					7,
					-40
				],
				[
					23,
					-31
				],
				[
					40,
					-21
				],
				[
					19,
					-47
				],
				[
					-10,
					-67
				],
				[
					10,
					-25
				],
				[
					33,
					-10
				],
				[
					37,
					-8
				],
				[
					33,
					-36
				],
				[
					18,
					-6
				],
				[
					12,
					-53
				],
				[
					17,
					-34
				],
				[
					30,
					1
				],
				[
					58,
					-13
				],
				[
					36,
					8
				],
				[
					28,
					-8
				],
				[
					41,
					-35
				],
				[
					34,
					0
				],
				[
					12,
					-18
				],
				[
					32,
					31
				],
				[
					45,
					20
				],
				[
					42,
					2
				],
				[
					32,
					20
				],
				[
					20,
					31
				],
				[
					20,
					19
				],
				[
					-5,
					19
				],
				[
					-9,
					22
				],
				[
					15,
					38
				],
				[
					15,
					-6
				],
				[
					29,
					-11
				],
				[
					28,
					30
				],
				[
					42,
					23
				],
				[
					20,
					38
				],
				[
					20,
					16
				],
				[
					40,
					8
				],
				[
					22,
					-7
				],
				[
					3,
					21
				],
				[
					-25,
					40
				],
				[
					-22,
					18
				],
				[
					-22,
					-21
				],
				[
					-27,
					9
				],
				[
					-16,
					-7
				],
				[
					-7,
					23
				],
				[
					20,
					58
				],
				[
					13,
					43
				]
			],
			[
				[
					8240,
					8055
				],
				[
					34,
					-22
				],
				[
					39,
					37
				]
			],
			[
				[
					8313,
					8070
				],
				[
					-1,
					25
				],
				[
					26,
					61
				],
				[
					15,
					19
				]
			],
			[
				[
					8353,
					8175
				],
				[
					0,
					32
				],
				[
					-16,
					13
				],
				[
					23,
					29
				],
				[
					35,
					10
				],
				[
					37,
					2
				],
				[
					41,
					-17
				],
				[
					25,
					-22
				],
				[
					17,
					-58
				],
				[
					10,
					-24
				],
				[
					10,
					-36
				],
				[
					10,
					-56
				],
				[
					49,
					-19
				],
				[
					32,
					-41
				],
				[
					12,
					-54
				],
				[
					42,
					0
				],
				[
					24,
					23
				],
				[
					46,
					17
				],
				[
					-15,
					-52
				],
				[
					-11,
					-21
				],
				[
					-9,
					-63
				]
			],
			[
				[
					4920,
					5470
				],
				[
					-12,
					-1
				],
				[
					-20,
					12
				],
				[
					-18,
					-1
				],
				[
					-33,
					-10
				],
				[
					-19,
					-17
				],
				[
					-27,
					-21
				],
				[
					-6,
					2
				]
			],
			[
				[
					4785,
					5434
				],
				[
					2,
					47
				],
				[
					3,
					7
				],
				[
					-1,
					23
				],
				[
					-12,
					24
				],
				[
					-8,
					4
				],
				[
					-8,
					16
				],
				[
					6,
					25
				],
				[
					-3,
					28
				],
				[
					1,
					17
				]
			],
			[
				[
					4765,
					5625
				],
				[
					5,
					0
				],
				[
					1,
					25
				],
				[
					-2,
					11
				],
				[
					3,
					8
				],
				[
					10,
					7
				],
				[
					-7,
					46
				],
				[
					-6,
					24
				],
				[
					2,
					20
				],
				[
					5,
					4
				]
			],
			[
				[
					4776,
					5770
				],
				[
					4,
					5
				],
				[
					8,
					-8
				],
				[
					21,
					-1
				],
				[
					5,
					17
				],
				[
					5,
					-1
				],
				[
					8,
					6
				],
				[
					4,
					-24
				],
				[
					7,
					7
				],
				[
					11,
					9
				]
			],
			[
				[
					4921,
					5738
				],
				[
					7,
					-82
				],
				[
					-11,
					-49
				],
				[
					-8,
					-65
				],
				[
					12,
					-49
				],
				[
					-1,
					-23
				]
			],
			[
				[
					5363,
					5313
				],
				[
					-4,
					3
				],
				[
					-16,
					-7
				],
				[
					-17,
					7
				],
				[
					-13,
					-3
				]
			],
			[
				[
					5313,
					5313
				],
				[
					-45,
					1
				]
			],
			[
				[
					5268,
					5314
				],
				[
					4,
					45
				],
				[
					-11,
					39
				],
				[
					-13,
					9
				],
				[
					-6,
					26
				],
				[
					-7,
					8
				],
				[
					1,
					16
				]
			],
			[
				[
					5236,
					5457
				],
				[
					7,
					41
				],
				[
					13,
					56
				],
				[
					8,
					0
				],
				[
					17,
					34
				],
				[
					10,
					1
				],
				[
					16,
					-24
				],
				[
					19,
					19
				],
				[
					2,
					24
				],
				[
					7,
					24
				],
				[
					4,
					29
				],
				[
					15,
					23
				],
				[
					5,
					41
				],
				[
					6,
					13
				],
				[
					4,
					30
				],
				[
					7,
					36
				],
				[
					24,
					45
				],
				[
					1,
					19
				],
				[
					3,
					10
				],
				[
					-11,
					23
				]
			],
			[
				[
					5393,
					5901
				],
				[
					1,
					19
				],
				[
					8,
					3
				]
			],
			[
				[
					5402,
					5923
				],
				[
					11,
					-37
				],
				[
					2,
					-38
				]
			],
			[
				[
					5415,
					5848
				],
				[
					-1,
					-38
				],
				[
					15,
					-53
				],
				[
					-15,
					1
				],
				[
					-8,
					-4
				],
				[
					-13,
					6
				],
				[
					-6,
					-28
				],
				[
					16,
					-33
				],
				[
					13,
					-10
				],
				[
					3,
					-24
				],
				[
					9,
					-40
				],
				[
					-4,
					-15
				]
			],
			[
				[
					5444,
					5313
				],
				[
					-2,
					-31
				],
				[
					-22,
					14
				],
				[
					-22,
					15
				],
				[
					-35,
					2
				]
			],
			[
				[
					5856,
					5385
				],
				[
					-2,
					-68
				],
				[
					11,
					-8
				],
				[
					-9,
					-20
				],
				[
					-10,
					-15
				],
				[
					-11,
					-30
				],
				[
					-6,
					-27
				],
				[
					-1,
					-46
				],
				[
					-7,
					-22
				],
				[
					0,
					-44
				]
			],
			[
				[
					5821,
					5105
				],
				[
					-8,
					-16
				],
				[
					-1,
					-34
				],
				[
					-4,
					-5
				],
				[
					-2,
					-31
				]
			],
			[
				[
					5814,
					4923
				],
				[
					5,
					-53
				],
				[
					-2,
					-30
				]
			],
			[
				[
					5817,
					4840
				],
				[
					5,
					-33
				],
				[
					16,
					-32
				],
				[
					15,
					-73
				]
			],
			[
				[
					5853,
					4702
				],
				[
					-11,
					6
				],
				[
					-37,
					-10
				],
				[
					-7,
					-7
				],
				[
					-8,
					-36
				],
				[
					6,
					-26
				],
				[
					-5,
					-68
				],
				[
					-3,
					-58
				],
				[
					7,
					-10
				],
				[
					19,
					-22
				],
				[
					8,
					10
				],
				[
					2,
					-62
				],
				[
					-21,
					1
				],
				[
					-11,
					31
				],
				[
					-10,
					25
				],
				[
					-22,
					8
				],
				[
					-6,
					30
				],
				[
					-17,
					-18
				],
				[
					-22,
					8
				],
				[
					-10,
					26
				],
				[
					-17,
					5
				],
				[
					-13,
					-1
				],
				[
					-2,
					18
				],
				[
					-9,
					1
				]
			],
			[
				[
					5342,
					4831
				],
				[
					-4,
					18
				]
			],
			[
				[
					5360,
					4907
				],
				[
					8,
					-6
				],
				[
					9,
					22
				],
				[
					15,
					0
				],
				[
					2,
					-17
				],
				[
					11,
					-10
				],
				[
					16,
					36
				],
				[
					16,
					28
				],
				[
					7,
					19
				],
				[
					-1,
					47
				],
				[
					12,
					56
				],
				[
					13,
					30
				],
				[
					18,
					28
				],
				[
					3,
					18
				],
				[
					1,
					21
				],
				[
					5,
					20
				],
				[
					-2,
					33
				],
				[
					4,
					51
				],
				[
					5,
					36
				],
				[
					8,
					30
				],
				[
					2,
					35
				]
			],
			[
				[
					5760,
					5484
				],
				[
					17,
					-48
				],
				[
					12,
					-7
				],
				[
					8,
					10
				],
				[
					12,
					-4
				],
				[
					16,
					12
				],
				[
					6,
					-24
				],
				[
					25,
					-38
				]
			],
			[
				[
					5330,
					4892
				],
				[
					-22,
					61
				]
			],
			[
				[
					5308,
					4953
				],
				[
					21,
					32
				],
				[
					-11,
					38
				],
				[
					10,
					15
				],
				[
					19,
					7
				],
				[
					2,
					25
				],
				[
					15,
					-27
				],
				[
					24,
					-3
				],
				[
					9,
					27
				],
				[
					3,
					39
				],
				[
					-3,
					45
				],
				[
					-13,
					34
				],
				[
					12,
					66
				],
				[
					-7,
					12
				],
				[
					-21,
					-5
				],
				[
					-7,
					30
				],
				[
					2,
					25
				]
			],
			[
				[
					2906,
					5174
				],
				[
					-12,
					13
				],
				[
					-14,
					19
				],
				[
					-7,
					-9
				],
				[
					-24,
					8
				],
				[
					-7,
					25
				],
				[
					-5,
					-1
				],
				[
					-28,
					33
				]
			],
			[
				[
					2809,
					5262
				],
				[
					-3,
					18
				],
				[
					10,
					4
				],
				[
					-1,
					29
				],
				[
					6,
					21
				],
				[
					14,
					4
				],
				[
					12,
					36
				],
				[
					10,
					30
				],
				[
					-10,
					14
				],
				[
					5,
					33
				],
				[
					-6,
					53
				],
				[
					6,
					15
				],
				[
					-4,
					49
				],
				[
					-12,
					30
				]
			],
			[
				[
					2836,
					5598
				],
				[
					4,
					28
				],
				[
					9,
					-4
				],
				[
					5,
					17
				],
				[
					-6,
					34
				],
				[
					3,
					9
				]
			],
			[
				[
					2851,
					5682
				],
				[
					14,
					-2
				],
				[
					21,
					40
				],
				[
					12,
					6
				],
				[
					0,
					19
				],
				[
					5,
					49
				],
				[
					16,
					27
				],
				[
					17,
					1
				],
				[
					3,
					12
				],
				[
					21,
					-5
				],
				[
					22,
					29
				],
				[
					11,
					13
				],
				[
					14,
					28
				],
				[
					9,
					-4
				],
				[
					8,
					-15
				],
				[
					-6,
					-19
				]
			],
			[
				[
					3018,
					5861
				],
				[
					-18,
					-10
				],
				[
					-7,
					-29
				],
				[
					-10,
					-16
				],
				[
					-8,
					-22
				],
				[
					-4,
					-41
				],
				[
					-8,
					-34
				],
				[
					15,
					-3
				],
				[
					3,
					-27
				],
				[
					6,
					-13
				],
				[
					3,
					-23
				],
				[
					-4,
					-21
				],
				[
					1,
					-12
				],
				[
					7,
					-5
				],
				[
					7,
					-20
				],
				[
					36,
					6
				],
				[
					16,
					-8
				],
				[
					19,
					-49
				],
				[
					11,
					6
				],
				[
					20,
					-3
				],
				[
					16,
					6
				],
				[
					10,
					-10
				],
				[
					-5,
					-31
				],
				[
					-6,
					-19
				],
				[
					-2,
					-41
				],
				[
					5,
					-38
				],
				[
					8,
					-18
				],
				[
					1,
					-12
				],
				[
					-14,
					-29
				],
				[
					10,
					-13
				],
				[
					8,
					-20
				],
				[
					8,
					-57
				]
			],
			[
				[
					3058,
					4935
				],
				[
					-14,
					31
				],
				[
					-8,
					1
				],
				[
					18,
					59
				],
				[
					-21,
					27
				],
				[
					-17,
					-5
				],
				[
					-10,
					10
				],
				[
					-15,
					-16
				],
				[
					-21,
					8
				],
				[
					-16,
					60
				],
				[
					-13,
					15
				],
				[
					-9,
					27
				],
				[
					-19,
					27
				],
				[
					-7,
					-5
				]
			],
			[
				[
					2695,
					5656
				],
				[
					-15,
					13
				],
				[
					-6,
					12
				],
				[
					4,
					10
				],
				[
					-1,
					13
				],
				[
					-8,
					13
				],
				[
					-11,
					12
				],
				[
					-10,
					7
				],
				[
					-1,
					17
				],
				[
					-8,
					10
				],
				[
					2,
					-16
				],
				[
					-5,
					-14
				],
				[
					-7,
					16
				],
				[
					-9,
					5
				],
				[
					-4,
					12
				],
				[
					1,
					18
				],
				[
					3,
					18
				],
				[
					-8,
					8
				],
				[
					7,
					11
				]
			],
			[
				[
					2619,
					5821
				],
				[
					4,
					7
				],
				[
					18,
					-15
				],
				[
					7,
					8
				],
				[
					9,
					-5
				],
				[
					4,
					-12
				],
				[
					8,
					-4
				],
				[
					7,
					12
				]
			],
			[
				[
					2676,
					5812
				],
				[
					7,
					-31
				],
				[
					11,
					-23
				],
				[
					13,
					-25
				]
			],
			[
				[
					2707,
					5733
				],
				[
					-11,
					-5
				],
				[
					0,
					-23
				],
				[
					6,
					-9
				],
				[
					-4,
					-6
				],
				[
					1,
					-11
				],
				[
					-2,
					-11
				],
				[
					-2,
					-12
				]
			],
			[
				[
					2715,
					6518
				],
				[
					23,
					-4
				],
				[
					22,
					-1
				],
				[
					26,
					-20
				],
				[
					11,
					-21
				],
				[
					26,
					7
				],
				[
					10,
					-14
				],
				[
					24,
					-35
				],
				[
					17,
					-26
				],
				[
					9,
					0
				],
				[
					17,
					-11
				],
				[
					-2,
					-17
				],
				[
					20,
					-2
				],
				[
					21,
					-23
				],
				[
					-3,
					-14
				],
				[
					-19,
					-7
				],
				[
					-18,
					-3
				],
				[
					-19,
					4
				],
				[
					-40,
					-5
				],
				[
					18,
					32
				],
				[
					-11,
					15
				],
				[
					-18,
					4
				],
				[
					-9,
					16
				],
				[
					-7,
					33
				],
				[
					-16,
					-2
				],
				[
					-26,
					15
				],
				[
					-8,
					12
				],
				[
					-36,
					9
				],
				[
					-10,
					12
				],
				[
					11,
					14
				],
				[
					-28,
					3
				],
				[
					-20,
					-30
				],
				[
					-11,
					-1
				],
				[
					-4,
					-14
				],
				[
					-14,
					-6
				],
				[
					-12,
					5
				],
				[
					15,
					18
				],
				[
					6,
					21
				],
				[
					13,
					13
				],
				[
					14,
					11
				],
				[
					21,
					5
				],
				[
					7,
					7
				]
			],
			[
				[
					5909,
					7206
				],
				[
					2,
					0
				],
				[
					4,
					14
				],
				[
					20,
					-1
				],
				[
					25,
					18
				],
				[
					-19,
					-25
				],
				[
					2,
					-11
				]
			],
			[
				[
					5943,
					7201
				],
				[
					-3,
					2
				],
				[
					-5,
					-4
				],
				[
					-4,
					1
				],
				[
					-2,
					-2
				],
				[
					0,
					6
				],
				[
					-2,
					3
				],
				[
					-6,
					1
				],
				[
					-7,
					-5
				],
				[
					-5,
					3
				]
			],
			[
				[
					5943,
					7201
				],
				[
					1,
					-4
				],
				[
					-28,
					-24
				],
				[
					-14,
					8
				],
				[
					-7,
					23
				],
				[
					14,
					2
				]
			],
			[
				[
					5377,
					7997
				],
				[
					-16,
					25
				],
				[
					-14,
					14
				],
				[
					-3,
					24
				],
				[
					-5,
					17
				],
				[
					21,
					12
				],
				[
					10,
					15
				],
				[
					20,
					11
				],
				[
					7,
					11
				],
				[
					7,
					-7
				],
				[
					13,
					6
				]
			],
			[
				[
					5417,
					8125
				],
				[
					13,
					-18
				],
				[
					21,
					-5
				],
				[
					-2,
					-16
				],
				[
					15,
					-12
				],
				[
					4,
					15
				],
				[
					19,
					-7
				],
				[
					3,
					-18
				],
				[
					20,
					-3
				],
				[
					13,
					-28
				]
			],
			[
				[
					5523,
					8033
				],
				[
					-8,
					0
				],
				[
					-4,
					-11
				],
				[
					-7,
					-2
				],
				[
					-2,
					-13
				],
				[
					-5,
					-3
				],
				[
					-1,
					-6
				],
				[
					-9,
					-5
				],
				[
					-12,
					0
				],
				[
					-4,
					-12
				]
			],
			[
				[
					5275,
					8349
				],
				[
					1,
					-23
				],
				[
					28,
					-13
				],
				[
					-1,
					-21
				],
				[
					29,
					11
				],
				[
					15,
					16
				],
				[
					32,
					-23
				],
				[
					13,
					-18
				]
			],
			[
				[
					5392,
					8278
				],
				[
					6,
					-29
				],
				[
					-8,
					-16
				],
				[
					11,
					-20
				],
				[
					6,
					-31
				],
				[
					-2,
					-20
				],
				[
					12,
					-37
				]
			],
			[
				[
					5207,
					7925
				],
				[
					3,
					41
				],
				[
					14,
					39
				],
				[
					-40,
					11
				],
				[
					-13,
					15
				]
			],
			[
				[
					5171,
					8031
				],
				[
					2,
					25
				],
				[
					-6,
					13
				]
			],
			[
				[
					5171,
					8108
				],
				[
					-5,
					60
				],
				[
					17,
					0
				],
				[
					7,
					22
				],
				[
					6,
					53
				],
				[
					-5,
					19
				]
			],
			[
				[
					5191,
					8262
				],
				[
					6,
					12
				],
				[
					23,
					3
				],
				[
					5,
					-12
				],
				[
					19,
					28
				],
				[
					-6,
					22
				],
				[
					-2,
					32
				]
			],
			[
				[
					5236,
					8347
				],
				[
					21,
					-7
				],
				[
					18,
					9
				]
			],
			[
				[
					6196,
					5914
				],
				[
					7,
					-18
				],
				[
					-1,
					-24
				],
				[
					-16,
					-14
				],
				[
					12,
					-16
				]
			],
			[
				[
					6198,
					5842
				],
				[
					-10,
					-30
				]
			],
			[
				[
					6188,
					5812
				],
				[
					-7,
					10
				],
				[
					-6,
					-4
				],
				[
					-16,
					1
				],
				[
					0,
					17
				],
				[
					-2,
					16
				],
				[
					9,
					27
				],
				[
					10,
					26
				]
			],
			[
				[
					6176,
					5905
				],
				[
					12,
					-5
				],
				[
					8,
					14
				]
			],
			[
				[
					5352,
					8385
				],
				[
					-17,
					-47
				],
				[
					-29,
					33
				],
				[
					-4,
					23
				],
				[
					41,
					20
				],
				[
					9,
					-29
				]
			],
			[
				[
					5236,
					8347
				],
				[
					-11,
					32
				],
				[
					-1,
					59
				],
				[
					5,
					16
				],
				[
					8,
					17
				],
				[
					24,
					4
				],
				[
					10,
					15
				],
				[
					22,
					17
				],
				[
					-1,
					-30
				],
				[
					-8,
					-19
				],
				[
					4,
					-16
				],
				[
					15,
					-8
				],
				[
					-7,
					-22
				],
				[
					-8,
					6
				],
				[
					-20,
					-41
				],
				[
					7,
					-28
				]
			],
			[
				[
					3008,
					6318
				],
				[
					3,
					10
				],
				[
					22,
					-1
				],
				[
					16,
					-15
				],
				[
					8,
					2
				],
				[
					5,
					-21
				],
				[
					15,
					2
				],
				[
					-1,
					-18
				],
				[
					12,
					-2
				],
				[
					14,
					-21
				],
				[
					-10,
					-23
				],
				[
					-14,
					12
				],
				[
					-12,
					-2
				],
				[
					-9,
					3
				],
				[
					-5,
					-11
				],
				[
					-11,
					-3
				],
				[
					-4,
					14
				],
				[
					-10,
					-9
				],
				[
					-11,
					-39
				],
				[
					-7,
					9
				],
				[
					-1,
					17
				]
			],
			[
				[
					3008,
					6222
				],
				[
					0,
					15
				],
				[
					-7,
					17
				],
				[
					7,
					10
				],
				[
					2,
					22
				],
				[
					-2,
					32
				]
			],
			[
				[
					5333,
					6534
				],
				[
					-95,
					-110
				],
				[
					-81,
					-113
				],
				[
					-39,
					-26
				]
			],
			[
				[
					5118,
					6285
				],
				[
					-31,
					-5
				],
				[
					0,
					36
				],
				[
					-13,
					10
				],
				[
					-17,
					16
				],
				[
					-7,
					27
				],
				[
					-94,
					126
				],
				[
					-93,
					126
				]
			],
			[
				[
					4863,
					6621
				],
				[
					-105,
					139
				]
			],
			[
				[
					4758,
					6760
				],
				[
					1,
					11
				],
				[
					0,
					4
				]
			],
			[
				[
					4759,
					6775
				],
				[
					0,
					68
				],
				[
					44,
					43
				],
				[
					28,
					9
				],
				[
					23,
					15
				],
				[
					11,
					29
				],
				[
					32,
					23
				],
				[
					1,
					42
				],
				[
					16,
					5
				],
				[
					13,
					22
				],
				[
					36,
					9
				],
				[
					5,
					23
				],
				[
					-7,
					12
				],
				[
					-10,
					61
				],
				[
					-1,
					35
				],
				[
					-11,
					37
				]
			],
			[
				[
					4939,
					7208
				],
				[
					27,
					31
				],
				[
					30,
					10
				],
				[
					18,
					24
				],
				[
					26,
					17
				],
				[
					47,
					11
				],
				[
					46,
					4
				],
				[
					14,
					-8
				],
				[
					26,
					22
				],
				[
					30,
					1
				],
				[
					11,
					-14
				],
				[
					19,
					4
				]
			],
			[
				[
					5233,
					7310
				],
				[
					-5,
					-30
				],
				[
					4,
					-54
				],
				[
					-6,
					-48
				],
				[
					-18,
					-32
				],
				[
					3,
					-43
				],
				[
					23,
					-35
				],
				[
					0,
					-14
				],
				[
					17,
					-23
				],
				[
					12,
					-103
				]
			],
			[
				[
					5263,
					6928
				],
				[
					9,
					-51
				],
				[
					1,
					-27
				],
				[
					-5,
					-47
				],
				[
					2,
					-26
				],
				[
					-3,
					-32
				],
				[
					2,
					-36
				],
				[
					-11,
					-24
				],
				[
					17,
					-42
				],
				[
					1,
					-25
				],
				[
					10,
					-32
				],
				[
					13,
					11
				],
				[
					22,
					-27
				],
				[
					12,
					-36
				]
			],
			[
				[
					2769,
					4986
				],
				[
					15,
					43
				],
				[
					-6,
					26
				],
				[
					-11,
					-27
				],
				[
					-16,
					25
				],
				[
					5,
					16
				],
				[
					-4,
					53
				],
				[
					9,
					8
				],
				[
					5,
					36
				],
				[
					11,
					37
				],
				[
					-2,
					24
				],
				[
					15,
					12
				],
				[
					19,
					23
				]
			],
			[
				[
					2906,
					5174
				],
				[
					4,
					-44
				],
				[
					-9,
					-37
				],
				[
					-30,
					-61
				],
				[
					-33,
					-22
				],
				[
					-17,
					-51
				],
				[
					-6,
					-38
				],
				[
					-15,
					-24
				],
				[
					-12,
					29
				],
				[
					-11,
					6
				],
				[
					-12,
					-4
				],
				[
					-1,
					21
				],
				[
					8,
					13
				],
				[
					-3,
					24
				]
			],
			[
				[
					5969,
					6881
				],
				[
					-7,
					-23
				],
				[
					-6,
					-43
				],
				[
					-8,
					-30
				],
				[
					-6,
					-10
				],
				[
					-10,
					18
				],
				[
					-12,
					26
				],
				[
					-20,
					82
				],
				[
					-3,
					-5
				],
				[
					12,
					-61
				],
				[
					17,
					-57
				],
				[
					21,
					-90
				],
				[
					10,
					-31
				],
				[
					9,
					-33
				],
				[
					25,
					-64
				],
				[
					-6,
					-10
				],
				[
					1,
					-37
				],
				[
					33,
					-52
				],
				[
					4,
					-12
				]
			],
			[
				[
					6023,
					6449
				],
				[
					-110,
					0
				],
				[
					-107,
					0
				],
				[
					-112,
					0
				]
			],
			[
				[
					5694,
					6449
				],
				[
					0,
					212
				],
				[
					0,
					205
				],
				[
					-8,
					47
				],
				[
					7,
					35
				],
				[
					-5,
					25
				],
				[
					10,
					27
				]
			],
			[
				[
					5698,
					7000
				],
				[
					37,
					1
				],
				[
					27,
					-15
				],
				[
					28,
					-17
				],
				[
					13,
					-9
				],
				[
					21,
					18
				],
				[
					11,
					17
				],
				[
					25,
					5
				],
				[
					20,
					-8
				],
				[
					7,
					-28
				],
				[
					7,
					19
				],
				[
					22,
					-14
				],
				[
					22,
					-3
				],
				[
					13,
					14
				]
			],
			[
				[
					5951,
					6980
				],
				[
					18,
					-99
				]
			],
			[
				[
					6176,
					5905
				],
				[
					-10,
					18
				],
				[
					-11,
					34
				]
			],
			[
				[
					6155,
					5957
				],
				[
					-12,
					19
				],
				[
					-8,
					19
				]
			],
			[
				[
					6135,
					5995
				],
				[
					-24,
					24
				],
				[
					-19,
					0
				],
				[
					-7,
					12
				],
				[
					-16,
					-13
				],
				[
					-17,
					26
				],
				[
					-8,
					-43
				],
				[
					-33,
					12
				]
			],
			[
				[
					6011,
					6013
				],
				[
					-3,
					23
				],
				[
					12,
					85
				],
				[
					3,
					38
				],
				[
					9,
					18
				],
				[
					20,
					9
				],
				[
					14,
					33
				]
			],
			[
				[
					6066,
					6219
				],
				[
					16,
					-67
				],
				[
					8,
					-53
				],
				[
					15,
					-28
				],
				[
					38,
					-54
				],
				[
					16,
					-33
				],
				[
					15,
					-33
				],
				[
					8,
					-20
				],
				[
					14,
					-17
				]
			],
			[
				[
					4749,
					7594
				],
				[
					1,
					41
				],
				[
					-11,
					25
				],
				[
					39,
					42
				],
				[
					34,
					-11
				],
				[
					37,
					1
				],
				[
					30,
					-10
				],
				[
					23,
					3
				],
				[
					45,
					-2
				]
			],
			[
				[
					4947,
					7683
				],
				[
					11,
					-23
				],
				[
					51,
					-26
				],
				[
					10,
					13
				],
				[
					31,
					-26
				],
				[
					32,
					7
				]
			],
			[
				[
					5082,
					7628
				],
				[
					2,
					-33
				],
				[
					-26,
					-39
				],
				[
					-36,
					-12
				],
				[
					-2,
					-19
				],
				[
					-18,
					-32
				],
				[
					-10,
					-47
				],
				[
					11,
					-33
				],
				[
					-16,
					-26
				],
				[
					-6,
					-37
				],
				[
					-21,
					-11
				],
				[
					-20,
					-45
				],
				[
					-35,
					-1
				],
				[
					-27,
					1
				],
				[
					-17,
					-20
				],
				[
					-11,
					-22
				],
				[
					-13,
					5
				],
				[
					-11,
					20
				],
				[
					-8,
					33
				],
				[
					-26,
					9
				]
			],
			[
				[
					4792,
					7319
				],
				[
					-2,
					19
				],
				[
					10,
					21
				],
				[
					4,
					16
				],
				[
					-9,
					17
				],
				[
					7,
					38
				],
				[
					-11,
					34
				],
				[
					12,
					5
				],
				[
					1,
					27
				],
				[
					5,
					9
				],
				[
					0,
					45
				],
				[
					13,
					15
				],
				[
					-8,
					29
				],
				[
					-16,
					2
				],
				[
					-5,
					-7
				],
				[
					-16,
					0
				],
				[
					-7,
					28
				],
				[
					-11,
					-8
				],
				[
					-10,
					-15
				]
			],
			[
				[
					5675,
					8510
				],
				[
					3,
					34
				],
				[
					-10,
					-7
				],
				[
					-18,
					21
				],
				[
					-2,
					33
				],
				[
					35,
					16
				],
				[
					35,
					8
				],
				[
					30,
					-9
				],
				[
					29,
					1
				]
			],
			[
				[
					5777,
					8607
				],
				[
					4,
					-10
				]
			],
			[
				[
					5781,
					8597
				],
				[
					-20,
					-33
				],
				[
					8,
					-54
				]
			],
			[
				[
					5769,
					8510
				],
				[
					-12,
					-18
				]
			],
			[
				[
					5757,
					8492
				],
				[
					-22,
					0
				],
				[
					-24,
					22
				],
				[
					-13,
					7
				],
				[
					-23,
					-11
				]
			],
			[
				[
					6135,
					5995
				],
				[
					8,
					-19
				],
				[
					12,
					-19
				]
			],
			[
				[
					6188,
					5812
				],
				[
					-6,
					-21
				],
				[
					10,
					-31
				]
			],
			[
				[
					6192,
					5760
				],
				[
					10,
					-28
				],
				[
					11,
					-21
				]
			],
			[
				[
					6213,
					5711
				],
				[
					90,
					-68
				],
				[
					24,
					0
				]
			],
			[
				[
					6327,
					5643
				],
				[
					-79,
					-173
				],
				[
					-36,
					-2
				],
				[
					-25,
					-41
				],
				[
					-17,
					-1
				],
				[
					-8,
					-18
				]
			],
			[
				[
					6162,
					5408
				],
				[
					-19,
					0
				],
				[
					-11,
					20
				],
				[
					-26,
					-24
				],
				[
					-8,
					-24
				],
				[
					-18,
					4
				],
				[
					-6,
					7
				],
				[
					-7,
					-2
				],
				[
					-9,
					1
				],
				[
					-35,
					49
				],
				[
					-19,
					0
				],
				[
					-10,
					19
				],
				[
					0,
					32
				],
				[
					-14,
					10
				]
			],
			[
				[
					5980,
					5500
				],
				[
					-17,
					62
				],
				[
					-12,
					14
				],
				[
					-5,
					23
				],
				[
					-14,
					28
				],
				[
					-17,
					4
				],
				[
					9,
					33
				],
				[
					15,
					1
				],
				[
					4,
					18
				]
			],
			[
				[
					5943,
					5683
				],
				[
					0,
					51
				]
			],
			[
				[
					5943,
					5734
				],
				[
					8,
					61
				],
				[
					13,
					16
				],
				[
					3,
					23
				],
				[
					12,
					44
				],
				[
					17,
					29
				],
				[
					11,
					56
				],
				[
					4,
					50
				]
			],
			[
				[
					5794,
					9159
				],
				[
					-4,
					-40
				],
				[
					42,
					-38
				],
				[
					-26,
					-44
				],
				[
					33,
					-65
				],
				[
					-19,
					-50
				],
				[
					25,
					-42
				],
				[
					-11,
					-38
				],
				[
					41,
					-39
				],
				[
					-11,
					-30
				],
				[
					-25,
					-33
				],
				[
					-60,
					-74
				]
			],
			[
				[
					5779,
					8666
				],
				[
					-50,
					-4
				],
				[
					-49,
					-21
				],
				[
					-45,
					-12
				],
				[
					-16,
					31
				],
				[
					-27,
					19
				],
				[
					6,
					57
				],
				[
					-14,
					52
				],
				[
					14,
					33
				],
				[
					25,
					36
				],
				[
					63,
					63
				],
				[
					19,
					12
				],
				[
					-3,
					24
				],
				[
					-39,
					27
				]
			],
			[
				[
					5663,
					8983
				],
				[
					-9,
					23
				],
				[
					-1,
					88
				],
				[
					-43,
					40
				],
				[
					-37,
					28
				]
			],
			[
				[
					5573,
					9162
				],
				[
					17,
					15
				],
				[
					30,
					-30
				],
				[
					37,
					2
				],
				[
					30,
					-13
				],
				[
					26,
					25
				],
				[
					14,
					42
				],
				[
					43,
					20
				],
				[
					35,
					-23
				],
				[
					-11,
					-41
				]
			],
			[
				[
					9954,
					4184
				],
				[
					9,
					-17
				],
				[
					-4,
					-30
				],
				[
					-17,
					-8
				],
				[
					-16,
					8
				],
				[
					-2,
					25
				],
				[
					10,
					20
				],
				[
					13,
					-8
				],
				[
					7,
					10
				]
			],
			[
				[
					0,
					4257
				],
				[
					6,
					3
				],
				[
					-4,
					-28
				],
				[
					-2,
					-3
				],
				[
					9981,
					-14
				],
				[
					-17,
					-12
				],
				[
					-4,
					21
				],
				[
					14,
					12
				],
				[
					9,
					3
				],
				[
					-9983,
					18
				]
			],
			[
				[
					3300,
					2197
				],
				[
					33,
					34
				],
				[
					24,
					-14
				],
				[
					16,
					23
				],
				[
					22,
					-26
				],
				[
					-8,
					-20
				],
				[
					-37,
					-17
				],
				[
					-13,
					20
				],
				[
					-23,
					-26
				],
				[
					-14,
					26
				]
			],
			[
				[
					3485,
					5316
				],
				[
					7,
					24
				],
				[
					3,
					26
				],
				[
					4,
					25
				],
				[
					-10,
					34
				]
			],
			[
				[
					3489,
					5425
				],
				[
					-3,
					39
				],
				[
					15,
					50
				]
			],
			[
				[
					3501,
					5514
				],
				[
					9,
					-6
				],
				[
					21,
					-14
				],
				[
					29,
					-49
				],
				[
					5,
					-23
				]
			],
			[
				[
					5265,
					7610
				],
				[
					-9,
					-45
				],
				[
					-13,
					12
				],
				[
					-6,
					39
				],
				[
					5,
					21
				],
				[
					18,
					22
				],
				[
					5,
					-49
				]
			],
			[
				[
					5157,
					8035
				],
				[
					6,
					-5
				],
				[
					8,
					1
				]
			],
			[
				[
					5190,
					7831
				],
				[
					-2,
					-16
				],
				[
					9,
					-22
				],
				[
					-10,
					-18
				],
				[
					7,
					-44
				],
				[
					15,
					-8
				],
				[
					-3,
					-25
				]
			],
			[
				[
					5206,
					7698
				],
				[
					-25,
					-32
				],
				[
					-55,
					16
				],
				[
					-40,
					-19
				],
				[
					-4,
					-35
				]
			],
			[
				[
					4947,
					7683
				],
				[
					14,
					34
				],
				[
					5,
					115
				],
				[
					-28,
					61
				],
				[
					-21,
					29
				],
				[
					-42,
					22
				],
				[
					-3,
					42
				],
				[
					36,
					12
				],
				[
					47,
					-14
				],
				[
					-9,
					65
				],
				[
					26,
					-25
				],
				[
					65,
					45
				],
				[
					8,
					47
				],
				[
					24,
					12
				]
			],
			[
				[
					5308,
					4953
				],
				[
					-29,
					58
				],
				[
					-18,
					48
				],
				[
					-17,
					59
				],
				[
					1,
					20
				],
				[
					6,
					18
				],
				[
					7,
					42
				],
				[
					5,
					43
				]
			],
			[
				[
					5263,
					5241
				],
				[
					10,
					3
				],
				[
					40,
					-1
				],
				[
					0,
					70
				]
			],
			[
				[
					4827,
					8284
				],
				[
					-21,
					12
				],
				[
					-17,
					-1
				],
				[
					6,
					31
				],
				[
					-6,
					31
				]
			],
			[
				[
					4789,
					8357
				],
				[
					23,
					2
				],
				[
					30,
					-35
				],
				[
					-15,
					-40
				]
			],
			[
				[
					4916,
					8559
				],
				[
					-30,
					-62
				],
				[
					29,
					7
				],
				[
					30,
					0
				],
				[
					-7,
					-47
				],
				[
					-25,
					-51
				],
				[
					29,
					-4
				],
				[
					2,
					-6
				],
				[
					25,
					-68
				],
				[
					19,
					-9
				],
				[
					17,
					-66
				],
				[
					8,
					-23
				],
				[
					33,
					-11
				],
				[
					-3,
					-36
				],
				[
					-14,
					-17
				],
				[
					11,
					-30
				],
				[
					-25,
					-30
				],
				[
					-37,
					0
				],
				[
					-48,
					-16
				],
				[
					-13,
					12
				],
				[
					-18,
					-27
				],
				[
					-26,
					6
				],
				[
					-19,
					-22
				],
				[
					-15,
					12
				],
				[
					41,
					60
				],
				[
					25,
					13
				],
				[
					-1,
					0
				],
				[
					-43,
					9
				],
				[
					-8,
					23
				],
				[
					29,
					18
				],
				[
					-15,
					31
				],
				[
					5,
					38
				],
				[
					42,
					-5
				],
				[
					4,
					33
				],
				[
					-19,
					36
				],
				[
					-34,
					10
				],
				[
					-7,
					16
				],
				[
					10,
					26
				],
				[
					-9,
					16
				],
				[
					-15,
					-28
				],
				[
					-1,
					56
				],
				[
					-14,
					29
				],
				[
					10,
					60
				],
				[
					21,
					47
				],
				[
					23,
					-5
				],
				[
					33,
					5
				]
			],
			[
				[
					6154,
					7574
				],
				[
					4,
					25
				],
				[
					-7,
					39
				],
				[
					-16,
					21
				],
				[
					-16,
					7
				],
				[
					-10,
					18
				]
			],
			[
				[
					6109,
					7684
				],
				[
					4,
					6
				],
				[
					23,
					-9
				],
				[
					41,
					-10
				],
				[
					38,
					-27
				],
				[
					5,
					-11
				],
				[
					17,
					9
				],
				[
					25,
					-12
				],
				[
					9,
					-24
				],
				[
					17,
					-13
				]
			],
			[
				[
					6210,
					7549
				],
				[
					-27,
					28
				],
				[
					-29,
					-3
				]
			],
			[
				[
					5029,
					5524
				],
				[
					-44,
					-34
				],
				[
					-15,
					-20
				],
				[
					-25,
					-16
				],
				[
					-25,
					16
				]
			],
			[
				[
					5000,
					5817
				],
				[
					-2,
					-18
				],
				[
					12,
					-30
				],
				[
					0,
					-42
				],
				[
					2,
					-45
				],
				[
					7,
					-21
				],
				[
					-6,
					-52
				],
				[
					2,
					-28
				],
				[
					8,
					-37
				],
				[
					6,
					-20
				]
			],
			[
				[
					4765,
					5625
				],
				[
					-8,
					2
				],
				[
					-5,
					-24
				],
				[
					-8,
					1
				],
				[
					-6,
					12
				],
				[
					2,
					23
				],
				[
					-11,
					35
				],
				[
					-8,
					-6
				],
				[
					-6,
					-1
				]
			],
			[
				[
					4715,
					5667
				],
				[
					-7,
					-4
				],
				[
					0,
					21
				],
				[
					-4,
					15
				],
				[
					0,
					17
				],
				[
					-6,
					24
				],
				[
					-7,
					21
				],
				[
					-22,
					0
				],
				[
					-7,
					-11
				],
				[
					-8,
					-1
				],
				[
					-4,
					-13
				],
				[
					-4,
					-16
				],
				[
					-14,
					-25
				]
			],
			[
				[
					4632,
					5695
				],
				[
					-13,
					34
				],
				[
					-10,
					23
				],
				[
					-8,
					7
				],
				[
					-6,
					12
				],
				[
					-4,
					25
				],
				[
					-4,
					13
				],
				[
					-8,
					9
				]
			],
			[
				[
					4579,
					5818
				],
				[
					13,
					28
				],
				[
					8,
					-1
				],
				[
					7,
					10
				],
				[
					6,
					0
				],
				[
					5,
					8
				],
				[
					-3,
					19
				],
				[
					3,
					6
				],
				[
					1,
					19
				]
			],
			[
				[
					4619,
					5907
				],
				[
					13,
					0
				],
				[
					20,
					-14
				],
				[
					6,
					1
				],
				[
					3,
					6
				],
				[
					15,
					-4
				],
				[
					4,
					3
				]
			],
			[
				[
					4680,
					5899
				],
				[
					1,
					-21
				],
				[
					5,
					0
				],
				[
					7,
					8
				],
				[
					5,
					-2
				],
				[
					7,
					-15
				],
				[
					12,
					-5
				],
				[
					8,
					13
				],
				[
					9,
					8
				],
				[
					6,
					8
				],
				[
					6,
					-2
				],
				[
					6,
					-12
				],
				[
					3,
					-16
				],
				[
					12,
					-24
				],
				[
					-6,
					-15
				],
				[
					-1,
					-19
				],
				[
					6,
					6
				],
				[
					3,
					-7
				],
				[
					-1,
					-17
				],
				[
					8,
					-17
				]
			],
			[
				[
					4532,
					5940
				],
				[
					3,
					25
				]
			],
			[
				[
					4535,
					5965
				],
				[
					31,
					2
				],
				[
					6,
					14
				],
				[
					9,
					1
				],
				[
					11,
					-15
				],
				[
					8,
					0
				],
				[
					9,
					10
				],
				[
					6,
					-17
				],
				[
					-12,
					-13
				],
				[
					-12,
					1
				],
				[
					-12,
					12
				],
				[
					-10,
					-13
				],
				[
					-5,
					0
				],
				[
					-7,
					-8
				],
				[
					-25,
					1
				]
			],
			[
				[
					4579,
					5818
				],
				[
					-15,
					24
				],
				[
					-11,
					4
				],
				[
					-7,
					16
				],
				[
					1,
					9
				],
				[
					-9,
					12
				],
				[
					-2,
					13
				]
			],
			[
				[
					4536,
					5896
				],
				[
					15,
					9
				],
				[
					9,
					-2
				],
				[
					8,
					7
				],
				[
					51,
					-3
				]
			],
			[
				[
					5263,
					5241
				],
				[
					-5,
					8
				],
				[
					10,
					65
				]
			],
			[
				[
					5658,
					7238
				],
				[
					15,
					-19
				],
				[
					22,
					3
				],
				[
					20,
					-4
				],
				[
					0,
					-10
				],
				[
					15,
					7
				],
				[
					-4,
					-17
				],
				[
					-40,
					-5
				],
				[
					1,
					10
				],
				[
					-34,
					11
				],
				[
					5,
					24
				]
			],
			[
				[
					5723,
					7533
				],
				[
					-17,
					2
				],
				[
					-14,
					5
				],
				[
					-34,
					-15
				],
				[
					19,
					-32
				],
				[
					-14,
					-9
				],
				[
					-15,
					0
				],
				[
					-15,
					29
				],
				[
					-5,
					-12
				],
				[
					6,
					-35
				],
				[
					14,
					-27
				],
				[
					-10,
					-12
				],
				[
					15,
					-27
				],
				[
					14,
					-17
				],
				[
					0,
					-32
				],
				[
					-25,
					15
				],
				[
					8,
					-29
				],
				[
					-18,
					-6
				],
				[
					11,
					-51
				],
				[
					-19,
					-1
				],
				[
					-23,
					25
				],
				[
					-10,
					46
				],
				[
					-5,
					38
				],
				[
					-11,
					27
				],
				[
					-14,
					33
				],
				[
					-2,
					16
				]
			],
			[
				[
					5583,
					7534
				],
				[
					19,
					5
				],
				[
					10,
					13
				],
				[
					15,
					-1
				],
				[
					5,
					10
				],
				[
					5,
					2
				]
			],
			[
				[
					5725,
					7591
				],
				[
					13,
					-15
				],
				[
					-8,
					-36
				],
				[
					-7,
					-7
				]
			],
			[
				[
					3701,
					9940
				],
				[
					93,
					35
				],
				[
					97,
					-3
				],
				[
					36,
					21
				],
				[
					98,
					6
				],
				[
					222,
					-7
				],
				[
					174,
					-46
				],
				[
					-52,
					-22
				],
				[
					-106,
					-3
				],
				[
					-150,
					-5
				],
				[
					14,
					-10
				],
				[
					99,
					6
				],
				[
					83,
					-20
				],
				[
					54,
					18
				],
				[
					23,
					-21
				],
				[
					-30,
					-34
				],
				[
					71,
					22
				],
				[
					135,
					22
				],
				[
					83,
					-11
				],
				[
					15,
					-25
				],
				[
					-113,
					-40
				],
				[
					-16,
					-14
				],
				[
					-88,
					-10
				],
				[
					64,
					-2
				],
				[
					-32,
					-42
				],
				[
					-23,
					-38
				],
				[
					1,
					-64
				],
				[
					33,
					-37
				],
				[
					-43,
					-3
				],
				[
					-46,
					-18
				],
				[
					52,
					-31
				],
				[
					6,
					-49
				],
				[
					-30,
					-5
				],
				[
					36,
					-49
				],
				[
					-61,
					-5
				],
				[
					32,
					-23
				],
				[
					-9,
					-20
				],
				[
					-39,
					-9
				],
				[
					-39,
					0
				],
				[
					35,
					-39
				],
				[
					0,
					-26
				],
				[
					-55,
					24
				],
				[
					-14,
					-16
				],
				[
					37,
					-14
				],
				[
					37,
					-35
				],
				[
					10,
					-47
				],
				[
					-49,
					-11
				],
				[
					-22,
					23
				],
				[
					-34,
					33
				],
				[
					10,
					-39
				],
				[
					-33,
					-31
				],
				[
					73,
					-2
				],
				[
					39,
					-3
				],
				[
					-75,
					-50
				],
				[
					-75,
					-46
				],
				[
					-81,
					-20
				],
				[
					-31,
					0
				],
				[
					-29,
					-22
				],
				[
					-38,
					-61
				],
				[
					-60,
					-40
				],
				[
					-19,
					-3
				],
				[
					-37,
					-14
				],
				[
					-40,
					-13
				],
				[
					-24,
					-36
				],
				[
					0,
					-40
				],
				[
					-15,
					-38
				],
				[
					-45,
					-46
				],
				[
					11,
					-45
				],
				[
					-12,
					-48
				],
				[
					-14,
					-56
				],
				[
					-39,
					-3
				],
				[
					-41,
					47
				],
				[
					-56,
					0
				],
				[
					-27,
					31
				],
				[
					-18,
					57
				],
				[
					-49,
					71
				],
				[
					-14,
					38
				],
				[
					-3,
					52
				],
				[
					-39,
					53
				],
				[
					10,
					42
				],
				[
					-18,
					20
				],
				[
					27,
					68
				],
				[
					42,
					21
				],
				[
					11,
					24
				],
				[
					6,
					45
				],
				[
					-32,
					-20
				],
				[
					-15,
					-9
				],
				[
					-25,
					-8
				],
				[
					-34,
					19
				],
				[
					-2,
					39
				],
				[
					11,
					31
				],
				[
					25,
					0
				],
				[
					57,
					-15
				],
				[
					-48,
					37
				],
				[
					-24,
					19
				],
				[
					-28,
					-8
				],
				[
					-23,
					15
				],
				[
					31,
					53
				],
				[
					-17,
					22
				],
				[
					-22,
					39
				],
				[
					-34,
					62
				],
				[
					-35,
					22
				],
				[
					0,
					24
				],
				[
					-74,
					34
				],
				[
					-59,
					4
				],
				[
					-74,
					-2
				],
				[
					-68,
					-5
				],
				[
					-32,
					19
				],
				[
					-49,
					36
				],
				[
					73,
					18
				],
				[
					56,
					3
				],
				[
					-119,
					15
				],
				[
					-62,
					23
				],
				[
					4,
					23
				],
				[
					105,
					28
				],
				[
					101,
					27
				],
				[
					11,
					21
				],
				[
					-75,
					21
				],
				[
					24,
					23
				],
				[
					97,
					40
				],
				[
					40,
					6
				],
				[
					-12,
					26
				],
				[
					66,
					15
				],
				[
					86,
					9
				],
				[
					85,
					1
				],
				[
					30,
					-18
				],
				[
					74,
					32
				],
				[
					66,
					-22
				],
				[
					39,
					-5
				],
				[
					58,
					-18
				],
				[
					-66,
					31
				],
				[
					4,
					24
				]
			],
			[
				[
					2497,
					5973
				],
				[
					-14,
					10
				],
				[
					-17,
					1
				],
				[
					-13,
					12
				],
				[
					-15,
					24
				]
			],
			[
				[
					2438,
					6020
				],
				[
					1,
					16
				],
				[
					3,
					14
				],
				[
					-4,
					11
				],
				[
					13,
					47
				],
				[
					36,
					0
				],
				[
					1,
					19
				],
				[
					-5,
					4
				],
				[
					-3,
					12
				],
				[
					-10,
					14
				],
				[
					-11,
					19
				],
				[
					13,
					0
				],
				[
					0,
					32
				],
				[
					26,
					1
				],
				[
					26,
					-1
				]
			],
			[
				[
					2529,
					6097
				],
				[
					10,
					-10
				],
				[
					2,
					8
				],
				[
					8,
					-7
				]
			],
			[
				[
					2549,
					6088
				],
				[
					-13,
					-22
				],
				[
					-13,
					-16
				],
				[
					-2,
					-11
				],
				[
					2,
					-11
				],
				[
					-5,
					-15
				]
			],
			[
				[
					2518,
					6013
				],
				[
					-7,
					-3
				],
				[
					2,
					-7
				],
				[
					-6,
					-7
				],
				[
					-9,
					-14
				],
				[
					-1,
					-9
				]
			],
			[
				[
					3340,
					5664
				],
				[
					18,
					-21
				],
				[
					17,
					-37
				],
				[
					1,
					-30
				],
				[
					10,
					-1
				],
				[
					15,
					-29
				],
				[
					11,
					-20
				]
			],
			[
				[
					3412,
					5526
				],
				[
					-4,
					-51
				],
				[
					-17,
					-15
				],
				[
					1,
					-14
				],
				[
					-5,
					-30
				],
				[
					13,
					-42
				],
				[
					9,
					0
				],
				[
					3,
					-32
				],
				[
					17,
					-50
				]
			],
			[
				[
					3313,
					5482
				],
				[
					-19,
					44
				],
				[
					7,
					15
				],
				[
					0,
					27
				],
				[
					17,
					9
				],
				[
					7,
					11
				],
				[
					-10,
					21
				],
				[
					3,
					21
				],
				[
					22,
					34
				]
			],
			[
				[
					2574,
					5930
				],
				[
					-5,
					18
				],
				[
					-8,
					5
				]
			],
			[
				[
					2561,
					5953
				],
				[
					2,
					23
				],
				[
					-4,
					6
				],
				[
					-6,
					5
				],
				[
					-12,
					-7
				],
				[
					-1,
					7
				],
				[
					-8,
					10
				],
				[
					-6,
					11
				],
				[
					-8,
					5
				]
			],
			[
				[
					2549,
					6088
				],
				[
					3,
					-2
				],
				[
					6,
					10
				],
				[
					8,
					1
				],
				[
					3,
					-5
				],
				[
					4,
					3
				],
				[
					13,
					-5
				],
				[
					13,
					1
				],
				[
					9,
					7
				],
				[
					3,
					6
				],
				[
					9,
					-3
				],
				[
					6,
					-4
				],
				[
					8,
					2
				],
				[
					5,
					5
				],
				[
					13,
					-8
				],
				[
					4,
					-2
				],
				[
					9,
					-10
				],
				[
					8,
					-13
				],
				[
					10,
					-9
				],
				[
					7,
					-16
				]
			],
			[
				[
					2690,
					6046
				],
				[
					-9,
					1
				],
				[
					-4,
					-8
				],
				[
					-10,
					-7
				],
				[
					-7,
					0
				],
				[
					-6,
					-8
				],
				[
					-6,
					3
				],
				[
					-4,
					9
				],
				[
					-3,
					-2
				],
				[
					-4,
					-14
				],
				[
					-3,
					1
				],
				[
					0,
					-12
				],
				[
					-10,
					-16
				],
				[
					-5,
					-7
				],
				[
					-3,
					-7
				],
				[
					-8,
					12
				],
				[
					-6,
					-16
				],
				[
					-6,
					1
				],
				[
					-6,
					-1
				],
				[
					0,
					-29
				],
				[
					-4,
					0
				],
				[
					-3,
					-13
				],
				[
					-9,
					-3
				]
			],
			[
				[
					5523,
					7826
				],
				[
					6,
					-22
				],
				[
					9,
					-17
				],
				[
					-11,
					-21
				]
			],
			[
				[
					5515,
					7638
				],
				[
					-3,
					-9
				]
			],
			[
				[
					5512,
					7629
				],
				[
					-26,
					21
				],
				[
					-16,
					21
				],
				[
					-26,
					17
				],
				[
					-23,
					42
				],
				[
					6,
					4
				],
				[
					-13,
					25
				],
				[
					-1,
					19
				],
				[
					-17,
					9
				],
				[
					-9,
					-25
				],
				[
					-8,
					20
				],
				[
					0,
					20
				],
				[
					1,
					1
				]
			],
			[
				[
					5380,
					7803
				],
				[
					20,
					-2
				],
				[
					5,
					9
				],
				[
					9,
					-9
				],
				[
					11,
					-1
				],
				[
					0,
					16
				],
				[
					10,
					6
				],
				[
					2,
					23
				],
				[
					23,
					15
				]
			],
			[
				[
					5460,
					7860
				],
				[
					8,
					-7
				],
				[
					21,
					-24
				],
				[
					23,
					-12
				],
				[
					11,
					9
				]
			],
			[
				[
					3008,
					6222
				],
				[
					-19,
					9
				],
				[
					-13,
					-4
				],
				[
					-17,
					5
				],
				[
					-13,
					-11
				],
				[
					-15,
					18
				],
				[
					3,
					18
				],
				[
					25,
					-8
				],
				[
					21,
					-4
				],
				[
					10,
					12
				],
				[
					-12,
					25
				],
				[
					0,
					22
				],
				[
					-18,
					9
				],
				[
					7,
					16
				],
				[
					17,
					-2
				],
				[
					24,
					-9
				]
			],
			[
				[
					5471,
					7954
				],
				[
					14,
					-15
				],
				[
					10,
					-6
				],
				[
					24,
					7
				],
				[
					2,
					11
				],
				[
					11,
					2
				],
				[
					14,
					9
				],
				[
					3,
					-4
				],
				[
					13,
					7
				],
				[
					6,
					14
				],
				[
					9,
					3
				],
				[
					30,
					-17
				],
				[
					6,
					6
				]
			],
			[
				[
					5613,
					7971
				],
				[
					15,
					-16
				],
				[
					2,
					-15
				]
			],
			[
				[
					5630,
					7940
				],
				[
					-17,
					-12
				],
				[
					-13,
					-39
				],
				[
					-17,
					-40
				],
				[
					-22,
					-10
				]
			],
			[
				[
					5561,
					7839
				],
				[
					-17,
					2
				],
				[
					-21,
					-15
				]
			],
			[
				[
					5460,
					7860
				],
				[
					-6,
					20
				],
				[
					-4,
					0
				]
			],
			[
				[
					8352,
					4593
				],
				[
					-11,
					-1
				],
				[
					-37,
					40
				],
				[
					26,
					11
				],
				[
					14,
					-17
				],
				[
					10,
					-18
				],
				[
					-2,
					-15
				]
			],
			[
				[
					8471,
					4670
				],
				[
					2,
					-11
				],
				[
					1,
					-17
				]
			],
			[
				[
					8474,
					4642
				],
				[
					-18,
					-43
				],
				[
					-24,
					-13
				],
				[
					-3,
					7
				],
				[
					2,
					19
				],
				[
					12,
					36
				],
				[
					28,
					22
				]
			],
			[
				[
					8274,
					4716
				],
				[
					10,
					-15
				],
				[
					17,
					5
				],
				[
					7,
					-25
				],
				[
					-32,
					-11
				],
				[
					-19,
					-8
				],
				[
					-15,
					0
				],
				[
					10,
					33
				],
				[
					15,
					1
				],
				[
					7,
					20
				]
			],
			[
				[
					8413,
					4716
				],
				[
					-4,
					-32
				],
				[
					-42,
					-16
				],
				[
					-37,
					7
				],
				[
					0,
					21
				],
				[
					22,
					12
				],
				[
					18,
					-17
				],
				[
					18,
					4
				],
				[
					25,
					21
				]
			],
			[
				[
					8017,
					4792
				],
				[
					53,
					-6
				],
				[
					6,
					24
				],
				[
					51,
					-28
				],
				[
					10,
					-37
				],
				[
					42,
					-10
				],
				[
					34,
					-35
				],
				[
					-31,
					-21
				],
				[
					-31,
					23
				],
				[
					-25,
					-2
				],
				[
					-29,
					4
				],
				[
					-26,
					11
				],
				[
					-32,
					22
				],
				[
					-21,
					5
				],
				[
					-11,
					-7
				],
				[
					-51,
					24
				],
				[
					-5,
					25
				],
				[
					-25,
					4
				],
				[
					19,
					55
				],
				[
					34,
					-3
				],
				[
					22,
					-23
				],
				[
					12,
					-4
				],
				[
					4,
					-21
				]
			],
			[
				[
					8741,
					4825
				],
				[
					-14,
					-40
				],
				[
					-3,
					44
				],
				[
					5,
					20
				],
				[
					6,
					20
				],
				[
					7,
					-17
				],
				[
					-1,
					-27
				]
			],
			[
				[
					8534,
					4983
				],
				[
					-11,
					-19
				],
				[
					-19,
					11
				],
				[
					-5,
					25
				],
				[
					28,
					2
				],
				[
					7,
					-19
				]
			],
			[
				[
					8623,
					5004
				],
				[
					10,
					-44
				],
				[
					-23,
					24
				],
				[
					-23,
					5
				],
				[
					-16,
					-4
				],
				[
					-19,
					2
				],
				[
					6,
					32
				],
				[
					35,
					2
				],
				[
					30,
					-17
				]
			],
			[
				[
					8916,
					5033
				],
				[
					0,
					-188
				],
				[
					1,
					-188
				]
			],
			[
				[
					8917,
					4657
				],
				[
					-25,
					48
				],
				[
					-28,
					11
				],
				[
					-7,
					-16
				],
				[
					-35,
					-2
				],
				[
					12,
					47
				],
				[
					17,
					16
				],
				[
					-7,
					63
				],
				[
					-14,
					48
				],
				[
					-53,
					49
				],
				[
					-23,
					4
				],
				[
					-42,
					54
				],
				[
					-8,
					-28
				],
				[
					-11,
					-5
				],
				[
					-6,
					21
				],
				[
					0,
					25
				],
				[
					-21,
					28
				],
				[
					29,
					21
				],
				[
					20,
					-1
				],
				[
					-2,
					15
				],
				[
					-41,
					0
				],
				[
					-11,
					34
				],
				[
					-25,
					11
				],
				[
					-11,
					28
				],
				[
					37,
					14
				],
				[
					14,
					19
				],
				[
					45,
					-23
				],
				[
					4,
					-22
				],
				[
					8,
					-93
				],
				[
					29,
					-34
				],
				[
					23,
					61
				],
				[
					32,
					34
				],
				[
					25,
					0
				],
				[
					23,
					-20
				],
				[
					21,
					-20
				],
				[
					30,
					-11
				]
			],
			[
				[
					8478,
					5264
				],
				[
					-22,
					-57
				],
				[
					-21,
					-11
				],
				[
					-27,
					11
				],
				[
					-46,
					-3
				],
				[
					-24,
					-8
				],
				[
					-4,
					-43
				],
				[
					24,
					-52
				],
				[
					15,
					26
				],
				[
					52,
					20
				],
				[
					-2,
					-27
				],
				[
					-12,
					9
				],
				[
					-12,
					-34
				],
				[
					-25,
					-22
				],
				[
					27,
					-74
				],
				[
					-5,
					-20
				],
				[
					25,
					-66
				],
				[
					-1,
					-38
				],
				[
					-14,
					-17
				],
				[
					-11,
					20
				],
				[
					13,
					47
				],
				[
					-27,
					-22
				],
				[
					-7,
					16
				],
				[
					3,
					22
				],
				[
					-20,
					34
				],
				[
					3,
					56
				],
				[
					-19,
					-17
				],
				[
					2,
					-67
				],
				[
					1,
					-83
				],
				[
					-17,
					-8
				],
				[
					-12,
					17
				],
				[
					8,
					53
				],
				[
					-4,
					55
				],
				[
					-12,
					1
				],
				[
					-9,
					39
				],
				[
					12,
					38
				],
				[
					4,
					46
				],
				[
					14,
					86
				],
				[
					5,
					24
				],
				[
					24,
					43
				],
				[
					22,
					-17
				],
				[
					35,
					-8
				],
				[
					32,
					2
				],
				[
					27,
					42
				],
				[
					5,
					-13
				]
			],
			[
				[
					8574,
					5248
				],
				[
					-2,
					-51
				],
				[
					-14,
					6
				],
				[
					-4,
					-35
				],
				[
					11,
					-30
				],
				[
					-8,
					-7
				],
				[
					-11,
					36
				],
				[
					-8,
					74
				],
				[
					6,
					46
				],
				[
					9,
					21
				],
				[
					2,
					-32
				],
				[
					16,
					-5
				],
				[
					3,
					-23
				]
			],
			[
				[
					8045,
					5298
				],
				[
					5,
					-38
				],
				[
					19,
					-33
				],
				[
					18,
					12
				],
				[
					18,
					-4
				],
				[
					16,
					29
				],
				[
					13,
					5
				],
				[
					26,
					-16
				],
				[
					23,
					12
				],
				[
					14,
					80
				],
				[
					11,
					20
				],
				[
					10,
					65
				],
				[
					32,
					0
				],
				[
					24,
					-9
				]
			],
			[
				[
					8274,
					5421
				],
				[
					-16,
					-52
				],
				[
					20,
					-55
				],
				[
					-4,
					-26
				],
				[
					31,
					-54
				],
				[
					-33,
					-6
				],
				[
					-10,
					-40
				],
				[
					2,
					-52
				],
				[
					-27,
					-39
				],
				[
					-1,
					-58
				],
				[
					-10,
					-88
				],
				[
					-5,
					21
				],
				[
					-31,
					-26
				],
				[
					-11,
					35
				],
				[
					-20,
					3
				],
				[
					-14,
					19
				],
				[
					-33,
					-21
				],
				[
					-10,
					28
				],
				[
					-18,
					-3
				],
				[
					-23,
					7
				],
				[
					-4,
					77
				],
				[
					-14,
					16
				],
				[
					-13,
					49
				],
				[
					-4,
					50
				],
				[
					3,
					54
				],
				[
					16,
					38
				]
			],
			[
				[
					7939,
					4845
				],
				[
					-31,
					-1
				],
				[
					-24,
					48
				],
				[
					-35,
					47
				],
				[
					-12,
					35
				],
				[
					-21,
					47
				],
				[
					-14,
					43
				],
				[
					-21,
					81
				],
				[
					-24,
					48
				],
				[
					-9,
					50
				],
				[
					-10,
					44
				],
				[
					-25,
					37
				],
				[
					-14,
					49
				],
				[
					-21,
					32
				],
				[
					-29,
					64
				],
				[
					-3,
					29
				],
				[
					18,
					-2
				],
				[
					43,
					-11
				],
				[
					25,
					-57
				],
				[
					21,
					-39
				],
				[
					16,
					-24
				],
				[
					26,
					-62
				],
				[
					28,
					-1
				],
				[
					23,
					-39
				],
				[
					16,
					-48
				],
				[
					22,
					-27
				],
				[
					-12,
					-47
				],
				[
					16,
					-20
				],
				[
					10,
					-1
				],
				[
					5,
					-40
				],
				[
					10,
					-32
				],
				[
					20,
					-5
				],
				[
					14,
					-37
				],
				[
					-7,
					-71
				],
				[
					-1,
					-90
				]
			],
			[
				[
					7252,
					6921
				],
				[
					-17,
					-27
				],
				[
					-11,
					-53
				],
				[
					27,
					-22
				],
				[
					26,
					-28
				],
				[
					36,
					-33
				],
				[
					38,
					-7
				],
				[
					16,
					-30
				],
				[
					22,
					-5
				],
				[
					33,
					-13
				],
				[
					23,
					1
				],
				[
					4,
					22
				],
				[
					-4,
					37
				],
				[
					2,
					25
				]
			],
			[
				[
					7703,
					6810
				],
				[
					2,
					-22
				],
				[
					-10,
					-11
				],
				[
					2,
					-35
				],
				[
					-19,
					10
				],
				[
					-36,
					-39
				],
				[
					0,
					-33
				],
				[
					-15,
					-49
				],
				[
					-1,
					-28
				],
				[
					-13,
					-47
				],
				[
					-21,
					13
				],
				[
					-1,
					-60
				],
				[
					-7,
					-19
				],
				[
					3,
					-25
				],
				[
					-14,
					-13
				]
			],
			[
				[
					7472,
					6453
				],
				[
					-4,
					-22
				],
				[
					-19,
					1
				],
				[
					-34,
					-12
				],
				[
					2,
					-43
				],
				[
					-15,
					-34
				],
				[
					-40,
					-39
				],
				[
					-31,
					-68
				],
				[
					-21,
					-36
				],
				[
					-28,
					-38
				],
				[
					0,
					-26
				],
				[
					-13,
					-14
				],
				[
					-25,
					-21
				],
				[
					-13,
					-3
				],
				[
					-9,
					-44
				],
				[
					6,
					-75
				],
				[
					1,
					-48
				],
				[
					-11,
					-54
				],
				[
					0,
					-98
				],
				[
					-15,
					-3
				],
				[
					-12,
					-44
				],
				[
					8,
					-19
				],
				[
					-25,
					-16
				],
				[
					-10,
					-39
				],
				[
					-11,
					-17
				],
				[
					-26,
					54
				],
				[
					-13,
					81
				],
				[
					-11,
					58
				],
				[
					-9,
					27
				],
				[
					-15,
					55
				],
				[
					-7,
					72
				],
				[
					-5,
					36
				],
				[
					-25,
					79
				],
				[
					-12,
					112
				],
				[
					-8,
					74
				],
				[
					0,
					69
				],
				[
					-5,
					54
				],
				[
					-41,
					-34
				],
				[
					-19,
					7
				],
				[
					-36,
					69
				],
				[
					13,
					21
				],
				[
					-8,
					23
				],
				[
					-33,
					49
				]
			],
			[
				[
					6893,
					6547
				],
				[
					19,
					38
				],
				[
					61,
					0
				],
				[
					-6,
					49
				],
				[
					-15,
					30
				],
				[
					-4,
					44
				],
				[
					-18,
					26
				],
				[
					31,
					60
				],
				[
					32,
					-4
				],
				[
					29,
					60
				],
				[
					18,
					59
				],
				[
					27,
					57
				],
				[
					-1,
					41
				],
				[
					24,
					34
				],
				[
					-23,
					28
				],
				[
					-9,
					39
				],
				[
					-10,
					51
				],
				[
					14,
					24
				],
				[
					42,
					-14
				],
				[
					31,
					9
				],
				[
					26,
					48
				]
			],
			[
				[
					4827,
					8284
				],
				[
					5,
					-41
				],
				[
					-21,
					-51
				],
				[
					-49,
					-34
				],
				[
					-40,
					8
				],
				[
					23,
					61
				],
				[
					-15,
					58
				],
				[
					38,
					45
				],
				[
					21,
					27
				]
			],
			[
				[
					6497,
					7324
				],
				[
					25,
					12
				],
				[
					19,
					33
				],
				[
					19,
					-2
				],
				[
					12,
					11
				],
				[
					20,
					-6
				],
				[
					31,
					-29
				],
				[
					22,
					-6
				],
				[
					31,
					-51
				],
				[
					21,
					-2
				],
				[
					3,
					-49
				]
			],
			[
				[
					6690,
					6900
				],
				[
					14,
					-30
				],
				[
					11,
					-35
				],
				[
					27,
					-25
				],
				[
					1,
					-51
				],
				[
					13,
					-9
				],
				[
					2,
					-27
				],
				[
					-40,
					-30
				],
				[
					-10,
					-66
				]
			],
			[
				[
					6708,
					6627
				],
				[
					-53,
					17
				],
				[
					-30,
					13
				],
				[
					-31,
					8
				],
				[
					-12,
					70
				],
				[
					-13,
					10
				],
				[
					-22,
					-10
				],
				[
					-28,
					-28
				],
				[
					-34,
					19
				],
				[
					-28,
					45
				],
				[
					-27,
					16
				],
				[
					-18,
					55
				],
				[
					-21,
					76
				],
				[
					-14,
					-9
				],
				[
					-18,
					19
				],
				[
					-11,
					-22
				]
			],
			[
				[
					6348,
					6906
				],
				[
					-15,
					30
				],
				[
					0,
					31
				],
				[
					-9,
					0
				],
				[
					5,
					41
				],
				[
					-15,
					44
				],
				[
					-34,
					32
				],
				[
					-19,
					54
				],
				[
					6,
					45
				],
				[
					14,
					20
				],
				[
					-2,
					34
				],
				[
					-18,
					17
				],
				[
					-18,
					69
				]
			],
			[
				[
					6243,
					7323
				],
				[
					-15,
					46
				],
				[
					5,
					18
				],
				[
					-8,
					66
				],
				[
					19,
					16
				]
			],
			[
				[
					6357,
					7389
				],
				[
					9,
					-42
				],
				[
					26,
					-12
				],
				[
					20,
					-29
				],
				[
					39,
					-10
				],
				[
					44,
					15
				],
				[
					2,
					13
				]
			],
			[
				[
					6348,
					6906
				],
				[
					-16,
					3
				]
			],
			[
				[
					6332,
					6909
				],
				[
					-19,
					4
				],
				[
					-20,
					-55
				]
			],
			[
				[
					6293,
					6858
				],
				[
					-52,
					5
				],
				[
					-78,
					115
				],
				[
					-41,
					41
				],
				[
					-34,
					15
				]
			],
			[
				[
					6088,
					7034
				],
				[
					-11,
					71
				]
			],
			[
				[
					6077,
					7105
				],
				[
					61,
					59
				],
				[
					11,
					70
				],
				[
					-3,
					42
				],
				[
					16,
					14
				],
				[
					14,
					36
				]
			],
			[
				[
					6176,
					7326
				],
				[
					12,
					9
				],
				[
					32,
					-7
				],
				[
					10,
					-15
				],
				[
					13,
					10
				]
			],
			[
				[
					4597,
					9009
				],
				[
					-7,
					-37
				],
				[
					31,
					-39
				],
				[
					-36,
					-44
				],
				[
					-80,
					-40
				],
				[
					-24,
					-10
				],
				[
					-36,
					8
				],
				[
					-78,
					18
				],
				[
					28,
					26
				],
				[
					-61,
					28
				],
				[
					49,
					11
				],
				[
					-1,
					17
				],
				[
					-58,
					14
				],
				[
					19,
					37
				],
				[
					42,
					9
				],
				[
					43,
					-39
				],
				[
					42,
					31
				],
				[
					35,
					-16
				],
				[
					45,
					30
				],
				[
					47,
					-4
				]
			],
			[
				[
					5992,
					7066
				],
				[
					-5,
					-18
				]
			],
			[
				[
					5987,
					7048
				],
				[
					-10,
					8
				],
				[
					-6,
					-39
				],
				[
					7,
					-6
				],
				[
					-7,
					-8
				],
				[
					-1,
					-15
				],
				[
					13,
					8
				]
			],
			[
				[
					5983,
					6996
				],
				[
					0,
					-23
				],
				[
					-14,
					-92
				]
			],
			[
				[
					5951,
					6980
				],
				[
					8,
					19
				],
				[
					-2,
					3
				],
				[
					8,
					27
				],
				[
					5,
					44
				],
				[
					4,
					14
				],
				[
					1,
					1
				]
			],
			[
				[
					5975,
					7088
				],
				[
					9,
					0
				],
				[
					3,
					10
				],
				[
					7,
					1
				]
			],
			[
				[
					5994,
					7099
				],
				[
					1,
					-24
				],
				[
					-4,
					-9
				],
				[
					1,
					0
				]
			],
			[
				[
					5431,
					7384
				],
				[
					-10,
					-45
				],
				[
					4,
					-18
				],
				[
					-6,
					-30
				],
				[
					-21,
					22
				],
				[
					-14,
					6
				],
				[
					-39,
					29
				],
				[
					4,
					30
				],
				[
					32,
					-5
				],
				[
					28,
					6
				],
				[
					22,
					5
				]
			],
			[
				[
					5255,
					7555
				],
				[
					17,
					-40
				],
				[
					-4,
					-77
				],
				[
					-13,
					4
				],
				[
					-11,
					-19
				],
				[
					-10,
					15
				],
				[
					-2,
					70
				],
				[
					-6,
					32
				],
				[
					15,
					-2
				],
				[
					14,
					17
				]
			],
			[
				[
					5383,
					7861
				],
				[
					-3,
					-29
				],
				[
					7,
					-24
				]
			],
			[
				[
					5387,
					7808
				],
				[
					-22,
					8
				],
				[
					-23,
					-20
				],
				[
					1,
					-29
				],
				[
					-3,
					-16
				],
				[
					9,
					-30
				],
				[
					26,
					-29
				],
				[
					14,
					-47
				],
				[
					31,
					-47
				],
				[
					22,
					1
				],
				[
					7,
					-13
				],
				[
					-8,
					-11
				],
				[
					25,
					-21
				],
				[
					20,
					-18
				],
				[
					24,
					-30
				],
				[
					3,
					-10
				],
				[
					-5,
					-21
				],
				[
					-16,
					27
				],
				[
					-24,
					9
				],
				[
					-12,
					-37
				],
				[
					20,
					-21
				],
				[
					-3,
					-30
				],
				[
					-11,
					-4
				],
				[
					-15,
					-49
				],
				[
					-12,
					-5
				],
				[
					0,
					18
				],
				[
					6,
					31
				],
				[
					6,
					12
				],
				[
					-11,
					34
				],
				[
					-8,
					29
				],
				[
					-12,
					7
				],
				[
					-8,
					25
				],
				[
					-18,
					10
				],
				[
					-12,
					23
				],
				[
					-21,
					4
				],
				[
					-21,
					26
				],
				[
					-26,
					37
				],
				[
					-19,
					34
				],
				[
					-8,
					57
				],
				[
					-14,
					6
				],
				[
					-23,
					19
				],
				[
					-12,
					-8
				],
				[
					-16,
					-26
				],
				[
					-12,
					-5
				]
			],
			[
				[
					2845,
					6247
				],
				[
					19,
					-5
				],
				[
					14,
					-14
				],
				[
					5,
					-16
				],
				[
					-19,
					-1
				],
				[
					-9,
					-9
				],
				[
					-15,
					9
				],
				[
					-16,
					21
				],
				[
					3,
					13
				],
				[
					12,
					4
				],
				[
					6,
					-2
				]
			],
			[
				[
					5992,
					7066
				],
				[
					31,
					-23
				],
				[
					54,
					62
				]
			],
			[
				[
					6088,
					7034
				],
				[
					-5,
					-8
				],
				[
					-56,
					-29
				],
				[
					28,
					-58
				],
				[
					-9,
					-10
				],
				[
					-5,
					-19
				],
				[
					-21,
					-8
				],
				[
					-7,
					-21
				],
				[
					-12,
					-17
				],
				[
					-31,
					9
				]
			],
			[
				[
					5970,
					6873
				],
				[
					-1,
					8
				]
			],
			[
				[
					5983,
					6996
				],
				[
					4,
					17
				],
				[
					0,
					35
				]
			],
			[
				[
					8739,
					7149
				],
				[
					4,
					-20
				],
				[
					-16,
					-35
				],
				[
					-11,
					19
				],
				[
					-15,
					-14
				],
				[
					-7,
					-33
				],
				[
					-18,
					16
				],
				[
					0,
					27
				],
				[
					15,
					35
				],
				[
					16,
					-7
				],
				[
					12,
					24
				],
				[
					20,
					-12
				]
			],
			[
				[
					8915,
					7321
				],
				[
					-10,
					-46
				],
				[
					5,
					-29
				],
				[
					-15,
					-40
				],
				[
					-35,
					-27
				],
				[
					-49,
					-4
				],
				[
					-40,
					-66
				],
				[
					-19,
					23
				],
				[
					-1,
					43
				],
				[
					-48,
					-13
				],
				[
					-33,
					-27
				],
				[
					-32,
					-1
				],
				[
					28,
					-43
				],
				[
					-19,
					-98
				],
				[
					-18,
					-24
				],
				[
					-13,
					23
				],
				[
					7,
					52
				],
				[
					-18,
					16
				],
				[
					-11,
					40
				],
				[
					26,
					17
				],
				[
					15,
					37
				],
				[
					28,
					29
				],
				[
					20,
					40
				],
				[
					55,
					17
				],
				[
					30,
					-12
				],
				[
					29,
					103
				],
				[
					19,
					-28
				],
				[
					40,
					58
				],
				[
					16,
					22
				],
				[
					18,
					70
				],
				[
					-5,
					65
				],
				[
					11,
					37
				],
				[
					30,
					10
				],
				[
					15,
					-80
				],
				[
					-1,
					-46
				],
				[
					-25,
					-58
				],
				[
					0,
					-60
				]
			],
			[
				[
					8997,
					7726
				],
				[
					19,
					-12
				],
				[
					20,
					24
				],
				[
					6,
					-64
				],
				[
					-41,
					-16
				],
				[
					-25,
					-57
				],
				[
					-43,
					39
				],
				[
					-15,
					-63
				],
				[
					-31,
					-1
				],
				[
					-4,
					57
				],
				[
					14,
					45
				],
				[
					29,
					3
				],
				[
					8,
					80
				],
				[
					9,
					44
				],
				[
					32,
					-59
				],
				[
					22,
					-20
				]
			],
			[
				[
					6970,
					7616
				],
				[
					-15,
					-10
				],
				[
					-37,
					-41
				],
				[
					-12,
					-41
				],
				[
					-11,
					0
				],
				[
					-7,
					27
				],
				[
					-36,
					2
				],
				[
					-5,
					47
				],
				[
					-14,
					1
				],
				[
					2,
					57
				],
				[
					-33,
					42
				],
				[
					-48,
					-4
				],
				[
					-32,
					-8
				],
				[
					-27,
					51
				],
				[
					-22,
					22
				],
				[
					-43,
					41
				],
				[
					-6,
					5
				],
				[
					-71,
					-34
				],
				[
					1,
					-212
				]
			],
			[
				[
					6554,
					7561
				],
				[
					-14,
					-3
				],
				[
					-20,
					45
				],
				[
					-18,
					17
				],
				[
					-32,
					-12
				],
				[
					-12,
					-20
				]
			],
			[
				[
					6458,
					7588
				],
				[
					-2,
					15
				],
				[
					7,
					24
				],
				[
					-5,
					20
				],
				[
					-32,
					19
				],
				[
					-13,
					52
				],
				[
					-15,
					14
				],
				[
					-1,
					19
				],
				[
					27,
					-5
				],
				[
					1,
					42
				],
				[
					23,
					9
				],
				[
					25,
					-8
				],
				[
					5,
					56
				],
				[
					-5,
					35
				],
				[
					-28,
					-2
				],
				[
					-24,
					14
				],
				[
					-32,
					-26
				],
				[
					-26,
					-12
				]
			],
			[
				[
					6363,
					7854
				],
				[
					-14,
					10
				],
				[
					3,
					29
				],
				[
					-18,
					39
				],
				[
					-20,
					-2
				],
				[
					-24,
					39
				],
				[
					16,
					44
				],
				[
					-8,
					12
				],
				[
					22,
					63
				],
				[
					29,
					-34
				],
				[
					3,
					42
				],
				[
					58,
					63
				],
				[
					43,
					2
				],
				[
					61,
					-40
				],
				[
					33,
					-24
				],
				[
					30,
					25
				],
				[
					44,
					1
				],
				[
					35,
					-30
				],
				[
					8,
					17
				],
				[
					39,
					-2
				],
				[
					7,
					27
				],
				[
					-45,
					40
				],
				[
					27,
					28
				],
				[
					-5,
					15
				],
				[
					26,
					15
				],
				[
					-20,
					40
				],
				[
					13,
					19
				],
				[
					104,
					20
				],
				[
					13,
					15
				],
				[
					70,
					21
				],
				[
					25,
					24
				],
				[
					50,
					-13
				],
				[
					9,
					-59
				],
				[
					29,
					14
				],
				[
					35,
					-20
				],
				[
					-2,
					-31
				],
				[
					27,
					3
				],
				[
					69,
					54
				],
				[
					-10,
					-18
				],
				[
					35,
					-44
				],
				[
					62,
					-147
				],
				[
					15,
					31
				],
				[
					39,
					-34
				],
				[
					39,
					15
				],
				[
					16,
					-10
				],
				[
					13,
					-33
				],
				[
					20,
					-12
				],
				[
					11,
					-24
				],
				[
					36,
					8
				],
				[
					15,
					-36
				]
			],
			[
				[
					7229,
					7621
				],
				[
					-17,
					9
				],
				[
					-14,
					20
				],
				[
					-42,
					6
				],
				[
					-46,
					2
				],
				[
					-10,
					-6
				],
				[
					-39,
					24
				],
				[
					-16,
					-12
				],
				[
					-4,
					-34
				],
				[
					-46,
					20
				],
				[
					-18,
					-8
				],
				[
					-7,
					-26
				]
			],
			[
				[
					6155,
					5086
				],
				[
					-20,
					-23
				],
				[
					-7,
					-24
				],
				[
					-10,
					-5
				],
				[
					-4,
					-40
				],
				[
					-9,
					-24
				],
				[
					-5,
					-38
				],
				[
					-12,
					-19
				]
			],
			[
				[
					6088,
					4913
				],
				[
					-40,
					58
				],
				[
					-1,
					33
				],
				[
					-101,
					117
				],
				[
					-5,
					7
				]
			],
			[
				[
					5941,
					5128
				],
				[
					0,
					61
				],
				[
					8,
					23
				],
				[
					14,
					38
				],
				[
					10,
					42
				],
				[
					-13,
					66
				],
				[
					-3,
					29
				],
				[
					-13,
					40
				]
			],
			[
				[
					5944,
					5427
				],
				[
					17,
					35
				],
				[
					19,
					38
				]
			],
			[
				[
					6162,
					5408
				],
				[
					-24,
					-65
				],
				[
					0,
					-210
				],
				[
					17,
					-47
				]
			],
			[
				[
					7046,
					7453
				],
				[
					-53,
					-9
				],
				[
					-34,
					19
				],
				[
					-30,
					-4
				],
				[
					3,
					33
				],
				[
					30,
					-10
				],
				[
					10,
					18
				]
			],
			[
				[
					6972,
					7500
				],
				[
					21,
					-6
				],
				[
					36,
					42
				],
				[
					-33,
					30
				],
				[
					-20,
					-14
				],
				[
					-21,
					21
				],
				[
					24,
					38
				],
				[
					-9,
					5
				]
			],
			[
				[
					7849,
					5884
				],
				[
					-7,
					70
				],
				[
					18,
					48
				],
				[
					36,
					11
				],
				[
					26,
					-9
				]
			],
			[
				[
					7922,
					6004
				],
				[
					23,
					-22
				],
				[
					12,
					39
				],
				[
					25,
					-21
				]
			],
			[
				[
					7982,
					6000
				],
				[
					6,
					-38
				],
				[
					-3,
					-69
				],
				[
					-47,
					-44
				],
				[
					13,
					-35
				],
				[
					-30,
					-4
				],
				[
					-24,
					-24
				]
			],
			[
				[
					7897,
					5786
				],
				[
					-23,
					9
				],
				[
					-11,
					30
				],
				[
					-14,
					59
				]
			],
			[
				[
					8564,
					7406
				],
				[
					24,
					-68
				],
				[
					7,
					-37
				],
				[
					0,
					-67
				],
				[
					-10,
					-31
				],
				[
					-25,
					-11
				],
				[
					-22,
					-24
				],
				[
					-25,
					-5
				],
				[
					-3,
					31
				],
				[
					5,
					43
				],
				[
					-13,
					60
				],
				[
					21,
					10
				],
				[
					-19,
					49
				]
			],
			[
				[
					8504,
					7356
				],
				[
					2,
					5
				],
				[
					12,
					-2
				],
				[
					11,
					26
				],
				[
					20,
					3
				],
				[
					11,
					4
				],
				[
					4,
					14
				]
			],
			[
				[
					5557,
					7635
				],
				[
					5,
					13
				]
			],
			[
				[
					5562,
					7648
				],
				[
					7,
					4
				],
				[
					4,
					19
				],
				[
					5,
					3
				],
				[
					4,
					-8
				],
				[
					5,
					-4
				],
				[
					3,
					-9
				],
				[
					5,
					-2
				],
				[
					5,
					-11
				],
				[
					4,
					0
				],
				[
					-3,
					-14
				],
				[
					-3,
					-7
				],
				[
					1,
					-4
				]
			],
			[
				[
					5599,
					7615
				],
				[
					-6,
					-2
				],
				[
					-17,
					-9
				],
				[
					-1,
					-12
				],
				[
					-4,
					1
				]
			],
			[
				[
					6332,
					6909
				],
				[
					6,
					-26
				],
				[
					-3,
					-13
				],
				[
					9,
					-43
				]
			],
			[
				[
					6344,
					6827
				],
				[
					-19,
					-2
				],
				[
					-7,
					28
				],
				[
					-25,
					5
				]
			],
			[
				[
					7922,
					6004
				],
				[
					9,
					26
				],
				[
					1,
					49
				],
				[
					-22,
					50
				],
				[
					-2,
					57
				],
				[
					-21,
					47
				],
				[
					-21,
					4
				],
				[
					-6,
					-20
				],
				[
					-16,
					-2
				],
				[
					-8,
					10
				],
				[
					-30,
					-34
				],
				[
					0,
					52
				],
				[
					7,
					60
				],
				[
					-19,
					3
				],
				[
					-2,
					34
				],
				[
					-12,
					18
				]
			],
			[
				[
					7780,
					6358
				],
				[
					6,
					21
				],
				[
					24,
					38
				]
			],
			[
				[
					7837,
					6476
				],
				[
					17,
					-45
				],
				[
					12,
					-53
				],
				[
					34,
					0
				],
				[
					11,
					-50
				],
				[
					-18,
					-15
				],
				[
					-8,
					-21
				],
				[
					34,
					-35
				],
				[
					23,
					-68
				],
				[
					17,
					-50
				],
				[
					21,
					-40
				],
				[
					7,
					-41
				],
				[
					-5,
					-58
				]
			],
			[
				[
					5975,
					7088
				],
				[
					10,
					47
				],
				[
					14,
					40
				],
				[
					0,
					2
				]
			],
			[
				[
					5999,
					7177
				],
				[
					13,
					-3
				],
				[
					4,
					-22
				],
				[
					-15,
					-22
				],
				[
					-7,
					-31
				]
			],
			[
				[
					4785,
					5434
				],
				[
					-7,
					-1
				],
				[
					-29,
					28
				],
				[
					-25,
					44
				],
				[
					-24,
					31
				],
				[
					-18,
					37
				]
			],
			[
				[
					4682,
					5573
				],
				[
					6,
					19
				],
				[
					2,
					16
				],
				[
					12,
					32
				],
				[
					13,
					27
				]
			],
			[
				[
					5412,
					6499
				],
				[
					-20,
					-21
				],
				[
					-15,
					31
				],
				[
					-44,
					25
				]
			],
			[
				[
					5263,
					6928
				],
				[
					13,
					13
				],
				[
					3,
					24
				],
				[
					-3,
					24
				],
				[
					19,
					22
				],
				[
					8,
					19
				],
				[
					14,
					16
				],
				[
					2,
					45
				]
			],
			[
				[
					5319,
					7091
				],
				[
					32,
					-20
				],
				[
					12,
					5
				],
				[
					23,
					-10
				],
				[
					37,
					-26
				],
				[
					13,
					-51
				],
				[
					25,
					-11
				],
				[
					39,
					-24
				],
				[
					30,
					-29
				],
				[
					13,
					15
				],
				[
					13,
					27
				],
				[
					-6,
					44
				],
				[
					9,
					28
				],
				[
					20,
					27
				],
				[
					19,
					8
				],
				[
					37,
					-12
				],
				[
					10,
					-26
				],
				[
					10,
					0
				],
				[
					9,
					-10
				],
				[
					28,
					-7
				],
				[
					6,
					-19
				]
			],
			[
				[
					5694,
					6449
				],
				[
					0,
					-115
				],
				[
					-32,
					0
				],
				[
					0,
					-24
				]
			],
			[
				[
					5662,
					6310
				],
				[
					-111,
					110
				],
				[
					-111,
					110
				],
				[
					-28,
					-31
				]
			],
			[
				[
					7271,
					5616
				],
				[
					-4,
					-60
				],
				[
					-12,
					-17
				],
				[
					-24,
					-13
				],
				[
					-13,
					46
				],
				[
					-5,
					83
				],
				[
					13,
					93
				],
				[
					19,
					-32
				],
				[
					13,
					-40
				],
				[
					13,
					-60
				]
			],
			[
				[
					5804,
					3515
				],
				[
					10,
					-17
				],
				[
					-9,
					-28
				],
				[
					-4,
					-19
				],
				[
					-16,
					-9
				],
				[
					-5,
					-18
				],
				[
					-10,
					-6
				],
				[
					-21,
					44
				],
				[
					15,
					37
				],
				[
					15,
					22
				],
				[
					13,
					12
				],
				[
					12,
					-18
				]
			],
			[
				[
					5631,
					8311
				],
				[
					-2,
					15
				],
				[
					3,
					15
				],
				[
					-13,
					9
				],
				[
					-29,
					11
				]
			],
			[
				[
					5590,
					8361
				],
				[
					-6,
					48
				]
			],
			[
				[
					5584,
					8409
				],
				[
					32,
					18
				],
				[
					47,
					-4
				],
				[
					27,
					6
				],
				[
					4,
					-12
				],
				[
					15,
					-4
				],
				[
					26,
					-28
				]
			],
			[
				[
					5652,
					8287
				],
				[
					-7,
					18
				],
				[
					-14,
					6
				]
			],
			[
				[
					5584,
					8409
				],
				[
					1,
					43
				],
				[
					14,
					36
				],
				[
					26,
					20
				],
				[
					22,
					-43
				],
				[
					22,
					1
				],
				[
					6,
					44
				]
			],
			[
				[
					5757,
					8492
				],
				[
					14,
					-13
				],
				[
					2,
					-28
				],
				[
					9,
					-34
				]
			],
			[
				[
					4759,
					6775
				],
				[
					-4,
					0
				]
			],
			[
				[
					4755,
					6775
				],
				[
					0,
					-31
				],
				[
					-17,
					-2
				],
				[
					-9,
					-13
				],
				[
					-13,
					0
				],
				[
					-10,
					8
				],
				[
					-23,
					-7
				],
				[
					-9,
					-44
				],
				[
					-9,
					-5
				],
				[
					-13,
					-72
				],
				[
					-38,
					-62
				],
				[
					-9,
					-80
				],
				[
					-12,
					-26
				],
				[
					-3,
					-20
				],
				[
					-63,
					-5
				]
			],
			[
				[
					4527,
					6416
				],
				[
					1,
					27
				],
				[
					11,
					15
				],
				[
					9,
					30
				],
				[
					-2,
					20
				],
				[
					10,
					41
				],
				[
					15,
					36
				],
				[
					9,
					9
				],
				[
					8,
					34
				],
				[
					0,
					31
				],
				[
					10,
					35
				],
				[
					19,
					21
				],
				[
					18,
					59
				],
				[
					0,
					1
				],
				[
					14,
					22
				],
				[
					26,
					6
				],
				[
					22,
					40
				],
				[
					14,
					15
				],
				[
					23,
					48
				],
				[
					-7,
					72
				],
				[
					10,
					49
				],
				[
					4,
					31
				],
				[
					18,
					39
				],
				[
					28,
					26
				],
				[
					21,
					24
				],
				[
					18,
					59
				],
				[
					9,
					36
				],
				[
					20,
					-1
				],
				[
					17,
					-24
				],
				[
					26,
					4
				],
				[
					29,
					-13
				],
				[
					12,
					0
				]
			],
			[
				[
					5739,
					7959
				],
				[
					6,
					9
				],
				[
					19,
					5
				],
				[
					20,
					-18
				],
				[
					12,
					-2
				],
				[
					12,
					-15
				],
				[
					-2,
					-20
				],
				[
					11,
					-9
				],
				[
					4,
					-24
				],
				[
					9,
					-15
				],
				[
					-2,
					-8
				],
				[
					5,
					-6
				],
				[
					-7,
					-5
				],
				[
					-16,
					2
				],
				[
					-3,
					8
				],
				[
					-6,
					-4
				],
				[
					2,
					-11
				],
				[
					-7,
					-18
				],
				[
					-5,
					-20
				],
				[
					-7,
					-6
				]
			],
			[
				[
					5784,
					7802
				],
				[
					-5,
					26
				],
				[
					3,
					25
				],
				[
					-1,
					25
				],
				[
					-16,
					34
				],
				[
					-9,
					24
				],
				[
					-9,
					18
				],
				[
					-8,
					5
				]
			],
			[
				[
					6376,
					4464
				],
				[
					7,
					-24
				],
				[
					7,
					-38
				],
				[
					4,
					-69
				],
				[
					7,
					-27
				],
				[
					-2,
					-28
				],
				[
					-5,
					-17
				],
				[
					-10,
					34
				],
				[
					-5,
					-17
				],
				[
					5,
					-43
				],
				[
					-2,
					-24
				],
				[
					-8,
					-14
				],
				[
					-1,
					-48
				],
				[
					-11,
					-67
				],
				[
					-14,
					-80
				],
				[
					-17,
					-109
				],
				[
					-11,
					-80
				],
				[
					-12,
					-67
				],
				[
					-23,
					-13
				],
				[
					-24,
					-25
				],
				[
					-16,
					15
				],
				[
					-22,
					21
				],
				[
					-8,
					30
				],
				[
					-2,
					51
				],
				[
					-10,
					46
				],
				[
					-2,
					41
				],
				[
					5,
					42
				],
				[
					13,
					10
				],
				[
					0,
					19
				],
				[
					13,
					44
				],
				[
					3,
					36
				],
				[
					-7,
					28
				],
				[
					-5,
					36
				],
				[
					-2,
					53
				],
				[
					9,
					32
				],
				[
					4,
					37
				],
				[
					14,
					2
				],
				[
					15,
					12
				],
				[
					11,
					10
				],
				[
					12,
					1
				],
				[
					16,
					33
				],
				[
					23,
					35
				],
				[
					8,
					29
				],
				[
					-4,
					25
				],
				[
					12,
					-7
				],
				[
					15,
					40
				],
				[
					1,
					34
				],
				[
					9,
					26
				],
				[
					10,
					-25
				]
			],
			[
				[
					2301,
					6672
				],
				[
					-10,
					-50
				],
				[
					-5,
					-42
				],
				[
					-2,
					-77
				],
				[
					-3,
					-28
				],
				[
					5,
					-32
				],
				[
					9,
					-28
				],
				[
					5,
					-44
				],
				[
					19,
					-43
				],
				[
					6,
					-33
				],
				[
					11,
					-28
				],
				[
					29,
					-16
				],
				[
					12,
					-24
				],
				[
					24,
					16
				],
				[
					21,
					6
				],
				[
					21,
					11
				],
				[
					18,
					9
				],
				[
					17,
					24
				],
				[
					7,
					33
				],
				[
					2,
					49
				],
				[
					5,
					17
				],
				[
					19,
					15
				],
				[
					29,
					13
				],
				[
					25,
					-2
				],
				[
					17,
					5
				],
				[
					6,
					-12
				],
				[
					-1,
					-28
				],
				[
					-15,
					-34
				],
				[
					-6,
					-35
				],
				[
					5,
					-10
				],
				[
					-4,
					-25
				],
				[
					-7,
					-45
				],
				[
					-7,
					15
				],
				[
					-6,
					-1
				]
			],
			[
				[
					2438,
					6020
				],
				[
					-32,
					62
				],
				[
					-14,
					18
				],
				[
					-23,
					15
				],
				[
					-15,
					-4
				],
				[
					-22,
					-21
				],
				[
					-14,
					-6
				],
				[
					-20,
					15
				],
				[
					-21,
					11
				],
				[
					-26,
					26
				],
				[
					-21,
					8
				],
				[
					-31,
					27
				],
				[
					-23,
					28
				],
				[
					-7,
					15
				],
				[
					-16,
					4
				],
				[
					-28,
					18
				],
				[
					-12,
					26
				],
				[
					-30,
					33
				],
				[
					-14,
					36
				],
				[
					-6,
					28
				],
				[
					9,
					6
				],
				[
					-3,
					16
				],
				[
					7,
					15
				],
				[
					0,
					20
				],
				[
					-10,
					26
				],
				[
					-2,
					23
				],
				[
					-9,
					29
				],
				[
					-25,
					57
				],
				[
					-28,
					45
				],
				[
					-13,
					36
				],
				[
					-24,
					23
				],
				[
					-5,
					15
				],
				[
					4,
					35
				],
				[
					-14,
					14
				],
				[
					-17,
					28
				],
				[
					-7,
					40
				],
				[
					-14,
					4
				],
				[
					-17,
					31
				],
				[
					-13,
					28
				],
				[
					-1,
					18
				],
				[
					-15,
					43
				],
				[
					-10,
					44
				],
				[
					1,
					22
				],
				[
					-20,
					23
				],
				[
					-10,
					-2
				],
				[
					-15,
					16
				],
				[
					-5,
					-24
				],
				[
					5,
					-27
				],
				[
					2,
					-44
				],
				[
					10,
					-23
				],
				[
					21,
					-40
				],
				[
					4,
					-14
				],
				[
					4,
					-4
				],
				[
					4,
					-20
				],
				[
					5,
					1
				],
				[
					6,
					-37
				],
				[
					8,
					-15
				],
				[
					6,
					-20
				],
				[
					17,
					-29
				],
				[
					10,
					-54
				],
				[
					8,
					-25
				],
				[
					8,
					-27
				],
				[
					1,
					-30
				],
				[
					13,
					-2
				],
				[
					12,
					-26
				],
				[
					10,
					-26
				],
				[
					-1,
					-10
				],
				[
					-12,
					-22
				],
				[
					-5,
					1
				],
				[
					-7,
					35
				],
				[
					-18,
					33
				],
				[
					-20,
					27
				],
				[
					-14,
					15
				],
				[
					1,
					42
				],
				[
					-5,
					31
				],
				[
					-13,
					18
				],
				[
					-19,
					26
				],
				[
					-4,
					-8
				],
				[
					-7,
					15
				],
				[
					-17,
					14
				],
				[
					-16,
					34
				],
				[
					2,
					4
				],
				[
					11,
					-3
				],
				[
					11,
					21
				],
				[
					1,
					26
				],
				[
					-22,
					41
				],
				[
					-16,
					16
				],
				[
					-10,
					36
				],
				[
					-11,
					38
				],
				[
					-12,
					46
				],
				[
					-12,
					52
				]
			],
			[
				[
					1746,
					7056
				],
				[
					32,
					4
				],
				[
					35,
					7
				],
				[
					-2,
					-12
				],
				[
					41,
					-28
				],
				[
					64,
					-40
				],
				[
					55,
					0
				],
				[
					22,
					0
				],
				[
					0,
					24
				],
				[
					48,
					0
				],
				[
					10,
					-20
				],
				[
					15,
					-19
				],
				[
					16,
					-25
				],
				[
					9,
					-30
				],
				[
					7,
					-32
				],
				[
					15,
					-17
				],
				[
					23,
					-17
				],
				[
					17,
					45
				],
				[
					23,
					1
				],
				[
					19,
					-23
				],
				[
					14,
					-39
				],
				[
					10,
					-34
				],
				[
					16,
					-33
				],
				[
					6,
					-40
				],
				[
					8,
					-27
				],
				[
					22,
					-18
				],
				[
					20,
					-13
				],
				[
					10,
					2
				]
			],
			[
				[
					5599,
					7615
				],
				[
					9,
					3
				],
				[
					13,
					1
				]
			],
			[
				[
					4661,
					6024
				],
				[
					10,
					11
				],
				[
					4,
					34
				],
				[
					9,
					1
				],
				[
					20,
					-16
				],
				[
					15,
					11
				],
				[
					11,
					-4
				],
				[
					4,
					13
				],
				[
					112,
					1
				],
				[
					6,
					40
				],
				[
					-5,
					8
				],
				[
					-13,
					248
				],
				[
					-14,
					249
				],
				[
					43,
					1
				]
			],
			[
				[
					5118,
					6285
				],
				[
					0,
					-132
				],
				[
					-15,
					-39
				],
				[
					-2,
					-35
				],
				[
					-25,
					-9
				],
				[
					-38,
					-5
				],
				[
					-10,
					-21
				],
				[
					-18,
					-2
				]
			],
			[
				[
					4680,
					5899
				],
				[
					1,
					18
				],
				[
					-2,
					22
				],
				[
					-11,
					16
				],
				[
					-5,
					33
				],
				[
					-2,
					36
				]
			],
			[
				[
					7737,
					5754
				],
				[
					-3,
					43
				],
				[
					9,
					44
				],
				[
					-10,
					34
				],
				[
					3,
					63
				],
				[
					-12,
					30
				],
				[
					-9,
					69
				],
				[
					-5,
					73
				],
				[
					-12,
					47
				],
				[
					-18,
					-29
				],
				[
					-32,
					-41
				],
				[
					-15,
					5
				],
				[
					-17,
					14
				],
				[
					9,
					71
				],
				[
					-6,
					54
				],
				[
					-21,
					67
				],
				[
					3,
					20
				],
				[
					-16,
					8
				],
				[
					-20,
					47
				]
			],
			[
				[
					7780,
					6358
				],
				[
					-16,
					-13
				],
				[
					-16,
					-25
				],
				[
					-19,
					-3
				],
				[
					-13,
					-62
				],
				[
					-12,
					-10
				],
				[
					14,
					-51
				],
				[
					17,
					-42
				],
				[
					12,
					-38
				],
				[
					-11,
					-50
				],
				[
					-9,
					-11
				],
				[
					6,
					-29
				],
				[
					19,
					-45
				],
				[
					3,
					-32
				],
				[
					0,
					-27
				],
				[
					11,
					-53
				],
				[
					-16,
					-53
				],
				[
					-13,
					-60
				]
			],
			[
				[
					5538,
					7594
				],
				[
					-6,
					4
				],
				[
					-8,
					19
				],
				[
					-12,
					12
				]
			],
			[
				[
					5533,
					7689
				],
				[
					8,
					-10
				],
				[
					4,
					-8
				],
				[
					9,
					-6
				],
				[
					10,
					-12
				],
				[
					-2,
					-5
				]
			],
			[
				[
					7437,
					8021
				],
				[
					29,
					10
				],
				[
					53,
					50
				],
				[
					42,
					27
				],
				[
					24,
					-18
				],
				[
					29,
					-1
				],
				[
					19,
					-27
				],
				[
					28,
					-2
				],
				[
					40,
					-14
				],
				[
					27,
					40
				],
				[
					-11,
					34
				],
				[
					28,
					60
				],
				[
					31,
					-24
				],
				[
					26,
					-7
				],
				[
					32,
					-15
				],
				[
					6,
					-43
				],
				[
					39,
					-24
				],
				[
					26,
					10
				],
				[
					36,
					8
				],
				[
					27,
					-8
				],
				[
					28,
					-27
				],
				[
					16,
					-30
				],
				[
					26,
					1
				],
				[
					35,
					-9
				],
				[
					26,
					14
				],
				[
					36,
					9
				],
				[
					41,
					41
				],
				[
					17,
					-6
				],
				[
					14,
					-20
				],
				[
					33,
					5
				]
			],
			[
				[
					5959,
					4519
				],
				[
					21,
					5
				],
				[
					34,
					-16
				],
				[
					7,
					7
				]
			],
			[
				[
					6021,
					4515
				],
				[
					19,
					1
				],
				[
					10,
					18
				]
			],
			[
				[
					6050,
					4534
				],
				[
					17,
					-1
				],
				[
					30,
					22
				],
				[
					22,
					33
				]
			],
			[
				[
					6119,
					4588
				],
				[
					5,
					-25
				],
				[
					-1,
					-58
				],
				[
					3,
					-50
				],
				[
					1,
					-90
				],
				[
					5,
					-29
				],
				[
					-8,
					-41
				],
				[
					-11,
					-40
				],
				[
					-18,
					-35
				],
				[
					-25,
					-22
				],
				[
					-31,
					-28
				],
				[
					-32,
					-62
				],
				[
					-10,
					-11
				],
				[
					-20,
					-40
				],
				[
					-11,
					-14
				],
				[
					-3,
					-41
				],
				[
					14,
					-43
				],
				[
					5,
					-34
				],
				[
					0,
					-17
				],
				[
					5,
					2
				],
				[
					-1,
					-56
				],
				[
					-4,
					-27
				],
				[
					7,
					-10
				],
				[
					-5,
					-24
				],
				[
					-11,
					-20
				],
				[
					-23,
					-20
				],
				[
					-34,
					-31
				],
				[
					-12,
					-21
				],
				[
					3,
					-24
				],
				[
					7,
					-4
				],
				[
					-3,
					-30
				]
			],
			[
				[
					5911,
					3643
				],
				[
					-21,
					0
				]
			],
			[
				[
					5890,
					3643
				],
				[
					-2,
					26
				],
				[
					-4,
					25
				]
			],
			[
				[
					5884,
					3694
				],
				[
					-3,
					21
				],
				[
					5,
					64
				],
				[
					-7,
					41
				],
				[
					-13,
					81
				]
			],
			[
				[
					5866,
					3901
				],
				[
					29,
					66
				],
				[
					7,
					41
				],
				[
					5,
					5
				],
				[
					3,
					34
				],
				[
					-5,
					17
				],
				[
					1,
					43
				],
				[
					6,
					40
				],
				[
					0,
					73
				],
				[
					-15,
					19
				],
				[
					-13,
					4
				],
				[
					-6,
					14
				],
				[
					-13,
					12
				],
				[
					-23,
					-1
				],
				[
					-2,
					21
				]
			],
			[
				[
					5840,
					4289
				],
				[
					-2,
					41
				],
				[
					84,
					48
				]
			],
			[
				[
					5922,
					4378
				],
				[
					16,
					-28
				],
				[
					8,
					6
				],
				[
					11,
					-15
				],
				[
					1,
					-23
				],
				[
					-6,
					-27
				],
				[
					2,
					-40
				],
				[
					19,
					-36
				],
				[
					8,
					40
				],
				[
					12,
					12
				],
				[
					-2,
					74
				],
				[
					-12,
					42
				],
				[
					-10,
					18
				],
				[
					-10,
					-1
				],
				[
					-7,
					75
				],
				[
					7,
					44
				]
			],
			[
				[
					4661,
					6024
				],
				[
					-18,
					40
				],
				[
					-17,
					42
				],
				[
					-18,
					15
				],
				[
					-13,
					17
				],
				[
					-16,
					0
				],
				[
					-13,
					-13
				],
				[
					-14,
					5
				],
				[
					-10,
					-18
				]
			],
			[
				[
					4542,
					6112
				],
				[
					-2,
					31
				],
				[
					8,
					28
				],
				[
					3,
					54
				],
				[
					-3,
					57
				],
				[
					-3,
					29
				],
				[
					2,
					28
				],
				[
					-7,
					28
				],
				[
					-14,
					25
				]
			],
			[
				[
					4526,
					6392
				],
				[
					6,
					19
				],
				[
					108,
					0
				],
				[
					-5,
					83
				],
				[
					7,
					29
				],
				[
					26,
					5
				],
				[
					-1,
					148
				],
				[
					91,
					-3
				],
				[
					0,
					87
				]
			],
			[
				[
					5922,
					4378
				],
				[
					-15,
					15
				],
				[
					9,
					53
				],
				[
					9,
					20
				],
				[
					-6,
					48
				],
				[
					6,
					47
				],
				[
					5,
					15
				],
				[
					-7,
					49
				],
				[
					-14,
					26
				]
			],
			[
				[
					5909,
					4651
				],
				[
					28,
					-11
				],
				[
					5,
					-16
				],
				[
					10,
					-27
				],
				[
					7,
					-78
				]
			],
			[
				[
					7836,
					5541
				],
				[
					7,
					-6
				],
				[
					16,
					-34
				],
				[
					12,
					-39
				],
				[
					2,
					-39
				],
				[
					-3,
					-26
				],
				[
					2,
					-20
				],
				[
					2,
					-34
				],
				[
					10,
					-16
				],
				[
					11,
					-51
				],
				[
					-1,
					-19
				],
				[
					-19,
					-4
				],
				[
					-27,
					43
				],
				[
					-32,
					45
				],
				[
					-4,
					30
				],
				[
					-16,
					38
				],
				[
					-4,
					48
				],
				[
					-10,
					31
				],
				[
					4,
					42
				],
				[
					-7,
					25
				]
			],
			[
				[
					7779,
					5555
				],
				[
					5,
					10
				],
				[
					23,
					-25
				],
				[
					2,
					-30
				],
				[
					18,
					7
				],
				[
					9,
					24
				]
			],
			[
				[
					8045,
					5298
				],
				[
					21,
					-20
				],
				[
					21,
					11
				],
				[
					6,
					49
				],
				[
					12,
					11
				],
				[
					33,
					12
				],
				[
					20,
					46
				],
				[
					14,
					36
				]
			],
			[
				[
					8206,
					5496
				],
				[
					22,
					40
				],
				[
					14,
					45
				],
				[
					11,
					0
				],
				[
					14,
					-29
				],
				[
					1,
					-25
				],
				[
					19,
					-16
				],
				[
					23,
					-17
				],
				[
					-2,
					-23
				],
				[
					-19,
					-3
				],
				[
					5,
					-28
				],
				[
					-20,
					-19
				]
			],
			[
				[
					5453,
					3537
				],
				[
					-20,
					43
				],
				[
					-11,
					42
				],
				[
					-6,
					57
				],
				[
					-7,
					41
				],
				[
					-9,
					89
				],
				[
					-1,
					69
				],
				[
					-3,
					31
				],
				[
					-11,
					24
				],
				[
					-15,
					48
				],
				[
					-14,
					69
				],
				[
					-6,
					36
				],
				[
					-23,
					56
				],
				[
					-2,
					44
				]
			],
			[
				[
					5644,
					4173
				],
				[
					23,
					14
				],
				[
					18,
					-4
				],
				[
					11,
					-13
				],
				[
					0,
					-5
				]
			],
			[
				[
					5552,
					3756
				],
				[
					0,
					-212
				],
				[
					-25,
					-30
				],
				[
					-15,
					-4
				],
				[
					-17,
					11
				],
				[
					-13,
					4
				],
				[
					-4,
					25
				],
				[
					-11,
					15
				],
				[
					-14,
					-28
				]
			],
			[
				[
					9604,
					3969
				],
				[
					23,
					-36
				],
				[
					14,
					-27
				],
				[
					-10,
					-13
				],
				[
					-16,
					15
				],
				[
					-19,
					26
				],
				[
					-18,
					31
				],
				[
					-19,
					40
				],
				[
					-4,
					20
				],
				[
					12,
					-1
				],
				[
					16,
					-20
				],
				[
					12,
					-19
				],
				[
					9,
					-16
				]
			],
			[
				[
					5412,
					6499
				],
				[
					7,
					-90
				],
				[
					10,
					-14
				],
				[
					1,
					-19
				],
				[
					11,
					-20
				],
				[
					-6,
					-24
				],
				[
					-11,
					-117
				],
				[
					-1,
					-75
				],
				[
					-35,
					-54
				],
				[
					-12,
					-76
				],
				[
					11,
					-22
				],
				[
					0,
					-37
				],
				[
					18,
					-1
				],
				[
					-3,
					-27
				]
			],
			[
				[
					5393,
					5901
				],
				[
					-5,
					-1
				],
				[
					-19,
					63
				],
				[
					-6,
					2
				],
				[
					-22,
					-32
				],
				[
					-21,
					17
				],
				[
					-15,
					3
				],
				[
					-8,
					-8
				],
				[
					-17,
					2
				],
				[
					-16,
					-25
				],
				[
					-14,
					-1
				],
				[
					-34,
					30
				],
				[
					-13,
					-14
				],
				[
					-14,
					1
				],
				[
					-10,
					21
				],
				[
					-28,
					22
				],
				[
					-30,
					-7
				],
				[
					-7,
					-12
				],
				[
					-4,
					-33
				],
				[
					-8,
					-24
				],
				[
					-2,
					-51
				]
			],
			[
				[
					5236,
					5457
				],
				[
					-29,
					-20
				],
				[
					-11,
					3
				],
				[
					-10,
					-13
				],
				[
					-23,
					1
				],
				[
					-15,
					36
				],
				[
					-9,
					42
				],
				[
					-19,
					38
				],
				[
					-21,
					-1
				],
				[
					-25,
					0
				]
			],
			[
				[
					2619,
					5821
				],
				[
					-10,
					18
				],
				[
					-13,
					23
				],
				[
					-6,
					20
				],
				[
					-12,
					18
				],
				[
					-13,
					26
				],
				[
					3,
					9
				],
				[
					4,
					-9
				],
				[
					2,
					4
				]
			],
			[
				[
					2690,
					6046
				],
				[
					-2,
					-6
				],
				[
					-2,
					-12
				],
				[
					3,
					-21
				],
				[
					-6,
					-20
				],
				[
					-3,
					-23
				],
				[
					-1,
					-26
				],
				[
					1,
					-14
				],
				[
					1,
					-26
				],
				[
					-4,
					-6
				],
				[
					-3,
					-25
				],
				[
					2,
					-15
				],
				[
					-6,
					-15
				],
				[
					2,
					-15
				],
				[
					4,
					-10
				]
			],
			[
				[
					5092,
					8139
				],
				[
					14,
					16
				],
				[
					24,
					85
				],
				[
					38,
					24
				],
				[
					23,
					-2
				]
			],
			[
				[
					5863,
					9188
				],
				[
					-47,
					-23
				],
				[
					-22,
					-6
				]
			],
			[
				[
					5573,
					9162
				],
				[
					-17,
					-3
				],
				[
					-4,
					-37
				],
				[
					-53,
					9
				],
				[
					-7,
					-32
				],
				[
					-27,
					0
				],
				[
					-18,
					-41
				],
				[
					-28,
					-64
				],
				[
					-43,
					-81
				],
				[
					10,
					-20
				],
				[
					-10,
					-22
				],
				[
					-27,
					1
				],
				[
					-18,
					-54
				],
				[
					2,
					-77
				],
				[
					17,
					-29
				],
				[
					-9,
					-68
				],
				[
					-23,
					-39
				],
				[
					-12,
					-33
				]
			],
			[
				[
					5306,
					8572
				],
				[
					-19,
					35
				],
				[
					-55,
					-67
				],
				[
					-37,
					-13
				],
				[
					-38,
					29
				],
				[
					-10,
					62
				],
				[
					-9,
					133
				],
				[
					26,
					37
				],
				[
					73,
					48
				],
				[
					55,
					60
				],
				[
					51,
					80
				],
				[
					66,
					111
				],
				[
					47,
					44
				],
				[
					76,
					72
				],
				[
					61,
					25
				],
				[
					46,
					-3
				],
				[
					42,
					48
				],
				[
					51,
					-3
				],
				[
					50,
					12
				],
				[
					87,
					-43
				],
				[
					-36,
					-15
				],
				[
					30,
					-36
				]
			],
			[
				[
					5686,
					9666
				],
				[
					-62,
					-24
				],
				[
					-49,
					13
				],
				[
					19,
					15
				],
				[
					-16,
					19
				],
				[
					57,
					11
				],
				[
					11,
					-21
				],
				[
					40,
					-13
				]
			],
			[
				[
					5506,
					9772
				],
				[
					92,
					-43
				],
				[
					-70,
					-23
				],
				[
					-15,
					-42
				],
				[
					-25,
					-11
				],
				[
					-13,
					-48
				],
				[
					-34,
					-2
				],
				[
					-59,
					35
				],
				[
					25,
					21
				],
				[
					-42,
					16
				],
				[
					-54,
					49
				],
				[
					-21,
					45
				],
				[
					75,
					21
				],
				[
					16,
					-20
				],
				[
					39,
					0
				],
				[
					11,
					20
				],
				[
					40,
					2
				],
				[
					35,
					-20
				]
			],
			[
				[
					5706,
					9813
				],
				[
					55,
					-21
				],
				[
					-41,
					-31
				],
				[
					-81,
					-6
				],
				[
					-82,
					9
				],
				[
					-5,
					16
				],
				[
					-40,
					1
				],
				[
					-30,
					26
				],
				[
					86,
					17
				],
				[
					40,
					-14
				],
				[
					28,
					17
				],
				[
					70,
					-14
				]
			],
			[
				[
					9805,
					2826
				],
				[
					6,
					-24
				],
				[
					20,
					24
				],
				[
					8,
					-25
				],
				[
					0,
					-24
				],
				[
					-10,
					-26
				],
				[
					-18,
					-43
				],
				[
					-14,
					-23
				],
				[
					10,
					-28
				],
				[
					-22,
					0
				],
				[
					-23,
					-22
				],
				[
					-8,
					-38
				],
				[
					-16,
					-58
				],
				[
					-21,
					-26
				],
				[
					-14,
					-16
				],
				[
					-26,
					1
				],
				[
					-18,
					19
				],
				[
					-30,
					4
				],
				[
					-5,
					21
				],
				[
					15,
					43
				],
				[
					35,
					57
				],
				[
					18,
					11
				],
				[
					20,
					21
				],
				[
					24,
					31
				],
				[
					17,
					29
				],
				[
					12,
					43
				],
				[
					10,
					15
				],
				[
					5,
					32
				],
				[
					19,
					27
				],
				[
					6,
					-25
				]
			],
			[
				[
					9849,
					3100
				],
				[
					20,
					-60
				],
				[
					1,
					39
				],
				[
					13,
					-16
				],
				[
					4,
					-43
				],
				[
					22,
					-19
				],
				[
					19,
					-4
				],
				[
					16,
					22
				],
				[
					14,
					-7
				],
				[
					-7,
					-51
				],
				[
					-8,
					-34
				],
				[
					-22,
					1
				],
				[
					-7,
					-17
				],
				[
					3,
					-25
				],
				[
					-4,
					-11
				],
				[
					-11,
					-31
				],
				[
					-14,
					-39
				],
				[
					-21,
					-23
				],
				[
					-5,
					15
				],
				[
					-12,
					8
				],
				[
					16,
					48
				],
				[
					-9,
					31
				],
				[
					-30,
					23
				],
				[
					1,
					21
				],
				[
					20,
					20
				],
				[
					5,
					45
				],
				[
					-1,
					37
				],
				[
					-12,
					39
				],
				[
					1,
					10
				],
				[
					-13,
					23
				],
				[
					-22,
					51
				],
				[
					-12,
					41
				],
				[
					11,
					5
				],
				[
					15,
					-32
				],
				[
					22,
					-15
				],
				[
					7,
					-52
				]
			],
			[
				[
					6475,
					6141
				],
				[
					-9,
					41
				],
				[
					-22,
					95
				]
			],
			[
				[
					6444,
					6277
				],
				[
					83,
					57
				],
				[
					19,
					115
				],
				[
					-13,
					41
				]
			],
			[
				[
					6566,
					6618
				],
				[
					12,
					-40
				],
				[
					16,
					-21
				],
				[
					20,
					-7
				],
				[
					17,
					-11
				],
				[
					12,
					-33
				],
				[
					8,
					-19
				],
				[
					10,
					-7
				],
				[
					0,
					-13
				],
				[
					-10,
					-34
				],
				[
					-5,
					-16
				],
				[
					-12,
					-19
				],
				[
					-10,
					-39
				],
				[
					-13,
					3
				],
				[
					-5,
					-14
				],
				[
					-5,
					-29
				],
				[
					4,
					-39
				],
				[
					-3,
					-7
				],
				[
					-13,
					1
				],
				[
					-17,
					-22
				],
				[
					-3,
					-28
				],
				[
					-6,
					-12
				],
				[
					-17,
					0
				],
				[
					-11,
					-14
				],
				[
					0,
					-23
				],
				[
					-14,
					-16
				],
				[
					-15,
					5
				],
				[
					-19,
					-19
				],
				[
					-12,
					-4
				]
			],
			[
				[
					6557,
					6683
				],
				[
					8,
					19
				],
				[
					3,
					-5
				],
				[
					-2,
					-23
				],
				[
					-4,
					-11
				]
			],
			[
				[
					6893,
					6547
				],
				[
					-20,
					14
				],
				[
					-9,
					42
				],
				[
					-21,
					44
				],
				[
					-51,
					-11
				],
				[
					-45,
					-1
				],
				[
					-39,
					-8
				]
			],
			[
				[
					2836,
					5598
				],
				[
					-9,
					17
				],
				[
					-6,
					31
				],
				[
					7,
					16
				],
				[
					-7,
					3
				],
				[
					-5,
					19
				],
				[
					-14,
					16
				],
				[
					-12,
					-3
				],
				[
					-6,
					-20
				],
				[
					-11,
					-15
				],
				[
					-6,
					-2
				],
				[
					-3,
					-12
				],
				[
					13,
					-31
				],
				[
					-7,
					-7
				],
				[
					-4,
					-9
				],
				[
					-13,
					-3
				],
				[
					-5,
					35
				],
				[
					-4,
					-10
				],
				[
					-9,
					3
				],
				[
					-5,
					23
				],
				[
					-12,
					4
				],
				[
					-7,
					7
				],
				[
					-12,
					0
				],
				[
					-1,
					-13
				],
				[
					-3,
					9
				]
			],
			[
				[
					2707,
					5733
				],
				[
					10,
					-20
				],
				[
					-1,
					-13
				],
				[
					11,
					-2
				],
				[
					3,
					5
				],
				[
					8,
					-15
				],
				[
					13,
					5
				],
				[
					12,
					14
				],
				[
					17,
					12
				],
				[
					9,
					17
				],
				[
					16,
					-3
				],
				[
					-1,
					-6
				],
				[
					15,
					-2
				],
				[
					13,
					-10
				],
				[
					9,
					-17
				],
				[
					10,
					-16
				]
			],
			[
				[
					3045,
					4126
				],
				[
					-28,
					33
				],
				[
					-2,
					24
				],
				[
					-55,
					57
				],
				[
					-50,
					63
				],
				[
					-22,
					36
				],
				[
					-11,
					47
				],
				[
					4,
					17
				],
				[
					-23,
					76
				],
				[
					-28,
					106
				],
				[
					-26,
					115
				],
				[
					-11,
					26
				],
				[
					-9,
					42
				],
				[
					-21,
					38
				],
				[
					-20,
					23
				],
				[
					9,
					26
				],
				[
					-14,
					55
				],
				[
					9,
					40
				],
				[
					22,
					36
				]
			],
			[
				[
					8510,
					5667
				],
				[
					2,
					-38
				],
				[
					2,
					-33
				],
				[
					-9,
					-52
				],
				[
					-11,
					58
				],
				[
					-13,
					-29
				],
				[
					9,
					-42
				],
				[
					-8,
					-27
				],
				[
					-32,
					33
				],
				[
					-8,
					42
				],
				[
					8,
					27
				],
				[
					-17,
					28
				],
				[
					-9,
					-24
				],
				[
					-13,
					2
				],
				[
					-21,
					-32
				],
				[
					-4,
					17
				],
				[
					11,
					48
				],
				[
					17,
					16
				],
				[
					15,
					22
				],
				[
					10,
					-26
				],
				[
					21,
					16
				],
				[
					5,
					25
				],
				[
					19,
					2
				],
				[
					-1,
					45
				],
				[
					22,
					-28
				],
				[
					3,
					-29
				],
				[
					2,
					-21
				]
			],
			[
				[
					8443,
					5774
				],
				[
					-10,
					-19
				],
				[
					-9,
					-36
				],
				[
					-8,
					-17
				],
				[
					-17,
					40
				],
				[
					5,
					15
				],
				[
					7,
					16
				],
				[
					3,
					36
				],
				[
					16,
					3
				],
				[
					-5,
					-38
				],
				[
					21,
					55
				],
				[
					-3,
					-55
				]
			],
			[
				[
					8291,
					5719
				],
				[
					-37,
					-55
				],
				[
					14,
					41
				],
				[
					20,
					35
				],
				[
					16,
					40
				],
				[
					15,
					57
				],
				[
					5,
					-47
				],
				[
					-18,
					-31
				],
				[
					-15,
					-40
				]
			],
			[
				[
					8385,
					5867
				],
				[
					16,
					-18
				],
				[
					18,
					0
				],
				[
					0,
					-24
				],
				[
					-13,
					-24
				],
				[
					-18,
					-17
				],
				[
					-1,
					26
				],
				[
					2,
					30
				],
				[
					-4,
					27
				]
			],
			[
				[
					8485,
					5883
				],
				[
					8,
					-64
				],
				[
					-21,
					15
				],
				[
					0,
					-20
				],
				[
					7,
					-35
				],
				[
					-13,
					-13
				],
				[
					-1,
					41
				],
				[
					-9,
					3
				],
				[
					-4,
					34
				],
				[
					16,
					-4
				],
				[
					0,
					22
				],
				[
					-17,
					44
				],
				[
					27,
					-2
				],
				[
					7,
					-21
				]
			],
			[
				[
					8375,
					5935
				],
				[
					-7,
					-50
				],
				[
					-12,
					29
				],
				[
					-15,
					44
				],
				[
					24,
					-2
				],
				[
					10,
					-21
				]
			],
			[
				[
					8369,
					6248
				],
				[
					17,
					-16
				],
				[
					9,
					15
				],
				[
					2,
					-15
				],
				[
					-4,
					-24
				],
				[
					9,
					-41
				],
				[
					-7,
					-48
				],
				[
					-16,
					-19
				],
				[
					-5,
					-47
				],
				[
					7,
					-45
				],
				[
					14,
					-7
				],
				[
					13,
					7
				],
				[
					34,
					-32
				],
				[
					-2,
					-31
				],
				[
					9,
					-14
				],
				[
					-3,
					-27
				],
				[
					-22,
					29
				],
				[
					-10,
					30
				],
				[
					-7,
					-21
				],
				[
					-18,
					34
				],
				[
					-25,
					-8
				],
				[
					-14,
					12
				],
				[
					1,
					24
				],
				[
					9,
					15
				],
				[
					-8,
					13
				],
				[
					-4,
					-21
				],
				[
					-14,
					34
				],
				[
					-4,
					25
				],
				[
					-1,
					55
				],
				[
					11,
					-19
				],
				[
					3,
					90
				],
				[
					9,
					52
				],
				[
					17,
					0
				]
			],
			[
				[
					9329,
					4790
				],
				[
					-8,
					-6
				],
				[
					-12,
					22
				],
				[
					-12,
					37
				],
				[
					-6,
					44
				],
				[
					4,
					5
				],
				[
					3,
					-17
				],
				[
					8,
					-13
				],
				[
					14,
					-37
				],
				[
					13,
					-19
				],
				[
					-4,
					-16
				]
			],
			[
				[
					9221,
					4867
				],
				[
					-15,
					-5
				],
				[
					-4,
					-16
				],
				[
					-15,
					-14
				],
				[
					-15,
					-13
				],
				[
					-14,
					0
				],
				[
					-23,
					16
				],
				[
					-16,
					17
				],
				[
					2,
					17
				],
				[
					25,
					-8
				],
				[
					15,
					4
				],
				[
					5,
					28
				],
				[
					4,
					1
				],
				[
					2,
					-30
				],
				[
					16,
					4
				],
				[
					8,
					20
				],
				[
					16,
					21
				],
				[
					-4,
					33
				],
				[
					17,
					2
				],
				[
					6,
					-10
				],
				[
					-1,
					-32
				],
				[
					-9,
					-35
				]
			],
			[
				[
					8916,
					5033
				],
				[
					48,
					-40
				],
				[
					51,
					-33
				],
				[
					19,
					-29
				],
				[
					16,
					-29
				],
				[
					4,
					-34
				],
				[
					46,
					-36
				],
				[
					7,
					-30
				],
				[
					-25,
					-7
				],
				[
					6,
					-38
				],
				[
					25,
					-38
				],
				[
					18,
					-61
				],
				[
					16,
					2
				],
				[
					-2,
					-25
				],
				[
					22,
					-10
				],
				[
					-8,
					-11
				],
				[
					29,
					-24
				],
				[
					-3,
					-17
				],
				[
					-18,
					-4
				],
				[
					-7,
					15
				],
				[
					-24,
					6
				],
				[
					-28,
					9
				],
				[
					-22,
					37
				],
				[
					-16,
					32
				],
				[
					-14,
					50
				],
				[
					-36,
					25
				],
				[
					-24,
					-16
				],
				[
					-17,
					-19
				],
				[
					4,
					-43
				],
				[
					-22,
					-20
				],
				[
					-16,
					10
				],
				[
					-28,
					2
				]
			],
			[
				[
					9253,
					4923
				],
				[
					-9,
					-15
				],
				[
					-5,
					34
				],
				[
					-6,
					22
				],
				[
					-13,
					19
				],
				[
					-16,
					25
				],
				[
					-20,
					17
				],
				[
					8,
					14
				],
				[
					15,
					-17
				],
				[
					9,
					-12
				],
				[
					12,
					-14
				],
				[
					11,
					-24
				],
				[
					11,
					-19
				],
				[
					3,
					-30
				]
			],
			[
				[
					5392,
					8278
				],
				[
					19,
					17
				],
				[
					43,
					26
				],
				[
					35,
					20
				],
				[
					28,
					-10
				],
				[
					2,
					-14
				],
				[
					27,
					-1
				]
			],
			[
				[
					5546,
					8316
				],
				[
					34,
					-6
				],
				[
					51,
					1
				]
			],
			[
				[
					5653,
					8153
				],
				[
					14,
					-51
				],
				[
					-3,
					-16
				],
				[
					-14,
					-7
				],
				[
					-25,
					-48
				],
				[
					7,
					-25
				],
				[
					-6,
					3
				]
			],
			[
				[
					5626,
					8009
				],
				[
					-26,
					22
				],
				[
					-20,
					-8
				],
				[
					-13,
					6
				],
				[
					-17,
					-12
				],
				[
					-14,
					20
				],
				[
					-11,
					-8
				],
				[
					-2,
					4
				]
			],
			[
				[
					3159,
					6249
				],
				[
					14,
					-5
				],
				[
					5,
					-12
				],
				[
					-7,
					-14
				],
				[
					-21,
					0
				],
				[
					-17,
					-2
				],
				[
					-1,
					25
				],
				[
					4,
					8
				],
				[
					23,
					0
				]
			],
			[
				[
					8628,
					7624
				],
				[
					4,
					-10
				]
			],
			[
				[
					8632,
					7614
				],
				[
					-11,
					3
				],
				[
					-12,
					-19
				],
				[
					-8,
					-20
				],
				[
					1,
					-41
				],
				[
					-14,
					-13
				],
				[
					-5,
					-10
				],
				[
					-11,
					-17
				],
				[
					-18,
					-10
				],
				[
					-12,
					-15
				],
				[
					-1,
					-25
				],
				[
					-3,
					-7
				],
				[
					11,
					-9
				],
				[
					15,
					-25
				]
			],
			[
				[
					8504,
					7356
				],
				[
					-13,
					11
				],
				[
					-4,
					-11
				],
				[
					-8,
					-4
				],
				[
					-1,
					10
				],
				[
					-7,
					6
				],
				[
					-8,
					9
				],
				[
					8,
					25
				],
				[
					7,
					7
				],
				[
					-3,
					10
				],
				[
					7,
					32
				],
				[
					-2,
					9
				],
				[
					-16,
					6
				],
				[
					-13,
					16
				]
			],
			[
				[
					4792,
					7319
				],
				[
					-11,
					-15
				],
				[
					-14,
					8
				],
				[
					-15,
					-7
				],
				[
					5,
					46
				],
				[
					-3,
					35
				],
				[
					-12,
					5
				],
				[
					-7,
					22
				],
				[
					2,
					38
				],
				[
					11,
					21
				],
				[
					2,
					23
				],
				[
					6,
					35
				],
				[
					-1,
					24
				],
				[
					-5,
					21
				],
				[
					-1,
					19
				]
			],
			[
				[
					6411,
					6608
				],
				[
					-2,
					42
				],
				[
					7,
					30
				],
				[
					8,
					6
				],
				[
					8,
					-18
				],
				[
					1,
					-34
				],
				[
					-6,
					-33
				]
			],
			[
				[
					6427,
					6601
				],
				[
					-8,
					-5
				],
				[
					-8,
					12
				]
			],
			[
				[
					5630,
					7940
				],
				[
					12,
					12
				],
				[
					17,
					-6
				],
				[
					18,
					-1
				],
				[
					13,
					-14
				],
				[
					10,
					9
				],
				[
					20,
					6
				],
				[
					7,
					13
				],
				[
					12,
					0
				]
			],
			[
				[
					5784,
					7802
				],
				[
					12,
					-11
				],
				[
					13,
					9
				],
				[
					13,
					-9
				]
			],
			[
				[
					5822,
					7791
				],
				[
					0,
					-15
				],
				[
					-13,
					-13
				],
				[
					-9,
					6
				],
				[
					-7,
					-70
				]
			],
			[
				[
					5629,
					7730
				],
				[
					-5,
					10
				],
				[
					6,
					9
				],
				[
					-7,
					8
				],
				[
					-8,
					-13
				],
				[
					-17,
					16
				],
				[
					-2,
					24
				],
				[
					-17,
					14
				],
				[
					-3,
					18
				],
				[
					-15,
					23
				]
			],
			[
				[
					8989,
					8105
				],
				[
					28,
					-102
				],
				[
					-41,
					19
				],
				[
					-17,
					-84
				],
				[
					27,
					-59
				],
				[
					-1,
					-40
				],
				[
					-21,
					35
				],
				[
					-18,
					-45
				],
				[
					-5,
					49
				],
				[
					3,
					56
				],
				[
					-3,
					62
				],
				[
					6,
					43
				],
				[
					2,
					77
				],
				[
					-17,
					57
				],
				[
					3,
					79
				],
				[
					25,
					26
				],
				[
					-11,
					27
				],
				[
					13,
					8
				],
				[
					7,
					-38
				],
				[
					10,
					-56
				],
				[
					-1,
					-56
				],
				[
					11,
					-58
				]
			],
			[
				[
					5546,
					8316
				],
				[
					6,
					26
				],
				[
					38,
					19
				]
			],
			[
				[
					9999,
					9261
				],
				[
					-30,
					-3
				],
				[
					-5,
					19
				],
				[
					-9964,
					24
				],
				[
					4,
					2
				],
				[
					23,
					0
				],
				[
					40,
					-17
				],
				[
					-2,
					-7
				],
				[
					-29,
					-14
				],
				[
					-36,
					-4
				],
				[
					9999,
					0
				]
			],
			[
				[
					8988,
					9398
				],
				[
					-42,
					0
				],
				[
					-57,
					6
				],
				[
					-5,
					3
				],
				[
					27,
					23
				],
				[
					34,
					5
				],
				[
					40,
					-22
				],
				[
					3,
					-15
				]
			],
			[
				[
					9186,
					9506
				],
				[
					-32,
					-23
				],
				[
					-44,
					5
				],
				[
					-52,
					23
				],
				[
					7,
					19
				],
				[
					51,
					-9
				],
				[
					70,
					-15
				]
			],
			[
				[
					9029,
					9534
				],
				[
					-22,
					-43
				],
				[
					-102,
					1
				],
				[
					-46,
					-13
				],
				[
					-55,
					37
				],
				[
					15,
					40
				],
				[
					37,
					11
				],
				[
					73,
					-3
				],
				[
					100,
					-30
				]
			],
			[
				[
					6598,
					9255
				],
				[
					-17,
					-5
				],
				[
					-91,
					7
				],
				[
					-7,
					26
				],
				[
					-50,
					15
				],
				[
					-4,
					31
				],
				[
					28,
					13
				],
				[
					-1,
					31
				],
				[
					55,
					49
				],
				[
					-25,
					7
				],
				[
					66,
					51
				],
				[
					-7,
					26
				],
				[
					62,
					30
				],
				[
					92,
					37
				],
				[
					92,
					11
				],
				[
					48,
					21
				],
				[
					54,
					8
				],
				[
					19,
					-23
				],
				[
					-19,
					-18
				],
				[
					-98,
					-28
				],
				[
					-85,
					-28
				],
				[
					-86,
					-55
				],
				[
					-42,
					-56
				],
				[
					-43,
					-55
				],
				[
					5,
					-48
				],
				[
					54,
					-47
				]
			],
			[
				[
					8646,
					7723
				],
				[
					-7,
					49
				],
				[
					24,
					20
				]
			],
			[
				[
					8663,
					7792
				],
				[
					33,
					-10
				],
				[
					19,
					56
				]
			],
			[
				[
					8353,
					8175
				],
				[
					-15,
					-19
				],
				[
					-26,
					-61
				],
				[
					1,
					-25
				]
			],
			[
				[
					6363,
					7854
				],
				[
					-12,
					-34
				],
				[
					-27,
					-9
				],
				[
					-28,
					-60
				],
				[
					25,
					-54
				],
				[
					-2,
					-39
				],
				[
					30,
					-68
				],
				[
					-17,
					-23
				]
			],
			[
				[
					6109,
					7684
				],
				[
					-35,
					48
				],
				[
					-32,
					22
				],
				[
					-24,
					34
				],
				[
					20,
					9
				],
				[
					23,
					48
				],
				[
					-15,
					23
				],
				[
					41,
					23
				],
				[
					-1,
					13
				],
				[
					-25,
					-9
				]
			],
			[
				[
					6061,
					7895
				],
				[
					1,
					25
				],
				[
					14,
					16
				],
				[
					27,
					5
				],
				[
					5,
					19
				],
				[
					-7,
					32
				],
				[
					12,
					30
				],
				[
					-1,
					17
				],
				[
					-41,
					18
				],
				[
					-16,
					0
				],
				[
					-17,
					27
				],
				[
					-21,
					-9
				],
				[
					-35,
					20
				],
				[
					0,
					11
				],
				[
					-10,
					25
				],
				[
					-22,
					3
				],
				[
					-2,
					18
				],
				[
					7,
					11
				],
				[
					-18,
					33
				],
				[
					-29,
					-5
				],
				[
					-8,
					2
				],
				[
					-7,
					-13
				],
				[
					-11,
					3
				]
			],
			[
				[
					5769,
					8510
				],
				[
					-8,
					54
				],
				[
					20,
					33
				]
			],
			[
				[
					5777,
					8607
				],
				[
					31,
					32
				],
				[
					-29,
					27
				]
			],
			[
				[
					5863,
					9188
				],
				[
					29,
					20
				],
				[
					46,
					-35
				],
				[
					76,
					-14
				],
				[
					105,
					-65
				],
				[
					21,
					-27
				],
				[
					2,
					-38
				],
				[
					-31,
					-31
				],
				[
					-45,
					-15
				],
				[
					-124,
					44
				],
				[
					-21,
					-8
				],
				[
					45,
					-42
				],
				[
					2,
					-27
				],
				[
					2,
					-58
				],
				[
					36,
					-18
				],
				[
					22,
					-15
				],
				[
					3,
					28
				],
				[
					-17,
					25
				],
				[
					18,
					22
				],
				[
					67,
					-36
				],
				[
					24,
					14
				],
				[
					-19,
					42
				],
				[
					65,
					56
				],
				[
					25,
					-3
				],
				[
					26,
					-20
				],
				[
					16,
					39
				],
				[
					-23,
					35
				],
				[
					14,
					34
				],
				[
					-21,
					36
				],
				[
					78,
					-18
				],
				[
					16,
					-33
				],
				[
					-35,
					-7
				],
				[
					0,
					-32
				],
				[
					22,
					-20
				],
				[
					43,
					13
				],
				[
					7,
					37
				],
				[
					58,
					27
				],
				[
					97,
					49
				],
				[
					20,
					-2
				],
				[
					-27,
					-35
				],
				[
					35,
					-6
				],
				[
					19,
					19
				],
				[
					52,
					2
				],
				[
					42,
					24
				],
				[
					31,
					-35
				],
				[
					32,
					38
				],
				[
					-29,
					34
				],
				[
					14,
					19
				],
				[
					82,
					-18
				],
				[
					39,
					-18
				],
				[
					100,
					-66
				],
				[
					19,
					31
				],
				[
					-28,
					30
				],
				[
					-1,
					12
				],
				[
					-34,
					6
				],
				[
					10,
					27
				],
				[
					-15,
					45
				],
				[
					-1,
					19
				],
				[
					51,
					52
				],
				[
					18,
					52
				],
				[
					21,
					11
				],
				[
					74,
					-15
				],
				[
					5,
					-32
				],
				[
					-26,
					-47
				],
				[
					17,
					-18
				],
				[
					9,
					-40
				],
				[
					-6,
					-79
				],
				[
					31,
					-35
				],
				[
					-12,
					-39
				],
				[
					-55,
					-82
				],
				[
					32,
					-8
				],
				[
					11,
					21
				],
				[
					31,
					14
				],
				[
					7,
					29
				],
				[
					24,
					27
				],
				[
					-16,
					33
				],
				[
					13,
					38
				],
				[
					-31,
					5
				],
				[
					-6,
					32
				],
				[
					22,
					58
				],
				[
					-36,
					47
				],
				[
					50,
					38
				],
				[
					-7,
					41
				],
				[
					14,
					2
				],
				[
					15,
					-32
				],
				[
					-11,
					-56
				],
				[
					29,
					-10
				],
				[
					-12,
					41
				],
				[
					46,
					23
				],
				[
					58,
					3
				],
				[
					51,
					-33
				],
				[
					-25,
					48
				],
				[
					-2,
					61
				],
				[
					48,
					12
				],
				[
					67,
					-3
				],
				[
					60,
					8
				],
				[
					-23,
					30
				],
				[
					33,
					38
				],
				[
					31,
					1
				],
				[
					54,
					29
				],
				[
					74,
					8
				],
				[
					9,
					15
				],
				[
					73,
					6
				],
				[
					23,
					-13
				],
				[
					62,
					31
				],
				[
					51,
					-1
				],
				[
					8,
					24
				],
				[
					26,
					25
				],
				[
					66,
					24
				],
				[
					48,
					-19
				],
				[
					-38,
					-14
				],
				[
					63,
					-9
				],
				[
					7,
					-29
				],
				[
					25,
					14
				],
				[
					82,
					0
				],
				[
					62,
					-28
				],
				[
					23,
					-22
				],
				[
					-7,
					-30
				],
				[
					-31,
					-17
				],
				[
					-73,
					-32
				],
				[
					-21,
					-17
				],
				[
					35,
					-8
				],
				[
					41,
					-15
				],
				[
					25,
					11
				],
				[
					14,
					-37
				],
				[
					12,
					15
				],
				[
					44,
					9
				],
				[
					90,
					-9
				],
				[
					6,
					-27
				],
				[
					116,
					-9
				],
				[
					2,
					44
				],
				[
					59,
					-10
				],
				[
					44,
					1
				],
				[
					45,
					-31
				],
				[
					13,
					-37
				],
				[
					-17,
					-24
				],
				[
					35,
					-45
				],
				[
					44,
					-23
				],
				[
					27,
					60
				],
				[
					44,
					-26
				],
				[
					48,
					16
				],
				[
					53,
					-18
				],
				[
					21,
					16
				],
				[
					45,
					-8
				],
				[
					-20,
					53
				],
				[
					37,
					25
				],
				[
					251,
					-37
				],
				[
					24,
					-34
				],
				[
					72,
					-44
				],
				[
					112,
					11
				],
				[
					56,
					-10
				],
				[
					23,
					-24
				],
				[
					-4,
					-42
				],
				[
					35,
					-16
				],
				[
					37,
					12
				],
				[
					49,
					1
				],
				[
					52,
					-11
				],
				[
					53,
					6
				],
				[
					49,
					-51
				],
				[
					34,
					18
				],
				[
					-23,
					37
				],
				[
					13,
					26
				],
				[
					88,
					-16
				],
				[
					58,
					3
				],
				[
					80,
					-27
				],
				[
					-9960,
					-25
				],
				[
					68,
					-44
				],
				[
					73,
					-58
				],
				[
					-3,
					-35
				],
				[
					19,
					-15
				],
				[
					-6,
					42
				],
				[
					75,
					-8
				],
				[
					55,
					-54
				],
				[
					-28,
					-25
				],
				[
					-46,
					-6
				],
				[
					0,
					-57
				],
				[
					-11,
					-12
				],
				[
					-26,
					2
				],
				[
					-22,
					20
				],
				[
					-36,
					17
				],
				[
					-7,
					25
				],
				[
					-28,
					9
				],
				[
					-31,
					-7
				],
				[
					-16,
					20
				],
				[
					6,
					21
				],
				[
					-33,
					-13
				],
				[
					13,
					-27
				],
				[
					-16,
					-25
				],
				[
					9963,
					-25
				],
				[
					-36,
					4
				],
				[
					25,
					-31
				],
				[
					17,
					-47
				],
				[
					13,
					-16
				],
				[
					3,
					-24
				],
				[
					-7,
					-15
				],
				[
					-52,
					13
				],
				[
					-78,
					-44
				],
				[
					-25,
					-6
				],
				[
					-42,
					-41
				],
				[
					-40,
					-35
				],
				[
					-11,
					-26
				],
				[
					-39,
					39
				],
				[
					-73,
					-45
				],
				[
					-12,
					22
				],
				[
					-27,
					-25
				],
				[
					-37,
					8
				],
				[
					-9,
					-38
				],
				[
					-33,
					-56
				],
				[
					1,
					-23
				],
				[
					31,
					-13
				],
				[
					-4,
					-84
				],
				[
					-25,
					-2
				],
				[
					-12,
					-48
				],
				[
					11,
					-25
				],
				[
					-48,
					-29
				],
				[
					-10,
					-66
				],
				[
					-41,
					-14
				],
				[
					-9,
					-59
				],
				[
					-40,
					-53
				],
				[
					-10,
					40
				],
				[
					-12,
					84
				],
				[
					-15,
					127
				],
				[
					13,
					80
				],
				[
					23,
					35
				],
				[
					2,
					27
				],
				[
					43,
					12
				],
				[
					50,
					73
				],
				[
					48,
					59
				],
				[
					49,
					46
				],
				[
					23,
					81
				],
				[
					-34,
					-5
				],
				[
					-17,
					-47
				],
				[
					-70,
					-63
				],
				[
					-23,
					71
				],
				[
					-72,
					-20
				],
				[
					-69,
					-96
				],
				[
					23,
					-36
				],
				[
					-62,
					-15
				],
				[
					-43,
					-6
				],
				[
					2,
					42
				],
				[
					-43,
					9
				],
				[
					-35,
					-29
				],
				[
					-85,
					10
				],
				[
					-91,
					-17
				],
				[
					-90,
					-112
				],
				[
					-106,
					-136
				],
				[
					43,
					-7
				],
				[
					14,
					-36
				],
				[
					27,
					-13
				],
				[
					18,
					29
				],
				[
					30,
					-4
				],
				[
					40,
					-63
				],
				[
					1,
					-49
				],
				[
					-21,
					-58
				],
				[
					-3,
					-69
				],
				[
					-12,
					-92
				],
				[
					-42,
					-83
				],
				[
					-9,
					-40
				],
				[
					-38,
					-67
				],
				[
					-38,
					-67
				],
				[
					-17,
					-34
				],
				[
					-38,
					-33
				],
				[
					-17,
					-1
				],
				[
					-17,
					28
				],
				[
					-38,
					-42
				],
				[
					-4,
					-19
				]
			],
			[
				[
					7918,
					9692
				],
				[
					-157,
					-23
				],
				[
					51,
					76
				],
				[
					23,
					6
				],
				[
					21,
					-3
				],
				[
					70,
					-33
				],
				[
					-8,
					-23
				]
			],
			[
				[
					6420,
					9821
				],
				[
					-37,
					-8
				],
				[
					-25,
					-4
				],
				[
					-4,
					-10
				],
				[
					-33,
					-9
				],
				[
					-30,
					13
				],
				[
					16,
					18
				],
				[
					-62,
					2
				],
				[
					54,
					11
				],
				[
					43,
					0
				],
				[
					5,
					-15
				],
				[
					16,
					14
				],
				[
					26,
					9
				],
				[
					42,
					-13
				],
				[
					-11,
					-8
				]
			],
			[
				[
					7775,
					9725
				],
				[
					-60,
					-8
				],
				[
					-78,
					17
				],
				[
					-46,
					22
				],
				[
					-21,
					41
				],
				[
					-38,
					12
				],
				[
					72,
					39
				],
				[
					60,
					13
				],
				[
					54,
					-29
				],
				[
					64,
					-56
				],
				[
					-7,
					-51
				]
			],
			[
				[
					5844,
					5117
				],
				[
					11,
					-32
				],
				[
					-1,
					-34
				],
				[
					-8,
					-8
				]
			],
			[
				[
					5821,
					5105
				],
				[
					7,
					-6
				],
				[
					16,
					18
				]
			],
			[
				[
					4755,
					6775
				],
				[
					4,
					0
				]
			],
			[
				[
					4526,
					6392
				],
				[
					1,
					24
				]
			],
			[
				[
					6188,
					6124
				],
				[
					-4,
					24
				],
				[
					-8,
					18
				],
				[
					-2,
					23
				],
				[
					-15,
					20
				],
				[
					-15,
					49
				],
				[
					-7,
					47
				],
				[
					-20,
					39
				],
				[
					-12,
					10
				],
				[
					-18,
					55
				],
				[
					-4,
					40
				],
				[
					2,
					34
				],
				[
					-16,
					64
				],
				[
					-13,
					22
				],
				[
					-15,
					12
				],
				[
					-10,
					33
				],
				[
					2,
					13
				],
				[
					-8,
					30
				],
				[
					-8,
					13
				],
				[
					-11,
					42
				],
				[
					-17,
					47
				],
				[
					-14,
					39
				],
				[
					-14,
					0
				],
				[
					5,
					32
				],
				[
					1,
					20
				],
				[
					3,
					23
				]
			],
			[
				[
					6344,
					6827
				],
				[
					11,
					-50
				],
				[
					14,
					-13
				],
				[
					5,
					-20
				],
				[
					18,
					-25
				],
				[
					2,
					-23
				],
				[
					-3,
					-20
				],
				[
					4,
					-19
				],
				[
					8,
					-16
				],
				[
					4,
					-19
				],
				[
					4,
					-14
				]
			],
			[
				[
					6427,
					6601
				],
				[
					5,
					-22
				]
			],
			[
				[
					6444,
					6277
				],
				[
					-80,
					-23
				],
				[
					-26,
					-25
				],
				[
					-20,
					-61
				],
				[
					-13,
					-9
				],
				[
					-7,
					19
				],
				[
					-11,
					-3
				],
				[
					-27,
					6
				],
				[
					-5,
					5
				],
				[
					-32,
					-1
				],
				[
					-7,
					-5
				],
				[
					-12,
					15
				],
				[
					-7,
					-29
				],
				[
					3,
					-24
				],
				[
					-12,
					-18
				]
			],
			[
				[
					5943,
					5727
				],
				[
					-4,
					2
				],
				[
					0,
					28
				],
				[
					-3,
					20
				],
				[
					-14,
					23
				],
				[
					-4,
					41
				],
				[
					4,
					43
				],
				[
					-13,
					4
				],
				[
					-2,
					-13
				],
				[
					-17,
					-3
				],
				[
					7,
					-17
				],
				[
					2,
					-34
				],
				[
					-15,
					-32
				],
				[
					-14,
					-42
				],
				[
					-14,
					-6
				],
				[
					-23,
					34
				],
				[
					-11,
					-12
				],
				[
					-3,
					-17
				],
				[
					-14,
					-10
				],
				[
					-1,
					-12
				],
				[
					-28,
					0
				],
				[
					-3,
					12
				],
				[
					-20,
					1
				],
				[
					-10,
					-9
				],
				[
					-8,
					5
				],
				[
					-14,
					33
				],
				[
					-5,
					16
				],
				[
					-20,
					-8
				],
				[
					-8,
					-27
				],
				[
					-7,
					-51
				],
				[
					-10,
					-11
				],
				[
					-8,
					-6
				]
			],
			[
				[
					5663,
					5679
				],
				[
					-2,
					3
				]
			],
			[
				[
					5635,
					5824
				],
				[
					0,
					14
				],
				[
					-10,
					17
				],
				[
					-1,
					33
				],
				[
					-5,
					23
				],
				[
					-10,
					-4
				],
				[
					3,
					21
				],
				[
					7,
					24
				],
				[
					-3,
					24
				],
				[
					9,
					18
				],
				[
					-6,
					13
				],
				[
					7,
					36
				],
				[
					13,
					42
				],
				[
					24,
					-4
				],
				[
					-1,
					229
				]
			],
			[
				[
					6023,
					6449
				],
				[
					9,
					-56
				],
				[
					-6,
					-11
				],
				[
					4,
					-59
				],
				[
					11,
					-69
				],
				[
					10,
					-14
				],
				[
					15,
					-21
				]
			],
			[
				[
					5943,
					5734
				],
				[
					0,
					-7
				]
			],
			[
				[
					5943,
					5727
				],
				[
					0,
					-44
				]
			],
			[
				[
					5944,
					5427
				],
				[
					-17,
					-26
				],
				[
					-20,
					0
				],
				[
					-22,
					-14
				],
				[
					-18,
					13
				],
				[
					-11,
					-15
				]
			],
			[
				[
					5682,
					5656
				],
				[
					-19,
					23
				]
			],
			[
				[
					4535,
					5965
				],
				[
					-11,
					45
				],
				[
					-14,
					21
				],
				[
					12,
					11
				],
				[
					14,
					40
				],
				[
					6,
					30
				]
			],
			[
				[
					4536,
					5896
				],
				[
					-4,
					44
				]
			],
			[
				[
					9502,
					4579
				],
				[
					8,
					-20
				],
				[
					-19,
					0
				],
				[
					-11,
					36
				],
				[
					17,
					-14
				],
				[
					5,
					-2
				]
			],
			[
				[
					9467,
					4614
				],
				[
					-11,
					-1
				],
				[
					-17,
					6
				],
				[
					-5,
					8
				],
				[
					1,
					23
				],
				[
					19,
					-9
				],
				[
					9,
					-12
				],
				[
					4,
					-15
				]
			],
			[
				[
					9490,
					4630
				],
				[
					-4,
					-11
				],
				[
					-21,
					50
				],
				[
					-5,
					34
				],
				[
					9,
					0
				],
				[
					10,
					-46
				],
				[
					11,
					-27
				]
			],
			[
				[
					9440,
					4702
				],
				[
					1,
					-11
				],
				[
					-22,
					24
				],
				[
					-15,
					21
				],
				[
					-10,
					19
				],
				[
					4,
					6
				],
				[
					13,
					-14
				],
				[
					23,
					-26
				],
				[
					6,
					-19
				]
			],
			[
				[
					9375,
					4759
				],
				[
					-5,
					-3
				],
				[
					-13,
					13
				],
				[
					-11,
					24
				],
				[
					1,
					9
				],
				[
					17,
					-24
				],
				[
					11,
					-19
				]
			],
			[
				[
					4682,
					5573
				],
				[
					-8,
					4
				],
				[
					-20,
					24
				],
				[
					-14,
					31
				],
				[
					-5,
					21
				],
				[
					-3,
					42
				]
			],
			[
				[
					2561,
					5953
				],
				[
					-3,
					-13
				],
				[
					-16,
					0
				],
				[
					-10,
					6
				],
				[
					-12,
					11
				],
				[
					-15,
					4
				],
				[
					-8,
					12
				]
			],
			[
				[
					6213,
					5711
				],
				[
					-11,
					21
				],
				[
					-10,
					28
				]
			],
			[
				[
					6198,
					5842
				],
				[
					9,
					-10
				],
				[
					5,
					-24
				],
				[
					13,
					-24
				],
				[
					14,
					0
				],
				[
					26,
					14
				],
				[
					30,
					7
				],
				[
					25,
					18
				],
				[
					13,
					4
				],
				[
					10,
					11
				],
				[
					16,
					2
				]
			],
			[
				[
					6359,
					5840
				],
				[
					0,
					-1
				],
				[
					0,
					-24
				],
				[
					0,
					-58
				],
				[
					0,
					-30
				],
				[
					-13,
					-36
				],
				[
					-19,
					-48
				]
			],
			[
				[
					6359,
					5840
				],
				[
					9,
					1
				],
				[
					13,
					8
				],
				[
					14,
					6
				],
				[
					14,
					20
				],
				[
					10,
					0
				],
				[
					1,
					-16
				],
				[
					-3,
					-34
				],
				[
					0,
					-30
				],
				[
					-6,
					-21
				],
				[
					-7,
					-62
				],
				[
					-14,
					-64
				],
				[
					-17,
					-74
				],
				[
					-24,
					-84
				],
				[
					-23,
					-65
				],
				[
					-33,
					-78
				],
				[
					-28,
					-47
				],
				[
					-42,
					-57
				],
				[
					-25,
					-44
				],
				[
					-31,
					-69
				],
				[
					-6,
					-31
				],
				[
					-6,
					-13
				]
			],
			[
				[
					3412,
					5526
				],
				[
					34,
					-11
				],
				[
					2,
					10
				],
				[
					23,
					4
				],
				[
					30,
					-15
				]
			],
			[
				[
					3489,
					5425
				],
				[
					10,
					-34
				],
				[
					-4,
					-25
				],
				[
					-3,
					-26
				],
				[
					-7,
					-24
				]
			],
			[
				[
					5626,
					8009
				],
				[
					-8,
					-15
				],
				[
					-5,
					-23
				]
			],
			[
				[
					5380,
					7803
				],
				[
					7,
					5
				]
			],
			[
				[
					5663,
					8983
				],
				[
					-47,
					-16
				],
				[
					-27,
					-40
				],
				[
					4,
					-35
				],
				[
					-44,
					-47
				],
				[
					-54,
					-49
				],
				[
					-20,
					-81
				],
				[
					20,
					-41
				],
				[
					26,
					-32
				],
				[
					-25,
					-65
				],
				[
					-29,
					-13
				],
				[
					-11,
					-97
				],
				[
					-15,
					-54
				],
				[
					-34,
					6
				],
				[
					-16,
					-46
				],
				[
					-32,
					-3
				],
				[
					-9,
					55
				],
				[
					-23,
					65
				],
				[
					-21,
					82
				]
			],
			[
				[
					5890,
					3643
				],
				[
					-5,
					-26
				],
				[
					-17,
					-6
				],
				[
					-16,
					31
				],
				[
					0,
					20
				],
				[
					7,
					22
				],
				[
					3,
					17
				],
				[
					8,
					4
				],
				[
					14,
					-11
				]
			],
			[
				[
					5999,
					7177
				],
				[
					-2,
					44
				],
				[
					7,
					24
				]
			],
			[
				[
					6004,
					7245
				],
				[
					7,
					13
				],
				[
					7,
					12
				],
				[
					2,
					33
				],
				[
					9,
					-12
				],
				[
					31,
					16
				],
				[
					14,
					-10
				],
				[
					23,
					0
				],
				[
					32,
					21
				],
				[
					15,
					-1
				],
				[
					32,
					9
				]
			],
			[
				[
					5415,
					5848
				],
				[
					-2,
					38
				],
				[
					-11,
					37
				]
			],
			[
				[
					5051,
					5536
				],
				[
					-22,
					-12
				]
			],
			[
				[
					7849,
					5884
				],
				[
					-25,
					27
				],
				[
					-24,
					-1
				],
				[
					4,
					45
				],
				[
					-24,
					-1
				],
				[
					-2,
					-63
				],
				[
					-15,
					-84
				],
				[
					-9,
					-51
				],
				[
					1,
					-42
				],
				[
					19,
					-1
				],
				[
					11,
					-53
				],
				[
					5,
					-50
				],
				[
					15,
					-33
				],
				[
					17,
					-6
				],
				[
					14,
					-30
				]
			],
			[
				[
					7779,
					5555
				],
				[
					-11,
					22
				],
				[
					-4,
					28
				],
				[
					-15,
					33
				],
				[
					-14,
					27
				],
				[
					-4,
					-34
				],
				[
					-5,
					32
				],
				[
					3,
					36
				],
				[
					8,
					55
				]
			],
			[
				[
					6883,
					7321
				],
				[
					16,
					59
				],
				[
					-6,
					43
				],
				[
					-20,
					13
				],
				[
					7,
					26
				],
				[
					23,
					-3
				],
				[
					13,
					32
				],
				[
					9,
					37
				],
				[
					37,
					13
				],
				[
					-6,
					-27
				],
				[
					4,
					-16
				],
				[
					12,
					2
				]
			],
			[
				[
					6497,
					7324
				],
				[
					-5,
					41
				],
				[
					4,
					60
				],
				[
					-22,
					20
				],
				[
					8,
					39
				],
				[
					-19,
					4
				],
				[
					6,
					48
				],
				[
					26,
					-14
				],
				[
					25,
					19
				],
				[
					-20,
					34
				],
				[
					-8,
					33
				],
				[
					-23,
					-15
				],
				[
					-3,
					-42
				],
				[
					-8,
					37
				]
			],
			[
				[
					6554,
					7561
				],
				[
					31,
					1
				],
				[
					-4,
					29
				],
				[
					24,
					20
				],
				[
					23,
					33
				],
				[
					37,
					-30
				],
				[
					3,
					-46
				],
				[
					11,
					-12
				],
				[
					30,
					3
				],
				[
					9,
					-11
				],
				[
					14,
					-59
				],
				[
					32,
					-40
				],
				[
					18,
					-27
				],
				[
					29,
					-28
				],
				[
					37,
					-25
				],
				[
					-1,
					-35
				]
			],
			[
				[
					8471,
					4670
				],
				[
					3,
					14
				],
				[
					24,
					13
				],
				[
					19,
					2
				],
				[
					9,
					7
				],
				[
					10,
					-7
				],
				[
					-10,
					-16
				],
				[
					-29,
					-25
				],
				[
					-23,
					-16
				]
			],
			[
				[
					3286,
					5802
				],
				[
					16,
					8
				],
				[
					6,
					-2
				],
				[
					-1,
					-43
				],
				[
					-23,
					-7
				],
				[
					-5,
					5
				],
				[
					8,
					16
				],
				[
					-1,
					23
				]
			],
			[
				[
					5233,
					7310
				],
				[
					31,
					23
				],
				[
					19,
					-7
				],
				[
					-1,
					-29
				],
				[
					24,
					21
				],
				[
					2,
					-11
				],
				[
					-14,
					-28
				],
				[
					0,
					-27
				],
				[
					9,
					-14
				],
				[
					-3,
					-50
				],
				[
					-19,
					-29
				],
				[
					6,
					-31
				],
				[
					14,
					-1
				],
				[
					7,
					-27
				],
				[
					11,
					-9
				]
			],
			[
				[
					6004,
					7245
				],
				[
					-11,
					26
				],
				[
					11,
					22
				],
				[
					-17,
					-5
				],
				[
					-23,
					13
				],
				[
					-19,
					-33
				],
				[
					-43,
					-6
				],
				[
					-22,
					31
				],
				[
					-30,
					1
				],
				[
					-6,
					-23
				],
				[
					-20,
					-7
				],
				[
					-26,
					30
				],
				[
					-31,
					-1
				],
				[
					-16,
					58
				],
				[
					-21,
					32
				],
				[
					14,
					44
				],
				[
					-18,
					28
				],
				[
					31,
					55
				],
				[
					43,
					2
				],
				[
					12,
					44
				],
				[
					53,
					-8
				],
				[
					33,
					38
				],
				[
					32,
					16
				],
				[
					46,
					1
				],
				[
					49,
					-40
				],
				[
					40,
					-23
				],
				[
					32,
					9
				],
				[
					24,
					-5
				],
				[
					33,
					30
				]
			],
			[
				[
					5777,
					7601
				],
				[
					3,
					-22
				],
				[
					25,
					-18
				],
				[
					-5,
					-14
				],
				[
					-33,
					-4
				],
				[
					-12,
					-17
				],
				[
					-23,
					-31
				],
				[
					-9,
					26
				],
				[
					0,
					12
				]
			],
			[
				[
					8382,
					6587
				],
				[
					-17,
					-92
				],
				[
					-12,
					-47
				],
				[
					-14,
					48
				],
				[
					-4,
					43
				],
				[
					17,
					56
				],
				[
					22,
					44
				],
				[
					13,
					-17
				],
				[
					-5,
					-35
				]
			],
			[
				[
					6088,
					4913
				],
				[
					-12,
					-71
				],
				[
					1,
					-32
				],
				[
					18,
					-21
				],
				[
					1,
					-15
				],
				[
					-8,
					-35
				],
				[
					2,
					-18
				],
				[
					-2,
					-27
				],
				[
					10,
					-36
				],
				[
					11,
					-57
				],
				[
					10,
					-13
				]
			],
			[
				[
					6050,
					4534
				],
				[
					-10,
					-18
				],
				[
					-19,
					-1
				]
			],
			[
				[
					5909,
					4651
				],
				[
					-15,
					17
				],
				[
					-18,
					10
				],
				[
					-11,
					10
				],
				[
					-12,
					14
				]
			],
			[
				[
					5853,
					4702
				],
				[
					-15,
					73
				],
				[
					-16,
					32
				],
				[
					-5,
					33
				]
			],
			[
				[
					5853,
					5008
				],
				[
					-6,
					13
				],
				[
					-1,
					22
				]
			],
			[
				[
					5844,
					5117
				],
				[
					10,
					7
				],
				[
					31,
					-1
				],
				[
					56,
					5
				]
			],
			[
				[
					6061,
					7895
				],
				[
					-22,
					-5
				],
				[
					-18,
					-18
				],
				[
					-26,
					-4
				],
				[
					-24,
					-21
				],
				[
					1,
					-36
				],
				[
					14,
					-14
				],
				[
					28,
					4
				],
				[
					-5,
					-21
				],
				[
					-31,
					-10
				],
				[
					-37,
					-33
				],
				[
					-16,
					12
				],
				[
					6,
					27
				],
				[
					-30,
					17
				],
				[
					5,
					11
				],
				[
					26,
					19
				],
				[
					-8,
					13
				],
				[
					-43,
					14
				],
				[
					-2,
					22
				],
				[
					-25,
					-7
				],
				[
					-11,
					-32
				],
				[
					-21,
					-42
				]
			],
			[
				[
					3517,
					3238
				],
				[
					-12,
					-36
				],
				[
					-31,
					-32
				],
				[
					-21,
					11
				],
				[
					-15,
					-6
				],
				[
					-26,
					25
				],
				[
					-18,
					-2
				],
				[
					-17,
					32
				]
			],
			[
				[
					679,
					6281
				],
				[
					-4,
					-9
				],
				[
					-7,
					8
				],
				[
					1,
					16
				],
				[
					-4,
					21
				],
				[
					1,
					6
				],
				[
					5,
					10
				],
				[
					-2,
					11
				],
				[
					1,
					6
				],
				[
					3,
					-2
				],
				[
					10,
					-9
				],
				[
					5,
					-5
				],
				[
					5,
					-8
				],
				[
					7,
					-20
				],
				[
					-1,
					-3
				],
				[
					-11,
					-13
				],
				[
					-9,
					-9
				]
			],
			[
				[
					664,
					6371
				],
				[
					-9,
					-4
				],
				[
					-5,
					12
				],
				[
					-3,
					5
				],
				[
					0,
					3
				],
				[
					3,
					5
				],
				[
					9,
					-5
				],
				[
					8,
					-9
				],
				[
					-3,
					-7
				]
			],
			[
				[
					646,
					6402
				],
				[
					-1,
					-6
				],
				[
					-15,
					1
				],
				[
					2,
					7
				],
				[
					14,
					-2
				]
			],
			[
				[
					621,
					6410
				],
				[
					-2,
					-3
				],
				[
					-2,
					1
				],
				[
					-9,
					2
				],
				[
					-4,
					13
				],
				[
					-1,
					2
				],
				[
					7,
					8
				],
				[
					3,
					-4
				],
				[
					8,
					-19
				]
			],
			[
				[
					574,
					6448
				],
				[
					-4,
					-5
				],
				[
					-9,
					10
				],
				[
					1,
					4
				],
				[
					5,
					6
				],
				[
					6,
					-1
				],
				[
					1,
					-14
				]
			],
			[
				[
					3135,
					7782
				],
				[
					5,
					-19
				],
				[
					-30,
					-28
				],
				[
					-29,
					-20
				],
				[
					-29,
					-17
				],
				[
					-15,
					-34
				],
				[
					-4,
					-13
				],
				[
					-1,
					-31
				],
				[
					10,
					-30
				],
				[
					11,
					-2
				],
				[
					-3,
					21
				],
				[
					8,
					-12
				],
				[
					-2,
					-17
				],
				[
					-19,
					-9
				],
				[
					-13,
					1
				],
				[
					-20,
					-10
				],
				[
					-12,
					-3
				],
				[
					-17,
					-3
				],
				[
					-23,
					-17
				],
				[
					41,
					11
				],
				[
					8,
					-11
				],
				[
					-39,
					-17
				],
				[
					-17,
					0
				],
				[
					0,
					7
				],
				[
					-8,
					-16
				],
				[
					8,
					-3
				],
				[
					-6,
					-41
				],
				[
					-20,
					-44
				],
				[
					-2,
					15
				],
				[
					-6,
					3
				],
				[
					-9,
					14
				],
				[
					5,
					-31
				],
				[
					7,
					-10
				],
				[
					1,
					-22
				],
				[
					-9,
					-22
				],
				[
					-16,
					-46
				],
				[
					-2,
					2
				],
				[
					8,
					39
				],
				[
					-14,
					22
				],
				[
					-3,
					48
				],
				[
					-5,
					-25
				],
				[
					5,
					-37
				],
				[
					-18,
					9
				],
				[
					19,
					-18
				],
				[
					1,
					-55
				],
				[
					8,
					-4
				],
				[
					3,
					-20
				],
				[
					4,
					-57
				],
				[
					-17,
					-43
				],
				[
					-29,
					-17
				],
				[
					-18,
					-34
				],
				[
					-14,
					-4
				],
				[
					-14,
					-21
				],
				[
					-4,
					-19
				],
				[
					-31,
					-38
				],
				[
					-16,
					-27
				],
				[
					-13,
					-34
				],
				[
					-4,
					-41
				],
				[
					5,
					-40
				],
				[
					9,
					-49
				],
				[
					13,
					-41
				],
				[
					0,
					-25
				],
				[
					13,
					-67
				],
				[
					-1,
					-39
				],
				[
					-1,
					-22
				],
				[
					-7,
					-35
				],
				[
					-8,
					-7
				],
				[
					-14,
					7
				],
				[
					-4,
					25
				],
				[
					-11,
					13
				],
				[
					-15,
					50
				],
				[
					-13,
					44
				],
				[
					-4,
					22
				],
				[
					6,
					38
				],
				[
					-8,
					32
				],
				[
					-22,
					48
				],
				[
					-10,
					9
				],
				[
					-28,
					-26
				],
				[
					-5,
					3
				],
				[
					-14,
					27
				],
				[
					-17,
					14
				],
				[
					-32,
					-7
				],
				[
					-24,
					6
				],
				[
					-21,
					-4
				],
				[
					-12,
					-9
				],
				[
					5,
					-15
				],
				[
					0,
					-23
				],
				[
					5,
					-12
				],
				[
					-5,
					-7
				],
				[
					-10,
					8
				],
				[
					-11,
					-11
				],
				[
					-20,
					2
				],
				[
					-20,
					30
				],
				[
					-25,
					-7
				],
				[
					-20,
					14
				],
				[
					-17,
					-5
				],
				[
					-24,
					-13
				],
				[
					-25,
					-43
				],
				[
					-27,
					-25
				],
				[
					-16,
					-27
				],
				[
					-6,
					-26
				],
				[
					0,
					-40
				],
				[
					1,
					-27
				],
				[
					5,
					-20
				]
			],
			[
				[
					1746,
					7056
				],
				[
					-4,
					29
				],
				[
					-18,
					33
				],
				[
					-13,
					7
				],
				[
					-3,
					17
				],
				[
					-16,
					3
				],
				[
					-10,
					15
				],
				[
					-26,
					6
				],
				[
					-7,
					9
				],
				[
					-3,
					32
				],
				[
					-27,
					58
				],
				[
					-23,
					80
				],
				[
					1,
					13
				],
				[
					-13,
					19
				],
				[
					-21,
					48
				],
				[
					-4,
					47
				],
				[
					-15,
					32
				],
				[
					6,
					48
				],
				[
					-1,
					49
				],
				[
					-8,
					44
				],
				[
					10,
					54
				],
				[
					4,
					53
				],
				[
					3,
					52
				],
				[
					-5,
					77
				],
				[
					-9,
					49
				],
				[
					-8,
					27
				],
				[
					4,
					11
				],
				[
					40,
					-19
				],
				[
					15,
					-55
				],
				[
					7,
					16
				],
				[
					-5,
					47
				],
				[
					-9,
					47
				]
			],
			[
				[
					750,
					8471
				],
				[
					-28,
					-22
				],
				[
					-14,
					15
				],
				[
					-4,
					27
				],
				[
					25,
					21
				],
				[
					15,
					8
				],
				[
					18,
					-3
				],
				[
					12,
					-18
				],
				[
					-24,
					-28
				]
			],
			[
				[
					401,
					8632
				],
				[
					-17,
					-9
				],
				[
					-19,
					11
				],
				[
					-17,
					16
				],
				[
					28,
					10
				],
				[
					22,
					-6
				],
				[
					3,
					-22
				]
			],
			[
				[
					230,
					8855
				],
				[
					17,
					-11
				],
				[
					17,
					6
				],
				[
					23,
					-15
				],
				[
					27,
					-8
				],
				[
					-2,
					-6
				],
				[
					-21,
					-12
				],
				[
					-21,
					12
				],
				[
					-11,
					11
				],
				[
					-24,
					-4
				],
				[
					-7,
					6
				],
				[
					2,
					21
				]
			],
			[
				[
					1374,
					8338
				],
				[
					-15,
					22
				],
				[
					-25,
					18
				],
				[
					-8,
					50
				],
				[
					-36,
					47
				],
				[
					-15,
					54
				],
				[
					-26,
					4
				],
				[
					-44,
					2
				],
				[
					-33,
					16
				],
				[
					-57,
					60
				],
				[
					-27,
					11
				],
				[
					-49,
					20
				],
				[
					-38,
					-5
				],
				[
					-55,
					27
				],
				[
					-33,
					24
				],
				[
					-30,
					-12
				],
				[
					5,
					-40
				],
				[
					-15,
					-3
				],
				[
					-32,
					-13
				],
				[
					-25,
					-19
				],
				[
					-30,
					-12
				],
				[
					-4,
					34
				],
				[
					12,
					56
				],
				[
					30,
					18
				],
				[
					-8,
					14
				],
				[
					-35,
					-32
				],
				[
					-19,
					-38
				],
				[
					-40,
					-41
				],
				[
					20,
					-28
				],
				[
					-26,
					-41
				],
				[
					-30,
					-24
				],
				[
					-28,
					-18
				],
				[
					-7,
					-25
				],
				[
					-43,
					-30
				],
				[
					-9,
					-27
				],
				[
					-32,
					-25
				],
				[
					-20,
					5
				],
				[
					-25,
					-16
				],
				[
					-29,
					-20
				],
				[
					-23,
					-19
				],
				[
					-47,
					-17
				],
				[
					-5,
					10
				],
				[
					31,
					27
				],
				[
					27,
					18
				],
				[
					29,
					31
				],
				[
					35,
					7
				],
				[
					14,
					23
				],
				[
					38,
					35
				],
				[
					6,
					11
				],
				[
					21,
					21
				],
				[
					5,
					43
				],
				[
					14,
					34
				],
				[
					-32,
					-17
				],
				[
					-9,
					10
				],
				[
					-15,
					-21
				],
				[
					-18,
					29
				],
				[
					-8,
					-21
				],
				[
					-10,
					29
				],
				[
					-28,
					-23
				],
				[
					-17,
					0
				],
				[
					-3,
					34
				],
				[
					5,
					21
				],
				[
					-17,
					21
				],
				[
					-37,
					-11
				],
				[
					-23,
					27
				],
				[
					-19,
					14
				],
				[
					0,
					32
				],
				[
					-22,
					25
				],
				[
					11,
					33
				],
				[
					23,
					32
				],
				[
					10,
					30
				],
				[
					22,
					4
				],
				[
					19,
					-9
				],
				[
					23,
					27
				],
				[
					20,
					-5
				],
				[
					21,
					18
				],
				[
					-5,
					27
				],
				[
					-16,
					10
				],
				[
					21,
					22
				],
				[
					-17,
					0
				],
				[
					-30,
					-13
				],
				[
					-8,
					-13
				],
				[
					-22,
					13
				],
				[
					-39,
					-6
				],
				[
					-41,
					13
				],
				[
					-12,
					23
				],
				[
					-35,
					34
				],
				[
					39,
					24
				],
				[
					62,
					28
				],
				[
					23,
					0
				],
				[
					-4,
					-29
				],
				[
					59,
					3
				],
				[
					-23,
					35
				],
				[
					-34,
					22
				],
				[
					-20,
					29
				],
				[
					-26,
					25
				],
				[
					-38,
					18
				],
				[
					15,
					30
				],
				[
					49,
					2
				],
				[
					35,
					26
				],
				[
					7,
					28
				],
				[
					28,
					27
				],
				[
					28,
					7
				],
				[
					52,
					26
				],
				[
					26,
					-4
				],
				[
					42,
					30
				],
				[
					42,
					-12
				],
				[
					21,
					-26
				],
				[
					12,
					12
				],
				[
					47,
					-4
				],
				[
					-2,
					-13
				],
				[
					43,
					-10
				],
				[
					28,
					6
				],
				[
					59,
					-18
				],
				[
					53,
					-6
				],
				[
					21,
					-7
				],
				[
					37,
					9
				],
				[
					42,
					-17
				],
				[
					31,
					-8
				]
			],
			[
				[
					3018,
					5861
				],
				[
					-1,
					-14
				],
				[
					-16,
					-7
				],
				[
					9,
					-26
				],
				[
					0,
					-30
				],
				[
					-12,
					-33
				],
				[
					10,
					-46
				],
				[
					12,
					4
				],
				[
					6,
					41
				],
				[
					-8,
					21
				],
				[
					-2,
					43
				],
				[
					35,
					24
				],
				[
					-4,
					27
				],
				[
					10,
					18
				],
				[
					10,
					-41
				],
				[
					19,
					-1
				],
				[
					18,
					-32
				],
				[
					1,
					-19
				],
				[
					25,
					0
				],
				[
					30,
					6
				],
				[
					16,
					-26
				],
				[
					21,
					-7
				],
				[
					16,
					18
				],
				[
					0,
					14
				],
				[
					34,
					4
				],
				[
					34,
					1
				],
				[
					-24,
					-17
				],
				[
					10,
					-28
				],
				[
					22,
					-4
				],
				[
					21,
					-28
				],
				[
					4,
					-46
				],
				[
					15,
					1
				],
				[
					11,
					-14
				]
			],
			[
				[
					8001,
					6424
				],
				[
					-37,
					-50
				],
				[
					-24,
					-54
				],
				[
					-6,
					-40
				],
				[
					22,
					-61
				],
				[
					25,
					-75
				],
				[
					26,
					-36
				],
				[
					17,
					-46
				],
				[
					12,
					-106
				],
				[
					-3,
					-102
				],
				[
					-24,
					-38
				],
				[
					-31,
					-37
				],
				[
					-23,
					-48
				],
				[
					-35,
					-53
				],
				[
					-10,
					37
				],
				[
					8,
					39
				],
				[
					-21,
					32
				]
			],
			[
				[
					9661,
					4234
				],
				[
					-9,
					-7
				],
				[
					-9,
					25
				],
				[
					1,
					15
				],
				[
					17,
					-33
				]
			],
			[
				[
					9641,
					4323
				],
				[
					4,
					-47
				],
				[
					-7,
					7
				],
				[
					-6,
					-3
				],
				[
					-4,
					16
				],
				[
					0,
					44
				],
				[
					13,
					-17
				]
			],
			[
				[
					6475,
					6141
				],
				[
					-20,
					-15
				],
				[
					-6,
					-26
				],
				[
					-1,
					-19
				],
				[
					-27,
					-25
				],
				[
					-45,
					-27
				],
				[
					-24,
					-40
				],
				[
					-13,
					-3
				],
				[
					-8,
					3
				],
				[
					-16,
					-24
				],
				[
					-18,
					-11
				],
				[
					-23,
					-3
				],
				[
					-7,
					-3
				],
				[
					-6,
					-15
				],
				[
					-8,
					-5
				],
				[
					-4,
					-14
				],
				[
					-14,
					1
				],
				[
					-9,
					-8
				],
				[
					-19,
					3
				],
				[
					-7,
					34
				],
				[
					1,
					31
				],
				[
					-5,
					17
				],
				[
					-5,
					43
				],
				[
					-8,
					23
				],
				[
					5,
					3
				],
				[
					-2,
					27
				],
				[
					3,
					11
				],
				[
					-1,
					25
				]
			],
			[
				[
					5817,
					3910
				],
				[
					11,
					0
				],
				[
					14,
					-10
				],
				[
					9,
					7
				],
				[
					15,
					-6
				]
			],
			[
				[
					5911,
					3643
				],
				[
					-7,
					-42
				],
				[
					-3,
					-48
				],
				[
					-7,
					-26
				],
				[
					-19,
					-29
				],
				[
					-5,
					-9
				],
				[
					-12,
					-29
				],
				[
					-8,
					-29
				],
				[
					-16,
					-42
				],
				[
					-31,
					-59
				],
				[
					-20,
					-35
				],
				[
					-21,
					-26
				],
				[
					-29,
					-22
				],
				[
					-14,
					-3
				],
				[
					-3,
					-16
				],
				[
					-17,
					8
				],
				[
					-14,
					-11
				],
				[
					-30,
					11
				],
				[
					-17,
					-7
				],
				[
					-11,
					3
				],
				[
					-29,
					-22
				],
				[
					-24,
					-9
				],
				[
					-17,
					-22
				],
				[
					-13,
					-2
				],
				[
					-11,
					21
				],
				[
					-10,
					1
				],
				[
					-12,
					26
				],
				[
					-1,
					-8
				],
				[
					-4,
					15
				],
				[
					0,
					34
				],
				[
					-9,
					39
				],
				[
					9,
					10
				],
				[
					0,
					44
				],
				[
					-19,
					54
				],
				[
					-14,
					49
				],
				[
					-20,
					75
				]
			],
			[
				[
					5840,
					4289
				],
				[
					-21,
					-7
				],
				[
					-15,
					-23
				],
				[
					-4,
					-20
				],
				[
					-10,
					-5
				],
				[
					-24,
					-47
				],
				[
					-15,
					-37
				],
				[
					-10,
					-2
				],
				[
					-9,
					7
				],
				[
					-31,
					6
				]
			]
		],
		"transform": {
			"scale": [
				0.036003600360036005,
				0.017366249624962495
			],
			"translate": [
				-180,
				-90
			]
		}
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	let FCChart = __webpack_require__(3);

	let d3 = __webpack_require__(4);

	class CohortChart extends FCChart.Chart {
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


/***/ },
/* 9 */
/***/ function(module, exports) {

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


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	let FCChart = __webpack_require__(3);

	let d3 = __webpack_require__(4);

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


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	let d3 = __webpack_require__(4);

	let FCChart = __webpack_require__(3);

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


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	let FCPlot = __webpack_require__(13);

	class TimeSeriesPlot extends FCPlot.AreaPlot {
	  constructor(margin) {
	    super(margin);
	  };
	}

	module.exports = TimeSeriesPlot;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * A Plot draws itself within whatever area it is given.
	 */

	let d3 = __webpack_require__(4);

	class Background {

	};

	// class Plot {
	//   constructor() {
	//     this.plotBackground = new Background();
	//   };
	// };

	class Plot {
	  constructor(/*title, subtitle, */margin) {
	    // this.chartBackground = new Background();

	    /**
	     * Set some default values:
	     */

	    margin = margin || {top: 20, right: 20, bottom: 20, left: 20};
	    this.margin = margin;
	    this.width = 760;
	    this.height = 120;
	    this.normaliseX = function(d) { return d[0]; };
	    this.normaliseY = function(d) { return d[1]; };
	  };

	  refresh(node, value) {
	    d3.select(node)
	      .datum(value)
	      .call(this.chart.bind(this));
	  }

	  draw(svg, data) {
	    this.gEnter = svg.enter().append('svg').append('g');

	    /**
	     * Set the dimensions of the view box:
	     */

	    svg
	    .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
	    .attr('preserveAspectRatio', 'none');
	  };

	  convertData(data) {
	    // Convert data to standard representation greedily;
	    // this is needed for nondeterministic accessors.
	    return data.map((d, i) => [this.normaliseX(d, i), this.normaliseY(d, i)]);
	  };

	  chart(selection) {
	    let self = this;

	    selection.each(function (data) {
	      if (data === '' || data === {}) {
	        return;
	      }

	      /**
	       * Provide an opportunity to convert the data, if necessary:
	       */

	      let convertedData = self.convertData(data);

	      /**
	       * Select the SVG element, if it exists:
	       */

	      var svg = d3
	      .select(this)
	      .selectAll('svg')
	      .data([convertedData]);

	      /**
	       * Call the chart-specific draw function with the SVG element and the data:
	       */

	      self.draw(svg, convertedData);
	    });
	  };

	  setNormaliseX(xFn) {
	    this.normaliseX = xFn;
	    return this;
	  };

	  setNormaliseXTimeFormat(format) {
	    var formatDate = d3.time.format(format);

	    this.setNormaliseX(function(d) { return formatDate.parse(d.date); })
	    return this;
	  };

	  setNormaliseY(yFn) {
	    this.normaliseY = yFn;
	    return this;
	  };

	  get normaliseX() { return this._normaliseX; }
	  set normaliseX(xFn) { this._normaliseX = xFn; }

	  get normaliseY() { return this._normaliseY; }
	  set normaliseY(yFn) { this._normaliseY = yFn; }

	  get margin() { return this._margin; }
	  set margin(m) {
	    this._margin = m;
	    return this;
	  }

	  get height() { return this._height; }
	  set height(m) {
	    this._height = m;
	    return this;
	  }

	  get width() { return this._width; }
	  set width(m) {
	    this._width = m;
	    return this;
	  }
	};

	class AxisPlot extends Plot {
	  constructor() {
	    super();

	    /**
	     * Default to linear axis for x and y:
	     */

	    this.xScale = d3.scale.linear();
	    this.yScale = d3.scale.linear();

	    // this.domainAxis = new DomainAxis();
	    // this.rangeAxis = new RangeAxis();
	    this.origin = [0, 0];
	  }

	  draw(svg, data) {
	    super.draw(svg, data);
	    let self = this;

	    // Update the x-scale.
	    this.xScale
	        .domain(d3.extent(data, function(d) { return d[0]; }))
	        .range([0, this.width - this.margin.left - this.margin.right]);

	    // Update the y-scale.
	    this.yScale
	        .domain([0, d3.max(data, function(d) { return d[1]; })])
	        .range([this.height - this.margin.top - this.margin.bottom, 0]);
	  }

	  /**
	   * Used by path generators:
	   */

	  X(d) { return this.xScale(d[0]); }
	  Y(d) { return this.yScale(d[1]); }

	  get xScale() { return this._xScale; }
	  set xScale(xScale) { this._xScale = xScale; }

	  get yScale() { return this._yScale; }
	  set yScale(yScale) { this._yScale = yScale; }
	};

	class LinePlot extends AxisPlot {
	  constructor() {
	    super();

	    this.line = d3.svg.line().x(this.X.bind(this)).y(this.Y.bind(this));
	  }

	  draw(svg, data) {
	    super.draw(svg, data);

	    this.gEnter.append('path').attr('class', 'line');

	    // Update the line path.
	    svg
	    .select('g')
	    .select('.line')
	      .attr('d', this.line);
	  }
	};

	class AreaPlot extends LinePlot {
	  constructor() {
	    super();

	    this.area = d3.svg.area().x(this.X.bind(this)).y1(this.Y.bind(this));
	  }

	  draw(svg, data) {
	    super.draw(svg, data);

	    this.gEnter.append('path').attr('class', 'area');

	    svg
	    .select('g')
	    .select('.area')
	      .attr('d', this.area.y0(this.yScale.range()[0]));
	  }
	};

	module.exports = {
	  Plot,
	  AxisPlot,
	  LinePlot,
	  AreaPlot
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	let d3 = __webpack_require__(4);

	let FCPlot = __webpack_require__(13);

	class ScatterPlot extends FCPlot.AxisPlot {
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
	      return [d[self.key1Name], +d[self.key2Name], d[self.colorName]];
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

	module.exports = ScatterPlot;


/***/ }
/******/ ]);