
define(
    "com/huayun/webgis/action/measurements/AreaMeasurement", [
        "dojo/_base/declare",
        "dojo/on",
        "dojo/topic",
        "dojo/dom-class",
        "dojo/dom-construct",
        "../../geometry/Polygon",
        "../../Graphic",
        "../../Feature",
        "../../geometry/Point2D",
        "../../symbols/PolygonSymbol",
        "../../symbols/PointSymbol",
        "../../symbols/TextSymbol",
        "../ActiveMapAction"
    ], function (declare, on, topic, domClass, domConstruct, Polygon, Graphic, Feature, Point, PolygonSymbol, PointSymbol, TextSymbol, ActiveMapAction) {
        return declare("com.huayun.webgis.action.measurements.AreaMeasurement", [ActiveMapAction], {
            constructor: function (params) {
                this.view = params.view;
                this.view.selectEnabled = false;
                this.isActive = true;
                this.drawLayer = this.view.map.findLayerById("drawLayer");

                this._mouseClick = null;
                this._dblMouseClick = null;
                this._mouseClickMove = null;
                this._lastPoint = null;
                this._vertexArr = [];
                this._polygonList = [];

                this._symbol = new PolygonSymbol({
                    color: "#8F8FFF",
                    opacity: 0.5
                });
                this._vertexSymbol = new PointSymbol({
                    radius: 5,
                    color: "#0000FF"
                });

                this._currentGraphic = null;
                //一条线相关的所有graphic，line、tip、vertex、close
                this._lineGraphicList = [];
                //以closeGraphic的id为key,_lineGraphicList作为value的Hash
                this._lineGraphicHash = {};

                var obj = this;
                topic.subscribe("measurement-delete", function (id) {
                    var graphicList = obj._lineGraphicHash[id];
                    if (graphicList && graphicList.length > 0) {
                        graphicList.forEach(function (item) {
                            obj.drawLayer.removeGraphic(item);
                        });
                    }
                });
            },

            active: function () {
                if (!this.state) {    //当前Action处于激活状态下的时候，无需重复激活
                    this.state = true;
                    this.view.panEnabled = false;
                    this.view.selectEnabled = false;
                    this._mouseClick = on(this.view.container, "click", this._onMouseClick.bind(this));
                    this._dblMouseClick = on(this.view.container, "dblclick", this._onDoubleMouseClick.bind(this));
                    domClass.add(this.view.domNode, "draw-cursor-style");
                }
            },
            /**
             * 鼠标接收到地图的点击事件后，开始绘制点
             * @param event
             * @private
             */
            _onMouseClick: function (event) {
                event.preventDefault();
                event.stopPropagation();
                var geo = this.view.screenToGeometry(event.x, event.y);
                if (!this._mouseMove) {
                    this._mouseMove = on(this.view.domNode, "mousemove", this._onMouseMove.bind(this));
                }
                if (this._lastPoint === null) {
                    this._lineGraphicList = [];
                    this.doAction(geo);
                } else {
                    if (event.x !== this._lastPoint.x && event.y !== this._lastPoint.y) {
                        this.doAction(geo);
                    }
                }
                this._lastPoint = {x: event.x, y: event.y};
            },
            _onMouseMove: function (e) {
                var geo = this.view.screenToGeometry(e.x, e.y);
                this.drawLayer.removeGraphic(this._currentGraphic);
                var geometry = new Polygon();
                var feature = new Feature({
                    attribute: null,
                    geometry: geometry
                });
                var graphic = new Graphic({
                    feature: feature,
                    symbol: this._symbol
                });
                if (this._preClick) {
                    this._vertexArr.push(new Point(geo.x, geo.y));
                    this._preClick = false;
                } else {
                    this._vertexArr.splice(this._vertexArr.length - 1, 1, new Point(geo.x, geo.y));
                }
                geometry.setPath([this._vertexArr]);
                this._currentGraphic = graphic;
                this.drawLayer.addGraphic(graphic);
                this.drawLayer.layerView.view.threeRender();
            },

            /**
             * 鼠标接收到地图的双击事件后，结束绘制
             * @param event
             * @private
             */
            _onDoubleMouseClick: function (event) {
                event.preventDefault();
                event.stopPropagation();
                this._currentGraphic.rg = this._lineGraphicList;
                var lineId = this._currentGraphic.id;
                this.showDeleButton(event, lineId);
                this.invalid();
            },

            showDeleButton: function(event, lineId) {
                var self = this;
                var delBtn = domConstruct.create("div", 
                {
                    className: "graphicClose",
                    style:{
                        width: "8px", height: "8px", position: "absolute", color: "red",
                        border: "2px solid red", display: "block", cursor: "pointer", textAlign: "center",
                        fontSize: "4px", margin: "0 auto", lineHeight: "5px", backgroundColor: "white"
                    },
                    innerHTML:"×"
                }, document.body);
                on(delBtn, "click", function(e) {
                    var graphics = self.drawLayer.graphics;
                    var g;
                    for(var i=0, ii = graphics.length; i<ii;i++) {
                        g = graphics[i];
                        if(g.id === lineId) {
                            break;
                        }
                    }
                    if (g) { // 选中的线
                        self.drawLayer.removeGraphic(g);
                        var rg = g.rg;
                        rg.forEach(function(item) {
                            self.drawLayer.removeGraphic(item);
                        });
                        domConstruct.destroy(this);
                    }
                });

                delBtn.style.left = event.clientX + 5 + "px";
                delBtn.style.top = event.clientY + 5 + "px";
                return delBtn;
            },

            invalid: function () {
                if(!this.state){
                    return;
                }
                this._endDrawMethod();
                this.state = false;
                this.view.panEnabled = true;
                this.view.selectEnabled = true;
                if (this._mouseClick !== null) {
                    this._mouseClick.remove();
                    this._mouseClick = null;
                }
                if (this._dblMouseClick !== null) {
                    this._dblMouseClick.remove();
                    this._dblMouseClick = null;
                }
                domClass.remove(this.view.domNode, "draw-cursor-style");
                // this.drawLayer.clear();
            },

            doAction: function (geometry) {
                this._drawDotMark(geometry);
            },
            _drawDotMark: function (geo) {
                var geometry = new Point(geo.x, geo.y);
                var feature = new Feature({
                    attribute: null,
                    geometry: geometry
                });
                var vertexGraphic = new Graphic({
                    feature: feature,
                    symbol: this._vertexSymbol
                });
                this.drawLayer.addGraphic(vertexGraphic);
                this._lineGraphicList.push(vertexGraphic);
                var len = this._vertexArr.length;
                this._preClick = true;
                if (len < 3) {
                    this._vertexArr.push(new Point(geometry.x, geometry.y));
                } else {
                    this._vertexArr.splice(this._vertexArr.length - 1, 1, new Point(geo.x, geo.y));

                }
                this.drawLayer.layerView.view.threeRender();
            },
            _addDistanceTip: function (geo, tip) {
                var textFieldSymbol = new TextSymbol({
                    text: tip,
                    color: "#000000",
                    size: 12
                });
                var tipFeature = new Feature({
                    attribute: null,
                    geometry: new Point(geo.x, geo.y)
                });
                var tipGraphic = new Graphic({
                    feature: tipFeature,
                    symbol: textFieldSymbol
                });
                this.drawLayer.addGraphic(tipGraphic);
                this._lineGraphicList.push(tipGraphic);
            },
            /**
             * 绘制完成执行方法
             * @private
             */
            _endDrawMethod: function () {
                var barycentic_gemo = this._calculateGravityMethod();/*计算中心坐标*/
                this._addDistanceTip(barycentic_gemo, this._calculateArea());
                this.drawLayer.layerView.view.threeRender();
                this._lineGraphicHash[this._currentGraphic.id] = this._lineGraphicList;
                if (this._mouseClickMove !== null) {
                    this._mouseClickMove.remove();
                    this._mouseClickMove = null;
                }
                this._vertexArr = [];
                this._currentGraphic = null;
                this._lastPoint = null;
                this._lineGraphicList = null;
            },

            _calculateGravityMethod: function () {/*计算中心坐标*/
                var list = this._vertexArr,
                    len = this._vertexArr.length;
                if (len < 3) {
                    return list[0];
                }
                var temp = 0;
                var area = 0;
                var cx = 0, cy = 0;
                for (var i = 0; i < list.length - 1; i++) {
                    var geoTo3dPoint1 = list[i];
                    var geoTo3dPoint2 = list[i + 1];
                    temp = geoTo3dPoint1.x * geoTo3dPoint2.y - geoTo3dPoint1.y * geoTo3dPoint2.x;
                    area += temp;
                    cx += temp * (geoTo3dPoint1.x + geoTo3dPoint2.x);
                    cy += temp * (geoTo3dPoint1.y + geoTo3dPoint2.y);
                }
                var geoTo3dPointLast = list[len - 1];
                var geoTo3dPointFirst = list[0];
                temp = geoTo3dPointLast.x * geoTo3dPointFirst.y - geoTo3dPointLast.y * geoTo3dPointFirst.x;
                area += temp;
                cx += temp * (geoTo3dPointLast.x + geoTo3dPointFirst.x);
                cy += temp * (geoTo3dPointLast.y + geoTo3dPointFirst.y);
                area = area / 2;
                cx = cx / (6 * area);
                cy = cy / (6 * area);
                return {x: cx, y: cy, z: 0};
            },

            /**
             * 计算面积
             * @private
             */
            _calculateArea: function () {
                var point_num = this._vertexArr.length;
                if (point_num < 3) return 0;
                var sum = this._vertexArr[0].y * (this._vertexArr[point_num - 1].x - this._vertexArr[1].x);
                for (var i = 1; i < point_num; ++i) {
                    sum += this._vertexArr[i].y * (this._vertexArr[i - 1].x - this._vertexArr[(i + 1) % point_num].x)
                }
                return Math.abs(sum / (2 * 1000 * 1000)).toFixed(5) + "km²";
            }
        });
    }
);