define("com/huayun/webgis/layers/TerrainLayerTerrain", [
    "dojo/topic",
    "./Layer",
    "../views/3d/layers/TerrainLayerView3D",
    "../geometry/Extent",
    "../geometry/Point",
    "./support/TerrainSourceCache",
    "./support/LOD",
    "./support/TileInfo",
    "com/huayun/facades/TileInfoFacade"
], function (topic, Layer, TerrainLayerView3D, Extent, Point, TerrainSourceCache, LOD, TileInfo, TileFacade) {
    var TerrainLayer = function (params) {
        this.id = params.id;
        this.loaded = false;
        this.url = params.url;
        this.tileInfo = null;
        this.layerView = null;
        this.type = "Tile";
    };

    if (Layer) TerrainLayer.__proto__ = Layer;
    TerrainLayer.prototype = Object.create(Layer && Layer.prototype);
    TerrainLayer.prototype.constructor = TerrainLayer;

    TerrainLayer.prototype._load = function(view) {
        var id = "terrain";
        var source = {
            "tiles": this.format?this.url + this.format: this.url,
            "tileSize": 256
        };
        var serverUrl = "../config/MapServer-4326.json"
        this.sourceCache = new TerrainSourceCache(id, source, view.width, view.height, this.url, this, view);

        new TileFacade().getTileInfoData(serverUrl, function (resp) {
            var tileInfo = resp.tileInfo;
            var theOrigin = tileInfo.origin;
            theOrigin = new Point(theOrigin.x, theOrigin.y);
            var lodList = [];
            resp.lods.forEach(function (item) {
                lodList.push(new LOD({
                    level: item.level,
                    scale: item.scale,
                    resolution: item.resolution
                }));
            });
            /*tileInfo.lods.forEach(function(item) {
                lodList.push(new LOD({
                    level: item.level,
                    scale: item.scale,
                    resolution: item.resolution
                }));
            });*/
            var extent = resp.fullExtent;
            var fullExtent = new Extent(Number(extent.xmin), Number(extent.ymin), Number(extent.xmax), Number(extent.ymax));
            this.tileInfo = new TileInfo({
                lods: lodList,
                origin: theOrigin,
                size: tileInfo.cols,
                fullExtent: fullExtent
            });
            topic.publish("tileInfoComplete", this.tileInfo, this.layerView.view.id);
        }.bind(this));
    };

    TerrainLayer.prototype.createLayerView = function (view, option) {
        var layerView = new TerrainLayerView3D({
            visible: this.visible,
            view: view,
            id: this.id,
            layer: this
        });
        this._load(view);
        this.layerView = layerView;
        layerView.transform = view.viewpoint;
        return layerView;
    };

    return TerrainLayer;
});