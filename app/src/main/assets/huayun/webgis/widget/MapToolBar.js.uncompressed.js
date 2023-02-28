require({cache:{
'url:com/huayun/webgis/templates/mapToolBar.html':"<div class=\"${baseClass}\" data-dojo-attach-event=\"onclick:onChange\">\r\n\r\n</div>"}});
/**
 *  @author :   JiGuangJie
 *  @date   :   2019/5/16
 *  @time   :   10:07
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/webgis/widget/MapToolBar", [
        "dojo/_base/declare",
        "dojo/dom-style",
        "dojo/dom-class",
        "dojo/topic",
        "dojo/query",
        "./components/buttons/Button",
        "./components/buttons/SelectedButton",
        "./components/buttons/DropDownButton",
        "./MapModuleX",
        "../action/ActionManager",
        "dojo/text!../templates/mapToolBar.html"
    ], function (declare, domStyle, domClass, topic, query, Button, SelectedButton, DropDownButton, MapModuleX, ActionManager, template) {
        topic.subscribe("mapSwitchDimension", function (d) {
            if (d === 2) {
                domClass.remove(query(".map-switch-view")[0], "map-state-3D");
                domClass.add(query(".map-switch-view")[0], "map-state-2D");
            } else if (d === 3) {
                domClass.remove(query(".map-switch-view")[0], "map-state-2D");
                domClass.add(query(".map-switch-view")[0], "map-state-3D");
            }
        });

        return declare("com.huayun.webgis.widget.MapToolBar", [MapModuleX], {
            templateString: template,
            baseClass: "map-tool-bar",

            constructor: function () {
                this.buttonList = [];
                this.gap = 0;
                this.id = "";
                this.layout = "vertical";
                this.map = null;
                this.view = null;
                this._currentDropBtn = null;
                this._currentDropId = "";
                this._lastDropId = "";

                topic.subscribe("mapOnClick", function () {
                    if (this._currentDropBtn !== null) {
                        this._currentDropBtn.invalid();
                    }
                }.bind(this));

                topic.subscribe("onMapToolBarChange", function (evt) {
                    if (this._currentDropBtn !== null) {
                        this._currentDropBtn.invalid();
                    }
                }.bind(this));
            },

            postCreate: function () {
                this.inherited(arguments);
                domStyle.set(this.domNode, "pointer-events", "all");
            },

            doInit: function () {
                //this.map = this.get("view").map;
                this.view = this.get("view");
                var configData = this.get("configData");
                this.buttonList = configData.buttons;
                this._layoutMethod(configData.layout);
                for (var i = 0; i < this.buttonList.length; i++) {
                    var aBtn = this.buttonList[i];
                    switch (aBtn.type.toLowerCase()) {
                        case "normal":
                            this._createNormalButton(aBtn);
                            break;
                        case "selected":
                            this._createSelectedButton(aBtn);
                            break;
                        case "drop-down":
                            this._createDropDownButton(aBtn);
                            break;
                        default:
                            break;
                    }
                }
            },
            /**
             * 按钮切换
             */
            onChange: function (evt) {
                // topic.publish("onMapToolBarChange", this.);
            },
            /**
             * 按钮的布局方法
             * @param type  vertical 垂直；hprozpmtal 水平
             * @private
             */
            _layoutMethod: function (type) {
                domClass.add(this.domNode, type);
            },

            /**
             * 创建普通按钮
             * @param value
             * @private
             */
            _createNormalButton: function (value) {
                value.showLabel = false;
                value.label = value["tool-tip"];
                var btn = new Button(value);
                if (value.action === "SwitchViewAction") {
                    if (this.view.is3DVision) {
                        domClass.add(btn.iconNode, "map-state-3D");
                    } else {
                        domClass.add(btn.iconNode, "map-state-2D");
                    }
                }
                btn.placeAt(this.domNode);
                btn.onClickFun = this._normalButtonClick.bind(this, {target: btn, params: value});
            },

            /**
             * 创建触发持续行为的按钮
             * @param value
             * @private
             */
            _createSelectedButton: function (value) {
                value.iconClass = value.id;
                value.showLabel = false;
                value.label = value["tool-tip"];
                var btn = new SelectedButton(value);
                btn.placeAt(this.domNode);
                btn.onClickFun = this._dropButtonSelected.bind(this, {target: btn, params: value});
            },

            /**
             * 创建下拉按钮
             * @param value
             * @private
             */
            _createDropDownButton: function (value) {
                var btn = new DropDownButton(value);
                btn.placeAt(this.domNode);
                btn.onSelected = this._dropButtonSelected.bind(this);
                btn.onClickFun = this._dropDownButtonClick.bind(this, {target: btn, params: value});
            },
            /**
             * 下拉框中的按钮选择触发的事件
             * @param params
             * @private
             */
            _dropButtonSelected: function (data) {
                data.params.view = this.view;
                var aAction = ActionManager.getInstance().createAction(data.params);
                if (aAction !== null) {
                    if (aAction.isActive) {   //有持续状态,当有持续状态的切换时要先使当前的Action失效
                        var currentAction = ActionManager.getInstance().getCurrentAction();
                        ActionManager.getInstance().invalidAction(currentAction);
                        ActionManager.getInstance().activeAction(aAction);
                        aAction.endActionMethod = this._endActionMethod.bind(this, aAction);
                    } else {
                        this._normalButtonClick({target: data.target, params: data.params});
                    }
                }
            },

            _dropDownButtonClick: function (data) {
                domClass.remove(this.view.domNode, "draw-cursor-style");
                topic.publish("onDropDownChange", data);
                if (this._lastDropId === "") {
                    this._currentDropBtn = data.target;
                    this._currentDropId = this._currentDropBtn.id;
                    this._lastDropId = this._currentDropId;
                } else {
                    if (this._lastDropId !== data.target.id) {
                        this._currentDropBtn.invalid();
                        this._currentDropBtn = data.target;
                        this._lastDropId = data.target.id;
                    }
                }
                var currentAction = ActionManager.getInstance().getCurrentAction();
                if (currentAction !== null) {
                    ActionManager.getInstance().invalidAction(currentAction);
                }
            },
            /**
             * 普通按钮点击后的触发
             * @param data
             * @private
             */
            _normalButtonClick: function (data) {
                topic.publish("onMapToolBarChange", data);
                data.params.view = this.view;
                var aAction = ActionManager.getInstance().createAction(data.params);
                var currentAction = ActionManager.getInstance().getCurrentAction();
                if (aAction && currentAction && aAction.isActive) {
                    ActionManager.getInstance().invalidAction(currentAction);
                }
                if (aAction !== null) {
                    aAction.endActionMethod = this._endActionMethod.bind(this, {
                        target: data.target,
                        currentAction: aAction
                    });
                    ActionManager.getInstance().doAction(aAction);
                }
            },

            _endActionMethod: function (data) {
                //TODO 完成绘制后按钮要修改的一些状态、样式等行为
            }
        });
    }
);