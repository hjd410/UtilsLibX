//>>built
define("com/huayun/webgis/action/location/SpatialPosition",["dojo/_base/declare","dojo/topic","../../widget/MapModuleX","../MapAction"],function(_1,_2,_3,_4){return _1("com.huayun.webgis.action.location.SpatialPosition",[_4],{constructor:function(_5){_1.safeMixin(_5);this.isActive=false;},doAction:function(){_2.publish("widgetDialogContent","buildingLocating","空间对象定位");}});});