/**
 * Created by overfly on 2018/05/30.
 * @module com/huayun/webgis/layers
 * @see com.huayun.webgis.layers.2d.TileLayer
 */
define(
    "com/huayun/webgis/layers/2d/TileLayer", [
        "dojo/_base/declare",
        "dojo/_base/fx",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/topic",
        "../../request",
        "./FlatLayer",
        "../../geometry/Extent",
        "../../geometry/MapPoint",
        "../../geometry/Point",
        "../support/Tile",
        "../support/LOD",
        "../support/TileInfo",
        "../../../facades/TileInfoFacade"

    ], function (declare, fx, domConstruct, domStyle, topic, request, FlatLayer, Extent, MapPoint, Point, Tile, LOD, TileInfo, TileInfoFacade) {
        /**
         * @alias com.huayun.webgis.layers.2d.TileLayer
         * @extends {FlatLayer}
         * @property {string}  url  - 切片请求地址
         * @property {string}  tileInfo  - 切片信息
         * @property {Array}  _urlList  - 当前url列表
         * @property {Array}  _newRenderUrlList  - 新增渲染切片列表
         * @property {Array}  _removeRenderTileList  - 移除渲染切片列表
         * @property {Array}  _currentRenderTileList  - 当前范围下需要绘制的切片列表
         * @property {Array}  _allRenderTileList  - 所有渲染的切片
         * @property {string}  _animateRaf  - 动画
         */
        return declare("com.huayun.webgis.layers.2d.TileLayer", [FlatLayer], {
            url: null,               //切片请求地址
            tileInfo: null,              //切片信息
            _urlList: [],                //当前url列表
            _newRenderUrlList: [],      //新增渲染切片列表
            _removeRenderTileList: [],   //移除渲染切片列表
            _currentRenderTileList: [],  //当前范围下需要绘制的切片列表
            _allRenderTileList: [],        //所有渲染的切片
            _animateRaf: null,              //动画

            constructor: function (params) {
                declare.safeMixin(this, params);
                this._tileInfoFacade = new TileInfoFacade();
                this._getTileInfo();
            },

            postCreate: function () {
                this.inherited(arguments);
                this.ctx = this.canvasNode.getContext("2d");
                this.ctx.imageSmoothingEnabled = false;
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
                        origin: originPoint
                    });
                    topic.publish("tileInfoComplete");
                }.bind(this), function (err) {
                    console.log(err.message);
                }.bind(this));
            },
            /**
             * 刷新
             */
            refresh: function () {  //refresh中要做的事情1：计算切片的行、列;2：获取新的数据;3：渲染
                if (this.visible) {
                    this._currentRenderTileList = [];

                    if (this.map.zoomined) {//放大
                        this._zoomStart("zoomIn");
                    }
                    if (this.map.zoomouted) {//缩小
                        this._zoomStart("zoomOut");
                    }

                    if (this.map.panned) {
                        this.ctx.clearRect(0, 0, this.map.width, this.map.height);
                    }

                    if (this.tileInfo) {
                        var renderData = this._calculationRenderingColAndRowData();

                        this._getCurrentDrawTileList(renderData);

                        this._drawImageToCanvas();
                    }
                }
            },

            /**
             * 计算渲染的行和列相关的数据startRol 起始列 startRow 起始行 ColNum 请求列数 RowNum 请求行数
             */
            _calculationRenderingColAndRowData: function () {
                var origin = this.tileInfo.origin;
                var tileSize = this.tileInfo.size;
                var extent = this.map.extent;
                var resolution = this.map.resolution;

                //计算瓦片起始行列号
                var fixedTileLeftTopNumX = Math.floor(Math.abs(origin.x - extent.minx) / (resolution * tileSize));
                var fixedTileLeftTopNumY = Math.floor(Math.abs(origin.y - extent.maxy) / (resolution * tileSize));
                // console.log("fixedTileLeftTopNumX:>>>", fixedTileLeftTopNumX, "fixedTileLeftTopNumY:>>>", fixedTileLeftTopNumY);

                //计算切片真实对应的地理范围
                var realMinX = fixedTileLeftTopNumX * resolution * tileSize + origin.x;
                var realMaxY = origin.y - fixedTileLeftTopNumY * resolution * tileSize;
                // console.log("realMinX:>>>", realMinX, "realMaxY:>>>", realMaxY);

                //计算偏移量,真实地理坐标和
                var offSetX = ((realMinX - extent.minx) / resolution);
                var offSetY = ((extent.maxy - realMaxY) / resolution);
                // console.log("offSetX:>>>", offSetX, "offSetY:>>>", offSetY);

                //计算x、y需要请求的切片个数
                var mapXClipNum = Math.ceil((this.width + Math.abs(offSetX)) / tileSize);
                var mapYClipNum = Math.ceil((this.height + Math.abs(offSetY)) / tileSize);
                // console.log("mapXClipNum:>>>",mapXClipNum, "mapYClipNum:>>>",mapYClipNum);
                return {
                    startCol: fixedTileLeftTopNumX,
                    startRow: fixedTileLeftTopNumY,
                    colNum: mapXClipNum,
                    rowNum: mapYClipNum,
                    offSetX: offSetX,
                    offSetY: offSetY
                }
            },

            /**
             * 获取当前绘制切片的列表
             * @param renderData
             * @private
             */
            _getCurrentDrawTileList: function (renderData) {
                this._newRenderUrlList = [];
                for (var i = renderData.startCol; i < renderData.startCol + renderData.colNum; i++) {
                    for (var j = renderData.startRow; j < renderData.startRow + renderData.rowNum; j++) {
                        var url = this.url + this.map.level + "/" + i + "/" + j;
                        var coordX = renderData.offSetX + (i - renderData.startCol) * this.tileInfo.size;
                        var coordY = renderData.offSetY + (j - renderData.startRow) * this.tileInfo.size;
                        var coordPoint = new Point(coordX, coordY);
                        this._newRenderUrlList.push(url);
                        if (this._urlList.indexOf(url) === -1) {    //检查当前url是否是新的请求地址，如果是新的则添加到新增渲染切片列表中。
                            this._urlList.push(url);
                            var size = this.tileInfo.size;
                            var tile = new Tile(url, coordPoint, size);
                            this._allRenderTileList[url] = tile;
                        } else {
                            var tempTile = this._allRenderTileList[url];
                            tempTile.updatePoint(coordPoint);
                        }
                    }
                }
                for (var k = 0; k < this._newRenderUrlList.length; k++) {
                    var renderTile = this._allRenderTileList[this._newRenderUrlList[k]];
                    this._currentRenderTileList.push(renderTile);
                }
            },

            /**
             * 绘制图片到Canvas
             * @private
             */
            _drawImageToCanvas: function () {
                for (var i = 0; i < this._currentRenderTileList.length; i++) {
                    var tileInfo = this._currentRenderTileList[i];
                    if (tileInfo.image != null) {
                        this.ctx.drawImage(tileInfo.image, tileInfo.coordPoint.x, tileInfo.coordPoint.y, tileInfo.size, tileInfo.size);
                    } else {
                        (function (tileInfo) {
                            request(tileInfo.url, {
                                responseType: "image",
                                allowImageDataAccess: false
                            }).then(function (resp) {
                                var image = resp.data;
                                tileInfo.setImage(image);
                                this.ctx.drawImage(tileInfo.image, tileInfo.coordPoint.x, tileInfo.coordPoint.y, tileInfo.size, tileInfo.size);
                            }.bind(this), function (error) {
                                console.log(error);
                            });
                        }).call(this, tileInfo);
                    }

                }
            },
            /**
             * 开始缩放
             * @private
             */
            _zoomStart: function (type) {
                var node = domConstruct.toDom("<img id='animationImg' style='position: fixed;top: 0px'/>");
                node.src = this.canvasNode.toDataURL("image/png");
                domConstruct.place(node, this.id);
                this.ctx.clearRect(0, 0, this.map.width, this.map.height);
                domStyle.set(node, "transform", "linear");
                var count = 30;
                if (type === "zoomIn") {    //放大
                    // this._animateZoomIn.bind(this, null, x, y);
                    this._animateZoomIn(null, 0, 0, node, count);
                } else if (type === "zoomOut") {    //缩小
                    // this._animateZoomOut.bind(this, null, x, y);
                    this._animateZoomOut(null, 0, 0, node, count);
                }
            },
            /**
             * 结束缩放
             * @private
             */
            _zoomEnd: function (node) {
                domConstruct.destroy(node.id);
                window.cancelAnimationFrame(this._animateRaf);
            },
            _animateZoomOut: function (start, x, y, node, count) {
                if (!start) start = performance.now();
                var delta = performance.now() - start;
                if (delta >= 500) {
                    this._zoomEnd(node);
                } else {
                    var opacityValue = --count / 30;
                    domStyle.set(node, "-webkit-transform", "scale(0.8)");
                    // fx.fadeIn({node:node}).play();
                    domStyle.set(node, "opacity", opacityValue);
                    this._animateRaf = window.requestAnimationFrame(this._animateZoomOut.bind(this, start, x, y, node, count));
                }
            },
            _animateZoomIn: function (start, x, y, node, count) {
                if (!start) {
                    start = performance.now();
                }
                var delta = performance.now() - start;
                if (delta >= 500) {
                    this._zoomEnd(node);
                } else {
                    var opacityValue = --count / 30;
                    console.log(opacityValue);
                    domStyle.set(node, "-webkit-transform", "scale(" + 1.4 + ")");
                    domStyle.set(node, "opacity", opacityValue);
                    this._animateRaf = window.requestAnimationFrame(this._animateZoomIn.bind(this, start, x, y, node, count));
                }
            }
        })
    });