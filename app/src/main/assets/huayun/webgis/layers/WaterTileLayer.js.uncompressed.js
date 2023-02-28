define("com/huayun/webgis/layers/WaterTileLayer", [
    "dojo/_base/declare",
    "dojo/topic",
    "./Layer",
    "../request",
    "../geometry/Extent",
    "../views/3d/layers/WaterTileLayerView3D",
    "../geometry/Point",
    "./support/WaterTileSourceCache",
    "./support/LOD",
    "./support/TileInfo",
    "com/huayun/facades/TileInfoFacade"
], function (declare, topic, Layer, request, Extent, WaterTileLayerView3D, Point, WaterTileSourceCache,
             LOD, TileInfo, TileFacade) {
    return declare("com.huayun.webgis.layers.WaterTileLayer", [Layer], {
        type: "Tile",
        name: "水",
        spatialReference: null,


        constructor: function (params) {
            declare.safeMixin(this, params);
            this.spatialReference = params.spatialReference;
            this.id = params.id;
            this.layerView = null;
        },

        createLayerView: function (view, option) {
            var layerView = new WaterTileLayerView3D({
                width: view.width,
                height: view.height,
                opacity: this.opacity,
                visible: this.visible,
                view: view,
                id: this.id,
                layer: this
            });
            this.layerView = layerView;
            layerView.transform = view.viewpoint;
            return layerView;
        },

        setVisible: function (visible) {
            this.visible = visible;
            this.layerViews.forEach(function (item) {
                item.setVisible(visible);
            });
        },
        setOpacity: function (opacity) {
        }
    })
});