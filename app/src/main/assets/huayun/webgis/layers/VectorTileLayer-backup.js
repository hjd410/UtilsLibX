//>>built
define("com/huayun/webgis/layers/VectorTileLayer-backup",["dojo/_base/declare","dojo/topic","dojo/request","../request","./Layer","../geometry/Extent","../views/3d/layers/VectorTileLayerView3D","../geometry/Point","../geometry/Point2D","./support/LOD","./support/TileInfo","../utils/image","../utils/utils","../utils/Constant","com/huayun/webgis/gl/ImageManager","com/huayun/webgis/gl/ImageAtlas","./support/SourceCache","./support/StyleLayer","com/huayun/webgis/work/Dispatcher","com/huayun/webgis/gl/GlyphManager"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e,_f,_10,_11,_12,_13,_14){return _1("com.huayun.webgis.layers.VectorTileLayer",[_5],{url:null,tileInfo:null,type:"VectorTileLayer",name:"矢量底图",spatialReference:null,layerView:null,constructor:function(_15){_1.safeMixin(this,_15);this.imageManager=new _f();this._layers={};this.sourceCaches={};this.glyphManager=new _14("sans-serif");this.dispatcher=new _13(this);this._changed=false;this._updatedLayers={};this._removedLayers={};this._updatedSources={};this._updatedPaintProps={};this.tilePixelRatio=0.0625;},_serializeLayers:function _serializeLayers(ids){var _16=[];for(var i=0,_17=ids;i<_17.length;i+=1){var id=_17[i];var _18=this._layers[id];if(_18.type!=="custom"){_16.push(_18.serialize());}}return _16;},_addSource:function(id,_19,_1a,_1b,url){var _1c=this;if(_1a===void 0){_1a={};}if(this.sourceCaches[id]!==undefined){throw new Error("There is already a source with this ID");}if(!_19.type){throw new Error(("The type property must be defined, but the only the following properties were given: "+(Object.keys(_19).join(", "))+"."));}var _1d=this.sourceCaches[id]=new _11(id,_19,this.dispatcher,_1b.width,_1b.height,url,this);},loadStyle:function(_1e){var obj=this;_3(this.url,{handleAs:"json"}).then(function(_1f){var _20=null;for(var id in _1f.sources){if(!_20){_20=_1f.sources[id].url;break;}}var _21=_1f.layers;obj._order=_21.map(function(_22){return _22.id;});obj._layers={};for(var i=0;i<_21.length;i+=1){var _23=_21[i];_23=_12.createStyleLayer(_23);obj._layers[_23.id]=_23;}obj.glyphManager.setURL(_1f.glyphs);obj.dispatcher.broadcast("setLayers",obj._serializeLayers(obj._order));_3(_20,{handleAs:"json"}).then(function(_24){obj._addSource(id,_1f.sources[id],{validate:false},_1e,_24.tiles);_3(_1f.sprite+".json",{handleAs:"json"}).then(function(_25){_4(_1f.sprite+".png",{responseType:"image"}).then(function(_26){_26=_26.data;var _27=document.createElement("canvas");var ctx=_27.getContext("2d");_27.width=_26.width;_27.height=_26.height;ctx.drawImage(_26,0,0,_26.width,_26.height);var _28=ctx.getImageData(0,0,_26.width,_26.height);for(var id in _25){var ref=_25[id],_29=ref.width,_2a=ref.height,x=ref.x,y=ref.y,sdf=ref.sdf,_2b=ref.pixelRatio;var d=new _c.RGBAImage({width:_29,height:_2a});_c.RGBAImage.copy(_28,d,{x:x,y:y},{x:0,y:0},{width:_29,height:_2a});obj.imageManager.addImage(id,{data:d,pixelRatio:_2b,sdf:sdf});}obj.imageManager.setLoaded(true);obj.imageAatlas=new _10(obj.imageManager.images,{});obj._read(_24,{origin:"service"});});});});});},_read:function(_2c){var _2d=_2c.fullExtent;var _2e=_2c.spatialReference;_2d=new _6(307543.51669999957,1093440.0414000005,784229.2726999996,6051055.7797,_2e);this.tileServer=_2c.tiles;var _2f=_2c.tileInfo;var _30=_2f.rows;var dpi=_2f.dpi,_31=_2f.origin;_31=new _8(parseFloat(_31.x),parseFloat(_31.y));var _32=[];_2f.lods.forEach(function(_33){_32.push(new _a({level:parseInt(_33.level),scale:parseInt(_33.scale),resolution:parseFloat(_33.resolution)}));});this.tileInfo=new _b({lods:_32,origin:_31,size:_30});this.tileInfo.dpi=dpi;this.tileInfo.fullExtent=_2d;this.layerView.tileSize=_30;for(var id in this.sourceCaches){this.sourceCaches[id].updateTileSize(_30);}this.tilePixelRatio=_30/_e.layout.EXTENT;this.layerView._updatePlacement(0);_2.publish("tileInfoComplete",this.tileInfo,this.layerView.view.id);},_updateWorkerLayers:function(_34,_35){this.dispatcher.broadcast("updateLayers",{layers:this._serializeLayers(_34),removedIds:_35});},_resetUpdates:function(){this._changed=false;this._updatedLayers={};this._removedLayers={};this._updatedSources={};this._updatedPaintProps={};},update:function(_36){var _37=this._changed;if(this._changed){var _38=Object.keys(this._updatedLayers);var _39=Object.keys(this._removedLayers);if(_38.length||_39.length){this._updateWorkerLayers(_38,_39);}for(var id in this._updatedSources){var _3a=this._updatedSources[id];if(_3a==="reload"){this._reloadSource(id);}else{if(_3a==="clear"){this._clearSource(id);}}}for(var _3b in this._updatedPaintProps){this._layers[_3b].updateTransitions(_36);}this._resetUpdates();}for(var _3c in this.sourceCaches){this.sourceCaches[_3c].used=false;}for(var i=0,_3d=this._order;i<_3d.length;i+=1){var _3e=_3d[i];var _3f=this._layers[_3e];_3f.recalculate(_36);if(!_3f.isHidden(_36.zoom)&&_3f.source){this.sourceCaches[_3f.source].used=true;}}this.z=_36.zoom;if(_37){}},_reloadSource:function(id){this.sourceCaches[id].resume();this.sourceCaches[id].reload();},_clearSource:function(id){this.sourceCaches[id].clearTiles();},getLayer:function(id){return this._layers[id];},setPaintProperty:function(_40,_41,_42,_43){if(_43===void 0){_43={};}var _44=this.getLayer(_40);if(_d.deepEqual(_44.getPaintProperty(_41),_42)){return;}var _45=_44.setPaintProperty(_41,_42,_43);if(_45){this._updateLayer(_44);}this._changed=true;this._updatedPaintProps[_40]=true;},setLayoutProperty:function(_46,_47,_48,_49){if(_49===void 0){_49={};}var _4a=this.getLayer(_46);if(_d.deepEqual(_4a.getLayoutProperty(_47),_48)){return;}_4a.setLayoutProperty(_47,_48,_49);this._updateLayer(_4a);},_updateLayer:function(_4b){this._updatedLayers[_4b.id]=true;if(_4b.source&&!this._updatedSources[_4b.source]){this._updatedSources[_4b.source]="reload";this.sourceCaches[_4b.source].pause();}this._changed=true;},createLayerView:function(_4c,_4d){var _4e=new _7({width:_4c.viewpoint.width,height:_4c.viewpoint.height,opacity:this.opacity,visible:this.visible,view:_4c,id:this.id,layer:this});this.loadStyle(_4c);this.layerView=_4e;_4c.vectorLayerView=_4e;_4e.transform=_4c.viewpoint;return _4e;},getGlyphs:function(_4f,_50,_51){this.glyphManager.getGlyphs(_50.stacks,_51);},getImages:function(_52,_53,_54){this.imageManager.getImages(_53.icons,_54);},queryRenderedFeatures:function(x,y){var _55=new _9(x,y);return this.layerView.queryRenderedFeatures([_55]);},intersectPoi:function(x,y){var _56=new _9(x,y);return this.layerView.intersectPoi([_56]);}});});