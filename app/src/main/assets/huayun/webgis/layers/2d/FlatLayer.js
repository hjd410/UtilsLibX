//>>built
require({cache:{"url:com/huayun/webgis/templates/layer.html":"<div class=\"${baseClass}\">\r\n    <canvas width=\"${width}\" height=\"${height}\" id=\"${baseClass}Canvas\" data-dojo-attach-point=\"canvasNode\"></canvas>\r\n</div>"}});define("com/huayun/webgis/layers/2d/FlatLayer",["dojo/_base/declare","dijit/_WidgetBase","dijit/_TemplatedMixin","dojo/dom-style","../Layer","dojo/text!../../templates/layer.html"],function(_1,_2,_3,_4,_5,_6){return _1("com.huayun.webgis.layers.2d.FlatLayer",[_2,_3,_5],{templateString:_6,baseClass:"webgis-layer",refresh:function(){},setVisible:function(_7){if(_7){_4.set(this.domNode,"display","block");}else{_4.set(this.domNode,"display","none");}}});});