define("com/huayun/webgis/action/select/CircleSelected", [
    "dojo/_base/declare",
    "dojo/on",
    "dojo/topic",
    "../../geometry/Extent",
    "../../geometry/Circle",
    "../../Graphic",
    "../../Feature",
    "../../symbols/CircleSymbol",
    "../ActiveMapAction"
], function (declare, on, topic, Extent, Circle, Graphic, Feature, CircleSymbol, ActiveMapAction) {
    return declare("com.huayun.webgis.action.select.CircleSelected", [ActiveMapAction], {

        constructor: function (params) {
            this.view = params.view;
            this.isActive = true;//
            this.drawLayer = this.view.map.findLayerById("drawLayer");
            this._mouseDown = null;
            this._mouseUp = null;
            this._mouseMove = null;
            this.cachePoint = [];
            this.state = false;
            this.flag = false;
            this._centerPoint = null;
            this._circleRadius = 0;
            this.view.selectEnabled = true;
            this._currentGraphic = null;
            this._feature = null;
            this._geometry = null;
            this._symbol = null;
        },

        active: function () {
            if (!this.state) {    //当前Action处于激活状态下的时候，无需重复激活
                this.state = true;
                this.view.selectEnabled = true;
                this._mouseDown = on(this.view.domNode, "mousedown", this._onMouseDown.bind(this));
            }
        },
        /**
         * 鼠标点击，开始准备画圆
         * @param event 
         */
        _onMouseDown: function (event) {
            event.preventDefault();
            event.stopPropagation();
            this.view.panEnabled = false; // 禁止平移
            this._centerPoint = this.view.screenToGeometry(event.x, event.y);
            this._symbol = new CircleSymbol({
                color: 0x0000FF,
                opacity: 0.2
            });
            this._geometry = new Circle();
            this._geometry.setCenter(this._centerPoint);
            this._feature = new Feature({
                attribute: null,
                geometry: this._geometry
            });
            this._currentGraphic = new Graphic({
                feature: this._feature,
                symbol: this._symbol
            });
            this.drawLayer.addGraphic(this._currentGraphic);
            this.doAction();
        },
        /**
         * 鼠标进行移动，开始画圆
         * @param event 
         */
        _onMouseMove: function (event) {
            if (!this._mouseUp) {
                this._mouseUp = on(document, "mouseup", this._onMouseUp.bind(this));
            }
            this._drawCircle(event.x, event.y);
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
        /**
         * 鼠标弹起，画圆结束
         * @param event 
         */
        _onMouseUp: function (event) {
            if (event.button === 0) {   //鼠标左键弹起
                if (this._mouseMove) {
                    this._mouseMove.remove();
                    this._mouseMove = null;
                }
                this._currentGraphic.clear();
            }
        },

        doAction: function () {
            if (!this._mouseMove) {
                this._mouseMove = on(this.view.domNode, "mousemove", this._onMouseMove.bind(this));
            }
        },
        /**
         * 绘制圆的执行方法
         * @param x  鼠标移动点的横坐标
         * @param y  鼠标移动点的纵坐标
         * @private
         */
        _drawCircle: function (x, y) {
            var endPoint = this.view.screenToGeometry(x, y);
            var deltaX = Math.abs(endPoint.x - this._centerPoint.x),
                deltaY = Math.abs(endPoint.y - this._centerPoint.y),
                r2 = deltaX * deltaX + deltaY * deltaY,
                r = Math.sqrt(r2);
            this._geometry.setRadius(r);
            this._currentGraphic.refresh();
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
        }
    });
});