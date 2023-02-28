/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   19:57
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/vo/map/RuleVo", [
    "../../util/JSONFormatterUtil",
    "./StyleVo",
    "./LabelVo"
], function (JSONFormatterUtil, StyleVo, LabelVo) {
    function RuleVo(params, styles) {
        // debugger;
        this.styles = styles;
        this.isFixed = (params.fixedSize === undefined || params.fixedSize === "") ? true : JSONFormatterUtil.formatterKey(params.fixedSize).isFixed.toString() === "true";
        this.type = params.type;
        this.addratio = params.fixedSize === undefined ? 0 : Number(JSONFormatterUtil.formatterKey(params.fixedSize).addratio);
        this.minScale = params.minScale ? 1 / Number(params.minScale) : -Infinity;
        this.maxScale = params.maxScale ? 1 / Number(params.maxScale) : Infinity;
        this.propertyName = params.styleGroup && JSONFormatterUtil.formatterKey(params.styleGroup).propertyName;
        if (params.hasOwnProperty("label")) {
            this.label = new LabelVo(params.label, this.type, styles);
        }
        this.styles = this.parseStyle(params.style || params.styleGroup && params.styleGroup.style);
    }

    RuleVo.prototype.parseStyle = function (params) {
        if (Array.isArray(params)) {  // styleGroup
            var tempList = [];
            for (var i = 0; i < params.length; i++) {
                var tempParam = JSONFormatterUtil.formatterKey(params[i]);
                tempParam.type = this.type;
                tempList.push(new StyleVo(tempParam, this.styles));
            }
            return tempList;
        } else {  // 一个style
            params.type = this.type;
            params.propertyValue = '';
            return [new StyleVo(params, this.styles)];
        }
    };
    return RuleVo;
});
