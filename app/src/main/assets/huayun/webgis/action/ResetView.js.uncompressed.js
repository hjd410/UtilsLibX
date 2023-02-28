define(
    "com/huayun/webgis/action/ResetView", [
        "dojo/_base/declare",
        "./MapAction"
    ], function (declare, MapAction) {
        return declare("com.huayun.webgis.action.ResetView", [MapAction], {

            constructor: function (params) {
                declare.safeMixin(params);
                this.isActive = false;
                this.view = params.view;
            },

            doAction: function () {
                this.view.resetExtent();
                // this.endActionMethod.call();
            }
        });
    }
);