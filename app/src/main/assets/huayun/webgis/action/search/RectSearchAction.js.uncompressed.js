define("com/huayun/webgis/action/search/RectSearchAction", [
    'dojo/_base/declare',
    'dojo/on',
    'dojo/topic',
    'dojo/dom-class',
    'dojo/dom-construct',
    '../../geometry/Polygon',
    '../../Graphic',
    '../../Feature',
    '../../geometry/Point2D',
    '../../symbols/PolygonSymbol',
    '../../symbols/PointSymbol',
    '../ActiveMapAction'
], function(declare, on, topic, domClass, domConstruct, Polygon, Graphic, Feature, Point, PolygonSymbol, PointSymbol, ActiveMapAction) {
    return declare ("com.huayun.webgis.action.search.RectSearchAction", [ActiveMapAction], {

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.view = params.view;
            this.view.selectEnabled = false;
            this.state = false;
            this.power = this.view.map.findLayerById("power");
            this.drawLayer = this.view.map.findLayerById("drawLayer");

            this._mouseDown = null;
            this._mouseMove = null;
            this._mouseUp = null;
            this._vertexArr = [];

            this._symbol = new PolygonSymbol ({
                color: "#8F8FFF",
                opacity: 0.5
            });

            this._vertexSymbol = new PointSymbol ({
                radius: 5,
                color: "#0000FF"
            });

            this._currentGraphic = null;
            this.startPoint = {};
            this.endPoint = {};
            this._lineGraphicList = [];
            this._lineGraphicHash = {};

            var obj = this;
            topic.subscribe("measurement-delete", function (id) {
                var graphicList = obj._lineGraphicHash[id];
                if (graphicList && graphicList.length > 0) {
                    graphicList.forEach(function (item) {
                        obj.drawLayer.removeGraphic(item);
                    });
                }
            });
        },

        active: function () {
            if(!this.state) {
                this.state = true;
                this.view.selectEnabled = false;
                this.view.panEnabled = false;
                this._mouseDown = on(this.view.container, "mousedown", this._onMouseDown.bind(this));
                this._mouseUp = on(this.view.container, "mouseup", this._onMouseUp.bind(this));
                domClass.add(this.view.domNode, "draw-cursor-style");
            }
        },

        /**
         * 鼠标按下的执行函数
         * @param event 
         */
        _onMouseDown: function (event) {
            event.preventDefault();
            event.stopPropagation();
            var geo = this.view.screenToGeometry(event.x, event.y);
            this.startPoint.x = geo.x;
            this.startPoint.y = geo.y;
            this._lineGraphicList = [];
            this._drawDotMark(geo);
            if(!this._mouseMove) {
                this._mouseMove = on(this.view.domNode, "mousemove", this._onMouseMove.bind(this));
            }
        },

        /**
         * 鼠标移动时绘制矩形
         * @param e 
         */
        _onMouseMove: function (e) {
            event.preventDefault();
            event.stopPropagation();
            if(this.startPoint) {
                this.endPoint = this.view.screenToGeometry(e.x, e.y);
                this.drawLayer.removeGraphic(this._currentGraphic);
                this._vertexArr = [];
                var geometry = new Polygon();
                var feature = new Feature({
                    attribute: null,
                    geometry: geometry
                });
                var graphic = new Graphic({
                    feature: feature,
                    symbol: this._symbol
                });
                this.getOtherPoints();
                geometry.setPath([this._vertexArr]);
                this._currentGraphic = graphic;
                this.drawLayer.addGraphic(graphic);
                this.drawLayer.layerView.view.threeRender();
            }
        },

        /**
         * 鼠标弹起时结束
         * @param e 
         */
        _onMouseUp: function (event) {
            event.preventDefault();
            event.stopPropagation();
            this._drawDotMark(this.endPoint);
            this._currentGraphic.rg = this._lineGraphicList;
            var lineId = this._currentGraphic.id;
            this.showDeleBtn(event, lineId);
            var rectGeometry = this._currentGraphic.feature.geometry;
            var result = this.power.queryFeaturesByGeometry(rectGeometry, 10);
            if(result && result.length > 0) {
                topic.publish("showRectInfo", result);
            } else {
                topic.publish("closeRectInfo")
            }
            this.invalid();
        },

        getOtherPoints: function () {
            var rightTop = {},
                leftBottom = {};
            rightTop.x = this.endPoint.x;
            rightTop.y = this.startPoint.y;
            leftBottom.x = this.startPoint.x;
            leftBottom.y = this.endPoint.y;
            this._vertexArr.push(new Point(this.startPoint.x, this.startPoint.y));
            this._vertexArr.push(new Point(rightTop.x, rightTop.y));
            this._vertexArr.push(new Point(this.endPoint.x, this.endPoint.y));
            this._vertexArr.push(new Point(leftBottom.x, leftBottom.y));
            this._vertexArr.push(new Point(this.startPoint.x, this.startPoint.y));
        },

        showDeleBtn: function (event, lineId) {
            var self = this;
            var delBtn = domConstruct.create("div", {
                className: "graphicRectClose",
                style: {
                    width: "8px", height: "8px", position: "absolute", color: "red", 
                    border: "2px solid red", display: "block", cursor: "pointer", textAlign: "center",
                    fontSize: "4px", margin: "0 auto", lineHeight: "5px", backgroundColor: "white"
                },
                innerHTML: "x"
            }, document.body);
            on(delBtn, "click", function (e) {
                var graphics = self.drawLayer.graphics;
                var g;
                for(var i = 0, ii = graphics.length; i < ii; i++) {
                    g = graphics[i];
                    if(g.id === lineId) {
                        break;
                    }
                }
                if(g) {
                    self.drawLayer.removeGraphic(g);
                    var rg = g.rg;
                    rg.forEach(function (item) {
                        self.drawLayer.removeGraphic(item);
                    });
                    domConstruct.destroy(this);
                    topic.publish("closeRectInfo");
                }
            });

            delBtn.style.left = event.clientX + 5 + "px";
            delBtn.style.top = event.clientY + 5 + "px";
            return delBtn;
        },

        invalid: function () {
            if(!this.state) {
                return;
            }
            this._endDrawMethod();
            this.state = false;
            this.view.panEnabled = true;
            this.view.selectEnabled = true;
            if(this._mouseDown !== null) {
                this._mouseDown.remove();
                this._mouseDown = null;
            }
            if(this._mouseUp !== null) {
                this._mouseUp.remove();
                this._mouseUp = null;
            }
            domClass.remove(this.view.domNode, "draw-cursor-style");
        },

        _drawDotMark: function (geo) {
            var geometry = new Point(geo.x, geo.y);
            var feature = new Feature ({
                attribute: null,
                geometry: geometry
            });
            var vertexGraphic = new Graphic ({
                feature: feature,
                symbol: this._vertexSymbol
            });
            this.drawLayer.addGraphic(vertexGraphic);
            this._lineGraphicList.push(vertexGraphic);
            this.drawLayer.layerView.view.threeRender();
        },

        _endDrawMethod: function () {
            this._lineGraphicHash[this._currentGraphic.id] = this.lineGraphicList;
            if(this._mouseMove !== null) {
                this._mouseMove.remove();
                this._mouseMove = null;
            }
            this._currentGraphic = null;
            this._lineGraphicList = null;
        }
    });
});