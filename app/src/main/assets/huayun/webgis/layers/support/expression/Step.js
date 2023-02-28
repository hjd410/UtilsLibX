//>>built
define("com/huayun/webgis/layers/support/expression/Step",["../style/styleUtils"],function(_1){var _2=function _2(_3,_4,_5){this.type=_3;this.input=_4;this.labels=[];this.outputs=[];for(var i=0,_6=_5;i<_6.length;i+=1){var _7=_6[i];var _8=_7[0];var _9=_7[1];this.labels.push(_8);this.outputs.push(_9);}};_2.parse=function(_a,_b){if(_a.length-1<4){return _b.error(("Expected at least 4 arguments, but found only "+(_a.length-1)+"."));}if((_a.length-1)%2!==0){return _b.error("Expected an even number of arguments.");}var _c=_b.parse(_a[1],1,{kind:"number"});if(!_c){return null;}var _d=[];var _e=null;if(_b.expectedType&&_b.expectedType.kind!=="value"){_e=_b.expectedType;}for(var i=1;i<_a.length;i+=2){var _f=i===1?-Infinity:_a[i];var _10=_a[i+1];var _11=i;var _12=i+1;if(typeof _f!=="number"){return _b.error("Input/output pairs for \"step\" expressions must be defined using literal numeric values (not computed expressions) for the input values.",_11);}if(_d.length&&_d[_d.length-1][0]>=_f){return _b.error("Input/output pairs for \"step\" expressions must be arranged with input values in strictly ascending order.",_11);}var _13=_b.parse(_10,_12,_e);if(!_13){return null;}_e=_e||_13.type;_d.push([_f,_13]);}return new _2(_e,_c,_d);};_2.prototype.evaluate=function(ctx){var _14=this.labels;var _15=this.outputs;if(_14.length===1){return _15[0].evaluate(ctx);}var _16=this.input.evaluate(ctx);if(_16<=_14[0]){return _15[0].evaluate(ctx);}var _17=_14.length;if(_16>=_14[_17-1]){return _15[_17-1].evaluate(ctx);}var _18=_1.findStopLessThanOrEqualTo(_14,_16);return _15[_18].evaluate(ctx);};_2.prototype.eachChild=function(fn){fn(this.input);for(var i=0,_19=this.outputs;i<_19.length;i+=1){var _1a=_19[i];fn(_1a);}};_2.prototype.possibleOutputs=function(){var ref;return (ref=[]).concat.apply(ref,this.outputs.map(function(_1b){return _1b.possibleOutputs();}));};_2.prototype.serialize=function(){var _1c=["step",this.input.serialize()];for(var i=0;i<this.labels.length;i++){if(i>0){_1c.push(this.labels[i]);}_1c.push(this.outputs[i].serialize());}return _1c;};return _2;});