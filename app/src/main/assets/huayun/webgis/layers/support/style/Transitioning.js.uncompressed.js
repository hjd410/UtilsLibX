define("com/huayun/webgis/layers/support/style/Transitioning", [
  "./PossiblyEvaluated"
], function (PossiblyEvaluated) {
  /**
   * `Transitioning`存储给定图层类型的的paint属性的所有(属性名, `TransitioningPropertyValue`)键值对的映射. 它能一次性地为所有这些属性计算值, 从而为一组属性生成一个`PossiblyEvaluated`的实例
   * @private
   * @ignore
   * @param properties
   * @constructor
   */
  var Transitioning = function Transitioning(properties) {
    this._properties = properties;
    this._values = Object.create(properties.defaultTransitioningPropertyValues);
  };

  Transitioning.prototype.possiblyEvaluate = function possiblyEvaluate(parameters) {
    var result = new PossiblyEvaluated(this._properties);
    for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
      var property = list[i];
      result._values[property] = this._values[property].possiblyEvaluate(parameters);
    }
    return result;
  };

  Transitioning.prototype.hasTransition = function hasTransition() {
    for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
      var property = list[i];
      if (this._values[property].prior) {
        return true;
      }
    }
    return false;
  };

  return Transitioning;
});