define("com/huayun/webgis/layers/support/style/PossiblyEvaluatedPropertyValue", [], function () {
  /**
   * 用于允许data-driven表达式的paint和layout的属性值, 有一个类型为PossiblyEvaluatedValue的value属性和GlobalProperties, 用于生成属性值.
   * @ignore
   * @private
   * @alias com.huayun.webgis.layers.support.style.PossiblyEvaluatedPropertyValue
   * @param property
   * @param value
   * @param parameters
   * @constructor
   * @property value
   */
  var PossiblyEvaluatedPropertyValue = function PossiblyEvaluatedPropertyValue(property, value, parameters) {
    this.property = property;
    this.value = value;
    this.parameters = parameters;
  };

  PossiblyEvaluatedPropertyValue.prototype.isConstant = function isConstant() {
    return this.value.kind === 'constant';
  };
  /**
   * 若值是常量类型则返回值, 否则返回参数值
   * @param value
   * @return {*}
   */
  PossiblyEvaluatedPropertyValue.prototype.constantOr = function constantOr(value) {
    if (this.value.kind === 'constant') {
      return this.value.value;
    } else {
      return value;
    }
  };

  /**
   * 根据Feature的属性计算最终属性值
   * @param feature
   * @param featureState
   * @return {*}
   */
  PossiblyEvaluatedPropertyValue.prototype.evaluate = function evaluate(feature, featureState) {
    return this.property.evaluate(this.value, this.parameters, feature, featureState);
  };
  
  return PossiblyEvaluatedPropertyValue;
});