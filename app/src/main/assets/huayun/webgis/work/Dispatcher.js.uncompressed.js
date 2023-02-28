/**
 * 主线程和子线程之间通信分发类
 * @see com.huayun.webgis.work.Actor
 */
define("com/huayun/webgis/work/Dispatcher", [
  "../utils/utils",
  "./Actor",
  "./workerPool"
], function (utils, Actor, workerPool) {
  var id = 1;

  /**
   * 主线程和子线程之间通信分发类
   * @ignore
   * @param parent
   * @property {Number} currentActor 当前通信的子线程封装类
   * @property {Array} actors 子线程封装类数组
   * @property {WorkerPool} workerPool 线程池
   * @constructor
   */
  var Dispatcher = function Dispatcher(parent) {
    this.workerPool = workerPool;
    this.actors = [];
    this.currentActor = 0;
    this.id = id++;
    var workers = this.workerPool.acquire(this.id);
    for (var i = 0; i < workers.length; i++) {
      var worker = workers[i];
      var actor = new Dispatcher.Actor(worker, this.id, parent); // 根据子线程内容创建通信封装类Actor
      actor.name = "Worker " + i;
      this.actors.push(actor);
    }
  };

  /**
   * 广播消息到所有线程, 用于广播矢量切片样式等
   * @param type 消息类型
   * @param data 消息数据
   * @param cb 消息回调
   */
  Dispatcher.prototype.broadcast = function broadcast(type, data, cb) {
    cb = cb || function () {};
    utils.asyncAll(this.actors, function (actor, done) {
      actor.send(type, data, done);
    }, cb);
  };

  /**
   * 给指定线程发送消息
   * @param type 消息类型
   * @param data 消息数据
   * @param callback 消息回调
   * @param targetID 指定子线程id, 若不指定, 则轮训子线程数组
   * @return {number}
   */
  Dispatcher.prototype.send = function send(type, data, callback, targetID) {
    if (typeof targetID !== 'number' || isNaN(targetID)) {
      targetID = this.currentActor = (this.currentActor + 1) % this.actors.length; // 轮训
    }
    this.actors[targetID].send(type, data, callback);
    return targetID;
  };

  /**
   * 移除子线程封装类和线程组
   */
  Dispatcher.prototype.remove = function remove() {
    this.actors.forEach(function (actor) {
      actor.remove();
    });
    this.actors = [];
    this.workerPool.release(this.id);
  };
  Dispatcher.Actor = Actor;

  return Dispatcher;
});