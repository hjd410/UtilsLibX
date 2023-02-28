define("com/huayun/webgis/layers/support/style/Properties", [
    "./PropertyValue",
    "./TransitionablePropertyValue"
], function (PropertyValue, TransitionablePropertyValue) {

    /**
     * Properties类包含给定图层类型的paint或layout属性集的默认值对象, 这些对象是不可变的, 用于`Transitioning`, `Layout`和`PossiblyEvaluated`的`_values`属性的原型.
     * @param properties
     * @constructor
     */
    function Properties(properties) {
        this.properties = properties;
        this.defaultPropertyValues = {};
        this.defaultTransitionablePropertyValues = {};
        this.defaultTransitioningPropertyValues = {};
        this.defaultPossiblyEvaluatedValues = {};

        for (var property in properties) {
            var prop = properties[property];
            var defaultPropertyValue = this.defaultPropertyValues[property] = new PropertyValue(prop, undefined);
            var defaultTransitionablePropertyValue = this.defaultTransitionablePropertyValues[property] = new TransitionablePropertyValue(prop);
            this.defaultTransitioningPropertyValues[property] = defaultTransitionablePropertyValue.untransitioned();
            this.defaultPossiblyEvaluatedValues[property] = defaultPropertyValue.possiblyEvaluate(({}));
        }
    }

    return Properties;
});