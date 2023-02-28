//>>built
define("com/huayun/webgis/layers/support/expressions","exports ./expression/definitions ./expression/Coercion ../../utils/Color ./Interpolate ../../utils/utils ../../utils/Constant ../../gl/dataTransfer".split(" "),function(t,m,z,I,A,Q,X,l){function J(a){if(null===a||"string"===typeof a||"boolean"===typeof a||"number"===typeof a)return!0;if(Array.isArray(a)){for(var b=0;b<a.length;b+=1)if(!J(a[b]))return!1;return!0}if("object"===typeof a){for(b in a)if(!J(a[b]))return!1;return!0}return!1}function E(a){if(null===
a)return{kind:"null"};if("string"===typeof a)return{kind:"string"};if("boolean"===typeof a)return{kind:"boolean"};if("number"===typeof a)return{kind:"number"};if(Array.isArray(a)){for(var b=a.length,c,d=0;d<a.length;d+=1){var e=E(a[d]);if(c){if(c!==e){c={kind:"value"};break}}else c=e}return K(c||{kind:"value"},b)}return{kind:"object"}}function K(a,b){return{kind:"array",itemType:a,N:b}}function L(a){if(a instanceof f&&("get"===a.name&&1===a.args.length||"feature-state"===a.name||"has"===a.name&&1===
a.args.length||"properties"===a.name||"geometry-type"===a.name||"id"===a.name||/^filter-/.test(a.name)))return!1;var b=!0;a.eachChild(function(a){b&&!L(a)&&(b=!1)});return b}function R(a){if(a instanceof n)return R(a.boundExpression);if(a instanceof f&&"error"===a.name||a instanceof p)return!1;var b=!0;a.eachChild(function(a){b=b&&a instanceof h});return b?L(a)&&M(a,["zoom","heatmap-density","line-progress","accumulated","is-supported-script"]):!1}function M(a,b){if(a instanceof f&&0<=b.indexOf(a.name))return!1;
var c=!0;a.eachChild(function(a){c&&!M(a,b)&&(c=!1)});return c}function B(a,b){if("error"===b.kind)return null;if("array"===a.kind){if("array"===b.kind&&(0===b.N&&"value"===b.itemType.kind||!B(a.itemType,b.itemType))&&("number"!==typeof a.N||a.N===b.N))return null}else{if(a.kind===b.kind)return null;if("value"===a.kind)for(var c=0,d=Y;c<d.length;c+=1)if(!B(d[c],b))return null}return"Expected "+toString(a)+" but found "+toString(b)+" instead."}function N(a,b,c){switch(a){case "$type":return["filter-type-"+
c,b];case "$id":return["filter-id-"+c,b];default:return["filter-"+c,a,b]}}function S(a,b){if(0===b.length)return!1;switch(a){case "$type":return["filter-type-in",["literal",b]];case "$id":return["filter-id-in",["literal",b]];default:return 200<b.length&&!b.some(function(a){return typeof a!==typeof b[0]})?["filter-in-large",a,["literal",b.sort(compare)]]:["filter-in-small",a,["literal",b]]}}function T(a){switch(a){case "$type":return!0;case "$id":return["filter-has-id"];default:return["filter-has",
a]}}function F(a){return["!",a]}function U(a){if(!0===a||!1===a)return!0;if(!Array.isArray(a)||0===a.length)return!1;switch(a[0]){case "has":return 2<=a.length&&"$id"!==a[1]&&"$type"!==a[1];case "in":case "!in":case "!has":case "none":return!1;case "\x3d\x3d":case "!\x3d":case "\x3e":case "\x3e\x3d":case "\x3c":case "\x3c\x3d":return 3!==a.length||Array.isArray(a[1])||Array.isArray(a[2]);case "any":case "all":var b=0;for(a=a.slice(1);b<a.length;b+=1){var c=a[b];if(!U(c)&&"boolean"!==typeof c)return!1}return!0;
default:return!0}}function G(a){if(!a)return!0;var b=a[0];return 1>=a.length?"any"!==b:"\x3d\x3d"===b?N(a[1],a[2],"\x3d\x3d"):"!\x3d"===b?F(N(a[1],a[2],"\x3d\x3d")):"\x3c"===b||"\x3e"===b||"\x3c\x3d"===b||"\x3e\x3d"===b?N(a[1],a[2],b):"any"===b?["any"].concat(a.slice(1).map(G)):"all"===b?["all"].concat(a.slice(1).map(G)):"none"===b?["all"].concat(a.slice(1).map(G).map(F)):"in"===b?S(a[1],a.slice(2)):"!in"===b?F(S(a[1],a.slice(2))):"has"===b?T(a[1]):"!has"===b?F(T(a[1])):!0}function V(a,b){a=b[a];
return"undefined"===typeof a?0:a}function W(a,b){var c;b?(c={color:{kind:"color"},string:{kind:"string"},number:{kind:"number"},enum:{kind:"string"},boolean:{kind:"boolean"},formatted:{kind:"formatted"}},c="array"===b.type?{kind:"array",itemType:c[b.value]||{kind:"value"},N:b.length}:c[b.type]):c=void 0;c=new v(u,[],c);return(a=c.parse(a,void 0,void 0,void 0,b&&"string"===b.type?{typeAnnotation:"coerce"}:void 0))?{result:"success",value:new C(a,b)}:{result:"error",value:c.errors}}function O(a){if(a instanceof
f&&"feature-state"===a.name)return!1;var b=!0;a.eachChild(function(a){b&&!O(a)&&(b=!1)});return b}var Z=["Unknown","Point","LineString","Polygon"],aa={type:"boolean","default":!1,transition:!1,"property-type":"data-driven",expression:{interpolated:!1,parameters:["zoom","feature"]}},Y=[{kind:"null"},{kind:"number"},{kind:"string"},{kind:"boolean"},{kind:"color"},{kind:"formatted"},{kind:"object"},{kind:"array",itemType:{kind:"value"},N:void 0}],n=function(a,b){this.type=b.type;this.name=a;this.boundExpression=
b};n.parse=function(a,b){if(2!==a.length||"string"!==typeof a[1])return b.error("'var' expression requires exactly one string literal argument.");a=a[1];return b.scope.has(a)?new n(a,b.scope.get(a)):b.error('Unknown variable "'+a+'". Make sure "'+a+'" has been bound in an enclosing "let" expression before using it.',1)};n.prototype.evaluate=function(a){return this.boundExpression.evaluate(a)};n.prototype.eachChild=function(){};n.prototype.possibleOutputs=function(){return[void 0]};n.prototype.serialize=
function(){return["var",this.name]};var P=function(a,b,c){this.sensitivity=a?b?"variant":"case":b?"accent":"base";this.locale=c;this.collator=new Intl.Collator(this.locale?this.locale:[],{sensitivity:this.sensitivity,usage:"search"})};P.prototype.compare=function(a,b){return this.collator.compare(a,b)};P.prototype.resolvedLocale=function(){return(new Intl.Collator(this.locale?this.locale:[])).resolvedOptions().locale};var p=function(a,b,c){this.type=CollatorType;this.locale=c;this.caseSensitive=a;
this.diacriticSensitive=b};p.parse=function(a,b){if(2!==a.length)return b.error("Expected one argument.");a=a[1];if("object"!==typeof a||Array.isArray(a))return b.error("Collator options argument must be an object.");var c=b.parse(void 0===a["case-sensitive"]?!1:a["case-sensitive"],1,BooleanType);if(!c)return null;var d=b.parse(void 0===a["diacritic-sensitive"]?!1:a["diacritic-sensitive"],1,BooleanType);if(!d)return null;var e=null;return a.locale&&(e=b.parse(a.locale,1,StringType),!e)?null:new p(c,
d,e)};p.prototype.evaluate=function(a){return new P(this.caseSensitive.evaluate(a),this.diacriticSensitive.evaluate(a),this.locale?this.locale.evaluate(a):null)};p.prototype.eachChild=function(a){a(this.caseSensitive);a(this.diacriticSensitive);this.locale&&a(this.locale)};p.prototype.possibleOutputs=function(){return[void 0]};p.prototype.serialize=function(){var a={};a["case-sensitive"]=this.caseSensitive.serialize();a["diacritic-sensitive"]=this.diacriticSensitive.serialize();this.locale&&(a.locale=
this.locale.serialize());return["collator",a]};t.isFeatureConstant=L;t.isGlobalPropertyConstant=M;var h=function(a,b){this.type=a;this.value=b};h.parse=function(a,b){if(2!==a.length)return b.error("'literal' expression requires exactly one argument, but found "+(a.length-1)+" instead.");if(!J(a[1]))return b.error("invalid value");a=a[1];var c=E(a);b=b.expectedType;"array"!==c.kind||0!==c.N||!b||"array"!==b.kind||"number"===typeof b.N&&0!==b.N||(c=b);return new h(c,a)};h.prototype.evaluate=function(){return this.value};
h.prototype.eachChild=function(){};h.prototype.possibleOutputs=function(){return[this.value]};h.prototype.serialize=function(){return"array"===this.type.kind||"object"===this.type.kind?["literal",this.value]:this.value};l.register("Literal ",h);var w=function(a,b){this.type=b.type;this.bindings=[].concat(a);this.result=b};w.prototype.evaluate=function(a){return this.result.evaluate(a)};w.prototype.eachChild=function(a){for(var b=0,c=this.bindings;b<c.length;b+=1)a(c[b][1]);a(this.result)};w.parse=
function(a,b){if(4>a.length)return b.error("Expected at least 3 arguments, but found "+(a.length-1)+" instead.");for(var c=[],d=1;d<a.length-1;d+=2){var e=a[d];if("string"!==typeof e)return b.error("Expected string, but found "+typeof e+" instead.",d);if(/[^a-zA-Z0-9_]/.test(e))return b.error("Variable names must contain only alphanumeric characters or '_'.",d);var g=b.parse(a[d+1],d+1);if(!g)return null;c.push([e,g])}return(a=b.parse(a[a.length-1],a.length-1,b.expectedType,c))?new w(c,a):null};w.prototype.possibleOutputs=
function(){return this.result.possibleOutputs()};w.prototype.serialize=function(){for(var a=["let"],b=0,c=this.bindings;b<c.length;b+=1){var d=c[b];a.push(d[0],d[1].serialize())}a.push(this.result.serialize());return a};var k=function(a,b){this.type=a;this.args=b};k.parse=function(a,b){if(2>a.length)return b.error("Expected at least one argument.");var c=1,d,e=a[0];if("array"===e){if(2<a.length){e=a[1];if("string"!==typeof e||!(e in types)||"object"===e)return b.error('The item type argument of "array" must be one of string, number, boolean',
1);e=X.types[e];c++}else e={kind:"value"};if(3<a.length){if(null!==a[2]&&("number"!==typeof a[2]||0>a[2]||a[2]!==Math.floor(a[2])))return b.error('The length argument to "array" must be a positive integer literal',2);d=a[2];c++}d=K(e,d)}else d=types[e];for(e=[];c<a.length;c++){var g=b.parse(a[c],c,{kind:"value"});if(!g)return null;e.push(g)}return new k(d,e)};k.prototype.evaluate=function(a){for(var b=0;b<this.args.length;b++){var c=this.args[b].evaluate(a);if(!B(this.type,E(c)))return c;if(b===this.args.length-
1)throw Error("Expected value to be of type "+this.type+", but found "+E(c)+" instead.");}return null};k.prototype.eachChild=function(a){this.args.forEach(a)};k.prototype.possibleOutputs=function(){var a;return(a=[]).concat.apply(a,this.args.map(function(a){return a.possibleOutputs()}))};k.prototype.serialize=function(){var a=this.type,b=[a.kind];if("array"===a.kind){var c=a.itemType;if("string"===c.kind||"number"===c.kind||"boolean"===c.kind)b.push(c.kind),a=a.N,("number"===typeof a||1<this.args.length)&&
b.push(a)}return b.concat(this.args.map(function(a){return a.serialize()}))};var q=function(a,b){this.type=a;this.args=b};q.parse=function(a,b){if(2>a.length)return b.error("Expectected at least one argument.");var c=null,d=b.expectedType;d&&"value"!==d.kind&&(c=d);var e=[],g=0;for(a=a.slice(1);g<a.length;g+=1){var f=b.parse(a[g],1+e.length,c,void 0,{typeAnnotation:"omit"});if(!f)return null;c=c||f.type;e.push(f)}assert_1(c);return d&&e.some(function(a){return B(d,a.type)})?new q(ValueType,e):new q(c,
e)};q.prototype.evaluate=function(a){for(var b=null,c=0,d=this.args;c<d.length&&(b=d[c].evaluate(a),null===b);c+=1);return b};q.prototype.eachChild=function(a){this.args.forEach(a)};q.prototype.possibleOutputs=function(){var a;return(a=[]).concat.apply(a,this.args.map(function(a){return a.possibleOutputs()}))};q.prototype.serialize=function(){var a=["coalesce"];this.eachChild(function(b){a.push(b.serialize())});return a};var x=function(a,b,c){this.type=a;this.input=b;this.labels=[];this.outputs=[];
for(a=0;a<c.length;a+=1){b=c[a];var d=b[1];this.labels.push(b[0]);this.outputs.push(d)}};x.parse=function(a,b){if(4>a.length-1)return b.error("Expected at least 4 arguments, but found only "+(a.length-1)+".");if(0!==(a.length-1)%2)return b.error("Expected an even number of arguments.");var c=b.parse(a[1],1,NumberType);if(!c)return null;var d=[],e=null;b.expectedType&&"value"!==b.expectedType.kind&&(e=b.expectedType);for(var g=1;g<a.length;g+=2){var f=1===g?-Infinity:a[g],r=a[g+1],k=g,m=g+1;if("number"!==
typeof f)return b.error('Input/output pairs for "step" expressions must be defined using literal numeric values (not computed expressions) for the input values.',k);if(d.length&&d[d.length-1][0]>=f)return b.error('Input/output pairs for "step" expressions must be arranged with input values in strictly ascending order.',k);r=b.parse(r,m,e);if(!r)return null;e=e||r.type;d.push([f,r])}return new x(e,c,d)};x.prototype.evaluate=function(a){var b=this.labels,c=this.outputs;if(1===b.length)return c[0].evaluate(a);
var d=this.input.evaluate(a);if(d<=b[0])return c[0].evaluate(a);var e=b.length;if(d>=b[e-1])return c[e-1].evaluate(a);b=Q.findStopLessThanOrEqualTo(b,d);return c[b].evaluate(a)};x.prototype.eachChild=function(a){a(this.input);for(var b=0,c=this.outputs;b<c.length;b+=1)a(c[b])};x.prototype.possibleOutputs=function(){var a;return(a=[]).concat.apply(a,this.outputs.map(function(a){return a.possibleOutputs()}))};x.prototype.serialize=function(){for(var a=["step",this.input.serialize()],b=0;b<this.labels.length;b++)0<
b&&a.push(this.labels[b]),a.push(this.outputs[b].serialize());return a};var u={"\x3d\x3d":m.Equals,"!\x3d":m.NotEquals,"\x3e":m.GreaterThan,"\x3c":m.LessThan,"\x3e\x3d":m.GreaterThanOrEqual,"\x3c\x3d":m.LessThanOrEqual,literal:h,interpolate:A,"interpolate-hcl":A,"interpolate-lab":A,let:w,coalesce:q,step:x,array:k,number:k,"boolean":k,object:k,string:k,"to-boolean":z,"to-color":z,"to-number":z,"to-string":z,collator:p,"var":n},H;for(H in u)u[H]._classRegistryKey||l.register("Expression_"+H,u[H]);t.expressions=
u;var y=function(){this.featureState=this.feature=this.globals=null;this._parseColorCache={}};y.prototype.id=function(){return this.feature&&"id"in this.feature?this.feature.id:null};y.prototype.geometryType=function(){return this.feature?"number"===typeof this.feature.type?Z[this.feature.type]:this.feature.type:null};y.prototype.properties=function(){return this.feature&&this.feature.properties||{}};y.prototype.parseColor=function(a){var b=this._parseColorCache[a];b||(b=this._parseColorCache[a]=
I.parse(a));return b};var D=function(a,b){void 0===b&&(b=[]);this.parent=a;this.bindings={};for(a=0;a<b.length;a+=1){var c=b[a];this.bindings[c[0]]=c[1]}};D.prototype.concat=function(a){return new D(this,a)};D.prototype.get=function(a){if(this.bindings[a])return this.bindings[a];if(this.parent)return this.parent.get(a);throw Error(a+" not found in scope.");};D.prototype.has=function(a){return this.bindings[a]?!0:this.parent?this.parent.has(a):!1};var v=function(a,b,c,d,e){void 0===b&&(b=[]);void 0===
d&&(d=new D);void 0===e&&(e=[]);this.registry=a;this.path=b;this.key=b.map(function(a){return"["+a+"]"}).join("");this.scope=d;this.errors=e;this.expectedType=c};v.prototype.parse=function(a,b,c,d,e){void 0===e&&(e={});return b?this.concat(b,c,d)._parse(a,e):this._parse(a,e)};v.prototype._parse=function(a,b){function c(a,b,c){return"assert"===c?new k(b,[a]):"coerce"===c?new z(b,[a]):a}if(null===a||"string"===typeof a||"boolean"===typeof a||"number"===typeof a)a=["literal",a];if(Array.isArray(a)){if(0===
a.length)return Error('Expected an array with at least one element. If you wanted a literal array, use ["literal", []].');var d=a[0];if("string"!==typeof d)return Error("Expression name must be a string, but found "+typeof d+' instead. If you wanted a literal array, use ["literal", [...]].',0),null;var e=this.registry[d];if(e){a=e.parse(a,this);if(!a)return null;if(this.expectedType)if(d=this.expectedType,e=a.type,("string"===d.kind||"number"===d.kind||"boolean"===d.kind||"object"===d.kind||"array"===
d.kind)&&"value"===e.kind)a=c(a,d,b.typeAnnotation||"assert");else if(!("color"!==d.kind&&"formatted"!==d.kind||"value"!==e.kind&&"string"!==e.kind))a=c(a,d,b.typeAnnotation||"coerce");else if(this.checkSubtype(d,e))return null;if(!(a instanceof h)&&R(a)){b=new y;try{a=new h(a.type,a.evaluate(b))}catch(g){return Error(g.message),null}}return a}return Error('Unknown expression "'+d+'". If you wanted a literal array, use ["literal", [...]].',0)}return"undefined"===typeof a?Error("'undefined' value invalid. Use null instead."):
"object"===typeof a?Error('Bare objects invalid. Use ["literal", {...}] instead.'):Error("Expected an array, but found "+typeof a+" instead.")};v.prototype.concat=function(a,b,c){a="number"===typeof a?this.path.concat(a):this.path;c=c?this.scope.concat(c):this.scope;return new v(this.registry,a,b||null,c,this.errors)};v.prototype.error=function(a){for(var b=[],c=arguments.length-1;0<c--;)b[c]=arguments[c+1];b=""+this.key+b.map(function(a){return"["+a+"]"}).join("");this.errors.push(new ParsingError(b,
a))};v.prototype.checkSubtype=function(a,b){(a=B(a,b))&&this.error(a);return a};var f=function(a,b,c,d){this.name=a;this.type=b;this._evaluate=c;this.args=d};f.prototype.evaluate=function(a){return this._evaluate(a,this.args)};f.prototype.eachChild=function(a){this.args.forEach(a)};f.prototype.possibleOutputs=function(){return[void 0]};f.prototype.serialize=function(){return[this.name].concat(this.args.map(function(a){return a.serialize()}))};f.parse=function(a,b){var c,d=a[0],e=f.definitions[d];
if(!e)return b.error('Unknown expression "'+d+'". If you wanted a literal array, use ["literal", [...]].',0);for(var g=Array.isArray(e)?e[0]:e.type,e=Array.isArray(e)?[[e[1],e[2]]]:e.overloads,k=e.filter(function(b){b=b[0];return!Array.isArray(b)||b.length===a.length-1}),r=null,m=0;m<k.length;m+=1){for(var r=k[m],h=r[0],t=r[1],r=new v(b.registry,b.path,null,b.scope),l=[],n=!1,p=1;p<a.length;p++){var q=a[p],u=Array.isArray(h)?h[p-1]:h.type,q=r.parse(q,1+l.length,u);if(!q){n=!0;break}l.push(q)}if(!n)if(Array.isArray(h)&&
h.length!==l.length)r.error("Expected "+h.length+" arguments, but found "+l.length+" instead.");else{for(n=0;n<l.length;n++)p=Array.isArray(h)?h[n]:h.type,q=l[n],r.concat(n+1).checkSubtype(p,q.type);if(0===r.errors.length)return new f(d,g,t,l)}}if(1===k.length)(c=b.errors).push.apply(c,r.errors);else{c=(k.length?k:e).map(function(a){return stringifySignature(a[0])}).join(" | ");d=[];for(g=1;g<a.length;g++){e=b.parse(a[g],1+d.length);if(!e)return null;d.push(toString(e.type))}b.error("Expected arguments of type "+
c+", but found ("+d.join(", ")+") instead.")}return null};f.register=function(a,b){f.definitions=b;for(var c in b)a[c]=f};f.register(u,{error:[{kind:"error"},[{kind:"string"}],function(a,b){throw Error(b[0].evaluate(a));}],has:{type:{kind:"boolean"},overloads:[[[{kind:"string"}],function(a,b){b=b[0].evaluate(a);a=a.properties();return b in a}],[[{kind:"string"},{kind:"object"}],function(a,b){var c=b[1];b=b[0].evaluate(a);a=c.evaluate(a);return b in a}]]},get:{type:{kind:"value"},overloads:[[[{kind:"string"}],
function(a,b){return V(b[0].evaluate(a),a.properties())}],[[{kind:"string"},{kind:"object"}],function(a,b){var c=b[1];return V(b[0].evaluate(a),c.evaluate(a))}]]},zoom:[{kind:"number"},[],function(a){return a.globals.zoom}],"heatmap-density":[{kind:"number"},[],function(a){return a.globals.heatmapDensity||0}],"+":[{kind:"number"},{type:{kind:"number"}},function(a,b){for(var c=0,d=0;d<b.length;d+=1)c+=b[d].evaluate(a);return c}],"*":[{kind:"number"},{type:{kind:"number"}},function(a,b){for(var c=1,
d=0;d<b.length;d+=1)c*=b[d].evaluate(a);return c}],"-":{type:{kind:"number"},overloads:[[[{kind:"number"},{kind:"number"}],function(a,b){var c=b[1];return b[0].evaluate(a)-c.evaluate(a)}],[[{kind:"number"}],function(a,b){return-b[0].evaluate(a)}]]},"/":[{kind:"number"},[{kind:"number"},{kind:"number"}],function(a,b){var c=b[1];return b[0].evaluate(a)/c.evaluate(a)}],"%":[{kind:"number"},[{kind:"number"},{kind:"number"}],function(a,b){var c=b[1];return b[0].evaluate(a)%c.evaluate(a)}],"filter-\x3d\x3d":[{kind:"boolean"},
[{kind:"string"},{kind:"value"}],function(a,b){var c=b[0];b=b[1];return a.properties()[c.value]===b.value}],"filter-type-\x3d\x3d":[{kind:"boolean"},[{kind:"string"}],function(a,b){b=b[0];return a.geometryType()===b.value}],"filter-\x3c":[{kind:"boolean"},[{kind:"string"},{kind:"value"}],function(a,b){var c=b[0];b=b[1];a=a.properties()[c.value];c=b.value;return typeof a===typeof c&&a<c}],"filter-\x3c\x3d":[{kind:"boolean"},[{kind:"string"},{kind:"value"}],function(a,b){var c=b[0];b=b[1];a=a.properties()[c.value];
c=b.value;return typeof a===typeof c&&a<=c}],"filter-\x3e\x3d":[{kind:"boolean"},[{kind:"string"},{kind:"value"}],function(a,b){var c=b[0];b=b[1];a=a.properties()[c.value];c=b.value;return typeof a===typeof c&&a>=c}],"filter-in-small":[{kind:"boolean"},[{kind:"string"},K({kind:"value"})],function(a,b){var c=b[0];return 0<=b[1].value.indexOf(a.properties()[c.value])}],"filter-has":[{kind:"boolean"},[{kind:"value"}],function(a,b){return b[0].value in a.properties()}],all:{type:{kind:"boolean"},overloads:[[[{kind:"boolean"},
{kind:"boolean"}],function(a,b){var c=b[1];return b[0].evaluate(a)&&c.evaluate(a)}],[{type:{kind:"boolean"}},function(a,b){for(var c=0;c<b.length;c+=1)if(!b[c].evaluate(a))return!1;return!0}]]},any:{type:{kind:"boolean"},overloads:[[[{kind:"boolean"},{kind:"boolean"}],function(a,b){var c=b[1];return b[0].evaluate(a)||c.evaluate(a)}],[{type:{kind:"boolean"}},function(a,b){for(var c=0;c<b.length;c+=1)if(b[c].evaluate(a))return!0;return!1}]]},"!":[{kind:"boolean"},[{kind:"boolean"}],function(a,b){return!b[0].evaluate(a)}]});
l.register("CompoundExpression",f,{omit:["_evaluate"]});t.CompoundExpression=f;t.createExpression=W;t.createFilter=function(a){if(null===a||void 0===a)return function(){return!0};U(a)||(a=G(a));var b=W(a,aa);if("error"===b.result)throw Error(b.value.map(function(a){return a.key+": "+a.message}).join(", "));return function(a,d){return b.value.evaluate(a,d)}};t.isExpression=function(a){return Array.isArray(a)&&0<a.length&&"string"===typeof a[0]&&a[0]in u};var C=function(a,b){this.expression=a;this._warningHistory=
{};this._evaluator=new y;this._defaultValue=b?"color"===b.type&&Q.isFunction(b.default)?new I(0,0,0,0):"color"===b.type?I.parse(b.default)||null:void 0===b.default?null:b.default:null;this._enumValues=b&&"enum"===b.type?b.values:null};C.prototype.evaluateWithoutErrorHandling=function(a,b,c){this._evaluator.globals=a;this._evaluator.feature=b;this._evaluator.featureState=c;return this.expression.evaluate(this._evaluator)};C.prototype.evaluate=function(a,b,c){this._evaluator.globals=a;this._evaluator.feature=
b||null;this._evaluator.featureState=c||null;try{var d=this.expression.evaluate(this._evaluator);if(null===d||void 0===d)return this._defaultValue;if(this._enumValues&&!(d in this._enumValues))throw Error("Expected value to be one of "+Object.keys(this._enumValues).map(function(a){return JSON.stringify(a)}).join(", ")+", but found "+JSON.stringify(d)+" instead.");return d}catch(e){return this._warningHistory[e.message]||(this._warningHistory[e.message]=!0,"undefined"!==typeof console&&console.warn(e.message)),
this._defaultValue}};l.register("StyleExpression",C,{omit:["_evaluator"]});t.StyleExpression=C;m=function(a,b){this.kind=a;this._styleExpression=b;this.isStateDependent="constant"!==a&&!O(b.expression)};m.prototype.evaluateWithoutErrorHandling=function(a,b,c){return this._styleExpression.evaluateWithoutErrorHandling(a,b,c)};m.prototype.evaluate=function(a,b,c){return this._styleExpression.evaluate(a,b,c)};l.register("ZoomConstantExpression",m);t.ZoomConstantExpression=m;l=function(a,b,c){this.kind=
a;this.zoomStops=c.labels;this._styleExpression=b;this.isStateDependent="camera"!==a&&!O(b.expression);c instanceof A&&(this.interpolationType=c.interpolation)};l.prototype.evaluateWithoutErrorHandling=function(a,b,c){return this._styleExpression.evaluateWithoutErrorHandling(a,b,c)};l.prototype.evaluate=function(a,b,c){return this._styleExpression.evaluate(a,b,c)};l.prototype.interpolationFactor=function(a,b,c){return this.interpolationType?A.interpolationFactor(this.interpolationType,a,b,c):0};t.ZoomDependentExpression=
l});