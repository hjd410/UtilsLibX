/**
 * mapbox封装的矢量切片图层类
 * @see com.huayun.webgis.work.support.VectorTileLayer
 */
define("com/huayun/webgis/work/support/VectorTileLayer", ["./VectorTileFeature"], function (VectorTileFeature) {

    function readValueMessage(pbf) {
        var value = null,
            end = pbf.readVarint() + pbf.pos;
        while (pbf.pos < end) {
            var tag = pbf.readVarint() >> 3;
            value = tag === 1 ? pbf.readString() :
                    tag === 2 ? pbf.readFloat() :
                    tag === 3 ? pbf.readDouble() :
                    tag === 4 ? pbf.readVarint64() :
                    tag === 5 ? pbf.readVarint() :
                    tag === 6 ? pbf.readSVarint() :
                    tag === 7 ? pbf.readBoolean() : null;
        }
        return value;
    }

    function readLayer(tag, layer, pbf) {
        if (tag === 15) {
            layer.version = pbf.readVarint();
        } else if (tag === 1) {
            layer.name = pbf.readString();
        } else if (tag === 5) {
            layer.extent = pbf.readVarint();
        } else if (tag === 2) {
            layer._features.push(pbf.pos);
        } else if (tag === 3) {
            layer._keys.push(pbf.readString());
        } else if (tag === 4) {
            layer._values.push(readValueMessage(pbf));
        }
    }

    /**
     * @ignore
     * @private
     * @alias com.huayun.webgis.work.support.VectorTileLayer
     * @param pbf
     * @param end
     * @constructor
     */
    function VectorTileLayer(pbf, end) {
        this.version = 1;
        this.name = null;
        this.extent = 4096;
        this.length = 0;
        this._pbf = pbf;
        this._keys = [];
        this._values = [];
        this._features = [];
        pbf.readFields(readLayer, this, end);
        this.length = this._features.length;
    }

    VectorTileLayer.prototype.feature = function (i) {
        if (i < 0 || i >= this._features.length) {
            throw new Error('feature index out of bounds');
        }
        this._pbf.pos = this._features[i];
        var end = this._pbf.readVarint() + this._pbf.pos;
        return new VectorTileFeature(this._pbf, end, this.extent, this._keys, this._values);
    };

    return VectorTileLayer;
})