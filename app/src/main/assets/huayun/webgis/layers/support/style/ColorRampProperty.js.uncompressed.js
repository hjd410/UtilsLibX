define("com/huayun/webgis/layers/support/style/ColorRampProperty", [], function () {
  /**
   * "heatmap-color"和"line-gradient"属性的属性类
   * @private
   * @ignore
   * @param specification
   * @constructor
   */
  var ColorRampProperty = function ColorRampProperty(specification) {
    this.specification = specification;
  };

  ColorRampProperty.prototype.possiblyEvaluate = function possiblyEvaluate(value, parameters) {
    return !!value.expression.evaluate(parameters);
  };

  ColorRampProperty.prototype.interpolate = function interpolate() {
    return false;
  };

  return ColorRampProperty;
});