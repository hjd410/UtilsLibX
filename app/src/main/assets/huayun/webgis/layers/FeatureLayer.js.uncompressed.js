define("com/huayun/webgis/layers/FeatureLayer", [
    "dojo/_base/declare",
    "dojo/request",
    "./Layer",
    "../views/3d/layers/FeatureLayerView3D",
    "./GraphicLayer",
    "../Feature",
    "../Graphic",
    "../Attribute",
    "../../util/JSONFormatterUtil",
    "../../util/WKTGeometryFormater",
    "../../util/SymbolFactory",
    "../renderer/CompositeLineRenderer",
    "../renderer/CompositeMarkerRenderer",
    "../renderer/CompositeFillRenderer"
], function (declare, request, Layer, FeatureLayerView3D, GraphicLayer, Feature, Graphic, Attribute, JSONFormatterUtil, WKTGeometryFormater, SymbolFactory, CompositeLineRenderer, CompositeMarkerRenderer, CompositeFillRenderer) {
    return (function () {
        // 构造函数
        function FeatureLayer(params, backFun) {
            Layer.call(this, params);
            this.geoType = params.geoType;
            this.id = params.id;
            this.currentRule = params.currentRule;
            this.rules = params.rules;
            this.symbols = [];
            this.graphicsLayer = new GraphicLayer();
            switch (this.geoType) {
                case 'line':
                    this.graphicsLayer.glowRatio = 1;
                    break;
                default:
                    this.graphicsLayer.glowRatio = 3;
            }
            this.graphics = this.graphicsLayer.graphics;
            this.featureData = [];
            this.wktGeometryFormatter = new WKTGeometryFormater();
            this.symbolFactory = new SymbolFactory();
            this.createRenderer();
            this.loadComplete(params, backFun);
            this.state = false;
            this.type = "FeatureLayer";
            this.selectEnabled = true;
            this.visible = params.visible;
        }

        // 类继承
        if (Layer) FeatureLayer.__proto__ = Layer;
        FeatureLayer.prototype = Object.create(Layer && Layer.prototype);
        FeatureLayer.prototype.constructor = FeatureLayer;
        /**
         * 添加graphic到图层
         * @param graphic
         */
        FeatureLayer.prototype.addGraphic = function (graphic) {
            this.graphicsLayer.addGraphic(graphic);
        };
        /**
         * 创建图层渲染器
         * @param view
         * @returns {*}
         */
        FeatureLayer.prototype.createLayerView = function (view) {
            var layerView = new FeatureLayerView3D({
                visible: this.visible,
                layer: this,
                graphicsLayerView: this.graphicsLayer.createLayerView(view)
            });
            this.layerView = layerView;
            layerView.transform = view.viewpoint;
            // return this.graphicsLayer.createLayerView(view);
            return layerView;
        };

        /**
         * 创建Graphic
         * @param feature
         * @param symbol
         * @returns {com.huayun.webgis.Graphic|exports}
         */
        FeatureLayer.prototype._createGraphic = function (feature, symbol) {
            return new Graphic({
                feature: feature,
                symbol: symbol
            });
        };

        /**
         * 创建Feature
         * @returns {Feature|exports}
         * @param params
         */
        FeatureLayer.prototype._createFeature = function (params) {
            if (params === undefined) return null;
            var shape = params['SHAPE'];
            var geo = this.wktGeometryFormatter.toGeometry(shape);
            if (!geo) {
                return null;
            }

            var feature = new Feature({
                type: geo.type,
                geometry: geo
            });
            var tempAttributes = [];
            for (var item in params) {
                if (item === "SHAPE") continue;
                if (params.hasOwnProperty(item)) {
                    var attribute = new Attribute();
                    attribute.name = item.toLowerCase();
                    attribute.value = params[item];
                    tempAttributes[tempAttributes.length] = attribute;
                }
            }
            feature.attributes = tempAttributes;
            return feature;
            // return this.graphicsLayer.createLayerView(view);
        };
        /**
         * 获取当前图层的symbol
         * @param rule
         */
        FeatureLayer.prototype.getSymbol = function (rule) {
            return this.symbolFactory.createSymbol(rule);
        };

        FeatureLayer.prototype.loadComplete = function (params, backFun) {
            // var url;
            // if (params.dataSource.whereFilter.length > 0) {
            //     if(params.query.filter.length === 0){
            //         url = params.query.url + params.dataSource.viewId + "?filter=" + params.dataSource.whereFilter + "&access_token=" + params.query.access_token;
            //     }else{
            //         url = params.query.url + params.dataSource.viewId + "?filter=" + params.query.filter + "%26" + params.dataSource.whereFilter + "&access_token=" + params.query.access_token;
            //     }
            // } else {
            //     url = params.query.url + params.dataSource.viewId + "?filter=" + params.query.filter + "&access_token=" + params.query.access_token;
            // }
            var url = params.query.url + params.dataSource.viewId + "?filter=" + params.query.filter + "&access_token=" + params.query.access_token;
            request(url, {handleAs: "json"}).then(function (jsonData) {
                this.featureData = jsonData.data;
                // debugger;
                // this.featureData = [jsonData.data[12]];  // 测试数据
                var symbol = null;
                this.state = true;
                // this.currentRule.geoType = this.geoType;
                this.ruleSymbols = [];
                // this.currentRule = null;
                var rules = this.rules;
                for (var i = 0; i < rules.length; i++) {
                    var rule = rules[i];
                    rule.geoType = this.geoType;
                    symbol = this.getSymbol(rule);
                    this.ruleSymbols.push({
                        symbol: symbol,
                        minScale: rule.minScale,
                        maxScale: rule.maxScale,
                        label: rule.label,
                        isFixed: rule.isFixed,
                        addratio: rule.addratio
                    });
                }
                /*var len = this.featureData.length;
                var start = 0;
                if (this.id === "FeatureLayer_0") {
                    start = 2;
                    len = 3;
                }

                for (i = start; i < len; i++) {*/
                for (i = 0; i < this.featureData.length; i++) {
                    var aFeature = this.featureData[i];
                    var feature = this._createFeature(aFeature);
                    if (!feature) {
                        continue;
                    }
                    symbol = null; // symbol || this.getSymbol(feature, geo.type);
                    var graphic = this._createGraphic(feature, symbol);
                    var attributes = feature.attributes;
                    if (this.symbolFactory['_propertyName']) {
                        var propertyList = this.symbolFactory['_propertyName'].split(',');
                        var nameArr = [];
                        for (var j = 0, len = propertyList.length; j < len; j++) {
                            var property = propertyList[j];
                            for (var k = 0, len2 = attributes.length; k < len2; k++) {
                                var item = attributes[k];
                                if (item.name && property.toUpperCase() === item.name.toUpperCase() && item.value !== '') {
                                    nameArr.push(item.value);
                                    break;
                                }
                            }
                        }
                        if (nameArr.length > 0) {
                            graphic.propertyValue = nameArr.toString();
                        } else {
                            graphic.propertyValue = "DefaultValue";
                        }
                    }

                    this.addGraphic(graphic);
                }
                this.layerView.scale = 0;
                // backFun(this.featureData);
            }.bind(this));
        };

        FeatureLayer.prototype.zoomEnd = function (view) {
            var scale = view.scale;
            var targetRule;
            if (this.ruleSymbols) {
                for (var i = 0; i < this.ruleSymbols.length; i++) {
                    var rule = this.ruleSymbols[i];
                    if (scale >= rule.minScale && scale <= rule.maxScale) {
                        targetRule = rule;
                        break;
                    }
                }
            }
            this.currentRule = targetRule;
            this.graphicsLayer.graphics.forEach(function (graphic) {
                if (!graphic.isChangeSymbol) return;
                if (targetRule) {
                    if (graphic.propertyValue) {
                        for (var key in targetRule.symbol) {
                            if (targetRule.symbol.hasOwnProperty(key)) {
                                var keyArr = key.split("-");
                                if (keyArr.length === 1) {
                                    graphic.symbol = targetRule.symbol[graphic.propertyValue] || targetRule.symbol["DefaultValue"];
                                    break;
                                } else if (keyArr.length > 1) {
                                    var propertyValue = Number(graphic.propertyValue);
                                    if (propertyValue <= Number(keyArr[0]) && propertyValue >= Number(keyArr[1])) {
                                        graphic.symbol = targetRule.symbol[key];
                                        break;
                                    }
                                }
                            }
                        }
                    } else {
                        graphic.symbol = targetRule.symbol;
                    }
                } else {
                    graphic.symbol = null;
                }
                // this.currentRule = targetRule;
                if (graphic.symbol && graphic.symbol.props) {
                    var props = graphic.symbol.props;
                    var attributes = graphic.feature.attributes;
                    var len = attributes.length;
                    for (var id in props) {
                        var fieldName = props[id].fieldName.toUpperCase();
                        for (var j = 0; j < len; j++) {
                            var attr = attributes[j];
                            if (attr.name && fieldName === attr.name.toUpperCase() && attr.value !== '') {
                                if (id === "rotation" || id === "markerRotation") {
                                    graphic[id] = attr.value / 180 * Math.PI;
                                } else {
                                    graphic[id] = attr.value;
                                }
                                break;
                            }
                        }
                    }
                }
                // graphic.symbol = this.getSymbol(graphic.feature, graphic.feature.geometry.type);
                if (!graphic.added && graphic.symbol) {
                    this.graphicsLayer.updateGraphic(graphic);
                }
            }.bind(this));
        };

        FeatureLayer.prototype.createRenderer = function () {
            switch (this.geoType) {
                case "point":
                    this.graphicsLayer.setRenderer(new CompositeMarkerRenderer());
                    break;
                case 'line':
                    this.graphicsLayer.setRenderer(new CompositeLineRenderer());
                    break;
                case 'polygon':
                    this.graphicsLayer.setRenderer(new CompositeFillRenderer());
                    break;
            }
            // this.graphicsLayer.createRenderer(renderer);
        };

        FeatureLayer.prototype.queryGraphicsByGeometry = function (geometry, queryPadding) {
            return this.graphicsLayer.queryFeaturesByGeometry(geometry, queryPadding);
        };

        FeatureLayer.prototype.clear = function () {
            this.graphicsLayer.clear();
        };

        return FeatureLayer;
    }());
});
