/**
 * 主线程和子线程之间通信封装类
 * @see com.huayun.webgis.work.Actor
 */
define("com/huayun/webgis/work/Actor", [
    "../utils/utils",
    "com/huayun/webgis/gl/dataTransfer",
    "com/huayun/webgis/data/FeatureIndex"
], function (utils, dataTransfer, FeatureIndex) {
    /**
     * 主线程和子线程之间通信封装类
     * @ignore
     * @alias com.huayun.webgis.work.Actor
     * @param target 所属对象
     * @param mapId  地图id
     * @param parent 父对象
     * @constructor
     */
    var Actor = function Actor(target, mapId, parent) {
        this.target = target;
        this.mapId = mapId;
        this.parent = parent;
        this.callbacks = {};
        this.callbackID = 0;
        utils.bindAll(['receive'], this);
        // 接收线程间的通信
        this.target.addEventListener('message', this.receive, false);
    };

    /**
     * 发送消息到其他线程
     * @param type 消息类型
     * @param data 消息数据
     * @param callback 回调
     * @param targetMapId 地图id
     * @return {{cancel: (function(): void)}}
     */
    Actor.prototype.send = function send(type, data, callback, targetMapId) {
        var this$1 = this;
        var id = callback ? (this.mapId + ":" + this.callbackID++) : null;
        if (callback) {
            this.callbacks[id] = callback;
        }
        var buffers = [];
        this.target.postMessage({
            targetMapId: targetMapId,
            sourceMapId: this.mapId,
            type: type,
            id: String(id),
            data: dataTransfer.serialize(data, buffers)
        }, buffers);
        if (callback) {
            return {
                cancel: function () {
                    return this$1.target.postMessage({
                        targetMapId: targetMapId,
                        sourceMapId: this$1.mapId,
                        type: '<cancel>',
                        id: String(id)
                    });
                }
            };
        }
    };

    /**
     * 接收线程间通信的消息, 在主线程中接收子线程的消息, 子线程中接收主线程的消息
     * 消息的实体data包括: sourceMapId, type, id, error, data
     * 其中type类型有:
     * 1. '<response>'
     * 2. '<cancel>' 前两者直接执行回调函数
     * 3. 其余 对消息的内容进行处理, 最后执行回调进行响应
     * @param {Object} message 通信的消息
     * @param {Object} message.data 消息的数据
     */
    Actor.prototype.receive = function receive(message) {
        var this$1 = this;
        var data = message.data, // 消息的数据
            id = data.id;
        var callback;
        if (data.targetMapId && this.mapId !== data.targetMapId) {
            return;
        }

        var done = function (err, data) {
            delete this$1.callbacks[id];
            var buffers = [];
            this$1.target.postMessage({
                sourceMapId: this$1.mapId,
                type: '<response>',
                id: String(id),
                error: err ? dataTransfer.serialize(err) : null,
                data: dataTransfer.serialize(data, buffers)
            }, buffers);
        };

        // 若消息的数据类型是response或cancel, 直接执行回调即可
        if (data.type === '<response>' || data.type === '<cancel>') {
            callback = this.callbacks[data.id];
            delete this.callbacks[data.id];
            if (callback && data.error) {
                callback(dataTransfer.deserialize(data.error));
            } else if (callback) {
                callback(null, dataTransfer.deserialize(data.data));
            }
        } else if (typeof data.id !== 'undefined' && this.parent[data.type]) {
            this.callbacks[data.id] = null;
            var cancelable = this.parent[data.type](data.sourceMapId, dataTransfer.deserialize(data.data), done);
            if (cancelable && this.callbacks[data.id] === null) {
                this.callbacks[data.id] = cancelable.cancel;
            }
        } else if (typeof data.id !== 'undefined' && this.parent.getWorkerSource) {
            var keys = data.type.split('.');
            var params = (dataTransfer.deserialize(data.data));
            var workerSource = (this.parent).getWorkerSource(data.sourceMapId, keys[0], params.source);
            workerSource[keys[1]](params, done);
        } else {
            this.parent[data.type](dataTransfer.deserialize(data.data));
        }
    };
    /**
     * 移除线程间的消息监听
     */
    Actor.prototype.remove = function remove() {
        this.target.removeEventListener('message', this.receive, false);
    };

    return Actor;
});