define("com/huayun/webgis/layers/support/expression/Coalesce", [
  "../style/styleUtils"
], function (styleUtils) {
  /**
   * coalesce运算符, 依次计算每个表达式, 直到获得第一个非空值, 然后返回该值
   * ["coalesce", OutputType, OutputType, ...]
   * @private
   * @ignore
   * @param type
   * @param args
   * @constructor
   */
  var Coalesce = function Coalesce(type, args) {
    this.type = type;
    this.args = args;
  };

  Coalesce.parse = function (args, context) {
    if (args.length < 2) {
      return context.error("Expectected at least one argument.");
    }
    var outputType = null;
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
    var needsAnnotation = expectedType && parsedArgs.some(function (arg) {
      return styleUtils.checkSubtype(expectedType, arg.type);
    });

    return needsAnnotation ? new Coalesce({kind: 'value'}, parsedArgs) : new Coalesce(outputType, parsedArgs);
  };

  Coalesce.prototype.evaluate = function (ctx) {
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

  Coalesce.prototype.eachChild = function (fn) {
    this.args.forEach(fn);
  };

  Coalesce.prototype.possibleOutputs = function () {
    var ref;
    return (ref = []).concat.apply(ref, this.args.map(function (arg) {
      return arg.possibleOutputs();
    }));
  };

  Coalesce.prototype.serialize = function () {
    var serialized = ["coalesce"];
    this.eachChild(function (child) {
      serialized.push(child.serialize());
    });
    return serialized;
  };

  return Coalesce;
});