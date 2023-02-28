/**
 * 最近最少使用算法的实现
 * @see com.huayun.webgis.layer.support.TileCache
 */
define("com/huayun/webgis/layers/support/TileCache", [], function () {
    /**
     * 缓存最近最少使用算法的实现
     * @ignore
     * @alias com.huayun.webgis.layer.support.TileCache
     * @param max
     * @param onRemove
     * @constructor
     */
    var TileCache = function TileCache(max, onRemove) {
        this.max = max;
        this.onRemove = onRemove;
        this.reset();
    };

    /**
     * 清空缓存
     * @return {TileCache}
     */
    TileCache.prototype.reset = function reset() {
        for (var key in this.data) {
            for (var i = 0, list = this.data[key]; i < list.length; i += 1) {
                var removedData = list[i];
                if (removedData.timeout) {
                    clearTimeout(removedData.timeout);
                }
                this.onRemove(removedData.value);
            }
        }
        this.data = {};
        this.order = [];
        return this;
    };

    /**
     * 将key-value添加到缓存, 若到最大长度, 则修改大小
     * @param tileID
     * @param data
     * @param expiryTimeout
     * @return {com.huayun.webgis.layer.support.TileCache}
     */
    TileCache.prototype.add = function add(tileID, data, expiryTimeout) {
        var this$1 = this;
        var key = tileID.wrapped().key;
        if (this.data[key] === undefined) {
            this.data[key] = [];
        }
        var dataWrapper = {
            value: data,
            timeout: undefined
        };

        if (expiryTimeout !== undefined) {
            dataWrapper.timeout = setTimeout(function () {
                this$1.remove(tileID, dataWrapper);
            }, expiryTimeout);
        }

        this.data[key].push(dataWrapper);
        this.order.push(key);

        if (this.order.length > this.max) {
            var removedData = this._getAndRemoveByKey(this.order[0]);
            if (removedData) {
                this.onRemove(removedData);
            }
        }
        return this;
    };

    /**
     * tile是否存在于缓存中
     * @param tileID
     * @return {boolean}
     */
    TileCache.prototype.has = function has(tileID) {
        return tileID.wrapped().key in this.data;
    };

    /**
     * 从缓存中获取指定id的tile并从缓存中删除
     * @param tileID
     * @return {null|*}
     */
    TileCache.prototype.getAndRemove = function getAndRemove(tileID) {
        if (!this.has(tileID)) {
            return null;
        }
        return this._getAndRemoveByKey(tileID.wrapped().key);
    };

    /**
     * 获取并移除切片
     * @param key
     * @return {*}
     * @private
     */
    TileCache.prototype._getAndRemoveByKey = function _getAndRemoveByKey(key) {
        var data = this.data[key].shift();
        if (data.timeout) {
            clearTimeout(data.timeout);
        }

        if (this.data[key].length === 0) {
            delete this.data[key];
        }
        this.order.splice(this.order.indexOf(key), 1);
        return data.value;
    };

    /**
     * 从缓存中获取切片
     * @param tileID
     * @return {null|*}
     */
    TileCache.prototype.get = function get(tileID) {
        if (!this.has(tileID)) {
            return null;
        }

        var data = this.data[tileID.wrapped().key][0];
        return data.value;
    };

    /**
     * 从缓存中移除切片
     * @param tileID
     * @param value
     * @return {com.huayun.webgis.layer.support.TileCache}
     */
    TileCache.prototype.remove = function remove(tileID, value) {
        if (!this.has(tileID)) {
            return this;
        }
        var key = tileID.wrapped().key;

        var dataIndex = value === undefined ? 0 : this.data[key].indexOf(value);
        var data = this.data[key][dataIndex];
        this.data[key].splice(dataIndex, 1);
        if (data.timeout) {
            clearTimeout(data.timeout);
        }
        if (this.data[key].length === 0) {
            delete this.data[key];
        }
        this.onRemove(data.value);
        this.order.splice(this.order.indexOf(key), 1);
        return this;
    };

    /**
     * 设置缓存的最大值
     * @param max
     * @return {com.huayun.webgis.layer.support.TileCache}
     */
    TileCache.prototype.setMaxSize = function setMaxSize(max) {
        this.max = max;
        while (this.order.length > this.max) {
            var removedData = this._getAndRemoveByKey(this.order[0]);
            if (removedData) {
                this.onRemove(removedData);
            }
        }
        return this;
    };

    return TileCache;
});