define(
    "com/huayun/webgis/action/location/CoordinatePosition", [
        "dojo/_base/declare",
        "dojo/topic",
        "../MapAction"
    ], function (declare, topic, MapAction) {
        return declare("com.huayun.webgis.action.location.CoordinatePosition", [MapAction], {

            constructor: function (params) {
                declare.safeMixin(params);
                this.isActive = false;
                this.map = params.map;
            },

            doAction: function () {
                topic.publish("widgetDialogContent", "locatingController", "坐标定位");
            }
        });
    }
);