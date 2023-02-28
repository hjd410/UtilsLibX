//>>built
define("com/huayun/webgis/layers/EditGraphicsLayer",["dojo/_base/declare","./GraphicLayer","../views/3d/layers/GraphicLayerView3D","../data/GraphicIndex","com/huayun/webgis/symbols/PointSymbol","com/huayun/webgis/symbols/CircleSymbol","com/huayun/webgis/symbols/PolygonSymbol","com/huayun/webgis/symbols/LineSymbol","../renderer/SimpleRenderer"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){function _a(){this.addGraphicList=[];this.editGraphicList=[];this.removeGraphicList=[];this.graphicsLayer=new _2();this.graphicsLayer.owner=this;this.graphics=this.graphicsLayer.graphics;};if(_2){_a.__proto__=_2;}_a.prototype=Object.create(_2&&_2.prototype);_a.prototype.constructor=_a;_a.prototype.addGraphic=function(_b){this.addGraphicList.push(_b);this.graphicsLayer.addGraphic(_b);};_a.prototype.cancel=function(){};_a.prototype.commit=function(){};_a.prototype.removeGraphic=function(_c){this.graphicsLayer.removeGraphic(_c);};_a.prototype.editGraphic=function(_d,_e){};_a.prototype.createLayerView=function(_f){this.layerView=this.graphicsLayer.createLayerView(_f);return this.layerView;};_a.prototype.setRenderer=function(_10){this.graphicsLayer.setRenderer(_10);};return _a;});