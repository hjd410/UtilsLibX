define("com/huayun/webgis/layers/support/expression/NumberFormat", [], function () {

    /**
     * number-format运算符, 将数字按规则转换成字符串
     * ["number-format",
     *      input:number
     *      options: {
     *          "locale": string,
     *          "currency": string,
     *          "min-fraction-digits": number,
     *          "max-fraction-digits": number
     *      }
     * ]
     * @private
     * @ignore
     * @param number
     * @param locale
     * @param currency
     * @param minFractionDigits
     * @param maxFractionDigits
     * @constructor
     */
    var NumberFormat = function NumberFormat(number, locale, currency, minFractionDigits, maxFractionDigits) {
        this.type = {kind: "string"};
        this.number = number;
        this.locale = locale;
        this.currency = currency;
        this.minFractionDigits = minFractionDigits;
        this.maxFractionDigits = maxFractionDigits;
    };

    NumberFormat.parse = function (args, context) {
        if (args.length !== 3) {
            return context.error("Expected two arguments.");
        }

        var number = context.parse(args[1], 1, {kind: "number"});
        if (!number) {
            return null;
        }

        var options = args[2];
        if (typeof options !== "object" || Array.isArray(options)) {
            return context.error("NumberFormat options argument must be an object.");
        }

        var locale = null;
        if (options['locale']) {
            locale = context.parse(options['locale'], 1, {kind: "string"});
            if (!locale) {
                return null;
            }
        }

        var currency = null;
        if (options['currency']) {
            currency = context.parse(options['currency'], 1, {kind: "string"});
            if (!currency) {
                return null;
            }
        }

        var minFractionDigits = null;
        if (options['min-fraction-digits']) {
            minFractionDigits = context.parse(options['min-fraction-digits'], 1, {kind: "number"});
            if (!minFractionDigits) {
                return null;
            }
        }

        var maxFractionDigits = null;
        if (options['max-fraction-digits']) {
            maxFractionDigits = context.parse(options['max-fraction-digits'], 1, {kind: "number"});
            if (!maxFractionDigits) {
                return null;
            }
        }

        return new NumberFormat(number, locale, currency, minFractionDigits, maxFractionDigits);
    };

    NumberFormat.prototype.evaluate = function (ctx) {
        return new Intl.NumberFormat(this.locale ? this.locale.evaluate(ctx) : [],
            {
                style: this.currency ? "currency" : "decimal",
                currency: this.currency ? this.currency.evaluate(ctx) : undefined,
                minimumFractionDigits: this.minFractionDigits ? this.minFractionDigits.evaluate(ctx) : undefined,
                maximumFractionDigits: this.maxFractionDigits ? this.maxFractionDigits.evaluate(ctx) : undefined,
            }).format(this.number.evaluate(ctx));
    };

    NumberFormat.prototype.eachChild = function (fn) {
        fn(this.number);
        if (this.locale) {
            fn(this.locale);
        }
        if (this.currency) {
            fn(this.currency);
        }
        if (this.minFractionDigits) {
            fn(this.minFractionDigits);
        }
        if (this.maxFractionDigits) {
            fn(this.maxFractionDigits);
        }
    };

    NumberFormat.prototype.possibleOutputs = function () {
        return [undefined];
    };

    NumberFormat.prototype.serialize = function () {
        var options = {};
        if (this.locale) {
            options['locale'] = this.locale.serialize();
        }
        if (this.currency) {
            options['currency'] = this.currency.serialize();
        }
        if (this.minFractionDigits) {
            options['min-fraction-digits'] = this.minFractionDigits.serialize();
        }
        if (this.maxFractionDigits) {
            options['max-fraction-digits'] = this.maxFractionDigits.serialize();
        }
        return ["number-format", this.number.serialize(), options];
    };

    return NumberFormat;
})