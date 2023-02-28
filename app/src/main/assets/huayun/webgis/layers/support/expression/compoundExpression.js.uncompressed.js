define("com/huayun/webgis/layers/support/expression/compoundExpression", [
    "exports",
    "./types",
    "./expressions",
    "../style/styleUtils",
    "../style/parsingContext",
    "../../../utils/Color",
    "../../../gl/dataTransfer"
], function (exports, types, expressions, styleUtils, parsingContext, Color, dataTransfer) {

    function isStateConstant(e) {
        if (e instanceof CompoundExpression) {
            if (e.name === 'feature-state') {
                return false;
            }
        }
        var result = true;
        e.eachChild(function (arg) {
            if (result && !isStateConstant(arg)) {
                result = false;
            }
        });
        return result;
    }

    exports.isStateConstant = isStateConstant;


    function stringifySignature(signature) {
        if (Array.isArray(signature)) {
            return "(" + (signature.map(styleUtils.toString).join(', ')) + ")";
        } else {
            return "(" + (styleUtils.toString(signature.type)) + "...)";
        }
    }

    /**
     * 复合表达式
     * @private
     * @ignore
     * @param name
     * @param type
     * @param evaluate
     * @param args
     * @constructor
     */
    var CompoundExpression = function CompoundExpression(name, type, evaluate, args) {
        this.name = name;
        this.type = type;
        this._evaluate = evaluate;
        this.args = args;
    };

    CompoundExpression.prototype.evaluate = function (ctx) {
        return this._evaluate(ctx, this.args);
    };

    CompoundExpression.prototype.eachChild = function (fn) {
        this.args.forEach(fn);
    };

    CompoundExpression.prototype.possibleOutputs = function () {
        return [undefined];
    };

    CompoundExpression.prototype.serialize = function () {
        return [this.name].concat(this.args.map(function (arg) {
            return arg.serialize();
        }));
    };

    CompoundExpression.parse = function (args, context) {
        var ref$1;
        var op = args[0];
        var definition = CompoundExpression.definitions[op];
        if (!definition) {
            return context.error(("Unknown expression \"" + op + "\". If you wanted a literal array, use [\"literal\", [...]]."), 0);
        }

        var type = Array.isArray(definition) ? definition[0] : definition.type;

        var availableOverloads = Array.isArray(definition) ? [[definition[1], definition[2]]] : definition.overloads;

        var overloads = availableOverloads.filter(function (ref) {
            var signature = ref[0];
            return !Array.isArray(signature) || signature.length === args.length - 1;
        });

        var signatureContext = null;
        for (var i$3 = 0, list = overloads; i$3 < list.length; i$3 += 1) {
            var ref = list[i$3];
            var params = ref[0];
            var evaluate = ref[1];

            signatureContext = new parsingContext.ParsingContext(context.registry, context.path, null, context.scope);

            var parsedArgs = [];
            var argParseFailed = false;
            for (var i = 1; i < args.length; i++) {
                var arg = args[i];
                var expectedType = Array.isArray(params) ? params[i - 1] : params.type;
                var parsed = signatureContext.parse(arg, 1 + parsedArgs.length, expectedType);
                if (!parsed) {
                    argParseFailed = true;
                    break;
                }
                parsedArgs.push(parsed);
            }
            if (argParseFailed) {
                continue;
            }

            if (Array.isArray(params)) {
                if (params.length !== parsedArgs.length) {
                    signatureContext.error(("Expected " + (params.length) + " arguments, but found " + (parsedArgs.length) + " instead."));
                    continue;
                }
            }

            for (var i$1 = 0; i$1 < parsedArgs.length; i$1++) {
                var expected = Array.isArray(params) ? params[i$1] : params.type;
                var arg$1 = parsedArgs[i$1];
                signatureContext.concat(i$1 + 1).checkSubtype(expected, arg$1.type);
            }

            if (signatureContext.errors.length === 0) {
                return new CompoundExpression(op, type, evaluate, parsedArgs);
            }
        }

        if (overloads.length === 1) {
            (ref$1 = context.errors).push.apply(ref$1, signatureContext.errors);
        } else {
            var expected$1 = overloads.length ? overloads : availableOverloads;
            var signatures = expected$1.map(function (ref) {
                var params = ref[0];
                return stringifySignature(params);
            }).join(' | ');

            var actualTypes = [];
            for (var i$2 = 1; i$2 < args.length; i$2++) {
                var parsed$1 = context.parse(args[i$2], 1 + actualTypes.length);
                if (!parsed$1) {
                    return null;
                }
                actualTypes.push(styleUtils.toString(parsed$1.type));
            }
            context.error(("Expected arguments of type " + signatures + ", but found (" + (actualTypes.join(', ')) + ") instead."));
        }
        return null;
    };

    CompoundExpression.register = function (registry, definitions) {
        CompoundExpression.definitions = definitions;
        for (var name in definitions) {
            registry[name] = CompoundExpression;
        }
    };

    function get(key, obj) {
        var v = obj[key];
        return typeof v === 'undefined' ? null : v;
    }

    function has(key, obj) {
        return key in obj;
    }

    function rgba(ctx, ref) {
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var a = ref[3];

        r = r.evaluate(ctx);
        g = g.evaluate(ctx);
        b = b.evaluate(ctx);

        var alpha = a ? a.evaluate(ctx) : 1;
        return new Color(r / 255 * alpha, g / 255 * alpha, b / 255 * alpha, alpha);
    }

    function binarySearch(v, a, i, j) {
        while (i <= j) {
            var m = (i + j) >> 1;
            if (a[m] === v) {
                return true;
            }
            if (a[m] > v) {
                j = m - 1;
            } else {
                i = m + 1;
            }
        }
        return false;
    }

    CompoundExpression.register(expressions.expressions, {
        'error': [
            {kind: 'error'},
            [{kind: 'string'}],
            function (ctx, ref) {
                var v = ref[0];
                throw new Error(v.evaluate(ctx));
            }
        ],
        'typeof': [
            {kind: 'string'},
            [{kind: 'value'}],
            function (ctx, ref) {
                var v = ref[0];
                return styleUtils.toString(styleUtils.typeOf(v.evaluate(ctx)));
            }
        ],
        'to-rgba': [
            {
                kind: 'array',
                itemType: {kind: 'number'},
                N: 4
            },
            [{kind: "color"}],
            function (ctx, ref) {
                var v = ref[0];
                return v.evaluate(ctx).toArray();
            }
        ],
        'rgb': [
            {kind: "color"},
            [{kind: 'number'}, {kind: 'number'}, {kind: 'number'}],
            rgba
        ],
        'rgba': [
            {kind: "color"},
            [{kind: 'number'}, {kind: 'number'}, {kind: 'number'}, {kind: 'number'}],
            rgba
        ],
        'has': {
            type: {kind: 'boolean'},
            overloads: [
                [
                    [{kind: 'string'}],
                    function (ctx, ref) {
                        var key = ref[0];
                        return has(key.evaluate(ctx), ctx.properties());
                    }
                ], [
                    [{kind: 'string'}, {kind: 'object'}],
                    function (ctx, ref) {
                        var key = ref[0];
                        var obj = ref[1];
                        return has(key.evaluate(ctx), obj.evaluate(ctx));
                    }
                ]
            ]
        },
        'get': {
            type: {kind: 'value'},
            overloads: [
                [
                    [{kind: 'string'}],
                    function (ctx, ref) {
                        var key = ref[0];
                        return get(key.evaluate(ctx), ctx.properties());
                    }
                ], [
                    [{kind: 'string'}, {kind: 'object'}],
                    function (ctx, ref) {
                        var key = ref[0];
                        var obj = ref[1];
                        return get(key.evaluate(ctx), obj.evaluate(ctx));
                    }
                ]
            ]
        },
        'feature-state': [
            types.ValueType,
            [types.StringType],
            function (ctx, ref) {
                var key = ref[0];
                return get(key.evaluate(ctx), ctx.featureState || {});
            }
        ],
        'properties': [
            types.ObjectType,
            [],
            function (ctx) {
                return ctx.properties();
            }
        ],
        'geometry-type': [
            types.StringType,
            [],
            function (ctx) {
                return ctx.geometryType();
            }
        ],
        'id': [
            types.ValueType,
            [],
            function (ctx) {
                return ctx.id();
            }
        ],
        'zoom': [
            {kind: 'number'},
            [],
            function (ctx) {
                return ctx.globals.zoom;
            }
        ],
        'heatmap-density': [
            {kind: 'number'},
            [],
            function (ctx) {
                return ctx.globals.heatmapDensity || 0;
            }
        ],
        'line-progress': [
            types.NumberType,
            [],
            function (ctx) {
                return ctx.globals.lineProgress || 0;
            }
        ],
        'accumulated': [
            types.ValueType,
            [],
            function (ctx) {
                return ctx.globals.accumulated === undefined ? null : ctx.globals.accumulated;
            }
        ],
        '+': [
            {kind: 'number'},
            {type: {kind: 'number'}},
            function (ctx, args) {
                var result = 0;
                for (var i = 0, list = args; i < list.length; i += 1) {
                    var arg = list[i];
                    result += arg.evaluate(ctx);
                }
                return result;
            }
        ],
        '*': [
            {kind: 'number'},
            {type: {kind: 'number'}},
            function (ctx, args) {
                var result = 1;
                for (var i = 0, list = args; i < list.length; i += 1) {
                    var arg = list[i];
                    result *= arg.evaluate(ctx);
                }
                return result;
            }
        ],
        '-': {
            type: {kind: 'number'},
            overloads: [
                [
                    [{kind: 'number'}, {kind: 'number'}],
                    function (ctx, ref) {
                        var a = ref[0];
                        var b = ref[1];
                        return a.evaluate(ctx) - b.evaluate(ctx);
                    }
                ], [
                    [{kind: 'number'}],
                    function (ctx, ref) {
                        var a = ref[0];
                        return -a.evaluate(ctx);
                    }
                ]
            ]
        },
        '/': [
            {kind: 'number'},
            [{kind: 'number'}, {kind: 'number'}],
            function (ctx, ref) {
                var a = ref[0];
                var b = ref[1];
                return a.evaluate(ctx) / b.evaluate(ctx);
            }
        ],
        '%': [
            {kind: 'number'},
            [{kind: 'number'}, {kind: 'number'}],
            function (ctx, ref) {
                var a = ref[0];
                var b = ref[1];
                return a.evaluate(ctx) % b.evaluate(ctx);
            }
        ],
        'ln2': [
            types.NumberType,
            [],
            function () {
                return Math.LN2;
            }
        ],
        'pi': [
            types.NumberType,
            [],
            function () {
                return Math.PI;
            }
        ],
        'e': [
            types.NumberType,
            [],
            function () {
                return Math.E;
            }
        ],
        '^': [
            types.NumberType,
            [types.NumberType, types.NumberType],
            function (ctx, ref) {
                var b = ref[0];
                var e = ref[1];
                return Math.pow(b.evaluate(ctx), e.evaluate(ctx));
            }
        ],
        'sqrt': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var x = ref[0];
                return Math.sqrt(x.evaluate(ctx));
            }
        ],
        'log10': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                return Math.log(n.evaluate(ctx)) / Math.LN10;
            }
        ],
        'ln': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                return Math.log(n.evaluate(ctx));
            }
        ],
        'log2': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                return Math.log(n.evaluate(ctx)) / Math.LN2;
            }
        ],
        'sin': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                return Math.sin(n.evaluate(ctx));
            }
        ],
        'cos': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                return Math.cos(n.evaluate(ctx));
            }
        ],
        'tan': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                return Math.tan(n.evaluate(ctx));
            }
        ],
        'asin': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                return Math.asin(n.evaluate(ctx));
            }
        ],
        'acos': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                return Math.acos(n.evaluate(ctx));
            }
        ],
        'atan': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                return Math.atan(n.evaluate(ctx));
            }
        ],
        'min': [
            types.NumberType,
            {type: types.NumberType},
            function (ctx, args) {
                return Math.min.apply(Math, args.map(function (arg) {
                    return arg.evaluate(ctx);
                }));
            }
        ],
        'max': [
            types.NumberType,
            {type: types.NumberType},
            function (ctx, args) {
                return Math.max.apply(Math, args.map(function (arg) {
                    return arg.evaluate(ctx);
                }));
            }
        ],
        'abs': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                return Math.abs(n.evaluate(ctx));
            }
        ],
        'round': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                var v = n.evaluate(ctx);
                return v < 0 ? -Math.round(-v) : Math.round(v);
            }
        ],
        'floor': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                return Math.floor(n.evaluate(ctx));
            }
        ],
        'ceil': [
            types.NumberType,
            [types.NumberType],
            function (ctx, ref) {
                var n = ref[0];
                return Math.ceil(n.evaluate(ctx));
            }
        ],
        'filter-==': [
            {kind: 'boolean'},
            [{kind: 'string'}, {kind: 'value'}],
            function (ctx, ref) {
                var k = ref[0];
                var v = ref[1];
                return ctx.properties()[k.value] === v.value;
            }
        ],
        'filter-id-==': [
            types.BooleanType,
            [types.ValueType],
            function (ctx, ref) {
                var v = ref[0];
                return ctx.id() === v.value;
            }
        ],
        'filter-type-==': [
            {kind: 'boolean'},
            [{kind: 'string'}],
            function (ctx, ref) {
                var v = ref[0];
                return ctx.geometryType() === v.value;
            }
        ],
        'filter-<': [
            {kind: 'boolean'},
            [{kind: 'string'}, {kind: 'value'}],
            function (ctx, ref) {
                var k = ref[0];
                var v = ref[1];
                var a = ctx.properties()[k.value];
                var b = v.value;
                return typeof a === typeof b && a < b;
            }
        ],
        'filter-id-<': [
            types.BooleanType,
            [types.ValueType],
            function (ctx, ref) {
                var v = ref[0];
                var a = ctx.id();
                var b = v.value;
                return typeof a === typeof b && a < b;
            }
        ],
        'filter->': [
            types.BooleanType,
            [types.StringType, types.ValueType],
            function (ctx, ref) {
                var k = ref[0];
                var v = ref[1];
                var a = ctx.properties()[k.value];
                var b = v.value;
                return typeof a === typeof b && a > b;
            }
        ],
        'filter-id->': [
            types.BooleanType,
            [types.ValueType],
            function (ctx, ref) {
                var v = ref[0];
                var a = ctx.id();
                var b = v.value;
                return typeof a === typeof b && a > b;
            }
        ],
        'filter-<=': [
            {kind: 'boolean'},
            [{kind: 'string'}, {kind: 'value'}],
            function (ctx, ref) {
                var k = ref[0];
                var v = ref[1];
                var a = ctx.properties()[k.value];
                var b = v.value;
                return typeof a === typeof b && a <= b;
            }
        ],
        'filter-id-<=': [
            types.BooleanType,
            [types.ValueType],
            function (ctx, ref) {
                var v = ref[0];
                var a = ctx.id();
                var b = v.value;
                return typeof a === typeof b && a <= b;
            }
        ],
        'filter->=': [
            {kind: 'boolean'},
            [{kind: 'string'}, {kind: 'value'}],
            function (ctx, ref) {
                var k = ref[0];
                var v = ref[1];
                var a = ctx.properties()[k.value];
                var b = v.value;
                return typeof a === typeof b && a >= b;
            }
        ],
        'filter-id->=': [
            types.BooleanType,
            [types.ValueType],
            function (ctx, ref) {
                var v = ref[0];
                var a = ctx.id();
                var b = v.value;
                return typeof a === typeof b && a >= b;
            }
        ],
        'filter-has': [
            types.BooleanType,
            [types.ValueType],
            function (ctx, ref) {
                var k = ref[0];
                return k.value in ctx.properties();
            }
        ],
        'filter-has-id': [
            types.BooleanType,
            [],
            function (ctx) {
                return ctx.id() !== null;
            }
        ],
        'filter-type-in': [
            types.BooleanType,
            [{
                kind: 'array',
                itemType: types.StringType,
                N: undefined
            }],
            function (ctx, ref) {
                var v = ref[0];
                return v.value.indexOf(ctx.geometryType()) >= 0;
            }
        ],
        'filter-id-in': [
            types.BooleanType,
            [{
                kind: 'array',
                itemType: types.ValueType,
                N: undefined
            }],
            function (ctx, ref) {
                var v = ref[0];
                return v.value.indexOf(ctx.id()) >= 0;
            }
        ],
        'filter-in-small': [
            {kind: 'boolean'},
            [{kind: 'string'}, {
                kind: 'array',
                itemType: {kind: 'value'},
                N: undefined
            }],
            function (ctx, ref) {
                var k = ref[0];
                var v = ref[1];
                return v.value.indexOf(ctx.properties()[k.value]) >= 0;
            }
        ],
        'filter-in-large': [
            types.BooleanType,
            [types.StringType, {
                kind: 'array',
                itemType: types.ValueType,
                N: undefined
            }],
            function (ctx, ref) {
                var k = ref[0];
                var v = ref[1];
                return binarySearch(ctx.properties()[k.value], v.value, 0, v.value.length - 1);
            }
        ],
        'all': {
            type: {kind: 'boolean'},
            overloads: [
                [
                    [{kind: 'boolean'}, {kind: 'boolean'}],
                    function (ctx, ref) {
                        var a = ref[0];
                        var b = ref[1];
                        return a.evaluate(ctx) && b.evaluate(ctx);
                    }
                ],
                [
                    {type: {kind: 'boolean'}},
                    function (ctx, args) {
                        for (var i = 0, list = args; i < list.length; i += 1) {
                            var arg = list[i];
                            if (!arg.evaluate(ctx)) {
                                return false;
                            }
                        }
                        return true;
                    }
                ]
            ]
        },
        'any': {
            type: {kind: 'boolean'},
            overloads: [
                [
                    [{kind: 'boolean'}, {kind: 'boolean'}],
                    function (ctx, ref) {
                        var a = ref[0];
                        var b = ref[1];
                        return a.evaluate(ctx) || b.evaluate(ctx);
                    }
                ],
                [
                    {type: {kind: 'boolean'}},
                    function (ctx, args) {
                        for (var i = 0, list = args; i < list.length; i += 1) {
                            var arg = list[i];
                            if (arg.evaluate(ctx)) {
                                return true;
                            }
                        }
                        return false;
                    }
                ]
            ]
        },
        '!': [
            {kind: 'boolean'},
            [{kind: 'boolean'}],
            function (ctx, ref) {
                var b = ref[0];
                return !b.evaluate(ctx);
            }
        ],
        'is-supported-script': [
            types.BooleanType,
            [types.StringType],
            function (ctx, ref) {
                var s = ref[0];
                var isSupportedScript = ctx.globals && ctx.globals.isSupportedScript;
                if (isSupportedScript) {
                    return isSupportedScript(s.evaluate(ctx));
                }
                return true;
            }
        ],
        'upcase': [
            types.StringType,
            [types.StringType],
            function (ctx, ref) {
                var s = ref[0];
                return s.evaluate(ctx).toUpperCase();
            }
        ],
        'downcase': [
            types.StringType,
            [types.StringType],
            function (ctx, ref) {
                var s = ref[0];
                return s.evaluate(ctx).toLowerCase();
            }
        ],
        'concat': [
            types.StringType,
            {type: types.ValueType},
            function (ctx, args) {
                return args.map(function (arg) {
                    return styleUtils.toString$1(arg.evaluate(ctx));
                }).join('');
            }
        ],
        'resolved-locale': [
            types.StringType,
            [types.CollatorType],
            function (ctx, ref) {
                var collator = ref[0];
                return collator.evaluate(ctx).resolvedLocale();
            }
        ]
    });
    dataTransfer.register('CompoundExpression', CompoundExpression, {omit: ['_evaluate']});

    exports.CompoundExpression = CompoundExpression;

    /**
     * 是否全局属性常量, 如层级属性
     * @private
     * @ignore
     * @param e
     * @param properties
     * @return {boolean}
     */
    function isGlobalPropertyConstant(e, properties) {
        if (e instanceof CompoundExpression && properties.indexOf(e.name) >= 0) {
            return false;
        }
        var result = true;
        e.eachChild(function (arg) {
            if (result && !isGlobalPropertyConstant(arg, properties)) {
                result = false;
            }
        });
        return result;
    }

    exports.isGlobalPropertyConstant = isGlobalPropertyConstant;

    /**
     * 是否是特性常量
     * @private
     * @ignore
     * @param e
     * @return {boolean}
     */
    function isFeatureConstant(e) {
        if (e instanceof CompoundExpression) {
            if (e.name === 'get' && e.args.length === 1) {
                return false;
            } else if (e.name === 'feature-state') {
                return false;
            } else if (e.name === 'has' && e.args.length === 1) {
                return false;
            } else if (e.name === 'properties' || e.name === 'geometry-type' || e.name === 'id') {
                return false;
            } else if (/^filter-/.test(e.name)) {
                return false;
            }
        }
        var result = true;
        e.eachChild(function (arg) {
            if (result && !isFeatureConstant(arg)) {
                result = false;
            }
        });
        return result;
    }

    exports.isFeatureConstant = isFeatureConstant;
});