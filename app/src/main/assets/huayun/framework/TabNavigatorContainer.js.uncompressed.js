/**
 *  @author :   JiGuangJie
 *  @date   :   2019/3/20
 *  @time   :   9:04
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/framework/TabNavigatorContainer", [
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/on",
        "dijit/layout/ContentPane",
        "dijit/layout/StackContainer",
        "../util/StringHelp",
        "./ModuleXContainer"
    ], function (declare, domConstruct, domClass, domStyle, on, ContentPane, StackContainer, StringHelp, ModuleXContainer) {
        return declare("com.huayun.framework.TabNavigatorContainer", [ModuleXContainer], {
            _stackContainer: null,
            _tabBarList: [],
            _contentPanelList: [],
            _progNode:null,

            constructor: function () {

            },

            postCreate: function () {
                this.inherited(arguments);
                domStyle.set(this.domNode, "pointer-events", "all");
                // domConstruct.create("div", {id: "scontroller-prog"}, this.domNode);
                this._progNode = domConstruct.create("div", {
                    id: "scontainer-prog",
                    style: "position:absolute;width:100%;height:100%;left:0;top:38px"
                }, this.domNode);
            },

            doInit: function () {
                var modules = this.get("configData").configuration.container.modules;
                this._stackContainer = new StackContainer(
                    {
                        id: "progStackContainerId"
                    }, this._progNode
                );
                this._stackContainer.startup();
                this.inherited(arguments);
                this._createTabBar(modules);
            },

            _createTabBar: function (list) {
                for (var i = 0; i < list.length; i++) {
                    var propertys = list[i]["propertys"];
                    for (var j = 0; j < propertys.length; j++) {
                        var property = propertys[j];
                        if (property.name === "label") {
                            var tabBtn = domConstruct.create("div", {
                                style: "width:80px;height:36px;float:left;text-align:center;line-height:36px;cursor:default;font-size:14px;color:#333;cursor:pointer;",
                                innerHTML: property.value
                            }, this.domNode);
                            on(tabBtn, "click", this._tabChangeHandler.bind(this));
                            this._tabBarList.push(tabBtn);
                            continue;
                        }
                    }
                }
                domStyle.set(this._tabBarList[0], "background", "#3385ff");
                domConstruct.create("hr", {style: "position:absolute;left:0;top:37px;width:100%;background-color:#cdcdcd"}, this.domNode);
            },
            /**
             * tabBar切换时候触发的事件
             * @param event
             * @private
             */
            _tabChangeHandler: function (event) {
                this._cleanTabButtonStyle();
                domStyle.set(event.target, {"background": "#3385ff","color":"#fff"});
                var index = this._tabBarList.indexOf(event.target);
                if (index > -1) {
                    var thePanel = this._contentPanelList[index];
                    // console.log(thePanel);
                    this._stackContainer.selectChild(thePanel);
                }
            },
            /**
             *  清除选中的按钮的样式
             * @private
             */
            _cleanTabButtonStyle: function () {
                for (var i = 0; i < this._tabBarList.length; i++) {
                    domStyle.set(this._tabBarList[i], {"background": "#FFF","color":"#333"});
                }
            },

            getBeanHandler: function (moduleX) {
                // console.log(this.domNode.width,this.domNode.height);
                this.cacheHash.put(this.currentId, this.currentIdentifyId, moduleX);
                this.dispalyListHash.put(this.currentId, this.currentIdentifyId, moduleX);
                var propertys = this.currentModuleXVo.propertys;
                moduleX.set("moduleXVo", this.currentModuleXVo);
                moduleX.set("propertys", propertys);
                moduleX.set("style", this.currentModuleXVo.style);
                // moduleX.set("setMethod",this.currentModuleXVo.style);
                var methodList = this.currentModuleXVo["setMethod"];
                if (!StringHelp.isSpace(methodList)) {
                    for (var j = 0; j < methodList.length; j++) {
                        var methodObj = methodList[j];
                        moduleX.set(methodObj.name, methodObj.value);
                    }
                }
                // moduleX.set("isConfigData", !StringHelp.isSpace(this.currentModuleXVo.configUrl));
                moduleX.set("onReadyFun", this.modulePreLoad.bind(this, moduleX));
                for (var i = 0; i < propertys.length; i++) {
                    var theProperty = propertys[i];
                    if (theProperty.name === "label") {
                        var contentPanel = new ContentPane({
                            title: theProperty.value
                        });
                        this._contentPanelList.push(contentPanel);
                        this._stackContainer.addChild(contentPanel);
                        moduleX.placeAt(contentPanel);
                    }
                }
                moduleX.startup();
            }
        });
    }
);