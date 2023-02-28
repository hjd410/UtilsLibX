define("com/huayun/webgis/layers/support/style/CrossFadedDataDrivenProperty", [
    "./DataDrivenProperty",
    "./PossiblyEvaluatedPropertyValue"
], function (DataDrivenProperty, PossiblyEvaluatedPropertyValue) {
    /**
     * data-driven的"line-pattern"的属性值, 通过cross-fading而不是插值变换来表达渐变
     * @private
     * @ignore
     * @constructor
     */
    function CrossFadedDataDrivenProperty() {
        DataDrivenProperty.apply(this, arguments);
    }

    if (DataDrivenProperty) CrossFadedDataDrivenProperty.__proto__ = DataDrivenProperty;
    CrossFadedDataDrivenProperty.prototype = Object.create(DataDrivenProperty && DataDrivenProperty.prototype);
    CrossFadedDataDrivenProperty.prototype.constructor = CrossFadedDataDrivenProperty;

    CrossFadedDataDrivenProperty.prototype.possiblyEvaluate = function (value, parameters) {
        if (value.value === undefined) {
            return new PossiblyEvaluatedPropertyValue(this, {kind: 'constant', value: undefined}, parameters);
        } else if (value.expression.kind === 'constant') {
            var constantValue = value.expression.evaluate(parameters);
            var constant = this._calculate(constantValue, constantValue, constantValue, parameters);
            return new PossiblyEvaluatedPropertyValue(this, {kind: 'constant', value: constant}, parameters);
        } else if (value.expression.kind === 'camera') {
            var cameraVal = this._calculate(
                value.expression.evaluate({zoom: parameters.zoom - 1.0}),
                value.expression.evaluate({zoom: parameters.zoom}),
                value.expression.evaluate({zoom: parameters.zoom + 1.0}),
                parameters);
            return new PossiblyEvaluatedPropertyValue(this, {kind: 'constant', value: cameraVal}, parameters);
        } else {
            return new PossiblyEvaluatedPropertyValue(this, value.expression, parameters);
        }
    };

    /**
     * 根据全局属性GlobalProperties和Feature的属性来计算最终属性值
     * @param value
     * @param globals
     * @param feature
     * @param featureState
     * @return {{from: *, to: *}|*}
     */
    CrossFadedDataDrivenProperty.prototype.evaluate = function (value, globals, feature, featureState) {
        if (value.kind === 'source') {
            var constant = value.evaluate(globals, feature, featureState);
            return this._calculate(constant, constant, constant, globals);
        } else if (value.kind === 'composite') {
            return this._calculate(
                value.evaluate({zoom: Math.floor(globals.zoom) - 1.0}, feature, featureState),
                value.evaluate({zoom: Math.floor(globals.zoom)}, feature, featureState),
                value.evaluate({zoom: Math.floor(globals.zoom) + 1.0}, feature, featureState),
                globals);
        } else {
            return value.value;
        }
    };

    CrossFadedDataDrivenProperty.prototype._calculate = function (min, mid, max, parameters) {
        var z = parameters.zoom;
        return z > parameters.zoomHistory.lastIntegerZoom ? {from: min, to: mid} : {from: max, to: mid};
    };

    CrossFadedDataDrivenProperty.prototype.interpolate = function interpolate(a) {
        return a;
    };

    return CrossFadedDataDrivenProperty;
});