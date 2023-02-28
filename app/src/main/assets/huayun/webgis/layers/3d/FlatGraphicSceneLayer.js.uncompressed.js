/**
 * Created by overfly on 2018/05/30.
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.FlatGraphicSceneLayer
 */
define("com/huayun/webgis/layers/3d/FlatGraphicSceneLayer", [
    "dojo/_base/declare",
    "dojo/topic",
    "./TileSceneLayer",
    "dojo/request",
    "../../geometry/Extent",
    "../../geometry/MapPoint",
    "../../geometry/Point",
    "../support/Tile",
    "../../featureloader"
], function (declare, topic, SceneTileLayer, request, Extent, MapPoint, Point, Tile, featureloader) {
    /**
     * @alias com.huayun.webgis.layers.3d.FlatGraphicSceneLayer
     * @extends {SceneTileLayer}
     * @property {Array}  group  - 容纳3d模型, 将添加到3d的Scene中
     * @property {string}  texture  - 纹理 
     * @property {null}  map  - 地图引用 
     * @property {object}  styleObj  -  样式
     * @property {Array}  lastIndexArray  - 上次地理范围的切片index的集合 
     * @property {Array}  currentIndexArray  - 本次地理范围的切片index的集合 
     * @property {Array}  needRemovedArrayOfTielIndex  - 待移除切片index的集合 
     * @property {Array}  tileArray  - 切片数组
     * @property {Array}  needLoadIndex  - 待加载切片index的集合 
     * @property {null}  origin  - 源 
     * @property {number}  size  - 大小 
     * @property {string}  url  - 切片数据地址 
     * @property {string}  tileInfo  - 切片数据 
     * @property {null}  _loader  - 加载 
     * @property {Array}  movex  - x坐标需要平移的距离 
     * @property {number}  movey  - y坐标需要平移的距离
     * @property {string}  configUrl  - 配置url 
     * @property {null}  vectorCache  - 缓存 
     * @property {string}  textWidthCache  - 缓存
     * @property {object}  layersBySourceLayer  - 图层
     * @property {Array}  labelPosCache  - 缓存 
     */
    return declare("com.huayun.webgis.layers.3d.FlatGraphicSceneLayer", [SceneTileLayer], {
        group: null,
        canvas: null,
        ctx: null,
        texture: null,
        map: null,
        styleObj: null,

        lastIndexArray: [],
        currentIndexArray: [],
        needRemovedArrayOfTielIndex: [],
        tileArray: [],
        needLoadIndex: [],
        loadPromise: null,
        name: "矢量底图",

        origin: null,
        size: 256,
        url: null,
        tileInfo: null,
        _loader: null,
        movex: 0,
        movey: 0,
        configUrl: null,
        vectorCache: null,
        textWidthCache: null,
        layersBySourceLayer: {},
        labelPosCache: null,


        constructor: function (params) {
            declare.safeMixin(this, params);
            this._loader = new featureloader();
            this.vectorCache = {}; // 矢量数据缓存

            this.textWidthCache = {};
            this.labelPosCache = [];

            // 离屏canvas
            this.canvas = document.createElement("canvas");
            var width = this.map.width,
                height = this.map.height;
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx = this.canvas.getContext("2d");
            this.ctx.fillStyle = "#EEEEEE";
            this.ctx.fillRect(0, 0, width, height);

            //初始化容纳切片图的平面
            this.group = new THREE.Group();
            var geometry = new THREE.PlaneBufferGeometry(width, height);
            this.texture = new THREE.CanvasTexture(this.canvas);
            this.texture.generateMipmaps = false;
            this.texture.magFilter = THREE.NearestFilter;
            this.texture.minFilter = THREE.NearestFilter;
            if (this.map.is3D) {
                this.texture.anisotropy = 16;
            }else {
                this.texture.anisotropy = 1;
            }
            var material = new THREE.MeshBasicMaterial({map: this.texture, transparent: false});
            var plane = new THREE.Mesh(geometry, material);
            this.group.add(plane);
            this.group.visible = params.visible;
            // document.body.append(this.canvas);
        },
        /**
         * 平移
         * @param xmove x移动距离
         * @param ymove y移动距离
         * @param needsRefresh  是否需要刷新
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
         * 刷新
         */
        refresh: function () {
            var obj = this;
            if (this.visible && this.map.extent) {
                if (this.movex != 0 || this.movey != 0) {
                    this.group.position.x -= this.movex;
                    this.group.position.y += this.movey;
                    this.movex = 0;
                    this.movey = 0;
                }
                if (this.url) {
                    this.origin = this.map.origin;
                    this.size = this.map.size;
                    this.readyData();
                } else {
                    request.get(this.configUrl, {handleAs: "json"}).then(function (vectorConfig) {
                        var sourcesUrl = vectorConfig.sources.huayun.url;
                        /*var allLayers = vectorConfig.layers;
                        var layer, sourceLayer, layers;
                        var layerIds = [];

                        for (var i = 0, ii = allLayers.length; i < ii; ++i) {
                            layer = allLayers[i];
                            sourceLayer = layer["source-layer"].toLowerCase();
                            layerIds.push(layer.id);
                            layers = obj.layersBySourceLayer[sourceLayer];
                            if (!layers) {
                                layers = [];
                                obj.layersBySourceLayer[sourceLayer] = layers;

                            }
                            layers.push({
                                layer: layer,
                                index: i
                            });
                        }
                        obj.layerIds = layerIds;*/

                        var layers = vectorConfig.layers;
                        var styleObj = {};
                        for (var i = 0; i < layers.length; i++) {
                            var item = layers[i],
                                layerClass = item["source-layer"].toLowerCase();
                            var layerObj = {
                                id: item.id,
                                type: item.type,
                                paint: item.paint,
                                layout: item.layout,
                                minzoom: item.minzoom,
                                maxzoom: item.maxzoom
                            };
                            if (item.filter) {
                                layerObj["filter"] = item.filter;
                            }
                            if (!styleObj[layerClass]) {
                                styleObj[layerClass] = [];
                            }
                            styleObj[layerClass].push(layerObj);
                        }
                        obj.styleObj = styleObj;
                        request.get(sourcesUrl, {handleAs: "json"}).then(function (vectorInfo) {
                            var tile = vectorInfo.tiles;
                            obj.url = tile.substr(0, tile.length - 15);
                            obj.size = vectorInfo.tilesize;
                            var o = vectorInfo.tileInfo.originPoint;
                            obj.origin = new MapPoint(Number(o.x), Number(o.y));
                            obj.readyData();
                        });
                    });
                }
            }
        },
        /**
         * 数据准备
         */
        readyData: function () {
            this.computeIndex();
            this.removeTiles();
            this.fetchTiles();
        },
        /**
         * 计算系数
         */
        computeIndex: function () {
            var halfW = (this.map.width - this.map.realWidth) / 2,
                halfH = (this.map.height - this.map.realHeight) / 2;
            var theta = this.map.rotationAngela,
                cos = Math.abs(Math.cos(theta / 180 * Math.PI)),
                sin = Math.abs(Math.sin(theta / 180 * Math.PI));
            var offsetw = Math.round(halfW * cos + halfH * sin),
                offseth = Math.round(halfW * sin + halfH * cos);
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
            var index, i, j;
            this.startCol = startCol;
            this.startRow = startRow;
            this.endCol = endCol;
            this.endRow = endRow;
            // todo
            /*for (i = startRow + 2; i < endRow - 2; i++) {
                for (j = startCol + 2; j < endCol - 5; j++) {*/
            for (i = startRow; i < endRow; i++) {
                for (j = startCol; j < endCol; j++) {
                    if (i >= 0 && j >= 0) {
                        index = level + "/" + j + "/" + i;
                        this.currentIndexArray.push(index);
                    }
                }
            }
            // console.log(this.currentIndexArray.length);
            this.dx = (extent.minx - (startCol * rs + origin.x)) / resolution - offsetw;
            this.dy = ((origin.y - startRow * rs) - extent.maxy) / resolution - offseth;
            //经过上面循环得到的needLoadIndex即为需要加载的index数组
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
                if (isCurrent && !isLast) {
                    this.needLoadIndex.push(allIndex[i]);
                }
            }
            this.lastIndexArray = this.currentIndexArray;
        },
        /**
         * 获取切片
         */
        fetchTiles: function () {
            if (this.visible) {
                var url = null, index, len = this.needLoadIndex.length;
                for (var id in this.vectorCache) {
                    var array = id.split("/");
                    var currentCol = Number(array[1]);
                    var currentRow = Number(array[2]);
                    this.drawWholeTile(this.vectorCache[id], currentCol - this.startCol, currentRow - this.startRow, this.dx, this.dy);
                }
                for (var p = 0; p < len; p++) {
                    index = this.needLoadIndex[p];
                    url = this.url + index + ".pbf";
                    this._loader.loadFeaturesXhr(url, index, len, this.onload.bind(this), this.onError.bind(this));
                }
            }
        },

        /**
         * 删除需要移除的切片
         */
        removeTiles: function () {
            var index;
            var scaleCount = Math.pow(2, this.map.initLevel - this.map.level);
            this.group.scale.set(scaleCount, scaleCount, 1);
            this.ctx.clearRect(0, 0, this.map.width, this.map.height);
            this.ctx.fillStyle = "#eeeeee";
            this.ctx.fillRect(0, 0, this.map.width, this.map.height);
            this.texture.needsUpdate = true;
            for (var n = 0; n < this.needRemovedArrayOfTielIndex.length; n++) {
                index = this.needRemovedArrayOfTielIndex[n];
                delete this.vectorCache[index];
            }
            this.needRemovedArrayOfTielIndex = [];
            this.textWidthCache = {};
            this.labelPosCache = [];
        },

        onload: function (features, array, index) {
            if (features.length > 0) {
                var currentCol = Number(array[1]);
                var currentRow = Number(array[2]);
                var layerTypeCoordObj = [];
                for (var i = 0, ii = features.length; i < ii; i++) {
                    var type = features[i].type_;
                    if (type !== "Point") {
                        var layerType = features[i].properties_.layer;
                        if (!layerTypeCoordObj.hasOwnProperty(layerType)) {
                            layerTypeCoordObj[layerType] = [];
                        }
                        layerTypeCoordObj[layerType].push(features[i]);
                    } else {
                    }
                }
                this.vectorCache[index] = layerTypeCoordObj;
                this.drawWholeTile(layerTypeCoordObj, currentCol - this.startCol, currentRow - this.startRow, this.dx, this.dy);
                /*var layerTypeCoordObj = [];
                var feature = null;
                // for (var i = 0, ii = features.length; i < ii; i++) {
                for (var i = 0, ii = 5; i < ii; i++) {
                    feature = features[i];
                    var type = feature.type_;
                    if (type !== "Point") {
                        this.drawFeature(feature, this.styleFun(feature, this.map.level), currentCol - this.startCol, currentRow - this.startRow, this.dx, this.dy);
                    }
                }*/
            }
        },

        /**
         * 渲染请求的切片
         */
        drawWholeTile: function (layerTypeCoordObj, dCol, dRow, ddx, ddy) {
            var size = 256;
            var dx = dCol * size - ddx + 0.5;
            var dy = dRow * size - ddy + 0.5;
            var styles, features, style, coord, text;
            var feature;
            var level = this.map.level;

            var symbolData = {};

            for (var id in this.styleObj) {
                styles = this.styleObj[id];
                features = layerTypeCoordObj[id];
                if (features && id !== "xzqh_district_area10k" && id!=="water_area_256000scale_erase" && id!=="country_area") {
                // if (features && id !== "xzqh_district_area10k" && id!=="water_area_256000scale_erase") {
                // if (features) {
                // if (features && id === "china_state_prov_bounds_area80") {
                    for (var i = 0, ii = styles.length; i < ii; i++) {
                        style = styles[i];
                        if (("minzoom" in style && level < style.minzoom) || ("maxzoom" in style && level > style.maxzoom)) {
                            continue;
                        }
                        var paint = style.paint || {};
                        var layout = style.layout || {};
                        if (style.type == "fill" && id !== "xzqh_district_area10k") {     // fill, 且fill类型没有filter
                            this.ctx.fillStyle = "fill-color" in paint ? paint["fill-color"] : "#FFFFFF";
                            for (var j = 0; j < features.length; j++) {
                                this.ctx.beginPath();
                                coord = features[j].flatCoordinates_;
                                var startX = (coord[0] / 16 + dx) | 0;
                                var startY = (coord[1] / 16 + dy) | 0;
                                this.ctx.moveTo(startX, startY)
                                for (var k = 2; k < coord.length; k = k + 2) {
                                    var lineX, lineY;
                                    lineX = (coord[k] / 16 + dx) | 0;
                                    lineY = (coord[k + 1] / 16 + dy) | 0;
                                    this.ctx.lineTo(lineX, lineY);
                                }
                                this.ctx.fill();
                            }
                        } else if (style.type == "line") {
                            this.ctx.strokeStyle = "line-color" in paint ? paint["line-color"] : "#FFFFFF";
                            this.ctx.lineWidth = this._getValue(style, "paint", "line-width", level) || 1;
                            this.ctx.lineCap = layout["line-cap"] || "butt";
                            this.ctx.lineJoin = layout["line-join"] || "miter";
                            this.ctx.setLineDash(paint["line-dasharray"] || []);
                            var lineOffset = "line-offset" in paint?paint["line-offset"]:0;
                            var filter = style["filter"];
                            for (var j = 0; j < features.length; j++) {
                                if (filter && this.filterFeature(filter, features[j])) {
                                    continue;
                                }
                                this.ctx.beginPath();
                                coord = features[j].flatCoordinates_;
                                var startX = (coord[0] / 16 + dx) | 0;
                                var startY = (coord[1] / 16 + dy) | 0;
                                this.ctx.moveTo(startX, startY);
                                for (var k = 2; k < coord.length; k = k + 2) {
                                    var lineX, lineY;
                                    lineX = (coord[k] / 16 + dx + lineOffset) | 0;
                                    lineY = (coord[k + 1] / 16 + dy) | 0;
                                    this.ctx.lineTo(lineX, lineY);
                                }
                                this.ctx.stroke();
                            }
                        } else if (style.type === "symbol") {
                            /*this.ctx.fillStyle = this._getValue(style, "paint", "text-color", level) || "#000000";
                            var size = this._getValue(style, "layout", "text-size", level) || 16,
                                fontFamily = "text-font" in layout ? layout["text-font"][0] : "Microsoft YaHei Regular";
                            this.ctx.font = size + "px " + fontFamily;
                            var field = "text-field" in layout ? layout["text-field"] : "{NAME}";
                            field = field.substring(1, field.length - 1).toLowerCase();*/
                            var filter = style["filter"];
                            for (var j = 0; j < features.length; j++) {
                                feature = features[j];
                                if (filter && this.filterFeature(filter, features[j])) {
                                    continue;
                                }
                                if (feature.type_ === "LineString") {
                                    var layerId = feature.properties_.layer;
                                    if (!symbolData.hasOwnProperty(layerId)) {
                                        symbolData[layerId] = {
                                            style: style,
                                            features: []
                                        };
                                    }
                                    symbolData[layerId].features.push(feature);
                                    // symbolData[feature]
                                    /*text = feature["properties_"][field];
                                    var pathLen = this.lineStringLength(feature["flatCoordinates_"]) / 16;
                                    var textLen = this.measureAndCacheTextWidth(text);
                                    if (textLen <= pathLen && text !== "") {
                                        var startM = (pathLen - textLen) * 0.5;
                                        var pos = this.drawTextOnPath(feature["flatCoordinates_"], text, startM);
                                        pos.x = pos.x / 16 + dx;
                                        pos.y = pos.y / 16 + dy;
                                        if (this.needDraw(pos)) {
                                            if (pos.angle > -Math.PI * 0.75 && pos.angle < Math.PI * 0.75) {
                                                this.ctx.save();
                                                this.ctx.translate(pos.x, pos.y);
                                                this.ctx.rotate(pos.angle);
                                                this.ctx.fillText(text, 0, 0);
                                                this.ctx.restore();
                                                this.labelPosCache.push({x: pos.x, y: pos.y});
                                            } else {
                                                /!*this.ctx.save();
                                                this.ctx.translate(pos.x/16 + dx, pos.y/ 16 + dy);
                                                this.ctx.rotate(pos.angle + Math.PI/2);
                                                this.ctx.fillText(text, 0 , 0);
                                                this.ctx.restore();*!/
                                            }
                                        }
                                    }*/
                                }
                            }
                        }
                    }
                }
            }
            for (var layerId in symbolData) {
                var features = symbolData[layerId].features,
                    style = symbolData[layerId].style;
                var paint = style.paint || {};
                var layout = style.layout || {};
                this.ctx.fillStyle = this._getValue(style, "paint", "text-color", level) || "#000000";
                var size = this._getValue(style, "layout", "text-size", level) || 16,
                    fontFamily = "text-font" in layout ? layout["text-font"][0] : "Microsoft YaHei Regular";
                this.ctx.font = size + "px " + fontFamily;
                var field = "text-field" in layout ? layout["text-field"] : "{NAME}";
                field = field.substring(1, field.length - 1).toLowerCase();
                for (var j = features.length - 1; j > -1; j--) {
                    feature = features[j];
                    text = feature["properties_"][field];
                    if (text === "") {
                        continue;
                    }
                    var pathLen = this.lineStringLength(feature["flatCoordinates_"]) / 16;
                    var textLen = this.measureAndCacheTextWidth(text);
                    if (textLen <= pathLen) {
                        var startM = (pathLen - textLen) * 0.5;
                        var pos = this.drawTextOnPath(feature["flatCoordinates_"], text, startM);
                        pos.x = (pos.x / 16 + dx)|0;
                        pos.y = (pos.y / 16 + dy)|0;
                        if (this.needDraw(pos)) {
                            if (pos.angle > -Math.PI * 0.75 && pos.angle < Math.PI * 0.75) {
                                this.ctx.save();
                                this.ctx.translate(pos.x, pos.y);
                                this.ctx.rotate(pos.angle);
                                this.ctx.fillText(text, 0, 0);
                                this.ctx.restore();
                                this.labelPosCache.push({x: pos.x, y: pos.y});
                            } else {
                                /*this.ctx.save();
                                this.ctx.translate(pos.x/16 + dx, pos.y/ 16 + dy);
                                this.ctx.rotate(pos.angle + Math.PI/2);
                                this.ctx.fillText(text, 0 , 0);
                                this.ctx.restore();*/
                                this.ctx.fillText(text, pos.x, pos.y);
                                this.labelPosCache.push({x: pos.x, y: pos.y});
                            }
                        }
                    }
                }
            }
            this.texture.needsUpdate = true;
            this.map.layerContainer.threeRender();
        },
        /**
         * 特征过滤
         * @param filter 
         * @param feature 
         * @type {boolean}
         */
        filterFeature: function(filter, feature){
            var type = filter[0];
            var flag = true;
            switch (type) {
                case "all":
                    for (var i = 1; i < filter.length; i++) {
                        flag = flag && this.allFilter(filter[i], feature)
                    }
                    break;
                case "any":
                    for (var i = 1; i < filter.length; i++) {
                        flag = flag && this.anyFilter(filter[i], feature)
                    }
                    break;
            }
            return !flag;
        },
        /**
         * any类型过滤
         * @param filter 
         * @param feature 
         * @type {boolean}
         */
        anyFilter: function(filter, feature) {
            var cond = filter[0],
                prop = filter[1].toLowerCase();
            switch (cond) {
                case "==":
                    var value = feature["properties_"][prop];
                    for (var j = 2, jj = filter.length; j < jj; j++) {
                        if (filter[j] === value) {
                            return true;
                        }
                    }
                    return false;
            }
        },
        /**
         * all类型过滤
         * @param filter 
         * @param feature 
         * @type {boolean}
         */
        allFilter: function(filter, feature) {
            var cond = filter[0],
                prop = filter[1].toLowerCase();
            switch (cond) {
                case "in":
                    var value = feature["properties_"][prop];
                    for (var j = 2, jj = filter.length; j < jj; j++) {
                        if (filter[j] === value) {
                            return true;
                        }
                    }
                    return false;

            }

        },
        /**
         * 是否需要绘制
         * @param pos 
         * @type {boolean}
         */
        needDraw: function (pos) {
            var oldPos;
            for (var i = 0, ii = this.labelPosCache.length; i < ii; i++) {
                oldPos = this.labelPosCache[i];
                if (Math.abs(oldPos.x - pos.x) < 200 && Math.abs(oldPos.y - pos.y) < 100) {
                    return false;
                }
            }
            return true;
        },
        /**
         * 线条长度
         * @param coords 
         * @type {number}
         */
        lineStringLength: function (coords) {
            var x1 = coords[0],
                y1 = coords[1],
                len = 0;
            var x2, y2;
            for (var i = 2, ii = coords.length; i < ii; i = i + 2) {
                x2 = coords[i];
                y2 = coords[i + 1];
                len += Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
                x1 = x2;
                y1 = y2;
            }
            return len;
        },
        /**
         * 测量并进行存储
         * @param text 
         * @type {number}
         */
        measureAndCacheTextWidth: function (text) {
            if (text in this.textWidthCache) {
                return this.textWidthCache[text];
            }
            var width = this.ctx.measureText(text).width;
            this.textWidthCache[text] = width;
            return width;
        },
        /**
         * 绘制路径
         * @param coords 
         * @param text 
         * @param startM 
         * @type {object}
         */
        drawTextOnPath: function (coords, text, startM) {
            /*var end = coords.length;
            var reverse = coords[0] > coords[end - 2];
            var numChars = text.length;
            var x1 = coords[0],
                y1 = coords[1],
                x2 = coords[2],
                y2 = coords[3];
            var segmentM = 0;
            var segmentLen = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            var chunk = "",
                chunkLen = 0,
                data, index, previousAngle;
            for (var i = 0; i < numChars; i++) {
                index = reverse ? numChars - i - 1 : i;
                var char = text.charAt(index);
                chunk = reverse?char+chunk: chunk+char;
                chunkLen += this.textWidthCache[text];

            }*/
            var x1 = coords[0],
                y1 = coords[1],
                len = 0;
            var x2, y2;
            for (var i = 2, ii = coords.length; i < ii; i = i + 2) {
                x2 = coords[i];
                y2 = coords[i + 1];
                len += Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
                if (len > startM) {
                    var angle = Math.atan2(y2 - y1, x2 - x1);
                    return {x: x1, y: y1, angle: angle};
                }
                x1 = x2;
                y1 = y2;
            }
            return {x: x2, y: y2};
        },

        styleFun: function (feature, level) {
            var properties = feature.properties_,
                layers = this.layersBySourceLayer[properties.layer];
            for (var i = 0, ii = layers.length; i < ii; i++) {
                var layerData = layers[i];

            }
        },

        onError: function () {

        },
        drawFeature: function () {

        },

        drawWholeTile2: function (features, dCol, dRow, ddx, ddy) {
            var size = 256;
            var level = this.map.level;
            var dx = dCol * size - ddx;
            var dy = dRow * size - ddy;
            for (var i = 0, ii = features.length; i < ii; i++) {
                var feature = features[i];
                var properties = feature.properties_;
                var layers = this.layersBySourceLayer[properties.layer];
                if (!layers) {
                    continue;
                }
                for (var j = 0, jj = layers.length; j < jj; j++) {
                    var layerData = layers[j],
                        layer = layerData.layer;
                    if (("minzoom" in layer && level < layer.minzoom) || ("maxzoom" in layer && level >= layer.maxzoom)) {
                        continue;
                    }
                    var color, opacity, fill, stroke, strokeColor, style;
                    var layout = layer.layout || {};
                    var paint = layer.paint || {};
                    if (layer.type === "fill") {
                        color = "fill-color" in paint ? paint["fill-color"] : "#FFFFFF";
                        this.ctx.fillStyle = color;
                        this._drawPolygon(feature.flatCoordinates_, dx, dy);
                    }
                    if (layer.type === "line") {
                        color = "line-color" in paint ? paint["line-color"] : "#FFFFFF";
                        this.ctx.strokeStyle = color;
                        this.ctx.lineWidth = this._getValue(layer, "paint", "line-width", level) || 1;
                        this.ctx.lineCap = layout["line-cap"] || "butt";
                        this.ctx.lineJoin = layout["line-join"] || "miter";
                        this.ctx.setLineDash(paint["line-dasharray"] || []);
                        this._drawLine(feature.flatCoordinates_, dx, dy);
                    }

                }
            }
            this.texture.needsUpdate = true;
            this.map.layerContainer.threeRender();
        },
        /**
         * 获取地图相关信息
         * @param layer 
         * @param layoutOrPaint 
         * @param property 
         * @param zoom 
         */
        _getValue: function (layer, layoutOrPaint, property, zoom) {
            var stops = layer[layoutOrPaint][property].stops;
            if (stops) {
                for (var l = 0, ll = stops.length; l < ll; l++) {
                    if (zoom <= stops[l][0]) {
                        return stops[l][1];
                    }
                }
                return stops[ll - 1][1];
            } else {
                return layer[layoutOrPaint][property];
            }
        },
        /**
         * 绘制线
         * @param coords 坐标集合
         * @param dx     横坐标偏移量
         * @param dy     纵坐标偏移量
         */
        _drawLine: function (coords, dx, dy) {
            this.ctx.beginPath();
            this.ctx.moveTo(coords[0] / 16 + dx, coords[1] / 16 + dy);
            for (var j = 2, jj = coords.length; j < jj; j = j + 2) {
                this.ctx.lineTo(coords[j] / 16 + dx, coords[j + 1] / 16 + dy);
            }
            this.ctx.stroke();
        },
        /**
         * 绘制多边形
         * @param coords 坐标集合
         * @param dx     横坐标偏移量
         * @param dy     纵坐标偏移量
         */
        _drawPolygon: function (coords, dx, dy) {
            this.ctx.beginPath();
            this.ctx.moveTo(coords[0] / 16 + dx, coords[1] / 16 + dy);
            for (var j = 2, jj = coords.length; j < jj; j = j + 2) {
                this.ctx.lineTo(coords[j] / 16 + dx, coords[j + 1] / 16 + dy);
            }
            this.ctx.fill();
        },

        startRender: function () {
            /*var scaleCount = Math.pow(2, this.map.initLevel - this.map.level);
            this.group.scale.set(scaleCount, scaleCount, 1);*/
            // this.removeTiles();
            // this.render();
        },
        /**
         * 是否可视
         * @param visible 
         */
        setVisible: function (visible) {
            this.visible = visible;
            this.group.visible = visible;
            if (visible) {
                this.refresh();
                this.map.layerContainer.threeRender();
            } else {
                this.map.layerContainer.threeRender();
            }
        }
    });
});