//>>built
define("com/huayun/webgis/renderer/Renderer",[],function(){function _1(){};_1.prototype.getRealScale=function(_2,_3,_4){var _5=1;if(_2.isFixed||_4===0){return _5;}if(_2.addratio===0){return _3/_4;}else{if(_2.addratio>0){return (1+(_3/_4)*_2.addratio);}}};_1.prototype.calculateExtent=function(){};return _1;});