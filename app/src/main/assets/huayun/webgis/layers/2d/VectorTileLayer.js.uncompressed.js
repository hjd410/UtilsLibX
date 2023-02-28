/**
 * Created by overfly on 2018/05/30.
 * @module com/huayun/webgis/layers
 * @see com.huayun.webgis.layers.2d.VectorTileLayer
 */
define(
    "com/huayun/webgis/layers/2d/VectorTileLayer", [
        "dojo/_base/declare",
        "dojo/topic",
        "dojo/touch",
        "../../request",
        "./FlatLayer",
        "../../geometry/Extent",
        "../../geometry/MapPoint",
        "../../geometry/Point",
        "../support/Tile",
        "../../featureloader",
        "dojo/dom-style",
        "dojo/when"
    ], function (declare, topic, touch, request, FlatLayer, Extent, MapPoint, Point, Tile, featureloader, domStyle, when) {
        /**
         * @alias com.huayun.webgis.layers.2d.VectorTileLayer
         * @extends {TileLayer}
         * @property {null}  tileInfo  - 切片信息
         * @property {Array}  lastIndexArray  - 上次地理范围的切片index的集合
         * @property {Array}  currentIndexArray  - 本次地理范围的切片index的集合
         * @property {Array}  needRemovedArrayOfTielIndex  - 待移除切片index的集合
         * @property {Array}  tileArray  - 切片数组
         * @property {Point}  screenPoint0  - 屏幕坐标
         * @property {Array}  needLoadIndex  - 待加载切片index的集合
         * @property {number}  startCol  - 开始的列
         * @property {number}  startRow  - 开始的行
         * @property {number}  endCol  - 结束的列
         * @property {number}  endRow  - 结束的行
         * @property {boolean}  oldcanvasIsFull  - 旧的canvas是否填满
         * @property {string}  animateRaf  - 动画
         * @property {string}  _loader  - 加载
         * @property {Object}  styleObj  - 样式
         * @property {string}  vectorCache  - 切片数据缓存集合
         * @property {string}  filter  - 过滤
        */
        return declare("com.huayun.webgis.layers.2d.VectorTileLayer", [FlatLayer], {
            url: null,
            tileInfo: null,
            lastIndexArray: [],
            currentIndexArray: [],
            needRemovedArrayOfTielIndex: [],
            screenPoint0: null,
            needLoadIndex: [],
            startCol: 0,
            startRow: 0,
            endCol: 0,
            endRow: 0,
            ctx: null,
            oldcanvasIsFull: false,
            animateRaf: null,
            _loader: null,
            styleObj: null,
            vectorCache: null,
            filter: null,

            constructor: function () {
                this._loader = new featureloader();
                this.vectorCache = {};
                this.filter = {};
            },

            postCreate: function () {
                this.inherited(arguments);
                this.ctx = this.canvasNode.getContext("2d");
                this.ctx.imageSmoothingEnabled = false;
                this.canvasNode.width = this.map.width;
                this.canvasNode.height = this.map.height;
                this.ctx.fillStyle = "#FF0000";
                this.ctx.fillRect(0,0, this.map.width, this.map.height);
            },

            /*onMouseDownEvent: function () {
                this.ctx.clearRect(0, 0, this.map.width, this.map.height);
                this.needLoadIndex = [];
            }
            ,

            onMouseUpEvent: function () {
                this.load();
            }
            ,*/

            refresh: function () {
                this.computeIndex();
                this.fetchTiles();
            }
            ,
            computeIndex: function () {
                var origin = this.tileInfo.origin,
                    size = this.tileInfo.size,
                    extent = this.map.extent,
                    resolution = this.map.resolution,
                    level = this.map.level,
                    rs = resolution * size, mapPoint, position;
                var startCol = Math.floor((extent.minx - origin.x) / rs),
                    startRow = Math.floor((origin.y - extent.maxy) / rs),
                    endCol = Math.ceil((extent.maxx - origin.x) / rs),
                    endRow = Math.ceil((origin.y - extent.miny) / rs);
                this.screenPoint0 = null;
                if (!this.screenPoint0) {
                    mapPoint = new MapPoint(startCol * rs + origin.x, origin.y - startRow * rs);
                    position = this.map.geometryToPosition(mapPoint);
                    this.screenPoint0 = this.map.positionToScreen(position);
                }
                // 判断哪些缓存切片需要删除,重新加载
                this.currentIndexArray = [];
                this.needLoadIndex = [];
                var x, y, index, screenPoint, i, j;
                this.startCol = startCol;
                this.startRow = startRow;
                this.endCol = endCol;
                this.endRow = endRow;
                for (i = startRow; i < endRow; i++) {
                    for (j = startCol; j < endCol; j++) {
                        if (i >= 0 && j >= 0) {
                            x = this.screenPoint0.x + (j - startCol) * size;
                            y = this.screenPoint0.y + (i - startRow) * size;
                            screenPoint = new Point(x, y);
                            index = level + "/" + j + "/" + i;
                            this.needLoadIndex.push(index);
                        }
                    }
                }
                this.dx = ((endCol - startCol) * size - this.map.width)/2;
                this.dy = ((endRow - startRow) * size - this.map.height)/2;
            }
            ,

            /**
             *  移除切片
             */
            removeTiles: function () {
                // var index;
                // for (var n = 0; n < this.needRemovedArrayOfTielIndex.length; n++) {
                //     index = this.needRemovedArrayOfTielIndex[n];
                //     delete this.tileArray[index];
                // }
                // this.needRemovedArrayOfTielIndex = [];
                this.ctx.clearRect(0,0, this.map.width, this.map.height);
                this.ctx.fillStyle = "#eeeeee";
                this.ctx.fillRect(0,0, this.map.width, this.map.height);
            },
            /**
             * 获取切片
             */
            fetchTiles: function () {
                var url = null, index, len = this.needLoadIndex.length;
                // console.log(this.needLoadIndex, this.needLoadIndex.length, "width:", this.width, "--height:", this.height);
                //
                //加载需要请求的切片
                this.removeTiles();
                for (var p = 0; p < len; p++) {
                    index = this.needLoadIndex[p];
                    url = this.url + index + ".pbf";
                    // console.log(">>>",url);
                    this._loader.loadFeaturesXhr(url, index, this.onload.bind(this), this.onError.bind(this));
                }
            },
            /**
             * 加载
             * @param features 
             * @param array 
             * @param index 
             */
            onload: function (features, array, index) {
                if (features.length > 0) {
                    var currentCol = Number(array[1]);
                    var currentRow = Number(array[2]);
                    var layerTypeCoordObj = new Object();
                    var buildCoordObj = [];
                    for (var i = features.length - 1; i > -1; i--) {
                        var type = features[i].type_;
                        if (type != "Point") {
                            var pixel = features[i].flatCoordinates_;
                            var properties_ = features[i].properties_;
                            var layerType = properties_.layer.toUpperCase();
                            if (layerType == "BUILDING_AREA") {
                                buildCoordObj.push({
                                    data: pixel,
                                    properties_: properties_
                                });
                            } else {
                                if (!layerTypeCoordObj.hasOwnProperty(layerType)) {
                                    layerTypeCoordObj[layerType] = [];
                                }
                                layerTypeCoordObj[layerType].push(pixel);
                            }
                        } else {
                            // todo
                        }
                    }
                    this.vectorCache[index] = {
                        tileData: layerTypeCoordObj,
                        buildData: buildCoordObj
                    };
                    this.drawWholeTile(layerTypeCoordObj, currentCol - this.startCol, currentRow - this.startRow, this.dx, this.dy);
                }
            },

            onError: function () {

            },
            /**
             * 更新
             * @param filterType 
             */
            update: function(filterType) {
                this.filter[filterType] = true;
                this.ctx.clearRect(0, 0, this.map.width, this.map.height);
                for (var id in this.vectorCache) {
                    var array = id.split("/");
                    var currentCol = Number(array[1]);
                    var currentRow = Number(array[2]);
                    this.drawWholeTile(this.vectorCache[id].tileData,currentCol - this.startCol, currentRow - this.startRow, this.dx, this.dy);
                    // this.subLayers[1].drawWholeTile(this.vectorCache[id].buildData,currentCol - this.startCol, currentRow - this.startRow, this.currentIndexArray.length);
                }
            },
            /**
             * 渲染请求的切片
             * @param layerTypeCoordObj 
             * @param dCol 
             * @param dRow 
             * @param ddx 
             * @param ddy 
             */
            drawWholeTile: function (layerTypeCoordObj, dCol, dRow, ddx, ddy) {
                var size = 256;
                var dx = dCol * size - ddx;
                var dy = dRow * size - ddy;
                var styles, coords, style, coord;
                for (var id in this.styleObj) {
                    styles = this.styleObj[id];
                    coords = layerTypeCoordObj[id];
                    if (coords) {
                        for (var i = 0; i < styles.length; i++) {
                            style = styles[i];
                            // console.log(style);
                            if (style.type == "fill") {
                                for (var j = 0; j < coords.length; j++) {
                                    this.ctx.beginPath();
                                    coord = coords[j];
                                    var startX = coord[0] / 16 + dx;
                                    var startY = coord[1] / 16 + dy;
                                    this.ctx.fillStyle = style.paint["fill-color"];
                                    this.ctx.moveTo(startX, startY);
                                    for (var k = 2; k < coord.length; k = k + 2) {
                                        var lineX, lineY;
                                        lineX = coord[k] / 16 + dx;
                                        lineY = coord[k + 1] / 16 + dy;
                                        this.ctx.lineTo(lineX, lineY);
                                    }
                                    this.ctx.fill();
                                }
                            } else if (style.type == "line") {
                                for (var j = 0; j < coords.length; j++) {
                                    this.ctx.beginPath();
                                    coord = coords[j];
                                    var startX = coord[0] / 16 + dx;
                                    var startY = coord[1] / 16 + dy;
                                    this.ctx.strokeStyle = style.paint["line-color"];
                                    this.ctx.lineWidth = style.paint["line-width"];
                                    this.ctx.moveTo(startX, startY);
                                    for (var k = 2; k < coord.length; k = k + 2) {
                                        var lineX, lineY;
                                        lineX = coord[k] / 16 + dx;
                                        lineY = coord[k + 1] / 16 + dy;
                                        this.ctx.lineTo(lineX, lineY);
                                    }
                                    this.ctx.stroke();
                                }
                            }
                        }
                    }
                }
            },
            /**
             * 绘制切片
             * @param pixel 
             * @param dCol 
             * @param dRow 
             * @param layerType 
             * @param type 
             */
            drawTile: function (pixel, dCol, dRow, layerType, type) {
                console.log(pixel);

                var size = this.tileInfo.size;
                var dx = dCol * size;
                var dy = dRow * size;
                var startX = pixel[0] / 16 + dx;
                var startY = pixel[1] / 16 + dy;
                if (type == "Point") {
                    // var style = this.styleObj[layerType];
                    this.ctx.beginPath();
                    this.ctx.fillStyle = "black";
                    this.ctx.arc(startX, startY, 2, 0, 2*Math.PI);
                    this.ctx.fill();
                }else {
                    this.ctx.beginPath();
                    var style = this.styleObj[layerType];
                    if (style) {
                        if (style.type == "fill") {
                            this.ctx.fillStyle = style.paint["fill-color"];
                            this.ctx.moveTo(startX, startY);
                            for (var i = 2; i < pixel.length - 2; i = i + 2) {
                                var lineX, lineY;
                                lineX = pixel[i] / 16 + dx;
                                lineY = pixel[i + 1] / 16 + dy;
                                this.ctx.lineTo(lineX, lineY);
                                // console.log("lineX:" + lineX, "---lineY:" + lineY);
                            }
                            this.ctx.fill();
                        }else if (style.type == "line") {
                            this.ctx.strokeStyle = style.paint["line-color"];
                            this.ctx.lineWidth = style.paint["line-width"];
                            this.ctx.moveTo(startX, startY);
                            for (var i = 2; i < pixel.length - 2; i = i + 2) {
                                var lineX, lineY;
                                lineX = pixel[i] / 16 + dx;
                                lineY = pixel[i + 1] / 16 + dy;
                                this.ctx.lineTo(lineX, lineY);
                                // console.log("lineX:" + lineX, "---lineY:" + lineY);
                            }
                            this.ctx.stroke();
                        } else if (style.type == "symbol") {
                            /*this.ctx.strokeStyle = style.paint["text-color"];
                            this.ctx.lineWidth = style.paint["text-halo-width"];
                            this.ctx.moveTo(startX, startY);
                            for (var i = 2; i < pixel.length - 2; i = i + 2) {
                                var lineX, lineY;
                                lineX = pixel[i] / 16 + dx;
                                lineY = pixel[i + 1] / 16 + dy;
                                this.ctx.lineTo(lineX, lineY);
                                // console.log("lineX:" + lineX, "---lineY:" + lineY);
                            }
                            this.ctx.stroke();*/
                        }
                    }
                }
            }
        })
    });