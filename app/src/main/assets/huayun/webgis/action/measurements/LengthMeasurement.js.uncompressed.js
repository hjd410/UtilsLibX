define(
    "com/huayun/webgis/action/measurements/LengthMeasurement", [
        "dojo/_base/declare",
        "dojo/on",
        "dojo/dom",
        'dojo/query',
        "dojo/topic",
        "dojo/dom-class",
        "dojo/throttle",
        "dojo/dom-construct",
        "dojo/_base/window",
        "../../geometry/Polyline",
        "../../Graphic",
        "../../Feature",
        "../../symbols/LineSymbol",
        "../../symbols/PointSymbol",
        "../../symbols/TextSymbol",
        "../../geometry/Point2D",
        "../ActiveMapAction"
    ], function (declare, on, dom, query, topic, domClass, throttle, domConstruct, win, Polyline, Graphic, Feature, LineSymbol, PointSymbol, TextSymbol, Point, ActiveMapAction) {
        return declare("com.huayun.webgis.action.draws.LineDraw", [ActiveMapAction], {

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
                this.cacheLength = 0;
                this._lineGraphicList = [];
                this._isNew = true;
                this._preClick = true;
                //以closeGraphic的id为key,_lineGraphicList作为value的Hash
                this._lineGraphicHash = {};

                this._symbol = new LineSymbol({
                    color: "#009688",
                    width: 3
                });
                this._vertexSymbol = new PointSymbol({
                    radius: 5,
                    color: "#0000FF",
                    pitchWithMap: false,
                    scaleWithPitch: false
                });
                this._currentGraphic = null;

                var obj = this;
                topic.subscribe("measurement-delete", function (id) {
                    var graphicList = obj._lineGraphicHash[id];
                    if (graphicList && graphicList.length > 0) {
                        graphicList.forEach(function (item) {
                            obj.drawLayer.removeGraphic(item);
                        });
                    }
                });
                topic.subscribe("frameUpdate", function(){
                    this.toLocal();
                }.bind(this));
            },

            active: function () {
                if (!this.state) {    //当前Action处于激活状态下的时候，无需重复激活
                    this.state = true;
                    this.view.panEnabled = false;
                    this.view.selectEnabled = false;
                    this._mouseClick = on(this.view.domNode, "click", this._onMouseClick.bind(this));
                    this._dblMouseClick = on(this.view.domNode, "dblclick", this._onDoubleMouseClick.bind(this));
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
                if (!this._mouseClickMove) {
                    this._mouseClickMove = on(this.view.domNode, "mousemove", throttle(this._onMouseMove.bind(this), 20));
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
            _onMouseMove: function(e) {
                var geo = this.view.screenToGeometry(e.x, e.y);
                this.drawLayer.removeGraphic(this._currentGraphic);
                var geometry = new Polyline();
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
                        border: "2px solid red", display: "block", cursor: "pointer",
                        fontSize: "4px", margin: "0 auto", lineHeight: "8px", backgroundColor: "white"
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

            toLocal: function() {
                var self = this;
                var allGraphics = self.drawLayer.graphics;
                var endPoint = [];
                for(var i = 0;i < allGraphics.length; i++) {
                    if("rg" in allGraphics[i]){
                        for(var j = allGraphics[i].rg.length - 1;j > -1 ; j--) {
                            if(j == allGraphics[i].rg.length - 2){
                                endPoint.push(allGraphics[i].rg[j]);
                                break;
                            }
                        }
                    }
                }
                for(var k = endPoint.length -1; k > -1; k--){
                    var point = endPoint[k];
                    var x = point.feature.geometry.x;
                    var y = point.feature.geometry.y;
                    var screeP = self.view.geometryToScreen(x, y);
                    query(".graphicClose")[k].style.left = screeP.x + 3 + "px";
                    query(".graphicClose")[k].style.top = screeP.y + 3 + "px";
                }
            },

            invalid: function () {
                if (!this.state) {
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
                // dom.byId("graphicClose").style.display = "none";
            },

            doAction: function (geometry) {
                this._drawVertex(geometry);
            },

            /**
             *  绘制顶点
             * @param geo
             * @private
             */
            _drawVertex: function (geo) {
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
                if (this._isNew) {
                    this._vertexArr.push(new Point(geometry.x, geometry.y));
                    this._addDistanceTip(geometry, "起点");
                    this._isNew = false;
                } else {
                    this._vertexArr.splice(this._vertexArr.length - 1, 1, new Point(geo.x, geo.y));
                    this.cacheLength += this._calLineLength(this._vertexArr[len - 2], this._vertexArr[len - 1]);
                    this._addDistanceTip(geometry, this._distanceToTip(this.cacheLength));
                }
                this.drawLayer.layerView.view.threeRender();
            },
            _addDistanceTip: function(geo, tip) {
                var textFieldSymbol = new TextSymbol({
                    text: tip,
                    color: "#009688",
                    size: 12,
                    offset: [-24, 12]
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

            _calLineLength: function (p1, p2) {
                return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x)+(p2.y - p1.y) * (p2.y - p1.y));
            },

            /**
             * 绘制两个顶点间的连线
             * @private
             */
           /* _drawLine: function () {
                this.view.panEnabled = false; // 禁止平移
                if (!this._mouseClickMove) {
                    this._mouseClickMove = on(this.view.domNode, "mousemove", throttle(function (e) {
                        var geo = this.view.screenToGeometry(e.x, e.y);
                        this.drawLayer.removeGraphic(this._currentGraphic);
                        var geometry = new Polyline();
                        var feature = new Feature({
                            attribute: null,
                            geometry: geometry
                        });
                        var graphic = new Graphic({
                            feature: feature,
                            symbol: this._symbol
                        });

                        if (this.cachePoint.length < 2) {
                            this.cachePoint.push(new Point(geo.x, geo.y));

                        } else {
                            this.cachePoint.splice(this.cachePoint.length - 1, 1, new Point(geo.x, geo.y));
                        }
                        geometry.setPath([this.cachePoint]);
                        var len = this.cachePoint.length;
                        if (len > 1) {
                            this.cacheLength += this._calLineLength(this.cachePoint[len - 2], this.cachePoint[len - 1]);
                        }
                        this._currentGraphic = graphic;
                        this.drawLayer.addGraphic(graphic);
                        this.drawLayer.layerView.view.threeRender();
                    }.bind(this), 20));
                }
            },*/
            _distanceToTip: function (distanceNumber) {
                //把距离转换成合适的单位
                return distanceNumber < 1000 ? distanceNumber.toFixed(2) + "米" : (distanceNumber / 1000).toFixed(2) + "千米";
            },
            /**
             * 绘制完成执行方法
             * @private
             */
            _endDrawMethod: function () {
                this._lineGraphicHash[this._currentGraphic.id] = this._lineGraphicList;
                this.cacheLength = 0;
                if (this._mouseClickMove !== null) {
                    this._mouseClickMove.remove();
                    this._mouseClickMove = null;
                }
                this._vertexArr = [];
                this._currentGraphic = null;
                this._lastPoint = null;
                this._lineGraphicList = null;
                this._isNew = true;

                // if (this._mouseClick !== null) {
                //     this._mouseClick.remove();
                //     this._mouseClick = null;
                // }
            }
        });
    }
);