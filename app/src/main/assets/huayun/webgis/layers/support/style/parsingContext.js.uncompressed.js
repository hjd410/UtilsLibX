/**
 * 生成表达式解析上下文, 由于与expressions相互依赖, 为解决循环依赖的问题, 采用exports导出, 而不是直接返回ParsingContext类
 */
define("com/huayun/webgis/layers/support/style/parsingContext", [
    "exports",
    "./Scope",
    "./ParsingError",
    "./EvaluationContext",
    "./styleUtils",
    "../expression/Assertion",
    "../expression/Coercion",
    "../expression/Literal",
    "../expression/Var",
    "../expression/compoundExpression",
    "../expression/CollatorExpression"
], function (exports, Scope, ParsingError, EvaluationContext, styleUtils, Assertion, Coercion, Literal, Var, compoundExpression, CollatorExpression) {

    /**
     * 是否常量表达式
     * @private
     * @ignore
     * @param expression
     * @return {boolean|boolean|*}
     */
    function isConstant(expression) {
        if (expression instanceof Var) {
            return isConstant(expression.boundExpression);
        } else if (expression instanceof compoundExpression.CompoundExpression && expression.name === 'error') {
            return false;
        } else if (expression instanceof CollatorExpression) {
            return false;
        }
        var isTypeAnnotation = expression instanceof Coercion || expression instanceof Assertion;
        var childrenConstant = true;

        expression.eachChild(function (child) {
            if (isTypeAnnotation) {
                childrenConstant = childrenConstant && isConstant(child);
            } else {
                childrenConstant = childrenConstant && child instanceof Literal;
            }
        });
        if (!childrenConstant) {
            return false;
        }
        return compoundExpression.isFeatureConstant(expression) && compoundExpression.isGlobalPropertyConstant(expression, ['zoom', 'heatmap-density', 'line-progress', 'accumulated', 'is-supported-script']);
    }

    function annotate(parsed, type, typeAnnotation) {
        if (typeAnnotation === 'assert') {
            return new Assertion(type, [parsed]);
        } else if (typeAnnotation === 'coerce') {
            return new Coercion(type, [parsed]);
        } else {
            return parsed;
        }
    }

    /**
     * 解析表达式的上下文
     * @private
     * @ignore
     * @param registry
     * @param path
     * @param expectedType
     * @param scope
     * @param errors
     * @constructor
     */
    var ParsingContext = function ParsingContext(registry, path, expectedType, scope, errors) {
        if (path === void 0) path = [];
        if (scope === void 0) scope = new Scope();
        if (errors === void 0) errors = [];

        this.registry = registry;
        this.path = path;
        this.key = path.map(function (part) {
            return ("[" + part + "]");
        }).join('');
        this.scope = scope;
        this.errors = errors;
        this.expectedType = expectedType;
    };

    /**
     * 解析表达式
     * 表达式的格式为 [expression_name, argument_0, argument_1, ...]
     * expression_name是表达式运算符,
     * 参数argument可以是文字(数字, 字符串或布尔值), 也可以是其他表达式
     * @param expr 待解析的JSON格式表达式
     * @param index 若此表达式是正在解析的父表达式的参数, 则为可选参数索引
     * @param expectedType 返回类型
     * @param bindings
     * @param options
     * @param options.omitTypeAnnotations 设为true可忽略类型推断注解
     * @return {*}
     */
    ParsingContext.prototype.parse = function parse(expr, index, expectedType, bindings, options) {
        if (options === void 0) options = {};
        if (index) {
            return this.concat(index, expectedType, bindings)._parse(expr, options);
        }
        return this._parse(expr, options);
    };

    ParsingContext.prototype.concat = function concat(index, expectedType, bindings) {
        var path = typeof index === 'number' ? this.path.concat(index) : this.path;
        var scope = bindings ? this.scope.concat(bindings) : this.scope;
        return new ParsingContext(this.registry, path, expectedType || null, scope, this.errors);
    };

    ParsingContext.prototype._parse = function _parse(expr, options) {
        if (expr === null || typeof expr === 'string' || typeof expr === 'boolean' || typeof expr === 'number') {
            expr = ['literal', expr];
        }

        if (Array.isArray(expr)) {
            if (expr.length === 0) {
                return this.error("Expected an array with at least one element. If you wanted a literal array, use [\"literal\", []].");
            }

            var op = expr[0]; // 第一个必须是表达式运算符
            if (typeof op !== 'string') {
                this.error("Expression name must be a string, but found " + (typeof op) + " instead. If you wanted a literal array, use [\"literal\", [...]].", 0);
                return null;
            }

            var Expr = this.registry[op]; // 根据运算符查找对应的表达式
            if (Expr) {
                var parsed = Expr.parse(expr, this);
                if (!parsed) {
                    return null;
                }
                if (this.expectedType) {
                    var expected = this.expectedType;
                    var actual = parsed.type;
                    if ((expected.kind === 'string' || expected.kind === 'number' || expected.kind === 'boolean' || expected.kind === 'object' || expected.kind === 'array') && actual.kind === 'value') {
                        parsed = annotate(parsed, expected, options.typeAnnotation || 'assert');
                    } else if ((expected.kind === 'color' || expected.kind === 'formatted') && (actual.kind === 'value' || actual.kind === 'string')) {
                        parsed = annotate(parsed, expected, options.typeAnnotation || 'coerce');
                    } else if (this.checkSubtype(expected, actual)) {
                        return null;
                    }
                }

                // 如果一个表达式的参数都是文字(数字, 字符串, 布尔值), 可直接计算出结果, 替换原来的参数
                if (!(parsed instanceof Literal) && isConstant(parsed)) {
                    var ec = new EvaluationContext();
                    try {
                        parsed = new Literal(parsed.type, parsed.evaluate(ec));
                    } catch (e) {
                        this.error(e.message);
                        return null;
                    }
                }
                return parsed;
            }
            return this.error(("Unknown expression \"" + op + "\". If you wanted a literal array, use [\"literal\", [...]]."), 0);
        } else if (typeof expr === 'undefined') {
            return this.error("'undefined' value invalid. Use null instead.");
        } else if (typeof expr === 'object') {
            return this.error("Bare objects invalid. Use [\"literal\", {...}] instead.");
        } else {
            return this.error("Expected an array, but found " + (typeof expr) + " instead.");
        }
    };

    ParsingContext.prototype.error = function (error$1) {
        var keys = [], len = arguments.length - 1;
        while (len-- > 0) keys[len] = arguments[len + 1];
        var key = "" + this.key + (keys.map(function (k) {
            return ("[" + k + "]");
        }).join(''));
        this.errors.push(new ParsingError(key, error$1));
    };

    /**
     * 如果t是expected的子类型, 则返回null, 否则返回一个错误信息
     * @param expected
     * @param t
     * @return {string}
     */
    ParsingContext.prototype.checkSubtype = function (expected, t) {
        var error = styleUtils.checkSubtype(expected, t);
        if (error) {
            this.error(error);
        }
        return error;
    };

    exports.ParsingContext = ParsingContext;
});