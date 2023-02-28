/**
 *  @author :   JiGuangJie
 *  @date   :   2019/3/5
 *  @time   :   14:35
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/module/supportClass/SimpleMapModule3D", [
        "dojo/_base/declare",
        "dojo/dom-style",
        "dojo/topic",
        "../../util/ClassFacotry",
        "./BaseMapModule",
        "../../webgis/Map",
        "../../webgis/views/SceneView",
        // "com/huayun/webgis/layers/TileLayer",
        // "com/huayun/webgis/layers/MapImageLayer",
        "../../webgis/layers/GraphicLayer",
        "../../webgis/facade/MapConfigFacade",
        "../../webgis/geometry/Extent",
        "../../webgis/layers/TerrainLayer"
    ],
    function (declare, domStyle, topic, ClassFacotry, BaseMapModule, Map, SceneView, /*TileLayer, MapImageLayer,*/ GraphicLayer, MapConfigFacade, Extent, TerrainLayer) {
        return declare("com.huayun.module.supportClass.SimpleMapModule3D", [BaseMapModule], {
            _mapConfigFacade: "",
            // 为兼容以前代码, 基础的图层类型TileLayer, MapImageLayer不异步加载
            _layerList: {
                TileMapServiceLayer: {clazz: "com.huayun.webgis.layers.TileLayer", id: "tile"},
                VectorTileLayer: {clazz: "com.huayun.webgis.layers.VectorTileLayer", id: "vector"},
                VectorBuildLayer: {clazz: "com.huayun.webgis.layers.VectorBuildingLayer", id: "build"},
                PowerLayer: {clazz: "com.huayun.webgis.layers.MapImageLayer", id: "power"},
                HeatmapLayer: {clazz: "com.huayun.webgis.layers.HeatmapLayer", id: "heatmap"},
                TerrainLayer: {clazz: "com.huayun.webgis.layers.TerrainLayer", id: "tile"}
            },

            constructor: function () {
                topic.subscribe("mapLoadComplete", function () {
                    this._mapLoadCompleteHandler();
                }.bind(this));
            },

            postCreate: function () {
                this.inherited(arguments);
                domStyle.set(this.domNode, "position", "absolute");
                domStyle.set(this.domNode, "pointer-events", "all");
            },

            startup: function () {
                this.inherited(arguments);
            },

            doInit: function () {
                var mapConfigUrl = this.get("configUrl");
                this._mapConfigFacade = new MapConfigFacade({url: mapConfigUrl});
                this._mapConfigFacade.getMapConfigData(function (data) {
                    this.map = new Map({
                        id: "map"
                    });
                    this.view = new SceneView({
                        is3DVision: data.map.properties.is3D,
                        rotateEnabled: data.map.properties.rotateEnabled,
                        container: this.domNode,
                        map: this.map,
                        backgroundColor: data.environment.bgColor.fill,
                        maxPitch: data.map.properties.maxPitch,
                        maxLevel: data.map.properties.maxLevel
                    });
                    this._createLayer(data.map.layers, this.view, function () {
                        var initialExtent = this._getInitialExtent(data.map);
                        this.view.setExtent(initialExtent);
                        topic.publish("layerComplete", this);
                    }.bind(this));
                }.bind(this), function (err) {
                    console.log(err);
                });
            }
            ,
            /**
             * 获取初始地图范围
             * @param map
             * @returns {exports}
             * @private
             */
            _getInitialExtent: function (map) {
                var initialExtent = map.properties.initialExtent;
                return new Extent(initialExtent.minX, initialExtent.minY, initialExtent.maxX, initialExtent.maxY);
            },
            /**
             * 创建图层
             * @param layers
             * @private
             */
            _createLayer: function (layers, view, complete) {
                var len = layers.length, index = 0;
                addLayer2Map.call(this, index);

                function addLayer2Map(index) {
                    if (index < len) {
                        var theLayer = layers[index], factory = null, aClazz = "";
                        if (typeof theLayer.clazz === "undefined") {
                            aClazz = this._layerList[theLayer.type].clazz;
                        } else {
                            aClazz = theLayer.clazz;
                        }
                        factory = new ClassFacotry({
                            clazz: aClazz
                        });
                        factory.newInstance({
                            name: theLayer.name,
                            id: this._layerList[theLayer.type].id || theLayer.id,
                            url: theLayer["dataSource"].serviceURL,
                            visible: theLayer.visible,
                            options: theLayer,
                            imageUrl: theLayer["dataSource"].imageUrl
                        }, function (layer) {
                            this.map.addLayer(layer);
                            if (layer instanceof TerrainLayer) {
                                view.ground = layer;
                            }
                            index++;
                            addLayer2Map.call(this, index);
                        }.bind(this), true);
                        /*var layer;
                        if (aClazz === "com.huayun.webgis.layers.TileLayer") {
                            layer = new TileLayer({
                                name: theLayer.name,
                                id: this._layerList[theLayer.type].id || theLayer.id,
                                url: theLayer["dataSource"].serviceURL,
                                visible: theLayer.visible,
                                options: theLayer
                            });
                            this.map.addLayer(layer);
                            index++;
                            addLayer2Map.call(this, index);
                        } else if (aClazz === "com.huayun.webgis.layers.MapImageLayer") {
                            layer = new MapImageLayer({
                                name: theLayer.name,
                                id: this._layerList[theLayer.type].id || theLayer.id,
                                url: theLayer["dataSource"].serviceURL,
                                visible: theLayer.visible,
                                options: theLayer
                            });
                            this.map.addLayer(layer);
                            index++;
                            addLayer2Map.call(this, index);
                        } else {
                            factory = new ClassFacotry({
                                clazz: aClazz
                            });
                            factory.newInstance({
                                name: theLayer.name,
                                id: this._layerList[theLayer.type].id || theLayer.id,
                                url: theLayer["dataSource"].serviceURL,
                                visible: theLayer.visible,
                                options: theLayer
                            }, function (layer) {
                                this.map.addLayer(layer);
                                index++;
                                addLayer2Map.call(this, index);
                            }.bind(this), true);
                        }*/
                    } else {
                        var graphicLayer = new GraphicLayer({
                            name: "画图图层",
                            id: "drawLayer",
                            visible: true,
                            controlEnabled: false
                        });
                        this.map.addLayer(graphicLayer);
                        complete();
                    }
                }
            },
            _mapLoadCompleteHandler: function () {
                // this.map.startup();
            }
        });
    }
);