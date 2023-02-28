//>>built
define("com/huayun/webgis/layers/3d/GraphicSceneLayer",["dojo/_base/declare","./SceneLayer","../../Feature","../../Graphic","../../geometry/MapPoint"],function(_1,_2){return _1("com.huayun.webgis.layers.3d.GraphicSceneLayer",[_2],{_symbol:null,graphicArray:[],group:null,name:"Graphic图层",id:"Graphic",map:null,constructor:function(_3){_1.safeMixin(this,_3);this.group=new THREE.Group();this.graphicArray=[];},addGraphic:function(_4){_4.graphicLayer=this;_4.draw();},removeGraphic:function(_5){if(_5&&_5.graphicLayer===this){var _6=_5.mesh;if(_6){_6.geometry.dispose();this.group.remove(_6);}}},clear:function(){var _7=this.group.children,_8;for(var i=_7.length-1;i>-1;i--){_8=_7[i];_8.geometry.dispose();this.group.remove(_8);}this.map.layerContainer.threeRender();},getGraphicArray:function(){return this.group.children;},setGraphicArray:function(_9){for(var i=0;i<_9.length-1;i++){this.addGraphic(_9[i]);}},refresh:function(){this.readyData();this.startRender();},readyData:function(){if(this.visible){this.fetchData();}},fetchData:function(){},startRender:function(){if(this.group.visible){this.render();}},render:function(){this.map.layerContainer.threeRender();},pan:function(_a,_b){this.group.position.x+=_a;this.group.position.y-=_b;},setVisible:function(_c){this.visible=_c;this.group.visible=_c;if(this.visible){this.refresh();}else{this.map.layerContainer.threeRender();}}});});