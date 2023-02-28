define("com/huayun/webgis/layers/support/expression/Collator", [], function () {
    /**
     * collator操作符, 与语言环境相关的比较操作
     * @private
     * @ignore
     * @param caseSensitive 区分大小写
     * @param diacriticSensitive 区分变音符号
     * @param locale 语言环境
     * @constructor
     */
    var Collator = function Collator(caseSensitive, diacriticSensitive, locale) {
        if (caseSensitive) {
            this.sensitivity = diacriticSensitive ? 'variant' : 'case';
        } else {
            this.sensitivity = diacriticSensitive ? 'accent' : 'base';
        }
        this.locale = locale;
        this.collator = new Intl.Collator(this.locale ? this.locale : [], {
            sensitivity: this.sensitivity,
            usage: 'search'
        });
    };

    /**
     * 比较
     * @param lhs
     * @param rhs
     * @return {number}
     */
    Collator.prototype.compare = function (lhs, rhs) {
        return this.collator.compare(lhs, rhs);
    };

    Collator.prototype.resolvedLocale = function () {
        return new Intl.Collator(this.locale ? this.locale : []).resolvedOptions().locale;
    };

    return Collator;
});