//>>built
define("com/huayun/webgis/views/3d/layers/VectorHeatmapLayerView",["dojo/_base/declare","./LayerView3D","com/huayun/webgis/data/ArrayType","com/huayun/webgis/gl/draw","com/huayun/webgis/gl/mode","com/huayun/webgis/layers/support/funcUtils","com/huayun/webgis/layers/support/CrossTileSymbolIndex","com/huayun/webgis/layers/support/PauseablePlacement","com/huayun/webgis/layers/support/EvaluationParameters","com/huayun/webgis/gl/members","com/huayun/webgis/gl/SegmentVector","com/huayun/webgis/utils/Constant","com/huayun/webgis/utils/utils"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d){return _1("com.huayun.webgis.views.3d.layers.VectorHeatmapLayerView",[_2],{view:null,constructor:function(_e){_1.safeMixin(this,_e);this.visible=_e.visible;this.draw$1={heatmap:_4.drawHeatmap,circle:_4.drawCircles};this.crossTileSymbolIndex=new _7();this.nextStencilID=1;var gl=this.view._gl;this.stencilClearMode=new _5.StencilMode({func:gl.ALWAYS,mask:0},0,255,gl.ZERO,gl.ZERO,gl.ZERO);var _f=new _3.StructArrayLayout2i4();_f.emplaceBack(0,0);_f.emplaceBack(1,0);_f.emplaceBack(0,1);_f.emplaceBack(1,1);this.viewportBuffer=this.view.context.createVertexBuffer(_f,_a.posAttributes.members);this.viewportSegments=_b.simpleSegment(0,0,4,2);var _10=new _3.StructArrayLayout3ui6();_10.emplaceBack(0,1,2);_10.emplaceBack(2,1,3);this.quadTriangleIndexBuffer=this.view.context.createIndexBuffer(_10);var _11=new _3.StructArrayLayout2i4();_11.emplaceBack(0,0);_11.emplaceBack(_c.layout.EXTENT,0);_11.emplaceBack(0,_c.layout.EXTENT);_11.emplaceBack(_c.layout.EXTENT,_c.layout.EXTENT);this.tileExtentBuffer=this.view.context.createVertexBuffer(_11,_a.posAttributes.members);this.tileExtentSegments=_b.simpleSegment(0,0,4,2);},refresh:function(){this._readyData();this._render();},_readyData:function(){if(this.visible){if(!this.layer.tileInfo){return;}var _12=this.layer.tileInfo,_13=this.view.viewpoint.targetZoom||this.view.viewpoint.zoom,_14=this.view.center,_15=_12.getResolution(_13);if(!_12){return;}var _16=this.view._bound.map(function(_17){return {x:_12.getColForX(_17.x,_15),y:_12.getRowForY(_17.y,_15)};});var _18=_12.getColRange(_15);var cx=_12.getColForX(_14.x,_15),cy=_12.getRowForY(_14.y,_15);var _19=this.layer._layers;var _1a=new _9(_13,{now:_6.now(),fadeDuration:500,zoomHistory:this.view.zoomHistory,transition:{delay:0,duration:500}});for(var i=0,_1b=this.layer._order;i<_1b.length;i++){var _1c=_19[_1b[i]];_1c.recalculate(_1a);}var _1d=this.layer.sourceCaches;for(var id in _1d){this.tileIDs=_1d[id].updateTile(_13,_16,_18,cx,cy);}this._sourcesDirty=true;this.zoomedBounds=_16;this.range=_18;this.cx=cx;this.cy=cy;}},_render:function(){this._renderVector();},_renderVector:function(){if(this.visible){if(!this.layer.tileInfo){return;}var _1e=this.layer.sourceCaches;var _1f=this.view.viewpoint.targetZoom||this.view.viewpoint.zoom;if(this._sourcesDirty){for(var id in _1e){this.tileIDs=_1e[id].update(_1f,this.zoomedBounds,this.range,this.cx,this.cy);}}this.transform=this.view.viewpoint;this.scale=1;var _20=this.layer._order;var _21={};var _22={};var _23={};for(var _24 in _1e){var _25=_1e[_24];_21[_24]=_25.getVisibleCoordinates(false,this.transform);_22[_24]=_21[_24].slice().reverse();_23[_24]=_25.getVisibleCoordinates(true,this.transform).reverse();}this._placementDirty=this._updatePlacement(0);for(var id in _1e){var _26=_1e[id];_26.prepare(this.view.context);}var _1f=this.view.viewpoint.zoom;this.renderPass="offscreen";this.depthRboNeedsClear=true;for(var i$2=0,_27=_20;i$2<_27.length;i$2+=1){var _28=_27[i$2];var _29=this.layer._layers[_28];if(!_29.hasOffscreenPass()||_29.isHidden(this.transform.zoom)){continue;}var _2a=_22[_29.source];if(_29.type!=="custom"&&!_2a.length){continue;}this.renderLayer(this,_1e[_29.source],_29,_2a);}this.view.context.bindFramebuffer.set(null);this.depthRangeFor3D=[0,1-((_20.length+2)*0.000213623046875)];this.renderPass="opaque";for(this.currentLayer=_20.length-1;this.currentLayer>=0;this.currentLayer--){var _2b=this.layer._layers[_20[this.currentLayer]];if(_2b.type!=="fill"&&_2b.type!="background"){continue;}var _2c=_1e[_2b.source];var _2d=_21[_2b.source];this.renderLayer(this,_2c,_2b,_2d,_1f);}this.renderPass="translucent";for(this.currentLayer=0;this.currentLayer<_20.length;this.currentLayer++){var _2e=this.layer._layers[_20[this.currentLayer]];if(_2e.type==="fill"||_2e.type==="background"){continue;}var _2f=_1e[_2e.source];var _30=(_2e.type==="symbol"?_23:_22)[_2e.source];this.renderLayer(this,_2f,_2e,_30,_1f);}this.view.context.setDefault();}},zoom:function(){if(this.visible){this.view.context.setDefault();this.transform=this.view.viewpoint;var _31=this.layer._order;var _32={};var _33={};var _34={};var _35=this.layer.sourceCaches;for(var _36 in _35){var _37=_35[_36];_32[_36]=_37.updateTileMatrix(false,this.transform);_33[_36]=_32[_36].slice().reverse();_34[_36]=_37.updateTileMatrix(true,this.transform).reverse();}for(var id in _35){var _38=_35[id];this.tileIDs=_38.currentCoords;}var _39=this.view.viewpoint.zoom;this.renderPass="offscreen";this.depthRboNeedsClear=true;for(var i$2=0,_3a=_31;i$2<_3a.length;i$2+=1){var _3b=_3a[i$2];var _3c=this.layer._layers[_3b];if(!_3c.hasOffscreenPass()||_3c.isHidden(this.transform.zoom)){continue;}var _3d=_33[_3c.source];if(_3c.type!=="custom"&&!_3d.length){continue;}this.renderLayer(this,_35[_3c.source],_3c,_3d);}this.view.context.bindFramebuffer.set(null);this.depthRangeFor3D=[0,1-((_31.length+2)*0.000213623046875)];this.renderPass="opaque";for(this.currentLayer=_31.length-1;this.currentLayer>=0;this.currentLayer--){var _3e=this.layer._layers[_31[this.currentLayer]];if(_3e.type!=="fill"&&_3e.type!="background"){continue;}var _3f=_35[_3e.source];var _40=_32[_3e.source];this.renderLayer(this,_3f,_3e,_40,_39);}this.renderPass="translucent";for(this.currentLayer=0;this.currentLayer<_31.length;this.currentLayer++){var _41=this.layer._layers[_31[this.currentLayer]];if(_41.type==="fill"||_41.type==="background"){continue;}var _42=_35[_41.source];var _43=(_41.type==="symbol"?_34:_33)[_41.source];this.renderLayer(this,_42,_41,_43,_39);}this.view.context.setDefault();}},renderLayer:function(_44,_45,_46,_47,_48){if(_46.isHidden(_48)){return;}if(!_47.length){return;}this.id=_46.id;this.draw$1[_46.type](_44,_45,_46,_47);},_updatePlacement:function(_49){var _4a=false;var _4b=false;var _4c={};for(var i=0,_4d=this.layer._order;i<_4d.length;i+=1){var _4e=_4d[i];var _4f=this.layer._layers[_4e];if(_4f.type!=="symbol"){continue;}var _50=_4f.source;if(!_4c[_50]){var _51=this.layer.sourceCaches[_50];_4c[_50]=_51.getRenderableIds(true).map(function(id){return _51.getTileByID(id);}).sort(function(a,b){return (b.tileID.overscaledZ-a.tileID.overscaledZ)||(a.tileID.isLessThan(b.tileID)?-1:1);});}var _52=this.crossTileSymbolIndex.addLayer(_4f,_4c[_50]);_4a=_4a||_52;}this.crossTileSymbolIndex.pruneUnusedLayers(this.layer._order);var _53=this._layerOrderChanged||_49===0;if(_53){this.pauseablePlacement=new _8(this.transform,this.layer._order,_53,false,_49,true,this.placement);this._layerOrderChanged=false;}if(this.pauseablePlacement.isDone()){this.placement.setStale();}else{this.pauseablePlacement.continuePlacement(this.layer._order,this.layer._layers,_4c);if(this.pauseablePlacement.isDone()){this.placement=this.pauseablePlacement.commit(_6.now());_4b=true;}if(_4a){this.pauseablePlacement.placement.setStale();}}if(_4b||_4a){for(var i$1=0,_54=this.layer._order;i$1<_54.length;i$1+=1){var _55=_54[i$1];var _56=this.layer._layers[_55];if(_56.type!=="symbol"){continue;}this.placement.updateLayerOpacities(_56,_4c[_56.source]);}}var _57=!this.pauseablePlacement.isDone()||this.placement.hasTransitions(_6.now());return _57;},_zoomPlacement:function(_58,_59){var _5a=false;var _5b=false;var _5c={};for(var i=0,_5d=this.layer._order;i<_5d.length;i+=1){var _5e=_5d[i];var _5f=this.layer._layers[_5e];if(_5f.type!=="symbol"){continue;}var _60=_5f.source;if(!_5c[_60]){var _61=this.layer.sourceCaches[_60];_5c[_60]=_61.zoomRenderableIds(true).map(function(id){return _61.getTileByID(id);}).filter(function(_62){return _62.tileID.overscaledZ===_59;}).sort(function(a,b){return (b.tileID.overscaledZ-a.tileID.overscaledZ)||(a.tileID.isLessThan(b.tileID)?-1:1);});}var _63=this.crossTileSymbolIndex.addLayer(_5f,_5c[_60]);_5a=_5a||_63;}this.crossTileSymbolIndex.pruneUnusedLayers(this.layer._order);var _64=this._layerOrderChanged||_58===0;if(_64){this.pauseablePlacement=new _8(this.transform,this.layer._order,_64,false,_58,true,this.placement);this._layerOrderChanged=false;}if(this.pauseablePlacement.isDone()){this.placement.setStale();}else{this.pauseablePlacement.continuePlacement(this.layer._order,this.layer._layers,_5c);if(this.pauseablePlacement.isDone()){this.placement=this.pauseablePlacement.commit(_6.now());_5b=true;}if(_5a){this.pauseablePlacement.placement.setStale();}}if(_5b||_5a){for(var i$1=0,_65=this.layer._order;i$1<_65.length;i$1+=1){var _66=_65[i$1];var _67=this.layer._layers[_66];if(_67.type!=="symbol"){continue;}this.placement.updateLayerOpacities(_67,_5c[_67.source]);}}var _68=!this.pauseablePlacement.isDone()||this.placement.hasTransitions(_6.now());return _68;},_renderTileClippingMasks:function(_69,_6a){if(!_69.isTileClipped()||!_6a||!_6a.length){return;}this.currentStencilSource=_69.source;var _6b=this.view.context;var gl=_6b.gl;if(this.nextStencilID+_6a.length>256){this.clearStencil();}_6b.setColorMode(_5.ColorMode.disabled);_6b.setDepthMode(_5.DepthMode.disabled);var _6c=this.view.useProgram("clippingMask");this._tileClippingMaskIDs={};for(var i=0,_6d=_6a;i<_6d.length;i+=1){var _6e=_6d[i];var id=this._tileClippingMaskIDs[_6e.key]=this.nextStencilID++;_6c.draw(_6b,gl.TRIANGLES,_5.DepthMode.disabled,new _5.StencilMode({func:gl.ALWAYS,mask:0},id,255,gl.KEEP,gl.KEEP,gl.REPLACE),_5.ColorMode.disabled,_5.CullFaceMode.disabled,{"u_matrix":_6e.posMatrix.elements},"$clipping",this.tileExtentBuffer,this.quadTriangleIndexBuffer,this.tileExtentSegments);}},depthModeForSublayer:function(n,_6f,_70){var _71=0.99/2+0.5;return new _5.DepthMode(_70||this.view.context.gl.LEQUAL,_6f,[_71,_71]);},clearStencil:function(){var _72=this.view.context;var gl=_72.gl;this.nextStencilID=1;var _73=new Matrix4();_73.ortho(0,this.view.width,this.view.height,0,0,1);_73.scale(gl.drawingBufferWidth,gl.drawingBufferHeight,0);this.view.useProgram("clippingMask").draw(_72,gl.TRIANGLES,_5.DepthMode.disabled,this.stencilClearMode,_5.ColorMode.disabled,_5.CullFaceMode.disabled,{"u_matrix":_73.elements},"$clipping",this.viewportBuffer,this.quadTriangleIndexBuffer,this.viewportSegments);},stencilModeForClipping:function(_74){var gl=this.view.context.gl;return new _5.StencilMode({func:gl.EQUAL,mask:255},this._tileClippingMaskIDs[_74.key],0,gl.KEEP,gl.KEEP,gl.REPLACE);},stencilModeFor3D:function(){if(this.nextStencilID+1>256){this.clearStencil();}var id=1;var gl=this.view.context.gl;return new _5.StencilMode({func:gl.NOTEQUAL,mask:255},id,255,gl.KEEP,gl.KEEP,gl.REPLACE);},zoomEnd:function(_75){return;this.transform=this.view.viewpoint;this._placementDirty=this._updatePlacement(0);var _76=this.layer._order;var _77={};var _78={};var _79={};var _7a=this.layer.sourceCaches;this.scale=_75;for(var _7b in _7a){var _7c=_7a[_7b];_77[_7b]=_7c.updateTileMatrix(false,this.transform,_75);_78[_7b]=_77[_7b].slice().reverse();_79[_7b]=_7c.updateTileMatrix(true,this.transform,_75).reverse();}for(var id in _7a){var _7d=_7a[id];_7d.prepare(this.view.context);this.tileIDs=_7d.currentCoords;}this.renderPass="opaque";for(this.currentLayer=_76.length-1;this.currentLayer>=0;this.currentLayer--){var _7e=this.layer._layers[_76[this.currentLayer]];if(_7e.type!=="fill"&&_7e.type!="background"){continue;}var _7f=_7a[_7e.source];var _80=_77[_7e.source];this.renderLayer(this,_7f,_7e,_80,this.view.level);}this.renderPass="translucent";for(this.currentLayer=0;this.currentLayer<_76.length;this.currentLayer++){var _81=this.layer._layers[_76[this.currentLayer]];if(_81.type==="fill"||_81.type==="background"){continue;}var _82=_7a[_81.source];var _83=(_81.type==="symbol"?_79:_78)[_81.source];this.renderLayer(this,_82,_81,_83,this.view.level);}this._sourcesDirty=true;this.view.context.setDefault();},queryRenderedFeatures:function(_84){var _85={};var _86=[];for(var id in this.layer.sourceCaches){_86.push(this.queryFeatures(this.layer.sourceCaches[id],this.layer._layers,_84,{},this.transform));}return _86;},mergeRenderedFeatureLayers:function(_87){var _88={};var _89={};for(var i$1=0,_8a=_87;i$1<_8a.length;i$1+=1){var _8b=_8a[i$1];var _8c=_8b.queryResults;var _8d=_8b.wrappedTileID;var _8e=_89[_8d]=_89[_8d]||{};for(var _8f in _8c){var _90=_8c[_8f];var _91=_8e[_8f]=_8e[_8f]||{};var _92=_88[_8f]=_88[_8f]||[];for(var i=0,_93=_90;i<_93.length;i+=1){var _94=_93[i];if(!_91[_94.featureIndex]){_91[_94.featureIndex]=true;_92.push(_94);}}}}return _88;},queryFeatures:function(_95,_96,_97,_98,_99){var _9a=this.view.viewpoint.targetZoom||this.view.viewpoint.zoom;var _9b=_99.maxPitchScaleFactor();var _9c=_95.tilesIn(_97,_9b,false,this.view.resolution,_9a);var _9d=[];for(var i=0,_9e=_9c;i<_9e.length;i+=1){var _9f=_9e[i];_9d.push({wrappedTileID:_9f.tileID.wrapped().key,queryResults:_9f.tile.queryRenderedFeatures(_96,_95._state,_9f.queryGeometry,_9f.cameraQueryGeometry,_9f.scale,_98,_99,_9b,_d.getPixelPosMatrix(_95.transform,_9f.tileID))});}var _a0=this.mergeRenderedFeatureLayers(_9d);for(var _a1 in _a0){_a0[_a1].forEach(function(_a2){var _a3=_a2.feature;var _a4=_95.getFeatureState(_a3.layer["source-layer"],_a3.id);_a3.source=_a3.layer.source;if(_a3.layer["source-layer"]){_a3.sourceLayer=_a3.layer["source-layer"];}_a3.state=_a4;});}return _a0;}});});