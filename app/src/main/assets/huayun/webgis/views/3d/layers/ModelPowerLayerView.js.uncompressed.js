define("com/huayun/webgis/views/3d/layers/ModelPowerLayerView", [
    "./LayerView3D",
    "../../../utils/extendClazz",
    "../../../ModelGraphic",
    "../../../geometry/Point",
    "../../../gl/mode",
    "../../../geometry/Extent",
    "../../../geometry/Polyline",
    "../../../symbols/LineSymbol",
    "../../../symbols/TextSymbol",
    "../../../Feature",
    "../../../Graphic",
], function (LayerView3D, extendClazz, ModelGraphic, Point, mode, Extent, Polyline, LineSymbol,
             TextSymbol, Feature, Graphic) {

    function ModelPowerLayerView(params) {
        LayerView3D.call(this, params);
        this.visible = params.visible;
        this.id = params.id;
        this.layer = params.layer;
        this.view = params.view;
        this.modelGraphics = [];
        this.extent = new Extent(0, 0, 0, 0);
        this.lineGraphics = {};
        this.textGraphics = {};
        this.handledSubstation = {};
        this.lineSymbol = new LineSymbol({
                width: 3,
                color: window.lineColor || "#F00"
            });
        this.current = {};
    }

    extendClazz(ModelPowerLayerView, LayerView3D);

    ModelPowerLayerView.prototype.refresh = function () {
        this._readyData();
        this.view.threeRender();
    }

    ModelPowerLayerView.prototype._readyData = function () {
        /*if (this.visible) {
            var extent = this.view.getExtent();
            if (extent) {
                var self = this;
                if (this._promise) {
                    this._promise.cancel();
                }
                this._promise = this.layer.fetchData(extent, function (err, data) {
                    self._promise = null;
                    if (err) {
                        console.log(err);
                        return;
                    }
                    self.modelGraphics = [];
                    var result = data.results;
                    console.log(result);
                    result.forEach(function (item, index) {
                        var layerName = item.layerName;
                        if (self.layer.models[layerName]) {
                            var modelGraphic = new ModelGraphic({
                                model: self.layer.models[layerName],
                                position: new Point(item.geometry.x, item.geometry.y),
                                rotateX: Math.PI / 2,
                                rotateY: Math.PI / 2,
                                rotateZ: 0,
                                scale: [1, 1, 1]
                            });
                            self.modelGraphics.push(modelGraphic);
                        }
                    });
                });
            }
        }*/
    }

    ModelPowerLayerView.prototype.addModel = function (model) {
        model.add(this.view);
    }

    ModelPowerLayerView.prototype._render = function () {
        var minLevel = this.layer.minLevel,
            maxLevel = this.layer.maxLevel,
            fallbackLevel = this.layer.fallbackLevel;
        var visible = this.visible;
        var useFallback = false;
        var level = this.view.viewpoint.targetZoom || this.view.viewpoint.level;
        if (minLevel && level < minLevel) {
            visible = false;
        }
        if (maxLevel && level >= maxLevel) {
            visible = false;
        }
        if (fallbackLevel && level < fallbackLevel) {
            useFallback = true;
        }


        if (visible && this.layer.kdbush) {
            var self = this;
            this.depthRangeFor3D = [0, 1 - ((1 + this.view.currentLayer) * this.view.numSublayers) * this.view.depthEpsilon];
            var extent = this.view.getExtent();
            /*this.modelGraphics.forEach(function (item) {
                item.render(self);
            });*/
            if (extent && !this.extent.equals(extent)) {
                this.extent = extent;
                this.current = {};
                this.modelGraphics = [];
                this.substationGraphics = [];
                var selectGraphics = this.layer.kdbush.range(extent.xmin, extent.ymin, extent.xmax, extent.ymax).sort(function (a, b) {
                    return a - b;
                });

                /*
                this.modelGraphics = selectGraphics.filter(function (id) {
                    return self.layer.points[id].type === "tower";
                }).map(function (id) {
                    var m = self.layer.points[id];
                    self.current[m.id] = true;
                    return m;
                });*/

                for (var i = 0; i < selectGraphics.length; i++) {
                    var selectTower = self.layer.points[selectGraphics[i]];
                    if (selectTower.type === "tower") {
                        self.current[selectTower.id] = true;
                        this.modelGraphics.push(selectTower);
                    } else {
                        this.substationGraphics.push(selectTower);
                    }
                }

                for (i = 0; i < Math.min(1, this.modelGraphics.length); i++) {
                    this.addModel(this.modelGraphics[i]);
                }
            }
            var textG = [];
            var substationG = [];
            this.substationGraphics.forEach(function (sub) {
                sub.useFallback = true;
                if (self.handledSubstation.hasOwnProperty(sub.id)) {
                    substationG.push(self.handledSubstation[sub.id]);
                } else {
                    var ef = new Feature({
                        geometry: sub.shape,
                        attributes: {}
                    });
                    var eg = new Graphic({
                        feature: ef,
                        symbol: self.layer.substationSymbol
                    });
                    eg.base = sub.position;
                    // eg.position = sub.position;
                    self.layer.substationLayer.renderer.add(self.view, eg, eg.feature.geometry, eg.symbol);
                    self.handledSubstation[sub.id] = eg;
                    substationG.push(eg);
                }
                // sub.renderSubstation(self, self.layer.substationSymbol);
                if (level >= self.layer.textLayer.minLevel) {
                    var totalName = sub.NAME;
                    if (self.textGraphics.hasOwnProperty(totalName)) {
                        textG.push(self.textGraphics[totalName])
                    } else {
                        var textSymbol = new TextSymbol({
                            color: window.substationTextColor||"#0FF",
                            text: totalName,
                            size: 12,
                            font: "微软雅黑",
                            offset: [0, 0]
                        });
                        var geometry = sub.position.clone();
                        geometry.z += 40;
                        var f = new Feature({
                            geometry: geometry,
                            attributes: {}
                        });
                        var g = new Graphic({
                            feature: f,
                            symbol: textSymbol
                        });
                        g.base = sub.position;
                        self.layer.textLayer.renderer.add(self.view, g, g.feature.geometry, g.symbol);
                        self.textGraphics[totalName] = g;
                        textG.push(g);
                    }
                }
            });
            this.layer.substationLayer.graphics = substationG;
            this.modelGraphics.forEach(function (item) {
                item.useFallback = useFallback;
                item.render(self, self.layer.fallbackSymbol);
                if (level >= self.layer.textLayer.minLevel) {
                    var acTower = item.acTower;
                    for (var id in acTower) {
                        var totalName = self.layer.lineID2Name[id] + item.NAME;
                        if (self.textGraphics.hasOwnProperty(totalName)) {
                            textG.push(self.textGraphics[totalName])
                        } else {
                            var textSymbol = new TextSymbol({
                                color: window.textColor||"#FF0",
                                text: item.NAME,
                                size: 12,
                                font: "微软雅黑",
                                offset: [0, 0]
                            });
                            var geometry = acTower[id].clone();
                            geometry.z += 40;
                            var f = new Feature({
                                geometry: geometry,
                                attributes: {}
                            });
                            var g = new Graphic({
                                feature: f,
                                symbol: textSymbol
                            });
                            g.base = item.position;
                            self.layer.textLayer.renderer.add(self.view, g, g.feature.geometry, g.symbol);
                            self.textGraphics[totalName] = g;
                            textG.push(g);
                        }
                    }
                }
            });
            var len = this.modelGraphics.length;
            var lg = [];
            if (level >= this.layer.lineLayer.minLevel) {
                for (var j = 0; j < len; j++) {
                    var m = this.modelGraphics[j];
                    for (var s = 0; s < m.next.length; s++) {
                        var nx = m.next[s];
                        // if (this.current.hasOwnProperty(nx.id)) {
                        if (nx.posMidified) {
                            var towerac = nx.acTower;
                            for (var t in towerac) {
                                if (m.acTower.hasOwnProperty(t)) {
                                    var idStr = m.id + "-" + nx.id + t;
                                    if (this.lineGraphics.hasOwnProperty(idStr)) {
                                        lg.push(this.lineGraphics[idStr]);
                                    } else {
                                        var p1 = m.acTower[t].clone();
                                        p1.z += 30;
                                        p1.base = m.position;

                                        var p2 = nx.acTower[t].clone();
                                        p2.z += 30;
                                        p2.base = nx.position;
                                        var geometry = new Polyline([
                                            [
                                                p1, p2
                                            ]
                                        ]);
                                        var feature = new Feature({
                                            geometry: geometry,
                                            attributes: {}
                                        });
                                        var g = new Graphic({
                                            feature: feature,
                                            symbol: this.lineSymbol
                                        });
                                        this.lineGraphics[idStr] = g;
                                        lg.push(g);
                                        this.layer.lineLayer.renderer.add(this.view, g, g.feature.geometry, g.symbol);
                                    }
                                }
                            }
                        }
                    }
                    for (s = 0; s < m.prev.length; s++) {
                        var nx = m.prev[s];
                        if (nx.posMidified && !this.current.hasOwnProperty(nx.id)) {
                            var towerac = nx.acTower;
                            for (var t in towerac) {
                                if (m.acTower.hasOwnProperty(t)) {
                                    var idStr = nx.id + "-" + m.id + t;
                                    if (this.lineGraphics.hasOwnProperty(idStr)) {
                                        lg.push(this.lineGraphics[idStr]);
                                    } else {
                                        var p1 = nx.acTower[t].clone();
                                        p1.z += 30;
                                        p1.base = nx.position;

                                        var p2 = m.acTower[t].clone();
                                        p2.z += 30;
                                        p2.base = m.position;
                                        var geometry = new Polyline([
                                            [
                                                p1, p2
                                            ]
                                        ]);
                                        var feature = new Feature({
                                            geometry: geometry,
                                            attributes: {}
                                        });
                                        var g = new Graphic({
                                            feature: feature,
                                            symbol: this.lineSymbol
                                        });
                                        this.lineGraphics[idStr] = g;
                                        lg.push(g);
                                        this.layer.lineLayer.renderer.add(this.view, g, g.feature.geometry, g.symbol);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            this.layer.lineLayer.graphics = lg;
            this.layer.textLayer.graphics = textG;
        }
    };

    ModelPowerLayerView.prototype.zoom = function () {
        this._render();
    };

    ModelPowerLayerView.prototype.colorModeForRenderPass = function () {
        return mode.ColorMode.alphaBlended;
    };

    ModelPowerLayerView.prototype.depthModeForSublayer = function (n, mask, func) {
        // var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
        return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, this.view.depthRangeFor3D);
        // return new mode.DepthMode(this.view.context.gl.LEQUAL, mode.DepthMode.ReadWrite, this.view.depthRangeFor3D);
    }

    return ModelPowerLayerView;
})