//>>built
define("com/huayun/webgis/layers/3d/FlatGraphicSceneLayer",["dojo/_base/declare","dojo/topic","./TileSceneLayer","dojo/request","../../geometry/Extent","../../geometry/MapPoint","../../geometry/Point","../support/Tile","../../featureloader"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){return _1("com.huayun.webgis.layers.3d.FlatGraphicSceneLayer",[_3],{group:null,canvas:null,ctx:null,texture:null,map:null,styleObj:null,lastIndexArray:[],currentIndexArray:[],needRemovedArrayOfTielIndex:[],tileArray:[],needLoadIndex:[],loadPromise:null,name:"矢量底图",origin:null,size:256,url:null,tileInfo:null,_loader:null,movex:0,movey:0,configUrl:null,vectorCache:null,textWidthCache:null,layersBySourceLayer:{},labelPosCache:null,constructor:function(_a){_1.safeMixin(this,_a);this._loader=new _9();this.vectorCache={};this.textWidthCache={};this.labelPosCache=[];this.canvas=document.createElement("canvas");var _b=this.map.width,_c=this.map.height;this.canvas.width=_b;this.canvas.height=_c;this.ctx=this.canvas.getContext("2d");this.ctx.fillStyle="#EEEEEE";this.ctx.fillRect(0,0,_b,_c);this.group=new THREE.Group();var _d=new THREE.PlaneBufferGeometry(_b,_c);this.texture=new THREE.CanvasTexture(this.canvas);this.texture.generateMipmaps=false;this.texture.magFilter=THREE.NearestFilter;this.texture.minFilter=THREE.NearestFilter;if(this.map.is3D){this.texture.anisotropy=16;}else{this.texture.anisotropy=1;}var _e=new THREE.MeshBasicMaterial({map:this.texture,transparent:false});var _f=new THREE.Mesh(_d,_e);this.group.add(_f);this.group.visible=_a.visible;},pan:function(_10,_11,_12){this.group.position.x+=_10;this.group.position.y-=_11;this.movex+=_10;this.movey+=_11;if(_12){this.refresh();}},refresh:function(){var obj=this;if(this.visible&&this.map.extent){if(this.movex!=0||this.movey!=0){this.group.position.x-=this.movex;this.group.position.y+=this.movey;this.movex=0;this.movey=0;}if(this.url){this.origin=this.map.origin;this.size=this.map.size;this.readyData();}else{_4.get(this.configUrl,{handleAs:"json"}).then(function(_13){var _14=_13.sources.huayun.url;var _15=_13.layers;var _16={};for(var i=0;i<_15.length;i++){var _17=_15[i],_18=_17["source-layer"].toLowerCase();var _19={id:_17.id,type:_17.type,paint:_17.paint,layout:_17.layout,minzoom:_17.minzoom,maxzoom:_17.maxzoom};if(_17.filter){_19["filter"]=_17.filter;}if(!_16[_18]){_16[_18]=[];}_16[_18].push(_19);}obj.styleObj=_16;_4.get(_14,{handleAs:"json"}).then(function(_1a){var _1b=_1a.tiles;obj.url=_1b.substr(0,_1b.length-15);obj.size=_1a.tilesize;var o=_1a.tileInfo.originPoint;obj.origin=new _6(Number(o.x),Number(o.y));obj.readyData();});});}}},readyData:function(){this.computeIndex();this.removeTiles();this.fetchTiles();},computeIndex:function(){var _1c=(this.map.width-this.map.realWidth)/2,_1d=(this.map.height-this.map.realHeight)/2;var _1e=this.map.rotationAngela,cos=Math.abs(Math.cos(_1e/180*Math.PI)),sin=Math.abs(Math.sin(_1e/180*Math.PI));var _1f=Math.round(_1c*cos+_1d*sin),_20=Math.round(_1c*sin+_1d*cos);var _21=this.map.origin,_22=this.map.size,_23=this.map.extent,_24=this.map.resolution,_25=this.map.level,rs=_24*_22;var _26=Math.floor((_23.minx-_21.x)/rs),_27=Math.floor((_21.y-_23.maxy)/rs),_28=Math.ceil((_23.maxx-_21.x)/rs),_29=Math.ceil((_21.y-_23.miny)/rs);this.currentIndexArray=[];this.needLoadIndex=[];var _2a,i,j;this.startCol=_26;this.startRow=_27;this.endCol=_28;this.endRow=_29;for(i=_27;i<_29;i++){for(j=_26;j<_28;j++){if(i>=0&&j>=0){_2a=_25+"/"+j+"/"+i;this.currentIndexArray.push(_2a);}}}this.dx=(_23.minx-(_26*rs+_21.x))/_24-_1f;this.dy=((_21.y-_27*rs)-_23.maxy)/_24-_20;var _2b=false,_2c=false;var _2d=this.lastIndexArray.concat(this.currentIndexArray);for(i=0;i<_2d.length;i++){_2b=false;_2c=false;for(j=0;j<this.lastIndexArray.length;j++){if(_2d[i]==this.lastIndexArray[j]){_2b=true;break;}}for(j=0;j<this.currentIndexArray.length;j++){if(_2d[i]==this.currentIndexArray[j]){_2c=true;break;}}if(_2b&&!_2c){this.needRemovedArrayOfTielIndex.push(_2d[i]);}if(_2c&&!_2b){this.needLoadIndex.push(_2d[i]);}}this.lastIndexArray=this.currentIndexArray;},fetchTiles:function(){if(this.visible){var url=null,_2e,len=this.needLoadIndex.length;for(var id in this.vectorCache){var _2f=id.split("/");var _30=Number(_2f[1]);var _31=Number(_2f[2]);this.drawWholeTile(this.vectorCache[id],_30-this.startCol,_31-this.startRow,this.dx,this.dy);}for(var p=0;p<len;p++){_2e=this.needLoadIndex[p];url=this.url+_2e+".pbf";this._loader.loadFeaturesXhr(url,_2e,len,this.onload.bind(this),this.onError.bind(this));}}},removeTiles:function(){var _32;var _33=Math.pow(2,this.map.initLevel-this.map.level);this.group.scale.set(_33,_33,1);this.ctx.clearRect(0,0,this.map.width,this.map.height);this.ctx.fillStyle="#eeeeee";this.ctx.fillRect(0,0,this.map.width,this.map.height);this.texture.needsUpdate=true;for(var n=0;n<this.needRemovedArrayOfTielIndex.length;n++){_32=this.needRemovedArrayOfTielIndex[n];delete this.vectorCache[_32];}this.needRemovedArrayOfTielIndex=[];this.textWidthCache={};this.labelPosCache=[];},onload:function(_34,_35,_36){if(_34.length>0){var _37=Number(_35[1]);var _38=Number(_35[2]);var _39=[];for(var i=0,ii=_34.length;i<ii;i++){var _3a=_34[i].type_;if(_3a!=="Point"){var _3b=_34[i].properties_.layer;if(!_39.hasOwnProperty(_3b)){_39[_3b]=[];}_39[_3b].push(_34[i]);}else{}}this.vectorCache[_36]=_39;this.drawWholeTile(_39,_37-this.startCol,_38-this.startRow,this.dx,this.dy);}},drawWholeTile:function(_3c,_3d,_3e,ddx,ddy){var _3f=256;var dx=_3d*_3f-ddx+0.5;var dy=_3e*_3f-ddy+0.5;var _40,_41,_42,_43,_44;var _45;var _46=this.map.level;var _47={};for(var id in this.styleObj){_40=this.styleObj[id];_41=_3c[id];if(_41&&id!=="xzqh_district_area10k"&&id!=="water_area_256000scale_erase"&&id!=="country_area"){for(var i=0,ii=_40.length;i<ii;i++){_42=_40[i];if(("minzoom" in _42&&_46<_42.minzoom)||("maxzoom" in _42&&_46>_42.maxzoom)){continue;}var _48=_42.paint||{};var _49=_42.layout||{};if(_42.type=="fill"&&id!=="xzqh_district_area10k"){this.ctx.fillStyle="fill-color" in _48?_48["fill-color"]:"#FFFFFF";for(var j=0;j<_41.length;j++){this.ctx.beginPath();_43=_41[j].flatCoordinates_;var _4a=(_43[0]/16+dx)|0;var _4b=(_43[1]/16+dy)|0;this.ctx.moveTo(_4a,_4b);for(var k=2;k<_43.length;k=k+2){var _4c,_4d;_4c=(_43[k]/16+dx)|0;_4d=(_43[k+1]/16+dy)|0;this.ctx.lineTo(_4c,_4d);}this.ctx.fill();}}else{if(_42.type=="line"){this.ctx.strokeStyle="line-color" in _48?_48["line-color"]:"#FFFFFF";this.ctx.lineWidth=this._getValue(_42,"paint","line-width",_46)||1;this.ctx.lineCap=_49["line-cap"]||"butt";this.ctx.lineJoin=_49["line-join"]||"miter";this.ctx.setLineDash(_48["line-dasharray"]||[]);var _4e="line-offset" in _48?_48["line-offset"]:0;var _4f=_42["filter"];for(var j=0;j<_41.length;j++){if(_4f&&this.filterFeature(_4f,_41[j])){continue;}this.ctx.beginPath();_43=_41[j].flatCoordinates_;var _4a=(_43[0]/16+dx)|0;var _4b=(_43[1]/16+dy)|0;this.ctx.moveTo(_4a,_4b);for(var k=2;k<_43.length;k=k+2){var _4c,_4d;_4c=(_43[k]/16+dx+_4e)|0;_4d=(_43[k+1]/16+dy)|0;this.ctx.lineTo(_4c,_4d);}this.ctx.stroke();}}else{if(_42.type==="symbol"){var _4f=_42["filter"];for(var j=0;j<_41.length;j++){_45=_41[j];if(_4f&&this.filterFeature(_4f,_41[j])){continue;}if(_45.type_==="LineString"){var _50=_45.properties_.layer;if(!_47.hasOwnProperty(_50)){_47[_50]={style:_42,features:[]};}_47[_50].features.push(_45);}}}}}}}}for(var _50 in _47){var _41=_47[_50].features,_42=_47[_50].style;var _48=_42.paint||{};var _49=_42.layout||{};this.ctx.fillStyle=this._getValue(_42,"paint","text-color",_46)||"#000000";var _3f=this._getValue(_42,"layout","text-size",_46)||16,_51="text-font" in _49?_49["text-font"][0]:"Microsoft YaHei Regular";this.ctx.font=_3f+"px "+_51;var _52="text-field" in _49?_49["text-field"]:"{NAME}";_52=_52.substring(1,_52.length-1).toLowerCase();for(var j=_41.length-1;j>-1;j--){_45=_41[j];_44=_45["properties_"][_52];if(_44===""){continue;}var _53=this.lineStringLength(_45["flatCoordinates_"])/16;var _54=this.measureAndCacheTextWidth(_44);if(_54<=_53){var _55=(_53-_54)*0.5;var pos=this.drawTextOnPath(_45["flatCoordinates_"],_44,_55);pos.x=(pos.x/16+dx)|0;pos.y=(pos.y/16+dy)|0;if(this.needDraw(pos)){if(pos.angle>-Math.PI*0.75&&pos.angle<Math.PI*0.75){this.ctx.save();this.ctx.translate(pos.x,pos.y);this.ctx.rotate(pos.angle);this.ctx.fillText(_44,0,0);this.ctx.restore();this.labelPosCache.push({x:pos.x,y:pos.y});}else{this.ctx.fillText(_44,pos.x,pos.y);this.labelPosCache.push({x:pos.x,y:pos.y});}}}}}this.texture.needsUpdate=true;this.map.layerContainer.threeRender();},filterFeature:function(_56,_57){var _58=_56[0];var _59=true;switch(_58){case "all":for(var i=1;i<_56.length;i++){_59=_59&&this.allFilter(_56[i],_57);}break;case "any":for(var i=1;i<_56.length;i++){_59=_59&&this.anyFilter(_56[i],_57);}break;}return !_59;},anyFilter:function(_5a,_5b){var _5c=_5a[0],_5d=_5a[1].toLowerCase();switch(_5c){case "==":var _5e=_5b["properties_"][_5d];for(var j=2,jj=_5a.length;j<jj;j++){if(_5a[j]===_5e){return true;}}return false;}},allFilter:function(_5f,_60){var _61=_5f[0],_62=_5f[1].toLowerCase();switch(_61){case "in":var _63=_60["properties_"][_62];for(var j=2,jj=_5f.length;j<jj;j++){if(_5f[j]===_63){return true;}}return false;}},needDraw:function(pos){var _64;for(var i=0,ii=this.labelPosCache.length;i<ii;i++){_64=this.labelPosCache[i];if(Math.abs(_64.x-pos.x)<200&&Math.abs(_64.y-pos.y)<100){return false;}}return true;},lineStringLength:function(_65){var x1=_65[0],y1=_65[1],len=0;var x2,y2;for(var i=2,ii=_65.length;i<ii;i=i+2){x2=_65[i];y2=_65[i+1];len+=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));x1=x2;y1=y2;}return len;},measureAndCacheTextWidth:function(_66){if(_66 in this.textWidthCache){return this.textWidthCache[_66];}var _67=this.ctx.measureText(_66).width;this.textWidthCache[_66]=_67;return _67;},drawTextOnPath:function(_68,_69,_6a){var x1=_68[0],y1=_68[1],len=0;var x2,y2;for(var i=2,ii=_68.length;i<ii;i=i+2){x2=_68[i];y2=_68[i+1];len+=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));if(len>_6a){var _6b=Math.atan2(y2-y1,x2-x1);return {x:x1,y:y1,angle:_6b};}x1=x2;y1=y2;}return {x:x2,y:y2};},styleFun:function(_6c,_6d){var _6e=_6c.properties_,_6f=this.layersBySourceLayer[_6e.layer];for(var i=0,ii=_6f.length;i<ii;i++){var _70=_6f[i];}},onError:function(){},drawFeature:function(){},drawWholeTile2:function(_71,_72,_73,ddx,ddy){var _74=256;var _75=this.map.level;var dx=_72*_74-ddx;var dy=_73*_74-ddy;for(var i=0,ii=_71.length;i<ii;i++){var _76=_71[i];var _77=_76.properties_;var _78=this.layersBySourceLayer[_77.layer];if(!_78){continue;}for(var j=0,jj=_78.length;j<jj;j++){var _79=_78[j],_7a=_79.layer;if(("minzoom" in _7a&&_75<_7a.minzoom)||("maxzoom" in _7a&&_75>=_7a.maxzoom)){continue;}var _7b,_7c,_7d,_7e,_7f,_80;var _81=_7a.layout||{};var _82=_7a.paint||{};if(_7a.type==="fill"){_7b="fill-color" in _82?_82["fill-color"]:"#FFFFFF";this.ctx.fillStyle=_7b;this._drawPolygon(_76.flatCoordinates_,dx,dy);}if(_7a.type==="line"){_7b="line-color" in _82?_82["line-color"]:"#FFFFFF";this.ctx.strokeStyle=_7b;this.ctx.lineWidth=this._getValue(_7a,"paint","line-width",_75)||1;this.ctx.lineCap=_81["line-cap"]||"butt";this.ctx.lineJoin=_81["line-join"]||"miter";this.ctx.setLineDash(_82["line-dasharray"]||[]);this._drawLine(_76.flatCoordinates_,dx,dy);}}}this.texture.needsUpdate=true;this.map.layerContainer.threeRender();},_getValue:function(_83,_84,_85,_86){var _87=_83[_84][_85].stops;if(_87){for(var l=0,ll=_87.length;l<ll;l++){if(_86<=_87[l][0]){return _87[l][1];}}return _87[ll-1][1];}else{return _83[_84][_85];}},_drawLine:function(_88,dx,dy){this.ctx.beginPath();this.ctx.moveTo(_88[0]/16+dx,_88[1]/16+dy);for(var j=2,jj=_88.length;j<jj;j=j+2){this.ctx.lineTo(_88[j]/16+dx,_88[j+1]/16+dy);}this.ctx.stroke();},_drawPolygon:function(_89,dx,dy){this.ctx.beginPath();this.ctx.moveTo(_89[0]/16+dx,_89[1]/16+dy);for(var j=2,jj=_89.length;j<jj;j=j+2){this.ctx.lineTo(_89[j]/16+dx,_89[j+1]/16+dy);}this.ctx.fill();},startRender:function(){},setVisible:function(_8a){this.visible=_8a;this.group.visible=_8a;if(_8a){this.refresh();this.map.layerContainer.threeRender();}else{this.map.layerContainer.threeRender();}}});});