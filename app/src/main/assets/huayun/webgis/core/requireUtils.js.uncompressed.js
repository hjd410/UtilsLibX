/**
 * Created by DELL on 2017/11/20.
 */
define("com/huayun/webgis/core/requireUtils", ["require","exports","dojo/Deferred"],function(g,d,f){function e(a,b){if(Array.isArray(b)){var c=new f;a(b,function(){for(var b=[],a=0;a<arguments.length;a++)b[a]=arguments[a];c.resolve(b)});return c.promise}return e(a,[b]).then(function(a){return a[0]})}Object.defineProperty(d,"__esModule",{value:!0});d.when=e;d.getAbsMid=function(a,b,c){return b.toAbsMid?b.toAbsMid(a):c.id.replace(/\/[^\/]*$/ig,"/")+a}});