//>>built
define("com/huayun/webgis/featureloader",["dojo/_base/declare"],function(_1){return _1("com.huayun.webgis.featureloader",null,{constructor:function(){},loadFeaturesXhr:function(_2,_3,_4,_5,_6){return (function(){var _7=new XMLHttpRequest();_7.open("GET",_2,true);_7.responseType="arraybuffer";_7.onload=function(_8){if(!_7.status||_7.status>=200&&_7.status<300){var _9=_7.response;var _a=new ol.format.MVT();var _b=_a.readFeatures(_9);_5.call(this,_b,_3.split("/"),_3,_4);}else{_6.call(this);}}.bind(this);_7.onerror=function(){_6.call(this);}.bind(this);_7.send();}.call(this));}});});