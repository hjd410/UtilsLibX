define("com/huayun/webgis/layers/support/style/CrossFadedProperty", [
  "./EvaluationParameters"
], function (EvaluationParameters) {
  /**
   * 用于"*-pattern"和"line-dasharray"的属性值, 特点是通过cross-fading而不是插值变换来表达渐变
   * @private
   * @ignore
   * @param specification
   * @constructor
   */
  var CrossFadedProperty = function CrossFadedProperty(specification) {
    this.specification = specification;
  };

  CrossFadedProperty.prototype.possiblyEvaluate = function possiblyEvaluate(value, parameters) {
    if (value.value === undefined) {
      return undefined;
    } else if (value.expression.kind === 'constant') {
      var constant = value.expression.evaluate(parameters);
      return this._calculate(constant, constant, constant, parameters);
    } else {
      return this._calculate(
        value.expression.evaluate(new EvaluationParameters(Math.floor(parameters.zoom - 1.0), parameters)),
        value.expression.evaluate(new EvaluationParameters(Math.floor(parameters.zoom), parameters)),
        value.expression.evaluate(new EvaluationParameters(Math.floor(parameters.zoom + 1.0), parameters)),
        parameters);
    }
  };

  CrossFadedProperty.prototype._calculate = function(min, mid, max, parameters) {
    var z = parameters.zoom;
    return z > parameters.zoomHistory.lastIntegerZoom ? {from: min, to: mid} : {from: max, to: mid};
  };

  CrossFadedProperty.prototype.interpolate = function interpolate(a) {
    return a;
  };

  return CrossFadedProperty;
});