define("com/huayun/webgis/layers/support/expression/At", [], function () {

    /**
     * At操作符, 从数组中检索一个元素
     * ["at", number, array]
     * @private
     * @ignore
     * @param type
     * @param index
     * @param input
     * @constructor
     */
    var At = function At(type, index, input) {
        this.type = type;
        this.index = index;
        this.input = input;
    };

    At.parse = function (args, context) {
        if (args.length !== 3) {
            return context.error(("Expected 2 arguments, but found " + (args.length - 1) + " instead."));
        }

        var index = context.parse(args[1], 1, {kind: "number"});
        var input = context.parse(args[2], 2, {
            kind: 'array',
            itemType: context.expectedType || {kind: "value"},
            N: undefined
        });

        if (!index || !input) {
            return null;
        }

        var t = input.type;
        return new At(t.itemType, index, input);
    };

    At.prototype.evaluate = function (ctx) {
        var index = this.index.evaluate(ctx);
        var array = this.input.evaluate(ctx);

        if (index < 0) {
            throw new Error("Array index out of bounds: " + index + " < 0.");
        }

        if (index >= array.length) {
            throw new Error("Array index out of bounds: " + index + " > " + (array.length - 1) + ".");
        }

        if (index !== Math.floor(index)) {
            throw new Error("Array index must be an integer, but found " + index + " instead.");
        }

        return array[index];
    };

    At.prototype.eachChild = function (fn) {
        fn(this.index);
        fn(this.input);
    };

    At.prototype.possibleOutputs = function () {
        return [undefined];
    };

    At.prototype.serialize = function () {
        return ["at", this.index.serialize(), this.input.serialize()];
    };

    return At;
})