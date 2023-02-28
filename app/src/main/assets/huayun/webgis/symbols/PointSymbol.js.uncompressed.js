/**
 * 点Symbol
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.PointSymbol
 */
define("com/huayun/webgis/symbols/PointSymbol", [
    "./Symbol",
    "../utils/Color"
], function (BaseSymbol, Color) {
    /**
     * 点Symbol
     * @constructor
     * @alias com.huayun.webgis.symbols.PointSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {String} params.color 颜色
     * @param {number} params.opacity 透明度
     * @param {number} params.radius 点的半径
     * @param {number} params.strokeWidth 描边宽度
     * @param {number} params.strokeOpacity 描边透明度
     * @param {String} params.strokeColor  描边颜色
     * @property {String} color  点的颜色
     * @property {number} opacity  点的透明度
     * @property {number} radius  点的半径
     * @property {number} strokeWidth  描边宽度
     * @property {number} strokeOpacity 描边透明度
     */
    var PointSymbol = function (params) {
        BaseSymbol.call(this, params);
        this.type = "point";
        var color = Color.parse(params.color||"#FF0000"),
            opacity = params.opacity ===  undefined?1: params.opacity,
            radius = params.radius || 5,
            strokeColor = Color.parse(params.strokeColor||"#FFFFFF"),
            strokeWidth = params.strokeWidth || 0,
            strokeOpacity = params.strokeOpacity || 1;
        this.color = color;
        this.opacity = opacity;
        this.radius = radius;
        this.strokeWidth = strokeWidth;

        this.pitchWithMap = !!params.pitchWithMap;
        this.scaleWithPitch = !!params.scaleWithPitch;
        this.uniforms = {
            "color": [color.r, color.g, color.b, color.a],
            "opacity": opacity,
            "u_device_pixel_ratio": 1,
            "u_pitch_with_map": this.pitchWithMap,
            "u_scale_with_map": this.scaleWithPitch,
            "blur": 0,
            "radius": radius,
            "stroke_color": [strokeColor.r, strokeColor.g, strokeColor.b, strokeColor.a],
            "stroke_width": strokeWidth,
            "stroke_opacity": strokeOpacity
        };
    };
    if (BaseSymbol) PointSymbol.__proto__ = BaseSymbol;
    PointSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
    PointSymbol.prototype.constructor = PointSymbol;

    return PointSymbol;
});