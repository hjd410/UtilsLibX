/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/10
 *  @time   :   9:53
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/framework/vo/ModuleXVo", [
        "dojo/_base/declare",
        "com/huayun/util/HashTable"
    ], function (declare, HashTable) {
        return declare("com.huayun.framework.vo.ModuleXVo", null, {
            configUrl: "",
            id: "",
            identifyId: "",
            preLoad: false,
            hash: new HashTable(),

            constructor: function () {

            }
        });
    }
);