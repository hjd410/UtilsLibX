/**
 * mapbox封装的矢量切片类
 * @see com.huayun.webgis.work.support.VectorTile
 */
define("com/huayun/webgis/work/support/VectorTile", [
    "./VectorTileLayer"
], function (VectorTileLayer) {
    /**
     * @private
     * @ignore
     * @alias com.huayun.webgis.work.support.VectorTile
     * @param pbf
     * @param end
     * @constructor
     */
    function VectorTile(pbf, end) {
        this.layers = pbf.readFields(readTile, {}, end);
    }

    function readTile(tag, layers, pbf) {
        if (tag === 3) {
            var layer = new VectorTileLayer(pbf, pbf.readVarint() + pbf.pos);
            if (layer.length) { layers[layer.name] = layer; }
        }
    }

    return VectorTile;
});