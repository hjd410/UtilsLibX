define("com/huayun/webgis/layers/support/expression/Interpolate", [
    "../style/styleUtils",
    "../../../utils/colorSpaces",
    "../UnitBezier"
], function (styleUtils, colorSpaces, UnitBezier) {

    /**
     * 指数插值计算
     * @private
     * @ignore
     * @param input 输入值
     * @param base 基数, 基数为1时就是线性插值
     * @param lowerValue 下边界值
     * @param upperValue 上边界值
     * @return {number}
     */
    function exponentialInterpolation(input, base, lowerValue, upperValue) {
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

    /**
     * 插值表达式, 三种插值方式:
     * - ['linear']: 线性插值
     * - ['exponential', base]: 指数插值
     * - ['cubic-bezier', x1, y1, x2, y2]: 三次贝塞尔曲线插值,
     * 格式:
     * ["interpolate",
     *    interpolation: ["linear"] | ["exponential", base] | ["cubic-bezier", x1, y1, x2, y2]
     *    input: number,
     *    stop_input_1: number, stop_output_1: OutputType,
     *    stop_input_n: number, stop_output_n: OutputType, ...
     * ]
     * @private
     * @ignore
     * @param type
     * @param operator
     * @param interpolation
     * @param input
     * @param stops
     * @constructor
     */
    var Interpolate = function Interpolate(type, operator, interpolation, input, stops) {
        this.type = type;
        this.operator = operator;
        this.interpolation = interpolation;
        this.input = input;

        this.labels = [];
        this.outputs = [];
        for (var i = 0, list = stops; i < list.length; i += 1) {
            var ref = list[i];
            var label = ref[0];
            var expression = ref[1];

            this.labels.push(label);
            this.outputs.push(expression);
        }
    };

    Interpolate.interpolationFactor = function (interpolation, input, lower, upper) {
        var t = 0;
        if (interpolation.name === 'exponential') { // 指数插值
            t = exponentialInterpolation(input, interpolation.base, lower, upper);
        } else if (interpolation.name === 'linear') { // 线性插值, 基数为1
            t = exponentialInterpolation(input, 1, lower, upper);
        } else if (interpolation.name === 'cubic-bezier') { // 三次贝塞尔曲线插值
            var c = interpolation.controlPoints;
            var ub = new UnitBezier(c[0], c[1], c[2], c[3]);
            t = ub.solve(exponentialInterpolation(input, 1, lower, upper));
        }
        return t;
    };

    Interpolate.parse = function (args, context) {
        var operator = args[0]; // 运算符
        var interpolation = args[1]; // 插值方式
        var input = args[2]; // 输入值
        var rest = args.slice(3); // stops

        if (!Array.isArray(interpolation) || interpolation.length === 0) {
            return context.error("Expected an interpolation type expression.", 1);
        }

        if (interpolation[0] === 'linear') {
            interpolation = {name: 'linear'};
        } else if (interpolation[0] === 'exponential') {
            var base = interpolation[1];
            if (typeof base !== 'number') {
                return context.error("Exponential interpolation requires a numeric base.", 1, 1);
            }
            interpolation = {
                name: 'exponential',
                base: base
            };
        } else if (interpolation[0] === 'cubic-bezier') {
            var controlPoints = interpolation.slice(1);
            if (controlPoints.length !== 4 ||
                controlPoints.some(function (t) {
                    return typeof t !== 'number' || t < 0 || t > 1;
                })
            ) {
                return context.error('Cubic bezier interpolation requires four numeric arguments with values between 0 and 1.', 1);
            }
            interpolation = {
                name: 'cubic-bezier',
                controlPoints: (controlPoints)
            };
        } else {
            return context.error("Unknown interpolation type " + String(interpolation[0]), 1, 0);
        }

        if (args.length - 1 < 4) {
            return context.error(("Expected at least 4 arguments, but found only " + (args.length - 1) + "."));
        }

        if ((args.length - 1) % 2 !== 0) {
            return context.error("Expected an even number of arguments.");
        }

        input = context.parse(input, 2, {kind: 'number'});
        if (!input) {
            return null;
        }

        var stops = [];
        var outputType = null;
        if (operator === 'interpolate-hcl' || operator === 'interpolate-lab') { // 两种颜色空间插值
            outputType = {kind: 'color'};
        } else if (context.expectedType && context.expectedType.kind !== 'value') {
            outputType = context.expectedType;
        }

        for (var i = 0; i < rest.length; i += 2) {
            var label = rest[i];
            var value = rest[i + 1];
            var labelKey = i + 3;
            var valueKey = i + 4;

            if (typeof label !== 'number') {
                return context.error('Input/output pairs for "interpolate" expressions must be defined using literal numeric values (not computed expressions) for the input values.', labelKey);
            }

            if (stops.length && stops[stops.length - 1][0] >= label) {
                return context.error('Input/output pairs for "interpolate" expressions must be arranged with input values in strictly ascending order.', labelKey);
            }

            var parsed = context.parse(value, valueKey, outputType);
            if (!parsed) {
                return null;
            }
            outputType = outputType || parsed.type;
            stops.push([label, parsed]);
        }

        if (outputType.kind !== 'number' && outputType.kind !== 'color' &&
            !(outputType.kind === 'array' && outputType.itemType.kind === 'number' && typeof outputType.N === 'number')) {
            return context.error("Type " + styleUtils.toString(outputType) + " is not interpolatable.");
        }

        return new Interpolate(outputType, operator, interpolation, input, stops);
    };

    Interpolate.prototype.evaluate = function (ctx) {
        var labels = this.labels;
        var outputs = this.outputs;

        if (labels.length === 1) {
            return outputs[0].evaluate(ctx);
        }

        var value = this.input.evaluate(ctx);
        if (value <= labels[0]) {
            return outputs[0].evaluate(ctx);
        }

        var stopCount = labels.length;
        if (value >= labels[stopCount - 1]) {
            return outputs[stopCount - 1].evaluate(ctx);
        }

        var index = styleUtils.findStopLessThanOrEqualTo(labels, value);
        var lower = labels[index];
        var upper = labels[index + 1];
        var t = Interpolate.interpolationFactor(this.interpolation, value, lower, upper);

        var outputLower = outputs[index].evaluate(ctx);
        var outputUpper = outputs[index + 1].evaluate(ctx);

        if (this.operator === 'interpolate') {
            return (styleUtils.interpolate[this.type.kind.toLowerCase()])(outputLower, outputUpper, t);
        } else if (this.operator === 'interpolate-hcl') {
            var hcl = colorSpaces.hcl;
            return hcl.reverse(hcl.interpolate(hcl.forward(outputLower), hcl.forward(outputUpper), t));
        } else {
            var lab = colorSpaces.lab;
            return lab.reverse(lab.interpolate(lab.forward(outputLower), lab.forward(outputUpper), t));
        }
    };

    Interpolate.prototype.eachChild = function (fn) {
        fn(this.input);
        for (var i = 0, list = this.outputs; i < list.length; i += 1) {
            var expression = list[i];
            fn(expression);
        }
    };

    Interpolate.prototype.possibleOutputs = function () {
        var ref;
        return (ref = []).concat.apply(ref, this.outputs.map(function (output) {
            return output.possibleOutputs();
        }));
    };

    Interpolate.prototype.serialize = function () {
        var interpolation;
        if (this.interpolation.name === 'linear') {
            interpolation = ["linear"];
        } else if (this.interpolation.name === 'exponential') {
            if (this.interpolation.base === 1) {
                interpolation = ["linear"];
            } else {
                interpolation = ["exponential", this.interpolation.base];
            }
        } else {
            interpolation = ["cubic-bezier"].concat(this.interpolation.controlPoints);
        }

        var serialized = [this.operator, interpolation, this.input.serialize()];
        for (var i = 0; i < this.labels.length; i++) {
            serialized.push(
                this.labels[i],
                this.outputs[i].serialize()
            );
        }
        return serialized;
    };
    return Interpolate;
});