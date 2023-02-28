//>>built
define("com/huayun/webgis/layers/SceneGraphicLayer",["dojo/_base/declare","./Layer","../views/3d/layers/GraphicLayerView3D","../data/GraphicIndex","com/huayun/webgis/symbols/PointSymbol","com/huayun/webgis/symbols/CircleSymbol","com/huayun/webgis/symbols/PolygonSymbol","com/huayun/webgis/symbols/LineSymbol"],function(_1,_2,_3,_4,_5,_6,_7,_8){return _1("com.huayun.webgis.layers.GraphicLayer",[_2],{constructor:function(_9){this.type="graphic";this.graphics=[];this.id="graphic";this.maxLevel=15;this.minLevel=0;this.opacity=1;_1.safeMixin(this,_9);this.graphicIndex=new _4();this.queryPadding=20;this.indexNeedUpdate=true;this.selectEnabled=true;this.highlightGraphics=[];if(_9.graphics){_9.graphics.forEach(function(_a){this.addGraphic(_a);}.bind(this));}},createLayerView:function(_b,_c){var _d=new _3({opacity:this.opacity,visible:this.visible,view:_b,id:this.id,layer:this});this.layerView=_d;_d.transform=_b.viewpoint;this.graphics.forEach(function(_e){this.layerView.addGraphic(_e);}.bind(this));return _d;},addGraphic:function(_f){this.graphics.push(_f);_f.layer=this;if(this.layerView){this.layerView.addGraphic(_f);}this.indexNeedUpdate=true;},removeGraphic:function(_10){if(!_10){return;}var ii=this.graphics.length;for(var i=0;i<ii;i++){if(_10.id===this.graphics[i].id){_10.bucket.destroy();this.graphics.splice(i,1);break;}}this.layerView.view.threeRender();},addMultiPoint:function(_11){this.graphics.push(_11);this.layerView.addMultiPoint(_11);},removeGraphics:function(_12){},setVisible:function(_13){this.visible=_13;this.layerView.setVisible(_13);},refresh:function(){this.layerView.view.threeRender();},clear:function(){this.graphics.forEach(function(_14){if(_14.bucket){_14.bucket.destroy();}});this.graphics=[];this.layerView.view.threeRender();},queryFeaturesByGeometry:function(_15,_16){if(this.indexNeedUpdate){this.graphicIndex.clear();this.graphics.forEach(function(_17){var _18;switch(_17.symbol.type){case "point":_18=[[_17.feature.geometry]];break;case "circle":_18=[[_17.feature.geometry.center]];break;case "text":return;case "image":_18=[[_17.feature.geometry]];break;default:_18=_17.feature.geometry.path;}this.graphicIndex.insert(_18,_17.id);}.bind(this));this.indexNeedUpdate=false;}_16=_16||this.queryPadding;switch(_15.type){case "point":_15=[_15];break;}return this.graphicIndex.query(_15,_16,this.graphics,this.layerView.view.resolution,this.layerView.view.viewpoint);},queryRenderFeaturesByGeometry:function(_19,_1a){if(this.indexNeedUpdate){this.graphicIndex.clear();this.graphics.forEach(function(_1b){var _1c;switch(_1b.symbol.type){case "point":_1c=[[_1b.feature.geometry]];break;case "circle":_1c=[[_1b.feature.geometry.center]];break;case "text":return;case "image":_1c=[[_1b.feature.geometry]];break;default:_1c=_1b.feature.geometry.path;}this.graphicIndex.insert(_1c,_1b.id);}.bind(this));this.indexNeedUpdate=false;}_1a=_1a||this.queryPadding;switch(_19.type){case "point":_19=[_19];break;}return this.graphicIndex.queryRender(_19,_1a,this.graphics,this.layerView.view.resolution,this.layerView.view.viewpoint);},highlightGraphic:function(_1d){if(!this.highlightSymbol){this.highlightSymbol={point:new _5({color:"#FFFF00",radius:16}),line:new _8({color:"#BF2BFF",width:4,join:"round",cap:"round"}),polygon:new _7({color:"#FF4B37"})};}var _1e=false;this.highlightGraphics.forEach(function(_1f){delete _1f.highLightSymbol;_1e=true;}.bind(this));this.highlightGraphics=[];_1d.forEach(function(_20){_20.highLightSymbol=this.highlightSymbol[_20.symbol.type];_1e=true;}.bind(this));this.highlightGraphics=_1d;if(_1e){this.layerView.view.threeRender();}}});});