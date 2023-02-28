/**
 * 子线程模型类
 * @see com.huayun.webgis.work.support.BaseWork
 */
define("com/huayun/webgis/work/support/BaseWorker", [
    "../Actor",
    "./VectorTileWorkerSource",
    "./TiffTerrainWorkerSource",
    "./StyleLayerIndex"
], function (Actor, VectorTileWorkerSource, TiffTerrainWorkerSource, StyleLayerIndex) {

    var CACHE_NAME = 'hy-tiles';

    function enforceCacheSizeLimit(limit) {
        if (!self.caches) {
            return;
        }
        self.caches.open(CACHE_NAME).then(function (cache) {
            cache.keys().then(function (keys) {
                for (var i = 0; i < keys.length - limit; i++) {
                    cache.delete(keys[i]);
                }
            });
        });
    }

    /**
     * 子线程模型类
     * @ignore
     * @alias com.huayun.webgis.work.support.BaseWork
     * @param self 子线程的全局对象
     * @constructor
     */
    var Worker = function Worker(self) {
        var this$1 = this;

        this.self = self;
        this.actor = new Actor(self, undefined, this);
        this.layerIndexes = {};
        this.workerSourceTypes = {
            vector: VectorTileWorkerSource,
            terrain: TiffTerrainWorkerSource
        };

        this.workerSources = {};
        this.demWorkerSources = {};

        this.self.registerWorkerSource = function (name, WorkerSource) {
            if (this$1.workerSourceTypes[name]) {
                throw new Error(("Worker source with name \"" + name + "\" already registered."));
            }
            this$1.workerSourceTypes[name] = WorkerSource;
        };
        /*this.self.registerRTLTextPlugin = function (rtlTextPlugin) {
            if (__chunk_1.plugin.isLoaded()) {
                throw new Error('RTL text plugin already registered.');
            }
            __chunk_1.plugin['applyArabicShaping'] = rtlTextPlugin.applyArabicShaping;
            __chunk_1.plugin['processBidirectionalText'] = rtlTextPlugin.processBidirectionalText;
            __chunk_1.plugin['processStyledBidirectionalText'] = rtlTextPlugin.processStyledBidirectionalText;
        };*/
    };

    /**
     * 设置referrer
     * @param mapID
     * @param referrer
     */
    Worker.prototype.setReferrer = function(mapID, referrer) {
        this.referrer = referrer;
    };

    /**
     * 设置图层
     * @param mapId 地图id
     * @param layers 图层
     * @param callback 回调函数
     */
    Worker.prototype.setLayers = function setLayers(mapId, layers, callback) {
        this.getLayerIndex(mapId).replace(layers);
        callback();
    };

    /**
     * 更新图层
     * @param mapId
     * @param params
     * @param callback
     */
    Worker.prototype.updateLayers = function(mapId, params, callback) {
        this.getLayerIndex(mapId).update(params.layers, params.removedIds);
        callback();
    };

    /**
     * 加载切片
     * @param mapId
     * @param params
     * @param callback
     */
    Worker.prototype.loadTile = function(mapId, params, callback) {
        this.getWorkerSource(mapId, params.type, params.source).loadTile(params, callback);
    };

    Worker.prototype.loadTerrain = function loadTerrain(mapId, params, callback) {
        this.getWorkerSource(mapId, params.type, params.source).loadTerrain(params, callback);
    };

    /**
     * 重新加载切片
     * @param mapId
     * @param params
     * @param callback
     */
    Worker.prototype.reloadTile = function(mapId, params, callback) {
        this.getWorkerSource(mapId, params.type, params.source).reloadTile(params, callback);
    };

    /**
     * 取消加载切片
     * @param mapId
     * @param params
     * @param callback
     */
    Worker.prototype.abortTile = function(mapId, params, callback) {
        this.getWorkerSource(mapId, params.type, params.source).abortTile(params, callback);
    };

    /**
     * 移除切片
     * @param mapId
     * @param params
     * @param callback
     */
    Worker.prototype.removeTile = function(mapId, params, callback) {
        this.getWorkerSource(mapId, params.type, params.source).removeTile(params, callback);
    };

    /**
     * 移除workerSources
     * @param mapId
     * @param params
     * @param callback
     */
    Worker.prototype.removeSource = function(mapId, params, callback) {
        if (!this.workerSources[mapId] ||
            !this.workerSources[mapId][params.type] ||
            !this.workerSources[mapId][params.type][params.source]) {
            return;
        }

        var worker = this.workerSources[mapId][params.type][params.source];
        delete this.workerSources[mapId][params.type][params.source];

        if (worker.removeSource !== undefined) {
            worker.removeSource(params, callback);
        } else {
            callback();
        }
    };

    /**
     * 加载workerSources
     * @param map
     * @param params
     * @param callback
     */
    Worker.prototype.loadWorkerSource = function(map, params, callback) {
        try {
            this.self.importScripts(params.url);
            callback();
        } catch (e) {
            callback(e.toString());
        }
    };

    /**
     * 获取样式图层索引对象
     * @param mapId
     * @return {StyleLayerIndex} layerIndexes 样式图层索引对象
     */
    Worker.prototype.getLayerIndex = function(mapId) {
        var layerIndexes = this.layerIndexes[mapId];
        if (!layerIndexes) {
            layerIndexes = this.layerIndexes[mapId] = new StyleLayerIndex();
        }
        return layerIndexes;
    };

    /**
     * 获取WorkerSource
     * @param mapId
     * @param type
     * @param source
     * @return {*}
     */
    Worker.prototype.getWorkerSource = function(mapId, type, source) {
        var this$1 = this;
        if (!this.workerSources[mapId]) {
            this.workerSources[mapId] = {};
        }
        if (!this.workerSources[mapId][type]) {
            this.workerSources[mapId][type] = {};
        }

        if (!this.workerSources[mapId][type][source]) {
            var actor = {
                send: function (type, data, callback) {
                    this$1.actor.send(type, data, callback, mapId);
                }
            };
            this.workerSources[mapId][type][source] = new (this.workerSourceTypes[type])((actor), this.getLayerIndex(mapId));
        }
        return this.workerSources[mapId][type][source];
    };

    Worker.prototype.enforceCacheSizeLimit = function enforceCacheSizeLimit$1(mapId, limit) {
        enforceCacheSizeLimit(limit);
    };

    return Worker;
});