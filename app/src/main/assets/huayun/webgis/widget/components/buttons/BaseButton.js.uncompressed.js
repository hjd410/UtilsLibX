/**
 *  @author :   JiGuangJie
 *  @date   :   2019/5/16
 *  @time   :   11:19
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/webgis/widget/components/buttons/BaseButton", [
        "dojo/_base/declare",
        "dijit/form/Button"
    ], function (declare, Button) {
        return declare("com.huayun.webgis.widget.components.buttons.BaseButton", [Button], {
            action: null,
            condition: "all",
            id: "",
            label: "",
            toolTip: "",
            type: "normal",

            constructor: function (params) {
                this.action = null;
                this.condition = "all";
                this.id = "";
                this.label = "";
                this.toolTip = "";
                this.type = "normal";

                this.toolTipNode = null;
                declare.safeMixin(this, params);
            },

            postCreate: function () {
                this.inherited(arguments);
                // console.log(this.domNode, this.params["tool-tip"]);
                this.domNode.title = this.params["tool-tip"];
            }
        });
    }
);