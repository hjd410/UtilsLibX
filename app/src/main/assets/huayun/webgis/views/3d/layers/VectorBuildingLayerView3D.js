//>>built
define("com/huayun/webgis/views/3d/layers/VectorBuildingLayerView3D",["dojo/_base/declare","./LayerView3D","com/huayun/webgis/data/ArrayType","com/huayun/webgis/gl/draw","com/huayun/webgis/gl/mode","com/huayun/webgis/layers/support/funcUtils","com/huayun/webgis/layers/support/CrossTileSymbolIndex","com/huayun/webgis/layers/support/PauseablePlacement","com/huayun/webgis/layers/support/EvaluationParameters","com/huayun/webgis/gl/members","com/huayun/webgis/gl/SegmentVector","com/huayun/webgis/utils/Constant","com/huayun/webgis/utils/utils","../../../gl/draw/drawFillExtrusion"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e){return _1("com.huayun.webgis.views.3d.layers.VectorTileLayerView",[_2],{view:null,constructor:function(_f){_1.safeMixin(this,_f);this.draw$1={"fill-extrusion":_4.drawExtrusion,"line-extrusion":_4.drawLineExtrusion,clipping:_4.drawClipping};this.crossTileSymbolIndex=new _7();this.nextStencilID=1;var _10=new _3.StructArrayLayout2i4();_10.emplaceBack(0,0);_10.emplaceBack(1,0);_10.emplaceBack(0,1);_10.emplaceBack(1,1);this.viewportBuffer=this.view.context.createVertexBuffer(_10,_a.posAttributes.members);this.viewportSegments=_b.simpleSegment(0,0,4,2);var _11=new _3.StructArrayLayout3ui6();_11.emplaceBack(0,1,2);_11.emplaceBack(2,1,3);this.quadTriangleIndexBuffer=this.view.context.createIndexBuffer(_11);var _12=new _3.StructArrayLayout2i4();_12.emplaceBack(0,0);_12.emplaceBack(_c.layout.EXTENT,0);_12.emplaceBack(0,_c.layout.EXTENT);_12.emplaceBack(_c.layout.EXTENT,_c.layout.EXTENT);this.tileExtentBuffer=this.view.context.createVertexBuffer(_12,_a.posAttributes.members);this.tileExtentSegments=_b.simpleSegment(0,0,4,2);this.minLevel=_f.minLevel||11;this.callbackOnce=null;},refresh:function(_13){if(_13){this.callbackOnce=_13;}this._readyData();this.view.threeRender();},_readyData:function(){var _14;if(this.layer.maxLevel){_14=Math.min(this.transform.targetZoom||this.transform.level,this.layer.maxLevel);}else{_14=this.transform.targetZoom||this.transform.level;}if(this.minLevel&&_14<this.minLevel){return;}if(this.visible){if(!this.layer.tileInfo){return;}var _15=this.layer.tileInfo,_16=this.transform.center,_17=_15.getResolution(_14);var _18=this.view._bound.map(function(_19){return {x:_15.getColForX(_19.x,_17),y:_15.getRowForY(_19.y,_17)};});var _1a=_15.getColRange(_17);var cx=_15.getColForX(_16[0],_17),cy=_15.getRowForY(_16[1],_17);var _1b=this.layer._layers;var _1c=new _9(_14,{now:_6.now(),fadeDuration:500,zoomHistory:this.view.zoomHistory,transition:{delay:0,duration:500}});for(var i=0,_1d=this.layer._order;i<_1d.length;i++){var _1e=_1b[_1d[i]];_1e.recalculate(_1c);}this.layer.sourceCache.updateTile(_14,_18,_1a,cx,cy);this._sourcesDirty=true;this.zoomedBounds=_18;this.range=_1a;this.cx=cx;this.cy=cy;}},_render:function(){if(this.visible){if(!this.layer.tileInfo){return;}var _1f=this.layer.sourceCache;var _20;if(this.layer.maxLevel){_20=Math.min(this.transform.targetZoom||this.transform.level,this.layer.maxLevel);}else{_20=this.transform.targetZoom||this.transform.level;}if(this.minLevel&&_20<this.minLevel){return;}var _21;if(this._sourcesDirty){_21=_1f.update(_20,this.zoomedBounds,this.range,this.cx,this.cy);}var _22=_1f.getVisibleCoordinates(false,this.transform).slice().reverse();_1f.prepare(this.view.context);this.depthRangeFor3D=[0,1-((1+this.view.currentLayer)*this.view.numSublayers)*this.view.depthEpsilon];this.renderPass="translucent";var _23=this.layer._order;for(this.currentLayer=0;this.currentLayer<_23.length;this.currentLayer++){var _24=this.layer._layers[_23[this.currentLayer]];this._renderLayer(this,_1f,_24,_22,_20);}if(_21.length===_22.length&&this.callbackOnce){this.callbackOnce();this.callbackOnce=null;}}},_renderLayer:function(_25,_26,_27,_28,_29){if(_27.isHidden(_29)){return;}if(!_28.length){return;}this.id=_27.id;_e(_25,_26,_27,_28);},zoom:function(){if(this.visible){var _2a=this.layer.sourceCache;var _2b;if(this.layer.maxLevel){_2b=Math.min(this.transform.targetZoom||this.transform.level,this.layer.maxLevel);}else{_2b=this.transform.targetZoom||this.transform.level;}if(this.minLevel&&_2b<this.minLevel){return;}var _2c=_2a.updateTileMatrix(false,this.transform).slice().reverse();this.depthRangeFor3D=[0,1-((1+this.view.currentLayer)*this.view.numSublayers)*this.view.depthEpsilon];this.renderPass="translucent";var _2d=this.layer._order;for(this.currentLayer=0;this.currentLayer<_2d.length;this.currentLayer++){var _2e=this.layer._layers[_2d[this.currentLayer]];this._renderLayer(this,_2a,_2e,_2c,_2b);}}},depthModeForSublayer:function(n,_2f,_30){return new _5.DepthMode(_30||this.view.context.gl.LEQUAL,_2f,this.view.depthRangeFor3D);},clearStencil:function(){var _31=this.view.context;var gl=_31.gl;this.nextStencilID=1;var _32=new Matrix4();_32.ortho(0,this.view.width,this.view.height,0,0,1);_32.scale(gl.drawingBufferWidth,gl.drawingBufferHeight,0);this.view.useProgram("clippingMask").draw(_31,gl.TRIANGLES,_5.DepthMode.disabled,this.stencilClearMode,_5.ColorMode.disabled,_5.CullFaceMode.disabled,{"u_matrix":_32.elements},"$clipping",this.viewportBuffer,this.quadTriangleIndexBuffer,this.viewportSegments);},stencilModeForClipping:function(_33){var gl=this.view.context.gl;return new _5.StencilMode({func:gl.EQUAL,mask:255},this._tileClippingMaskIDs[_33.key],0,gl.KEEP,gl.KEEP,gl.REPLACE);},stencilModeFor3D:function(){if(this.nextStencilID+1>256){this.clearStencil();}var id=1;var gl=this.view.context.gl;return new _5.StencilMode({func:gl.NOTEQUAL,mask:255},id,255,gl.KEEP,gl.KEEP,gl.REPLACE);},setVisible:function(_34){this.visible=_34;this.view.threeRender();}});});