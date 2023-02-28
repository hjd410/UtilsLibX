define("com/huayun/webgis/work/TerrainDispatcher", [
    "../utils/utils",
    "./Actor",
    "./workerPool"
], function (utils, Actor, workerPool) {
    var id = 1;

    var TerrainDispatcher = function TerrainDispatcher(parent) {
        this.workerPool = workerPool;
        this.actors = [];
        this.currentActor = 0;
        this.id = id++;
        var workers = this.workerPool.acquire(this.id);
        for (var i = 0; i < workers.length; i++) {
            var worker = workers[i];
            var actor = new TerrainDispatcher.Actor(worker, this.id, parent);
            actor.name = "Worker " + i;
            this.actors.push(actor);
        }
    };

    TerrainDispatcher.prototype.broadcast = function broadcast(type, data, cb) {
        cb = cb || function () {};
        utils.asyncAll(this.actors, function (actor, done) {
            actor.send(type, data, done);
        }, cb);
    };

    TerrainDispatcher.prototype.send = function send(type, data, callback, targetID) {
        if (typeof targetID !== 'number' || isNaN(targetID)) {
            targetID = this.currentActor = (this.currentActor + 1) % this.actors.length;
        }

        this.actors[targetID].send(type, data, callback);
        return targetID;
    };

    TerrainDispatcher.prototype.remove = function remove() {
        this.actors.forEach(function (actor) {
            actor.remove();
        });
        this.actors = [];
        this.workerPool.release(this.id);
    };
    TerrainDispatcher.Actor = Actor;

    return TerrainDispatcher;
});