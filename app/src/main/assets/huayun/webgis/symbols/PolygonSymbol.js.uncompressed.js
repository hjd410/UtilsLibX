/**
 * 面symbol, 定义绘制多边形的样式
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.PolygonSymbol
 */
define("com/huayun/webgis/symbols/PolygonSymbol", [
    "./Symbol",
    "../utils/Color"
], function (BaseSymbol, Color) {
    /**
     * 面symbol, 定义绘制多边形的样式
     * @constructor
     * @alias com.huayun.webgis.symbols.PolygonSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {String} params.color 面的颜色
     * @param {number} params.opacity 透明度
     * @property {String} color 多边形或者面的填充颜色
     * @property {number} opacity 多边形或者面的透明度
     */
    var PolygonSymbol = function (params) {
        if (params === undefined) return;
        BaseSymbol.call(this, params);
        this.type = "polygon";
        var color = Color.parse(params.color || "#FF0000"),
            opacity = params.opacity === undefined ? 1 : params.opacity;
        this._color = [color.r, color.g, color.b, color.a];
        this._opacity = opacity;
        this.uniforms = {
            "u_color": this.color,
            "u_opacity": this.opacity
        };
    };

    if (BaseSymbol) PolygonSymbol.__proto__ = BaseSymbol;
    PolygonSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
    PolygonSymbol.prototype.constructor = PolygonSymbol;

    PolygonSymbol.prototype.clone = function () {
        var result = new PolygonSymbol();
        result.minScale = this.minScale;
        result.maxScale = this.maxScale;
        result.uniforms = this.uniforms;
        result.color = this.color;
        result.opacity = this.opacity;
        return result;
    }

    var prototypeAccessors = {
        color: {configurable: true},
        opacity: {configurable: true}
    };

    prototypeAccessors.color.set = function (value) {
        var color = Color.parse(value || "#FF0000");
        this._color = [color.r, color.g, color.b, color.a];
        this.uniforms["u_color"] = this._color;
    };

    prototypeAccessors.opacity.set = function (value) {
        this._opacity = value;
        this.uniforms["u_opacity"] = value;
    };

    prototypeAccessors.color.get = function () {
        return this._color;
    };

    prototypeAccessors.opacity.get = function () {
        return this._opacity;
    };

    Object.defineProperties(PolygonSymbol.prototype, prototypeAccessors);

    return PolygonSymbol;
});
