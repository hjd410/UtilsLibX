require({cache:{
'url:com/huayun/webgis/templates/drawController.html':"<div class=\"${baseClass}\" style=\"pointer-events: all;\">\r\n    <!--<div class=\"collapse-btn collapse-down tool\" id=\"openTl\">工具<span class=\"arrowText\" id=\"arrowText\"></span></div>\r\n    -->\r\n    <div class=\"tool\" id=\"openTl\">工具<span class=\"arrowText\" id=\"arrowText\"></span></div>\r\n    <ul id=\"drawSelectWrap\" class=\"drawSelect\">\r\n        <li class=\"toolGroupLabel\">\r\n           绘制工具\r\n        </li>\r\n\r\n        <li class=\"drawWrap\" data-dojo-attach-point=\"drawDotNode\" data-dojo-attach-event=\"onclick:drawDot\">\r\n            <div class=\"drawDot\">画点\r\n            </div>\r\n        </li>\r\n        <li class=\"drawWrap\" data-dojo-attach-point=\"drawLineNode\" data-dojo-attach-event=\"onclick:drawLine\">\r\n            <div class=\"drawLine\">画线</div>\r\n        </li>\r\n        <li class=\"drawWrap\" data-dojo-attach-point=\"drawCircleNode\"\r\n            data-dojo-attach-event=\"onclick:drawCircle\">\r\n            <div class=\"drawCircle\" >\r\n                画圆\r\n            </div>\r\n        </li>\r\n        <li class=\"drawWrap\"  data-dojo-attach-point=\"drawPolyNode\"\r\n            data-dojo-attach-event=\"onclick:drawPolygon\">\r\n            <div class=\"drawPoly\">\r\n                画多边形\r\n            </div>\r\n        </li>\r\n        <li class=\"drawWrap\" data-dojo-attach-point=\"drawSphereNode\"\r\n            data-dojo-attach-event=\"onclick:drawSphere\">\r\n            <div class=\"drawSphere\">\r\n                画球\r\n            </div>\r\n        </li>\r\n        <li class=\"toolGroupLabel\">\r\n            测量工具\r\n        </li>\r\n\r\n        <li class=\"drawWrap\"  data-dojo-attach-point=\"measureLineNode\" data-dojo-attach-event=\"onclick:measureLine\">\r\n            <div class=\"drawLine\">距离\r\n            </div>\r\n        </li>\r\n\r\n        <li class=\"drawWrap\" data-dojo-attach-point=\"measurePolyNode\"\r\n            data-dojo-attach-event=\"onclick:measurePoly\">\r\n            <div class=\"drawPoly\" >\r\n                面积\r\n            </div>\r\n        </li>\r\n\r\n        <li class=\"drawWrap\" data-dojo-attach-point=\"measureAngleNode\"\r\n            data-dojo-attach-event=\"onclick:measureAngle\">\r\n            <div class=\"drawLine\" >\r\n                角度\r\n            </div>\r\n        </li>\r\n\r\n        <li class=\"drawWrap\">\r\n            <div class=\"clearDraw\" data-dojo-attach-event=\"onclick:clearGraphic\">清空</div>\r\n        </li>\r\n\r\n        <li class=\"drawWrap\">\r\n            <div class=\"clearDraw\" data-dojo-attach-event=\"onclick:rectSelect\">矩形选择</div>\r\n        </li>\r\n\r\n        <li class=\"drawWrap\">\r\n            <div class=\"clearDraw\" data-dojo-attach-event=\"onclick:polygonSelect\">多边形选择</div>\r\n        </li>\r\n    </ul>\r\n</div>"}});
/**
 * 地图的画点线面控制器
 */
