define("com/huayun/webgis/action/DrawAction", [
    "dojo/_base/declare",
    "dojo/on",
    "dojo/topic",
    "dojo/dom-construct",
    "./MapAction"
], function (declare, on, topic, domConstruct, MapAction) {
    return declare("com.huayun.webgis.action.DrawAction", [MapAction], {
        mouseDown: null,
        mouseMove: null,
        mouseClick: null,
        mouseDblClick: null,
        mouseClickMove: null,
        angleNodes: [],
        drawLayer: null,
        cachePoint: [],

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.drawLayer = this.map.findLayerById("drawLayer");
        },
        // 根据参数isActive的true或false切换地图功能和状态
        active: function (isActive) {
            this.activeState = isActive;
            if (isActive) { // 激活
                this.map.selectAble = false;
                this.mouseClick = on(this.map.domNode, "click", this._onMouseClick.bind(this));
                this.mouseDown = on(this.map.domNode, "mousedown", this._onMouseDown.bind(this));
            } else {         // 失活
                this.mouseClick.remove();
                this.mouseDown.remove();
            }
        },
        setActionState: function (state) {
            this.actionState = state;
        },
        // draw功能对应的地图监听事件, 使用Action独自管理, 降低耦合, 提高扩展性
        _onMouseClick: function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.button === 0) {
                switch (this.actionState) {
                    case "dot":
                        this.drawDot(e.x, e.y);
                        break;
                    case "line":
                        this.drawLine(e.x, e.y);
                        break;
                    case "polygon":
                        this.drawPolygon(e.x, e.y);
                        break;
                    case "measureLine":
                        this.measureLine(e.x, e.y);
                        break;
                    case "measurePoly":
                        this.drawPolygon(e.x, e.y);
                        break;
                    case "measureAngle":
                        this.measureAngle(e.x, e.y);
                        break;
                    case "polygonSelect":
                        this.polygonSelect(e.x, e.y);
                        break;
                }
            }
        },
        _onMouseDown: function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.button === 0) {
                switch (this.actionState) {
                    case "circle":
                        this.drawCircle(e.x, e.y);
                        break;
                    case "sphere":
                        this.drawSphere(e.x, e.y);
                        break;
                    case "rectSelect":
                        this.rectSelect(e.x, e.y);
                        break;
                    case "circleSelect":
                        this.circleSelect(e.x, e.y);
                        break;
                }
            }
        },

        /**
         * 图层上绘制点
         * @param x: 点屏幕坐标的x
         * @param y: 点屏幕坐标的y
         */
        drawDot: function (x, y) {
            var realPoint = this.map.screenTo3dPoint(x, y);
            this.drawLayer.addPoint({x: realPoint.x, y: realPoint.y});
            this.actionState = "ready";
        },

        /**
         * 图层上绘制线
         * @param x: 起点屏幕坐标的x
         * @param y: 起点屏幕坐标的y
         */
        drawLine: function (x, y) {
            this.map.panAble = false; // 禁止平移
            this.drawLayer.currentGraphic = null;
            var position = this.drawLayer.group.position;
            var p = this.map.screenTo3dPoint(x, y);
            p.x = p.x - position.x;
            p.y = p.y - position.y;
            this.cachePoint[0] = p;
            if (!this.mouseClickMove) {
                this.mouseClickMove = on(this.map.domNode, "mousemove", function (e) {
                    this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);   // 移除当前线段
                    var ep = this.map.screenTo3dPoint(e.x, e.y);
                    ep.x = ep.x - position.x;
                    ep.y = ep.y - position.y;
                    this.cachePoint[1] = ep;
                    this.drawLayer.addLine(this.cachePoint[0], ep); // 添加新线段, 形成最新线段终点随鼠标终点移动
                }.bind(this));
                var linedblclick = on(this.map.domNode, "dblclick", function () {
                    this.mouseClickMove.remove();
                    this.mouseClickMove = null;
                    linedblclick.remove();
                    this.actionState = "ready";
                    this.map.panAble = true;
                    this.cachePoint = [];
                    this.drawLayer.currentGraphic = null;
                    topic.publish("mapDrawEnd");
                }.bind(this));
            }
        },

        /**
         * 图层上绘制多边形
         * @param x: 起点屏幕坐标的x
         * @param y: 起点屏幕坐标的y
         */
        drawPolygon: function (x, y) {
            this.map.panAble = false; // 禁止平移
            this.drawLayer.currentGraphic = null;
            var position = this.drawLayer.group.position;
            var p = this.map.screenTo3dPoint(x, y);
            p.x = p.x - position.x;
            p.y = p.y - position.y;
            this.cachePoint.push(p);
            this.cachePoint.push({x: 0, y:0, z:0});
            if (!this.mouseClickMove) {
                this.mouseClickMove = on(this.map.domNode, "mousemove", function (e) {
                    this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);   // 移除当前多边形
                    var ep = this.map.screenTo3dPoint(e.x, e.y),
                        len = this.cachePoint.length;
                    ep.x = ep.x - position.x;
                    ep.y = ep.y - position.y;
                    this.cachePoint[len-1] = ep;
                    this.drawLayer.addPolygon(this.cachePoint); // 添加新多边形
                }.bind(this));
                var polygondblclick = on(this.map.domNode, "dblclick", function () {
                    this.mouseClickMove.remove();
                    this.mouseClickMove = null;
                    polygondblclick.remove();
                    this.actionState = "ready";
                    this.map.panAble = true;
                    this.cachePoint = [];
                    this.drawLayer.currentGraphic = null;
                    topic.publish("mapDrawEnd");
                }.bind(this));
            }

        },


        /**
         * 图层上绘制圆
         * @param x: 圆心点屏幕坐标的x
         * @param y: 圆心点屏幕坐标的y
         */
        drawCircle: function (x, y) {
            var position = this.drawLayer.group.position;
            var p = this.map.screenTo3dPoint(x, y);
            p.x = p.x - position.x;
            p.y = p.y - position.y;
            this.map.panAble = false;
            this.cachePoint[0] = p;
            if (!this.mouseMove) {
                this.mouseMove = on(this.map.domNode, "mousemove", function (e) {
                    var endPoint = this.map.screenTo3dPoint(e.x, e.y);
                    endPoint.x = endPoint.x - position.x;
                    endPoint.y = endPoint.y - position.y;
                    var deltaX = Math.abs(endPoint.x - this.cachePoint[0].x),
                        deltaY = Math.abs(endPoint.y - this.cachePoint[0].y),
                        r2 = deltaX * deltaX + deltaY * deltaY,
                        r = Math.sqrt(r2);
                    this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);   // 移除当前圆
                    this.drawLayer.addCircle(this.cachePoint[0], r);
                }.bind(this));
                var circleMouseUp = on(this.map.domNode, "mouseup", function (e) {
                    this.mouseMove.remove();
                    this.mouseMove = null;
                    circleMouseUp.remove();
                    this.actionState = "ready";
                    this.map.panAble = true;
                    this.cachePoint = [];
                    this.drawLayer.currentGraphic = null;
                    topic.publish("mapDrawEnd");
                }.bind(this));
            }
        },
        /**
         * 矩形选择
         * @param x 
         * @param y 
         */
        rectSelect: function(x, y) {
            var position = this.drawLayer.group.position;
            var p = this.map.screenTo3dPoint(x, y);
            p.x = p.x - position.x;
            p.y = p.y - position.y;
            this.map.panAble = false;

            this.cachePoint[0] = p;
            if (!this.mouseMove) {
                this.mouseMove = on(this.map.domNode, "mousemove", function (e) {
                    var endPoint = this.map.screenTo3dPoint(e.x, e.y);
                    endPoint.x = endPoint.x - position.x;
                    endPoint.y = endPoint.y - position.y;
                    this.cachePoint[1] = endPoint;
                    this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);   // 移除当前圆
                    this.drawLayer.addRect(this.cachePoint[0], this.cachePoint[1]);
                }.bind(this));
                var circleMouseUp = on(this.map.domNode, "mouseup", function (e) {
                    this.mouseMove.remove();
                    this.mouseMove = null;
                    circleMouseUp.remove();
                    this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);
                    this.map.rectSelect(this.cachePoint[0], this.cachePoint[1]);
                    this.actionState = "ready";
                    this.map.panAble = true;
                    this.cachePoint = [];
                    this.drawLayer.currentGraphic = null;
                    topic.publish("mapDrawEnd");
                }.bind(this));
            }
        },
        /**
         * 圆选择
         * @param x 
         * @param y 
         */
        circleSelect: function(x, y){
            var position = this.drawLayer.group.position;
            var p = this.map.screenTo3dPoint(x, y);
            p.x = p.x - position.x;
            p.y = p.y - position.y;
            this.map.panAble = false;
            this.cachePoint[0] = p;
            if (!this.mouseMove) {
                this.mouseMove = on(this.map.domNode, "mousemove", function (e) {
                    var endPoint = this.map.screenTo3dPoint(e.x, e.y);
                    endPoint.x = endPoint.x - position.x;
                    endPoint.y = endPoint.y - position.y;
                    var deltaX = Math.abs(endPoint.x - this.cachePoint[0].x),
                        deltaY = Math.abs(endPoint.y - this.cachePoint[0].y),
                        r2 = deltaX * deltaX + deltaY * deltaY,
                        r = Math.sqrt(r2);
                    this.cachePoint[1] = r;
                    this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);   // 移除当前圆
                    this.drawLayer.addCircle(this.cachePoint[0], r);
                }.bind(this));
                var circleMouseUp = on(this.map.domNode, "mouseup", function (e) {
                    this.mouseMove.remove();
                    this.mouseMove = null;
                    circleMouseUp.remove();
                    this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);
                    this.map.circleSelect(this.cachePoint[0], this.cachePoint[1]);
                    this.actionState = "ready";
                    this.map.panAble = true;
                    this.cachePoint = [];
                    this.drawLayer.currentGraphic = null;
                    topic.publish("mapDrawEnd");
                }.bind(this));
            }
        },
        /**
         * 多边形选择
         * @param x 
         * @param y 
         */
        polygonSelect: function(x, y){
            this.map.panAble = false; // 禁止平移
            // this.drawLayer.currentGraphic = null;
            var position = this.drawLayer.group.position;
            var p = this.map.screenTo3dPoint(x, y);
            p.x = p.x - position.x;
            p.y = p.y - position.y;
            this.cachePoint.push(p);
            this.cachePoint.push({x: 0, y:0, z:0});
            if (!this.mouseClickMove) {
                this.mouseClickMove = on(this.map.domNode, "mousemove", function (e) {
                    this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);   // 移除当前多边形
                    var ep = this.map.screenTo3dPoint(e.x, e.y),
                        len = this.cachePoint.length;
                    ep.x = ep.x - position.x;
                    ep.y = ep.y - position.y;
                    this.cachePoint[len-1] = ep;
                    this.drawLayer.addPolygon(this.cachePoint); // 添加新多边形
                }.bind(this));
                var polygondblclick = on(this.map.domNode, "dblclick", function () {
                    this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);
                    this.mouseClickMove.remove();
                    this.mouseClickMove = null;
                    polygondblclick.remove();
                    this.map.polygonSelect(this.cachePoint);
                    this.actionState = "ready";
                    this.map.panAble = true;
                    this.cachePoint = [];
                    // this.drawLayer.currentGraphic = null;
                    topic.publish("mapDrawEnd");
                }.bind(this));
            }
        },
        /**
         * 图层上绘制球
         * @param x: 球心点屏幕坐标的x
         * @param y: 球心点屏幕坐标的y
         */
        drawSphere: function (x, y) {
            this.map.panAble = false;
            var position = this.drawLayer.group.position;
            var p = this.map.screenTo3dPoint(x, y);
            p.x = p.x - position.x;
            p.y = p.y - position.y;
            this.cachePoint[0] = p;
            if (!this.mouseMove) {
                this.mouseMove = on(this.map.domNode, "mousemove", function (e) {
                    var endPoint = this.map.screenTo3dPoint(e.x, e.y);
                    endPoint.x = endPoint.x - position.x;
                    endPoint.y = endPoint.y - position.y;
                    var deltaX = Math.abs(endPoint.x - this.cachePoint[0].x),
                        deltaY = Math.abs(endPoint.y - this.cachePoint[0].y),
                        r2 = deltaX * deltaX + deltaY * deltaY,
                        r = Math.sqrt(r2);
                    this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);   // 移除当前球
                    this.drawLayer.addSphere(this.cachePoint[0], r);
                }.bind(this));
                var sphereMouseUp = on(this.map.domNode, "mouseup", function (e) {
                    this.mouseMove.remove();
                    this.mouseMove = null;
                    sphereMouseUp.remove();
                    this.actionState = "ready";
                    this.map.panAble = true;
                    this.cachePoint = [];
                    this.drawLayer.currentGraphic = null;
                    topic.publish("mapDrawEnd");
                }.bind(this));
            }
        },
        clear: function(){
            this.cachePoint = [];
            this.drawLayer.currentGraphic = null;
            this.drawLayer.clear();
        },
        /**
         * 图层上测量距离
         * @param x: 起点屏幕坐标的x
         * @param y: 起点屏幕坐标的y
         */
        measureLine: function (x, y) {
            this.map.panAble = false; // 禁止平移
            this.drawLayer.currentGraphic = null;
            var position = this.drawLayer.group.position;
            var p = this.map.screenTo3dPoint(x, y);
            p.x = p.x - position.x;
            p.y = p.y - position.y;
            if (this.cachePoint.length > 0) {
                var lineDistance = this.calculateDistance(this.cachePoint[0], p);
                if (lineDistance > 0) {
                    this.drawLayer.addText(p, this.distanceStr(lineDistance));
                }
            }
            this.cachePoint[0] = p;
            if (!this.mouseClickMove) {
                this.mouseClickMove = on(this.map.domNode, "mousemove", function (e) {
                    this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);   // 移除当前线段
                    var ep = this.map.screenTo3dPoint(e.x, e.y);
                    ep.x = ep.x - position.x;
                    ep.y = ep.y - position.y;
                    this.cachePoint[1] = ep;
                    this.drawLayer.addLine(this.cachePoint[0], ep); // 添加新线段, 形成最新线段终点随鼠标终点移动
                }.bind(this));
                var linedblclick = on(this.map.domNode, "dblclick", function () {
                    this.mouseClickMove.remove();
                    this.mouseClickMove = null;
                    linedblclick.remove();
                    this.actionState = "ready";
                    this.map.panAble = true;
                    this.cachePoint = [];
                    this.drawLayer.currentGraphic = null;
                    topic.publish("mapDrawEnd");
                }.bind(this));
            }
        },
        /**
         * 计算两点之间距离
         * @param startPoint: 起点的3d坐标
         * @param endPoint: 终点的3d坐标
         * @returns {number}: 两点间的实际地理距离
         */
        calculateDistance: function (startPoint, endPoint) {
            var line1 = Math.abs(startPoint.x - endPoint.x),
                line2 = Math.abs(startPoint.y - endPoint.y);
            return Math.sqrt(line1 * line1 + line2 * line2) * this.map.initResolution;
        },
        distanceStr: function (distanceNumber) {
            //把距离转换成合适的单位
            return distanceNumber < 1000 ? distanceNumber.toFixed(2) + "米" : (distanceNumber / 1000).toFixed(2) + "千米";
        },
        /**
         * 测量两条线的夹角
         * @param x: 点的3d的x坐标
         * @param y: 点的3d的y坐标
         */
        measureAngle: function (x, y) {
            this.map.panAble = false; // 禁止平移
            this.drawLayer.currentGraphic = null;
            var position = this.drawLayer.group.position;
            var p = this.map.screenTo3dPoint(x, y);
            p.x = p.x - position.x;
            p.y = p.y - position.y;
            this.cachePoint[0] = p;
            this.angleNodes.push(p);//绘制点存入数组
            if (!this.mouseClickMove) {
                this.mouseClickMove = on(this.map.domNode, "mousemove", function (e) {
                    this.drawLayer.removeGraphic(this.drawLayer.currentGraphic);   // 移除当前线段
                    var ep = this.map.screenTo3dPoint(e.x, e.y);
                    ep.x = ep.x - position.x;
                    ep.y = ep.y - position.y;
                    this.cachePoint[1] = ep;
                    this.drawLayer.addLine(this.cachePoint[0], ep); // 添加新线段, 形成最新线段终点随鼠标终点移动
                }.bind(this));
                var linedblclick = on(this.map.domNode, "dblclick", function () {
                    this.mouseClickMove.remove();
                    this.mouseClickMove = null;
                    linedblclick.remove();
                    this.actionState = "ready";
                    this.map.panAble = true;
                    this.cachePoint = [];
                    this.angleNodes = [];
                    this.drawLayer.currentGraphic = null;
                    topic.publish("mapDrawEnd");
                }.bind(this));
            }
            if (this.angleNodes.length > 2) {  //第三个点才开始计算第一个角度
                var len = this.angleNodes.length;
                var node = this.angleNodes[len-1];
                var angle = this.getAngle(this.angleNodes[len-3], this.angleNodes[len-2], node);
                if(angle > 0 && angle < 180){
                    this.drawLayer.addText(node, angle + "度");
                }
            }
        },
        /**
         * 获取三个点确定的两条线的夹角
         * @param p1
         * @param p2
         * @param p3
         * @returns 夹角
         */
        getAngle: function (p1, p2, p3) {
            var _x1 = p1.x - p2.x;
            var _y1 = p1.y - p2.y;
            var _x2 = p3.x - p2.x;
            var _y2 = p3.y - p2.y;
            var dot = _x1 *_x2 + _y1 * _y2;
            var det = _x1 * _y2 - _y1 * _x2;
            var angle = Math.atan2(det , dot) / Math.PI * 180;
            var _deg = (angle +360) % 360;//取角度正值
            return  (_deg < 180 ? _deg : 360 -_deg).toFixed(2);//取锐角
        },

        /**
         * 测量多边形面积
         * @param x
         * @param y
         */
        measurePoly: function (x, y) {
            this.drawPolygon(x, y);
        }
    });
});