define(
    "com/huayun/webgis/action/history/NextView", [
        "dojo/_base/declare",
        "../MapAction"
    ], function (declare, MapAction) {
        return declare("com.huayun.webgis.action.zooms.ZoomIn", [MapAction], {

            constructor: function (params) {
                declare.safeMixin(params);
                this.isActive = false;
                this.view = params.view;
            },

            doAction: function () {
                this.view.setView(false);
            }
        });
    }
);