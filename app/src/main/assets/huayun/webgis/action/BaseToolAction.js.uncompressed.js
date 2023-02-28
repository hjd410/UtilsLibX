define(
    "com/huayun/webgis/action/BaseToolAction", [
        "dojo/_base/declare",
        "./MapAction"
    ], function (declare, MapAction) {
        return declare("com.huayun.webgis.action.BaseToolAction", [MapAction], {
            
            constructor: function (params) {
                // 构造函数, 初始化
            },
            draw: function (target) {
                //TODO 具体功能由子类实现
            },
            drawEnd: function () {
                //TODO 具体功能由子类实现
            },
            clear: function () {
                //TODO 具体功能由子类实现
            }
        });
    }
);