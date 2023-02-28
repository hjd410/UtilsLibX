//>>built
define("com/huayun/webgis/action/DrawAction",["dojo/_base/declare","dojo/on","dojo/topic","dojo/dom-construct","./MapAction"],function(_1,on,_2,_3,_4){return _1("com.huayun.webgis.action.DrawAction",[_4],{mouseDown:null,mouseMove:null,mouseClick:null,mouseDblClick:null,mouseClickMove:null,angleNodes:[],drawLayer:null,cachePoint:[],constructor:function(_5){_1.safeMixin(this,_5);this.drawLayer=this.map.findLayerById("drawLayer");},active:function(_6){this.activeState=_6;if(_6){this.map.selectAble=false;this.mouseClick=on(this.map.domNode,"click",this._onMouseClick.bind(this));this.mouseDown=on(this.map.domNode,"mousedown",this._onMouseDown.bind(this));}else{this.mouseClick.remove();this.mouseDown.remove();}},setActionState:function(_7){this.actionState=_7;},_onMouseClick:function(e){e.preventDefault();e.stopPropagation();if(e.button===0){switch(this.actionState){case "dot":this.drawDot(e.x,e.y);break;case "line":this.drawLine(e.x,e.y);break;case "polygon":this.drawPolygon(e.x,e.y);break;case "measureLine":this.measureLine(e.x,e.y);break;case "measurePoly":this.drawPolygon(e.x,e.y);break;case "measureAngle":this.measureAngle(e.x,e.y);break;case "polygonSelect":this.polygonSelect(e.x,e.y);break;}}},_onMouseDown:function(e){e.preventDefault();e.stopPropagation();if(e.button===0){switch(this.actionState){case "circle":this.drawCircle(e.x,e.y);break;case "sphere":this.drawSphere(e.x,e.y);break;case "rectSelect":this.rectSelect(e.x,e.y);break;case "circleSelect":this.circleSelect(e.x,e.y);break;}}},drawDot:function(x,y){var _8=this.map.screenTo3dPoint(x,y);this.drawLayer.addPoint({x:_8.x,y:_8.y});this.actionState="ready";},drawLine:function(x,y){this.map.panAble=false;this.drawLayer.currentGraphic=null;var _9=this.drawLayer.group.position;var p=this.map.screenTo3dPoint(x,y);p.x=p.x-_9.x;p.y=p.y-_9.y;this.cachePoint[0]=p;if(!this.mouseClickMove){this.mouseClickMove=on(this.map.domNode,"mousemove",function(e){this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);var ep=this.map.screenTo3dPoint(e.x,e.y);ep.x=ep.x-_9.x;ep.y=ep.y-_9.y;this.cachePoint[1]=ep;this.drawLayer.addLine(this.cachePoint[0],ep);}.bind(this));var _a=on(this.map.domNode,"dblclick",function(){this.mouseClickMove.remove();this.mouseClickMove=null;_a.remove();this.actionState="ready";this.map.panAble=true;this.cachePoint=[];this.drawLayer.currentGraphic=null;_2.publish("mapDrawEnd");}.bind(this));}},drawPolygon:function(x,y){this.map.panAble=false;this.drawLayer.currentGraphic=null;var _b=this.drawLayer.group.position;var p=this.map.screenTo3dPoint(x,y);p.x=p.x-_b.x;p.y=p.y-_b.y;this.cachePoint.push(p);this.cachePoint.push({x:0,y:0,z:0});if(!this.mouseClickMove){this.mouseClickMove=on(this.map.domNode,"mousemove",function(e){this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);var ep=this.map.screenTo3dPoint(e.x,e.y),_c=this.cachePoint.length;ep.x=ep.x-_b.x;ep.y=ep.y-_b.y;this.cachePoint[_c-1]=ep;this.drawLayer.addPolygon(this.cachePoint);}.bind(this));var _d=on(this.map.domNode,"dblclick",function(){this.mouseClickMove.remove();this.mouseClickMove=null;_d.remove();this.actionState="ready";this.map.panAble=true;this.cachePoint=[];this.drawLayer.currentGraphic=null;_2.publish("mapDrawEnd");}.bind(this));}},drawCircle:function(x,y){var _e=this.drawLayer.group.position;var p=this.map.screenTo3dPoint(x,y);p.x=p.x-_e.x;p.y=p.y-_e.y;this.map.panAble=false;this.cachePoint[0]=p;if(!this.mouseMove){this.mouseMove=on(this.map.domNode,"mousemove",function(e){var _f=this.map.screenTo3dPoint(e.x,e.y);_f.x=_f.x-_e.x;_f.y=_f.y-_e.y;var _10=Math.abs(_f.x-this.cachePoint[0].x),_11=Math.abs(_f.y-this.cachePoint[0].y),r2=_10*_10+_11*_11,r=Math.sqrt(r2);this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);this.drawLayer.addCircle(this.cachePoint[0],r);}.bind(this));var _12=on(this.map.domNode,"mouseup",function(e){this.mouseMove.remove();this.mouseMove=null;_12.remove();this.actionState="ready";this.map.panAble=true;this.cachePoint=[];this.drawLayer.currentGraphic=null;_2.publish("mapDrawEnd");}.bind(this));}},rectSelect:function(x,y){var _13=this.drawLayer.group.position;var p=this.map.screenTo3dPoint(x,y);p.x=p.x-_13.x;p.y=p.y-_13.y;this.map.panAble=false;this.cachePoint[0]=p;if(!this.mouseMove){this.mouseMove=on(this.map.domNode,"mousemove",function(e){var _14=this.map.screenTo3dPoint(e.x,e.y);_14.x=_14.x-_13.x;_14.y=_14.y-_13.y;this.cachePoint[1]=_14;this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);this.drawLayer.addRect(this.cachePoint[0],this.cachePoint[1]);}.bind(this));var _15=on(this.map.domNode,"mouseup",function(e){this.mouseMove.remove();this.mouseMove=null;_15.remove();this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);this.map.rectSelect(this.cachePoint[0],this.cachePoint[1]);this.actionState="ready";this.map.panAble=true;this.cachePoint=[];this.drawLayer.currentGraphic=null;_2.publish("mapDrawEnd");}.bind(this));}},circleSelect:function(x,y){var _16=this.drawLayer.group.position;var p=this.map.screenTo3dPoint(x,y);p.x=p.x-_16.x;p.y=p.y-_16.y;this.map.panAble=false;this.cachePoint[0]=p;if(!this.mouseMove){this.mouseMove=on(this.map.domNode,"mousemove",function(e){var _17=this.map.screenTo3dPoint(e.x,e.y);_17.x=_17.x-_16.x;_17.y=_17.y-_16.y;var _18=Math.abs(_17.x-this.cachePoint[0].x),_19=Math.abs(_17.y-this.cachePoint[0].y),r2=_18*_18+_19*_19,r=Math.sqrt(r2);this.cachePoint[1]=r;this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);this.drawLayer.addCircle(this.cachePoint[0],r);}.bind(this));var _1a=on(this.map.domNode,"mouseup",function(e){this.mouseMove.remove();this.mouseMove=null;_1a.remove();this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);this.map.circleSelect(this.cachePoint[0],this.cachePoint[1]);this.actionState="ready";this.map.panAble=true;this.cachePoint=[];this.drawLayer.currentGraphic=null;_2.publish("mapDrawEnd");}.bind(this));}},polygonSelect:function(x,y){this.map.panAble=false;var _1b=this.drawLayer.group.position;var p=this.map.screenTo3dPoint(x,y);p.x=p.x-_1b.x;p.y=p.y-_1b.y;this.cachePoint.push(p);this.cachePoint.push({x:0,y:0,z:0});if(!this.mouseClickMove){this.mouseClickMove=on(this.map.domNode,"mousemove",function(e){this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);var ep=this.map.screenTo3dPoint(e.x,e.y),len=this.cachePoint.length;ep.x=ep.x-_1b.x;ep.y=ep.y-_1b.y;this.cachePoint[len-1]=ep;this.drawLayer.addPolygon(this.cachePoint);}.bind(this));var _1c=on(this.map.domNode,"dblclick",function(){this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);this.mouseClickMove.remove();this.mouseClickMove=null;_1c.remove();this.map.polygonSelect(this.cachePoint);this.actionState="ready";this.map.panAble=true;this.cachePoint=[];_2.publish("mapDrawEnd");}.bind(this));}},drawSphere:function(x,y){this.map.panAble=false;var _1d=this.drawLayer.group.position;var p=this.map.screenTo3dPoint(x,y);p.x=p.x-_1d.x;p.y=p.y-_1d.y;this.cachePoint[0]=p;if(!this.mouseMove){this.mouseMove=on(this.map.domNode,"mousemove",function(e){var _1e=this.map.screenTo3dPoint(e.x,e.y);_1e.x=_1e.x-_1d.x;_1e.y=_1e.y-_1d.y;var _1f=Math.abs(_1e.x-this.cachePoint[0].x),_20=Math.abs(_1e.y-this.cachePoint[0].y),r2=_1f*_1f+_20*_20,r=Math.sqrt(r2);this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);this.drawLayer.addSphere(this.cachePoint[0],r);}.bind(this));var _21=on(this.map.domNode,"mouseup",function(e){this.mouseMove.remove();this.mouseMove=null;_21.remove();this.actionState="ready";this.map.panAble=true;this.cachePoint=[];this.drawLayer.currentGraphic=null;_2.publish("mapDrawEnd");}.bind(this));}},clear:function(){this.cachePoint=[];this.drawLayer.currentGraphic=null;this.drawLayer.clear();},measureLine:function(x,y){this.map.panAble=false;this.drawLayer.currentGraphic=null;var _22=this.drawLayer.group.position;var p=this.map.screenTo3dPoint(x,y);p.x=p.x-_22.x;p.y=p.y-_22.y;if(this.cachePoint.length>0){var _23=this.calculateDistance(this.cachePoint[0],p);if(_23>0){this.drawLayer.addText(p,this.distanceStr(_23));}}this.cachePoint[0]=p;if(!this.mouseClickMove){this.mouseClickMove=on(this.map.domNode,"mousemove",function(e){this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);var ep=this.map.screenTo3dPoint(e.x,e.y);ep.x=ep.x-_22.x;ep.y=ep.y-_22.y;this.cachePoint[1]=ep;this.drawLayer.addLine(this.cachePoint[0],ep);}.bind(this));var _24=on(this.map.domNode,"dblclick",function(){this.mouseClickMove.remove();this.mouseClickMove=null;_24.remove();this.actionState="ready";this.map.panAble=true;this.cachePoint=[];this.drawLayer.currentGraphic=null;_2.publish("mapDrawEnd");}.bind(this));}},calculateDistance:function(_25,_26){var _27=Math.abs(_25.x-_26.x),_28=Math.abs(_25.y-_26.y);return Math.sqrt(_27*_27+_28*_28)*this.map.initResolution;},distanceStr:function(_29){return _29<1000?_29.toFixed(2)+"米":(_29/1000).toFixed(2)+"千米";},measureAngle:function(x,y){this.map.panAble=false;this.drawLayer.currentGraphic=null;var _2a=this.drawLayer.group.position;var p=this.map.screenTo3dPoint(x,y);p.x=p.x-_2a.x;p.y=p.y-_2a.y;this.cachePoint[0]=p;this.angleNodes.push(p);if(!this.mouseClickMove){this.mouseClickMove=on(this.map.domNode,"mousemove",function(e){this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);var ep=this.map.screenTo3dPoint(e.x,e.y);ep.x=ep.x-_2a.x;ep.y=ep.y-_2a.y;this.cachePoint[1]=ep;this.drawLayer.addLine(this.cachePoint[0],ep);}.bind(this));var _2b=on(this.map.domNode,"dblclick",function(){this.mouseClickMove.remove();this.mouseClickMove=null;_2b.remove();this.actionState="ready";this.map.panAble=true;this.cachePoint=[];this.angleNodes=[];this.drawLayer.currentGraphic=null;_2.publish("mapDrawEnd");}.bind(this));}if(this.angleNodes.length>2){var len=this.angleNodes.length;var _2c=this.angleNodes[len-1];var _2d=this.getAngle(this.angleNodes[len-3],this.angleNodes[len-2],_2c);if(_2d>0&&_2d<180){this.drawLayer.addText(_2c,_2d+"度");}}},getAngle:function(p1,p2,p3){var _2e=p1.x-p2.x;var _2f=p1.y-p2.y;var _30=p3.x-p2.x;var _31=p3.y-p2.y;var dot=_2e*_30+_2f*_31;var det=_2e*_31-_2f*_30;var _32=Math.atan2(det,dot)/Math.PI*180;var _33=(_32+360)%360;return (_33<180?_33:360-_33).toFixed(2);},measurePoly:function(x,y){this.drawPolygon(x,y);}});});