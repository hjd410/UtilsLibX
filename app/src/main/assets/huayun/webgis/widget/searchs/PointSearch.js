//>>built
require({cache:{"url:com/huayun/webgis/templates/searchs/pointSearch.html":"<div class=\"${baseClass}\" style=\"pointer-events: all;\">\r\n    <div id=\"showListP\" class=\"listView\" >\r\n        <span class=\"devTip\">设备列表</span>\r\n        <div class=\"first\">\r\n            <ul id=\"devListP\" class=\"devView\" data-dojo-attach-event=\"onclick:isMessage\"></ul>\r\n        </div>\r\n    </div>\r\n    <div id=\"devMoreInfoP\" class=\"infoView\">\r\n        <span class=\"infoTip\">设备详情列表</span>\r\n        <div class=\"end\">\r\n            <table id=\"moreInfoListP\" class=\"infoTableView\"></table>\r\n        </div>\r\n        <button id=\"closeShowP\" class=\"closeShow\" data-dojo-attach-event=\"onclick:closeMoreInfo\">关闭</button>\r\n    </div>\r\n</div>"}});define("com/huayun/webgis/widget/searchs/PointSearch",["dojo/_base/declare","dojo/topic","../MapModuleX","../../Feature","../../Graphic","../../geometry/Point","../../geometry/Polyline","../../geometry/Multipoint","../../geometry/Polygon","../../symbols/PointSymbol","../../symbols/LineSymbol","../../symbols/PolygonSymbol","dojo/text!../../templates/searchs/pointSearch.html"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d){return _1("com.huayun.webgis.widget.searchs.PointSearch",[_3],{baseClass:"pointSearch",templateString:_d,constructor:function(){this.map=null;this.view=null;this.dataList=null;},doInit:function(){this.map=this.get("map");this.view=this.get("view");_2.subscribe("showPoint",function(_e,e){this.dataList=_e;for(var i=0;i<this.dataList.length;i++){this.mscLocation(this.dataList[i]);}}.bind(this));_2.subscribe("closePoint",function(){this.map.findLayerById("drawLayer").clear();}.bind(this));},mscLocation:function(_f){var _10=_f.geometry;var _11=_f.geometryType;var _12=this.map.findLayerById("drawLayer");var _13=new _a({color:"#FFFF00",radious:10,strokeColor:"#0000FF",strokeWidth:1});var _14=new _b({color:"#ff2f39",width:3});var _15=new _c({color:"#0FF",opacity:0.5});switch(_11){case "esriGeometryPoint":var _16=new _6(_10.x,_10.y);this.addgraphic(_12,_16,_13);break;case "esriGeometryMultipoint":var _17=_10.points.map(function(_18){return new _6(_18[0],_18[1]);});var _19=new _8(_17);this.addgraphic(_12,_19,_13);break;case "esriGeometryPolyline":var _1a=_10.paths.map(function(_1b){return _1b.map(function(p){return new _6(p[0],p[1]);});});var _1c=new _7(_1a);this.addgraphic(_12,_1c,_14);break;default:var _1d=_10.rings.map(function(_1e){return _1e.map(function(p){return new _6(p[0],p[1]);});});var _1f=new _9(_1d);this.addgraphic(_12,_1f,_15);}},addgraphic:function(_20,_21,_22){var _23=new _4({attributes:null,geometry:_21});var _24=new _5({feature:_23,symbol:_22});_20.addGraphic(_24);this.view.threeRender();}});});