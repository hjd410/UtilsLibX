//>>built
define("com/huayun/webgis/symbols/FanSymbol",["./BaseSymbol","../utils/Color"],function(_1,_2){var _3=function(_4){_1.call(this,_4);this.type="fan";var _5=_2.parse(_4.color||"#FF0000"),_6=_4.opacity===undefined?1:_4.opacity,_7=_2.parse(_4.strokeColor||"#FFFFFF"),_8=_4.strokeOpacity===undefined?1:_4.strokeOpacity;this.radius=_4.radius||1;this.strokeWidth=_4.strokeWidth||0;this.pitchWithMap=_4.pitchWithMap===undefined?true:_4.pitchWithMap;this.scaleWithPitch=_4.scaleWithPitch===undefined?true:_4.scaleWithPitch;this.border=_4.border===undefined?true:Boolean(_4.border);this.start=_4.start?_4.start:0;this.end=_4.end?_4.end:0;this.gap=_4.gap?_4.gap:0.01;this.uniforms={"color":[_5.r,_5.g,_5.b,_5.a],"opacity":_6,"u_device_pixel_ratio":1,"u_pitch_with_map":this.pitchWithMap,"u_scale_with_map":this.scaleWithPitch,"blur":0,"stroke_color":[_7.r,_7.g,_7.b,_7.a],"stroke_width":this.strokeWidth,"stroke_opacity":_8,"radius":this.radius,"quadrant":_4.quadrant,"border":this.border,"start":this.start,"end":this.end,"gap":this.gap};};if(_1){_3.__proto__=_1;}_3.prototype=Object.create(_1&&_1.prototype);_3.prototype.constructor=_3;return _3;});