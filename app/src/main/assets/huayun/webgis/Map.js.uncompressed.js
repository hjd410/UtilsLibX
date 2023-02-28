/**
 * 地图类
 * @see com.huayun.webgis.Map
 */
define("com/huayun/webgis/Map", [
    "./core/base",
    "../core/EventEmitter",
    "./utils/extendClazz",
    "./layers/Layer"
], function (base, EventEmitter, extendClazz, Layer) {
    /**
     * 地图类, 管理所有的图层
     * @constructor
     * @alias com.huayun.webgis.Map
     * @param {Object} props 地图类的参数
     * @param {String} props.id 地图的id
     * @property {String} id 地图id
     * @property {Array} allLayers 地图管理的图层数组
     * @example
     * var map = new Map({
     *     id: "map"
     * });
     */
    function Map(props) {
        this.id = props && props.id ? props.id : "map";
        this.allLayers = [];
    }

    extendClazz(Map, EventEmitter);

    /**
     * 添加图层到地图中
     * @param {Layer} layer 需要添加的图层
     */
    Map.prototype.addLayer = function (layer) {
        if (!(layer instanceof Layer)) {
            throw new Error("添加的必须是图层类型");
        }
        for (var i = 0, ii = this.allLayers.length; i < ii; i++) {
            if (this.allLayers[i].id === layer.id) {
                throw new Error("图层id必须唯一.");
            }
        }
        this.allLayers.push(layer);
        this.emit("addLayers", [layer]);
    };

    /**
     * 添加多个图层到地图中
     * @param {Array} layers 需要添加的多个图层
     */
    Map.prototype.addLayers = function (layers) {
        for (var j = 0, jj = layers.length; j < jj; j++) {
            var layer = layers[j];
            if (!(layer instanceof Layer)) {
                throw new Error("添加的必须是图层类型");
            }
            for (var i = 0, ii = this.allLayers.length; i < ii; i++) {
                if (this.allLayers[i].id === layer.id) {
                    throw new Error("图层id必须唯一.");
                }
            }
            this.allLayers.push(layer);
        }
        this.emit("addLayers", layers);
    };

    /**
     * 添加图层到地图中, 且添加到指定图层之前
     * @param {Layer} layer 待添加图层
     * @param {String} beforeLayerId 指定图层的id
     */
    Map.prototype.addLayerBefore = function (layer, beforeLayerId) {
        if (!(layer instanceof Layer)) {
            throw new Error("添加的必须是图层类型");
        }
        var targetIndex = -1;
        for (var i = this.allLayers.length - 1; i > -1; i--) {
            if (this.allLayers[i].id === layer.id) {
                throw new Error("图层id必须唯一.");
            }
            if (this.allLayers[i].id === beforeLayerId) {
                targetIndex = i;
                break;
            }
        }
        if (targetIndex > -1) {
            this.allLayers.splice(targetIndex, 0, layer);
            this.emit("addLayers", [layer], beforeLayerId, targetIndex);
        } else {
            throw new Error("目标layer不存在, 无法放置到它之前!");
        }
    };

    /**
     * 根据图层id移除图层
     * @param {String} layerId 待移除图层的id
     * @returns {boolean} 是否移除成功
     */
    Map.prototype.removeLayerById = function (layerId) {
        for (var i = this.allLayers.length - 1; i > -1; i--) {
            if (this.allLayers[i].id === layerId) {
                this.allLayers.splice(i, 1);
                this.emit("removeLayers", [layerId]);
                return true;
            }
        }
        return false;
    };
    /**
     * 查找当前地图中所有图层
     * @returns {Array} 所有图层组成的数组
     */
    Map.prototype.findAllLayers = function () {
        return this.allLayers;
    };

    /**
     * 根据图层id查找图层
     * @param {String} layerId 待查找图层的id
     * @returns {null|Layer} 查找到的图层
     */
    Map.prototype.findLayerById = function (layerId) {
        for (var i = this.allLayers.length - 1; i > -1; i--) {
            if (this.allLayers[i].id === layerId) {
                return this.allLayers[i];
            }
        }
        return null;
    };

    Map.prototype.refresh = function () {
    };

    /**
     * 删除所有图层
     */
    Map.prototype.clear = function () {
        this.allLayers.forEach(function (item) {
            item.clear();
        })
        this.allLayers = [];
    }
    return Map;
});
