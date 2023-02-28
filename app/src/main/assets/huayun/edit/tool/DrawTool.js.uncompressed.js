/**
 *  @author :   JiGuangJie
 *  @date   :   2020/6/17
 *  @time   :   10:01
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/edit/tool/DrawTool", [
    "dojo/on",
    "../../webgis/Graphic",
    "../../webgis/Feature",
    "../../webgis/geometry/Point",
    "../../webgis/geometry/Polyline",
    "../../webgis/geometry/Polygon"
], function (on, Graphic, Feature, Point, Polyline, Polygon) {
    function DrawTool() {
        this.aPath = [];
        this.aRing = [];
        this._currentEditLayer = null;
        this.view = null;
        this.mouseMoveHandler = null;
        this.mouseClickHandler = null;
        this.mouseDbClickHandler = null;
        this.ringNextIndex = 0;
        this.ringFid = 0;
    }

    DrawTool.prototype.drawPoint = function (params) {
        this._createFid(params.attributes);
        var graphic = new Graphic({
            feature: new Feature({
                attributes: params.attributes,
                geometry: params.geometry
            }),
            symbol: params.symbol
        });
        // var currentEditLayer = params.currentEditLayer;
        this._currentEditLayer.addGraphic(graphic);
        this.view.threeRender();
        // debugger;
    };

    DrawTool.prototype.drawLine = function (params) {
        var geo = params.geometry;
        this.aPath.push(geo);
        if (this.aPath.length === 1) {
            this._createFid(params.attributes);
        }
        var polyline = new Polyline([this.aPath]);
        var graphic = new Graphic({
            feature: new Feature({
                attributes: params.attributes,
                geometry: polyline
            }),
            symbol: params.symbol
        });
        // var currentEditLayer = params.currentEditLayer;
        this.mouseMoveHandler = on(this.view.domNode, 'mousemove', this._onMouseMoveHandler.bind(this, graphic, 'line'));
        // debugger;
        // var aPath = graphic.feature.geometry.path
    };

    DrawTool.prototype.drawPolygon = function (params) {
        var geo = params.geometry;
        this.aRing.length === 0 ? (this.aRing.push(geo) && this.aRing.push(geo)) : this.aRing.splice(this.aRing.length - 2, 1, geo);
        this._createFid(params.attributes);
        this.ringNextIndex = this.aRing.length;
        var polygon = new Polygon([this.aRing]);
        var graphic = new Graphic({
            feature: new Feature({
                attributes: params.attributes,
                geometry: polygon
            }),
            symbol: params.symbol
        });
        this.mouseMoveHandler = on(this.view.domNode, 'mousemove', this._onMouseMoveHandler.bind(this, graphic, 'polygon'));
    };

    DrawTool.prototype.endDraw = function () {
        this.aPath.length = 0;
        this.aRing.length = 0;
        this.ringNextIndex = 0;
        this.mouseMoveHandler.remove();
        // debugger
        // this.view.domNode.removeEventListener('mousemove');
    };

    DrawTool.prototype.delete = function (graphic) {
        this._currentEditLayer.removeGraphic(graphic);
        this.view.threeRender();
    };

    DrawTool.prototype._onMouseMoveHandler = function (graphic, type, evt) {
        this._currentEditLayer.removeGraphic(graphic);
        var currentGeo = this.view.screenToGeometry(evt.clientX, evt.clientY);
        if (type === 'line') {
            this._moveDrawLine(graphic, currentGeo);
        } else if (type === 'polygon') {
            this._moveDrawPolygon(graphic, currentGeo);
        }
    };

    DrawTool.prototype._moveDrawLine = function (graphic, geometry) {
        if (this.aPath.length === 1) {
            this.aPath[this.aPath.length] = geometry;
        } else {
            this.aPath.pop();
            this.aPath[this.aPath.length] = geometry;
        }
        // this.aPath.splice(this.aPath.length, 1, currentGeo);
        this._currentEditLayer.addGraphic(graphic);
        this.view.threeRender();
    };

    DrawTool.prototype._moveDrawPolygon = function (graphic, geometry) {
        this.aRing[this.ringNextIndex] = this.aRing[this.aRing.length - 1];
        this.aRing[this.ringNextIndex - 1] = geometry;
        this._currentEditLayer.addGraphic(graphic);
        this.view.threeRender();
    };

    DrawTool.prototype._createFid = function (attributes) {
        this.ringFid = this.ringFid || Math.round(Math.random() * 500);
        // debugger
        for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            if (attribute.name === 'fid') {
                // 需要调用服务，生成fid
                attribute.value = this.ringFid;
                break;
            }
        }
    };

    var prototypeAccessors = {
        currentEditLayer: {configurable: true}
    };

    prototypeAccessors.currentEditLayer.set = function (value) {
        this._currentEditLayer = value;
        this.view = this._currentEditLayer.layerView.graphicsLayerView.view;
    };
    Object.defineProperties(DrawTool.prototype, prototypeAccessors);

    return DrawTool;
});
