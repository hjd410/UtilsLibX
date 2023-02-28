define(
    "com/huayun/webgis/action/LayerControllerAction", [
        "dojo/_base/declare",
        "dojo/topic",
        "./MapAction"
    ], function (declare, topic, MapAction) {
        return declare("com.huayun.webgis.action.LayerControllerAction", [MapAction], {

            constructor: function (params) {
                declare.safeMixin(params);
                this.map = params.map;
            },

            doAction: function () {
                debugger;
                topic.publish("widgetDialogContent", "layerController", "图层控制");
            }
        });
    }
);