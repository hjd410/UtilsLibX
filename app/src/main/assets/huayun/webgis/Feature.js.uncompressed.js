/**
 * 图形特征类
 * @module   com/huayun/webgis
 * @see   com.huayun.webgis.Feature
 */
define("com/huayun/webgis/Feature", [
    "./utils/Color"
], function (Color) {
    /**
     * 图形特征类, 包含图形的形状geometry和图形属性attributes
     * @constructor
     * @alias com.huayun.webgis.Feature
     * @param {Object} params 图形特征类参数
     * @param {Object|Array} params.attributes 图形属性
     * @param {Geometry} params.geometry 图形形状
     * @property {Object|Array} attributes 图形属性
     * @property {Geometry} geometry 图形形状
     */
    function Feature(params) {
        this.attributes = params.attributes === undefined || params.attributes === null ? {} : params.attributes;
        this.type = params.type;
        this.geometry = params.geometry;

        if (this.attributes.hasOwnProperty("color")) {
            var color = this.attributes.color;
            if (color instanceof Array) {
                this.attributes.color = color;
            } else {
                color = Color.parse(color);
                this.attributes.color = [color.r, color.g, color.b, color.a];
            }
        }
    }
    return Feature;
});
