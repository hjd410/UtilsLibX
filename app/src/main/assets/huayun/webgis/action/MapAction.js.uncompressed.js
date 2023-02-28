define("com/huayun/webgis/action/MapAction", [
    "dojo/_base/declare",
    "./ActiveAction"
], function (declare,ActiveAction) {
    return declare("com.huayun.webgis.action.MapAction",[ActiveAction], {
        view: null,
        constructor: function (params) {
            // 构造函数, 初始化
            this.view = null;
        },

        doActive:function (params) {
            //TODO
        }
    });
});