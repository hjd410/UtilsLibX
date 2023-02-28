/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/13
 *  @time   :   20:10
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/util/HashTableEx", [
        "dojo/_base/declare",
        "./HashTable",
        "./StringHelp"
    ],
    function (declare, HashTabel, StringHelp) {
        var _loseloseHash = function (str) {
            var hash = 0;
            // console.log(str);
            for (var i = 0; i < str.length; i++) {
                hash += str.charCodeAt(i);
            }
            return hash;
        };
        return declare("com.huayun.util.HashTableEx", null, {
            // _hash: null,

            constructor: function () {
                this._hash = new HashTabel();
                this._keyList = [];
            },

            /*            findAllValues: function () {
                            return [];
                        },*/
            /**
             *
             * @param majorKey  主键
             * @param deputyKey 副键
             * @param value     存储对象
             */
            put: function (majorKey, deputyKey, value) {
                // console.log(this._hash,"对象存入Hash中",this,majorKey,deputyKey);
                this._keyList.push({majorKey: majorKey, deputyKey: deputyKey});
                var tempHash = null;
                if (this._hash.get(majorKey) !== undefined) {//key1对应的hash已经存在
                    tempHash = this._hash.get(majorKey);
                } else {
                    tempHash = new HashTabel();
                    this._hash.put(majorKey, tempHash);
                }
                if (StringHelp.isSpace(deputyKey)) {
                    tempHash.put(majorKey, value);
                } else {
                    tempHash.put(deputyKey, value);
                }
            },

            get: function (majorKey, deputyKey) {
                // console.log(this._hash,"从Hash中取对象",this,majorKey,deputyKey);
                var result = null;
                if (StringHelp.isSpace(deputyKey)) {
                    if (this.findValues(majorKey) != null) {
                        result = this.findValues(majorKey);
                    }
                } else {
                    if (!StringHelp.isSpace(this._hash.get(majorKey))) {
                        result = this._hash.get(majorKey).get(deputyKey);
                    }
                }
                return result;
            },
            /**
             * 获取KEY List
             */
            getKeyList: function () {
                return this._keyList;
            },

            size: function () {
                return this._keyList.length;
            },
            /**
             * 根据key1值返回所有值的数组
             * @param majorKey
             * @return
             *
             */
            findValues: function (majorKey) {
                var result = null;

                if (this._hash.get(majorKey) !== undefined) {
                    // console.log(this._hash.get(majorKey).table[_loseloseHash(majorKey)],majorKey,this._hash,"--------------findValues",_loseloseHash(majorKey));
                    result = this._hash.get(majorKey).table[_loseloseHash(majorKey)];
                }
                return result;
            },
            /**
             * 删除健值对
             * @param majorKey
             * @param deputyKey
             *
             */
            remove: function (majorKey, deputyKey) {
                if (StringHelp.isSpace(deputyKey)) {
                    this._hash.remove(majorKey);
                } else {
                    if (this._hash.get(majorKey)) {
                        this._hash.get(majorKey).remove(deputyKey);
                    }
                }
            }
        });
    }
);