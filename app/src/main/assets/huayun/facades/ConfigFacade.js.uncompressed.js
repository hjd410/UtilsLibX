/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/10
 *  @time   :   14:29
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/facades/ConfigFacade", [
        "dojo/_base/declare",
        "dojo/request"
    ], function (declare, request) {
        return declare("com.huayun.facades.ConfigFacade",null,{
            url:null,

            constructor:function () {
            },
            /**
             * 获取appconfig json数据
             * @param url
             * @param result
             * @param fault
             */
            getConfigData:function (url,result,fault) {
                request.get(url,{handleAs:"json"}).then(function (data) {
                    result(data);
                },function (err) {
                    fault(err);
                });
            },
            getZoneSelect: function(url,result,fault){
                request.get(url,{handleAs:"json"}).then(function (data) {
                    result(data);
                },function (err) {
                    fault(err);
                });
            },
            getInterestPlace:function(url,data,result,fault){
                request.post(url,{handleAs:"json",data:data}).then(function (data) {
                    result(data);
                },function (err) {
                    fault(err);
                });
            },
            getCostPath: function(url,result,fault){
                request.get(url,{handleAs:"json"}).then(function (data) {
                    result(data);
                },function (err) {
                    fault(err);
                });
            },
            getAddressAround:function(url,data,result,fault){
                request.post(url,{handleAs:"json",data:data}).then(function (data) {
                    result(data);
                },function (err) {
                    fault(err);
                });
            },
            getDepartment:function(url,result,fault){/*获取某个省市地区下面的子地址*/
                request.get(url,{handleAs:"json"}).then(function (data) {
                    result(data);
                },function (err) {
                    fault(err);
                });
            },
            getSubstationData: function(url, result, fault) {
                request.get(url, {handleAs: "json"}).then(function (data) {
                    result(data);
                }, function (err) {
                    fault(err);
                });
            }
        });
    }
);