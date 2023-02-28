require({cache:{
'url:com/huayun/webgis/templates/boroughLocation.html':"<div>\r\n    <div class=\"boroughLocation-panel\">\r\n        <div class=\"boroughLocation-head\">\r\n            <span class=\"titleIcon\">行政区定位</span>\r\n            <span class=\"borough-clear-btn\" data-dojo-attach-point=\"clearNode\" data-dojo-attach-event=\"onclick:clear\">清除定位</span>\r\n        </div>\r\n        <div class=\"boroughLocation-content\">\r\n            <div id=\"${treeId}\"></div>\r\n        </div>\r\n    </div>\r\n</div>"}});
/**
 * @ Description: 行政区定位
 * @ module: BoroughLocation
 * @ Author: zy
 * @ Date: 2019/5/21
 */

define(
    "com/huayun/webgis/widget/BoroughLocation", [
        "dojo/_base/declare",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/topic",
        "dojo/_base/query",
        "com/huayun/facades/ConfigFacade",
        "dojo/store/Memory",
        "dijit/Tree",
        "dijit/tree/TreeStoreModel",
        "dijit/tree/ObjectStoreModel",
        "dojo/data/ItemFileReadStore",
        "./MapModuleX",
        "./LocatingController",
        "../geometry/Polyline",
        "../symbols/LineSymbol",
        "../Feature",
        "../Graphic",
        "../../webgis/geometry/Extent",
        "../../webgis/geometry/Point2D",
        "dojo/text!../templates/boroughLocation.html"
    ], function (declare, domClass, domConstruct, topic, query, ConfigFacade, Memory, Tree, TreeStoreModel, ObjectStoreModel, ItemFileReadStore,
                 MapModuleX, LocatingController, Polyline, LineSymbol, Feature, Graphic, Extent, Point, template) {
        return declare("com.huayun.webgis.widget.BoroughLocation", [MapModuleX], {
            view: null,
            localTool: null,
            templateString: template,//本组件的template
            name: "行政区定位",
            PARENT_CODE: "330000000000",//初始浙江省
            baseClass: "boroughLocation",
            btnId: "boroughLocation-btn",
            btnClass: "boroughLocation-btn",
            treeId: "boroughTree",
            btnText: "行政区定位",
            width: "400px",
            height: "800px",
            drawLayer: null,
            _lineSymbol: null,
            _feature: null,
            _currentGraphic: null,
            _geometry: null,

            constructor: function () {
                this.maxLevel = 15;
            },

            _getList: function (url) {
                var self = this;
                this.inherited(arguments);
                //this.lineMaterial = new THREE.LineBasicMaterial(this.lineMeshOption);
                this.configFacade = new ConfigFacade();
                //this.url + "?PARENT_CODE=" + this.PARENT_CODE
                this.configFacade.getZoneSelect(url, function (resp) {
                    if (resp.resultState == "0000") {
                        var boroughStore = resp.data;
                        var _treeStore = new Memory({//创建store
                            data: boroughStore,
                            idProperty: "CODE",
                            getChildren: function (object) {
                                return this.query({PARENT_CODE: object.CODE});
                            }
                        });
                        var _treeModel = new ObjectStoreModel({//创建model
                            store: _treeStore,
                            query: {FID: 1345},
                            labelAttr: "NAME",//节点标签显示字段
                            typeAttr: ""
                        });
                        //判断是否有子节点
                        _treeModel.mayHaveChildren = function (item) {
                            if (item.root) {
                                return true;
                            } else {
                                if (_treeModel.store.query({PARENT_CODE: item.CODE}).total === 0) {
                                    return false;
                                } else {
                                    return true;
                                }
                            }
                        };
                        var _tree = new Tree({
                            id: "boroughTree",
                            model: _treeModel,
                            showRoot: true,//显示根节点
                            openOnClick: false,//单击展开
                            openOnDblClick: true,//双击展开
                            autoExpand: false,//自动展开所有节点
                            persist: true//记住上次打开的状态
                        }, self.treeId);

                        _tree.startup();
                        _tree.on("click", function (object) {
                            this._onExpandoClick({node: _tree.get("selectedNodes")[0]});
                            var allPath = self.geoTransform(object["SHAPE"]);
                            self._drawPath(allPath);
                        });
                    }
                }, function (err) {
                    console.log(err);
                });
            },
            _getMinRange: function (geoX_arr, geoY_arr) {/*根据地理坐标集合获取视线可视范围内的最小坐标边界点*/
                var min_geoX = Math.min.apply(null, geoX_arr),
                    max_geoX = Math.max.apply(null, geoX_arr),
                    min_geoY = Math.min.apply(null, geoY_arr),
                    max_geoY = Math.max.apply(null, geoY_arr);
                var extend = new Extent(min_geoX, min_geoY, max_geoX, max_geoY);
                this.view.setExtent(extend);
            },
            _drawPath: function (allPath) {/*画行政区域范围线*/
                if (!this.drawLayer) {
                    this.drawLayer = this.view.map.findLayerById("drawLayer");
                }

                if (allPath.length === 0) return;
                this.drawLayer.clear();
                var allLinePath = [], geoX_arr = [], geoY_arr = [];
                allPath.forEach(function (item) {
                    var theLine = [];
                    for (var i = 0; i < item.length; i++) {
                        var coordinate = item[i];
                        geoX_arr.push(coordinate.x);
                        geoY_arr.push(coordinate.y);
                        theLine.push(new Point(coordinate.x, coordinate.y));
                    }
                    allLinePath.push(theLine);
                });
                this._geometry.setPath(allLinePath);
                this.drawLayer.addGraphic(this._currentGraphic);
                this._getMinRange(geoX_arr, geoY_arr);
            },
            doInit: function () {
                this._getList(this.get("url"));
                // this.map = this.get("map");
                this.view = this.get("view");
                this.maxLevel = this.view.maxLevel;

                this.localTool = new LocatingController();

                this._lineSymbol = new LineSymbol({
                    color: "#11ff6b",
                    width: 2,
                    join: "round",
                    cap: "round"
                });

                this._geometry = new Polyline();

                this._feature = new Feature({
                    attribute: null,
                    geometry: this._geometry
                });

                this._currentGraphic = new Graphic({
                    feature: this._feature,
                    symbol: this._lineSymbol
                });
            },

            geoTransform: function (geoStr) {
                var geoJson = {};
                var geoStr = geoStr.toLocaleUpperCase();
                if (geoStr.startsWith("MULTIPOLYGON")) { //多边形
                    geoJson["type"] = "MULTIPOLYGON";
                    var reg = /\({2}(\d+\.?\d+\s+\d+\d+\.\d+,?)+\){2}/g;
                    var polygonList = geoStr.match(reg);
                    var polygonReg = /(\d+\.?\d+\s+\d+\d+)/g;
                    var allPath = [];
                    polygonList.forEach(function (item) {
                        var oneLinePath = item.match(polygonReg);
                        var linePathArr = [];
                        for (var i = 0; i < oneLinePath.length; i++) {
                            var oneLinePathArr = oneLinePath[i].split(" ");
                            linePathArr.push({x: Number(oneLinePathArr[0]), y: Number(oneLinePathArr[1])});
                        }
                        allPath.push(linePathArr);
                    });
                }
                return allPath;
            },
            clear: function () {
                this.drawLayer.removeGraphic(this._currentGraphic);
            }
        });
    }
);