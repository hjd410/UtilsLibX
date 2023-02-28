//>>built
define("com/huayun/webgis/renderer/DecorationLineRenderer",["./Renderer","./LineRenderer","./FontRenderer","./RectRenderer","../geometry/Point","../utils/MathUtils"],function(_1,_2,_3,_4,_5,_6){function _7(){};if(_1){_7.__proto__=_1;}_7.prototype=Object.create(_1&&_1.prototype);_7.prototype.constructor=_7;_7.prototype.add=function(_8,_9,_a,_b,_c){if(!_c){_c=0;}var sP=_8.geometryToScreen(_a.path[0][0].x,_a.path[0][0].y);var eP=_8.geometryToScreen(_a.path[0][1].x,_a.path[0][1].y);var dx=sP.x-eP.x;var dy=sP.y-eP.y;var _d=Math.sqrt(dx*dx+dy*dy)*_b.minScale/_8.scale;if(!this.renderers){this.renderers=[];this.renderers.push(new _2());for(var i=0;i<_b.symbols.length;i++){var s=_b.symbols[i];s.markerSize=_b.adaptratio===0?_d:_b.adaptratio*_d;switch(s.type){case "fontSymbol":this.renderers.push(new _3());break;case "rect":this.renderers.push(new _4());break;}}}else{for(var j=0;j<_b.symbols.length;j++){var _e=_b.symbols[j];_e.markerSize=_b.adaptratio===0?undefined:_b.adaptratio*_d;}}this.renderers[0].add(_8,_9,_a,_b.lineSymbol,_c);var _f=_a.path[0];var _10=_6.calculateCenterOfLine(_f);_10=_10.center;_9.rotation=_f[0].radian(_f[1]);_9.markerPoint=_10;for(j=0;j<_b.symbols.length;j++){s=_b.symbols[j];if(_b.minScale){s.minScale=_b.minScale;}if(_b.maxScale){s.maxScale=_b.maxScale;}if(_b.isFixed!==undefined){s.isFixed=_b.isFixed;}if(_b.fixed){s.fixed=_b.fixed;}if(_b.markerSize){s.markerSize=_b.markerSize;}this.renderers[j+1].add(_8,_9,_10,s,_c+j+1);}};_7.prototype.draw=function(_11,_12,_13,_14,_15,_16){if(!_16){_16=0;}this.renderers[0].draw(_11,_12,_13,_14.lineSymbol,_15,_16);for(var i=_14.symbols.length-1;i>-1;i--){var s=_14.symbols[i];s.setRadian(_12.markerAngle);this.renderers[i+1].draw(_11,_12,_13,s,_15,i+_16+1);}};_7.prototype.drawGlow=function(_17,_18,_19,_1a,_1b,_1c){if(!_1c){_1c=0;}this.renderers[0].drawGlow(_17,_18,_19,_1a.lineSymbol,_1b,_1c);for(var i=_1a.symbols.length-1;i>-1;i--){var s=_1a.symbols[i];s.setRadian(_18.markerAngle);this.renderers[i+1].drawGlow(_17,_18,_19,s,_1b,i+_1c+1);}};_7.prototype.calculateExtent=function(_1d,_1e,_1f,_20,_21,_22){if(!_22){_22=0;}this.renderers[0].calculateExtent(_1d,_1e,_1f,_20.lineSymbol,_21,_22);for(var i=0;i<_20.symbols.length;i++){var s=_20.symbols[i];this.renderers[i+1].calculateExtent(_1d,_1e,_1e.markerPoint,s,_21,i+_22+1);}};return _7;});