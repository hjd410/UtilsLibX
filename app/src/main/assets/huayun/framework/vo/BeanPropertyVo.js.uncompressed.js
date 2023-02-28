/**
 *  @author :   JiGuangJie
 *  @date   :   2018/12/12
 *  @time   :   20:17
 *  @Email  :   530904731@qq.com
 */
define(
    "com/huayun/framework/vo/BeanPropertyVo", [
        "dojo/_base/declare"
    ], function (declare) {
        return declare("com.huayun.framework.vo.BeanPropertyVo", null, {
            name: "",
            value: null,
            type: "",
            params: ""
        });
    }
);