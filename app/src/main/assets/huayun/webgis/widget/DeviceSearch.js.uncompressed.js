require({cache:{
'url:com/huayun/webgis/templates/deviceSearch.html':"<div class=\"${baseClass}\">\r\n    <div class=\"title-container\">\r\n        <span class=\"active\" data-dojo-attach-event=\"onclick: switchSBD\">输变电</span>\r\n        <span data-dojo-attach-event=\"onclick: switchPD\">配电</span>\r\n        <span data-dojo-attach-event=\"onclick: switchDY\">低压</span>\r\n    </div>\r\n    <div class=\"input-container\">\r\n        <div>\r\n            设备类型: <select class=\"device-select\" data-dojo-attach-point=\"selectNode\"></select>\r\n        </div>\r\n        <div>\r\n            设备名称: <input type=\"text\" data-dojo-attach-point=\"searchName\"><button data-dojo-attach-event=\"onclick: search\"></button>\r\n        </div>\r\n    </div>\r\n    <div class=\"result-container\">\r\n        <div class=\"device-result\" >\r\n            搜索结果 <span class=\"count-result\" data-dojo-attach-point=\"countResult\">(0)</span>\r\n            <span class=\"page-count\" data-dojo-attach-point=\"pageResult\">\r\n                <button class=\"pre-page\" data-dojo-attach-event=\"onclick: prePage\"></button>\r\n                <span data-dojo-attach-point=\"countPage\">1/20</span>\r\n                <button class=\"next-page\" data-dojo-attach-event=\"onclick: nextPage\"></button>\r\n            </span>\r\n        </div>\r\n        <div data-dojo-attach-point=\"searchResult\">\r\n\r\n        </div>\r\n    </div>\r\n</div>\r\n\r\n"}});
/**
 * @ Description: 设备搜索模块
 * @ module: DeviceSearch
 * @ Author: overfly
 * @ Date: 2019/5/16
 */
