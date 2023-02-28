/**
 * 样式图层索引
 * @see com.huayun.webgis.work.support.StyleLayerIndex
 */
define("com/huayun/webgis/work/support/StyleLayerIndex", [
    "../../layers/support/style/expressionFactory",
    "../../layers/support/style/createStyleLayer",
    "../../utils/utils"
], function (expressionFactory, createStyleLayer, utils) {

    // 图层样式包含的属性
    var refProperties = ['type', 'source', 'source-layer', 'minzoom', 'maxzoom', 'filter', 'layout'];

    /**
     * 将对象转换成字符串
     * @ignore
     * @param obj
     * @return {string}
     *
     *function stringify(obj) {
        var type = typeof obj;
        if (type === 'number' || type === 'boolean' || type === 'string' || obj === undefined || obj === null) {
            return JSON.stringify(obj);
        }

        if (Array.isArray(obj)) {
            var str$1 = '[';
            for (var i$1 = 0, list = obj; i$1 < list.length; i$1 += 1) {
                var val = list[i$1];
                str$1 += (stringify(val)) + ",";
            }
            return str$1 + "]";
        }

        var keys = Object.keys(obj).sort();
        var str = '{';
        for (var i = 0; i < keys.length; i++) {
            str += (JSON.stringify(keys[i])) + ":" + (stringify(obj[keys[i]])) + ",";
        }
        return str + "}";
    }*/

    /**
     * 获取图层的key
     * @ignore
     * @param layer
     * @return {string}
     */
    function getKey(layer) {
        var key = '';
        for (var i = 0, list = refProperties; i < list.length; i += 1) {
            var k = list[i];
            key += "/" + (JSON.stringify(layer[k]));
        }
        return key;
    }

    /**
     * 根据layout分组
     * @ignore
     * @param layers
     * @param cachedKeys
     * @return {[]}
     */
    function groupByLayout(layers, cachedKeys) {
        var groups = {};
        for (var i = 0; i < layers.length; i++) {
            var k = (cachedKeys && cachedKeys[layers[i].id]) || getKey(layers[i]);
            if (cachedKeys) {
                cachedKeys[layers[i].id] = k;
            }
            var group = groups[k];
            if (!group) {
                group = groups[k] = [];
            }
            group.push(layers[i]);
        }
        var result = [];
        for (var k$1 in groups) {
            result.push(groups[k$1]);
        }
        return result;
    }

    /**
     * 样式图层索引
     * @ignore
     * @alias com.huayun.webgis.work.support.StyleLayerIndex
     * @param layerConfigs
     * @property {Object} keyCache
     * @property {Object} _layerConfigs
     * @property {Object} _layers
     * @property {Object} familiesBySource
     * @constructor
     */
    var StyleLayerIndex = function StyleLayerIndex(layerConfigs) {
        this.keyCache = {};
        if (layerConfigs) {
            this.replace(layerConfigs);
        }
    };
    /**
     * 图层设置改变
     * @param layerConfigs
     */
    StyleLayerIndex.prototype.replace = function replace(layerConfigs) {
        this._layerConfigs = {};
        this._layers = {};
        this.update(layerConfigs, []);
    };

    /**
     * 更新索引
     * @param layerConfigs
     * @param removedIds
     */
    StyleLayerIndex.prototype.update = function update(layerConfigs, removedIds) {
        var this$1 = this;
        for (var i = 0, list = layerConfigs; i < list.length; i += 1) {
            var layerConfig = list[i];
            this._layerConfigs[layerConfig.id] = layerConfig;

            var layer = this._layers[layerConfig.id] = createStyleLayer(layerConfig);
            layer._featureFilter = expressionFactory.createFilter(layer.filter);
            if (this.keyCache[layerConfig.id]) {
                delete this.keyCache[layerConfig.id];
            }
        }
        for (var i$1 = 0, list$1 = removedIds; i$1 < list$1.length; i$1 += 1) {
            var id = list$1[i$1];
            delete this.keyCache[id];
            delete this._layerConfigs[id];
            delete this._layers[id];
        }

        this.familiesBySource = {};
        var groups = groupByLayout(utils.values(this._layerConfigs), this.keyCache);

        for (var i$2 = 0, list$2 = groups; i$2 < list$2.length; i$2 += 1) {
            var layerConfigs$1 = list$2[i$2];

            var layers = layerConfigs$1.map(function (layerConfig) {
                return this$1._layers[layerConfig.id];
            });

            var layer$1 = layers[0];
            if (layer$1.visibility === 'none') { // 过滤不可见图层
                continue;
            }

            var sourceId = layer$1.source || '';
            var sourceGroup = this.familiesBySource[sourceId];
            if (!sourceGroup) {
                sourceGroup = this.familiesBySource[sourceId] = {};
            }

            var sourceLayerId = layer$1.sourceLayer || '_geojsonTileLayer';
            var sourceLayerFamilies = sourceGroup[sourceLayerId];
            if (!sourceLayerFamilies) {
                sourceLayerFamilies = sourceGroup[sourceLayerId] = [];
            }
            sourceLayerFamilies.push(layers);
        }
    };

    return StyleLayerIndex;
});