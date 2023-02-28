/**
 * 三圈变Symbol
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.ThreeCoiltransformerSymbol
 */
define("com/huayun/webgis/symbols/ThreeCoiltransformerSymbol", [
    './Symbol',
    './LineSymbol',
    './CircleSymbol'
], function (Symbol, LineSymbol, CircleSymbol) {
    /**
     * 三圈变Symbol
     * @constructor
     * @alias com.huayun.webgis.symbols.ThreeCoiltransformerSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {String} params.fill 颜色
     * @param {String} params.stroke 描边颜色
     * @property {String} fill 线的颜色
     * @property {String} stroke 描边颜色
     * @property {Array} symbols 基础Symbol类数组
     */
    function ThreeCoiltransformerSymbol(params) {
        this.type = "threeCoiltransformer";
        this.subtype = params.subtype;
        this.fill = params.fill || "#FFF";
        this.stroke = params.stroke || "#000";
        this.strokeWidth = params["stroke-width"] || 1;
        this.scale = Number(params.scale);
        this.hConnMode = params['h-conn-mode'];
        this.mConnMode = params['m-conn-mode'];
        this.lConnMode = params['l-conn-mode'];
        this.onLoad = params['on-load'] !== 'false';
        this.minScale = params.minScale;
        this.symbols = [];
        this.symbols.push(new LineSymbol({
            width: 0.05,
            color: this.stroke,
            minScale: this.minScale,
            fixedSize: true
        }));
        this.symbols.push(new CircleSymbol({
            color: this.fill,
            radius: 10,
            stroke: this.stroke,
            strokeWidth: this.strokeWidth
        }));
        this.symbols.push(new CircleSymbol({
            color: this.fill,
            radius: 10,
            stroke: this.stroke,
            strokeWidth: this.strokeWidth
        }));
        this.symbols.push(new CircleSymbol({
            color: this.fill,
            radius: 10,
            stroke: this.stroke,
            strokeWidth: this.strokeWidth
        }));
        this.symbols.push(new CircleSymbol({
            color: "#FFF",
            radius: 10,
            stroke: this.stroke,
            strokeWidth: this.strokeWidth
        }));
    }

    //类继承
    if (Symbol) ThreeCoiltransformerSymbol.__proto__ = Symbol;
    ThreeCoiltransformerSymbol.prototype = Object.create(Symbol && Symbol.prototype);
    ThreeCoiltransformerSymbol.prototype.constructor = ThreeCoiltransformerSymbol;

    return ThreeCoiltransformerSymbol;
});
