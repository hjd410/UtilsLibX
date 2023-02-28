define("com/huayun/webgis/layers/support/expression/Assertion", [
    "../style/styleUtils"
], function (styleUtils) {

    var types = {
        string: {kind: 'string'},
        number: {kind: 'number'},
        boolean: {kind: 'boolean'},
        object: {kind: 'object'}
    };

    /**
     * 断言输入值是指定类型的表达式
     * @private
     * @ignore
     * @param type
     * @param args
     * @constructor
     */
    var Assertion = function Assertion(type, args) {
        this.type = type;
        this.args = args;
    };

    Assertion.parse = function (args, context) {
        if (args.length < 2) {
            return context.error("Expected at least one argument.");
        }

        var i = 1;
        var type;
        var name = args[0];
        /**
         * ["array", value]
         * ["array", type, value]
         * ["array", type, N, value]
         */
        if (name === 'array') { // 断言数组
            var itemType;
            if (args.length > 2) { // 第二个是数组类型
                var type$1 = args[1];
                if (typeof type$1 !== 'string' || !(type$1 in types) || type$1 === 'object') {
                    return context.error('The item type argument of "array" must be one of string, number, boolean', 1);
                }
                itemType = types[type$1];
                i++;
            } else {
                itemType = {kind: 'value'};
            }

            var N;
            if (args.length > 3) { // 第三个是数组长度
                if (args[2] !== null && (typeof args[2] !== 'number' || args[2] < 0 || args[2] !== Math.floor(args[2]))) {
                    return context.error('The length argument to "array" must be a positive integer literal', 2);
                }
                N = args[2];
                i++;
            }
            type = {
                kind: 'array',
                itemType: itemType,
                N: N
            }
        } else {
            type = types[name];
        }

        var parsed = [];
        for (; i < args.length; i++) {
            var input = context.parse(args[i], i, {kind: 'value'});
            if (!input) {
                return null;
            }
            parsed.push(input);
        }

        return new Assertion(type, parsed);
    };

    Assertion.prototype.evaluate = function (ctx) {
        for (var i = 0; i < this.args.length; i++) {
            var value = this.args[i].evaluate(ctx);
            var error = styleUtils.checkSubtype(this.type, styleUtils.typeOf(value));
            if (!error) {
                return value;
            } else if (i === this.args.length - 1) {
                throw new Error("Expected value to be of type " + styleUtils.toString(this.type) + ", but found " + (styleUtils.toString(styleUtils.typeOf(value))) + " instead.");
            }
        }
        return null;
    };

    Assertion.prototype.eachChild = function (fn) {
        this.args.forEach(fn);
    };

    Assertion.prototype.possibleOutputs = function () {
        var ref;
        return (ref = []).concat.apply(ref, this.args.map(function (arg) {
            return arg.possibleOutputs();
        }));
    };

    Assertion.prototype.serialize = function () {
        var type = this.type;
        var serialized = [type.kind];
        if (type.kind === 'array') {
            var itemType = type.itemType;
            if (itemType.kind === 'string' || itemType.kind === 'number' || itemType.kind === 'boolean') {
                serialized.push(itemType.kind);
                var N = type.N;
                if (typeof N === 'number' || this.args.length > 1) {
                    serialized.push(N);
                }
            }
        }
        return serialized.concat(this.args.map(function (arg) {
            return arg.serialize();
        }));
    };

    return Assertion;
});