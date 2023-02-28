define("com/huayun/webgis/layers/EditFeatureLayer", [
    "dojo/_base/declare",
    "dojo/request",
    "./Layer",
    "../views/3d/layers/EditFeatureLayerView3D",
    "./EditGraphicsLayer",
    "../Feature",
    "../Graphic",
    "../Attribute",
    "../../util/JSONFormatterUtil",
    "../../util/WKTGeometryFormater",
    "../../util/SymbolFactory",
    "../renderer/CompositeLineRenderer",
    "../renderer/CompositeMarkerRenderer",
    "../renderer/CompositeFillRenderer"
], function (declare, request, Layer, EditFeatureLayerView3D, EditGraphicsLayer, Feature, Graphic, Attribute, JSONFormatterUtil, WKTGeometryFormater, SymbolFactory, CompositeLineRenderer, CompositeMarkerRenderer, CompositeFillRenderer) {
    return (function () {
        // 构造函数
        function EditFeatureLayer(params, backFun) {
            this.geoType = params.geoType;
            this.id = params.id;
            this.name = params.name;
            this.viewId = params.dataSource.viewId;
            this.currentRule = params.currentRule;
            this.rules = params.rules;
            this.symbols = [];
            this.editGraphicsLayer = new EditGraphicsLayer();
            this.editGraphicsLayer.owner = this;
            this.graphics = this.editGraphicsLayer.graphics;
            this.featureData = [];
            this.wktGeometryFormatter = new WKTGeometryFormater();
            this.symbolFactory = new SymbolFactory();
            this.createRenderer();
            this.loadComplete(params, backFun);
            this.state = false;
        }

        // 类继承
        if (Layer) EditFeatureLayer.__proto__ = Layer;
        EditFeatureLayer.prototype = Object.create(Layer && Layer.prototype);
        EditFeatureLayer.prototype.constructor = EditFeatureLayer;

        EditFeatureLayer.prototype.add = function (params) {
        };

        EditFeatureLayer.prototype.edit = function (params) {

        };

        EditFeatureLayer.prototype.delete = function (params) {

        };

        /**
         * 添加graphic到图层
         * @param graphic
         */
        EditFeatureLayer.prototype.addGraphic = function (graphic) {
            this.editGraphicsLayer.addGraphic(graphic);
        };
        /**
         * 添加graphic到图层
         * @param graphic
         */
        EditFeatureLayer.prototype.removeGraphic = function (graphic) {
            this.editGraphicsLayer.removeGraphic(graphic);
        };
        /**
         * 创建图层渲染器
         * @param view
         * @returns {*}
         */
        EditFeatureLayer.prototype.createLayerView = function (view) {
            var layerView = new EditFeatureLayerView3D({
                visible: true,
                layer: this,
                graphicsLayerView: this.editGraphicsLayer.createLayerView(view)
            });
            this.layerView = layerView;
            layerView.transform = view.viewpoint;
            // debugger
            // return this.editGraphicsLayer.createLayerView(view);
            return layerView;
        };

        /**
         * 创建Graphic
         * @param feature
         * @param symbol
         * @returns {com.huayun.webgis.Graphic|exports}
         */
        EditFeatureLayer.prototype._createGraphic = function (feature, symbol) {
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
        EditFeatureLayer.prototype._createFeature = function (params) {
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
            // return this.editGraphicsLayer.createLayerView(view);
        };
        /**
         * 获取当前图层的symbol
         * @param rule
         * @param feature
         * @param type
         */
        EditFeatureLayer.prototype.getSymbol = function (rule, feature, type) {
            return this.symbolFactory.createSymbol(rule, feature);
        };

        EditFeatureLayer.prototype.loadComplete = function (params, backFun) {
            var url;
            if (params.dataSource.whereFilter.length > 0) {
                url = params.query.url + params.dataSource.viewId + "?filter=" + params.query.filter + "&" + params.dataSource.whereFilter + "&access_token=" + params.query.access_token;
            } else {
                url = params.query.url + params.dataSource.viewId + "?filter=" + params.query.filter + "&access_token=" + params.query.access_token;
            }
            request(url, {handleAs: "json"}).then(function (jsonData) {
                this.featureData = jsonData.data;
                var symbol = null;
                this.state = true;
                // this.currentRule.geoType = this.geoType;
                // todo 目前是简化处理, 若一个图层可以成多种geometry类型等情况需要修改
                this.ruleSymbols = [];
                if (this.featureData && this.featureData.length > 0) {
                    var aFeature = this.featureData[0];
                    var shape = aFeature['SHAPE'];
                    var geo = this.wktGeometryFormatter.toGeometry(shape);
                    var feature = this._createFeature(aFeature);
                    if (!feature) return;
                    var rules = this.rules;
                    for (var i = 0; i < rules.length; i++) {
                        var rule = rules[i];
                        rule.geoType = this.geoType;
                        symbol = this.getSymbol(rule, feature, geo.type);
                        this.ruleSymbols.push({
                            symbol: symbol,
                            minScale: rule.minScale,
                            maxScale: rule.maxScale
                        });
                    }
                }
                for (var item in this.featureData) {
                    if (this.featureData.hasOwnProperty(item)) {
                        var aFeature = this.featureData[item];
                        var shape = aFeature['SHAPE'];
                        var geo = this.wktGeometryFormatter.toGeometry(shape);
                        var feature = this._createFeature(aFeature);
                        if (!feature) {
                            continue;
                        }
                        var graphic = this._createGraphic(feature, symbol);
                        this.addGraphic(graphic);
                    }
                }
                this.layerView.graphicsLayerView.view.threeRender();
                // backFun(this.featureData);
            }.bind(this));
        };

        EditFeatureLayer.prototype.zoomEnd = function (view) {
            var scale = view.scale;
            var targetRule;
            /* this.editGraphicsLayer.graphics.forEach(function (graphic) {
                 for (var i = 0; i < this.ruleSymbols.length; i++) {
                     var rule = this.ruleSymbols[i];
                     if (scale >= rule.minScale && scale <= rule.maxScale) {
                         targetRule = rule;
                         break;
                     }
                 }
                 graphic.symbol = targetRule?targetRule.symbol:null;
                 // graphic.symbol = this.getSymbol(graphic.feature, graphic.feature.geometry.type);
                 if (!graphic.added && graphic.symbol) {
                     this.editGraphicsLayer.updateGraphic(graphic);
                 }
             }.bind(this));*/
        };

        EditFeatureLayer.prototype.createRenderer = function () {
            switch (this.geoType) {
                case "point":
                    this.editGraphicsLayer.setRenderer(new CompositeMarkerRenderer());
                    break;
                case 'line':
                    this.editGraphicsLayer.setRenderer(new CompositeLineRenderer());
                    break;
                case 'polygon':
                    this.editGraphicsLayer.setRenderer(new CompositeFillRenderer());
                    break;
            }
        };

        return EditFeatureLayer;
    }());
});
