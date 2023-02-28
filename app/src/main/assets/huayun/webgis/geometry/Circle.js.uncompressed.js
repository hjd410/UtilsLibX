/**
 * 圆
 * @module com/huayun/webgis/geometry
 * @see  com.huayun.webgis.geometry.Circle
 */
define("com/huayun/webgis/geometry/Circle", [], function () {
    /**
     * 圆
     * @constructor
     * @alias com.huayun.webgis.geometry.Circle
     * @extends {Geometry}
     * @param {Object} params 参数
     * @param {Point} params.center  - 圆点位置
     * @param {number} params.radius  - 半径
     * @property {Point} center  - 圆点位置
     * @property {number} radius  - 半径 
     */
    function Circle(params) {
        this.type = "circle";
        if (params) {
            this.center = params.center;
            this.radius = params.radius || 10;
        }
    }

    /**
     * 设置圆点
     * @param {Point} center 圆点位置
     */
    Circle.prototype.setCenter = function (center) {
        this.center = center;
    };
    /**
     * 设置半径
     * @param {number} radius 半径
     */
    Circle.prototype.setRadius = function (radius) {
        // console.log(radius);
        this.radius = radius;
    };

    Circle.prototype.refresh = function () {

    };
    return Circle;
});