//>>built
define("com/huayun/webgis/symbols/Symbol",[],function(){function _1(_2){if(_2){this.minScale=_2.minScale===undefined?1:_2.minScale;this.maxScale=_2.maxScale===undefined?1:_2.maxScale;this.dx=_2.dx===undefined?0:_2.dx;this.dy=_2.dy===undefined?0:_2.dy;if(_2.isFixed===false){this.isFixed=false;}else{if(_2.symbol===undefined){this.isFixed=true;}else{this.isFixed=_2.isFixed===undefined;}}this.renderer=_2.renderer===undefined?null:_2.renderer;this.fixed={isFixed:this.isFixed,addratio:0};}};_1.prototype.clone=function(){};return _1;});