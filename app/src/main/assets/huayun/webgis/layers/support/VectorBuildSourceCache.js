//>>built
define("com/huayun/webgis/layers/support/VectorBuildSourceCache",["./TileSource","./funcUtils","./TileCache","./Tile","./SourceFeatureState","com/huayun/webgis/layers/support/tileCover","com/huayun/webgis/geometry/Point2D","../../utils/utils","../../utils/Constant"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){function _a(_b,_c){var _d=[];for(var i in _b){if(!(i in _c)){_d.push(i);}}return _d;};var _e={vector:_1.VectorTileSource,raster:_1.RasterTileSource};var _f=self.performance&&self.performance.now?self.performance.now.bind(self.performance):Date.now.bind(Date);function _10(a,b){return ((a%32)-(b%32))||(b-a);};function _11(_12){return _12==="raster"||_12==="image"||_12==="video";};var _13=function(id,_14,_15,_16,url,_17){var _18=new _e[_14.type](id,(_14),_15,url,_17);if(_18.id!==id){throw new Error(("Expected Source id to be "+id+" instead of "+(_18.id)));}_2.bindAll(["load","abort","unload","serialize","prepare"],_18);return _18;};function _19(id,_1a,_1b,_1c,_1d,url,_1e){this.id=id;this.dispatcher=_1b;this._source=_13(id,_1a,_1b,this,url,_1e);this._tiles={};this._cache=new _3(0,this._unloadTile.bind(this));this._timers={};this._cacheTimers={};this._maxTileCacheSize=null;this._coveredTiles={};this._state=new _5();this.updateCacheSize(_1c,_1d);this.layer=_1e;};_19.prototype.constructor=_19;_19.prototype.onAdd=function onAdd(map){};_19.prototype.updateTileSize=function(_1f){this._source.setSize(_1f);};_19.prototype.onRemove=function onRemove(map){if(this._source&&this._source.onRemove){this._source.onRemove(map);}};_19.prototype.loaded=function loaded(){if(this._sourceErrored){return true;}if(!this._sourceLoaded){return false;}for(var t in this._tiles){var _20=this._tiles[t];if(_20.state!=="loaded"&&_20.state!=="errored"){return false;}}return true;};_19.prototype.getSource=function getSource(){return this._source;};_19.prototype.pause=function pause(){this._paused=true;};_19.prototype.resume=function resume(_21){if(!this._paused){return;}var _22=this._shouldReloadOnResume;this._paused=false;this._shouldReloadOnResume=false;if(_22){this.reload();}};_19.prototype._loadTile=function _loadTile(_23,_24){return this._source.loadTile(_23,_24);};_19.prototype._unloadTile=function _unloadTile(_25){if(this._source.unloadTile){return this._source.unloadTile(_25,function(){});}};_19.prototype._abortTile=function _abortTile(_26){if(this._source.abortTile){return this._source.abortTile(_26,function(){});}};_19.prototype.serialize=function serialize(){return this._source.serialize();};_19.prototype.prepare=function prepare(_27){if(this._source.prepare){this._source.prepare();}this._state.coalesceChanges(this._tiles,this.map?this.map.painter:null);for(var i in this._tiles){var _28=this._tiles[i];_28.upload(_27);}};_19.prototype.getIds=function getIds(){var _29=[];for(var key in this._tiles){_29.push(this._tiles[key].tileID);}return _29;};_19.prototype.getRenderableIds=function getRenderableIds(_2a){var _2b=this;var ids=[];for(var id in this._tiles){if(this._isIdRenderable(id,_2a)){ids.push(id);}}if(_2a){return ids.sort(function(a_,b_){var a=_2b._tiles[a_].tileID;var b=_2b._tiles[b_].tileID;var _2c=(new _7(a.canonical.x,a.canonical.y))._rotate(0);var _2d=(new _7(b.canonical.x,b.canonical.y))._rotate(0);return a.overscaledZ-b.overscaledZ||_2d.y-_2c.y||_2d.x-_2c.x;});}return ids.sort(_10);};_19.prototype.zoomRenderableIds=function zoomRenderableIds(_2e){var _2f=this;var ids=[];for(var id in this._tiles){if(this._isIdRenderable(+id,_2e)){ids.push(+id);}}if(_2e){return ids.sort(function(a_,b_){var a=_2f._tiles[a_].tileID;var b=_2f._tiles[b_].tileID;var _30=(new _7(a.canonical.x,a.canonical.y))._rotate(0);var _31=(new _7(b.canonical.x,b.canonical.y))._rotate(0);return a.overscaledZ-b.overscaledZ||_31.y-_30.y||_31.x-_30.x;});}return ids.sort(_10);};_19.prototype.hasRenderableParent=function hasRenderableParent(_32){var _33=this.findLoadedParent(_32,0);if(_33){return this._isIdRenderable(_33.tileID.key);}return false;};_19.prototype._isIdRenderable=function _isIdRenderable(id,_34){return this._tiles[id]&&this._tiles[id].hasData()&&!this._coveredTiles[id]&&(_34||!this._tiles[id].holdingForFade());};_19.prototype.reload=function reload(){if(this._paused){this._shouldReloadOnResume=true;return;}this._cache.reset();for(var i in this._tiles){if(this._tiles[i].state!=="errored"){this._reloadTile(i,"reloading");}}};_19.prototype.updateTileUrl=function(url){this._source.updateTileUrl(url);};_19.prototype._reloadTile=function _reloadTile(id,_35){var _36=this._tiles[id];if(!_36){return;}if(_36.state!=="loading"){_36.state=_35;}this._loadTile(_36,this._tileLoaded.bind(this,_36,id,_35));};_19.prototype._tileLoaded=function _tileLoaded(_37,id,_38,err){if(err){_37.state="errored";return;}_37.timeAdded=_f();if(_38==="expired"){_37.refreshedUponExpiration=true;}this._setTileReloadTimer(id,_37);if(this.getSource().type==="raster-dem"&&_37.dem){this._backfillDEM(_37);}this._state.initializeTileState(_37,this.map?this.map.painter:null);this.layer.layerView._sourcesDirty=true;this.layer.layerView.view.threeRender();};_19.prototype._backfillDEM=function _backfillDEM(_39){var _3a=this.getRenderableIds();for(var i=0;i<_3a.length;i++){var _3b=_3a[i];if(_39.neighboringTiles&&_39.neighboringTiles[_3b]){var _3c=this.getTileByID(_3b);_3d(_39,_3c);_3d(_3c,_39);}}function _3d(_3e,_3f){_3e.needsHillshadePrepare=true;var dx=_3f.tileID.canonical.x-_3e.tileID.canonical.x;var dy=_3f.tileID.canonical.y-_3e.tileID.canonical.y;var dim=Math.pow(2,_3e.tileID.canonical.z);var _40=_3f.tileID.key;if(dx===0&&dy===0){return;}if(Math.abs(dy)>1){return;}if(Math.abs(dx)>1){if(Math.abs(dx+dim)===1){dx+=dim;}else{if(Math.abs(dx-dim)===1){dx-=dim;}}}if(!_3f.dem||!_3e.dem){return;}_3e.dem.backfillBorder(_3f.dem,dx,dy);if(_3e.neighboringTiles&&_3e.neighboringTiles[_40]){_3e.neighboringTiles[_40].backfilled=true;}};};_19.prototype.getTile=function getTile(_41){return this.getTileByID(_41.key);};_19.prototype.getTileByID=function getTileByID(id){return this._tiles[id];};_19.prototype.getZoom=function getZoom(_42){return _42.level+_42.scaleZoom(_42.tileSize/this._source.tileSize);};_19.prototype._retainLoadedChildren=function _retainLoadedChildren(_43,_44,_45,_46){for(var id in this._tiles){var _47=this._tiles[id];if(_46[id]||!_47.hasData()||_47.tileID.overscaledZ<=_44||_47.tileID.overscaledZ>_45){continue;}var _48=_47.tileID;while(_47&&_47.tileID.overscaledZ>_44+1){var _49=_47.tileID.scaledTo(_47.tileID.overscaledZ-1);_47=this._tiles[_49.key];if(_47&&_47.hasData()){_48=_49;}}var _4a=_48;while(_4a.overscaledZ>_44){_4a=_4a.scaledTo(_4a.overscaledZ-1);if(_43[_4a.key]){_46[_48.key]=_48;break;}}}};_19.prototype.findLoadedParent=function findLoadedParent(_4b,_4c){for(var z=_4b.overscaledZ-1;z>=_4c;z--){var _4d=_4b.scaledTo(z);if(!_4d){return;}var id=String(_4d.key);var _4e=this._tiles[id];if(_4e&&_4e.hasData()){return _4e;}if(this._cache.has(_4d)){return this._cache.get(_4d);}}};_19.prototype.updateCacheSize=function updateCacheSize(_4f,_50){var _51=Math.ceil(_4f/this._source.tileSize)+1;var _52=Math.ceil(_50/this._source.tileSize)+1;var _53=_51*_52;var _54=5;var _55=Math.floor(_53*_54);var _56=typeof this._maxTileCacheSize==="number"?Math.min(this._maxTileCacheSize,_55):_55;this._cache.setMaxSize(_56);};_19.prototype.handleWrapJump=function handleWrapJump(lng){var _57=this._prevLng===undefined?lng:this._prevLng;var _58=lng-_57;var _59=_58/360;var _5a=Math.round(_59);this._prevLng=lng;if(_5a){var _5b={};for(var key in this._tiles){var _5c=this._tiles[key];_5c.tileID=_5c.tileID.unwrapTo(_5c.tileID.wrap+_5a);_5b[_5c.tileID.key]=_5c;}this._tiles=_5b;for(var id in this._timers){clearTimeout(this._timers[id]);delete this._timers[id];}for(var _5d in this._tiles){var _5e=this._tiles[_5d];this._setTileReloadTimer(_5d,_5e);}}};_19.prototype.update=function update(_5f,_60,_61,cx,cy){this._coveredTiles={};var _62=_6(_5f,_60,_61);_62=_62.sort(function(a,b){a=a.canonical;b=b.canonical;return Math.sqrt((cx-a.x)*(cx-a.x)+(cy-a.y)*(cy-a.y))-Math.sqrt((cx-b.x)*(cx-b.x)+(cy-b.y)*(cy-b.y));});var _63=this._updateRetainedTiles(_62,_5f);var _64=_5f;var _65=0;var _66=15;if(_11(this._source.type)){var _67={};var _68={};var ids=Object.keys(_63);for(var i=0,_69=ids;i<_69.length;i+=1){var id=_69[i];var _6a=_63[id];var _6b=this._tiles[id];if(!_6b||_6b.fadeEndTime&&_6b.fadeEndTime<=_8.now()){continue;}var _6c=this.findLoadedParent(_6a,_65);if(_6c){this._addTile(_6c.tileID);_67[_6c.tileID.key]=_6c.tileID;}_68[id]=_6a;}this._retainLoadedChildren(_68,_64,_66,_63);for(var _6d in _67){if(!_63[_6d]){this._coveredTiles[_6d]=true;_63[_6d]=_67[_6d];}}}for(var _6e in _63){this._tiles[_6e].clearFadeHold();}var _6f=_a(this._tiles,_63);for(var i$1=0,_70=_6f;i$1<_70.length;i$1+=1){var _71=_70[i$1];var _72=this._tiles[_71];this._removeTile(_71);}return _62;};_19.prototype.updateTile=function updateTile(_73,_74,_75,cx,cy){this._coveredTiles={};var _76=_6(_73,_74,_75);_76=_76.sort(function(a,b){a=a.canonical;b=b.canonical;return Math.sqrt((cx-a.x)*(cx-a.x)+(cy-a.y)*(cy-a.y))-Math.sqrt((cx-b.x)*(cx-b.x)+(cy-b.y)*(cy-b.y));});this._updateRetainedTiles(_76,_73);return _76;};_19.prototype.releaseSymbolFadeTiles=function releaseSymbolFadeTiles(){for(var id in this._tiles){if(this._tiles[id].holdingForFade()){this._removeTile(id);}}};_19.prototype._updateRetainedTiles=function _updateRetainedTiles(_77,_78){var _79={};var _7a={};var _7b=Math.max(_78-_19.maxOverzooming,this._source.minzoom);var _7c=Math.max(_78+_19.maxUnderzooming,this._source.minzoom);var _7d={};for(var i=0,_7e=_77;i<_7e.length;i+=1){var _7f=_7e[i];var _80=this._addTile(_7f);_79[_7f.key]=_7f;if(_80.hasData()){continue;}if(_78<this._source.maxzoom){_7d[_7f.key]=_7f;}}this._retainLoadedChildren(_7d,_78,_7c,_79);for(var i$1=0,_81=_77;i$1<_81.length;i$1+=1){var _82=_81[i$1];var _83=this._tiles[_82.key];if(_83.hasData()){continue;}if(_78+1>this._source.maxzoom){var _84=_82.children(this._source.maxzoom)[0];var _85=this.getTile(_84);if(!!_85&&_85.hasData()){_79[_84.key]=_84;continue;}}else{var _86=_82.children(this._source.maxzoom);if(_79[_86[0].key]&&_79[_86[1].key]&&_79[_86[2].key]&&_79[_86[3].key]){continue;}}var _87=_83.wasRequested();for(var _88=_82.overscaledZ-1;_88>=_7b;--_88){var _89=_82.scaledTo(_88);if(_7a[_89.key]){break;}_7a[_89.key]=true;_83=this.getTile(_89);if(!_83&&_87){_83=this._addTile(_89);}if(_83){_79[_89.key]=_89;_87=_83.wasRequested();if(_83.hasData()){break;}}}}return _79;};_19.prototype._addTile=function _addTile(_8a){var _8b=this._tiles[_8a.key];if(_8b){return _8b;}_8b=this._cache.getAndRemove(_8a);if(_8b){this._setTileReloadTimer(_8a.key,_8b);_8b.tileID=_8a;this._state.initializeTileState(_8b,this.map?this.map.painter:null);if(this._cacheTimers[_8a.key]){clearTimeout(this._cacheTimers[_8a.key]);delete this._cacheTimers[_8a.key];this._setTileReloadTimer(_8a.key,_8b);}}var _8c=Boolean(_8b);if(!_8c){_8b=new _4(_8a,this._source.tileSize*_8a.overscaleFactor());this._loadTile(_8b,this._tileLoaded.bind(this,_8b,_8a.key,_8b.state));}if(!_8b){return (null);}_8b.uses++;this._tiles[_8a.key]=_8b;if(!_8c){}return _8b;};_19.prototype._reAddTile=function _reAddTile(_8d){var _8e=new _4(_8d,this._source.tileSize*_8d.overscaleFactor());this._loadTile(_8e,this._tileReAddLoaded.bind(this,_8e,_8d.key,_8e.state));};_19.prototype._tileReAddLoaded=function _tileLoaded(_8f,id,_90,err){this._removeTile(id);this._tiles[_8f.tileID.key]=_8f;if(err){_8f.state="errored";if((err).status!==404){this._source.fire(new __chunk_1.ErrorEvent(err,{tile:_8f}));}else{this.update(this.transform);}return;}_8f.timeAdded=_f();if(_90==="expired"){_8f.refreshedUponExpiration=true;}this._setTileReloadTimer(id,_8f);this._state.initializeTileState(_8f,this.map?this.map.painter:null);this.layer.layerView._sourcesDirty=true;this.layer.layerView.view.threeRender();};_19.prototype._setTileReloadTimer=function _setTileReloadTimer(id,_91){var _92=this;if(id in this._timers){clearTimeout(this._timers[id]);delete this._timers[id];}var _93=_91.getExpiryTimeout();if(_93){this._timers[id]=setTimeout(function(){_92._reloadTile(id,"expired");delete _92._timers[id];},_93);}};_19.prototype._removeTile=function _removeTile(id){var _94=this._tiles[id];if(!_94){return;}_94.uses--;delete this._tiles[id];if(this._timers[id]){clearTimeout(this._timers[id]);delete this._timers[id];}if(_94.uses>0){return;}if(_94.hasData()){this._cache.add(_94.tileID,_94,_94.getExpiryTimeout());}else{_94.aborted=true;this._abortTile(_94);this._unloadTile(_94);}};_19.prototype.clearTiles=function clearTiles(){this._shouldReloadOnResume=false;this._paused=false;for(var id in this._tiles){this._removeTile(id);}this._cache.reset();};_19.prototype._getTilePoint=function(_95,_96,_97){var col=this.layer.tileInfo.getColForX(_95.x,_97);var row=this.layer.tileInfo.getRowForY(_95.y,_97);var x=_96.canonical.x,y=_96.canonical.y;return new _7((col-x)*_9.layout.EXTENT,(row-y)*_9.layout.EXTENT);};_19.prototype.tilesIn=function(_98,_99,_9a,_9b,_9c){var _9d=[];var _9e=this;var _9f=this.transform;if(!_9f){return _9d;}var _a0=Infinity;var _a1=Infinity;var _a2=-Infinity;var _a3=-Infinity;for(var i$1=0,_a4=_98;i$1<_a4.length;i$1+=1){var p=_a4[i$1];_a0=Math.min(_a0,p.x);_a1=Math.min(_a1,p.y);_a2=Math.max(_a2,p.x);_a3=Math.max(_a3,p.y);}var _a5=[_a0,_a2].map(function(_a6){return Math.floor(_9e.layer.tileInfo.getColForX(_a6,_9b));});var _a7=[_a3,_a1].map(function(_a8){return Math.floor(_9e.layer.tileInfo.getRowForY(_a8,_9b));});for(var i=_a5[0];i<=_a5[1];i++){for(var j=_a7[0];j<=_a7[1];j++){var _a9=this._tiles[_9c+"/"+i+"/"+j];var _aa=_a9.tileID;var _ab=_98.map(function(c){return _9e._getTilePoint(c,_aa,_9b);});_9d.push({tile:_a9,tileID:_a9.tileID,queryGeometry:_ab,cameraQueryGeometry:_ab,scale:1});}}return _9d;};_19.prototype.getVisibleCoordinates=function getVisibleCoordinates(_ac,_ad){var _ae=this;var _af=this.getRenderableIds().map(function(id){return _ae._tiles[id].tileID;});this.currentCoords=[];this.transform=_ad;for(var i=0,_b0=_af;i<_b0.length;i+=1){var _b1=_b0[i];var _b2=_b1.toUnwrapped();if(!_b1.geometry){_b1.geometry=this.layer.tileInfo.getGeometry(_b2);}_b1.posMatrix=_ad.calculatePosMatrix(_b2,_b1.geometry);this.currentCoords.push(_b1);}return _af;};_19.prototype.updateTileMatrix=function updateTileMatrix(_b3,_b4){var _b5=this.currentCoords;for(var i=0,_b6=_b5;i<_b6.length;i+=1){var _b7=_b6[i];_b7.posMatrix=_b4.calculatePosMatrix(_b7.toUnwrapped(),_b7.geometry);}return _b5;};_19.prototype.hasTransition=function hasTransition(){if(this._source.hasTransition()){return true;}if(_11(this._source.type)){for(var id in this._tiles){var _b8=this._tiles[id];if(_b8.fadeEndTime!==undefined&&_b8.fadeEndTime>=__chunk_1.browser.now()){return true;}}}return false;};_19.prototype.setFeatureState=function setFeatureState(_b9,_ba,_bb){_b9=_b9||"_geojsonTileLayer";this._state.updateState(_b9,_ba,_bb);};_19.prototype.removeFeatureState=function removeFeatureState(_bc,_bd,key){_bc=_bc||"_geojsonTileLayer";this._state.removeFeatureState(_bc,_bd,key);};_19.prototype.getFeatureState=function getFeatureState(_be,_bf){_be=_be||"_geojsonTileLayer";return this._state.getState(_be,_bf);};_19.maxOverzooming=10;_19.maxUnderzooming=3;return _19;});