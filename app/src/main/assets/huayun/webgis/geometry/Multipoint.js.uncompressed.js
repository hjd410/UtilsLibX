/**
 * 多点
 * @module com/huayun/webgis/geometry
 * @see com.huayun.webgis.geometry.Multipoint
 */
define("com/huayun/webgis/geometry/Multipoint", [
    "./Geometry",
    "./Extent"
], function (Geometry, Extent) {

    function findExtremum(points) {
        var xmin, ymin, xmax, ymax;
        xmin = xmax = points[0].x;
        ymin = ymax = points[0].y;
        var len = points.length;
        for (var i = 0; i < len; i++) {
            var p = points[i];
            xmin = Math.min(xmin, p.x);
            ymin = Math.min(ymin, p.y);
            xmax = Math.max(xmax, p.x);
            ymax = Math.max(ymax, p.y);
        }
        return {
            xmin: xmin,
            ymin: ymin,
            xmax: xmax,
            ymax: ymax
        };
    }
    /**
     * 多点
     * @constructor
     * @alias com.huayun.webgis.geometry.Multipoint
     * @extends {Geometry}
     * @param {Array} points 点数组, 一维数组
     * @property {Array} points 点数组, 一维数组
     * @property {Extent} extent 多点范围
     * @example
     * var mp = new Multipoint([
     *  new Point(514581, 3349546),
     *  new Point(514981, 3349546),
     *  new Point(514981, 3349246),
     *  new Point(514581, 3349246),
     *  new Point(514581, 3349546)
     * ])
     */
    var Multipoint = function (points, spatialReference) {
        Geometry.call(this);
        this.type = "multipoint";
        this.points = points === undefined?[]: points;
        this.spatialReference = spatialReference;
        this._extent = null;
    };

    if (Geometry) Multipoint.__proto__ = Geometry;
    Multipoint.prototype = Object.create(Geometry && Geometry.prototype);
    Multipoint.prototype.constructor = Multipoint;

    var prototypeAccessors = {
        length: {configurable: false},
        extent: {configurable: false}
    };

    prototypeAccessors.length.get = function () {
        return this.points.length;
    };

    prototypeAccessors.extent.get = function () {
        if (!this._extent) {
            var extremum = findExtremum(this.points);
            this._extent = new Extent(extremum.xmin, extremum.ymin, extremum.xmax, extremum.ymax);
        }
        return this._extent;
    };

    Multipoint.prototype = {
        setPoints: function (points) {
            this.points = points;
            this._extent = null;
        },
        addPoint: function (point) {
            this.points.push(point);
            this._extent = null;
        },
        update: function (dx, dy) {
            this.points.forEach(function (point) {
                point.update(dx, dy);
            });
            this._extent = null;
        }
    };

    Object.defineProperties(Multipoint.prototype, prototypeAccessors);
    return Multipoint;
});
