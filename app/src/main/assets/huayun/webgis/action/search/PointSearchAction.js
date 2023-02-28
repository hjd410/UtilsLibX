//>>built
define("com/huayun/webgis/action/search/PointSearchAction",["dojo/_base/declare","dojo/on","dojo/dom","dojo/query","dojo/topic","dojo/dom-style","dojo/dom-construct","dojo/_base/window","../../geometry/Point2D","../ActiveMapAction"],function(_1,on,_2,_3,_4,_5,_6,_7,_8,_9){return _1("com.huayun.webgis.action.search.PointSearchAction",[_9],{constructor:function(_a){_1.safeMixin(this,_a);this.view=_a.view;this.state=false;this.power=this.view.map.findLayerById("power");this._onClick=null;this.isPoint=true;},active:function(_b){if(_b){this.point=_b;}if(!this.state){this.state=true;this.view.selectEnabled=true;this._onClick=on(this.view.domNode,"click",this._mouseClick.bind(this));}},_mouseClick:function(e){this.doAction(e);},invalid:function(){this.view.panEnabled=true;if(this.isPoint){_4.publish("closePoint");}else{_4.publish("closeDevInfo");}this._endActionMethod.call(this);},doAction:function(e){if(this.view.selectEnabled){var _c=this.view.screenToGeometry(e.clientX,e.clientY);var _d=this.power.queryFeaturesByGeometry(_c,10);if(_d&&_d.length>0&&this.state){if(this.isPoint){_4.publish("showPoint",_d,e);}else{_4.publish("showDevInfo",_d,e);}}else{if(this.isPoint){_4.publish("closePoint");}else{_4.publish("closeDevInfo");}}}},_endActionMethod:function(){this.state=false;if(this.isPoint){_4.publish("closePoint");}else{_4.publish("closeDevInfo");}if(this._onClick){this._onClick.remove();this._onClick=null;}}});});