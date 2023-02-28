define("com/huayun/webgis/action/HeatmapAction", [
    "dojo/_base/declare",
    "dojo/topic",
    "./MapAction"
], function (declare, topic, MapAction) {
    return declare("com.huayun.webgis.action.HeatmapAction",[MapAction], {
        targetLayerId: null,
        targetLayer: null,
        constructor: function (params) {
            declare.safeMixin(this, params);
            this.targetLayer = this.map.findLayerById(this.targetLayerId);
        },
        active: function (isActive) {
            this.activeState = isActive;
            var level = this.map.level;
            if (isActive) {
                var now = new Date(),
                    time = now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
                this.targetLayer.withPower = true;
                this.targetLayer.powerTime = time;
                topic.publish("heatmapShow", true);
                this.targetLayer.updatePower(time, true, 0xf08000);
            }else {
                var mapType = this.map.mapType;
                this.targetLayer.withPower = false;
                topic.publish("heatmapShow", false);
                if (level > 12) {
                    if (mapType.type == "basic" && mapType.more.night) {
                        this.targetLayer.updatePower(null, true, 0x2b333c, 0.85);
                    } else {
                        this.targetLayer.updatePower(null, true, 0xeeeeee, 0.85);
                    }
                }else {
                    this.targetLayer.plane.visible = false;
                }
            }
        }
    });
});