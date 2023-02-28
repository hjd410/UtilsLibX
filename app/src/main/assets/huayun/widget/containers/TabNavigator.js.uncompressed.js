/**
 *  @author :   JiGuangJie
 *  @date   :   2019/1/3
 *  @time   :   9:16
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/widget/containers/TabNavigator", [
        "dojo/_base/declare",
        "dojo/dom-construct",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/on",
        "dojo/mouse",
        "dojo/_base/fx",
        "dojo/topic",
        "./ViewStack",
        "../../util/StringHelp",
        "../../util/HashTable",
        "../../framework/ModuleXContainer"
    ], function (declare, domConstruct, domClass, domStyle, on, mouse,baseFx,topic, ViewStack, StringHelp, HashTable, ModuleXContainer) {
        return declare("com.huayun.widget.containers.TabNavigator", [ModuleXContainer], {
            lastSelectedIndex: 0,
            _viewStack: null,
            _tabBarList: [],
            _moduleList: [],
            _moduleHash: null,

            constructor: function () {
                // console.log(">>>TabNavigator constructor..................");
            },
            postCreate: function () {
                this.inherited(arguments);
                domStyle.set(this.domNode, "pointer-events", "all");
                this._moduleHash = new HashTable();
            },

            doInit: function () {
                this._viewStack = new ViewStack();
                this._viewStack.placeAt(this.domNode);
                this._viewStack.startup();
                domStyle.set(this._viewStack.domNode, "top", "38px");
                var configData = this.get("configData");
                this._moduleList = configData["configuration"]["container"]["modules"];
                this._createTabBar(this._moduleList);
                this._createBackButton();
                this._createModuelHash(this._moduleList);
                this.inherited(arguments);
            },

            /*
            * 创建回退按钮,隐藏左侧功能窗口
            */
            _createBackButton:function(){
                var backBtn = domConstruct.create("span", {
                    style: "display:none;width: 20px;height:99px;position:absolute;top:45%;left:388px;" +
                    "cursor:pointer;background:url('../dojo/com/huayun/widget/images/hide_btn.png') no-repeat center"
                }, this.domNode);
                on(backBtn, "click", function(){
                    baseFx.animateProperty({
                        node:this.domNode,
                        properties:{
                            left: -400
                        },
                        duration: 400
                    }).play();

                    var temp = this.context.lookUp("LeftDisplayButton");
                    domStyle.set(temp.domNode,"display","block");
                }.bind(this));

                on(this.domNode,mouse.enter,function(evt){
                    domStyle.set(backBtn, "display", "block");
                }.bind(this));
                on(this.domNode,mouse.leave,function(evt){
                    domStyle.set(backBtn, "display", "none");
                }.bind(this));
            },


            /**
             * 创建Tab切换按钮
             * @param list
             * @private
             */
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

            getBeanHandler: function (moduleX) {
                this.cacheHash.put(this.currentId, this.currentIdentifyId, moduleX);
                this.dispalyListHash.put(this.currentId, this.currentIdentifyId, moduleX);
                moduleX.set("moduleXVo", this.currentModuleXVo);
                var propertys = this.currentModuleXVo.propertys;
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
                moduleX.set("onReadyFun", this.modulePreLoad.bind(this, moduleX));
                this._viewStack.addChild(moduleX);
            },
            /**
             * 创建切换module，并存入hash中
             * @param list
             * @private
             */
            _createModuelHash: function (list) {
                for (var i = 0; i < list.length; i++) {
                    var propertys = list[i]["propertys"];
                    for (var j = 0; j < propertys.length; j++) {
                        var property = propertys[j];
                        if (property.name === "label") {
                            this._moduleHash.put(property.value, list[i]);
                            continue;
                        }
                    }
                }
            },

            /**
             * tabBar切换时候触发的事件
             * @param event
             * @private
             */
            _tabChangeHandler: function (event) {
                this._cleanTabButtonStyle();
                domStyle.set(event.target, {"background": "#3385ff", "color": "#fff"});

                var index = this._tabBarList.indexOf(event.target);
                if (index > -1) {
                    var key = event.target.innerHTML;
                    var selectModuleData = this._moduleHash.get(key);
                    var id = selectModuleData.id;
                    var identifyId = selectModuleData.identifyId;
                    var theModule = this.findModuleX(id, identifyId);
                    if (!StringHelp.isSpace(theModule)) {
                        // this._viewStack.selectedIndex(index);
                        this._viewStack.selectedChild(theModule);
                    } else {
                        this.createModuleX(id, identifyId, function () {
                            theModule = this.findModuleX(id, identifyId);
                            // this._viewStack.selectedIndex(index);
                            this._viewStack.selectedChild(theModule);
                        });
                    }
                }
                topic.publish("tabChange", this._viewStack.selectedItem);
            },
            /**
             *  清除选中的按钮的样式
             * @private
             */
            _cleanTabButtonStyle: function () {
                for (var i = 0; i < this._tabBarList.length; i++) {
                    domStyle.set(this._tabBarList[i], {"background": "#FFF", "color": "#333"});
                }
            }
        });
    }
);