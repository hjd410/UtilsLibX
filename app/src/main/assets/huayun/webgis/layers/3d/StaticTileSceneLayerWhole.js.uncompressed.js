/**
 * 3d的静态地图底图
 * Created by overfly on 2018/05/30.
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.StaticTileSceneLayerWhole
 */
define("com/huayun/webgis/layers/3d/StaticTileSceneLayerWhole", [
    "dojo/_base/declare",
    "dojo/topic",
    "./TileSceneLayer",
    "../../request",
    "../../geometry/Extent",
    "../../geometry/MapPoint",
    "../../geometry/Point",
    "../support/Tile",
    "../support/LOD",
    "../support/TileInfo",
    "../../../facades/TileInfoFacade"
], function (declare, topic, SceneTileLayer, request, Extent, MapPoint, Point, Tile, LOD, TileInfo, TileInfoFacade) {
    /**
     * @alias com.huayun.webgis.layers.3d.StaticTileSceneLayerWhole
     * @extends {SceneTileLayer}
     * @property {Array}  lastIndexArray  - 上次地理范围的切片index的集合 
     * @property {Array}  currentIndexArray  - 本次地理范围的切片index的集合 
     * @property {Array}  needRemovedArrayOfTielIndex  - 待移除切片index的集合 
     * @property {object}  tileArray  - 切片数组 
     * @property {Array}  needLoadIndex  - 待加载切片index的集合 
     * @property {Array}  useCacheIndex  - 使用缓存存储index 
     * @property {null}  group  - 容纳3d模型, 将添加到3d的Scene中 
     * @property {boolean}  onlyRefresh  - 只刷新 
     * @property {null}  _tileInfoFacade  - 切片信息服务 
     * @property {number}  scaleCount  - 倍数 
     * @property {number}  movex  - x坐标需要平移的距离
     * @property {number}  movey  - y坐标需要平移的距离 
     */
    return declare("com.huayun.webgis.layers.3d.StaticTileSceneLayerWhole", [SceneTileLayer], {
        lastIndexArray: [],
        currentIndexArray: [],
        needRemovedArrayOfTielIndex: [],
        tileArray: {},
        needLoadIndex: [],
        useCacheIndex: [],

        loadPromise: null,
        group: null,            //容纳3d模型, 将添加到3d的Scene中
        canvas: null,
        ctx: null,
        texture: null,
        name: "静态底图",
        onlyRefresh: false,
        _tileInfoFacade: null,      // 切片信息服务
        scaleCount: 1,
        movex: 0,
        movey: 0,

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.loadPromise = {};

            this.lastIndexArray = [];
            this.currentIndexArray = [];
            this.needRemovedArrayOfTielIndex = [];
            this.tileArray = [];
            this.needLoadIndex = [];
            this.useCacheIndex = [];

            this._tileInfoFacade = new TileInfoFacade();
            this._getTileInfo();

            //初始化容纳切片图的平面
            var width = this.map.width,
                height = this.map.height;
            this.canvas = document.createElement("canvas");
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx = this.canvas.getContext("2d");
            this.ctx.imageSmoothingEnabled = false;

            this.group = new THREE.Group();
            var geometry = new THREE.PlaneBufferGeometry(width, height);
            /*const offsetx = (4096-width)/4096,
                offsety = (2048 - height)/2048;*/
            // console.log(width, height);

            this.texture = new THREE.CanvasTexture(this.canvas);
            this.texture.magFilter = THREE.NearestFilter;
            this.texture.minFilter = THREE.NearestFilter;
            if (this.map.is3D) {
                this.texture.anisotropy = 16;
            }else {
                this.texture.anisotropy = 1;
            }

            //
            // this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
            // this.texture.anisotropy = 16;
            // this.texture.anisotropy = this.map.layerContainer.renderer.getMaxAnisotropy();
            /*this.texture.offset.x = -offsetx/2;
            this.texture.offset.y = -offsety/2;*/
            var material = new THREE.MeshBasicMaterial({map: this.texture, transparent: true, opacity: this.opacity});
            this.plane = new THREE.Mesh(geometry, material);
            this.plane.position.set(0,0,0);
            this.plane.renderOrder = 1;
            this.group.add(this.plane);
            this.group.visible = this.visible;
            // document.getElementById("hyMap").appendChild(this.canvas);

            topic.subscribe("mapTypeChange", function (url) {
                this.setTileUrl(url);
            }.bind(this));
        },
        /**
         * 调整尺寸
         */
        resize: function() {
            this.plane.geometry.dispose();
            this.plane.material.dispose();
            this.texture.dispose();
            this.group.remove(this.plane);

            var width = this.map.width,
                height = this.map.height;
            this.canvas = document.createElement("canvas");
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx = this.canvas.getContext("2d");
            this.ctx.imageSmoothingEnabled = false;

            var geometry = new THREE.PlaneBufferGeometry(width, height);
            this.texture = new THREE.CanvasTexture(this.canvas);
            this.texture.magFilter = THREE.NearestFilter;
            this.texture.minFilter = THREE.NearestFilter;
            var material = new THREE.MeshBasicMaterial({map: this.texture});
            this.plane = new THREE.Mesh(geometry, material);
            this.group.add(this.plane);
            this.refresh();
        },
        /**
         * 获取切片信息，当前是加载本地的json数据，后面会请求服务，需要修改
         * @private
         */
        _getTileInfo: function () {
            var reg = /^\/[^/]*/;
            var infoDataUrl = reg.exec(location.pathname)[0] + "/config/tileInfoData.json";
            this._tileInfoFacade.getTileInfoData(infoDataUrl, function (resp) {
                var theOrigin = resp.origin;
                var theSize = resp.size;
                var originPoint = new MapPoint(theOrigin[0], theOrigin[1]);
                var lodList = [];
                for (var i = 0; i < resp.lods.length; i++) {
                    var sourceLod = resp.lods[i];
                    var lod = new LOD({
                        level: sourceLod.level,
                        scale: sourceLod.scale,
                        resolution: sourceLod.resolution
                    });
                    lodList.push(lod);
                }
                this.tileInfo = new TileInfo({
                    lods: lodList,
                    origin: originPoint,
                    size: theSize
                });
                topic.publish("tileInfoComplete");
            }.bind(this), function (err) {
                console.log(err.message);
            }.bind(this));
        },

        /**
         * 获取当前层级的切片图的分辨率
         * @param level
         * @returns {*}
         */
        getResolution: function (level) {
            return this.tileInfo.lods[level].resolution;
        },
        /**
         * 平移
         * @param xmove 
         * @param ymove 
         * @param needsRefresh 
         */
        pan: function (xmove, ymove, needsRefresh) {
            this.group.position.x += xmove;
            this.group.position.y -= ymove;
            this.movex += xmove;
            this.movey += ymove;
            if (needsRefresh) {
                this.refresh();
            }
        },

        /**
         * 渲染
         */
        refresh: function () {
            this.onlyRefresh = false;
            this.readyData();
            this.startRender();
        },
        readyData: function () {
            if (this.visible) {
                if (!this.onlyRefresh) {
                    this.loadPromise = {};
                    this.computeIndex();
                }
                this.fetchTiles();
                this.removeTiles();
            }
        },
        /**
         * 计算当前范围内需要加载和删除的切片
         */
        computeIndex: function () {
            // 判断哪些缓存切片需要删除,重新加载
            var halfW = (this.map.width - this.map.realWidth)/2,
                halfH = (this.map.height - this.map.realHeight)/2;
            // console.log(halfW, halfH);
            var theta = this.map.rotationAngela,
                cos = Math.abs(Math.cos(theta/180*Math.PI)),
                sin = Math.abs(Math.sin(theta/180*Math.PI));
            var offsetw = Math.round(halfW*cos + halfH * sin),
                offseth = Math.round(halfW*sin + halfH * cos);


            this.currentIndexArray = [];
            this.needLoadIndex = [];
            this.needRemovedArrayOfTielIndex = [];
            var origin = this.map.origin,
                size = this.map.size,
                extent = this.map.extent,
                resolution = this.map.resolution,
                rs = resolution * size,
                level = this.map.level,
                startCol = Math.floor((extent.minx - origin.x) / rs),
                startRow = Math.floor((origin.y - extent.maxy) / rs),
                endCol = Math.ceil((extent.maxx - origin.x) / rs),
                endRow = Math.ceil((origin.y - extent.miny) / rs);
            this.startCol = startCol;
            this.endCol = endCol;
            this.startRow = startRow;
            this.endRow = endRow;
            var index, i, j;
            /*const deltaWidth = Math.floor((this.map.width - this.map.realWidth)/256)/2,
                deltaHeight = Math.floor((this.map.height - this.map.realHeight)/256)/2;
            console.log(deltaWidth, deltaHeight);*/
            for (i = startRow; i < endRow; i++) {
                // for(j=(startCol + Math.max(0, (i - startRow - 5)));j<(endCol - Math.max(0, (i - startRow - 5)));j++){
                // for(j=startCol + deltaWidth;j<endCol - deltaWidth;j++){
                for (j = startCol; j < endCol; j++) {
                    index = level + "/" + j + "/" + i;
                    if (!this.tileArray.hasOwnProperty(index)) {
                        this.tileArray[index] = new Tile(null, null, null, j, i);
                    }
                    this.currentIndexArray.push(index);
                }
            }
            // console.log(this.currentIndexArray.length);
            // console.log(startCol, endCol, startRow, endRow, this.currentIndexArray.length);
            var realMinX = startCol * resolution * size + origin.x;
            var realMaxY = origin.y - startRow * resolution * size;
            this.offSetX = ((realMinX - extent.minx) / resolution) + offsetw;
            this.offSetY = ((extent.maxy - realMaxY) / resolution) + offseth;

            var isLast = false, isCurrent = false;
            var allIndex = this.lastIndexArray.concat(this.currentIndexArray);
            // console.log(allIndex.length);
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
                if (isLast && !isCurrent) {//待删除
                    this.needRemovedArrayOfTielIndex.push(allIndex[i]);
                }
                if (isCurrent && !isLast) {//待加载
                    this.needLoadIndex.push(allIndex[i]);
                }
                if (isCurrent && isLast) {
                    this.useCacheIndex.push(allIndex[i]);
                }
            }
            this.lastIndexArray = this.currentIndexArray;
        },

        /**
         * 加载需要请求的切片
         */
        fetchTiles: function () {
            var baseUrl = this.url;
            this.needLoadIndex.forEach(function (item) {
                this.loadPromise[item] = request(baseUrl + item, {
                    responseType: "image",
                    allowImageDataAccess: false
                })
            }.bind(this));
        },
        /**
         * 删除需要移除的切片
         */
        removeTiles: function () {
            var item;
            for (var i = this.needRemovedArrayOfTielIndex.length - 1; i > -1; i--) {
                item = this.needRemovedArrayOfTielIndex[i];
                delete this.tileArray[item]
            }
            this.needRemovedArrayOfTielIndex = [];
        },
        /**
         * 渲染请求的切片
         */
        render: function () {
            this.ctx.restore();
            var width = this.map.width,
                height = this.map.height;
            var tileCache = null;
            var obj = this, splits, level, i, j, image, x, y;
            var len = this.currentIndexArray.length;
            var scaleCount = Math.pow(2, obj.map.initLevel - obj.map.level);
            obj.group.scale.set(scaleCount, scaleCount, 1);
            this.ctx.clearRect(0, 0, width, height);
            obj.texture.needsUpdate = true;
            obj.map.layerContainer.threeRender();
            obj.ctx.save();
            var angle = obj.map.rotationAngela,
                deltaAngela = this.deltaAngela;
            var theta = Math.PI * angle / 180,
                deltaTheta = Math.PI * deltaAngela / 180,
                sina = Math.abs(Math.sin(theta)),
                cosa = Math.abs(Math.cos(theta)),
                px = width / 2,
                py = height / 2;
            obj.group.rotateZ(deltaTheta);
            obj.ctx.translate(px, py);
            obj.ctx.rotate(theta);
            var tx = -px * cosa - py * sina,
                ty = -py * cosa - px * sina;
            obj.ctx.translate(tx, ty);

            obj.group.position.x -= obj.movex;
            obj.group.position.y += obj.movey;
            obj.movex = 0;
            obj.movey = 0;

            var c = 0;
            obj.deltaAngela = 0;
            for (var cache in this.tileArray) {
                tileCache = this.tileArray[cache];
                if (tileCache.image) {
                    c++;
                    this.ctx.drawImage(tileCache.image, (obj.offSetX + (tileCache.x - obj.startCol) * 256 + 0.5)|1, (obj.offSetY + (tileCache.y - obj.startRow) * 256 + 0.5)|1, 257, 257);
                }
            }

            this.needLoadIndex.forEach(function (index) {
                obj.loadPromise[index].then(function (resp) {
                    // obj.ctx.clearRect(0,0, obj.width, obj.height);
                    if (obj.tileArray.hasOwnProperty(index)) {
                        tileCache = obj.tileArray[index];
                        c++;
                        image = resp.data;
                        tileCache.image = image;
                        var coordX = (obj.offSetX + (tileCache.x - obj.startCol) * 256 + 0.5)|0;
                        var coordY = (obj.offSetY + (tileCache.y - obj.startRow) * 256 + 0.5)|0;
                        obj.ctx.drawImage(image, coordX, coordY, 257, 257);
                        if (c % 5 == 0 || c == len) {
                            obj.texture.needsUpdate = true;
                            obj.map.layerContainer.threeRender();
                        }
                    }
                }, function (error) {
                })
            });

            obj.texture.needsUpdate = true;
            obj.map.layerContainer.threeRender();
        },
        /**
         * 开始渲染
         */
        startRender: function () {
            if (this.visible) {
                this.render();
            }
        },
        /**
         * 设置切片url
         * @param url 
         */
        setTileUrl: function (url) {
            if (this.url !== url) {
                this.loadPromise = {};
                this.url = url;
                this.onlyRefresh = true;
                this.needLoadIndex = this.currentIndexArray;
                for (var cache in this.tileArray) {
                    this.tileArray[cache].image = null;
                }
                this.readyData();
                this.onlyRefresh = false;
                this.startRender();
            }
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
         * 透明度设置
         * @param value 
         */
        setOpacity: function (value) {
            this.opacity = value;
            this.plane.material.opacity = value;
            this.map.layerContainer.threeRender();
        }
    })
});