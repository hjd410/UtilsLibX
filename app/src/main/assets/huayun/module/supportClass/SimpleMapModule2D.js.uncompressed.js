/**
 *  @author :   JiGuangJie
 *  @date   :   2019/3/5
 *  @time   :   14:35
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/module/supportClass/SimpleMapModule2D", [
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/topic",
        "./BaseMapModule",
        "com/huayun/webgis/Map",
        "../../webgis/facade/MapConfigFacade",
        "../../webgis/geometry/Extent",
        "../../webgis/layers/2d/TileLayer",
        "../../webgis/layers/2d/VectorTileLayer"
    ],
    function (declare, domConstruct, domStyle, topic, BaseMapModule, Map, MapConfigFacade, Extent, TileLayer, VectorTileLayer) {
        return declare("com.huayun.module.supportClass.SimpleMapModule2D", [BaseMapModule], {
            _mapConfigFacade: "",

            constructor: function () {
                topic.subscribe("mapLoadComplete", function () {
                    this._mapLoadCompleteHandler();
                }.bind(this));
            },

            postCreate: function () {
                this.inherited(arguments);
                domStyle.set(this.domNode, "position", "absolute");
            },

            startup: function () {
                this.inherited(arguments);
                this.map = new Map({
                    id: "map",
                    is3D: false,
                    width: this.domNode.clientWidth,
                    height: this.domNode.clientHeight,
                    maxLevel: 15
                });
                this.map.placeAt(this.domNode);
            },
            doInit: function () {
                // console.log("SimpleMapModule2D>>>>>", this.configData, this.get("configUrl"));
                var mapConfigUrl = this.get("configUrl");
                this._mapConfigFacade = new MapConfigFacade({url: mapConfigUrl});
                this._mapConfigFacade.getMapConfigData(function (data) {
                    this.configData = data;
                    var initialExtent = this._getInitialExtent(data.map);
                    this.map.setExtent(initialExtent);
                    this._createLayer(data.map);
                }.bind(this), function (err) {
                    console.log(err);
                });
            },
            /**
             * 获取初始地图范围
             * @param data
             * @returns {exports}
             * @private
             */
            _getInitialExtent: function (map) {
                var initialExtent = map.properties.initialExtent;
                return new Extent(initialExtent.minX, initialExtent.minY, initialExtent.maxX, initialExtent.maxY);
            },

            _createLayer: function (map) {
                console.log(">>>开始创建图层", map.layers);
                for (var i = 0; i < map.layers.length; i++) {
                    var layer = map.layers[i];
                    if (layer.dimensions === "2D") {
                        if (layer.type === "VectorTileLayer") {
                            var vectorTileLayer = new VectorTileLayer({
                                width: this.width,
                                height: this.height,
                                id: "tileLayer" + layer.name,
                                visible: layer.visible,
                                map: this.map,
                                tileUrl: layer.dataSource.serviceURL
                            });
                            this.map.addLayer(vectorTileLayer);
                        } else {
                            var tile = new TileLayer({
                                width: this.width,
                                height: this.height,
                                id: "tileLayer" + layer.name,
                                visible: layer.visible,
                                map: this.map,
                                tileUrl: layer.dataSource.serviceURL
                            });
                            this.map.addLayer(tile);
                        }
                    }
                }
            },
            _mapLoadCompleteHandler: function () {
                console.log("地图加载完成");
                this.map.startup();
            }
        });
    }
);