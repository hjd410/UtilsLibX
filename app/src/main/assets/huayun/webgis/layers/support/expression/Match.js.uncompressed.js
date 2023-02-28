define("com/huayun/webgis/layers/support/expression/Match", [
    "../style/styleUtils"
], function (styleUtils) {
    /**
     * match运算符, 选择标签值与输入值匹配的输出, 若找不到匹配项则选择回退值
     * ["match",
     *      input: number or string,
     *      label, output,
     *      label, output
     *      ...,
     *      fallback
     * ]
     * @private
     * @ignore
     * @param inputType
     * @param outputType
     * @param input
     * @param cases
     * @param outputs
     * @param otherwise
     * @constructor
     */
    var Match = function Match(inputType, outputType, input, cases, outputs, otherwise) {
        this.inputType = inputType;
        this.type = outputType;
        this.input = input;
        this.cases = cases;
        this.outputs = outputs;
        this.otherwise = otherwise;
    };

    Match.parse = function (args, context) {
        if (args.length < 5) {
            return context.error(("Expected at least 4 arguments, but found only " + (args.length - 1) + "."));
        }
        if (args.length % 2 !== 1) {
            return context.error("Expected an even number of arguments.");
        }

        var inputType;
        var outputType;
        if (context.expectedType && context.expectedType.kind !== 'value') {
            outputType = context.expectedType;
        }
        var cases = {};
        var outputs = [];
        for (var i = 2; i < args.length - 1; i += 2) {
            var labels = args[i];
            var value = args[i + 1];

            if (!Array.isArray(labels)) {
                labels = [labels];
            }

            var labelContext = context.concat(i);
            if (labels.length === 0) {
                return labelContext.error('Expected at least one branch label.');
            }

            for (var i$1 = 0, list = labels; i$1 < list.length; i$1 += 1) {
                var label = list[i$1];

                if (typeof label !== 'number' && typeof label !== 'string') {
                    return labelContext.error("Branch labels must be numbers or strings.");
                } else if (typeof label === 'number' && Math.abs(label) > Number.MAX_SAFE_INTEGER) {
                    return labelContext.error(("Branch labels must be integers no larger than " + (Number.MAX_SAFE_INTEGER) + "."));

                } else if (typeof label === 'number' && Math.floor(label) !== label) {
                    return labelContext.error("Numeric branch labels must be integer values.");

                } else if (!inputType) {
                    inputType = styleUtils.typeOf(label);
                } else if (labelContext.checkSubtype(inputType, styleUtils.typeOf(label))) {
                    return null;
                }

                if (typeof cases[String(label)] !== 'undefined') {
                    return labelContext.error('Branch labels must be unique.');
                }

                cases[String(label)] = outputs.length;
            }

            var result = context.parse(value, i, outputType);
            if (!result) {
                return null;
            }
            outputType = outputType || result.type;
            outputs.push(result);
        }

        var input = context.parse(args[1], 1, {kind: "value"});
        if (!input) {
            return null;
        }

        var otherwise = context.parse(args[args.length - 1], args.length - 1, outputType);
        if (!otherwise) {
            return null;
        }

        if (input.type.kind !== 'value' && context.concat(1).checkSubtype((inputType), input.type)) {
            return null;
        }

        return new Match(inputType, outputType, input, cases, outputs, otherwise);
    };

    Match.prototype.evaluate = function (ctx) {
        var input = this.input.evaluate(ctx);
        var output = (styleUtils.typeOf(input) === this.inputType && this.outputs[this.cases[input]]) || this.otherwise;
        return output.evaluate(ctx);
    };

    Match.prototype.eachChild = function (fn) {
        fn(this.input);
        this.outputs.forEach(fn);
        fn(this.otherwise);
    };

    Match.prototype.possibleOutputs = function () {
        var ref;

        return (ref = []).concat.apply(ref, this.outputs.map(function (out) {
                return out.possibleOutputs();
            })).concat(this.otherwise.possibleOutputs());
    };

    Match.prototype.serialize = function () {
        var this$1 = this;
        var serialized = ["match", this.input.serialize()];
        var sortedLabels = Object.keys(this.cases).sort();

        var groupedByOutput = [];
        var outputIndex;
        var outputLookup = {}; // lookup index into groupedByOutput for a given output expression
        for (var i = 0, list = sortedLabels; i < list.length; i += 1) {
            var label = list[i];
            outputIndex = outputLookup[this.cases[label]];
            if (outputIndex === undefined) {
                // First time seeing this output, add it to the end of the grouped list
                outputLookup[this.cases[label]] = groupedByOutput.length;
                groupedByOutput.push([this.cases[label], [label]]);
            } else {
                // We've seen this expression before, add the label to that output's group
                groupedByOutput[outputIndex][1].push(label);
            }
        }

        var coerceLabel = function (label) {
            return this$1.inputType.kind === 'number' ? Number(label) : label;
        };

        for (var i$1 = 0, list$1 = groupedByOutput; i$1 < list$1.length; i$1 += 1) {
            var ref = list$1[i$1];
            outputIndex = ref[0];
            var labels = ref[1];

            if (labels.length === 1) {
                // Only a single label matches this output expression
                serialized.push(coerceLabel(labels[0]));
            } else {
                // Array of literal labels pointing to this output expression
                serialized.push(labels.map(coerceLabel));
            }
            serialized.push(this.outputs[outputIndex$1].serialize());
        }
        serialized.push(this.otherwise.serialize());
        return serialized;
    };

    return Match;
})