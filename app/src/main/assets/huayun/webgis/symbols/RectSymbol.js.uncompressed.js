/**
 * 矩形Symbol
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.RectSymbol
 */
define("com/huayun/webgis/symbols/RectSymbol", [
    "./Symbol",
    "../utils/Color"
], function (Symbol, Color) {
    /**
     * 矩形Symbol
     * @constructor
     * @alias com.huayun.webgis.symbols.RectSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {String} params.color 颜色
     * @param {number} params.opacity 透明度
     * @param {number} params.width 矩形宽度
     * @param {number} params.height 矩形高度
     * @param {number} params.stroke-width 边界线宽度
     * @param {String} params.stroke 边界线颜色
     * @property {String} color  颜色
     * @property {number} opacity 透明度
     */
    var RectSymbol = function (params) {
        if (params) {
            Symbol.call(this, params);
            this.type = "rect";
            this.isFixed = params.isFixed;
            this.fixed = {
                isFixed: this.isFixed,
                addratio: 0
            };
            this.width = Number(params.width || 1);
            this.height = Number(params.height || 1);
            var color = Color.parse(params.fill || "#FFF");
            this._color = [color.r, color.g, color.b, color.a];
            this.dx = Number(params.dx);
            this.dy = Number(params.dy);
            var stroke = Color.parse(params.stroke || "#000");
            this.strokeWidth = Number(params["stroke-width"] || 0);
            this._stroke = [stroke.r, stroke.g, stroke.b, stroke.a];
            this.rx = Number(params.rx);
            this.ry = Number(params.ry);
            this.widthWithStroke = this.width + this.strokeWidth * 2;
            this.heightWithStroke = this.height + this.strokeWidth * 2;
            this.angle = Number(params.angle || 0);

            this.uniforms = {
                "u_color": this.color,
                "u_device_pixel_ratio": window.devicePixelRatio,
                "u_is_stroke": 1,
                "u_size": 1,
                "u_radian": 0
            };
        }
    };
    if (Symbol) RectSymbol.__proto__ = Symbol;
    RectSymbol.prototype = Object.create(Symbol && Symbol.prototype);
    RectSymbol.prototype.constructor = RectSymbol;

    RectSymbol.prototype.setRadian = function (radian) {
        this.uniforms["u_rotate_symbol"] = 1;
        this.uniforms["u_radian"] = radian;
    };

    RectSymbol.prototype.clone = function () {
        var cloneSymbol = new RectSymbol();
        cloneSymbol.type = "rect";
        cloneSymbol.markerSize = this.markerSize;
        cloneSymbol.minScale = this.minScale;
        cloneSymbol.maxScale = this.maxScale;
        cloneSymbol.width = this.width;
        cloneSymbol.height = this.height;
        cloneSymbol.dx = this.dx;
        cloneSymbol.dy = this.dy;
        cloneSymbol.strokeWidth = this.strokeWidth;
        cloneSymbol.stroke = this.stroke;
        cloneSymbol.rx = this.rx;
        cloneSymbol.ry = this.ry;
        cloneSymbol.widthWithStroke = this.widthWithStroke;
        cloneSymbol.heightWithStroke = this.heightWithStroke;
        cloneSymbol.angle = this.angle;
        cloneSymbol.uniforms = this.uniforms;
        cloneSymbol.color = this.color;
        cloneSymbol.isFixed = this.isFixed;
        cloneSymbol.fixed = {
            isFixed: cloneSymbol.isFixed,
            addratio: 0
        };
        return cloneSymbol;
    };

    var prototypeAccessors = {
        color: {configurable: true},
        stroke: {configurable: true}
    };
    prototypeAccessors.color.set = function (value) {
        var color = Color.parse(value);
        this._color = [color.r, color.g, color.b, color.a];
        if (this.uniforms) this.uniforms['u_color'] = this._color;
    };
    prototypeAccessors.color.get = function () {
        return this._color;
    };

    prototypeAccessors.stroke.set = function (value) {
        var stroke = Color.parse(value);
        this._stroke = [stroke.r, stroke.g, stroke.b, stroke.a];
        // if (this.uniforms) this.uniforms['u_color'] = this._stroke;
    };
    prototypeAccessors.stroke.get = function () {
        return this._stroke;
    };

    Object.defineProperties(RectSymbol.prototype, prototypeAccessors);

    return RectSymbol;
});
