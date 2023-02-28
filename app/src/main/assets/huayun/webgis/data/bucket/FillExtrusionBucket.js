//>>built
define("com/huayun/webgis/data/bucket/FillExtrusionBucket",["../ArrayType","../../gl/SegmentVector","../../utils/earcut","../../gl/programConfig","../../gl/members","../../gl/dataTransfer","com/huayun/webgis/layers/support/EvaluationParameters","../../utils/Constant","../../utils/utils","../../utils/classifyRings"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a){var _b=["Unknown","Point","LineString","Polygon"];var _c=Math.pow(2,13);function _d(_e,x,y,nx,ny,nz,t,e){_e.emplaceBack(x,y,Math.floor(nx*_c)*2+t,ny*_c*2,nz*_c*2,Math.round(e));};var _f=function _f(_10){this.zoom=_10.zoom;this.overscaling=_10.overscaling;this.layers=_10.layers;this.layerIds=this.layers.map(function(_11){return _11.id;});this.index=_10.index;this.hasPattern=false;this.layoutVertexArray=new _1.StructArrayLayout2i4i12();this.indexArray=new _1.StructArrayLayout3ui6();this.programConfigurations=new _4.ProgramConfigurationSet(_5.members$2,_10.layers,_10.zoom);this.segments=new _2();this.stateDependentLayerIds=this.layers.filter(function(l){return l.isStateDependent();}).map(function(l){return l.id;});};_f.prototype.populate=function populate(_12,_13){this.features=[];this.hasPattern=false;for(var i=0,_14=_12;i<_14.length;i+=1){var ref=_14[i];var _15=ref.feature;var _16=ref.index;var _17=ref.sourceLayerIndex;if(!this.layers[0]._featureFilter(new _7(this.zoom),_15)){continue;}var _18=_9.loadGeometry(_15);var _19={sourceLayerIndex:_17,index:_16,geometry:_18,properties:_15.properties,type:_15.type,patterns:{}};if(typeof _15.id!=="undefined"){_19.id=_15.id;}this.addFeature(_19,_18,_16,{});_13.featureIndex.insert(_15,_18,_16,_17,this.index,true);}};_f.prototype.addFeatures=function addFeatures(_1a,_1b){for(var i=0,_1c=this.features;i<_1c.length;i+=1){var _1d=_1c[i];var _1e=_1d.geometry;this.addFeature(_1d,_1e,_1d.index,_1b);}};_f.prototype.update=function update(_1f,_20,_21){if(!this.stateDependentLayers.length){return;}this.programConfigurations.updatePaintArrays(_1f,_20,this.stateDependentLayers,_21);};_f.prototype.isEmpty=function isEmpty(){return this.layoutVertexArray.length===0;};_f.prototype.uploadPending=function uploadPending(){return !this.uploaded||this.programConfigurations.needsUpload;};_f.prototype.upload=function upload(_22){if(!this.uploaded){this.layoutVertexBuffer=_22.createVertexBuffer(this.layoutVertexArray,_5.members$2);this.indexBuffer=_22.createIndexBuffer(this.indexArray);}this.programConfigurations.upload(_22);this.uploaded=true;};_f.prototype.destroy=function destroy(){if(!this.layoutVertexBuffer){return;}this.layoutVertexBuffer.destroy();this.indexBuffer.destroy();this.programConfigurations.destroy();this.segments.destroy();};_f.prototype.addFeature=function addFeature(_23,_24,_25,_26){for(var i$4=0,_27=_a(_24,_8.layout.EARCUT_MAX_RINGS);i$4<_27.length;i$4+=1){var _28=_27[i$4];var _29=0;for(var i$1=0,_2a=_28;i$1<_2a.length;i$1+=1){var _2b=_2a[i$1];_29+=_2b.length;}var _2c=this.segments.prepareSegment(4,this.layoutVertexArray,this.indexArray);for(var i$2=0,_2d=_28;i$2<_2d.length;i$2+=1){var _2e=_2d[i$2];if(_2e.length===0){continue;}if(_9.isEntirelyOutside(_2e)){continue;}var _2f=0;for(var p=0;p<_2e.length;p++){var p1=_2e[p];if(p>=1){var p2=_2e[p-1];if(!_9.isBoundaryEdge(p1,p2)){if(_2c.vertexLength+4>_2.MAX_VERTEX_ARRAY_LENGTH){_2c=this.segments.prepareSegment(4,this.layoutVertexArray,this.indexArray);}var _30=p1.sub(p2)._perp()._unit();var _31=p2.dist(p1);if(_2f+_31>32768){_2f=0;}_d(this.layoutVertexArray,p1.x,p1.y,_30.x,_30.y,0,0,_2f);_d(this.layoutVertexArray,p1.x,p1.y,_30.x,_30.y,0,1,_2f);_2f+=_31;_d(this.layoutVertexArray,p2.x,p2.y,_30.x,_30.y,0,0,_2f);_d(this.layoutVertexArray,p2.x,p2.y,_30.x,_30.y,0,1,_2f);var _32=_2c.vertexLength;this.indexArray.emplaceBack(_32,_32+2,_32+1);this.indexArray.emplaceBack(_32+1,_32+2,_32+3);_2c.vertexLength+=4;_2c.primitiveLength+=2;}}}}if(_2c.vertexLength+_29>_2.MAX_VERTEX_ARRAY_LENGTH){_2c=this.segments.prepareSegment(_29,this.layoutVertexArray,this.indexArray);}if(_b[_23.type]!=="Polygon"){continue;}var _33=[];var _34=[];var _35=_2c.vertexLength;for(var i$3=0,_36=_28;i$3<_36.length;i$3+=1){var _37=_36[i$3];if(_37.length===0){continue;}if(_37!==_28[0]){_34.push(_33.length/2);}for(var i=0;i<_37.length;i++){var p$1=_37[i];_d(this.layoutVertexArray,p$1.x,p$1.y,0,0,1,1,0);_33.push(p$1.x);_33.push(p$1.y);}}var _38=_3.earcut(_33,_34);for(var j=0;j<_38.length;j+=3){this.indexArray.emplaceBack(_35+_38[j],_35+_38[j+2],_35+_38[j+1]);}_2c.primitiveLength+=_38.length/3;_2c.vertexLength+=_29;}this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length,_23,_25,_26);};_6.register("FillExtrusionBucket",_f,{omit:["layers","features"]});return _f;});