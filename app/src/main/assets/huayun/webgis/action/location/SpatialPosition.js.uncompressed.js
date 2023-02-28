define(
    "com/huayun/webgis/action/location/SpatialPosition", [
        "dojo/_base/declare",
        "dojo/topic",
        "../../widget/MapModuleX",
        "../MapAction"
    ], function (declare, topic, MapModuleX,MapAction) {
        return declare("com.huayun.webgis.action.location.SpatialPosition", [MapAction], {
            constructor: function (params) {
                declare.safeMixin(params);
                this.isActive = false;
            },
            doAction: function () {
                topic.publish("widgetDialogContent", "buildingLocating", "空间对象定位");
            }
        });
    }
);