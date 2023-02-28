//>>built
define("com/huayun/webgis/views/3d/LevelGraphicsView",["exports","custom/gl-matrix-min","com/huayun/webgis/gl/mode","com/huayun/webgis/geometry/Point","com/huayun/webgis/data/bucket/MultiCircleBucketSimplify"],function(_1,_2,_3,_4,_5){var _6=function(_7,_8,_9){var _a=new _5();var _b=_8.viewpoint.center,cx=_b[0],cy=_b[1];var g=_7.feature.geometry;var _c=_7.feature.attributes.colors;_a.addFeature([g.points],_c);_a.upload(_8.context);_7.bucket=_a;_7.position=[cx,cy];};var _d=function(_e,_f){var _10=_e.view.context;var gl=_10.gl;var _11=_e.depthModeForSublayer(0,_3.DepthMode.ReadOnly);var _12=_3.StencilMode.disabled;var _13=_3.ColorMode.srcBlended;var _14=_f.bucket;var _15=_e.view.useProgramSimplify("multiCircles",{layoutAttributes:[{name:"a_pos",type:"Float32",components:2,offset:0},{name:"a_color",type:"Float32",components:4,offset:8}]});var _16=_f.symbol;var _17=_e.transform.level;var _18=_16.uniforms;var _19=_f.position;_18["u_matrix"]=_e.transform.getMatrixForPoint(_19[0],_19[1]);_18["u_camera_to_center_distance"]=_e.transform.cameraToCenterDistance;var _1a=_e.transform.resolution;var _1b=_16.pitchWithMap;var _1c=_16.fixedSize;if(_1b){if(_1c){_18["u_extrude_scale"]=[_1a,_1a];}else{_18["u_extrude_scale"]=[1,1];}}else{_18["u_extrude_scale"]=_e.transform.pixelsToGLUnits;}_18["radius"]=_16.levelRadius[Math.round(_17)];_15.draw(_10,gl.TRIANGLES,_11,_12,_13,_3.CullFaceMode.disabled,_18,_f.id,_14.layoutVertexBuffer,_14.indexBuffer,_14.segments,null,_17);};_1.draw={point:_d};_1.add={point:_6};});