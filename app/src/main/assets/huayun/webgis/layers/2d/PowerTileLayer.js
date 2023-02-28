//>>built
define("com/huayun/webgis/layers/2d/PowerTileLayer",["dojo/_base/declare","dojo/topic","./FlatLayer","../../geometry/Extent","../../geometry/MapPoint","../../geometry/Point","../../request","dojo/dom-style","dojo/dom","dojo/when"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a){return _1("com.huayun.webgis.layers.2d.PowerTileLayer",[_3],{url:null,image:null,nowextent:null,ctx:null,loadPromise:null,constructor:function(_b){this.url=_b.url;this.id=_b.id;this.visible=_b.visible?_b.visible:true;this.map=_b.map;this.oldcanvas=document.createElement("canvas");this.oldcanvas.width=this.map.width;this.oldcanvas.height=this.map.height;this.oldctx=this.oldcanvas.getContext("2d");this.oldctx.imageSmoothingEnabled=false;var _c=this;_2.subscribe("stopPan",function(){_c.load();});_2.subscribe("mapPan",function(_d,_e){_c.refresh(_d,_e);});_2.subscribe("resizeEnd",function(){_c.load();});},postCreate:function(){this.inherited(arguments);this.ctx=this.canvasNode.getContext("2d");this.ctx.imageSmoothingEnabled=false;},refresh:function(_f,_10){_8.set(this.domNode,"left",this.map.moveX+"px");_8.set(this.domNode,"top",this.map.moveY+"px");this.ctx.translate(_f,_10);},load:function(){this.fetch();this.render();},fetch:function(){var _11=this.map.extent,_12=this.map.width,_13=this.map.height,url=this.url+"&bbox="+_11.minx+","+_11.miny+","+_11.maxx+","+_11.maxy+"&size="+_12+","+_13+"&access_token=20b006ac-917d-49e6-a71e-99d2e2dbfe10";this.loadPromise=this.fetchTile(url);},render:function(){var ctx=this.ctx,_14=this.canvasNode,obj=this,map=this.map,_15=map.moveX,_16=map.moveY,_17=map.zoomCount,_18=map.width,_19=map.height;this.nowextent=map.extent;(function(_1a,_1b,_1c){obj.loadPromise.then(function(_1d){var _1e=_1d.data;if(obj.map.zoomCount===_1a&&_1b==obj.map.moveX&&_1c==obj.map.moveY){obj.image=_1e;_14.width=_18;_14.height=_19;_8.set(obj.domNode,"left","0px");_8.set(obj.domNode,"top","0px");obj.map.moveX=0;obj.map.moveY=0;ctx.drawImage(_1e,0,0,_18,_19);obj.oldctx.clearRect(0,0,_18,_19);obj.oldctx.drawImage(_1e,0,0,_18,_19);obj.map.zoomCount=0;}});})(_17,_15,_16);},fetchTile:function(url){return _7(url,{responseType:"image",allowImageDataAccess:false});},zoomStart:function(){this.ctx.save();this.fetch();},zoomIn:function(x,y){this.ctx.clearRect(0,0,this.map.width,this.map.height);this.ctx.translate(-x*0.148698,-y*0.148698);this.ctx.scale(1.148698,1.148698);this.ctx.drawImage(this.oldcanvas,0,0);},zoomEnd:function(){this.oldctx.clearRect(0,0,this.map.width,this.map.height);this.oldctx.drawImage(this.canvasNode,0,0);this.ctx.restore();this.render();},zoomOut:function(x,y){this.ctx.clearRect(0,0,this.map.width,this.map.height);this.ctx.translate(x*0.12945,y*0.12945);this.ctx.scale(0.87055,0.87055);this.ctx.drawImage(this.oldcanvas,0,0);},rotateStart:function(){},rotate:function(){}});});