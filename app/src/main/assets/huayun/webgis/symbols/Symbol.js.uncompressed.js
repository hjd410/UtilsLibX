/**
 * 符号基类
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.Symbol
 */
define("com/huayun/webgis/symbols/Symbol", [], function () {
    /**
     * 符号基类
     * @constructor
     * @alias com.huayun.webgis.symbols.Symbol
     * @param {Object} params 构造函数参数
     * @param {number} params.minScale 最小比例尺
     * @param {number} params.maxScale 最大比例尺
     * @param {Boolean} params.isFixed 是否固定大小, 不随比例尺缩放
     * @property {number} minScale 最小比例尺
     * @property {number} maxScale 最大比例尺
     * @property {Object} fixed 是否固定大小, 不随比例尺缩放
     */
    function Symbol(params) {
        if(params){
            this.minScale = params.minScale === undefined ? 1 : params.minScale;
            this.maxScale = params.maxScale === undefined ? 1 : params.maxScale;
            this.dx = params.dx === undefined ? 0 : params.dx;
            this.dy = params.dy === undefined ? 0 : params.dy;
            if (params.isFixed === false) {
                this.isFixed = false;
            }else if (params.symbol === undefined) {
                this.isFixed = true;
            } else {
                this.isFixed = params.isFixed === undefined;
            }
            this.renderer = params.renderer === undefined ? null : params.renderer;
            this.fixed = {
                isFixed: this.isFixed,
                addratio: 0
            }
        }
    };

    Symbol.prototype.clone = function () {
    }

    return Symbol;
});
