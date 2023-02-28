require({cache:{
'url:com/huayun/webgis/templates/searchs/rectSearch.html':"<div class=\"${baseClass}\" style=\"pointer-events: all;\">\r\n    <div id=\"rectList\" class=\"listView\">\r\n        <span class=\"devTip\">设备列表</span>\r\n        <div class=\"first\">\r\n            <!-- <ul id=\"rectExList\" class=\"devView\" data-dojo-attach-event=\"onclick:rectTabList\"></ul> -->\r\n            <ul id=\"rectExList\" class=\"devView\"></ul>\r\n        </div>\r\n    </div>\r\n    <!-- <div id=\"rectMoreInfo\" class=\"infoView\">\r\n        <span class=\"infoTip\">设备详情列表</span>\r\n        <div class=\"end\">\r\n            <table id=\"rectInfoList\" class=\"infoTableView\"></table>\r\n        </div>\r\n        <button id=\"rectCloseBtn\" class=\"closeShow\" data-dojo-attach-event=\"onclick:closeRectShow\">关闭</button>\r\n    </div> -->\r\n</div>"}});
define("com/huayun/webgis/widget/searchs/RectSearch", [
    'dojo/_base/declare',
    'dojo/dom',
    'dojo/dom-construct',
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
    'dojo/text!../../templates/searchs/rectSearch.html'
], function(declare, dom, domConstruct, topic, MapModuleX, Feature, Graphic, Point, Polyline, Multipoint, Polygon, PointSymbol, LineSymbol, PolygonSymbol, template) {
    return declare ("com.huayun.webgis.widget.searchs.RectSearch", [MapModuleX], {
        baseClass: "rectSearch",
        templateString: template,

        constructor: function () {
            this.dataList = null;
            this.map = null;
            this.view = null;
        },
        
        doInit: function () {
            var rectList = dom.byId("rectList");
            this.map = this.get("map");
            this.view = this.get("view");

            topic.subscribe("showRectInfo", function (data) {
                this.dataList = data;
                this.showDev();

                rectList.style.display = "block";
            }.bind(this));

            topic.subscribe("closeRectInfo", function () {
                rectList.style.display = "none";
                // rectMoreInfo.style.display = "none";
            }.bind(this));
        },

        showDev: function () {
            var rectExList = dom.byId("rectExList");
            // var rectInfoList = dom.byId("rectInfoList");

            // rectMoreInfo.style.display = "none";
            // domConstruct.empty(rectInfoList);
            domConstruct.empty(rectExList);

            for(var i = 0; i < this.dataList.length; i++) {
                var item = this.dataList[i];
                var li = domConstruct.create("li", {
                    index: i,
                    className: "showLi"
                }, rectExList);
                var div = domConstruct.create("div", {
                    index: i,
                    className: "message",
                    innerHTML: (i + 1) + "." + item.attributes.NAME + "---" + item.layerName
                }, li);
                // var btn = domConstruct.create("button", {
                //     index: i,
                //     className: "locationBtn",
                //     innerHTML: "定位"
                // }, li);
            }
        },

        // rectTabList: function (e) {
        //     if(e.target.className === "message"){
        //         this.showMoreInfo(e);
        //     } else {
        //         this.mscLocation(e);
        //     }
        // },

        // mscLocation: function (e) {
        //     var index = e.target.getAttribute("index");
        //     var geometry = this.dataList[index].geometry;
        //     var type = this.dataList[index].geometryType;

        //     var drawLayer = this.map.findLayerById("drawLayer");
        //     var point = new PointSymbol({
        //         color: "#FFFF00",
        //         radious: 5,
        //         strokeColor: "#0000FF",
        //         strokeWidth: 1
        //     });
        //     var line = new LineSymbol({
        //         color: "#ff2f39",
        //         width: 3
        //     });
        //     var polygon = new PolygonSymbol({
        //         color: "0FF",
        //         opacity: 0.5
        //     });

        //     switch (type) {
        //         case "esriGeometryPoint":
        //             var pointGeometry = new Point(geometry.x, geometry.y);
        //             this.addgraphic(drawLayer, pointGeometry, point);
        //             break;
        //         case "esriGeometryMultipoint":
        //             var points = geometry.points.map(function (item) {
        //                 return new Point(item[0], item[1]);
        //             });
        //             var multiPointGeometry = new Multipoint(points);
        //             this.addgraphic(drawLayer, multiPointGeometry, point);
        //             break;
        //         case "esriGeometryPolyline":
        //             var path = geometry.paths.map(function (item) {
        //                 return item.map(function (p) {
        //                     return new Point(p[0], p[1]);
        //                 });
        //             });
        //             var lineGeometry = new Polyline(path);
        //             this.addgraphic(drawLayer, lineGeometry, line);
        //             break;
        //         default:
        //             var paths = geometry.rings.map(function (item) {
        //                 return item.map(function (p) {
        //                     return new Point(p[0], p[1]);
        //                 });
        //             });
        //             var polygonGeometry = new Polygon(paths);
        //             this.addgraphic(drawLayer, polygonGeometry, polygon);
        //     }
        // },

        // addgraphic: function (layer, geometry, symbol) {
        //     var feature = new Feature({
        //         attributes: null,
        //         geometry: geometry
        //     });
        //     var graphic = new Graphic({
        //         feature: feature,
        //         symbol: symbol
        //     });
        //     layer.addGraphic(graphic);
        //     this.view.threeRender();
        // },

        // showMoreInfo: function (e) {
        //     var rectMoreInfo = dom.byId("rectMoreInfo");
        //     var index = e.target.getAttribute("index");
        //     var attrList = this.dataList[index].attributes;

        //     rectMoreInfo.style.display = "block";
        //     rectMoreInfo.style.zIndex = "500";
        //     domConstruct.empty(rectInfoList);
        //     this.createTable(attrList);
        // },

        // closeRectShow: function () {
        //     rectMoreInfo.style.display = "none";
        // },

        // createTable: function (attrList) {
        //     for (key in attrList) {
        //         if(key !== "SHAPE" && key !== "SUBGEOREGION") {
        //             var attrTr = domConstruct.create("tr", {
        //                 className: "attrTr"
        //             }, rectInfoList);
        //             var attrTd1 = domConstruct.create("td", {
        //                 className: "td1",
        //                 noWrap: "false",
        //                 innerHTML: key
        //             }, attrTr);
        //             var attrTd2 = domConstruct.create("td", {
        //                 className: "td2",
        //                 noWrap: "false",
        //                 innerHTML: attrList[key]
        //             }, attrTr);
        //         }
        //     }
        // }
    });
});