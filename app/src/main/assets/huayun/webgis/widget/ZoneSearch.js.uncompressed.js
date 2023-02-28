require({cache:{
'url:com/huayun/webgis/templates/zoneSearch.html':"<div data-dojo-attach-point =\"pathContainerNode\">\r\n    <div class=\"searchTop\">\r\n        <span class=\"titleIcon\">位置搜索</span>\r\n        <button class=\"closeIcon\" data-dojo-attach-event=\"onclick:closeSearchDialog\"></button>\r\n    </div>\r\n    <div class=\"navs\">\r\n        <span class=\"tabGap\"></span>\r\n        <span class=\"tabBtn myselect\" data-dojo-attach-point =\"seaBtnNode\" data-dojo-attach-event=\"onclick:selectSeaTab\">搜索</span>\r\n        <span class=\"tabBtn\" data-dojo-attach-point=\"pathBtnNode\" data-dojo-attach-event=\"onclick:selectPathTab\">路径</span>\r\n    </div>\r\n    <div class=\"tabBtmLine\"></div>\r\n    <div data-dojo-type=\"dijit/layout/ContentPane\" class=\"tabContainer\" data-dojo-attach-point=\"seaTabNode\" style=\"height: 580px;width:400px;\">\r\n        <div class=\"typeBtn\">\r\n            <div data-dojo-attach-point=\"zoneSelect\" style=\"display: inline-block;\"></div>\r\n            <input type=\"text\" data-dojo-attach-point=\"cnameNode\" data-dojo-attach-event=\"onclick:focusHandle\" class=\"cname\"/>\r\n            <button  class=\"searchBtn\" data-dojo-attach-event=\"onclick:searchKeyZone\">搜索</button>\r\n        </div>\r\n        <div class=\"zoneContainer\">\r\n            <ul data-dojo-attach-point=\"zoneListNode\" data-dojo-attach-event=\"onclick:zoneListClick\"></ul>\r\n            <div class=\"pageBtn hidden\" data-dojo-attach-point =\"pageContainerNode\">\r\n                <button data-dojo-attach-event=\"onclick:prevPage\" class=\"prePage\"></button>\r\n                <button data-dojo-attach-event=\"onclick:nextPage\" class=\"nextPage\"></button>\r\n            </div>\r\n        </div>\r\n    </div><!--应用模块结束-->\r\n    <div data-dojo-type=\"dijit/layout/ContentPane\" class=\"tabContainer hidden\" data-dojo-attach-point=\"pathTabNode\" style=\"height: 580px;width:400px;\">\r\n        <div class=\"costWrap\">\r\n            <span class=\"changeBtn\" data-dojo-attach-event=\"onclick:changeCost\"></span>\r\n            <div class=\"tabCenter\">\r\n                <div>\r\n                    <input type=\"text\" class=\"cname startVal\" data-dojo-attach-point=\"startZoneNode\" data-dojo-attach-event=\"onclick:focusHandle\"/>\r\n                    <span data-dojo-attach-event=\"onclick:getStartCost\"></span>\r\n                </div>\r\n                <hr style=\"width:100%;border-color:#eee;\"/>\r\n                <div>\r\n                    <input type=\"text\" class=\"cname endVal\"  data-dojo-attach-point=\"endZoneNode\" data-dojo-attach-event=\"onclick:focusHandle\"/>\r\n                    <span data-dojo-attach-event=\"onclick:getEndCost\"></span>\r\n                </div>\r\n            </div>\r\n            <button class=\"searchCost\" data-dojo-attach-event=\"onclick:searchPath\"></button>\r\n        </div>\r\n        <div class=\"pathTab\">\r\n            <div data-dojo-attach-point=\"totalCostNode\"   class=\"hidden total-cost\"></div>\r\n            <div data-dojo-attach-point=\"startCostNode\" class=\"hidden cost-title start-cost\"></div>\r\n            <table data-dojo-attach-point=\"costListNode\" class=\"costList hidden\"></table>\r\n            <table data-dojo-attach-point=\"addrListNode\" data-dojo-attach-event=\"onclick:getSelectCost\" class=\"costList hidden\"></table>\r\n            <div data-dojo-attach-point=\"endCostNode\" class=\"hidden cost-title end-cost\"></div>\r\n        </div>\r\n    </div><!--服务结束-->\r\n</div>\r\n"}});
/**
 * 地名搜索组件
 */
