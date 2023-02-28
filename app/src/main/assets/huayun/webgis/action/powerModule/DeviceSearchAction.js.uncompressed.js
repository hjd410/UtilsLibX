define(
    "com/huayun/webgis/action/powerModule/DeviceSearchAction", [
        "dojo/_base/declare",
        "dojo/topic",
        "../MapAction"
    ], function (declare, topic, MapAction) {
        return declare("com.huayun.webgis.action.powerModule.DeviceSearchAction", [MapAction], {
            constructor: function (params) {
                declare.safeMixin(params);
                this.isActive = false;
                this.map = params.map;
            },

            doAction: function () {
                topic.publish("widgetDialogContent", "deviceSearch", "设备搜索");//第二个参数和bean.json里組件配置id一样,小写开头
            }
        });
    }
);