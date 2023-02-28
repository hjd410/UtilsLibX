/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/10
 *  @time   :   14:29
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/facades/TileInfoFacade", [
        "dojo/_base/declare",
        "dojo/request"
    ], function (declare, request) {
        return declare("com.huayun.facades.TileInfoFacade", null, {
            constructor: function () {
            },
            /**
             * 切片信息 json数据
             * @param url
             * @param result
             * @param fault
             */
            getTileInfoData: function (url, result, fault) {
                var token = dojoConfig.token;
                var headers = token?{"access-key": token}:{}
                request.get(url, {handleAs: "json", headers: headers}).then(function (data) {
                    result(data);
                }, function (err) {
                    fault(err);
                });
            }
        });
    }
);