define("com/huayun/webgis/action/select/RectSelected", [
    "dojo/_base/declare",
    "dojo/on",
    "dojo/topic",
    "dojo/dom-construct",
    "dojo/_base/window",
    "../../geometry/Extent",
    "../../geometry/Polygon",
    "../../geometry/Point",
    "../../Graphic",
    "../../Feature",
    "../../symbols/PolygonSymbol",
    "../ActiveMapAction"
], function (declare, on, topic, domConstruct, win, Extent, Polygon, Point, Graphic, Feature, PolygonSymbol, ActiveMapAction) {
    return declare("com.huayun.webgis.action.select.RectSelected", [ActiveMapAction], {
        constructor: function (params) {
            declare.safeMixin(this, params);
            // this.map = params.map;
            this.view = params.view;
            this.isActive = true;
            this.drawLayer = this.view.map.findLayerById("drawLayer");
            this._mouseDown = null;
            this._mouseUp = null;
            this._mouseClickMove = null;
            this.state = false;
            this.startPoint = null;
            this.endPoint = null;
            this.extent = null;
            this._currentGraphic = null;
            this._symbol = new PolygonSymbol({
                color: "#cccccc",
                opacity: 0.5
            });
            this.showResult = document.getElementById("selectResult");
            if (!this.showResult) {
                this.showResult = domConstruct.create("div", {className: "select-result", id: "selectResult"}, win.body());
            }
        },
        active: function () {
            if (!this.state) {    //当前Action处于未激活状态下的时候，激活该Action
                this.state = true;
                this.view.selectEnabled = true;
                this.view.panEnabled = false;
                if (!this._mouseDown) {
                    this._mouseDown = on(this.view.domNode, "mousedown", this._onMouseDown.bind(this));
                }
            }
        },
        /**
         * 鼠标按下开始绘制选择区域
         * @param e 
         * @private
         */
        _onMouseDown: function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.button === 0) {
                this.startPoint = this.view.screenToGeometry(e.x, e.y);
                this.doAction();
            }
        },//鼠标按下开始绘制选择区域
        /**
         * 鼠标移动，获取点
         * @param e 
         * @private
         */
        _onMouseClickMove: function (e) {
            if (e.button === 0) {
                // 左键
                this.endPoint = this.view.screenToGeometry(e.x, e.y);
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
                var sp = this.startPoint,
                    ep = this.endPoint;
                this.extent = [sp, new Point(ep.x, sp.y), ep, new Point(sp.x, ep.y)];
                geometry.setPath([this.extent]);
                this._currentGraphic = graphic;
                this.drawLayer.addGraphic(graphic);
                this.drawLayer.layerView.view.threeRender();
            }
        },
        /**
         * 鼠标弹起，绘制结束
         * @param e 
         * @private
         */
        _onMouseUp: function (e) {
            if (this._mouseClickMove) {
                this._mouseClickMove.remove();
                this._mouseClickMove = null;
            }
            if (this._mouseUp) {
                this._mouseUp.remove();
                this._mouseUp = null;
            }
            this.drawLayer.removeGraphic(this._currentGraphic);
            this.view.queryFeaturesByGeometry(this.extent, 8, function (result) {
                var obj = this.filterResult(result);
                this.showResult.innerHTML = JSON.stringify(obj);
                this.showResult.style.display = "block";
                this.drawLayer.highlightGraphic(result[this.drawLayer.id]);
            }.bind(this));
            // this.drawLayer.highlightGraphic(geo[this.drawLayer.id]);
        },

        invalid: function () {
            this.state = false;
            this.view.panEnabled = true;
            this.view.selectEnabled = true;
            this.cachePoint = [];
            this._endDrawMethod();
            this.endActionMethod.call();
        },
        
        doAction: function () {
            if (!this._mouseClickMove) {
                this._mouseClickMove = on(this.view.domNode, "mousemove", this._onMouseClickMove.bind(this));
            }
            if (!this._mouseUp) {
                this._mouseUp = on(document, "mouseup", this._onMouseUp.bind(this));
            }
        },
        /**
         * 绘制方法结束
         * @private
         */
        _endDrawMethod: function () {
            if (this._mouseDown) {
                this._mouseDown.remove();
                this._mouseDown = null;
            }
            if (this._mouseClickMove) {
                this._mouseClickMove.remove();
                this._mouseClickMove = null;
            }
            if (this._mouseUp) {
                this._mouseUp.remove();
                this._mouseUp = null;
            }
            this._currentGraphic = null;
            this.startPoint = null;
            this.endPoint = null;
            this.extent = null;
            this.showResult.style.display = "none";
        },
        filterResult: function (result) {
            var obj = {};
            for (var id in result) {
                if (id === this.drawLayer.id) {
                    var value = result[id];
                    var arr = [];
                    value.forEach(function (item) {
                        arr.push(item.feature);
                    });
                    obj[id] = arr;
                } else {
                    obj[id] = result[id][0];
                }
            }
            return obj;
        }
    });
});