define("com/huayun/webgis/layers/support/CanonicalTileID", [
    "./funcUtils"
], function (funcUtils) {

    var CanonicalTileID = function CanonicalTileID(z, x, y) {
        this.z = z;
        this.x = x;
        this.y = y;
        this.key = funcUtils.calculateKey(0, z, x, y);
    };

    CanonicalTileID.prototype.equals = function equals(id) {
        return this.z === id.z && this.x === id.x && this.y === id.y;
    };

    CanonicalTileID.prototype.url = function url(urls, schema) {
        return urls[(this.x + this.y) % urls.length].replace('{z}', String(Math.round(this.z)))
            .replace('{x}', String(this.x))
            .replace('{y}', String(schema === 'tms'?(Math.pow(2, this.z) - this.y - 1): this.y));
    };

    CanonicalTileID.prototype.getTilePoint = function getTilePoint(coord) {

        /*var tilesAtZoom = Math.pow(2, this.z);
        return new pointGeometry(
            (coord.x * tilesAtZoom - this.x) * EXTENT,
            (coord.y * tilesAtZoom - this.y) * EXTENT);*/
    };

    return CanonicalTileID;
});