require({cache:{
'url:com/huayun/webgis/templates/deviceTree.html':"<div class=\"device-tree-panel\">\r\n    <button data-dojo-attach-event=\"onclick: clear\"></button>\r\n    <div class=\"device-tree-content\">\r\n        <div data-dojo-attach-point =\"deviceTreeNode\"></div>\r\n    </div>\r\n</div>"}});
/**
 * @ Description: 行政区定位
 * @ module: BoroughLocation
 * @ Author: zy
 * @ Date: 2019/5/21
 */

define(
    "com/huayun/webgis/widget/DeviceTree", [
        "dojo/_base/declare",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/_base/array",
        "dojo/request",
        "dijit/registry",
        "com/huayun/facades/ConfigFacade",
        "dojo/data/ItemFileWriteStore",
        "dojo/store/Observable",
        "dijit/tree/ForestStoreModel",
        "dijit/Tree",
        "dijit/Menu",
        "dijit/MenuItem",
        "dojo/topic",
        "./MapModuleX",
        "../Feature",
        "../Graphic",
        "../geometry/Point",
        "../geometry/Polyline",
        "../geometry/Multipoint",
        "../geometry/Polygon",
        "../symbols/PointSymbol",
        "../symbols/LineSymbol",
        "../symbols/PolygonSymbol",
        "../utils/wktUtil",
        "./LocatingController",
        "dojo/text!../templates/deviceTree.html"
    ], function (declare, domClass, domStyle,array, request, registry, ConfigFacade, ItemFileWriteStore, Observable, ForestStoreModel, Tree, Menu, MenuItem,topic, MapModuleX, Feature, Graphic, Point, Polyline, Multipoint, Polygon, PointSymbol, LineSymbol, PolygonSymbol, wktUtil, LocatingController, template) {
        return declare("com.huayun.webgis.widget.DeviceTree", [MapModuleX], {
            map: null,
            view: null,
            localTool: null,
            templateString: template,//本组件的template
            name: "设备树",
            vdc_url: "http://vdc-server.test.cloud.zj.sgcc.com.cn/",
            pdc_url: "http://pdc-server.test.cloud.zj.sgcc.com.cn/",
            data_url: "http://pdc-server.test.cloud.zj.sgcc.com.cn/deviceService",
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
                // domStyle.set(this.domNode,"pointer-events","all");
            },
            postCreate: function () {
                this.inherited(arguments);
                // domStyle.set(this.domNode, "position", "absolute");
                domStyle.set(this.domNode, "pointer-events", "all");
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
            clear: function() {
                topic.publish("clearLocate");
            },
            _getTreeDataHandle: function(configList){//根据配置文件中url属性值获取数据
                var self = this;
                array.forEach(configList,function (item) {
                    var url = item.url;
                    self.configFacade.getDepartment(url + "&access_token=YH6fXTGYH4DIumSNOii+IzvIeZSrvghHn/FxVfevu92cu0Gzb4yB4MnKjTxLwYh7SELU8C15v07+mXROfZQYDBSzyeoavyabrZ1L+BJwLu0=", function (resp) {
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
                this.configFacade.getDepartment(url + "&access_token=YH6fXTGYH4DIumSNOii+IzvIeZSrvghHn/FxVfevu92cu0Gzb4yB4MnKjTxLwYh7SELU8C15v07+mXROfZQYDBSzyeoavyabrZ1L+BJwLu0=", function (resp) {
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
                if(this.parentNode.isFile){//如果点击的是文件类型
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

                topic.subscribe("deviceTreeRightMenuClickHandle", function (evt) {/!*接收事件信息*!/
                    var evtData = evt.objectInformation,
                         url = this.data_url;
                    if(evtData.CLASS_NAME){
                        url += "/" + evtData.CLASS_NAME[0] + "/" + evtData.id;
                    } else {
                        url += "/Substation/" + evtData.id
                    }
                    request.get(url + "?RUN_STATUS=" + evtData.RUN_STATUS[0] + "&depart=" + evtData.DEPART[0] + "&access_token=YH6fXTGYH4DIumSNOii+IzvIeZSrvghHn/FxVfevu92cu0Gzb4yB4MnKjTxLwYh7SELU8C15v07+mXROfZQYDBSzyeoavyabrZ1L+BJwLu0=", {
                        handleAs : "json"
                    }).then(function (data) {
                      this._drawGraphicHandle(wktUtil.parse2Geometry(data.data[0].SHAPE));
                    }.bind(this), function (err) {
                        console.log(err)
                    })
                }.bind(this));
            },

            _drawGraphicHandle: function (shape) {
                var geometry = shape,
                    type = geometry.type,
                    drawLayer = this.map.findLayerById("drawLayer");
                if(type === "point") {
                    this.view.setCenter([geometry.x, geometry.y]);
                } else {
                    this.view.setCenter([geometry.path[0][0].x, geometry.path[0][0].y]);
                }
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
                    opacity: 0.5
                });

                switch (type) {
                    case "point":
                        var pointGeometry = new Point(geometry.x, geometry.y);
                        this.addgraphic(drawLayer, pointGeometry, point);
                        break;
                    case "multipoint":
                        var points = geometry.points.map(function (item) {
                            return new Point(item.x, item.y);
                        });
                        var multiPointGeometry = new Multipoint(points);
                        this.addgraphic(drawLayer, multiPointGeometry, point);
                        break;
                    case "line":
                        var path = geometry.path.map(function (item) {
                            return item.map(function (p) {
                                return new Point(p.x, p.y);
                            });
                        });
                        var lineGeometry = new Polyline(path);
                        this.addgraphic(drawLayer, lineGeometry, line);
                        break;
                    default:
                        var paths = geometry.rings.map(function (item) {
                            return item.map(function (p) {
                                return new Point(p.x, p.y);
                            });
                        });
                        var polygonGeometry = new Polygon(paths);
                        this.addgraphic(drawLayer, polygonGeometry, polygon);
                }
            },

            addgraphic: function (layer, geometry, symbol) {
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

            _mountMenuHandle: function(){/*根据配置文件中buttonList类型进行动态渲染按钮*/
                var buttonList = this.buttonArray;
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
                                var infoConfig = {menuName: menuName, objectInformation: item,vdc_url: this.vdc_url,pdc_url: this.pdc_url};
                                topic.publish("deviceTreeRightMenuClickHandle", infoConfig);
                            }
                        });
                        mainMenu.addChild(locationMenu);
                        mainMenu.startup();
                    }.bind(this));
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
                this._getButtonListHandle();
            }
        });
    }
);