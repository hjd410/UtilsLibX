require({cache:{
'url:com/huayun/webgis/templates/searchs/polygonSearch.html':"<div class=\"${baseClass}\" style=\"pointer-events: all;\">\r\n    <div id=\"polyList\" class=\"listView\">\r\n        <span class=\"devTip\">设备列表</span>\r\n        <div class=\"first\">\r\n            <!-- <ul id=\"simList\" class=\"devView\" data-dojo-attach-event=\"onclick:tabList\"></ul> -->\r\n            <ul id=\"simList\" class=\"devView\" ></ul>\r\n        </div>\r\n    </div>\r\n    <!-- <div id=\"infoList\" class=\"infoView\">\r\n        <span class=\"infoTip\">设备详情列表</span>\r\n        <div class=\"end\">\r\n            <table id=\"tableInfoList\" class=\"infoTableView\"></table>\r\n        </div>\r\n        <button id=\"closeBtn\" class=\"closeShow\" data-dojo-attach-event=\"onclick:closeShowAction\">关闭</button>\r\n    </div> -->\r\n</div>"}});
define("com/huayun/webgis/widget/searchs/PolygonSearch", [
    'dojo/_base/declare',
    'dojo/dom',
    'dojo/on',
    'dojo/query',
    'dojo/dom-style',
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
    'dojo/text!../../templates/searchs/polygonSearch.html'
], function(declare, dom, on, query, domStyle, domConstruct, topic, MapModuleX, Feature, Graphic, Point, Polyline, Multipoint, Polygon, PointSymbol, LineSymbol, PolygonSymbol, template) {
    return declare("com.huayun.webgis.widget.searchs.PolygonSearch", [MapModuleX], {
        baseClass: "polygonSearch",
        templateString: template,

        constructor: function () {
            this.dataList = null;
            this.map = null;
            this.view = null;
        },

        doInit: function () {
            var polyList = dom.byId("polyList");
            this.map = this.get("map");
            this.view = this.get("view");
            //监听显示
            topic.subscribe("showPolyInfo", function (data) {
                this.dataList = data;
                this.showDev();
                polyList.style.display = "block";
            }.bind(this));

            topic.subscribe("closeInfo", function () {
                polyList.style.display = "none";
                // infoList.style.display = "none";
            }.bind(this));
        },

        /**
         * 展示设备列表的函数
         */
        showDev: function () {
            var simList = dom.byId("simList");
            // var tableInfoList = dom.byId("tableInfoList");

            // infoList.style.display = "none";
            // domConstruct.empty(tableInfoList);
            domConstruct.empty(simList);

            for(var i = 0; i < this.dataList.length; i++) {
                var item = this.dataList[i];
                var li = domConstruct.create("li", {
                    index: i, 
                    className: "showLi"
                }, simList);
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

        /**
         * 点击的位置不同，显示内容也不同
         * @param e 
         */
        // tabList: function (e) {
        //     if(e.target.className === "message"){
        //         this.showMoreInfo(e);
        //     } else {
        //         this.mscLocation(e);
        //     }
        // },

        /**
         *  点击定位，绘制设备位置
         */
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
        //         color: "#0FF",
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

        /**
         * 向图层中添加图形
         * @param layer 
         * @param geometry 
         * @param symbol 
         */
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

        /**
         * 显示详细的设备信息
         */
        // showMoreInfo: function (e) {
        //     var infoList = dom.byId("infoList");
        //     var index = e.target.getAttribute("index");
        //     var attrList = this.dataList[index].attributes;

        //     infoList.style.display = "block";
        //     infoList.style.zIndex = "500";
        //     domConstruct.empty(tableInfoList);
        //     this.createTable(attrList);
        // },

        /**
         * 关闭按钮点击时，关闭设备详情信息框
         */
        // closeShowAction: function () {
        //     infoList.style.display = "none";
        // },
        
        /**
         * 创建表格的函数
         */
        // createTable: function (attrList) {
        //     for(key in attrList) {
        //         if(key !== "SHAPE" && key !== "SUBGEOREGION") {
        //             var attrTr = domConstruct.create("tr", {
        //                 className: "attrTr"
        //             }, tableInfoList);
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