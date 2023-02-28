require({cache:{
'url:com/huayun/webgis/templates/MeasureTool.html':"<div class=\"${baseClass}\" style=\"pointer-events: all;\">\r\n    <div id=\"${toolBtnId}\" class=\"tool\">测量<span id=${selectArrowId} class=\"arrowText\"></span></div>\r\n    <ul id=\"${selectWrapId}\" class=\"measureSelect\">\r\n        <li class=\"drawWrap\">\r\n            <div class=\"drawLine\" data-dojo-attach-point=\"measureLineNode\" data-dojo-attach-event=\"onclick:measureLine\">线段\r\n            </div>\r\n        </li>\r\n        <li class=\"drawWrap\">\r\n            <div class=\"drawPoly\" data-dojo-attach-point=\"measureAreaNode\"\r\n                 data-dojo-attach-event=\"onclick:measureArea\">\r\n                面积\r\n            </div>\r\n        </li>\r\n    </ul>\r\n</div>"}});
/*
    测量工具
 */

/*
    地图层级显示控制
 */
define("com/huayun/webgis/widget/MeasureTool", [
    "dojo/_base/declare",
    "dojo/on",
    "dojo/dom",
    "dojo/topic",
    "dojo/_base/query",
    "dojo/dom-class",
    "./MapModuleX",
    "com/huayun/webgis/action/MeasureAction",
    "com/huayun/webgis/layers/3d/DrawSceneLayer",
    "dojo/text!../templates/MeasureTool.html"//模板片段
], function (declare, on, dom, topic, query, domClass, MapModuleX, MeasureAction, GraphicSceneLayer, template) {
    return declare("com.huayun.webgis.widget.MeasureTool", [MapModuleX], {
        map: null,
        baseClass: "measureTool",
        typeClass: "level-box-V",//"level-box-H:水平布局;level-box-V:垂直布局"
        toolBtnId: "measureOpenBtn",
        selectWrapId: "measureSelectWrap",
        selectArrowId: "measureSelectArrow",
        _bottom: 90,
        _right: 10,
        selectState: false,//下拉按钮展开true或隐藏false
        activeState: "",
        actionState: "",
        records: [],
        templateString: template,
        doInit: function () {
            var self = this;
            this.map = this.get("map");
            this.measureAction = new MeasureAction({id: "measure", map: this.map, actionState: "none"});
            on(dom.byId(self.toolBtnId), "click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var target = e.target,
                    action = self.map.action,
                    display = dom.byId(self.selectWrapId).style.display;
                // console.log("display",display,"target",target,"action",action)
                self._toggleSelect();
            });
            topic.subscribe("showDistance", function (param,position) {
                console.log(param,position)
                self.showDistance(param,position);
            });
        },
        _toggleSelect: function () {
            var self = this;
            console.log(self.selectState);
            if (self.selectState) {
                //下拉菜单已经展开
                self._closeSelectWrap();
            } else {
                //下拉处于收缩状态
                self._openSelectWrap();
            }
        },
        _openSelectWrap: function () {
            dojo.query("#" + this.toolBtnId).removeClass("tool").addClass("toolActive");
            dojo.query("#" + this.selectWrapId).style("display", "block");
            dojo.query("#" + this.selectArrowId).removeClass("arrowText").addClass("arrowTextActive");
            this.selectState = true;
            console.log("_openSelectWrap")
        },
        _closeSelectWrap: function () {
            dojo.query("#" + this.toolBtnId).removeClass("toolActive").addClass("tool");
            dojo.query("#" + this.selectWrapId).style("display", "none");
            dojo.query("#" + this.selectArrowId).removeClass("arrowTextActive").addClass("arrowText");
            this.selectState = false;
            console.log("_closeSelectWrap")
        },
        _getRecordsLength: function () {
            return this.records.length;
        },
        addRecord: function (record) {
            this.records.push(record);
        },
        removeRecord: function (recordIndex) {
            this.records.splice(recordIndex, 1);
        },
        measureLine: function (x, y, theta) {
            console.log("measureLine");
            this.removeActiveClass()
            this.measureLineNode.className = "drawLineActive";
            this.measureAreaNode.className = "drawPoly";
            this._toggleSelect();
            this.measureAction.setActionState("measureLine");
            this.map.setAction(this.measureAction);
            topic.publish("drawLines", x, y, theta);
        },
        drawLines: function (x, y, theta) {
            var nowIndex = this._getRecordsLength();//再添加新的纪录的索引为
            var startPoint = this.map.screenTo3dPoint(x, y);
            var self = this;
            self.map.panAble = false;
            console.log(this.mouseClickMove);
            if (!this.mouseClickMove) {
                this.mouseClickMove = on(this.map.domNode, "mousemove", function (e) {
                    var endPoint = self.map.screenTo3dPoint(e.x, e.y);
                    topic.publish("mapDrawLine", {ex: endPoint.x, ey: endPoint.y, theta: theta});
                    topic.publish("showDistance", {p1: startPoint, p2: endPoint});

                });
                var linedblclick = on(this.map.domNode, "dblclick", function () {
                    self.mouseClickMove.remove();
                    self.mouseClickMove = null;
                    linedblclick.remove();
                    self.actionState = "ready";
                    self.map.panAble = true;
                    topic.publish("mapDrawLineEnd");
                });
            }
            startPoint.theta = theta;
            topic.publish("mapDrawLineNode", startPoint);
        },
        calculateDistance: function (param) {// 参数为3d坐标
            console.log("p1", this.map.positionToGeometry(this.map.screenToPosition(param.p1)));
            console.log("p1", this.map.positionToGeometry(this.map.screenToPosition(param.p2)));
            var a = Math.abs(param.p1.x - param.p2.x);
            var b = Math.abs(param.p1.y - param.p2.y);
            console.log("线段距离(米)", Math.sqrt(a * a + b * b))
            return Math.sqrt(a * a + b * b);
        },
        createTextTexture: function (obj) {
            var canvas = document.createElement("canvas")
            canvas.width = obj.width || 256;
            canvas.height = obj.width || 256;
            var ctx = canvas.getContext("2d");
            ctx.font = obj.font || "Bold 100px Arial";
            ctx.lineWidth = 4;
            ctx.fillStyle = obj.color || "#ff0000";
            console.log("obj.text",obj.text);
            ctx.fillText(obj.text, 10, 1000);

            var textture = new THREE.Texture(canvas);
            textture.needsUpdate = true;
            textture.wrapS = THREE.RepeatWrapping;
            textture.wrapT = THREE.RepeatWrapping;
            return textture;
        },
        addTextTexture:function(obj,position3d){
            /*var self = this;
            var mateiral = new THREE.SpriteMaterial({
                map: self.createTextTexture(obj),
                opacity:1,
                transparent:true
            })
            var particle = new THREE.Sprite(mateiral);
            particle.scale.set(500, 500, 1);
            // particle.position.set(position3d.x,position3d.y,position3d.z);
            // self.map.layerContainer.group.add(particle);*/
            var drawLayer = this.map.findLayerById("graphic");
            // drawLayer.group.add(particle);
            drawLayer.addTextTexture(obj. position3d);


        },
        showDistance: function (param,position) {
            var distance = this.calculateDistance(param);
            this.addTextTexture({
                text:distance
            },position)
            console.log(distance,position)
        },
        measureArea: function () {
            this.removeActiveClass()
            this.measureAreaNode.className = "drawPolyActive";
            this.measureLineNode.className = "drawLine";
            this._toggleSelect();
            this.measureAction.setActionState("measureArea");
            this.map.setAction(this.measureAction);
        },
        removeActiveClass: function () {
            dojo.query(".measureActive").removeClass("measureActive")
        }
    })
});