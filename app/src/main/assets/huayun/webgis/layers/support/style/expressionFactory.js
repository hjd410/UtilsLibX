//>>built
define("com/huayun/webgis/layers/support/style/expressionFactory","exports ./parsingContext ./ParsingError ./StyleExpression ./styleUtils ../expression/Interpolate ../expression/Coalesce ../expression/Let ../expression/Step ../expression/expressions ../expression/compoundExpression ../expression/ZoomDependentExpression ../expression/ZoomConstantExpression".split(" "),function(k,y,d,z,l,q,A,B,C,D,m,r,t){function g(a){var b=null;if(a instanceof B)b=g(a.result);else if(a instanceof A)for(var c=0,e=a.args;c<
e.length&&!(b=g(e[c]));c+=1);else(a instanceof C||a instanceof q)&&a.input instanceof m.CompoundExpression&&"zoom"===a.input.name&&(b=a);a.eachChild(function(a){a=g(a);a instanceof d?b=a:!b&&a?b=new d("",'"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.'):b&&a&&b!==a&&(b=new d("",'Only one zoom-based "step" or "interpolate" subexpression may be used in an expression.'))});return b}function n(a,b){var c=y.ParsingContext,e=D.expressions,d;d=b?"array"===
b.type?{kind:"array",itemType:u[b.value]||{kind:"value"},N:b.length}:u[b.type]:void 0;c=new c(e,[],d);return(a=c.parse(a,void 0,void 0,void 0,b&&"string"===b.type?{typeAnnotation:"coerce"}:void 0))?{result:"success",value:new z(a,b)}:{result:"error",value:c.errors}}function v(a){if(!0===a||!1===a)return!0;if(!Array.isArray(a)||0===a.length)return!1;switch(a[0]){case "has":return 2<=a.length&&"$id"!==a[1]&&"$type"!==a[1];case "in":case "!in":case "!has":case "none":return!1;case "\x3d\x3d":case "!\x3d":case "\x3e":case "\x3e\x3d":case "\x3c":case "\x3c\x3d":return 3!==
a.length||Array.isArray(a[1])||Array.isArray(a[2]);case "any":case "all":var b=0;for(a=a.slice(1);b<a.length;b+=1){var c=a[b];if(!v(c)&&"boolean"!==typeof c)return!1}return!0;default:return!0}}function p(a,b,c){switch(a){case "$type":return["filter-type-"+c,b];case "$id":return["filter-id-"+c,b];default:return["filter-"+c,a,b]}}function f(a){return["!",a]}function E(a,b){return a<b?-1:a>b?1:0}function w(a,b){if(0===b.length)return!1;switch(a){case "$type":return["filter-type-in",["literal",b]];case "$id":return["filter-id-in",
["literal",b]];default:return 200<b.length&&!b.some(function(a){return typeof a!==typeof b[0]})?["filter-in-large",a,["literal",b.sort(E)]]:["filter-in-small",a,["literal",b]]}}function x(a){switch(a){case "$type":return!0;case "$id":return["filter-has-id"];default:return["filter-has",a]}}function h(a){if(!a)return!0;var b=a[0];return 1>=a.length?"any"!==b:"\x3d\x3d"===b?p(a[1],a[2],"\x3d\x3d"):"!\x3d"===b?f(p(a[1],a[2],"\x3d\x3d")):"\x3c"===b||"\x3e"===b||"\x3c\x3d"===b||"\x3e\x3d"===b?p(a[1],a[2],
b):"any"===b?["any"].concat(a.slice(1).map(h)):"all"===b?["all"].concat(a.slice(1).map(h)):"none"===b?["all"].concat(a.slice(1).map(h).map(f)):"in"===b?w(a[1],a.slice(2)):"!in"===b?f(w(a[1],a.slice(2))):"has"===b?x(a[1]):"!has"===b?f(x(a[1])):!0}var u={color:{kind:"color"},string:{kind:"string"},number:{kind:"number"},enum:{kind:"string"},boolean:{kind:"boolean"},formatted:{kind:"formatted"}};k.createExpression=n;k.createPropertyExpression=function(a,b){a=n(a,b);if("error"===a.result)return a;var c=
a.value.expression,e=m.isFeatureConstant(c);if(!e&&!l.supportsPropertyExpression(b))return{result:"error",value:[new d("","data expressions not supported")]};var f=m.isGlobalPropertyConstant(c,["zoom"]);if(!f&&!l.supportsZoomExpression(b))return{result:"error",value:[new d("","zoom expressions not supported")]};if((c=g(c))||f){if(c instanceof d)return{result:"error",value:[c]};if(c instanceof q&&!l.supportsInterpolation(b))return{result:"error",value:[new d("",'"interpolate" expressions cannot be used with this property')]}}else return{result:"error",
value:[new d("",'"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.')]};return c?{result:"success",value:e?new r("camera",a.value,c):new r("composite",a.value,c)}:{result:"success",value:e?new t("constant",a.value):new t("source",a.value)}};var F={type:"boolean","default":!1,transition:!1,"property-type":"data-driven",expression:{interpolated:!1,parameters:["zoom","feature"]}};k.createFilter=function(a){if(null===a||void 0===a)return function(){return!0};
v(a)||(a=h(a));var b=n(a,F);if("error"===b.result){debugger;throw Error(b.value.map(function(a){return a.key+": "+a.message}).join(", "));}return function(a,d){return b.value.evaluate(a,d)}}});