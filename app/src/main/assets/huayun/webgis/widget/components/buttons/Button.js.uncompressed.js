/**
 *  @author :   JiGuangJie
 *  @date   :   2019/5/16
 *  @time   :   11:19
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/webgis/widget/components/buttons/Button", [
        "dojo/_base/declare",
        "./BaseButton"
    ], function (declare, BaseButton) {
        return declare("com.huayun.webgis.widget.components.buttons.Button", [BaseButton], {

            onClickFun: null,    //鼠标点击的回调

            constructor: function (params) {
                // this.inherited(arguments);
                params.iconClass = params.id;
                declare.safeMixin(this, params);
                this.onClickFun = null;
                // topic.publish();
            },

            postCreate: function () {
                this.inherited(arguments);
                // console.log(this.domNode, this.params["tool-tip"]);
            },

            onClick: function () {
                this.onClickFun.call(this);
            }
        });
    }
);