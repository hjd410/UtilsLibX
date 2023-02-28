define("com/huayun/webgis/action/search/PolygonSearchAction", [
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
    return declare("com.huayun.webgis.action.search.PlygonSearchAction", [ActiveMapAction], {

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.view = params.view;
            this.view.selectEnabled = false;
            this.state = false;
            this.power = this.view.map.findLayerById("power");
            this.drawLayer = this.view.map.findLayerById("drawLayer");

            this._mouseClick = null;
            this._dblMouseClick = null;
            this._mouseClickMove = null;
            this._lastPoint = null;
            this._vertexArr = [];
            this._polygonList = [];

            this._symbol = new PolygonSymbol({
                color: "#8F8FFF",
                opacity: 0.5
            });

            this._vertexSymbol = new PointSymbol({
                radius: 5,
                color: "#0000FF"
            });

            this._currentGraphic = null;
            // 一条线相关的所有 graphic，line，tip，vertex，close
            this._lineGraphicList = [];
            // 以closeGraphic的id为key，_lineGraphicList作为value的Hash
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
                this._mouseClick = on(this.view.container, "click", this._onMouseClick.bind(this));
                this._dblMouseClick = on(this.view.container, "dblclick", this._onDoubleMouseClick.bind(this));
                domClass.add(this.view.domNode, "draw-cursor-style");
            }
        },

        /**
         * 鼠标点击绘制点
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
            if(this._lastPoint === null) {
                this._lineGraphicList = [];
                this.doAction(geo);
            } else {
                if (event.x !== this._lastPoint.x && event.y !== this._lastPoint.y) {
                    this.doAction(geo);
                }
            }
            this._lastPoint = {x: event.x, y: event.y};
        },

        _onMouseMove: function (e) {
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
         * 鼠标双击，绘制结束
         * @param event 
         * @private
         */
        _onDoubleMouseClick: function (event) {
            event.preventDefault();
            event.stopPropagation();
            this._currentGraphic.rg = this._lineGraphicList;
            var lineId = this._currentGraphic.id;
            this.showDeleButton(event, lineId);
            var polygonGeometry = this._currentGraphic.feature.geometry;
            var result = this.power.queryFeaturesByGeometry(polygonGeometry, 10);
            this.invalid();
            if(result && result.length > 0) {
                topic.publish("showPolyInfo", result);
            } else {
                topic.publish("closeInfo");
            }
        },

        showDeleButton: function (event, lineId) {
            var self = this;
            var delBtn = domConstruct.create("div", {
                className: "graphicPolyClose",
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
                    topic.publish("closeInfo");
                }
            });

            delBtn.style.left = event.clientX + 5 + "px";
            delBtn.style.top = event.clientY + 5 + "px";
            return delBtn;
        },

        invalid: function() {
            if(!this.state) {
                return;
            }
            this._endDrawMethod();
            this.state = false;
            this.view.panEnabled = true;
            this.view.selectEnabled = true;
            if(this._mouseClick !== null) {
                this._mouseClick.remove();
                this._mouseClick = null;
            }
            if(this._dblMouseClick !== null) {
                this._dblMouseClick.remove();
                this._dblMouseClick = null;
            }
            domClass.remove(this.view.domNode, "draw-cursor-style");
        },

        doAction: function (geometry) {
            this._drawDotMark(geometry);
        },

        _drawDotMark: function (geo) {
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
            if(len < 3) {
                this._vertexArr.push(new Point(geometry.x, geometry.y));
            } else {
                this._vertexArr.splice(this._vertexArr.length - 1, 1, new Point(geo.x, geo.y));                
            }
            this.drawLayer.layerView.view.threeRender();
        },

        _endDrawMethod: function () {
            this._lineGraphicHash[this._currentGraphic.id] = this._lineGraphicList;
            if(this._mouseClickMove !== null) {
                this._mouseClickMove.remove();
                this._mouseClickMove = null;
            }
            this._vertexArr = [];
            this._currentGraphic = null;
            this._lastPoint = null;
            this._lineGraphicList = null;
        }
    });    
});