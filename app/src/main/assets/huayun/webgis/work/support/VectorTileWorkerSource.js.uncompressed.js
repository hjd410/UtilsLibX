/**
 * 子线程中矢量切片数据请求封装类
 * @see com.huayun.webgis.work.support.VectorTileWorkerSource
 */
define("com/huayun/webgis/work/support/VectorTileWorkerSource", [
    "./WorkerTile",
    "./VectorTile",
    "../../data/Pbf",
    "../../utils/utils",
    "../../utils/Resource"
], function (WorkerTile, VectorTile, Pbf, utils, Resource) {

    /*var at = function(t, e) {
        var r, n, i, a = t.z % 8, o = t.x % 8, s = t.y % 8, u = e, l = u.byteLength - a - o - s, p = Math.floor(l / 3), c = Math.floor(l / 3), h = l - p - c;
        s <= o && o <= a && s <= a ? (i = new Uint8Array(u.slice(s, h + s)),
            n = new Uint8Array(u.slice(h + o + s, h + c + o + s)),
            r = new Uint8Array(u.slice(h + c + o + s + a, l + a + o + s))) : s <= o && a <= o && s <= a ? (i = new Uint8Array(u.slice(s, h + s)),
            r = new Uint8Array(u.slice(h + a + s, h + p + a + s)),
            n = new Uint8Array(u.slice(h + p + a + s + o, l + a + o + s))) : o <= s && s <= a && o <= a ? (n = new Uint8Array(u.slice(o, c + o)),
            i = new Uint8Array(u.slice(c + o + s, h + c + o + s)),
            r = new Uint8Array(u.slice(h + c + a + s + o, l + a + o + s))) : o <= a && a <= s && o <= s ? (n = new Uint8Array(u.slice(o, c + o)),
            r = new Uint8Array(u.slice(c + o + a, c + p + o + a)),
            i = new Uint8Array(u.slice(c + p + a + s + o, l + a + o + s))) : a <= s && s <= o && a <= o ? (r = new Uint8Array(u.slice(a, p + a)),
            i = new Uint8Array(u.slice(p + a + s, h + p + a + s)),
            n = new Uint8Array(u.slice(h + p + a + s + o, l + a + o + s))) : a <= o && o <= s && a <= s && (r = new Uint8Array(u.slice(a, p + a)),
            n = new Uint8Array(u.slice(p + a + o, p + c + a + o)),
            i = new Uint8Array(u.slice(p + c + a + s + o, l + a + o + s)));
        var f = new Uint8Array(l);
        return f.set(r, 0),
            f.set(n, p),
            f.set(i, c + p),
            [].slice.call(f)
    };*/

    /**
     * ajax请求切片
     * @private
     * @param params
     * @param callback
     * @return {function(...[*]=)}
     */
    function loadVectorTile(params, callback) {
        /*data = at({
            x: Number(url[1]),
            y: Number(url[2]),
            z: Number(url[0])
        }, data);*/
        var r = Resource.loadArrayBuffer(params.request.url, function (err, data) {
            if (err) {
                callback(err);
            } else if (data) {
                callback(null, {
                    vectorTile: new VectorTile(new Pbf(data)),
                    rawData: data
                });
            }
        });
        return function () {
            r.cancel();
            callback();
        };
    }

    /**
     * 子线程中矢量切片数据请求封装类
     * @private
     * @ignore
     * @alias com.huayun.webgis.work.support.VectorTileWorkerSource
     * @param actor
     * @param layerIndex 图层索引
     * @param loadVectorData 加载矢量切片方法
     * @property {Actor} actor
     * @property layerIndex
     * @property {Function} loadVectorData
     * @property {Object} loading
     * @property {Object} loaded
     * @constructor
     */
    var VectorTileWorkerSource = function VectorTileWorkerSource(actor, layerIndex, loadVectorData) {
        this.actor = actor;
        this.layerIndex = layerIndex;
        this.loadVectorData = loadVectorData || loadVectorTile;
        this.loading = {};
        this.loaded = {};
    };

    /**
     * 加载矢量切片
     * @param params
     * @param callback
     */
    VectorTileWorkerSource.prototype.loadTile = function(params, callback) {
        var this$1 = this;
        var uid = params.uid;
        if (!this.loading) {
            this.loading = {};
        }
        var workerTile = this.loading[uid] = new WorkerTile(params);
        workerTile.abort = this.loadVectorData(params, function (err, response) {
            delete this$1.loading[uid];
            if (err || !response) {
                workerTile.status = 'done';
                this$1.loaded[uid] = workerTile;
                return callback(err);
            }
            var rawTileData = response.rawData;
            var cacheControl = {};
            if (response.expires) {
                cacheControl.expires = response.expires;
            }
            if (response.cacheControl) {
                cacheControl.cacheControl = response.cacheControl;
            }
            var resourceTiming = {};
            workerTile.vectorTile = response.vectorTile;
            workerTile.parse(response.vectorTile, this$1.layerIndex, this$1.actor, function (err, result) {
                if (err || !result) {
                    return callback(err);
                }
                callback(null, utils.extend({rawTileData: rawTileData.slice(0)}, result, cacheControl, resourceTiming));
            });
            this$1.loaded = this$1.loaded || {};
            this$1.loaded[uid] = workerTile;
        });
    };

    /**
     * 重新加载切片
     * @param params
     * @param callback
     */
    VectorTileWorkerSource.prototype.reloadTile = function reloadTile(params, callback) {
        var loaded = this.loaded,
            uid = params.uid,
            vtSource = this;
        if (loaded && loaded[uid]) {
            var workerTile = loaded[uid];
            workerTile.showCollisionBoxes = params.showCollisionBoxes;
            var done = function (err, data) {
                var reloadCallback = workerTile.reloadCallback;
                if (reloadCallback) {
                    delete workerTile.reloadCallback;
                    workerTile.parse(workerTile.vectorTile, vtSource.layerIndex, vtSource.actor, reloadCallback);
                }
                callback(err, data);
            };
            if (workerTile.status === 'parsing') {
                workerTile.reloadCallback = done;
            } else if (workerTile.status === 'done') {
                if (workerTile.vectorTile) {
                    workerTile.parse(workerTile.vectorTile, this.layerIndex, this.actor, done);
                } else {
                    done();
                }
            }
        }
    };

    /**
     * 放弃加载切片
     * @param params
     * @param callback
     */
    VectorTileWorkerSource.prototype.abortTile = function abortTile(params, callback) {
        var loading = this.loading,
            uid = params.uid;
        if (loading && loading[uid] && loading[uid].abort) {
            loading[uid].abort();
            delete loading[uid];
        }
        callback();
    };

    /**
     * 移除切片
     * @param params
     * @param callback
     */
    VectorTileWorkerSource.prototype.removeTile = function removeTile(params, callback) {
        var loaded = this.loaded, uid = params.uid;
        if (loaded && loaded[uid]) {
            delete loaded[uid];
        }
        callback();
    };
    return VectorTileWorkerSource;
});