define(
    "com/huayun/webgis/widget/DeviceSearch", [
        "dojo/_base/declare",
        "dojo/request",
        "dojo/query",
        "dojo/dom-class",
        "./DeviceResult",
        "./MapModuleX",
        "dojo/text!../templates/deviceSearch.html"
    ], function (declare, request, query, domClass, DeviceResult, MapModuleX, template) {
        return declare("com.huayun.webgis.widget.DeviceSearch", [MapModuleX], {
            baseClass: "deviceSearch",
            templateString: template,

            constructor: function () {
                this.map = null;
                this.sbd = null;
                this.pd = null;
                this.dy = null;
                this.modelClass = null;
                this.ftsService = "";
                this.vdcService = "";
                this.currentState = "sbd";
                this.data = null;
                this.page = 1;
                this.maxPage = 1;
                this.view = null;
            },


            doInit: function () {
                console.log("device search");
                 this.map = this.get("map");
                 this.view = this.get("view");
                 this.modelClass = {};
                 var configData = this.get("configData");
                 this.sbd = configData.data[0].types;
                 this.pd = configData.data[1].types;
                 this.dy = configData.data[2].types;
                 this.ftsService = configData.ftsService;
                 this.vdcService = configData.vdcService;
                 var option = document.createElement("option");
                 option.value = " ";
                 option.text = "请选择";
                 this.selectNode.add(option);
                 for (var i = 0; i < this.sbd.length; i++) {
                     option = document.createElement("option");
                     option.value = this.sbd[i]["class_id"];
                     option.text = this.sbd[i]["class_desc"];
                     this.selectNode.add(option);
                 }
                 var modelClass = configData.modelClass;
                 request.get(modelClass,{handleAs: "json"}).then(function (resp) {
                     var data = resp.data, item;
                     for (var i = 0; i < data.length; i++) {
                         item = data[i];
                         this.modelClass[item["CLASS_ID"]] = {
                             "name": item["CLASS_NAME"],
                             "table": item["G_TABLE_NAME"]
                         }
                     }
                 }.bind(this));
            },
            search: function () {
                var classId = this.selectNode.value,
                    name = this.searchName.value,
                    className = this.modelClass[classId].name,
                    table = this.modelClass[classId].table;
                this.searchResult.innerHTML = "";
                request.get(this.ftsService + "?name=" + name + "&class_name=" + className, {handleAs: "json"}).then(function (resp) {
                    if (resp.resultState === "0000") {
                        var data = resp.data;
                        this.data = data;
                        this.countResult.innerText = "( " + data.length + " )";
                        if (data.length < 6) {
                            this.pageResult.style.visibility = "hidden";
                        } else {
                            this.pageResult.style.visibility = "visible";
                        }
                        if (data.length === 0) {
                            alert("未查询到设备");
                        } else {
                            var query = "/";
                            var count = Math.min(5, data.length);
                            this.page = 1;
                            this.maxPage = Math.ceil(data.length / 5);
                            this.countPage.innerHTML = this.page + "/" + this.maxPage;
                            for (var i = 0; i < count; i++) {
                                query += data[i]["PSR_ID"] + ","
                            }
                            request.get(this.vdcService + table + query.substr(0, query.length - 1), {handleAs: "json"}).then(function (result) {
                                if (result.resultState === "0000") {
                                    var resultData = result.data;
                                    for (var m = 0; m < resultData.length; m++) {
                                        var deviceResult = new DeviceResult({
                                            sequence: m + 1,
                                            name: resultData[m]["NAME"],
                                            shape: resultData[m]["SHAPE"],
                                            map: this.map
                                        });
                                        this.searchResult.append(deviceResult.domNode);
                                    }
                                }
                            }.bind(this));
                        }
                    }
                }.bind(this));
            },

            switchSBD: function (e) {
                if (this.currentState !== "sbd") {
                    query(".title-container span").forEach(function (item) {
                        domClass.remove(item, "active");
                    });
                    domClass.add(e.target, "active");
                    for (var i = this.selectNode.children.length; i > 0; i--) {
                        this.selectNode.remove(i);
                    }
                    var option;
                    for (i = 0; i < this.sbd.length; i++) {
                        option = document.createElement("option");
                        option.value = this.sbd[i]["class_id"];
                        option.text = this.sbd[i]["class_desc"];
                        this.selectNode.add(option);
                    }
                    this.currentState = "sbd";
                }
            },
            switchPD: function (e) {
                if (this.currentState !== "pd") {
                    query(".title-container span").forEach(function (item) {
                        domClass.remove(item, "active");
                    });
                    domClass.add(e.target, "active");
                    for (var i = this.selectNode.children.length; i > 0; i--) {
                        this.selectNode.remove(i);
                    }
                    var option;
                    for (i = 0; i < this.pd.length; i++) {
                        option = document.createElement("option");
                        option.value = this.pd[i]["class_id"];
                        option.text = this.pd[i]["class_desc"];
                        this.selectNode.add(option);
                    }
                    this.currentState = "pd";
                }
            },
            switchDY: function (e) {
                if (this.currentState !== "dy") {
                    query(".title-container span").forEach(function (item) {
                        domClass.remove(item, "active");
                    });
                    domClass.add(e.target, "active");
                    for (var i = this.selectNode.children.length; i > 0; i--) {
                        this.selectNode.remove(i);
                    }
                    var option;
                    for (i = 0; i < this.dy.length; i++) {
                        option = document.createElement("option");
                        option.value = this.dy[i]["class_id"];
                        option.text = this.dy[i]["class_desc"];
                        this.selectNode.add(option);
                    }
                    this.currentState = "dy";
                }
            },
            prePage: function () {
                if (this.page > 1) {
                    this.searchResult.innerHTML = "";
                    this.page -= 1;
                    this.countPage.innerHTML = this.page + "/" + this.maxPage;
                    var query = "/",
                        classId = this.selectNode.value,
                        table = this.modelClass[classId].table;
                    var count = Math.min(this.page * 5, this.data.length);
                    for (var i = (this.page - 1) * 5; i < count; i++) {
                        query += this.data[i]["PSR_ID"] + ",";
                    }
                    request.get(this.vdcService + table + query.substr(0, query.length - 1), {handleAs: "json"}).then(function (result) {
                        if (result.resultState === "0000") {
                            var resultData = result.data;
                            for (var m = 0; m < resultData.length; m++) {
                                var deviceResult = new DeviceResult({
                                    sequence: m + 1,
                                    name: resultData[m]["NAME"],
                                    shape: resultData[m]["SHAPE"],
                                    map: this.map
                                });
                                this.searchResult.append(deviceResult.domNode);
                            }
                        }
                    }.bind(this));
                }
            },
            nextPage: function () {
                if (this.page < this.maxPage) {
                    this.searchResult.innerHTML = "";
                    this.page += 1;
                    this.countPage.innerHTML = this.page + "/" + this.maxPage;
                    var query = "/",
                        classId = this.selectNode.value,
                        table = this.modelClass[classId].table;
                    var count = Math.min(this.page * 5, this.data.length);
                    for (var i = (this.page - 1) * 5; i < count; i++) {
                        query += this.data[i]["PSR_ID"] + ",";
                    }
                    request.get(this.vdcService + table + query.substr(0, query.length - 1), {handleAs: "json"}).then(function (result) {
                        if (result.resultState === "0000") {
                            var resultData = result.data;
                            for (var m = 0; m < resultData.length; m++) {
                                var deviceResult = new DeviceResult({
                                    sequence: m + 1,
                                    name: resultData[m]["NAME"],
                                    shape: resultData[m]["SHAPE"],
                                    map: this.map
                                });
                                this.searchResult.append(deviceResult.domNode);
                            }
                        }
                    }.bind(this));
                }
            }
        });
    });