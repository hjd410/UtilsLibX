//>>built
define("com/huayun/webgis/layers/support/expression/expressions",["exports","./Assertion","./At","./Case","./Coalesce","./Coercion","./CollatorExpression","./FormatExpression","./IndexOf","./Interpolate","./Length","./Let","./Literal","./Match","./NumberFormat","./Step","./Var","../style/styleUtils","../../../gl/dataTransfer"],function(_1,_2,At,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e,_f,Var,_10,_11){function _12(op,_13){if(op==="=="||op==="!="){return _13.kind==="boolean"||_13.kind==="string"||_13.kind==="number"||_13.kind==="null"||_13.kind==="value";}else{return _13.kind==="string"||_13.kind==="number"||_13.kind==="value";}};function _14(op,_15,_16){var _17=op!=="=="&&op!=="!=";return (function(){function _18(lhs,rhs,_19){this.type={kind:"boolean"};this.lhs=lhs;this.rhs=rhs;this.collator=_19;this.hasUntypedArgument=lhs.type.kind==="value"||rhs.type.kind==="value";};_18.parse=function(_1a,_1b){if(_1a.length!==3&&_1a.length!==4){return _1b.error("Expected two or three arguments.");}var op=_1a[0];var lhs=_1b.parse(_1a[1],1,{kind:"value"});if(!lhs){return null;}if(!_12(op,lhs.type)){return _1b.concat(1).error(("\""+op+"\" comparisons are not supported for type '"+(_10.toString(lhs.type))+"'."));}var rhs=_1b.parse(_1a[2],2,{kind:"value"});if(!rhs){return null;}if(!_12(op,rhs.type)){return _1b.concat(2).error(("\""+op+"\" comparisons are not supported for type '"+(_10.toString(rhs.type))+"'."));}if(lhs.type.kind!==rhs.type.kind&&lhs.type.kind!=="value"&&rhs.type.kind!=="value"){return _1b.error("Cannot compare types '"+(_10.toString(lhs.type))+"' and '"+(_10.toString(rhs.type))+"'.");}if(_17){if(lhs.type.kind==="value"&&rhs.type.kind!=="value"){lhs=new _2(rhs.type,[lhs]);}else{if(lhs.type.kind!=="value"&&rhs.type.kind==="value"){rhs=new _2(lhs.type,[rhs]);}}}var _1c=null;if(_1a.length===4){if(lhs.type.kind!=="string"&&rhs.type.kind!=="string"&&lhs.type.kind!=="value"&&rhs.type.kind!=="value"){return _1b.error("Cannot use collator to compare non-string types.");}_1c=_1b.parse(_1a[3],3,{kind:"collator"});if(!_1c){return null;}}return new _18(lhs,rhs,_1c);};_18.prototype.evaluate=function(ctx){var lhs=this.lhs.evaluate(ctx);var rhs=this.rhs.evaluate(ctx);if(_17&&this.hasUntypedArgument){var lt=_10.typeOf(lhs);var rt=_10.typeOf(rhs);if(lt.kind!==rt.kind||!(lt.kind==="string"||lt.kind==="number")){throw new Error(("Expected arguments for \""+op+"\" to be (string, string) or (number, number), but found ("+(lt.kind)+", "+(rt.kind)+") instead."));}}if(this.collator&&!_17&&this.hasUntypedArgument){var _1d=_10.typeOf(lhs);var _1e=_10.typeOf(rhs);if(_1d.kind!=="string"||_1e.kind!=="string"){return _15(ctx,lhs,rhs);}}return this.collator?_16(ctx,lhs,rhs,this.collator.evaluate(ctx)):_15(ctx,lhs,rhs);};_18.prototype.eachChild=function(fn){fn(this.lhs);fn(this.rhs);if(this.collator){fn(this.collator);}};_18.prototype.possibleOutputs=function(){return [true,false];};_18.prototype.serialize=function(){var _1f=[op];this.eachChild(function(_20){_1f.push(_20.serialize());});return _1f;};return _18;}());};function eq(ctx,a,b){return a===b;};function neq(ctx,a,b){return a!==b;};function lt(ctx,a,b){return a<b;};function gt(ctx,a,b){return a>b;};function _21(ctx,a,b){return a<=b;};function _22(ctx,a,b){return a>=b;};function _23(ctx,a,b,c){return c.compare(a,b)===0;};function _24(ctx,a,b,c){return !_23(ctx,a,b,c);};function _25(ctx,a,b,c){return c.compare(a,b)<0;};function _26(ctx,a,b,c){return c.compare(a,b)>0;};function _27(ctx,a,b,c){return c.compare(a,b)<=0;};function _28(ctx,a,b,c){return c.compare(a,b)>=0;};var _29={"==":_14("==",eq,_23),"!=":_14("!=",neq,_24),">":_14(">",gt,_26),"<":_14("<",lt,_25),">=":_14(">=",_22,_28),"<=":_14("<=",_21,_27),"array":_2,"at":At,"boolean":_2,"case":_3,"coalesce":_4,"collator":_6,"format":_7,"index-of":_8,"interpolate":_9,"interpolate-hcl":_9,"interpolate-lab":_9,"length":_a,"let":_b,"literal":_c,"match":_d,"number":_2,"number-format":_e,"object":_2,"step":_f,"string":_2,"to-boolean":_5,"to-color":_5,"to-number":_5,"to-string":_5,"var":Var};for(var _2a in _29){if((_29[_2a])._classRegistryKey){continue;}_11.register(("Expression_"+_2a),_29[_2a]);}_1.expressions=_29;function _2b(_2c){return Array.isArray(_2c)&&_2c.length>0&&typeof _2c[0]==="string"&&_2c[0] in _29;};_1.isExpression=_2b;});