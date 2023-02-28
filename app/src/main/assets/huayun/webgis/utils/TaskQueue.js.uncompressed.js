/**
 * 任务队列, 每次渲染过程会执行其中的任务
 */
define("com/huayun/webgis/utils/TaskQueue", [], function () {
    var TaskQueue = function TaskQueue() {
        this._queue = [];
        this._id = 0;
        this._cleared = false;
        this._currentlyRunning = false;
    };

    TaskQueue.prototype.add = function add(callback) {
        var id = ++this._id;
        var queue = this._queue;
        queue.push({callback: callback, id: id, cancelled: false});
        return id;
    };

    TaskQueue.prototype.remove = function remove(id) {
        var running = this._currentlyRunning;
        var queue = running ? this._queue.concat(running) : this._queue;
        for (var i = 0, ll = queue.length; i < ll; i += 1) {
            var task = queue[i];
            if (task.id === id) {
                task.cancelled = true;
                return;
            }
        }
    };

    TaskQueue.prototype.run = function run(view) {
        var queue = this._currentlyRunning = this._queue;
        this._queue = [];

        for (var i = 0, ll = queue.length; i < ll; i += 1) {
            var task = queue[i];
            if (task.cancelled) {
                continue;
            }
            task.callback(view);
            if (this._cleared) {
                break;
            }
        }

        this._cleared = false;
        this._currentlyRunning = false;
    };

    TaskQueue.prototype.clear = function clear() {
        if (this._currentlyRunning) {
            this._cleared = true;
        }
        this._queue = [];
    };

    return TaskQueue;
});