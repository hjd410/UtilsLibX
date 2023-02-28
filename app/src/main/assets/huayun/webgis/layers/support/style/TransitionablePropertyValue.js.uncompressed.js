define("com/huayun/webgis/layers/support/style/TransitionablePropertyValue", [
  "./PropertyValue",
  "./TransitioningPropertyValue",
  "../../../utils/utils"
], function (PropertyValue, TransitioningPropertyValue, utils) {
  /**
   * paint属性是可渐变的: 它们能以可变的方式改变, 在新值和旧值之间进行插值或cross-fading. 过渡的持续时间和延迟都是可配置的.
   * `TransitionablePropertyValue`是个组合类, 存储属性值和过渡配置.
   * `TransitionablePropertyValue`可计算evaluation链中painter属性值的下一步: TransitioningPropertyValue.
   * @ignore
   * @private
   * @param property
   * @constructor
   */
  var TransitionablePropertyValue = function TransitionablePropertyValue(property) {
    this.property = property;
    this.value = new PropertyValue(property, undefined);
  };

  TransitionablePropertyValue.prototype.transitioned = function transitioned(parameters, prior) {
    return new TransitioningPropertyValue(this.property, this.value, prior,
      utils.extend({}, parameters.transition, this.transition), parameters.now);
  };

  TransitionablePropertyValue.prototype.untransitioned = function untransitioned() {
    return new TransitioningPropertyValue(this.property, this.value, null, {}, 0);
  };
  return TransitionablePropertyValue;
});