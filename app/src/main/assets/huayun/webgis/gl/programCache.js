//>>built
define("com/huayun/webgis/gl/programCache",["exports","./ProgramSimplify","./VertexFragShader"],function(_1,_2,_3){var _4={};_1.useProgramSimplify=function(_5,_6,_7){var _8=_6+"-"+_5.id;if(!_4[_8]){_4[_8]=new _2(_5,_3[_6],_7,_3.programUniforms[_6]);}return _4[_8];};});