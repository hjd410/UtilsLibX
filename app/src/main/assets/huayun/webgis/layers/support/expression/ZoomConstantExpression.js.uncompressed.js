define("com/huayun/webgis/layers/support/expression/ZoomConstantExpression", [
    "./compoundExpression",
    "../../../gl/dataTransfer"
], function (compoundExpression, dataTransfer) {
    function ZoomConstantExpression(kind, expression) {
        this.kind = kind;
        this._styleExpression = expression;
        this.isStateDependent = kind !== 'constant' && !compoundExpression.isStateConstant(expression.expression);
    }

    ZoomConstantExpression.prototype.evaluateWithoutErrorHandling = function (globals, feature, featureState) {
        return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState);
    };

    ZoomConstantExpression.prototype.evaluate = function (globals, feature, featureState) {
        return this._styleExpression.evaluate(globals, feature, featureState);
    };

    dataTransfer.register('ZoomConstantExpression', ZoomConstantExpression);
    return ZoomConstantExpression;
})