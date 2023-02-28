define(
    "com/huayun/webgis/action/zooms/ZoomOut", [
        "dojo/_base/declare",
        "../MapAction"
    ],function (declare,MapAction) {
        return declare("com.huayun.webgis.action.zooms.ZoomOut",[MapAction],{

            constructor:function (params) {
                declare.safeMixin(params);
                this.isActive = false;
                this.view = params.view;
            },

            doAction:function () {
                this.view.zoomOut();
                // this.endActionMethod.call();
            }
        });
    }
);