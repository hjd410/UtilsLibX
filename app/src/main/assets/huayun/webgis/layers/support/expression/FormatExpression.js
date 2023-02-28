//>>built
define("com/huayun/webgis/layers/support/expression/FormatExpression",["../style/styleUtils","./Formatted","./FormattedSection"],function(_1,_2,_3){var _4=function _4(_5){this.type={kind:"formatted"};this.sections=_5;};_4.parse=function(_6,_7){if(_6.length<3){return _7.error("Expected at least two arguments.");}if((_6.length-1)%2!==0){return _7.error("Expected an even number of arguments.");}var _8=[];for(var i=1;i<_6.length-1;i+=2){var _9=_7.parse(_6[i],1,{kind:"value"});if(!_9){return null;}var _a=_9.type.kind;if(_a!=="string"&&_a!=="value"&&_a!=="null"){return _7.error("Formatted text type must be 'string', 'value', or 'null'.");}var _b=_6[i+1];if(typeof _b!=="object"||Array.isArray(_b)){return _7.error("Format options argument must be an object.");}var _c=null;if(_b["font-scale"]){_c=_7.parse(_b["font-scale"],1,{kind:"number"});if(!_c){return null;}}var _d=null;if(_b["text-font"]){_d=_7.parse(_b["text-font"],1,{kind:"array",itemType:{kind:"string"},N:undefined});if(!_d){return null;}}_8.push({text:_9,scale:_c,font:_d});}return new _4(_8);};_4.prototype.evaluate=function(_e){return new _2(this.sections.map(function(_f){return new _3(_1.toString$1(_f.text.evaluate(_e)),_f.scale?_f.scale.evaluate(_e):null,_f.font?_f.font.evaluate(_e).join(","):null);}));};_4.prototype.eachChild=function(fn){for(var i=0,_10=this.sections;i<_10.length;i+=1){var _11=_10[i];fn(_11.text);if(_11.scale){fn(_11.scale);}if(_11.font){fn(_11.font);}}};_4.prototype.possibleOutputs=function(){return [undefined];};_4.prototype.serialize=function(){var _12=["format"];for(var i=0,_13=this.sections;i<_13.length;i+=1){var _14=_13[i];_12.push(_14.text.serialize());var _15={};if(_14.scale){_15["font-scale"]=_14.scale.serialize();}if(_14.font){_15["text-font"]=_14.font.serialize();}_12.push(_15);}return _12;};return _4;});