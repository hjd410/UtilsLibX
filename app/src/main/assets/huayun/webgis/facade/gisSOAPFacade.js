//>>built
define("com/huayun/webgis/facade/gisSOAPFacade","exports ../utils/Resource ../layers/support/TileInfo ../layers/support/LOD ../geometry/Point ../geometry/Extent".split(" "),function(e,m,n,p,q,r){function k(c){var d={},b;for(b in c)if(!b.startsWith("_")){var a=c[b];a.__text?d[b]=a.__text:"object"===typeof a&&(d[b]=k(a))}return d}function f(c,d,b,a){m.loadText(b,{method:"POST",body:'\x3cSOAP-ENV:Envelope xmlns:SOAP-ENV\x3d"http://schemas.xmlsoap.org/soap/envelope/"\n                   xmlns:xsd\x3d"http://www.w3.org/2001/XMLSchema" xmlns:xsi\x3d"http://www.w3.org/2001/XMLSchema-instance"\x3e\n    \x3cSOAP-ENV:Body\x3e\x3cgis:'+
c+' xmlns:gis\x3d"http://www.sgcc.com.cn/sggis/service/gisservice"\x3e\n\x3cgis:inputXML\x3e\x3c![CDATA['+d+("]]\x3e\x3c/gis:inputXML\x3e\n\x3c/gis:"+c+"\x3e\n\x3c/SOAP-ENV:Body\x3e\n\x3c/SOAP-ENV:Envelope\x3e"),headers:{"Content-Type":"text/xml;charset\x3dutf-8"}},function(b,t){b?a(b):a(null,g.xml_str2json(t))})}var g=new X2JS;e.getConnection=function(c,d,b,a,l){f("getConnection",'\x3cgt:GetConnectionInput xsi:schemaLocation\x3d"http://www.sgcc.com.cn/sggis/service/schema gistypes.xsd" xmlns:gt\x3d"http://www.sgcc.com.cn/sggis/service/schema" xmlns:xsi\x3d"http://www.w3.org/2001/XMLSchema-instance"\x3e\n\x3cgt:UserName\x3e'+
d+"\x3c/gt:UserName\x3e\n\x3cgt:Identifier\x3e"+b+"\x3c/gt:Identifier\x3e\n\x3cgt:Password\x3e"+a+"\x3c/gt:Password\x3e\n\x3c/gt:GetConnectionInput\x3e",c,function(a,b){a?l(a):(a=g.xml_str2json(b.Envelope.Body.getConnectionResponse.out.__text).GetConnectionOutput,l(null,{token:a.Token.__text,expires:a.Expires.__text}))})};e.getTileCacheInfo=function(c,d,b){f("getTileCacheInfo",'\x3cgt:GetTileCacheInfoInput xsi:schemaLocation\x3d"http://www.sgcc.com.cn/sggis/service/schema gistypes.xsd" xmlns:gt\x3d"http://www.sgcc.com.cn/sggis/service/schema" xmlns:xsi\x3d"http://www.w3.org/2001/XMLSchema-instance"\x3e\x3cgt:Token\x3e'+
d+"\x3c/gt:Token\x3e\x3c/gt:GetTileCacheInfoInput\x3e",c,function(a,c){if(a)b(a);else{var d=[];g.xml_str2json(c.Envelope.Body.getTileCacheInfoResponse.out.__text).GetTileCacheInfoOutput.TileCacheInfo.forEach(function(a){d.push(k(a))});debugger;a=d[0];c=a.Point.pos;c=c.split(" ");var e=a.LODInfo,f=a.GroundDPI,h=a.TileCacheServerURL,h=h.replace("{L}","{z}").replace("{Y}","{y}").replace("{X}","{x}");a=new n({lods:[new p({level:0,scale:1,resolution:f})],origin:new q(Number(c[0]),Number(c[1])),size:Number(a.ImageSize),
fullExtent:new r(Number(a.XMIN),Number(a.YMIN),Number(a.XMAX),Number(a.YMAX))});a.minzoom=Number(e.StartLevel);a.maxzoom=Number(e.EndLevel);b(null,{tileInfo:a,serviceUrl:h})}})}});