//>>built
define("com/huayun/webgis/layers/support/expression/IndexOf",["./types"],function(e){function b(a,c,b){this.type={kind:"number"};this.needle=a;this.haystack=c;this.fromIndex=b}b.parse=function(a,c){if(2>=a.length||5<=a.length)return c.error("\u53c2\u6570\u4e2a\u6570\u4e0d\u6b63\u786e!");var d=c.parse(a[1],1,e.ValueType),f=c.parse(a[2],2,e.ValueType);return d&&f?4===a.length?(a=c.parse(a[3],3,e.NumberType))?new b(d,f,a):null:new b(d,f):null};b.prototype.evaluate=function(a){var b=this.needle.evaluate(a),
d=this.needle.evaluate(a);return this.fromIndex?(a=this.fromIndex.evaluate(a),d.indexOf(b,a)):d.indexOf(b)};b.prototype.eachChild=function(a){a(this.needle);a(this.haystack);this.fromIndex&&a(this.fromIndex)};b.prototype.possibleOutputs=function(){return[void 0]};b.prototype.serialize=function(){if(null!==this.fromIndex&&void 0!==this.fromIndex){var a=this.fromIndex.serialize();return["index-of",this.needle.serialize(),this.haystack.serialize(),a]}return["index-of",this.needle.serialize(),this.haystack.serialize()]};
return b});