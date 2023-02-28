//>>built
define("com/huayun/webgis/action/select/CircleSelected",["dojo/_base/declare","dojo/on","dojo/topic","../../geometry/Extent","../../geometry/Circle","../../Graphic","../../Feature","../../symbols/CircleSymbol","../ActiveMapAction"],function(_1,on,_2,_3,_4,_5,_6,_7,_8){return _1("com.huayun.webgis.action.select.CircleSelected",[_8],{constructor:function(_9){this.view=_9.view;this.isActive=true;this.drawLayer=this.view.map.findLayerById("drawLayer");this._mouseDown=null;this._mouseUp=null;this._mouseMove=null;this.cachePoint=[];this.state=false;this.flag=false;this._centerPoint=null;this._circleRadius=0;this.view.selectEnabled=true;this._currentGraphic=null;this._feature=null;this._geometry=null;this._symbol=null;},active:function(){if(!this.state){this.state=true;this.view.selectEnabled=true;this._mouseDown=on(this.view.domNode,"mousedown",this._onMouseDown.bind(this));}},_onMouseDown:function(_a){_a.preventDefault();_a.stopPropagation();this.view.panEnabled=false;this._centerPoint=this.view.screenToGeometry(_a.x,_a.y);this._symbol=new _7({color:255,opacity:0.2});this._geometry=new _4();this._geometry.setCenter(this._centerPoint);this._feature=new _6({attribute:null,geometry:this._geometry});this._currentGraphic=new _5({feature:this._feature,symbol:this._symbol});this.drawLayer.addGraphic(this._currentGraphic);this.doAction();},_onMouseMove:function(_b){if(!this._mouseUp){this._mouseUp=on(document,"mouseup",this._onMouseUp.bind(this));}this._drawCircle(_b.x,_b.y);},invalid:function(){this.state=false;this.view.panEnabled=true;this.view.selectEnabled=true;if(this._mouseDown){this._mouseDown.remove();this._mouseDown=null;}if(this._mouseMove){this._mouseMove.remove();this._mouseMove=null;}this._endDrawMethod();this.endActionMethod.call();},_onMouseUp:function(_c){if(_c.button===0){if(this._mouseMove){this._mouseMove.remove();this._mouseMove=null;}this._currentGraphic.clear();}},doAction:function(){if(!this._mouseMove){this._mouseMove=on(this.view.domNode,"mousemove",this._onMouseMove.bind(this));}},_drawCircle:function(x,y){var _d=this.view.screenToGeometry(x,y);var _e=Math.abs(_d.x-this._centerPoint.x),_f=Math.abs(_d.y-this._centerPoint.y),r2=_e*_e+_f*_f,r=Math.sqrt(r2);this._geometry.setRadius(r);this._currentGraphic.refresh();},_endDrawMethod:function(){if(this._mouseUp){this._mouseUp.remove();this._mouseUp=null;}this._centerPoint=null;}});});