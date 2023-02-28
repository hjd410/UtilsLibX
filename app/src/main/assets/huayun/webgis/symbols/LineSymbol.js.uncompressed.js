/**
 * 基础线符号样式类
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.LineSymbol
 */
define("com/huayun/webgis/symbols/LineSymbol", [
    "./Symbol",
    "../utils/Color"
], function (BaseSymbol, Color) {
    /**
     * 基础线符号样式类
     * @constructor
     * @alias com.huayun.webgis.symbols.LineSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {String} params.color 线颜色
     * @param {Number} params.opacity 线透明度
     * @param {Number} params.width 线宽度
     * @param {String} params.style dash|solid 线的样式类别
     * @param {Array} params.dasharray 虚线的样式, 支持Canvas虚线样式配置
     * @property {String} color 线的颜色
     * @property {Number} opacity 线的透明度
     * @property {Number} width 线的宽度
     */
    var LineSymbol = function (params) {
        if (params) {
            BaseSymbol.call(this, params);
            this.type = "line";
            this.join = params.lineJoin || params.join || "miter";
            this.cap = params.lineCap || params.cap || "butt";
            var color = Color.parse(params.color || "#FF0000"),
                opacity = params.opacity === undefined ? 1 : params.opacity;
            this.width = Number(params.width); //params.width < 1?1:params.width;
            this.length = params.length || 8;
            this._color = [color.r, color.g, color.b, color.a];
            this.opacity = opacity;
            this.gapwidth = params.gapwidth === undefined ? 0 : params.gapwidth;
            this.offset = params.offset === undefined ? 0 : params.offset;
            this.minScale = params.minScale;
            this.maxScale = params.maxScale;

            if (params.style === "dash") {
                params.dasharray = [5, 5];
            } else if (params.style === "solid") {
                params.dasharray = null;
            }

            if (params.dasharray) { // 虚线
                var dasharray = {
                    from: params.dasharray,
                    to: params.dasharray
                };
                this.dasharray = dasharray;
                /*var round = this.cap === "round";
                var posA = lineDashTexture.lineAtlas.getDash(dasharray.from, round);
                var posB = lineDashTexture.lineAtlas.getDash(dasharray.to, round);
                var widthA = posA.width * 2;
                var widthB = posB.width * 1;
                this.widthA = widthA;
                this.widthB = widthB;
                var width = lineDashTexture.lineAtlas.width;
                this.lineAtlas = lineDashTexture.lineAtlas;*/
                this.scaleDirty = true;
                this.uniforms = {
                    "u_ratio": 1,
                    "u_color": this.color,
                    "u_opacity": this.opacity,
                    "u_gapwidth": 0,
                    "u_width": this.width,
                    "u_blur": 0,
                    "u_offset": this.offset,
                    "u_floorwidth": 1,
                    /*'u_patternscale_a': [1 / widthA, -posA.height / 2],
                    'u_patternscale_b': [1 / widthB, -posB.height / 2],
                    'u_sdfgamma': width / (Math.min(widthA, widthB) * 256) / 2,
                    'u_tex_y_a': posA.y,
                    'u_tex_y_b': posB.y,*/
                    'u_mix': 1,
                    'ratio': 0.5
                };
            } else {
                this.uniforms = {
                    "u_ratio": 1,
                    "u_color": [color.r, color.g, color.b, color.a],
                    "u_blur": 0,
                    "u_opacity": this.opacity,
                    "u_gapwidth": this.gapwidth,
                    "u_offset": this.offset,
                    "u_width": this.width,
                    'ratio': 0.5
                };
            }
        }
    };
    if (BaseSymbol) LineSymbol.__proto__ = BaseSymbol;
    LineSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
    LineSymbol.prototype.constructor = LineSymbol;

    LineSymbol.prototype.setWidth = function (width) {
        this.uniforms["u_width"] = width;
    }

    LineSymbol.prototype.clone = function () {
        var cloneSymbol = new LineSymbol();
        cloneSymbol.type = "line";
        cloneSymbol.join = this.join;
        cloneSymbol.cap = this.cap;
        cloneSymbol.width = this.width;
        cloneSymbol.length = this.length;
        cloneSymbol.opacity = this.opacity;
        cloneSymbol.gapwidth = this.gapwidth;
        cloneSymbol.offset = this.offset;
        cloneSymbol.minScale = this.minScale;
        cloneSymbol.maxScale = this.maxScale;
        if (this.dasharray) {
            cloneSymbol.dasharray = this.dasharray;
            cloneSymbol.scaleDirty = this.scaleDirty;
            cloneSymbol.uniforms = this.uniforms;
        } else {
            cloneSymbol.uniforms = this.uniforms;
        }
        cloneSymbol.color = this.color;
        cloneSymbol.fixedSize = this.fixedSize;
        cloneSymbol.fixed = {
            isFixed: cloneSymbol.fixedSize,
            addratio: 0
        };
        return cloneSymbol;
    }

    var prototypeAccessors = {
        color: {configurable: true}
    };
    prototypeAccessors.color.set = function (value) {
        var color = Color.parse(value);
        this._color = [color.r, color.g, color.b, color.a];
        if (this.uniforms) this.uniforms['u_color'] = this._color;
    };
    prototypeAccessors.color.get = function () {
        return this._color;
    };

    Object.defineProperties(LineSymbol.prototype, prototypeAccessors);

    return LineSymbol;
});
