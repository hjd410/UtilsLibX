/**
 * 复合填充符号的样式
 * @module com/huayun/webgis/CompositeFillSymbol
 * @see com.huayun.webgis.symbols.CompositeFillSymbol
 */
define("com/huayun/webgis/symbols/CompositeFillSymbol", [
    "./Symbol",
    "./SimpleFillSymbol"
], function (Symbol, SimpleFillSymbol) {
    /**
     * 复合填充符号的样式
     * @constructor
     * @alias com.huayun.webgis.symbols.CompositeFillSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {Object} params.symbol 复合填充符号的样式
     * @property {String} type 符号类型
     * @property {Array} symbols 复合符号包含的基础符号
     * @property {Array} props 复合符号属性
     */
    function CompositeFillSymbol(params) {
        if(params) {
            Symbol.call(this, params);
            this.type = 'compositeFill';
            this.symbols = [];
            this.parseSymbol(params.symbol);
            this.props = [];
        }
    }

    // 类继承
    if (Symbol) CompositeFillSymbol.__proto__ = Symbol;
    CompositeFillSymbol.prototype = Object.create(Symbol && Symbol.prototype);
    CompositeFillSymbol.prototype.constructor = CompositeFillSymbol;

    /**
     * 根据传入的基础符号的配置, 创建复合符号包含的基础符号
     * @param {Array} list 基础符号的配置
     */
    CompositeFillSymbol.prototype.parseSymbol = function (list) {
        if (!list) return;
        for (var i = 0; i < list.length; i++) {
            var symbolObj = list[i];
            symbolObj.isFixed = this.isFixed;
            symbolObj.minScale = this.minScale;
            symbolObj.maxScale = this.maxScale;
            var symbolId = symbolObj['baseid'];
            this.pushSymbols(symbolId, symbolObj);
        }
    };

    CompositeFillSymbol.prototype.pushSymbols = function (type, symbol) {
        var formatterSymbol = null;
        // debugger
        switch (type) {
            case 'pg_simplefill_style':
                this.symbols.push(new SimpleFillSymbol(symbol));
                break;
            default:
                break;
        }
    };

    CompositeFillSymbol.prototype.formatterSymbol = function (symbol) {
        var reg = /_(\w+)/;
        var result = {};
        for (var item in symbol) {
            if (symbol.hasOwnProperty(item) && reg.test(item)) {
                result[RegExp.$1] = symbol[item];
            }
        }
        return result;
    };

    CompositeFillSymbol.prototype.clone = function () {
        var cloneSymbol = new CompositeFillSymbol();
        cloneSymbol.type = 'compositeFill';
        cloneSymbol.symbols = [];
        cloneSymbol.props = [];
        this.symbols.forEach(function(item) {
            var itemSymbol = item.clone();
            cloneSymbol.symbols.push(itemSymbol);
        });
        return cloneSymbol;
    };

    return CompositeFillSymbol;
});
