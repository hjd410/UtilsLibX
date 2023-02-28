define("com/huayun/webgis/layers/support/expression/IndexOf", [
    "./types"
], function (types) {
    function IndexOf(needle, haystack, fromIndex) {
        this.type = {kind: 'number'};
        this.needle = needle;
        this.haystack = haystack;
        this.fromIndex = fromIndex;
    }

    IndexOf.parse = function (args, context) {
        if (args.length <= 2 || args.length >= 5) {
            return context.error("参数个数不正确!");
        }
        const needle = context.parse(args[1], 1, types.ValueType);
        const haystack = context.parse(args[2], 2, types.ValueType);
        if (!needle || !haystack) return null;
        if (args.length === 4) {
            const fromIndex = context.parse(args[3], 3, types.NumberType);
            if (!fromIndex) return null;
            return new IndexOf(needle, haystack, fromIndex);
        } else {
            return new IndexOf(needle, haystack);
        }
    };

    IndexOf.prototype.evaluate = function (ctx) {
        const needle = this.needle.evaluate(ctx);
        const haystack = this.needle.evaluate(ctx);
        if (this.fromIndex) {
            const fromIndex = this.fromIndex.evaluate(ctx);
            return haystack.indexOf(needle, fromIndex);
        }
        return haystack.indexOf(needle);
    };

    IndexOf.prototype.eachChild = function (fn) {
        fn(this.needle);
        fn(this.haystack);
        if (this.fromIndex) {
            fn(this.fromIndex);
        }
    };

    IndexOf.prototype.possibleOutputs = function () {
        return [undefined];
    };

    IndexOf.prototype.serialize = function () {
        if (this.fromIndex !== null && this.fromIndex !== undefined) {
            const fromIndex = this.fromIndex.serialize();
            return ["index-of", this.needle.serialize(), this.haystack.serialize(), fromIndex];
        }
        return ["index-of", this.needle.serialize(), this.haystack.serialize()];
    }

    return IndexOf;
});