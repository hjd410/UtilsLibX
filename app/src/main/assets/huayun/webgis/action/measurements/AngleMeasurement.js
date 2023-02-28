//>>built
define("com/huayun/webgis/action/measurements/AngleMeasurement",["dojo/_base/declare","dojo/on","dojo/topic","dojo/dom-class","dojo/throttle","dojo/dom-construct","dojo/_base/window","../../geometry/Polyline","../../Graphic","../../Feature","../../symbols/LineSymbol","../../symbols/PointSymbol","../../symbols/TextSymbol","../../geometry/Point2D","../ActiveMapAction"],function(_1,on,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e){return _1("com.huayun.webgis.action.measurements.AngleMeasurement",[_e],{constructor:function(_f){this.view=_f.view;this.view.selectEnabled=false;this.isActive=true;this.drawLayer=this.view.map.findLayerById("drawLayer");this._mouseClick=null;this._dblMouseClick=null;this._mouseMove=null;this._lastPoint=null;this._vertexArr=[];this._preClick=true;this._currentGraphic=null;this._lineGraphicList=[];this._lineGraphicHash={};this._symbol=new _a({color:"#009688",width:3});this._vertexSymbol=new _b({radius:5,color:"#0000FF",pitchWithMap:false,scaleWithPitch:false});var obj=this;_2.subscribe("measurement-delete",function(id){var _10=obj._lineGraphicHash[id];if(_10&&_10.length>0){_10.forEach(function(_11){obj.drawLayer.removeGraphic(_11);});}});_2.subscribe("clearGraphicPop",function(){var _12=document.getElementsByClassName("graphicClose");for(var i=_12.length-1;i>-1;i--){_5.destroy(_12[i]);}this.drawLayer.clear();}.bind(this));},active:function(){if(!this.state){this.state=true;this.view.panEnabled=false;this.view.selectEnabled=false;this._isNew=true;this._mouseClick=on(this.view.container,"click",this._onMouseClick.bind(this));this._dblMouseClick=on(this.view.container,"dblclick",this._onDoubleMouseClick.bind(this));_3.add(this.view.domNode,"draw-cursor-style");}},_onMouseClick:function(_13){_13.preventDefault();_13.stopPropagation();if(!this._mouseMove){this._mouseMove=on(this.view.domNode,"mousemove",this._onMouseMove.bind(this));}var geo=this.view.screenToGeometry(_13.x,_13.y);if(this._lastPoint===null){this._lineGraphicList=[];this.doAction(geo);}else{if(_13.x!==this._lastPoint.x&&_13.y!==this._lastPoint.y){this.doAction(geo);}}this._lastPoint={x:_13.x,y:_13.y};},_onMouseMove:function(_14){var geo=this.view.screenToGeometry(_14.x,_14.y);this.drawLayer.removeGraphic(this._currentGraphic);var _15=new _7();var _16=new _9({attribute:null,geometry:_15});var _17=new _8({feature:_16,symbol:this._symbol});if(this._preClick){this._vertexArr.push(new _d(geo.x,geo.y));this._preClick=false;}else{this._vertexArr.splice(this._vertexArr.length-1,1,new _d(geo.x,geo.y));}_15.setPath([this._vertexArr]);this._currentGraphic=_17;this.drawLayer.addGraphic(_17);this.drawLayer.layerView.view.threeRender();},doAction:function(_18){this._drawVertex(_18);},_drawVertex:function(geo){var _19=new _d(geo.x,geo.y);var _1a=new _9({attribute:null,geometry:_19});var _1b=new _8({feature:_1a,symbol:this._vertexSymbol});this.drawLayer.addGraphic(_1b);this._lineGraphicList.push(_1b);var len=this._vertexArr.length;this._preClick=true;if(this._isNew){this._vertexArr.push(new _d(_19.x,_19.y));this._addDistanceTip(_19,"起点");this._isNew=false;}else{this._vertexArr.splice(len-1,1,new _d(geo.x,geo.y));if(len>2){this._addDistanceTip(this._vertexArr[len-2],this._angleToTip(this._calculateAngle()));}}this.drawLayer.layerView.view.threeRender();},_addDistanceTip:function(geo,tip){var r=this.view.resolution;var _1c=new _c({text:tip,color:"#009688",size:12,offset:[-24,12]});var _1d=new _9({attribute:null,geometry:new _d(geo.x,geo.y)});var _1e=new _8({feature:_1d,symbol:_1c});this.drawLayer.addGraphic(_1e);this._lineGraphicList.push(_1e);},_calculateAngle:function(){var len=this._vertexArr.length;if(len<3){return 0;}var _1f=this._vertexArr[len-3];var _20=this._vertexArr[len-2];var _21=this._vertexArr[len-1];var _22=_1f.x-_20.x;var _23=_1f.y-_20.y;var _24=_21.x-_20.x;var _25=_21.y-_20.y;var dot=_22*_24+_23*_25;var det=_22*_25-_23*_24;var _26=Math.atan2(det,dot)/Math.PI*180;var _27=(_26+360)%360;var _28=_27<180?_27:360-_27;return _28;},_angleToTip:function(_29){var _2a=null;if(_29>0&&_29<180){_2a=_29.toFixed(2)+"度";}return _2a;},_onDoubleMouseClick:function(_2b){_2b.preventDefault();_2b.stopPropagation();this._currentGraphic.rg=this._lineGraphicList;var _2c=this._currentGraphic.id;this.showDeleButton(_2b,_2c);this.invalid();},_endDrawMethod:function(){this._lineGraphicHash[this._currentGraphic.id]=this._lineGraphicList;if(this._mouseMove!==null){this._mouseMove.remove();this._mouseMove=null;}this._vertexArr=[];this._isNew=!this._isNew;this._currentGraphic=null;this._lastPoint=null;this._lineGraphicList=null;},invalid:function(){if(!this.state){return;}this._endDrawMethod();this.state=false;this.view.panEnabled=true;this.view.selectEnabled=true;if(this._mouseClick!==null){this._mouseClick.remove();this._mouseClick=null;}if(this._dblMouseClick!==null){this._dblMouseClick.remove();this._dblMouseClick=null;}_3.remove(this.view.domNode,"draw-cursor-style");},showDeleButton:function(_2d,_2e){var _2f=this;var _30=_5.create("div",{className:"graphicClose",style:{width:"8px",height:"8px",position:"absolute",color:"red",border:"2px solid red",display:"block",cursor:"pointer",fontSize:"4px",margin:"0 auto",lineHeight:"8px",backgroundColor:"white"},innerHTML:"×"},document.body);on(_30,"click",function(e){var _31=_2f.drawLayer.graphics;var g;for(var i=0,ii=_31.length;i<ii;i++){g=_31[i];if(g.id===_2e){break;}}if(g){_2f.drawLayer.removeGraphic(g);var rg=g.rg;rg.forEach(function(_32){_2f.drawLayer.removeGraphic(_32);});_5.destroy(this);}});_30.style.left=_2d.clientX+5+"px";_30.style.top=_2d.clientY+5+"px";return _30;}});});