//>>built
define("com/huayun/webgis/layers/support/style/EvaluationParameters",["../ZoomHistory"],function(_1){var _2=function _2(_3,_4){this.zoom=_3;if(_4){this.now=_4.now;this.fadeDuration=_4.fadeDuration;this.zoomHistory=_4.zoomHistory;this.transition=_4.transition;}else{this.now=0;this.fadeDuration=0;this.zoomHistory=new _1();this.transition={};}};_2.prototype.isSupportedScript=function isSupportedScript(_5){};_2.prototype.crossFadingFactor=function crossFadingFactor(){if(this.fadeDuration===0){return 1;}else{return Math.min((this.now-this.zoomHistory.lastIntegerZoomTime)/this.fadeDuration,1);}};_2.prototype.getCrossfadeParameters=function getCrossfadeParameters(){var z=this.zoom;var _6=z-Math.floor(z);var t=this.crossFadingFactor();return z>this.zoomHistory.lastIntegerZoom?{fromScale:2,toScale:1,t:_6+(1-_6)*t}:{fromScale:0.5,toScale:1,t:1-(1-t)*_6};};return _2;});