//>>built
define("com/huayun/webgis/renderer/CompositeFillRenderer",["./SimpleFillRenderer"],function(_1){function _2(){this.renderers=null;};_2.prototype.add=function(_3,_4,_5,_6){if(!this.renderers){this.renderers=[];for(var i=0;i<_6.symbols.length;i++){var s=_6.symbols[i];switch(s.type){case "simpleFill":this.renderers.push(new _1());break;}}}for(var i=0;i<_6.symbols.length;i++){var s=_6.symbols[i];if(_6.minScale){s.minScale=_6.minScale;}if(_6.maxScale){s.maxScale=_6.maxScale;}if(_6.isFixed!==undefined){s.isFixed=_6.isFixed;}if(_6.fixed){s.fixed=_6.fixed;}if(_6.markerSize){s.markerSize=_6.markerSize;}this.renderers[i].add(_3,_4,_5,s);}};_2.prototype.draw=function(_7,_8,_9,_a,_b){for(var i=0;i<_a.symbols.length;i++){var s=_a.symbols[i];this.renderers[i].draw(_7,_8,_9,s,_b,i);}};_2.prototype.drawGlow=function(_c,_d,_e,_f,_10){for(var i=0;i<_f.symbols.length;i++){var s=_f.symbols[i];this.renderers[i].drawGlow(_c,_d,_e,s,_10,i);}};_2.prototype.calculateExtent=function(_11,_12,_13,_14,_15){var _16=[];for(var i=0;i<_14.symbols.length;i++){var s=_14.symbols[i];this.renderers[i].calculateExtent(_11,_12,_13,s,_16,i);}var _17=Infinity,_18=Infinity,_19=-Infinity,_1a=-Infinity;_16.forEach(function(_1b){if(_1b.minX<_17){_17=_1b.minX;}if(_1b.minY<_18){_18=_1b.minY;}if(_1b.maxX>_19){_19=_1b.maxX;}if(_1b.maxY>_1a){_1a=_1b.maxY;}_15.push(_1b);});_12.extent={xmin:_17,ymin:_18,xmax:_19,ymax:_1a};};return _2;});