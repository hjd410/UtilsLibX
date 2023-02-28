/**
 * 两圈变Symbol
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.TwoCoiltransformerSymbol
 */
define("com/huayun/webgis/symbols/TwoCoiltransformerSymbol", [
    "./Symbol",
    "./LineSymbol",
    "./CircleSymbol"
], function (Symbol, LineSymbol, CircleSymbol) {
    /**
     * 三圈变Symbol
     * @constructor
     * @alias com.huayun.webgis.symbols.TwoCoiltransformerSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {String} params.fill 颜色
     * @param {String} params.stroke 描边颜色
     * @property {String} fill 线的颜色
     * @property {String} stroke 描边颜色
     * @property {Array} symbols 基础Symbol类数组
     */
    function TwoCoiltransformerSymbol(params) {
        this.type = "twoCoiltransformer";
        this.subtype = params.subtype;
        this.fillOne = params['fill-one']||"#FFF";
        this.fillTwo = params['fill-two']||"#FFF";
        this.stroke = params.stroke||"#000";
        this.strokeWidth = Number(params['stroke-width']||1);
        this.scale = Number(params.scale);
        this.hConnMode = params['h-conn']||params['h-conn-mode'];
        this.lConnMode = params['l-conn']||params['l-conn-mode'];
        this.tapSwitch = params['tap-switch'] !== 'false';
        this.onLoad = params['on-load'] !== 'false';
        this.symbols = [];
        this.symbols.push(new LineSymbol({
            // width: this.strokeWidth,
            width: 3,
            color: this.stroke
        }));
        this.symbols.push(new CircleSymbol({
            color: this.fillOne,
            radius: 10,
            stroke: this.stroke,
            strokeWidth: this.strokeWidth
        }));
        this.symbols.push(new CircleSymbol({
            color: this.fillTwo,
            radius: 10,
            stroke: this.stroke,
            strokeWidth: this.strokeWidth
        }));
        this.symbols.push(new CircleSymbol({
            color: this.stroke,
            radius: 10,
            stroke: this.stroke,
            strokeWidth: 0
        }));
    }

    // 类继承
    if (Symbol) TwoCoiltransformerSymbol.__proto__ = Symbol;
    TwoCoiltransformerSymbol.prototype = Object.create(Symbol && Symbol.prototype);
    TwoCoiltransformerSymbol.prototype.constructor = TwoCoiltransformerSymbol;

    return TwoCoiltransformerSymbol;
})
