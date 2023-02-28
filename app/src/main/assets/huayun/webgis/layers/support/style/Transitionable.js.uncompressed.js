define("com/huayun/webgis/layers/support/style/Transitionable", [
  "./PropertyValue",
  "./TransitionablePropertyValue",
  "./Transitioning",
  "../../../utils/utils"
], function (PropertyValue, TransitionablePropertyValue, Transitioning, utils) {
  /**
   * `Transitionable`存储给定图层类型的paint属性的所有(属性名, `TransitionablePropertyValue`)键值对.
   * 可以一次性为所有这些属性计算`TransitioningPropertyValue`, 从而为同一组属性生成一个Transitioning实例
   * @private
   * @ignore
   * @param properties
   * @constructor
   */
  var Transitionable = function Transitionable(properties) {
    this._properties = properties;
    this._values = Object.create(properties.defaultTransitionablePropertyValues);
  };

  Transitionable.prototype.getValue = function getValue(name) {
    return utils.clone(this._values[name].value.value);
  };

  Transitionable.prototype.setValue = function setValue(name, value) {
    if (!this._values.hasOwnProperty(name)) {
      this._values[name] = new TransitionablePropertyValue(this._values[name].property);
    }
    this._values[name].value = new PropertyValue(this._values[name].property, value === null ? undefined : utils.clone(value));
  };

  Transitionable.prototype.getTransition = function getTransition(name) {
    return utils.clone(this._values[name].transition);
  };

  Transitionable.prototype.setTransition = function setTransition(name, value) {
    if (!this._values.hasOwnProperty(name)) {
      this._values[name] = new TransitionablePropertyValue(this._values[name].property);
    }
    this._values[name].transition = utils.clone(value) || undefined;
  };

  Transitionable.prototype.serialize = function serialize() {
    var result = {};
    for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
      var property = list[i];
      var value = this.getValue(property);
      if (value !== undefined) {
        result[property] = value;
      }
      var transition = this.getTransition(property);
      if (transition !== undefined) {
        result[(property + "-transition")] = transition;
      }
    }
    return result;
  };

  Transitionable.prototype.transitioned = function transitioned(parameters, prior) {
    var result = new Transitioning(this._properties);
    for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
      var property = list[i];
      result._values[property] = this._values[property].transitioned(parameters, prior._values[property]);
    }
    return result;
  };

  Transitionable.prototype.untransitioned = function untransitioned() {
    var result = new Transitioning(this._properties);
    for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
      var property = list[i];
      result._values[property] = this._values[property].untransitioned();
    }
    return result;
  };

  return Transitionable;
});