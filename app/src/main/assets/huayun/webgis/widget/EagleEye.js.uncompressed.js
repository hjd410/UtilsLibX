require({cache:{
'url:com/huayun/webgis/templates/eagleEye.html':"<div class=\"eagleEye-box\" data-dojo-attach-point=\"eagleEyeBox\" style=\"pointer-events: none;\">\r\n    <div class=\"target-view-box\" draggable=\"true\" data-dojo-attach-point=\"viewBox\" style=\"pointer-events: auto;\"></div>\r\n    <p data-dojo-attach-point=\"slideEagleEye\"  data-dojo-attach-event=\"onclick:toggle\" class=\"eagleEye-toggle-btn\" id=\"eagleEye-toggle-button\" style=\"pointer-events: all;\"></p>\r\n</div>\r\n\r\n"}});
/**
 * @ Description: 鹰眼功能模块
 * @ module: EagleEye
 * @ Author: zy
 * @ Date: 2019/4/26
 */
define(
    "com/huayun/webgis/widget/EagleEye", [
        "dojo/_base/declare",
        "dojo/_base/fx",
        "dojo/dom",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/topic",
        "dojo/on",
        "./MapModuleX",
        "../Map",
        "../views/EagleView",
        "../../webgis/geometry/Extent",
        "../../webgis/layers/TileLayer",
        "dojo/text!../templates/eagleEye.html"
    ], function (declare, baseFx, dom, domClass, domConstruct, topic, on, MapModuleX, Map, SceneView, Extent, TileLayer, template) {
        return declare("com.huayun.webgis.widget.EagleEye", [MapModuleX], {
            templateString: template,//本组件的template
            name: "EagleEye",
            baseClass: "eagleEye",
            targetViewBoxClass: "",

            scale: 2,//默认2倍
            showFlag: true,//鹰眼地图是否显示状态
            width: 0,
            height: 0,
            toggleBtnSize: 16,//展开收缩按钮大小（正方型长宽）
            _moveHandler: null,
            _centerTopAndLeft: {},

            constructor: function () {
                /*
                
                .subscribe("mapLoadComplete", function () {
                    this._mapLoadCompleteHandler();
                }.bind(this));
                window.addEventListener("resize", this._resize.bind(this), false);*/
            },

            doInit: function () {
                this.map = this.get("map");
                this.view = this.get("view");
                var ratio = this.view.height / this.view.width;
                var width = 400,
                    height = width * ratio;
                this.width = width;
                this.height = height;
                this.eagleEyeBox.style.width = width + "px";
                this.eagleEyeBox.style.height = height + "px"; //鹰眼地图大小
                this.viewBox.style.width = width / this.scale + "px";
                this.viewBox.style.height = height / this.scale + "px"; //移动选择框大小

                this.offsetTop = (height - height / this.scale) / 2;
                this.offsetLeft = (width - width / this.scale) / 2;
                this.maxTop = height - height / this.scale;
                this.maxLeft = width - width / this.scale;

                this.viewBox.style.top = this.offsetTop + "px";
                this.viewBox.style.left = this.offsetLeft + "px";

                var config = this.get("config");
                if (this.view._load) {
                    var map = new Map({
                        id: "EagleMap"
                    });
                    var layer = new TileLayer({
                        id: "eagleTile",
                        visible: true,
                        url: config.url
                    });
                    map.addLayer(layer);
                    // debugger;
                    this.eagleView = new SceneView({
                        container: this.domNode,
                        map: map,
                        id: "EagleEye",
                        level: this.view.level - 3,
                        center: this.view.center
                    });
                }
                topic.subscribe("extentChangeEvent", function (targetView) {
                    if (targetView.id === "EagleEye") {
                        return;
                    }

                    if (!this.eagleView) {
                        var map = new Map({
                            id: "EagleMap"
                        });
                        var layer = new TileLayer({
                            id: "eagleTile",
                            visible: true,
                            url: config.url
                        });
                        map.addLayer(layer);
                        this.eagleView = new SceneView({
                            container: this.domNode,
                            map: map,
                            name: "EagleEye",
                            id: "EagleEye",
                            level: this.view.level - 3,
                            center: this.view.center
                        });
                    } else {
                        var level = (targetView.viewpoint.targetZoom|| targetView.level) - 3;
                        var center = targetView.center;
                        this.eagleView.setCenter(center, level);
                    }
                }.bind(this));
                this.addDragEventListener();
                this.toggle();
            },

            /*_setTargetViewBoxToCenter: function () {
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
            },*/
            addDragEventListener: function () {
                this.startPoint = {};
                on(this.viewBox, "mousedown", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.startPoint.x = e.clientX;
                    this.startPoint.y = e.clientY;
                    this._moveHandler = on(this.viewBox, "mousemove", this._onMouseMoveMethod.bind(this));
                    this._upHandler = on(this.viewBox, "mouseup", function (e) {
                        e.stopPropagation();
                        var xmin = Number(this.viewBox.style.left.substring(0, this.viewBox.style.left.length - 2)),
                            xmax = xmin + this.width / this.scale,
                            ymin = Number(this.viewBox.style.top.substring(0, this.viewBox.style.top.length - 2)),
                            ymax = ymin + this.height/ this.scale;
                        var bounds = this.eagleView.calcBounds(xmin, xmax, ymin, ymax);
                        var cx = (bounds[0].x + bounds[1].x)/2,
                            cy = (bounds[0].y + bounds[2].y)/2;
                        this.view.setCenter([cx, cy], this.view.level);
                        this.viewBox.style.top = this.offsetTop + "px";
                        this.viewBox.style.left = this.offsetLeft + "px";
                        if (this._moveHandler) {
                            this._moveHandler.remove();
                        }
                        if (this._upHandler) {
                            this._upHandler.remove();
                        }
                    }.bind(this));

                }.bind(this));
            },

            _onMouseMoveMethod: function (e) {
                var x = e.clientX,
                    y = e.clientY;
                if ((this.offsetTop + (y - this.startPoint.y)) > this.maxTop) {
                    this.viewBox.style.top = this.maxTop + "px";
                } else if ((this.offsetTop + (y - this.startPoint.y)) < 0) {
                    this.viewBox.style.top = 0 + "px";
                } else {
                    this.viewBox.style.top = this.offsetTop + (y - this.startPoint.y) + "px";
                }
                if ((this.offsetLeft + (x - this.startPoint.x)) > this.maxLeft) {
                    this.viewBox.style.left = this.maxLeft + "px";
                } else if ((this.offsetLeft + (x - this.startPoint.x)) < 0) {
                    this.viewBox.style.left = 0 + "px";
                } else {
                    this.viewBox.style.left = (this.offsetLeft + (x - this.startPoint.x)) + "px";
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
            }
        });
    }
);