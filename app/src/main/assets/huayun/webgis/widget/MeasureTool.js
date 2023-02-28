//>>built
require({cache:{"url:com/huayun/webgis/templates/MeasureTool.html":"<div class=\"${baseClass}\" style=\"pointer-events: all;\">\r\n    <div id=\"${toolBtnId}\" class=\"tool\">测量<span id=${selectArrowId} class=\"arrowText\"></span></div>\r\n    <ul id=\"${selectWrapId}\" class=\"measureSelect\">\r\n        <li class=\"drawWrap\">\r\n            <div class=\"drawLine\" data-dojo-attach-point=\"measureLineNode\" data-dojo-attach-event=\"onclick:measureLine\">线段\r\n            </div>\r\n        </li>\r\n        <li class=\"drawWrap\">\r\n            <div class=\"drawPoly\" data-dojo-attach-point=\"measureAreaNode\"\r\n                 data-dojo-attach-event=\"onclick:measureArea\">\r\n                面积\r\n            </div>\r\n        </li>\r\n    </ul>\r\n</div>"}});define("com/huayun/webgis/widget/MeasureTool",["dojo/_base/declare","dojo/on","dojo/dom","dojo/topic","dojo/_base/query","dojo/dom-class","./MapModuleX","com/huayun/webgis/action/MeasureAction","com/huayun/webgis/layers/3d/DrawSceneLayer","dojo/text!../templates/MeasureTool.html"],function(_1,on,_2,_3,_4,_5,_6,_7,_8,_9){return _1("com.huayun.webgis.widget.MeasureTool",[_6],{map:null,baseClass:"measureTool",typeClass:"level-box-V",toolBtnId:"measureOpenBtn",selectWrapId:"measureSelectWrap",selectArrowId:"measureSelectArrow",_bottom:90,_right:10,selectState:false,activeState:"",actionState:"",records:[],templateString:_9,doInit:function(){var _a=this;this.map=this.get("map");this.measureAction=new _7({id:"measure",map:this.map,actionState:"none"});on(_2.byId(_a.toolBtnId),"click",function(e){e.preventDefault();e.stopPropagation();var _b=e.target,_c=_a.map.action,_d=_2.byId(_a.selectWrapId).style.display;_a._toggleSelect();});_3.subscribe("showDistance",function(_e,_f){_a.showDistance(_e,_f);});},_toggleSelect:function(){var _10=this;if(_10.selectState){_10._closeSelectWrap();}else{_10._openSelectWrap();}},_openSelectWrap:function(){dojo.query("#"+this.toolBtnId).removeClass("tool").addClass("toolActive");dojo.query("#"+this.selectWrapId).style("display","block");dojo.query("#"+this.selectArrowId).removeClass("arrowText").addClass("arrowTextActive");this.selectState=true;},_closeSelectWrap:function(){dojo.query("#"+this.toolBtnId).removeClass("toolActive").addClass("tool");dojo.query("#"+this.selectWrapId).style("display","none");dojo.query("#"+this.selectArrowId).removeClass("arrowTextActive").addClass("arrowText");this.selectState=false;},_getRecordsLength:function(){return this.records.length;},addRecord:function(_11){this.records.push(_11);},removeRecord:function(_12){this.records.splice(_12,1);},measureLine:function(x,y,_13){this.removeActiveClass();this.measureLineNode.className="drawLineActive";this.measureAreaNode.className="drawPoly";this._toggleSelect();this.measureAction.setActionState("measureLine");this.map.setAction(this.measureAction);_3.publish("drawLines",x,y,_13);},drawLines:function(x,y,_14){var _15=this._getRecordsLength();var _16=this.map.screenTo3dPoint(x,y);var _17=this;_17.map.panAble=false;if(!this.mouseClickMove){this.mouseClickMove=on(this.map.domNode,"mousemove",function(e){var _18=_17.map.screenTo3dPoint(e.x,e.y);_3.publish("mapDrawLine",{ex:_18.x,ey:_18.y,theta:_14});_3.publish("showDistance",{p1:_16,p2:_18});});var _19=on(this.map.domNode,"dblclick",function(){_17.mouseClickMove.remove();_17.mouseClickMove=null;_19.remove();_17.actionState="ready";_17.map.panAble=true;_3.publish("mapDrawLineEnd");});}_16.theta=_14;_3.publish("mapDrawLineNode",_16);},calculateDistance:function(_1a){var a=Math.abs(_1a.p1.x-_1a.p2.x);var b=Math.abs(_1a.p1.y-_1a.p2.y);return Math.sqrt(a*a+b*b);},createTextTexture:function(obj){var _1b=document.createElement("canvas");_1b.width=obj.width||256;_1b.height=obj.width||256;var ctx=_1b.getContext("2d");ctx.font=obj.font||"Bold 100px Arial";ctx.lineWidth=4;ctx.fillStyle=obj.color||"#ff0000";ctx.fillText(obj.text,10,1000);var _1c=new THREE.Texture(_1b);_1c.needsUpdate=true;_1c.wrapS=THREE.RepeatWrapping;_1c.wrapT=THREE.RepeatWrapping;return _1c;},addTextTexture:function(obj,_1d){var _1e=this.map.findLayerById("graphic");_1e.addTextTexture(obj.position3d);},showDistance:function(_1f,_20){var _21=this.calculateDistance(_1f);this.addTextTexture({text:_21},_20);},measureArea:function(){this.removeActiveClass();this.measureAreaNode.className="drawPolyActive";this.measureLineNode.className="drawLine";this._toggleSelect();this.measureAction.setActionState("measureArea");this.map.setAction(this.measureAction);},removeActiveClass:function(){dojo.query(".measureActive").removeClass("measureActive");}});});