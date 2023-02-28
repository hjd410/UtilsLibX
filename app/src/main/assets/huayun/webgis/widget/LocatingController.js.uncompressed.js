require({cache:{
'url:com/huayun/webgis/templates/locatingController.html':"<ul class=\"${baseClass}\" style=\"width:${width}px;pointer-events: all;\">\r\n    <li class=\"locating-item\">\r\n        <label class=\"item-label\" for=\"point\">坐标(点)</label>\r\n        <input id=\"point\" type=\"text\" value=\"${inputDefaultValue.point}\">\r\n        <span class=\"btn locate-btn\" data-dojo-attach-event=\"onclick:locateOnPoint\"></span>\r\n        <span class=\"btn clear-btn\" data-dojo-attach-event=\"onclick:clearLocating\"></span>\r\n    </li>\r\n    <li class=\"locating-item\">\r\n        <label class=\"item-label\" for=\"points\">坐标(多点)</label>\r\n        <input id=\"points\" type=\"text\" value=\"${inputDefaultValue.points}\">\r\n        <span class=\"btn locate-btn\" data-dojo-attach-event=\"onclick:locateOnPoints\"></span>\r\n        <span class=\"btn clear-btn\" data-dojo-attach-event=\"onclick:clearLocating\"></span>\r\n    </li>\r\n\r\n    <li class=\"locating-item\">\r\n        <label class=\"item-label\" for=\"line\">坐标(线)</label>\r\n        <input id=\"line\" type=\"text\" value=\"${inputDefaultValue.line}\" >\r\n        <span class=\"btn locate-btn\" data-dojo-attach-event=\"onclick:locateOnLineString\"></span>\r\n        <span class=\"btn clear-btn\" data-dojo-attach-event=\"onclick:clearLocating\"></span>\r\n    </li>\r\n    <!--\r\n   <li class=\"locating-item\">\r\n       <label class=\"item-label\" for=\"lines\">坐标(多线)</label><input id=\"lines\" type=\"text\" value=\"${inputDefaultValue.lines}\">\r\n       <span class=\"btn\" data-dojo-attach-event=\"onclick:locateOnLinesString\">定位</span><span class=\"btn\"\r\n                                                                                                data-dojo-attach-event=\"onclick:clearLocating\">清除</span>\r\n   </li>\r\n   -->\r\n    <li class=\"locating-item\">\r\n        <label class=\"item-label\">坐标(面)</label>\r\n        <input id=\"plane\" type=\"text\" value=\"${inputDefaultValue.plane}\">\r\n        <span class=\"btn locate-btn\" data-dojo-attach-event=\"onclick:locateInPolygon\"></span>\r\n        <span class=\"btn clear-btn\" data-dojo-attach-event=\"onclick:clearLocating\"></span>\r\n    </li>\r\n</ul>"}});
/*
    定位功能部件
 */
