/**
 * 简单填充面样式
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.SimpleFillSymbol
 */
define("com/huayun/webgis/symbols/SimpleFillSymbol", [
    "./Symbol",
    "./PolygonSymbol",
    "./LineSymbol"
], function (Symbol, PolygonSymbol, LineSymbol) {
    /**
     * 简单填充面样式
     * @alias com.huayun.webgis.symbols.SimpleFillSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {String} params.color 颜色
     * @param {number} params.alpha 透明度
     * @param {Object} params.outline 边界线样式
     * @property {String} color  颜色
     * @property {number} alpha 透明度
     * @property {PolygonSymbol} fillSymbol 基础面样式类
     * @property {LineSymbol} lineSymbol 边界线样式类
     */
    function SimpleFillSymbol(params) {
        if (params === undefined) return;
        this.type = "simpleFill";
        this.alpha = Number(params.alpha || 1);
        this.color = params.color || "#FFF";
        this.outline = params.outline;

        this.fillSymbol = new PolygonSymbol({
            color: this.color,
            opacity: this.alpha
        });
        if (params.hasOwnProperty('outline')) {
            if ((Array.isArray(params.outline) && params.outline.length > 0)) {
                var symbol = params.outline[0].symbols[0];
                this.lineSymbol = new LineSymbol(symbol);
            } else if (Object.prototype.toString.call(params.outline) === '[object Object]') {
                var symbol = params.outline.symbols[0];
                this.lineSymbol = new LineSymbol(symbol);
            }
        }
        /**/
    }

    if (Symbol) SimpleFillSymbol.__proto__ = Symbol;
    SimpleFillSymbol.prototype = Object.create(Symbol && Symbol.prototype);
    SimpleFillSymbol.prototype.constructor = SimpleFillSymbol;

    SimpleFillSymbol.prototype.clone = function () {
        var result = new SimpleFillSymbol();
        result.type = this.type;
        result.alpha = this.alpha;
        result.color = this.color;
        result.outline = this.outline;
        result.fillSymbol = this.fillSymbol.clone();
        result.lineSymbol = this.lineSymbol.clone();
        return result;
    }

    return SimpleFillSymbol;
});
