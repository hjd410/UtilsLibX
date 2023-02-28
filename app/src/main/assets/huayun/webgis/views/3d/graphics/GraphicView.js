//>>built
define("com/huayun/webgis/views/3d/graphics/GraphicView",["dojo/_base/declare","com/huayun/webgis/geometry/Point2D","com/huayun/webgis/gl/LineBucketCut","../../../../util/BaseGetAndSet"],function(_1,_2,_3,_4){return _1("com.huayun.webgis.views.3d.graphics.GraphicView",[_4],{constructor:function(_5){this._symbol=_5.symbol;this._graphic=_5.graphic;this._currentGroup=null;this.canvas=document.createElement("canvas");this.canvas.width=128;this.canvas.height=64;this.ctx=this.canvas.getContext("2d");},_setGraphicAttr:function(_6){},_getGraphicAttr:function(){return this._graphic;},_setVisibleAttr:function(_7){if(this._graphic.mesh){this._graphic.mesh.visible=_7;this._graphic.mesh.material.visible=_7;this._render();}},refresh:function(){for(var i=0;i<this._graphic.layer.layerViews.length;i++){var _8=this._graphic.layer.layerViews[i];if(_8.view.name!=="EagleEye"){this.draw(_8);}}},draw:function(_9){var _a=_9._group;var _b=_9.view;var _c=_b.viewpoint.scale;var _d=this._graphic.feature;var _e=this._graphic.symbol;var _f=/(\d+)([A-Za-z]*)/;if(_f.test(_e["size"])){_e["size"]=Number(_e.size.toString().replace(/(\d+)([A-Za-z]*)/,"$1"));}switch(_e.type){case "line":this._renderLine2(_b,_e,_d,this._graphic,_a,_c);break;case "point":this._renderPoint(_b,_e,_d,this._graphic,_a,_c);break;case "polygon":this._renderPolygon(_b,_e,_d,this._graphic,_a);break;case "circle":this._renderCircle(_b,_e,_d,this._graphic,_a,_c);break;case "image":this._renderImage(_b,_e,_d,this._graphic,_a,_c);break;case "sphere":this._renderSphere(_b,_e,_d,this._graphic,_a,_c);break;case "textField":this._renderTextField(_b,_e,_d,this._graphic,_a,_c);break;case "close":this._renderClose(_b,_e,_d,this._graphic,_a,_c);break;}},_renderLine:function(_10,_11,_12,_13,_14){var _15=_12.geometry;var _16=_15.path;var geo=new THREE.Geometry();var _17;var pos=_14.position;for(var i=0;i<_16.length;i++){var _18=_16[i];for(var j=0;j<_18.length;j++){var _19=_18[j];_17=_10._geometryToScene(_19.x,_19.y,_19.z);geo.vertices.push(new THREE.Vector3(_17.x-pos.x,_17.y-pos.y,0.5));}}var _1a=new MeshLine();_1a.setGeometry(geo);if(typeof _13.mesh==="undefined"){var _1b=_11.material;_1b.depthTest=false;var _1c=new THREE.Mesh(_1a.geometry,_1b);_1c.userData={feature:_12,meshLine:_1a};_13.id=_1c.uuid;_13.rendered=true;_13.mesh=_1c;_1c.renderOrder=1;_1c.position.set(0,0,1);_13.sameMaterial=true;_14.add(_1c);}else{var _1d=_13.mesh;_1d.renderOrder=1;_1d.position.set(0,0,1);_1d.geometry.dispose();_1d.geometry=_1a.geometry;}this._render();},_renderLine2:function(_1e,_1f,_20,_21,_22,_23){var _24=_20.geometry;var _25=_24.path;var _26;var _27=[];for(var i=0;i<_25.length;i++){var _28=_25[i];var _29=[];for(var j=0;j<_28.length;j++){var _2a=_28[j];_26=_1e._geometryToScene(_2a.x,_2a.y,_2a.z);_29.push(new _2(Math.round(_26.x),Math.round(_26.y)));}_27.push(_29);}var _2b=new _3();_2b.addFeature(_27,"miter","butt",2,1.05);var geo=new THREE.BufferGeometry();var _2c=_2b.layoutVertexArray.arrayBuffer;var _2d=new Int16Array(_2c);_2d.count=_2b.layoutVertexArray.length;var _2e=new THREE.InterleavedBuffer(_2d,4);var _2f=new Uint8Array(_2c);_2f.count=_2b.layoutVertexArray.length;var _30=new THREE.InterleavedBuffer(_2f,8);var _31=new THREE.InterleavedBufferAttribute(_2e,2,0);var _32=new THREE.InterleavedBufferAttribute(_30,4,4);geo.addAttribute("position",_31);geo.addAttribute("a_data",_32);i=new THREE.BufferAttribute(_2b.indexArray.uint16,1);i.count=_2b.indexArray.length*3;geo.setIndex(i);if(typeof _21.mesh==="undefined"){var _33=_1f.material;_33.uniforms.u_ratio.value=1;_33.depthTest=false;var _34=new THREE.Mesh(geo,_33);_34.userData={feature:_20};_21.id=_34.uuid;_21.rendered=true;_21.mesh=_34;_34.renderOrder=1;_21.sameMaterial=true;_22.add(_34);}else{var _35=_21.mesh;_35.renderOrder=1;_35.geometry.dispose();_35.geometry=geo;_35.material.uniforms.u_ratio.value=1;}this._render();},_renderPoint:function(_36,_37,_38,_39,_3a){var _3b=_38.geometry;var _3c=_36._geometryToScene(_3b.x,_3b.y,_3b.z);var _3d;if(typeof _39.mesh==="undefined"){if(!_37.mesh){var _3e=new THREE.Sprite(_37.material);_37.mesh=_3e;}_3d=_37.mesh.clone();var _3f=1/_36.viewpoint.cameraToCenterDistance*_37.size;_3d.scale.set(_3f,_3f,1);_3d.position.set(_3c.x,_3c.y,10);_3d.userData={feature:_38};_39.id=_3d.uuid;_39.rendered=true;_39.mesh=_3d;_39.sameMaterial=true;_39.sameGeometry=true;_39.hasTexture=true;_3a.add(_3d);}else{var _40=_39.mesh;_40.position.set(_3c.x,_3c.y,10);if(_37.fixedSize){var _3f=1/_36.viewpoint.cameraToCenterDistance*_37.size;_40.scale.set(_3f,_3f,1);}}this._render();},_renderPolygon:function(_41,_42,_43,_44,_45){var _46=_43.geometry;var _47=_46.path;var pos=_45.position;var _48=_41._geometryToScene(_47[0].x,_47[0].y,_47[0].z);var _49=new THREE.Shape();_49.moveTo(_48.x-pos.x,_48.y-pos.y,0.5);for(var i=1;i<_47.length;i++){var _4a=_41._geometryToScene(_47[i].x,_47[i].y,_47[i].z);_49.lineTo(_4a.x-pos.x,_4a.y-pos.y,0.5);}var g=new THREE.ShapeGeometry(_49);if(typeof _44.mesh==="undefined"){var m=_42.material;m.depthTest=false;var _4b=new THREE.Mesh(g,m);_4b.userData={feature:_43};_44.id=_4b.uuid;_44.mesh=_4b;_4b.position.set(0,0,1);_44.sameMaterial=true;_45.add(_4b);}else{var _4c=_44.mesh;_4c.geometry=g;}this._render();},_renderCircle:function(_4d,_4e,_4f,_50,_51,_52){var _53=_4f.geometry.center;var _54=_4f.geometry.radius;_53=_4d._geometryToScene(_53.x,_53.y,_53.z);var _55=new THREE.CircleGeometry(_54,256);if(typeof _50.mesh==="undefined"){_4e.material.depthTest=false;var _56=new THREE.Mesh(_55,_4e.material);_56.position.set(_53.x,_53.y,1);_50.id=_56.uuid;_50.mesh=_56;_51.add(_56);}else{var _57=_50.mesh;_57.geometry=_55;_57.position.set(_53.x,_53.y,1);}this._render();},_renderImage:function(_58,_59,_5a,_5b,_5c,_5d){var _5e=_5a.geometry;var _5f=_58._geometryToScene(_5e.x,_5e.y,_5e.z);var pos=_5c.position;var _60;if(typeof _5b.mesh==="undefined"){if(!_59.mesh){var geo=new THREE.PlaneGeometry(_59.width,_59.height);_59.mesh=new THREE.Mesh(geo,_59.material);_59.rendered=true;_59.material.depthTest=false;}_60=_59.mesh.clone();_60.position.set(_5f.x-pos.x,_5f.y-pos.y,1);_60.scale.set(_5d,_5d,1);_60.userData={feature:_5a};_5b.id=_60.uuid;_5b.rendered=true;_5b.mesh=_60;_5b.sameMaterial=true;_5b.sameGeometry=true;_5b.hasTexture=true;_5c.add(_60);}else{var _61=_5b.mesh;_61.position.set(_5f.x-pos.x,_5f.y-pos.y,1);if(_59.fixedSize){_61.scale.set(_5d,_5d,1);}}this._render();},_renderSphere:function(_62,_63,_64,_65,_66,_67){var _68=_64.geometry;var pos=_66.position;var _69;var _6a=new THREE.SphereGeometry(_68.radius,60,60);if(!_63.mesh){_63.mesh=new THREE.Mesh(_6a,_63.material);_63.rendered=true;_63.material.depthTest=false;}var _6b=_62._geometryToScene(_68.center.x,_68.center.y);if(typeof _65.mesh==="undefined"){_69=_63.mesh.clone();_69.position.set(_6b.x-pos.x,_6b.y-pos.y,0.1);_65.id=_69.uuid;_65.mesh=_69;_66.add(_69);}else{var _6c=_65.mesh;_6c.geometry.dispose();_6c.geometry=_6a;_6c.position.set(_6b.x-pos.x,_6b.y-pos.y,0.1);}this._render();},_renderTextField:function(_6d,_6e,_6f,_70,_71,_72){this.ctx.strokeStyle=_6e.color;this.ctx.fillStyle=_6e.color;var _73=_6f.geometry;var _74=_6d._geometryToScene(_73.x,_73.y,_73.z);var pos=_71.position;var _75;var _76=this._createTextTexture(_6e.text);var mat=new THREE.SpriteMaterial({map:_76,depthTest:false,opacity:1,transparent:true,sizeAttenuation:false});if(!_6e.mesh){_6e.mesh=new THREE.Sprite(mat);_6e.mesh.userData={type:_6f.type};}if(typeof _70.mesh==="undefined"){_75=_6e.mesh.clone();if(_6e.fixedSize){_75.scale.set(1/_6d.initZ*this.canvas.width*_72,1/_6d.initZ*this.canvas.height*_72,1);}_75.material=mat;_75.material.depthTest=false;_75.renderOrder=1;_75.position.set(_74.x-pos.x,_74.y-pos.y,0.1);_70.id=_75.uuid;_70.mesh=_75;_71.add(_75);}else{var _77=_70.mesh;_77.material=mat;_77.material.depthTest=false;_77.renderOrder=1;if(_6e.fixedSize){_77.scale.set(1/_6d.initZ*this.canvas.width*_72,1/_6d.initZ*this.canvas.height*_72,1);}_77.position.set(_74.x-pos.x,_74.y-pos.y,0.1);}this._render();},_renderClose:function(_78,_79,_7a,_7b,_7c,_7d){this.canvas.width=_79.size;this.canvas.height=_79.size;this.ctx.strokeStyle=_79.color;this.ctx.fillStyle=_79.color;var _7e=_7a.geometry;var _7f=_78._geometryToScene(_7e.x,_7e.y,_7e.z);var pos=_7c.position;var _80;var _81=this._createCloseTexture(_79.size,1);var mat=new THREE.SpriteMaterial({map:_81,depthTest:false,opacity:1,transparent:true,sizeAttenuation:false});if(!_79.mesh){_79.mesh=new THREE.Sprite(mat);_79.mesh.position.set(_7f.x-pos.x,_7f.y-pos.y,1);_79.mesh.userData={type:_7a.type};}if(typeof _7b.mesh==="undefined"){_80=_79.mesh.clone();_80.material=mat;_80.renderOrder=1;_80.scale.set(1/_78.initZ*this.canvas.width*_7d,1/_78.initZ*this.canvas.height*_7d,1);_80.position.set(_7f.x-pos.x+20*_7d,_7f.y-pos.y,0.1);_7b.id=_80.uuid;_7b.mesh=_80;_7c.add(_80);}else{var _82=_7b.mesh;_82.material=mat;_82.renderOrder=1;if(_79.fixedSize){_82.scale.set(1/_78.initZ*this.canvas.width*_7d,1/_78.initZ*this.canvas.height*_7d,1);}_82.position.set(_7f.x-pos.x+20*_7d,_7f.y-pos.y,0.1);}this._render();},_createTextTexture:function(_83){this.ctx.clearRect(0,0,100,32);this.ctx.fillText(_83,4,20);var _84=new THREE.CanvasTexture(this.canvas);_84.needsUpdate=true;_84.magFilter=THREE.NearestFilter;_84.minFilter=THREE.NearestFilter;return _84;},_createCloseTexture:function(_85,_86){var _87=_86+2;this.ctx.lineCap="round";this.ctx.clearRect(0,0,_85,_85);this.ctx.strokeRect(0,0,_85,_85);this.ctx.lineWidth=2*_86;this.ctx.moveTo(_87,_87);this.ctx.lineTo(_85-(_87),_85-(_87));this.ctx.moveTo(_87,_85-(_87));this.ctx.lineTo(_85-_87,_87);this.ctx.stroke();return new THREE.CanvasTexture(this.canvas);},_render:function(){for(var i=0;i<this._graphic.layer.layerViews.length;i++){var _88=this._graphic.layer.layerViews[i];if(_88.view!=="EagleEye"){_88.view.threeRender();}}},remove:function(_89){if(_89){for(var i=0;i<this._graphic.layer.layerViews.length;i++){var _8a=this._graphic.layer.layerViews[i];if(_8a.view!=="EagleEye"){var _8b=_8a._group;_8b.remove(_89.mesh);}}_89.mesh=undefined;_89=null;this._render();}},clear:function(){for(var i=0;i<this._graphic.layer.layerViews.length;i++){var _8c=this._graphic.layer.layerViews[i];if(_8c.view!=="EagleEye"){this.remove(this._graphic);}}}});});