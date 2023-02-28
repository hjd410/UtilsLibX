//>>built
define("com/huayun/thematicmap/modules/SystemMapPSC",["dojo/Deferred","dojo/request","dojo/promise/all","../../webgis/Map","../../util/JSONFormatterUtil","../../webgis/views/SceneView","../../webgis/layers/FeatureLayer","../../util/WKTGeometryFormater","../../webgis/layers/LabelLayer"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){function _a(_b,_c){this.backFun=_c;this.wktGeometryFormatter=new _8();var _d=_b.dataJSON.data[0]["SHAPE"];this.mapId=_b.dataJSON.data[0]["MAP_ID"];this.diagramVo=_b.diagramVo;var _e=_b.diagramVo.diagramVo.environmentVo.bgColor;this.polygon=this.wktGeometryFormatter.toGeometry(_d);var _f=_b.diagramVo.diagramVo.mapVo.workspace;this.service=_b.diagramVo.dataSourceVo.services[_f];this.token=_b.token;this.map=new _4();this.view=new _6({container:_b.container,map:this.map,backgroundColor:"rgb("+_e+")",rotateEnabled:false});this.view.setExtent(this.polygon.extent);this.currentRule=this.view.scale;this.list=_b.diagramVo.diagramVo.mapVo.layerVoList;this.createLayer(this.list);};_a.prototype.createLayer=function(_10){for(var i=_10.length-1;i>-1;i--){var _11=_10[i];_11.id="FeatureLayer_"+i;var _12={url:this.service.description,filter:"map_id="+this.mapId,access_token:this.token};if(_12.filter!==""){if(_11.dataSource.whereFilter!==""){_12.filter=_12.filter+"%26"+_11.dataSource.whereFilter;}}else{if(_11.dataSource.whereFilter!==""){_12.filter=_11.dataSource.whereFilter;}}_11.query=_12;_11.currentRule=this.getCurrentRule(_11.rules);var _13=new _7(_11,function(_14){});this.map.addLayer(_13);}var _15=new _9({id:"labelLayer",layers:this.map.allLayers});this.map.addLayer(_15);var _16;var _17=this;function _18(){_16=requestAnimationFrame(_18);var _19=true;for(var _1a in _17.map.allLayers){var _1b=_17.map.allLayers[_1a];_19=_19&&_1b.state;}if(_19){cancelAnimationFrame(_16);_17.view.setExtent(_17.polygon.extent);_17.backFun();}};_18.call(this);};_a.prototype.getCurrentRule=function(_1c){for(var i=0;i<_1c.length;i++){var _1d=_1c[i];if(this.currentRule>=_1d.minScale&&this.currentRule<=_1d.maxScale){return _1d;}}return null;};_a.prototype.update=function(_1e){function _1f(){var _20=_1e.ptmsService.ptmsUrl+_1e.type+"?filter=DEV_ID="+_1e.devId+"&access_token="+_1e.ptmsService.accessToken;var _21=new _1();_2(_20).then(function(_22){_21.resolve(_22);});return _21.promise;};_3([_1f()]).then(function(_23){this.view.clear();this.wktGeometryFormatter=new _8();var _24=_5.string2Json(_23[0]);var _25=_24.data[0]["SHAPE"];this.mapId=_24.data[0]["MAP_ID"];this.polygon=this.wktGeometryFormatter.toGeometry(_25);this.view.setExtent(this.polygon.extent);this.currentRule=this.view.scale;this.createLayer(this.list);}.bind(this));};_a.prototype.refresh=function(){this.view.clear();this.list=this.diagramVo.diagramVo.mapVo.layerVoList;this.createLayer(this.list);};_a.prototype.clear=function(){this.view.clear();this.view.threeRender();};return _a;});