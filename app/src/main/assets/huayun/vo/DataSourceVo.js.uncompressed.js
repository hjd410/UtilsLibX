/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   19:17
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/vo/DataSourceVo", [], function () {
    function DataSourceVo(params) {
        this.services = {};
        for (var i = 0; i < params.length; i++) {
            var service = params[i];
            this.services[service.id] = service;
        }
    }

    return DataSourceVo;
});
