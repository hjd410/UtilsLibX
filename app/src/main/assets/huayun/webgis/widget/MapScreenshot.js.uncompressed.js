require({cache:{
'url:com/huayun/webgis/templates/MapScreenshot.html':"<div>\r\n    <p data-dojo-attach-point=\"convertButton\" data-dojo-attach-event=\"onclick:convertToImage\" style=\"cursor:pointer;\">转换成图</p>\r\n    <p data-dojo-attach-point=\"saveButton\" data-dojo-attach-event=\"onclick:saveImage\" style=\"cursor:pointer;\">下载图片</p>\r\n</div>\r\n"}});
/*
 * 截图功能
 */
define("com/huayun/webgis/widget/MapScreenshot", [
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/dom-class",
    "./MapModuleX",
    "dojo/text!../templates/MapScreenshot.html"//模板片段
], function (declare, topic, domClass, MapModuleX, template) {
    return declare("com.huayun.webgis.widget.MapScreenshot", [MapModuleX], {
        view: null,
        canvas: null,
        templateString: template,
        doInit: function () {
            this.view = this.get("view");
            this.canvas = document.getElementsByTagName("canvas");
        },
        convertToImage: function () {
            Canvas2Image.convertToPNG(this.view._gl.canvas, this.view.width, this.view.height);
        },
        saveImage: function () {
            var a = document.createElement("a"),
                event = new MouseEvent("click");
            a.download = "HY-Map.jpg";
            a.href = this.view._gl.canvas.toDataURL("image/png");
            a.dispatchEvent(event);
        }
    });
});