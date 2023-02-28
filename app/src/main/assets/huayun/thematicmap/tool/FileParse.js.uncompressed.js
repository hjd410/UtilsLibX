/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   14:37
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/thematicmap/tool/FileParse", [
    "dojo/Deferred",
    "dojo/request",
    "dojo/promise/all",
    "../../util/JSONFormatterUtil",
    "../../vo/DataSourceVo",
    "../../vo/DiagramVo"
], function (Deferred, request, all, JSONFormatterUtil, DataSourceVo, DiagramVo) {
    function FileParse() {
        this.root = "";
        this.mapXml = "";
        this.styles = [];
        this.x2js = new X2JS();
    }

    FileParse.prototype.getAll = function (config, result, fault) {
        var requestArr = [];
        this.root = config.root;
        this.styles = config.styles;
        this.mapXml = config.map;
        requestArr.push(this._baseStyleRequest.call(this));
        requestArr.push(this._dataSourceRequest.call(this));
        requestArr.push(this._mapRequest.call(this));
        this._stylesRequest(requestArr);
        all(requestArr).then(function (results) {
            // 所有配置文件都已经加载完成,按照baseStyle.xml\dataSource.xml\map.xml\[style.xml] 顺序异步请求加载
            // 通过 x2js转换成了json数据格式
            var baseStyleJSON = results[0].data;
            var dataSourceJSON = results[1].data;
            var mapJSON = results[2].data;
            var styleArr = results.slice(3, results.length);
            for (var i = 0; i < styleArr.length; i++) {
                var styleData = styleArr[i].data;
                for (var j = 0; j < styleData.length; j++) {
                    if (!styleData[j]) {
                        continue;
                    }
                    var symbols = styleData[j].symbols;
                    if (!symbols) continue;
                    for (var k = 0; k < symbols.length; k++) {
                        var item = symbols[k];
                        JSONFormatterUtil.merge(baseStyleJSON, item);     // 把style和baseStyle属性合并
                    }
                }
            }
            styleArr = this._concatStyles(styleArr);
            result({
                dataSourceVo: new DataSourceVo(dataSourceJSON),
                diagramVo: new DiagramVo(mapJSON, styleArr)
            });
        }.bind(this));
    };

    /**
     * 加载基础符号配置baseStyle.xml
     * @returns {*}
     */
    FileParse.prototype._baseStyleRequest = function () {
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
    FileParse.prototype._dataSourceRequest = function () {
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
    FileParse.prototype._mapRequest = function () {
        var deferred = new Deferred();
        request(this.root + 'maps/' + this.mapXml).then.call(this,
            function (data) {
                var item = this.x2js.xml_str2json(data).root;
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
    FileParse.prototype._stylesRequest = function (requestArr) {
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
                                        this._formatterOneTypeStyle(item, list, key);
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
    FileParse.prototype._formatterOneTypeStyle = function (data, list, key) {
        if (Array.isArray(data)) {  // 多个点类型的配置情况
            for (var index in data) {
                if (data.hasOwnProperty(index)) {
                    var tempItem = data[index];
                    tempItem.type = key;
                    list.push(this._formatterOneStyle(tempItem));
                }

            }
        } else {    // 只有一个点设备配置的情况
            list.push(this._formatterOneStyle(data));
        }
    };
    FileParse.prototype._formatterOneStyle = function (data) {
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

    FileParse.prototype._concatStyles = function (styles) {
        var result = [];
        for (var i = 0; i < styles.length; i++) {
            var style = styles[i];
            var name = style.name;
            for (var j = 0, len = style.data.length; j < len; j++) {
                var aStyle = style.data[j];
                aStyle.id = name + '.' + aStyle.id;
                var symbols = aStyle.symbols;
                if (symbols && symbols.length > 0) {
                    for (var k = 0; k < symbols.length; k++) {
                        var symbol = symbols[k];
                        if (symbol.hasOwnProperty('marker')) {
                            if (symbol.marker.split('.').length === 1) {
                                symbol.marker = name + '.' + symbol.marker;
                            }
                        }
                        if (symbol.hasOwnProperty('outline')) {
                            if (symbol.outline.split('.').length === 1) {
                                symbol.outline = name + '.' + symbol.outline;
                            }
                        }
                    }
                }
                result[result.length] = aStyle;
            }
        }
        return result;
    };
    return FileParse;
});