define("com/huayun/webgis/widget/DrawController", [
    "dojo/_base/declare",
    "dojo/on",
    "dojo/dom",
    "dojo/topic",
    "dojo/_base/query",
    "./MapModuleX",
    "com/huayun/webgis/action/DrawAction",
    "dojo/text!../templates/drawController.html"
], function (declare, on,dom, topic, query,MapModuleX, DrawAction, template) {
    return declare("com.huayun.webgis.widget.DrawController", [MapModuleX], {
        map: null,
        baseClass: "drawController",
        itemDefaultClassName:"drawWrap",
        itemActiveClassName: "toolItemActive",//工具按钮激活类名
        templateString: template,
        toolBtnId: "openTl",
        selectWrapId: "drawSelectWrap",
        selectArrowId: "arrowText",
        selectState: false,//下拉按钮展开true或隐藏false
        activeState: "",
        actionState: "",
        linesRecordDict: [],//记录字典
        drawAction: null,
        doInit: function (params) {
            this.map = this.get("map");
            this.drawAction = new DrawAction({id: "draw", map: this.map, actionState: "none"});
            var self = this;
            on(dom.byId(self.toolBtnId), "click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                self._toggleSelect();
                var target = e.target,
                    action = self.map.action ,
                    display = dom.byId(self.selectWrapId).style.display;
                if (target.className == "tool") {
                    if(action){
                        var actionId = action.id;
                        if (actionId == "draw") {
                            if (action.actionState != "none") {
                                if (display == "block") {
                                    dom.byId("drawSelectWrap").style.display = "none";
                                } else {
                                    dom.byId("drawSelectWrap").style.display = "block";
                                }
                            } else {
                                target.className = "tool";
                                dom.byId("arrowText").className = "arrowText";
                                dom.byId("drawSelectWrap").style.display = "none";
                                self.map.clearAction();
                            }
                        }
                    }else{
                        //展开下拉菜单
                        target.className = "toolActive";
                        dom.byId("arrowText").className = "arrowTextActive";
                        dom.byId("drawSelectWrap").style.display = "block";
                        self.map.setAction(self.drawAction);
                    }
                } else {
                    //展开下拉菜单
                    target.className = "toolActive";
                    dom.byId("arrowText").className = "arrowTextActive";
                    dom.byId("drawSelectWrap").style.display = "block";
                    self.map.setAction(self.drawAction);
                }
            });
            topic.subscribe("mapDrawDot", function () {
                self.clearDrawIcon();
            });
            topic.subscribe("mapDrawEnd", function () {
                self.clearDrawIcon();
            });
            // this.map.setAction(this.drawAction);
        },
        _toggleSelect: function () {
            var self = this;
            // console.log("selectState",self.selectState);
            if (self.selectState) {
                //下拉菜单已经展开
                self._closeSelectWrap();
            } else {
                //下拉处于收缩状态
                self._openSelectWrap();
            }
        },
        _openSelectWrap: function () {
            query("#" + this.toolBtnId).removeClass("tool").addClass("toolActive");
            query("#" + this.selectWrapId).style("display", "block");
            query("#" + this.selectArrowId).removeClass("arrowText").addClass("arrowTextActive");
            this.selectState = true;
        },
        _closeSelectWrap: function () {
            query("#" + this.toolBtnId).removeClass("toolActive").addClass("tool");
            query("#" + this.selectWrapId).style("display", "none");
            query("#" + this.selectArrowId).removeClass("arrowTextActive").addClass("arrowText");
            this.selectState = false;
        },
        removeActiveClass:function(){
            query("."+this.itemActiveClassName).removeClass(this.itemActiveClassName)
        },
        addActiveClass : function(dom){
          dom.className = this.itemDefaultClassName + " "  + this.itemActiveClassName;
        },
        drawDot: function () {
            this.removeActiveClass();
            this.addActiveClass(this.drawDotNode);
            this.drawAction.setActionState("dot");
            this._toggleSelect();
        },
        drawLine: function () {
            this.removeActiveClass();
            this.addActiveClass(this.drawLineNode);
            this.drawAction.setActionState("line");
            this._toggleSelect();
        },
        drawCircle: function () {
            this.removeActiveClass();
            this.addActiveClass(this.drawCircleNode);
            this.drawAction.setActionState("circle");
            this._toggleSelect();
        },
        drawPolygon: function () {
            this.removeActiveClass();
            this.addActiveClass(this.drawPolyNode);
            this.drawAction.setActionState("polygon");
            this._toggleSelect();
        },
        drawSphere: function () {
            this.removeActiveClass();
            this.addActiveClass(this.drawSphereNode);
            this.drawAction.setActionState("sphere");
            this._toggleSelect();

        },
        measureLine:function(){
            this.removeActiveClass();
            this.addActiveClass(this.measureLineNode);
            this.drawAction.setActionState("measureLine");
            this._toggleSelect();
        },
        measurePoly:function(){
            this.removeActiveClass();
            this.addActiveClass(this.measurePolyNode);
            this.drawAction.setActionState("measurePoly");
            this._toggleSelect();
        },
        measureAngle:function(){
          //测量角度
            this.removeActiveClass();
            this.addActiveClass(this.measureAngleNode);
            this.drawAction.setActionState("measureAngle");
            this._toggleSelect();
        },
        clearGraphic: function () {
            this.removeActiveClass();
            document.getElementById("arrowText").className = "arrowText";
            document.getElementById("drawSelectWrap").style.display = "none";
            document.getElementById("openTl").className = "tool";
            this.drawAction.actionState = "none";
            this.drawAction.clear();
            this.map.panAble = true;
            this.map.clearAction();
            this._toggleSelect();
        },
        clearDrawIcon: function () {
            this.removeActiveClass();
        },
        rectSelect: function () {
            this.drawAction.setActionState("rectSelect");
            this._toggleSelect();
        },
        circleSelect: function () {
            this.drawAction.setActionState("circleSelect");
            this._toggleSelect();
        },
        polygonSelect: function () {
            this.drawAction.setActionState("polygonSelect");
            this._toggleSelect();
        }
    });
});