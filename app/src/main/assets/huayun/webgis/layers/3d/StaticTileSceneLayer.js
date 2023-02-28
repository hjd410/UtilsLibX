//>>built
define("com/huayun/webgis/layers/3d/StaticTileSceneLayer","dojo/_base/declare dojo/topic ./TileSceneLayer ../../request ../../geometry/Extent ../../geometry/MapPoint ../../geometry/Point ../support/Tile ../support/LOD ../support/TileInfo ../../../facades/TileInfoFacade".split(" "),function(h,k,l,t,u,m,v,n,p,q,r){return h("com.huayun.webgis.layers.3d.StaticTileSceneLayer",[l],{lastIndexArray:[],currentIndexArray:[],needRemovedArrayOfTielIndex:[],tileArray:{},needLoadIndex:[],loadPromise:null,group:null,
textureloader:null,geometry:null,meshMap:null,name:"\u9759\u6001\u5e95\u56fe",onlyRefresh:!1,_tileInfoFacade:null,scaleCount:1,constructor:function(a){h.safeMixin(this,a);this.loadPromise={};this.meshMap={};this._tileInfoFacade=new r;this._getTileInfo();this.group=new THREE.Group;this.textureloader=(new THREE.TextureLoader).setCrossOrigin("*");this.geometry=new THREE.PlaneBufferGeometry(256,256);this.group.visible=this.visible;k.subscribe("mapTypeChange",function(a){this.setTileUrl(a)}.bind(this))},
_getTileInfo:function(){var a=/^\/[^/]*/.exec(location.pathname)[0]+"/config/tileInfoData.json";this._tileInfoFacade.getTileInfoData(a,function(a){for(var c=a.origin,f=a.size,c=new m(c[0],c[1]),e=[],b=0;b<a.lods.length;b++){var d=a.lods[b],d=new p({level:d.level,scale:d.scale,resolution:d.resolution});e.push(d)}this.tileInfo=new q({lods:e,origin:c,size:f});k.publish("tileInfoComplete")}.bind(this),function(a){}.bind(this))},getResolution:function(a){return this.tileInfo.lods[a].resolution},pan:function(a,
c,g){this.group.position.x+=a;this.group.position.y-=c;g&&this.refresh()},refresh:function(){this.onlyRefresh=!1;this.readyData();this.startRender()},readyData:function(){this.visible&&(this.onlyRefresh||this.computeIndex(),this.fetchTiles())},computeIndex:function(){this.currentIndexArray=[];this.needLoadIndex=[];this.needRemovedArrayOfTielIndex=[];var a=this.map.origin,c=this.map.extent,g=this.map.resolution*this.map.size,f=this.map.level,e=Math.floor((c.minx-a.x)/g)+1,b=Math.floor((a.y-c.maxy)/
g),d=Math.ceil((c.maxx-a.x)/g)-1,c=Math.ceil((a.y-c.miny)/g)-1;this.startCol=e;this.startRow=b;this.endCol=d;for(this.endRow=c;b<c;b++)for(a=e;a<d;a++)0<=b&&0<=a&&(g=f+"/"+a+"/"+b,this.tileArray[g]=new n(null,null,null,a,b),this.currentIndexArray.push(g));e=f=!1;d=this.lastIndexArray.concat(this.currentIndexArray);for(b=0;b<d.length;b++){e=f=!1;for(a=0;a<this.lastIndexArray.length;a++)if(d[b]==this.lastIndexArray[a]){f=!0;break}for(a=0;a<this.currentIndexArray.length;a++)if(d[b]==this.currentIndexArray[a]){e=
!0;break}f&&!e&&this.needRemovedArrayOfTielIndex.push(d[b]);e&&!f&&this.needLoadIndex.push(d[b])}this.lastIndexArray=this.currentIndexArray},fetchTiles:function(){var a=this.url;this.needLoadIndex.forEach(function(c){this.loadPromise[c]=new Promise(function(g,f){this.textureloader.load(a+c,g,void 0,f)}.bind(this))}.bind(this))},removeTiles:function(){for(var a,c=this.needRemovedArrayOfTielIndex.length-1;-1<c;c--)a=this.needRemovedArrayOfTielIndex[c],delete this.tileArray[a],this.group.remove(this.meshMap[a]);
this.needRemovedArrayOfTielIndex=[]},render:function(){var a=this;this.onlyRefresh||this.removeTiles();if(this.onlyRefresh)this.currentIndexArray.forEach(function(c){a.loadPromise[c].then(function(b){b=new THREE.MeshBasicMaterial({map:b});a.meshMap[c].material=b;a.onlyRefresh=!1},function(b){b=new THREE.MeshBasicMaterial({color:13426943});a.meshMap[c].material=b;a.onlyRefresh=!1})});else{var c=this.tileInfo.size,g=null,f=null,e=this.tileInfo.origin,b=this.map.resolution,d=null,h=this.map.oldcenter,
k=(e.x-h.x)/b+c/2,l=(e.y-h.y)/b-c/2;this.needLoadIndex.forEach(function(b){a.loadPromise[b].then(function(e){a.tileArray.hasOwnProperty(b)&&(d=a.tileArray[b],e.magFilter=THREE.NearestFilter,e.minFilter=THREE.NearestFilter,g=new THREE.MeshBasicMaterial({map:e,transparent:!0,opacity:1}),f=new THREE.Mesh(a.geometry,g),f.position.set(d.x*c+k,l-d.y*c,0),a.meshMap[b]=f,a.group.add(f),f.renderOrder=0,a.map.layerContainer.threeRender(),a.onlyRefresh=!1)},function(a){})})}},startRender:function(){if(this.visible){var a=
Math.pow(2,this.map.initLevel-this.map.level);this.scaleCount!=a&&(this.group.scale.set(a,a,1),this.scaleCount=a);this.render()}},setTileUrl:function(a){this.loadPromise={};this.url=a;this.onlyRefresh=!0;this.needLoadIndex=this.currentIndexArray;this.readyData();this.startRender()},setVisible:function(a){this.visible=a;(this.group.visible=a)&&this.refresh()}})});