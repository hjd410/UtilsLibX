//>>built
define("com/huayun/webgis/symbols/CircleSymbol",["./Symbol","../utils/Color"],function(_1,_2){var _3=function(_4){_1.call(this,_4);this.type="circle";var _5=_2.parse(_4.color||_4.fill||"#FF0000"),_6=_4.opacity||1,_7=_2.parse(_4.strokeColor||_4.stroke||"#FFFFFF"),_8=_4.strokeOpacity||1;this.radius=Number(_4.radius||_4.r||5);this.strokeWidth=Number(_4.strokeWidth||_4["stroke-width"]||0);this.pitchWithMap=!!_4.pitchWithMap;this.scaleWithPitch=!!_4.scaleWithPitch;this.dx=Number(_4.dx||0);this.dy=Number(_4.dy||0);this.angle=Number(_4.angle||0);this.color=[_5.r,_5.g,_5.b,_5.a];this.strokeColor=[_7.r,_7.g,_7.b,_7.a];this.uniforms={"color":this.color,"opacity":_6,"u_device_pixel_ratio":1,"u_pitch_with_map":this.pitchWithMap,"u_scale_with_map":this.scaleWithPitch,"blur":0,"stroke_color":this.strokeColor,"stroke_width":this.strokeWidth,"stroke_opacity":_8,"radius":this.radius,"u_radian":0};};if(_1){_3.__proto__=_1;}_3.prototype=Object.create(_1&&_1.prototype);_3.prototype.constructor=_3;_3.prototype.setRadius=function(_9){this.radius=_9;this.uniforms["radius"]=_9;};_3.prototype.setStrokeWidth=function(_a){this.uniforms["stroke_width"]=_a;};return _3;});