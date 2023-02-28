//>>built
define("com/huayun/webgis/work/support/BaseWorker",["../Actor","./VectorTileWorkerSource","./TiffTerrainWorkerSource","./StyleLayerIndex"],function(e,f,g,h){function k(b){self.caches&&self.caches.open("hy-tiles").then(function(a){a.keys().then(function(c){for(var d=0;d<c.length-b;d++)a.delete(c[d])})})}var d=function(b){var a=this;this.self=b;this.actor=new e(b,void 0,this);this.layerIndexes={};this.workerSourceTypes={vector:f,terrain:g};this.workerSources={};this.demWorkerSources={};this.self.registerWorkerSource=
function(b,d){if(a.workerSourceTypes[b])throw Error('Worker source with name "'+b+'" already registered.');a.workerSourceTypes[b]=d}};d.prototype.setReferrer=function(b,a){this.referrer=a};d.prototype.setLayers=function(b,a,c){this.getLayerIndex(b).replace(a);c()};d.prototype.updateLayers=function(b,a,c){this.getLayerIndex(b).update(a.layers,a.removedIds);c()};d.prototype.loadTile=function(b,a,c){this.getWorkerSource(b,a.type,a.source).loadTile(a,c)};d.prototype.loadTerrain=function(b,a,c){this.getWorkerSource(b,
a.type,a.source).loadTerrain(a,c)};d.prototype.reloadTile=function(b,a,c){this.getWorkerSource(b,a.type,a.source).reloadTile(a,c)};d.prototype.abortTile=function(b,a,c){this.getWorkerSource(b,a.type,a.source).abortTile(a,c)};d.prototype.removeTile=function(b,a,c){this.getWorkerSource(b,a.type,a.source).removeTile(a,c)};d.prototype.removeSource=function(b,a,c){if(this.workerSources[b]&&this.workerSources[b][a.type]&&this.workerSources[b][a.type][a.source]){var d=this.workerSources[b][a.type][a.source];
delete this.workerSources[b][a.type][a.source];void 0!==d.removeSource?d.removeSource(a,c):c()}};d.prototype.loadWorkerSource=function(b,a,c){try{this.self.importScripts(a.url),c()}catch(l){c(l.toString())}};d.prototype.getLayerIndex=function(b){var a=this.layerIndexes[b];a||(a=this.layerIndexes[b]=new h);return a};d.prototype.getWorkerSource=function(b,a,c){var d=this;this.workerSources[b]||(this.workerSources[b]={});this.workerSources[b][a]||(this.workerSources[b][a]={});this.workerSources[b][a][c]||
(this.workerSources[b][a][c]=new this.workerSourceTypes[a]({send:function(a,c,e){d.actor.send(a,c,e,b)}},this.getLayerIndex(b)));return this.workerSources[b][a][c]};d.prototype.enforceCacheSizeLimit=function(b,a){k(a)};return d});