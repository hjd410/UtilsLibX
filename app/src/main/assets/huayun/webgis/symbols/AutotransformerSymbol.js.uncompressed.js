/**
 * 自耦变样式类
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.AutotransformerSymbol
 */
define("com/huayun/webgis/symbols/AutotransformerSymbol", [
    './Symbol',
    './LineSymbol',
    './CircleSymbol'
], function (Symbol, LineSymbol, CircleSymbol) {
    /**
     * 自耦变样式类, 定义自耦变的样式
     * @constructor
     * @alias com.huayun.webgis.symbols.AutotransformerSymbol
     * @param {Object} params 构造函数参数
     * @param {String} params.fill 颜色
     * @param {String} params.stroke 描边颜色
     * @property {String} fill 线的颜色
     * @property {String} stroke 描边颜色
     * @property {Array} symbols 基础Symbol类数组
     */
    function AutotransformerSymbol(params) {
        this.type = "autotransformer";
        this.subtype = params.subtype;
        this.fill = params.fill || "#FFF";
        this.stroke = params.stroke || "#000";
        this.strokeWidth = params["stroke-width"] || 1;
        this.scale = Number(params.scale);
        this.hConnMode = params['h-conn-mode'];
        this.lConnMode = params['l-conn-mode'];
        this.onLoad = params['on-load'] === 'false' ? false : true;
        this.tap = params['tap'] === 'false' ? false : true;
        this.symbols = [];

        this.symbols.push(new LineSymbol({
            width: 3,
            color: this.stroke
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
    }

    //类继承
    if (Symbol) AutotransformerSymbol.__proto__ = Symbol;
    AutotransformerSymbol.prototype = Object.create(Symbol && Symbol.prototype);
    AutotransformerSymbol.prototype.constructor = AutotransformerSymbol;

    return AutotransformerSymbol;
});