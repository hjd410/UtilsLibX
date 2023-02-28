define("com/huayun/webgis/layers/support/expression/Step", [
    "../style/styleUtils"
], function (styleUtils) {
    /**
     * step运算符, 成对输入和输出定义的分段常量函数, 产生离散且步进的结果
     * ["step",
     *    input: number,
     *    stop_output_0,
     *    stop_input_1, stop_output_1,
     *    stop_input_n, stop_output_n,...
     * ]
     * @private
     * @ignore
     * @param type
     * @param input
     * @param stops
     * @constructor
     */
    var Step = function Step(type, input, stops) {
        this.type = type;
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

    Step.parse = function (args, context) {
        if (args.length - 1 < 4) {
            return context.error(("Expected at least 4 arguments, but found only " + (args.length - 1) + "."));
        }
        if ((args.length - 1) % 2 !== 0) {
            return context.error("Expected an even number of arguments.");
        }
        var input = context.parse(args[1], 1, {kind: 'number'});
        if (!input) {
            return null;
        }

        var stops = [];
        var outputType = null;
        if (context.expectedType && context.expectedType.kind !== 'value') {
            outputType = context.expectedType;
        }

        for (var i = 1; i < args.length; i += 2) {
            var label = i === 1 ? -Infinity : args[i];
            var value = args[i + 1];
            var labelKey = i;
            var valueKey = i + 1;
            if (typeof label !== 'number') {
                return context.error('Input/output pairs for "step" expressions must be defined using literal numeric values (not computed expressions) for the input values.', labelKey);
            }
            if (stops.length && stops[stops.length - 1][0] >= label) {
                return context.error('Input/output pairs for "step" expressions must be arranged with input values in strictly ascending order.', labelKey);
            }
            var parsed = context.parse(value, valueKey, outputType);
            if (!parsed) {
                return null;
            }
            outputType = outputType || parsed.type;
            stops.push([label, parsed]);
        }
        return new Step(outputType, input, stops);
    };

    Step.prototype.evaluate = function (ctx) {
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
        return outputs[index].evaluate(ctx);
    };

    Step.prototype.eachChild = function (fn) {
        fn(this.input);
        for (var i = 0, list = this.outputs; i < list.length; i += 1) {
            var expression = list[i];
            fn(expression);
        }
    };

    Step.prototype.possibleOutputs = function () {
        var ref;
        return (ref = []).concat.apply(ref, this.outputs.map(function (output) {
            return output.possibleOutputs();
        }));
    };

    Step.prototype.serialize = function () {
        var serialized = ["step", this.input.serialize()];
        for (var i = 0; i < this.labels.length; i++) {
            if (i > 0) {
                serialized.push(this.labels[i]);
            }
            serialized.push(this.outputs[i].serialize());
        }
        return serialized;
    };
    return Step;
});