//>>built
define("com/huayun/webgis/action/history/NextView",["dojo/_base/declare","../MapAction"],function(_1,_2){return _1("com.huayun.webgis.action.zooms.ZoomIn",[_2],{constructor:function(_3){_1.safeMixin(_3);this.isActive=false;this.view=_3.view;},doAction:function(){this.view.setView(false);}});});