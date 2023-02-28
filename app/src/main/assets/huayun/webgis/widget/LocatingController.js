//>>built
require({cache:{"url:com/huayun/webgis/templates/locatingController.html":"<ul class=\"${baseClass}\" style=\"width:${width}px;pointer-events: all;\">\r\n    <li class=\"locating-item\">\r\n        <label class=\"item-label\" for=\"point\">坐标(点)</label>\r\n        <input id=\"point\" type=\"text\" value=\"${inputDefaultValue.point}\">\r\n        <span class=\"btn locate-btn\" data-dojo-attach-event=\"onclick:locateOnPoint\"></span>\r\n        <span class=\"btn clear-btn\" data-dojo-attach-event=\"onclick:clearLocating\"></span>\r\n    </li>\r\n    <li class=\"locating-item\">\r\n        <label class=\"item-label\" for=\"points\">坐标(多点)</label>\r\n        <input id=\"points\" type=\"text\" value=\"${inputDefaultValue.points}\">\r\n        <span class=\"btn locate-btn\" data-dojo-attach-event=\"onclick:locateOnPoints\"></span>\r\n        <span class=\"btn clear-btn\" data-dojo-attach-event=\"onclick:clearLocating\"></span>\r\n    </li>\r\n\r\n    <li class=\"locating-item\">\r\n        <label class=\"item-label\" for=\"line\">坐标(线)</label>\r\n        <input id=\"line\" type=\"text\" value=\"${inputDefaultValue.line}\" >\r\n        <span class=\"btn locate-btn\" data-dojo-attach-event=\"onclick:locateOnLineString\"></span>\r\n        <span class=\"btn clear-btn\" data-dojo-attach-event=\"onclick:clearLocating\"></span>\r\n    </li>\r\n    <!--\r\n   <li class=\"locating-item\">\r\n       <label class=\"item-label\" for=\"lines\">坐标(多线)</label><input id=\"lines\" type=\"text\" value=\"${inputDefaultValue.lines}\">\r\n       <span class=\"btn\" data-dojo-attach-event=\"onclick:locateOnLinesString\">定位</span><span class=\"btn\"\r\n                                                                                                data-dojo-attach-event=\"onclick:clearLocating\">清除</span>\r\n   </li>\r\n   -->\r\n    <li class=\"locating-item\">\r\n        <label class=\"item-label\">坐标(面)</label>\r\n        <input id=\"plane\" type=\"text\" value=\"${inputDefaultValue.plane}\">\r\n        <span class=\"btn locate-btn\" data-dojo-attach-event=\"onclick:locateInPolygon\"></span>\r\n        <span class=\"btn clear-btn\" data-dojo-attach-event=\"onclick:clearLocating\"></span>\r\n    </li>\r\n</ul>"}});define("com/huayun/webgis/widget/LocatingController",["dojo/_base/declare","dojo/topic","dojo/_base/query","./MapModuleX","../Feature","../Graphic","../geometry/Extent","../geometry/Polygon","../geometry/Polyline","../symbols/PointSymbol","../symbols/LineSymbol","../symbols/PolygonSymbol","../geometry/Point2D","dojo/text!../templates/locatingController.html"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e){return _1("com.huayun.webgis.widget.LocatingController",[_4],{map:null,view:null,maxLevel:null,templateString:_e,name:"",baseClass:"locating-panel",backgroundColor:"",width:400,height:"100%",_graphicLayer:{},_graphicLayerView:{},inputDefaultValue:{point:"POINT(510956.68552086304 3351006.8744868394)",points:"multipoint(510956.68552086304 3351006.8744868394,510756.68552086304 3351206.8744868394,510356.68552086304 3350906.8744868394)",line:"linestring(510956.68552086304 3351006.8744868394,510756.68552086304 3351206.8744868394)",lines:"multilinestring((473159.904 3347918.429,472572.073 3347775.921)(535989.234 3337808.425,441290.124 3340479.781))",plane:"polygon(510956.68552086304 3351006.8744868394,510756.68552086304 3351206.8744868394,510356.68552086304 3350906.8744868394)"},drawOptions:{color:"rgba(65,105,225,.5)",lineWidth:2},doInit:function(){this.map=this.get("map");this.view=this.get("view");this.maxLevel=this.view.viewpoint.maxLevel;this._graphicLayerView=this.view.findLayerViewById("drawLayer");this._graphicLayer=this.map.findLayerById("drawLayer");this.dotSymbol=new _a({radius:10,color:"#2196F3",strokeColor:"#8BC34A",strokeWidth:1});this._lineSymbol=new _b({color:"#009688",width:5});this._polygonSymbol=new _c({color:"#4CAF50",opacity:0.8});},clearLocating:function(){this._graphicLayer.clear();},locateOnPoint:function(){this.clearLocating();var _f=_3("#point")[0].value;var _10=this.geometry2geoJson(_f);var _11={x:Number(_10.coordinates[0]),y:Number(_10.coordinates[1])};var _12=new _d(_11.x,_11.y);var _13=new _5({geometry:_12});var _14=new _6({feature:_13,symbol:this.dotSymbol});this._graphicLayer.addGraphic(_14);this.view.centerAt(_11.x,_11.y,this.maxLevel);},locateOnPoints:function(){this.clearLocating();var _15=_3("#points")[0].value;var _16=this.geometry2geoJson(_15);var _17=this.getCenterPoint(_16.coordinates);var _18=[],_19=[];_16.coordinates.forEach(function(_1a){var x=Number(_1a[0]);var y=Number(_1a[1]);_18.push(x);_19.push(y);var _1b=new _d(x,y,0.1);var _1c=new _5({geometry:_1b});var _1d=new _6({feature:_1c,symbol:this.dotSymbol,graphicLayer:this._graphicLayer});this._graphicLayer.addGraphic(_1d);}.bind(this));this.view.threeRender();this.view.centerAt(_17.x,_17.y);this._getMinRange(_18,_19,_17);},addLine:function(_1e,_1f){var _20=new _9();_20.setPath([[_1e,_1f]]);var _21=new _5({geometry:_20});var _22=new _6({feature:_21,symbol:this._lineSymbol});this._graphicLayer.addGraphic(_22);},locateOnLineString:function(){this.clearLocating();var _23=_3("#line")[0].value;var _24=this.geometry2geoJson(_23);var _25=this.getCenterPoint(_24.coordinates);var _26=new _d(Number(_24.coordinates[0][0]),Number(_24.coordinates[0][1]));var _27=new _d(Number(_24.coordinates[1][0]),Number(_24.coordinates[1][1]));var _28=[_26.x,_27.x];var _29=[_26.y,_27.y];this._getMinRange(_28,_29,_25);this.addLine(_26,_27);this.view.centerAt(_25.x,_25.y);},addPolygon:function(_2a){var _2b=[];for(var i=0;i<_2a.length;i++){var _2c=_2a[i];_2b.push(_2c);}var _2d=new _8();_2d.setPath([_2b]);var _2e=new _5({attribute:null,geometry:_2d,type:"polygon"});var _2f=new _6({feature:_2e,symbol:this._polygonSymbol});this._graphicLayer.addGraphic(_2f);},locateInPolygon:function(){this.clearLocating();var _30=_3("#plane")[0].value;var _31=this.geometry2geoJson(_30);var _32=this.getCenterPoint(_31.coordinates);var _33=[],_34=_31.coordinates,_35;var _36=[],_37=[];for(var i=0;i<_34.length;i++){var x=Number(_34[i][0]);var y=Number(_34[i][1]);_35=new _d(x,y);_36.push(x);_37.push(y);_33.push(_35);}this.addPolygon(_33);this.view.centerAt(_32.x,_32.y);},geometry2geoJson:function(_38){var _39={};var _38=_38.toLocaleUpperCase();if(_38.startsWith("POINT")){_39["type"]="POINT";var _3a=_38.indexOf("(");var _3b=_38.indexOf(")");var _3c=_38.slice(_3a+1,_3b);var _3d=_3c.split(" ");_39["coordinates"]=_3d;}else{if(_38.startsWith("MULTIPOINT")){_39["type"]="MULTIPOINT";var _3e=_38.indexOf("(");var _3f=_38.indexOf(")");var _40=_38.slice(_3e+1,_3f);var _41=_40.split(",");var _42=[];_41.forEach(function(_43){_42.push(_43.split(" "));});_39["coordinates"]=_42;}else{if(_38.startsWith("LINESTRING")){_39["type"]="LINESTRING";var _3e=_38.indexOf("(");var _3f=_38.indexOf(")");var _44=_38.slice(_3e+1,_3f);var _45=_44.split(",");var _46=[];_45.forEach(function(_47){_46.push(_47.split(" "));});_39["coordinates"]=_46;}else{if(_38.startsWith("MULTILINESTRING")){}else{if(_38.startsWith("POLYGON")){_39["type"]="POLYGON";var _3a=_38.indexOf("(");var _3b=_38.indexOf(")");var str=_38.substring(_3a+1,_38.length-1);var arr=[];var _48=str.split(",");_48.forEach(function(_49){arr.push(_49.split(" "));});_39["coordinates"]=arr;}}}}}return _39;},getCenterPoint:function(_4a,_4b){if(_4a&&_4a.length>0){var _4c=_4a[0][0];var _4d=_4a[0][1];var _4e=_4a[0][0];var _4f=_4a[0][1];}_4a.forEach(function(_50){_4c=_50[0]<_4c?_50[0]:_4c;_4e=_50[0]>_4e?_50[0]:_4e;_4d=_50[1]<_4d?_50[1]:_4d;_4f=_50[1]>_4f?_50[1]:_4f;});var _51={x:(Number(_4c)+Number(_4e))/2,y:(Number(_4d)+Number(_4f))/2};if(_4b){_4b(_51);}return _51;},getLevelExtent:function(_52){if(_52&&_52.length>0){var _53=_52[0][0];var _54=_52[0][1];var _55=_52[0][0];var _56=_52[0][1];}_52.forEach(function(_57){_53=_57[0]<_53?_57[0]:_53;_55=_57[0]>_55?_57[0]:_55;_54=_57[1]<_54?_57[1]:_54;_56=_57[1]>_56?_57[1]:_56;});var _58=new _7(_53,_54,_55,_56);return _58;},drawPoint:function(_59){},_getMinRange:function(_5a,_5b,_5c){var _5d=Math.min.apply(null,_5a),_5e=Math.max.apply(null,_5a),_5f=Math.min.apply(null,_5b),_60=Math.max.apply(null,_5b);var _61=new _7(_5d,_5f,_5e,_60);this.view.setExtent(_61,_5c);var _62=this.maxLevel-this.view.level;_2.publish("changeLevel",{level:this.view.level,diffLevel:_62});}});});