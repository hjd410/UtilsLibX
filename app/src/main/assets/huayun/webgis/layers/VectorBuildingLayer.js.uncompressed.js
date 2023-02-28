/**
 * 建筑物图层
 */
define("com/huayun/webgis/layers/VectorBuildingLayer", [
    "../utils/Resource",
    "./Layer",
    "../work/Dispatcher",
    "../views/3d/layers/VectorBuildingLayerView3D",
    "./support/style/createStyleLayer",
    "./support/VectorBuildSourceCache",
    "../geometry/Extent",
    "../geometry/Point",
    "./support/LOD",
    "./support/TileInfo",
    "../utils/Constant",
    "../utils/utils",
    "../geometry/queryVectorFeatures"
], function (Resource, Layer, Dispatcher, LayerView, createStyleLayer, SourceCache, Extent, Point, LOD, TileInfo, Constant, utils, queryVectorFeatures) {
    /**
     * 建筑物图层
     * @constructor
     * @alias com.huayun.webgis.layers.VectorBuildingLayer
     * @extends {Layer}
     * @param {Object} params 构造函数参数
     * @param {string}  params.id  图层id
     * @param {string}  params.url  图层元数据地址
     * @property {string}  id  图层id
     * @example
     * var building = new VectorBuildingLayer({
     *      id: "building",
     *      visible: true,
     *      url: "xxx"
     * });
     */
    var VectorBuildingLayer = function (params) {
        Layer.call(this, params);

        this.id = params.id || "buildLayer";
        this.url = params.url;
        this.name = params.name||"建筑物图层";
        this.dispatcher = new Dispatcher(this);
        this.tileInfo = null;
        this.layerView = null;

        this._changed = false;
        this._updatedLayers = {};
        this._removedLayers = {};
        this._updatedSources = {};
        this._updatedPaintProps = {};
        this.maxLevel = params.maxLevel;
        this.minLevel = params.minLevel || 11;
    };

    if (Layer) VectorBuildingLayer.__proto__ = Layer;
    VectorBuildingLayer.prototype = Object.create(Layer && Layer.prototype);
    VectorBuildingLayer.prototype.constructor = VectorBuildingLayer;

    VectorBuildingLayer.prototype.createLayerView = function(view, option) {
        var layerView = new LayerView({
            visible: this.visible,
            view: view,
            id: this.id,
            layer: this,
            minLevel: this.minLevel
        });
        layerView.transform = view.viewpoint;
        this.layerView = layerView;
        this.loadMetaData(view);
        return layerView;
    };

    VectorBuildingLayer.prototype.loadMetaData = function (view) {
        Resource.loadJson(this.url,function (error, stylesheet) {
            if (error) {
                this.visible = false;
                console.log(error);
                return;
            }
            var serviceUrl = null;
            for (var id in stylesheet.sources) { // 仅支持一个数据源
                serviceUrl = stylesheet.sources[id].url;
                break;
            }
            // 处理图层样式
            var layers = stylesheet.layers,
                layer;
            this._order = [];
            this._layers = {};
            for (var i = 0, ii = layers.length; i < ii; i += 1) {
                layer = layers[i];
                this._order.push(layer.id);
                this._layers[layer.id] = createStyleLayer(layer);
            }
            this.dispatcher.broadcast("setLayers", this._serializeLayers(this._order));
            Resource.loadJson(serviceUrl, function (err, definition) {
                if (err) {
                    this.visible = false;
                    console.log(err);
                    return;
                }
                this.sourceCache = new SourceCache("vectorBuild", {type: "vector"}, this.dispatcher, view.width, view.height, definition.tiles, this);
                this._read(view, definition, {origin: "service"});
            }.bind(this));
        }.bind(this));
    };

    VectorBuildingLayer.prototype._serializeLayers = function (ids) {
        var serializedLayers = [];
        for (var i = 0, list = ids; i < list.length; i += 1) {
            var id = list[i];
            var layer = this._layers[id];
            if (layer.type !== 'custom') {
                serializedLayers.push(layer.serialize());
            }
        }
        return serializedLayers;
    };

    VectorBuildingLayer.prototype._read = function (view, definition) {
        var extent = definition.fullExtent;
        var spatialReference = definition.spatialReference;
        extent = new Extent(Number(extent.xmin), Number(extent.ymin), Number(extent.xmax), Number(extent.ymax), spatialReference);
        // extent = new Extent(307543.51669999957, 1093440.0414000005, 784229.2726999996, 6051055.7797, spatialReference);
        var info = definition.tileInfo;
        var size = definition.tilesize;
        var dpi = info.dpi,
            origin = info.origin;
        origin = new Point(Number(origin.x), Number(origin.y));
        var lodList = [];
        info.lods.forEach(function (item) {
            lodList.push(new LOD({
                level: Number(item.level),
                scale: Number(item.scale),
                resolution: Number(item.resolution)
            }));
        });

        this.tileInfo = new TileInfo({
            lods: lodList,
            origin: origin,
            size: size
        });
        this.tileInfo.dpi = dpi;
        this.tileInfo.fullExtent = extent;
        this.layerView.tileSize = size;

        this.sourceCache.updateTileSize(size);
        this.tilePixelRatio = size/Constant.layout.EXTENT;
        view.setTileInfo(this.tileInfo);
    };

    VectorBuildingLayer.prototype.setVisible = function (visible) {
        this.visible = visible;
        this.layerView.setVisible(visible);
    }

    VectorBuildingLayer.prototype.setPaintProperty = function (layerId, name, value, options) {
        if (options === void 0) options = {};
        var layer = this.getLayer(layerId);
        if (utils.deepEqual(layer.getPaintProperty(name), value)) {
            return;
        }

        var requiresRelayout = layer.setPaintProperty(name, value, options);
        if (requiresRelayout) {
            this._updateLayer(layer);
        }

        this._changed = true;
        this._updatedPaintProps[layerId] = true;
    };

    VectorBuildingLayer.prototype.getLayer = function (id) {
        return this._layers[id];
    };

    VectorBuildingLayer.prototype.setLayoutProperty = function (layerId, name, value, options) {
        if (options === void 0) options = {};
        var layer = this.getLayer(layerId);
        if (utils.deepEqual(layer.getLayoutProperty(name), value)) {
            return;
        }

        layer.setLayoutProperty(name, value, options);
        this._updateLayer(layer);
    };

    VectorBuildingLayer.prototype._updateWorkerLayers = function (updatedIds, removedIds) {
        this.dispatcher.broadcast('updateLayers', {
            layers: this._serializeLayers(updatedIds),
            removedIds: removedIds
        });
    };

    VectorBuildingLayer.prototype._resetUpdates = function () {
        this._changed = false;
        this._updatedLayers = {};
        this._removedLayers = {};
        this._updatedSources = {};
        this._updatedPaintProps = {};
    };

    VectorBuildingLayer.prototype.update = function (parameters) {
        var changed = this._changed;
        if (this._changed) {
            var updatedIds = Object.keys(this._updatedLayers);
            var removedIds = Object.keys(this._removedLayers);

            if (updatedIds.length || removedIds.length) {
                this._updateWorkerLayers(updatedIds, removedIds);
            }
            for (var id in this._updatedSources) {
                var action = this._updatedSources[id];
                if (action === 'reload') {
                    this._reloadSource(id);
                } else if (action === 'clear') {
                    this._clearSource(id);
                }
            }

            for (var id$1 in this._updatedPaintProps) {
                this._layers[id$1].updateTransitions(parameters);
            }
            this._resetUpdates();
        }

        this.sourceCache.used = false;

        for (var i = 0, list = this._order; i < list.length; i += 1) {
            var layerId = list[i];
            var layer = this._layers[layerId];
            layer.recalculate(parameters);
            if (!layer.isHidden(parameters.zoom) && layer.source) {
                this.sourceCache.used = false;
            }
        }
        this.z = parameters.zoom;
    };

    VectorBuildingLayer.prototype._reloadSource = function (id) {
        this.sourceCache.resume();
        this.sourceCache.reload();
    };

    VectorBuildingLayer.prototype._clearSource = function (id) {
        this.sourceCache.clearTiles();
    };

    VectorBuildingLayer.prototype._updateLayer = function (layer) {
        this._updatedLayers[layer.id] = true;
        if (layer.source && !this._updatedSources[layer.source]) {
            this._updatedSources[layer.source] = 'reload';
            this.sourceCache.pause();
        }
        this._changed = true;
    };

    VectorBuildingLayer.prototype.queryFeaturesByGeometry = function (queryGeometry, params) {
        var sourceResults = [];
        queryGeometry = queryGeometry.path[0];
        sourceResults.push(
            queryVectorFeatures.queryRenderedFeatures(
                this.sourceCache,
                this._layers,
                queryGeometry,
                params,
                this.layerView.transform,
                false, this.layerView.view.resolution, this.layerView.view.level)
        );

        return sourceResults;
    }

    VectorBuildingLayer.prototype.setFeatureState = function (feature, state) {
        this.sourceCache.setFeatureState(feature.sourceLayer, feature.ids, state);
        this.layerView.view.threeRender();
    }

    return VectorBuildingLayer;
});