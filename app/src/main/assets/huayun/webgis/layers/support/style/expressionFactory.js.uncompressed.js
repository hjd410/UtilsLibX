/**
 * 创建表达式
 */
define("com/huayun/webgis/layers/support/style/expressionFactory", [
    "exports",
    "./parsingContext",
    "./ParsingError",
    "./StyleExpression",
    "./styleUtils",
    "../expression/Interpolate",
    "../expression/Coalesce",
    "../expression/Let",
    "../expression/Step",
    "../expression/expressions",
    "../expression/compoundExpression",
    "../expression/ZoomDependentExpression",
    "../expression/ZoomConstantExpression"
], function (exports, parsingContext, ParsingError, StyleExpression, styleUtils, Interpolate, Coalesce, Let, Step, expressions, compoundExpression, ZoomDependentExpression, ZoomConstantExpression) {

    var types = {
        color: {kind: 'color'},
        string: {kind: 'string'},
        number: {kind: 'number'},
        enum: {kind: 'string'},
        boolean: {kind: 'boolean'},
        formatted: {kind: 'formatted'}
    };

    /**
     * 获取表达式要生成的数据类型
     * @private
     * @ignore
     * @param spec
     * @return {{itemType: (*|{kind: string}), kind: string, N: *}|*}
     */
    function getExpectedType(spec) {
        if (spec.type === 'array') {
            return {
                kind: 'array',
                itemType: types[spec.value] || {kind: 'value'},
                N: spec.length
            };
        }
        return types[spec.type];
    }

    /**
     * 层级依赖表达式可能使用["zoom"]作为"step"和"interpolate"表达式的顶层输入(统称为"curve"), 这个curve可以封装在一个或多个"let"或"coalesce"表达式中
     * @private
     * @ignore
     * @param expression
     * @return {null}
     */
    function findZoomCurve(expression) {
        var result = null;
        if (expression instanceof Let) {
            result = findZoomCurve(expression.result);
        } else if (expression instanceof Coalesce) {
            for (var i = 0, list = expression.args; i < list.length; i += 1) {
                var arg = list[i];
                result = findZoomCurve(arg);
                if (result) {
                    break;
                }
            }
        } else if ((expression instanceof Step || expression instanceof Interpolate)
            && expression.input instanceof compoundExpression.CompoundExpression
            && expression.input.name === 'zoom') {
            result = expression;
        }

        expression.eachChild(function (child) {
            var childResult = findZoomCurve(child);
            if (childResult instanceof ParsingError) {
                result = childResult;
            } else if (!result && childResult) {
                result = new ParsingError('', '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.');
            } else if (result && childResult && result !== childResult) {
                result = new ParsingError('', 'Only one zoom-based "step" or "interpolate" subexpression may be used in an expression.');
            }
        });
        return result;
    }

    /**
     * 创建表达式
     * @private
     * @ignore
     * @param expression
     * @param propertySpec
     * @return {*}
     */
    function createExpression(expression, propertySpec) {
        var parser = new parsingContext.ParsingContext(expressions.expressions, [], propertySpec ? getExpectedType(propertySpec) : undefined);
        var parsed = parser.parse(expression, undefined, undefined, undefined,
            propertySpec && propertySpec.type === 'string' ? {typeAnnotation: 'coerce'} : undefined);
        if (!parsed) {
            return {
                result: 'error',
                value: parser.errors
            };
        }
        return {
            result: 'success',
            value: new StyleExpression(parsed, propertySpec)
        };
    }

    exports.createExpression = createExpression;


    /**
     * 创建属性表达式
     * @private
     * @ignore
     * @param expression
     * @param propertySpec
     * @return {{result: string, value: *}|*}
     */
    function createPropertyExpression(expression, propertySpec) {
        expression = createExpression(expression, propertySpec);
        if (expression.result === 'error') {
            return expression;
        }
        var parsed = expression.value.expression;

        var isFeatureConstant$1 = compoundExpression.isFeatureConstant(parsed);
        if (!isFeatureConstant$1 && !styleUtils.supportsPropertyExpression(propertySpec)) {
            return {
                result: "error",
                value: [new ParsingError('', 'data expressions not supported')]
            };
        }

        var isZoomConstant = compoundExpression.isGlobalPropertyConstant(parsed, ['zoom']);
        if (!isZoomConstant && !styleUtils.supportsZoomExpression(propertySpec)) {
            return {
                result: "error",
                value: [new ParsingError('', 'zoom expressions not supported')]
            };
        }

        var zoomCurve = findZoomCurve(parsed);
        if (!zoomCurve && !isZoomConstant) {
            return {
                result: "error",
                value: [new ParsingError('', '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.')]
            }
        } else if (zoomCurve instanceof ParsingError) {
            return {
                result: "error",
                value: [zoomCurve]
            };
        } else if (zoomCurve instanceof Interpolate && !styleUtils.supportsInterpolation(propertySpec)) {
            return {
                result: "error",
                value: [new ParsingError('', '"interpolate" expressions cannot be used with this property')]
            };
        }

        if (!zoomCurve) {
            return {
                result: "success",
                value: isFeatureConstant$1 ? new ZoomConstantExpression('constant', expression.value) : new ZoomConstantExpression('source', expression.value)
            };
        }

        return {
            result: "success",
            value: isFeatureConstant$1 ? new ZoomDependentExpression('camera', expression.value, zoomCurve) : new ZoomDependentExpression('composite', expression.value, zoomCurve)
        };
    }

    exports.createPropertyExpression = createPropertyExpression;

    /**
     * 是否是表达式过滤函数
     * @private
     * @ignore
     * @param filter
     * @return {boolean}
     */
    function isExpressionFilter(filter) {
        if (filter === true || filter === false) {
            return true;
        }

        if (!Array.isArray(filter) || filter.length === 0) { // 必须是数组格式
            return false;
        }

        switch (filter[0]) {
            case 'has':
                return filter.length >= 2 && filter[1] !== '$id' && filter[1] !== '$type';
            case 'in':
            case '!in':
            case '!has':
            case 'none':
                return false;
            case '==':
            case '!=':
            case '>':
            case '>=':
            case '<':
            case '<=':
                return filter.length !== 3 || (Array.isArray(filter[1]) || Array.isArray(filter[2]));
            case 'any':
            case 'all':
                for (var i = 0, list = filter.slice(1); i < list.length; i += 1) {
                    var f = list[i];
                    if (!isExpressionFilter(f) && typeof f !== 'boolean') {
                        return false;
                    }
                }
                return true;
            default:
                return true;
        }
    }

    function convertComparisonOp(property, value, op) {
        switch (property) {
            case '$type':
                return [("filter-type-" + op), value];
            case '$id':
                return [("filter-id-" + op), value];
            default:
                return [("filter-" + op), property, value];
        }
    }

    function convertNegation(filter) {
        return ['!', filter];
    }

    function convertDisjunctionOp(filters) {
        return ['any'].concat(filters.map(convertFilter));
    }

    function compare(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    function convertInOp(property, values) {
        if (values.length === 0) {
            return false;
        }
        switch (property) {
            case '$type':
                return ["filter-type-in", ['literal', values]];
            case '$id':
                return ["filter-id-in", ['literal', values]];
            default:
                if (values.length > 200 && !values.some(function (v) {
                    return typeof v !== typeof values[0];
                })) {
                    return ['filter-in-large', property, ['literal', values.sort(compare)]];
                } else {
                    return ['filter-in-small', property, ['literal', values]];
                }
        }
    }

    function convertHasOp(property) {
        switch (property) {
            case '$type':
                return true;
            case '$id':
                return ["filter-has-id"];
            default:
                return ["filter-has", property];
        }
    }

    /**
     * 表达式转换成过滤函数
     * @private
     * @ignore
     * @param filter
     * @return {boolean|*|string[]}
     */
    function convertFilter(filter) {
        if (!filter) {
            return true;
        }
        var op = filter[0];
        if (filter.length <= 1) {
            return (op !== 'any');
        }
        var converted =
            op === '==' ? convertComparisonOp(filter[1], filter[2], '==') :
                op === '!=' ? convertNegation(convertComparisonOp(filter[1], filter[2], '==')) :
                    op === '<' || op === '>' || op === '<=' || op === '>=' ? convertComparisonOp(filter[1], filter[2], op) :
                        op === 'any' ? convertDisjunctionOp(filter.slice(1)) :
                            op === 'all' ? ['all'].concat(filter.slice(1).map(convertFilter)) :
                                op === 'none' ? ['all'].concat(filter.slice(1).map(convertFilter).map(convertNegation)) :
                                    op === 'in' ? convertInOp(filter[1], filter.slice(2)) :
                                        op === '!in' ? convertNegation(convertInOp(filter[1], filter.slice(2))) :
                                            op === 'has' ? convertHasOp(filter[1]) :
                                                op === '!has' ? convertNegation(convertHasOp(filter[1])) :
                                                    true;
        return converted;
    }

    var filterSpec = {
        'type': 'boolean',
        'default': false,
        'transition': false,
        'property-type': 'data-driven',
        'expression': {
            'interpolated': false,
            'parameters': ['zoom', 'feature']
        }
    };

    /**
     * 根据filter配置生成过滤函数
     * @private
     * @ignore
     * @param filter
     * @return {(function(): boolean)|(function(*=, *=): *)}
     */
    function createFilter(filter) {
        if (filter === null || filter === undefined) {
            return function () {
                return true;
            };
        }

        if (!isExpressionFilter(filter)) {
            filter = convertFilter(filter);
        }

        var compiled = createExpression(filter, filterSpec);
        if (compiled.result === 'error') {
            debugger;
            throw new Error(compiled.value.map(function (err) {
                return err.key + ": " + err.message;
            }).join(', '));
        } else {
            return function (globalProperties, feature) {
                return compiled.value.evaluate(globalProperties, feature);
            };
        }
    }

    exports.createFilter = createFilter;
});