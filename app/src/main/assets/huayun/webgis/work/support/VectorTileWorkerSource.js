//>>built
define("com/huayun/webgis/work/support/VectorTileWorkerSource",["./WorkerTile","./VectorTile","../../data/Pbf","../../utils/utils","../../utils/Resource"],function(_1,_2,_3,_4,_5){function _6(_7,_8){var r=_5.loadArrayBuffer(_7.request.url,function(_9,_a){if(_9){_8(_9);}else{if(_a){_8(null,{vectorTile:new _2(new _3(_a)),rawData:_a});}}});return function(){r.cancel();_8();};};var _b=function _b(_c,_d,_e){this.actor=_c;this.layerIndex=_d;this.loadVectorData=_e||_6;this.loading={};this.loaded={};};_b.prototype.loadTile=function(_f,_10){var _11=this;var uid=_f.uid;if(!this.loading){this.loading={};}var _12=this.loading[uid]=new _1(_f);_12.abort=this.loadVectorData(_f,function(err,_13){delete _11.loading[uid];if(err||!_13){_12.status="done";_11.loaded[uid]=_12;return _10(err);}var _14=_13.rawData;var _15={};if(_13.expires){_15.expires=_13.expires;}if(_13.cacheControl){_15.cacheControl=_13.cacheControl;}var _16={};_12.vectorTile=_13.vectorTile;_12.parse(_13.vectorTile,_11.layerIndex,_11.actor,function(err,_17){if(err||!_17){return _10(err);}_10(null,_4.extend({rawTileData:_14.slice(0)},_17,_15,_16));});_11.loaded=_11.loaded||{};_11.loaded[uid]=_12;});};_b.prototype.reloadTile=function reloadTile(_18,_19){var _1a=this.loaded,uid=_18.uid,_1b=this;if(_1a&&_1a[uid]){var _1c=_1a[uid];_1c.showCollisionBoxes=_18.showCollisionBoxes;var _1d=function(err,_1e){var _1f=_1c.reloadCallback;if(_1f){delete _1c.reloadCallback;_1c.parse(_1c.vectorTile,_1b.layerIndex,_1b.actor,_1f);}_19(err,_1e);};if(_1c.status==="parsing"){_1c.reloadCallback=_1d;}else{if(_1c.status==="done"){if(_1c.vectorTile){_1c.parse(_1c.vectorTile,this.layerIndex,this.actor,_1d);}else{_1d();}}}}};_b.prototype.abortTile=function abortTile(_20,_21){var _22=this.loading,uid=_20.uid;if(_22&&_22[uid]&&_22[uid].abort){_22[uid].abort();delete _22[uid];}_21();};_b.prototype.removeTile=function removeTile(_23,_24){var _25=this.loaded,uid=_23.uid;if(_25&&_25[uid]){delete _25[uid];}_24();};return _b;});