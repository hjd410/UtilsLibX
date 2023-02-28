//>>built
define("com/huayun/webgis/layers/support/expression/CollatorExpression",["./Collator"],function(_1){var _2=function _2(_3,_4,_5){this.type={kind:"collator"};this.locale=_5;this.caseSensitive=_3;this.diacriticSensitive=_4;};_2.parse=function(_6,_7){if(_6.length!==2){return _7.error("Expected one argument.");}var _8=(_6[1]);if(typeof _8!=="object"||Array.isArray(_8)){return _7.error("Collator options argument must be an object.");}var _9=_7.parse(_8["case-sensitive"]===undefined?false:_8["case-sensitive"],1,{kind:"boolean"});if(!_9){return null;}var _a=_7.parse(_8["diacritic-sensitive"]===undefined?false:_8["diacritic-sensitive"],1,{kind:"boolean"});if(!_a){return null;}var _b=null;if(_8["locale"]){_b=_7.parse(_8["locale"],1,{kind:"string"});if(!_b){return null;}}return new _2(_9,_a,_b);};_2.prototype.evaluate=function(_c){return new _1(this.caseSensitive.evaluate(_c),this.diacriticSensitive.evaluate(_c),this.locale?this.locale.evaluate(_c):null);};_2.prototype.eachChild=function(fn){fn(this.caseSensitive);fn(this.diacriticSensitive);if(this.locale){fn(this.locale);}};_2.prototype.possibleOutputs=function(){return [undefined];};_2.prototype.serialize=function(){var _d={};_d["case-sensitive"]=this.caseSensitive.serialize();_d["diacritic-sensitive"]=this.diacriticSensitive.serialize();if(this.locale){_d["locale"]=this.locale.serialize();}return ["collator",_d];};return _2;});