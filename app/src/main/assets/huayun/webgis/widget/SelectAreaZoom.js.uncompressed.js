require({cache:{
'url:com/huayun/webgis/templates/selectAreaZoom.html':"<div>\r\n    <!--<div class=\"selectArea-box\">-->\r\n        <p class=\"selectArea-btn\" id=\"${btnId}\" data-dojo-attach-point=\"selectAreaNode\" data-dojo-attach-event=\"onclick:toggleState\" >\r\n            框选区域\r\n        </p>\r\n    <!--</div>-->\r\n</div>\r\n\r\n"}});
/**
 * @ Description: 拖拽选择地图区域缩放
 * @ module: selectAreaZoom
 * @ Author: zy
 * @ Date: 2019/5/16
 */

define("com/huayun/webgis/widget/SelectAreaZoom", [
    "dojo/_base/declare",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/topic",
    "dojo/_base/query",
    "../../webgis/geometry/Extent",
    "./MapModuleX",
    "com/huayun/webgis/action/DrawAction",
    "dojo/text!../templates/selectAreaZoom.html"
], function (declare, on, domConstruct, topic, query, Extent, MapModuleX, DrawAction, template) {
    return declare("com.huayun.webgis.widget.SelectAreaZoom", [MapModuleX], {
        map: null,
        baseClass: "selectArea-btn",
        btnDefaultClass: "selectArea-btn",
        btnActiveClass: "selectArea-btn-active",//工具按钮激活类名
        templateString: template,
        btnId: "selectMap",
        canvas: null,
        active: false,//功能是否激活
        actionState: false,//
        doInit: function () {
            this.map = this.get("map");
            this.GraphicSceneLayer = this.map.findLayerById("drawLayer");
            // domConstruct.create("div",{id:"clickBtn",innerHTML:"位置搜索",onclick:this._onClickHandler.bind(this)},this.domNode);
        },
        activeState: function () {
            //激活框选
            this.active = true;
            this.addCanvas();//新增画布
            query("#" + this.btnId).addClass(this.btnActiveClass);
        },
        inactiveState: function () {
            //取消激活
            this.active = false;
            query("#" + this.btnId).removeClass(this.btnActiveClass);
            this.map.panAble = true;
            console.log(this.map)
        },
        toggleState: function () {
            //状态切换
            if (!this.state) {
                this.activeState();
            } else {
                this.inactiveState();
            }
        },
        addCanvas: function () {
            if (!this.canvas) {
                //画布不存在,添加新canvas画布
                var _canvas = document.createElement("canvas");
                _canvas.width = this.map.width;
                _canvas.height = this.map.height;
                _canvas.style = "position:absolute;top:0;right:0;cursor:crosshair;";
                this.canvas = _canvas;
                this.map.domNode.appendChild(_canvas);
                this.selectAreaZoom();
            } else {
                //显示画布
                this.canvas.style.display = "block";
            }
        },
        removeCanvas: function () {
            this.canvas.style.display = "none";
        },
        selectAreaZoom: function () {
            var self = this;
            //拖拽选择区域缩放
            if (this.canvas) {
                var flag = false;
                var _canvas = this.canvas;
                var startPoint = {};
                var endPoint = {};
                var ctx = _canvas.getContext("2d");
                _canvas.addEventListener("mousedown", function (e) {
                    flag = true;
                    self.map.panAble = false;
                    startPoint.x = e.offsetX;
                    startPoint.y = e.offsetY;
                });
                _canvas.addEventListener("mousemove", function (e) {
                    if (flag) {
                        self.drawRect(ctx, _canvas, startPoint, e);
                    }
                });
                _canvas.addEventListener("mouseup", function (e) {
                    flag = false;
                    endPoint.x = e.offsetX;
                    endPoint.y = e.offsetY;
                    self.map.setExtent(getSelectedExtend(startPoint, endPoint, self.map));
                    topic.publish("setEagleEyeExtent", self.map.extent);
                    ctx.clearRect(0, 0, _canvas.width, _canvas.height);
                    self.removeCanvas();
                    self.inactiveState();
                });

                function getSelectedExtend(p1, p2, map) {//计算选择矩形的范围
                    var leftTopPoint = {x: 0, y: 0};
                    var rightBottomPoint = {x: self.canvas.width, y: self.canvas.height};
                    leftTopPoint.x = p1.x < p2.x ? p1.x : p2.x;//取x小的
                    leftTopPoint.y = p1.y < p2.y ? p1.y : p2.y;
                    rightBottomPoint.x = p1.x > p2.x ? p1.x : p2.x;//取x大的
                    rightBottomPoint.y = p1.y > p2.y ? p1.y : p2.y;
                    var perX = (map.extent.maxx - map.extent.minx) / self.canvas.width;//需要重新计算每个px代表的地理范围
                    var perY = (map.extent.maxy - map.extent.miny) / self.canvas.height;
                    console.log(p1, p2, leftTopPoint, rightBottomPoint, map.width, self.canvas.width, map.height, self.canvas.height, perX, perY)
                    var _newExtent = new Extent(map.extent.minx + p1.x * perX,
                        map.extent.maxy - p1.y * perY,
                        map.extent.minx + p2.x * perX,
                        map.extent.maxy - p2.y * perY);
                    console.log(_newExtent)
                    return _newExtent;
                }
            }
        },
        drawRect:function (ctx, canvas, startPoint, e) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.fillStyle = "rgba(0,0,0,0.3)";
                ctx.strokeStyle = "rgba(0,0,0,0.6)";
                ctx.fillRect(startPoint.x, startPoint.y, e.offsetX - startPoint.x, e.offsetY - startPoint.y);
            }
    });
})
;