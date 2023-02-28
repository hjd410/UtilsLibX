//>>built
define("com/huayun/webgis/renderer/LineRenderer",["./Renderer","../geometry/Point","../data/bucket/LineBucketSimplify","../gl/mode","../gl/programAttributes","../gl/programCache"],function(_1,_2,_3,_4,_5,_6){function _7(){};if(_1){_7.__proto__=_1;}_7.prototype=Object.create(_1&&_1.prototype);_7.prototype.constructor=_7;var _8=function(_9,_a,_b){var _c=_b.uniforms;var _d=_a.position;_c["u_matrix"]=_9.viewpoint.getMatrixForPoint(_d[0],_d[1],false,false,_d[2]||0);_c["u_units_to_pixels"]=[_9.viewpoint.width/2,-_9.viewpoint.height/2];_c["u_ratio"]=1/_9.viewpoint.resolution;return _c;};var _e=function(_f,_10,_11,_12){var r=1/_f.resolution;var _13=_11.uniforms;var _14=_10.position;var _15=_11.cap==="round";var _16=_f.lineAtlas.getDash(_12.from,_15);var _17=_f.lineAtlas.getDash(_12.to,_15);var _18=_16.width*2;var _19=_17.width*1;_13["u_matrix"]=_f.viewpoint.getMatrixForPoint(_14[0],_14[1],false,false,_14[2]||0);_13["u_units_to_pixels"]=[_f.viewpoint.width/2,-_f.viewpoint.height/2];_13["u_ratio"]=r;_13["u_image"]=0;_13["u_patternscale_a"]=[r/_18,-_16.height/2];_13["u_patternscale_b"]=[r/_19,-_17.height/2];_13["u_sdfgamma"]=_f.lineAtlas.width/(Math.min(_18,_19)*256)/2;_13["u_tex_y_a"]=_16.y;_13["u_tex_y_b"]=_17.y;return _13;};_7.prototype.add=function(_1a,_1b,_1c,_1d){if(_1a.ground){var ps=_1c.path[0];for(var j=0;j<ps.length;j++){var p=ps[j];if(p.base){if(p.base.posMidified){p.z+=p.base.z;p.base=null;}else{_1b.needAdd=true;_1a.threeRender();return;}}}}_1b.needAdd=false;var _1e=_1b.position||_1a.viewpoint.center||[0,0],cx=_1e[0],cy=_1e[1];if(_1c.type==="multipolygon"){var _1f=[];for(var i=0;i<_1c.polygons.length;i++){var _20=_1c.polygons[i];var _21=this._addOnePathFeature(_20,_1a,_1b,_1d,cx,cy);_1f.push(_21);}_1b.buckets.push(_1f);}else{var _21=this._addOnePathFeature(_1c,_1a,_1b,_1d,cx,cy);_1b.buckets.push(_21);}_1b.position=[cx,cy,0];};_7.prototype._addOnePathFeature=function(_22,_23,_24,_25,cx,cy){var _26=_22.path;var g=[];for(var i=0;i<_26.length;i++){var _27=_26[i];var l=[];var _28=new _2(-1,-1);for(var j=0;j<_27.length;j++){var p=_27[j];if(_28.equals(p)){continue;}l.push(new _2(p.x-cx,p.y-cy,p.z));_28=p;}g.push(l);}var _29=new _3();_29.addFeature(g,_25.join,_25.cap,2,1.05);_29.upload(_23.context);return _29;};_7.prototype.draw=function(_2a,_2b,_2c,_2d,_2e,_2f,_30){if(_2b.needAdd||_2b.buckets.length===0){this.add(_2a,_2b,_2c,_2d);if(_2b.needAdd){return;}}if(_2f===undefined){_2f=0;}var _31=_2a.context;var gl=_31.gl;var _32;if(_2e){_32=_2e.depthModeForSublayer(0,_4.DepthMode.ReadWrite);}else{_32=new _4.DepthMode(gl.LEQUAL,_4.DepthMode.ReadWrite,[0.9,0.9]);}var _33=_4.ColorMode.alphaBlended;var _34=_2b.buckets;var _35=_2d.dasharray;if(_35){_31.activeTexture.set(gl.TEXTURE0);_2a.lineAtlas.bind(_31);}var _36=_35?"basicLineSDF":"myline";var _37=_6.useProgramSimplify(_31,_36,_5.basicLine);var _38=_35?_e(_2a,_2b,_2d,_35):_8(_2a,_2b,_2d);if(!_30){var w=_2d.width*this.getRealScale(_2d.fixed,_2a.scale,_2d.minScale);_38["u_width"]=w<1?1:w;}_38["u_color"]=_2d.color;var _39=_34[_2f];if(_2c.type==="multipolygon"){_39.forEach(function(bck,_3a){_37.draw(_31,gl.TRIANGLES,_32,null,_33,_4.CullFaceMode.disabled,_38,_2b.id+"-line"+_2f+"-"+_3a,bck.layoutVertexBuffer,bck.indexBuffer,bck.segments);});}else{_37.draw(_31,gl.TRIANGLES,_32,null,_33,_4.CullFaceMode.disabled,_38,_2b.id+"-line"+_2f,_39.layoutVertexBuffer,_39.indexBuffer,_39.segments);}};_7.prototype.drawGlow=function(_3b,_3c,_3d,_3e,_3f,_40,_41){var _42=_3c.glow;if(!_42){return;}if(_40===undefined){_40=0;}var _43=_3b.context;var gl=_43.gl;var _44;if(_3f){_44=_3f.depthModeForSublayer(0,_4.DepthMode.ReadWrite);}else{_44=new _4.DepthMode(gl.LEQUAL,_4.DepthMode.ReadWrite,[0.9,0.9]);}var _45=_4.ColorMode.alphaBlended;var _46=_3c.buckets;var _47=_3e.dasharray;if(_47){_43.activeTexture.set(gl.TEXTURE0);_3b.lineAtlas.bind(_43);}var _48=_47?"basicLineSDF":"basicLine";var _49=_6.useProgramSimplify(_43,_48,_5.basicLine);var _4a=_47?_e(_3b,_3c,_3e,_47):_8(_3b,_3c,_3e);if(!_41){var w=_3e.width*this.getRealScale(_3e.fixed,_3b.scale,_3e.minScale);_4a["u_width"]=w<1?1:w;}var _4b=_46[_40];_4a["u_color"]=_42.color;_49.draw(_43,gl.TRIANGLES,_44,null,_45,_4.CullFaceMode.disabled,_4a,_3c.id+"-line"+_40,_4b.layoutVertexBuffer,_4b.indexBuffer,_4b.segments);};_7.prototype.calculateExtent=function(_4c,_4d,_4e,_4f,_50,_51){var _52=_4e.extent;_50.push({id:_4d.id,g:_4d,minX:_52.xmin,minY:_52.ymin,maxX:_52.xmax,maxY:_52.ymax,symbol:_4f});};return _7;});