
define(
    "com/huayun/webgis/action/draws/PointDraw", [
        "dojo/_base/declare",
        "dojo/on",
        "dojo/dom-class",
        "../../geometry/Circle",
        "../../geometry/Point",
        "../../Graphic",
        "../../Feature",
        "../../symbols/PointSymbol",
        "../ActiveMapAction"
    ], function (declare, on, domClass, Circle, Point, Graphic, Feature, PointSymbol, ActiveMapAction) {
        return declare("com.huayun.webgis.action.draws.PointDraw", [ActiveMapAction], {

            constructor: function (params) {
                this.view = params.view;
                this.view.selectEnabled = false;
                this.isActive = true;
                this._mouseClick = null;
                this.drawLayer = params.drawLayer?params.drawLayer:this.view.map.findLayerById("drawLayer");
                this._symbol = params.symbol?params.symbol:new PointSymbol({
                    radius: 12,
                    color: "#0000FF",
                    strokeColor: "#00FF00",
                    strokeWidth: 1,
                    pitchWithMap: false,
                    scaleWithPitch: false
                });
                if (params.addAttributes) {
                    this.addAttributes = params.addAttributes;
                }
                this.capture = params.capture === undefined?false:params.capture;
                if (this.capture) {
                    this.captureWidth = params.captureWidth === undefined?2:params.captureWidth;
                }
            },
            /**
             * 激活当前的Action
             */
            active: function () {
                if (!this.state) {    //当前Action处于激活状态下的时候，无需重复激活
                    this.state = true;
                    this.view.panEnabled = false;
                    this.view.selectEnabled = false;
                    this._mouseClick = on(this.view.domNode, "click", this._onMouseClick.bind(this));
                    if (this.capture) {
                        this.captureMove = on(this.view.domNode, "mousemove", this._captureMoveHandler.bind(this));
                    }
                    domClass.add(this.view.domNode, "draw-cursor-style");
                }
            },
            _captureMoveHandler: function(e) {
                var geo = this.view.screenToGeometry(e.x, e.y);
                var selectPoints = this.drawLayer.captureFeaturesByGeometry(geo, this.captureWidth);
                if (selectPoints.length > 0) {
                    var selectLine = this.filterGraphic(selectPoints);
                    if (selectLine !== this.selectLine) {
                        if (this.selectLine) {
                            this.releaseLine(this.selectLine);
                        }
                        this.selectLine = selectLine;
                        this.captureLine(this.selectLine);
                    }
                    this.view.threeRender();
                } else {
                    if (this.selectLine) { // 移出
                        this.releaseLine(this.selectLine);
                        this.selectLine = null;
                    }
                    this.view.threeRender();
                }
            },
            /**
             * 使当前的Action失效
             */
            invalid: function () {
                this.state = false;
                if (this._mouseClick !== null) {
                    this._mouseClick.remove();
                    this._mouseClick = null;
                    // this.endActionMethod.call();
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
                this.doAction({x: event.x, y: event.y});
            },
            /**
             * 当前行为要做的事情，可以由行为自己触发，也可以由外部调用触发
             * @param params
             */
            doAction: function (params) {
                this._drawPoint(params.x, params.y);
            },

            /**
             * 图层上绘制点
             * @param x: 点屏幕坐标的x
             * @param y: 点屏幕坐标的y
             */
            _drawPoint: function (x, y) {
                // console.log("draw point");
                var geo = this.view.screenToGeometry(x, y);
                // var geometry = new Circle();
                var geometry = new Point(geo.x, geo.y);
                /*                geometry.setRadius(5);
                                geometry.setCenter(geo);*/

                var feature = new Feature({
                    attributes: null,
                    geometry: geometry
                });
                var currentGraphic = new Graphic({
                    feature: feature,
                    symbol: this._symbol
                });
                this.addAttributes(currentGraphic);
                if (this.selectLine) {
                    this.handleCapture(currentGraphic, this.selectLine);
                }
                this.drawLayer.addGraphic(currentGraphic);
                this.endDraw(currentGraphic);
                this.drawLayer.refresh();
            },
            captureLine: function (graphic) {
                console.log(graphic);
            },
            releaseLine: function (graphic) {
                console.log(graphic);
            },
            addAttributes: function () {},
            handleCapture: function () {},
            filterGraphic: function (selectPoints) {
                for (var i=0;i<selectPoints.length;i++) {
                    if (selectPoints[i].symbol.type === "line") {
                        return selectPoints[i];
                    }
                }
            },
            endDraw: function () {
            }
        });
    }
);