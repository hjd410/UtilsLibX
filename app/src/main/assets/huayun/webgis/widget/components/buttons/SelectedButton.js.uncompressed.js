/**
 *  @author :   JiGuangJie
 *  @date   :   2019/5/16
 *  @time   :   11:19
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/webgis/widget/components/buttons/SelectedButton", [
        "dojo/_base/declare",
        "./Button"
    ], function (declare,Button) {
        return declare("com.huayun.webgis.widget.components.buttons.SelectedButton", [Button], {
            //templateString:"<div></div>",

            constructor: function (params) {
                this.inherited(arguments);
                declare.safeMixin(this, params);
                // console.log("selected button constructor");
                // topic.publish();
            },

            postCreate: function () {
                this.inherited(arguments);
                // console.log(this.domNode, this.params["tool-tip"]);
                // this.toolTipNode = domConstruct.create("span", {class: "tool-tip"});
                // if (this.params["tool-tip"] !== "") {
                //     on(this.domNode, "mouseover", this._onMouseOver.bind(this));
                //     on(this.domNode, "mouseout", this._onMouseOut.bind(this));
                // }
            },

            _onMouseOver: function (event) {
                event.preventDefault();
                event.stopPropagation();
                this.toolTipNode.innerHTML = this.params["tool-tip"];
                // this.toolTipNode.x = 0;
                // console.log(event);
                // domStyle.set(this.toolTipNode, {left: event.screenX, top: event.screenY});
                domConstruct.place(this.toolTipNode, this.domNode);
                // console.log("mouse over", this, node);
            },

            _onMouseOut: function (event) {
                event.preventDefault();
                event.stopPropagation();
                domConstruct.destroy(this.toolTipNode);
                // console.log("mouse out", this, event);
            }
        });
    }
);