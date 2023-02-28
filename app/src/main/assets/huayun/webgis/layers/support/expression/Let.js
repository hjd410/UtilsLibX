//>>built
define("com/huayun/webgis/layers/support/expression/Let",[],function(){var _1=function _1(_2,_3){this.type=_3.type;this.bindings=[].concat(_2);this.result=_3;};_1.prototype.evaluate=function(_4){return this.result.evaluate(_4);};_1.prototype.eachChild=function(fn){for(var i=0,_5=this.bindings;i<_5.length;i+=1){var _6=_5[i];fn(_6[1]);}fn(this.result);};_1.parse=function(_7,_8){if(_7.length<4){return _8.error(("Expected at least 3 arguments, but found "+(_7.length-1)+" instead."));}var _9=[];for(var i=1;i<_7.length-1;i+=2){var _a=_7[i];if(typeof _a!=="string"){return _8.error(("Expected string, but found "+(typeof _a)+" instead."),i);}if(/[^a-zA-Z0-9_]/.test(_a)){return _8.error("Variable names must contain only alphanumeric characters or '_'.",i);}var _b=_8.parse(_7[i+1],i+1);if(!_b){return null;}_9.push([_a,_b]);}var _c=_8.parse(_7[_7.length-1],_7.length-1,_8.expectedType,_9);if(!_c){return null;}return new _1(_9,_c);};_1.prototype.possibleOutputs=function(){return this.result.possibleOutputs();};_1.prototype.serialize=function(){var _d=["let"];for(var i=0,_e=this.bindings;i<_e.length;i+=1){var _f=_e[i];var _10=_f[0];var _11=_f[1];_d.push(_10,_11.serialize());}_d.push(this.result.serialize());return _d;};return _1;});