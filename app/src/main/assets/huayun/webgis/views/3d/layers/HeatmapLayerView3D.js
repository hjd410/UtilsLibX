//>>built
define("com/huayun/webgis/views/3d/layers/HeatmapLayerView3D",["dojo/_base/declare","custom/heatmap","./LayerView3D","../../../gl/Texture","../../../gl/draw","../../../geometry/Extent","com/huayun/webgis/gl/mode","com/huayun/webgis/data/ArrayType","com/huayun/webgis/utils/Constant","com/huayun/webgis/gl/members","com/huayun/webgis/gl/SegmentVector"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b){return _1("com.huayun.webgis.views.3d.layers.HeatmapLayerView3D",[_3],{constructor:function(_c){_1.safeMixin(this,_c);this.visible=_c.visible;this.view=_c.view;this.opacity=_c.opacity;var _d=document.createElement("div");_d.style.width=_c.width+"px";_d.style.height=_c.height+"px";this.heatmap=_2.create({container:_d,maxOpacity:1,radius:_c.radius,blur:_c.blur,gradient:_c.gradient,width:_c.width,height:_c.height});var _e=new _8.StructArrayLayout3ui6();_e.emplaceBack(0,1,2);_e.emplaceBack(2,1,3);this.quadTriangleIndexBuffer=this.view.context.createIndexBuffer(_e);this.viewportSegments=_b.simpleSegment(0,0,4,2);this.extent=new _6(0,0,0,0);},resize:function(){var _f=this.view.viewpoint.width,_10=this.view.viewpoint.height;this.width=_f;this.height=_10;var _11=this.heatmap._renderer;_11._width=_f;_11.canvas.width=_f;_11.canvas.height=_10;},setVisible:function(_12){this.visible=_12;this.view.threeRender();},setOpacity:function(_13){this.opacity=_13;this.view.threeRender();},refresh:function(){this._readyData();this.view.threeRender();},_readyData:function(){},_render:function(){if(this.visible&&this.layer.data){var _14=this.view.extent;var _15=this.view.viewpoint.level;var _16=this.view.context;var gl=_16.gl;if(!this.extent.equals(_14)||this.layer.dataDirty){var _17=this._formatData(this.layer.filterData(_14),this.view);this.layer.dataDirty=false;this.heatmap.setData(_17);this.heatmap.repaint();this.extent=_14;if(this.texture){this.texture.update(this.heatmap._renderer.canvas,{useMipmap:true});}else{this.texture=new _4(_16,this.heatmap._renderer.canvas,gl.RGBA,{useMipmap:true});this.texture.bind(gl.LINEAR,gl.CLAMP_TO_EDGE,gl.LINEAR_MIPMAP_NEAREST);if(_16.extTextureFilterAnisotropic){gl.texParameterf(gl.TEXTURE_2D,_16.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT,_16.extTextureFilterAnisotropicMax);}}}this.texture.zoom=_15;this._drawLayer();}},_drawLayer:function(){this.view.currentLayer++;var _18=this.view.getExtent(),_19=this.view.viewpoint.center;this.position=_19;var _1a=_9.layout.EXTENT;var _1b=new _8.StructArrayLayout4f16();_1b.emplaceBack(_18.minx-_19[0],_19[1]-_18.maxy,0,0);_1b.emplaceBack(_18.maxx-_19[0],_19[1]-_18.maxy,_1a,0);_1b.emplaceBack(_18.minx-_19[0],_19[1]-_18.miny,0,_1a);_1b.emplaceBack(_18.maxx-_19[0],_19[1]-_18.miny,_1a,_1a);this.viewportBuffer=this.view.context.createVertexBuffer(_1b,[{name:"a_pos",type:"Float32",components:2,offset:0},{name:"a_texture_pos",type:"Float32",components:2,offset:8}]);_5.drawImageLayer(this);},_formatData:function(res,_1c){var _1d=[];var max=0;var hw=this.width/2,hh=this.height/2,_1e=_1c.center,cx=_1e.x,cy=_1e.y,_1f=_1c.resolution;var len=res.length,_20,p;for(var i=0;i<len;i++){_20=res[i];p=_20.point;_20=this._geoToHeatmapData(p.x,p.y,_20.value*1,hw,hh,cx,cy,_1f);max=_20.value>max?_20.value:max;_1d.push(_20);}return {max:max,data:_1d};},_geoToHeatmapData:function(x,y,_21,hw,hh,cx,cy,_22){return {x:((x-cx)/_22+hw+0.5)|0,y:(hh-(y-cy)/_22+0.5)|0,value:_21};},zoom:function(){if(this.visible){_5.drawImageLayer(this);}},depthModeForSublayer:function(n,_23,_24){var _25=1-((1+this.view.currentLayer)*this.view.numSublayers+n)*this.view.depthEpsilon;return new _7.DepthMode(_24||this.view.context.gl.LEQUAL,_23,[_25,_25]);}});});