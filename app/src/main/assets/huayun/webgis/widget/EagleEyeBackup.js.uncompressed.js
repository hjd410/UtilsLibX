require({cache:{
'url:com/huayun/webgis/templates/eagleEye.html':"<div class=\"eagleEye-box\" data-dojo-attach-point=\"eagleEyeBox\" style=\"pointer-events: none;\">\r\n    <div class=\"target-view-box\" draggable=\"true\" data-dojo-attach-point=\"viewBox\" style=\"pointer-events: auto;\"></div>\r\n    <p data-dojo-attach-point=\"slideEagleEye\"  data-dojo-attach-event=\"onclick:toggle\" class=\"eagleEye-toggle-btn\" id=\"eagleEye-toggle-button\" style=\"pointer-events: all;\"></p>\r\n</div>\r\n\r\n"}});
/**
 * @ Description: 鹰眼功能模块
 * @ module: EagleEye
 * @ Author: zy
 * @ Date: 2019/4/26
 */
define(
    "com/huayun/webgis/widget/EagleEyeBackup", [
        "dojo/_base/declare",
        "dojo/_base/fx",
        "dojo/dom",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/topic",
        "dojo/on",
        "dojo/_base/query",
        "../../module/supportClass/BaseMapModule",
        "../../webgis/geometry/Extent",
        "../Map",
        "../../webgis/views/SceneView",
        "../../webgis/layers/TileLayer",
        "../../webgis/layers/MapImageLayer",
        "../facade/MapConfigFacade",
        "../action/MapAction",
        "dojo/text!../templates/eagleEye.html"
    ], function (declare, baseFx, dom, domClass, domConstruct, domAttr, topic, on, query, BaseMapModule, Extent, Map, SceneView, TileLayer, MapImageLayer, MapConfigFacade, MapAction, template) {
        return declare("com.huayun.webgis.widget.EagleEye", [BaseMapModule], {
            smallMap: null,
            bigMap: null,
            bigView: null,
            eagleEyeDomId: "eagleEyeDom",
            templateString: template,//本组件的template
            name: "EagleEye",
            baseClass: "eagleEye",
            targetViewBoxClass: "target-view-box",
            toggleBtnClass: "eagleEye-toggle-btn",
            toggleBtnId: "eagleEye-toggle-button",
            perPxExtent: 0,//每个x像素代表的地图范围
            perPyExtent: 0,//每个y像素代表的地图范围
            scale: 2,//默认2倍
            status: false,
            showFlag: true,//鹰眼地图是否显示状态
            width: 0,
            height: 0,
            showLogo: false,
            toggleBtnSize: 16,//展开收缩按钮大小（正方型长宽）

            _moveHandler: null,
            _centerTopAndLeft: {},

            constructor: function () {
                this.view = null;
                topic.subscribe("mapLoadComplete", function () {
                    this._mapLoadCompleteHandler();
                }.bind(this));
                window.addEventListener("resize", this._resize.bind(this), false);
            },

            doInit: function () {
                var simpleMapModule3D = this.context.lookUp("simpleMapModule3D");
                this.bigMap = simpleMapModule3D.map;
                this.bigView = simpleMapModule3D.view;
                this.aspect_ratio = this.bigView.width / this.bigView.height;
                this.width = 400;
                this.height = this.width / this.aspect_ratio;
                this.targetViewBoxDom = document.getElementsByClassName(this.targetViewBoxClass)[0];//移动选择框dom
                query("." + this.baseClass).style("width", this.width + "px");//鹰眼地图大小
                query("." + this.baseClass).style("height", this.height + "px");//鹰眼地图大小
                query("." + this.baseClass).style("overflow", "hidden");//鹰眼地图大小
                query("." + this.targetViewBoxClass).style("width", this.width / this.scale + "px");//移动选择框大小
                query("." + this.targetViewBoxClass).style("height", this.height / this.scale + "px");
                query("." + this.targetViewBoxClass).style("top", (1 - 1 / this.scale) / 2 * this.height + "px");//垂直居中
                query("." + this.targetViewBoxClass).style("left", (1 - 1 / this.scale) / 2 * this.width + "px");
                query("." + this.toggleBtnClass).style("left", "0");
                query("." + this.toggleBtnClass).style("bottom", "0");
                query("#" + this.eagleEyeDomId).style("position", "absolute");
                query("#" + this.eagleEyeDomId).style("top", "0");
                query("#" + this.eagleEyeDomId).style("left", "0");
                var config = this.get("config");
                // console.log(config);
                this.view = new SceneView({
                    container: this.domNode,
                    map: this.bigMap,
                    name: "EagleEye"
                });
                this.view.extent = simpleMapModule3D.view.extent;
                this.view.setLevel(simpleMapModule3D.view.level - 3);
                this.view.allLayerViews.forEach(function (item) {
                    if (item.id !== "tile") {
                        item.setVisible(false);
                    }
                });
                //
                topic.subscribe("extentChangeEvent", function (extent) {
                    // console.log(simpleMapModule3D.view.extent, this.view.extent, extent);
                    var disLevel = simpleMapModule3D.view.level - 3;
                    var center;
                    // console.log(disLevel);
                    if (disLevel > 0) {
                        center = simpleMapModule3D.view.extent.getCenter();
                        var viewCenter = this.view.extent.getCenter();
                        this.view.setLevel(disLevel);
                        this.view.centerAt(center.x, center.y);
                        // if((center.x === viewCenter.x) && (center.y === viewCenter.y)){
                        //     this.view.setLevel(disLevel);
                        // }else{
                        //
                        // }
                    } else {
                        center = simpleMapModule3D.view.extent.getCenter();
                        this.view.setLevel(0);
                        this.view.centerAt(center.x, center.y);
                    }
                    this._setTargetViewBoxToCenter();
                }.bind(this));

                this.getPxExtent();
                this.getPyExtent();
                this.addDragEventListener();
                this.toggle();//地图初始化默认隐藏*!/
            },
            _resize: function () {

            },

            _setTargetViewBoxToCenter: function () {
                //将鹰眼选择框居中
                query("." + this.targetViewBoxClass).style("top", (1 - 1 / this.scale) / 2 * this.height + "px");//垂直居中
                query("." + this.targetViewBoxClass).style("left", (1 - 1 / this.scale) / 2 * this.width + "px");
            },
            getPxExtent: function () {//小地图每px代表的X范围
                var _pxExtent = (this.view.extent.maxx - this.view.extent.minx) / this.width;
                this.perPxExtent = _pxExtent;
                return _pxExtent;
            },
            getPyExtent: function () {//小地图每px代表的Y范围
                var _pyExtent = (this.view.extent.maxy - this.view.extent.miny) / this.height;
                this.perPyExtent = _pyExtent;
                return _pyExtent;
            },
            addDragEventListener: function () {
                var _dragTarget = document.getElementsByClassName(this.targetViewBoxClass);//小地图目标区域框
                var startPoint = {};
                this._centerTopAndLeft = {
                    top: _dragTarget[0].style.top.slice(0, -2),
                    left: _dragTarget[0].style.left.slice(0, -2)
                };

                on(_dragTarget[0], "mousedown", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    //鼠标在页面中的位置
                    var x = e.pageX || e.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft);
                    var y = e.pageY || e.clientY + (document.body.scrollTop || document.documentElement.scrollTop);
                    startPoint.x = x;
                    startPoint.y = y;

                    this._moveHandler = on(this.domNode, "mousemove", function (evt) {
                        this._onMouseMoveMethod({evt: evt, target: _dragTarget[0], startValue: startPoint});
                    }.bind(this));
                }.bind(this));

                on(document, "mouseup", function (e) {
                    e.stopPropagation();
                    if (this._moveHandler !== null) {
                        this._moveHandler.remove();
                        this._moveHandler = null;
                        var endPointX = e.pageX || e.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft);
                        var endPointY = e.pageY || e.clientY + (document.body.scrollTop || document.documentElement.scrollTop);
                        // console.log(endPointX, endPointY);
                        var moveChange = {x: endPointX - startPoint.x, y: endPointY - startPoint.y};
                        var newExtent = this.getNewMapExtent(moveChange),
                            newExtentCenter = newExtent.getCenter();
                        // console.log(newExtentCenter);
                        this.bigView.centerAt(newExtentCenter.x, newExtentCenter.y);
                        _dragTarget[0].style.top = this._centerTopAndLeft.top + "px";
                        _dragTarget[0].style.left = this._centerTopAndLeft.left + "px";
                    }
                }.bind(this));
            },

            _onMouseMoveMethod: function (data) {
                if (Math.abs(data.evt.clientY - data.startValue.y) > Number(data.target.style.height.slice(0, -2))) {
                    data.target.style.top = data.evt.clientY - data.startValue.y > 0 ? data.target.style.height : "0px";
                } else {
                    data.target.style.top = Number(this._centerTopAndLeft.top) + data.evt.clientY - data.startValue.y + "px";
                }

                if (Math.abs(data.evt.clientX - data.startValue.x) > Number(data.target.style.width.slice(0, -2))) {
                    data.target.style.left = data.evt.clientX - data.startValue.x > 0 ? data.target.style.width : "0px";
                } else {
                    data.target.style.left = Number(this._centerTopAndLeft.left) + data.evt.clientX - data.startValue.x + "px";
                }
            },

            getNewMapExtent: function (moveChange) {
                //鹰眼地图拖拽选择框计算出真实地图的新范围
                // console.log(moveChange,this.perPxExtent,this.perPyExtent);
                //范围y值 是上大下小 取moveChange.y的负数
                this.getPxExtent();
                this.getPyExtent();
                var _oldExtent = this.bigView.extent;
                var _newExtent = new Extent(_oldExtent.minx + moveChange.x * this.perPxExtent,
                    _oldExtent.miny + -moveChange.y * this.perPyExtent,
                    _oldExtent.maxx + moveChange.x * this.perPxExtent,
                    _oldExtent.maxy + -moveChange.y * this.perPyExtent);
                // console.log("_oldExtent", _oldExtent, "_newExtent", _newExtent);
                return _newExtent;
            },
            toggle: function () {
                if (this.showFlag) {
                    this.hide();
                } else {
                    this.show();
                }
            },
            hide: function () {
                var self = this;
                baseFx.animateProperty({
                    node: this.domNode,
                    properties: {
                        top: -self.height + self.toggleBtnSize,
                        right: -self.width + self.toggleBtnSize
                    },
                    duration: 400
                }).play();
                this.showFlag = false;
                query("#" + this.toggleBtnId).style("transform", "rotate(90deg)");
            },
            show: function () {
                var self = this;
                baseFx.animateProperty({
                    node: self.domNode,
                    properties: {
                        top: 0,
                        right: 0
                    },
                    duration: 400
                }).play();
                this.showFlag = true;
                query("#" + this.toggleBtnId).style("transform", "rotate(-90deg)");
            }
        });
    }
);