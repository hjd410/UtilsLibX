/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/6
 *  @time   :   14:08
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/module/MainForm", [
        "dojo/_base/declare",
        "dojo/ready",
        "dojo/dom",
        "../util/StringHelp",
        "../framework/ModuleXContainer",
        "../framework/ViewerContainer"
    ],
    function (declare, ready, dom, StringHelp, ModuleXContainer, ViewerContainer) {
        return declare("com.huayun.module.MainForm", [ModuleXContainer], {
            viewerContainer: null,

            constructor: function () {

            },

            postCreate: function () {
                // this._completeFlag = true;
                this.inherited(arguments);
                this.viewerContainer = new ViewerContainer({
                    id: "viewerContainerId"
                });
                this.viewerContainer.placeAt(this.domNode);
            },

            doInit: function () {
                // console.log(">>>MainForm创建和装载匀已完成");
                var configData = this.get("configData");
                // console.log(configData);
                if (!StringHelp.isSpace(configData)) {
                    this.viewerContainer.set("configData", configData);
                    this.viewerContainer.startup();
                }
            }
        });
    }
);