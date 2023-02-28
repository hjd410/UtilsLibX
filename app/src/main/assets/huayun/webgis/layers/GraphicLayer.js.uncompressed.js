/**
 * 图形图层
 * @see com.huayun.webgis.layers.GraphicLayer
 */
define("com/huayun/webgis/layers/GraphicLayer", [
    "dojo/_base/declare",
    "./Layer",
    "../views/3d/layers/GraphicLayerView3D",
    "../data/GraphicIndex",
    "com/huayun/webgis/symbols/PointSymbol",
    "com/huayun/webgis/symbols/CircleSymbol",
    "com/huayun/webgis/symbols/PolygonSymbol",
    "com/huayun/webgis/symbols/LineSymbol",
    "../renderer/SimpleRenderer"
], function (declare, Layer, LayerView, GraphicIndex, PointSymbol, CircleSymbol, PolygonSymbol, LineSymbol, SimpleRenderer) {
    /**
     * 图形图层
     * @constructor
     * @alias com.huayun.webgis.layers.GraphicLayer
     * @extends {Layer}
     * @param {Object} params 构造函数参数
     * @param {string}  params.id  - 图层id
     * @param {number}  params.maxLevel  - 最大层级
     * @param {number}  params.minLevel  - 最小层级
     * @property {string}  type  - 图层类型
     * @property {Array}  graphics  - 图形数组
     * @property {string}  id  - 图层id
     * @property {number}  maxLevel  - 最大层级
     * @property {number}  minLevel  - 最小层级
     */
    return declare("com.huayun.webgis.layers.GraphicLayer", [Layer], {

        constructor: function (params) {
            params = params || {};
            this.type = "graphic";
            this.graphics = [];
            this.id = "graphic";
            this.maxLevel = params.maxLevel;
            this.minLevel = params.minLevel;
            this.opacity = 1;
            declare.safeMixin(this, params);
            this.graphicIndex = new GraphicIndex();
            this.queryPadding = 20;
            this.indexNeedUpdate = true;
            this.selectEnabled = true;
            this.highlightGraphics = [];
            this.renderer = params && params.renderer || new SimpleRenderer();
            if (params) {
                this.glowRatio = params.glowRatio === undefined ? 8 : params.glowRatio;
                if (params.graphics) {
                    params.graphics.forEach(function (item) {
                        this.addGraphic(item);
                    }.bind(this));
                }
            }
        },
        /**
         * 设置渲染器
         * @param {Renderer} renderer 渲染器
         */
        setRenderer: function (renderer) {
            this.renderer = renderer;
            // debugger
            if (this.layerView) {
                this.layerView.renderer = renderer;
            }
        },

        createLayerView: function (view, option) {
            var layerView = new LayerView({
                opacity: this.opacity,
                visible: this.visible,
                view: view,
                id: this.id,
                layer: this,
                glow: this.glow,
                renderer: this.renderer
            });
            this.layerView = layerView;
            layerView.transform = view.viewpoint;

            // 处理已经添加的Graphic
            this.graphics.forEach(function (item) {
                this.layerView.addGraphic(item);
            }.bind(this));
            return layerView;
        },
        /**
         * 添加图形到图层中
         * @param {Graphic} graphic 待添加图形
         */
        addGraphic: function (graphic, position) {
            if (position) {
                switch (position) {
                    case "first":
                        this.graphics.splice(0, 0, graphic);
                        break;
                    case "end":
                        this.graphics.push(graphic);
                        break;
                }
            } else {
                this.graphics.push(graphic);
            }
            graphic.layer = this;
            if (this.layerView) {
                this.layerView.addGraphic(graphic);
            }
            this.indexNeedUpdate = true;
        },

        updateGraphic: function (graphic) {
            this.layerView.addGraphic(graphic);
        },

        addGraphicBefore: function (graphic, id) {
            graphic.layer = this;
            var ii = this.graphics.length;
            var flag = false;
            for (var i = 0; i < ii; i++) {
                if (id === this.graphics[i].id) {
                    this.graphics.splice(i, 0, graphic);
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                this.graphics.push(graphic);
            }
            if (this.layerView) {
                this.layerView.addGraphic(graphic);
            }
            this.indexNeedUpdate = true;
        },
        /**
         * 移除图形，并且销毁
         * @param {Graphic} graphic 待移除图形
         */
        removeGraphic: function (graphic) {
            if (!graphic) return;
            var ii = this.graphics.length;
            for (var i = 0; i < ii; i++) {
                if (graphic.id === this.graphics[i].id) {
                    // graphic.bucket.destroy();
                    graphic.buckets.forEach(function (item) {
                        item.destroy();
                    });
                    graphic.buckets = [];
                    this.graphics.splice(i, 1);
                    break;
                }
            }
            this.layerView.view.threeRender();
        },
        addMultiPoint: function (graphic) {
            this.graphics.push(graphic);
            this.layerView.addMultiPoint(graphic);
        },
        /**
         * 移除多个图形
         * @param {Array} list  图形数组
         */
        removeGraphics: function (list) {
            for (var i = 0; i < list.length; i++) {
                this.removeGraphic(list[i]);
            }
        },
        /**
         * 图层是否可见
         * @param {boolean} visible  - 是否可见
         */
        setVisible: function (visible) {
            this.visible = visible;
            this.layerView.setVisible(visible);
        },
        /**
         * 更新图层
         */
        refresh: function () {
            // this.layerViews.forEach(function (item) {
            //     item.refresh();
            // });
            // this.layerView.clear();
            this.layerView.view.threeRender();
        },

        /**
         * 清除图层中所有图形
         */
        clear: function () {
            /*this.layerViews.forEach(function (item) {
                item.clear();
            });*/
            // debugger
            this.graphics.forEach(function (item) {
                if (item.bucket) {
                    item.bucket.destroy();
                }
            });
            this.graphics = [];
            this.layerView.view.threeRender();
        },

        queryFeaturesByGeometry: function (geometry, queryPadding) {
            if (this.indexNeedUpdate) {
                this.graphicIndex.clear();
                this.graphics.forEach(function (item) {
                    if (item.selectEnabled) {
                        var geometry;
                        switch (item.feature.geometry.type) {
                            case "point":
                                geometry = [[item.feature.geometry]];
                                break;
                            case "circle":
                                geometry = [[item.feature.geometry.center]];
                                break;
                            case "multipoint":
                                geometry = [item.feature.geometry.points];
                                break;
                            case "line":
                            case "polygon":
                                geometry = item.feature.geometry.path;
                                break;
                            default:
                                geometry = [[]];
                            /*case "point":
                                geometry = [[item.feature.geometry]];
                                break;
                            case "circle":
                                geometry = [[item.feature.geometry.center]];
                                break;
                            case "text":
                                return;
                            case "image":
                                geometry = [[item.feature.geometry]];
                                break;
                            default:
                                */
                        }
                        this.graphicIndex.insert(geometry, item.id);
                    }
                }.bind(this));
                this.indexNeedUpdate = false;
            }
            queryPadding = queryPadding || this.queryPadding;
            switch (geometry.type) {
                case "point":
                    geometry = [geometry];
                    break;
            }
            return this.graphicIndex.query(geometry, queryPadding, this.graphics, this.layerView.view.resolution, this.layerView.view.viewpoint);
        },
        captureFeaturesByGeometry: function (geometry, queryPadding) {
            if (this.indexNeedUpdate) {
                this.graphicIndex.clear();
                this.graphics.forEach(function (item) {
                    if (item.selectEnabled) {
                        var geometry;
                        switch (item.symbol.type) {
                            case "point":
                                geometry = [[item.feature.geometry]];
                                break;
                            case "circle":
                                geometry = [[item.feature.geometry.center]];
                                break;
                            case "text":
                                return;
                            case "image":
                                geometry = [[item.feature.geometry]];
                                break;
                            default:
                                geometry = item.feature.geometry.path;
                        }
                        this.graphicIndex.insert(geometry, item.id);
                    }
                }.bind(this));
                this.indexNeedUpdate = false;
            }
            queryPadding = queryPadding || this.queryPadding;
            switch (geometry.type) {
                case "point":
                    geometry = [geometry];
                    break;
            }
            return this.graphicIndex.captureQuery(geometry, queryPadding, this.graphics, this.layerView.view.resolution, this.layerView.view.viewpoint);
        },

        queryRenderFeaturesByGeometry: function (geometry, queryPadding) {
            if (this.indexNeedUpdate) {
                this.graphicIndex.clear();
                this.graphics.forEach(function (item) {
                    if (item.selectEnabled) {
                        var geometry;
                        switch (item.symbol.type) {
                            case "point":
                                geometry = [[item.feature.geometry]];
                                break;
                            case "circle":
                                geometry = [[item.feature.geometry.center]];
                                break;
                            case "text":
                                return;
                            case "image":
                                geometry = [[item.feature.geometry]];
                                break;
                            default:
                                geometry = item.feature.geometry.path;
                        }
                        this.graphicIndex.insert(geometry, item.id);
                    }
                }.bind(this));
                this.indexNeedUpdate = false;
            }
            queryPadding = queryPadding || this.queryPadding;
            switch (geometry.type) {
                case "point":
                    geometry = [geometry];
                    break;
            }
            return this.graphicIndex.queryRender(geometry, queryPadding, this.graphics, this.layerView.view.resolution, this.layerView.view.viewpoint);
        },
        highlightGraphic: function (graphics) {
            if (!this.highlightSymbol) {
                this.highlightSymbol = {
                    point: new PointSymbol({
                        color: "#FFFF00",
                        radius: 16
                    }),
                    line: new LineSymbol({
                        color: "#BF2BFF",
                        width: 4,
                        join: "round",
                        cap: "round"
                    }),
                    polygon: new PolygonSymbol({
                        color: "#FF4B37"
                    })
                };
            }
            var needRender = false;
            this.highlightGraphics.forEach(function (item) {
                delete item.highLightSymbol;
                needRender = true;
            }.bind(this));
            this.highlightGraphics = [];
            graphics.forEach(function (item) {
                item.highLightSymbol = this.highlightSymbol[item.symbol.type];
                needRender = true;
            }.bind(this));
            this.highlightGraphics = graphics;
            if (needRender) {
                this.layerView.view.threeRender();
            }
        }
    });
});
