/**
 * 复合线符号的样式
 * @module com/huayun/webgis/CompositeLineSymbol
 * @see com.huayun.webgis.symbols.CompositeLineSymbol
 */
define("com/huayun/webgis/symbols/CompositeLineSymbol", [
    "./Symbol",
    "./LineSymbol",
    "./DecorationLineSymbol",
    "./LeadLineSymbol",
    "./MultileadLineSymbol"
], function (Symbol, LineSymbol, DecorationLineSymbol, LeadLineSymbol, MultileadLineSymbol) {
    /**
     * 复合线符号的样式
     * @constructor
     * @alias com.huayun.webgis.symbols.CompositeLineSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {number} params.width 复合线符号的宽度
     * @param {number} params.markerSize 复合线符号的点符号的大小
     * @param {number} params.markerRotation 复合线符号的点符号的旋转角度
     * @param {number} params.markerScaleFactor 复合线符号的点符号的缩放倍数
     * @property {String} type 符号类型
     * @property {Array} symbols 复合符号包含的基础符号
     * @property {Array} props 复合符号属性
     * @property {number} width 复合线符号的宽度
     */
    function CompositeLineSymbol(params) {
        if(params){
            Symbol.call(this, params);
            this.type = 'compositeLine';
            this.angle = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.symbols = [];
            this.width = params.width;
            // this.minScale = params.minScale;
            // this.maxScale = params.maxScale;
            if (params.markerSize) {
                this.markerSize = Number(params.markerSize.value);
            }
            if (params.markerRotation) {
                if (!this.props) {
                    this.props = {};
                }
                this.props.markerRotation = params.markerRotation;
            }
            if (params.markerScaleFactor) {
                if (!this.props) {
                    this.props = {};
                }
                this.props.markerScaleFactor = params.markerScaleFactor;
            }
            this.isFixed = params.isFixed === true;
            this.fixed = {
                isFixed: this.isFixed,
                addratio: 0
            };
            this.parseSymbol(params.symbol);
        }
    }

    // 类继承
    if (Symbol) CompositeLineSymbol.__proto__ = Symbol;
    CompositeLineSymbol.prototype = Object.create(Symbol && Symbol.prototype);
    CompositeLineSymbol.prototype.constructor = CompositeLineSymbol;

    CompositeLineSymbol.prototype.parseSymbol = function (list) {
        if (!list) return;
        for (var i = 0; i < list.length; i++) {
            var symbolObj = list[i];
            if (typeof this.width !== 'undefined') {
                symbolObj.width = this.width;
            }
            symbolObj.isFixed = this.isFixed;
            symbolObj.minScale = this.minScale;
            symbolObj.maxScale = this.maxScale;
            var symbolId = symbolObj['baseid'];
            this.pushSymbols(symbolId, symbolObj);
        }
    };

    CompositeLineSymbol.prototype.pushSymbols = function (type, symbol) {
        var formatterSymbol = null;
        switch (type) {
            case 'l_decorationline_style':
                this.symbols.push(new DecorationLineSymbol(symbol));
                break;
            case 'l_leadlinesymbol_style':
                // debugger;
                symbol.markerSize = this.markerSize;
                symbol.props = this.props;
                this.symbols.push(new LeadLineSymbol(symbol));
                break;
            case 'l_simpleline_style':
                this.symbols.push(new LineSymbol(symbol));
                break;
            case 'l_multileadlinesymbol_style':
                this.symbols.push(new MultileadLineSymbol(symbol));
                break;
            default:
                break;
        }
    };

    CompositeLineSymbol.prototype.formatterSymbol = function (symbol) {
        var reg = /_(\w+)/;
        var result = {};
        for (var item in symbol) {
            if (symbol.hasOwnProperty(item) && reg.test(item)) {
                result[RegExp.$1] = symbol[item];
            }
        }
        return result;
    };

    CompositeLineSymbol.prototype.clone = function() {
        var cloneSymbol = new CompositeLineSymbol();
        cloneSymbol.type = 'compositeLine';
        cloneSymbol.angle = this.angle;
        cloneSymbol.offsetX = this.offsetX;
        cloneSymbol.offsetY = this.offsetY;
        cloneSymbol.symbols = [];
        cloneSymbol.width = this.width;
        if(this.markerSize) {
            cloneSymbol.markerSize = this.markerSize;
        }
        if(this.props && this.props.markerRotation) {
            if(!cloneSymbol.props){
                cloneSymbol.props = {};
            }
            cloneSymbol.props.markerRotation = this.props.markerRotation;
        }
        if(this.props && this.props.markerScaleFactor) {
            if(!cloneSymbol.props) {
                cloneSymbol.props = {};
            }
            cloneSymbol.props.markerScaleFactor = this.props.markerScaleFactor;
        }
        cloneSymbol.isFixed = this.isFixed;
        cloneSymbol.fixed = {
            isFixed: cloneSymbol.isFixed,
            addratio: 0 
        };
        if(this.symbols.length > 0){
            this.symbols.forEach(function(item) {
                var itemSymbol = item.clone();
                cloneSymbol.symbols.push(itemSymbol);
            });
        }
        return cloneSymbol;
    };

    return CompositeLineSymbol;
});
