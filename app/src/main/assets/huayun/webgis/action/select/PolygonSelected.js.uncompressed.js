define("com/huayun/webgis/action/select/PolygonSelected", [
    "dojo/_base/declare",
    "dojo/on",
    "dojo/topic",
    "../../geometry/Extent",
    "../../geometry/Polygon",
    "../../Graphic",
    "../../Feature",
    "../../symbols/PolygonSymbol",
    "../ActiveMapAction"
], function (declare, on, topic, Extent, Polygon, Graphic, Feature, PolygonSymbol, ActiveMapAction) {
    return declare("com.huayun.webgis.action.select.PolygonSelected", [ActiveMapAction], {

        constructor: function (params) {
            this.view = params.view;
            this.view.selectEnabled = false;
            this.isActive = true;
            this.drawLayer = this.view.map.findLayerById("drawLayer");

            this._mouseClick = null;
            this._dblMouseClick = null;
            this._mouseClickMove = null;
            this._mouseUp = null;
            this._lastPoint = null;
            this._vertexArr = [];
            this._polygonList = [];
            this.cachePoint = [];

            this._currentGraphic = null;
            this._feature = null;
            this._geometry = null;
            this._symbol = null;
        },

        active: function () {
            if (!this.state) {    //当前Action处于激活状态下的时候，无需重复激活
                this.state = true;
                this.view.panEnabled = false;
                this.view.selectEnabled = false;
                this._mouseClick = on(this.view.domNode, "click", this._onMouseClick.bind(this));
                this._dblMouseClick = on(this.view.domNode, "dblclick", this._onDoubleMouseClick.bind(this));
                this._createPolygonList();
            }
        },

        /**
         * 创建列表
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
            // this.doAction({x: event.x, y: event.y});
            if (this._lastPoint === null) {
                this._symbol = new PolygonSymbol({
                    color: 0x0000FF,
                    opacity: 0.2
                });
                this._geometry = new Polygon();
                this._feature = new Feature({
                    attribute: null,
                    geometry: this._geometry
                });
                this._currentGraphic = new Graphic({
                    feature: this._feature,
                    symbol: this._symbol
                });
                this.drawLayer.addGraphic(this._currentGraphic);
                this.doAction({x: event.x, y: event.y});
            } else {
                if (event.x !== this._lastPoint.x && event.y !== this._lastPoint.y) {
                    this.doAction({x: event.x, y: event.y});
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
            if (event.button === 0) {
                this._vertexArr = [];
                this._lastPoint = null;
                this._currentGraphic.clear();
                this._endDrawMethod();
            }

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
            this.endActionMethod.call();
        },

        doAction: function (params) {
            this._drawPolygon(params.x, params.y);//绘制多边形填充区域
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
         * 绘制两个顶点间的连线
         * @param x
         * @param y
         * @private
         */
        _drawPolygon: function (x, y) {
            this.view.panEnabled = false; // 禁止平移
            var geometry = this.view.screenToGeometry(x, y);
            console.log(geometry);

            if (this._vertexArr.length === 0) {
                this._vertexArr[0] = geometry;
                this._vertexArr[this._vertexArr.length] = geometry;
            } else {
                this._vertexArr.splice(this._vertexArr.length - 1, 0, geometry);
            }
            if (!this._mouseClickMove) {
                this._mouseClickMove = on(this.view.domNode, "mousemove", function (e) {
                    // this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);   // 移除当前多边形
                    var ep = this.view.screenToGeometry(e.x, e.y),
                        len = this._vertexArr.length;
                    this._vertexArr[len - 1] = ep;
                    // this.drawLayer.drawPolygon(this._vertexArr, this._material); // 添加新多边形
                    this._geometry.setPath(this._vertexArr);
                    if(this._vertexArr.length > 2){
                        this._currentGraphic.refresh();
                    }
                }.bind(this));
            }
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
            if (this._mouseUp !== null) {
                this._mouseUp.remove();
                this._mouseUp = null;
            }
        }
    });
});