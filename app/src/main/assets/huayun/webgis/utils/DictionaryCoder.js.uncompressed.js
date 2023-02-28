/**
 * 字符串和数字互转
 * @see com.huayun.webgis.work.support.DictionaryCoder
 */
define("com/huayun/webgis/utils/DictionaryCoder", [], function () {
    /**
     * @ignore
     * @alias com.huayun.webgis.work.support.DictionaryCoder
     * @param strings
     * @constructor
     */
    var DictionaryCoder = function DictionaryCoder(strings) {
        this._stringToNumber = {};
        this._numberToString = [];
        for (var i = 0; i < strings.length; i++) {
            var string = strings[i];
            this._stringToNumber[string] = i;
            this._numberToString[i] = string;
        }
    };

    DictionaryCoder.prototype.encode = function encode(string) {
        return this._stringToNumber[string];
    };

    DictionaryCoder.prototype.decode = function decode(n) {
        return this._numberToString[n];
    };

    return DictionaryCoder;
})