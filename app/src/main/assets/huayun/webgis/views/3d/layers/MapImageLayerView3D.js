//>>built
define("com/huayun/webgis/views/3d/layers/MapImageLayerView3D",["dojo/_base/declare","./LayerView3D","../../../gl/Texture","../../../gl/draw","com/huayun/webgis/gl/mode","com/huayun/webgis/data/ArrayType","com/huayun/webgis/utils/Constant","com/huayun/webgis/gl/members","com/huayun/webgis/gl/SegmentVector"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){return _1("com.huayun.webgis.views.3d.layers.MapImageLayerView3D",[_2],{_promise:null,_dataChange:null,view:null,constructor:function(_a){_1.safeMixin(this,_a);var _b=new _6.StructArrayLayout3ui6();_b.emplaceBack(0,1,2);_b.emplaceBack(2,1,3);this.quadTriangleIndexBuffer=this.view.context.createIndexBuffer(_b);this.viewportSegments=_9.simpleSegment(0,0,4,2);this._matrixDirty=true;this._promiseHandled=false;},setVisible:function(_c){this.visible=_c;this.view.threeRender();},resize:function(){},refresh:function(){this._readyData();this.view.threeRender();},_readyData:function(){var _d=this.view.viewpoint.targetZoom||this.view.viewpoint.level;var _e=this.visible;if(this.layer.maxLevel){if(_d>=this.layer.maxLevel){_e=false;}}if(_e){var _f=this.view.getExtent();if(_f){var _10=this.view.viewpoint.tileInfo.getResolution(_d);if(this._promise&&!this._promise.isResolved()){this._promise.cancel();}this._promise=this.layer.fetchImage(_f,Math.round(_f.getWidth()/_10),Math.round(_f.getHeight()/_10));this._promiseHandled=false;if(this._dataChange&&!this._dataChange.isResolved()){this._dataChange.cancel();}this._dataChange=this.layer.getMSCdata(_f);}}},_render:function(){var _11=this.view.viewpoint.targetZoom||this.view.viewpoint.level;var _12=this.visible;if(this.layer.maxLevel){if(_11>=this.layer.maxLevel){_12=false;}}if(_12){var _13=this.view.getExtent();if(!this._promiseHandled&&this._promise&&_13){this._promiseHandled=true;this._promise.then(function(_14){this._promise=null;this._promiseHandled=false;if(_14){this.position=this.view.viewpoint.center;this.extent=_13;this._matrixDirty=true;var _15=this.view.context;var gl=_15.gl;if(this.texture){this.texture.update(_14,{useMipmap:true});}else{this.texture=new _3(_15,_14,gl.RGBA,{useMipmap:true});this.texture.bind(gl.LINEAR,gl.CLAMP_TO_EDGE,gl.LINEAR_MIPMAP_NEAREST);if(_15.extTextureFilterAnisotropic){gl.texParameterf(gl.TEXTURE_2D,_15.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT,_15.extTextureFilterAnisotropicMax);}}this.texture.zoom=_11;}this.view.threeRender();}.bind(this));}this._drawLayer();}},_drawLayer:function(){if(this.extent){this.view.currentLayer++;if(this._matrixDirty){var _16=this.extent,_17=this.position;var _18=_7.layout.EXTENT;var _19=new _6.StructArrayLayout4f16();_19.emplaceBack(_16.minx-_17[0],_17[1]-_16.maxy,0,0);_19.emplaceBack(_16.maxx-_17[0],_17[1]-_16.maxy,_18,0);_19.emplaceBack(_16.minx-_17[0],_17[1]-_16.miny,0,_18);_19.emplaceBack(_16.maxx-_17[0],_17[1]-_16.miny,_18,_18);this.viewportBuffer=this.view.context.createVertexBuffer(_19,[{name:"a_pos",type:"Float32",components:2,offset:0},{name:"a_texture_pos",type:"Float32",components:2,offset:8}]);this._matrixDirty=false;}this.depthRangeFor3D=[0,1-((1+this.view.currentLayer)*this.view.numSublayers)*this.view.depthEpsilon];_4.drawImageLayer(this);}},zoom:function(){var _1a=this.view.viewpoint.targetZoom||this.view.viewpoint.level;var _1b=this.visible;if(this.layer.maxLevel){if(_1a>=this.layer.maxLevel){_1b=false;}}if(_1b){this.view.currentLayer++;_4.drawImageLayer(this);}},depthModeForSublayer:function(n,_1c,_1d){var _1e=1-((1+this.view.currentLayer)*this.view.numSublayers+n)*this.view.depthEpsilon;return new _5.DepthMode(_1d||this.view.context.gl.LEQUAL,_1c,[_1e,_1e]);}});});