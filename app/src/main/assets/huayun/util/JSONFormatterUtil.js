//>>built
define("com/huayun/util/JSONFormatterUtil",["dojo/json"],function(_1){return (function(){var _2=/_+((\w+-*)+)/;function _3(){};_3.formatterKey=function(_4){var _5={};if(typeof _4==="string"){return _4;}for(var _6 in _4){if(_4.hasOwnProperty(_6)){var _7=_4[_6];if(_2.test(_6)){_5[RegExp.$1]=_7;}else{_5[_6]=_7;}}}return _5;};_3.merge=function(_8,_9){_8.forEach(function(_a){if(_a["baseid"]===_9["baseid"]){for(var _b in _a){if(_a.hasOwnProperty(_b)&&!_9.hasOwnProperty(_b)){_9[_b]=_a[_b];}}}});return _9;};function _c(_d,_e){var _f=_d["_baseid"];for(var _10 in _e.styles){if(_e.styles.hasOwnProperty(_10)){var _11=_e.styles[_10];if(!Array.isArray(_11.style)){_11=[_11.style];}else{_11=_11.style;}for(var _12 in _11){if(_11.hasOwnProperty(_12)){var _13=_11[_12];for(var _14 in _13){if(_13.hasOwnProperty(_14)){var _15=_13[_14];if(Object.prototype.toString.call(_15)==="[object Object]"){if(_f===_15["_baseid"]){for(var _16 in _d){if(_d.hasOwnProperty(_16)&&!_15.hasOwnProperty(_16)){_15[_16]=_d[_16];}}}}}}}}}}};_3.string2Json=function(str){return _1.parse(str);};_3.json2String=function(_17){return _1.stringify(_17);};_3.findNode=function(_18,_19,key){var _1a=[],_1b,_1c;_1b=_18;var _1d=_1e(_18,_19,key,_1a,_1b,_1c);if(typeof key==="undefined"){}else{}};function _1e(obj,_1f,key,_20,_21,_22){var _23=Object.keys(obj);var len=_23.length;for(var i=0;i<len;i++){var _24=_23[i];var _25=obj[_24];if(Object.prototype.toString.call(_25)==="[object Object]"){}else{var reg=/_(\w+)/;if(reg.test(_24)){if(RegExp.$1===_1f){}}}}return Object.keys(obj);};return _3;}());});