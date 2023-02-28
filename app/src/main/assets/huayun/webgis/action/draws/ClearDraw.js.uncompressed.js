define(
    "com/huayun/webgis/action/draws/ClearDraw", [
        "dojo/_base/declare",
        "dojo/on",
        "dojo/dom-class",
        "../MapAction"
    ], function (declare, on, domClass, MapAction) {
        return declare("com.huayun.webgis.action.draws.ClearDraw", [MapAction], {

            constructor: function (params) {
                declare.safeMixin(params);
                this.isActive = false;
                this.view = params.view;
                this.drawLayer = this.view.map.findLayerById("drawLayer");
            },


            doAction: function (params) {
                this.view.panEnabled = true;
                this.view.selectEnabled = true;
                // this.drawLayer.currentGraphic = null;
                this.drawLayer.clear();
                // this.map.domNode.style.cursor = "pointer";
                domClass.remove(this.view.domNode, "draw-cursor-style");
            }
        });
    }
);