/**
 * 将旧式stop函数包装成规范化的表达式接口
 */
define("com/huayun/webgis/layers/support/style/StylePropertyFunction", [
    "./styleUtils",
    "../expression/Interpolate",
    "../expression/Formatted",
    "../../../utils/utils",
    "../../../utils/Color",
    "../../../utils/colorSpaces",
], function (styleUtils, Interpolate, Formatted, utils, Color, colorSpaces) {

    function identityFunction(x) {
        return x;
    }

    /**
     * 指数插值
     * @private
     * @ignore
     * @param parameters
     * @param propertySpec
     * @param input
     * @return {{evaluate: evaluate}|*|string|undefined}
     */
    function evaluateExponentialFunction(parameters, propertySpec, input) {
        var base = parameters.base !== undefined ? parameters.base : 1; // 底数默认是1

        if (utils.getType(input) !== 'number') {
            return utils.coalesce(parameters.default, propertySpec.default);
        }

        // 边界处理
        var n = parameters.stops.length;
        if (n === 1) {
            return parameters.stops[0][1];
        }
        if (input <= parameters.stops[0][0]) {
            return parameters.stops[0][1];
        }
        if (input >= parameters.stops[n - 1][0]) {
            return parameters.stops[n - 1][1];
        }

        var index = styleUtils.findStopLessThanOrEqualTo(parameters.stops.map(function (stop) {
            return stop[0];
        }), input);
        var t = styleUtils.interpolationFactor(input, base, parameters.stops[index][0], parameters.stops[index + 1][0]);

        var outputLower = parameters.stops[index][1];
        var outputUpper = parameters.stops[index + 1][1];
        var interp = styleUtils.interpolate[propertySpec.type] || identityFunction;

        if (parameters.colorSpace && parameters.colorSpace !== 'rgb') { // 非RGB颜色空间
            var colorspace = colorSpaces[parameters.colorSpace];
            interp = function (a, b) {
                // RGB转换成其他颜色空间数据, 然后插值, 再转成RGB
                return colorspace.reverse(colorspace.interpolate(colorspace.forward(a), colorspace.forward(b), t));
            };
        }

        if (typeof outputLower.evaluate === 'function') {
            return {
                evaluate: function evaluate() {
                    var args = [], len = arguments.length;
                    while (len--) args[len] = arguments[len];
                    var evaluatedLower = outputLower.evaluate.apply(undefined, args);
                    var evaluatedUpper = outputUpper.evaluate.apply(undefined, args);
                    if (evaluatedLower === undefined || evaluatedUpper === undefined) {
                        return undefined;
                    }
                    return interp(evaluatedLower, evaluatedUpper, t);
                }
            };
        }
        return interp(outputLower, outputUpper, t);
    }

    /**
     * 阶梯获取值
     * @private
     * @ignore
     * @param parameters
     * @param propertySpec
     * @param input
     * @return {*|string}
     */
    function evaluateIntervalFunction(parameters, propertySpec, input) {
        if (utils.getType(input) !== 'number') {
            return utils.coalesce(parameters.default, propertySpec.default);
        }
        // 边界处理
        var n = parameters.stops.length;
        if (n === 1) {
            return parameters.stops[0][1];
        }
        if (input <= parameters.stops[0][0]) {
            return parameters.stops[0][1];
        }
        if (input >= parameters.stops[n - 1][0]) {
            return parameters.stops[n - 1][1];
        }

        var index = styleUtils.findStopLessThanOrEqualTo(parameters.stops.map(function (stop) {
            return stop[0];
        }), input);
        return parameters.stops[index][1];
    }

    /**
     * 返回与输入相等的stop值, 若没有则返回默认值.
     * @ignore
     * @private
     * @param parameters
     * @param propertySpec
     * @param input
     * @param hashedStops
     * @param keyType
     * @return {*}
     */
    function evaluateCategoricalFunction(parameters, propertySpec, input, hashedStops, keyType) {
        var evaluated = typeof input === keyType ? hashedStops[input] : undefined; // Enforce strict typing on input
        return utils.coalesce(evaluated, parameters.default, propertySpec.default);
    }

    /**
     * 输入即为输出
     * @ignore
     * @private
     * @param parameters
     * @param propertySpec
     * @param input
     * @return {*}
     */
    function evaluateIdentityFunction(parameters, propertySpec, input) {
        if (propertySpec.type === 'color') {
            input = Color.parse(input);
        } else if (propertySpec.type === 'formatted') {
            input = Formatted.fromString(input.toString());
        } else if (utils.getType(input) !== propertySpec.type && (propertySpec.type !== 'enum' || !propertySpec.values[input])) {
            input = undefined;
        }
        return utils.coalesce(input, parameters.default, propertySpec.default);
    }

    /**
     * 创建属性函数
     * @private
     * @ignore
     * @param parameters
     * @param propertySpec
     * @return {*}
     */
    function createFunction(parameters, propertySpec) {
        var isColor = propertySpec.type === 'color';
        var zoomAndFeatureDependent = parameters.stops && typeof parameters.stops[0][0] === 'object';
        var featureDependent = zoomAndFeatureDependent || parameters.property !== undefined;
        var zoomDependent = zoomAndFeatureDependent || !featureDependent;
        // stops两种方式: exponential和interval
        var type = parameters.type || (styleUtils.supportsInterpolation(propertySpec) ? 'exponential' : 'interval');

        // 若是颜色, 将stops中的颜色转换成Color类
        if (isColor) {
            parameters = utils.extend({}, parameters);
            if (parameters.stops) {
                parameters.stops = parameters.stops.map(function (stop) {
                    return [stop[0], Color.parse(stop[1])];
                });
            }
            if (parameters.default) {
                parameters.default = Color.parse(parameters.default);
            } else {
                parameters.default = Color.parse(propertySpec.default);
            }
        }

        if (parameters.colorSpace && parameters.colorSpace !== 'rgb' && !colorSpaces[parameters.colorSpace]) {
            throw new Error(("Unknown color space: " + (parameters.colorSpace))); // 不支持的颜色空间
        }

        var innerFun;
        var hashedStops;
        var categoricalKeyType;

        if (type === 'exponential') { // 指数插值
            innerFun = evaluateExponentialFunction;
        } else if (type === 'interval') { // 阶梯取值
            innerFun = evaluateIntervalFunction;
        } else if (type === 'categorical') { //
            innerFun = evaluateCategoricalFunction;
            hashedStops = Object.create(null);
            for (var i = 0, list = parameters.stops; i < list.length; i += 1) { // 根据stop配置生成hashmap, 方便快速查找
                var stop = list[i];
                hashedStops[stop[0]] = stop[1];
            }
            categoricalKeyType = typeof parameters.stops[0][0];
        } else if (type === 'identity') {
            innerFun = evaluateIdentityFunction;
        } else {
            throw new Error(("Unknown function type \"" + type + "\""));
        }

        if (zoomAndFeatureDependent) {
            var featureFunctions = {};
            var zoomStops = [];
            for (var s = 0; s < parameters.stops.length; s++) {
                var stop$1 = parameters.stops[s];
                var zoom = stop$1[0].zoom;
                if (featureFunctions[zoom] === undefined) {
                    featureFunctions[zoom] = {
                        zoom: zoom,
                        type: parameters.type,
                        property: parameters.property,
                        default: parameters.default,
                        stops: []
                    };
                    zoomStops.push(zoom);
                }
                featureFunctions[zoom].stops.push([stop$1[0].value, stop$1[1]]);
            }

            var featureFunctionStops = [];
            for (var i$1 = 0, list$1 = zoomStops; i$1 < list$1.length; i$1 += 1) {
                var z = list$1[i$1];
                featureFunctionStops.push([featureFunctions[z].zoom, createFunction(featureFunctions[z], propertySpec)]);
            }
            var interpolationType = {name: 'linear'};
            return {
                kind: 'composite',
                interpolationType: interpolationType,
                interpolationFactor: Interpolate.interpolationFactor.bind(undefined, interpolationType),
                zoomStops: featureFunctionStops.map(function (s) {return s[0];}),
                evaluate: function evaluate(ref, properties) {
                    var zoom = ref.zoom;
                    return evaluateExponentialFunction({
                        stops: featureFunctionStops,
                        base: parameters.base
                    }, propertySpec, zoom).evaluate(zoom, properties);
                }
            };
        } else if (zoomDependent) {
            var interpolationType$1 = type === 'exponential' ?
                {name: 'exponential', base: parameters.base !== undefined ? parameters.base : 1} : null;
            return {
                kind: 'camera',
                interpolationType: interpolationType$1,
                interpolationFactor: Interpolate.interpolationFactor.bind(undefined, interpolationType$1),
                zoomStops: parameters.stops.map(function (s) {
                    return s[0];
                }),
                evaluate: function (ref) {
                    var zoom = ref.zoom;
                    return innerFun(parameters, propertySpec, zoom, hashedStops, categoricalKeyType);
                }
            };
        } else {
            return {
                kind: 'source',
                evaluate: function evaluate(_, feature) {
                    var value = feature && feature.properties ? feature.properties[parameters.property] : undefined;
                    if (value === undefined) {
                        return utils.coalesce(parameters.default, propertySpec.default);
                    }
                    return innerFun(parameters, propertySpec, value, hashedStops, categoricalKeyType);
                }
            };
        }
    }


    /**
     * 旧式stop函数包装成规范化的表达式接口
     * @param parameters
     * @param specification
     * @property _parameters
     * @property _specification
     * @constructor
     */
    var StylePropertyFunction = function (parameters, specification) {
        this._parameters = parameters;
        this._specification = specification;
        utils.extend(this, createFunction(this._parameters, this._specification));
    };

    StylePropertyFunction.deserialize = function deserialize(serialized) {
        return new StylePropertyFunction(serialized._parameters, serialized._specification);
    };

    StylePropertyFunction.serialize = function serialize(input) {
        return {
            _parameters: input._parameters,
            _specification: input._specification
        };
    };

    return StylePropertyFunction;
});