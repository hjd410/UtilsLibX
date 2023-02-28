define("com/huayun/thematicmap/thematicWidget/ConnectContainer", [
    'require',
    'dojo/_base/declare',
    'dojo/dom',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/request',
    'dojo/on',
    'dojo/query',
    '../../facades/PowerFacade',
    '../../thematicmap/tool/Treedata',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_OnDijitClickMixin',
    "dojo/text!../widget/templates/power-connect.html"
], function(require, declare, dom, domClass, domConstruct,  request, on, query, PowerFacade, Treedata, _WidgetBase, _TemplatedMixin, _OnDijitClickMixin, template) {
    return declare("", [_WidgetBase, _TemplatedMixin, _OnDijitClickMixin],{
        templateString: template,
        baseClass: "power-connect",
        picUrl: require.toUrl("com/huayun/webgis/css/images/power/sign_close.png"),
        pic1Url: require.toUrl("com/huayun/webgis/css/images/power/greencircle.png"),
        pic2Url: require.toUrl("com/huayun/webgis/css/images/power/close.png"),
        pic3Url: require.toUrl("com/huayun/webgis/css/images/power/greenp.png"),
        pic4Url: require.toUrl("com/huayun/webgis/css/images/power/redcircle.png"),
        pic5Url: require.toUrl("com/huayun/webgis/css/images/power/close.png"),
        pic6Url: require.toUrl("com/huayun/webgis/css/images/power/redp.png"),

        constructor: function (params) {
            this.map = params.map;
            this.view = this.map.view;
            this.data = {
                endID: "",
                mapID: "",
                opStatus: "true",
                startID: "",
                type: "",
                userBean: {
                    buro: "",
                    dynamic: "true"
                }
            };
            this._powerFacade = new PowerFacade();
            this._treedata = new Treedata();
            this.url = "http://10.136.35.108:8082/topo-server/topoCenter/normalServices/connectedPath";
            this.mixUrl = "http://10.136.35.108:8082/vdc/dataService/t_dxt_mergerel",
            this.dicUrl = "http://gateway.test.cloud.zj.sgcc.com.cn/vdc/dataService/META_MODEL_CLASS?access_token=b99e03be-dd1e-428b-aeea-d12bdab254d6",
            this.devs = [];
            this.startClick = null;
            this.endClick = null;
            this.heightLight = [];
            this.showMes = [];
            this.dicArry = null;
            this.treeData = null;
            this.currGraphic = null;

        },

        postCreate: function() {
            request.get(this.dicUrl, {handleAs:"json"}).then(function(data){
                this.dicArry = data;
            }.bind(this));
        },

        onConnectClose: function() {
            this.domNode.style.display = "none";
            this.restore();
        },

        onstartCloseDev: function () {
            dom.byId("startDev").innerHTML = "请输入起始设备";
            this.data.startID = "";
            if(this.startClick){
                this.startClick.remove();
                this.startClick = null;
            }
            if(this.endClick){
                this.endClick.remove();
                this.endClick = null;
            }
            this.delCursor();
            this.resetDiv();
        },

        onstartSelect: function () {
            event.stopPropagation();
            event.preventDefault();
            domClass.add(query('.webgis-root')[0], "changeCursor");
            domClass.add(this.ownerDocumentBody, "changeCursor");
            if(this.startClick) {
                this.startClick.remove();
                this.startClick = null;
            }
            this.startClick = on(this.view.domNode, "click", function(e) {
                var geometry = this.view.screenToGeometry(e.clientX, e.clientY);
                var result = this.view.queryGraphicsByGeometry(geometry, 5);
                if(result.length > 0) {
                    var dev_id, showName;
                    for(var i = 0, item = result[0].feature.attributes; i < item.length; i++) {
                        if(item[i].name === 'dev_id'){
                            dev_id = item[i].value;
                        }
                        if(item[i].name === 'name'){
                            showName = item[i].value;
                        }
                    }
                    this.data.startID = dev_id;
                    dom.byId("startDev").innerHTML = showName;
                    this.delCursor();
                    this.startClick.remove();
                    this.startClick = null;
                    if(this.data.endID !== ""){
                        this.getAndShowData();
                    }
                }
            }.bind(this));
        },

        onendCloseDev: function () {
            dom.byId("endDev").innerHTML = "请输入终止设备";
            this.data.endID = "";
            if(this.startClick){
                this.startClick.remove();
                this.startClick = null;
            }
            if(this.endClick){
                this.endClick.remove();
                this.endClick = null;
            }
            this.delCursor();
            this.resetDiv();
        },

        onendSelect: function () {
            event.stopPropagation();
            event.preventDefault();
            domClass.add(query('.webgis-root')[0], "changeCursor");
            domClass.add(this.ownerDocumentBody, "changeCursor");
            if(this.endClick) {
                this.endClick.remove();
                this.endClick = null;
            }
            this.endClick = on(this.view.domNode, "click", function(e) {
                var geometry = this.view.screenToGeometry(e.clientX, e.clientY);
                var result = this.view.queryGraphicsByGeometry(geometry, 5);
                if(result.length > 0) {
                    var map_id, dev_id, showName;
                    for(var i = 0, item = result[0].feature.attributes; i < item.length; i++) {
                        if(item[i].name === 'map_id'){
                            map_id = item[i].value;
                        }
                        if(item[i].name === 'dev_id'){
                            dev_id = item[i].value;
                        }
                        if(item[i].name === 'name'){
                            showName = item[i].value;
                        }
                    }
                    this.data.map_id = map_id.toString();
                    this.data.endID = dev_id;
                    dom.byId("endDev").innerHTML = showName;
                    this.delCursor();
                    this.endClick.remove();
                    if(this.data.startID !== ""){
                        this.getAndShowData();
                    }
                }
            }.bind(this));
        },

        getAndShowData: function () {
            domConstruct.empty(dom.byId("conListShow"));
            if(this.heightLight.length > 0){
                for(var m = 0; m < this.heightLight.length; m++) {
                    this.heightLight[m].glow = null;
                }
                this.view.threeRender();
            }
            this._powerFacade.getPowerConnectData(this.url, this.data, function(resp) {
                if(resp.data !== null && resp.data.length > 0){
                    this.devs = [];
                    this.heightLight = [];
                    this.showMes = [];
                    for(var i = 0; i < resp.data.length; i++){
                        if(this.devs.indexOf(resp.data[i].devID) === -1) {
                            this.devs.push(resp.data[i].devID);
                        }
                    }
                    this._powerFacade.getMixtureData(this.mixUrl+"?map_id=" + this.data.map_id + "&REL_DEV_ID=" + this.devs, function (data) {
                        for(var j = 0; j < data.data.length; j++) {
                            var fid = data.data[j]['MERGE_FID'];
                            if(this.devs.indexOf(fid) === -1) {
                                this.devs.push(fid);
                            }
                        }
                        for(var k = 0; k < this.devs.length; k++) {
                            var graphic = this.view.queryGraphicByDevId(this.devs[k]);
                            if(graphic !== null) {
                                this.heightLight.push(graphic);
                                var data = {};
                                for(var num = 0, value = graphic.feature.attributes; num < value.length; num++) {
                                    if(value[num].name === "name") {
                                        data.name = value[num].value;
                                    }
                                    if(value[num].name === "dev_id") {
                                        data.devId = value[num].value;
                                    }
                                    if(value[num].name === "class_id") {
                                        data.classId = value[num].value;
                                    }
                                }
                                this.showMes.push(data);
                            }
                        }
                        for(var m = 0; m < this.heightLight.length; m++) {
                            this.heightLight[m].glow = {
                                color: "#0ce386"
                            }
                        }
                        this.view.threeRender();
                        this.treeData = this._treedata.getParentData(this.dicArry.data, this.showMes);
                        
                        for(var item in this.treeData) {
                            var rootBtn = domConstruct.create("div", {
                                class: "simpleShowCon"
                            }, dom.byId("conListShow"));
                            var parentBtn = domConstruct.create("div", {
                                class: "treeBtn"
                            }, rootBtn);
                            domConstruct.create("span", {
                                class: "pic"
                            }, parentBtn);
                            domConstruct.create("span", {
                                class: "picName",
                                innerHTML: item
                            }, parentBtn);
                            var childBtn = domConstruct.create("div", {
                                class: "showMes"
                            }, rootBtn);
                            for(var n = 0; n < this.treeData[item].length; n++) {
                                var devBtn = domConstruct.create("div", {
                                    class: "oneDev"
                                }, childBtn);
                                var table = domConstruct.create("table", {
                                    class: "table"
                                }, devBtn);
                                var tr = domConstruct.create("tr", {
                                    class: "simpleShowP",
                                    devId: this.treeData[item][n].devId
                                }, table);
                                domConstruct.create("td", {
                                    innerHTML: "名称",
                                    class: "tdTitle",
                                    devId: this.treeData[item][n].devId
                                }, tr);
                                domConstruct.create("td", {
                                    innerHTML: this.treeData[item][n].name,
                                    devId: this.treeData[item][n].devId
                                }, tr);
                                var tr2 = domConstruct.create("tr", {
                                    class: "simpleShowP",
                                    devId: this.treeData[item][n].devId
                                }, table);
                                domConstruct.create("td", {
                                    innerHTML: "资源ID",
                                    class: "tdTitle",
                                    devId: this.treeData[item][n].devId
                                }, tr2);
                                domConstruct.create("td", {
                                    innerHTML: this.treeData[item][n].devId,
                                    devId: this.treeData[item][n].devId
                                }, tr2);
                            }
                            on(rootBtn, "click", function(e) {
                                if(e.target.getAttribute('class') === "pic") {
                                    domClass.remove(e.target, "pic");
                                    domClass.add(e.target, "picOpen");
                                    e.target.parentNode.nextElementSibling.style.display = "block";
                                } else if(e.target.getAttribute('class') === "picOpen") {
                                    domClass.remove(e.target, "picOpen");
                                    domClass.add(e.target, "pic");
                                    e.target.parentNode.nextElementSibling.style.display = "none";
                                }
                                if(e.target.localName === "td"){
                                    if(this.currGraphic) {
                                        this.currGraphic.glow = {
                                            color: "#0ce386"
                                        }
                                        this.view.threeRender();
                                    }
                                    var graphic = this.view.queryGraphicByDevId(e.target.getAttribute("devId"));
                                    if(graphic) {
                                        this.view.setCenter(graphic.position, this.view.resolution);
                                        graphic.glow ={
                                            color: "red"
                                        };
                                        this.view.threeRender();
                                    } else {
                                        alert("此图无该设备");
                                    }
                                    this.currGraphic = graphic;
                                }
                                domClass.add(dom.byId("conListShow"), "showScroll");
                            }.bind(this));
                        }
                    }.bind(this), function(err){
                        console.log(err);
                    });
                }
            }.bind(this), function(err) {
                console.log(err);
            });
        },

        restore: function() {
            if(this.startClick){
                this.startClick.remove();
                this.startClick = null;
            }
            if(this.endClick){
                this.endClick.remove();
                this.endClick = null;
            }
            this.delCursor();
            this.resetDiv();
            dom.byId("startDev").innerHTML = "请输入起始设备";
            dom.byId("endDev").innerHTML = "请输入终止设备";
        },

        delCursor: function() {
            domClass.remove(query(".webgis-root")[0], "changeCursor");
            domClass.remove(this.ownerDocumentBody, "changeCursor");
        },

        resetDiv: function() {
            domConstruct.empty(dom.byId("conListShow"));
            domClass.remove(dom.byId("conListShow"), "showScroll");
            if(this.heightLight.length > 0) {
                for(var m = 0; m < this.heightLight.length; m++) {
                    this.heightLight[m].glow = null;
                }
                this.view.threeRender();
            }
        }
    });
});