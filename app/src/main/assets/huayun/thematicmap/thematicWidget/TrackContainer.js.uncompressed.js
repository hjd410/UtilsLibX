define("com/huayun/thematicmap/thematicWidget/TrackContainer", [
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
    "dojo/text!../widget/templates/power-point-tracking.html"
], function(require, declare, dom, domClass, domConstruct, request, on, query, PowerFacade, Treedata, _WidgetBase, _TemplatedMixin, _OnDijitClickMixin, template) {
    return declare(" ",[_WidgetBase, _TemplatedMixin, _OnDijitClickMixin],{
        templateString: template,
        baseClass: "power-track",
        picUrl: require.toUrl("com/huayun/webgis/css/images/power/sign_close.png"),
        pic1Url: require.toUrl("com/huayun/webgis/css/images/power/greencircle.png"),
        pic2Url: require.toUrl("com/huayun/webgis/css/images/power/close.png"),
        pic3Url: require.toUrl("com/huayun/webgis/css/images/power/greenp.png"),

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
            this.url = params.getUrl;
            this.mixUrl = "http://10.136.35.108:8082/vdc/dataService/t_dxt_mergerel";
            this.dicUrl = "http://gateway.test.cloud.zj.sgcc.com.cn/vdc/dataService/META_MODEL_CLASS?access_token=b99e03be-dd1e-428b-aeea-d12bdab254d6";
            this.devs = [];
            this.click = null;
            this.heightLight = [];
            this.showMes = [];
            this.dicArr = null;
            this.treeData = null;
            this.currGraphic = null;
        },

        postCreate: function () {
            request.get(this.dicUrl, {handleAs:"json"}).then(function(data){
                this.dicArr = data;
            }.bind(this));
        },

        onClose: function() {
            this.domNode.style.display = "none";
            this.restore();
        },

        onCloseDev: function() {
            this.restore();
        },

        onSelect: function(event) {
            event.stopPropagation();
            event.preventDefault();
            domClass.add(query(".webgis-root")[0], "changeCursor");
            domClass.add(this.ownerDocumentBody, "changeCursor");
            if(this.click) {
                this.click.remove();
                this.click = null;
            }
            this.click = on(this.view.domNode, "click", function(e){
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
                        if(item[i].name === 'name') {
                            showName = item[i].value;
                        }
                    }
                    this.data.mapID = map_id.toString();
                    this.data.startID = dev_id;
                    dom.byId("equName").innerHTML = showName;
                    domConstruct.empty(dom.byId("mesListShow"));
                    this.delCursor();
                    this.click.remove();
                    this.click = null;
                    if(this.heightLight.length > 0){
                        for(var m = 0; m < this.heightLight.length; m++) {
                            this.heightLight[m].glow = null;
                        }
                        this.view.threeRender();
                    }
                    this._powerFacade.getPowerPointData(this.url + "/searchPower",this.data, function (resp) {
                        if(resp.data !== null && resp.data.length > 0) {
                            this.devs = [];
                            this.heightLight = [];
                            this.showMes = [];
                            for(var i = 0; i < resp.data.length; i++) {
                                if(this.devs.indexOf(resp.data[i].devID) === -1) {
                                    this.devs.push(resp.data[i].devID);
                                }
                            }
                            this._powerFacade.getMixtureData(this.mixUrl + "?map_id=" + map_id + "&REL_DEV_ID=" + this.devs, function (data) {
                                    for(var j = 0; j < data.data.length; j++){
                                        var fid = data.data[j]['MERGE_FID'];
                                        if(this.devs.indexOf(fid) === -1) {
                                            this.devs.push(fid);
                                        }
                                    }
                                    for(var k = 0; k < this.devs.length; k++){
                                        var graphic = this.view.queryGraphicByDevId(this.devs[k]);
                                        if(graphic !== null){
                                            this.heightLight.push(graphic);
                                            var data ={};
                                            for(var attr = 0, value = graphic.feature.attributes; attr < value.length; attr++) {
                                                if(value[attr].name === "name"){
                                                    data.name = value[attr].value;
                                                }
                                                if(value[attr].name === "dev_id"){
                                                    data.devId = value[attr].value;
                                                }
                                                if(value[attr].name === "class_id") {
                                                    data.classId = value[attr].value;
                                                }
                                            }
                                            this.showMes.push(data);
                                        }
                                    }
                                    for(var m = 0; m < this.heightLight.length; m++) {
                                        this.heightLight[m].glow ={
                                            color: "#0ce386"
                                        }
                                    }
                                    this.view.threeRender();
                                    this.treeData = this._treedata.getParentData(this.dicArr.data, this.showMes);
                                   
                                    for(var item in this.treeData) {
                                        var rootBtn = domConstruct.create("div", {
                                            class: "simpleShowCon"
                                        }, dom.byId("mesListShow"));
                                        var parentBtn = domConstruct.create("div", {
                                            class: "treeBtn"
                                        }, rootBtn);
                                        domConstruct.create("span", {
                                            class: "pic",
                                        }, parentBtn);
                                        domConstruct.create("span", {
                                            class: "picName",
                                            innerHTML: item
                                        }, parentBtn);
                                        var childBtn = domConstruct.create("div", {
                                            class: "showMes"
                                        }, rootBtn);
                                        for(var m = 0; m < this.treeData[item].length; m++) {
                                            var devBtn = domConstruct.create("div", {
                                                class: "oneDev"
                                            }, childBtn);
                                            var table = domConstruct.create("table", {
                                                class: "table"
                                            }, devBtn);
                                            var tr = domConstruct.create("tr", {
                                                class:"simpleShowP",
                                                devId: this.treeData[item][m].devId
                                            }, table);
                                            domConstruct.create("td", {
                                                innerHTML: "名称",
                                                class: "tdTitle",
                                                devId: this.treeData[item][m].devId
                                            }, tr);
                                            domConstruct.create("td", {
                                                innerHTML: this.treeData[item][m].name,
                                                devId: this.treeData[item][m].devId
                                            }, tr);
                                            var tr2 = domConstruct.create("tr", {
                                                class:"simpleShowP",
                                                devId: this.treeData[item][m].devId
                                            }, table);
                                            domConstruct.create("td", {
                                                innerHTML: "资源ID",
                                                class: "tdTitle",
                                                devId: this.treeData[item][m].devId
                                            }, tr2);
                                            domConstruct.create("td", {
                                                innerHTML: this.treeData[item][m].devId,
                                                devId: this.treeData[item][m].devId
                                            }, tr2);
                                        }
                                        on(rootBtn, "click", function(e){
                                            if(e.target.getAttribute('class') === "pic"){
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
                                                    this.view.setCenter(graphic.position,null, this.view.resolution);
                                                    graphic.glow ={
                                                        color: "red"
                                                    };
                                                    this.view.threeRender();
                                                } else {
                                                    alert("此图无该设备");
                                                }
                                                this.currGraphic = graphic;
                                            }
                                            domClass.add(dom.byId("mesListShow"), "showScroll");
                                        }.bind(this));
                                    }
                            }.bind(this), function (err) {
                                console.log(err);
                            });
                        } 
                    }.bind(this), function (err) {
                        console.log(err);
                    });
                }
            }.bind(this));
        },

        restore: function() {
            if(this.click) {
                this.click.remove();
                this.click = null;
            }
            this.delCursor();
            this.resetDiv();
        },

        delCursor: function() {
            domClass.remove(query(".webgis-root")[0], "changeCursor");
            domClass.remove(this.ownerDocumentBody, "changeCursor");
        },

        resetDiv: function() {
            dom.byId("equName").innerHTML = "请选择设备";
            domConstruct.empty(dom.byId("mesListShow"));
            domClass.remove(dom.byId("mesListShow"), "showScroll");
            if(this.heightLight.length > 0) {
                for(var m = 0; m < this.heightLight.length; m++) {
                    this.heightLight[m].glow = null;
                }
                this.view.threeRender();
            };
        }
      
    });
});




