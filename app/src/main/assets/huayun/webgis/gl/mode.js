//>>built
define("com/huayun/webgis/gl/mode",["exports","../utils/Color","../utils/Constant"],function(_1,_2,_3){var _4=function _4(_5,_6,_7){this.func=_5;this.mask=_6;this.range=_7;};_4.ReadOnly=false;_4.ReadWrite=true;_4.disabled=new _4(_3.glConstant.ALWAYS,_4.ReadOnly,[0,1]);_4.opaque=new _4(_3.glConstant.LEQUAL,_4.ReadWrite,[0,1]);var _8=function _8(_9,_a,_b){this.enable=_9;this.mode=_a;this.frontFace=_b;};_8.disabled=new _8(false,_3.glConstant.BACK,_3.glConstant.CCW);_8.backCCW=new _8(true,_3.glConstant.BACK,_3.glConstant.CCW);var _c=function _c(_d,_e,_f){this.blendFunction=_d;this.blendColor=_e;this.mask=_f;};_c.Replace=[_3.glConstant.ONE,_3.glConstant.ZERO];_c.disabled=new _c(_c.Replace,_2.transparent,[false,false,false,false]);_c.unblended=new _c(_c.Replace,_2.transparent,[true,true,true,true]);_c.alphaBlended=new _c([_3.glConstant.ONE,_3.glConstant.ONE_MINUS_SRC_ALPHA],_2.transparent,[true,true,true,true]);_c.srcBlended=new _c([_3.glConstant.SRC_ALPHA,_3.glConstant.ONE_MINUS_SRC_ALPHA],_2.transparent,[true,true,true,true]);var _10=function _10(_11,ref,_12,_13,_14,_15){this.test=_11;this.ref=ref;this.mask=_12;this.fail=_13;this.depthFail=_14;this.pass=_15;};_10.disabled=new _10({func:_3.glConstant.ALWAYS,mask:0},0,0,_3.glConstant.KEEP,_3.glConstant.KEEP,_3.glConstant.KEEP);_1.DepthMode=_4;_1.CullFaceMode=_8;_1.ColorMode=_c;_1.StencilMode=_10;});