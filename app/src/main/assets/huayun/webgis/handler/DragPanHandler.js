//>>built
define("com/huayun/webgis/handler/DragPanHandler",["../geometry/Point","../utils/utils"],function(f,e){function c(a,b){b=b||{};this.view=a;this._state=d.disabled;this.clickTolerance=b.clickTolerance||2}var d={active:4,enabled:2,pending:1,disabled:0};e.bezier(0,0,.3,1);c.prototype.isEnabled=function(){return this._state!==c.disabled};c.prototype.enable=function(){this.isEnabled()||(this._state=d.enabled)};c.prototype.onMouseDown=function(a){this._state===d.enabled&&(window.document.addEventListener("mousemove",
this._onMove,!0),window.document.addEventListener("mouseup",this._onMouseUp))};c.prototype._start=function(a){window.addEventListener("blur",this._onBlur);this._state=d.pending;this._startPos=this._mouseDownPos=this._prevPos=this._lastPos=new f(a.clientX-this.view._offsetLeft,a.clientY-this.view._offsetTop);this._inertia=[[e.now(),this._startPos]]};c.prototype._onMove=function(a){a.preventDefault();var b=new f(a.clientX-this.view._offsetLeft,a.clientY-this.view._offsetTop);this._lastPos.equals(b)||
this._state===d.pending&&b.dist(this._mouseDownPos)<this.clickTolerance||(this._lastMoveEvent=a,this._lastPos=b,this._drainInertiaBuffer(),this._inertia.push([e.now(),this._lastPos]),this._state===d.pending&&(this._state=d.active))};c.prototype._onDragFrame=function(){};c.prototype._drainInertiaBuffer=function(){for(var a=this._inertia,b=e.now();0<a.length&&160<b-a[0][0];)a.shift()};c.prototype._onMouseUp=function(a){if(0===a.button)switch(this._state){case d.active:this._state=d.enabled;this._unbind();
this._deactivate();this._inertiaPan(a);break;case d.pending:this._state=d.enabled,this._unbind()}};c.prototype._onBlur=function(a){};c.prototype._unbind=function(){window.removeEventListener("mousemove",this._onMove,!0);window.removeEventListener("mouseup",this._onMouseUp);window.removeEventListener("blur",this._onBlur)};c.prototype._deactivate=function(){};c.prototype._inertiaPan=function(a){this._drainInertiaBuffer();var b=this._inertia;if(!(2>b.length)){a=b[b.length-1];var b=b[0],c=a[1].sub(b[1]),
d=(a[0]-b[0])/1E3;0===d||a[1].equals(b[1])||(a=c.mult(.3/d),b=a.mag(),1400<b&&(b=1400,a._unit()._mult(b)),a.mult(-(b/750)/2))}};return c});