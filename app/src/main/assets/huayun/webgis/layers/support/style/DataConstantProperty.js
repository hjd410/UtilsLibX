//>>built
define("com/huayun/webgis/layers/support/style/DataConstantProperty",["./styleUtils"],function(_1){var _2=function _2(_3){this.specification=_3;};_2.prototype.possiblyEvaluate=function(_4,_5){return _4.expression.evaluate(_5);};_2.prototype.interpolate=function(a,b,t){var _6=_1.interpolate[this.specification.type];if(_6){return _6(a,b,t);}else{return a;}};return _2;});