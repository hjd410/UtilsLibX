/**
 * 装饰线符号的样式
 * @module com/huayun/webgis/DecorationLineSymbol
 * @see com.huayun.webgis.symbols.DecorationLineSymbol
 */
define("com/huayun/webgis/symbols/DecorationLineSymbol", [
    "./Symbol",
    "./LineSymbol",
    "./FontSymbol",
    "./RectSymbol"
], function (Symbol, LineSymbol, FontSymbol, RectSymbol) {
    /**
     * 装饰线符号的样式
     * @constructor
     * @alias com.huayun.webgis.symbols.DecorationLineSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {String} params.color 装饰线符号的颜色
     * @param {number} params.width 装饰线符号的宽度
     * @param {number} params.decorationloc 装饰线符号的符号位置
     * @param {Boolean} params.rotation 装饰线符号的点符号是否旋转
     * @param {Boolean} params.autoadapt 是否自动调整
     * @param {Boolean} params.adaptratio 是否自动调整比例
     * @param {Object} params.marker 装饰线符号的点符号的样式
     * @property {String} type 符号的类别
     * @property {String} color 符号的颜色
     * @property {number} width 符号的宽度
     * @property {number} decorationloc 装饰线符号的符号位置
     * @property {Boolean} rotation 装饰线符号的点符号是否旋转
     * @property {Boolean} autoadapt 是否自动调整
     * @property {Boolean} adaptratio 是否自动调整比例
     * @property {Object} marker 装饰线符号的点符号的样式
     * @property {LineSymbol} lineSymbol 装饰线符号中的线符号样式类
     * @property {Array} symbols 装饰线符号中的点符号的样式类数组
     */
    function DecorationLineSymbol(params) {
        if(params) {
             // console.log("decorationLine");
            this.type = "decorationLine";
            this.color = params.color || "#FFF";
            this.width = Number(params.width || 1);
            this.linejoin = params.linejoin;
            this.linecap = params.linecap;
            this.fixedSize = params.isFixed;
            this.minScale = params.minScale;
            this.maxScale = params.maxScale;

            this.decorationloc = Number(params.decorationloc);
            this.flip = Number(params.flip);
            this.rotation = params.rotation.toString() === 'true';
            this.dx = Number(params.dx);
            this.dy = Number(params.dy);
            this.autoadapt = params.autoadapt.toString() === 'true';
            this.adaptratio = Number(params.adaptratio);
            this.lineSymbol = new LineSymbol({
                color: this.color,
                width: this.width,
                join: this.linejoin,
                cap: this.linecap,
                fixedSize: this.fixedSize,
                minScale: this.minScale,
                maxScale: this.maxScale

            });
            var symbols = params.marker ? params.marker.symbols === undefined ? [] : params.marker.symbols : [];
            this.symbols = [];
            for (var i = 0; i < symbols.length; i++) {
                var symbol = symbols[i];
                switch (symbol.baseid) {
                    case "p_font_style":
                        this.symbols.push(new FontSymbol(symbol));
                        break;
                    case "p_rectangle_style":
                        this.symbols.push(new RectSymbol(symbol));
                        break;
                }
            }
        }
    }

    // 类继承
    if (Symbol) DecorationLineSymbol.__proto__ = Symbol;
    DecorationLineSymbol.prototype = Object.create(Symbol && Symbol.prototype);
    DecorationLineSymbol.prototype.constructor = DecorationLineSymbol;

    DecorationLineSymbol.prototype.clone = function() {
        var cloneSymbol = new DecorationLineSymbol();
        cloneSymbol.type = "decorationLine";
        cloneSymbol.color = this.color;
        cloneSymbol.width = this.width;
        cloneSymbol.linejoin = this.linejoin;
        cloneSymbol.linecap = this.linecap;
        cloneSymbol.fixedSize = this.fixedSize;
        cloneSymbol.minScale = this.minScale;
        cloneSymbol.maxScale = this.maxScale;
        cloneSymbol.decorationloc = this.decorationloc;
        cloneSymbol.flip = this.flip;
        cloneSymbol.rotation = this.rotation;
        cloneSymbol.dx = this.dx;
        cloneSymbol.dy = this.dy;
        cloneSymbol.autoadapt = this.autoadapt;
        cloneSymbol.adaptratio = this.adaptratio;
        cloneSymbol.lineSymbol = this.lineSymbol.clone();
        cloneSymbol.symbols = [];
        if(this.symbols.length > 0) {
            this.symbols.forEach(function(item) {
                var itemSymbol = item.clone();
                cloneSymbol.symbols.push(itemSymbol);
            })
        }
        cloneSymbol.fixedSize = this.fixedSize;
        cloneSymbol.fixed = {
            isFixed: cloneSymbol.fixedSize,
            addratio: 0
        };
        return cloneSymbol;
    }

    return DecorationLineSymbol;
})
