define("com/huayun/webgis/layers/support/expression/definitions", [
    "exports"
], function (exports) {

    function makeComparison(op, compareBasic, compareWithCollator) {
        var isOrderComparison = op !== '==' && op !== '!=';

        return /*@__PURE__*/(function () {
            function Comparison(lhs, rhs, collator) {
                this.type = {kind: 'boolean'};
                this.lhs = lhs;
                this.rhs = rhs;
                this.collator = collator;
                this.hasUntypedArgument = lhs.type.kind === 'value' || rhs.type.kind === 'value';
            }

            Comparison.parse = function parse(args, context) {
                if (args.length !== 3 && args.length !== 4) {
                    return context.error("Expected two or three arguments.");
                }

                var op = (args[0]);

                var lhs = context.parse(args[1], 1, {kind: 'value'});
                if (!lhs) {
                    return null;
                }
                if (!isComparableType(op, lhs.type)) {
                    return context.concat(1).error(("\"" + op + "\" comparisons are not supported for type '" + (toString(lhs.type)) + "'."));
                }
                var rhs = context.parse(args[2], 2, {kind: 'value'});
                if (!rhs) {
                    return null;
                }
                if (!isComparableType(op, rhs.type)) {
                    return context.concat(2).error(("\"" + op + "\" comparisons are not supported for type '" + (toString(rhs.type)) + "'."));
                }

                if (
                    lhs.type.kind !== rhs.type.kind &&
                    lhs.type.kind !== 'value' &&
                    rhs.type.kind !== 'value'
                ) {
                    return context.error(("Cannot compare types '" + (toString(lhs.type)) + "' and '" + (toString(rhs.type)) + "'."));
                }

                if (isOrderComparison) {
                    // typing rules specific to less/greater than operators
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
                    if (
                        lhs.type.kind !== 'string' &&
                        rhs.type.kind !== 'string' &&
                        lhs.type.kind !== 'value' &&
                        rhs.type.kind !== 'value'
                    ) {
                        return context.error("Cannot use collator to compare non-string types.");
                    }
                    collator = context.parse(args[3], 3, CollatorType);
                    if (!collator) {
                        return null;
                    }
                }

                return new Comparison(lhs, rhs, collator);
            };

            Comparison.prototype.evaluate = function evaluate(ctx) {
                var lhs = this.lhs.evaluate(ctx);
                var rhs = this.rhs.evaluate(ctx);

                if (isOrderComparison && this.hasUntypedArgument) {
                    var lt = typeOf(lhs);
                    var rt = typeOf(rhs);
                    // check that type is string or number, and equal
                    if (lt.kind !== rt.kind || !(lt.kind === 'string' || lt.kind === 'number')) {
                        throw new RuntimeError(("Expected arguments for \"" + op + "\" to be (string, string) or (number, number), but found (" + (lt.kind) + ", " + (rt.kind) + ") instead."));
                    }
                }

                if (this.collator && !isOrderComparison && this.hasUntypedArgument) {
                    var lt$1 = typeOf(lhs);
                    var rt$1 = typeOf(rhs);
                    if (lt$1.kind !== 'string' || rt$1.kind !== 'string') {
                        return compareBasic(ctx, lhs, rhs);
                    }
                }

                return this.collator ?
                    compareWithCollator(ctx, lhs, rhs, this.collator.evaluate(ctx)) :
                    compareBasic(ctx, lhs, rhs);
            };

            Comparison.prototype.eachChild = function eachChild(fn) {
                fn(this.lhs);
                fn(this.rhs);
                if (this.collator) {
                    fn(this.collator);
                }
            };

            Comparison.prototype.possibleOutputs = function possibleOutputs() {
                return [true, false];
            };

            Comparison.prototype.serialize = function serialize() {
                var serialized = [op];
                this.eachChild(function (child) {
                    serialized.push(child.serialize());
                });
                return serialized;
            };

            return Comparison;
        }());
    }

    function eq(ctx, a, b) { return a === b; }
    function neq(ctx, a, b) { return a !== b; }
    function lt(ctx, a, b) { return a < b; }
    function gt(ctx, a, b) { return a > b; }
    function lteq(ctx, a, b) { return a <= b; }
    function gteq(ctx, a, b) { return a >= b; }

    function eqCollate(ctx, a, b, c) { return c.compare(a, b) === 0; }
    function neqCollate(ctx, a, b, c) { return !eqCollate(ctx, a, b, c); }
    function ltCollate(ctx, a, b, c) { return c.compare(a, b) < 0; }
    function gtCollate(ctx, a, b, c) { return c.compare(a, b) > 0; }
    function lteqCollate(ctx, a, b, c) { return c.compare(a, b) <= 0; }
    function gteqCollate(ctx, a, b, c) { return c.compare(a, b) >= 0; }

    exports.Equals = makeComparison('==', eq, eqCollate);
    exports.NotEquals = makeComparison('!=', neq, neqCollate);
    exports.LessThan = makeComparison('<', lt, ltCollate);
    exports.GreaterThan = makeComparison('>', gt, gtCollate);
    exports.LessThanOrEqual = makeComparison('<=', lteq, lteqCollate);
    exports.GreaterThanOrEqual = makeComparison('>=', gteq, gteqCollate);
});