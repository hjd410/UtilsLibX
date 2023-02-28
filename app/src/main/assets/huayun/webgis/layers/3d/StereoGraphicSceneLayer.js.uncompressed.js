/**
 *  @author :   wushengfei
 *  @date   :   2019-04-28
 *  @Email  :   532967158@qq.com
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.StereoGraphicSceneLayer
 */
define("com/huayun/webgis/layers/3d/StereoGraphicSceneLayer", [
    "dojo/_base/declare",
    "dojo/request",
    "dojo/topic",
    "dojo/dom-construct",
    "./TileSceneLayer",
    "./GraphicSceneLayer",
    "../../geometry/Extent",
    "../../geometry/MapPoint",
    "../../geometry/Point",
    "../support/Tile"
], function (declare, request, topic, domConstruct, TileSceneLayer, GraphicSceneLayer, Extent, MapPoint) {
    /**
     * @alias com.huayun.webgis.layers.3d.StereoGraphicSceneLayer
     * @extends {TileSceneLayer，GraphicSceneLayer}
     * @property {null}  group  - 代表图层 
     * @property {null}  map  - 地图引用 
     * @property {null}  extrudeSettings  - 建筑物高度 
     * @property {null}  material  - 建筑物材质 
     * @property {string}  url  - 切片数据地址 
     * @property {string}  configUrl  - 获取切片数据地址的地址 
     * @property {Array}  lastIndexArray  - 上次地理范围的切片index的集合 
     * @property {Array}  currentIndexArray  - 本次地理范围的切片index的集合 
     * @property {Array}  needRemovedArrayOfTielIndex  - 待移除切片index的集合 
     * @property {Array}  needLoadIndex  - 待加载切片index的集合 
     * @property {Array}  vectorCache  - 切片数据缓存集合 
     * @property {Array}  poiCache  - 
     * @property {number}  layerLv  - 建筑物是否可见分隔层 
     * @property {object}  iconObj  - 标识对象 
     * @property {object}  needRemoveObj  - 需要移除的对象 
     * @property {string}  indexIds  - id序号
     * @property {Array}  selectedPoi  - 切片选择 
     */
    return declare("com.huayun.webgis.layers.3d.StereoGraphicSceneLayer", [TileSceneLayer, GraphicSceneLayer], {
        group: null,                         // 代表图层
        map: null,                           // 地图引用
        extrudeSettings: null,             // 建筑物高度
        material: null,                     // 建筑物材质
        name: "矢量底图",
        origin: null,
        size: 256,
        url: null,                      // 切片数据地址
        configUrl: null,                    // 获取切片数据地址的地址

        lastIndexArray: [],                 // 上次地理范围的切片index的集合
        currentIndexArray: [],              // 本次地理范围的切片index的集合
        needRemovedArrayOfTielIndex: [],   // 待移除切片index的集合
        needLoadIndex: [],                   // 待加载切片index的集合
        //_loader: null,                       // 切片数据加载器
        vectorCache: null,                  // 切片数据缓存集合
        poiCache: null,
        layerLv: 12,                         // 建筑物是否可见分隔层
        buildingData: null,
        iconObj: null,
        needRemoveObj: null,
        indexIds: null,
        loadPromise: null,
        selectedPoi:[],

        /**
         * 构造函数
         * @param params: 创建对象时传入的对象属性
         * @return void
         */
        constructor: function (params) {
            declare.safeMixin(this, params);

            this.group = new THREE.Group();
            this.group.visible = params.visible;
            this.extrudeSettings = {
                depth: 50,
                bevelEnabled: false,
                bevelSegments: 1,
                steps: 1,
                bevelSize: 1,
                bevelThickness: 1,
                curveSegments: 1
            };
            // 需要探索

            // this.material = new THREE.MeshLambertMaterial({
            //     color: 0x87CEFA,
            //     emissive:0x0000FF,
            //     transparent:true,
            //     opacity:.8,
            //     depthTest:true
            // });

            this.material = new THREE.MeshLambertMaterial({
                color: 0xdddddd,
                // emissive:0x0000FF,
                transparent: false,
                // opacity:1,
                opacity: 1
            });

            this.vectorCache = {}; // 矢量数据缓存
            this.poiCache = {};
            this.buildingData = {};
            this.iconObj = {};
            this.needRemoveObj = [];
            this.indexIds = {};
            this.loadPromise = {};
            /*var gongjiaozhan = new Image();
            gongjiaozhan.src = "./images/gongjiaozhan.png";
            var gouwu = new Image();
            gouwu.src = "./images/gouwu.png";
            var xiezilou = new Image();
            xiezilou.src = "./images/xiezilou.png";
            var xiuxianyule = new Image();
            xiuxianyule.src = "./images/xiuxianyule.png";
            this.iconObj["gongjiaozhan"] = gongjiaozhan;
            this.iconObj["gouwu"] = gouwu;
            this.iconObj["xiezilou"] = xiezilou;
            this.iconObj["xiuxianyule"] = xiuxianyule;*/
            this.selectPOIID = null;

            this.poiNode = domConstruct.create("div",	{
                id: "poiResult"
            });

            this.moveNode = domConstruct.create("div",	{
                id: "poiMove",
                innerHTML: "点击可查看详情"
            });
            document.body.appendChild(this.poiNode);
            document.body.appendChild(this.moveNode);

            topic.subscribe("mapOnClick", function (obj, x, y) {
                var array = obj[this.id],
                    len = array?array.length:0;
                console.log(this.poiNode);
                for (var i = len - 1; i > -1; i--) {
                    if (array[i].object.isSprite){
                        this.poiNode.innerText = array[i].object.userData.name;
                        this.poiNode.style.top = y + "px";
                        this.poiNode.style.left = x + "px";
                        this.poiNode.style.display = "block";
                        this.selectPOIID = array[i].object.uuid;
                        this.moveNode.style.display = "none";
                        return;
                    }
                }
                this.poiNode.style.display = "none";
            }.bind(this));
            topic.subscribe("mapMovePOI", function (isHas, x, y) {
                if (isHas && isHas !== this.selectPOIID) {
                    this.moveNode.style.top = (y + 3) + "px";
                    this.moveNode.style.left = (x + 3) + "px";
                    this.moveNode.style.display = "block";
                } else {
                    this.moveNode.style.display = "none";
                }
            }.bind(this))
        },

        /**
         * 窗口resize
         */
        resize: function () {
            this.refresh();
        },

        /**
         * 平移
         * @param xmove: x方向平移距离
         * @param ymove: y方向平移距离
         * @param needsRefresh: 是否需要刷新
         */
        pan: function (xmove, ymove, needsRefresh) {
            this.group.position.x += xmove;
            this.group.position.y -= ymove;
            if (needsRefresh) {
                this.refresh();
            }
        },

        /**
         * 刷新
         */
        refresh: function () {
            if (this.visible) {
                this.readyData();
                this.startRender();
            }
        },

        /**
         * 准备数据
         */
        readyData: function () {
            var level = this.map.level;
            if (level > this.layerLv) {
                if (this.visible) {
                    if (!this.group.visible) {
                        this.group.visible = true;
                    }
                    this.computeIndex();
                    this.removeTiles();
                    this.fetchTiles();
                } else {
                    if (this.group.visible) {
                        this.group.visible = false;
                    }
                }
            } else {
                if (this.group.visible) {
                    this.clearTiles();
                    this.lastIndexArray = [];
                }
                this.group.visible = false;
            }
        },

        /**
         * 计算需要加载的切片
         */
        computeIndex: function () {
            var origin = this.map.origin,
                size = this.map.size,
                extent = this.map.extent,
                resolution = this.map.resolution,
                level = this.map.level,
                rs = resolution * size;
            var startCol = Math.floor((extent.minx - origin.x) / rs),
                startRow = Math.floor((origin.y - extent.maxy) / rs),
                endCol = Math.ceil((extent.maxx - origin.x) / rs),
                endRow = Math.ceil((origin.y - extent.miny) / rs);
            // 判断哪些缓存切片需要删除,重新加载
            this.currentIndexArray = [];
            this.needLoadIndex = [];

            if (this.map.needCal) {
                this.startCol = startCol;
                this.startRow = startRow;
                this.endCol = endCol;
                this.endRow = endRow;
                this.group.position.x = 0;
                this.group.position.y = 0;
            }

            var index, i, j;
            for (i = startRow; i < endRow; i++) {
                for (j = (startCol); j < (endCol); j++) {
                    if (i >= 0 && j >= 0) {
                        index = level + "/" + j + "/" + i;
                        this.currentIndexArray.push(index);
                    }
                }
            }
            /*if (this.map.zoomouted) {
                var roundStartRow = Math.round((origin.y - extent.maxy) / rs),
                    roundEndRow = Math.round((origin.y - extent.miny) / rs),
                    halfDeltaRow = (roundEndRow - roundStartRow)/4,
                    roundStartCol = Math.round((extent.minx - origin.x) / rs),
                    roundEndCol = Math.round((extent.maxx - origin.x) / rs),
                    halfDeltaCol = (roundEndCol - roundStartCol)/4;
                for (i = startRow; i < roundStartRow + halfDeltaRow; i++) {
                    for (j = (startCol); j < (endCol); j++) {
                        if (i >= 0 && j >= 0) {
                            index = level + "/" + j + "/" + i;
                            this.currentIndexArray.push(index);
                        }
                    }
                }
                for (i = roundEndRow - halfDeltaRow; i < endRow; i++) {
                    for (j = (startCol); j < (endCol); j++) {
                        if (i >= 0 && j >= 0) {
                            index = level + "/" + j + "/" + i;
                            this.currentIndexArray.push(index);
                        }
                    }
                }
                for (i = startRow + 2; i < endRow - 1; i++) {
                    for (j = startCol; j < roundStartCol + halfDeltaCol; j++) {
                        if (i >= 0 && j >= 0) {
                            index = level + "/" + j + "/" + i;
                            this.currentIndexArray.push(index);
                        }
                    }
                }
                for (i = startRow + 2; i < endRow - 1; i++) {
                    for (j = roundEndCol - halfDeltaCol; j < endCol; j++) {
                        if (i >= 0 && j >= 0) {
                            index = level + "/" + j + "/" + i;
                            this.currentIndexArray.push(index);
                        }
                    }
                }
            }else {
                for (i = startRow; i < endRow; i++) {
                    for (j = (startCol); j < (endCol); j++) {
                        if (i >= 0 && j >= 0) {
                            index = level + "/" + j + "/" + i;
                            this.currentIndexArray.push(index);
                        }
                    }
                }
            }*/

            // console.log(this.currentIndexArray.length);

            var isLast = false, isCurrent = false;
            var allIndex = this.lastIndexArray.concat(this.currentIndexArray);
            for (i = 0; i < allIndex.length; i++) {
                isLast = false;
                isCurrent = false;
                for (j = 0; j < this.lastIndexArray.length; j++) {
                    if (allIndex[i] == this.lastIndexArray[j]) {
                        isLast = true;
                        break;
                    }
                }
                for (j = 0; j < this.currentIndexArray.length; j++) {
                    if (allIndex[i] == this.currentIndexArray[j]) {
                        isCurrent = true;
                        break;
                    }
                }
                if (isLast && !isCurrent) { //待删除
                    this.needRemovedArrayOfTielIndex.push(allIndex[i]);
                }
                if (isCurrent && !isLast) { // 待加载
                    this.needLoadIndex.push(allIndex[i]);
                }
            }
            this.lastIndexArray = this.currentIndexArray;
        },

        /**
         * 发出ajax请求, 加载切片数据
         */
        fetchTiles: function () {
            if (this.group.visible) {
                var url = null, index, len = this.needLoadIndex.length;
                if (len > 0) {
                    for (var p = 0; p < len; p++) {
                        index = this.needLoadIndex[p];
                        this.loadPromise[index] = request(this.url + index + ".pbf", {handleAs: "arraybuffer"});
                    }
                } else {
                    this.map.layerContainer.threeRender();
                }
            }
        },

        /**
         * 删除需要移除的切片
         */
        removeTiles: function () {
            var scaleCount = Math.pow(2, this.map.initLevel - this.map.level);
            this.group.scale.set(scaleCount, scaleCount, 1);
            var index;
            for (var n = 0; n < this.needRemovedArrayOfTielIndex.length; n++) {
                index = this.needRemovedArrayOfTielIndex[n];
                this.group.remove(this.vectorCache[index]);
                this.group.remove(this.poiCache[index]);
                delete this.vectorCache[index];
                delete this.poiCache[index];
                var ids = this.indexIds[index];
                if (ids) {
                    for (var i = 0; i < ids.length; i++) {
                        delete this.buildingData[ids[i]];
                    }
                }
            }
            for (n = 0; n < this.needRemoveObj.length; n++) {
                this.group.remove(this.needRemoveObj[n]);
            }
            this.needRemoveObj = [];
            this.needRemovedArrayOfTielIndex = [];
            /*var index;
            for (var n = 0; n < this.needRemovedArrayOfTielIndex.length; n++) {
                index = this.needRemovedArrayOfTielIndex[n];
                // this.group.remove(this.vectorCache[index]);
                delete this.vectorCache[index];
            }
            this.needRemovedArrayOfTielIndex = [];*/
        },
        /**
         * 清空切片
         */
        clearTiles: function() {
            var scaleCount = Math.pow(2, this.map.initLevel - this.map.level);
            this.group.scale.set(scaleCount, scaleCount, 1);
            var children = this.group.children,
                child;
            for (var i = children.length - 1; i > -1; i--) {
                child = children[i];
                child.geometry.dispose();
                if (child.isSprite) {
                    child.material.map.dispose();
                    child.material.dispose();
                }
                // child.dispose();
                this.group.remove(child);
            }
            this.vectorCache = {};
            this.poiCache = {};
            this.indexIds = {};
            this.buildingData = {};
            this.needRemoveObj = [];
            this.needRemovedArrayOfTielIndex = [];
        },

        onload: function (features, array, index, len) {
            if (features.length > 0) {
                var currentCol = Number(array[1]);
                var currentRow = Number(array[2]);
                var buildCoordObj = [];
                var flag = true;
                var origin = this.map.origin;
                var pos = this.group.position;
                var px = currentCol * this.map.resolution * 256 + origin.x,
                    py = origin.y - currentRow * this.map.resolution * 256,
                    center = this.map.extent.getCenter(),
                    delx = (px - center.x) / this.map.resolution - pos.x * this.map.initResolution / this.map.resolution,
                    dely = (py - center.y) / this.map.resolution - 256 - pos.y * this.map.initResolution / this.map.resolution;
                for (var i = features.length - 1; i > -1; i--) {
                    var type = features[i].type_;
                    var pixel = features[i].flatCoordinates_;
                    var properties_ = features[i].properties_;
                    if (type != "Point") {
                        buildCoordObj.push({
                            data: pixel,
                            properties_: properties_
                        });
                        /*if (!this.indexIds.hasOwnProperty(index)) {
                            this.indexIds[index] = [];
                        }
                        this.indexIds[index].push(properties_.id);*/
                    } else {
                        // poi数据
                        if (flag) {
                            // this.drawPoi(pixel, properties_.name, currentCol - this.startCol, currentRow - this.startRow, this.dx, this.dy, index);
                            this.drawPoi2(pixel, properties_.name, delx, dely, index);
                            flag = false;
                        }
                    }
                }
                this.vectorCache[index] = {
                    buildData: buildCoordObj
                };
                this.drawWholeTile2(buildCoordObj, delx, dely, index, currentCol, currentRow);
                // this.drawWholeTile(buildCoordObj, currentCol - this.startCol, currentRow - this.startRow, this.dx, this.dy, currentCol, currentRow, index, len);
            }
        },
        /**
         * 渲染切片
         * @param buildCoordArray 
         * @param delx 
         * @param dely 
         * @param index 
         * @param col 
         * @param row 
         */
        drawWholeTile2: function (buildCoordArray, delx, dely, index, col, row) {
            var pixel, id, h;
            var ratio = this.map.initResolution;
            var g = new THREE.Geometry();
            for (var i = 0; i < buildCoordArray.length; i++) {
                pixel = buildCoordArray[i].data;
                pixel = buildCoordArray[i].data;
                h = buildCoordArray[i].properties_.height;
                id = buildCoordArray[i].properties_.id;
                if (!this.buildingData.hasOwnProperty(id)) {
                    this.buildingData[id] = [];
                }
                this.buildingData[id].push({
                    data: pixel,
                    col: col,
                    row: row,
                    h: h
                });
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
            mesh.position.set(delx, dely, 0);
            this.vectorCache[index] = mesh;
            this.group.add(mesh);
            this.map.layerContainer.threeRender();
        },

        onError: function () {

        },
        /**
         * 
         * @param point 
         * @param name 
         * @param delx 
         * @param dely 
         * @param index 
         */
        drawPoi2: function (point, name, delx, dely, index) {
            var scaleCount = Math.pow(2, this.map.initLevel - this.map.level);
            var startX = point[0] / 16;
            var startY = point[1] / 16;
            var canvas = document.createElement("canvas");
            canvas.width = 256;
            canvas.height = 64;
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = "#5BBAD3";
            ctx.strokeStyle = "#5BBAD3";
            ctx.font = "25px 微软雅黑";
            var kind = "xiezilou";
            if (name.length < 9) {
                // ctx.drawImage(this.iconObj[kind], 0, 0, 28, 28);
                ctx.strokeText(name, 32, 25);
                ctx.fillText(name, 32, 25);
            } else {
                // ctx.drawImage(this.iconObj[kind], 0, 9, 28, 28);
                var l = Math.floor(name.length / 2);
                var name1 = name.substring(0, l);
                var name2 = name.substring(l);
                ctx.strokeText(name1, 32, 25);
                ctx.fillText(name1, 32, 25);
                ctx.strokeText(name2, 32, 54);
                ctx.fillText(name2, 32, 54);
            }
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            texture.minFilter = THREE.LinearFilter;
            var ma = new THREE.SpriteMaterial({map: texture, sizeAttenuation: false, depthTest: false});
            var o = new THREE.Sprite(ma);
            o.name = name;
            o.userData = {
                name: name
            };
            o.position.set(delx + startX, dely + 256 - startY, 0);
            o.scale.set(0.08 / scaleCount, 0.02 / scaleCount, 1 / scaleCount);
            this.group.add(o);
            this.poiCache[index] = o;
            this.map.layerContainer.threeRender();
        },
        /**
         * 
         * @param point 
         * @param name 
         * @param dCol 
         * @param dRow 
         * @param ddx 
         * @param ddy 
         * @param index 
         */
        drawPoi: function (point, name, dCol, dRow, ddx, ddy, index) {
            var scaleCount = Math.pow(2, this.map.initLevel - this.map.level);
            var initZ = this.map.initz;
            var dx = dCol * 256 - ddx;
            var dy = dRow * 256 - ddy;
            var startX = point[0] / 16 + dx;
            var startY = point[1] / 16 + dy;
            var height = this.map.height;
            var canvas = document.createElement("canvas");
            canvas.width = 256;
            canvas.height = 64;
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = "#5BBAD3";
            ctx.strokeStyle = "#5BBAD3";
            ctx.font = "25px 微软雅黑";
            var kind = "xiezilou";
            if (name.length < 9) {
                // ctx.drawImage(this.iconObj[kind], 0, 0, 28, 28);
                ctx.strokeText(name, 32, 25);
                ctx.fillText(name, 32, 25);
            } else {
                // ctx.drawImage(this.iconObj[kind], 0, 9, 28, 28);
                var l = Math.floor(name.length / 2);
                var name1 = name.substring(0, l);
                var name2 = name.substring(l);
                ctx.strokeText(name1, 32, 25);
                ctx.fillText(name1, 32, 25);
                ctx.strokeText(name2, 32, 54);
                ctx.fillText(name2, 32, 54);
            }
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            texture.minFilter = THREE.LinearFilter;
            var ma = new THREE.SpriteMaterial({map: texture, sizeAttenuation: false, depthTest: false});
            var o = new THREE.Sprite(ma);
            o.name = name;
            if (this.map.rotationAngela !== 0) {
                var e = this.map.extent;
                var r = this.map.resolution;
                var w = e.getWidth() / r / 2,
                    h = e.getHeight() / r / 2;
                // mesh.position.set(-w, h - height, 0);
                o.position.set(startX - w + 0.08 / scaleCount * 128, h - startY + 32 * 0.02 / scaleCount, 0);
            } else {
                o.position.set(startX - this.map.width / 2 + 0.08 / scaleCount * 128, height / 2 - startY + 32 * 0.02 / scaleCount, 0);
            }

            // o.position.set(startX - this.map.width / 2 + 0.28 / scaleCount * 128, height / 2 - startY + 32 * 0.07 / scaleCount, 0);
            o.scale.set(1/initZ * 256, 1/initZ * 64, 1);
            this.group.add(o);
            this.poiCache[index] = o;
            this.map.layerContainer.threeRender();
        },
    
        startRender: function () {
            if (this.group.visible) {
                this.render();
            }
        },
        render: function () {
            var len = this.needLoadIndex.length;
            this.needLoadIndex.forEach(function (index) {
                this.loadPromise[index].then(function (resp) {
                    var format = new ol.format.MVT();
                    var features = format.readFeatures(resp);
                    this.onload(features, index.split("/"), index, len);
                }.bind(this), function (error) {
                })
            }.bind(this));
        },
        /**
         * 可视化设置
         * @param visible 
         */
        setVisible: function (visible) {
            this.visible = visible;
            this.group.visible = visible;
            if (visible) {
                this.refresh();
            } else {
                this.map.layerContainer.threeRender();
            }
        },
        /**
         * 建筑物对象
         */
        getObjects: function () {
            return this.buildingData;
        },
        /**
         * 通过建筑物id定位
         * @param id 
         */
        locateByBuildId: function (id) {
            if (this.buildingData.hasOwnProperty(id)) {
                var build = this.buildingData[id][0];
                var size = this.map.size,
                    origin = this.map.origin,
                    r = this.map.resolution,
                    px = build.data[0],
                    py = build.data[1],
                    col = build.col,
                    row = build.row;
                var x = Math.floor(((px / size / 16 + col) * r * size + origin.x) * 100) / 100;//保留两位小数
                var y = Math.floor((origin.y - (py / size / 16 + row) * r * size) * 100) / 100;//保留两位小数
                return {x: x, y: y};
            } else {
                return null;
            }
        },
        /**
         * 渲染建筑物
         * @param buildId 
         */
        renderBuild: function (buildId) {
            var ratio = this.map.initResolution;
            var build = this.buildingData[buildId];
            var size = this.map.size,
                origin = this.map.origin,
                r = this.map.resolution;
            var result = [];
            var col, row, data;
            var h = build[0].h;
            for (var i = 0; i < 1; i++) {
                col = build[i].col;
                row = build[i].row;
                data = build[i].data;
                for (var j = 0; j < data.length; j = j + 2) {
                    var x = Math.floor(((data[j] / size / 16 + col) * r * size + origin.x) * 100) / 100;//保留两位小数
                    var y = Math.floor((origin.y - (data[j + 1] / size / 16 + row) * r * size) * 100) / 100;//保留两位小数
                    result.push(x, y);
                }
            }
            var point0 = this.map.geometryTo3D(new MapPoint(result[0], result[1]));
            var point;
            var shape = new THREE.Shape(), len = result.length;
            shape.moveTo(point0.x, point0.y);
            for (i = 2; i < len; i = i + 2) {
                point = this.map.geometryTo3D(new MapPoint(result[i], result[i + 1]));
                shape.lineTo(point.x, point.y);
            }
            this.extrudeSettings.depth = h / ratio * 2;
            var geometry = new THREE.ExtrudeGeometry(shape, this.extrudeSettings);
            var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
                color: 0x5BBAD3
            }));
            var pos = this.group.position;
            mesh.position.set(-point0.x - pos.x, -point0.y - pos.y, 2);
            this.group.add(mesh);
            this.needRemoveObj.push(mesh);
            this.map.layerContainer.threeRender();
        },
        /**
         * 矩形选择
         * @param poly 
         */
        rectSelect: function (poly) {
            this.removeSelectedPoi();//恢复,移除上次的选中
            var children = this.group.children,
                pos, pt;
            for (var i = children.length - 1; i > -1; i--) {
                if (children[i].isSprite) {
                    pos = children[i].position;
                    pt = turf.point([pos.x, pos.y]);
                    if (turf.booleanPointInPolygon(pt, poly)) {
                        children[i].material.color = new THREE.Color(0xFF0000);
                        this.selectedPoi.push(children[i])
                    }
                }
            }
        },
        /**
         * 圆形选择
         * @param {*} poly 
         */
        circleSelect: function (poly) {
            this.removeSelectedPoi();//恢复,移除上次的选中
            var children = this.group.children,
                pos, pt;
            for (var i = children.length - 1; i > -1; i--) {
                if (children[i].isSprite) {
                    pos = children[i].position;
                    pt = turf.point([pos.x, pos.y]);
                    if (turf.booleanPointInPolygon(pt, poly)) {
                        children[i].material.color = new THREE.Color(0xFF0000);
                        this.selectedPoi.push(children[i])
                    }
                }
            }
        },
        /**
         * 移除选中
         */
        removeSelectedPoi:function () {
            if(this.selectedPoi && this.selectedPoi.length >0){
                this.selectedPoi.forEach(function (item) {
                    item.material.color =  new THREE.Color(0x2883b8);
                })
            }
            this.selectedPoi = [];
        }
    });
});