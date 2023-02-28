dojoConfig = {
    baseUrl : "../../../../dojo",
    async: 1
};
self.importScripts("../../../../dojo/dojo.js");

require([
    "com/huayun/webgis/work/support/BaseWorker"
], function (BaseWorker) {
    if (typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined' && self instanceof WorkerGlobalScope) {
        self.worker = new BaseWorker(self);
    }
});

