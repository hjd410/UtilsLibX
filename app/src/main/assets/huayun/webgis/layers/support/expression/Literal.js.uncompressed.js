define("com/huayun/webgis/layers/support/expression/Literal", [
    "./Formatted",
    "../style/styleUtils",
    "../../../utils/Color"
], function (Formatted, styleUtils, Color) {
    /**
     * 文字数组或对象值, 包括数字, 字符串, 布尔值, null
     * @private
     * @ignore
     * @param type
     * @param value
     * @constructor
     */
    var Literal = function Literal(type, value) {
        this.type = type;
        this.value = value;
    };

    Literal.parse = function (args, context) {
        if (args.length !== 2) {
            return context.error("'literal' expression requires exactly one argument, but found " + (args.length - 1) + " instead.");
        }

        if (!styleUtils.isValue(args[1])) {
            return context.error("invalid value");
        }

        var value = args[1];
        var type = styleUtils.typeOf(value);
        var expected = context.expectedType;
        if (type.kind === 'array' && type.N === 0 && expected && expected.kind === 'array' &&
            (typeof expected.N !== 'number' || expected.N === 0)) {
            type = expected;
        }
        return new Literal(type, value);
    };

    Literal.prototype.evaluate = function () {
        return this.value;
    };

    Literal.prototype.eachChild = function () {
    };

    Literal.prototype.possibleOutputs = function () {
        return [this.value];
    };

    Literal.prototype.serialize = function () {
        if (this.type.kind === 'array' || this.type.kind === 'object') {
            return ["literal", this.value];
        } else if (this.value instanceof Color) {
            return ["rgba"].concat(this.value.toArray());
        } else if (this.value instanceof Formatted) {
            return this.value.serialize();
        } else {
            return this.value;
        }
    };
    return Literal;
});