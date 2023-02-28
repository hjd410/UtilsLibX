//>>built
define("com/huayun/edit/tool/DrawTool","dojo/on ../../webgis/Graphic ../../webgis/Feature ../../webgis/geometry/Point ../../webgis/geometry/Polyline ../../webgis/geometry/Polygon".split(" "),function(g,d,e,f,h,k){function b(){this.aPath=[];this.aRing=[];this.mouseDbClickHandler=this.mouseClickHandler=this.mouseMoveHandler=this.view=this._currentEditLayer=null;this.ringFid=this.ringNextIndex=0}b.prototype.drawPoint=function(a){this._createFid(a.attributes);a=new d({feature:new e({attributes:a.attributes,
geometry:a.geometry}),symbol:a.symbol});this._currentEditLayer.addGraphic(a);this.view.threeRender()};b.prototype.drawLine=function(a){this.aPath.push(a.geometry);1===this.aPath.length&&this._createFid(a.attributes);var c=new h([this.aPath]);a=new d({feature:new e({attributes:a.attributes,geometry:c}),symbol:a.symbol});this.mouseMoveHandler=g(this.view.domNode,"mousemove",this._onMouseMoveHandler.bind(this,a,"line"))};b.prototype.drawPolygon=function(a){var c=a.geometry;0===this.aRing.length?this.aRing.push(c)&&
this.aRing.push(c):this.aRing.splice(this.aRing.length-2,1,c);this._createFid(a.attributes);this.ringNextIndex=this.aRing.length;c=new k([this.aRing]);a=new d({feature:new e({attributes:a.attributes,geometry:c}),symbol:a.symbol});this.mouseMoveHandler=g(this.view.domNode,"mousemove",this._onMouseMoveHandler.bind(this,a,"polygon"))};b.prototype.endDraw=function(){this.aPath.length=0;this.ringNextIndex=this.aRing.length=0;this.mouseMoveHandler.remove()};b.prototype.delete=function(a){this._currentEditLayer.removeGraphic(a);
this.view.threeRender()};b.prototype._onMouseMoveHandler=function(a,c,b){this._currentEditLayer.removeGraphic(a);b=this.view.screenToGeometry(b.clientX,b.clientY);"line"===c?this._moveDrawLine(a,b):"polygon"===c&&this._moveDrawPolygon(a,b)};b.prototype._moveDrawLine=function(a,c){1!==this.aPath.length&&this.aPath.pop();this.aPath[this.aPath.length]=c;this._currentEditLayer.addGraphic(a);this.view.threeRender()};b.prototype._moveDrawPolygon=function(a,c){this.aRing[this.ringNextIndex]=this.aRing[this.aRing.length-
1];this.aRing[this.ringNextIndex-1]=c;this._currentEditLayer.addGraphic(a);this.view.threeRender()};b.prototype._createFid=function(a){this.ringFid=this.ringFid||Math.round(500*Math.random());for(var c=0;c<a.length;c++){var b=a[c];if("fid"===b.name){b.value=this.ringFid;break}}};f={currentEditLayer:{configurable:!0}};f.currentEditLayer.set=function(a){this._currentEditLayer=a;this.view=this._currentEditLayer.layerView.graphicsLayerView.view};Object.defineProperties(b.prototype,f);return b});