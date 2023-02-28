/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/13
 *  @time   :   11:20
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/util/ClassFacotry", [
        "dojo/_base/declare",
        "com/huayun/util/StringHelp"
    ], function (declare, StringHelp) {
        return declare("com.huayun.util.ClassFacotry", null, {

            constructor: function (params) {
                this.generator = params.generator;
                this.clazz = params.clazz;
            },
            /**
             * 新建实例
             * @param params 
             * @param result 
             */
            newInstance: function (params, result) {
                this.clazz = this.clazz.replace(/\./g, "/");
                // console.log("===========ClassFacotry--------------", this.clazz, params);
                var _class = null;
                if (!StringHelp.isSpace(this.clazz)) {
                    require([this.clazz], function (Class) {
                        // console.log("===========ClassFacotry--------------",this.clazz,_class);
                        // console.log(this.clazz);
                        _class = new Class(params);
                        // console.log("===========ClassFacotry--------------",this.clazz,_class);
                        // _class.id = this.clazz;
                        // console.log(">>>>>clazz:",this.clazz,_class);
                        result(_class);
                    }.bind(this));
                } else {
                    result(null);
                }
            }
        });
    }
);