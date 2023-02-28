define("com/huayun/webgis/action/TimeHeatmapAction", [
    "dojo/_base/declare",
    "dojo/topic",
    "./MapAction"
], function (declare, topic, MapAction) {
    return declare("com.huayun.webgis.action.TimeHeatmapAction", [MapAction], {
        targetLayerId: null,
        targetLayer: null,
        timeFlag: null,
        timeLine: null,
        time: 0,
        count: 97,
        night: true,
        timeInterval: 3000,
        constructor: function (params) {
            declare.safeMixin(this, params);
            this.targetLayer = this.map.findLayerById(this.targetLayerId);
            var obj = this;
            topic.subscribe("timeLineStop", function () {
                clearTimeout(obj.timeFlag);
            });
            topic.subscribe("timeLineGo", function () {
                obj.change();
            });
            topic.subscribe("timeHeatmapInterval", function (delta) {
                obj.timeInterval += delta;
                if (obj.timeInterval < 1000) {
                    obj.timeInterval = 1000;
                }
            });
        },
        active: function (isActive) {
            this.activeState = isActive;
            if (isActive) {
                this.map.panAble = false;
                this.map.zoomAble = false;
                this.map.rotateAble = false;
                this.targetLayer.withPower = true;
                this.targetLayer.updatePower(this.time, true, 0xf08000);
                this.timeLine.domNode.style.display = "block";
                this.timeLine.set("time", 0);
                topic.publish("heatmapShow", true);
                if (this.map.level > 12) {
                    this.switchToNight();
                }
                this.change();
            } else {
                this.map.panAble = true;
                this.map.zoomAble = true;
                this.map.rotateAble = true;
                this.targetLayer.withPower = false;
                this.timeLine.domNode.style.display = "none";
                this.time = 0;
                this.count = 97;
                topic.publish("heatmapShow", false);
                clearTimeout(this.timeFlag);
                if (this.map.level > 12) {
                    var mapType = this.map.mapType;
                    if (mapType.type == "basic" && mapType.more.night) {
                        // this.targetLayer.updatePower(null, true, 0x2b333c, 0.85);
                        this.switchToNight();
                    } else {
                        // this.targetLayer.updatePower(null, true, 0xeeeeee, 0.85);
                        this.switchToDay();
                    }
                }else {
                    this.targetLayer.plane.visible = false;
                }
            }
        },

        change: function () {
            var obj = this;
            this.timeFlag = setTimeout(function () {
                if (obj.count > 0) {
                    obj.time = (obj.time + 15) % 1440;
                    var hour = Math.floor(obj.time / 60);
                    hour = hour < 10 ? "0" + hour : hour;
                    var mins = obj.time % 60;
                    mins = mins == 0 ? "00" : mins;
                    var str = hour + ":" + mins + ":00";
                    obj.timeLine.set("time", obj.time);
                    obj.targetLayer.updatePower(str);
                    obj.count--;
                    if (obj.time > 360 && obj.time <= 1080 && obj.night) {
                        obj.switchToDay();
                        obj.night = false;
                    }
                    if (obj.time > 1080 && !obj.night) {
                        obj.switchToNight();
                        obj.night = true;
                    }
                    obj.change();
                }else {
                    obj.count = 97;
                    obj.time = 0;
                }
            }, this.timeInterval);
        },

        switchToNight: function () {
            var sceneContainer = this.map.layerContainer;
            sceneContainer.scene.background = new THREE.Color(0x3f4b57);
            sceneContainer.scene.fog.color = new THREE.Color(0x3f4b57);
            topic.publish("switchToNight", true);
        },

        switchToDay: function () {
            var sceneContainer = this.map.layerContainer;
            sceneContainer.scene.background = new THREE.Color(0xcce0ff);
            sceneContainer.scene.fog.color = new THREE.Color(0xcce0ff);
            topic.publish("switchToDay", true);
        }
    });
});