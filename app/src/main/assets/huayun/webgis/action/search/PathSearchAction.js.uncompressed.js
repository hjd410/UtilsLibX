define(
    "com/huayun/webgis/action/search/PathSearchAction", [
        "dojo/_base/declare",
        "dojo/topic",
        "../MapAction"
    ], function (declare, topic, MapAction) {
        return declare("com.huayun.webgis.action.search.PathSearchAction", [MapAction], {

            constructor: function (params) {
                declare.safeMixin(params);
                this.isActive = false;
                this.map = params.map;
            },

            doAction: function () {
                topic.publish("widgetDialogContent", "pathPlanningSearch", "路径规划搜索");
            }
        });
    }
);