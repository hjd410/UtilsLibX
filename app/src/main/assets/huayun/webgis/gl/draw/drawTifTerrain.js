//>>built
define("com/huayun/webgis/gl/draw/drawTifTerrain",["exports","../mode","../../geometry/Point","../Texture","../../utils/utils","../programCache","custom/gl-matrix-min"],function(_1,_2,_3,_4,_5,_6,_7){var _8=function(_9){return {"u_matrix":_9,"u_image":0};};var _a=function(_b,_c,_d,_e){var _f=_b.view.context;var gl=_f.gl;var _10=_6.useProgramSimplify(_f,"tifTerrain",{layoutAttributes:[{name:"a_pos",type:"Float32",components:3,offset:0}]});var _11=_2.StencilMode.disabled;var _12=_2.ColorMode.alphaBlended;var _13=_e.length&&_e[0].overscaledZ;var _14=_b.depthModeForSublayer(0,_2.DepthMode.ReadWrite);for(var i=0,_15=_e;i<_15.length;i+=1){var _16=_15[i];var _17=_c.getTile(_16);var _18=_16.posMatrix;var _19=_17.bucket;if(!_19){continue;}var _1a=gl.LINEAR;_f.activeTexture.set(gl.TEXTURE0);_17.texture.bind(_1a,gl.CLAMP_TO_EDGE,gl.LINEAR_MIPMAP_NEAREST);var _1b=_8(_18);_10.draw(_f,gl.TRIANGLES,_14,_11,_12,_2.CullFaceMode.disabled,_1b,"terrain",_19.layoutVertexBuffer,_19.indexBuffer,_19.segments);}};return _a;});