define("com/huayun/webgis/layers/SceneGraphicLayer", [
    "dojo/_base/declare",
    "./Layer",
    "../views/3d/layers/GraphicLayerView3D",
    "../data/GraphicIndex",
    "com/huayun/webgis/symbols/PointSymbol",
    "com/huayun/webgis/symbols/CircleSymbol",
    "com/huayun/webgis/symbols/PolygonSymbol",
    "com/huayun/webgis/symbols/LineSymbol"
], function (declare, Layer, LayerView, GraphicIndex, PointSymbol, CircleSymbol, PolygonSymbol, LineSymbol) {
    return declare("com.huayun.webgis.layers.GraphicLayer", [Layer], {

        constructor: function (params) {
            this.type = "graphic";
            this.graphics = [];
            this.id = "graphic";
            this.maxLevel = 15;
            this.minLevel = 0;
            this.opacity = 1;
            declare.safeMixin(this, params);
            this.graphicIndex = new GraphicIndex();
            this.queryPadding = 20;
            this.indexNeedUpdate = true;
            this.selectEnabled = true;
            this.highlightGraphics = [];
            if (params.graphics) {
                params.graphics.forEach(function (item) {
                    this.addGraphic(item);
                }.bind(this));
            }
        },
        /**
         * 创建视图图层
         * @param view 
         * @param option 
         */
        createLayerView: function (view, option) {
            var layerView = new LayerView({
                opacity: this.opacity,
                visible: this.visible,
                view: view,
                id: this.id,
                layer: this
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
         * 添加图形
         * @param graphic 
         */
        addGraphic: function (graphic) {
            this.graphics.push(graphic);
            graphic.layer = this;
            if (this.layerView) {
                this.layerView.addGraphic(graphic);
            }
            this.indexNeedUpdate = true;
        },
        /**
         * 移除图形，并且销毁
         * @param graphic 
         */
        removeGraphic: function (graphic) {
            if (!graphic) return;
            var ii = this.graphics.length;
            for (var i = 0; i < ii; i++) {
                if (graphic.id === this.graphics[i].id) {
                    graphic.bucket.destroy();
                    this.graphics.splice(i, 1);
                    break;
                }
            }
            this.layerView.view.threeRender();
        },
        /**
         * 添加点图形
         * @param graphic 
         */
        addMultiPoint: function (graphic) {
            this.graphics.push(graphic);
            this.layerView.addMultiPoint(graphic);
        },

        removeGraphics: function (list) {
            /*for (var i = 0; i < list.length; i++) {
                var aGraphic = list[i];
                this.removeGraphic(aGraphic);
            }*/
        },

        setVisible: function (visible) {
            this.visible = visible;
            this.layerView.setVisible(visible);
        },
        /**
         * 更新
         */
        refresh: function () {
            // this.layerViews.forEach(function (item) {
            //     item.refresh();
            // });
            // this.layerView.clear();
            this.layerView.view.threeRender();
        },
        /**
         * 清除
         */
        clear: function () {
            /*this.layerViews.forEach(function (item) {
                item.clear();
            });*/
            this.graphics.forEach(function (item) {
                if (item.bucket) {
                    item.bucket.destroy();
                }
            });
            this.graphics = [];
            this.layerView.view.threeRender();
        },
        /**
         * 创建序号
         */
        queryFeaturesByGeometry: function (geometry, queryPadding) {
            if (this.indexNeedUpdate) {
                this.graphicIndex.clear();
                this.graphics.forEach(function (item) {
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
        /**
         * 请求源特征数据
         * @param geometry 
         */
        queryRenderFeaturesByGeometry:  function (geometry, queryPadding) {
            if (this.indexNeedUpdate) {
                this.graphicIndex.clear();
                this.graphics.forEach(function (item) {
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