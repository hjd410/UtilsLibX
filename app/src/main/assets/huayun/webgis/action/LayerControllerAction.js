//>>built
define("com/huayun/webgis/action/LayerControllerAction",["dojo/_base/declare","dojo/topic","./MapAction"],function(_1,_2,_3){return _1("com.huayun.webgis.action.LayerControllerAction",[_3],{constructor:function(_4){_1.safeMixin(_4);this.map=_4.map;},doAction:function(){debugger;_2.publish("widgetDialogContent","layerController","图层控制");}});});