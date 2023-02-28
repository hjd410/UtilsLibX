require({cache:{
'url:com/huayun/webgis/templates/mapTypeSelection.html':"<div class=\"mapType\">\r\n</div>"}});
/**
 * 地图的画点线面控制器
 */
define("com/huayun/webgis/widget/MapTypeSelection", [
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/topic",
    "./MapModuleX",
    "dojo/text!../templates/mapTypeSelection.html"
], function (declare, domConstruct, topic, MapModuleX, template) {
    return declare("com.huayun.webgis.widget.MapTypeSelection", [MapModuleX], {
        templateString: template,


        doInit: function () {
            this.view = this.get("view");
            this.configData = this.get("configData");
            this.layer = this.view.map.findLayerById("tile");
            // this.url = this.layer.url;
            var div;
            for (var i = this.configData.length - 1; i > -1; i--) {
                var type = this.configData[i];
                if (i < 1) {
                    // this.url = type.url;
                    div = domConstruct.create("div", {
                        className: "basicMap type" + i,
                        // src: ,
                        style: "z-index: " + (this.configData.length - i) + ";background-image: url('" + type.thumbnail + "');right: " + ((i + 1) * 6) + "px",
                        innerHTML: "<span>" + type.label + "</span>"
                    }, this.domNode, "first");
                    div.setAttribute("data-url", type.url);
                    div.setAttribute("data-label", type.label);
                    div.addEventListener("click", this.switchType.bind(this));
                } else {
                    div = domConstruct.create("div", {
                        className: "basicMap type" + i,
                        // src: type.thumbnail,
                        style: "z-index: " + (this.configData.length - i) + ";background-image: url('" + type.thumbnail + "');right: " + ((i + 1) * 6) + "px",
                        innerHTML: "<span>" + type.label + "</span>"
                    }, this.domNode, "first");
                    div.setAttribute("data-url", type.url);
                    div.setAttribute("data-label", type.label);
                    div.addEventListener("click", this.switchType.bind(this));
                }
            }
            topic.subscribe("layerComplete", function () {
                if (!this.layer) {
                    this.layer = this.view.map.findLayerById("tile");
                }
            }.bind(this));
        },
        switchType: function (e) {
            var target = e.target;
            var url = target.getAttribute("data-url");
            if (url !== this.layer.url) {
                this.layer.setUrl(url);
            }
            topic.publish("mapTypeChange", target.getAttribute("data-label"))
        }
    });
});