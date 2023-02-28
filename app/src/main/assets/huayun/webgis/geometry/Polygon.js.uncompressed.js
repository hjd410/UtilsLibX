/**
 * 面
 * @module com/huayun/webgis/geometry
 * @see com.huayun.webgis.geometry.Polygon
 */
define("com/huayun/webgis/geometry/Polygon", [
    "./Geometry",
    "./Extent"
], function (Geometry, Extent) {
    function findExtremum(path) {
        var xmin, ymin, xmax, ymax;
        xmin = xmax = path[0][0].x;
        ymin = ymax = path[0][0].y;
        var len = path.length;
        for (var i = 0; i < len; i++) {
            var line = path[i];
            var ll = line.length;
            for (var j = 0; j < ll; j++) {
                var p = line[j];
                xmin = Math.min(xmin, p.x);
                ymin = Math.min(ymin, p.y);
                xmax = Math.max(xmax, p.x);
                ymax = Math.max(ymax, p.y);
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
     * 面
     * @constructor
     * @alias com.huayun.webgis.geometry.Polygon
     * @extends {Geometry}
     * @param {Array} path  - 面的点数组, 二维数组
     * @property {Array} path 面的点数组, 二维数组
     * @property {Extent} extent 面的范围
     * @example
     * var innerPolygon = new Polygon([[
     *  new Point(514581, 3349546),
     *  new Point(514981, 3349546),
     *  new Point(514981, 3349246),
     *  new Point(514581, 3349246),
     *  new Point(514581, 3349546)
     * ],[
     *  new Point(514581, 3349546),
     *  new Point(514981, 3349546),
     *  new Point(514981, 3349246),
     *  new Point(514581, 3349246),
     *  new Point(514581, 3349546)
     * ]]);
     */
    var Polygon = function (path, spatialReference) {
        Geometry.call(this);
        this.type = "polygon";
        this.path = path;
        this.spatialReference = spatialReference;
        this._extent = null;
        this._area = null;
    };

    if (Geometry) Polygon.__proto__ = Geometry;
    Polygon.prototype = Object.create(Geometry && Geometry.prototype);
    Polygon.prototype.constructor = Polygon;

    var prototypeAccessors = {
        length: {configurable: false},
        extent: {configurable: false},
        area: {configurable: false}
    };

    prototypeAccessors.length.get = function () {
        return this.path.length;
    };

    prototypeAccessors.extent.get = function () {
        if (!this._extent) {
            var extremum = findExtremum(this.path);
            this._extent = new Extent(extremum.xmin, extremum.ymin, extremum.xmax, extremum.ymax);
        }
        return this._extent;
    };

    prototypeAccessors.area.get = function() {
        if (!this._area) {
            this._area = this.calculateArea();
        }
        return this._area;
    }

    Polygon.prototype = {
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
        calculateArea: function () {
            var smallArea = 0,
                allarea = 0;
            var ringList = this.path;
            for (var i = 0; i < ringList.length; i++) {
                var pointList = ringList[i];
                for (var j = 0; j < pointList.length - 1; j++) {
                    smallArea = 0.5 * (pointList[j+1].x - pointList[j].x) * (pointList[j+1].y + pointList[j].y);
                    allarea += smallArea;
                }
                smallArea = 0.5 * (pointList[0].x - pointList[pointList.length-1].x) * (pointList[0].y + pointList[pointList.length-1].y);
                allarea += smallArea;
            }
            return Math.abs(allarea);
        }
    };

    Object.defineProperties(Polygon.prototype, prototypeAccessors);
    return Polygon;
});