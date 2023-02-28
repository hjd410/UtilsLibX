/**
 *  Created by WebStorm
 *  @Author: zy
 *  @Date:  2019/4/11
 *  @Description: 热力图纹理前端成图
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.HeatMapSceneLayer
 */
define("com/huayun/webgis/layers/3d/HeatMapSceneLayer", [
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/request",
    "./VectorTextureSceneLayer"
], function (declare, topic, request, VectorTextureSceneLayer) {
    /**
     * @alias com.huayun.webgis.layers.3d.HeatMapSceneLayer
     * @extends {VectorTextureSceneLayer}
     * @property {Array}  heatmap  -  热力图
     * @property {string}  heatMapDomId  - 热力图id
     * @property {Array}  heatMapData  - 热力图数据
     * @property {string}  geomKey  - 图形键 
     * @property {string}  valueKey  - 值键
     * @property {Array}  group  - 容纳3d模型, 将添加到3d的Scene中
     * @property {string}  texture  - 纹理 
     * @property {string}  map  - 地图
     * @property {number}  movex  - x坐标需要平移的距离 
     * @property {number}  movey  - y坐标需要平移的距离 
     * @property {number}  layerLv  - 图层层级
     */
    return declare("com.huayun.webgis.layers.3d.HeatMapSceneLayer", [VectorTextureSceneLayer], {
        heatmap: null,
        heatMapDomId: "map",
        heatMapData: [],
        geomKey: "geom",
        valueKey: "photo_num",
        group: null,
        texture: null,
        map: null,
        url: null,
        loadPromise: null,
        movex: 0,
        movey: 0,
        name: "热力图",
        layerLv: 14,
        time: "2019-04-20",

        constructor: function (params) {
            declare.safeMixin(this, params);
            var self = this;
            this.group = new THREE.Group();
            this.div = document.createElement("div");
            this.div.style.width = this.map.width+"px";
            this.div.style.height = this.map.height+"px";
            this.heatmap = h337.create({
                container: this.div,
                maxOpacity: 1,
                radius: 30,
                blur: .95,
                /*gradient: {
                    .05: 'rgba(0,0,255,0.3)',
                    0.5: 'rgba(0,255,0,0.3)',
                    0.95: 'rgba(255,0,0,0.3)',
                },*/
                width: this.map.width,
                height: this.map.height
            });
            this.texture = new THREE.CanvasTexture(this.div.firstChild);
           /* this.texture.magFilter = THREE.LinearFilter;
            this.texture.minFilter = THREE.LinearFilter;*/
            var geometry = new THREE.PlaneBufferGeometry(self.map.width, self.map.height);
            var material = new THREE.MeshBasicMaterial({map: self.texture, transparent: true});
            material.depthTest = false;
            this.plane = new THREE.Mesh(geometry, material);
            this.plane.position.set(0, 0, 0.02);
            this.plane.renderOrder = 3;
            this.group.add(this.plane);
            this.group.visible = this.visible;
        },
        /**
         * 准备数据
         */
        readyData: function() {
            var level = this.map.level;
            if (level < this.layerLv) {
                if (this.visible) {
                    if (!this.group.visible) {
                        this.group.visible = true;
                    }
                    this.fetchData();
                } else {
                    if (this.group.visible) {
                        this.group.visible = false;
                    }
                }
            }else {
                this.group.visible = false;
            }
        },
        /**
         * 开始渲染
         */
        startRender: function() {
            if (this.group.visible) {
                var scaleCount = Math.pow(2, this.map.initLevel - this.map.level);
                this.group.scale.set(scaleCount, scaleCount, 1);
                this.render();
            }

        },
        /**
         * 获取数据
         */
        fetchData: function () {
            var extent = this.map.extent,
                level = this.map.level;
            var powerUrl = this.url + "?bbox=" + extent.minx + "," + extent.miny
                + "," + extent.maxx + "," + extent.maxy + "&level=" + level + "&time=" + this.time;
            this.loadPromise = request.get(powerUrl, {handleAs: "json"})
        },
        /**
         * 重置热力图地图数据
         * @type {object}
         */
        resetHeatMapData: function (res) {
            var self = this;
            var points = [];
            var hw = this.map.width / 2,
                hh = this.map.height / 2,
                center = this.map.extent.getCenter(),
                cx = center.x,
                cy = center.y,
                max = 0,
                resolution = this.map.resolution;
            if (res) {
                var len = res.length,
                    item, p,sx,sy, _value;
                for (var i = 0; i < len; i++) {
                    item = res[i];
                    p = self.getGeoPointXY(item[self.geomKey]);
                    // p3D = self.map.positionToScreen(self.map.geometryToPosition(p));
                    sx = Math.floor((p.x - cx)/resolution + hw);
                    sy = Math.floor(hh - (p.y - cy)/resolution);
                    _value = parseFloat(item[self.valueKey]);
                    max = Math.max(max, _value);
                    points.push({x: sx, y: sy, value: _value});
                }
            }
            var data = {
                max: max,
                data: points
            };
            return data;
        },
        /**
         * 获取地图上的点
         * @type {point}
         */
        getGeoPointXY: function (geoStr) {
            var point = {x: 0, y: 0};
            if (geoStr.startsWith("POINT")) {
                // 点
                var firstLeftIdx = geoStr.indexOf('(');
                var lastRightIdx = geoStr.indexOf(')');
                var pointStr = geoStr.slice(firstLeftIdx + 1, lastRightIdx);
                var singlePoint = pointStr.split(" ");
                point.x = singlePoint[0];
                point.y = singlePoint[1];
            }
            return point;
        },
        /**
         * 渲染
         */
        render: function () {
            var self = this;
            if (this.loadPromise) {
                this.loadPromise.then(function (res) {
                    var heatMapData = self.resetHeatMapData(res["g_yx_measurebox"]);
                    self.heatmap.setData(heatMapData);
                    self.heatmap.repaint();
                    this.group.position.x -= this.movex;
                    this.group.position.y += this.movey;
                    this.movex = 0;
                    this.movey = 0;
                    this.texture.needsUpdate = true;
                    this.map.layerContainer.threeRender();
                }.bind(this));
            }
        },
        /**
         * 创建纹理
         * @type {CanvasTexture}
         */
        createTexture: function (canvas) {
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            return texture;
        }
    })
});