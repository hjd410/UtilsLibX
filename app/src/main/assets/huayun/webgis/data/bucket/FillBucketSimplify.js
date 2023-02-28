//>>built
define("com/huayun/webgis/data/bucket/FillBucketSimplify",["../ArrayType","../../gl/SegmentVector","../../utils/earcut","../../utils/utils","../../utils/Constant","../../utils/classifyRings"],function(_1,_2,_3,_4,_5,_6){function _7(){this.layoutVertexArray=new _1.StructArrayLayout2f8();this.indexArray=new _1.StructArrayLayout3ui6();this.segments=new _2();};_7.prototype.addFeatures=function addFeatures(_8,_9){for(var i=0,_a=this.features;i<_a.length;i+=1){var _b=_a[i];var _c=_b.geometry;this.addFeature(_b,_c,_b.index,_9);}};_7.prototype.destroy=function destroy(){if(!this.layoutVertexBuffer){return;}this.layoutVertexBuffer.destroy();this.indexBuffer.destroy();this.segments.destroy();};_7.prototype.addFeature=function addFeature(_d){for(var _e=0,_f=_6(_d,_5.layout.EARCUT_MAX_RINGS);_e<_f.length;_e+=1){var _10=_f[_e];var _11=0;for(var i$2=0,_12=_10;i$2<_12.length;i$2+=1){var _13=_12[i$2];_11+=_13.length;}var _14=this.segments.prepareSegment(_11,this.layoutVertexArray,this.indexArray);var _15=_14.vertexLength;var _16=[];var _17=[];for(var i$3=0,_18=_10;i$3<_18.length;i$3+=1){var _19=_18[i$3];if(_19.length===0){continue;}if(_19!==_10[0]){_17.push(_16.length/2);}this.layoutVertexArray.emplaceBack(_19[0].x,_19[0].y);_16.push(_19[0].x);_16.push(_19[0].y);for(var i=1;i<_19.length;i++){this.layoutVertexArray.emplaceBack(_19[i].x,_19[i].y);_16.push(_19[i].x);_16.push(_19[i].y);}}var _1a=_3.earcut(_16,_17);for(var i$1=0;i$1<_1a.length;i$1+=3){this.indexArray.emplaceBack(_15+_1a[i$1],_15+_1a[i$1+1],_15+_1a[i$1+2]);}_14.vertexLength+=_11;_14.primitiveLength+=_1a.length/3;}};_7.prototype.upload=function upload(_1b){this.layoutVertexBuffer=_1b.createVertexBuffer(this.layoutVertexArray,[{name:"a_pos",type:"Float32",components:2,offset:0}]);this.indexBuffer=_1b.createIndexBuffer(this.indexArray);};return _7;});