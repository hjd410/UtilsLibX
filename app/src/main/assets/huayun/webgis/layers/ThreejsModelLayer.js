//>>built
define("com/huayun/webgis/layers/ThreejsModelLayer",["dojo/_base/declare","./Layer","../views/3d/layers/ThreejsModelLayerView3D"],function(c,d,e){return c("com.huayun.webgis.layers.ModelLayer",[d],{constructor:function(a){c.safeMixin(this,a);this.layerView=null;this.models=[];this.loader=a.loader||new THREE.GLTFLoader;this.lights=a.lights||[];this.rotate=0},createLayerView:function(a,b){b=new e({width:a.width,height:a.height,opacity:this.opacity,visible:this.visible,view:a,id:this.id,layer:this,lights:this.lights});
b.transform=a.viewpoint;this.layerView=b;this.models.forEach(function(a){a.loaded=!1;this.layerView.addModel(a)}.bind(this));return b},addModel:function(a,b){a.loaded=!1;this.models.push(a);this.layerView&&this.layerView.addModel(a,b)},removeModel:function(a){}})});