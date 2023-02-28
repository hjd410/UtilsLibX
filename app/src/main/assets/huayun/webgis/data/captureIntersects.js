//>>built
define("com/huayun/webgis/data/captureIntersects",["exports","../utils/utils","custom/gl-matrix-min"],function(_1,_2,_3){function _4(_5,p){var c=false;for(var i=0,j=_5.length-1;i<_5.length;j=i++){var p1=_5[i];var p2=_5[j];if(((p1.y>p.y)!==(p2.y>p.y))&&(p.x<(p2.x-p1.x)*(p.y-p1.y)/(p2.y-p1.y)+p1.x)){c=!c;}}return c;};function _6(a0,a1,b0,b1){return _2.isCounterClockwise(a0,b0,b1)!==_2.isCounterClockwise(a1,b0,b1)&&_2.isCounterClockwise(a0,a1,b0)!==_2.isCounterClockwise(a0,a1,b1);};function _7(p,v,w){var l2=v.distSqr(w);if(l2===0){return p.distSqr(v);}var t=((p.x-v.x)*(w.x-v.x)+(p.y-v.y)*(w.y-v.y))/l2;if(t<0){return p.distSqr(v);}if(t>1){return p.distSqr(w);}return p.distSqr(w.sub(v)._mult(t)._add(v));};function _8(p,_9,_a){var _b=_a*_a;if(_9.length===1){return p.distSqr(_9[0])<_b;}for(var i=1;i<_9.length;i++){var v=_9[i-1],w=_9[i];if(_7(p,v,w)<_b){return true;}}return false;};function _c(_d,_e){var t=_3.mat4.identity([]);_3.mat4.translate(t,t,[1,1,0]);_3.mat4.scale(t,t,[_d.width*0.5,_d.height*0.5,1]);return _3.mat4.multiply(t,t,_e);};function _f(_10,_11,_12){if(_4(_10,_11)){return true;}if(_8(_11,_10,_12)){return true;}return false;};function _13(_14,_15,_16,_17,_18,_19){var _1a=_c(_19,_16.uniforms.u_matrix);var _1b=_16.strokeWidth||0;_18=_16.captureRadius||15;var _1c=_18+_1b;var _1d=_16.pitchWithMap;var _1e=_1d?_14:_2.projectQueryGeometry(_14,_1a);var _1f=(_18+_1b);var _20=_15;var _21=_1d?_20:_2.projectPoint(_20,_1a);var _22=_1f;var _23=_3.vec4.transformMat4([],[_20.x,_20.y,0,1],_1a);if(!_16.scaleWithPitch&&_1d){_22*=_23[3]/_19.cameraToCenterDistance;}else{if(_16.scaleWithPitch&&!_1d){_22*=_19.cameraToCenterDistance/_23[3];}}if(_f(_1e,_21,_22)){return true;}};_1.point=_13;function _24(_25,_26){if(_25.length===0||_26.length===0){return false;}for(var i=0;i<_25.length-1;i++){var a0=_25[i];var a1=_25[i+1];for(var j=0;j<_26.length-1;j++){var b0=_26[j];var b1=_26[j+1];if(_6(a0,a1,b0,b1)){return true;}}}return false;};function _27(_28,_29,_2a){if(_28.length>1){if(_24(_28,_29)){return true;}for(var j=0;j<_29.length;j++){if(_8(_29[j],_28,_2a)){return true;}}}for(var k=0;k<_28.length;k++){if(_8(_28[k],_29,_2a)){return true;}}return false;};function _2b(_2c,_2d,_2e,_2f,_30,_31,_32){_2d=_2d.path;var _30=(_2e.width+_32||4)*_2f/2;for(var i=0;i<_2d.length;i++){var _33=_2d[i];if(_2c.length>=3){for(var k=0;k<_33.length;k++){if(_4(_2c,_33[k])){return true;}}}if(_27(_2c,_33,_30)){return true;}}return false;};_1.line=_2b;});