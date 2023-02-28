define("com/huayun/webgis/layers/support/expression/CollatorExpression", [
  "./Collator"
], function (Collator) {
  /**
   * collator运算符
   * @private
   * @ignore
   * @param caseSensitive
   * @param diacriticSensitive
   * @param locale
   * @constructor
   */
  var CollatorExpression = function CollatorExpression(caseSensitive, diacriticSensitive, locale) {
    this.type = {kind: 'collator'};
    this.locale = locale;
    this.caseSensitive = caseSensitive;
    this.diacriticSensitive = diacriticSensitive;
  };

  CollatorExpression.parse = function (args, context) {
    if (args.length !== 2) {
      return context.error("Expected one argument.");
    }
    var options = (args[1]);
    if (typeof options !== "object" || Array.isArray(options)) {
      return context.error("Collator options argument must be an object.");
    }

    var caseSensitive = context.parse(options['case-sensitive'] === undefined ? false : options['case-sensitive'], 1, {kind: 'boolean'});
    if (!caseSensitive) {
      return null;
    }

    var diacriticSensitive = context.parse(options['diacritic-sensitive'] === undefined ? false : options['diacritic-sensitive'], 1, {kind: 'boolean'});
    if (!diacriticSensitive) {
      return null;
    }

    var locale = null;
    if (options['locale']) {
      locale = context.parse(options['locale'], 1, {kind: 'string'});
      if (!locale) {
        return null;
      }
    }
    return new CollatorExpression(caseSensitive, diacriticSensitive, locale);
  };

  CollatorExpression.prototype.evaluate = function (ctx) {
    return new Collator(this.caseSensitive.evaluate(ctx), this.diacriticSensitive.evaluate(ctx), this.locale ? this.locale.evaluate(ctx) : null);
  };

  CollatorExpression.prototype.eachChild = function (fn) {
    fn(this.caseSensitive);
    fn(this.diacriticSensitive);
    if (this.locale) {
      fn(this.locale);
    }
  };

  CollatorExpression.prototype.possibleOutputs = function () {
    return [undefined];
  };

  CollatorExpression.prototype.serialize = function () {
    var options = {};
    options['case-sensitive'] = this.caseSensitive.serialize();
    options['diacritic-sensitive'] = this.diacriticSensitive.serialize();
    if (this.locale) {
      options['locale'] = this.locale.serialize();
    }
    return ["collator", options];
  };
  return CollatorExpression;
});