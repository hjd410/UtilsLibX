define(
    "com/huayun/webgis/featureloader", [
        "dojo/_base/declare"
    ], function (declare) {
        return declare("com.huayun.webgis.featureloader", null, {

            constructor: function () {

            },
            /**
             * 加载特征数据的请求
             * @param {string} url     请求url
             * @param {number} index   序号
             * @param {number} len     长度
             * @param {Function} success   成功执行的回调
             * @param {Function} failure   失败执行的回调
             */
            loadFeaturesXhr: function (url, index, len, success, failure) {
                return (
                    function () {
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", url, true);
                        xhr.responseType = "arraybuffer";

                        xhr.onload = function (event) {
                            if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
                                var source = xhr.response;
                                var format = new ol.format.MVT();
                                var features = format.readFeatures(source);
                                success.call(this, features, index.split("/"), index, len);
                            } else {
                                failure.call(this);
                            }
                        }.bind(this);
                        xhr.onerror = function () {
                            failure.call(this);
                        }.bind(this);
                        xhr.send();
                    }.call(this)
                );
            }
        });
    }
);