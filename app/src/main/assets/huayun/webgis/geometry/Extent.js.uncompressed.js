/**
 * 地理范围
 * @module com/huayun/webgis/geometry
 * @see com.huayun.webgis.geometry.Extent
 */
define("com/huayun/webgis/geometry/Extent", [
  "./Geometry"
], function (Geometry) {
  /**
   * 地理范围
   * @constructor
   * @alias com.huayun.webgis.geometry.Extent
   * @extends {Geometry}
   * @param {number} xmin 范围最小x坐标
   * @param {number} ymin 范围最小y坐标
   * @param {number} xmax 范围最大x坐标
   * @param {number} ymax 范围最大x坐标
   * @property {number} xmin 范围最小x坐标
   * @property {number} ymin 范围最小y坐标
   * @property {number} xmax 范围最大x坐标
   * @property {number} ymax 范围最大x坐标
   * @property {number} width 范围宽度
   * @property {number} height 范围高度
   * @property {Object} center 范围中心点
   */
  var Extent = function (xmin, ymin, xmax, ymax, spatialReference) {
    Geometry.call(this);
    this.spatialReference = spatialReference;
    this.xmin = xmin;
    this.ymin = ymin;
    this.xmax = xmax;
    this.ymax = ymax;
  };

  if (Geometry) Extent.__proto__ = Geometry;
  Extent.prototype = Object.create(Geometry && Geometry.prototype);
  Extent.prototype.constructor = Extent;

  var prototypeAccessors = {
    minx: {configurable: true},
    miny: {configurable: true},
    maxx: {configurable: true},
    maxy: {configurable: true}, // 兼容以前版本
    width: {configurable: false},
    height: {configurable: false},
    center: {configurable: false}
  };

  prototypeAccessors.minx.get = function () {
    return this.xmin;
  };

  prototypeAccessors.minx.set = function (min) {
    this.xmin = min;
  };

  prototypeAccessors.miny.get = function () {
    return this.ymin;
  };

  prototypeAccessors.miny.set = function (min) {
    this.ymin = min;
  };

  prototypeAccessors.maxx.get = function () {
    return this.xmax;
  };

  prototypeAccessors.maxx.set = function (max) {
    this.xmax = max;
  };

  prototypeAccessors.maxy.get = function () {
    return this.ymax;
  };

  prototypeAccessors.maxy.set = function (max) {
    this.ymax = max;
  };

  prototypeAccessors.width.get = function () {
    return Math.abs(this.xmax - this.xmin);
  };

  prototypeAccessors.height.get = function () {
    return Math.abs(this.ymax - this.ymin);
  };

  prototypeAccessors.center.get = function () {
    // return new Point(, );
    return {
      x: .5 * (this.xmin + this.xmax),
      y: .5 * (this.ymin + this.ymax),
      z: 0,
      type: "point"
    }
  };

  Extent.prototype = {
    getCenter: function () {
      // return new Point(.5 * (this.xmin + this.xmax), .5 * (this.ymin + this.ymax));
      return {
        x: .5 * (this.xmin + this.xmax),
        y: .5 * (this.ymin + this.ymax),
        z: 0,
        type: "point"
      }
    },

    getWidth: function () {
      return Math.abs(this.xmax - this.xmin);
    },

    getHeight: function () {
      return Math.abs(this.ymax - this.ymin);
    },

    /**
     * 判断两个范围是否相等
     * @param a 待比较范围
     * @return {boolean} 两个范围是否相等
     */
    equals: function (a) {
      if (!a) return !1;
      return this.xmin === a.xmin && this.ymin === a.ymin && this.xmax === a.xmax && this.ymax === a.ymax;
    }
  };

  Object.defineProperties(Extent.prototype, prototypeAccessors);
  return Extent;
});
