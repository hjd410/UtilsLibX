define(
    "com/huayun/webgis/action/SwitchViewAction", [
        "dojo/_base/declare",
        "dojo/topic",
        "./MapAction"
    ], function (declare, topic, MapAction) {
        return declare("com.huayun.webgis.action.SwitchViewAction", [MapAction], {

            constructor: function (params) {
                declare.safeMixin(params);
                this.isActive = false;
                this.view = params.view;
            },

            doAction: function () {
                if (this.view.is3DVision) {
                    this.view.setDimensions(2);
                } else {
                    this.view.setDimensions(3);
                }
            }
        });
    }
);