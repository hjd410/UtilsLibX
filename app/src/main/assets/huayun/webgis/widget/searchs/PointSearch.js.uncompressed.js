require({cache:{
'url:com/huayun/webgis/templates/searchs/pointSearch.html':"<div class=\"${baseClass}\" style=\"pointer-events: all;\">\r\n    <div id=\"showListP\" class=\"listView\" >\r\n        <span class=\"devTip\">设备列表</span>\r\n        <div class=\"first\">\r\n            <ul id=\"devListP\" class=\"devView\" data-dojo-attach-event=\"onclick:isMessage\"></ul>\r\n        </div>\r\n    </div>\r\n    <div id=\"devMoreInfoP\" class=\"infoView\">\r\n        <span class=\"infoTip\">设备详情列表</span>\r\n        <div class=\"end\">\r\n            <table id=\"moreInfoListP\" class=\"infoTableView\"></table>\r\n        </div>\r\n        <button id=\"closeShowP\" class=\"closeShow\" data-dojo-attach-event=\"onclick:closeMoreInfo\">关闭</button>\r\n    </div>\r\n</div>"}});
/**
 * 点选
 */
define("com/huayun/webgis/widget/searchs/PointSearch", [
    'dojo/_base/declare',
    'dojo/topic',
    '../MapModuleX',
    '../../Feature',
    '../../Graphic',
    '../../geometry/Point',
    '../../geometry/Polyline',
    '../../geometry/Multipoint',
    '../../geometry/Polygon',
    '../../symbols/PointSymbol',
    '../../symbols/LineSymbol',
    '../../symbols/PolygonSymbol',
    'dojo/text!../../templates/searchs/pointSearch.html'
],function(declare, topic, MapModuleX, Feature, Graphic, Point, Polyline, Multipoint, Polygon, PointSymbol, LineSymbol, PolygonSymbol, template){
    return declare("com.huayun.webgis.widget.searchs.PointSearch", [MapModuleX], {
        baseClass: "pointSearch",
        templateString: template,

        constructor: function () {
            this.map = null;
            this.view = null;
            this.dataList = null;
        },

        doInit: function () {
            this.map = this.get("map");
            this.view = this.get("view");
            topic.subscribe("showPoint", function (data, e) {
                this.dataList = data;
                for(var i = 0; i < this.dataList.length; i++){
                    this.mscLocation(this.dataList[i]);
                }
            }.bind(this));

            topic.subscribe("closePoint", function() {
                this.map.findLayerById("drawLayer").clear();
            }.bind(this));
        },

        mscLocation: function(geo) {
            var geometry = geo.geometry;
            var type = geo.geometryType;

            var drawLayer = this.map.findLayerById("drawLayer");
            var point = new PointSymbol({
                color: "#FFFF00",
                radious: 10,
                strokeColor: "#0000FF",
                strokeWidth: 1
            });
            var line = new LineSymbol({
                color: "#ff2f39",
                width: 3
            });
            var polygon = new PolygonSymbol({
                color: "#0FF",
                opacity:0.5
            });
        
            switch (type) {
                case "esriGeometryPoint":
                    var pointGeometry = new Point(geometry.x,geometry.y);
                    this.addgraphic(drawLayer, pointGeometry, point);
                    break;
                case "esriGeometryMultipoint":
                    var points = geometry.points.map(function (item) {
                        return new Point(item[0], item[1]);
                    });
                    var multiPointGeometry = new Multipoint(points);
                    this.addgraphic(drawLayer, multiPointGeometry,point);
                    break;
                case "esriGeometryPolyline":
                    var path = geometry.paths.map(function (item) {
                        return item.map(function (p) {
                            return new Point(p[0], p[1]);
                        });
                    });
                    var lineGeometry = new Polyline(path);
                    this.addgraphic(drawLayer, lineGeometry, line);
                    break;
                default:
                    var paths = geometry.rings.map(function (item) {
                        return item.map(function (p) {
                            return new Point(p[0], p[1]);
                        });
                    });
                    var polygonGeometry = new Polygon(paths);
                    this.addgraphic(drawLayer, polygonGeometry, polygon);
            }
        },

        addgraphic: function(layer, geometry, symbol) {
            var feature = new Feature({
              attributes: null,
              geometry: geometry
            });
            var graphic = new Graphic({
              feature: feature,
              symbol: symbol
            });
            layer.addGraphic(graphic);
            this.view.threeRender();
        }
    });
});