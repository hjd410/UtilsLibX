require({cache:{
'url:com/huayun/webgis/templates/buildLayerConfig.html':"<table>\r\n\r\n    <tr>\r\n        <td>图层名称:</td>\r\n        <td><input type=\"text\" value=\"${name}\"></td>\r\n    </tr>\r\n    <tr>\r\n        <td>图层颜色:</td>\r\n        <td>\r\n            <input type=\"text\" data-dojo-attach-point=\"buildColorNode\">\r\n            <button data-dojo-attach-event=\"onclick:showColorPalette\">调色盘</button>\r\n        </td>\r\n    </tr>\r\n    <tr>\r\n        <td>图层透明度:</td>\r\n        <td><div data-dojo-attach-point=\"buildalphaSlider\"></div></td>\r\n        <td><span data-dojo-attach-point=\"buildAlphaNode\"></span></td>\r\n    </tr>\r\n    <tr>\r\n        <td>图层可见性:</td>\r\n        <td>\r\n            <input name=\"buildVisibility\" data-dojo-attach-point=\"buildVisibilityNode\" type=\"radio\" value=\"true\" checked>显示\r\n            <input name=\"buildVisibility\" type=\"radio\" value=\"false\">隐藏\r\n        </td>\r\n    </tr>\r\n    <tr>\r\n        <td colspan=\"2\" style=\"text-align: center\"><button data-dojo-attach-event=\"onclick:submitBuild\">确定</button></td>\r\n    </tr>\r\n</table>"}});
/**
 * 切片基本信息配置
 * author: wushengfei
 */
define("com/huayun/webgis/widget/BuildLayerConfig", [
    "dojo/_base/declare",
    "dojo/topic",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_OnDijitClickMixin",
    "dijit/form/HorizontalSlider",
    "dojo/text!../templates/buildLayerConfig.html"
], function (declare, topic, _WidgetBase, _TemplatedMixin, _OnDijitClickMixin, HorizontalSlider, template) {
    return declare("com.huayun.webgis.widget.BuildLayerConfig", [_WidgetBase, _TemplatedMixin, _OnDijitClickMixin], {
        templateString: template,
        name: null,
        buildColor: null,
        buildAlpha: 0,
        showCp: null,

        postCreate: function () {
            var obj = this;
            var buildalphaSlider = new HorizontalSlider({
                value: this.buildAlpha,
                minimum: 0,
                maximum: 1.0,
                discreteValues: 11,
                style: "width: 200px",
                onChange: function (value) {
                    obj.set("buildAlpha", value);
                }
            }, this.buildalphaSlider);
            this.buildAlphaNode.innerHTML = this.buildAlpha;
            this.buildColorNode.value = this.buildColor;
        },
        _setBuildAlphaAttr: function (value) {
            this.buildAlpha = value;
            this.buildAlphaNode.innerHTML = value;
        },
        _setBuildColorAttr: function (value) {
            this.buildColor = value;
            this.buildColorNode.value = value;
        },
        showColorPalette: function () {
            this.showCp(this.buildColorNode);
        },
        submitBuild: function () {
            this.buildColor = this.buildColorNode.value;
            var visible = this.buildVisibilityNode.checked;
            topic.publish("buildStyle", this.buildColor, this.buildAlpha, visible);
        }
    });
});