require({cache:{
'url:com/huayun/webgis/templates/buildLabelLayerConfig.html':"<table>\r\n\r\n    <tr>\r\n        <td>图层名称:</td>\r\n        <td><input type=\"text\" value=\"${name}\"></td>\r\n    </tr>\r\n    <tr>\r\n        <td>标签颜色:</td>\r\n        <td>\r\n            <input type=\"text\" data-dojo-attach-point=\"labelColorNode\">\r\n            <button data-dojo-attach-event=\"onclick:showColorPalette\">调色盘</button>\r\n        </td>\r\n    </tr>\r\n    <tr>\r\n        <td>标签透明度:</td>\r\n        <td><div data-dojo-attach-point=\"labelalphaSlider\"></div></td>\r\n        <td><span data-dojo-attach-point=\"labelAlphaNode\"></span></td>\r\n    </tr>\r\n    <!--<tr>\r\n        <td>标签字体:</td>\r\n        <td>\r\n            <input type=\"text\" data-dojo-attach-point=\"labelFontNode\">\r\n        </td>\r\n    </tr>-->\r\n    <tr>\r\n        <td>图层可见性:</td>\r\n        <td>\r\n            <input name=\"labelVisibility\" data-dojo-attach-point=\"labelVisibilityNode\" type=\"radio\" value=\"true\" checked>显示\r\n            <input name=\"labelVisibility\" type=\"radio\" value=\"false\">隐藏\r\n        </td>\r\n    </tr>\r\n    <tr>\r\n        <td colspan=\"2\" style=\"text-align: center\"><button data-dojo-attach-event=\"onclick:submitLabel\">确定</button></td>\r\n    </tr>\r\n</table>"}});
/**
 * 切片基本信息配置
 * author: wushengfei
 */
define("com/huayun/webgis/widget/BuildLabelLayerConfig", [
    "dojo/_base/declare",
    "dojo/topic",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_OnDijitClickMixin",
    "dijit/form/HorizontalSlider",
    "dojo/text!../templates/buildLabelLayerConfig.html"
], function (declare, topic, _WidgetBase, _TemplatedMixin, _OnDijitClickMixin, HorizontalSlider, template) {
    return declare("com.huayun.webgis.widget.BuildLayerConfig", [_WidgetBase, _TemplatedMixin, _OnDijitClickMixin], {
        templateString: template,
        name: null,
        labelColor: null,
        labelAlpha: 0,
        /*labelFont: null,*/
        showCp: null,

        postCreate: function () {
            var obj = this;
            var labelalphaSlider = new HorizontalSlider({
                value: this.labelAlpha,
                minimum: 0,
                maximum: 1.0,
                discreteValues: 11,
                style: "width: 200px",
                onChange: function (value) {
                    obj.set("labelAlpha", value);
                }
            }, this.labelalphaSlider);
            this.labelAlphaNode.innerHTML = this.labelAlpha;
            this.labelColorNode.value = this.labelColor;
            // this.labelFontNode.value = this.labelFont;
        },
        _setLabelAlphaAttr: function (value) {
            this.labelAlpha = value;
            this.labelAlphaNode.innerHTML = value;
        },
        _setLabelColorAttr: function (value) {
            this.labelColor = value;
            this.labelColorNode.value = value;
        },
        /*_setLaeblFontAttr:function (value) {
            this.labelFont = value;
            this.labelFontNode.value = value;
        },*/
        showColorPalette: function () {
            this.showCp(this.labelColorNode);
        },
        submitLabel: function () {
            this.labelColor = this.labelColorNode.value;
            var visible = this.labelVisibilityNode.checked;
            topic.publish("poiStyle", this.labelColor, this.labelAlpha, visible);
        }
    });
});