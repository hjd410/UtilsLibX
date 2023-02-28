define(
    "com/huayun/webgis/action/MapPanAction", [
        "dojo/_base/declare",
        "dojo/dom-class",
        "./MapAction"
    ], function (declare, domClass, MapAction) {
        return declare("com.huayun.webgis.action.MapPanAction", [MapAction], {

            constructor: function (params) {
                declare.safeMixin(params);
                this.view = params.view;
            },

            doAction: function () {
                this.view.panEnabled = true;
                // this.view.domNode.style.cursor = "pointer";
                domClass.remove(this.view.domNode, "draw-cursor-style");
            }
        });
    }
);