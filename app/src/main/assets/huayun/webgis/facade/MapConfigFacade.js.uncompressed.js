define(
    "com/huayun/webgis/facade/MapConfigFacade", [
        "dojo/_base/declare",
        "dojo/request"
    ], function (declare, request) {

        return declare("com.huayun.webgis.facade.MapConfigFacade", null, {
            url:"",

            constructor: function (params) {
                this._url = params.url;
            },
            /**
             * 获取地图配置文件
             * @param result
             * @param fault
             */
            getMapConfigData:function (result,fault) {
                request.get(this._url,{handleAs:"json"}).then(function (data) {
                    result(data);
                },function (err) {
                    fault(err);
                });
            }
        });
    });