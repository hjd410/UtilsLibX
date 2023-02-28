define(
    "com/huayun/webgis/action/PatrolAction", [
        "dojo/_base/declare",
        "dojo/topic",
        "./MapAction"
    ], function (declare, topic, MapAction) {
        return declare("com.huayun.webgis.action.PatrolAction", [MapAction], {
            pointsPos: null,
            counts: null,
            speeds: null,
            lens: null,
            raf: null,

            constructor: function (params) {
                declare.safeMixin(this, params);
                this.pointsPos = [
                    {x: 310, y: 4700},
                    {x: 6195, y: 5076},
                    {x: 5870, y: 377},
                    {x: -30, y: 0}
                ];
                this.counts = [940, 1177, 940, 1180];
                var speedX = this.pointsPos[0].x / this.counts[0],
                    speedY = this.pointsPos[0].y / this.counts[0],
                    speedX1 = (this.pointsPos[1].x - this.pointsPos[0].x) / this.counts[1],
                    speedY1 = (this.pointsPos[1].y - this.pointsPos[0].y) / this.counts[1],
                    speedX2 = (this.pointsPos[1].x - this.pointsPos[2].x) / this.counts[2],
                    speedY2 = (this.pointsPos[1].y - this.pointsPos[2].y) / this.counts[2],
                    speedX3 = (this.pointsPos[2].x - this.pointsPos[3].x) / this.counts[3],
                    speedY3 = (this.pointsPos[2].y - this.pointsPos[3].y) / this.counts[3];
                this.speeds = [
                    {spx: speedX, spy: speedY},
                    {spx: speedX1, spy: speedY1},
                    {spx: speedX2, spy: speedY2},
                    {spx: speedX3, spy: speedY3}
                ];
                var len1 = this.counts[0],
                    len2 = len1 + this.counts[1] + 1,
                    len3 = len2 + this.counts[2] + 1,
                    len4 = len3 + this.counts[3] + 1;
                this.lens = [len1, len2, len3, len4];
            },
            active: function (isActive) {
                this.activeState = isActive;
                if (isActive) {
                    this.map.panAble = false;
                    this.map.zoomAble = false;
                    this.map.rotateAble = false;
                    this.flyMove(0, true);
                } else {
                    this.map.panAble = true;
                    this.map.zoomAble = true;
                    this.map.rotateAble = true;
                    cancelAnimationFrame(this.raf);
                }
            },
            flyMove: function (i, flag) {
                if (i < this.lens[0]) {
                    if (!flag) {
                        this.map.rotateMap(-90);
                        flag = true;
                        i--;
                    } else {
                        this.map.patrol(this.speeds[0].spx, this.speeds[0].spy);
                    }
                    i++;
                    this.raf = requestAnimationFrame(this.flyMove.bind(this, i, flag));
                } else if (i < this.lens[1]) {
                    if (flag) {
                        this.map.rotateMap(-90);
                        flag = false;
                    } else {
                        this.map.patrol(this.speeds[1].spy, this.speeds[1].spx);
                    }
                    i++;
                    this.raf = requestAnimationFrame(this.flyMove.bind(this, i, flag));
                } else if (i < this.lens[2]) {
                    if (!flag) {
                        this.map.rotateMap(-90);
                        flag = true;
                    } else {
                        this.map.patrol(this.speeds[2].spx, this.speeds[2].spy);
                    }
                    i++;
                    this.raf = requestAnimationFrame(this.flyMove.bind(this, i, flag));
                } else if (i < this.lens[3]) {
                    if (flag) {
                        this.map.rotateMap(-90);
                        flag = false;
                    } else {
                        this.map.patrol(this.speeds[3].spy, this.speeds[3].spx);
                    }
                    i++;
                    this.raf = requestAnimationFrame(this.flyMove.bind(this, i, flag));
                } else {
                    this.map.rotateMap(-90);
                    flag = true;
                    i++;
                    topic.publish("patrolOver");
                }
            }
        });
    });