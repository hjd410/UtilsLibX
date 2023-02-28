/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/7
 *  @time   :   10:07
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/util/HashTable", [
        "dojo/_base/declare"
    ],
    function (declare) {
        var _loseloseHash = function (str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                hash += str.charCodeAt(i);
            }
            return hash;
        };
        return declare("com.huayun.util.HashTable", null, {
            // table: [],
            // prototype: null,
            // _keyList: null,

            constructor: function () {
                this.table = [];
                this._keyList = [];
            },
            put: function (key, value) {
                this._keyList.push(key);
                this.table[_loseloseHash(key)] = value;
                // return _loseloseHash(key);
            },
            remove: function (key) {
                this._keyList.splice(this._keyList.indexOf(key), 1);
                this.table[_loseloseHash(key)] = undefined;
            },
            get: function (key) {
                return this.table[_loseloseHash(key)];
            },
            /**
             * 是否包含指定的KEY
             * @param key
             */
            containsKey: function (key) {
                for (var keyStr in this._keyList) {
                    if (key === this._keyList[keyStr]) {
                        return true;
                    }
                }
                return false;
            },

            /*            findValues: function () {

                        },*/

            /**
             * 获取KEY List
             */
            getKeyList: function () {
                return this._keyList;
            },

            size:function(){
                return this._keyList.length;
            },

            /**
             *  hash清空
             */
            clearn: function () {
                this.table = [];
                this._keyList = [];
            }
        });
    }
);