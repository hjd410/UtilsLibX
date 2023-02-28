define(
    "com/huayun/webgis/action/history/PreView", [
        "dojo/_base/declare",
        "../MapAction"
    ], function (declare, MapAction) {
        return declare("com.huayun.webgis.action.history.PreView", [MapAction], {

            constructor: function (params) {
                // console.log(params);
                
                declare.safeMixin(params);
                this.isActive = false;
                this.view = params.view;
            },

            doAction: function () {
                this.view.setView(true);
            }
        });
    }
);