define(
    "com/huayun/webgis/widget/LocatingController", [
        "dojo/_base/declare",
        "dojo/topic",
        "dojo/_base/query",
        "./MapModuleX",
        "../Feature",
        "../Graphic",
        "../geometry/Extent",
        "../geometry/Polygon",
        "../geometry/Polyline",
        "../symbols/PointSymbol",
        "../symbols/LineSymbol",
        "../symbols/PolygonSymbol",
        "../geometry/Point2D",
        "dojo/text!../templates/locatingController.html"
    ], function (declare, topic, query, MapModuleX, Feature, Graphic, Extent, Polygon, Polyline, PointSymbol, LineSymbol, PolygonSymbol, Point, template) {
        return declare("com.huayun.webgis.widget.LocatingController", [MapModuleX], {
            map: null,
            view: null,
            maxLevel: null,
            templateString: template,//本组件的template
            name: "",
            baseClass: "locating-panel",
            backgroundColor: "",
            width: 400,
            height: "100%",
            _graphicLayer: {},
            _graphicLayerView: {},
            inputDefaultValue: {
                point: "POINT(510956.68552086304 3351006.8744868394)",
                points: "multipoint(510956.68552086304 3351006.8744868394,510756.68552086304 3351206.8744868394,510356.68552086304 3350906.8744868394)",
                line: "linestring(510956.68552086304 3351006.8744868394,510756.68552086304 3351206.8744868394)",
                lines: "multilinestring((473159.904 3347918.429,472572.073 3347775.921)(535989.234 3337808.425,441290.124 3340479.781))",
                plane: "polygon(510956.68552086304 3351006.8744868394,510756.68552086304 3351206.8744868394,510356.68552086304 3350906.8744868394)"
            },
            drawOptions: {
                color: "rgba(65,105,225,.5)",
                lineWidth: 2
            },
            doInit: function () {
                this.map = this.get("map");
                this.view = this.get("view");
                this.maxLevel = this.view.viewpoint.maxLevel;

                this._graphicLayerView = this.view.findLayerViewById("drawLayer");
                this._graphicLayer = this.map.findLayerById("drawLayer");

                this.dotSymbol = new PointSymbol({
                    radius: 10,
                    color: "#2196F3",
                    strokeColor: "#8BC34A",
                    strokeWidth: 1
                });
                this._lineSymbol = new LineSymbol({
                    color: "#009688",
                    width: 5
                });
                this._polygonSymbol = new PolygonSymbol({
                    color: "#4CAF50",
                    opacity: 0.8
                });
            },
            clearLocating: function () {
                this._graphicLayer.clear();
            },

            /**
             * 点定位
             */
            locateOnPoint: function () {
                this.clearLocating();
                var geoStr = query("#point")[0].value;
                var geoJson = this.geometry2geoJson(geoStr);
                var geoPoint = {x: Number(geoJson.coordinates[0]), y: Number(geoJson.coordinates[1])};
                var point = new Point(geoPoint.x, geoPoint.y);

                var feature = new Feature({
                    geometry: point
                });
                var graphic = new Graphic({
                    feature: feature,
                    symbol: this.dotSymbol
                });
                this._graphicLayer.addGraphic(graphic);
                this.view.centerAt(geoPoint.x, geoPoint.y, this.maxLevel);
            },

            /**
             * 多点定位
             */
            locateOnPoints: function () {
                this.clearLocating();
                var GeoStr = query("#points")[0].value;
                var GeoJson = this.geometry2geoJson(GeoStr);
                var centerPoint = this.getCenterPoint(GeoJson.coordinates);//中间点坐标
                var geoX_arr = [], geoY_arr = [];

                GeoJson.coordinates.forEach(function (item) {
                    var x = Number(item[0]);
                    var y = Number(item[1]);

                    geoX_arr.push(x);
                    geoY_arr.push(y);

                    var point = new Point(x, y, 0.1);

                    var feature = new Feature({
                        geometry: point
                    });
                    var graphic = new Graphic({
                        feature: feature,
                        symbol: this.dotSymbol,
                        graphicLayer: this._graphicLayer
                    });

                    this._graphicLayer.addGraphic(graphic);
                }.bind(this));
                this.view.threeRender();
                this.view.centerAt(centerPoint.x, centerPoint.y);

                this._getMinRange(geoX_arr, geoY_arr, centerPoint);
            },

            /**
             * 线定位
             */
            addLine: function (startPoint, endPoint) {//画线
                var geometry = new Polyline();
                geometry.setPath([[startPoint, endPoint]]);

                var feature = new Feature({
                    geometry: geometry
                });
                var graphic = new Graphic({
                    feature: feature,
                    symbol: this._lineSymbol
                });
                this._graphicLayer.addGraphic(graphic);
            },
            locateOnLineString: function () {
                this.clearLocating();
                var GeoStr = query("#line")[0].value;
                var GeoJson = this.geometry2geoJson(GeoStr);
                var centerPoint = this.getCenterPoint(GeoJson.coordinates);
                var startPoint = new Point(Number(GeoJson.coordinates[0][0]), Number(GeoJson.coordinates[0][1]));
                var endPoint = new Point(Number(GeoJson.coordinates[1][0]), Number(GeoJson.coordinates[1][1]));
                var geoX_arr = [startPoint.x, endPoint.x];
                var geoY_arr = [startPoint.y, endPoint.y];
                this._getMinRange(geoX_arr, geoY_arr, centerPoint);
                this.addLine(startPoint, endPoint);
                this.view.centerAt(centerPoint.x, centerPoint.y);
            },

            /**
             * 面定位
             */
            addPolygon: function (points) {//画面
                var geometry_array = [];
                for (var i = 0; i < points.length; i++) {
                    var point = points[i];
                    geometry_array.push(point);
                }

                var polygon = new Polygon();
                polygon.setPath([geometry_array]);//点转化成路径
                var polyF = new Feature({
                    attribute: null,
                    geometry: polygon,
                    type: "polygon"
                });
                var graphic = new Graphic({
                    feature: polyF,
                    symbol: this._polygonSymbol
                });
                this._graphicLayer.addGraphic(graphic);
            },
            locateInPolygon: function () {
                this.clearLocating();
                var GeoStr = query("#plane")[0].value;
                var GeoJson = this.geometry2geoJson(GeoStr);
                var centerPoint = this.getCenterPoint(GeoJson.coordinates);
                var points = [],
                    pointsArr = GeoJson.coordinates,
                    point;

                var geoX_arr = [], geoY_arr = [];

                for (var i = 0; i < pointsArr.length; i++) {
                    var x = Number(pointsArr[i][0]);
                    var y = Number(pointsArr[i][1]);
                    point = new Point(x, y);
                    geoX_arr.push(x);
                    geoY_arr.push(y);
                    points.push(point);
                }

                this.addPolygon(points);
                this.view.centerAt(centerPoint.x, centerPoint.y);
                // this._getMinRange(geoX_arr, geoY_arr, centerPoint);
            },



            geometry2geoJson: function (geoStr) {
                var geoJson = {};
                var geoStr = geoStr.toLocaleUpperCase();

                if (geoStr.startsWith("POINT")) {// 点
                    geoJson["type"] = "POINT";
                    var firstLeftIdx = geoStr.indexOf('(');
                    var lastRightIdx = geoStr.indexOf(')');
                    var pointStr = geoStr.slice(firstLeftIdx + 1, lastRightIdx);
                    var singlePoint = pointStr.split(" ");
                    geoJson["coordinates"] = singlePoint;
                } else if (geoStr.startsWith("MULTIPOINT")) {//多点
                    geoJson["type"] = "MULTIPOINT";
                    var startIdx = geoStr.indexOf("(");
                    var endIdx = geoStr.indexOf(")");
                    var multipointStr = geoStr.slice(startIdx + 1, endIdx);
                    var multipointArr = multipointStr.split(",");
                    var multipoint_pointsArr = [];
                    multipointArr.forEach(function (item) {
                        multipoint_pointsArr.push(item.split(" "));// [x,y]
                    });
                    geoJson["coordinates"] = multipoint_pointsArr;
                } else if (geoStr.startsWith("LINESTRING")) {
                    //线
                    geoJson["type"] = "LINESTRING";
                    var startIdx = geoStr.indexOf("(");
                    var endIdx = geoStr.indexOf(")");
                    var lineStr = geoStr.slice(startIdx + 1, endIdx);
                    var linePointsArr = lineStr.split(",");
                    var lineArr = []
                    linePointsArr.forEach(function (item) {
                        lineArr.push(item.split(" "));// [x,y]
                    });
                    geoJson["coordinates"] = lineArr;
                } else if (geoStr.startsWith("MULTILINESTRING")) {
                    //多线
                } else if (geoStr.startsWith("POLYGON")) {
                    //面
                    geoJson["type"] = 'POLYGON';
                    var firstLeftIdx = geoStr.indexOf('(');
                    var lastRightIdx = geoStr.indexOf(')');
                    //去掉收尾括号
                    var str = geoStr.substring(firstLeftIdx + 1, geoStr.length - 1);//(),(),()
                    var arr = [];
                    var pointsArr = str.split(",");
                    pointsArr.forEach(function (item) {
                        arr.push(item.split(" "));
                    });
                    geoJson["coordinates"] = arr;
                }
                return geoJson;
            },
            getCenterPoint: function (pointsArr, callback) {
                //计算屏幕中心点
                if (pointsArr && pointsArr.length > 0) {
                    var MIN_X = pointsArr[0][0];
                    var MIN_Y = pointsArr[0][1];
                    var MAX_X = pointsArr[0][0];
                    var MAX_Y = pointsArr[0][1];
                }

                pointsArr.forEach(function (item) {
                    MIN_X = item[0] < MIN_X ? item[0] : MIN_X;
                    MAX_X = item[0] > MAX_X ? item[0] : MAX_X;
                    MIN_Y = item[1] < MIN_Y ? item[1] : MIN_Y;
                    MAX_Y = item[1] > MAX_Y ? item[1] : MAX_Y;
                });

                var centerPoint = {
                    x: (Number(MIN_X) + Number(MAX_X)) / 2,
                    y: (Number(MIN_Y) + Number(MAX_Y)) / 2
                };
                if (callback) {
                    callback(centerPoint);
                }
                return centerPoint;
            },
            getLevelExtent: function (pointsArr) {
                //计算区域点的范围大小
                if (pointsArr && pointsArr.length > 0) {
                    var MIN_X = pointsArr[0][0];
                    var MIN_Y = pointsArr[0][1];
                    var MAX_X = pointsArr[0][0];
                    var MAX_Y = pointsArr[0][1];
                }

                pointsArr.forEach(function (item) {
                    MIN_X = item[0] < MIN_X ? item[0] : MIN_X;
                    MAX_X = item[0] > MAX_X ? item[0] : MAX_X;
                    MIN_Y = item[1] < MIN_Y ? item[1] : MIN_Y;
                    MAX_Y = item[1] > MAX_Y ? item[1] : MAX_Y;
                });
                var _extent = new Extent(MIN_X, MIN_Y, MAX_X, MAX_Y);
                return _extent;
            },
            drawPoint: function (point) {
            },

            /*根据地理坐标集合获取视线可视范围内的最小坐标边界点*/
            _getMinRange: function (geoX_arr, geoY_arr, center) {
                var min_geoX = Math.min.apply(null, geoX_arr),
                    max_geoX = Math.max.apply(null, geoX_arr),
                    min_geoY = Math.min.apply(null, geoY_arr),
                    max_geoY = Math.max.apply(null, geoY_arr);

                var extend = new Extent(min_geoX, min_geoY, max_geoX, max_geoY);
                this.view.setExtent(extend, center);

                var differLevel = this.maxLevel - this.view.level;
                topic.publish("changeLevel", {level: this.view.level, diffLevel: differLevel});   //多点定位
            }
        });
    }
);