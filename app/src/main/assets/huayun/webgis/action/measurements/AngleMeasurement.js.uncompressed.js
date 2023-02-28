define(
    "com/huayun/webgis/action/measurements/AngleMeasurement", [
        "dojo/_base/declare",
        "dojo/on",
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
    ], function (declare, on, topic, domClass, throttle, domConstruct, win, Polyline, Graphic, Feature, LineSymbol, PointSymbol, TextSymbol, Point, ActiveMapAction) {
        return declare("com.huayun.webgis.action.measurements.AngleMeasurement", [ActiveMapAction], {
            constructor: function (params) {
                this.view = params.view;
                this.view.selectEnabled = false;
                this.isActive = true;
                this.drawLayer = this.view.map.findLayerById("drawLayer");
                this._mouseClick = null;
                this._dblMouseClick = null;
                this._mouseMove = null;
                this._lastPoint = null;
                this._vertexArr = [];
                this._preClick = true;

                this._currentGraphic = null;
                //一条线相关的所有graphic，line、tip、vertex、close
                this._lineGraphicList = [];
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

                var obj = this;
                topic.subscribe("measurement-delete", function (id) {
                    var graphicList = obj._lineGraphicHash[id];
                    if (graphicList && graphicList.length > 0) {
                        graphicList.forEach(function (item) {
                            obj.drawLayer.removeGraphic(item);
                        });
                    }
                });
                topic.subscribe("clearGraphicPop", function (){
                    var items = document.getElementsByClassName("graphicClose");
                    for(var i = items.length - 1; i > -1 ; i--){
                        domConstruct.destroy(items[i]);
                    }
                    this.drawLayer.clear();
                }.bind(this));
            },
            active: function () {/*事件触发后执行active*/
                if (!this.state) {    //当前Action处于激活状态下的时候，无需重复激活
                    this.state = true;
                    this.view.panEnabled = false;
                    this.view.selectEnabled = false;
                    this._isNew = true;
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
                if (!this._mouseMove) {
                    this._mouseMove = on(this.view.domNode, "mousemove", this._onMouseMove.bind(this));
                }
                var geo = this.view.screenToGeometry(event.x, event.y);
                if (this._lastPoint === null) { //起点绘制
                    this._lineGraphicList = [];
                    this.doAction(geo);
                } else {
                    if (event.x !== this._lastPoint.x && event.y !== this._lastPoint.y) {
                        this.doAction(geo);/*绘制端点和线段*/
                    }
                }
                this._lastPoint = {x: event.x, y: event.y};

            },
            /**
             * 持续鼠标移动过程中的处理函数
             * @param event
             * @private
             */
            _onMouseMove: function (event) {
                var geo = this.view.screenToGeometry(event.x, event.y);
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
            doAction: function (params) {
                this._drawVertex(params);
            },
            /**
             * 绘制端点
             * @param geo 
             * @private
             */
            _drawVertex: function (geo) {/*绘制端点*/
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
                    this._vertexArr.splice(len - 1, 1, new Point(geo.x, geo.y));
                    if (len > 2) {
                        this._addDistanceTip(this._vertexArr[len-2], this._angleToTip(this._calculateAngle()));
                    }
                }
                this.drawLayer.layerView.view.threeRender();
            },

            _addDistanceTip: function(geo, tip) {
                var r = this.view.resolution;
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

            /**
             * 计算角度
             * @returns {number}: 两点间的实际地理距离
             */
            _calculateAngle: function () {
                var len = this._vertexArr.length;
                if (len < 3) {
                    return 0;
                }
                var startPoint = this._vertexArr[len - 3];
                var anglePoint = this._vertexArr[len - 2];
                var endPoint = this._vertexArr[len - 1];
                var _x1 = startPoint.x - anglePoint.x;
                var _y1 = startPoint.y - anglePoint.y;
                var _x2 = endPoint.x - anglePoint.x;
                var _y2 = endPoint.y - anglePoint.y;
                var dot = _x1 * _x2 + _y1 * _y2;
                var det = _x1 * _y2 - _y1 * _x2;
                var angle = Math.atan2(det, dot) / Math.PI * 180;
                var _deg = (angle + 360) % 360;//取角度正值
                var result = _deg < 180 ? _deg : 360 - _deg;//取锐角
                return result;
            },
            /**
             * 角度转换成tip
             * @param angleNumber
             * @returns {string}
             * @private
             */
            _angleToTip: function (angleNumber) {
                var result = null;
                if (angleNumber > 0 && angleNumber < 180) {
                    result = angleNumber.toFixed(2) + "度";
                }
                return result;
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
            /**
             * 绘制完成执行方法
             * @private
             */
            _endDrawMethod: function () {
                this._lineGraphicHash[this._currentGraphic.id] = this._lineGraphicList;
                if (this._mouseMove !== null) {
                    this._mouseMove.remove();
                    this._mouseMove = null;
                }
                this._vertexArr = [];
                this._isNew = !this._isNew;
                this._currentGraphic = null;
                this._lastPoint = null;
                this._lineGraphicList = null;
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
                // this.drawLayer.clear();
            },
            showDeleButton: function(event, lineId) {
                var self = this;
                var delBtn = domConstruct.create("div",
                {
                    className: "graphicClose",
                    style: {
                        width: "8px", height: "8px", position: "absolute", color: "red",
                        border: "2px solid red", display: "block", cursor: "pointer",
                        fontSize: "4px", margin: "0 auto", lineHeight: "8px", backgroundColor: "white" 
                    },
                    innerHTML: "×"
                }, document.body);
                on(delBtn, "click", function(e) {
                    var graphics = self.drawLayer.graphics;
                    var g;
                    for(var i=0, ii = graphics.length; i<ii; i++){
                        g = graphics[i];
                        if(g.id === lineId) {
                            break;
                        }
                    }
                    if(g) {
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
            }
        });
    }
);