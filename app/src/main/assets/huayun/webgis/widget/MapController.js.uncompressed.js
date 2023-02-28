require({cache:{
'url:com/huayun/webgis/templates/mapController.html':"<div class=\"${baseClass}\" style=\"position: absolute;pointer-events: all\">\r\n    <div class=\"rotateCircle\">\r\n        <div class=\"icon-rotateCW\" title=\"顺时针旋转\" data-dojo-attach-event=\"onclick:rotateMapCW\"></div>\r\n        <div class=\"icon-rotateACW\" title=\"逆时针旋转\" data-dojo-attach-event=\"onclick:rotateMapACW\"></div>\r\n        <div class=\"icon-compass\" data-dojo-attach-point=\"iconCompass\" data-dojo-attach-event=\"onclick:rotateBack\"></div>\r\n    </div>\r\n</div>"}});
define(
    "com/huayun/webgis/widget/MapController", [
        "dojo/_base/declare",
        "dojo/topic",
        "dojo/dom-class",
        "./MapModuleX",
        "dojo/text!../templates/mapController.html"
    ], function (declare, topic, domClass, MapModuleX, template) {
        return declare("com.huayun.webgis.widget.MapController", [MapModuleX], {
            baseClass: "mapController",
            templateString: template,

            doInit: function () {
                this._view = this.get("view");
                topic.subscribe("mapRotateAngle", function (deg) {
                    this.iconCompass.style.transform = 'rotate(' + deg + 'deg)';
                }.bind(this));
            },
            rotateMapCW: function () {
                this._view.rotateMap(90);
            },
            rotateMapACW: function () {
                this._view.rotateMap(-90);
            },
            rotateBack: function () {
                var rotation = this._view.viewpoint.angle;
                if (rotation > 180) {
                    this._view.rotateMap(360 - rotation);
                }else {
                    this._view.rotateMap(-rotation);
                }

            }
        });
    });