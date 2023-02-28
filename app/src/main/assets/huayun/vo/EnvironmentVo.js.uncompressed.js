/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   19:41
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/vo/EnvironmentVo", [
    "../util/JSONFormatterUtil"
], function (JSONFormatterUtil) {
    function EnvironmentVo(params) {
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var data = JSONFormatterUtil.formatterKey(params[key]);
                switch (key) {
                    case "defaultFont":
                        this.defaultFont = data["styleId"];
                        break;
                    case "bgColor":
                        this.bgColor = data["fill"];
                        break;
                    case "screen":
                        this.dpi = data["dpi"];
                        break;
                }
            }
        }
    }

    return EnvironmentVo;
});
