/**
 * Created by overfly on 2018/05/30.
 * 动态电网图层
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.PowerSceneTileLayer
 */
define("com/huayun/webgis/layers/3d/PowerSceneTileLayer", [
    "dojo/_base/declare",
    "dojo/topic",
    "./SceneLayer",
    "../../request",
    "../../facade/PowerFacade"
], function (declare, topic, SceneLayer, request, PowerFacade) {
    /**
     * @alias com.huayun.webgis.layers.3d.PowerSceneTileLayer
     * @extends {SceneLayer}
     * @property {Array}  group  - 容纳3d模型, 将添加到3d的Scene中 
     * @property {Array}  texture  - 纹理
     * @property {Array}  map  - 地图
     * @property {string}  url  - 数据地址 
     * @property {number}  movex  - x坐标需要平移的距离 
     * @property {number}  movey  - y坐标需要平移的距离 
     * @property {number}  version  - 解决平移太快电网图漂移问题 
     */
    return declare("com.huayun.webgis.layers.3d.PowerSceneTileLayer", [SceneLayer], {
        group: null,
        canvas: null,
        ctx: null,
        texture: null,
        map: null,
        url: null,
        loadPromise: null,
        movex: 0,
        movey: 0,
        name: "电网图",
        _powerFacade: null,
        _powerLayers: [],
        version: 0,     // 解决平移太快电网图漂移问题

        constructor: function (params) {
            declare.safeMixin(this, params);

            this.version = 0;
            var width = this.map.width,
                height = this.map.height;
            this.canvas = document.createElement("canvas");
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx = this.canvas.getContext("2d");
            this.ctx.imageSmoothingEnabled = false;

            this.group = new THREE.Group();
            var geometry = new THREE.PlaneBufferGeometry(width, height);
            this.texture = new THREE.CanvasTexture(this.canvas);
            // this.texture.generateMipmaps = false;
            this.texture.magFilter = THREE.NearestFilter;
            this.texture.minFilter = THREE.NearestFilter;
            if (this.map.is3D) {
                this.texture.anisotropy = 16;
            }else {
                this.texture.anisotropy = 1;
            }
            var material = new THREE.MeshBasicMaterial({map: this.texture, transparent: true});
            // var material = new THREE.MeshBasicMaterial({color: 0x00FF00, transparent: true});
            // var material = new THREE.MeshBasicMaterial({color:0xFF0000, transparent: true});
            // material.blending = THREE.AdditiveBlending;
            this.plane = new THREE.Mesh(geometry, material);
            // this.plane.position.set(0, 0, 3);
            this.plane.renderOrder = 2;
            this.group.renderOrder = 2;
            this.group.add(this.plane);
            this.group.visible = this.visible;


            var regExp = /^((http|https):\/\/.*\/)/;
            var infoUrl = this.url.match(regExp)[0] + "?f=json";
            this._powerFacade = new PowerFacade({
                url: infoUrl
            });
            this._getMapInfoMethod();
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
            var material = new THREE.MeshBasicMaterial({map: this.texture, transparent: true});
            // material.blending = THREE.AdditiveBlending;
            this.plane = new THREE.Mesh(geometry, material);
            // this.plane.position.set(0, 0, 0.01);
            this.group.add(this.plane);
            this.refresh();
        },
        /**
         * 获取地图信息
         * @private
         */
        _getMapInfoMethod: function () {
            this._powerFacade.getMapInfoData(function (resp) {
                this._powerLayers = resp["layers"];
                // console.log(this._powerLayers);
            }.bind(this), function (error) {
                console.log(error.message);
            }.bind(this));
        },
        /**
         * 刷新
         */
        refresh: function () {
            this.readyData();
            this.startRender();
        },
        readyData: function () {
            /*var is3D = this.map.is3D;
            if (!is3D) {
                this.group.visible = true;
                this.fetchTiles();
            }else {
                this.group.visible = false;
            }*/
            if (this.visible) {
                this.fetchTiles();
            }
        },
        /**
         * 获取切片
         */
        fetchTiles: function () {
            var extent = this.map.extent;
            var resolution = this.map.resolution;
            if (extent) {
                var width = Math.round(extent.getWidth()/resolution), //this.map.width,
                    height = Math.round(extent.getHeight()/resolution), //this.map.height,
                    url = this.url + "&bbox=" + extent.minx + "," + extent.miny + "," + extent.maxx + "," + extent.maxy + "&size=" + width + "," + height;
                // console.log(width, height, this.map.width, this.map.height);
                // console.log(width, height, extent.getWidth()/resolution, extent.getHeight()/resolution);
                if (this.loadPromise && !this.loadPromise.isResolved()) {
                    this.loadPromise.cancel();
                }

                this.loadPromise = request(url, {
                    responseType: "image",
                    allowImageDataAccess: false
                });
            } else {
                this.loadPromise = null;
            }
        },
        startRender: function () {
            /*var is3D = this.map.is3D;
            if (!is3D) {
                var scaleCount = Math.pow(2, this.map.initLevel - this.map.level);
                this.group.scale.set(scaleCount, scaleCount, 1);
                this.render();
            }*/
            if (this.visible) {
                this.render();
            }
        },
        render: function () {
            var obj = this;
            var width = this.map.width,
                height = this.map.height;
            var halfW = (this.map.width - this.map.realWidth)/2,
                halfH = (this.map.height - this.map.realHeight)/2;
            var theta = this.map.rotationAngela,
                cos = Math.abs(Math.cos(theta/180*Math.PI)),
                sin = Math.abs(Math.sin(theta/180*Math.PI));
            var offsetw = Math.round(halfW*cos + halfH * sin),
                offseth = Math.round(halfW*sin + halfH * cos);
            this.ctx.clearRect(0, 0, this.map.width, this.map.height);
            this.texture.needsUpdate = true;
            this.map.layerContainer.threeRender();
            if (this.loadPromise) {
                this.loadPromise.then(function (image) {
                    if (image.data) {
                        var scaleCount = Math.pow(2, obj.map.initLevel - obj.map.level);
                        obj.group.scale.set(scaleCount, scaleCount, 1);
                        obj.ctx.save();
                        var angle = obj.map.rotationAngela,
                            deltaAngela = obj.deltaAngela;
                        var theta = Math.PI*angle/180,
                            deltaTheta = Math.PI*deltaAngela/180,
                            sina = Math.abs(Math.sin(theta)),
                            cosa = Math.abs(Math.cos(theta)),
                            px = width/2,
                            py = height/2;
                        obj.group.rotateZ(deltaTheta);
                        obj.deltaAngela = 0;
                        obj.ctx.translate(px, py);
                        obj.ctx.rotate(theta);
                        var tx = - px*cosa - py*sina,
                            ty = - py*cosa - px*sina;
                        obj.ctx.translate(tx, ty);
                        obj.ctx.drawImage(image.data, offsetw, offseth);
                        obj.texture.needsUpdate = true;
                        obj.ctx.restore();
                        obj.group.position.x = 0;
                        obj.group.position.y = 0;
                        obj.movex = 0;
                        obj.movey = 0;
                        /*console.log(obj.group.position);
                        console.log(obj.canvas.toDataURL());*/
                        obj.map.layerContainer.threeRender();
                    }
                });
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
            }else {
                this.map.layerContainer.threeRender();
            }
        },
        /**
         * 打开电网图层
         * @param hash
         */
        openGridLayerMethod:function(){
            /*this.visible = true;
            this.group.visible = true;*/
            this.setVisible(true);
        },
        /**
         * 关闭电网图层
         * @param hash
         */
        closeGridLayerMethod:function(){
            /*this.visible = false;
            this.group.visible = false;*/
            this.setVisible(false);
        },

        /**
         * 更新电网中具体层的显示和隐藏
         * @param key
         * @param hash
         */
        updateShowHideMethod: function (key, hash) {
            var targetFilter = hash.get(key);
            var layerState = "";
            if (targetFilter.visible) {
                layerState = "show";
            } else {
                layerState = "hide";
            }
            this._getFetchTiles(layerState,hash);
            this.startRender();
        },
        /**
         * 获取切片
         * @param layerState 
         * @param hash 
         */
        _getFetchTiles:function(layerState,hash){
            var showList = [];
            var hideList = [];
            var keyList = hash.getKeyList();
            for (var i = 0; i < keyList.length; i++) {
                var theKey = keyList[i];
                var filter = hash.get(theKey);
                var sublayerIdsList = this._getsubLayerIdsMethod(theKey);
                if (filter.visible) {
                    showList.push(sublayerIdsList);
                } else {
                    hideList.push(sublayerIdsList);
                }
            }
            var layersParams = this._getLayerParamsMethod(layerState, showList, hideList);
            var extent = this.map.extent;
            var resolution = this.map.resolution;
            if (extent) {
                var width = Math.round(extent.getWidth()/resolution), //this.map.width,
                    height = Math.round(extent.getHeight()/resolution), //this.map.height,
                    url = this.url + "&bbox=" + extent.minx + "," + extent.miny + "," + extent.maxx + "," + extent.maxy + "&size=" + width + "," + height + "&" + layersParams;
                // console.log(width, height, this.map.width, this.map.height);
                // console.log(width, height, extent.getWidth()/resolution, extent.getHeight()/resolution);
                if (this.loadPromise && !this.loadPromise.isResolved()) {
                    this.loadPromise.cancel();
                }
                this.loadPromise = request(url, {
                    responseType: "image",
                    allowImageDataAccess: false
                });
            } else {
                this.loadPromise = null;
            }
        },
        /**
         * 获取subLayerIds的方法
         * @param key 
         */
        _getsubLayerIdsMethod: function (key) {
            for (var i = 0; i < this._powerLayers.length; i++) {
                if (this._powerLayers[i]["name"] === key) {
                    return this._powerLayers[i]["subLayerIds"];
                }
            }
            return null;
        },
        /**
         * 获取LayerParams的方法
         * @param state 
         * @param showList 
         * @param hideList 
         */
        _getLayerParamsMethod: function (state, showList, hideList) {
            var result = "";
            var tempList = [], theList = [];
            var i = 0;
            if (state === "show") {
                for (i = 0; i < showList.length; i++) {
                    theList = showList[i];
                    tempList = tempList.concat(theList);
                }
            } else if (state === "hide") {
                for (i = 0; i < hideList.length; i++) {
                    theList = hideList[i];
                    tempList = tempList.concat(theList);
                }
            }
            var subIds = [];
            for (var j = 0; j < tempList.length; j++) {
                subIds.push(tempList[j]);
            }
            result = "layers=" + state + ":" + subIds.toString();
            return result;
        },
        /**
         * 设置透明度
         * @param value 
         */
        setOpacity: function (value) {
            this.opacity = value;
            this.plane.material.opacity = value;
            this.map.layerContainer.threeRender();
        }

    })
});