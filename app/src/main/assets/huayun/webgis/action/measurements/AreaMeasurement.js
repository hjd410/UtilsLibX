//>>built
define("com/huayun/webgis/action/measurements/AreaMeasurement",["dojo/_base/declare","dojo/on","dojo/topic","dojo/dom-class","dojo/dom-construct","../../geometry/Polygon","../../Graphic","../../Feature","../../geometry/Point2D","../../symbols/PolygonSymbol","../../symbols/PointSymbol","../../symbols/TextSymbol","../ActiveMapAction"],function(_1,on,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c){return _1("com.huayun.webgis.action.measurements.AreaMeasurement",[_c],{constructor:function(_d){this.view=_d.view;this.view.selectEnabled=false;this.isActive=true;this.drawLayer=this.view.map.findLayerById("drawLayer");this._mouseClick=null;this._dblMouseClick=null;this._mouseClickMove=null;this._lastPoint=null;this._vertexArr=[];this._polygonList=[];this._symbol=new _9({color:"#8F8FFF",opacity:0.5});this._vertexSymbol=new _a({radius:5,color:"#0000FF"});this._currentGraphic=null;this._lineGraphicList=[];this._lineGraphicHash={};var _e=this;_2.subscribe("measurement-delete",function(id){var _f=_e._lineGraphicHash[id];if(_f&&_f.length>0){_f.forEach(function(_10){_e.drawLayer.removeGraphic(_10);});}});},active:function(){if(!this.state){this.state=true;this.view.panEnabled=false;this.view.selectEnabled=false;this._mouseClick=on(this.view.container,"click",this._onMouseClick.bind(this));this._dblMouseClick=on(this.view.container,"dblclick",this._onDoubleMouseClick.bind(this));_3.add(this.view.domNode,"draw-cursor-style");}},_onMouseClick:function(_11){_11.preventDefault();_11.stopPropagation();var geo=this.view.screenToGeometry(_11.x,_11.y);if(!this._mouseMove){this._mouseMove=on(this.view.domNode,"mousemove",this._onMouseMove.bind(this));}if(this._lastPoint===null){this._lineGraphicList=[];this.doAction(geo);}else{if(_11.x!==this._lastPoint.x&&_11.y!==this._lastPoint.y){this.doAction(geo);}}this._lastPoint={x:_11.x,y:_11.y};},_onMouseMove:function(e){var geo=this.view.screenToGeometry(e.x,e.y);this.drawLayer.removeGraphic(this._currentGraphic);var _12=new _5();var _13=new _7({attribute:null,geometry:_12});var _14=new _6({feature:_13,symbol:this._symbol});if(this._preClick){this._vertexArr.push(new _8(geo.x,geo.y));this._preClick=false;}else{this._vertexArr.splice(this._vertexArr.length-1,1,new _8(geo.x,geo.y));}_12.setPath([this._vertexArr]);this._currentGraphic=_14;this.drawLayer.addGraphic(_14);this.drawLayer.layerView.view.threeRender();},_onDoubleMouseClick:function(_15){_15.preventDefault();_15.stopPropagation();this._currentGraphic.rg=this._lineGraphicList;var _16=this._currentGraphic.id;this.showDeleButton(_15,_16);this.invalid();},showDeleButton:function(_17,_18){var _19=this;var _1a=_4.create("div",{className:"graphicClose",style:{width:"8px",height:"8px",position:"absolute",color:"red",border:"2px solid red",display:"block",cursor:"pointer",textAlign:"center",fontSize:"4px",margin:"0 auto",lineHeight:"5px",backgroundColor:"white"},innerHTML:"×"},document.body);on(_1a,"click",function(e){var _1b=_19.drawLayer.graphics;var g;for(var i=0,ii=_1b.length;i<ii;i++){g=_1b[i];if(g.id===_18){break;}}if(g){_19.drawLayer.removeGraphic(g);var rg=g.rg;rg.forEach(function(_1c){_19.drawLayer.removeGraphic(_1c);});_4.destroy(this);}});_1a.style.left=_17.clientX+5+"px";_1a.style.top=_17.clientY+5+"px";return _1a;},invalid:function(){if(!this.state){return;}this._endDrawMethod();this.state=false;this.view.panEnabled=true;this.view.selectEnabled=true;if(this._mouseClick!==null){this._mouseClick.remove();this._mouseClick=null;}if(this._dblMouseClick!==null){this._dblMouseClick.remove();this._dblMouseClick=null;}_3.remove(this.view.domNode,"draw-cursor-style");},doAction:function(_1d){this._drawDotMark(_1d);},_drawDotMark:function(geo){var _1e=new _8(geo.x,geo.y);var _1f=new _7({attribute:null,geometry:_1e});var _20=new _6({feature:_1f,symbol:this._vertexSymbol});this.drawLayer.addGraphic(_20);this._lineGraphicList.push(_20);var len=this._vertexArr.length;this._preClick=true;if(len<3){this._vertexArr.push(new _8(_1e.x,_1e.y));}else{this._vertexArr.splice(this._vertexArr.length-1,1,new _8(geo.x,geo.y));}this.drawLayer.layerView.view.threeRender();},_addDistanceTip:function(geo,tip){var _21=new _b({text:tip,color:"#000000",size:12});var _22=new _7({attribute:null,geometry:new _8(geo.x,geo.y)});var _23=new _6({feature:_22,symbol:_21});this.drawLayer.addGraphic(_23);this._lineGraphicList.push(_23);},_endDrawMethod:function(){var _24=this._calculateGravityMethod();this._addDistanceTip(_24,this._calculateArea());this.drawLayer.layerView.view.threeRender();this._lineGraphicHash[this._currentGraphic.id]=this._lineGraphicList;if(this._mouseClickMove!==null){this._mouseClickMove.remove();this._mouseClickMove=null;}this._vertexArr=[];this._currentGraphic=null;this._lastPoint=null;this._lineGraphicList=null;},_calculateGravityMethod:function(){var _25=this._vertexArr,len=this._vertexArr.length;if(len<3){return _25[0];}var _26=0;var _27=0;var cx=0,cy=0;for(var i=0;i<_25.length-1;i++){var _28=_25[i];var _29=_25[i+1];_26=_28.x*_29.y-_28.y*_29.x;_27+=_26;cx+=_26*(_28.x+_29.x);cy+=_26*(_28.y+_29.y);}var _2a=_25[len-1];var _2b=_25[0];_26=_2a.x*_2b.y-_2a.y*_2b.x;_27+=_26;cx+=_26*(_2a.x+_2b.x);cy+=_26*(_2a.y+_2b.y);_27=_27/2;cx=cx/(6*_27);cy=cy/(6*_27);return {x:cx,y:cy,z:0};},_calculateArea:function(){var _2c=this._vertexArr.length;if(_2c<3){return 0;}var sum=this._vertexArr[0].y*(this._vertexArr[_2c-1].x-this._vertexArr[1].x);for(var i=1;i<_2c;++i){sum+=this._vertexArr[i].y*(this._vertexArr[i-1].x-this._vertexArr[(i+1)%_2c].x);}return Math.abs(sum/(2*1000*1000)).toFixed(5)+"km²";}});});