define("com/huayun/webgis/layers/support/style/TransitioningPropertyValue", [
  "../../../utils/utils"
], function (utils) {
  /**
   * `TransitioningPropertyValue`实现paint属性值在计算链中两个中间步骤的第一步. 在这一步中, 处理旧值和新值之间的转换:
   * 只要转换还在进行, `TransitioningPropertyValue`就会保留对先前值的引用, 并根据当前时间和配置的持续时间与延迟, 在旧值和新值间进行插值.
   * 结果是计算链中的下一步: "possibly evaluated"结果类型R.
   * @private
   * @ignore
   * @param property
   * @param value
   * @param prior
   * @param transition
   * @param now
   * @constructor
   */
  var TransitioningPropertyValue = function TransitioningPropertyValue(property, value, prior, transition, now) {
    this.property = property;
    this.value = value;
    this.begin = now + transition.delay || 0;
    this.end = this.begin + transition.duration || 0;
    if (property.specification.transition && (transition.delay || transition.duration)) {
      this.prior = prior;
    }
  };

  TransitioningPropertyValue.prototype.possiblyEvaluate = function possiblyEvaluate(parameters) {
    var now = parameters.now || 0;
    var finalValue = this.value.possiblyEvaluate(parameters);
    var prior = this.prior;
    if (!prior) {
      return finalValue;
    } else if (now > this.end) {
      this.prior = null;
      return finalValue;
    } else if (this.value.isDataDriven()) { // 不支持data-driven类型的属性值
      this.prior = null;
      return finalValue;
    } else if (now < this.begin) { // 变换还未开始
      return prior.possiblyEvaluate(parameters);
    } else {
      var t = (now - this.begin) / (this.end - this.begin);
      return this.property.interpolate(prior.possiblyEvaluate(parameters), finalValue, utils.easeCubicInOut(t)); // 插值
    }
  };
  return TransitioningPropertyValue;
});