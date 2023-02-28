define("com/huayun/webgis/layers/support/style/FillStyleLayer", [
    "./StyleLayer",
    "./Properties",
    "./DataConstantProperty",
    "./DataDrivenProperty",
    "./CrossFadedDataDrivenProperty",
    "./spec",
    "./styleUtils",
    "../../../data/bucket/FillBucket",
    "../../../geometry/intersection_tests"
], function (StyleLayer, Properties, DataConstantProperty, DataDrivenProperty, CrossFadedDataDrivenProperty, spec, styleUtils, FillBucket, intersectionTests) {

    /**
     * fill类型的图层可配置的paint属性
     * fill-antialias: 是否抗锯齿
     * fill-opacity: 透明度
     * fill-color:填充色
     * fill-outline-color: 外边框颜色
     * fill-translate: 平移, [x,y], 负值代表向左和向上
     * fill-translate-anchor 平移参考, 取值map和viewport
     * fill-pattern: 填充样式
     * @private
     * @ignore
     * @type {Properties|exports}
     */
    var paint$4 = new Properties({
        "fill-antialias": new DataConstantProperty(spec["paint_fill"]["fill-antialias"]),
        "fill-opacity": new DataDrivenProperty(spec["paint_fill"]["fill-opacity"]),
        "fill-color": new DataDrivenProperty(spec["paint_fill"]["fill-color"]),
        "fill-outline-color": new DataDrivenProperty(spec["paint_fill"]["fill-outline-color"]),
        "fill-translate": new DataConstantProperty(spec["paint_fill"]["fill-translate"]),
        "fill-translate-anchor": new DataConstantProperty(spec["paint_fill"]["fill-translate-anchor"]),
        "fill-pattern": new CrossFadedDataDrivenProperty(spec["paint_fill"]["fill-pattern"])
    });

    var properties$3 = {paint: paint$4};

    /**
     * fill类型的样式类
     * @private
     * @ignore
     * @param layer
     * @constructor
     */
    function FillStyleLayer(layer) {
        StyleLayer.call(this, layer, properties$3);
    }

    if (StyleLayer) FillStyleLayer.__proto__ = StyleLayer;
    FillStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
    FillStyleLayer.prototype.constructor = FillStyleLayer;

    FillStyleLayer.prototype.recalculate = function (parameters) {
        StyleLayer.prototype.recalculate.call(this, parameters);

        var outlineColor = this.paint._values['fill-outline-color'];
        if (outlineColor.value.kind === 'constant' && outlineColor.value.value === undefined) {
            this.paint._values['fill-outline-color'] = this.paint._values['fill-color'];
        }
    };

    FillStyleLayer.prototype.createBucket = function (parameters) {
        return new FillBucket(parameters);
    };

    FillStyleLayer.prototype.queryRadius = function () {
        var translate = this.paint.get('fill-translate');
        return Math.sqrt(translate[0] * translate[0] + translate[1] * translate[1]);
    };

    /**
     * 检测相碰撞的Feature
     * @param queryGeometry
     * @param feature
     * @param featureState
     * @param geometry
     * @param zoom
     * @param transform
     * @param pixelsToTileUnits
     */
    FillStyleLayer.prototype.queryIntersectsFeature = function (queryGeometry, feature, featureState, geometry,
                                                                zoom, transform, pixelsToTileUnits) {
        var translatedPolygon = styleUtils.translate(queryGeometry, this.paint.get('fill-translate'),
          this.paint.get('fill-translate-anchor'), transform.angle, pixelsToTileUnits);
        return intersectionTests.polygonIntersectsMultiPolygon(translatedPolygon, geometry);
    };

    FillStyleLayer.prototype.isTileClipped = function isTileClipped() {
        return true;
    };

    return FillStyleLayer;
});