define(
    "com/huayun/webgis/action/draws/PolygonDraw", [
        "dojo/_base/declare",
        "dojo/on",
        "dojo/dom-class",
        "dojo/throttle",
        "../../geometry/Polygon",
        "../../geometry/Point2D",
        "../../Graphic",
        "../../Feature",
        "../../symbols/PolygonSymbol",
        "../../symbols/PointSymbol",
        "../ActiveMapAction"
    ], function (declare, on, domClass, throttle, Polygon, Point, Graphic, Feature, PolygonSymbol, PointSymbol, ActiveMapAction) {
        return declare("com.huayun.webgis.action.draws.PolygonDraw", [ActiveMapAction], {

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

                this._symbol = params.symbol ? params.symbol : new PolygonSymbol({
                    color: "#4CAF50",
                    opacity: 0.8
                });
                this._vertexSymbol = new PointSymbol({
                    radius: 5,
                    color: "#0000FF"
                })
                this._currentGraphic = null;

                this.drawEndHook = [];
            },

            active: function () {
                if (!this.state) {    //当前Action处于激活状态下的时候，无需重复激活
                    this.state = true;
                    this.view.panEnabled = false;
                    this.view.selectEnabled = false;
                    this._mouseClick = on(this.view.domNode, "click", this._onMouseClick.bind(this));
                    this._dblMouseClick = on(this.view.domNode, "dblclick", this._onDoubleMouseClick.bind(this));
                    domClass.add(this.view.domNode, "draw-cursor-style");
                    this._createPolygonList();
                }
            },

            /**
             * 创建测量列表
             * @private
             */
            _createPolygonList: function () {
                for (var i = this._polygonList.length - 1; i > -1; i--) {
                    var temp = this._polygonList[i];
                    if (temp.length === 0) {
                        this._polygonList.splice(i, 1);
                    }
                }
                this._vertexArr = [];
                this._polygonList.push(this._vertexArr);
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
                if(!this._mouseMove) {
                    this._mouseMove = on(this.view.domNode, "mousemove", this._onMouseMove.bind(this));
                }
                if (this._lastPoint === null) {
                    this.doAction(geo);
                } else {
                    if (event.x !== this._lastPoint.x && event.y !== this._lastPoint.y) {
                        this.doAction(geo);
                    }
                }
                this._lastPoint = { x: event.x, y: event.y };
            },

            _onMouseMove: function(e) {
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
                if(this._preClick) {
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
                this._endDrawMethod();
                // console.log(this.drawLayer.group.children);
                // this.invalid();
            },

            invalid: function () {
                this.state = false;
                this.view.panEnabled = true;
                if (this._mouseClick !== null) {
                    this._mouseClick.remove();
                    this._mouseClick = null;
                }
                if (this._dblMouseClick !== null) {
                    this._dblMouseClick.remove();
                    this._dblMouseClick = null;
                }
                this._vertexArr = [];
                this._endDrawMethod();
                // this.endActionMethod.call();
            },

            doAction: function (geometry) {
                // this._drawVertex(geometry);
                this._drawPoint(geometry);
            },
            /**
             *  绘制顶点
             * @param x
             * @param y
             * @private
             */
            _drawVertex: function (x, y) {
                // var position = this.drawLayer.group.position;
                // var realPoint = this.map.screenTo3dPoint(x, y);
                // realPoint.x = realPoint.x - position.x;
                // realPoint.y = realPoint.y - position.y;
                // this.drawLayer.drawPoint({x: realPoint.x, y: realPoint.y});
            },
            /**
             * 绘制顶点
             * @param geometry
             * @private
             */
            _drawPoint: function (geometry) {
                var geo = new Point(geometry.x, geometry.y);
                var feature = new Feature({
                    attribute: null,
                    geometry:geo
                });
                var vertexGraphic = new Graphic({
                    feature: feature,
                    symbol: this._vertexSymbol
                });
                this.drawLayer.addGraphic(vertexGraphic);
                var len = this._vertexArr.length;
                this._preClick = true;
                if(len < 3) {
                    this._vertexArr.push(new Point(geo.x, geo.y));
                } else {
                    this._vertexArr.splice(this._vertexArr.length - 1, 1, new Point(geometry.x, geometry.y));
                }
                this.drawLayer.layerView.view.threeRender();
            },
            /**
             * 绘制完成执行方法
             * @private
             */
            _endDrawMethod: function () {
                if (this._mouseClickMove !== null) {
                    this._mouseClickMove.remove();
                    this._mouseClickMove = null;
                }

                for (var i = 0; i < this.drawEndHook.length; i++) {
                    this.drawEndHook[i](this._currentGraphic);
                }

                this._vertexArr = [];
                this._currentGraphic = null;
            }
        });
    }
);