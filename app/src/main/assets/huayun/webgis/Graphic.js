//>>built
define("com/huayun/webgis/Graphic",["./utils/Color"],function(_1){var u=0;function _2(_3){this.id=_3.id===undefined?u++:_3.id;this.feature=_3.feature;this.layer=_3.layer;this.symbol=_3.symbol;this.position=null;this.visible=_3.visible===undefined?true:_3.visible;this.selectEnabled=_3.selectEnabled===undefined?true:_3.selectEnabled;this._glow=null;this.buckets=[];this.isChangeSymbol=true;this.renderer=_3.renderer?_3.renderer:null;};_2.prototype.setVisible=function(_4){this.visible=value;};_2.prototype.updatePosition=function(dx,dy,dz){this.position[0]+=dx;this.position[1]+=dy;if(dz){this.position[2]+=dz;}};_2.prototype.updateGeometry=function(dx,dy){this.layer.indexNeedUpdate=true;this.feature.geometry.update(dx,dy);};_2.prototype.getAttribute=function(_5){return this.feature.attributes.find(function(_6){return _6.name&&_6.name.toLowerCase()===_5.toLowerCase();});};_2.prototype.updateSymbol=function(_7){this.symbol=_7;this.layer.layerView.view.threeRender();};_2.prototype.reset=function(){var _8=this.buckets;if(_8){_8.forEach(function(_9){_9.destroy();});}this.buckets=[];};_2.prototype.destroy=function(){this.buckets.forEach(function(_a){_a.destroy();});this.buckets=[];};var _b={glow:{configurable:true}};_b.glow.set=function(_c){if(_c&&_c.color){this._glow=_c;var _d=_1.parse(_c.color);this._glow.color=[_d.r,_d.g,_d.b,_d.a];}else{this._glow=null;}};_b.glow.get=function(){return this._glow;};Object.defineProperties(_2.prototype,_b);return _2;});