/**
 * 路径规划搜索
 */
define("com/huayun/webgis/widget/searchs/PathPlanningSearch", [
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-style",
    "dijit/focus",
    "../../geometry/Extent",
    "../../geometry/Polyline",
    "../../geometry/Point2D",
    "../../Graphic",
    "../../Feature",
    "../../symbols/LineSymbol",
    "../../symbols/ImageSymbol",
    "../../../util/HashTable",
    "../../../facades/AgsFacade",
    "../MapModuleX",
    "dojo/text!../../templates/searchs/path-planning-search.html"
], function (declare, domConstruct, domClass, domStyle, focusUtil, Extent, Polyline, Point2D, Graphic, Feature, LineSymbol, ImageSymbol, HashTable, AgsFacade, MapModuleX, template) {
    return declare("com.huayun.webgis.widget.searchs.PathPlanningSearch", [MapModuleX], {
        templateString: template,
        baseClass: "pathSearch",
        agsUrl: "",
        _regPoint: /(\d+\.*\d*)\s+(\d+\.*\d*)/,
        _regString: /(\d+\.*\d*)\s+(\d+\.*\d*)/g,

        postCreate: function () {
            this.inherited(arguments);
            this._agsFacade = new AgsFacade();
            this._searchPathData = {};
            this._lastStartPath = "";
            this._lastEndPath = "";
            this._curNode = null;
            this._lastNodeValue = "";
            this._endInputFlag = false;
        },

        doInit: function () {
            this.view = this.get("view");

            this.changeMethod = null;
            this._lineSymbol = new LineSymbol({
                color: "#11ff6b",
                width: 3
            });
            this._startSymbol = new ImageSymbol({
                url: require.toUrl("com/huayun/webgis/css/images/blue.png"),
                width: 21,
                height: 33
            });
            this._endSymbol = new ImageSymbol({
                url: require.toUrl("com/huayun/webgis/css/images/red.png"),
                width: 21,
                height: 33
            });
        },

        onChange2Name:function(){
            domClass.add(this.domNode, "hidden");
            this.changeMethod && this.changeMethod();
        },

        focusHandle: function (evt) {
            evt.target.focus();
            this._curNode = focusUtil.curNode;
        },
        compositionstartHandler: function () {
            this._endInputFlag = false;
            this._lastNodeValue = focusUtil.curNode.value;
        },
        compositionendHandler: function () {
            this._endInputFlag = true;
            this._curNode = focusUtil.curNode;

            if (this._lastNodeValue !== focusUtil.curNode.value) {
                this._getInterestPlaceData(focusUtil.curNode.value, function (resp) {
                    this._showSelectList(resp.detail);
                }.bind(this));
            } else {
                console.log("无需请求");
            }

        },

        onKeyDown: function (evt) {
            console.log("onKeyDown:",evt.code);
        },

        onKeyUp: function (evt) {
            console.log(evt.code);
            switch (evt.code) {
                case "Backspace":
                case "Delete":
                    if (this._endInputFlag) {
                        this._curNode = focusUtil.curNode;
                        this._getInterestPlaceData(focusUtil.curNode.value, function (resp) {
                            this._showSelectList(resp.detail);
                        }.bind(this));
                    }
                    break;
            }
        },
        /**
         * 选择起始地址
         * @param evt
         */
        selectItem: function (evt) {
            if (domClass.contains(this._curNode, "startVal")) {
                this._searchPathData.startCenterPoint = evt.target.getAttribute("data-path-center-point");
            } else if (domClass.contains(this._curNode, "endVal")) {
                this._searchPathData.endCenterPoint = evt.target.getAttribute("data-path-center-point");
            }
            this._curNode.value = evt.target.innerText;
            domClass.add(this.addressNode, "hidden");
        },
        _showSelectList: function (list) {
            if (typeof list === "undefined" || list === null) {
                domClass.add(this.addressNode, "hidden");
                domConstruct.empty(this.addressListNode);
                return;
            }
            domConstruct.empty(this.addressListNode);
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                domConstruct.create("li", {
                    class: "path-planning-search",
                    innerHTML: item.name,
                    "data-path-center-point": item.centerPoint
                }, this.addressListNode);
            }
            domClass.remove(this.addressNode, "hidden");
        },
        /**
         *  获取感兴趣地址数据
         * @param keyWord
         * @param callback
         * @private
         */
        _getInterestPlaceData: function (keyWord, callback) {
            keyWord = keyWord.replace(/\s+/g, "");
            if (keyWord === "" || keyWord === null) return;
            var data = {
                words: keyWord,
                cityCode: "",
                num: 10/*默认获取兴趣地址的条数*/
            };
            this._agsFacade.getInterestPlaceData(this.agsUrl, data, function (resp) {
                callback(resp);
            }.bind(this), function (err) {
                console.log(err);
            });
        },
        /**
         * 切换起始点
         */
        changeCost: function () {
            var tempVal = this.startZoneNode.value;
            this.startZoneNode.value = this.endZoneNode.value;
            this.endZoneNode.value = tempVal;

            var tempCenterPoint = this._searchPathData.startCenterPoint;
            this._searchPathData.startCenterPoint = this._searchPathData.endCenterPoint;
            this._searchPathData.endCenterPoint = tempCenterPoint;
        },
        /**
         * 搜索路径
         */
        searchPath: function () {
            if (this.endZoneNode.value.length > 0 && this.startZoneNode.value.length > 0) {
                if (this._lastStartPath !== this.startZoneNode.value || this._lastEndPath !== this.endZoneNode.value) {
                    var startX = this._searchPathData.startCenterPoint.match(this._regPoint)[1];
                    var startY = this._searchPathData.startCenterPoint.match(this._regPoint)[2];
                    var endX = this._searchPathData.endCenterPoint.match(this._regPoint)[1];
                    var endY = this._searchPathData.endCenterPoint.match(this._regPoint)[2];
                    var stopsValue = startX + "," + startY + ";" + endX + "," + endY;

                    this._agsFacade.getCostPath({url: this.agsUrl, stops: stopsValue}, function (resp) {
                        if (resp.code === "1000") {
                            this._drawPath(resp.detail);
                        }
                    }.bind(this), function (error) {
                        console.error(error.message);
                    });
                    this._lastStartPath = this.startZoneNode.value;
                    this._lastEndPath = this.endZoneNode.value;
                } else {
                    // console.log("相同");
                }
            } else {
                alert("地址不能为空");
            }
        },
        _drawPath: function (paths) {
            if (!this.drawLayer) {
                this.drawLayer = this.view.map.findLayerById("drawLayer");
            }
            this.drawLayer.clear();
            var len = paths.length;
            var allLinePath = [];
            if (len < 2) {
                return;
            }

            var startGeom = paths[0].geom;
            var startLineArr = startGeom.match(this._regString);
            var startPoint = startLineArr[startLineArr.length - 1].match(this._regPoint);
            startPoint = [Number(startPoint[1]), Number(startPoint[2])];

            var endGeom = paths[len-1].geom;
            var endLineArr = endGeom.match(this._regString);
            var endPoint = endLineArr[endLineArr.length-1].match(this._regPoint);
            endPoint = [Number(endPoint[1]), Number(endPoint[2])];

            for (var i = 0; i < len; i++) {
                var tempGeom = paths[i].geom;
                var tempLineArr = tempGeom.match(this._regString);
                var theLinePath = [];
                for (var j = 0; j < tempLineArr.length; j++) {
                    var tempPoint = tempLineArr[j].match(this._regPoint);
                    var geoX = tempPoint[1];
                    var geoY = tempPoint[2];
                    theLinePath.push({x: geoX, y: geoY, z: 0});
                }
                allLinePath.push(theLinePath);
            }
            var geometry = new Polyline(allLinePath);
            var feature = new Feature({
                attribute: null,
                geometry: geometry
            });
            this._currentGraphic = new Graphic({
                feature: feature,
                symbol: this._lineSymbol
            });
            this.drawLayer.addGraphic(this._currentGraphic);

            var startGeo = new Point2D(startPoint[0], startPoint[1]);
            var startFeature = new Feature({
                attribute: null,
                geometry: startGeo
            });
            var startGraphic = new Graphic({
                feature: startFeature,
                symbol: this._startSymbol
            });
            this.drawLayer.addGraphic(startGraphic);

            var endGeo = new Point2D(endPoint[0], endPoint[1]);
            var endFeature = new Feature({
                attribute: null,
                geometry: endGeo
            });
            var endGraphic = new Graphic({
                feature: endFeature,
                symbol: this._endSymbol
            });
            this.drawLayer.addGraphic(endGraphic);
            this._setNewExtent(paths);
        },
        /**
         * 设置新的范围
         * @param paths
         * @returns {{x: number, y: number}}
         * @private
         */
        _setNewExtent: function (paths) {
            var len = paths.length;
            var allGeoXList = [];
            var allGeoYList = [];
            for (var i = 0; i < len; i++) {
                var tempGeom = paths[i].geom;
                var tempLineArr = tempGeom.match(this._regString);
                for (var j = 0; j < tempLineArr.length; j++) {
                    var tempPoint = tempLineArr[j].match(this._regPoint);
                    var geoX = tempPoint[1];
                    var geoY = tempPoint[2];
                    allGeoXList.push(geoX);
                    allGeoYList.push(geoY);
                }
            }
            allGeoXList.sort();
            allGeoYList.sort();
            var minX = Number(allGeoXList[0]);
            var maxX = Number(allGeoXList[allGeoXList.length - 1]);
            var minY = Number(allGeoYList[0]);
            var maxY = Number(allGeoYList[allGeoXList.length - 1]);
            var centerPoint = {
                x: (minX + maxX) / 2,
                y: (minY + maxY) / 2
            };
            var newExtent = new Extent(minX, minY, maxX, maxY);
            this.view.setExtent(newExtent);
            return centerPoint;
        },

        getStartCost: function () {
            this.zoneNode = "startZoneNode";
            this.getZoneFlag = true;
            domStyle.set(this.view.domNode, "cursor", "url(../dojo/com/huayun/webgis/css/images/AGS/signred.png) 12 12 ,crosshair");
            this.hideCostContainer();
            this.startZoneNode.value = "";
            startZone = null;
        },
        getEndCost: function () {
            this.zoneNode = "endZoneNode";
            this.getZoneFlag = true;
            domStyle.set(this.view.domNode, "cursor", "url(../dojo/com/huayun/webgis/css/images/AGS/signred.png) 12 12 ,crosshair");
            this.hideCostContainer();
            this.endZoneNode.value = "";
            endZone = null;
        },
        getCostNameByPoint: function (positionToGeometry) {
            if (!this.getZoneFlag) return;
            var x = positionToGeometry.x, y = positionToGeometry.y;
            var point = x + "," + y;
            var data = {
                point: point,
                tolerance: 100,
                num: 1
            };
            var _self = this;
            this.getZoneFlag = false;
            this.configFacade.getAddressAround(this.url + "ags/findAround", data, function (resp) {
                if (resp.code === "1000") {
                    var detail = resp.detail[0];
                    if (_self.zoneNode == "startZoneNode") {
                        startZone = detail;
                        _self.startZoneNode.value = startZone.name;
                        _self.startCostNode.innerHTML = startZone.name;
                    }
                    if (_self.zoneNode == "endZoneNode") {
                        endZone = detail;
                        _self.endZoneNode.value = endZone.name;
                        _self.endCostNode.innerHTML = endZone.name;
                    }
                } else {
                    alert(resp.info);
                }
            }, function (err) {
                console.log(err);
            });
        },
        selectSeaTab: function () {//选择搜索兴趣地点切换框
            domClass.add(this.seaBtnNode, "myselect");
            domClass.remove(this.pathBtnNode, "myselect");
            domClass.remove(this.seaTabNode, "hidden");
            domClass.add(this.pathTabNode, "hidden");

            if (this.zoneListNode.innerHTML != "") {
                this.zoneListNode.innerHTML = "";
                domClass.add(this.pageContainerNode, "hidden");
            }
        },
        selectPathTab: function () {//选择最佳路径切换框
            domClass.remove(this.seaBtnNode, "myselect");
            domClass.add(this.pathBtnNode, "myselect");
            domClass.add(this.seaTabNode, "hidden");
            domClass.remove(this.pathTabNode, "hidden");
        },
        zoneInit: function () {
            this.cnameNode.value = "";
            this.startZoneNode.value = "";
            this.endZoneNode.value = "";
            this.zoneListNode.innerHTML = "";
            domClass.add(this.pageContainerNode, "hidden");
            domClass.add(this.totalCostNode, "hidden");
            domClass.add(this.startCostNode, "hidden");
            domClass.add(this.costListNode, "hidden");
            domClass.add(this.addrListNode, "hidden");
            domClass.add(this.endCostNode, "hidden");
        }
    });
});