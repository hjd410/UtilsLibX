define("com/huayun/webgis/layers/support/expression/Coercion", [
    "../style/styleUtils",
    "../../../utils/Color",
    "../../../utils/utils",
    "./Formatted",
    "./FormatExpression"
], function (styleUtils, Color, utils, Formatted, FormatExpression) {
    var types$1 = {
        'to-boolean': {kind: 'boolean'},
        'to-color': {kind: 'color'},
        'to-number': {kind: 'number'},
        'to-string': {kind: 'string'}
    };

    /**
     * to-*运算符, 将输入值转换成指定类型
     * ["to-boolean", value]
     * ["to-color", value, fallback, fallback...]
     * ["to-number", value, fallback, fallback...]
     * @private
     * @ignore
     * @param type
     * @param args
     * @constructor
     */
    var Coercion = function Coercion(type, args) {
        this.type = type;
        this.args = args;
    };

    Coercion.parse = function (args, context) {
        if (args.length < 2) {
            return context.error("Expected at least one argument.");
        }

        var name = args[0];
        if ((name === 'to-boolean' || name === 'to-string') && args.length !== 2) {
            return context.error("Expected one argument.");
        }

        var type = types$1[name];
        var parsed = [];
        for (var i = 1; i < args.length; i++) {
            var input = context.parse(args[i], i, {kind: 'value'});
            if (!input) {
                return null;
            }
            parsed.push(input);
        }
        return new Coercion(type, parsed);
    };

    Coercion.prototype.evaluate = function (ctx) {
        if (this.type.kind === 'boolean') {
            return Boolean(this.args[0].evaluate(ctx));
        } else if (this.type.kind === 'color') {
            var input;
            var error;
            for (var i = 0, list = this.args; i < list.length; i += 1) {
                var arg = list[i];
                input = arg.evaluate(ctx);
                error = null;

                if (input instanceof Color) {
                    return input;
                } else if (typeof input === 'string') {
                    var c = ctx.parseColor(input);
                    if (c) {
                        return c;
                    }
                } else if (Array.isArray(input)) {
                    if (input.length < 3 || input.length > 4) {
                        error = "Invalid rbga value " + (JSON.stringify(input)) + ": expected an array containing either three or four numeric values.";
                    } else {
                        error = utils.validateRGBA(input[0], input[1], input[2], input[3]);
                    }
                    if (!error) {
                        return new Color((input[0]) / 255, (input[1]) / 255, (input[2]) / 255, (input[3]));
                    }
                }
            }
            throw new Error(error || ("Could not parse color from value '" + (typeof input === 'string' ? input : String(JSON.stringify(input))) + "'"));
        } else if (this.type.kind === 'number') {
            var value = null;
            for (var i$1 = 0, list$1 = this.args; i$1 < list$1.length; i$1 += 1) {
                var arg$1 = list$1[i$1];
                value = arg$1.evaluate(ctx);
                if (value === null) {
                    return 0;
                }
                var num = Number(value);
                if (isNaN(num)) {
                    continue;
                }
                return num;
            }
            throw new Error(("Could not convert " + (JSON.stringify(value)) + " to number."));
        } else if (this.type.kind === 'formatted') {
            return Formatted.fromString(styleUtils.toString$1(this.args[0].evaluate(ctx)));
        } else {
            return styleUtils.toString$1(this.args[0].evaluate(ctx));
        }
    };

    Coercion.prototype.eachChild = function (fn) {
        this.args.forEach(fn);
    };

    Coercion.prototype.possibleOutputs = function () {
        var ref;
        return (ref = []).concat.apply(ref, this.args.map(function (arg) {
            return arg.possibleOutputs();
        }));
    };

    Coercion.prototype.serialize = function () {
        if (this.type.kind === 'formatted') {
            return new FormatExpression([{text: this.args[0], scale: null, font: null}]).serialize();
        }
        var serialized = [("to-" + (this.type.kind))];
        this.eachChild(function (child) {
            serialized.push(child.serialize());
        });
        return serialized;
    };
    return Coercion;
});