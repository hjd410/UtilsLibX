//>>built
define("com/huayun/webgis/action/SwitchViewAction",["dojo/_base/declare","dojo/topic","./MapAction"],function(_1,_2,_3){return _1("com.huayun.webgis.action.SwitchViewAction",[_3],{constructor:function(_4){_1.safeMixin(_4);this.isActive=false;this.view=_4.view;},doAction:function(){if(this.view.is3DVision){this.view.setDimensions(2);}else{this.view.setDimensions(3);}}});});