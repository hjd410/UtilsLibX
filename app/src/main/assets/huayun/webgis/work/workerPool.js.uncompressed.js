/**
 * 线程池
 * @see com.huayun.webgis.work.WorkerPool
 */
define("com/huayun/webgis/work/workerPool", [
    "require"
], function (require) {
    var pool;
    if (pool)
        return pool;

    var availableLogicalProcessors = Math.floor(window.navigator.hardwareConcurrency / 2);
    var workerCount = Math.max(Math.min(availableLogicalProcessors, 6), 4);

    var path = require.toUrl("dojo");
    var workerContent = "dojoConfig = {\n" +
        "    baseUrl : '" + path + "',\n" +
        "    async: 1\n" +
        "};\n" +
        "self.importScripts('" + path + "/dojo-lite.js');\n" +
        "\n" +
        "require([\n" +
        "    \"com/huayun/webgis/work/support/BaseWorker\"\n" +
        "], function (BaseWorker) {\n" +
        "    if (typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined' && self instanceof WorkerGlobalScope) {\n" +
        "        self.worker = new BaseWorker(self);\n" +
        "    }\n" +
        "});";

    /**
     * 线程池
     * @ignore
     * @alias com.huayun.webgis.work.WorkerPool
     * @constructor
     * @property {Object} active 键是mapId, 值是对应的线程组
     */
    var WorkerPool = function WorkerPool() {
        this.active = {};
    };

    /**
     * 根据mapId获取子线程数组
     * @param mapId 地图Id
     * @return {Actor[]}
     */
    WorkerPool.prototype.acquire = function acquire(mapId) {
        if (!this.workers) {
            this.workers = [];
            while (this.workers.length < workerCount) {
                // 根据js的内容创建子线程
                var blob = new Blob([workerContent], {type: "text/javascript"});
                this.workers.push(new Worker(URL.createObjectURL(blob)));
            }
        }
        this.active[mapId] = true;
        return this.workers.slice();
    };

    /**
     * 根据mapId释放子线程
     * @param mapId 地图Id
     */
    WorkerPool.prototype.release = function release(mapId) {
        delete this.active[mapId];
        if (Object.keys(this.active).length === 0) {
            this.workers.forEach(function (w) {
                w.terminate();
            });
            this.workers = null;
        }
    };
    // 单例
    pool = new WorkerPool();
    return pool;
});