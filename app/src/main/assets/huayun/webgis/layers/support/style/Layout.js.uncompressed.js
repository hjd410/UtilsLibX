/**
 * 图层样式配置中, 定义渲染位置和可见性.
 * layout属性是not transitionable, 表达和计算比paint属性简单, PropertyValue类表达具体某个属性.
 * Layout类存储给定图层类型的所有layout属性的键值对, (property name, PropertyValue), 它能一次性为所有layout属性计算可能的值,
 * 为同一组属性生成"PossiblyEvaluated"实例.
 */
define("com/huayun/webgis/layers/support/style/Layout", [
    "./PropertyValue",
    "./PossiblyEvaluated",
    "../../../utils/utils"
], function (PropertyValue, PossiblyEvaluated, utils) {
    /**
     * @ignore
     * @private
     * @param properties
     * @property _properties
     * @property _values
     * @constructor
     */
    var Layout = function (properties) {
        this._properties = properties;
        this._values = Object.create(properties.defaultPropertyValues);
    };

    Layout.prototype.getValue = function getValue(name) {
        return utils.clone(this._values[name].value);
    };

    Layout.prototype.setValue = function setValue(name, value) {
        this._values[name] = new PropertyValue(this._values[name].property, value === null ? undefined : utils.clone(value));
    };

    /**
     * 序列化layout实例, 方便线程间传输
     * @return {{}}
     */
    Layout.prototype.serialize = function serialize() {
        var result = {};
        for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
            var property = list[i];
            var value = this.getValue(property);
            if (value !== undefined) {
                result[property] = value;
            }
        }
        return result;
    };

    Layout.prototype.possiblyEvaluate = function possiblyEvaluate(parameters) {
        var result = new PossiblyEvaluated(this._properties);
        for (var i = 0, list = Object.keys(this._values); i < list.length; i += 1) {
            var property = list[i];
            result._values[property] = this._values[property].possiblyEvaluate(parameters);
        }
        return result;
    };

    return Layout;
});