//>>built
define("com/huayun/webgis/Map",["./core/base","../core/EventEmitter","./utils/extendClazz","./layers/Layer"],function(_1,_2,_3,_4){function _5(_6){this.id=_6&&_6.id?_6.id:"map";this.allLayers=[];};_3(_5,_2);_5.prototype.addLayer=function(_7){if(!(_7 instanceof _4)){throw new Error("添加的必须是图层类型");}for(var i=0,ii=this.allLayers.length;i<ii;i++){if(this.allLayers[i].id===_7.id){throw new Error("图层id必须唯一.");}}this.allLayers.push(_7);this.emit("addLayers",[_7]);};_5.prototype.addLayers=function(_8){for(var j=0,jj=_8.length;j<jj;j++){var _9=_8[j];if(!(_9 instanceof _4)){throw new Error("添加的必须是图层类型");}for(var i=0,ii=this.allLayers.length;i<ii;i++){if(this.allLayers[i].id===_9.id){throw new Error("图层id必须唯一.");}}this.allLayers.push(_9);}this.emit("addLayers",_8);};_5.prototype.addLayerBefore=function(_a,_b){if(!(_a instanceof _4)){throw new Error("添加的必须是图层类型");}var _c=-1;for(var i=this.allLayers.length-1;i>-1;i--){if(this.allLayers[i].id===_a.id){throw new Error("图层id必须唯一.");}if(this.allLayers[i].id===_b){_c=i;break;}}if(_c>-1){this.allLayers.splice(_c,0,_a);this.emit("addLayers",[_a],_b,_c);}else{throw new Error("目标layer不存在, 无法放置到它之前!");}};_5.prototype.removeLayerById=function(_d){for(var i=this.allLayers.length-1;i>-1;i--){if(this.allLayers[i].id===_d){this.allLayers.splice(i,1);this.emit("removeLayers",[_d]);return true;}}return false;};_5.prototype.findAllLayers=function(){return this.allLayers;};_5.prototype.findLayerById=function(_e){for(var i=this.allLayers.length-1;i>-1;i--){if(this.allLayers[i].id===_e){return this.allLayers[i];}}return null;};_5.prototype.refresh=function(){};_5.prototype.clear=function(){this.allLayers.forEach(function(_f){_f.clear();});this.allLayers=[];};return _5;});