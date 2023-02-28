define("com/huayun/webgis/layers/support/Property", [
    "exports",
    "../../utils/Color",
    "./Formatted",
    "./Interpolate",
    "./expressions",
    "../../utils/utils",
    "../../gl/dataTransfer"
], function (f, Color, Formatted, Interpolate, expressions, utils, dataTransfer) {

    function extend$1(dest, src) {
        for (var i in src) {
            dest[i] = src[i];
        }
        return dest;
    }

    var Xn = 0.950470, // D65 standard referent
        Yn = 1,
        Zn = 1.088830,
        t0 = 4 / 29,
        t1 = 6 / 29,
        t2 = 3 * t1 * t1,
        t3 = t1 * t1 * t1,
        deg2rad = Math.PI / 180,
        rad2deg = 180 / Math.PI;

    // Utilities
    function xyz2lab(t) {
        return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
    }

    function lab2xyz(t) {
        return t > t1 ? t * t * t : t2 * (t - t0);
    }

    function xyz2rgb(x) {
        return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
    }

    function rgb2xyz(x) {
        x /= 255;
        return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    }

    // LAB
    function rgbToLab(rgbColor) {
        var b = rgb2xyz(rgbColor.r),
            a = rgb2xyz(rgbColor.g),
            l = rgb2xyz(rgbColor.b),
            x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
            y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
            z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);

        return {
            l: 116 * y - 16,
            a: 500 * (x - y),
            b: 200 * (y - z),
            alpha: rgbColor.a
        };
    }

    function labToRgb(labColor) {
        var y = (labColor.l + 16) / 116,
            x = isNaN(labColor.a) ? y : y + labColor.a / 500,
            z = isNaN(labColor.b) ? y : y - labColor.b / 200;
        y = Yn * lab2xyz(y);
        x = Xn * lab2xyz(x);
        z = Zn * lab2xyz(z);
        return new Color(
            xyz2rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
            xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
            xyz2rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
            labColor.alpha
        );
    }

    function interpolateLab(from, to, t) {
        return {
            l: number(from.l, to.l, t),
            a: number(from.a, to.a, t),
            b: number(from.b, to.b, t),
            alpha: number(from.alpha, to.alpha, t)
        };
    }

    // HCL
    function rgbToHcl(rgbColor) {
        var ref = rgbToLab(rgbColor);
        var l = ref.l;
        var a = ref.a;
        var b = ref.b;
        var h = Math.atan2(b, a) * rad2deg;
        return {
            h: h < 0 ? h + 360 : h,
            c: Math.sqrt(a * a + b * b),
            l: l,
            alpha: rgbColor.a
        };
    }

    function hclToRgb(hclColor) {
        var h = hclColor.h * deg2rad,
            c = hclColor.c,
            l = hclColor.l;
        return labToRgb({
            l: l,
            a: Math.cos(h) * c,
            b: Math.sin(h) * c,
            alpha: hclColor.alpha
        });
    }

    function interpolateHue(a, b, t) {
        var d = b - a;
        return a + t * (d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d);
    }

    function interpolateHcl(from, to, t) {
        return {
            h: interpolateHue(from.h, to.h, t),
            c: number(from.c, to.c, t),
            l: number(from.l, to.l, t),
            alpha: number(from.alpha, to.alpha, t)
        };
    }

    var lab = {
        forward: rgbToLab,
        reverse: labToRgb,
        interpolate: interpolateLab
    };

    var hcl = {
        forward: rgbToHcl,
        reverse: hclToRgb,
        interpolate: interpolateHcl
    };


    var colorSpaces = Object.freeze({
        lab: lab,
        hcl: hcl
    });

    function number(a, b, t) {
        return (a * (1 - t)) + (b * t);
    }

    function color(from, to, t) {
        return new Color(
            number(from.r, to.r, t),
            number(from.g, to.g, t),
            number(from.b, to.b, t),
            number(from.a, to.a, t)
        );
    }

    function array$1(from, to, t) {
        return from.map(function (d, i) {
            return number(d, to[i], t);
        });
    }

    var interpolate = Object.freeze({
        number: number,
        color: color,
        array: array$1
    });

    function getType(val) {
        if (val instanceof Number) {
            return 'number';
        } else if (val instanceof String) {
            return 'string';
        } else if (val instanceof Boolean) {
            return 'boolean';
        } else if (Array.isArray(val)) {
            return 'array';
        } else if (val === null) {
            return 'null';
        } else {
            return typeof val;
        }
    }

    function coalesce(a, b, c) {
        if (a !== undefined) {
            return a;
        }
        if (b !== undefined) {
            return b;
        }
        if (c !== undefined) {
            return c;
        }
    }

    function findStopLessThanOrEqualTo(stops, input) {
        var lastIndex = stops.length - 1;
        var lowerIndex = 0;
        var upperIndex = lastIndex;
        var currentIndex = 0;
        var currentValue, nextValue;

        while (lowerIndex <= upperIndex) {
            currentIndex = Math.floor((lowerIndex + upperIndex) / 2);
            currentValue = stops[currentIndex];
            nextValue = stops[currentIndex + 1];

            if (currentValue <= input) {
                if (currentIndex === lastIndex || input < nextValue) { // Search complete
                    return currentIndex;
                }
                lowerIndex = currentIndex + 1;
            } else if (currentValue > input) {
                upperIndex = currentIndex - 1;
            } else {
                throw new Error('Input is not a number.');
            }
        }
        return 0;
    }

    function identityFunction(x) {
        return x;
    }

    function interpolationFactor(input, base, lowerValue, upperValue) {
        var difference = upperValue - lowerValue;
        var progress = input - lowerValue;

        if (difference === 0) {
            return 0;
        } else if (base === 1) {
            return progress / difference;
        } else {
            return (Math.pow(base, progress) - 1) / (Math.pow(base, difference) - 1);
        }
    }

    function evaluateExponentialFunction(parameters, propertySpec, input) {
        var base = parameters.base !== undefined ? parameters.base : 1;

        if (getType(input) !== 'number') {
            return coalesce(parameters.default, propertySpec.default);
        }
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

        var index = findStopLessThanOrEqualTo(parameters.stops.map(function (stop) {
            return stop[0];
        }), input);
        var t = interpolationFactor(
            input, base,
            parameters.stops[index][0],
            parameters.stops[index + 1][0]);

        var outputLower = parameters.stops[index][1];
        var outputUpper = parameters.stops[index + 1][1];
        var interp = interpolate[propertySpec.type] || identityFunction;

        if (parameters.colorSpace && parameters.colorSpace !== 'rgb') {
            var colorspace = colorSpaces[parameters.colorSpace];
            interp = function (a, b) {
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

    function evaluateIntervalFunction(parameters, propertySpec, input) {
        if (getType(input) !== 'number') {
            return coalesce(parameters.default, propertySpec.default);
        }
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

        var index = findStopLessThanOrEqualTo(parameters.stops.map(function (stop) {
            return stop[0];
        }), input);

        return parameters.stops[index][1];
    }

    function evaluateCategoricalFunction(parameters, propertySpec, input, hashedStops, keyType) {
        var evaluated = typeof input === keyType ? hashedStops[input] : undefined;
        return coalesce(evaluated, parameters.default, propertySpec.default);
    }

    function evaluateIdentityFunction(parameters, propertySpec, input) {
        if (propertySpec.type === 'color') {
            input = Color.parse(input);
        } else if (propertySpec.type === 'formatted') {
            input = Formatted.fromString(input.toString());
        } else if (getType(input) !== propertySpec.type && (propertySpec.type !== 'enum' || !propertySpec.values[input])) {
            input = undefined;
        }
        return coalesce(input, parameters.default, propertySpec.default);
    }


    function createFunction(parameters, propertySpec) {
        var isColor = propertySpec.type === 'color';
        var zoomAndFeatureDependent = parameters.stops && typeof parameters.stops[0][0] === 'object';
        var featureDependent = zoomAndFeatureDependent || parameters.property !== undefined;
        var zoomDependent = zoomAndFeatureDependent || !featureDependent;
        var type = parameters.type || ((!!propertySpec.expression && propertySpec.expression.interpolated) ? 'exponential' : 'interval');

        // 将配置文件的Color转换成webgl使用的值
        if (isColor) {
            parameters = extend$1({}, parameters);
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
        if (parameters.colorSpace && parameters.colorSpace !== 'rgb' && !colorSpaces[parameters.colorSpace]) { // eslint-disable-line import/namespace
            throw new Error(("Unknown color space: " + (parameters.colorSpace)));
        }

        var innerFun;
        var hashedStops;
        var categoricalKeyType;
        if (type === 'exponential') {
            innerFun = evaluateExponentialFunction;
        } else if (type === 'interval') {
            innerFun = evaluateIntervalFunction;
        } else if (type === 'categorical') {
            innerFun = evaluateCategoricalFunction;

            hashedStops = Object.create(null);
            for (var i = 0, list = parameters.stops; i < list.length; i += 1) {
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
                zoomStops: featureFunctionStops.map(function (s) {
                    return s[0];
                }),
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
                        return coalesce(parameters.default, propertySpec.default);
                    }
                    return innerFun(parameters, propertySpec, value, hashedStops, categoricalKeyType);
                }
            };
        }
    }

    var StylePropertyFunction = function StylePropertyFunction(parameters, specification) {
        this._parameters = parameters;
        this._specification = specification;
        extend$1(this, createFunction(this._parameters, this._specification));
    };

    StylePropertyFunction.deserialize = function deserialize(serialized) {
        return ((new StylePropertyFunction(serialized._parameters, serialized._specification)));
    };

    StylePropertyFunction.serialize = function serialize(input) {
        return {
            _parameters: input._parameters,
            _specification: input._specification
        };
    };
    dataTransfer.register('StylePropertyFunction', StylePropertyFunction);

    function findZoomCurve(expression) {
        var result = null;
        if (expression instanceof expressions.expressions.let) {
            result = findZoomCurve(expression.result);

        } else if (expression instanceof expressions.expressions.coalesce) {
            for (var i = 0, list = expression.args; i < list.length; i += 1) {
                var arg = list[i];

                result = findZoomCurve(arg);
                if (result) {
                    break;
                }
            }

        } else if ((expression instanceof expressions.expressions.step || expression instanceof Interpolate) &&
            expression.input instanceof expressions.CompoundExpression &&
            expression.input.name === 'zoom') {

            result = expression;
        }

        if (result instanceof ParsingError) {
            return result;
        }

        expression.eachChild(function (child) {
            var childResult = findZoomCurve(child);
            if (childResult instanceof ParsingError) {
                result = childResult;
            } else if (!result && childResult) {
                result = new ParsingError('', '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.');
            } else if (result && childResult && result !== childResult) {
                result = new ParsingError('', 'Only one zoom-based "step" or "interpolate" subexpression may be used in an expression.');
            }
        });

        return result;
    }

    function success(value) {
        return {result: 'success', value: value};
    }

    function error(value) {
        return {result: 'error', value: value};
    }

    var ParsingError = /*@__PURE__*/(function (Error) {
        function ParsingError(key, message) {
            Error.call(this, message);
            this.message = message;
            this.key = key;
        }

        if (Error) ParsingError.__proto__ = Error;
        ParsingError.prototype = Object.create(Error && Error.prototype);
        ParsingError.prototype.constructor = ParsingError;

        return ParsingError;
    }(Error));

    function createPropertyExpression(expression, propertySpec) {
        expression = expressions.createExpression(expression, propertySpec);
        if (expression.result === 'error') {
            return expression;
        }

        var parsed = expression.value.expression;

        var isFeatureConstant$1 = expressions.isFeatureConstant(parsed);
        if (!isFeatureConstant$1 && !utils.supportsPropertyExpression(propertySpec)) {
            return error([new ParsingError('', 'data expressions not supported')]);
        }

        var isZoomConstant = expressions.isGlobalPropertyConstant(parsed, ['zoom']);
        if (!isZoomConstant && !utils.supportsZoomExpression(propertySpec)) {
            return error([new ParsingError('', 'zoom expressions not supported')]);
        }

        var zoomCurve = findZoomCurve(parsed);
        if (!zoomCurve && !isZoomConstant) {
            return error([new ParsingError('', '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.')]);
        } else if (zoomCurve instanceof ParsingError) {
            return error([zoomCurve]);
        } else if (zoomCurve instanceof Interpolate && !utils.supportsInterpolation(propertySpec)) {
            return error([new ParsingError('', '"interpolate" expressions cannot be used with this property')]);
        }

        if (!zoomCurve) {
            return success(isFeatureConstant$1 ?
                (new expressions.ZoomConstantExpression('constant', expression.value)) :
                (new expressions.ZoomConstantExpression('source', expression.value)));
        }

        return success(isFeatureConstant$1 ?
            (new expressions.ZoomDependentExpression('camera', expression.value, zoomCurve)) :
            (new expressions.ZoomDependentExpression('composite', expression.value, zoomCurve)));
    }

    function isExpression(expression) {
        return Array.isArray(expression) && expression.length > 0 &&
            typeof expression[0] === 'string' && expression[0] in expressions.expressions;
    }

    function normalizePropertyExpression(value, specification) {
        if (utils.isFunction(value)) {
            return (new StylePropertyFunction(value, specification));

        } else if (isExpression(value)) {
            var expression = createPropertyExpression(value, specification);
            if (expression.result === 'error') {
                // this should have been caught in validation
                throw new Error(expression.value.map(function (err) {
                    return ((err.key) + ": " + (err.message));
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

    var PropertyValue = function PropertyValue(property, value) {
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

    f.PropertyValue = PropertyValue;

    var TransitioningPropertyValue = function TransitioningPropertyValue(property,
                                                                         value,
                                                                         prior,
                                                                         transition,
                                                                         now) {
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
            // No prior value.
            return finalValue;
        } else if (now > this.end) {
            // Transition from prior value is now complete.
            this.prior = null;
            return finalValue;
        } else if (this.value.isDataDriven()) {
            // Transitions to data-driven properties are not supported.
            // We snap immediately to the data-driven value so that, when we perform layout,
            // we see the data-driven function and can use it to populate vertex buffers.
            this.prior = null;
            return finalValue;
        } else if (now < this.begin) {
            // Transition hasn't started yet.
            return prior.possiblyEvaluate(parameters);
        } else {
            // Interpolate between recursively-calculated prior value and final.
            var t = (now - this.begin) / (this.end - this.begin);
            return this.property.interpolate(prior.possiblyEvaluate(parameters), finalValue, easeCubicInOut(t));
        }
    };

    var TransitionablePropertyValue = function TransitionablePropertyValue(property) {
        this.property = property;
        this.value = new PropertyValue(property, undefined);
    };

    TransitionablePropertyValue.prototype.transitioned = function transitioned(parameters,
                                                                               prior) {
        return new TransitioningPropertyValue(this.property, this.value, prior,
            utils.extend({}, parameters.transition, this.transition), parameters.now);
    };

    TransitionablePropertyValue.prototype.untransitioned = function untransitioned() {
        return new TransitioningPropertyValue(this.property, this.value, null, {}, 0); // eslint-disable-line no-use-before-define
    };

    f.TransitionablePropertyValue = TransitionablePropertyValue;

    f.Properties = function Properties(properties) {
        this.properties = properties;
        this.defaultPropertyValues = ({});
        this.defaultTransitionablePropertyValues = ({});
        this.defaultTransitioningPropertyValues = ({});
        this.defaultPossiblyEvaluatedValues = ({});

        for (var property in properties) {
            var prop = properties[property];
            var defaultPropertyValue = this.defaultPropertyValues[property] =
                new PropertyValue(prop, undefined);
            var defaultTransitionablePropertyValue = this.defaultTransitionablePropertyValues[property] =
                new TransitionablePropertyValue(prop);
            this.defaultTransitioningPropertyValues[property] =
                defaultTransitionablePropertyValue.untransitioned();
            this.defaultPossiblyEvaluatedValues[property] =
                defaultPropertyValue.possiblyEvaluate(({}));
        }
    };

    var PossiblyEvaluatedPropertyValue = function PossiblyEvaluatedPropertyValue(property, value, parameters) {
        this.property = property;
        this.value = value;
        this.parameters = parameters;
    };

    PossiblyEvaluatedPropertyValue.prototype.isConstant = function isConstant() {
        return this.value.kind === 'constant';
    };

    PossiblyEvaluatedPropertyValue.prototype.constantOr = function constantOr(value) {
        if (this.value.kind === 'constant') {
            return this.value.value;
        } else {
            return value;
        }
    };

    PossiblyEvaluatedPropertyValue.prototype.evaluate = function evaluate(feature, featureState) {
        return this.property.evaluate(this.value, this.parameters, feature, featureState);
    };

    f.PossiblyEvaluatedPropertyValue = PossiblyEvaluatedPropertyValue;

    var DataDrivenProperty = function DataDrivenProperty(specification) {
        this.specification = specification;
    };

    DataDrivenProperty.prototype.possiblyEvaluate = function possiblyEvaluate(value, parameters) {
        if (value.expression.kind === 'constant' || value.expression.kind === 'camera') {
            return new PossiblyEvaluatedPropertyValue(this, {
                kind: 'constant',
                value: value.expression.evaluate(parameters)
            }, parameters);
        } else {
            return new PossiblyEvaluatedPropertyValue(this, value.expression, parameters);
        }
    };

    DataDrivenProperty.prototype.interpolate = function interpolate$2(a, b, t) {
        if (a.value.kind !== 'constant' || b.value.kind !== 'constant') {
            return a;
        }

        if (a.value.value === undefined || b.value.value === undefined) {
            return new PossiblyEvaluatedPropertyValue(this, {kind: 'constant', value: (undefined)}, a.parameters);
        }

        var interp = (interpolate)[this.specification.type];
        if (interp) {
            return new PossiblyEvaluatedPropertyValue(this, {
                kind: 'constant',
                value: interp(a.value.value, b.value.value, t)
            }, a.parameters);
        } else {
            return a;
        }
    };

    DataDrivenProperty.prototype.evaluate = function evaluate(value, parameters, feature, featureState) {
        if (value.kind === 'constant') {
            return value.value;
        } else {
            return value.evaluate(parameters, feature, featureState);
        }
    };
    f.DataDrivenProperty = DataDrivenProperty;

    var DataConstantProperty = function DataConstantProperty(specification) {
        this.specification = specification;
    };

    DataConstantProperty.prototype.possiblyEvaluate = function possiblyEvaluate(value, parameters) {
        return value.expression.evaluate(parameters);
    };

    DataConstantProperty.prototype.interpolate = function interpolate$1(a, b, t) {
        var interp = (interpolate)[this.specification.type];
        if (interp) {
            return interp(a, b, t);
        } else {
            return a;
        }
    };
    f.DataConstantProperty = DataConstantProperty;


    f.CrossFadedDataDrivenProperty = (function (DataDrivenProperty) {
        function CrossFadedDataDrivenProperty() {
            DataDrivenProperty.apply(this, arguments);
        }

        if (DataDrivenProperty) CrossFadedDataDrivenProperty.__proto__ = DataDrivenProperty;
        CrossFadedDataDrivenProperty.prototype = Object.create(DataDrivenProperty && DataDrivenProperty.prototype);
        CrossFadedDataDrivenProperty.prototype.constructor = CrossFadedDataDrivenProperty;

        CrossFadedDataDrivenProperty.prototype.possiblyEvaluate = function possiblyEvaluate(value, parameters) {
            if (value.value === undefined) {
                return new PossiblyEvaluatedPropertyValue(this, {kind: 'constant', value: undefined}, parameters);
            } else if (value.expression.kind === 'constant') {
                var constantValue = value.expression.evaluate(parameters);
                var constant = this._calculate(constantValue, constantValue, constantValue, parameters);
                return new PossiblyEvaluatedPropertyValue(this, {kind: 'constant', value: constant}, parameters);
            } else if (value.expression.kind === 'camera') {
                var cameraVal = this._calculate(
                    value.expression.evaluate({zoom: parameters.zoom - 1.0}),
                    value.expression.evaluate({zoom: parameters.zoom}),
                    value.expression.evaluate({zoom: parameters.zoom + 1.0}),
                    parameters);
                return new PossiblyEvaluatedPropertyValue(this, {kind: 'constant', value: cameraVal}, parameters);
            } else {
                // source or composite expression
                return new PossiblyEvaluatedPropertyValue(this, value.expression, parameters);
            }
        };


        CrossFadedDataDrivenProperty.prototype.evaluate = function evaluate(value, globals, feature, featureState) {
            if (value.kind === 'source') {
                var constant = value.evaluate(globals, feature, featureState);
                return this._calculate(constant, constant, constant, globals);
            } else if (value.kind === 'composite') {
                return this._calculate(
                    value.evaluate({zoom: Math.floor(globals.zoom) - 1.0}, feature, featureState),
                    value.evaluate({zoom: Math.floor(globals.zoom)}, feature, featureState),
                    value.evaluate({zoom: Math.floor(globals.zoom) + 1.0}, feature, featureState),
                    globals);
            } else {
                return value.value;
            }
        };

        CrossFadedDataDrivenProperty.prototype._calculate = function _calculate(min, mid, max, parameters) {
            var z = parameters.zoom;
            return z > parameters.zoomHistory.lastIntegerZoom ? {from: min, to: mid} : {from: max, to: mid};
        };

        CrossFadedDataDrivenProperty.prototype.interpolate = function interpolate(a) {
            return a;
        };

        return CrossFadedDataDrivenProperty;
    }(DataDrivenProperty));

    var CrossFadedProperty = function CrossFadedProperty(specification) {
        this.specification = specification;
    };

    CrossFadedProperty.prototype.possiblyEvaluate = function possiblyEvaluate(value, parameters) {
        if (value.value === undefined) {
            return undefined;
        } else if (value.expression.kind === 'constant') {
            var constant = value.expression.evaluate(parameters);
            return this._calculate(constant, constant, constant, parameters);
        } else {
            return this._calculate(
                value.expression.evaluate(new EvaluationParameters(Math.floor(parameters.zoom - 1.0), parameters)),
                value.expression.evaluate(new EvaluationParameters(Math.floor(parameters.zoom), parameters)),
                value.expression.evaluate(new EvaluationParameters(Math.floor(parameters.zoom + 1.0), parameters)),
                parameters);
        }
    };

    CrossFadedProperty.prototype._calculate = function _calculate(min, mid, max, parameters) {
        var z = parameters.zoom;
        return z > parameters.zoomHistory.lastIntegerZoom ? {from: min, to: mid} : {from: max, to: mid};
    };

    CrossFadedProperty.prototype.interpolate = function interpolate(a) {
        return a;
    };
    f.CrossFadedProperty = CrossFadedProperty;


    var ColorRampProperty = function ColorRampProperty(specification) {
        this.specification = specification;
    };

    ColorRampProperty.prototype.possiblyEvaluate = function possiblyEvaluate(value, parameters) {
        return !!value.expression.evaluate(parameters);
    };

    ColorRampProperty.prototype.interpolate = function interpolate() {
        return false;
    };
    f.ColorRampProperty = ColorRampProperty;
});