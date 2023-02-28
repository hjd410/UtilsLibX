define(
    "com/huayun/webgis/views/3d/layers/BuildingLayerView3D", [
        "dojo/_base/declare",
        "./LayerView3D",
        "com/huayun/webgis/layers/support/Tile",
        "com/huayun/webgis/layers/support/TileHandler",
        "com/huayun/webgis/layers/support/tileCover2"
    ], function (declare, LayerView3D, Tile, tileHandler, tileCover) {
        return declare("com.huayun.webgis.views.3d.layers.BuildingLayerView3D", [LayerView3D], {
            _group: null,
            view: null,
            constructor: function (params) {
                declare.safeMixin(this, params);
                this._group = new THREE.Group();
                this._group.visible = params.visible;
                this.visible = params.visible;
                this.tileIndex = {};
                this.extrudeSettings = {
                    depth: 50,
                    bevelEnabled: false,
                    bevelSegments: 1,
                    steps: 1,
                    bevelSize: 1,
                    bevelThickness: 1,
                    curveSegments: 1
                };

                this.material = new THREE.MeshLambertMaterial({
                    color: 0xdddddd,
                    transparent: false,
                    opacity: 1
                });

                this._currentIndex = {};
            },
            /**
             * 刷新
             */
            refresh: function () {
                if (this.visible) {
                    this._readyData();
                    this._render();
                }
            },
            /**
             * 准备数据
             */
            _readyData: function () {
                var level = this.view.level;
                if (level > this.layer.maxLevel || level < this.layer.minLevel) { // 不显示
                    if (this._group.visible) {
                        // this.visible = false;
                        this._group.visible = false;
                        this.view.threeRender();
                    }
                } else { // 显示
                    if (this.visible) {
                        this._group.visible = true;
                        var tileInfo = this.view._tileInfo,
                            extent = this.view.extent,
                            size = tileInfo.size,
                            center = this.view.center,
                            resolution = this.view.resolution,
                            rs = resolution * size;
                        /*var startCol = Math.floor(tileInfo.getColForX(extent.minx, resolution)),
                            endCol = Math.ceil(tileInfo.getColForX(extent.maxx, resolution)),
                            startRow = Math.floor(tileInfo.getRowForY(extent.maxy, resolution)),
                            endRow = Math.ceil(tileInfo.getRowForY(extent.miny, resolution));
                        this._startCol = startCol;
                        this._startRow = startRow;
                        this._offSetX = (extent.minx - (startCol * rs + tileInfo.origin.x)) / resolution;//(tileInfo.origin.x - center.x)/resolution;
                        this._offSetY = ((tileInfo.origin.y - startRow * rs) - extent.maxy) / resolution;//(tileInfo.origin.y - center.y)/resolution;
    */

                        /*var index, tileQueue = [], tile;
                        this._currentIndex = {};


                        for (var i = startRow; i < endRow; i++) {
                            for (var j = startCol; j < endCol; j++) {
                                index = level + "/" + j + "/" + i;
                                count++;
                                if (!this.tileIndex.hasOwnProperty(index)) {
                                    tile =  new Tile(j, i, level);
                                    this.tileIndex[index] = tile;
                                    tileQueue.push(tile);
                                }
                                this._currentIndex[index] = true;
                            }
                        }*/

                        var zoomedBounds = this.view._bound.map(function (item) {
                            return {
                                x: tileInfo.getColForX(item.x, resolution),
                                y: tileInfo.getRowForY(item.y, resolution)
                            }
                        });
                        var t = tileCover.tileCover(level, zoomedBounds, tileInfo.getColRange(resolution));

                        var index, tileQueue = [], tile;
                        this._currentIndex = {};
                        var i =0;
                        for (index in t) {
                            var item = t[index];
                            if (!this.tileIndex.hasOwnProperty(index)) {
                                tile = new Tile(item.x, item.y, level);
                                this.tileIndex[index] = tile;
                                tileQueue.push(tile);
                            }
                            i++;
                            this._currentIndex[index] = true;
                        }

                        // 计算需请求的切片
                        var cx = tileInfo.getColForX(center.x, resolution),
                            cy = tileInfo.getRowForY(center.y, resolution);
                        tileQueue.sort(function (a, b) {
                            return Math.sqrt((cx - a.x) * (cx - a.x) + (cy - a.y) * (cy - a.y)) - Math.sqrt((cx - b.x) * (cx - b.x) + (cy - b.y) * (cy - b.y));
                        });
                        this._fetchTiles(tileQueue);
                    }else {
                        if (this._group.visible) {
                            this._group.visible = false;
                        }
                    }
                }
            },
            /**
             * 取切片信息
             * @param tileQueue 
             */
            _fetchTiles: function (tileQueue) {
                this._loadLength = tileQueue.length;
                tileQueue.forEach(function (item) {
                    // this._promises[item.z + "/" + item.x + "/" + item.y] = this.layer.fetchTile(item.z , item.x, item.y);
                    this.tileIndex[item.z + "/" + item.x + "/" + item.y].data = this.layer.fetchTile(item.z , item.x, item.y);
                }.bind(this))
            },
            _render: function () {
                if (this._group.visible) {
                    var obj = this;
                    var tile, index;
                    for (var i in this.tileIndex) {
                        if (!this._currentIndex.hasOwnProperty(i)) {
                            var mesh = this.tileIndex[i].data;
                            if (mesh.isResolved) { // 是ajax请求且未处理
                                mesh.cancel();
                            } else {
                                this._group.remove(mesh);
                                mesh.geometry.dispose();
                                this.tileIndex[i].data = null;
                            }
                            delete this.tileIndex[i];
                        }
                    }
                    var scaleCount = this.view.viewpoint.scale;
                    this._group.scale.set(scaleCount, scaleCount, 1);
                    for (var id in this.tileIndex) {
                        tile = this.tileIndex[id];
                        if (tile.load) {
                        }else {
                            (function (vtile) {
                                vtile.data.then(function (features) {
                                    index = vtile.z + "/" + vtile.x + "/" + vtile.y;
                                    if (obj.tileIndex.hasOwnProperty(index) && features) {
                                        var array = index.split("/");
                                        var currentCol = Number(array[1]);
                                        var currentRow = Number(array[2]);
                                        obj._renderFeatures(features, currentCol, currentRow, index);
                                    }
                                })
                            })(tile)
                        }
                    }
                    this.view.threeRender();
                }
            },
            /**
             * 特征数据渲染
             * @param features     特征数据  
             * @param currentCol   当前的列
             * @param currentRow   当前的行
             * @param index        序号
             */
            _renderFeatures: function (features, currentCol, currentRow, index) {
                var pos = this._group.position;
                var r = this.view.resolution;
                var origin = this.view._tileInfo.origin;
                var px = currentCol * r * 256 + origin.x,
                    py = origin.y - currentRow * r * 256,
                    center = this.view.center,
                    delx = (px - center.x) / r - pos.x * this.view.initResolution / r,
                    dely = (py - center.y) / r - 256 - pos.y * this.view.initResolution / r;
                var pixel,prop, id, h;
                var ratio = this.view.initResolution;
                var g = new THREE.Geometry();
                for (var i = 0; i < features.length; i++) {
                    pixel = features[i].flatCoordinates_;
                    prop = features[i].properties_;
                    id = prop.id;
                    h = prop.height;

                    var startX = pixel[0] / 16,
                        startY = pixel[1] / 16,
                        len = pixel.length;
                    var shape = new THREE.Shape();
                    shape.moveTo(startX, 256 - startY);
                    for (var j = 2; j < len - 2; j = j + 2) {
                        var lineX = pixel[j] / 16,
                            lineY = pixel[j + 1] / 16;
                        shape.lineTo(lineX, 256 - lineY);
                    }
                    this.extrudeSettings.depth = h / ratio * 2;
                    var geometry = new THREE.ExtrudeGeometry(shape, this.extrudeSettings);
                    g.merge(geometry);
                }
                var mesh = new THREE.Mesh(g, this.material);
                mesh.position.set(delx, dely, 0.1);
                this._group.add(mesh);
                this.tileIndex[index].data = mesh;
                this.tileIndex[index].load = true;
                this.view.threeRender();
            },
            /**
             * 可视化设置
             * @param  visible 
             */
            setVisible: function (visible) {
                this.visible = visible;
                this._group.visible = visible;
                if (visible) {
                    this.refresh();
                } else {
                    this.view.threeRender();
                }
            },

            zoom: function (scale) {
                // this._group.scale.set(scale, scale, 1);
            }
        });
    });