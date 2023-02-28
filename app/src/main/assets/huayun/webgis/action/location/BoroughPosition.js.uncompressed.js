define(
    "com/huayun/webgis/action/location/BoroughPosition", [
        "dojo/_base/declare",
        "dojo/topic",
        "../MapAction"
    ], function (declare, topic, MapAction) {
        return declare("com.huayun.webgis.action.location.BoroughPosition", [MapAction], {

            constructor: function (params) {
                declare.safeMixin(params);
                this.isActive = false;
                this.map = params.map;
            },

            doAction: function () {
                topic.publish("widgetDialogContent", "boroughLocation", "行政区定位");//第二各參數和bean.json里組件配置id一樣,小寫開頭
            }
        });
    }
);