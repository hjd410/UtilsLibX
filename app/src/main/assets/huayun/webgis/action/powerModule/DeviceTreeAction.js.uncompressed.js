define(
    "com/huayun/webgis/action/powerModule/DeviceTreeAction", [
        "dojo/_base/declare",
        "dojo/topic",
        "../MapAction"
    ], function (declare, topic, MapAction) {
        return declare("com.huayun.webgis.action.powerModule.DeviceTreeAction", [MapAction], {
            constructor: function (params) {
                declare.safeMixin(params);
                this.isActive = false;
                this.map = params.map;
            },

            doAction: function () {
                topic.publish("widgetDialogContent", "deviceTree", "设备树");//第二个参数和bean.json里組件配置id一样,小写开头
            }
        });
    }
);