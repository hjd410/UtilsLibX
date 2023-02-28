define("com/huayun/webgis/layers/support/expression/Case", [], function () {

    /**
     * Case运算符, 选择第一个测试条件计算为true的输出值, 否则选择回退值.
     * ["case",
     *      condition: boolean, output: OutputType,
     *      condition: boolean, output: OutputType,
     *      ...
     *      fallback: OutputType
     * ]
     * @private
     * @ignore
     * @param type
     * @param branches 分支
     * @param otherwise 回退值
     * @constructor
     */
    var Case = function Case(type, branches, otherwise) {
        this.type = type;
        this.branches = branches;
        this.otherwise = otherwise;
    };

    Case.parse = function (args, context) {
        if (args.length < 4) {
            return context.error("Expected at least 3 arguments, but found only " + (args.length - 1) + ".");
        }
        if (args.length % 2 !== 0) {
            return context.error("Expected an odd number of arguments.");
        }

        var outputType;
        if (context.expectedType && context.expectedType.kind !== 'value') {
            outputType = context.expectedType;
        }

        var branches = [];
        for (var i = 1; i < args.length - 1; i += 2) {
            var test = context.parse(args[i], i, {kind: "boolean"});
            if (!test) {
                return null;
            }

            var result = context.parse(args[i + 1], i + 1, outputType);
            if (!result) {
                return null;
            }

            branches.push([test, result]);

            outputType = outputType || result.type;
        }

        var otherwise = context.parse(args[args.length - 1], args.length - 1, outputType);
        if (!otherwise) {
            return null;
        }

        return new Case(outputType, branches, otherwise);
    };

    Case.prototype.evaluate = function (ctx) {
        for (var i = 0, list = this.branches; i < list.length; i += 1) {
            var ref = list[i];
            var test = ref[0];
            var expression = ref[1];

            if (test.evaluate(ctx)) {
                return expression.evaluate(ctx);
            }
        }
        return this.otherwise.evaluate(ctx);
    };

    Case.prototype.eachChild = function (fn) {
        for (var i = 0, list = this.branches; i < list.length; i += 1) {
            var ref = list[i];
            var test = ref[0];
            var expression = ref[1];
            fn(test);
            fn(expression);
        }
        fn(this.otherwise);
    };

    Case.prototype.possibleOutputs = function () {
        var ref;

        return (ref = [])
            .concat.apply(ref, this.branches.map(function (ref) {
                var _ = ref[0];
                var out = ref[1];
                return out.possibleOutputs();
            }))
            .concat(this.otherwise.possibleOutputs());
    };

    Case.prototype.serialize = function () {
        var serialized = ["case"];
        this.eachChild(function (child) {
            serialized.push(child.serialize());
        });
        return serialized;
    };

    return Case;
})