/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/12
 *  @time   :   20:09
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/framework/vo/BeanVo", [
        "dojo/_base/declare"
    ], function (declare) {
        return declare("com.huayun.framework.vo.BeanVo", null, {
            id: "",
            identifyId: null,
            clazz: "",
            isSingle: false,
            type: "",
            propertys: [],
            constructorArgs: []
        });
    }
);