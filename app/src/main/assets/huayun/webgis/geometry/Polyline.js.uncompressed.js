/**
 * 线
 * @module com/huayun/webgis/geometry
 * @see com.huayun.webgis.geometry.Polyline
 */
define("com/huayun/webgis/geometry/Polyline", [
  "./Geometry",
  "./Extent"
], function (Geometry, Extent) {

  function findExtremum(path) {
    var xmin, ymin, xmax, ymax;
    xmin = xmax = path[0][0].x;
    ymin = ymax = path[0][0].y;
    var len = path.length;
    for (var i = 0; i < len; i++) {
      var line = path[i];
      var ll = line.length;
      for (var j = 0; j < ll; j++) {
        var p = line[j];
        xmin = Math.min(xmin, p.x);
        ymin = Math.min(ymin, p.y);
        xmax = Math.max(xmax, p.x);
        ymax = Math.max(ymax, p.y);
      }
    }
    return {
      xmin: xmin,
      ymin: ymin,
      xmax: xmax,
      ymax: ymax
    };
  }

  /**
   * 线
   * @alias com.huayun.webgis.geometry.Polyline
   * @extends {Geometry}
   * @param {Array} path  - 线的点数组, 二维数组
   * @property {Array} path  - 线的点数组, 二维数组
   * @property {Extent} extent  - 线的范围
   * var line = new Polyline([[
   *  new Point(514581, 3349546),
   *  new Point(514981, 3349546),
   *  new Point(514981, 3349246),
   *  new Point(514581, 3349246),
   *  new Point(514581, 3349546)
   * ], [
   *  new Point(514581, 3349546),
   *  new Point(514981, 3349546),
   *  new Point(514981, 3349246),
   *  new Point(514581, 3349246),
   *  new Point(514581, 3349546)
   * ]
   * ]);
   */
  var Polyline = function (path, spatialReference) {
    Geometry.call(this);
    this.type = "line";
    this.path = path;
    this.spatialReference = spatialReference;
    this._extent = null;
  };

  if (Geometry) Polyline.__proto__ = Geometry;
  Polyline.prototype = Object.create(Geometry && Geometry.prototype);
  Polyline.prototype.constructor = Polyline;

  var prototypeAccessors = {
    length: {configurable: false},
    extent: {configurable: false}
  };

  prototypeAccessors.length.get = function () {
    return this.path.length;
  };

  prototypeAccessors.extent.get = function () {
    if (!this._extent) {
      var extremum = findExtremum(this.path);
      this._extent = new Extent(extremum.xmin, extremum.ymin, extremum.xmax, extremum.ymax);
    }
    return this._extent;
  };

  Polyline.prototype = {
    setPath: function (path) {
      this.path = path;
      this._extent = null;
    },
    addPath: function (line) {
      this.path.push(line);
      this._extent = null;
    },
    update: function (dx, dy) {
      this.path.forEach(function (line) {
        line.forEach(function (point) {
          point.update(dx, dy);
        });
      });
      this._extent = null;
    }
  };

  Object.defineProperties(Polyline.prototype, prototypeAccessors);
  return Polyline;
});