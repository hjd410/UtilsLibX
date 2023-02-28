//>>built
define("com/huayun/webgis/ModelGraphic",["./utils/glTFLoader","./gl/SegmentVector","./gl/programCache","./gl/mode","custom/gl-matrix-min"],function(_1,_2,_3,_4,_5){var _6=function(_7,_8){var _9={};var _a=_8.position;if(_7.ground&&!_a.posMidified){var _b=Math.min(_7.viewpoint.targetZoom||_7.viewpoint.level,_7.ground.maxLevel);var _c=_7.viewpoint.tileInfo.getResolution(_b);var _d=_7.viewpoint.tileInfo.getColForX(_a.x,_c),_e=_7.viewpoint.tileInfo.getRowForY(_a.y,_c),_f=_d-Math.floor(_d),_10=_e-Math.floor(_e);var _11=_7.ground.sourceCache.getTileByID(_b+"/"+Math.floor(_d)+"/"+Math.floor(_e));if(_11&&_11.fbo){_a.posMidified=true;var gl=_7.context.gl;_7.context.bindFramebuffer.set(_11.fbo.framebuffer);var _12=new Float32Array(4);var c=Math.round(_f*256);var d=Math.round(_10*256);gl.readPixels(c===0?c:c-1,d===0?d:d-1,1,1,gl.RGBA,gl.FLOAT,_12);var min=_11.minimumHeight,_13=_11.maximumHeight-_11.minimumHeight;_a.z=_12[0]*_13+min;_8.posMidified=true;}else{_a.z=0;_a.posMidified=false;}}var m=_7.viewpoint.getMatrixForPoint(_a.x,_a.y,false,false,_a.z);_9["u_matrix"]=_5.mat4.multiply(m,m,_8.modelMatrix);return _9;};function _14(_15,_16,_17){var _18=_16.position;if(_15.ground&&!_18.posMidified){var _19=Math.min(_15.viewpoint.targetZoom||_15.viewpoint.level,_15.ground.maxLevel);var _1a=_15.viewpoint.tileInfo.getResolution(_19);var col=_15.viewpoint.tileInfo.getColForX(_18.x,_1a),row=_15.viewpoint.tileInfo.getRowForY(_18.y,_1a),_1b=col-Math.floor(col),_1c=row-Math.floor(row);var _1d=_15.ground.sourceCache.getTileByID(_19+"/"+Math.floor(col)+"/"+Math.floor(row));if(_1d&&_1d.fbo){_18.posMidified=true;var gl=_15.context.gl;_15.context.bindFramebuffer.set(_1d.fbo.framebuffer);var _1e=new Float32Array(4);var c=Math.round(_1b*256);var d=Math.round(_1c*256);gl.readPixels(c===0?c:c-1,d===0?d:d-1,1,1,gl.RGBA,gl.FLOAT,_1e);var min=_1d.minimumHeight,_1f=_1d.maximumHeight-_1d.minimumHeight;_18.z=_1e[0]*_1f+min;_16.posMidified=true;}else{_18.z=0;_18.posMidified=false;}}_17["u_matrix"]=_15.viewpoint.getMatrixForPoint(_18.x,_18.y,false,false,_18.z);};var uid=0;function _20(_21){this.model=_21.model;this.position=_21.position;this.id="modelGraphic"+(uid++);this.selectEnabled=_21.selectEnabled===undefined?true:_21.selectEnabled;this.useFallback=false;this.fallback=_21.fallback;this.rotateX=_21.rotateX;this.rotateY=_21.rotateY;this.rotateZ=_21.rotateZ;this.scale=_21.scale;var m=_5.mat4.create();if(this.rotateX){_5.mat4.rotateX(m,m,this.rotateX);}if(this.rotateY){_5.mat4.rotateY(m,m,this.rotateY);}if(this.rotateZ){_5.mat4.rotateY(m,m,this.rotateZ);}if(this.scale){_5.mat4.scale(m,m,this.scale);}this.modelMatrix=m;};_20.prototype.add=function(_22){this.model.load(_22,function(){_22.threeRender();});};_20.prototype.render=function(_23,_24){if(!this.model.loaded){return;}var _25=_23.view.context;var gl=_25.gl;var _26=_4.StencilMode.disabled;var _27=_4.ColorMode.alphaBlended;var _28=_23.depthModeForSublayer(0,_4.DepthMode.ReadWrite);if(this.useFallback){if(!this.fallback.uploaded){this.fallback.upload(_25);}var _29=_3.useProgramSimplify(_25,"cylinder",{layoutAttributes:[{name:"a_pos",type:"Float32",components:3,offset:0}]});var _2a=_24.uniforms;_14(_23.view,this,_2a);var _2b=this.fallback.bucket;_29.draw(_25,gl.TRIANGLES,_28,_26,_27,_4.CullFaceMode.disabled,_2a,this.model.id+"-cylinder",_2b.layoutVertexBuffer,_2b.indexBuffer,_2b.segments);}else{var _29=_3.useProgramSimplify(_25,"mesh",{layoutAttributes:[{name:"position",type:"Float32",components:3,offset:0}]});var _2c=_6(_23.view,this);var _2d=this.model.buckets;for(var i=0;i<_2d.length;i++){var _2b=_2d[i];_2c["u_model"]=_2b.modelMatrix;_2c["u_color"]=_2b.material.color;_29.draw(_25,gl.TRIANGLES,_28,null,_27,_4.CullFaceMode.disabled,_2c,this.model.id+"-"+i,_2b.vertexBuffer,_2b.indexBuffer,_2b.segments);}}};_20.prototype.renderSubstation=function(_2e,_2f){var _30=_2e.view.context;var gl=_30.gl;var _31=_4.StencilMode.disabled;var _32=_4.ColorMode.alphaBlended;var _33=_2e.depthModeForSublayer(0,_4.DepthMode.ReadWrite);if(this.useFallback){if(!this.fallback.uploaded){this.fallback.upload(_30);}var _34=_3.useProgramSimplify(_30,"cylinder",{layoutAttributes:[{name:"a_pos",type:"Float32",components:3,offset:0}]});var _35=_2f.uniforms;_14(_2e.view,this,_35);var _36=this.fallback.bucket;_34.draw(_30,gl.TRIANGLES,_33,_31,_32,_4.CullFaceMode.disabled,_35,this.model.id+"-cylinder",_36.layoutVertexBuffer,_36.indexBuffer,_36.segments);}};return _20;});