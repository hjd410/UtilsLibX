define("com/huayun/webgis/action/CarPatrolAction", [
    "dojo/_base/declare",
    "dojo/topic",
    "./MapAction"
], function (declare, topic, MapAction) {
    return declare("com.huayun.webgis.action.CarPatrolAction", [MapAction], {
        pointsPos: null,
        counts: null,
        speeds: null,
        lens: null,
        raf: null,
        carModel: null,
        turningRadius: 75,
        activeState: null,
        carParts: {
            body: [],
            rims: [],
            glass: []
        },
        constructor: function (params) {
            declare.safeMixin(this, params);
            this.count = [940,1180];
            var speedX = (this.pointsPos[0].x - 0) / this.count[0],
                speedY = (this.pointsPos[0].y - 0) / this.count[1],
                speedX1 = (this.pointsPos[1].x - this.pointsPos[0].x) / this.count[0],
                speedY1 = (this.pointsPos[1].y - this.pointsPos[0].y) / this.count[1],
                speedX2 = (this.pointsPos[2].x - this.pointsPos[1].x) / this.count[0],
                speedY2 = (this.pointsPos[2].y - this.pointsPos[1].y) / this.count[1],
                speedX3 = (this.pointsPos[3].x - this.pointsPos[2].x) / this.count[0],
                speedY3 = (this.pointsPos[3].y - this.pointsPos[2].y) / this.count[1];
            this.speeds = [
                {spx: speedX, spy: speedY},
                {spx: speedX1, spy: speedY1},
                {spx: speedX2, spy: speedY2},
                {spx: speedX3, spy: speedY3}
            ];
            this.lens = [this.count[0], 3 * this.count[0] , 5 * this.count[0], 7 * this.count[0]];
        },
        active: function (isActive) {
            this.activeState = isActive;
            if (isActive) {
                this.map.panAble = false;
                this.map.zoomAble = false;
                this.map.rotateAble = false;
                this.carMove(0,true);
            } else {
                this.map.panAble = true;
                this.map.zoomAble = true;
                this.map.rotateAble = true;
                cancelAnimationFrame(this.raf);
            }
        },
        /*
        carMove: function () {
            console.log(this.c,this)
            if (this.c == 0 ) {
                console.log(this.speeds[0])
                if (this.i < this.lens[0]) {
                    this.map.mapPan(-this.speeds[0].spx, -this.speeds[0].spy, true);
                    this.flag = true;
                } else if (this.i < this.lens[1]) {
                    if (this.flag) {
                        console.log(this.speeds[1])
                        this.carModel.rotateY(-75 / 180 * Math.PI);
                        this.map.rotateMap(false)
                        this.flag = false;
                    }
                    this.map.mapPan2(-this.speeds[1].spx, this.speeds[1].spy, true);
                } else if (this.i < this.lens[2]) {
                    if (!this.flag) {
                        this.carModel.rotateY(-100 / 180 * Math.PI)
                        this.map.rotateMap(false);
                        this.flag = true;
                    }
                    this.map.mapPan(this.speeds[2].spx, this.speeds[2].spy, true);
                } else if (this.i < this.lens[3]) {
                    if (this.flag) {
                        this.map.rotateMap(-75 / 180 * Math.PI);
                        this.map.rotateMap(false);
                        this.flag = false;
                    }
                    this.map.mapPan(this.speeds[3].spy, this.speeds[3].spx, true);
                } else if (this.i < this.lens[4]) {
                    if (!this.flag) {
                        this.carModel.rotateY(-110 / 180 * Math.PI);
                        this.map.rotateMap(false);
                        this.flag = true;
                    }
                    this.map.mapPan(this.speeds[4].spx, this.speeds[4].spy, true);
                }
                this.i = (this.i + 1) % this.lens[4];
            }
            this.c = (this.c + 1) % 5;
            this.raf = requestAnimationFrame(this.carMove.bind(this));
        },
        */
        carMove: function (i, flag) {
            console.log(i,this.pointsPos,this.lens[0],flag);
            if (i < this.lens[0]) {
                if (!flag) {
                    console.log("rotateMap(-90)");
                    this.map.rotateMap(-90);
                    flag = true;
                    i--;
                } else {
                    console.log("patrol");
                    this.map.patrol(this.speeds[0].spx, this.speeds[0].spy);
                }
                i++;
                this.raf = requestAnimationFrame(this.carMove.bind(this, i, flag));
            } else if (i< this.lens[1]) {
                if (flag) {
                    console.log("rotateMap(-90)");
                    this.carModel.rotateY(-75 / 180 * Math.PI);
                    this.map.rotateMap(-90);
                    flag = false;
                }else{
                    console.log("patrol");
                    this.map.patrol(this.speeds[1].spy,this.speeds[1].spx);
                }
                i++;
                this.raf = requestAnimationFrame(this.carMove.bind(this, i, flag));
            }else if (i < this.lens[2]) {
                if (!flag) {
                    this.carModel.rotateY(-100 / 180 * Math.PI);
                    this.map.rotateMap(-90);
                    flag = true;
                }else{
                    this.map.patrol(this.speeds[2].spx, this.speeds[2].spy);
                }
                i++;
                this.raf = requestAnimationFrame(this.carMove.bind(this, i, flag));
            } else if (i < this.lens[3]) {
                if (flag) {
                    this.map.rotateMap(-75 / 180 * Math.PI);
                    this.map.rotateMap(-90);
                    flag = false;
                }else{
                    this.map.patrol(this.speeds[3].spy, this.speeds[3].spx);
                }
                i++;
                this.raf = requestAnimationFrame(this.carMove.bind(this, i, flag));
            } else{
                this.map.rotateMap(-90);
                flag= true;
                i++;
                topic.publish("patrolOver");
            }
        }
    });
});