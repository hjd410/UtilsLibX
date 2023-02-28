/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/10
 *  @time   :   14:29
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/facades/AgsFacade", [
        "dojo/_base/declare",
        "dojo/request"
    ], function (declare, request) {
        return declare("com.huayun.facades.AgsFacade", null, {
            url: null,

            constructor: function () {
            },
            /**
             * 获取城市code的列表数据
             * @param url
             * @param result
             * @param fault
             */
            getCityCodeData: function (url, result, fault) {
                request.get(url + "ags/getCityCode", {handleAs: "json"}).then(function (data) {
                    result(data);
                }, function (err) {
                    fault(err);
                });
            },
            /**
             * 获取兴趣地址
             * @param url
             * @param data
             * @param result
             * @param fault
             */
            getInterestPlaceData: function (url, data, result, fault) {
                request.post(url + "ags/findAddress", {handleAs: "json", data: data}).then(function (data) {
                    result(data);
                }, function (err) {
                    fault(err);
                });
            },
            /**
             * 获得两点之间最短路径
             * @param params
             * @param result
             * @param fault
             */
            getCostPath: function (params, result, fault) {
                request.get(params.url + "ags/findShortPath?stops=" + params.stops, {handleAs: "json"}).then(function (data) {
                    result(data);
                }, function (err) {
                    fault(err);
                });
            },
            /**
             * 获取地址周边
             * @param url 
             * @param data 
             * @param result 
             * @param fault 
             */
            getAddressAround: function (url, data, result, fault) {
                request.post(url + "ags/findAround", {handleAs: "json", data: data}).then(function (data) {
                    result(data);
                }, function (err) {
                    fault(err);
                });
            },
            /**
             * 获取周边信息
             * @param url 
             * @param data 
             * @param result 
             * @param fault 
             */
            getAroundPoints: function (url, data, result, fault) {
                request.get(url + "ags/findAround?num=20&point=" + data.x + "," + data.y + "&tolerance=1000",{handleAs: "json"}).then(function (data) {
                    result(data);
                }, function (err) {
                    fault(err);
                });
            },
            /**
             * 获取选择
             * @param url 
             * @param result 
             * @param fault 
             */
            getZoneSelect: function(url,result,fault){
                request.get(url,{handleAs:"json"}).then(function (data) {
                    result(data);
                },function (err) {
                    fault(err);
                });
            }
        });
    }
);