require({cache:{
'url:com/huayun/webgis/templates/deviceTree.html':"<div class=\"device-tree-panel\">\r\n    <button data-dojo-attach-event=\"onclick: clear\"></button>\r\n    <div class=\"device-tree-content\">\r\n        <div data-dojo-attach-point =\"deviceTreeNode\"></div>\r\n    </div>\r\n</div>"}});
/**
 * @ Description: 行政区定位
 * @ module: BoroughLocation
 * @ Author: zy
 * @ Date: 2019/5/21
 */

define(
    "com/huayun/webgis/widget/DeviceTreeOld", [
        "dojo/_base/declare",
        "dojo/dom-class",
        "dojo/_base/array",
        "dijit/registry",
        "com/huayun/facades/ConfigFacade",
        "dojo/data/ItemFileWriteStore",
        "dojo/store/Observable",
        "dijit/tree/ForestStoreModel",
        "dijit/Tree",
        "dijit/Menu",
        "dijit/MenuItem",
        "dojo/topic",
        "com/huayun/webgis/geometry/Point",
        "../geometry/Extent",
        "../geometry/Polyline",
        "../Feature",
        "../Graphic",
        "../symbols/ImageSymbol",
        "com/huayun/webgis/symbols/LineSymbol",
        "./MapModuleX",
        "./LocatingController",
        "dojo/text!../templates/deviceTree.html"
    ], function (declare, domClass, array, registry, ConfigFacade, ItemFileWriteStore, Observable, ForestStoreModel, Tree, Menu, MenuItem,topic, Point, Extent, Polyline,
                 Feature, Graphic, ImageSymbol, LineSymbol, MapModuleX, LocatingController, template) {
        return declare("com.huayun.webgis.widget.DeviceTreeOld", [MapModuleX], {
            map: null,
            localTool: null,
            templateString: template,//本组件的template
            name: "设备树",
            vdc_url: "http://vdc.prod.cloud.zj.sgcc.com.cn/",
            pdc_url: "http://pdc.prod.cloud.zj.sgcc.com.cn/",
            width: "400px",
            height: "800px",
            model: null,
            store: null,
            parentNode: null,
            deviceTreeConfigData: null,
            rootData: { /*初始化根节点*/
                name: "浙江省电力公司",
                id: "8a812897493378a001495677ad086663",
                type: 0,
                buttonList: null,
                iconClassName: "unit",
                parentNode: null,
                children: []
            },
            configFacade: null,
            buttonArray: null,
            constructor: function () {/*初始化facade文件*/
                this.configFacade = new ConfigFacade();
            },
            _assembleDataHandle: function(data){//对获取的树结构的数据进行组装处理
                var self = this,
                    dataList = data.data,
                    parentNode = this.parentNode,
                    config = data.configInfo;

                array.forEach(dataList,function (item) {
                    item.id = item[config.key];
                    item.name = item[config.label];
                    item.type = config.index;
                    item.buttonList = config.buttonList;
                    item.iconClassName = config.iconClassName;
                    item.parentNode = parentNode;
                    item.children = [];
                    var pInfo = {parent: parentNode, attribute: "children"};
                    self.store.newItem(item, pInfo);
                });
            },
            _getTreeDataHandle: function(configList){//根据配置文件中url属性值获取数据
                var self = this;
                array.forEach(configList,function (item) {
                    var url = item.url;
                    self.configFacade.getDepartment(url, function (resp) {
                        if (resp.resultState == "0000") {
                            var next_data = resp.data;
                            if(next_data.length != 0){
                                var data = {
                                    configInfo: item,
                                    data: next_data
                                };
                                self._assembleDataHandle(data);
                            }
                        }
                    }, function (err) {console.log(err);});

                });
            },
            _addFileHandle: function(fileList){/*把对应的文件夹放在该节点下*/
                var parentNode = this.parentNode, self = this, configList = [];
                array.forEach(fileList,function (fileItem,index) {
                    configList.push(fileItem);
                    fileItem.ID = parentNode["ID"];
                    fileItem.id = parentNode["ID"] + fileItem.className + index;
                    fileItem.type = fileItem.index;
                    fileItem.parentNode = parentNode;
                    fileItem.childIconClass = fileItem.childIconClass;
                    fileItem.children = [];
                    var pInfo = {parent: parentNode, attribute: "children"};
                    self.store.newItem(fileItem, pInfo);
                });
            },
            _getNextConfigs: function(){// 得到下一级数据所对应的配置文件，解析配置数据,返回该数据
                var configList = [], parent_index = this.parentNode["type"][0];
                var configDataList = this.deviceTreeConfigData.configuration.items;
                array.forEach(configDataList,function (item) {/*获取其parent中含有index的配置文件*/
                    var parentVal = item.parent;
                    if (parentVal.indexOf(parent_index) > -1) {
                        configList.push(item);
                    }
                });

                if(configList.length != 0){/*处理配置文件中url*/
                    var pdc_url = this.pdc_url, vdc_url = this.vdc_url;
                    array.forEach(configList,function(item){
                        if(item.serviceName == "featureService" || item.serviceName == "dataService") item["url"] = vdc_url + item["serviceAddress"];
                        if(item.serviceName == "deviceService") item["url"] = pdc_url + item["serviceAddress"];
                    });

                    var newConfigList = [], parentNode = this.parentNode,fileList = [];
                    array.forEach(configList,function (item) {/*替换url中的字段*/
                        var copy_item = Object.assign({},item),url = copy_item.url;
                        var fieldList = url.match(/{(.*?)}/g);//得到一个数组[{ID},{DEAPRT},{ROOT_ID}]
                        if(fieldList != null){
                            array.forEach(fieldList,function (field) {
                                var fieldName = field.replace(/{|}/g,'');
                                url = url.replace(field, parentNode[fieldName]);
                                copy_item.url = url;
                            });
                        }
                        if(copy_item.isFile){fileList.push(copy_item);}
                        newConfigList.push(copy_item);
                    });

                    if(fileList.length > 0){
                        this._addFileHandle(fileList);
                    }else {
                        this._getTreeDataHandle(newConfigList);
                    }
                }
            },
            _getTreeDataByFile: function(url){//当点击的是文件类型的节点时，获取到数据后如下操纵
                var parentNode = this.parentNode, self = this;
                this.configFacade.getDepartment(url, function (resp) {
                    if (resp.resultState == "0000") {
                        var next_data = resp.data;
                        if(next_data.length != 0){
                            array.forEach(next_data,function (item) {
                                item.id = item[parentNode.key];
                                item.name = item[parentNode.label];
                                item.type = parentNode.index;
                                item.iconClassName = parentNode.childIconClass;
                                item.parentNode = parentNode;
                                item.buttonList = parentNode.buttonList;
                                item.children = [];
                                var pInfo = {parent: parentNode, attribute: "children"};
                                self.store.newItem(item, pInfo);
                            });
                        }
                    }
                }, function (err) {console.log(err);});
            },
            _getNextLevelData: function(){//根据用户点击的对象类型进行获取和处理数据
                console.log(this.parentNode);
                if(this.parentNode.isFile){//如果点击的是文件类型
                    // debugger;
                    var url = this.parentNode.url[0];
                    this._getTreeDataByFile(url);
                }else{//如果点击的分支类型
                    this._getNextConfigs();
                }
            },
            postCreate: function () {//自动调用该方法，此时模板不一定再浏览器渲染完毕
                this.inherited(arguments);
                var self = this;
                var treeData = {
                    identifier: "id",
                    label: "name",
                    items: [this.rootData]
                };
                this.store = new ItemFileWriteStore({
                    data: treeData
                });
                var model = new ForestStoreModel({
                    store: self.store,
                    query: {type: "0"},
                    rootId: "root",
                    rootLabel: "Continents",
                    childrenAttrs: ["children"],
                    mayHaveChildren: function (item) {
                        // TODO
                    }
                });

                var _tree = new Tree({
                    id: ["tree"],
                    model: model,
                    showRoot: false,
                    persist: true,
                    autoExpand: true,
                    onClick: function (item) {
                        self.parentNode = item;
                        // debugger;
                        if (!item.children.length) {
                            self._getNextLevelData();
                        }
                    },
                    getIconClass: function (item) {
                        return item.iconClassName;
                    },
                    _createTreeNode: function (args) {
                        var node = new Tree._TreeNode(args);
                        if (!args.isExpandable) {
                            var buttonList = node.item.buttonList;
                            var isFile = node.item.isFile;
                            if(buttonList[0] != null && !isFile){
                                var className = buttonList[0].className;
                                domClass.add(node.rowNode, className);
                            }
                        }
                        return node;
                    }
                }, self.deviceTreeNode);
                _tree.startup();

                /*topic.subscribe("deviceTreeRightMenuClickHandle", function (evt) {/!*接收事件信息*!/
                    console.log(evt);
                }.bind(this));*/
            },
            _mountMenuHandle: function(){/*根据配置文件中buttonList类型进行动态渲染按钮*/
                var buttonList = this.buttonArray;
                var self = this;
                array.forEach(buttonList,function (item) {
                    var className = item.className,
                        list = item.list;
                    var mainMenu = new Menu({
                        style: "display: none;",
                        targetNodeIds: ["tree"],
                        selector: "." + className
                    });

                    array.forEach(list,function (button) {
                        var buttonLabel = button.right_label;
                        var locationMenu = new MenuItem({
                            label: "<div>" + buttonLabel + "</div>",
                            onClick: function (event) {
                                var menuName = event.target.innerText;
                                var item = registry.byNode(this.getParent().currentTarget.parentNode).item;
                                var infoConfig = {menuName: menuName, objectInformation: item};
                                // topic.publish("deviceTreeRightMenuClickHandle", infoConfig);

                                // debugger;
                                var classId = item["CLASS_ID"]?item["CLASS_ID"][0]:item["STATION_CLASS_ID"][0];
                                var table = self.modelClass[classId].table;
                                self.configFacade.getGeometry(self.vdc_url + "featureService/" + table + "/" + item.id[0], function (resp) {
                                    self._graphicLayer.clear();
                                    // debugger;
                                    var geoStr = resp.data[0].SHAPE;
                                    if (geoStr.startsWith("POINT")) {
                                        self.locatePoint(self.geometry2geoJson(geoStr));
                                    } else if (geoStr.startsWith("MULTILINESTRING")) {
                                        self.locateMultiLines(geoStr)
                                    }
                                    /*self.view.setLevel(self.maxLevel);
                                    self.levelController.changeLevelByLocation(this.maxLevel,0);*/
                                });
                            }
                        });
                        mainMenu.addChild(locationMenu);
                        mainMenu.startup();
                    });
                });
            },
            _getButtonListHandle: function(){/*筛选配置数据中的button类型*/
                var configDataList = this.deviceTreeConfigData.configuration.items, self = this, obj = {};
                this.buttonArray = [];
                array.forEach(configDataList,function(item){
                    if(item.buttonList != null){
                        var button = item.buttonList;
                        if(!obj[button.className]){
                            self.buttonArray.push(button);
                            obj[button.className] = true;
                        }
                    }
                });
                this._mountMenuHandle();
            },
            doInit: function () {
                this.deviceTreeConfigData = this.get("configData");//获取树结构的配置数据
                this.map = this.get("map");
                this.view = this.get("view");
                this.maxLevel = this.view.maxLevel;
                this._graphicLayer = this.map.findLayerById("drawLayer");
                this._getButtonListHandle();

                this.dotSymbol = new ImageSymbol({
                    url: "../dojo/com/huayun/webgis/css/images/red.png",
                    width: 21,
                    height: 33,
                    fixedSize: true
                });

                this._lineSymbol = new LineSymbol({
                    color: '#FF0000',
                    width: 1,
                });

                this.modelClass = {};
                var modelClass = this.deviceTreeConfigData.configuration.items;
                this.configFacade.getModelClass(modelClass,function (resp) {
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
            locatePoint: function (geoJson) {
                var geoPoint = {x: Number(geoJson.coordinates[0]), y: Number(geoJson.coordinates[1])};
                var point = new Point(geoPoint.x, geoPoint.y, 0.1);

                var feature = new Feature({
                    geometry: point
                });
                var graphic = new Graphic({
                    feature: feature,
                    symbol: this.dotSymbol
                });

                this._graphicLayer.addGraphic(graphic);
                this.view.centerAt(geoPoint.x, geoPoint.y);
            },
            locateMultiLines: function (shape) {
                if (shape.indexOf("EMPTY") > -1) {
                    alert("没有数据!");
                } else {
                    var str = shape.substring(17, shape.length - 2);
                    var poionts = str.split("),(");
                    var pointsStr, pointStr;
                    var pointArray = [],xy, p, x, y, arrays = [];
                    var minx, maxx = 0, miny, maxy = 0;
                    for (var i = 0, ii = poionts.length; i < ii; i++) {
                        var point = poionts[i].split(",");
                        pointArray = [];
                        for (var j = 0, jj = point.length; j < jj; j++) {
                            pointStr = point[j];
                            xy = pointStr.split(" ");
                            x = Number(xy[0]);
                            y = Number(xy[1]);
                            if (!minx || x < minx) {
                                minx = x;
                            }else if (x > maxx) {
                                maxx = x;
                            }
                            if (!miny || y < miny) {
                                miny = y;
                            }else if (y > maxy) {
                                maxy = y;
                            }
                            pointArray.push({x: x, y:y});
                        }
                        arrays.push(pointArray);
                    }
                    var extent = new Extent(minx, miny, maxx, maxy);
                    this.view.setExtent(extent);
                    /*var geometry = new Polyline();
                    geometry.setPath([pointArray]);
                    var feature = new Feature({
                        geometry: geometry
                    });
                    var graphic = new Graphic({
                        feature: feature,
                        symbol: this._lineSymbol
                    });
                    this._graphicLayer.addGraphic(graphic);
                    */
                    for (i = 0, ii = arrays.length; i < ii; i++) {
                        var geometry = new Polyline();
                        geometry.setPath([arrays[i]]);
                        var feature = new Feature({
                            geometry: geometry
                        });
                        var graphic = new Graphic({
                            feature: feature,
                            symbol: this._lineSymbol
                        });
                        this._graphicLayer.addGraphic(graphic);
                    }
                    this.view.threeRender();
                }
            },

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
            clear: function() {
                this._graphicLayer.clear();
            }
        });
    }
);