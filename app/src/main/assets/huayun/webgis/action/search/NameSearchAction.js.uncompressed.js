define(
    "com/huayun/webgis/action/search/NameSearchAction", [
        "dojo/_base/declare",
        "dojo/topic",
        "../MapAction"
    ], function (declare, topic, MapAction) {
        return declare("com.huayun.webgis.action.search.NameSearchAction", [MapAction], {

            constructor: function (params) {
                declare.safeMixin(params);
                this.isActive = false;
                this.view = params.view;
            },

            doAction: function () {
                topic.publish("widgetDialogContent", "nameSearch", "地名搜索");
            }
        });
    }
);