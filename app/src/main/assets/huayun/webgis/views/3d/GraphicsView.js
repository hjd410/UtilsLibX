//>>built
define("com/huayun/webgis/views/3d/GraphicsView",["exports","custom/gl-matrix-min","com/huayun/webgis/gl/mode","com/huayun/webgis/gl/Texture","../../gl/programAttributes","com/huayun/webgis/gl/GlyphAtlas","com/huayun/webgis/geometry/Point","com/huayun/webgis/data/ArrayType","com/huayun/webgis/utils/TinySDF","com/huayun/webgis/utils/image","com/huayun/webgis/data/bucket/CircleBucketSimplify","com/huayun/webgis/data/bucket/FillBucketSimplify","com/huayun/webgis/data/bucket/LineBucketSimplify2","com/huayun/webgis/data/bucket/ImageBucketSimplify","com/huayun/webgis/data/bucket/TextBucketSimplify","com/huayun/webgis/data/bucket/PointsBucket","com/huayun/webgis/data/commonVBO","com/huayun/webgis/gl/SegmentVector"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e,_f,_10,_11,_12){var _13=function(_14,_15,_16){var _17=_16.uniforms;var _18=_15.position;_17["u_matrix"]=_14.transform.getMatrixForPoint(_18[0],_18[1]);_17["u_units_to_pixels"]=[_14.transform.width/2,-_14.transform.height/2];_17["u_ratio"]=1/_14.transform.resolution;return _17;};var _19=function(_1a,_1b,_1c){var r=1/_1a.view.resolution;var _1d=_1c.uniforms;var _1e=_1b.position;_1d["u_matrix"]=_1a.transform.getMatrixForPoint(_1e[0],_1e[1]);_1d["u_units_to_pixels"]=[_1a.transform.width/2,-_1a.transform.height/2];_1d["u_ratio"]=r;_1d["u_image"]=0;_1d["u_patternscale_a"]=[r/_1c.widthA,_1d["u_patternscale_a"][1]];_1d["u_patternscale_b"]=[r/_1c.widthB,_1d["u_patternscale_b"][1]];return _1d;};var _1f=function(_20,_21,_22){var _23=_20.view.context;var gl=_23.gl;var _24=_20.depthModeForSublayer(0,_3.DepthMode.ReadOnly);var _25=_3.ColorMode.alphaBlended;var _26=_21.bucket;var _27=_21.highLightSymbol||_21.symbol;var _28=_27.dasharray;var _29=_28?"basicLineSDF":"basicLine";var _2a=_20.view.useProgramSimplify(_29,_5.basicLine);if(_28){_23.activeTexture.set(gl.TEXTURE0);_27.lineAtlas.bind(_23);}var _2b=_28?_19(_20,_21,_27):_13(_20,_21,_27);var _2c;if(_22){_2c=_22.color;_2b["u_color"]=_2c;_2b["u_opacity"]=_22.opacity;_2b["u_width"]=Math.max(_27.width,4);}else{_2c=_21.feature.attributes.color;if(_2c){_2b["u_color"]=_2c;}else{_2b["u_color"]=_27.color;_2b["u_opacity"]=_27.opacity;}_2b["u_width"]=_27.width;}_2a.draw(_23,gl.TRIANGLES,_24,null,_25,_3.CullFaceMode.disabled,_2b,_21.id,_26.layoutVertexBuffer,_26.indexBuffer,_26.segments,null,_20.view.viewpoint.level);};var _2d=function(_2e,_2f){var _30=_2e.view.context;var gl=_30.gl;var _31=_2e.depthModeForSublayer(0,_3.DepthMode.ReadOnly);var _32=_3.StencilMode.disabled;var _33=_3.ColorMode.alphaBlended;var _34=_2f.bucket;var _35=_2e.view.useProgramSimplify("circle",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0}]});var _36=_2f.symbol.uniforms;var _37=_2f.position;_36["u_matrix"]=_2e.transform.getMatrixForPoint(_37[0],_37[1]);var r=_2f.feature.geometry.radius||1;_36["u_camera_to_center_distance"]=_2e.transform.cameraToCenterDistance;var _38=_2e.transform.resolution;var _39=_2f.symbol.pitchWithMap;var _3a=_2f.symbol.fixedSize;if(_39){if(_3a){_36["u_extrude_scale"]=[_38,_38];}else{_36["u_extrude_scale"]=[1,1];}}else{_36["u_extrude_scale"]=_2e.transform.pixelsToGLUnits;}_36["radius"]=r;_35.draw(_30,gl.TRIANGLES,_31,_32,_33,_3.CullFaceMode.disabled,_36,_2f.id,_34.layoutVertexBuffer,_34.indexBuffer,_34.segments,null,_2e.transform.level);};var _3b=function(_3c,_3d){var _3e=_3c.view.context;var gl=_3e.gl;var _3f=_3c.depthModeForSublayer(0,_3.DepthMode.ReadOnly);var _40=_3.StencilMode.disabled;var _41=_3.ColorMode.alphaBlended;var _42=_3d.bucket;var _43=_3c.view.useProgramSimplify("fan",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0}]});var _44=_3d.symbol.uniforms;var _45=_3d.position;_44["u_matrix"]=_3c.transform.getMatrixForPoint(_45[0],_45[1]);_44["u_camera_to_center_distance"]=_3c.transform.cameraToCenterDistance;var _46=_3c.transform.resolution;var _47=_3d.symbol.pitchWithMap;var _48=_3d.symbol.fixedSize;_44["stroke_width"]=_3d.symbol.strokeWidth*_46;_44["gap"]=_3d.symbol.strokeWidth*_46/_3d.symbol.radius;if(_47){if(_48){_44["u_extrude_scale"]=[_46,_46];}else{_44["u_extrude_scale"]=[1,1];}}else{_44["u_extrude_scale"]=_3c.transform.pixelsToGLUnits;}_43.draw(_3e,gl.TRIANGLES,_3f,_40,_41,_3.CullFaceMode.disabled,_44,_3d.id,_42.layoutVertexBuffer,_42.indexBuffer,_42.segments,null,_3c.transform.level);};var _49=function(_4a,_4b,_4c){var _4d=_4a.view.context;var gl=_4d.gl;var _4e=_4a.depthModeForSublayer(0,_3.DepthMode.ReadOnly);var _4f=_3.StencilMode.disabled;var _50=_3.ColorMode.alphaBlended;var _51=_4b.bucket;var _52=_4a.view.useProgramSimplify("circle",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0}]});var _53=_4b.highLightSymbol||_4b.symbol;var _54=_53.uniforms;var _55=_4b.position;_54["u_matrix"]=_4a.transform.getMatrixForPoint(_55[0],_55[1]);_54["u_camera_to_center_distance"]=_4a.transform.cameraToCenterDistance;var _56=_4a.transform.resolution;var _57=_53.pitchWithMap;var _58=_53.fixedSize;if(_57){if(_58){_54["u_extrude_scale"]=[_56,_56];}else{_54["u_extrude_scale"]=[1,1];}}else{_54["u_extrude_scale"]=_4a.transform.pixelsToGLUnits;}var _59;if(_4c){_59=_4c.color;_54["color"]=_59;_54["opacity"]=_4c.opacity;_54["radius"]=_53.radius+_53.strokeWidth+2;}else{_59=_53.color;_54["color"]=[_59.r,_59.g,_59.b,_59.a];_54["opacity"]=_53.opacity;_54["radius"]=_53.radius;}_52.draw(_4d,gl.TRIANGLES,_4e,_4f,_50,_3.CullFaceMode.disabled,_54,_4b.id,_51.layoutVertexBuffer,_51.indexBuffer,_51.segments,null,_4a.transform.level);};var _5a=function(_5b,_5c,_5d){var _5e=_3.ColorMode.alphaBlended;var _5f=_5b.depthModeForSublayer(1,_3.DepthMode.ReadOnly);var _60=_5b.view.context;var gl=_60.gl;var _61=_5c.bucket;var _62=_5b.view.useProgramSimplify("basicFill",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0}]});var _63=_5c.highLightSymbol||_5c.symbol;var _64=_63.uniforms;var _65=_5c.position;_64["u_matrix"]=_5b.transform.getMatrixForPoint(_65[0],_65[1]);var _66;if(_5d){_66=_5d.color;_64["u_color"]=[_66.r,_66.g,_66.b,_66.a];_64["u_opacity"]=_5d.opacity;}else{_66=_63.color;_64["u_color"]=_66;_64["u_opacity"]=_63.opacity;}_62.draw(_60,gl.TRIANGLES,_5f,null,_5e,_3.CullFaceMode.disabled,_64,_5c.id,_61.layoutVertexBuffer,_61.indexBuffer,_61.segments,null,_5b.transform.level);};var _67=function(_68,_69){var _6a=_68.view.context;var gl=_6a.gl;var _6b=new _3.DepthMode(gl.LEQUAL,_3.DepthMode.ReadOnly,[0,0]);var _6c=_3.ColorMode.alphaBlended;var _6d=_69.bucket;var _6e=_68.view.useProgramSimplify("multiPoints",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0}]});var _6f={};var _70=_69.position;_6f["u_matrix"]=_68.transform.getMatrixForPoint(_70[0],_70[1]);_6e.draw2(_6a,gl.POINTS,_6b,null,_6c,_3.CullFaceMode.disabled,_6f,_69.id,_6d.layoutVertexBuffer,_6d.length);};function _71(_72,_73,_74,_75,_76){var m=_2.mat4.create();if(_73){_2.mat4.scale(m,m,[1/_76,1/_76,1]);if(!_74){_2.mat4.rotateZ(m,m,transform.angle);}}else{_2.mat4.multiply(m,_75,_72);}return m;};function _77(_78,_79,_7a,_7b,_7c){if(_79){var m=__chunk_1.clone(_78);__chunk_1.scale(m,m,[_7c,_7c,1]);if(!_7a){__chunk_1.rotateZ(m,m,-transform.angle);}return m;}else{return _7b;}};var _7d=function(_7e,_7f){var _80=_7e.view.context;var gl=_80.gl;var _81=_7e.depthModeForSublayer(0,_3.DepthMode.ReadOnly);var _82=_3.StencilMode.disabled;var _83=_3.ColorMode.alphaBlended;var _84=_7f.bucket;var _85=_7e.view.useProgramSimplify("images",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0},{name:"a_data",type:"Int16",components:4,offset:8}]});var _86=_7f.symbol.uniforms;var _87=_7f.position;var _88=_7f.symbol;var _89=[_88.width,_88.height];var m=_7e.transform.getMatrixForPoint(_87[0],_87[1],null,null,_87[2]);_86.u_camera_to_center_distance=_7e.transform.cameraToCenterDistance;_86.u_matrix=m;_86.u_label_plane_matrix=_71(m,false,false,_7e.transform.labelPlaneMatrix,1);_86.u_coord_matrix=_77(m,false,false,_7e.transform.glCoordMatrix,1);_86.u_texsize=_89;_80.activeTexture.set(gl.TEXTURE0);var _8a=_88.texture;var _8b=_88.image;var _8c;if(!_8a){_8c=_88.render();_8b.replace(new Uint8Array(_8c.buffer));_8a=_88.texture=new _4(_80,_8b,gl.RGBA,{useMipmap:true});}else{_8c=_88.render();_8b.replace(new Uint8Array(_8c.buffer));_88.texture.update(_8b,{useMipmap:true});}_8a.bind(gl.LINEAR,gl.CLAMP_TO_EDGE);_85.draw(_80,gl.TRIANGLES,_81,_82,_83,_3.CullFaceMode.disabled,_86,_7f.id,_84.layoutVertexBuffer,_84.indexBuffer,_84.segments,null,_7e.transform.level);};var _8d=function(_8e,_8f){var _90=_8e.feature.geometry;var _91=_8f.viewpoint.center,cx=_91[0],cy=_91[1];var _92=_90.path;var g=[];for(var i=0;i<_92.length;i++){var _93=_92[i];var l=[];for(var j=0;j<_93.length;j++){var p=_93[j];l.push(new _7(Math.round(p.x-cx),Math.round(p.y-cy),0));}g.push(l);}var _94=_8e.symbol;var _95=new _d();_95.addFeature(g,_94.join,_94.cap,2,1.05);_95.upload(_8f.context);_8e.bucket=_95;_8e.position=[cx,cy];};var _96=function(_97,_98){var _99=_97.feature.geometry;var _9a=_98.viewpoint.center,cx=_9a[0],cy=_9a[1];var _9b=_99.path;var g=[];for(var i=0;i<_9b.length;i++){var _9c=_9b[i];var l=[];for(var j=0;j<_9c.length;j++){var p=_9c[j];l.push(new _7(p.x-cx,p.y-cy,0));}g.push(l);}var _9d=new _c();_9d.addFeature(g);_9d.upload(_98.context);_97.bucket=_9d;_97.position=[cx,cy];};var _9e=function(_9f,_a0,_a1){var _a2=new _b();var _a3=_a0.viewpoint.center,cx=_a3[0],cy=_a3[1];var g=_9f.feature.geometry;if(g.type==="multipoint"){var _a4=g.points;_a4=_a4.map(function(_a5){return new _7(Math.round(_a5.x-cx),Math.round(_a5.y-cy));});_a2.addFeature([_a4]);}else{_a2.addFeature([[new _7(Math.round(g.x-cx),Math.round(g.y-cy))]]);}_a2.upload(_a0.context);_9f.bucket=_a2;_9f.position=[cx,cy];if(_a1.queryPadding<_9f.symbol.uniforms.radius){_a1.queryPadding=_9f.symbol.uniforms.radius;}};var _a6=function(_a7,_a8,_a9){var _aa=new _b();var _ab=_a8.viewpoint.center,cx=_ab[0],cy=_ab[1];var g=_a7.feature.geometry;_aa.addFeature([[new _7(Math.round(g.x-cx),Math.round(g.y-cy))]]);_aa.upload(_a8.context);_a7.bucket=_aa;_a7.position=[cx,cy];};var _ac=function(_ad,_ae,_af){var _b0=new _b();var _b1=_ae.viewpoint.center,cx=_b1[0],cy=_b1[1];var p=_ad.feature.geometry.center;_b0.addFeature([[new _7(Math.round(p.x-cx),Math.round(p.y-cy))]]);_b0.upload(_ae.context);_ad.bucket=_b0;_ad.position=[cx,cy];var _b2=_ad.feature.geometry.radius/_ae.resolution;if(_af.queryPadding<_b2){_af.queryPadding=_b2;}};var _b3=function(_b4,_b5,_b6){var _b7=new _e();var _b8=_b5.viewpoint.center,cx=_b8[0],cy=_b8[1];var p=_b4.feature.geometry;var _b9=_b4.symbol;if(p.type==="point"){_b7.addFeature([[new _7(Math.round(p.x-cx),Math.round(p.y-cy))]],_b9.width,_b9.height,_b9.offset);_b7.upload(_b5.context);_b4.bucket=_b7;_b4.position=[cx,cy,p.z||0];}else{if(p.type==="multipoint"){var ps=p.points.map(function(_ba){return new _7(Math.round(_ba.x-cx),Math.round(_ba.y-cy));});_b7.addFeature([ps],_b9.width,_b9.height,_b9.offset);_b7.upload(_b5.context);_b4.bucket=_b7;_b4.position=[cx,cy,p.z||0];}}};var _bb=function(_bc,_bd){var _be=_bd.symbol.uniforms;var _bf=_bd.position;var _c0=_bd.symbol;if(!_c0.loaded){_c0.used=true;return;}var _c1=_bc.view.context;var gl=_c1.gl;var _c2=_bc.depthModeForSublayer(0,_3.DepthMode.ReadOnly);var _c3=_3.StencilMode.disabled;var _c4=_3.ColorMode.alphaBlended;var _c5=_bd.bucket;var _c6=_bc.view.useProgramSimplify("images",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0},{name:"a_data",type:"Int16",components:4,offset:8}]});var _c7=[_c0.width,_c0.height];var m=_bc.transform.getMatrixForPoint(_bf[0],_bf[1],null,null,_bf[2]);_be.u_camera_to_center_distance=_bc.transform.cameraToCenterDistance;_be.u_matrix=m;_be.u_label_plane_matrix=_71(m,false,false,_bc.transform.labelPlaneMatrix,1);_be.u_coord_matrix=_77(m,false,false,_bc.transform.glCoordMatrix,1);_be.u_texsize=_c7;_c1.activeTexture.set(gl.TEXTURE0);var _c8=_c0.texture;if(!_c8){_c8=_c0.texture=new _4(_c1,_c0.image,gl.RGBA,{useMipmap:true});}_c8.bind(gl.LINEAR,gl.CLAMP_TO_EDGE);if(_bd.radian){_be.u_radian=_bd.radian;}_c6.draw(_c1,gl.TRIANGLES,_c2,_c3,_c4,_3.CullFaceMode.disabled,_be,_bd.id,_c5.layoutVertexBuffer,_c5.indexBuffer,_c5.segments,null,_bc.transform.level);};var _c9=function(_ca,_cb,_cc){};var _cd=function(_ce,_cf){};var _d0=function(_d1,_d2,_d3){var _d4=50;var _d5=new _8.StructArrayLayout3f12();for(var i=0;i<_d4;i++){_d5.emplaceBack(i,-1,0);_d5.emplaceBack(i,1,0);}var _d6=_d2.context.createVertexBuffer(_d5,[{name:"a_pos",type:"Float32",components:3,offset:0}]);var _d7=_12.simpleSegment(0,0,100,2);var _d8=_d1.feature.geometry;var _d9=_d2.viewpoint.center,cx=_d9[0],cy=_d9[1];var _da=_d8.path;var _db=0;var _dc=new _8.StructArrayLayout6fb24();for(i=0;i<_da.length;i++){var _dd=_da[i];var p1=_dd[0],p2=_dd[1];_dc.emplaceBack(Math.round(p1.x-cx),Math.round(p1.y-cy),0,Math.round(p2.x-cx),Math.round(p2.y-cy),0);_db++;}var _de=_d2.context.createVertexBuffer(_dc,[{name:"source",type:"Float32",components:3,offset:0},{name:"target",type:"Float32",components:3,offset:12}]);_d1.vertexBuffer=_d6;_d1.instanceBuffer=_de;_d1.segment=_d7;_d1.position=[cx,cy];_d1.count=_db;};var _df=function(_e0,_e1){var _e2=_e0.view.context;var gl=_e2.gl;var _e3=_e0.depthModeForSublayer(0,_3.DepthMode.ReadOnly);var _e4=_3.ColorMode.alphaBlended;var _e5=_e1.symbol;var _e6=_e0.view.useProgramSimplify("arc",{layoutAttributes:[{name:"a_pos",type:"Float32",components:3,offset:0},{name:"source",type:"Float32",components:3,offset:0},{name:"target",type:"Float32",components:3,offset:12}]});var _e7=_e5.uniforms;var _e8=_e1.position;_e7["u_matrix"]=_e0.transform.getMatrixForPoint(_e8[0],_e8[1]);_e7["numSegments"]=50;_e7["u_units_to_pixels"]=[_e0.transform.width,_e0.transform.height];_e6.drawArraysInstancedANGLE(_e2,gl.TRIANGLE_STRIP,_e3,null,_e4,_3.CullFaceMode.disabled,_e7,_e1.id,_e1.vertexBuffer,null,_e1.segment,_e1.instanceBuffer,_e1.count);};var _e9=function(_ea,_eb){var _ec=_eb.symbol;if(!_ec.loaded){_ec.used=true;return;}var _ed=_3.ColorMode.alphaBlended;var _ee=_ea.depthModeForSublayer(0,_3.DepthMode.ReadOnly);var _ef=_ea.view.context;var gl=_ef.gl;var _f0=_eb.bucket;var _f1=_ea.view.useProgramSimplify("imageFill",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0}]});var _f2=_ec.uniforms;var _f3=_eb.position;var _f4=Math.floor(_ea.view.level);var r=_ea.view.viewpoint.getResolution(_f4);_f2["u_matrix"]=_ea.transform.getMatrixForPoint(_f3[0],_f3[1]);_f2["u_scale"]=[1,1/r,2,1];_ef.activeTexture.set(gl.TEXTURE0);var _f5=_ec.texture;if(!_f5){_f5=_ec.texture=new _4(_ef,_ec.image,gl.RGBA,{useMipmap:true});}_f5.bind(gl.LINEAR,gl.CLAMP_TO_EDGE);_f1.draw(_ef,gl.TRIANGLES,_ee,null,_ed,_3.CullFaceMode.disabled,_f2,_eb.id,_f0.layoutVertexBuffer,_f0.indexBuffer,_f0.segments,null,_ea.transform.level);};var _f6=function(_f7,_f8){var _f9=new _f();var _fa=_f8.viewpoint.center,cx=_fa[0],cy=_fa[1];var p=_f7.feature.geometry;var _fb=_f7.symbol;var _fc=_fb.offset;_f9.addFeature([[new _7(Math.round(p.x-cx),Math.round(p.y-cy))]],_fb.text,_fb.font,_fb.glyphMap,_fb.glyphAtlas.positions,_fc);_f9.upload(_f8.context);_f7.bucket=_f9;_f7.position=[cx,cy];};var _fd=function(_fe,_ff){var _100=new _f();var _101=_ff.viewpoint.center,cx=_101[0],cy=_101[1];var p=_fe.feature.geometry;var _102=_fe.symbol;var _103=_102.offset;_fe.ready=false;if(_102.glyphReady){_100.addFeature([[new _7(Math.round(p.x-cx),Math.round(p.y-cy))]],_102.text,_102.font,_102.glyphMap,_102.glyphAtlas.positions,_103);_100.upload(_ff.context);_fe.bucket=_100;_fe.ready=true;_fe.position=[cx,cy];_ff.threeRender();}else{_102.finishRequest=function(){_100.addFeature([[new _7(Math.round(p.x-cx),Math.round(p.y-cy))]],_102.text,_102.font,_102.glyphMap,_102.glyphAtlas.positions,_103);_100.upload(_ff.context);_fe.bucket=_100;_fe.ready=true;_fe.position=[cx,cy];_ff.threeRender();};}};var _104=function(_105,_106){var _107=_105.view.context;var gl=_107.gl;var _108=_105.depthModeForSublayer(0,_3.DepthMode.ReadOnly);var _109=_3.StencilMode.disabled;var _10a=_3.ColorMode.alphaBlended;var _10b=_106.bucket;var _10c=_105.view.useProgramSimplify("text",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0},{name:"a_data",type:"Int16",components:4,offset:8}]});var _10d=_106.symbol.uniforms;var _10e=_106.position;var _10f=_106.symbol,img=_10f.glyphAtlas.image;var _110=[img.width,img.height];var m=_105.transform.getMatrixForPoint(_10e[0],_10e[1]);_10d.u_camera_to_center_distance=_105.transform.cameraToCenterDistance;_10d.u_matrix=m;_10d.u_label_plane_matrix=_71(m,false,false,_105.transform.labelPlaneMatrix,1);_10d.u_coord_matrix=_77(m,false,false,_105.transform.glCoordMatrix,1);_10d.u_texsize=_110;_107.activeTexture.set(gl.TEXTURE0);var _111=_10f.texture;if(!_111){_111=_10f.texture=new _4(_107,img,gl.ALPHA);}_111.bind(gl.LINEAR,gl.CLAMP_TO_EDGE);if(_10f.hasHalo){_10d["u_is_halo"]=1;_10c.draw(_107,gl.TRIANGLES,_108,_109,_10a,_3.CullFaceMode.disabled,_10d,_106.id,_10b.layoutVertexBuffer,_10b.indexBuffer,_10b.segments,null,_105.transform.level);}_10d["u_is_halo"]=0;_10c.draw(_107,gl.TRIANGLES,_108,_109,_10a,_3.CullFaceMode.disabled,_10d,_106.id,_10b.layoutVertexBuffer,_10b.indexBuffer,_10b.segments,null,_105.transform.level);};var _112=function(_113,_114){if(!_114.ready){return;}var _115=_113.view.context;var gl=_115.gl;var _116=_113.depthModeForSublayer(0,_3.DepthMode.ReadOnly);var _117=_3.StencilMode.disabled;var _118=_3.ColorMode.alphaBlended;var _119=_114.bucket;var _11a=_113.view.useProgramSimplify("text",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0},{name:"a_data",type:"Int16",components:4,offset:8}]});var _11b=_114.symbol.uniforms;var _11c=_114.position;var _11d=_114.symbol,img=_11d.glyphAtlas.image;var _11e=[img.width,img.height];var m=_113.transform.getMatrixForPoint(_11c[0],_11c[1]);_11b.u_camera_to_center_distance=_113.transform.cameraToCenterDistance;_11b.u_matrix=m;_11b.u_label_plane_matrix=_71(m,false,false,_113.transform.labelPlaneMatrix,1);_11b.u_coord_matrix=_77(m,false,false,_113.transform.glCoordMatrix,1);_11b.u_texsize=_11e;_115.activeTexture.set(gl.TEXTURE0);var _11f=_11d.texture;if(!_11f){_11f=_11d.texture=new _4(_115,img,gl.ALPHA);}_11f.bind(gl.LINEAR,gl.CLAMP_TO_EDGE);if(_11d.hasHalo){_11b["u_is_halo"]=1;_11a.draw(_115,gl.TRIANGLES,_116,_117,_118,_3.CullFaceMode.disabled,_11b,_114.id,_119.layoutVertexBuffer,_119.indexBuffer,_119.segments,null,_113.transform.level);}_11b["u_is_halo"]=0;_11a.draw(_115,gl.TRIANGLES,_116,_117,_118,_3.CullFaceMode.disabled,_11b,_114.id,_119.layoutVertexBuffer,_119.indexBuffer,_119.segments,null,_113.transform.level);};var _120=function(_121,view){var _122=_121.feature.geometry.path[0];var _123=view.viewpoint.center;var _124=_121.symbol;var _125;if(_124.hasMap){_125=new _8.StructArrayLayout4f16();_125.emplaceBack(_122[0].x-_123[0],_122[0].y-_123[1],0,0);_125.emplaceBack(_122[1].x-_123[0],_122[1].y-_123[1],1,0);_125.emplaceBack(_122[2].x-_123[0],_122[2].y-_123[1],1,1);_125.emplaceBack(_122[3].x-_123[0],_122[3].y-_123[1],0,1);_121.vertexBuffer=view.context.createVertexBuffer(_125,[{name:"a_pos",type:"Float32",components:4,offset:0}]);}else{_125=new _8.StructArrayLayout2f8();_125.emplaceBack(_122[0].x-_123[0],_122[0].y-_123[1]);_125.emplaceBack(_122[1].x-_123[0],_122[1].y-_123[1]);_125.emplaceBack(_122[2].x-_123[0],_122[2].y-_123[1]);_125.emplaceBack(_122[3].x-_123[0],_122[3].y-_123[1]);_121.vertexBuffer=view.context.createVertexBuffer(_125,[{name:"a_pos",type:"Float32",components:2,offset:0}]);}var _126=new _8.StructArrayLayout3ui6();_126.emplaceBack(0,1,2);_126.emplaceBack(2,3,0);_121.indexBuffer=view.context.createIndexBuffer(_126);_121.segments=_12.simpleSegment(0,0,4,2);_121.position=[_123[0],_123[1]];};var _127=function(_128,_129,glow){var _12a=_3.ColorMode.alphaBlended;var _12b=_128.depthModeForSublayer(1,_3.DepthMode.ReadOnly);var _12c=_128.view.context;var gl=_12c.gl;var _12d=_129.symbol;var _12e;if(_12d.hasMap){if(!_12d.loaded){_12d.use=true;return;}_12e=_128.view.useProgramSimplify("basicFillImage",{layoutAttributes:[{name:"a_pos",type:"Float32",components:4,offset:0}]});_12c.activeTexture.set(gl.TEXTURE0);var _12f=_12d.texture;if(!_12f){_12f=_12d.texture=new _4(_12c,_12d.image,gl.RGBA,{useMipmap:true});}_12f.bind(gl.LINEAR,gl.CLAMP_TO_EDGE);}else{_12e=_128.view.useProgramSimplify("basicFill",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0}]});}var _130=_12d.uniforms;var _131=_129.position;_130["u_matrix"]=_128.transform.getMatrixForPoint(_131[0],_131[1]);_12e.draw(_12c,gl.TRIANGLES,_12b,null,_12a,_3.CullFaceMode.disabled,_130,_129.id,_129.vertexBuffer,_129.indexBuffer,_129.segments,null,_128.transform.level);};var _67=function(_132,_133){var _134=_132.view.context;var gl=_134.gl;var _135=new _3.DepthMode(gl.LEQUAL,_3.DepthMode.ReadOnly,[0,0]);var _136=_3.ColorMode.alphaBlended;var _137=_133.bucket;var _138=_132.view.useProgramSimplify("multiPoints",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0}]});var _139={};var _13a=_133.position;_139["u_matrix"]=_132.transform.getMatrixForPoint(_13a[0],_13a[1]);_138.draw2(_134,gl.POINTS,_135,null,_136,_3.CullFaceMode.disabled,_139,_133.id,_137.layoutVertexBuffer,_137.length);};_1.draw={arc:_df,circle:_2d,polygon:_5a,line:_1f,point:_49,multiPoints:_67,image:_bb,text:_104,zttext:_112,canvas:_7d,fan:_3b,rect:_127,imageFill:_e9};_1.add={arc:_d0,line:_8d,polygon:_96,point:_9e,circle:_ac,image:_b3,text:_f6,zttext:_fd,canvas:_b3,fan:_a6,rect:_120,imageFill:_96};});