/**
 *  @Author: wushengfei
 *  @Date:  2018/11/8
 *  @see com.huayun.webgis.layers.VectorBuildingLayer
 */
define("com/huayun/webgis/layers/VectorBuildingLayerBackup", [
    // dojo包依赖
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/request",
    // 自定义类依赖
    "../request",
    "./Layer",
    "../geometry/Extent",
    "../views/3d/layers/VectorBuildingLayerView3D",
    "../geometry/Point",
    "../geometry/Point2D",
    "./support/LOD",
    "./support/TileInfo",
    "../utils/image",
    "../utils/utils",
    "../utils/Constant",
    "com/huayun/webgis/gl/ImageManager",
    "com/huayun/webgis/gl/ImageAtlas",
    "./support/SourceCache",

    "./support/StyleLayer",
    "com/huayun/webgis/work/Dispatcher",
    "com/huayun/webgis/gl/GlyphManager"
], function (declare, topic, request,
             imgRequest, Layer, Extent, LayerView, Point, Point2D, LOD, TileInfo, images, utils, Constant, ImageManager, ImageAtlas, SourceCache, StyleLayer, Dispatcher, GlyphManager) {
    return declare("com.huayun.webgis.layers.VectorTileLayer", [Layer], {
        url: null,
        tileInfo: null,
        type: "VectorTileLayer",
        name: "矢量底图",
        spatialReference: null,
        layerView: null,

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.imageManager = new ImageManager();
            this._layers = {};
            this.sourceCaches = {};
            this.dispatcher = new Dispatcher(this);
            this.glyphManager = new GlyphManager("sans-serif");

            this._changed = false;
            this._updatedLayers = {};
            this._removedLayers = {};
            this._updatedSources = {};
            this._updatedPaintProps = {};
            this.tilePixelRatio = 0.0625;
        },
        /**
         * 图层序列化
         * @param ids 
         */
        _serializeLayers: function _serializeLayers(ids) {
            var serializedLayers = [];
            for (var i = 0, list = ids; i < list.length; i += 1) {
                var id = list[i];

                var layer = this._layers[id];
                if (layer.type !== 'custom') {
                    serializedLayers.push(layer.serialize());
                }
            }
            return serializedLayers;
        },
        /**
         * 添加元数据缓存
         * @param id 
         * @param source 
         * @param options 
         * @param view 
         * @param url   
         */
        _addSource: function (id, source, options, view, url) {
            var this$1 = this;
            if (options === void 0) options = {};

            if (this.sourceCaches[id] !== undefined) {
                throw new Error('There is already a source with this ID');
            }

            if (!source.type) {
                throw new Error(("The type property must be defined, but the only the following properties were given: " + (Object.keys(source).join(', ')) + "."));
            }

            var sourceCache = this.sourceCaches[id] = new SourceCache(id, source, this.dispatcher, view.width, view.height, url, this);
            /*sourceCache.style = this;
            sourceCache.onAdd(this.map);*/
        },
        /**
         * 加载样式
         * @param view 
         */
        loadStyle: function (view) {
            var obj = this;
            request(this.url, {handleAs: "json"}).then(function (stylesheet) {
                var serviceUrl = null;
                for (var id in stylesheet.sources) {
                    if (!serviceUrl) {
                        serviceUrl = stylesheet.sources[id].url;
                        break;
                    }
                }
                var layers = stylesheet.layers;
                obj._order = layers.map(function (layer) {
                    return layer.id;
                });
                obj._layers = {};
                for (var i = 0; i < layers.length; i += 1) {
                    var layer = layers[i];
                    layer = StyleLayer.createStyleLayer(layer);
                    obj._layers[layer.id] = layer;
                }
                obj.glyphManager.setURL(stylesheet.glyphs);
                obj.dispatcher.broadcast("setLayers", obj._serializeLayers(obj._order));

                request(serviceUrl, {handleAs: "json"}).then(function (definition) {
                    obj._addSource(id, stylesheet.sources[id], {validate: false}, view, definition.tiles);
                    request(stylesheet.sprite + ".json", {handleAs: "json"}).then(function (json) {
                        imgRequest(stylesheet.sprite + ".png", {responseType: "image"}).then(function (image) {
                            image = image.data;
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
                                var d = new images.RGBAImage({
                                    width: width,
                                    height: height
                                });
                                images.RGBAImage.copy(imageData, d, {x: x, y: y}, {x: 0, y: 0}, {
                                    width: width,
                                    height: height
                                });
                                obj.imageManager.addImage(id, {
                                    data: d,
                                    pixelRatio: pixelRatio,
                                    sdf: sdf
                                });
                            }
                            obj.imageManager.setLoaded(true);
                            obj.imageAatlas = new ImageAtlas(
                                obj.imageManager.images,
                                {}
                            );
                            obj._read(definition, {origin: "service"});
                        })
                    });
                });
            });
        },
        /**
         * 解析元数据
         * @param definition  元数据
         */
        _read: function (definition) {
            /*var extent = definition.fullExtent;
            var spatialReference = definition.spatialReference;
            // extent = new Extent(parseFloat(extent.xmin), parseFloat(extent.ymin), parseFloat(extent.xmax), parseFloat(extent.ymax), spatialReference);
            extent = new Extent(307543.51669999957, 1093440.0414000005, 784229.2726999996, 6051055.7797, spatialReference);
            var size = definition.tilesize;
            this.tileServer = definition.tiles;
            var info = definition.tileInfo;
            var dpi = info.dpi,
                origin = info.originPoint;
            origin = new Point(parseFloat(origin.x), parseFloat(origin.y));
            var lodList = [];
            info.lods.forEach(function (item) {
                lodList.push(new LOD({
                    level: parseInt(item.level),
                    scale: parseInt(item.scale),
                    resolution: parseFloat(item.resolution)
                }));
            });

            this.tileInfo = new TileInfo({
                lods: lodList,
                origin: origin,
                size: size
            });
            this.tileInfo.dpi = dpi;
            this.tileInfo.fullExtent = extent;
            this.visible = true;
            this.layerView.visible = true;

            topic.publish("tileInfoComplete", this.tileInfo);*/
            var extent = definition.fullExtent;
            var spatialReference = definition.spatialReference;
            // extent = new Extent(parseFloat(extent.xmin), parseFloat(extent.ymin), parseFloat(extent.xmax), parseFloat(extent.ymax), spatialReference);
            extent = new Extent(307543.51669999957, 1093440.0414000005, 784229.2726999996, 6051055.7797, spatialReference);
            this.tileServer = definition.tiles;
            var info = definition.tileInfo;
            var size = info.rows;
            var dpi = info.dpi,
                origin = info.origin;
            origin = new Point(parseFloat(origin.x), parseFloat(origin.y));
            var lodList = [];
            info.lods.forEach(function (item) {
                lodList.push(new LOD({
                    level: parseInt(item.level),
                    scale: parseInt(item.scale),
                    resolution: parseFloat(item.resolution)
                }));
            });

            this.tileInfo = new TileInfo({
                lods: lodList,
                origin: origin,
                size: size
            });
            this.tileInfo.dpi = dpi;
            this.tileInfo.fullExtent = extent;
            /*this.visible = true;
            this.layerView.visible = true;*/
            this.layerView.tileSize = size;

            for (var id in this.sourceCaches) {
                this.sourceCaches[id].updateTileSize(size);
            }
            this.tilePixelRatio = size/Constant.layout.EXTENT;
            this.layerView._updatePlacement(0);
            topic.publish("tileInfoComplete", this.tileInfo);
        },
        /**
         * 更新工作图层
         * @param updatedIds 需要更新的图层id
         * @param removedIds 需要移除的图层id
         */
        _updateWorkerLayers: function (updatedIds, removedIds) {
            this.dispatcher.broadcast('updateLayers', {
                layers: this._serializeLayers(updatedIds),
                removedIds: removedIds
            });
        },
        /**
         * 更新重置
         */
        _resetUpdates: function () {
            this._changed = false;
            this._updatedLayers = {};
            this._removedLayers = {};
            this._updatedSources = {};
            this._updatedPaintProps = {};
        },
        /**
         * 更新
         * @param parameters 参数
         */
        update: function (parameters) {
            /*if (!this._loaded) {
                return;
            }*/

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

            for (var sourceId in this.sourceCaches) {
                this.sourceCaches[sourceId].used = false;
            }

            for (var i = 0, list = this._order; i < list.length; i += 1) {
                var layerId = list[i];
                var layer = this._layers[layerId];
                layer.recalculate(parameters);
                if (!layer.isHidden(parameters.zoom) && layer.source) {
                    this.sourceCaches[layer.source].used = true;
                }
            }
            this.z = parameters.zoom;
            if (changed) {
                // this.fire(new __chunk_1.Event('data', {dataType: 'style'}));
            }
        },
        /**
         * 重加载源数据
         * @param id 
         */
        _reloadSource: function (id) {
            this.sourceCaches[id].resume();
            this.sourceCaches[id].reload();
        },
        /**
         * 清除源数据
         * @param id 
         */
        _clearSource: function (id) {
            this.sourceCaches[id].clearTiles();
        },
        /**
         * 获取图层
         * @param id  图层id
         */
        getLayer: function (id) {
            return this._layers[id];
        },
        /**
         *  设置图层属性
         * @param layerId  图层id 
         * @param name     图层名字
         * @param value    图层值
         * @param options  图层选项
         */
        setPaintProperty: function (layerId, name, value, options) {
            if (options === void 0) options = {};
            // this._checkLoaded();

            var layer = this.getLayer(layerId);
            /*if (!layer) {
                this.fire(new __chunk_1.ErrorEvent(new Error(("The layer '" + layerId + "' does not exist in the map's style and cannot be styled."))));
                return;
            }*/

            if (utils.deepEqual(layer.getPaintProperty(name), value)) {
                return;
            }

            var requiresRelayout = layer.setPaintProperty(name, value, options);
            if (requiresRelayout) {
                this._updateLayer(layer);
            }

            this._changed = true;
            this._updatedPaintProps[layerId] = true;
        },
        /**
         * 设置布局属性
         * @param layerId  图层id
         * @param name     图层名字
         * @param value    图层值
         * @param options  图层选项
         */
        setLayoutProperty: function (layerId, name, value, options) {
            if (options === void 0) options = {};

            // this._checkLoaded();

            var layer = this.getLayer(layerId);
            /*if (!layer) {
                this.fire(new __chunk_1.ErrorEvent(new Error(("The layer '" + layerId + "' does not exist in the map's style and cannot be styled."))));
                return;
            }*/

            if (utils.deepEqual(layer.getLayoutProperty(name), value)) {
                return;
            }

            layer.setLayoutProperty(name, value, options);
            this._updateLayer(layer);
        },
        /**
         * 图层更新
         * @param layer 
         * @private
         */
        _updateLayer: function (layer) {
            this._updatedLayers[layer.id] = true;
            if (layer.source && !this._updatedSources[layer.source]) {
                this._updatedSources[layer.source] = 'reload';
                this.sourceCaches[layer.source].pause();
            }
            this._changed = true;
        },
        /**
         * 创建视图图层
         * @param view 
         * @param option 
         */
        createLayerView: function (view, option) {
            var layerView = new LayerView({
                width: view.viewpoint.width,
                height: view.viewpoint.height,
                opacity: this.opacity,
                visible: this.visible,
                view: view,
                id: this.id,
                layer: this
            });
            this.loadStyle(view);
            this.layerView = layerView;
            view.vectorLayerView = layerView;

            layerView.transform = view.viewpoint;

            return layerView;
        },
        /**
         * 获取图形数据
         * @param mapId 
         * @param params 
         * @param callback 
         */
        getGlyphs: function (mapId, params, callback) {
            this.glyphManager.getGlyphs(params.stacks, callback);
        },
        /**
         * 获取图片
         * @param mapId 
         * @param params 
         * @param callback 
         */
        getImages: function (mapId, params, callback) {
            this.imageManager.getImages(params.icons, callback);
        },
        /**
         * 图层特征渲染
         * @param x 
         * @param y 
         */
        queryRenderedFeatures: function (x, y) {
            var geometry = new Point2D(x, y);
            return this.layerView.queryRenderedFeatures([geometry]);
        }
    })
});