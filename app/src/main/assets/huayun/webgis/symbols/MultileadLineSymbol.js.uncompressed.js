/**
 * 多引线符号的样式
 * @module com/huayun/webgis/LeadLineSymbol
 * @see com.huayun.webgis.symbols.LeadLineSymbol
 */
define("com/huayun/webgis/symbols/MultileadLineSymbol", [
    "./Symbol",
    "./LineSymbol",
    "./FontSymbol",
    "./RectSymbol"
], function (Symbol, LineSymbol, FontSymbol, RectSymbol) {
    /**
     * 多引线符号的样式
     * @constructor
     * @alias com.huayun.webgis.symbols.LeadLineSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {String} params.color 多引线符号的颜色
     * @param {number} params.width 多引线符号的宽度
     * @param {Object} params.markerSize 多引线符号的点符号的大小
     * @property {String} type 符号的类别
     * @property {String} color 符号的颜色
     * @property {number} width 符号的宽度
     * @property {Object} markerSize 多引线符号的点符号的大小
     * @property {LineSymbol} lineSymbol 多引线符号中的线符号样式类
     * @property {Array} symbols 多引线符号中的点符号的样式类数组
     */
    function MultileadLineSymbol(params) {
        this.type = "multiLeadLine";
        this.color = params.color || "#FFF";
        this.linecap = params.linecap;
        this.linejoin = params.linejoin;
        this.isFixed = params.isFixed;
        this.minScale = params.minScale;
        this.maxScale = params.maxScale;
        this.width = Number(params.width || 1);
        this.lineSymbol = new LineSymbol({
            color: this.color,
            width: this.width,
            join: this.linejoin,
            cap: this.linecap,
            fixedSize: this.fixedSize,
            minScale: this.minScale,
            maxScale: this.maxScale
        });

        var symbols = params.marker ? params.marker.symbols : [];
        this.symbols = [];
        for (var i = 0; i < symbols.length; i++) {
            var symbol = symbols[i];
            symbol.isFixed = this.isFixed;
            switch (symbol.baseid) {
                case "p_font_style":
                    this.symbols.push(new FontSymbol(symbol));
                    break;
                case "p_rectangle_style":
                    this.symbols.push(new RectSymbol(symbol));
                    break;
                default:
                    break;
            }
        }
    }

    if (Symbol) MultileadLineSymbol.__proto__ = Symbol;
    MultileadLineSymbol.prototype = Object.create(Symbol && Symbol.prototype);
    MultileadLineSymbol.prototype.constructor = MultileadLineSymbol;

    return MultileadLineSymbol;
})
