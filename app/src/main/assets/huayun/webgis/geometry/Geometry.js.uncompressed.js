/**
 * 几何元素基类
 * @module com/huayun/webgis/geometry
 * @see com.huayun.webgis.geometry.Geometry
 */
define("com/huayun/webgis/geometry/Geometry", [], function () {
  /**
   * 构造函数
   * @constructor
   * @alias com.huayun.webgis.geometry.Geometry
   * @property {Object} extent  - 地图范围
   * @property {String} type  - 图形类型
   */
  function Geometry() {
    // todo
    this.extent = null;
    this.spatialReference = null;
    this.type = "";
    this.hasM = false;
    this.hasZ = false;
  }

  Geometry.prototype.clone = function () {
    // todo
  };

  Geometry.prototype.update = function () {};

  return Geometry;
});
