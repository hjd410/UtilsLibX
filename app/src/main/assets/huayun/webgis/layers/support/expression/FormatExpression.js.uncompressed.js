define("com/huayun/webgis/layers/support/expression/FormatExpression", [
    "../style/styleUtils",
    "./Formatted",
    "./FormattedSection"
], function (styleUtils, Formatted, FormattedSection) {

    /**
     * format运算符, 格式化字符串
     * @private
     * @ignore
     * @param sections
     * @constructor
     */
    var FormatExpression = function FormatExpression(sections) {
        this.type = {kind: 'formatted'};
        this.sections = sections;
    };

    FormatExpression.parse = function (args, context) {
        if (args.length < 3) {
            return context.error("Expected at least two arguments.");
        }

        if ((args.length - 1) % 2 !== 0) {
            return context.error("Expected an even number of arguments.");
        }

        var sections = [];
        for (var i = 1; i < args.length - 1; i += 2) {
            var text = context.parse(args[i], 1, {kind: "value"});
            if (!text) {
                return null;
            }
            var kind = text.type.kind;
            if (kind !== 'string' && kind !== 'value' && kind !== 'null') {
                return context.error("Formatted text type must be 'string', 'value', or 'null'.");
            }

            var options = args[i + 1];
            if (typeof options !== "object" || Array.isArray(options)) {
                return context.error("Format options argument must be an object.");
            }

            var scale = null;
            if (options['font-scale']) {
                scale = context.parse(options['font-scale'], 1, {kind: 'number'});
                if (!scale) {
                    return null;
                }
            }

            var font = null;
            if (options['text-font']) {
                font = context.parse(options['text-font'], 1, {
                    kind: "array",
                    itemType: {kind: 'string'},
                    N: undefined
                });
                if (!font) {
                    return null;
                }
            }
            sections.push({text: text, scale: scale, font: font});
        }
        return new FormatExpression(sections);
    };

    FormatExpression.prototype.evaluate = function (ctx) {
        return new Formatted(this.sections.map(function (section) {
                return new FormattedSection(
                    styleUtils.toString$1(section.text.evaluate(ctx)),
                    section.scale ? section.scale.evaluate(ctx) : null,
                    section.font ? section.font.evaluate(ctx).join(',') : null);
            })
        );
    };

    FormatExpression.prototype.eachChild = function (fn) {
        for (var i = 0, list = this.sections; i < list.length; i += 1) {
            var section = list[i];
            fn(section.text);
            if (section.scale) {
                fn(section.scale);
            }
            if (section.font) {
                fn(section.font);
            }
        }
    };

    FormatExpression.prototype.possibleOutputs = function () {
        return [undefined];
    };

    FormatExpression.prototype.serialize = function () {
        var serialized = ["format"];
        for (var i = 0, list = this.sections; i < list.length; i += 1) {
            var section = list[i];
            serialized.push(section.text.serialize());
            var options = {};
            if (section.scale) {
                options['font-scale'] = section.scale.serialize();
            }
            if (section.font) {
                options['text-font'] = section.font.serialize();
            }
            serialized.push(options);
        }
        return serialized;
    };

    return FormatExpression;
});