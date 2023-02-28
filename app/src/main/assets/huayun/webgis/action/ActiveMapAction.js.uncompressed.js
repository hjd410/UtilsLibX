define("com/huayun/webgis/action/ActiveMapAction", [
    "dojo/_base/declare",
    "./ActiveAction"
], function (declare,ActiveAction) {
    return declare("com.huayun.webgis.action.ActiveMapAction",[ActiveAction], {
        map: null,
        constructor: function (params) {
            // 构造函数, 初始化
            // declare.safeMixin(params);
            this.map = null;
        },

        active: function () {
            // 根据参数isActive的true或false切换地图功能和状态
        },

        invalid:function () {

        },

        /**
         * 行为要做的具体事情
         * @param params
         */
        doActive:function (params) {
            //TODO
        }
    });
});