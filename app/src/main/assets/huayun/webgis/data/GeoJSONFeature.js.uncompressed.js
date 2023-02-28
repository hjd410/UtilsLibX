/**
 * 矢量切片图形对象
 * @see com.huayun.webgis.work.GeoJSONFeature
 */
define("com/huayun/webgis/data/GeoJSONFeature", [], function () {
    /**
     * 矢量切片图形对象
     * @ignore
     * @alias com.huayun.webgis.work.GeoJSONFeature
     * @param vectorTileFeature
     * @param z
     * @param x
     * @param y
     * @property {String} type 类型
     * @property {Object} properties 属性
     * @property {String} id id
     * @property {Object} geometry 坐标数据
     * @constructor
     */
    var GeoJSONFeature = function GeoJSONFeature(vectorTileFeature, z, x, y) {
        this.type = 'GeoJSONFeature';
        this._vectorTileFeature = vectorTileFeature;
        vectorTileFeature._z = z;
        vectorTileFeature._x = x;
        vectorTileFeature._y = y;
        this.properties = vectorTileFeature.properties;
        if (vectorTileFeature.id != null) {
            this.id = vectorTileFeature.id;
        }
    };

    var prototypeAccessors = {
        geometry: {configurable: true}
    };

    prototypeAccessors.geometry.get = function () {
        if (this._geometry === undefined) {
            this._geometry = this._vectorTileFeature.toGeoJSON(
                this._vectorTileFeature._x,
                this._vectorTileFeature._y,
                this._vectorTileFeature._z
            ).geometry;
        }
        return this._geometry;
    };

    prototypeAccessors.geometry.set = function (g) {
        this._geometry = g;
    };

    GeoJSONFeature.prototype.toJSON = function () {
        var json = {
            geometry: this.geometry
        };
        for (var i in this) {
            if (i === '_geometry' || i === '_vectorTileFeature') {
                continue;
            }
            json[i] = this[i];
        }
        return json;
    }

    Object.defineProperties(GeoJSONFeature.prototype, prototypeAccessors);

    return GeoJSONFeature;
});