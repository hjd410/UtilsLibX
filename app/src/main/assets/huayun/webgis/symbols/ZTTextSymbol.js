//>>built
define("com/huayun/webgis/symbols/ZTTextSymbol",["./BaseSymbol","../utils/Color","./support/glyphManager","./support/GlyphAtlas"],function(_1,_2,_3,_4){var _5=function(_6){_1.call(this,_6);var _7=_2.parse(_6.color||"#FF0000"),_8=_6.opacity===undefined?1:_6.opacity,_9=_6.size===undefined?12:_6.size;var _a=_6.isRotate===undefined?false:_6.isRotate;var _b=_6.rotateRadian===undefined?0:_6.rotateRadian;var _c=_6.offset||[0,0];this.offset=_c.map(function(_d){return _d/_9;});this.hasHalo=!!_6.halo;var _e,_f,_10;if(this.hasHalo){_e=_6.halo.blur||0;_f=_2.parse(_6.halo.color||"#FF0000");_10=_6.halo.width||0;}else{_e=0;_f=_2.parse("#FFF");_10=0;}this.type="zttext";this.uniforms={"u_size":_9,"u_pitch_with_map":0,"u_opacity":_8,"u_texture":0,"u_fill_color":[_7.r,_7.g,_7.b,_7.a],"u_gamma_scale":2,"u_rotate_symbol":_a,"u_radian":_b,"u_halo_color":[_f.r,_f.g,_f.b,_f.a],"u_halo_width":_10,"u_halo_blur":_e,"u_is_halo":this.hasHalo?1:0};var _11=_6.text;this.text=_11;var _12=_6.font||"sans-serif";this.font=_12;var _13={};_13[_12]=[];var _14=0;for(var i=0,len=_11.length;i<len;i++){_14++;_13[_12].push(_11.charCodeAt(i));}this.glyphMap={};this.glyphReady=false;_3.getGlyphsFromPbf(_13,function(err,_15){_14--;if(_15){if(!this.glyphMap[_15.stack]){this.glyphMap[_15.stack]={};}this.glyphMap[_15.stack][_15.id]=_15.glyph;}if(_14<1){this.glyphAtlas=new _4(this.glyphMap);var _16=this.glyphAtlas.image;this.width=_16.width;this.height=_16.height;if(this.finishRequest){this.glyphReady=true;this.finishRequest();}else{this.glyphReady=true;}}}.bind(this));};if(_1){_5.__proto__=_1;}_5.prototype=Object.create(_1&&_1.prototype);_5.prototype.constructor=_5;return _5;});