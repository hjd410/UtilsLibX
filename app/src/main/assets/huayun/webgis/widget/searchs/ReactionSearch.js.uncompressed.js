require({cache:{
'url:com/huayun/webgis/templates/searchs/reactionSearch.html':"<div class=\"${baseClass}\"  style=\"pointer-events: all;\">\r\n    <div id=\"showList\" class=\"listView\" >\r\n        <span class=\"devTip\">设备列表</span>\r\n        <div class=\"first\">\r\n            <ul id=\"devList\" class=\"devView\" data-dojo-attach-event=\"onclick:isMessage\"></ul>\r\n        </div>\r\n    </div>\r\n    <div id=\"devMoreInfo\" class=\"infoView\">\r\n        <span class=\"infoTip\">设备详情列表</span>\r\n        <div class=\"end\">\r\n            <table id=\"moreInfoList\" class=\"infoTableView\"></table>\r\n        </div>\r\n        <button id=\"closeShow\" class=\"closeShow\" data-dojo-attach-event=\"onclick:closeMoreInfo\">关闭</button>\r\n    </div>\r\n</div>"}});
/**
 * 动态感应
 */
define("com/huayun/webgis/widget/searchs/ReactionSearch", [
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
    'dojo/text!../../templates/searchs/reactionSearch.html'
], function(declare, dom, on, query, domStyle, domConstruct, topic, MapModuleX, Feature, Graphic, Point, Polyline, Multipoint, Polygon, PointSymbol, LineSymbol, PolygonSymbol, template) {
    return declare("com.huayun.webgis.widget.searchs.ReactionSearch", [MapModuleX], {
        baseClass: "reactionSearch",
        templateString: template,

        constructor: function () {
            this.dataList = null;
            this.point = null;
            this.map = null;
            this.view = null;
        },

        doInit: function () {
            var showList = dom.byId("showList");
            this.map = this.get("map");
            this.view = this.get("view");
            //监听显示
            topic.subscribe("showDevInfo", function (data,e) {
                this.dataList = data;
                this.point = e;
                this.showDev();

                showList.style.display = "block";
                showList.style.left = e.clientX + "px";
                showList.style.top = e.clientY + "px";
            }.bind(this));
            // 监听关闭
            topic.subscribe("closeDevInfo", function () {
                showList.style.display = "none";
                devMoreInfo.style.display = "none";
            }.bind(this));
        },
        /**
         * 鼠标移动到电网设备上，出现设备的列表
         */
        showDev: function() {
            var devList = dom.byId("devList");
            var moreInfoList = dom.byId("moreInfoList");

            devMoreInfo.style.display = "none";
            domConstruct.empty(moreInfoList);
            domConstruct.empty(devList);
            // debugger;
            for(var i = 0; i < this.dataList.length; i++) {
                var item = this.dataList[i];
                var li = domConstruct.create("li",{index:i, className:"showLi"},devList);
                var div = domConstruct.create("div",{index:i, className:"message", innerHTML: (i+1)+"."+item.attributes.NAME+"---"+item.layerName}, li);
                var btn = domConstruct.create("button",{index:i, className:"locationBtn", innerHTML:"定位"},li);
            }
        },

        isMessage: function(e) {
            if(e.target.className === "message"){
                this.showMoreInfo(e);
            }else {
                this.mscLocation(e);
            }
        },

        mscLocation: function(e) {
            var index = e.target.getAttribute("index");
            var geometry = this.dataList[index].geometry;
            var type = this.dataList[index].geometryType;
            
            var drawLayer = this.map.findLayerById("drawLayer");
            var point = new PointSymbol({
                color: "#FFFF00",
                radious: 5,
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

        /**
         * 添加图形到图层中
         */
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
        },
        /**
         * 点击设备列表中的选项，可以出现该设备的详细信息
         * @param e 
         */
        showMoreInfo: function(e) {
            var devMoreInfo = dom.byId("devMoreInfo");
            var index = e.target.getAttribute("index");
            var attrList = this.dataList[index].attributes;

            devMoreInfo.style.display = "block";
            devMoreInfo.style.zIndex = "500";
            domConstruct.empty(moreInfoList);
            this.createTable(attrList);
        },
        /**
         * 关闭按钮点击时，关闭设备详情信息框
         */
        closeMoreInfo:function() {
            devMoreInfo.style.display = "none";
        },
        /**
         * 创建表格的函数
         * @param attrList 需要展示的数据
         */
        createTable: function(attrList) {
            for(key in attrList) {
                if(key !== "SHAPE" && key !== "SUBGEOREGION" ){
                    var attrTr = domConstruct.create("tr",{
                        className:"attrTr"
                    }, moreInfoList);
                    var attrTd1 = domConstruct.create("td",{
                        className:"td1",
                        noWrap:"false",
                        innerHTML:key
                    }, attrTr);
                    var attrTd2 = domConstruct.create("td",{
                        className:"td2",
                        noWrap:"false",
                        innerHTML:attrList[key]
                    }, attrTr);
                }
            }
        }
    });
});