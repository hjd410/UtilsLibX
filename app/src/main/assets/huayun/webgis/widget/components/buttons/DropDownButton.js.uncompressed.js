/**
 *  @author :   JiGuangJie
 *  @date   :   2019/5/16
 *  @time   :   11:19
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/webgis/widget/components/buttons/DropDownButton", [
        "dojo/_base/declare",
        "dojo/on",
        "dojo/query",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/dom-style",
        "./SelectedButton",
        "./DropRightButton",
        "./Button"
    ], function (declare, on, query, domClass, domConstruct, domStyle, SelectedButton, DropRightButton, Button) {
        return declare("com.huayun.webgis.widget.components.buttons.DropDownButton", [Button], {
            _openState: false,

            onSelected: null,
            arrowSpan: null,
            spanBox: null,

            constructor: function (params) {
                // this.inherited(arguments);
                declare.safeMixin(this, params);
                params.iconClass = params["id"];
                this._openState = false;
            },

            postCreate: function () {
                this.inherited(arguments);
                this.spanBox = domConstruct.create("span", {className: "map-drop-down-box"});
                this.arrowSpan = domConstruct.create("span", {className: "map-tool-arrow-open"});
               // console.log(this.domNode);
                domConstruct.place(this.spanBox, this.domNode);
                domConstruct.place(this.arrowSpan, this.titleNode);
                // console.log(this.titleNode, this.focusNode);
                // console.log(this.params);
               // console.log(this.params.buttons);
                if (this.params.buttons.length > 0) {
                    for (var i = 0; i < this.params.buttons.length; i++) {
                        // console.log(this.params.buttons[i].type);
                        switch (this.params.buttons[i].type) {
                            case "normal":
                                this._createNormalButton(this.params.buttons[i]);
                                break;
                            case "selected":
                                this._createSelectedButton(this.params.buttons[i]);
                                break;
                            case "drop-right":
                                this._createDropRightButton(this.params.buttons[i]);
                                break;
                            default:
                                break;
                        }
                    }
                }
            },

            onClick: function () {
                this.inherited(arguments);
                this._openState = !this._openState;
                if (this._openState) {    //子按钮展开
                    domClass.remove(this.arrowSpan, "map-tool-arrow-open");
                    domClass.add(this.arrowSpan, "map-tool-arrow-close");
                    this._showMethod();
                } else {    //子按钮收起
                    domClass.remove(this.arrowSpan, "map-tool-arrow-close");
                    domClass.add(this.arrowSpan, "map-tool-arrow-open");
                    this._hideMethod();
                }
            },

            invalid: function () {
                if (this._openState) {
                    this._openState = !this._openState;
                    domClass.remove(this.arrowSpan, "map-tool-arrow-close");
                    domClass.add(this.arrowSpan, "map-tool-arrow-open");
                    this._hideMethod();
                }
            },
            /**
             * 创建普通按钮
             * @param value
             * @private
             */
            _createNormalButton: function (value) {
                value.iconClass = value["id"];
                var btn = new Button(value);
                btn.placeAt(this.spanBox);
                btn.onClickFun = this._normalButtonClick.bind(this, {target: btn, params: value});
            },
            /**
             * 创建拥有选择状态的按钮
             * @param value
             * @private
             */
            _createSelectedButton: function (value) {
                // value.onClick = this._normalButtonClick.bind(this, value);
                // console.log(require.toUrl(value.icon));
                // value.iconClass = require.toUrl(value.icon);
                // value.showLabel = false;
                value.iconClass = value["id"];
                var btn = new SelectedButton(value);
                btn.placeAt(this.spanBox);
                btn.onClickFun = this._normalButtonClick.bind(this, {target: btn, params: value});
            },
            /**
             * 创建下拉按钮
             * @param value
             * @private
             */
            _createDropRightButton: function (value) {
                var btn = new DropRightButton(value);
                btn.placeAt(this.spanBox);
                btn.onSelected = this._dropButtonSelected.bind(this);
                btn.onClickFun = this._dropDownButtonClick.bind(this, value);
            },
            /**
             * 点击后下级菜单展开
             * @param data
             * @private
             */
            _dropDownButtonClick: function (data) {
                // this.onClick.call(this, data);
            },
            _dropButtonSelected: function (data) {
                this._normalButtonClick(data);
            },
            /**
             * 下拉按钮点击
             * @param event
             * @private
             */
            // _onClick: function (event) {
            //     debugger;
            //     this._openState = !this._openState;
            //     if (this._openState) {    //子按钮展开
            //         domClass.remove(this.arrowSpan, "map-tool-arrow-open");
            //         domClass.add(this.arrowSpan, "map-tool-arrow-close");
            //         this._showMethod();
            //     } else {    //子按钮收起
            //         domClass.remove(this.arrowSpan, "map-tool-arrow-close");
            //         domClass.add(this.arrowSpan, "map-tool-arrow-open");
            //         this._hideMethod();
            //     }
            // },

            _showMethod: function () {
                domStyle.set(this.spanBox, "display", "block");
            },

            _normalButtonClick: function (data) {
                this._clickMethod();
                this.onSelected.call(this, data);
            },

            _hideMethod: function () {
                domStyle.set(this.spanBox, "display", "none");
            },
            /**
             * 子按钮点
             * @private
             */
            _clickMethod: function () {
                this._openState = false;
                domClass.remove(this.arrowSpan, "map-tool-arrow-close");
                domClass.add(this.arrowSpan, "map-tool-arrow-open");
                this._hideMethod();
            }
        });
    }
);