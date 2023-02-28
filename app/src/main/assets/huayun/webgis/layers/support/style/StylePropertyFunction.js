//>>built
define("com/huayun/webgis/layers/support/style/StylePropertyFunction","./styleUtils ../expression/Interpolate ../expression/Formatted ../../../utils/utils ../../../utils/Color ../../../utils/colorSpaces".split(" "),function(p,t,x,h,q,u){function y(a){return a}function v(a,c,b){var d=void 0!==a.base?a.base:1;if("number"!==h.getType(b))return h.coalesce(a.default,c.default);var e=a.stops.length;if(1===e||b<=a.stops[0][0])return a.stops[0][1];if(b>=a.stops[e-1][0])return a.stops[e-1][1];var e=p.findStopLessThanOrEqualTo(a.stops.map(function(a){return a[0]}),
b),f=p.interpolationFactor(b,d,a.stops[e][0],a.stops[e+1][0]),k=a.stops[e][1],l=a.stops[e+1][1],m=p.interpolate[c.type]||y;if(a.colorSpace&&"rgb"!==a.colorSpace)var g=u[a.colorSpace],m=function(a,b){return g.reverse(g.interpolate(g.forward(a),g.forward(b),f))};return"function"===typeof k.evaluate?{evaluate:function(){for(var a=[],b=arguments.length;b--;)a[b]=arguments[b];b=k.evaluate.apply(void 0,a);a=l.evaluate.apply(void 0,a);if(void 0!==b&&void 0!==a)return m(b,a,f)}}:m(k,l,f)}function z(a,c,b){if("number"!==
h.getType(b))return h.coalesce(a.default,c.default);c=a.stops.length;if(1===c||b<=a.stops[0][0])return a.stops[0][1];if(b>=a.stops[c-1][0])return a.stops[c-1][1];b=p.findStopLessThanOrEqualTo(a.stops.map(function(a){return a[0]}),b);return a.stops[b][1]}function A(a,c,b,d,e){return h.coalesce(typeof b===e?d[b]:void 0,a.default,c.default)}function B(a,c,b){"color"===c.type?b=q.parse(b):"formatted"===c.type?b=x.fromString(b.toString()):h.getType(b)===c.type||"enum"===c.type&&c.values[b]||(b=void 0);
return h.coalesce(b,a.default,c.default)}function w(a,c){var b="color"===c.type,d=a.stops&&"object"===typeof a.stops[0][0],e=d||void 0!==a.property,e=d||!e,f=a.type||(p.supportsInterpolation(c)?"exponential":"interval");b&&(a=h.extend({},a),a.stops&&(a.stops=a.stops.map(function(a){return[a[0],q.parse(a[1])]})),a.default=a.default?q.parse(a.default):q.parse(c.default));if(a.colorSpace&&"rgb"!==a.colorSpace&&!u[a.colorSpace])throw Error("Unknown color space: "+a.colorSpace);var k,l,m;if("exponential"===
f)k=v;else if("interval"===f)k=z;else if("categorical"===f){k=A;l=Object.create(null);for(var b=0,g=a.stops;b<g.length;b+=1){var n=g[b];l[n[0]]=n[1]}m=typeof a.stops[0][0]}else if("identity"===f)k=B;else throw Error('Unknown function type "'+f+'"');if(d){d={};e=[];for(f=0;f<a.stops.length;f++)b=a.stops[f],g=b[0].zoom,void 0===d[g]&&(d[g]={zoom:g,type:a.type,property:a.property,default:a.default,stops:[]},e.push(g)),d[g].stops.push([b[0].value,b[1]]);for(var r=[],f=0;f<e.length;f+=1)b=e[f],r.push([d[b].zoom,
w(d[b],c)]);d={name:"linear"};return{kind:"composite",interpolationType:d,interpolationFactor:t.interpolationFactor.bind(void 0,d),zoomStops:r.map(function(a){return a[0]}),evaluate:function(b,d){b=b.zoom;return v({stops:r,base:a.base},c,b).evaluate(b,d)}}}return e?(d="exponential"===f?{name:"exponential",base:void 0!==a.base?a.base:1}:null,{kind:"camera",interpolationType:d,interpolationFactor:t.interpolationFactor.bind(void 0,d),zoomStops:a.stops.map(function(a){return a[0]}),evaluate:function(b){return k(a,
c,b.zoom,l,m)}}):{kind:"source",evaluate:function(b,d){b=d&&d.properties?d.properties[a.property]:void 0;return void 0===b?h.coalesce(a.default,c.default):k(a,c,b,l,m)}}}var n=function(a,c){this._parameters=a;this._specification=c;h.extend(this,w(this._parameters,this._specification))};n.deserialize=function(a){return new n(a._parameters,a._specification)};n.serialize=function(a){return{_parameters:a._parameters,_specification:a._specification}};return n});