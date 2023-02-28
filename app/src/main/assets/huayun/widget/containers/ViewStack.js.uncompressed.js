/**
 *  @author :   JiGuangJie
 *  @date   :   2019/1/3
 *  @time   :   9:16
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/widget/containers/ViewStack", [
        "dojo/_base/declare",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/topic",
        "dijit/layout/ContentPane",
        "dijit/layout/StackContainer",
        "../ModuleX"

    ], function (declare, domClass, domStyle, topic, ContentPane, StackContainer, ModuleX) {
        return declare("com.huayun.widget.containers.ViewStack", [ModuleX], {
            _contentPanelList: [],
            _stackContainer: null,

            selectedItem: null,


            constructor: function () {
                // console.log(">>>TabNavigator constructor..................");
            },

            postCreate: function () {
                this.inherited(arguments);
                domStyle.set(this.domNode, {
                    "position": "absolute",
                    "width": "400px",
                    "height": "100%",
                    "left": "0"
                });
            },

            doInit: function () {
                this._stackContainer = new StackContainer(
                    {
                        id: "progStackContainerId"
                    }, this.domNode
                );
                this._stackContainer.startup();
            },

            addChild: function (child) {
                var label = this._getLabel(child);
                var contentPanel = new ContentPane({
                    title: label
                });
                this._contentPanelList.push(contentPanel);
                this._stackContainer.addChild(contentPanel);
                // console.log(label, child, contentPanel);
                child.placeAt(contentPanel);
                child.startup();
            },

            addChildAt: function (child, index) {

            },

            removeChild: function (child) {

            },

            selectedIndex: function (index) {
                /*                if(index > this._contentPanelList.length - 1){  //超出索引范围
                                    console.error("超出当前面板列表索引范围");
                                    return;
                                }
                                this.selectedItem = this._contentPanelList[index];
                                this._stackContainer.selectChild(this.selectedItem);*/
            },

            selectedChild: function (child) {
                for (var i = 0; i < this._contentPanelList.length; i++) {
                    if (child.label === this._contentPanelList[i]["title"]) {
                        this.selectedItem = this._contentPanelList[i];
                        // console.log(this.selectedItem);
                        this._stackContainer.selectChild(this.selectedItem);
                    }
                }

                // this.selectedItem = child;
                // this._stackContainer.selectChild(child);
            },

            _getLabel: function (child) {
                var propertys = child.get("propertys");
                for (var i = 0; i < propertys.length; i++) {
                    var theProperty = propertys[i];
                    if (theProperty.name === "label") {
                        return theProperty.value;
                    }
                }
                return "";
            }

            /*startup: function () {
                // console.log(this.selectedIndex, this.selectedStyle, this.menuList);
                for (var i = 0; i < this.menuList.length; i++) {
                    var btn = this.menuList[i];
                    btn.placeAt(this.domNode);
                    btn.startup();
                }

                var selectBtn = this.menuList[this.selectedIndex];
                domClass.add(selectBtn.domNode, this.selectedStyle);
                this.lastSelectedIndex = this.selectedIndex;
                topic.subscribe("mouseClick", function (target) {
                    // console.log(">>>TabNavigator selected btn", target);
                    this.selectedIndex = this.menuList.indexOf(target);
                    if (this.lastSelectedIndex !== this.selectedIndex) {
                        this.clearnStyle();
                        domClass.add(target.domNode, this.selectedStyle);
                        this.lastSelectedIndex = this.selectedIndex;
                        topic.publish("menuChange", target);
                    }
                }.bind(this));
            },
            clearnStyle: function () {
                var lasteSelectBtn = this.menuList[this.lastSelectedIndex];
                domClass.remove(lasteSelectBtn.domNode, this.selectedStyle);
            },
            /!**
             * 设置选择index
             * @param index
             * @private
             *!/
            _setSelectedIndexAttr: function (index) {
                if (index < 0 || index > this.menuList.length) {
                    console.error("超出索引范围");
                }
                this.clearnStyle();
                var selectBtn = this.menuList[index];
                domClass.add(selectBtn.domNode, this.selectedStyle);
                this.selectedIndex = index;
                this.lastSelectedIndex = this.selectedIndex;
            }*/
        });
    }
)
;