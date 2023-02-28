define("com/huayun/webgis/layers/support/expressions", [
    "exports",
    "./expression/definitions",
    "./expression/Coercion",
    "../../utils/Color",
    "./Interpolate",
    "../../utils/utils",
    "../../utils/Constant",
    "../../gl/dataTransfer"
], function (exports, definitions, Coercion, Color, Interpolate, utils, Constant, dataTransfer) {
    // 本模块内部变量
    var geometryTypes = ['Unknown', 'Point', 'LineString', 'Polygon'];
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

    var valueMemberTypes = [
        {kind: 'null'},
        {kind: 'number'},
        {kind: 'string'},
        {kind: 'boolean'},
        {kind: 'color'},
        {kind: 'formatted'},
        {kind: 'object'},
        // array(ValueType)
        {
            kind: 'array',
            itemType: {kind: 'value'},
            N: undefined
        }
    ];

    function isValue(mixed) {
        if (mixed === null) {
            return true;
        } else if (typeof mixed === 'string') {
            return true;
        } else if (typeof mixed === 'boolean') {
            return true;
        } else if (typeof mixed === 'number') {
            return true;
        } else if (Array.isArray(mixed)) {
            for (var i = 0, list = mixed; i < list.length; i += 1) {
                var item = list[i];

                if (!isValue(item)) {
                    return false;
                }
            }
            return true;
        } else if (typeof mixed === 'object') {
            for (var key in mixed) {
                if (!isValue(mixed[key])) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }

    function typeOf(value) {
        if (value === null) {
            return {kind: 'null'};
        } else if (typeof value === 'string') {
            return {kind: 'string'};
        } else if (typeof value === 'boolean') {
            return {kind: 'boolean'};
        } else if (typeof value === 'number') {
            return {kind: 'number'};
        } else if (Array.isArray(value)) {
            var length = value.length;
            var itemType;

            for (var i = 0, list = value; i < list.length; i += 1) {
                var item = list[i];

                var t = typeOf(item);
                if (!itemType) {
                    itemType = t;
                } else if (itemType === t) {
                    continue;
                } else {
                    itemType = {kind: 'value'};
                    break;
                }
            }

            return array(itemType || {kind: 'value'}, length);
        } else {
            return {kind: 'object'};
        }
    }

    function array(itemType, N) {
        return {
            kind: 'array',
            itemType: itemType,
            N: N
        };
    }

    var Var = function Var(name, boundExpression) {
        this.type = boundExpression.type;
        this.name = name;
        this.boundExpression = boundExpression;
    };

    Var.parse = function parse(args, context) {
        if (args.length !== 2 || typeof args[1] !== 'string') {
            return context.error("'var' expression requires exactly one string literal argument.");
        }

        var name = args[1];
        if (!context.scope.has(name)) {
            return context.error(("Unknown variable \"" + name + "\". Make sure \"" + name + "\" has been bound in an enclosing \"let\" expression before using it."), 1);
        }

        return new Var(name, context.scope.get(name));
    };

    Var.prototype.evaluate = function evaluate(ctx) {
        return this.boundExpression.evaluate(ctx);
    };

    Var.prototype.eachChild = function eachChild() {
    };

    Var.prototype.possibleOutputs = function possibleOutputs() {
        return [undefined];
    };

    Var.prototype.serialize = function serialize() {
        return ["var", this.name];
    };

    var Collator = function Collator(caseSensitive, diacriticSensitive, locale) {
        if (caseSensitive) {
            this.sensitivity = diacriticSensitive ? 'variant' : 'case';
        } else {
            this.sensitivity = diacriticSensitive ? 'accent' : 'base';
        }

        this.locale = locale;
        this.collator = new Intl.Collator(this.locale ? this.locale : [],
            {sensitivity: this.sensitivity, usage: 'search'});
    };

    Collator.prototype.compare = function compare(lhs, rhs) {
        return this.collator.compare(lhs, rhs);
    };

    Collator.prototype.resolvedLocale = function resolvedLocale() {
        return new Intl.Collator(this.locale ? this.locale : []).resolvedOptions().locale;
    };

    var CollatorExpression = function CollatorExpression(caseSensitive, diacriticSensitive, locale) {
        this.type = CollatorType;
        this.locale = locale;
        this.caseSensitive = caseSensitive;
        this.diacriticSensitive = diacriticSensitive;
    };

    CollatorExpression.parse = function parse(args, context) {
        if (args.length !== 2) {
            return context.error("Expected one argument.");
        }

        var options = (args[1]);
        if (typeof options !== "object" || Array.isArray(options)) {
            return context.error("Collator options argument must be an object.");
        }

        var caseSensitive = context.parse(
            options['case-sensitive'] === undefined ? false : options['case-sensitive'], 1, BooleanType);
        if (!caseSensitive) {
            return null;
        }

        var diacriticSensitive = context.parse(
            options['diacritic-sensitive'] === undefined ? false : options['diacritic-sensitive'], 1, BooleanType);
        if (!diacriticSensitive) {
            return null;
        }

        var locale = null;
        if (options['locale']) {
            locale = context.parse(options['locale'], 1, StringType);
            if (!locale) {
                return null;
            }
        }

        return new CollatorExpression(caseSensitive, diacriticSensitive, locale);
    };

    CollatorExpression.prototype.evaluate = function evaluate(ctx) {
        return new Collator(this.caseSensitive.evaluate(ctx), this.diacriticSensitive.evaluate(ctx), this.locale ? this.locale.evaluate(ctx) : null);
    };

    CollatorExpression.prototype.eachChild = function eachChild(fn) {
        fn(this.caseSensitive);
        fn(this.diacriticSensitive);
        if (this.locale) {
            fn(this.locale);
        }
    };

    CollatorExpression.prototype.possibleOutputs = function possibleOutputs() {
        // Technically the set of possible outputs is the combinatoric set of Collators produced
        // by all possibleOutputs of locale/caseSensitive/diacriticSensitive
        // But for the primary use of Collators in comparison operators, we ignore the Collator's
        // possibleOutputs anyway, so we can get away with leaving this undefined for now.
        return [undefined];
    };

    CollatorExpression.prototype.serialize = function serialize() {
        var options = {};
        options['case-sensitive'] = this.caseSensitive.serialize();
        options['diacritic-sensitive'] = this.diacriticSensitive.serialize();
        if (this.locale) {
            options['locale'] = this.locale.serialize();
        }
        return ["collator", options];
    };

    function isFeatureConstant(e) {
        if (e instanceof CompoundExpression) {
            if (e.name === 'get' && e.args.length === 1) {
                return false;
            } else if (e.name === 'feature-state') {
                return false;
            } else if (e.name === 'has' && e.args.length === 1) {
                return false;
            } else if (
                e.name === 'properties' ||
                e.name === 'geometry-type' ||
                e.name === 'id'
            ) {
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

    function isConstant(expression) {
        if (expression instanceof Var) {
            return isConstant(expression.boundExpression);
        } else if (expression instanceof CompoundExpression && expression.name === 'error') {
            return false;
        } else if (expression instanceof CollatorExpression) {
            // Although the results of a Collator expression with fixed arguments
            // generally shouldn't change between executions, we can't serialize them
            // as constant expressions because results change based on environment.
            return false;
        }

        var isTypeAnnotation = false;

        var childrenConstant = true;
        expression.eachChild(function (child) {
            // We can _almost_ assume that if `expressions` children are constant,
            // they would already have been evaluated to Literal values when they
            // were parsed.  Type annotations are the exception, because they might
            // have been inferred and added after a child was parsed.

            // So we recurse into isConstant() for the children of type annotations,
            // but otherwise simply check whether they are Literals.
            if (isTypeAnnotation) {
                childrenConstant = childrenConstant && isConstant(child);
            } else {
                childrenConstant = childrenConstant && child instanceof Literal;
            }
        });
        if (!childrenConstant) {
            return false;
        }

        return isFeatureConstant(expression) &&
            isGlobalPropertyConstant(expression, ['zoom', 'heatmap-density', 'line-progress', 'accumulated', 'is-supported-script']);
    }

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

    function checkSubtype(expected, t) {
        // debugger;
        if (t.kind === 'error') {
            // Error is a subtype of every type
            return null;
        } else if (expected.kind === 'array') {
            if (t.kind === 'array' &&
                ((t.N === 0 && t.itemType.kind === 'value') || !checkSubtype(expected.itemType, t.itemType)) &&
                (typeof expected.N !== 'number' || expected.N === t.N)) {
                return null;
            }
        } else if (expected.kind === t.kind) {
            return null;
        } else if (expected.kind === 'value') {
            for (var i = 0, list = valueMemberTypes; i < list.length; i += 1) {
                var memberType = list[i];

                if (!checkSubtype(memberType, t)) {
                    return null;
                }
            }
        }

        return ("Expected " + (toString(expected)) + " but found " + (toString(t)) + " instead.");
    }

    var Literal = function Literal(type, value) {
        this.type = type;
        this.value = value;
    };

    Literal.parse = function parse(args, context) {
        if (args.length !== 2) {
            return context.error(("'literal' expression requires exactly one argument, but found " + (args.length - 1) + " instead."));
        }

        if (!isValue(args[1])) {
            return context.error("invalid value");
        }

        var value = (args[1]);
        var type = typeOf(value);

        // special case: infer the item type if possible for zero-length arrays
        var expected = context.expectedType;
        if (type.kind === 'array' && type.N === 0 && expected && expected.kind === 'array' && (typeof expected.N !== 'number' || expected.N === 0)) {
            type = expected;
        }

        return new Literal(type, value);
    };

    Literal.prototype.evaluate = function evaluate() {
        return this.value;
    };

    Literal.prototype.eachChild = function eachChild() {
    };

    Literal.prototype.possibleOutputs = function possibleOutputs() {
        return [this.value];
    };

    Literal.prototype.serialize = function serialize() {
        if (this.type.kind === 'array' || this.type.kind === 'object') {
            return ["literal", this.value];
        } else {
            return (this.value);
        }
    };

    dataTransfer.register("Literal ", Literal);

    var Let = function Let(bindings, result) {
        this.type = result.type;
        this.bindings = [].concat(bindings);
        this.result = result;
    };

    Let.prototype.evaluate = function evaluate(ctx) {
        return this.result.evaluate(ctx);
    };

    Let.prototype.eachChild = function eachChild(fn) {
        for (var i = 0, list = this.bindings; i < list.length; i += 1) {
            var binding = list[i];

            fn(binding[1]);
        }
        fn(this.result);
    };

    Let.parse = function parse(args, context) {
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

    Let.prototype.possibleOutputs = function possibleOutputs() {
        return this.result.possibleOutputs();
    };

    Let.prototype.serialize = function serialize() {
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

    var Assertion = function Assertion(type, args) {
        this.type = type;
        this.args = args;
    };

    Assertion.parse = function parse(args, context) {
        if (args.length < 2) {
            return context.error("Expected at least one argument.");
        }

        var i = 1;
        var type;

        var name = (args[0]);
        if (name === 'array') {
            var itemType;
            if (args.length > 2) {
                var type$1 = args[1];
                if (typeof type$1 !== 'string' || !(type$1 in types) || type$1 === 'object') {
                    return context.error('The item type argument of "array" must be one of string, number, boolean', 1);
                }
                itemType = Constant.types[type$1];
                i++;
            } else {
                itemType = {kind: 'value'};
            }

            var N;
            if (args.length > 3) {
                if (args[2] !== null &&
                    (typeof args[2] !== 'number' ||
                        args[2] < 0 ||
                        args[2] !== Math.floor(args[2]))
                ) {
                    return context.error('The length argument to "array" must be a positive integer literal', 2);
                }
                N = args[2];
                i++;
            }

            type = array(itemType, N);
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

    Assertion.prototype.evaluate = function evaluate(ctx) {
        for (var i = 0; i < this.args.length; i++) {
            var value = this.args[i].evaluate(ctx);
            var error = checkSubtype(this.type, typeOf(value));
            if (!error) {
                return value;
            } else if (i === this.args.length - 1) {
                throw new Error(("Expected value to be of type " + (this.type) + ", but found " + (typeOf(value)) + " instead."));
            }
        }
        return null;
    };

    Assertion.prototype.eachChild = function eachChild(fn) {
        this.args.forEach(fn);
    };

    Assertion.prototype.possibleOutputs = function possibleOutputs() {
        var ref;

        return (ref = []).concat.apply(ref, this.args.map(function (arg) {
            return arg.possibleOutputs();
        }));
    };

    Assertion.prototype.serialize = function serialize() {
        var type = this.type;
        var serialized = [type.kind];
        if (type.kind === 'array') {
            var itemType = type.itemType;
            if (itemType.kind === 'string' ||
                itemType.kind === 'number' ||
                itemType.kind === 'boolean') {
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

    var Coalesce = function Coalesce(type, args) {
        this.type = type;
        this.args = args;
    };

    Coalesce.parse = function parse(args, context) {
        if (args.length < 2) {
            return context.error("Expectected at least one argument.");
        }
        var outputType = (null);
        var expectedType = context.expectedType;
        if (expectedType && expectedType.kind !== 'value') {
            outputType = expectedType;
        }
        var parsedArgs = [];

        for (var i = 0, list = args.slice(1); i < list.length; i += 1) {
            var arg = list[i];

            var parsed = context.parse(arg, 1 + parsedArgs.length, outputType, undefined, {typeAnnotation: 'omit'});
            if (!parsed) {
                return null;
            }
            outputType = outputType || parsed.type;
            parsedArgs.push(parsed);
        }
        assert_1(outputType);

        // Above, we parse arguments without inferred type annotation so that
        // they don't produce a runtime error for `null` input, which would
        // preempt the desired null-coalescing behavior.
        // Thus, if any of our arguments would have needed an annotation, we
        // need to wrap the enclosing coalesce expression with it instead.
        var needsAnnotation = expectedType &&
            parsedArgs.some(function (arg) {
                return checkSubtype(expectedType, arg.type);
            });

        return needsAnnotation ?
            new Coalesce(ValueType, parsedArgs) :
            new Coalesce((outputType), parsedArgs);
    };

    Coalesce.prototype.evaluate = function evaluate(ctx) {
        var result = null;
        for (var i = 0, list = this.args; i < list.length; i += 1) {
            var arg = list[i];

            result = arg.evaluate(ctx);
            if (result !== null) {
                break;
            }
        }
        return result;
    };

    Coalesce.prototype.eachChild = function eachChild(fn) {
        this.args.forEach(fn);
    };

    Coalesce.prototype.possibleOutputs = function possibleOutputs() {
        var ref;

        return (ref = []).concat.apply(ref, this.args.map(function (arg) {
            return arg.possibleOutputs();
        }));
    };

    Coalesce.prototype.serialize = function serialize() {
        var serialized = ["coalesce"];
        this.eachChild(function (child) {
            serialized.push(child.serialize());
        });
        return serialized;
    };

    var Step = function Step(type, input, stops) {
        this.type = type;
        this.input = input;

        this.labels = [];
        this.outputs = [];
        for (var i = 0, list = stops; i < list.length; i += 1) {
            var ref = list[i];
            var label = ref[0];
            var expression = ref[1];

            this.labels.push(label);
            this.outputs.push(expression);
        }
    };

    Step.parse = function parse(args, context) {
        if (args.length - 1 < 4) {
            return context.error(("Expected at least 4 arguments, but found only " + (args.length - 1) + "."));
        }

        if ((args.length - 1) % 2 !== 0) {
            return context.error("Expected an even number of arguments.");
        }

        var input = context.parse(args[1], 1, NumberType);
        if (!input) {
            return null;
        }

        var stops = [];

        var outputType = (null);
        if (context.expectedType && context.expectedType.kind !== 'value') {
            outputType = context.expectedType;
        }

        for (var i = 1; i < args.length; i += 2) {
            var label = i === 1 ? -Infinity : args[i];
            var value = args[i + 1];

            var labelKey = i;
            var valueKey = i + 1;

            if (typeof label !== 'number') {
                return context.error('Input/output pairs for "step" expressions must be defined using literal numeric values (not computed expressions) for the input values.', labelKey);
            }

            if (stops.length && stops[stops.length - 1][0] >= label) {
                return context.error('Input/output pairs for "step" expressions must be arranged with input values in strictly ascending order.', labelKey);
            }

            var parsed = context.parse(value, valueKey, outputType);
            if (!parsed) {
                return null;
            }
            outputType = outputType || parsed.type;
            stops.push([label, parsed]);
        }

        return new Step(outputType, input, stops);
    };

    Step.prototype.evaluate = function evaluate(ctx) {
        var labels = this.labels;
        var outputs = this.outputs;

        if (labels.length === 1) {
            return outputs[0].evaluate(ctx);
        }

        var value = ((this.input.evaluate(ctx)));
        if (value <= labels[0]) {
            return outputs[0].evaluate(ctx);
        }

        var stopCount = labels.length;
        if (value >= labels[stopCount - 1]) {
            return outputs[stopCount - 1].evaluate(ctx);
        }

        var index = utils.findStopLessThanOrEqualTo(labels, value);
        return outputs[index].evaluate(ctx);
    };

    Step.prototype.eachChild = function eachChild(fn) {
        fn(this.input);
        for (var i = 0, list = this.outputs; i < list.length; i += 1) {
            var expression = list[i];

            fn(expression);
        }
    };

    Step.prototype.possibleOutputs = function possibleOutputs() {
        var ref;

        return (ref = []).concat.apply(ref, this.outputs.map(function (output) {
            return output.possibleOutputs();
        }));
    };

    Step.prototype.serialize = function serialize() {
        var serialized = ["step", this.input.serialize()];
        for (var i = 0; i < this.labels.length; i++) {
            if (i > 0) {
                serialized.push(this.labels[i]);
            }
            serialized.push(this.outputs[i].serialize());
        }
        return serialized;
    };

    var expressions = {
        '==': definitions.Equals,
        '!=': definitions.NotEquals,
        '>': definitions.GreaterThan,
        '<': definitions.LessThan,
        '>=': definitions.GreaterThanOrEqual,
        '<=': definitions.LessThanOrEqual,
        'literal': Literal,
        'interpolate': Interpolate,
        'interpolate-hcl': Interpolate,
        'interpolate-lab': Interpolate,
        'let': Let,
        'coalesce': Coalesce,
        'step': Step,
        'array': Assertion,
        'number': Assertion,
        'boolean': Assertion,
        'object': Assertion,
        'string': Assertion,
        'to-boolean': Coercion,
        'to-color': Coercion,
        'to-number': Coercion,
        'to-string': Coercion,
        'collator': CollatorExpression,
        /*
         'at': At,
         'case': Case,

         'format': FormatExpression,
         'length': Length,
         'match': Match,
         'number-format': NumberFormat,
         */
        'var': Var
    };

    for (var name$1 in expressions) {
        if ((expressions[name$1])._classRegistryKey) {
            continue;
        }
        dataTransfer.register(("Expression_" + name$1), expressions[name$1]);
    }

    exports.expressions = expressions;

    // 本模块内部函数
    function getExpectedType(spec) {
        var types = {
            color: {kind: 'color'},
            string: {kind: 'string'},
            number: {kind: 'number'},
            enum: {kind: 'string'},
            boolean: {kind: 'boolean'},
            formatted: {kind: 'formatted'}
        };

        if (spec.type === 'array') {
            return {
                kind: 'array',
                itemType: types[spec.value] || {kind: 'value'},
                N: spec.length
            };
        }

        return types[spec.type];
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

    function convertDisjunctionOp(filters) {
        return ['any'].concat(filters.map(convertFilter));
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

    function convertNegation(filter) {
        return ['!', filter];
    }

    function isExpressionFilter(filter) {
        if (filter === true || filter === false) {
            return true;
        }

        if (!Array.isArray(filter) || filter.length === 0) {
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
                    op === '<' ||
                    op === '>' ||
                    op === '<=' ||
                    op === '>=' ? convertComparisonOp(filter[1], filter[2], op) :
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

    function getDefaultValue(spec) {
        if (spec.type === 'color' && utils.isFunction(spec.default)) {
            return new Color(0, 0, 0, 0);
        } else if (spec.type === 'color') {
            return Color.parse(spec.default) || null;
        } else if (spec.default === undefined) {
            return null;
        } else {
            return spec.default;
        }
    }

    // 本模块内部类
    var EvaluationContext = function EvaluationContext() {
        this.globals = null;
        this.feature = null;
        this.featureState = null;
        this._parseColorCache = {};
    };

    EvaluationContext.prototype.id = function id() {
        return this.feature && 'id' in this.feature ? this.feature.id : null;
    };

    EvaluationContext.prototype.geometryType = function geometryType() {
        return this.feature ? typeof this.feature.type === 'number' ? geometryTypes[this.feature.type] : this.feature.type : null;
    };

    EvaluationContext.prototype.properties = function properties() {
        return this.feature && this.feature.properties || {};
    };

    EvaluationContext.prototype.parseColor = function parseColor(input) {
        var cached = this._parseColorCache[input];
        if (!cached) {
            cached = this._parseColorCache[input] = Color.parse(input);
        }
        return cached;
    };

    var Scope = function Scope(parent, bindings) {
        if (bindings === void 0) bindings = [];
        this.parent = parent;
        this.bindings = {};
        for (var i = 0, list = bindings; i < list.length; i += 1) {
            var ref = list[i];
            var name = ref[0];
            this.bindings[name] = ref[1];
        }
    };

    Scope.prototype.concat = function concat(bindings) {
        return new Scope(this, bindings);
    };

    Scope.prototype.get = function get(name) {
        if (this.bindings[name]) {
            return this.bindings[name];
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error((name + " not found in scope."));
    };

    Scope.prototype.has = function has(name) {
        if (this.bindings[name]) {
            return true;
        }
        return this.parent ? this.parent.has(name) : false;
    };

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

    ParsingContext.prototype.parse = function parse(expr, index, expectedType, bindings, options) {
        if (options === void 0) options = {};

        if (index) {
            return this.concat(index, expectedType, bindings)._parse(expr, options);
        }
        return this._parse(expr, options);
    };

    ParsingContext.prototype._parse = function _parse(expr, options) {
        if (expr === null || typeof expr === 'string' || typeof expr === 'boolean' || typeof expr === 'number') {
            expr = ['literal', expr];
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

        if (Array.isArray(expr)) {
            if (expr.length === 0) {
                return new Error("Expected an array with at least one element. If you wanted a literal array, use [\"literal\", []].");
            }

            var op = expr[0];
            if (typeof op !== 'string') {
                new Error(("Expression name must be a string, but found " + (typeof op) + " instead. If you wanted a literal array, use [\"literal\", [...]]."), 0);
                return null;
            }

            var Expr = this.registry[op];
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

                if (!(parsed instanceof Literal) && isConstant(parsed)) {
                    var ec = new EvaluationContext();
                    try {
                        parsed = new Literal(parsed.type, parsed.evaluate(ec));
                    } catch (e) {
                        new Error(e.message);
                        return null;
                    }
                }

                return parsed;
            }

            return new Error(("Unknown expression \"" + op + "\". If you wanted a literal array, use [\"literal\", [...]]."), 0);
        } else if (typeof expr === 'undefined') {
            return new Error("'undefined' value invalid. Use null instead.");
        } else if (typeof expr === 'object') {
            return new Error("Bare objects invalid. Use [\"literal\", {...}] instead.");
        } else {
            return new Error(("Expected an array, but found " + (typeof expr) + " instead."));
        }
    };

    ParsingContext.prototype.concat = function concat(index, expectedType, bindings) {
        var path = typeof index === 'number' ? this.path.concat(index) : this.path;
        var scope = bindings ? this.scope.concat(bindings) : this.scope;
        return new ParsingContext(
            this.registry,
            path,
            expectedType || null,
            scope,
            this.errors
        );
    };

    ParsingContext.prototype.error = function error(error$1) {
        var keys = [], len = arguments.length - 1;
        while (len-- > 0) keys[len] = arguments[len + 1];

        var key = "" + (this.key) + (keys.map(function (k) {
            return ("[" + k + "]");
        }).join(''));
        this.errors.push(new ParsingError(key, error$1));
    };

    ParsingContext.prototype.checkSubtype = function checkSubtype$1(expected, t) {
        var error = checkSubtype(expected, t);
        if (error) {
            this.error(error);
        }
        return error;
    };

    var CompoundExpression = function CompoundExpression(name, type, evaluate, args) {
        this.name = name;
        this.type = type;
        this._evaluate = evaluate;
        this.args = args;
    };

    CompoundExpression.prototype.evaluate = function evaluate(ctx) {
        return this._evaluate(ctx, this.args);
    };

    CompoundExpression.prototype.eachChild = function eachChild(fn) {
        this.args.forEach(fn);
    };

    CompoundExpression.prototype.possibleOutputs = function possibleOutputs() {
        return [undefined];
    };

    CompoundExpression.prototype.serialize = function serialize() {
        return [this.name].concat(this.args.map(function (arg) {
            return arg.serialize();
        }));
    };

    CompoundExpression.parse = function parse(args, context) {
        var ref$1;

        var op = (args[0]);
        var definition = CompoundExpression.definitions[op];
        if (!definition) {
            return context.error(("Unknown expression \"" + op + "\". If you wanted a literal array, use [\"literal\", [...]]."), 0);
        }

        // Now check argument types against each signature
        var type = Array.isArray(definition) ?
            definition[0] : definition.type;

        var availableOverloads = Array.isArray(definition) ?
            [[definition[1], definition[2]]] :
            definition.overloads;

        var overloads = availableOverloads.filter(function (ref) {
            var signature = ref[0];

            return (
                !Array.isArray(signature) || // varags
                signature.length === args.length - 1 // correct param count
            );
        });

        var signatureContext = (null);

        for (var i$3 = 0, list = overloads; i$3 < list.length; i$3 += 1) {
            // Use a fresh context for each attempted signature so that, if
            // we eventually succeed, we haven't polluted `context.errors`.
            var ref = list[i$3];
            var params = ref[0];
            var evaluate = ref[1];

            signatureContext = new ParsingContext(context.registry, context.path, null, context.scope);

            // First parse all the args, potentially coercing to the
            // types expected by this overload.
            var parsedArgs = [];
            var argParseFailed = false;
            for (var i = 1; i < args.length; i++) {
                var arg = args[i];
                var expectedType = Array.isArray(params) ?
                    params[i - 1] :
                    params.type;

                var parsed = signatureContext.parse(arg, 1 + parsedArgs.length, expectedType);
                if (!parsed) {
                    argParseFailed = true;
                    break;
                }
                parsedArgs.push(parsed);
            }
            if (argParseFailed) {
                // Couldn't coerce args of this overload to expected type, move
                // on to next one.
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
            var signatures = expected$1
                .map(function (ref) {
                    var params = ref[0];
                    return stringifySignature(params);
                })
                .join(' | ');

            var actualTypes = [];
            // For error message, re-parse arguments without trying to
            // apply any coercions
            for (var i$2 = 1; i$2 < args.length; i$2++) {
                var parsed$1 = context.parse(args[i$2], 1 + actualTypes.length);
                if (!parsed$1) {
                    return null;
                }
                actualTypes.push(toString(parsed$1.type));
            }
            context.error(("Expected arguments of type " + signatures + ", but found (" + (actualTypes.join(', ')) + ") instead."));
        }

        return null;
    };

    CompoundExpression.register = function register(registry, definitions) {
        CompoundExpression.definitions = definitions;
        for (var name in definitions) {
            registry[name] = CompoundExpression;
        }
    };

    function get(key, obj) {
        var v = obj[key];
        // todo 取消Number函数
        // debugger;
        // var v = obj[key]||0;
        // v = Number(v);
        return typeof v === 'undefined' ? 0 : v;
    }

    function has(key, obj) {
        return key in obj;
    }

    CompoundExpression.register(expressions, {
        'error': [
            {kind: 'error'},
            [{kind: 'string'}],
            function (ctx, ref) {
                var v = ref[0];
                throw new Error(v.evaluate(ctx));
            }
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
        'filter-==': [
            {kind: 'boolean'},
            [{kind: 'string'}, {kind: 'value'}],
            function (ctx, ref) {
                var k = ref[0];
                var v = ref[1];

                return ctx.properties()[(k).value] === (v).value;
            }
        ],
        'filter-type-==': [
            {kind: 'boolean'},
            [{kind: 'string'}],
            function (ctx, ref) {
                var v = ref[0];

                return ctx.geometryType() === (v).value;
            }
        ],
        'filter-<': [
            {kind: 'boolean'},
            [{kind: 'string'}, {kind: 'value'}],
            function (ctx, ref) {
                var k = ref[0];
                var v = ref[1];

                var a = ctx.properties()[(k).value];
                var b = (v).value;
                return typeof a === typeof b && a < b;
            }
        ],
        'filter-<=': [
            {kind: 'boolean'},
            [{kind: 'string'}, {kind: 'value'}],
            function (ctx, ref) {
                var k = ref[0];
                var v = ref[1];

                var a = ctx.properties()[(k).value];
                var b = (v).value;
                return typeof a === typeof b && a <= b;
            }
        ],
        'filter->=': [
            {kind: 'boolean'},
            [{kind: 'string'}, {kind: 'value'}],
            function (ctx, ref) {
                var k = ref[0];
                var v = ref[1];

                var a = ctx.properties()[(k).value];
                var b = (v).value;
                return typeof a === typeof b && a >= b;
            }
        ],
        'filter-in-small': [
            {kind: 'boolean'},
            [{kind: 'string'}, array({kind: 'value'})],
            // assumes v is an array literal
            function (ctx, ref) {
                var k = ref[0];
                var v = ref[1];

                return (v).value.indexOf(ctx.properties()[(k).value]) >= 0;
            }
        ],
        'filter-has': [
            {kind: 'boolean'},
            [{kind: 'value'}],
            function (ctx, ref) {
                var k = ref[0];
                return (k).value in ctx.properties();
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
        ]
    });
    dataTransfer.register('CompoundExpression', CompoundExpression, {omit: ['_evaluate']});
    exports.CompoundExpression = CompoundExpression;


    //本模块导出函数
    function createFilter(filter) {
        // debugger;
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
            throw new Error(compiled.value.map(function (err) {
                return ((err.key) + ": " + (err.message));
            }).join(', '));
        } else {
            return function (globalProperties, feature) {
                return compiled.value.evaluate(globalProperties, feature);
            };
        }
    }

    function createExpression(expression, propertySpec) {
        var parser = new ParsingContext(expressions, [], propertySpec ? getExpectedType(propertySpec) : undefined);

        // For string-valued properties, coerce to string at the top level rather than asserting.
        var parsed = parser.parse(expression, undefined, undefined, undefined,
            propertySpec && propertySpec.type === 'string' ? {typeAnnotation: 'coerce'} : undefined);

        if (!parsed) {
            return {result: 'error', value: parser.errors};
        }

        return {result: 'success', value: new StyleExpression(parsed, propertySpec)};
    }

    function isExpression(expression) {
        return Array.isArray(expression) && expression.length > 0 &&
            typeof expression[0] === 'string' && expression[0] in expressions;
    }

    exports.createExpression = createExpression;
    exports.createFilter = createFilter;
    exports.isExpression = isExpression;

    // 本模块导出类
    var StyleExpression = function StyleExpression(expression, propertySpec) {
        this.expression = expression;
        this._warningHistory = {};
        this._evaluator = new EvaluationContext();
        this._defaultValue = propertySpec ? getDefaultValue(propertySpec) : null;
        this._enumValues = propertySpec && propertySpec.type === 'enum' ? propertySpec.values : null;
    };

    StyleExpression.prototype.evaluateWithoutErrorHandling = function evaluateWithoutErrorHandling(globals, feature, featureState) {
        this._evaluator.globals = globals;
        this._evaluator.feature = feature;
        this._evaluator.featureState = featureState;

        return this.expression.evaluate(this._evaluator);
    };

    StyleExpression.prototype.evaluate = function evaluate(globals, feature, featureState) {
        this._evaluator.globals = globals;
        this._evaluator.feature = feature || null;
        this._evaluator.featureState = featureState || null;

        try {
            var val = this.expression.evaluate(this._evaluator);
            if (val === null || val === undefined) {
                return this._defaultValue;
            }
            if (this._enumValues && !(val in this._enumValues)) {
                throw new Error(("Expected value to be one of " + (Object.keys(this._enumValues).map(function (v) {
                    return JSON.stringify(v);
                }).join(', ')) + ", but found " + (JSON.stringify(val)) + " instead."));
            }
            return val;
        } catch (e) {
            if (!this._warningHistory[e.message]) {
                this._warningHistory[e.message] = true;
                if (typeof console !== 'undefined') {
                    console.warn(e.message);
                }
            }
            return this._defaultValue;
        }
    };
    dataTransfer.register('StyleExpression', StyleExpression, {omit: ['_evaluator']});
    exports.StyleExpression = StyleExpression;

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

    var ZoomConstantExpression = function ZoomConstantExpression(kind, expression) {
        this.kind = kind;
        this._styleExpression = expression;
        this.isStateDependent = kind !== ('constant') && !isStateConstant(expression.expression);
    };

    ZoomConstantExpression.prototype.evaluateWithoutErrorHandling = function evaluateWithoutErrorHandling(globals, feature, featureState) {
        return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState);
    };

    ZoomConstantExpression.prototype.evaluate = function evaluate(globals, feature, featureState) {
        return this._styleExpression.evaluate(globals, feature, featureState);
    };

    dataTransfer.register('ZoomConstantExpression', ZoomConstantExpression);
    exports.ZoomConstantExpression = ZoomConstantExpression;

    var ZoomDependentExpression = function ZoomDependentExpression(kind, expression, zoomCurve) {
        this.kind = kind;
        this.zoomStops = zoomCurve.labels;
        this._styleExpression = expression;
        this.isStateDependent = kind !== ('camera') && !isStateConstant(expression.expression);
        if (zoomCurve instanceof Interpolate) {
            this.interpolationType = zoomCurve.interpolation;
        }
    };

    ZoomDependentExpression.prototype.evaluateWithoutErrorHandling = function evaluateWithoutErrorHandling(globals, feature, featureState) {
        return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState);
    };

    ZoomDependentExpression.prototype.evaluate = function evaluate(globals, feature, featureState) {
        return this._styleExpression.evaluate(globals, feature, featureState);
    };

    ZoomDependentExpression.prototype.interpolationFactor = function interpolationFactor(input, lower, upper) {
        if (this.interpolationType) {
            return Interpolate.interpolationFactor(this.interpolationType, input, lower, upper);
        } else {
            return 0;
        }
    };

    exports.ZoomDependentExpression = ZoomDependentExpression;


    /*function isStateConstant(e) {
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

    var CompoundExpression = function CompoundExpression(name, type, evaluate, args) {
        this.name = name;
        this.type = type;
        this._evaluate = evaluate;
        this.args = args;
    };

    CompoundExpression.prototype.evaluate = function evaluate(ctx) {
        return this._evaluate(ctx, this.args);
    };

    CompoundExpression.prototype.eachChild = function eachChild(fn) {
        this.args.forEach(fn);
    };

    CompoundExpression.prototype.possibleOutputs = function possibleOutputs() {
        return [undefined];
    };

    CompoundExpression.prototype.serialize = function serialize() {
        return [this.name].concat(this.args.map(function (arg) {
            return arg.serialize();
        }));
    };

    CompoundExpression.parse = function parse(args, context) {
        var ref$1;

        var op = (args[0]);
        var definition = CompoundExpression.definitions[op];
        if (!definition) {
            return context.error(("Unknown expression \"" + op + "\". If you wanted a literal array, use [\"literal\", [...]]."), 0);
        }

        // Now check argument types against each signature
        var type = Array.isArray(definition) ?
            definition[0] : definition.type;

        var availableOverloads = Array.isArray(definition) ?
            [[definition[1], definition[2]]] :
            definition.overloads;

        var overloads = availableOverloads.filter(function (ref) {
            var signature = ref[0];

            return (
                !Array.isArray(signature) || // varags
                signature.length === args.length - 1 // correct param count
            );
        });

        var signatureContext = (null);

        for (var i$3 = 0, list = overloads; i$3 < list.length; i$3 += 1) {
            // Use a fresh context for each attempted signature so that, if
            // we eventually succeed, we haven't polluted `context.errors`.
            var ref = list[i$3];
            var params = ref[0];
            var evaluate = ref[1];

            signatureContext = new ParsingContext(context.registry, context.path, null, context.scope);

            // First parse all the args, potentially coercing to the
            // types expected by this overload.
            var parsedArgs = [];
            var argParseFailed = false;
            for (var i = 1; i < args.length; i++) {
                var arg = args[i];
                var expectedType = Array.isArray(params) ?
                    params[i - 1] :
                    params.type;

                var parsed = signatureContext.parse(arg, 1 + parsedArgs.length, expectedType);
                if (!parsed) {
                    argParseFailed = true;
                    break;
                }
                parsedArgs.push(parsed);
            }
            if (argParseFailed) {
                // Couldn't coerce args of this overload to expected type, move
                // on to next one.
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
            var signatures = expected$1
                .map(function (ref) {
                    var params = ref[0];

                    return stringifySignature(params);
                })
                .join(' | ');

            var actualTypes = [];
            // For error message, re-parse arguments without trying to
            // apply any coercions
            for (var i$2 = 1; i$2 < args.length; i$2++) {
                var parsed$1 = context.parse(args[i$2], 1 + actualTypes.length);
                if (!parsed$1) {
                    return null;
                }
                actualTypes.push(toString(parsed$1.type));
            }
            context.error(("Expected arguments of type " + signatures + ", but found (" + (actualTypes.join(', ')) + ") instead."));
        }

        return null;
    };

    CompoundExpression.register = function register(
        registry,
        definitions
    ) {
        CompoundExpression.definitions = definitions;
        for (var name in definitions) {
            registry[name] = CompoundExpression;
        }
    };

    var ZoomConstantExpression = function ZoomConstantExpression(kind, expression) {
        this.kind = kind;
        this._styleExpression = expression;
        this.isStateDependent = kind !== ('constant') && !isStateConstant(expression.expression);
    };

    ZoomConstantExpression.prototype.evaluateWithoutErrorHandling = function evaluateWithoutErrorHandling(globals, feature, featureState) {
        return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState);
    };

    ZoomConstantExpression.prototype.evaluate = function evaluate(globals, feature, featureState) {
        return this._styleExpression.evaluate(globals, feature, featureState);
    };

    var ZoomDependentExpression = function ZoomDependentExpression(kind, expression, zoomCurve) {
        this.kind = kind;
        this.zoomStops = zoomCurve.labels;
        this._styleExpression = expression;
        this.isStateDependent = kind !== ('camera') && !isStateConstant(expression.expression);
        if (zoomCurve instanceof Interpolate) {
            this.interpolationType = zoomCurve.interpolation;
        }
    };

    ZoomDependentExpression.prototype.evaluateWithoutErrorHandling = function evaluateWithoutErrorHandling(globals, feature, featureState) {
        return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState);
    };

    ZoomDependentExpression.prototype.evaluate = function evaluate(globals, feature, featureState) {
        return this._styleExpression.evaluate(globals, feature, featureState);
    };

    ZoomDependentExpression.prototype.interpolationFactor = function interpolationFactor(input, lower, upper) {
        if (this.interpolationType) {
            return Interpolate.interpolationFactor(this.interpolationType, input, lower, upper);
        } else {
            return 0;
        }
    };*/
});