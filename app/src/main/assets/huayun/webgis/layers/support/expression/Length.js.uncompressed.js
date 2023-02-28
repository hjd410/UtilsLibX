define("com/huayun/webgis/layers/support/expression/Length", [], function () {

    /**
     * 获取数组或字符串的长度
     * ["length", string|array|value]
     * @private
     * @ignore
     * @param input
     * @constructor
     */
    var Length = function Length(input) {
        this.type = {kind: "number"};
        this.input = input;
    };

    Length.parse = function (args, context) {
        if (args.length !== 2) {
            return context.error("Expected 1 argument, but found " + (args.length - 1) + " instead.");
        }

        var input = context.parse(args[1], 1);
        if (!input) {
            return null;
        }

        if (input.type.kind !== 'array' && input.type.kind !== 'string' && input.type.kind !== 'value') {
            return context.error("Expected argument of type string or array");
        }

        return new Length(input);
    };

    Length.prototype.evaluate = function (ctx) {
        var input = this.input.evaluate(ctx);
        if (typeof input === 'string') {
            return input.length;
        } else if (Array.isArray(input)) {
            return input.length;
        } else {
            throw new Error("Expected value to be of type string or array");
        }
    };

    Length.prototype.eachChild = function (fn) {
        fn(this.input);
    };

    Length.prototype.possibleOutputs = function () {
        return [undefined];
    };

    Length.prototype.serialize = function () {
        var serialized = ["length"];
        this.eachChild(function (child) {
            serialized.push(child.serialize());
        });
        return serialized;
    };

    return Length;
})