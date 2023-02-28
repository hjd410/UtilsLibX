/**
 *  @author :   JiGuangJie
 *  @date   :   2019/10/12
 *  @time   :   15:45
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/util/WKTGeometryFormater", [
        "dojo/_base/declare",
        "../webgis/geometry/Point",
        "../webgis/geometry/Polyline",
        "../webgis/geometry/Polygon",
        "../webgis/geometry/Multipoint",
        "../webgis/geometry/MultiPolygon"
    ], function (declare, Point, Polyline, Polygon, Multipoint, MultiPolygon) {
        return declare("com.huayun.util.WKTGeometryFormater", null, {
            typReg: /(\w+)/,
            pointReg: /(-?\d+\.?\d*\s+-?\d+\.?\d*)/g,
            lineReg: /(-?\d+\.?\d*\s+-?\d+\.?\d*)/g,
            polygonReg: /\((\s*-?\d+\.?\d*\s+-?\d+\.?\d*,?)+\)/g,
            ringReg: /(\s*-?\d+\.?\d*\s+-?\d+\.?\d*)/g,
            multilineReg: /(\((\s*-?\d+\.?\d*\s+-?\d+\.?\d*,*\s*)+\))/g,
            // multipolyReg: /\({2}(\s*-?\d+\.?\d*\s+-?\d+\.?\d*,*\s*)+\){2}/g,
            multipolyReg: /(\({1,2}(\s*\d+.?\d*\s+\d+.?\d*,?)+\),?\)?)+/g,

            constructor: function () {

            },
            /**
             * 数据类型转换
             * @param value
             */
            toGeometry: function (value) {
                if (typeof value === "string" && value.length > 0) {
                    var pointArr = [], aPoint = null;
                    switch (value.match(this.typReg)[0].toLowerCase()) {
                        case "point":
                            pointArr = value.match(this.pointReg);
                            aPoint = pointArr[0].split(" ");
                            return new Point(Number(aPoint[0]), Number(aPoint[1]));
                        case "multipoint":
                            pointArr = value.match(this.pointReg);
                            var thePoints = [];
                            pointArr.forEach(function (point) {
                                aPoint = point.split(" ");
                                thePoints.push(new Point(Number(aPoint[0]), Number(aPoint[1])));
                            }.bind(this));
                            return new Multipoint(thePoints);
                        case "linestring":
                            var lineArr = value.match(this.lineReg);
                            var oneLinePath = [];
                            lineArr.forEach(function (point) {
                                pointArr = point.split(" ");
                                aPoint = new Point(Number(pointArr[0]), Number(pointArr[1]));
                                oneLinePath.push(aPoint);
                            }.bind(this));
                            return new Polyline([oneLinePath]);
                        case "multilinestring":
                            var multiLineArr = value.match(this.multilineReg);
                            var multilinePath = [];
                            multiLineArr.forEach(function (theLine) {
                                var aLinePath = theLine.match(this.lineReg);
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
                            var polygonArr = value.match(this.polygonReg);
                            return this.parsePolygon(polygonArr);
                        case "multipolygon":
                            var multipolygon = [];
                            var multipolygonArr = value.match(this.multipolyReg);
                            // debugger
                            if (multipolygonArr !== null) {
                                for (var i = 0, len = multipolygonArr.length; i < len; i++) {
                                    var onePolygon = multipolygonArr[i];
                                    var onePolygonArr = onePolygon.match(this.polygonReg);
                                    var thePolygon = this.parsePolygon(onePolygonArr);
                                    multipolygon.push(thePolygon);
                                }
                                return new MultiPolygon(multipolygon);
                            }
                        default:
                            break;
                    }
                } else {
                    console.warn("当前数据为无效数据:" + value);
                }
                return null;
            },

            parsePolygon: function (list) {
                var rings = [];
                for (var i = 0; i < list.length; i++) {
                    var oneRing = list[i];
                    var ringPaths = oneRing.match(this.ringReg);
                    var oneRingPoints = [];
                    for (var j = 0; j < ringPaths.length; j++) {
                        var thePoint = ringPaths[j];
                        pointArr = thePoint.split(" ");
                        aPoint = new Point(Number(pointArr[0]), Number(pointArr[1]));
                        oneRingPoints.push(aPoint);
                    }
                    rings.push(oneRingPoints);
                }
                return new Polygon(rings);
            }
        });
    });
