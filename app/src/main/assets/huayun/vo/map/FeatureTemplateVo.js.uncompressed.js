/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   19:57
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/vo/map/FeatureTemplateVo", [
    "./FieldVo"
], function (FieldVo) {
    function FeatureTemplateVo(params) {
        var tempArr = params._name.split('-');
        this.name = tempArr[0];
        this.propertyValue = tempArr.length >= 2 ? tempArr[1] : "";
        this.fields = this.parseField(params.fields.field);
    }

    /**
     * *解析编辑的属性
     * @param params
     * @returns {Array}
     */
    FeatureTemplateVo.prototype.parseField = function (params) {
        if (Array.isArray(params)) {
            var tempList = [];
            for (var i = 0; i < params.length; i++) {
                var tempParam = params[i];
                tempList.push(new FieldVo(tempParam));
            }
            return tempList;
        }
    };
    return FeatureTemplateVo;
});
