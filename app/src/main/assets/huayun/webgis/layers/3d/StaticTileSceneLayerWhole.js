//>>built
define("com/huayun/webgis/layers/3d/StaticTileSceneLayerWhole","dojo/_base/declare dojo/topic ./TileSceneLayer ../../request ../../geometry/Extent ../../geometry/MapPoint ../../geometry/Point ../support/Tile ../support/LOD ../support/TileInfo ../../../facades/TileInfoFacade".split(" "),function(p,q,u,v,B,w,C,x,y,z,A){return p("com.huayun.webgis.layers.3d.StaticTileSceneLayerWhole",[u],{lastIndexArray:[],currentIndexArray:[],needRemovedArrayOfTielIndex:[],tileArray:{},needLoadIndex:[],useCacheIndex:[],
loadPromise:null,group:null,canvas:null,ctx:null,texture:null,name:"\u9759\u6001\u5e95\u56fe",onlyRefresh:!1,_tileInfoFacade:null,scaleCount:1,movex:0,movey:0,constructor:function(a){p.safeMixin(this,a);this.loadPromise={};this.lastIndexArray=[];this.currentIndexArray=[];this.needRemovedArrayOfTielIndex=[];this.tileArray=[];this.needLoadIndex=[];this.useCacheIndex=[];this._tileInfoFacade=new A;this._getTileInfo();a=this.map.width;var b=this.map.height;this.canvas=document.createElement("canvas");
this.canvas.width=a;this.canvas.height=b;this.ctx=this.canvas.getContext("2d");this.ctx.imageSmoothingEnabled=!1;this.group=new THREE.Group;a=new THREE.PlaneBufferGeometry(a,b);this.texture=new THREE.CanvasTexture(this.canvas);this.texture.magFilter=THREE.NearestFilter;this.texture.minFilter=THREE.NearestFilter;this.texture.anisotropy=this.map.is3D?16:1;b=new THREE.MeshBasicMaterial({map:this.texture,transparent:!0,opacity:this.opacity});this.plane=new THREE.Mesh(a,b);this.plane.position.set(0,0,
0);this.plane.renderOrder=1;this.group.add(this.plane);this.group.visible=this.visible;q.subscribe("mapTypeChange",function(a){this.setTileUrl(a)}.bind(this))},resize:function(){this.plane.geometry.dispose();this.plane.material.dispose();this.texture.dispose();this.group.remove(this.plane);var a=this.map.width,b=this.map.height;this.canvas=document.createElement("canvas");this.canvas.width=a;this.canvas.height=b;this.ctx=this.canvas.getContext("2d");this.ctx.imageSmoothingEnabled=!1;a=new THREE.PlaneBufferGeometry(a,
b);this.texture=new THREE.CanvasTexture(this.canvas);this.texture.magFilter=THREE.NearestFilter;this.texture.minFilter=THREE.NearestFilter;b=new THREE.MeshBasicMaterial({map:this.texture});this.plane=new THREE.Mesh(a,b);this.group.add(this.plane);this.refresh()},_getTileInfo:function(){var a=/^\/[^/]*/.exec(location.pathname)[0]+"/config/tileInfoData.json";this._tileInfoFacade.getTileInfoData(a,function(a){for(var b=a.origin,c=a.size,b=new w(b[0],b[1]),d=[],g=0;g<a.lods.length;g++){var f=a.lods[g],
f=new y({level:f.level,scale:f.scale,resolution:f.resolution});d.push(f)}this.tileInfo=new z({lods:d,origin:b,size:c});q.publish("tileInfoComplete")}.bind(this),function(a){}.bind(this))},getResolution:function(a){return this.tileInfo.lods[a].resolution},pan:function(a,b,e){this.group.position.x+=a;this.group.position.y-=b;this.movex+=a;this.movey+=b;e&&this.refresh()},refresh:function(){this.onlyRefresh=!1;this.readyData();this.startRender()},readyData:function(){this.visible&&(this.onlyRefresh||
(this.loadPromise={},this.computeIndex()),this.fetchTiles(),this.removeTiles())},computeIndex:function(){var a=(this.map.width-this.map.realWidth)/2,b=(this.map.height-this.map.realHeight)/2,e=this.map.rotationAngela,c=Math.abs(Math.cos(e/180*Math.PI)),d=Math.abs(Math.sin(e/180*Math.PI)),e=Math.round(a*c+b*d),c=Math.round(a*d+b*c);this.currentIndexArray=[];this.needLoadIndex=[];this.needRemovedArrayOfTielIndex=[];var d=this.map.origin,g=this.map.size,f=this.map.extent,h=this.map.resolution,a=h*g,
m=this.map.level,k=Math.floor((f.minx-d.x)/a),l=Math.floor((d.y-f.maxy)/a),r=Math.ceil((f.maxx-d.x)/a),t=Math.ceil((d.y-f.miny)/a);this.startCol=k;this.endCol=r;this.startRow=l;this.endRow=t;for(var n,a=l;a<t;a++)for(b=k;b<r;b++)n=m+"/"+b+"/"+a,this.tileArray.hasOwnProperty(n)||(this.tileArray[n]=new x(null,null,null,b,a)),this.currentIndexArray.push(n);a=d.y-l*h*g;this.offSetX=(k*h*g+d.x-f.minx)/h+e;this.offSetY=(f.maxy-a)/h+c;c=e=!1;d=this.lastIndexArray.concat(this.currentIndexArray);for(a=0;a<
d.length;a++){c=e=!1;for(b=0;b<this.lastIndexArray.length;b++)if(d[a]==this.lastIndexArray[b]){e=!0;break}for(b=0;b<this.currentIndexArray.length;b++)if(d[a]==this.currentIndexArray[b]){c=!0;break}e&&!c&&this.needRemovedArrayOfTielIndex.push(d[a]);c&&!e&&this.needLoadIndex.push(d[a]);c&&e&&this.useCacheIndex.push(d[a])}this.lastIndexArray=this.currentIndexArray},fetchTiles:function(){var a=this.url;this.needLoadIndex.forEach(function(b){this.loadPromise[b]=v(a+b,{responseType:"image",allowImageDataAccess:!1})}.bind(this))},
removeTiles:function(){for(var a,b=this.needRemovedArrayOfTielIndex.length-1;-1<b;b--)a=this.needRemovedArrayOfTielIndex[b],delete this.tileArray[a];this.needRemovedArrayOfTielIndex=[]},render:function(){this.ctx.restore();var a=this.map.width,b=this.map.height,e=null,c=this,d,g=this.currentIndexArray.length,f=Math.pow(2,c.map.initLevel-c.map.level);c.group.scale.set(f,f,1);this.ctx.clearRect(0,0,a,b);c.texture.needsUpdate=!0;c.map.layerContainer.threeRender();c.ctx.save();var f=Math.PI*c.map.rotationAngela/
180,h=Math.abs(Math.sin(f)),m=Math.abs(Math.cos(f)),a=a/2,b=b/2;c.group.rotateZ(Math.PI*this.deltaAngela/180);c.ctx.translate(a,b);c.ctx.rotate(f);c.ctx.translate(-a*m-b*h,-b*m-a*h);c.group.position.x-=c.movex;c.group.position.y+=c.movey;c.movex=0;var k=c.movey=0;c.deltaAngela=0;for(var l in this.tileArray)e=this.tileArray[l],e.image&&(k++,this.ctx.drawImage(e.image,c.offSetX+256*(e.x-c.startCol)+.5|1,c.offSetY+256*(e.y-c.startRow)+.5|1,257,257));this.needLoadIndex.forEach(function(a){c.loadPromise[a].then(function(b){c.tileArray.hasOwnProperty(a)&&
(e=c.tileArray[a],k++,d=b.data,e.image=d,c.ctx.drawImage(d,c.offSetX+256*(e.x-c.startCol)+.5|0,c.offSetY+256*(e.y-c.startRow)+.5|0,257,257),0==k%5||k==g)&&(c.texture.needsUpdate=!0,c.map.layerContainer.threeRender())},function(a){})});c.texture.needsUpdate=!0;c.map.layerContainer.threeRender()},startRender:function(){this.visible&&this.render()},setTileUrl:function(a){if(this.url!==a){this.loadPromise={};this.url=a;this.onlyRefresh=!0;this.needLoadIndex=this.currentIndexArray;for(var b in this.tileArray)this.tileArray[b].image=
null;this.readyData();this.onlyRefresh=!1;this.startRender()}},setVisible:function(a){this.visible=a;(this.group.visible=a)?this.refresh():this.map.layerContainer.threeRender()},setOpacity:function(a){this.opacity=a;this.plane.material.opacity=a;this.map.layerContainer.threeRender()}})});