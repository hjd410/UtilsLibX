//>>built
define("com/huayun/webgis/views/3d/layers/ArcParticleLayerView3D",["dojo/_base/declare","./LayerView3D","com/huayun/webgis/gl/mode","com/huayun/webgis/gl/SegmentVector","com/huayun/webgis/gl/draw/drawParticle","com/huayun/webgis/data/ArrayType"],function(_1,_2,_3,_4,_5,_6){return _1("com.huayun.webgis.views.3d.layers.ArcParticleLayerView3D",[_2],{constructor:function(_7){_1.safeMixin(this,_7);this.visible=_7.visible;this.layer=_7.layer;this.view=_7.view;this.id=_7.id;var _8=20;var _9=new _6.StructArrayLayout1f4();for(var i=0;i<_8;i++){_9.emplaceBack(i/_8);}this.layoutVertexArray=this.view.context.createVertexBuffer(_9,[{name:"a_ratio",type:"Float32",components:1,offset:0}]);this.rasterBoundsSegments=_4.simpleSegment(0,0,_8,1);},setData:function(_a){},_readyData:function(){},_render:function(){this.view.currentLayer++;var _b=this.layer.data;for(var i=0,ii=_b.length;i<ii;i++){var _c=_b[i];_5(this,_c.source,_c.target,_c.deltaPos);}},refresh:function(){this._readyData();this.view.threeRender();},zoom:function(){if(this.visible){this._render();}},depthModeForSublayer:function(n,_d,_e){var _f=1-((1+this.view.currentLayer)*this.view.numSublayers+n)*this.view.depthEpsilon;return new _3.DepthMode(_e||this.view.context.gl.LEQUAL,_d,[_f,_f]);}});});