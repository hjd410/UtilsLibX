/**
 * 3d的静态地图底图
 * Created by overfly on 2018/05/30.
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.StaticTileSceneLayer
 */
define("com/huayun/webgis/layers/3d/StaticTileSceneLayer", [
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
     * @alias com.huayun.webgis.layers.3d.StaticTileSceneLayer
     * @extends {SceneTileLayer}
     * @property {Array}  lastIndexArray  - 上次地理范围的切片index的集合 
     * @property {Array}  currentIndexArray  - 本次地理范围的切片index的集合 
     * @property {Array}  needRemovedArrayOfTielIndex  - 待移除切片index的集合 
     * @property {object}  tileArray  - 切片数组 
     * @property {Array}  needLoadIndex  - 待加载切片index的集合 
     * @property {null}  group  - 容纳3d模型, 将添加到3d的Scene中 
     * @property {null}  textureloader  - 纹理加载器, 加载切片图片
     * @property {null}  geometry  - 几何图形
     * @property {null}  meshMap  - 地图
     * @property {boolean}  onlyRefresh  - 只刷新 
     * @property {null}  _tileInfoFacade  - 切片信息服务 
     * @property {number}  scaleCount  - 倍数 
     */
    return declare("com.huayun.webgis.layers.3d.StaticTileSceneLayer", [SceneTileLayer], {
        //计算图层用
        lastIndexArray: [],
        currentIndexArray: [],
        needRemovedArrayOfTielIndex: [],
        tileArray: {},
        needLoadIndex: [],

        loadPromise: null,
        group: null,            //容纳3d模型, 将添加到3d的Scene中
        textureloader: null,    //纹理加载器, 加载切片图片
        geometry: null,
        meshMap: null,
        name: "静态底图",

        onlyRefresh: false,

        _tileInfoFacade: null,      // 切片信息服务
        scaleCount: 1,


        constructor: function (params) {
            declare.safeMixin(this, params);

            this.loadPromise = {};
            this.meshMap = {};

            this._tileInfoFacade = new TileInfoFacade();
            this._getTileInfo();

            //初始化容纳切片图的平面
            this.group = new THREE.Group();
            this.textureloader = new THREE.TextureLoader().setCrossOrigin("*");
            this.geometry = new THREE.PlaneBufferGeometry(256, 256);
            this.group.visible = this.visible;

            topic.subscribe("mapTypeChange", function (url) {
                this.setTileUrl(url);
            }.bind(this));
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
        pan: function(xmove, ymove, needsRefresh) {
            this.group.position.x += xmove;
            this.group.position.y -= ymove;
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
                    this.computeIndex();
                }
                this.fetchTiles();
            }
        },
        /**
         * 计算当前范围内需要加载和删除的切片
         */
        computeIndex: function () {
            // 判断哪些缓存切片需要删除,重新加载
            this.currentIndexArray = [];
            this.needLoadIndex = [];
            this.needRemovedArrayOfTielIndex = [];
            var origin = this.map.origin,
                size = this.map.size,
                extent = this.map.extent,
                resolution = this.map.resolution,
                rs = resolution * size,
                level = this.map.level,
                startCol = Math.floor((extent.minx - origin.x) / rs) + 1,
                startRow = Math.floor((origin.y - extent.maxy) / rs),
                endCol = Math.ceil((extent.maxx - origin.x) / rs) - 1,
                endRow = Math.ceil((origin.y - extent.miny) / rs) - 1;
            /*var deltaCol = endCol - startCol,
                deltaRow = endRow - startRow;
            this.startCol = startCol + Math.floor(deltaCol / 2);
            this.endCol = endCol;
            this.startRow = startRow + Math.floor(deltaRow / 2);
            this.endRow = endRow;

            var i, j, k;
            this.currentObj = {};
            var index = level + "/" + this.startCol + "/" + this.startRow;
            this.currentIndexArray.push(index);
            this.currentObj[index] = true;
            for (i = 1, j = 1; i < Math.ceil(deltaRow / 2) || j < Math.ceil(deltaCol / 2); i++, j++) {
                for (k = -j; k < j + 1; k++) {
                    index = level + "/" + (this.startCol + k) + "/" + (this.startRow + i);
                    this.currentIndexArray.push(index);
                    this.currentObj[index] = true;
                    index = level + "/" + (this.startCol + k) + "/" + (this.startRow - i);
                    this.currentIndexArray.push(index);
                    this.currentObj[index] = true;
                }
                for (k = -i + 1; k < i; k++) {
                    index = level + "/" + (this.startCol + j) + "/" + (this.startRow + k);
                    this.currentIndexArray.push(index);
                    this.currentObj[index] = true;
                    index = level + "/" + (this.startCol - j) + "/" + (this.startRow + k);
                    this.currentIndexArray.push(index);
                    this.currentObj[index] = true;
                }
            }*/
            var index, i, j;
            this.startCol = startCol;
            this.startRow = startRow;
            this.endCol = endCol;
            this.endRow = endRow;
            for (i = startRow; i < endRow; i++) {
                // for(j=(startCol + Math.max(0, (i - startRow - 5)));j<(endCol - Math.max(0, (i - startRow - 5)));j++){
                for (j = startCol; j < endCol; j++) {
                    if (i >= 0 && j >= 0) {
                        index = level + "/" + j + "/" + i;
                        this.tileArray[index] = new Tile(null, null, null, j, i);
                        this.currentIndexArray.push(index);
                    }
                }
            }
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
                if (isLast && !isCurrent) {//待删除
                    this.needRemovedArrayOfTielIndex.push(allIndex[i]);
                }
                if (isCurrent && !isLast) {//待加载
                    this.needLoadIndex.push(allIndex[i]);
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
                this.loadPromise[item] = new Promise(function (resolve, reject) {
                    this.textureloader.load(baseUrl + item, resolve, undefined, reject);
                }.bind(this));
            }.bind(this));
        },
        /**
         * 删除需要移除的切片
         */
        removeTiles: function () {
            /*this.needRemovedArrayOfTielIndex.forEach(function (item) {
                obj.group.remove(obj.meshMap[item]);
            });*/
            var item;
            for (var i = this.needRemovedArrayOfTielIndex.length - 1; i > -1; i--) {
                item = this.needRemovedArrayOfTielIndex[i];
                delete this.tileArray[item];
                this.group.remove(this.meshMap[item]);
            }
            this.needRemovedArrayOfTielIndex = [];
            /*for (var index in this.meshMap) {
                if (!this.currentObj.hasOwnProperty(index)){
                    this.group.remove(this.meshMap[index]);
                    delete this.meshMap[index];
                }
            }*/
        },
        /**
         * 渲染请求的切片
         */
        render: function () {
            var obj = this;
            if (!this.onlyRefresh) {
                this.removeTiles();
            }
            /*var c = 0;
            console.time("static");*/
            if (this.onlyRefresh) {
                this.currentIndexArray.forEach(function (index) {
                    obj.loadPromise[index].then(function (texture) {
                        var material = new THREE.MeshBasicMaterial({map: texture});
                        obj.meshMap[index].material = material;
                        obj.onlyRefresh = false;
                    }, function (err) {
                        var material = new THREE.MeshBasicMaterial({color: 0xcce0ff});
                        obj.meshMap[index].material = material;
                        obj.onlyRefresh = false;
                    })
                })
            } else {
                var i, j, splits, size = this.tileInfo.size,
                    material = null,
                    plane = null,
                    origin = this.tileInfo.origin,
                    resolution = this.map.resolution,
                    tileCache = null,
                    centerGeo = this.map.oldcenter;
                var deltaX = (origin.x - centerGeo.x) / resolution + size / 2,
                    deltaY = (origin.y - centerGeo.y) / resolution - size / 2;
                this.needLoadIndex.forEach(function (index) {
                    /*splits = index.split("/");
                    j = splits[1] * 1;
                    i = splits[2] * 1;
                    material = new THREE.MeshBasicMaterial({map: null, transparent: true, opacity: 1});
                    plane = new THREE.Mesh(obj.geometry, material);
                    plane.position.set(j * size + deltaX, deltaY - i * size, 0);
                    obj.meshMap[index] = plane;
                    obj.group.add(plane);
                    plane.renderOrder = 3;
                    obj.loadPromise[index].then(function (texture) {
                        /!*if (flag) {
                            obj.removeTiles();
                            flag = false;
                        }*!/
                        // material = new THREE.MeshBasicMaterial({map: texture, opacity: obj.style["alpha"]});
                        obj.meshMap[index].material.map = texture;
                        // texture.needsUpdate = true;
                        obj.meshMap[index].material.map.needsUpdate = true;
                    });*/
                    obj.loadPromise[index].then(function (texture) {
                        if (obj.tileArray.hasOwnProperty(index)) {
                            tileCache = obj.tileArray[index];
                            texture.magFilter = THREE.NearestFilter;
                            texture.minFilter = THREE.NearestFilter;
                            material = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 1});
                            // material.depthTest = false;
                            // material.blending = THREE.AdditiveBlending;
                            plane = new THREE.Mesh(obj.geometry, material);
                            plane.position.set(tileCache.x * size + deltaX, deltaY - tileCache.y * size, 0);
                            obj.meshMap[index] = plane;
                            obj.group.add(plane);
                            plane.renderOrder = 0;
                            obj.map.layerContainer.threeRender();
                            obj.onlyRefresh = false;
                        }
                    }, function (err) {

                    });
                })
            }
        },
        /**
         * 开始渲染
         */
        startRender: function () {
            if (this.visible) {
                var sc = Math.pow(2, this.map.initLevel - this.map.level);
                if (this.scaleCount != sc) {
                    this.group.scale.set(sc, sc, 1);
                    this.scaleCount = sc;
                }
                this.render();
            }
        },
        /**
         * 设置切片url
         * @param url 
         */
        setTileUrl: function (url) {
            this.loadPromise = new Object();
            this.url = url;
            this.onlyRefresh = true;
            this.needLoadIndex = this.currentIndexArray;
            this.readyData();
            this.startRender();
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
            }
        }
    })
});