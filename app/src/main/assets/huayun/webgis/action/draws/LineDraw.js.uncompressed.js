define(
    "com/huayun/webgis/action/draws/LineDraw", [
        "dojo/_base/declare",
        "dojo/on",
        "dojo/dom-class",
        "dojo/throttle",
        "../../geometry/Polyline",
        "../../Graphic",
        "../../Feature",
        "../../symbols/LineSymbol",
        "../../geometry/Point2D",
        "../ActiveMapAction"
    ], function (declare, on, domClass, throttle, Polyline, Graphic, Feature, LineSymbol, Point, ActiveMapAction) {
        return declare("com.huayun.webgis.action.draws.LineDraw", [ActiveMapAction], {

            constructor: function (params) {
                this.view = params.view;
                this.view.selectEnabled = false;
                this.isActive = true;
                this.drawLayer = params.drawLayer?params.drawLayer:this.view.map.findLayerById("drawLayer");

                this._mouseClick = null;
                this._dblMouseClick = null;
                this._mouseClickMove = null;
                this._lastPoint = null;
                this.cachePoint = [];
                this.capture = params.capture === undefined?false:params.capture;
                if (this.capture) {
                    this.captureRadius = params.captureRadius === undefined?5:params.captureRadius;
                }

                this._symbol = params.symbol?params.symbol:new LineSymbol({
                    color: "#009688",
                    width: 3
                });
                this._currentGraphic = null;
                this.relatePoint = [];
                this.pointCount = 0;
            },

            active: function () {
                if (!this.state) {    //当前Action处于激活状态下的时候，无需重复激活
                    this.state = true;
                    this.view.panEnabled = false;
                    this.view.selectEnabled = false;
                    this._mouseClick = on(this.view.domNode, "click", this._onMouseClick.bind(this));
                    this._dblMouseClick = on(this.view.domNode, "dblclick", this._onDoubleMouseClick.bind(this));
                    if (this.capture) {
                        this.captureMove = on(this.view.domNode, "mousemove", this._captureMoveHandler.bind(this));
                    }
                    domClass.add(this.view.domNode, "draw-cursor-style");
                }
            },

            _captureMoveHandler: function(e) {
                var geo = this.view.screenToGeometry(e.x, e.y);
                var selectPoints = this.drawLayer.captureFeaturesByGeometry(geo, this.captureRadius);
                if (selectPoints.length > 0) {
                    for (var i=0;i<selectPoints.length;i++) {
                        if (selectPoints[i].symbol.type === "point") {
                            if (selectPoints[i] !== this.selectPoint) {
                                if (this.selectPoint) {
                                    this.releasePoint(this.selectPoint);
                                }
                                this.selectPoint = selectPoints[i];
                                this.capturePoint(this.selectPoint);
                            }
                            break;
                        }
                    }
                    this.view.threeRender();
                } else {
                    if (this.selectPoint) { // 移出
                        this.releasePoint(this.selectPoint);
                        this.selectPoint = null;
                    }
                    this.view.threeRender();
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
                if (this._lastPoint === null) {
                    this.doAction(geo);
                } else {
                    if (event.x !== this._lastPoint.x && event.y !== this._lastPoint.y) {
                        this.doAction(geo);
                    }
                }
                this._lastPoint = {x: event.x, y: event.y};
            },

            /**
             * 鼠标接收到地图的双击事件后，结束绘制
             * @param event
             * @private
             */
            _onDoubleMouseClick: function (event) {
                event.preventDefault();
                event.stopPropagation();
                this._endDrawMethod();
                // this.invalid();
            },
            endActionMethod: function(){},

            invalid: function () {
                this.state = false;
                this.view.panEnabled = true;
                this.view.selectEnabled = true;
                if (this._mouseClick) {
                    this._mouseClick.remove();
                    this._mouseClick = null;
                }
                if (this._dblMouseClick) {
                    this._dblMouseClick.remove();
                    this._dblMouseClick = null;
                }
                if (this.captureMove) {
                    this.captureMove.remove();
                    this.captureMove = null;
                }
                this._endDrawMethod();
                // this.endActionMethod.call();
            },

            doAction: function (geometry) {
                this._drawVertex(geometry);
                this._drawLine();
            },

            /**
             *  绘制顶点
             * @param geometry
             * @private
             */
            _drawVertex: function (geometry) {
                this.pointCount++;
                var geo;
                if (this.selectPoint) {
                    geo = this.selectPoint.feature.geometry.clone();
                } else {
                    geo = geometry;
                }
                if (this.cachePoint.length === 0) {
                    this.cachePoint.push(geo);
                } else {
                    this.cachePoint.splice(this.cachePoint.length - 1, 1, geo);
                    this.cachePoint.push(geo);
                }
                if (this.selectPoint) {
                    this.relatePoint.push({
                        graphic: this.selectPoint,
                        index: this.pointCount - 1
                    });
                }
            },
            /**
             * 绘制两个顶点间的连线
             * @private
             */
            _drawLine: function () {
                this.view.panEnabled = false; // 禁止平移
                if (!this._mouseClickMove) {
                    this._mouseClickMove = on(this.view.domNode, "mousemove", function (e) {
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
                        this._currentGraphic = graphic;
                        this.drawLayer.addGraphic(graphic);
                        this.drawLayer.layerView.view.threeRender();
                    }.bind(this));
                }
            },
            /**
             * 绘制完成执行方法
             * @private
             */
            _endDrawMethod: function () {
                if (this._currentGraphic) {
                    this.addAttributes(this._currentGraphic);
                }
                this.endDraw();
                if (this._mouseClickMove !== null) {
                    this._mouseClickMove.remove();
                    this._mouseClickMove = null;
                }
                this.cachePoint = [];
                this.pointCount = 0;
                this.relatePoint = [];
                this._lastPoint = null;
                this._currentGraphic = null;
            },
            endDraw: function() {

            },
            capturePoint: function (graphic) {

            },
            releasePoint: function (graphic) {

            },
            addAttributes: function () {}
        });
    }
);
