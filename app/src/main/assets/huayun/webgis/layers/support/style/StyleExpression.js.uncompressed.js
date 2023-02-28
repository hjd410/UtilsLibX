/**
 * 样式表达式类
 */
define("com/huayun/webgis/layers/support/style/StyleExpression", [
    "./EvaluationContext",
    "../../../utils/Color",
    "../../../utils/utils",
    "../../../gl/dataTransfer"
], function (EvaluationContext, Color, utils, dataTransfer) {
    function getDefaultValue(spec) {
        if (spec.type === 'color' && utils.isFunction(spec.default)) {
            return new Color(0, 0, 0, 0);
        } else if (spec.type === 'color') {
            return Color.parse(spec.default) || null;
        } else if (spec.default === undefined) {
            return null;
        } else {
            return spec.default;
        }
    }

    var StyleExpression = function StyleExpression(expression, propertySpec) {
        this.expression = expression;
        this._warningHistory = {};
        this._evaluator = new EvaluationContext();
        this._defaultValue = propertySpec ? getDefaultValue(propertySpec) : null;
        this._enumValues = propertySpec && propertySpec.type === 'enum' ? propertySpec.values : null;
    };

    StyleExpression.prototype.evaluateWithoutErrorHandling = function evaluateWithoutErrorHandling(globals, feature, featureState) {
        this._evaluator.globals = globals;
        this._evaluator.feature = feature;
        this._evaluator.featureState = featureState;
        return this.expression.evaluate(this._evaluator);
    };

    StyleExpression.prototype.evaluate = function evaluate(globals, feature, featureState) {
        this._evaluator.globals = globals;
        this._evaluator.feature = feature || null;
        this._evaluator.featureState = featureState || null;
        try {
            var val = this.expression.evaluate(this._evaluator);
            if (val === null || val === undefined) {
                return this._defaultValue;
            }
            if (this._enumValues && !(val in this._enumValues)) {
                throw new Error(("Expected value to be one of " + (Object.keys(this._enumValues).map(function (v) {
                    return JSON.stringify(v);
                }).join(', ')) + ", but found " + (JSON.stringify(val)) + " instead."));
            }
            return val;
        } catch (e) {
            if (!this._warningHistory[e.message]) {
                this._warningHistory[e.message] = true;
                if (typeof console !== 'undefined') {
                    console.warn(e.message);
                }
            }
            return this._defaultValue;
        }
    };

    dataTransfer.register('StyleExpression', StyleExpression, {omit: ['_evaluator']});

    return StyleExpression;
});