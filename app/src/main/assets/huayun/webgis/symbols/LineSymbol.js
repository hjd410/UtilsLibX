//>>built
define("com/huayun/webgis/symbols/LineSymbol",["./Symbol","../utils/Color"],function(_1,_2){var _3=function(_4){if(_4){_1.call(this,_4);this.type="line";this.join=_4.lineJoin||_4.join||"miter";this.cap=_4.lineCap||_4.cap||"butt";var _5=_2.parse(_4.color||"#FF0000"),_6=_4.opacity===undefined?1:_4.opacity;this.width=Number(_4.width);this.length=_4.length||8;this._color=[_5.r,_5.g,_5.b,_5.a];this.opacity=_6;this.gapwidth=_4.gapwidth===undefined?0:_4.gapwidth;this.offset=_4.offset===undefined?0:_4.offset;this.minScale=_4.minScale;this.maxScale=_4.maxScale;if(_4.style==="dash"){_4.dasharray=[5,5];}else{if(_4.style==="solid"){_4.dasharray=null;}}if(_4.dasharray){var _7={from:_4.dasharray,to:_4.dasharray};this.dasharray=_7;this.scaleDirty=true;this.uniforms={"u_ratio":1,"u_color":this.color,"u_opacity":this.opacity,"u_gapwidth":0,"u_width":this.width,"u_blur":0,"u_offset":this.offset,"u_floorwidth":1,"u_mix":1,"ratio":0.5};}else{this.uniforms={"u_ratio":1,"u_color":[_5.r,_5.g,_5.b,_5.a],"u_blur":0,"u_opacity":this.opacity,"u_gapwidth":this.gapwidth,"u_offset":this.offset,"u_width":this.width,"ratio":0.5};}}};if(_1){_3.__proto__=_1;}_3.prototype=Object.create(_1&&_1.prototype);_3.prototype.constructor=_3;_3.prototype.setWidth=function(_8){this.uniforms["u_width"]=_8;};_3.prototype.clone=function(){var _9=new _3();_9.type="line";_9.join=this.join;_9.cap=this.cap;_9.width=this.width;_9.length=this.length;_9.opacity=this.opacity;_9.gapwidth=this.gapwidth;_9.offset=this.offset;_9.minScale=this.minScale;_9.maxScale=this.maxScale;if(this.dasharray){_9.dasharray=this.dasharray;_9.scaleDirty=this.scaleDirty;_9.uniforms=this.uniforms;}else{_9.uniforms=this.uniforms;}_9.color=this.color;_9.fixedSize=this.fixedSize;_9.fixed={isFixed:_9.fixedSize,addratio:0};return _9;};var _a={color:{configurable:true}};_a.color.set=function(_b){var _c=_2.parse(_b);this._color=[_c.r,_c.g,_c.b,_c.a];if(this.uniforms){this.uniforms["u_color"]=this._color;}};_a.color.get=function(){return this._color;};Object.defineProperties(_3.prototype,_a);return _3;});