/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/20
 *  @time   :   15:59
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/util/JSONFormatterUtil", [
    "dojo/json"
], function (JSON) {
    return (function () {
        var regExp = /_+((\w+-*)+)/;

        function JSONFormatterUtil() {
        }

        /**
         * 对有下划线的开头的key进行删除
         * @param json
         */
        JSONFormatterUtil.formatterKey = function (json) {
            var fItem = {};
            if (typeof json === "string") return json;
            for (var key in json) {
                if (json.hasOwnProperty(key)) {
                    var item = json[key];
                    // debugger
                    if (regExp.test(key)) {
                        fItem[RegExp.$1] = item;
                    } else {
                        fItem[key] = item;
                    }
                }
            }
            return fItem;
        };

        /**
         * 合并两个json对象中的数据,把data1中的数据合并到data2中
         * 如果data1的数据在data2中被重新定义了,则取data2中值,如果未定义则把data1中的值克隆到data2中
         * @param data1
         * @param data2
         * @returns result 返回一个新的json对象
         */
        JSONFormatterUtil.merge = function (data1, data2) {
            data1.forEach(function (item) {
                if (item["baseid"] === data2["baseid"]) {
                    for (var param in item) {
                        if (item.hasOwnProperty(param) && !data2.hasOwnProperty(param)) {
                            data2[param] = item[param];
                        }
                    }
                }
            });
            return data2;
        };

        function _symbolMerge(symbol, data) {
            var baseId = symbol['_baseid'];
            for (var item in data.styles) {
                if (data.styles.hasOwnProperty(item)) {
                    var styleList = data.styles[item];  // 根据point、line、polygon、text区分
                    if (!Array.isArray(styleList.style)) {
                        styleList = [styleList.style];
                    } else {
                        styleList = styleList.style;
                    }
                    for (var aStyleKey in styleList) {
                        // debugger
                        if (styleList.hasOwnProperty(aStyleKey)) {
                            var aStyle = styleList[aStyleKey];
                            for (var symbolKey in aStyle) {
                                if (aStyle.hasOwnProperty(symbolKey)) {
                                    var tempObj = aStyle[symbolKey];
                                    if (Object.prototype.toString.call(tempObj) === '[object Object]') {
                                        if (baseId === tempObj['_baseid']) {
                                            for (var param in symbol) {
                                                if (symbol.hasOwnProperty(param) && !tempObj.hasOwnProperty(param)) {
                                                    tempObj[param] = symbol[param];
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 字符串转换成json
        JSONFormatterUtil.string2Json = function (str) {
            return JSON.parse(str);
        };
        //  json转换成string
        JSONFormatterUtil.json2String = function (json) {
            return JSON.stringify(json);
        };

        JSONFormatterUtil.findNode = function (json, node, key) {
            var result = [], preObj, nextObj;
            preObj = json;
            // debugger;
            var list = _getList(json, node, key, result, preObj, nextObj);

            // debugger;
            if (typeof key === 'undefined') {

            } else {

            }
        };

        function _getList(obj, node, key, reslut, preObj, nextObj) {
            var list = Object.keys(obj);
            var len = list.length;
            /*            while (len--) {
                            nextObj = obj[list[len]];
                            if (Object.prototype.toString.call(nextObj) === '[object Object]') {
                                preObj = nextObj;
                                _getList(nextObj, node, key, reslut, preObj, nextObj);
                            } else {

                            }

                            debugger;
                        }*/
            for (var i = 0; i < len; i++) {
                var nodeKey = list[i];
                var tempObj = obj[nodeKey];
                if (Object.prototype.toString.call(tempObj) === '[object Object]') {
                    // _getList(tempObj, node, key, reslut);
                } else {
                    var reg = /_(\w+)/;
                    if (reg.test(nodeKey)) {
                        // debugger;
                        if (RegExp.$1 === node) {
                            // debugger;
                        }
                    }
                }
            }
            return Object.keys(obj);
        }

        return JSONFormatterUtil;
    }());
});
