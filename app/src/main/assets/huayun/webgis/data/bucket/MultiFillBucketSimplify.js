//>>built
define("com/huayun/webgis/data/bucket/MultiFillBucketSimplify",["../ArrayType","../../gl/SegmentVector","../../utils/earcut","../../utils/utils","../../utils/Constant"],function(_1,_2,_3,_4,_5){function _6(){this.layoutVertexArray=new _1.StructArrayLayout6fb24();this.indexArray=new _1.StructArrayLayout3ui6();this.segments=new _2();};_6.prototype.addFeatures=function addFeatures(_7,_8){for(var i=0,_9=this.features;i<_9.length;i+=1){var _a=_9[i];var _b=_a.geometry;this.addFeature(_a,_b,_a.index,_8);}};_6.prototype.destroy=function destroy(){if(!this.layoutVertexBuffer){return;}this.layoutVertexBuffer.destroy();this.indexBuffer.destroy();this.segments.destroy();};_6.prototype.addFeature=function addFeature(_c,_d){for(var _e=0,_f=_4.classifyRings(_c,_5.layout.EARCUT_MAX_RINGS);_e<_f.length;_e+=1){var _10=_f[_e];var _11=0;for(var i$2=0,_12=_10;i$2<_12.length;i$2+=1){var _13=_12[i$2];_11+=_13.length;}var _14=this.segments.prepareSegment(_11,this.layoutVertexArray,this.indexArray);var _15=_14.vertexLength;var _16=[];var _17=[];var _18=_d[_e];if(_18.length<4){_18.push(1);}for(var i$3=0,_19=_10;i$3<_19.length;i$3+=1){var _1a=_19[i$3];if(_1a.length===0){continue;}if(_1a!==_10[0]){_17.push(_16.length/2);}this.layoutVertexArray.emplaceBack(_1a[0].x,_1a[0].y,_18[0],_18[1],_18[2],_18[3]);_16.push(_1a[0].x);_16.push(_1a[0].y);for(var i=1;i<_1a.length;i++){this.layoutVertexArray.emplaceBack(_1a[i].x,_1a[i].y,_18[0],_18[1],_18[2],_18[3]);_16.push(_1a[i].x);_16.push(_1a[i].y);}}var _1b=_3.earcut(_16,_17);for(var i$1=0;i$1<_1b.length;i$1+=3){this.indexArray.emplaceBack(_15+_1b[i$1],_15+_1b[i$1+1],_15+_1b[i$1+2]);}_14.vertexLength+=_11;_14.primitiveLength+=_1b.length/3;}};_6.prototype.upload=function upload(_1c){this.layoutVertexBuffer=_1c.createVertexBuffer(this.layoutVertexArray,[{name:"a_pos",type:"Float32",components:2,offset:0},{name:"a_color",type:"Float32",components:4,offset:8}]);this.indexBuffer=_1c.createIndexBuffer(this.indexArray);};return _6;});