define("com/huayun/webgis/layers/support/expression/ZoomDependentExpression", [
    "./compoundExpression",
    "./Interpolate",
    "../../../gl/dataTransfer"
], function (compoundExpression, Interpolate, dataTransfer) {
    var ZoomDependentExpression = function ZoomDependentExpression(kind, expression, zoomCurve) {
        this.kind = kind;
        this.zoomStops = zoomCurve.labels;
        this._styleExpression = expression;
        this.isStateDependent = kind !== ('camera') && !compoundExpression.isStateConstant(expression.expression);
        if (zoomCurve instanceof Interpolate) {
            this.interpolationType = zoomCurve.interpolation;
        }
    };

    ZoomDependentExpression.prototype.evaluateWithoutErrorHandling = function evaluateWithoutErrorHandling(globals, feature, featureState) {
        return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState);
    };

    ZoomDependentExpression.prototype.evaluate = function evaluate(globals, feature, featureState) {
        return this._styleExpression.evaluate(globals, feature, featureState);
    };

    ZoomDependentExpression.prototype.interpolationFactor = function interpolationFactor(input, lower, upper) {
        if (this.interpolationType) {
            return Interpolate.interpolationFactor(this.interpolationType, input, lower, upper);
        } else {
            return 0;
        }
    };

    dataTransfer.register('ZoomDependentExpression', ZoomDependentExpression);

    return ZoomDependentExpression;
});