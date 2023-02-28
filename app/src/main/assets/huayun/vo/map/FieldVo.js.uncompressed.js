/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   19:57
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/vo/map/FieldVo", [
    "../../util/JSONFormatterUtil"

], function (JSONFormatterUtil) {

    function FieldVo(params) {
        this.name = '';
        this.alias = '';
        this.defaultValue = '';
        var temp = JSONFormatterUtil.formatterKey(params);
        for (var key in temp) {
            if (temp.hasOwnProperty(key)) {
                this.parseStyle(key, temp[key]);
            }
        }
    }

    FieldVo.prototype.parseStyle = function (key, params) {
        if (Object.prototype.toString.call(params) === "[object String]") {
            this[key] = params;
        } else if (Object.prototype.toString.call(params) === "[object Object]") {
            this[key] = JSONFormatterUtil.formatterKey(params);
        }
    };
    return FieldVo;
});
