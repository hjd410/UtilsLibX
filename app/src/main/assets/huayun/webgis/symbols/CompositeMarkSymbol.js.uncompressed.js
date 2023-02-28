/**
 * 复合点符号的样式
 * @module com/huayun/webgis/CompositeMarkSymbol
 * @see com.huayun.webgis.symbols.CompositeMarkSymbol
 */
define("com/huayun/webgis/symbols/CompositeMarkSymbol", [
    "./Symbol",
    "./CircleSymbol",
    "./TwoCoiltransformerSymbol",
    "./ThreeCoiltransformerSymbol",
    "./AutotransformerSymbol",
    "./FontSymbol",
    "./RectSymbol"
], function (Symbol, CircleSymbol, TwoCoiltransformerSymbol, ThreeCoiltransformerSymbol, AutotransformerSymbol, FontSymbol, RectSymbol) {
    /**
     * 复合点符号的样式
     * @constructor
     * @alias com.huayun.webgis.symbols.CompositeMarkSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {number} params.size 复合点符号的大小, 可选
     * @param {number} params.rotation 复合点符号的旋转角度
     * @param {number} params.scaleFactor 复合点符号的缩放倍数
     * @property {String} type 符号类型
     * @property {Array} symbols 复合符号包含的基础符号
     * @property {Array} props 复合符号属性
     * @property {number} width 复合线符号的宽度
     */
    function CompositeMarkSymbol(params) {
        Symbol.call(this, params);
        this.type = "compositeMark";
        this.angle = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.symbols = [];
        this.parseSymbol(params.symbol);
        // debugger
        if (params.size) {
            this.size = Number(params.size);
        }
        if (params.rotation) {
            if (!this.props) {
                this.props = {};
            }
            this.props.rotation = params.rotation;
        }
        if (params.scaleFactor) {
            if (!this.props) {
                this.props = {};
            }
            this.props.scaleFactor = params.scaleFactor;
        }
    }

    // 类继承
    if (Symbol) CompositeMarkSymbol.__proto__ = Symbol;
    CompositeMarkSymbol.prototype = Object.create(Symbol && Symbol.prototype);
    CompositeMarkSymbol.prototype.constructor = CompositeMarkSymbol;

    CompositeMarkSymbol.prototype.parseSymbol = function (list) {
        for (var i = list.length-1; i > -1; i--) {
            var symbolObj = list[i];
            symbolObj.isFixed = this.isFixed;
            symbolObj.minScale = this.minScale;
            symbolObj.maxScale = this.maxScale;
            var symbolId = symbolObj['baseid'];
            this.pushSymbols(symbolId, symbolObj);
        }
    };

    CompositeMarkSymbol.prototype.pushSymbols = function (type, symbol) {
        // console.log(type);
        switch (type) {
            case 'p_simplemarker_style':
                // this.symbols.push(new SimpleMarkerSymbol(symbol));
                break;
            case 'p_circle_style':
                this.symbols.push(new CircleSymbol(symbol));
                break;
            case 'p_font_style':
                this.symbols.push(new FontSymbol(symbol));
                break;
            case 'p_twocoiltransformer_style':
                this.symbols.push(new TwoCoiltransformerSymbol(symbol));
                break;
            case 'p_threecoiltransformer_style':
                this.symbols.push(new ThreeCoiltransformerSymbol(symbol));
                break;
            case 't_text_style':
                this.symbols.push(new TextSymbol(symbol));
                break;
            case 'p_autotransformer_style':
                this.symbols.push(new AutotransformerSymbol(symbol));
                break;
            case 'p_rectangle_style':
                this.symbols.push(new RectSymbol(symbol));
                break;
            default:
                break;
        }
    };

    CompositeMarkSymbol.prototype.clone = function () {
        var cloneSymbol = new CompositeMarkSymbol();
        cloneSymbol.type = "compositeMark";
        cloneSymbol.angle = this.angle;
        cloneSymbol.offsetX = this.offsetX;
        cloneSymbol.offsetY = this.offsetY;
        cloneSymbol.symbols = [];
        if(this.size) {
            cloneSymbol.size = this.size;
        }
        if(this.props.rotation) {
            if(!cloneSymbol.props) {
                cloneSymbol.props = {};
            }
            cloneSymbol.props.rotation = this.props.rotation;
        }
        if(this.props.scaleFactor) {
            if(!cloneSymbol.props) {
                cloneSymbol.props = {};
            }
            cloneSymbol.props.scaleFactor = this.props.scaleFactor;
        }
        if(this.symbols.length > 0) {
            this.symbols.forEach(function(item) {
                var itemSymbol = item.clone();
                cloneSymbol.symbols.push(itemSymbol);
            });
        }
        return cloneSymbol;
    }

    return CompositeMarkSymbol;
});
