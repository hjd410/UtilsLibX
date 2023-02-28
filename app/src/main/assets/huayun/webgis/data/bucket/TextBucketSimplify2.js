//>>built
define("com/huayun/webgis/data/bucket/TextBucketSimplify2",["../ArrayType","../../gl/SegmentVector","../../geometry/Anchor","../../geometry/Point2D","../../gl/TaggedString"],function(_1,_2,_3,_4,_5){var _6=-28;var _7=96;var _8=0;var _9={horizontal:1,vertical:2,horizontalOnly:3};function _a(_b,_c,_d,ox,oy,tx,ty){_b.emplaceBack(_c,_d,Math.round(ox*32),Math.round(oy*32),tx,ty);};function _e(_f,_10,end,_11,_12){if(!_11&&!_12){return;}var _13=_f[end];var _14=_13.metrics.advance*_13.scale;var _15=(_f[end].x+_14)*_11;for(var j=_10;j<=end;j++){_f[j].x-=_15;_f[j].y+=_12;}};function _16(_17,_18,_19,_1a,_1b,_1c,_1d,_1e,_1f){var _20=(_18-_19)*_1b;var _21=0;if(_1c!==_1d){_21=-_1e*_1a-_6;}else{_21=(-_1a*_1f+0.5)*_1d;}for(var i$1=0,_22=_17;i$1<_22.length;i$1+=1){var _23=_22[i$1];for(var i=0,_24=_23.positionedGlyphs;i<_24.length;i+=1){var _25=_24[i];_25.x+=_20;_25.y+=_21;}}};function _26(_27,_28,_29,_2a,_2b,_2c){var x=0;var y=_6;var _2d=0;var _2e=0;var _2f=0.5;var _30=0;for(var i$1=0,_31=_2a;i$1<_31.length;i$1+=1){var _32=_31[i$1];var _33=1;var _34=0;var _35={positionedGlyphs:[],lineOffset:0};_27.positionedLines[_30]=_35;var _36=_35.positionedGlyphs;var _37=0;if(!_32.length()){y+=_2b;++_30;continue;}for(var i=0;i<_32.length();i++){var _38=_32.getSection(i);var _39=_32.getSectionIndex(i);var _3a=_32.getCharCode(i);var _3b=0;var _3c=null;var _3d=null;var _3e=null;var _3f=false;var _40=_29[_38.fontStack];var _41=_40&&_40[_3a];if(_41&&_41.rect){_3d=_41.rect;_3c=_41.metrics;}_3b=(_33-_38.scale)*_7;_36.push({glyph:_3a,imageName:_3e,x:x,y:y+_3b,vertical:_3f,scale:_38.scale,fontStack:_38.fontStack,sectionIndex:_39,metrics:_3c,rect:_3d});x+=_3c.advance*_38.scale+_2c;}if(_36.length!==0){var _42=x-_2c;_2d=Math.max(_42,_2d);_e(_36,0,_36.length-1,_2f,_37);}x=0;var _43=_2b*_33+_37;_35.lineOffset=Math.max(_37,_34);y+=_43;_2e=Math.max(_43,_2e);++_30;}var _44=y-_6;var _45=0.5;var _46=0.5;_16(_27.positionedLines,_2f,_45,_46,_2d,_2e,_2b,_44,_2a.length);_27.top+=-_46*_44;_27.bottom=_27.top+_44;_27.left+=-_45*_2d;_27.right=_27.left+_2d;};function _47(_48,_49,_4a,_4b,_4c,_4d,_4e,_4f){var _50=_5.fromFeature({sections:[{fontStack:_49,scale:null,text:_48}],toString:function(){return this.sections[0].text;}},_49);var _51=[_50];var _52=[];var _53={positionedLines:_52,text:_50.toString(),top:_4f[1],bottom:_4f[1],left:_4f[0],right:_4f[0],writingMode:_4e,iconsInText:false,verticalizable:false};_26(_53,_4a,_4b,_51,_4c,_4d);return _53;};function _54(_55,_56,_57){var _58=[];for(var i$1=0,_59=_56.positionedLines;i$1<_59.length;i$1+=1){var _5a=_59[i$1];for(var i=0,_5b=_5a.positionedGlyphs;i<_5b.length;i+=1){var _5c=_5b[i];if(!_5c.rect){continue;}var _5d=_5c.rect||{};var _5e=1;var _5f=_8+_5e;var _60=1;var _61=0;var _62=_5c.metrics.advance*_5c.scale/2;var _63=[_5c.x+_62+_57[0],_5c.y+_57[1]];var x1=(_5c.metrics.left-_5f)*_5c.scale-_62+_63[0];var y1=(-_5c.metrics.top-_5f)*_5c.scale+_63[1];var x2=x1+_5d.w*_5c.scale/_60;var y2=y1+_5d.h*_5c.scale/_60;var tl=new _4(x1,y1);var tr=new _4(x2,y1);var bl=new _4(x1,y2);var br=new _4(x2,y2);_58.push({tl:tl,tr:tr,bl:bl,br:br,tex:_5d,isSDF:true});}}return _58;};var _64=function _64(){this.layoutVertexArray=new _1.StructArrayLayout2f4ib16();this.indexArray=new _1.StructArrayLayout3ui6();this.segments=new _2();};_64.prototype.destroy=function destroy(){if(!this.layoutVertexBuffer){return;}this.layoutVertexBuffer.destroy();this.indexBuffer.destroy();this.segments.destroy();};_64.prototype.addFeature=function(_65,_66,_67,_68,_69,_6a){var _6b=96;var _6c={horizontal:{},vertical:undefined};var _6d=0.24;var _6e="center";_6a=_6a.map(function(t){return t*24;});var _6f=_47(_66,_67,_68,_69,_6b,_6d,_9.horizontal,_6a);if(_6f){_6c.horizontal[_6e]=_6f;}for(var i=0;i<_65.length;i++){var _70=_65[i];for(var j=0;j<_70.length;j++){var _71=_70[i];var _72=new _3(_71.x,_71.y,0);var _73=_6c.horizontal.center;var _74=_54(_72,_73,_6a);this.addSymbols(_74,_72);}}};_64.prototype.addSymbols=function addSymbols(_75,_76){var _77=this.indexArray;var _78=this.layoutVertexArray;var _79=this.segments.prepareSegment(4*_75.length,this.layoutVertexArray,this.indexArray);for(var i=0,_7a=_75;i<_7a.length;i+=1){var _7b=_7a[i];var tl=_7b.tl,tr=_7b.tr,bl=_7b.bl,br=_7b.br,tex=_7b.tex;var _7c=_79.vertexLength;_a(_78,_76.x,_76.y,tl.x,tl.y,tex.x,tex.y);_a(_78,_76.x,_76.y,tr.x,tr.y,tex.x+tex.w,tex.y);_a(_78,_76.x,_76.y,bl.x,bl.y,tex.x,tex.y+tex.h);_a(_78,_76.x,_76.y,br.x,br.y,tex.x+tex.w,tex.y+tex.h);_77.emplaceBack(_7c,_7c+1,_7c+2);_77.emplaceBack(_7c+1,_7c+2,_7c+3);_79.vertexLength+=4;_79.primitiveLength+=2;}};_64.prototype.upload=function upload(_7d){this.layoutVertexBuffer=_7d.createVertexBuffer(this.layoutVertexArray,[{name:"a_pos",type:"Float32",components:2,offset:0},{name:"a_data",type:"Int16",components:4,offset:8}]);this.indexBuffer=_7d.createIndexBuffer(this.indexArray);};return _64;});