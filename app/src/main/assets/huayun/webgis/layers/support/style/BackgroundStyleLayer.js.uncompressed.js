define("com/huayun/webgis/layers/support/style/BackgroundStyleLayer", [
    "./StyleLayer",
    "./Properties",
    "./DataConstantProperty",
    "./CrossFadedProperty",
    "./spec"
], function (StyleLayer, Properties, DataConstantProperty, CrossFadedProperty, spec) {
    /**
     * 背景图层允许配置的paint属性
     * background-color: 背景色
     * background-pattern: 背景填充样式
     * background-opacity: 背景透明度
     * @private
     * @ignore
     * @type {Properties|exports}
     */
    var paint$8 = new Properties({
        "background-color": new DataConstantProperty(spec["paint_background"]["background-color"]),
        "background-pattern": new CrossFadedProperty(spec["paint_background"]["background-pattern"]),
        "background-opacity": new DataConstantProperty(spec["paint_background"]["background-opacity"])
    });

    var properties$7 = {paint: paint$8};

    /**
     * 背景图层样式类
     * @private
     * @ignore
     * @param layer
     * @constructor
     */
    function BackgroundStyleLayer(layer) {
        StyleLayer.call(this, layer, properties$7);
    }

    if (StyleLayer) BackgroundStyleLayer.__proto__ = StyleLayer;
    BackgroundStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
    BackgroundStyleLayer.prototype.constructor = BackgroundStyleLayer;
    return BackgroundStyleLayer;
});