define("com/huayun/webgis/widget/ZoneSearch", [
    "dojo/_base/declare",
    "dojo/parser",
    "dojo/topic",
    "dijit/registry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dijit/form/Select",
    "dojo/store/Memory",
    "dojo/data/ObjectStore",
    "com/huayun/facades/ConfigFacade",
    "./MapModuleX",
    "../geometry/MapPoint",
    "../Feature",
    "../Graphic",
    "dojo/text!../templates/zoneSearch.html"
], function (declare, parser, topic, registry, domClass, domStyle, Select, Memory, ObjectStore, ConfigFacade, MapModuleX, MapPoint,
             Feature, Graphic, template) {
    return declare("com.huayun.webgis.widget.ZoneSearch", [MapModuleX], {
        templateString: template,
        url: "http://ags.prod.cloud.zj.sgcc.com.cn/",
        endPageNumber: 5,
        startPageNumber: 0,
        aplock: false,
        zoneNode: null,
        map: null,
        getZoneFlag: false,/*不是每次按地图都触发此事件*/
        postCreate: function () {
            this.inherited(arguments);
            this.configFacade = new ConfigFacade();
            zoneSelect = new Select({
                name: "zoneName",
                style: "width:100px;height: 28px;margin-left:2px;"
            }, this.zoneSelect);
            zoneSelect.startup();
            this.configFacade.getZoneSelect(this.url + "ags/getCityCode", function (resp) {
                if (resp.code === "1000") {
                    var addressList = resp.detail;
                    var store = new Memory({
                        idProperty: "cityCode",
                        data: addressList
                    });
                    var os = new ObjectStore({objectStore: store, labelProperty: "name"});
                    zoneSelect.setStore(os);
                }
            }, function (err) {
                console.log(err);
            });
        },

        doInit: function () {
            this.map = this.get("map");
            this.map._onClick = function (e) {
                var clientX = e.clientX, clientY = e.clientY;
                var screenPoint = {x: clientX, y: clientY};
                var screenToPosition = this.map.screenToPosition(screenPoint);
                var positionToGeometry = this.map.positionToGeometry(screenToPosition);
                this.getCostNameByPoint(positionToGeometry);
            }.bind(this);
            this.bindChange();
        },
        focusHandle: function (e) {
            var e = e ? e : window.event, target = e.target;
            target.focus();
        },
        closeSearchDialog: function () {
            var temp = this.context.lookUp("searchContainer");
            temp.hide();
            this.zoneInit();/*初始化*/
        },
        hideCostContainer: function () {
            domClass.add(this.costListNode, "hidden");
            domClass.add(this.totalCostNode, "hidden");
            domClass.add(this.startCostNode, "hidden");
            domClass.add(this.endCostNode, "hidden");
        },
        showCostContainer: function () {
            domClass.remove(this.costListNode, "hidden");
            domClass.remove(this.totalCostNode, "hidden");
            domClass.remove(this.startCostNode, "hidden");
            domClass.remove(this.endCostNode, "hidden");
        },
        showSelectAddress: function () {
            domClass.remove(this.addrListNode, "hidden");
        },
        hideSelectAddress: function () {
            domClass.add(this.addrListNode, "hidden");
        },
        showSelectList: function (selcetList, zoneNode) {
            this.zoneNode = zoneNode;
            this.addrListNode.innerHTML = "";
            if (selcetList == undefined || selcetList == null) return;
            for (var i = 0; i < selcetList.length; i++) {
                var list = selcetList[i];
                var tr = document.createElement("tr");
                tr.setAttribute("data-obj", JSON.stringify(list));
                var nameTd = document.createElement("td");
                nameTd.innerHTML = list.name;
                nameTd.setAttribute("data-obj", JSON.stringify(list));
                var addressTd = document.createElement("td");
                addressTd.innerHTML = list.address;
                addressTd.setAttribute("data-obj", JSON.stringify(list));
                tr.appendChild(nameTd);
                tr.appendChild(addressTd);
                this.addrListNode.appendChild(tr);
            }
        },
        getSelectCost: function (e) {
            var e = e ? e : window.event, target = e.target, type = target.getAttribute("data-obj");
            var selectAddress = JSON.parse(type);
            if (this.zoneNode == "startZoneNode") {
                startZone = selectAddress;
                this.startZoneNode.value = startZone.name;
            } else if (this.zoneNode == "endZoneNode") {
                endZone = selectAddress;
                this.endZoneNode.value = endZone.name;
            }
            this.hideSelectAddress();
        },
        bindChange: function () {
            var self = this;
            /*以下是开始地点输入框事件*/
            this.startZoneNode.oncompositionstart = function () {
                this.aplock = true;
            }.bind(this);
            this.startZoneNode.oncompositionend = function () {
                this.aplock = false;
            }.bind(this);
            this.startZoneNode.oninput = function () {
                if (!this.aplock) {
                    startZone = null;/*每次重新改变地址  初始化该值*/
                    this.hideCostContainer();
                    var startPathVal = this.startZoneNode.value;
                    startPathVal = startPathVal.replace(/\s+/g, "");
                    if (startPathVal === "" || startPathVal === null) return;
                    var data = {
                        words: startPathVal,
                        citycode: "",
                        num: 20/*默认获取兴趣地址的条数*/
                    };
                    this.configFacade.getInterestPlace(this.url + "ags/findAddress", data, function (resp) {
                        if (resp.code === "1000") {
                            self.showSelectAddress();
                            var startAddressList = resp.detail;
                            self.showSelectList(startAddressList, "startZoneNode");
                        } else {
                            self.hideSelectAddress();
                        }
                    }, function (err) {
                        console.log(err);
                    });
                }
            }.bind(this);

            /*以下是结束地点输入框事件*/
            this.endZoneNode.oncompositionstart = function () {
                this.aplock = true;
            };
            this.endZoneNode.oncompositionend = function () {
                this.aplock = false;
            };
            this.endZoneNode.oninput = function () {
                if (!self.aplock) {
                    endZone = null;/*每次重新改变地址  初始化该值*/
                    self.hideCostContainer();
                    var endPathVal = self.endZoneNode.value;
                    endPathVal = endPathVal.replace(/\s+/g, "");
                    if (endPathVal === "" || endPathVal == null) return;
                    var data = {
                        words: endPathVal,
                        citycode: "",
                        num: 20/*默认获取兴趣地址的条数*/
                    };
                    self.configFacade.getInterestPlace(self.url + "ags/findAddress", data, function (resp) {
                        if (resp.code === "1000") {
                            self.showSelectAddress();
                            var startAddressList = resp.detail;
                            self.showSelectList(startAddressList, "endZoneNode");
                        } else {
                            self.hideSelectAddress();
                        }
                    }, function (err) {
                        console.log(err);
                    });
                }
            };
        },
        addressHandle: function (addressList) {/*渲染兴趣地址*/
            this.zoneListNode.innerHTML = "";
            if (addressList == null) return;
            var index = 0;
            for (var i = this.startPageNumber; i < this.endPageNumber; i++) {
                index = index + 1;
                var address = addressList[i].address;
                var name = addressList[i].name;
                var point = JSON.stringify(addressList[i]);
                var li = document.createElement("li");
                var zoneIcon = document.createElement("strong");
                zoneIcon.className = "zoneIcon";
                zoneIcon.innerHTML = index;
                var span = document.createElement("span");
                span.innerHTML = name;
                var p = document.createElement("p");
                p.innerHTML = address;
                var div = document.createElement("div");
                var startButton = document.createElement("button");
                startButton.className = "start";
                startButton.setAttribute("data-point", point);
                var endButton = document.createElement("button");
                endButton.className = "end";
                endButton.setAttribute("data-point", point);
                div.appendChild(startButton);
                div.appendChild(endButton);

                li.appendChild(zoneIcon);
                li.appendChild(span);
                li.appendChild(p);
                li.appendChild(div);
                this.zoneListNode.appendChild(li);
            }
        },
        getCenterPoint: function (pointsArr) {
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
            return centerPoint;
        },
        getPointData: function (addressList) {
            /* var geoJson = {coordinates:[],type:"MULTIPOINT"};
             for(var i = this.startPageNumber; i <  this.endPageNumber; i++){
                 var geoStr = addressList[i].centerPoint;
                 var startIdx = geoStr.indexOf("(");
                 var endIdx = geoStr.indexOf(")");
                 var multipointStr = geoStr.slice(startIdx + 1, endIdx);
                 geoJson["coordinates"].push(multipointStr.split(" "));
             }

             //this.map.locatePoint(centerPoint);
             var centerPoint = this.getCenterPoint(geoJson.coordinates);//中间点坐标
             this.map.centerAt(centerPoint);
             var self = this;
             geoJson.coordinates.forEach(function (item) {
                 var p = self.map.geometryTo3D({x: item[0], y: item[1]});
                 topic.publish("mapDrawDot", {x: p.x, y: p.y});
             });

             console.log(geoJson);*/
        },
        searchKeyZone: function () {//根據市地区获取兴趣地址
            var words = this.cnameNode.value;
            if (words === "" || words == null) {
                alert("请输入地址");
            } else {
                var cityCode = zoneSelect.getValue();
                var data = {
                    words: words,
                    citycode: cityCode,
                    num: 20/*默认获取兴趣地址的条数*/
                };
                var _self = this;
                this.configFacade.getInterestPlace(this.url + "ags/findAddress", data, function (resp) {
                    if (resp.code === "1000") {
                        _self.startPageNumber = 0;
                        _self.endPageNumber = 5;
                        addressList = resp.detail;
                        domClass.remove(_self.pageContainerNode, "hidden");
                        if (addressList.length <= _self.endPageNumber) {
                            _self.endPageNumber = addressList.length;
                        }
                        _self.addressHandle(addressList);
                        // _self.getPointData(addressList);
                    } else {
                        alert(resp.info);
                    }
                }, function (err) {
                    console.log(err);
                });
            }
        },
        prevPage: function () {
            if (this.startPageNumber === 0) return;
            this.endPageNumber = this.startPageNumber;
            this.startPageNumber = this.endPageNumber - 5;
            if (this.startPageNumber < 0) {
                this.startPageNumber = 0;
            }
            this.addressHandle(addressList);
        },
        nextPage: function () {
            if (this.endPageNumber === addressList.length) return;
            this.startPageNumber = this.endPageNumber;
            this.endPageNumber = this.endPageNumber + 5;
            if (this.endPageNumber > addressList.length) {
                this.endPageNumber = addressList.length;
            }
            this.addressHandle(addressList);
        },
        zoneListClick: function (e) {
            e = e ? e : window.event, target = e.target, type = target.className;
            var _self = this;

            var toggleSeaTab = function () {
                domClass.remove(_self.seaBtnNode, "myselect");
                domClass.add(_self.pathBtnNode, "myselect");
                domClass.add(_self.seaTabNode, "hidden");
                domClass.remove(_self.pathTabNode, "hidden");
                _self.hideCostContainer();
            };

            /*var pathHandle = function(target,type){
                var pointString = target.getAttribute("data-point");
                if(type == "start"){
                   startZone = JSON.parse(pointString);
                    _self.startZoneNode.value = startZone.name;
                }else{
                    endZone = JSON.parse(pointString);
                    _self.endZoneNode.value = endZone.name;
                }
            };*/

            switch (type) {
                case "start":
                    toggleSeaTab();
                    // pathHandle(target,type);
                    this.paintStart(target);
                    break;
                case "end":
                    toggleSeaTab();
                    // pathHandle(target,type);
                    this.paintEnd(target);
                    break;
            }
        },
        paintStart: function (target) {
            var pointString = target.getAttribute("data-point");
            startZone = JSON.parse(pointString);
            this.startZoneNode.value = startZone.name;
            var point = startZone.centerPoint;
            var start = point.indexOf("("),
                middle = point.indexOf(" ", start),
                end = point.indexOf(")");
            var x = point.substring(start + 1, middle),
                y = point.substring(middle + 1, end);
            var graphic = this.map.findLayerById("drawLayer");
            /*graphic.dotSymbol = new ImageSceneSymbol({
                imageUrl: "images/qi.png",
                vertical: true
            });*/
            graphic.dotSymbol.imageUrl = "images/qi.png";
            graphic.dotSymbol.vertical = true;
            graphic.dotSymbol.loaded = false;
            graphic.dotSymbol.color = null;
            this.map.locatePoint(new MapPoint(x * 1, y * 1));
        },
        paintEnd: function (target) {
            var pointString = target.getAttribute("data-point");
            endZone = JSON.parse(pointString);
            this.endZoneNode.value = endZone.name;
            var point = endZone.centerPoint;
            var start = point.indexOf("("),
                middle = point.indexOf(" ", start),
                end = point.indexOf(")");
            var x = point.substring(start + 1, middle),
                y = point.substring(middle + 1, end);
            var graphic = this.map.findLayerById("drawLayer");
            /*graphic.dotSymbol = new ImageSceneSymbol({
                imageUrl: "images/zhong.png",
                vertical: true
            });*/
            graphic.dotSymbol.imageUrl = "images/zhong.png";
            graphic.dotSymbol.vertical = true;
            graphic.dotSymbol.loaded = false;
            graphic.dotSymbol.color = null;
            var p = this.map.geometryTo3D(new MapPoint(x, y));
            topic.publish("mapDrawDot", {x: p.x, y: p.y});
        },
        changeCost: function () {
            var startVal = this.startZoneNode.value;
            var endVal = this.endZoneNode.value;
            this.endZoneNode.value = startVal;
            this.startZoneNode.value = endVal;
            var start = startZone;
            startZone = endZone;
            endZone = start;
            this.searchPath();
        },
        costHandle: function (list, totalCost) {
            this.costListNode.innerHTML = "";
            if (list == null || list.length == 0) return;
            for (var i = 0; i < list.length; i++) {
                var cost = Math.floor(parseInt(list[i].cost));
                var tr = document.createElement("tr");
                var indexTd = document.createElement("td");
                indexTd.innerText = i + 1;
                var nameTd = document.createElement("td");
                nameTd.innerText = list[i].name;
                var pathTd = document.createElement("td");
                pathTd.innerText = list[i].direction;
                var costTd = document.createElement("td");
                costTd.innerText = cost + "米";

                tr.appendChild(indexTd);
                tr.appendChild(nameTd);
                tr.appendChild(pathTd);
                tr.appendChild(costTd);
                this.costListNode.appendChild(tr);
            }
            this.totalCostNode.innerHTML = "总路程: " + Math.floor(totalCost) + " 米";
            domClass.remove(this.totalCostNode, "hidden");
        },
        searchPath: function () {
            var _self = this;
            var startVal = this.startZoneNode.value, endVal = this.endZoneNode.value;
            if (startVal == "" || endVal == "") return;
            if (startZone == null || endZone == null) {
                alert("请输入有效地址");
                return;
            }
            var pointStart = startZone.centerPoint, pointEnd = endZone.centerPoint;
            var start = pointStart.slice(7, pointStart.length - 1).replace(/\ /g, ",");
            var end = pointEnd.slice(7, pointStart.length - 1).replace(/\ /g, ",");
            var stops = start + ";" + end;
            this.hideCostContainer();
            this.configFacade.getCostPath(this.url + "ags/findShortPath?stops=" + stops, function (resp) {
                if (resp.code === "1000") {
                    var totalCost = resp.totalcost;
                    var costList = resp.detail;
                    _self.showCostContainer();
                    _self.startCostNode.innerHTML = startZone.name;
                    _self.endCostNode.innerHTML = endZone.name;
                    _self.costHandle(costList, totalCost);
                    _self.drawPath(costList);
                } else {
                    alert(resp.info);
                }
            }, function (err) {
                console.log(err);
            });
        },
        drawPath: function (paths) {
            // console.log(paths);
            var item, len = paths.length, geom, xystr, x, y, lineItem;
            var layer = this.map.findLayerById("drawLayer");
            var lineSymbol = layer.lineSymbol;
            var linePoints = [];
            var count;
            var objPoint;
            var lineArrays = [];
            for (var i = 0; i < len; i++) {
                item = paths[i];
                linePoints = [];
                geom = item.geom;
                geom = geom.substring(geom.indexOf("(") + 1, geom.indexOf(")"));
                xystr = geom.split(",");
                console.log(xystr);
                return;
                for (var j = 0; j < xystr.length; j++) {
                    lineItem = xystr[j].trim();
                    count = lineItem.indexOf(" ");
                    x = lineItem.substring(0, count);
                    y = lineItem.substring(count + 1);
                    objPoint = this.map.geometryTo3D({x: x * 1, y: y * 1});
                    linePoints.push(objPoint.x, objPoint.y);
                }
                lineArrays.push(linePoints);
                /*lineSymbol.draw(layer.group, linePoints);*/
            }
            layer.addLine(lineArrays);
            /*            var feature = new Feature({
                            _geometry: lineArrays
                        });
                        var graphic = new Graphic({
                            feature: feature,
                            symbol: lineSymbol,
                            graphicLayer: layer
                        });
                        layer.addGraphic(graphic);*/
        },
        getStartCost: function () {
            this.zoneNode = "startZoneNode";
            this.getZoneFlag = true;
            domStyle.set(this.map.domNode, "cursor", "url(../dojo/com/huayun/webgis/css/images/AGS/signred.png) 12 12 ,crosshair");
            this.hideCostContainer();
            this.startZoneNode.value = "";
            startZone = null;
        },
        getEndCost: function () {
            this.zoneNode = "endZoneNode";
            this.getZoneFlag = true;
            domStyle.set(this.map.domNode, "cursor", "url(../dojo/com/huayun/webgis/css/images/AGS/signred.png) 12 12 ,crosshair");
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