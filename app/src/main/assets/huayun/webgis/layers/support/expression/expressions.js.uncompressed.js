define("com/huayun/webgis/layers/support/expression/expressions", [
    "exports",
    "./Assertion",
    "./At",
    "./Case",
    "./Coalesce",
    "./Coercion",
    "./CollatorExpression",
    "./FormatExpression",
    "./IndexOf",
    "./Interpolate",
    "./Length",
    "./Let",
    "./Literal",
    "./Match",
    "./NumberFormat",
    "./Step",
    "./Var",
    "../style/styleUtils",
    "../../../gl/dataTransfer"
], function (exports, Assertion, At, Case, Coalesce, Coercion, CollatorExpression, FormatExpression, IndexOf, Interpolate, Length,
             Let, Literal, Match, NumberFormat, Step, Var, styleUtils, dataTransfer) {

    /**
     * 是否是可比较类型
     * 对于不等式, 必须为值, 字符串, 数字
     * 对于==/!=, 也可以是布尔值或null
     * @private
     * @ignore
     * @param op 运算符
     * @param type 数据
     * @return {boolean}
     */
    function isComparableType(op, type) {
        if (op === '==' || op === '!=') {
            return type.kind === 'boolean' || type.kind === 'string' || type.kind === 'number' ||
                type.kind === 'null' || type.kind === 'value';
        } else {
            return type.kind === 'string' || type.kind === 'number' || type.kind === 'value';
        }
    }

    /**
     * 比较运算符的特殊形式, 实现签名:
     * - (T, T, ?Collator) => boolean
     * - (T, value, ?Collator) => boolean
     * - (value, T, ?Collator) => boolean
     * 对于不等式, T必须是值, 字符串或数字. 对于==/!=, 也可以是布尔值或null.
     * 平等语义等同于JavaScript的严格平等(===/!==), 即参数类型不匹配时, ==的结果为false, !=的结果为true.
     * @private
     * @ignore
     * @param op
     * @param compareBasic
     * @param compareWithCollator
     * @returns {Comparison}
     */
    function makeComparison(op, compareBasic, compareWithCollator) {
        var isOrderComparison = op !== '==' && op !== '!=';
        return (function () {
            /**
             * 比较
             * @private
             * @ignore
             * @param lhs
             * @param rhs
             * @param collator
             * @constructor
             */
            function Comparison(lhs, rhs, collator) {
                this.type = {kind: 'boolean'};
                this.lhs = lhs;
                this.rhs = rhs;
                this.collator = collator;
                this.hasUntypedArgument = lhs.type.kind === 'value' || rhs.type.kind === 'value';
            }

            Comparison.parse = function (args, context) {
                if (args.length !== 3 && args.length !== 4) {
                    return context.error("Expected two or three arguments.");
                }
                var op = args[0]; // 第一个是运算符
                var lhs = context.parse(args[1], 1, {kind: 'value'}); // 第二个是左侧
                if (!lhs) {
                    return null;
                }
                if (!isComparableType(op, lhs.type)) {
                    return context.concat(1).error(("\"" + op + "\" comparisons are not supported for type '" + (styleUtils.toString(lhs.type)) + "'."));
                }
                var rhs = context.parse(args[2], 2, {kind: 'value'});
                if (!rhs) {
                    return null;
                }
                if (!isComparableType(op, rhs.type)) {
                    return context.concat(2).error(("\"" + op + "\" comparisons are not supported for type '" + (styleUtils.toString(rhs.type)) + "'."));
                }

                if (lhs.type.kind !== rhs.type.kind && lhs.type.kind !== 'value' && rhs.type.kind !== 'value') {
                    return context.error("Cannot compare types '" + (styleUtils.toString(lhs.type)) + "' and '" + (styleUtils.toString(rhs.type)) + "'.");
                }
                if (isOrderComparison) {
                    if (lhs.type.kind === 'value' && rhs.type.kind !== 'value') {
                        // (value, T)
                        lhs = new Assertion(rhs.type, [lhs]);
                    } else if (lhs.type.kind !== 'value' && rhs.type.kind === 'value') {
                        // (T, value)
                        rhs = new Assertion(lhs.type, [rhs]);
                    }
                }
                var collator = null;
                if (args.length === 4) {
                    if (lhs.type.kind !== 'string' && rhs.type.kind !== 'string' && lhs.type.kind !== 'value' && rhs.type.kind !== 'value') {
                        return context.error("Cannot use collator to compare non-string types.");
                    }
                    collator = context.parse(args[3], 3, {kind: 'collator'});
                    if (!collator) {
                        return null;
                    }
                }
                return new Comparison(lhs, rhs, collator);
            };

            Comparison.prototype.evaluate = function (ctx) {
                var lhs = this.lhs.evaluate(ctx);
                var rhs = this.rhs.evaluate(ctx);
                if (isOrderComparison && this.hasUntypedArgument) {
                    var lt = styleUtils.typeOf(lhs);
                    var rt = styleUtils.typeOf(rhs);
                    if (lt.kind !== rt.kind || !(lt.kind === 'string' || lt.kind === 'number')) {
                        throw new Error(("Expected arguments for \"" + op + "\" to be (string, string) or (number, number), but found (" + (lt.kind) + ", " + (rt.kind) + ") instead."));
                    }
                }

                if (this.collator && !isOrderComparison && this.hasUntypedArgument) {
                    var lt$1 = styleUtils.typeOf(lhs);
                    var rt$1 = styleUtils.typeOf(rhs);
                    if (lt$1.kind !== 'string' || rt$1.kind !== 'string') {
                        return compareBasic(ctx, lhs, rhs);
                    }
                }
                return this.collator ? compareWithCollator(ctx, lhs, rhs, this.collator.evaluate(ctx)) : compareBasic(ctx, lhs, rhs);
            };

            Comparison.prototype.eachChild = function (fn) {
                fn(this.lhs);
                fn(this.rhs);
                if (this.collator) {
                    fn(this.collator);
                }
            };

            Comparison.prototype.possibleOutputs = function () {
                return [true, false];
            };

            Comparison.prototype.serialize = function () {
                var serialized = [op];
                this.eachChild(function (child) {
                    serialized.push(child.serialize());
                });
                return serialized;
            };

            return Comparison;
        }());
    }

    /**
     * ==操作符
     * @private
     * @ignore
     * @param ctx
     * @param a
     * @param b
     * @return {boolean}
     */
    function eq(ctx, a, b) {
        return a === b;
    }

    /**
     * !=操作符
     * @private
     * @ignore
     * @param ctx
     * @param a
     * @param b
     * @return {boolean}
     */
    function neq(ctx, a, b) {
        return a !== b;
    }

    function lt(ctx, a, b) {
        return a < b;
    }

    function gt(ctx, a, b) {
        return a > b;
    }

    function lteq(ctx, a, b) {
        return a <= b;
    }

    function gteq(ctx, a, b) {
        return a >= b;
    }

    function eqCollate(ctx, a, b, c) {
        return c.compare(a, b) === 0;
    }

    function neqCollate(ctx, a, b, c) {
        return !eqCollate(ctx, a, b, c);
    }

    function ltCollate(ctx, a, b, c) {
        return c.compare(a, b) < 0;
    }

    function gtCollate(ctx, a, b, c) {
        return c.compare(a, b) > 0;
    }

    function lteqCollate(ctx, a, b, c) {
        return c.compare(a, b) <= 0;
    }

    function gteqCollate(ctx, a, b, c) {
        return c.compare(a, b) >= 0;
    }

    var expressions = {
        '==': makeComparison('==', eq, eqCollate),
        '!=': makeComparison('!=', neq, neqCollate),
        '>': makeComparison('>', gt, gtCollate),
        '<': makeComparison('<', lt, ltCollate),
        '>=': makeComparison('>=', gteq, gteqCollate),
        '<=': makeComparison('<=', lteq, lteqCollate),
        'array': Assertion,
        'at': At,
        'boolean': Assertion,
        'case': Case,
        'coalesce': Coalesce,
        'collator': CollatorExpression,
        'format': FormatExpression,
        'index-of': IndexOf,
        'interpolate': Interpolate,
        'interpolate-hcl': Interpolate,
        'interpolate-lab': Interpolate,
        'length': Length,
        'let': Let,
        'literal': Literal,
        'match': Match,
        'number': Assertion,
        'number-format': NumberFormat,
        'object': Assertion,
        'step': Step,
        'string': Assertion,
        'to-boolean': Coercion,
        'to-color': Coercion,
        'to-number': Coercion,
        'to-string': Coercion,
        'var': Var
    };

    for (var name$1 in expressions) {
        if ((expressions[name$1])._classRegistryKey) {
            continue;
        }
        dataTransfer.register(("Expression_" + name$1), expressions[name$1]);
    }


    exports.expressions = expressions;

    /**
     * 是否是表达式
     * @private
     * @ignore
     * @param expression
     * @return {boolean}
     */
    function isExpression(expression) {
        return Array.isArray(expression) && expression.length > 0 && typeof expression[0] === 'string' && expression[0] in expressions;
    }

    exports.isExpression = isExpression;
});