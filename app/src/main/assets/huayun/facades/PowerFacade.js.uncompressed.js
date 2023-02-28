define("com/huayun/facades/PowerFacade", [
    'dojo/_base/declare',
    'dojo/request'
], function(declare, request) {
    return declare('com.huayun.facades.PowerFacade', null, {
        url: null,

        constructor: function () {
        },

        /**
         * 电源点追踪函数
         */
        getPowerPointData: function (url, data, result, fault) {
            request.post(url, {
                handleAs: "json",
                data: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                    "access-key": "YH6fXTGYH4DIumSNOii+IzvIeZSrvghHn/FxVfevu92cu0Gzb4yB4MnKjTxLwYh7SELU8C15v07+mXROfZQYDBSzyeoavyabrZ1L+BJwLu0="
                }
            }).then(function (data) {
                result(data);
            }, function (err) {
                fault(err);
            });
        },

        /**
         * 供电范围函数
         */
        getPowerExtentData: function (url, data, result, fault) {
            request.post(url, {
                handleAs: "json",
                data: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                    "access-key": "YH6fXTGYH4DIumSNOii+IzvIeZSrvghHn/FxVfevu92cu0Gzb4yB4MnKjTxLwYh7SELU8C15v07+mXROfZQYDBSzyeoavyabrZ1L+BJwLu0="
                }
            }).then(function (data) {
                result(data);
            }, function (err) {
                fault(err);
            });
        },

        /**
         * 连通性函数
         */
        getPowerConnectData: function (url, data, result, fault) {
            request.post(url, {
                handleAs: "json",
                data: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                    "access-key": "YH6fXTGYH4DIumSNOii+IzvIeZSrvghHn/FxVfevu92cu0Gzb4yB4MnKjTxLwYh7SELU8C15v07+mXROfZQYDBSzyeoavyabrZ1L+BJwLu0="
                }
            }).then(function (data) {
                result(data);
            }, function (err) {
                fault(err);
            });
        },

        /**
         * 混合函数
         */
        getMixtureData: function (url, result, fault) {
            request.get(url + "&access_token=YH6fXTGYH4DIumSNOii+IzvIeZSrvghHn/FxVfevu92cu0Gzb4yB4MnKjTxLwYh7SELU8C15v07+mXROfZQYDBSzyeoavyabrZ1L+BJwLu0=", 
                {handleAs: "json"}
            ).then(function (data) {
                result(data);
            }, function(err) {
                fault(err);
            });
        }
    });
});