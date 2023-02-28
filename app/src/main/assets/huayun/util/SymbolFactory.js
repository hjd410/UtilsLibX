//>>built
define("com/huayun/util/SymbolFactory",["../webgis/symbols/CompositeMarkSymbol","../webgis/symbols/CompositeLineSymbol","../webgis/symbols/CompositeFillSymbol"],function(_1,_2,_3){return (function(){function _4(){this._propertyName="DefaultValue";};_4.prototype.createSymbols=function(_5,_6){};_4.prototype.createSymbol=function(_7){if(_7===null){return null;}this.getPropertyName(_7.propertyName);return this.getSymbol(_7);};_4.prototype.getPropertyName=function(_8){this._propertyName=_8;};_4.prototype.getSymbol=function(_9){var _a=_9.styles,_b=_9.geoType,_c=_9.minScale,_d=_9.maxScale;if(_a.length===1){var _e=_a[0];return this.createCompositeSymbol(_b,_e,_c,_d,_9);}else{if(_a.length>1){var _f={};for(var i=0;i<_a.length;i++){var _10=_a[i];if(_10.maxPropertyValue&&_10.minPropertyValue){_f[_10.maxPropertyValue+"-"+_10.minPropertyValue]=this.createCompositeSymbol(_b,_10,_c,_d,_9);}else{_f[_10.propertyValue]=this.createCompositeSymbol(_b,_10,_c,_d,_9);}}return _f;}}return null;};_4.prototype.createCompositeSymbol=function(_11,_12,_13,_14,_15){var _16;switch(_11){case "point":_12.addratio=_15.addratio;_12.isFixed=_15.isFixed;_12.minScale=_13;_12.maxScale=_14;_16=new _1(_12);_16.minScale=_13;_16.maxScale=_14;return _16;case "line":_12.addratio=_15.addratio;_12.isFixed=_15.isFixed;_12.minScale=_13;_12.maxScale=_14;_16=new _2(_12);_16.minScale=_13;_16.maxScale=_14;return _16;case "polygon":_12.addratio=_15.addratio;_12.isFixed=_15.isFixed;_12.minScale=_13;_12.maxScale=_14;_16=new _3(_12);_16.minScale=_13;_16.maxScale=_14;return _16;}return null;};_4.prototype._getStylesFromStyleList=function(id,_17,_18){var reg=/(\w+)\.(\w+)/;if(reg.test(id)){var _19=null;out:for(var i=0;i<_17.length;i++){var _1a=_17[i];if(_1a.name===RegExp.$1){_19=_1a.styles;break out;}}if(_19){var _1b=_19[_18].style;if(Array.isArray(_1b)){for(var j=0;j<_1b.length;j++){var _1c=_1b[j];if(_1c._id===RegExp.$2){for(var _1d in _1c){if(_1c.hasOwnProperty(_1d)){var _1e=_1c[_1d];if(Object.prototype.toString.call(_1e)==="[object Object]"){return [_1e];}else{if(Array.isArray(_1e)){return _1e;}}}}}}}else{for(var _1f in _1b){if(_1b.hasOwnProperty(_1f)){var _20=_1b[_1f];if(Object.prototype.toString.call(_20)==="[object Object]"){return [_20];}}}}}}};return _4;}());});