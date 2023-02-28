define("com/huayun/webgis/layers/support/expression/Let", [], function () {
    /**
     * let运算符
     * @private
     * @ignore
     * @param bindings
     * @param result
     * @constructor
     */
    var Let = function Let(bindings, result) {
        this.type = result.type;
        this.bindings = [].concat(bindings);
        this.result = result;
    };

    Let.prototype.evaluate = function (ctx) {
        return this.result.evaluate(ctx);
    };

    Let.prototype.eachChild = function (fn) {
        for (var i = 0, list = this.bindings; i < list.length; i += 1) {
            var binding = list[i];
            fn(binding[1]);
        }
        fn(this.result);
    };

    Let.parse = function (args, context) {
        if (args.length < 4) {
            return context.error(("Expected at least 3 arguments, but found " + (args.length - 1) + " instead."));
        }

        var bindings = [];
        for (var i = 1; i < args.length - 1; i += 2) {
            var name = args[i];

            if (typeof name !== 'string') {
                return context.error(("Expected string, but found " + (typeof name) + " instead."), i);
            }

            if (/[^a-zA-Z0-9_]/.test(name)) {
                return context.error("Variable names must contain only alphanumeric characters or '_'.", i);
            }

            var value = context.parse(args[i + 1], i + 1);
            if (!value) {
                return null;
            }
            bindings.push([name, value]);
        }

        var result = context.parse(args[args.length - 1], args.length - 1, context.expectedType, bindings);
        if (!result) {
            return null;
        }
        return new Let(bindings, result);
    };

    Let.prototype.possibleOutputs = function () {
        return this.result.possibleOutputs();
    };

    Let.prototype.serialize = function () {
        var serialized = ["let"];
        for (var i = 0, list = this.bindings; i < list.length; i += 1) {
            var ref = list[i];
            var name = ref[0];
            var expr = ref[1];
            serialized.push(name, expr.serialize());
        }
        serialized.push(this.result.serialize());
        return serialized;
    };
    return Let;
});