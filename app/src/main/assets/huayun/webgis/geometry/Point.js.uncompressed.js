/**
 * 点
 * @module com/huayun/webgis/geometry
 * @see com.huayun.webgis.geometry.Point
 */
define("com/huayun/webgis/geometry/Point", [
  "./Geometry",
  "./Extent"
], function (Geometry, Extent) {
  /**
   * 点
   * @constructor
   * @alias com.huayun.webgis.geometry.Point
   * @extends {Geometry}
   * @property {string} type 类型
   * @property {number} x x坐标
   * @property {number} y y坐标
   * @property {number} z z左边
   * @param {number} x x坐标
   * @param {number} y y坐标
   * @param {number} z z左边
   */
  var Point = function (x, y, z, spatialReference) {
    Geometry.call(this);
    if (Array.isArray(x)) {
      this.x = x[0];
      this.y = x[1];
      this.z = x[2];
    } else {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    this.hasZ = this.z === undefined;
    this.type = "point";
    this.spatialReference = spatialReference;
  };

  if (Geometry) Point.__proto__ = Geometry;

  Point.prototype = Object.create(Geometry && Geometry.prototype);
  Point.prototype.constructor = Point;
  
  Point.prototype = {
    clone: function () {
      return new Point(this.x, this.y, this.z);
    },
    add: function (p) {
      return this.clone()._add(p);
    },
    sub: function (p) {
      return this.clone()._sub(p);
    },

    multByPoint: function (p) {
      return this.clone()._multByPoint(p);
    },

    divByPoint: function (p) {
      return this.clone()._divByPoint(p);
    },

    mult: function (k) {
      return this.clone()._mult(k);
    },

    div: function (k) {
      return this.clone()._div(k);
    },

    rotate: function (a) {
      return this.clone()._rotate(a);
    },

    radianJS: function(edgePoint) {
      let dx = edgePoint.x - this.x;
      let dy = -(edgePoint.y - this.y);
      return Math.atan2(dy, dx);
    },

    rotateAround: function (a, p) {
      return this.clone()._rotateAround(a, p);
    },

    matMult: function (m) {
      return this.clone()._matMult(m);
    },

    unit: function () {
      return this.clone()._unit();
    },

    perp: function () {
      return this.clone()._perp();
    },

    round: function () {
      return this.clone()._round();
    },

    mag: function () {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    equals: function (other) {
      return this.x === other.x &&
        this.y === other.y;
    },

    dist: function (p) {
      return Math.sqrt(this.distSqr(p));
    },

    distSqr: function (p) {
      var dx = p.x - this.x,
        dy = p.y - this.y;
      return dx * dx + dy * dy;
    },

    angle: function () {
      return Math.atan2(this.y, this.x);
    },

    angleTo: function (b) {
      return Math.atan2(this.y - b.y, this.x - b.x);
    },

    angleWith: function (b) {
      return this.angleWithSep(b.x, b.y);
    },

    angleWithSep: function (x, y) {
      return Math.atan2(
        this.x * y - this.y * x,
        this.x * x + this.y * y);
    },

    _matMult: function (m) {
      var x = m[0] * this.x + m[1] * this.y,
        y = m[2] * this.x + m[3] * this.y;
      this.x = x;
      this.y = y;
      return this;
    },

    _add: function (p) {
      this.x += p.x;
      this.y += p.y;
      return this;
    },

    _sub: function (p) {
      this.x -= p.x;
      this.y -= p.y;
      return this;
    },

    _mult: function (k) {
      this.x *= k;
      this.y *= k;
      return this;
    },

    _div: function (k) {
      this.x /= k;
      this.y /= k;
      return this;
    },

    _multByPoint: function (p) {
      this.x *= p.x;
      this.y *= p.y;
      return this;
    },

    _divByPoint: function (p) {
      this.x /= p.x;
      this.y /= p.y;
      return this;
    },

    _unit: function () {
      this._div(this.mag());
      return this;
    },

    _perp: function () {
      var y = this.y;
      this.y = this.x;
      this.x = -y;
      return this;
    },

    _rotate: function (angle) {
      var cos = Math.cos(angle),
        sin = Math.sin(angle),
        x = cos * this.x - sin * this.y,
        y = sin * this.x + cos * this.y;
      this.x = x;
      this.y = y;
      return this;
    },

    _rotateAround: function (angle, p) {
      var cos = Math.cos(angle),
        sin = Math.sin(angle),
        x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y),
        y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
      this.x = x;
      this.y = y;
      return this;
    },

    _round: function () {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      return this;
    },

    radian: function (edgePoint) {
      let dx = edgePoint.x - this.x;
      let dy = edgePoint.y - this.y;
      return Math.atan2(dy, dx);
    },
    calculateOtherPoint: function (lineLength, radian) {
      let xValue = Math.cos(radian) * lineLength + this.x;
      let yValue = Math.sin(radian) * lineLength + this.y;
      return new Point(xValue, yValue);
    },
    interpolate: function(target, ratio) {
      let x = this.x * ratio + target.x * (1 - ratio);
      let y = this.y * ratio + target.y * (1 - ratio);
      return new Point(x, y);
    },
    calculateOtherPoint2: function(point2, lineLength) {
      let radian = Math.atan2(point2.y - this.y, point2.x - this.x);
      let xValue = this.x - lineLength * Math.sin(radian);
      let yValue = this.y + lineLength * Math.cos(radian);
      return new Point(xValue, yValue);
    },
    calculateOtherPoint3: function(point2, lineLength) {
      let radian = Math.atan2(point2.y - this.y, point2.x - this.x);
      let xValue = this.x + lineLength * Math.sin(radian);
      let yValue = this.y - lineLength * Math.cos(radian);
      return new Point(xValue, yValue);
    }
  };

  Point.prototype.update = function(dx, dy, dz) {
    this.x += dx;
    this.y += dy;
    if (dz) {
      this.z += dz;
    }
  };

  Point.convert = function (a) {
    if (a instanceof Point) {
      return a;
    }
    if (Array.isArray(a)) {
      return new Point(a[0], a[1]);
    }
    return a;
  };

  var prototypeAccessors = {
    extent: {configurable: false}
  };
  prototypeAccessors.extent.get = function () {
    if (!this._extent) {
      this._extent = new Extent(this.x, this.y, this.x, this.y);
    }
    return this._extent;
  };
  Object.defineProperties(Point.prototype, prototypeAccessors);
  return Point;
});
