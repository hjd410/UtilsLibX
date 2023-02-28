/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/6
 *  @time   :   11:01
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/framework/context/GlobalContext", [
        "dojo/_base/declare",
        "../../util/HashTable",
        "./BaseContext"
    ], function (declare, HashTable, BaseContext) {

        var _instance = null;

        return declare("com.huayun.framework.context.GlobalContext",[BaseContext],{

            constructor:function () {
                if(_instance == null){
                    _instance = this;
                }
            },

            getInstance:function () {
                /*for(var key in _instance){
                    console.log(key);
                }*/
                return _instance;/*返回实例*/
            }
        }).call(this);
    }
);