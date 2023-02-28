define("com/huayun/webgis/layers/support/style/DataDrivenProperty", [
  "./PossiblyEvaluatedPropertyValue",
  "./styleUtils"
], function (PossiblyEvaluatedPropertyValue, styleUtils) {
  /**
   * 允许数据驱动表达式的属性, 每个Feature的此属性值需要根据Feature的属性进行计算
   * @private
   * @ignore
   * @param specification
   * @constructor
   */
  var DataDrivenProperty = function DataDrivenProperty(specification) {
    this.specification = specification;
  };

  DataDrivenProperty.prototype.possiblyEvaluate = function(value, parameters) {
    if (value.expression.kind === 'constant' || value.expression.kind === 'camera') {
      return new PossiblyEvaluatedPropertyValue(this, {
        kind: 'constant',
        value: value.expression.evaluate(parameters)
      }, parameters);
    } else {
      return new PossiblyEvaluatedPropertyValue(this, value.expression, parameters);
    }
  };

  DataDrivenProperty.prototype.interpolate = function(a, b, t) {
    if (a.value.kind !== 'constant' || b.value.kind !== 'constant') {
      return a;
    }

    if (a.value.value === undefined || b.value.value === undefined) {
      return new PossiblyEvaluatedPropertyValue(this, {kind: 'constant', value: undefined}, a.parameters);
    }

    var interp = styleUtils.interpolate[this.specification.type];
    if (interp) {
      return new PossiblyEvaluatedPropertyValue(this, {
        kind: 'constant',
        value: interp(a.value.value, b.value.value, t)
      }, a.parameters);
    } else {
      return a;
    }
  };

  DataDrivenProperty.prototype.evaluate = function evaluate(value, parameters, feature, featureState) {
    if (value.kind === 'constant') {
      return value.value;
    } else {
      return value.evaluate(parameters, feature, featureState);
    }
  };

  return DataDrivenProperty;
});