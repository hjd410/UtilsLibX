/**
 *  @author :   JiGuangJie
 *  @date   :   2020/6/9
 *  @time   :   16:23
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/edit/ConfigLoader", [
    "dojo/Deferred",
    "dojo/request",
    "dojo/promise/all",
    "../util/JSONFormatterUtil"
], function (Deferred, request, all, JSONFormatterUtil) {
    function ConfigLoader(params) {
        this.config = params.config;
        this.root = this.config.root;
        this.styles = this.config.styles;
        this.templateXml = this.config.map;
        // this.styles = [];
        this.x2js = new X2JS();
    }

    ConfigLoader.prototype.load = function () {
        var requestArr = [];
        requestArr.push(this._baseStyleRequest.call(this));
        requestArr.push(this._dataSourceRequest.call(this));
        requestArr.push(this._mapRequest.call(this));
        this._stylesRequest(requestArr);
        return all(requestArr);
    };

    /**
     * 加载基础符号配置baseStyle.xml
     * @returns {*}
     */
    ConfigLoader.prototype._baseStyleRequest = function () {
        var deferred = new Deferred();
        request(this.root + 'baseStyle.xml').then.call(this,
            function (data) {
                var json = this.x2js.xml_str2json(data).style;
                var list = [];
                for (var key in json) {
                    if (json.hasOwnProperty(key)) {
                        list[list.length] = JSONFormatterUtil.formatterKey(json[key]);
                    }
                }
                deferred.resolve({data: list, type: 'baseStyle'});
            }.bind(this)
        );
        return deferred.promise;
    };

    /**
     * 加载数据源配置dataSource.xml
     * @returns {*}
     */
    ConfigLoader.prototype._dataSourceRequest = function () {
        var deferred = new Deferred();
        request(this.root + 'data/dataSource.xml').then.call(this,
            function (data) {
                var list = [];
                var item = this.x2js.xml_str2json(data).cat.dataSources.dataSource;
                if (Array.isArray(item)) {
                    list = item;
                } else {
                    list.push(item);
                }
                deferred.resolve({data: list, type: 'dataSource'});
            }.bind(this)
        );
        return deferred.promise;
    };

    /**
     * 加载地图配置${xxx}map${xxx}.xml
     * @returns {*}
     */
    ConfigLoader.prototype._mapRequest = function () {
        var deferred = new Deferred();
        request(this.root + 'maps/' + this.templateXml).then.call(this,
            function (data) {
            var aaa = this.x2js.xml_str2json(data);
                var item = this.x2js.xml_str2json(data).cat;
                deferred.resolve({data: item, type: 'map'});
            }.bind(this)
        );
        return deferred.promise;
    };

    /**
     * 加载自定义样式配置文件
     * @param requestArr
     * @private
     */
    ConfigLoader.prototype._stylesRequest = function (requestArr) {
        // 自定义的样式配置xml加载,可以是多个样式文件,需要通过遍历来实现
        for (var i = 0; i < this.styles.length; i++) {
            var requestFun = function (i) {
                var deferred = new Deferred();
                var styleXml = this.styles[i];
                request(this.root + 'style/' + styleXml).then(
                    function (data) {
                        var reg = /(\w+)\.(xml)$/;
                        if (reg.test(styleXml)) {
                            var fileName = RegExp.$1;
                            var json = this.x2js.xml_str2json(data).styles;     // 点、线、面、文本的所有自定义配置
                            var list = [];
                            for (var key in json) {
                                if (json.hasOwnProperty(key)) {     // key是 point 、 line 、 polygon 、 text
                                    var item = json[key].style;
                                    if (typeof item !== "undefined") {
                                        this._formatterOneTypeStyle(item, list);
                                    }
                                }
                            }
                            deferred.resolve({data: list, type: 'style', name: fileName});
                        } else {
                            console.log('自定义样式xml错误!!!!!!!!!!');
                        }
                    }.bind(this)
                );
                return deferred.promise;
            }.call(this, i);
            requestArr.push(requestFun);
        }
    };
    ConfigLoader.prototype._formatterOneTypeStyle = function (data, list) {
        if (Array.isArray(data)) {  // 多个点类型的配置情况
            for (var index in data) {
                if (data.hasOwnProperty(index)) {
                    var tempItem = data[index];
                    list.push(this._formatterOneStyle(tempItem));
                }

            }
        } else {    // 只有一个点设备配置的情况
            list.push(this._formatterOneStyle(data));
        }
    };
    ConfigLoader.prototype._formatterOneStyle = function (data) {
        if (!data) {
            return;
        }
        var keys = Object.keys(data);
        var result = {
            "symbols": []
        };
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var tempItem = data[key];
            // debugger
            if (Object.prototype.toString.call(tempItem) === "[object String]") {
                var fKeys = Object.keys(JSONFormatterUtil.formatterKey(data));
                for (var index in fKeys) {
                    if (fKeys.hasOwnProperty(index)) {
                        var fKey = fKeys[index];
                        result[fKey] = JSONFormatterUtil.formatterKey(data)[fKey];
                    }
                }
            } else if (Object.prototype.toString.call(tempItem) === "[object Array]") {
                var aStyle = [];
                for (var j = 0; j < tempItem.length; j++) {
                    var aItem = tempItem[j];
                    aStyle[j] = JSONFormatterUtil.formatterKey(aItem);
                }
                result["symbols"] = aStyle;
            } else if (Object.prototype.toString.call(tempItem) === "[object Object]") {
                result["symbols"].push(JSONFormatterUtil.formatterKey(tempItem));
            }
        }
        return result;
    };

    return ConfigLoader;
});
