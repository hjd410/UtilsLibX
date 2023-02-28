define("com/huayun/webgis/layers/EditGraphicsLayer", [
    "dojo/_base/declare",
    "./GraphicLayer",
    "../views/3d/layers/GraphicLayerView3D",
    "../data/GraphicIndex",
    "com/huayun/webgis/symbols/PointSymbol",
    "com/huayun/webgis/symbols/CircleSymbol",
    "com/huayun/webgis/symbols/PolygonSymbol",
    "com/huayun/webgis/symbols/LineSymbol",
    "../renderer/SimpleRenderer"
], function (declare, GraphicLayer, LayerView, GraphicIndex, PointSymbol, CircleSymbol, PolygonSymbol, LineSymbol, SimpleRenderer) {

    function EditGraphicsLayer() {
        this.addGraphicList = [];
        this.editGraphicList = [];
        this.removeGraphicList = [];
        // this.geoType = params.geoType;
        // this.id = params.id;
        // this.currentRule = params.currentRule;
        // this.rules = params.rules;
        // this.symbols = [];
        this.graphicsLayer = new GraphicLayer();
        this.graphicsLayer.owner = this;
        this.graphics = this.graphicsLayer.graphics;
        // this.featureData = [];
        // this.wktGeometryFormatter = new WKTGeometryFormater();
        // this.symbolFactory = new SymbolFactory();
        // this.createRenderer();
        // this.loadComplete(params, backFun);
        // this.state = false;
        // console.log(this.graphics);
        // debugger;
    }

    // 类继承
    if (GraphicLayer) EditGraphicsLayer.__proto__ = GraphicLayer;
    EditGraphicsLayer.prototype = Object.create(GraphicLayer && GraphicLayer.prototype);
    EditGraphicsLayer.prototype.constructor = EditGraphicsLayer;

    EditGraphicsLayer.prototype.addGraphic = function (graphic) {
        this.addGraphicList.push(graphic);
        this.graphicsLayer.addGraphic(graphic);
    };

    EditGraphicsLayer.prototype.cancel = function () {

    };

    EditGraphicsLayer.prototype.commit = function () {

    };

    EditGraphicsLayer.prototype.removeGraphic = function (graphic) {
        this.graphicsLayer.removeGraphic(graphic);
    };

    EditGraphicsLayer.prototype.editGraphic = function (type, list) {

    };

    EditGraphicsLayer.prototype.createLayerView = function (view) {
        this.layerView = this.graphicsLayer.createLayerView(view);
        return this.layerView;
    };

    EditGraphicsLayer.prototype.setRenderer = function (renderer) {
        this.graphicsLayer.setRenderer(renderer);
    };

    return EditGraphicsLayer;
});
