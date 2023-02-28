/**
 * PropertyValue类表示属性键值单元的值部分, 用于表示paint和layout的属性值. PropertyValue存储原始输入值, 以下之一:
 * 常量值
 * 生成该类型值的函数(弃用)
 * 生成该类型值的表达式
 * "undefined"/"not present"表示采用默认值
 *
 * 除了存储原始输入值外, 还存储值的规范化表示形式.
 */
define("com/huayun/webgis/layers/support/style/PropertyValue", [
  "./StylePropertyFunction",
  "./expressionFactory",
  "../expression/expressions",
  "../../../utils/utils",
  "../../../utils/Color"
], function (StylePropertyFunction, expressionFactory, expressions, utils, Color) {

  /**
   * 生成layout/paint样式配置的某一属性值的规范化表示形式
   * @private
   * @ignore
   * @param value
   * @param specification
   * @return Object
   */
  function normalizePropertyExpression(value, specification) {
    // 若值是函数, 转换成StylePropertyFunction
    if (utils.isFunction(value)) {
      return new StylePropertyFunction(value, specification);
    } else if (expressions.isExpression(value)) { // 若是表达式
      var expression = expressionFactory.createPropertyExpression(value, specification);
      if (expression.result === 'error') {
        throw new Error(expression.value.map(function (err) {
          return err.key + ": " + err.message;
        }).join(', '));
      }
      return expression.value;
    } else {
      var constant = value;
      if (typeof value === 'string' && specification.type === 'color') {
        constant = Color.parse(value);
      }
      return {
        kind: 'constant',
        evaluate: function () {
          return constant;
        }
      };
    }
  }

  var PropertyValue = function (property, value) {
    this.property = property;
    this.value = value;
    this.expression = normalizePropertyExpression(value === undefined ? property.specification.default : value, property.specification);
  };

  PropertyValue.prototype.isDataDriven = function isDataDriven() {
    return this.expression.kind === 'source' || this.expression.kind === 'composite';
  };

  PropertyValue.prototype.possiblyEvaluate = function possiblyEvaluate(parameters) {
    return this.property.possiblyEvaluate(this, parameters);
  };

  return PropertyValue;
});