/**
 * 不允许使用数据驱动表达式的属性封装类, 对于所有Feature都是常量
 */
define("com/huayun/webgis/layers/support/style/DataConstantProperty", [
  "./styleUtils"
], function (styleUtils) {
  /**
   * 不允许使用数据驱动表达式的属性, 对于所有Feature都是常量
   * @private
   * @ignore
   * @param specification
   * @constructor
   */
  var DataConstantProperty = function DataConstantProperty(specification) {
    this.specification = specification;
  };

  DataConstantProperty.prototype.possiblyEvaluate = function(value, parameters) {
    return value.expression.evaluate(parameters);
  };

  DataConstantProperty.prototype.interpolate = function(a, b, t) {
    var interp = styleUtils.interpolate[this.specification.type]; // 确定插值函数
    if (interp) {
      return interp(a, b, t);
    } else {
      return a;
    }
  };

  return DataConstantProperty;
});