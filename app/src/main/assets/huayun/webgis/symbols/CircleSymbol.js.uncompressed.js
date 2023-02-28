/**
 * 点符号的圆样式
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.CircleSymbol
 */
define("com/huayun/webgis/symbols/CircleSymbol", [
    "./Symbol",
    "../utils/Color"
], function (BaseSymbol, Color) {
    /**
     * 点符号的圆样式
     * @constructor
     * @alias com.huayun.webgis.symbols.CircleSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {String} params.fill 圆的颜色, 支持CSS格式
     * @param {number} params.opacity 圆的透明度,0到1范围
     * @param {String} params.stroke 圆边界线的颜色, 支持CSS格式
     * @param {number} params.stroke-width 圆边界线的宽度, 不能是负数
     * @param {number} params.dx 圆在x方向上的偏移
     * @param {number} params.dy 圆在y方向上的偏移
     * @param {number} params.radius 圆的半径, 单位像素
     * @property {string} type - 图标类型
     * @property {Array} color 圆的颜色
     * @property {Array} strokeColor 边界线的颜色
     * @property {number} strokeWidth 边界线的宽度
     * @property {number} radius 圆的半径
     * @property {number} dx 圆在x方向上的偏移
     * @property {number} dy 圆在y方向上的偏移
     */
    var CircleSymbol = function (params) {
        BaseSymbol.call(this, params);
        this.type = "circle";
        var color = Color.parse(params.color || params.fill || "#FF0000"),
            opacity = params.opacity || 1,
            strokeColor = Color.parse(params.strokeColor || params.stroke || "#FFFFFF"),
            strokeOpacity = params.strokeOpacity || 1;
        this.radius = Number(params.radius || params.r || 5);
        this.strokeWidth = Number(params.strokeWidth || params['stroke-width'] || 0);
        this.pitchWithMap = !!params.pitchWithMap;
        this.scaleWithPitch = !!params.scaleWithPitch;
        this.dx = Number(params.dx || 0);
        this.dy = Number(params.dy || 0);
        this.angle = Number(params.angle || 0);
        this.color = [color.r, color.g, color.b, color.a];
        this.strokeColor = [strokeColor.r, strokeColor.g, strokeColor.b, strokeColor.a];

        this.uniforms = {
            "color": this.color,
            "opacity": opacity,
            "u_device_pixel_ratio": 1,
            "u_pitch_with_map": this.pitchWithMap,
            "u_scale_with_map": this.scaleWithPitch,
            "blur": 0,
            "stroke_color": this.strokeColor,
            "stroke_width": this.strokeWidth,
            "stroke_opacity": strokeOpacity,
            "radius": this.radius,
            "u_radian": 0
        };
    };
    if (BaseSymbol) CircleSymbol.__proto__ = BaseSymbol;
    CircleSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
    CircleSymbol.prototype.constructor = CircleSymbol;

    /**
     * 设置圆符号的半径大小
     * @param {number} radius 半径大小
     */
    CircleSymbol.prototype.setRadius = function (radius) {
        this.radius = radius;
        this.uniforms["radius"] = radius;
    };

    /**
     * 设置圆符号的边界线宽度
     * @param {number} strokeWidth 边界线大小
     */
    CircleSymbol.prototype.setStrokeWidth = function (strokeWidth) {
        this.uniforms["stroke_width"] = strokeWidth;
    };

    return CircleSymbol;
});
