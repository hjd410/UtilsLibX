define(
    "com/huayun/webgis/action/measurements/MeasurementDelete", [
        "dojo/_base/declare",
        "dojo/on",
        "dojo/topic",
        "dojo/dom-construct",
        "dojo/_base/window",
        "../ActiveMapAction",
        "../../geometry/Point2D"
    ], function (declare, on,  topic, domConstruct, win, ActiveMapAction, Point2D) {
        return declare("com.huayun.webgis.action.draws.DrawDelete", [ActiveMapAction], {

            constructor: function (params) {
                this.view = params.view;
                this.view.selectEnabled = true;
                this.isActive = true;
                this._mouseClick = null;
                this.drawLayer = this.view.map.findLayerById("drawLayer");
                this.selectGraphic = null;
                this.tooltip = domConstruct.create("div", {className: "delete-tooltip"}, win.body());
                domConstruct.create("button", { className: "tip-ok", innerHTML: "确定", onclick: this.sureDelete.bind(this) }, this.tooltip);
                domConstruct.create("button", { className: "tip-cancel",innerHTML: "取消", onclick: this.cancelDelete.bind(this) }, this.tooltip);
            },

            sureDelete: function() {
                if (this.selectGraphic) {
                    this.drawLayer.removeGraphic(this.selectGraphic);
                    this.tooltip.style.visibility = "hidden";
                    topic.publish("measurement-delete", this.selectGraphic['id']);
                    this.selectGraphic = null;
                }
            },

            cancelDelete: function() {
                this.tooltip.style.visibility = "hidden";
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
                    this.drawLayer.createIndex();
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
                    this.endActionMethod.call();
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
                this._deleteGraphic(params.x, params.y);
            },

            /**
             * 图层上绘制点
             * @param x: 点屏幕坐标的x
             * @param y: 点屏幕坐标的y
             */
            _deleteGraphic: function (x, y) {
                var geometry = this.view.screenToGeometry(x, y);
                var graphic = this.drawLayer.queryFeaturesByGeometry(new Point2D(geometry.x, geometry.y));
                if (graphic.length > 0) {
                    this.tooltip.style.visibility = "visible";
                    this.tooltip.style.top = y + "px";
                    this.tooltip.style.left = x + "px";
                    this.selectGraphic = graphic[0];
                } else {
                    this.tooltip.style.visibility = "hidden";
                }
            }
        });
    }
);