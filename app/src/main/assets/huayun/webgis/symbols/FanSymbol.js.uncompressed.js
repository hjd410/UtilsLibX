define("com/huayun/webgis/symbols/FanSymbol", [
  "./BaseSymbol",
  "../utils/Color"
], function (BaseSymbol, Color) {
  var FanSymbol = function (params) {
    BaseSymbol.call(this, params);
    this.type = "fan";
    var color = Color.parse(params.color||"#FF0000"),
      opacity = params.opacity === undefined?1: params.opacity,
      strokeColor = Color.parse(params.strokeColor||"#FFFFFF"),
      strokeOpacity = params.strokeOpacity  === undefined?1: params.strokeOpacity;
    this.radius = params.radius||1;
    this.strokeWidth = params.strokeWidth || 0;
    this.pitchWithMap = params.pitchWithMap === undefined?true: params.pitchWithMap;
    this.scaleWithPitch = params.scaleWithPitch === undefined?true: params.scaleWithPitch;
    this.border = params.border === undefined?true:Boolean(params.border);
    this.start = params.start?params.start:0.0;
    this.end = params.end?params.end:0.0;
    this.gap = params.gap?params.gap: 0.01;

    this.uniforms = {
      "color": [color.r, color.g, color.b, color.a],
      "opacity": opacity,
      "u_device_pixel_ratio": 1,
      "u_pitch_with_map": this.pitchWithMap,
      "u_scale_with_map": this.scaleWithPitch,
      "blur": 0,
      "stroke_color": [strokeColor.r, strokeColor.g, strokeColor.b, strokeColor.a],
      "stroke_width": this.strokeWidth,
      "stroke_opacity": strokeOpacity,
      "radius": this.radius,
      "quadrant": params.quadrant,
      "border": this.border,
      "start": this.start,
      "end": this.end,
      "gap": this.gap
    };
  };
  if (BaseSymbol) FanSymbol.__proto__ = BaseSymbol;
  FanSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
  FanSymbol.prototype.constructor = FanSymbol;
  return FanSymbol;
});