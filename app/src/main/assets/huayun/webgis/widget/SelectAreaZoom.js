//>>built
require({cache:{"url:com/huayun/webgis/templates/selectAreaZoom.html":"<div>\r\n    <!--<div class=\"selectArea-box\">-->\r\n        <p class=\"selectArea-btn\" id=\"${btnId}\" data-dojo-attach-point=\"selectAreaNode\" data-dojo-attach-event=\"onclick:toggleState\" >\r\n            框选区域\r\n        </p>\r\n    <!--</div>-->\r\n</div>\r\n\r\n"}});define("com/huayun/webgis/widget/SelectAreaZoom",["dojo/_base/declare","dojo/on","dojo/dom-construct","dojo/topic","dojo/_base/query","../../webgis/geometry/Extent","./MapModuleX","com/huayun/webgis/action/DrawAction","dojo/text!../templates/selectAreaZoom.html"],function(_1,on,_2,_3,_4,_5,_6,_7,_8){return _1("com.huayun.webgis.widget.SelectAreaZoom",[_6],{map:null,baseClass:"selectArea-btn",btnDefaultClass:"selectArea-btn",btnActiveClass:"selectArea-btn-active",templateString:_8,btnId:"selectMap",canvas:null,active:false,actionState:false,doInit:function(){this.map=this.get("map");this.GraphicSceneLayer=this.map.findLayerById("drawLayer");},activeState:function(){this.active=true;this.addCanvas();_4("#"+this.btnId).addClass(this.btnActiveClass);},inactiveState:function(){this.active=false;_4("#"+this.btnId).removeClass(this.btnActiveClass);this.map.panAble=true;},toggleState:function(){if(!this.state){this.activeState();}else{this.inactiveState();}},addCanvas:function(){if(!this.canvas){var _9=document.createElement("canvas");_9.width=this.map.width;_9.height=this.map.height;_9.style="position:absolute;top:0;right:0;cursor:crosshair;";this.canvas=_9;this.map.domNode.appendChild(_9);this.selectAreaZoom();}else{this.canvas.style.display="block";}},removeCanvas:function(){this.canvas.style.display="none";},selectAreaZoom:function(){var _a=this;if(this.canvas){var _b=false;var _c=this.canvas;var _d={};var _e={};var _f=_c.getContext("2d");_c.addEventListener("mousedown",function(e){_b=true;_a.map.panAble=false;_d.x=e.offsetX;_d.y=e.offsetY;});_c.addEventListener("mousemove",function(e){if(_b){_a.drawRect(_f,_c,_d,e);}});_c.addEventListener("mouseup",function(e){_b=false;_e.x=e.offsetX;_e.y=e.offsetY;_a.map.setExtent(_10(_d,_e,_a.map));_3.publish("setEagleEyeExtent",_a.map.extent);_f.clearRect(0,0,_c.width,_c.height);_a.removeCanvas();_a.inactiveState();});function _10(p1,p2,map){var _11={x:0,y:0};var _12={x:_a.canvas.width,y:_a.canvas.height};_11.x=p1.x<p2.x?p1.x:p2.x;_11.y=p1.y<p2.y?p1.y:p2.y;_12.x=p1.x>p2.x?p1.x:p2.x;_12.y=p1.y>p2.y?p1.y:p2.y;var _13=(map.extent.maxx-map.extent.minx)/_a.canvas.width;var _14=(map.extent.maxy-map.extent.miny)/_a.canvas.height;var _15=new _5(map.extent.minx+p1.x*_13,map.extent.maxy-p1.y*_14,map.extent.minx+p2.x*_13,map.extent.maxy-p2.y*_14);return _15;};}},drawRect:function(ctx,_16,_17,e){ctx.clearRect(0,0,_16.width,_16.height);ctx.beginPath();ctx.fillStyle="rgba(0,0,0,0.3)";ctx.strokeStyle="rgba(0,0,0,0.6)";ctx.fillRect(_17.x,_17.y,e.offsetX-_17.x,e.offsetY-_17.y);}});});