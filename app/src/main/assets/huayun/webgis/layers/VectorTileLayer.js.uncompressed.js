/**
 * 矢量切片图层
 */
define("com/huayun/webgis/layers/VectorTileLayer", [
    "../utils/Resource",
    "./Layer",
    "./support/style/createStyleLayer",
    "./support/SourceCache",
    "./support/LOD",
    "./support/TileInfo",
    "../views/3d/layers/VectorTileLayerView3D",
    "../work/Dispatcher",
    "../gl/GlyphManager",
    "../gl/ImageManager",
    "../gl/ImageAtlas",
    "../utils/image",
    "../utils/Constant",
    "../utils/utils",
    "../geometry/Extent",
    "../geometry/Point"
], function (Resource, Layer, createStyleLayer, SourceCache, LOD, TileInfo, LayerView, Dispatcher, GlyphManager, ImageManager, ImageAtlas, imageUtil, Constant, utils, Extent, Point) {
    /**
     * 矢量切片图层
     * @constructor
     * @alias com.huayun.webgis.layers.VectorTileLayer
     * @extends {Layer}
     * @param {Object} params 构造函数参数
     * @param {string}  params.id  图层id
     * @param {String} params.url 图层元数据地址
     * @property {string}  type  图层类型
     * @property {string}  id  图层id
     * @example
     * var layer2 = new VectorTileLayer({
     *    id: "vector",
     *    url: "xxx",
     *    visible: true
     * });
     */
    var VectorTileLayer = function (params) {
        Layer.call(this, params);
        this.id = params.id || "vectorLayer";
        this.url = params.url;
        this.name = params.name || "矢量切片背景图";
        this.type = "Tile";

        this.dispatcher = new Dispatcher(this); // 创建多线程
        this.glyphManager = new GlyphManager("sans-serif");
        this.imageManager = new ImageManager();

        this.tileInfo = null;
        this.layerView = null;

        this._changed = false;
        this._updatedLayers = {};
        this._removedLayers = {};
        this._updatedSources = {};
        this._updatedPaintProps = {};
    };
    if (Layer) VectorTileLayer.__proto__ = Layer;
    VectorTileLayer.prototype = Object.create(Layer && Layer.prototype);
    VectorTileLayer.prototype.constructor = VectorTileLayer;

    /**
     * 创建矢量切片的LayerView
     * @param view
     * @param option
     * @return VectorTileLayerView3D
     */
    VectorTileLayer.prototype.createLayerView = function (view, option) {
        var layerView = new LayerView({
            visible: this.visible,
            view: view,
            id: this.id,
            layer: this
        });
        this._loadStyle(view);
        this.layerView = layerView;
        layerView.transform = view.viewpoint;
        return layerView;
    };

    /**
     * 加载矢量切片的样式配置
     * @private
     */
    VectorTileLayer.prototype._loadStyle = function (view) {
        var obj = this;
        Resource.loadJson(this.url, function (error, stylesheet) {
            if (error) {
                console.log(error);
                obj.visible = false;
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
            obj._order = [];
            obj._layers = {};
            for (var i = 0, ii = layers.length; i < ii; i += 1) {
                layer = layers[i];
                obj._order.push(layer.id);
                obj._layers[layer.id] = createStyleLayer(layer);
            }
            obj.glyphManager.setURL(stylesheet.glyphs);
            obj.dispatcher.broadcast("setLayers", obj._serializeLayers(obj._order));
            // 请求地图元数据
            Resource.loadJson(serviceUrl, function (err, definition) {
                if (err) {
                    obj.visible = false;
                    return;
                }
                obj._addSource(id, stylesheet.sources[id], {validate: false}, view, definition.tiles);
                Resource.loadJson(stylesheet.sprite + ".json", function (e, json) {
                    if (e) {
                        console.log(e);
                        obj.visible = false;
                        return;
                    }
                    Resource.loadImage(stylesheet.sprite + ".png", function (er, image) {
                        if (er) {
                            console.log(er);
                            obj.visible = false;
                            return;
                        }
                        obj._initImageManager(image, json);
                        obj._handleMetaData(view, definition);
                    })
                })
            })
        })
    };

    VectorTileLayer.prototype.updateStyle = function(stylesheet) {
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
    }

    /**
     * 序列化图层样式数据, 方便传递到worker线程中
     * @param ids
     * @return {Array}
     * @private
     */
    VectorTileLayer.prototype._serializeLayers = function (ids) {
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

    /**
     * 创建SourceCache, 管理切片
     * @param id
     * @param source
     * @param options
     * @param view
     * @param url
     * @private
     */
    VectorTileLayer.prototype._addSource = function (id, source, options, view, url) {
        this.sourceCache = new SourceCache(id, source, this.dispatcher, view.width, view.height, url, this);
    };

    /**
     * 初始化矢量切片icon的管理类ImageManager
     * @param image
     * @param json
     * @private
     */
    VectorTileLayer.prototype._initImageManager = function (image, json) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        var imageData = ctx.getImageData(0, 0, image.width, image.height);
        for (var id in json) {
            var ref = json[id],
                width = ref.width,
                height = ref.height,
                x = ref.x,
                y = ref.y,
                sdf = ref.sdf,
                pixelRatio = ref.pixelRatio;
            var rgbaImage = new imageUtil.RGBAImage({width: width, height: height});
            imageUtil.RGBAImage.copy(imageData, rgbaImage,
                {x: x, y: y},
                {x: 0, y: 0},
                {width: width, height: height}
            );
            this.imageManager.addImage(id, {
                data: rgbaImage,
                pixelRatio: pixelRatio,
                sdf: sdf
            });
        }
        this.imageManager.addImage("default_icon", {
            data: rgbaImage,
            pixelRatio: pixelRatio,
            sdf: sdf
        });
        this.imageManager.setLoaded(true);
        this.imageAatlas = new ImageAtlas(
            this.imageManager.images,
            {}
        );
    };
    /**
     * 处理坐标系相关的元数据
     * @param view
     * @param definition
     * @private
     */
    VectorTileLayer.prototype._handleMetaData = function (view, definition) {
        var extent = definition.fullExtent;
        var spatialReference = definition.spatialReference;
        extent = new Extent(Number(extent.xmin), Number(extent.ymin), Number(extent.xmax), Number(extent.ymax), spatialReference);
        var info = definition.tileInfo;
        var size = info.rows;
        var dpi = info.dpi,
            origin = info.origin;
        origin = new Point(Number(origin.x), Number(origin.y));
        var lodList = [];
        definition.lods.forEach(function (item) {
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

        this.layerView.tileSize = size; // 切片大小
        this.tileServer = definition.tiles; // 切片服务地址
        this.sourceCache.updateTileSize(size); // 设置切片大小
        this.tilePixelRatio = size / Constant.layout.EXTENT;
        this.layerView._updatePlacement(0);
        view.setTileInfo(this.tileInfo);
    };

    VectorTileLayer.prototype.getGlyphs = function (mapId, params, callback) {
        this.glyphManager.getGlyphs(params.stacks, callback);
    };

    VectorTileLayer.prototype.getImages = function (mapId, params, callback) {
        this.imageManager.getImages(params.icons, callback);
    };

    VectorTileLayer.prototype.setPaintProperty = function (layerId, name, value, options) {
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

    VectorTileLayer.prototype.getLayer = function (id) {
        return this._layers[id];
    };

    VectorTileLayer.prototype.setLayoutProperty = function (layerId, name, value, options) {
        if (options === void 0) options = {};
        var layer = this.getLayer(layerId);
        if (utils.deepEqual(layer.getLayoutProperty(name), value)) {
            return;
        }

        layer.setLayoutProperty(name, value, options);
        this._updateLayer(layer);
    };

    VectorTileLayer.prototype._updateWorkerLayers = function (updatedIds, removedIds) {
        this.dispatcher.broadcast('updateLayers', {
            layers: this._serializeLayers(updatedIds),
            removedIds: removedIds
        });
    };

    VectorTileLayer.prototype._resetUpdates = function () {
        this._changed = false;
        this._updatedLayers = {};
        this._removedLayers = {};
        this._updatedSources = {};
        this._updatedPaintProps = {};
    };

    VectorTileLayer.prototype.update = function (parameters) {
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
        if (changed) {
            // this.fire(new __chunk_1.Event('data', {dataType: 'style'}));
        }
    };

    VectorTileLayer.prototype._reloadSource = function (id) {
        this.sourceCache.resume();
        this.sourceCache.reload();
    };

    VectorTileLayer.prototype._clearSource = function (id) {
        this.sourceCache.clearTiles();
    };

    VectorTileLayer.prototype._updateLayer = function (layer) {
        this._updatedLayers[layer.id] = true;
        if (layer.source && !this._updatedSources[layer.source]) {
            this._updatedSources[layer.source] = 'reload';
            this.sourceCache.pause();
        }
        this._changed = true;
    };

    return VectorTileLayer;
});
