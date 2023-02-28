define("com/huayun/webgis/symbols/LevelPointSymbol", [
    "./BaseSymbol",
    "../utils/Color"
], function (BaseSymbol, Color) {
    var PointSymbol = function (params) {
        BaseSymbol.call(this, params);
        this.type = "point";
        var color = Color.parse(params.color||"#FF0000"),
            opacity = params.opacity ===  undefined?1: params.opacity,
            strokeColor = Color.parse(params.strokeColor||"#FFFFFF"),
            strokeWidth = params.strokeWidth || 0,
            strokeOpacity = params.strokeOpacity || 1;

        this.levelRadius = params.levelRadius;

        this.pitchWithMap = !!params.pitchWithMap;
        this.scaleWithPitch = !!params.scaleWithPitch;
        this.uniforms = {
            "color": [color.r, color.g, color.b, color.a],
            "opacity": opacity,
            "u_device_pixel_ratio": 1,
            "u_pitch_with_map": this.pitchWithMap,
            "u_scale_with_map": this.scaleWithPitch,
            "blur": 0,
            "radius": 1,
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