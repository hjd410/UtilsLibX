//>>built
define("com/huayun/webgis/symbols/SimpleFillSymbol",["./Symbol","./PolygonSymbol","./LineSymbol"],function(_1,_2,_3){function _4(_5){if(_5===undefined){return;}this.type="simpleFill";this.alpha=Number(_5.alpha||1);this.color=_5.color||"#FFF";this.outline=_5.outline;this.fillSymbol=new _2({color:this.color,opacity:this.alpha});if(_5.hasOwnProperty("outline")){if((Array.isArray(_5.outline)&&_5.outline.length>0)){var _6=_5.outline[0].symbols[0];this.lineSymbol=new _3(_6);}else{if(Object.prototype.toString.call(_5.outline)==="[object Object]"){var _6=_5.outline.symbols[0];this.lineSymbol=new _3(_6);}}}};if(_1){_4.__proto__=_1;}_4.prototype=Object.create(_1&&_1.prototype);_4.prototype.constructor=_4;_4.prototype.clone=function(){var _7=new _4();_7.type=this.type;_7.alpha=this.alpha;_7.color=this.color;_7.outline=this.outline;_7.fillSymbol=this.fillSymbol.clone();_7.lineSymbol=this.lineSymbol.clone();return _7;};return _4;});