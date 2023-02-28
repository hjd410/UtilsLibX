define(
    "com/huayun/webgis/action/draws/CircleDraw", [
        "dojo/_base/declare",
        "dojo/on",
        "dojo/dom-class",
        "../../geometry/Circle",
        "../../Graphic",
        "../../Feature",
        "../../symbols/CircleSymbol",
        "../ActiveMapAction"
    ], function (declare, on, domClass, Circle, Graphic, Feature, CircleSymbol, ActiveMapAction) {
        return declare("com.huayun.webgis.action.draws.CircleDraw", [ActiveMapAction], {

            constructor: function (params) {
                this.view = params.view;
                this.view.selectEnabled = false;
                this.isActive = true;
                this.drawLayer = this.view.map.findLayerById("drawLayer");
                this._mouseDown = null;
                this._mouseUp = null;
                this._mouseMove = null;
                this._centerPoint = null;

                this._symbol = new CircleSymbol({
                    radius: 0,
                    color: "#2196F3",
                    strokeColor: "#8BC34A",
                    strokeWidth: 1,
                    pitchWithMap: true,
                    scaleWithPitch: true
                });
            },

            active: function () {
                if (!this.state) {    //当前Action处于激活状态下的时候，无需重复激活
                    this.state = true;
                    this.view.panEnabled = false;
                    this.view.selectEnabled = false;
                    // console.log(this.view);
                    this._mouseDown = on(this.view.domNode, "mousedown", this._onMouseDown.bind(this));
                    this._mouseUp = on(this.view.domNode, "mouseup", this._onMouseUp.bind(this));
                    domClass.add(this.view.domNode, "draw-cursor-style");
                }
            },

            /**
             * 地图接收到鼠标按下事件后，添加move事件，在move中开始绘制圆
             * @param event
             * @private
             */
            _onMouseDown: function (event) {
                if (event.button === 0) {    //左键
                    event.preventDefault();
                    event.stopPropagation();
                    // this._centerPoint = {x: event.x, y: event.y};
                    var geo = this.view.screenToGeometry(event.x, event.y);
                    this.doAction(geo);
                }
            },
            /**
             * 地图接收到鼠标弹起事件后，移除move事件，并完成圆的绘制
             * @param event
             * @private
             */
            _onMouseUp: function (event) {
                event.preventDefault();
                event.stopPropagation();
                this._mouseMove.remove();
                this._currentGraphic = null;
                // this.invalid();
            },
            /**
             * 地图接收到鼠标移动事件后，开始圆的绘制
             * @param event
             * @private
             */
            _onMouseMove: function (event) {
                event.preventDefault();
                event.stopPropagation();
                var geo = this.view.screenToGeometry(event.x, event.y);
                this._drawCircle(geo);
            },


            invalid: function () {
                this.state = false;
                this.view.panEnabled = true;
                this.view.selectEnabled = true;

                if (this._mouseDown) {
                    this._mouseDown.remove();
                    this._mouseDown = null;
                }
                if (this._mouseMove) {
                    this._mouseMove.remove();
                    this._mouseMove = null;
                }
                this._endDrawMethod();
                this.endActionMethod.call();

            },
            
            doAction: function (geometry) {
                this.view.panEnabled = false; // 禁止平移
                this._centerPoint = geometry;
                this._mouseMove = on(this.view.container, "mousemove", this._onMouseMove.bind(this));
            },

            /**
             * 绘制两个顶点间的连线
             * @param geo
             * @private
             */
            _drawCircle: function (geo) {
                var deltaX = Math.abs(geo.x - this._centerPoint.x),
                    deltaY = Math.abs(geo.y - this._centerPoint.y),
                    r2 = deltaX * deltaX + deltaY * deltaY,
                    r = Math.sqrt(r2);
                this.drawLayer.removeGraphic(this._currentGraphic);
                var geometry = new Circle();
                var feature = new Feature({
                    attribute: null,
                    geometry: geometry
                });
                var graphic = new Graphic({
                    feature: feature,
                    symbol: this._symbol
                });
                geometry.setCenter(this._centerPoint);
                geometry.setRadius(r);
                this._currentGraphic = graphic;
                this.drawLayer.addGraphic(graphic);
                this.drawLayer.layerView.view.threeRender();
            },
            /**
             * 绘制完成执行方法
             * @private
             */
            _endDrawMethod: function () {
                if (this._mouseUp) {
                    this._mouseUp.remove();
                    this._mouseUp = null;
                }
                this._centerPoint = null;
                this._currentGraphic = null;
            }
        });
    }
);