//>>built
define("com/huayun/webgis/renderer/LeadLineRenderer",["./Renderer","./LineRenderer","./FontRenderer","./RectRenderer","../utils/MathUtils"],function(_1,_2,_3,_4,_5){function _6(_7){this.markerSize=null;this.markerRotation=null;this.markerScaleFactor=null;this.renderers={};};if(_1){_6.__proto__=_1;}_6.prototype=Object.create(_1&&_1.prototype);_6.prototype.constructor=_6;_6.prototype.add=function(_8,_9,_a,_b,_c){this.markerSize=_b.markerSize;this.markerRotation=_9.markerRotation;this.markerScaleFactor=_9.markerScaleFactor;if(!_c){_c=0;}if(!this.renderers.hasOwnProperty("lineSymbol")){this.renderers["lineSymbol"]=new _2();}for(var i=0;i<_b.symbols.length;i++){var s=_b.symbols[i];switch(s.type){case "fontSymbol":if(!this.renderers.hasOwnProperty("fontSymbol")){this.renderers["fontSymbol"]=new _3();}break;case "rect":if(!this.renderers.hasOwnProperty("rect")){this.renderers["rect"]=new _4();}break;}}this.renderers["lineSymbol"].add(_8,_9,_a,_b.lineSymbol,_c);var _d=_a.path[0];var _e=_d[1];_9.rotation=_9.markerRotation;_9.markerPoint=_e;for(i=0;i<_b.symbols.length;i++){s=_b.symbols[i];if(_b.minScale){s.minScale=_b.minScale;}if(_b.maxScale){s.maxScale=_b.maxScale;}if(_b.isFixed!==undefined){s.isFixed=_b.isFixed;}if(_b.fixed){s.fixed=_b.fixed;}if(_b.markerSize){s.markerSize=_b.markerSize;}this.renderers[s.type].add(_8,_9,_e,s,_c+i+1);}};_6.prototype.draw=function(_f,_10,_11,_12,_13,_14){if(!_14){_14=0;}this.renderers["lineSymbol"].draw(_f,_10,_11,_12.lineSymbol,_13,_14);for(var i=_12.symbols.length-1;i>=0;i--){var s=_12.symbols[i];if(s.hasOwnProperty("fontFamily")&&s.fontFamily!=="FontSymbol"){s.markerSize=undefined;}s.setRadian(_10.rotation);this.renderers[s.type].draw(_f,_10,_11,s,_13,i+_14+1);}};_6.prototype.drawGlow=function(_15,_16,_17,_18,_19,_1a){if(!_1a){_1a=0;}this.renderers["lineSymbol"].drawGlow(_15,_16,_17,_18.lineSymbol,_19,_1a);for(var i=_18.symbols.length-1;i>=0;i--){var s=_18.symbols[i];if(s.hasOwnProperty("fontFamily")&&s.fontFamily!=="FontSymbol"){s.markerSize=undefined;}s.setRadian(_16.rotation);this.renderers[s.type].drawGlow(_15,_16,_17,s,_19,i+_1a+1);}};_6.prototype.calculateExtent=function(_1b,_1c,_1d,_1e,_1f,_20){if(!_20){_20=0;}this.renderers["lineSymbol"].calculateExtent(_1b,_1c,_1d,_1e.lineSymbol,_1f,_20);for(var i=0;i<_1e.symbols.length;i++){var s=_1e.symbols[i];this.renderers[s.type].calculateExtent(_1b,_1c,_1c.markerPoint,s,_1f,i+_20+1);}};return _6;});