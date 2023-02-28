//>>built
define("com/huayun/webgis/utils/utils",["exports","custom/gl-matrix-min","./Constant","./Color","../layers/support/expression/Formatted","../data/ArrayType","../layers/support/UnitBezier","../geometry/Point"],function(_1,_2,_3,_4,_5,_6,_7,_8){var _9=_3.layout.EXTENT;_1.now=self.performance&&self.performance.now?self.performance.now.bind(self.performance):Date.now.bind(Date);_1.extend=Object.assign?Object.assign:function(_a){var _b=[],_c=arguments.length-1;while(_c-->0){_b[_c]=arguments[_c+1];}for(var i=0,_d=_b;i<_d.length;i+=1){var _e=_d[i];for(var k in _e){_a[k]=_e[k];}}return _a;};_1.isFunction=function(_f){return typeof _f==="object"&&_f!==null&&!Array.isArray(_f);};function _10(_11){if(Array.isArray(_11)){return _11.map(_10);}else{if(typeof _11==="object"&&_11){return ((_12(_11,_10)));}else{return _11;}}};_1.clone=_10;_1.asyncAll=function(_13,fn,_14){if(!_13.length){return _14(null,[]);}var _15=_13.length;var _16=new Array(_13.length);var _17=null;_13.forEach(function(_18,i){fn(_18,function(err,_19){if(err){_17=err;}_16[i]=_19;if(--_15===0){_14(_17,_16);}});});};_1.values=function(obj){var _1a=[];for(var k in obj){_1a.push(obj[k]);}return _1a;};_1.isCounterClockwise=function isCounterClockwise(a,b,c){return (c.y-a.y)*(b.x-a.x)>(b.y-a.y)*(c.x-a.x);};_1.number=function(a,b,t){return (a*(1-t))+(b*t);};_1.getType=function(val){if(val instanceof Number){return "number";}else{if(val instanceof String){return "string";}else{if(val instanceof Boolean){return "boolean";}else{if(Array.isArray(val)){return "array";}else{if(val===null){return "null";}else{return typeof val;}}}}}};_1.coalesce=function(){for(var i=0;i<arguments.length;i++){if(arguments[i]!==undefined){return arguments[i];}}};function _1b(t){if(t<=0){return 0;}if(t>=1){return 1;}var t2=t*t,t3=t2*t;return 4*(t<0.5?t3:3*(t-t2)+t3-0.75);};_1.easeCubicInOut=_1b;_1.endsWith=function(_1c,_1d){return _1c.indexOf(_1d,_1c.length-_1d.length)!==-1;};function _1e(r,g,b,a){if(!(typeof r==="number"&&r>=0&&r<=255&&typeof g==="number"&&g>=0&&g<=255&&typeof b==="number"&&b>=0&&b<=255)){var _1f=typeof a==="number"?[r,g,b,a]:[r,g,b];return ("Invalid rgba value ["+(_1f.join(", "))+"]: 'r', 'g', and 'b' must be between 0 and 255.");}if(!(typeof a==="undefined"||(typeof a==="number"&&a>=0&&a<=1))){return ("Invalid rgba value ["+([r,g,b,a].join(", "))+"]: 'a' must be between 0 and 1.");}return null;};_1.validateRGBA=_1e;function _20(p1x,p1y,p2x,p2y){var _21=new _7(p1x,p1y,p2x,p2y);return function(t){return _21.solve(t);};};_1.bezier=_20;_1.topDownFeatureComparator=function(a,b){return b-a;};_1.loadGeometry=function(_22){var _23=_9/_22.extent;var _24=_22.loadGeometry();for(var r=0;r<_24.length;r++){var _25=_24[r];for(var p=0;p<_25.length;p++){var _26=_25[p];_26.x=Math.round(_26.x*_23);_26.y=Math.round(_26.y*_23);}}return _24;};_1.arraysIntersect=function(a,b){for(var i=0;i<a.length;i++){if(b.indexOf(a[i])>=0){return true;}}return false;};function _12(_27,_28,_29){var _2a={};for(var key in _27){_2a[key]=_28.call(_29||this,_27[key],key,_27);}return _2a;};_1.mapObject=_12;_1.calculateSignedArea=function(_2b){var sum=0;for(var i=0,len=_2b.length,j=len-1,p1=(void 0),p2=(void 0);i<len;j=i++){p1=_2b[i];p2=_2b[j];sum+=(p2.x-p1.x)*(p1.y+p2.y);}return sum;};_1.keysDifference=function(obj,_2c){var _2d=[];for(var i in obj){if(!(i in _2c)){_2d.push(i);}}return _2d;};function _2e(_2f,_30){return _2f.map(function(p){return _31(p,_30);});};function _31(p,_32){var _33=_2.vec4.transformMat4([],[p.x,p.y,0,1],_32);return new _8(_33[0]/_33[3],_33[1]/_33[3]);};_1.projectPoint=_31;_1.projectQueryGeometry=_2e;_1.bindAll=function(fns,_34){fns.forEach(function(fn){if(!_34[fn]){return;}_34[fn]=_34[fn].bind(_34);});};_1.getPixelPosMatrix=function(_35,_36){var t=_2.mat4.identity([]);_2.mat4.translate(t,t,[1,1,0]);_2.mat4.scale(t,t,[_35.width*0.5,_35.height*0.5,1]);return _2.mat4.multiply(t,t,_35.calculatePosMatrix(_36.toUnwrapped()));};function _37(p,_38,_39){var _3a=_39*_39;if(_38.length===1){return p.distSqr(_38[0])<_3a;}for(var i=1;i<_38.length;i++){var v=_38[i-1],w=_38[i];if(_3b(p,v,w)<_3a){return true;}}return false;};function _3b(p,v,w){var l2=v.distSqr(w);if(l2===0){return p.distSqr(v);}var t=((p.x-v.x)*(w.x-v.x)+(p.y-v.y)*(w.y-v.y))/l2;if(t<0){return p.distSqr(v);}if(t>1){return p.distSqr(w);}return p.distSqr(w.sub(v)._mult(t)._add(v));};function _3c(_3d,p){var c=false;for(var i=0,j=_3d.length-1;i<_3d.length;j=i++){var p1=_3d[i];var p2=_3d[j];if(((p1.y>p.y)!==(p2.y>p.y))&&(p.x<(p2.x-p1.x)*(p.y-p1.y)/(p2.y-p1.y)+p1.x)){c=!c;}}return c;};function _3e(_3f,_40,_41){if(_3c(_3f,_40)){return true;}if(_37(_40,_3f,_41)){return true;}return false;};_1.polygonIntersectsBufferedPoint=_3e;_1.polygonContainsPoint=_3c;function _42(a,b){var idA=a.tileID;var idB=b.tileID;return (idA.overscaledZ-idB.overscaledZ)||(idA.canonical.y-idB.canonical.y)||(idA.wrap-idB.wrap)||(idA.canonical.x-idB.canonical.x);};_1.sortTilesIn=_42;_1.ease=_20(0.25,0.1,0.25,1);_1.isEntirelyOutside=function(_43){return _43.every(function(p){return p.x<0;})||_43.every(function(p){return p.x>_9;})||_43.every(function(p){return p.y<0;})||_43.every(function(p){return p.y>_9;});};_1.isBoundaryEdge=function(p1,p2){return (p1.x===p2.x&&(p1.x<0||p1.x>_9))||(p1.y===p2.y&&(p1.y<0||p1.y>_9));};_1.pick=function(src,_44){var _45={};for(var i=0;i<_44.length;i++){var k=_44[i];if(k in src){_45[k]=src[k];}}return _45;};_1.align=function(_46,_47){return Math.ceil(_46/_47)*_47;};function _48(ids,_49,_4a,_4b){if(_4a>=_4b){return;}var _4c=ids[(_4a+_4b)>>1];var i=_4a-1;var j=_4b+1;while(true){do{i++;}while(ids[i]<_4c);do{j--;}while(ids[j]>_4c);if(i>=j){break;}_4d(ids,i,j);_4d(_49,3*i,3*j);_4d(_49,3*i+1,3*j+1);_4d(_49,3*i+2,3*j+2);}_48(ids,_49,_4a,j);_48(ids,_49,j+1,_4b);};function _4d(arr,i,j){var tmp=arr[i];arr[i]=arr[j];arr[j]=tmp;};_1.sort=_48;_1.swap=_4d;function _4e(a,b){if(Array.isArray(a)){if(!Array.isArray(b)||a.length!==b.length){return false;}for(var i=0;i<a.length;i++){if(!_4e(a[i],b[i])){return false;}}return true;}if(typeof a==="object"&&a!==null&&b!==null){if(!(typeof b==="object")){return false;}var _4f=Object.keys(a);if(_4f.length!==Object.keys(b).length){return false;}for(var key in a){if(!_4e(a[key],b[key])){return false;}}return true;}return a===b;};_1.deepEqual=_4e;function _50(_51){return _51["property-type"]==="data-driven"||_51["property-type"]==="cross-faded-data-driven";};_1.supportsPropertyExpression=_50;function _52(_53){return !!_53.expression&&_53.expression.parameters.indexOf("zoom")>-1;};_1.supportsZoomExpression=_52;function _54(_55){return !!_55.expression&&_55.expression.interpolated;};_1.supportsInterpolation=_54;function _56(_57,_58){var _59=_57.length-1;var _5a=0;var _5b=_59;var _5c=0;var _5d,_5e;while(_5a<=_5b){_5c=Math.floor((_5a+_5b)/2);_5d=_57[_5c];_5e=_57[_5c+1];if(_5d<=_58){if(_5c===_59||_58<_5e){return _5c;}_5a=_5c+1;}else{if(_5d>_58){_5b=_5c-1;}else{throw new Error("Input is not a number.");}}}return 0;};_1.findStopLessThanOrEqualTo=_56;_1.pixelsToTileUnits=function(_5f,_60,z){return _60*(_3.layout.EXTENT/(_5f.tileSize*Math.pow(2,z-_5f.tileID.overscaledZ)));};function _61(_62,_63){var _64={"text-opacity":["opacity"],"icon-opacity":["opacity"],"text-color":["fill_color"],"icon-color":["fill_color"],"text-halo-color":["halo_color"],"icon-halo-color":["halo_color"],"text-halo-blur":["halo_blur"],"icon-halo-blur":["halo_blur"],"text-halo-width":["halo_width"],"icon-halo-width":["halo_width"],"line-gap-width":["gapwidth"],"line-pattern":["pattern_to","pattern_from"],"fill-pattern":["pattern_to","pattern_from"],"fill-extrusion-pattern":["pattern_to","pattern_from"]};return _64[_62]||[_62.replace((_63+"-"),"").replace(/-/g,"_")];};_1.paintAttributeNames=_61;function _65(_66){var _67={"line-pattern":{"source":_6.StructArrayLayout8ui16,"composite":_6.StructArrayLayout8ui16},"fill-pattern":{"source":_6.StructArrayLayout8ui16,"composite":_6.StructArrayLayout8ui16},"fill-extrusion-pattern":{"source":_6.StructArrayLayout8ui16,"composite":_6.StructArrayLayout8ui16}};return _67[_66];};_1.getLayoutException=_65;function _68(_69,_6a,_6b){var _6c={"color":{"source":_6.StructArrayLayout2f8,"composite":_6.StructArrayLayout4f16},"number":{"source":_6.StructArrayLayout1f4,"composite":_6.StructArrayLayout2f8}};var _6d=_65(_69);return _6d&&_6d[_6b]||_6c[_6a][_6b];};_1.layoutType=_68;function _6e(n,min,max){return Math.min(max,Math.max(min,n));};_1.clamp=_6e;function _6f(a,b){a=_6e(Math.floor(a),0,255);b=_6e(Math.floor(b),0,255);return 256*a+b;};_1.packUint8ToFloat=_6f;function _70(_71){return [_6f(255*_71.r,255*_71.g),_6f(255*_71.b,255*_71.a)];};_1.packColor=_70;function _72(ch){if(ch===746||ch===747){return true;}if(ch<4352){return false;}if(_3.unicodeBlockLookup["Bopomofo Extended"](ch)){return true;}if(_3.unicodeBlockLookup["Bopomofo"](ch)){return true;}if(_3.unicodeBlockLookup["CJK Compatibility Forms"](ch)){if(!((ch>=65097&&ch<=65103))){return true;}}if(_3.unicodeBlockLookup["CJK Compatibility Ideographs"](ch)){return true;}if(_3.unicodeBlockLookup["CJK Compatibility"](ch)){return true;}if(_3.unicodeBlockLookup["CJK Radicals Supplement"](ch)){return true;}if(_3.unicodeBlockLookup["CJK Strokes"](ch)){return true;}if(_3.unicodeBlockLookup["CJK Symbols and Punctuation"](ch)){if(!((ch>=12296&&ch<=12305))&&!((ch>=12308&&ch<=12319))&&ch!==12336){return true;}}if(_3.unicodeBlockLookup["CJK Unified Ideographs Extension A"](ch)){return true;}if(_3.unicodeBlockLookup["CJK Unified Ideographs"](ch)){return true;}if(_3.unicodeBlockLookup["Enclosed CJK Letters and Months"](ch)){return true;}if(_3.unicodeBlockLookup["Hangul Compatibility Jamo"](ch)){return true;}if(_3.unicodeBlockLookup["Hangul Jamo Extended-A"](ch)){return true;}if(_3.unicodeBlockLookup["Hangul Jamo Extended-B"](ch)){return true;}if(_3.unicodeBlockLookup["Hangul Jamo"](ch)){return true;}if(_3.unicodeBlockLookup["Hangul Syllables"](ch)){return true;}if(_3.unicodeBlockLookup["Hiragana"](ch)){return true;}if(_3.unicodeBlockLookup["Ideographic Description Characters"](ch)){return true;}if(_3.unicodeBlockLookup["Kanbun"](ch)){return true;}if(_3.unicodeBlockLookup["Kangxi Radicals"](ch)){return true;}if(_3.unicodeBlockLookup["Katakana Phonetic Extensions"](ch)){return true;}if(_3.unicodeBlockLookup["Katakana"](ch)){if(ch!==12540){return true;}}if(_3.unicodeBlockLookup["Halfwidth and Fullwidth Forms"](ch)){if(ch!==65288&&ch!==65289&&ch!==65293&&!((ch>=65306&&ch<=65310))&&ch!==65339&&ch!==65341&&ch!==65343&&!(ch>=65371&&ch<=65503)&&ch!==65507&&!(ch>=65512&&ch<=65519)){return true;}}if(_3.unicodeBlockLookup["Small Form Variants"](ch)){if(!((ch>=65112&&ch<=65118))&&!((ch>=65123&&ch<=65126))){return true;}}if(_3.unicodeBlockLookup["Unified Canadian Aboriginal Syllabics"](ch)){return true;}if(_3.unicodeBlockLookup["Unified Canadian Aboriginal Syllabics Extended"](ch)){return true;}if(_3.unicodeBlockLookup["Vertical Forms"](ch)){return true;}if(_3.unicodeBlockLookup["Yijing Hexagram Symbols"](ch)){return true;}if(_3.unicodeBlockLookup["Yi Syllables"](ch)){return true;}return !!_3.unicodeBlockLookup["Yi Radicals"](ch);};_1.charHasUprightVerticalOrientation=_72;function _73(_74){for(var i=0,_75=_74;i<_75.length;i+=1){var ch=_75[i];if(_72(ch.charCodeAt(0))){return true;}}return false;};_1.allowsVerticalWritingMode=_73;function _76(a,b){return ((a%32)-(b%32))||(b-a);};_1.compareKeyZoom=_76;});