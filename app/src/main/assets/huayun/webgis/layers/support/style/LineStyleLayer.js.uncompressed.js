define("com/huayun/webgis/layers/support/style/LineStyleLayer", [
    "./StyleLayer",
    "./Properties",
    "./DataConstantProperty",
    "./DataDrivenProperty",
    "./CrossFadedProperty",
    "./CrossFadedDataDrivenProperty",
    "./ColorRampProperty",
    "./spec",
    "./EvaluationParameters",
    "../../../data/bucket/LineBucket",
    "../../../geometry/Point",
    "./styleUtils",
    "../../../utils/image",
    "../../../utils/utils",
    "../../../geometry/intersection_tests"
], function (StyleLayer, Properties, DataConstantProperty, DataDrivenProperty, CrossFadedProperty, CrossFadedDataDrivenProperty, ColorRampProperty, spec, EvaluationParameters, LineBucket, Point,
             styleUtils, image, utils, intersectionTests) {

    function getLineWidth(lineWidth, lineGapWidth) {
        if (lineGapWidth > 0) {
            return lineGapWidth + 2 * lineWidth;
        } else {
            return lineWidth;
        }
    }

    function offsetLine(rings, offset) {
        var newRings = [];
        var zero = new Point(0, 0);
        for (var k = 0; k < rings.length; k++) {
            var ring = rings[k];
            var newRing = [];
            for (var i = 0; i < ring.length; i++) {
                var a = ring[i - 1];
                var b = ring[i];
                var c = ring[i + 1];
                var aToB = i === 0 ? zero : b.sub(a)._unit()._perp();
                var bToC = i === ring.length - 1 ? zero : c.sub(b)._unit()._perp();
                var extrude = aToB._add(bToC)._unit();

                var cosHalfAngle = extrude.x * bToC.x + extrude.y * bToC.y;
                extrude._mult(1 / cosHalfAngle);
                newRing.push(extrude._mult(offset)._add(b));
            }
            newRings.push(newRing);
        }
        return newRings;
    }

    /**
     * 类型为line的图层的layout可配置属性:
     * line-cap: 线条末端线帽的样式, 可取值有: butt(默认), round, square
     * line-join: 线条相交处的形状, 可取值: bevel, round, miter(默认)
     * line-miter-limit: 自动将miter类型的join转成bevel类型的join的角度, 默认2
     * line-round-limit: 自动将round类型的join转成miter类型的join的角度, 默认1.05
     * @private
     * @ignore
     * @type {*|exports}
     */
    var layout$4 = new Properties({
        "line-cap": new DataConstantProperty(spec["layout_line"]["line-cap"]),
        "line-join": new DataDrivenProperty(spec["layout_line"]["line-join"]),
        "line-miter-limit": new DataConstantProperty(spec["layout_line"]["line-miter-limit"]),
        "line-round-limit": new DataConstantProperty(spec["layout_line"]["line-round-limit"])
    });

    /**
     * 类型为line的图层的paint可配置属性:
     * line-opacity: 线的透明度
     * line-color: 线的颜色
     * line-translate: 偏移, 值是[x,y], 负值代表向左, 向上偏移
     * line-translate-anchor: 偏移的参考, 取值有: map(根据map计算偏移), viewport(根据viewport计算偏移)
     * line-width: 线宽
     * line-gap-width: 线的外侧绘制平行线, 值表示两条线空隙的宽度
     * line-offset: 线的偏移, 默认值0, 正值代表沿线的方向往右偏移, 负值代表向左偏移
     * line-blur: 线的模糊
     * line-dasharray: 虚线的样式配置, 同canvas的2D的linedash设置
     * line-pattern: 线的图片填充
     * line-gradient:线的渐变
     * @private
     * @ignore
     * @type {*|exports}
     */
    var paint$6 = new Properties({
        "line-opacity": new DataDrivenProperty(spec["paint_line"]["line-opacity"]),
        "line-color": new DataDrivenProperty(spec["paint_line"]["line-color"]),
        "line-translate": new DataConstantProperty(spec["paint_line"]["line-translate"]),
        "line-translate-anchor": new DataConstantProperty(spec["paint_line"]["line-translate-anchor"]),
        "line-width": new DataDrivenProperty(spec["paint_line"]["line-width"]),
        "line-gap-width": new DataDrivenProperty(spec["paint_line"]["line-gap-width"]),
        "line-offset": new DataDrivenProperty(spec["paint_line"]["line-offset"]),
        "line-blur": new DataDrivenProperty(spec["paint_line"]["line-blur"]),
        "line-dasharray": new CrossFadedProperty(spec["paint_line"]["line-dasharray"]),
        "line-pattern": new CrossFadedDataDrivenProperty(spec["paint_line"]["line-pattern"]),
        "line-gradient": new ColorRampProperty(spec["paint_line"]["line-gradient"])
    });

    var properties$5 = {paint: paint$6, layout: layout$4};

    var LineFloorwidthProperty = (function (DataDrivenProperty) {
        function LineFloorwidthProperty() {
            DataDrivenProperty.apply(this, arguments);
        }

        if (DataDrivenProperty) LineFloorwidthProperty.__proto__ = DataDrivenProperty;
        LineFloorwidthProperty.prototype = Object.create(DataDrivenProperty && DataDrivenProperty.prototype);
        LineFloorwidthProperty.prototype.constructor = LineFloorwidthProperty;

        LineFloorwidthProperty.prototype.possiblyEvaluate = function (value, parameters) {
            parameters = new EvaluationParameters(Math.floor(parameters.zoom), {
                now: parameters.now,
                fadeDuration: parameters.fadeDuration,
                zoomHistory: parameters.zoomHistory,
                transition: parameters.transition
            });
            return DataDrivenProperty.prototype.possiblyEvaluate.call(this, value, parameters);
        };

        LineFloorwidthProperty.prototype.evaluate = function evaluate(value, globals, feature, featureState) {
            globals = utils.extend({}, globals, {zoom: Math.floor(globals.zoom)});
            return DataDrivenProperty.prototype.evaluate.call(this, value, globals, feature, featureState);
        };

        return LineFloorwidthProperty;
    }(DataDrivenProperty));

    var lineFloorwidthProperty = new LineFloorwidthProperty(properties$5.paint.properties['line-width'].specification);
    lineFloorwidthProperty.useIntegerZoom = true;

    /**
     * 类型为line的图层的样式类
     * @private
     * @ignore
     * @param layer
     * @constructor
     */
    function LineStyleLayer(layer) {
        StyleLayer.call(this, layer, properties$5);
    }

    if (StyleLayer) LineStyleLayer.__proto__ = StyleLayer;
    LineStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
    LineStyleLayer.prototype.constructor = LineStyleLayer;

    LineStyleLayer.prototype._handleSpecialPaintPropertyUpdate = function (name) {
        if (name === 'line-gradient') {
            this._updateGradient();
        }
    };

    LineStyleLayer.prototype._updateGradient = function () {
        var expression = this._transitionablePaint._values['line-gradient'].value.expression;
        this.gradient = image.renderColorRamp(expression, 'lineProgress');
        this.gradientTexture = null;
    };

    LineStyleLayer.prototype.recalculate = function (parameters) {
        StyleLayer.prototype.recalculate.call(this, parameters);
        this.paint._values['line-floorwidth'] = lineFloorwidthProperty.possiblyEvaluate(this._transitioningPaint._values['line-width'].value, parameters);
    };

    LineStyleLayer.prototype.createBucket = function (parameters) {
        return new LineBucket(parameters);
    };

    LineStyleLayer.prototype.queryRadius = function (bucket) {
        var lineBucket = bucket;
        var width = getLineWidth(
            styleUtils.getMaximumPaintValue('line-width', this, lineBucket),
            styleUtils.getMaximumPaintValue('line-gap-width', this, lineBucket));
        var offset = styleUtils.getMaximumPaintValue('line-offset', this, lineBucket);
        var dist = this.paint.get('line-translate');
        dist = Math.sqrt(dist[0] * dist[0] + dist[1] * dist[1]);
        return width / 2 + Math.abs(offset) + dist;
    };

    LineStyleLayer.prototype.queryIntersectsFeature = function (queryGeometry, feature, featureState, geometry,
                                                                zoom, transform, pixelsToTileUnits) {
        var translatedPolygon = styleUtils.translate(queryGeometry, this.paint.get('line-translate'),
          this.paint.get('line-translate-anchor'), transform.angle, pixelsToTileUnits);
        var halfWidth = pixelsToTileUnits / 2 * getLineWidth(
          this.paint.get('line-width').evaluate(feature, featureState),
          this.paint.get('line-gap-width').evaluate(feature, featureState));
        var lineOffset = this.paint.get('line-offset').evaluate(feature, featureState);
        if (lineOffset) {
          geometry = offsetLine(geometry, lineOffset * pixelsToTileUnits);
        }

        return intersectionTests.polygonIntersectsBufferedMultiLine(translatedPolygon, geometry, halfWidth);
    };

    LineStyleLayer.prototype.isTileClipped = function () {
        return true;
    };

    return LineStyleLayer;
});