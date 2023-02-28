/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   19:57
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/vo/map/LayerVo", [
    "../../util/JSONFormatterUtil",
    "./RuleVo",
    "./FeatureTemplateVo"
], function (JSONFormatterUtil, RuleVo, FeatureTemplateVo) {
    function LayerVo(params, styles) {
        this.styles = styles;
        this.dataSource = JSONFormatterUtil.formatterKey(params.dataSource);
        this.geoType = this.dataSource.type;
        this.id = params.id;
        this.name = params.name;
        this.selectable = params.selectable.toString() === 'true';
        this.transparency = Number(params.transparency);
        this.type = params.type;
        this.visible = params.visible.toString() === 'true';
        this.rules = this.parseRule(params.rule);
        this.featureTemplates = params.featureTemplates && this.parseTemplate(params.featureTemplates.featureTemplate);
    }

    LayerVo.prototype.parseRule = function (rule) {
        if (Array.isArray(rule)) {
            var tempRuleList = [];
            for (var i = 0; i < rule.length; i++) {
                var ruleElement = rule[i];
                tempRuleList.push(new RuleVo(ruleElement, this.styles));
            }
            return tempRuleList;
        } else {
            rule.type = this.geoType;
            return [new RuleVo(rule, this.styles)];
        }
    };
    LayerVo.prototype.parseTemplate = function (template) {
        if (Array.isArray(template)) {
            var tempFeatureTemplateList = [];
            for (var i = 0; i < template.length; i++) {
                var templateElement = template[i];
                tempFeatureTemplateList.push(new FeatureTemplateVo(templateElement));
            }
            return tempFeatureTemplateList;
        } else {
            return [new FeatureTemplateVo(template)];
        }
    };
    return LayerVo;
});
