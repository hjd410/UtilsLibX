/**
 * 多面
 * @module com/huayun/webgis/geometry
 * @see com.huayun.webgis.geometry.MultiPolygon
 */
define("com/huayun/webgis/geometry/MultiPolygon", [
    "./Geometry",
    "./Extent"
], function (Geometry, Extent) {

    function findExtremum(polygons) {
        var firstPolygon = polygons[0];
        var xmin = firstPolygon.extent.xmin;
        var ymin = firstPolygon.extent.ymin;
        var xmax = firstPolygon.extent.xmax;
        var ymax = firstPolygon.extent.ymax;
        for (var i = 1, len = polygons.length; i < len; i++) {
            var aPolygon = polygons[i];
            if (xmin > aPolygon.extent.xmin) {
                xmin = aPolygon.extent.xmin
            }
            if (ymin > aPolygon.extent.ymin) {
                ymin = aPolygon.extent.ymin
            }
            if (xmax < aPolygon.extent.xmax) {
                xmax = aPolygon.extent.xmax
            }
            if (ymax < aPolygon.extent.ymax) {
                ymax = aPolygon.extent.ymax
            }
        }
        return {
            xmin: xmin,
            ymin: ymin,
            xmax: xmax,
            ymax: ymax
        };
    }
    
    /**
     * 多面
     * @constructor
     * @alias com.huayun.webgis.geometry.MultiPolygon
     * @extends {Geometry}
     * @param {MultiPolygon} multiPolygon 面数组
     * @property {Array} polygons 面数组
     * @property {Extent} extent 多面范围
     */
    function getMaxAreaIndex(multiPolygon){
        var polygons = multiPolygon.polygons;
        var maxArea = 0, areaIndex = -1;
        polygons.forEach(function (item, index) {
            if (item.area > maxArea) {
                maxArea = item.area;
                areaIndex = index;
            }
        });
        return areaIndex;
    }

    var MultiPolygon = function (polygons, spatialReference) {
        Geometry.call(this);
        this.type = "multipolygon";
        this.polygons = polygons;
        this.spatialReference = spatialReference;
        this._extent = null;
    };

    if (Geometry) MultiPolygon.__proto__ = Geometry;
    MultiPolygon.prototype = Object.create(Geometry && Geometry.prototype);
    MultiPolygon.prototype.constructor = MultiPolygon;

    var prototypeAccessors = {
        length: {configurable: false},
        extent: {configurable: false}
    };

    prototypeAccessors.length.get = function () {
        return this.path.length;
    };

    prototypeAccessors.extent.get = function () {
        if (!this._extent) {
            var extremum = findExtremum(this.polygons);
            this._extent = new Extent(extremum.xmin, extremum.ymin, extremum.xmax, extremum.ymax);
        }
        return this._extent;
    };

    MultiPolygon.prototype = {
        setPath: function (path) {
            this.path = path;
            this._extent = null;
        },
        addRing: function (ring) {
            this.path.push(ring);
            this._extent = null;
        },
        update: function (dx, dy) {
            this.path.forEach(function (ring) {
                ring.forEach(function (point) {
                    point.update(dx, dy);
                });
            });
            this._extent = null;
        },
        _getMaxAreaIndex: function () {
            return getMaxAreaIndex(this);
        },
        getMaxAreaPolygon: function () {
            var index = this._getMaxAreaIndex();
            return this.polygons[index];
        }
    };

    Object.defineProperties(MultiPolygon.prototype, prototypeAccessors);
    return MultiPolygon;
});
