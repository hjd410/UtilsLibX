define("com/huayun/webgis/utils/wktUtil", [
    "exports",
    "../geometry/Point",
    "../geometry/Multipoint",
    "../geometry/Polyline",
    "../geometry/Polygon"
], function (exports, Point, Multipoint, Polyline, Polygon) {
    var typeReg = /(\w+)/,
        pointReg = /(\d+\.?\d+\s+\d+\.?\d+)/g,
        lineReg = /(\d+\.?\d+\s+\d+\.?\d+)/g,
        // polygonReg = /(\d+\.?\d+\s+\d+\.?\d+)/g,
        polygonReg = /\((\s*\d+\.?\d+\s+\d+\.?\d*,*\s*)+\)/g,
        multilineReg = /(\((\d+\.?\d+\s+\d+\.?\d*,*\s*)+\))/g,
        // multipolyReg = /\({2}(\d+\.?\d*\s+\d+\.?\d*,*\s*)+\){2}/g;
        multipolyReg = /(\((\((\s*\d+\.?\d+\s+\d+\.?\d*,*\s*)+\)){1}(,*\s*\((\s*\d+\.?\d+\s+\d+\.?\d*,*\s*)*\))*\))+/g;

    exports.parse2Geometry = function (value) {
        if (typeof value === "string" && value.length > 0) {
            var pointArr = [], aPoint = null;
            switch (value.match(typeReg)[0].toLowerCase()) {
                case "point":
                    pointArr = value.match(pointReg);
                    aPoint = pointArr[0].split(" ");
                    return new Point(Number(aPoint[0]), Number(aPoint[1]));
                case "multipoint":
                    pointArr = value.match(pointReg);
                    var thePoints = [];
                    pointArr.forEach(function (point) {
                        aPoint = point.split(" ");
                        thePoints.push(new Point(Number(aPoint[0]), Number(aPoint[1])));
                    }.bind(this));
                    return new Multipoint(thePoints);
                case "linestring":
                    var lineArr = value.match(lineReg);
                    var oneLinePath = [];
                    lineArr.forEach(function (point) {
                        pointArr = point.split(" ");
                        aPoint = new Point(Number(pointArr[0]), Number(pointArr[1]));
                        oneLinePath.push(aPoint);
                    }.bind(this));
                    return new Polyline([oneLinePath]);
                case "multilinestring":
                    var multiLineArr = value.match(multilineReg);
                    var multilinePath = [];
                    multiLineArr.forEach(function (theLine) {
                        var aLinePath = theLine.match(lineReg);
                        var theLinePath = [];
                        aLinePath.forEach(function (point) {
                            pointArr = point.split(" ");
                            aPoint = new Point(Number(pointArr[0]), Number(pointArr[1]));
                            theLinePath.push(aPoint);
                        });
                        multilinePath.push(theLinePath);
                    }.bind(this));
                    return new Polyline(multilinePath);
                case "polygon":
                    var polygonArr = value.match(polygonReg);
                    var rings = [];
                    polygonArr.forEach(function (point) {
                        var ring = [];
                        var points = point.match(pointReg);
                        points.forEach(function (p) {
                            pointArr = p.split(" ");
                            aPoint = new Point(Number(pointArr[0]), Number(pointArr[1]));
                            ring.push(aPoint);
                        });
                        rings.push(ring);
                    }.bind(this));
                    return new Polygon(rings);
                case "multipolygon":
                    var multipolygonArr = value.match(multipolyReg);
                    var multipolygons = [];
                    multipolygonArr.forEach(function (polygon) {
                        var polygonArr = polygon.match(polygonReg);
                        var rings = [];
                        polygonArr.forEach(function (point) {
                            var ring = [];
                            var points = point.match(pointReg);
                            points.forEach(function (p) {
                                pointArr = p.split(" ");
                                aPoint = new Point(Number(pointArr[0]), Number(pointArr[1]));
                                ring.push(aPoint);
                            });
                            rings.push(ring);
                        });
                        multipolygons.push(new Polygon(rings));
                    });
                    return multipolygons;
                default:
                    break;
            }
        } else {
            console.warn("当前数据为无效数据:" + value);
        }
        return null;
    };

    exports.parse2Array = function (value) {
        if (typeof value === "string" && value.length > 0) {
            var pointArr = [], aPoint = null;
            switch (value.match(typeReg)[0].toLowerCase()) {
                case "point":
                    pointArr = value.match(pointReg);
                    aPoint = pointArr[0].split(" ");
                    return new Point(Number(aPoint[0]), Number(aPoint[1]));
                case "multipoint":
                    pointArr = value.match(pointReg);
                    var thePoints = [];
                    pointArr.forEach(function (point) {
                        aPoint = point.split(" ");
                        thePoints.push(new Point(Number(aPoint[0]), Number(aPoint[1])));
                    }.bind(this));
                    return thePoints;
                case "linestring":
                    var lineArr = value.match(lineReg);
                    var oneLinePath = [];
                    lineArr.forEach(function (point) {
                        pointArr = point.split(" ");
                        aPoint = new Point(Number(pointArr[0]), Number(pointArr[1]));
                        oneLinePath.push(aPoint);
                    }.bind(this));
                    return oneLinePath;
                case "multilinestring":
                    var multiLineArr = value.match(multilineReg);
                    var multilinePath = [];
                    multiLineArr.forEach(function (theLine) {
                        var aLinePath = theLine.match(lineReg);
                        var theLinePath = [];
                        aLinePath.forEach(function (point) {
                            pointArr = point.split(" ");
                            aPoint = new Point(Number(pointArr[0]), Number(pointArr[1]));
                            theLinePath.push(aPoint);
                        });
                        multilinePath.push(theLinePath);
                    }.bind(this));
                    return multilinePath;
                case "polygon":
                    var polygonArr = value.match(polygonReg);
                    var onePolygonPath = [];
                    polygonArr.forEach(function (point) {
                        pointArr = point.split(" ");
                        aPoint = new Point(Number(pointArr[0]), Number(pointArr[1]));
                        onePolygonPath.push(aPoint);
                    }.bind(this));
                    return onePolygonPath;
                case "multipolygon":
                    var multipolygon = [];
                    var multipolygonArr = value.match(multipolyReg);
                    multipolygonArr.forEach(function (polygon) {
                        var points = polygon.match(polygonReg);
                        var ring = [];
                        points.forEach(function (point) {
                            pointArr = point.split(" ");
                            aPoint = new Point(Number(pointArr[0]), Number(pointArr[1]));
                            ring.push(aPoint);
                        });
                        multipolygon.push(ring);
                    });
                    return multipolygon;
                default:
                    break;
            }
        } else {
            console.warn("当前数据为无效数据:" + value);
        }
        return null;
    }
});