/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/7
 *  @time   :   14:27
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/util/BaseGetAndSet", [
        "dojo/_base/declare"
    ],
    function (declare) {
        return declare("com.huayun.util.BaseGetAndSet",null,{
            set: function (name, value) {
                var obj = this.constructor.prototype;
                for (var key in obj) {
                    if (/^_set[A-Za-z](.*)Attr$/.test(key)) {
                        var tempKey = key.charAt(4).toLowerCase() + key.substr(5, key.length - 9);
                        if (tempKey === name) {
                            // obj[key](value);
                            obj[key].call(this,value);
                            break;
                        }
                    }
                }
            },

            get: function (name) {
                var result;
                var obj = this.constructor.prototype;
                for (var key in obj) {
                    // console.log(key);
                    if (/^_get[A-Za-z](.*)Attr$/.test(key)) {
                        var tempKey = key.charAt(4).toLowerCase() + key.substr(5, key.length - 9);
                        if (tempKey === name) {
                            // result = obj[key](name);
                            result = obj[key].call(this,name);
                            break;
                        }
                    } else {
                        result = null;
                    }
                }
                return result;
            }
        });
    }
);