define("com/huayun/webgis/layers/ModelPowerLayer", [
    "./Layer",
    "../views/3d/layers/ModelPowerLayerView",
    "../utils/Resource",
    "../Model",
    "../utils/wktUtil",
    "../ModelGraphic",
    "../geometry/Point",
    "../geometry/CylinderGeometry",
    "../geometry/ExtrusionGeometry",
    "custom/kdbush.min"
], function (Layer, ModelPowerLayerView, Resource, Model, wktUtil, ModelGraphic, Point, CylinderGeometry, ExtrusionGeometry, KDBush) {

    var half = 17;
    var second = 15;
    var sh = 10;
    var pos = [
        [
            [-half, 0]
        ],
        [
            [-half, 0],
            [half, 0]
        ],
        [
            [-half, 0],
            [-second, sh],
            [half, 0]
        ],
        [
            [-half, 0],
            [-second, sh],
            [second, sh],
            [half, 0]
        ]
    ]

    function angleOfVecs(a, b) {
        var x1 = a[0],
            y1 = a[1],
            x2 = b[0],
            y2 = b[1];
        var len1 = x1 * x1 + y1 * y1;

        if (len1 > 0) {
            //TODO: evaluate use of glm_invsqrt here?
            len1 = 1 / Math.sqrt(len1);
        }

        var len2 = x2 * x2 + y2 * y2;

        if (len2 > 0) {
            //TODO: evaluate use of glm_invsqrt here?
            len2 = 1 / Math.sqrt(len2);
        }

        var cosine = (x1 * x2 + y1 * y2) * len1 * len2;
        if (cosine > 1.0) {
            return 0;
        } else if (cosine < -1.0) {
            return Math.PI;
        } else {
            return Math.acos(cosine);
        }
    }

    function directionofVecs(a, b) {
        return a[0] * b[1] - a[1] * b[0];
    }

    function ModelPowerLayer(params) {
        Layer.call(this, params);
        this.id = params.id || "modelPower";
        this.name = "立体电网";
        this.url = params.url;
        this.visible = params.visible === undefined ? true : params.visible;
        this.layerView = null;
        this.filterLayers = params.filterLayers;
        this.model = new Model({
            url: params.model
        });
        this.kdbush = null;
        var self = this;
        this.fallback = params.fallback;
        this.fallbackSymbol = params.fallbackSymbol;

        this.minLevel = params.minLevel;
        this.maxLevel = params.maxLevel;
        this.fallbackLevel = params.fallbackLevel;
        this.substation = params.substation;
        this.substationSymbol = params.substationSymbol;

        /*var fallback = */
        CylinderGeometry.createGeometry(this.fallback);
        Resource.loadJson(this.url, function (err, response) {
            if (err) {
                console.log(err);
                return;
            }
            var data = response.data;
            var points = [];
            var tower = {};
            var nextVertex, nextNormal, prevNormal, currentVertex, prevVertex;
            var defaultNormal = new Point(0, 1);
            var indice = 0;
            self.lineID2Name = {};
            for (var i = 0, ii = data.length; i < ii; i++) {
                var line = data[i];
                self.lineID2Name[line.ID] = line.NAME;

                var PHYSICTOWER = line.PHYSICTOWER;
                PHYSICTOWER.forEach(function (tower) {
                    tower.shape = wktUtil.parse2Geometry(tower.SHAPE);

                })

                var len = PHYSICTOWER.length;
                var init = new Point(0, 1);
                var prev = null;
                var modelGraphic;
                PHYSICTOWER.forEach(function (item, index) {
                    if (tower.hasOwnProperty(item.ID)) {
                        modelGraphic = points[tower[item.ID]];
                        modelGraphic.lines += "," + line.ID;
                        modelGraphic.psize++;
                    } else {
                        var rotateZ = undefined;
                        if (index !== len - 1) {
                            nextVertex = PHYSICTOWER[index + 1].shape;
                            if (nextNormal) {
                                prevNormal = nextNormal;
                            }
                            if (currentVertex) {
                                prevVertex = currentVertex;
                            }
                            currentVertex = item.shape;
                            nextNormal = nextVertex ? nextVertex.sub(currentVertex)._unit()._perp() : prevNormal;
                            prevNormal = prevNormal || nextNormal;
                            var joinNormal = prevNormal.add(nextNormal);
                            if (joinNormal.x !== 0 || joinNormal.y !== 0) {
                                joinNormal._unit();
                            }
                            var cosHalfAngle = joinNormal.x * init.x + joinNormal.y * init.y;
                            var direction = joinNormal.x * init.y - joinNormal.y * init.x;
                            if (direction > 0) {
                                rotateZ = -Math.acos(cosHalfAngle);
                            } else {
                                rotateZ = Math.acos(cosHalfAngle);
                            }
                        } else {
                            joinNormal = defaultNormal;
                        }
                        modelGraphic = new ModelGraphic({
                            model: self.model,
                            position: item.shape,
                            rotateX: Math.PI / 2,
                            rotateY: Math.PI / 2,
                            rotateZ: rotateZ,
                            scale: [1, 1, 1],
                            fallback: self.fallback
                        });
                        modelGraphic.id = item.ID;
                        modelGraphic.TOWERNO = item.TOWERNO;
                        modelGraphic.NAME = item.NAME;
                        modelGraphic.psize = 1;
                        modelGraphic.prev = [];
                        modelGraphic.next = [];
                        modelGraphic.joinNormal = joinNormal;
                        modelGraphic.lines = line.ID;
                        modelGraphic.actowerName = [];
                        modelGraphic.type = "tower";
                        points[indice] = modelGraphic;
                        tower[item.ID] = indice;
                        indice++;
                    }
                    if (prev) {
                        /*
                        modelGraphic.prev.push(prev);*/
                        var l1 = prev.next.length;
                        var l2 = modelGraphic.prev.length;
                        if (l1 === 0 || (l1 > 0 && prev.next[l1 - 1].id !== modelGraphic.id)) {
                            prev.next.push(modelGraphic);
                        }
                        if (l2 === 0 || (l2 > 0 && modelGraphic.prev[l2 - 1].id !== prev.id)) {
                            modelGraphic.prev.push(prev)
                        }
                    }
                    prev = modelGraphic;
                });
            }
            data = response.substation;
            for (i = 0, ii = data.length; i < ii; i++) {
                var sub = data[i];
                sub.shape = wktUtil.parse2Geometry(sub.SHAPE)[0];
                var center = sub.shape.extent.center;
                modelGraphic = new ModelGraphic({
                    model: self.model,
                    position: new Point(center.x, center.y, 0),
                    fallback: self.substation
                });
                modelGraphic.NAME = sub.NAME;
                modelGraphic.type = "substation";
                modelGraphic.shape = new ExtrusionGeometry({
                    path: sub.shape.path,
                    length: 50
                });
                modelGraphic.id = sub.FID;
                points.push(modelGraphic);
            }
            self.kdbush = new KDBush(points, function (p) {
                return p.position.x;
            }, function (p) {
                return p.position.y
            });
            self.points = points;
            // 处理多回线
            self.handleParallel();
        })
    }

    if (Layer) ModelPowerLayer.__proto__ = Layer;
    ModelPowerLayer.prototype = Object.create(Layer && Layer.prototype);
    ModelPowerLayer.prototype.constructor = ModelPowerLayer;

    ModelPowerLayer.prototype.handleParallel = function () {
        var lineOffset = {};
        this.points.forEach(function (mp) {
            if (mp.type === "substation") {
                return;
            }

            var vecLines = [];
            mp.acTower = {};
            var offsetArray = pos[mp.psize - 1];
            if (mp.psize > 1 && mp.prev.length === mp.psize) { // 多回路起点
                var prev = mp.prev;
                var lines = mp.lines;
                lines = lines.split(",");
                for (var m = 0; m < mp.psize; m++) {
                    var p = prev[m];
                    vecLines.push([
                        mp.position.x - p.x,
                        mp.position.y - p.y
                    ]);
                }
                var np = mp.next[0];
                var vecParallel = [
                    np.position.x - mp.position.x,
                    np.position.y - mp.position.y
                ];
                var angles = vecLines.map(function (item, index) {
                    var angle = angleOfVecs(vecParallel, item);
                    var direction = directionofVecs(vecParallel, item);
                    if (direction > 0) { // 逆时针
                        angle = -angle;
                    }
                    return {
                        angle: angle,
                        index: index
                    };
                });
                angles.sort(function (a, b) {
                    return b.angle - a.angle;
                });
                lineOffset = {};
                for (var i = 0; i < angles.length; i++) {
                    var index = angles[i].index;
                    var unit = offsetArray[i];
                    lineOffset[lines[index]] = unit;
                    mp.acTower[lines[index]] = mp.position.add(mp.joinNormal.mult(unit[0]));
                    mp.acTower[lines[index]].z = unit[1];
                }
            } else if (mp.psize > 1) {
                for (var lId in lineOffset) {
                    mp.acTower[lId] = mp.position.add(mp.joinNormal.mult(lineOffset[lId][0]));
                    mp.acTower[lId].z = lineOffset[lId][1];
                }
            } else {
                mp.acTower[mp.lines] = mp.position.add(mp.joinNormal.mult(offsetArray[0][0]));
                mp.acTower[mp.lines].z = offsetArray[0][1];
            }
        });
    }

    ModelPowerLayer.prototype.createLayerView = function (view, option) {
        var layerView = new ModelPowerLayerView({
            width: view.width,
            height: view.height,
            opacity: this.opacity,
            visible: this.visible,
            view: view,
            id: this.id,
            layer: this
        });
        this.layerView = layerView;
        layerView.transform = view.viewpoint;
        for (var id in this.models) {
            this.models[id].load(view, function () {
                view.threeRender();
            });
        }
        return layerView;
    };

    ModelPowerLayer.prototype.fetchData = function (extent, callback) {
        var url = this.getUrl(extent);
        return Resource.loadJson(url, callback);
    };

    ModelPowerLayer.prototype.getUrl = function (extent) {
        return this.url + "/identify?layers=" + this.filterLayers + "&access_token=" + accessToken + "&f=json&geometryType=esriGeometryEnvelope&geometry=" + extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax + "&tolerance=0"
    }

    return ModelPowerLayer;
})