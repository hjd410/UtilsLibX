define("com/huayun/webgis/widget/WidgetDialog", [
    "dojo/_base/declare",
    "dojo/dom-style",
    "dijit/Dialog",
    "dojo/topic",
    "../../framework/ModuleXContainer"
], function (declare, domStyle, Dialog, topic, ModuleXContainer) {
    return declare("com.huayun.webgis.widget.WidgetDialog", [ModuleXContainer], {
        _showFlag: false,   //当前弹出框是否弹出,false 未弹出; true 弹出

        constructor: function () {
            this.inherited(arguments);
            this._dialog = null;
            this._currentWidget = null;
            this.top = null,
            this.right = null,
            this.left = null,
            this.bottom = null
        },

        postCreate: function () {
            this.inherited(arguments);
            // domStyle.set(this.domNode, "pointer-events", "all");
            this._dialog = new Dialog({
                id: "widget-dialog",
                title: "弹出框",
                content: "",
                style: "width: 417px;pointer-events:all"
            });
            // this._dialog.startup();
            // this._dialog.set(this.domNode, "pointer-events", "all");
            // this._dialog.placeAt(this.domNode);
            topic.subscribe("mapOnClick", function () {
                if (this._showFlag) {
                    this.hide();
                }
            }.bind(this));

            topic.subscribe("onMapToolBarChange", function (evt) {
                if (this._showFlag) {
                    this.hide();
                }
            }.bind(this));
            topic.subscribe("onDropDownChange", function (evt) {
                if (this._showFlag) {
                    this.hide();
                }
            }.bind(this));
        },

        doInit: function () {
            if(this.get("top")) {
                this.top = this.get("top");
            }
            if(this.get("right")) {
                this.right = this.get("right");
            }
            if(this.get("left")) {
                this.left = this.get("left");
            }
            if(this.get("bottom")) {
                this.bottom = this.get("bottom");
            }
            this.right = this.get("right");
            topic.subscribe("widgetDialogContent", function (item, title) {
                if (this._currentWidget === item) {
                    this.show();
                } else {
                    var widget = this.context.lookUp(item);
                    this._currentWidget = item;
                    if (widget === null) {
                        this.createModuleX(item, null, function () {
                            widget = this.context.lookUp(item);
                            this._dialog.removeChild(this._dialog.getChildren()[0]);
                            this._dialog.addChild(widget);
                            this._dialog.set("title", title);
                            this.show();
                        }.bind(this));
                    } else {
                        this._dialog.removeChild(this._dialog.getChildren()[0]);
                        this._dialog.addChild(widget);
                        this._dialog.set("title", title);
                        this.show();
                    }
                    /*if(widget === null){
                        this.context.getBean(item,null,function (data) {
                            console.log(data);
                            this._dialog.removeChild(this._dialog.getChildren()[0]);
                            data.set("propertys", [{
                                "name": "mapModuleBeanId",
                                "value": "simpleMapModule3D"
                            }]);
                            data.placeAt(this._dialog.containerNode);
                            data.startup();
                            this._dialog.set("title", title);
                            this.show();
                        }.bind(this));
                    }else {
                        this._dialog.removeChild(this._dialog.getChildren()[0]);
                        this._dialog.addChild(widget);
                        this._dialog.set("title", title);
                        this.show();
                    }*/
                }
            }.bind(this));
        },

        show: function () {
            this._showFlag = true;
            this._dialog.show();
            this._dialog.domNode.style.right = this.right;
            this._dialog.domNode.style.top = this.top;
            this._dialog.domNode.style.left = this.left;
            this._dialog.domNode.style.bottom = this.bottom;
        },
        hide: function () {
            this._showFlag = false;
            this._dialog.hide();
        }
    });
});