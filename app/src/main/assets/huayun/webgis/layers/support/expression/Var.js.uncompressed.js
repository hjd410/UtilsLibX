define("com/huayun/webgis/layers/support/expression/Var", [], function () {
    /**
     * var运算符
     * @private
     * @ignore
     * @param name
     * @param boundExpression
     * @constructor
     */
    var Var = function Var(name, boundExpression) {
        this.type = boundExpression.type;
        this.name = name;
        this.boundExpression = boundExpression;
    };

    Var.parse = function (args, context) {
        if (args.length !== 2 || typeof args[1] !== 'string') {
            return context.error("'var' expression requires exactly one string literal argument.");
        }

        var name = args[1];
        if (!context.scope.has(name)) {
            return context.error(("Unknown variable \"" + name + "\". Make sure \"" + name + "\" has been bound in an enclosing \"let\" expression before using it."), 1);
        }

        return new Var(name, context.scope.get(name));
    };

    Var.prototype.evaluate = function (ctx) {
        return this.boundExpression.evaluate(ctx);
    };

    Var.prototype.eachChild = function () {
    };

    Var.prototype.possibleOutputs = function () {
        return [undefined];
    };

    Var.prototype.serialize = function () {
        return ["var", this.name];
    };
    return Var;
});