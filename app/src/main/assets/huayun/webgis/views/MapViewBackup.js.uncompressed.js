/**
 *  Created by WebStorm
 *  @Author: JiGuangjie
 *  @Date:  2018/11/8
 *  @Time:  11:04
 *  @Email: 530904731@qq.com
 */
define(
    "com/huayun/webgis/views/MapViewBackup", [
        "dojo/_base/declare",
        "com/huayun/webgis/views/View"

    ],function (declare,View) {
        return declare("com.huayun.webgis.views.MapView",[View],{
            width: 0,
            height: 0,
            initExtent: 0,
            resolution: 0,
            viewpoint: null,
            panEnabled: true,
            zoomEnabled: true,
            rotateEnabled: true,
            allLayerViews: [],
            _renderer: null,
            _camera: null,
            _scene: null,
            _group: null,
            initZ: 1,
            _initLevel: 12,
            extent: null,
            level: 0,
            maxLevel: 0,
            _tileInfo: null,
            center: null,
            _load: false,
            _offsetLeft: 0,
            _offsetTop: 0,
            _screenPoint: null,

            constructor: function (params) {
                this.container = params.container;
                this.map = params.map;
                this.is3DVision = params.is3DVision;

                this._animateRaf = null;
                var nodeWidth = this.container.clientWidth,
                    nodeHeight = this.container.clientHeight;
                this._containerWidth = nodeWidth;
                this._containerHeight = nodeHeight;
                this.panEnabled = true;
                this.zoomEnabled = true;
                this.rotateEnabled = true;
                this.selectEnabled = true;
                this.allLayerViews = [];
                this._renderer = null;
                this._camera = null;
                this._scene = null;
                this._group = null;
                this.maxSlope = 48;
                this.domNode = document.createElement("div");
                this.domNode.className = "webgis-root";
                var canvas = document.createElement("canvas");
                canvas.width = nodeWidth;
                canvas.height = nodeHeight;
                this._gl = canvas.getContext("webgl", {antialias: true, alpha: true, preserveDrawingBuffer: true});
                this.domNode.appendChild(canvas);
                this.container.appendChild(this.domNode);
                this._initWebGL(nodeWidth, nodeHeight);
                this._offsetLeft = this.container.getBoundingClientRect().left;
                this._offsetTop = this.container.getBoundingClientRect().top;
                this.allLayerViews = [];
                this.viewpoint = new Viewpoint();
                this.viewpoint.camera = this._camera;
                var pan = new PanHandler(this);
                this._handleAddedLayer();
                this._handleTopic();
                this._handleEvent();
            },

            _initWebGL: function (width, height) {
                height = height % 2 === 0 ? height : height + 1;
                this._renderer = new THREE.WebGLRenderer({
                    precision: "mediump",
                    context: this._gl
                });
                this._renderer.setSize(width, height);
                this._renderer.setClearColor(new THREE.Color(0xeeeeee), 1.0);
                this._renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);

                var fov = 0.6435011087932844;
                var angle = fov * 180 / Math.PI;
                this._angle = angle;
                var distance = 0.5 / Math.tan(fov / 2) * height;
                this._distance = distance;
                this._camera = new THREE.PerspectiveCamera(angle , width / height, 1, 10000);
                this.initZ = distance;
                if (this.is3DVision) {
                    this.slope = this.maxSlope;
                } else {
                    this.slope = 0;
                }
                this._camera.position.set(0, -distance * Math.sin(this.slope/180*Math.PI), distance*Math.cos(this.slope /180*Math.PI));
                this.halfUpHeight = distance * Math.sin(fov/2) / Math.sin((180-angle/2-this.slope - 90)/180*Math.PI);
                this.halfDownHeight = distance * Math.sin(fov/2) / Math.sin((180-angle/2-(90 - this.slope))/180*Math.PI);
                this.halfUpWidth = this.halfUpHeight * width/height;
                this.halfDownWidth = this.halfDownHeight * width/height;

                this.width = this.halfUpWidth + this.halfDownWidth;
                this.height = this.halfUpHeight + this.halfDownHeight;
                this._camera.lookAt(new THREE.Vector3(0, 0, 0));

                this._scene = new THREE.Scene();
                this._scene.background = new THREE.Color(0xEEEEEE);
                this._group = new THREE.Group();
                this._scene.add(this._group);

                // 初始化光照
                var light1 = new THREE.DirectionalLight(0x666666);
                light1.position.set(100000000, 100000000, 100000000);
                this._scene.add(light1);

                var light2 = new THREE.AmbientLight(0xeeeeee);
                this._scene.add(light2);

                this._screenPoint = new THREE.Vector3();
                this._mousePoint = new THREE.Vector2();
                this._raycaster = new THREE.Raycaster();

                /*var axis = new THREE.AxesHelper(10000);
                axis.position.set(0, 1,0);
                this._scene.add(axis);*/

                this.textureloader = new THREE.TextureLoader().setCrossOrigin("*");
                this.threeRender();
            },
            _handleAddedLayer: function () {
                if (this.map.allLayers.length > 0) {
                    this._tileInfo = this.map.allLayers[0].tileInfo;
                    this._load = true;
                    this.map.allLayers.forEach(function (item) {
                        this.allLayerViews.push(item.createLayerView(this));
                    }.bind(this));
                }
            },

            _handleTopic: function () {
                topic.subscribe("addLayer", function (layerArray) {
                    for (var i = 0; i < layerArray.length; i++) {
                        if (!layerArray[i].maxLevel) {
                            layerArray[i].maxLevel = this.maxLevel;
                        }
                        this.allLayerViews.push(layerArray[i].createLayerView(this));
                    }
                }.bind(this));
                topic.subscribe("tileInfoComplete", function () {
                    if (!this._tileInfo) {
                        this._tileInfo = this.map.allLayers[0].tileInfo;
                        var lods = this._tileInfo.lods;
                        this.maxLevel = lods[lods.length - 1].level;
                        for (var i = 0; i < this.map.allLayers.length; i++) {
                            var layer = this.map.allLayers[i];
                            if (!layer.maxLevel) {
                                layer.maxLevel = this.maxLevel;
                            }
                        }
                        this.initResolution = lods[this._initLevel].resolution;
                        this._load = true;
                        this.setExtent(this.extent);
                        topic.publish("mapLoadComplete");
                    }
                }.bind(this));
                topic.subscribe("threeRender", function () {
                    this.threeRender();
                }.bind(this));
            },

            _handleEvent: function () {
                console.log("handle event");
                on(this.domNode, "mousewheel", this._zoomMap.bind(this));
                on(this.container, "click", this._onClick.bind(this));
                on(this.container, "mousemove", this._onMouseMove.bind(this));
            },

            _onClick: function (e) {
                // console.log("click view");
                if (this.selectEnabled) {
                    var x = e.clientX,
                        y = e.clientY,
                        width = this._containerWidth,
                        height = this._containerHeight;
                    this._mousePoint.x = ((x - this._offsetLeft) / width) * 2 - 1;
                    this._mousePoint.y = -((y - this._offsetTop) / height) * 2 + 1;
                    this._raycaster.setFromCamera(this._mousePoint, this._camera);

                    var result = {};
                    var layers = this.allLayerViews;
                    for (var i = 0, ii = layers.length; i < ii; i++) {
                        var intersects = this._raycaster.intersectObject(layers[i]._group, true);
                        if (intersects.length > 0) {
                            result[layers[i].id] = intersects;
                        }
                    }
                    topic.publish("mapOnClick", result, x, y);
                }
            },

            selectObj: function(x, y) {
                var width = this._containerWidth,
                    height = this._containerHeight;
                this._mousePoint.x = ((x - this._offsetLeft) / width) * 2 - 1;
                this._mousePoint.y = -((y - this._offsetTop) / height) * 2 + 1;
                this._raycaster.setFromCamera(this._mousePoint, this._camera);

                var result = {};
                var layers = this.allLayerViews;
                for (var i = 0, ii = layers.length; i < ii; i++) {
                    var intersects = this._raycaster.intersectObject(layers[i]._group, true);
                    if (intersects.length > 0) {
                        result[layers[i].id] = intersects;
                    }
                }
                return result;
            },

            _onMouseMove: function (e) {
                if (this.selectEnabled) {
                    var x = e.clientX,
                        y = e.clientY,
                        width = this._containerWidth,
                        height = this._containerHeight;
                    this._mousePoint.x = ((x - this._offsetLeft) / width) * 2 - 1;
                    this._mousePoint.y = -((y - this._offsetTop) / height) * 2 + 1;
                    this._raycaster.setFromCamera(this._mousePoint, this._camera);

                    var layer = this.findLayerViewById("vector");
                    if (layer) {
                        var intersects = this._raycaster.intersectObject(layer._group, true);
                        for (var i = intersects.length - 1; i > -1; i--) {
                            if (intersects[i].object.isSprite) {
                                topic.publish("mapMovePOI",intersects[i].object.uuid, x, y);
                                return;
                            }
                        }
                    }
                    topic.publish("mapMovePOI",false, x, y);
                }
            },

            _findNestZoom: function (tempResolution) {
                var lods = this._tileInfo.lods,
                    len = lods.length, ratio = 0;
                for (var j = len - 1; j > -1; j--) {
                    ratio = lods[j].resolution / tempResolution;
                    if (ratio < 1.9 && ratio > 0.95) {
                        this.level = j;
                        return lods[j].resolution;
                    }
                }
                this.level = len-1;
                return lods[len-1].resolution;
            },

            refresh: function () {
                // todo
                if (this._load) {
                    this._setScale();
                    switch (this._state) {
                        case "zoomIn":
                            this._handleZoom(true);
                            this._state = "default";
                            break;
                        case "zoomOut":
                            this._handleZoom(false);
                            this._state = "default";
                            break;
                        case "rotate":
                            this._handleRotate();
                            this._state = "default";
                            break;
                        case "switch2D":
                            this._handleSwitch2D();
                            this._state = "default";
                            break;
                        case "switch3D":
                            this._handleSwitch3D();
                            this._state = "default";
                            break;
                        default:
                            var scale = 1/this.viewpoint.scale;
                            this._group.scale.set(scale, scale, scale);
                            this.allLayerViews.forEach(function (item) {
                                item.refresh();
                            });
                    }
                }
            },
            _setScale: function () {
                var scale = Math.pow(2, this._initLevel - this.level);
                this.viewpoint.scale = isNaN(scale) ? 1 : scale;
            },
            _getScale: function () {
                return this.viewpoint.scale;
            },
            /**
             * 根据图层id查找对应的layerView
             * @param id
             */
            findLayerViewById:function(id){
                for (var i = this.allLayerViews.length - 1; i > -1; i--) {
                    if (this.allLayerViews[i].id === id) {
                        return this.allLayerViews[i];
                    }
                }
            },

            setExtent: function (extent, center) {
                if (extent) {
                    if (!this.resolution) {
                        this.center = extent.getCenter();
                        this._calResolution(extent);
                    }
                    if (this.resolution) {
                        this._calResolution(extent);
                        this._calExtent(extent.getCenter());
                        topic.publish("extentChangeEvent", this.extent);
                        this.refresh();
                    } else {
                        this.extent = extent;
                    }
                } else {
                    this._calExtent(center);
                    topic.publish("extentChangeEvent", this.extent);
                    this.refresh();
                }
            },
            /**
             * 指定缩放的地图层级
             * @param level
             */
            setLevel: function (level) {
                this.level = level;
                if (!this._tileInfo) {
                    this._tileInfo = this.map.allLayers[0].tileInfo;
                }
                this.resolution = this._tileInfo.lods[level].resolution;
                var center = this.extent.getCenter(),
                    width = this.width,
                    height = this.height;
                var halfx = this.resolution * width * 0.5;
                var halfy = this.resolution * height * 0.5;
                var newMinx = center.x - halfx;
                var newMaxx = center.x + halfx;
                var newMiny = center.y - halfy;
                var newMaxy = center.y + halfy;
                var newExtent = new Extent(newMinx, newMiny, newMaxx, newMaxy);
                this._calExtent(newExtent.getCenter());
                topic.publish("extentChangeEvent", this.extent);
            },

            _calResolution: function (extent) {
                var xRange = extent.getWidth(),
                    yRange = extent.getHeight(),
                    width = this.halfUpWidth,
                    height = this.halfUpHeight;
                if (this._tileInfo && this._tileInfo.lods.length > 0) {
                    this.resolution = this._findNestZoom(Math.max(xRange / width, yRange / height));
                }
            },

            _calExtent: function (point, x, y) {
                /*var resolution = this.resolution;
                this.extent = new Extent(
                    point.x - resolution * this.halfUpWidth,
                    point.y - resolution * this.halfUpHeight,
                    point.x + resolution * this.halfUpWidth,
                    point.y + resolution * this.halfUpHeight
                );*/


                var rad = -this.viewpoint.rotation / 180 * Math.PI, // 相对于指北针顺时针旋转
                    sina = Math.sin(rad),
                    cosa = Math.cos(rad);
                var upxcosa = this.halfUpWidth * cosa,
                    upxsina = this.halfUpWidth * sina,
                    upycosa = this.halfUpHeight * cosa,
                    upysina = this.halfUpHeight * sina,
                    downxcosa = this.halfDownWidth * cosa,
                    downxsina = this.halfDownWidth * sina,
                    downycosa = this.halfDownHeight * cosa,
                    downysina = this.halfDownHeight * sina;

                // var point1 = [-halfWidth, halfHeight];
                /*var xcosa = halfWidth * cosa,
                    xsina = halfWidth * sina,
                    ycosa = halfHeight * cosa,
                    ysina = halfHeight * sina;*/
                var point1 = {
                        x: -upxcosa + upysina,
                        y: upycosa + upxsina
                    },
                    point2 = {
                        x: upxcosa + upysina,
                        y: upycosa - upxsina
                    },
                    point3 = {
                        x: downxcosa - downysina,
                        y: -downycosa - downxsina
                    },
                    point4 = {
                        x: -downxcosa - downysina,
                        y: -downycosa + downxsina
                    };
                var resolution = this.resolution;
                var geoPoint1 = {
                        x: point.x + point1.x * resolution,
                        y: point.y + point1.y * resolution
                    },
                    geoPoint2 = {
                        x: point.x + point2.x * resolution,
                        y: point.y + point2.y * resolution
                    },
                    geoPoint3 = {
                        x: point.x + point3.x * resolution,
                        y: point.y + point3.y * resolution
                    },
                    geoPoint4 = {
                        x: point.x + point4.x * resolution,
                        y: point.y + point4.y * resolution
                    };
                var xmin = Math.min(geoPoint1.x, geoPoint2.x, geoPoint3.x, geoPoint4.x),
                    xmax = Math.max(geoPoint1.x, geoPoint2.x, geoPoint3.x, geoPoint4.x),
                    ymin = Math.min(geoPoint1.y, geoPoint2.y, geoPoint3.y, geoPoint4.y),
                    ymax = Math.max(geoPoint1.y, geoPoint2.y, geoPoint3.y, geoPoint4.y);

                this.center = point;
                this._bound = [geoPoint1, geoPoint2, geoPoint3, geoPoint4];
                this.extent = new Extent(xmin, ymin, xmax, ymax);
            },

            resetExtent: function () {


            },

            /**
             * 监听缩放事件处理函数
             * @param e 事件
             * @private
             */
            _zoomMap: function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.wheelDelta > 0) {
                    this.zoomIn();
                } else if (e.wheelDelta < 0) {
                    this.zoomOut();
                }
            },
            /**
             * 放大
             */
            zoomIn: function () {
                if (this.zoomEnabled && this.level < this.maxLevel) {
                    this.zoomEnabled = false;
                    setTimeout(function () {
                        this.zoomEnabled = true;
                    }.bind(this), 600);
                    this.level += 1;
                    this.resolution = this._tileInfo.lods[this.level].resolution;
                    this._state = "zoomIn";
                    this.setExtent(null, this.center);
                    topic.publish("changeLevel", {level: this.level});
                }
            },
            /**
             * 缩小
             */
            zoomOut: function () {
                if (this.zoomEnabled && this.level > 1) {
                    this.zoomEnabled = false;
                    setTimeout(function () {
                        this.zoomEnabled = true;
                    }.bind(this), 600);
                    this.level -= 1;
                    this.resolution = this._tileInfo.lods[this.level].resolution;
                    this._state = "zoomOut";
                    this.setExtent(null, this.center);
                    topic.publish("changeLevel", {level: this.level});
                }
            },
            _handleZoom: function (isZoomIn) {
                // 开始动画前准备数据
                this.allLayerViews.forEach(function (item) {
                    item._readyData();
                });
                if (isZoomIn) {
                    this._zoomAnimateIn(null, 1);
                } else {
                    this._zoomAnimateOut(null, 1);
                }
            },
            _zoomAnimateIn: function (start, oldDelta) {
                if (!start) start = performance.now();
                var delta = performance.now() - start;
                if (delta >= 500) {
                    this._group.scale.multiplyScalar(2 / oldDelta);
                    window.cancelAnimationFrame(this._animateRaf);
                    this.allLayerViews.forEach(function (item) {
                        item._render();
                    });
                } else {
                    this._group.scale.multiplyScalar((1 + delta / 500) / oldDelta);
                    this.threeRender();
                    this._animateRaf = window.requestAnimationFrame(this._zoomAnimateIn.bind(this, start, (1 + delta / 500)));
                }
            },
            _zoomAnimateOut: function (start, oldDelta) {
                if (!start) start = performance.now();
                var delta = performance.now() - start;
                if (delta >= 500) {
                    this._group.scale.divideScalar(2 / oldDelta);
                    window.cancelAnimationFrame(this._animateRaf);
                    this.allLayerViews.forEach(function (item) {
                        item._render();
                    });
                } else {
                    this._group.scale.divideScalar((1 + delta / 500) / oldDelta);
                    this.threeRender();
                    this._animateRaf = window.requestAnimationFrame(this._zoomAnimateOut.bind(this, start, (1 + delta / 500)));
                }
            },
            mapMove: function (xmove, ymove) {
                if (this.panEnabled) {
                    var theta = -this.viewpoint.rotation / 180 * Math.PI,
                        sina = Math.sin(theta),
                        cosa = Math.cos(theta);
                    var rxmove = xmove * cosa - ymove * sina,
                        rymove = xmove * sina + ymove * cosa;
                    var ra = this.resolution / this.initResolution,
                        deltax = this.resolution * rxmove,
                        deltay = this.resolution * rymove;
                    this.center.x -= deltax;
                    this.center.y += deltay;
                    this.allLayerViews.forEach(function (layerView) {
                        layerView._group.position.x += rxmove * ra;
                        layerView._group.position.y -= rymove * ra;
                    });
                    this.threeRender();
                }
            },
            stopMove: function () {
                if (this.panEnabled) {
                    this.setExtent(null, this.center);
                }
            },
            _mouseSwitchDip: function (ymove) {
                if (this.rotateEnabled) {
                    var slope = this.slope;
                    var distance = this._distance;
                    var delta = -ymove / 1080 * this.maxSlope;
                    if (slope + delta > this.maxSlope) {
                        this.slope = this.maxSlope;
                    }else if (slope + delta < 0) {
                        this.slope = 0;
                    } else {
                        this.slope += delta;
                    }
                    this._camera.position.set(0, -distance * Math.sin(this.slope/180*Math.PI), distance*Math.cos(this.slope /180*Math.PI));
                    this._camera.lookAt(0,0,0);
                    this.threeRender();
                }
            },
            _stopSwitch: function () {
                var w, h;
                var r = this._scene.rotation.x;
                /*if (r > - 0.001 && this.is3DVision) {
                    w = this.container.clientWidth;
                    h = this.container.clientHeight;
                    this.halfUpWidth = w/2;
                    this.halfDownWidth = w/2;
                    this.halfUpHeight = h/2;
                    this.halfDownHeight = h/2;
                    this.is3DVision = false;
                    this.width = this.halfUpWidth + this.halfDownWidth;
                    this.height = this.halfUpHeight + this.halfDownHeight;
                    this.allLayerViews.forEach(function (item) {
                        item.resize();
                    });
                    // this._scene.rotate
                    this.setExtent(null, this.center);
                    topic.publish("mapSwitchDimension", 2);
                }
                if (r <= - 0.001 && !this.is3DVision) {
                    this.halfUpWidth = 1018*2;
                    this.halfDownWidth = 509*2;
                    this.halfUpHeight = 712*2;
                    this.halfDownHeight = 356*2;
                    this.is3DVision = true;
                    this.width = this.halfUpWidth + this.halfDownWidth;
                    this.height = this.halfUpHeight + this.halfDownHeight;
                    this.allLayerViews.forEach(function (item) {
                        item.resize();
                    });
                    this.setExtent(null, this.center);
                    topic.publish("mapSwitchDimension", 3);
                }*/
                var width = this.container.clientWidth,
                    height = this.container.clientHeight;
                var distance = this._distance;
                var angle = this._angle;
                var fov = angle/180*Math.PI;
                var slope = this.slope;
                this.halfUpHeight = distance * Math.sin(fov/2) / Math.sin((180-angle/2- slope - 90)/180*Math.PI);
                this.halfDownHeight = distance * Math.sin(fov/2) / Math.sin((180-angle/2-(90 - slope))/180*Math.PI);
                this.halfUpWidth = this.halfUpHeight * width/height;
                this.halfDownWidth = this.halfDownHeight * width/height;
                this.allLayerViews.forEach(function (item) {
                    item.resize();
                });
                if (this.slope < 0.05) {
                    this.is3DVision = false;
                    topic.publish("mapSwitchDimension", 2);
                }else {
                    this.is3DVision = true;
                    topic.publish("mapSwitchDimension", 3);
                }
                this.setExtent(null, this.center);

            },
            setDimensions:function(d) {
                var width = this.container.clientWidth,
                    height = this.container.clientHeight;
                var distance = this._distance;
                var angle = this._angle;
                var fov = angle/180*Math.PI;
                var slope = 0;
                if (d === 2 && this.is3DVision) {
                    slope = 0;
                    this.halfUpHeight = distance * Math.sin(fov/2) / Math.sin((180-angle/2- slope - 90)/180*Math.PI);
                    this.halfDownHeight = distance * Math.sin(fov/2) / Math.sin((180-angle/2-(90 - slope))/180*Math.PI);
                    this.halfUpWidth = this.halfUpHeight * width/height;
                    this.halfDownWidth = this.halfDownHeight * width/height;
                    this.is3DVision = false;
                    this._state = "switch2D";
                    this.allLayerViews.forEach(function (item) {
                        item.resize();
                    });
                    this.setExtent(null, this.center);
                    topic.publish("mapSwitchDimension", 2);
                } else if (d === 3 && !this.is3DVision) {
                    slope = this.maxSlope;
                    this.halfUpHeight = distance * Math.sin(fov/2) / Math.sin((180-angle/2- slope - 90)/180*Math.PI);
                    this.halfDownHeight = distance * Math.sin(fov/2) / Math.sin((180-angle/2-(90 - slope))/180*Math.PI);
                    this.halfUpWidth = this.halfUpHeight * width/height;
                    this.halfDownWidth = this.halfDownHeight * width/height;
                    this.is3DVision = true;
                    this._state = "switch3D";
                    this.allLayerViews.forEach(function (item) {
                        item.resize();
                    });
                    this.setExtent(null, this.center);
                    topic.publish("mapSwitchDimension", 3);
                }
            },
            _handleSwitch2D: function() {
                var slope = this.slope;
                var d = this._distance;
                this.allLayerViews.forEach(function (item) {
                    item._readyData();
                });
                this._switchAnimation(null, 0, -slope / 500, d);
            },
            _handleSwitch3D: function() {
                var slope = this.slope;
                var d = this._distance;
                this.allLayerViews.forEach(function (item) {
                    item._readyData();
                });
                this._switchAnimation(null, 0, (this.maxSlope - slope)/500, d);
            },
            _switchAnimation: function(start, oldNow, ratio, distance) {
                if (!start) start = performance.now();
                var delta = performance.now() - start;
                if (delta >= 500) {
                    this.slope += (500 - oldNow)*ratio;
                    this._camera.position.set(0, -distance * Math.sin(this.slope/180*Math.PI), distance*Math.cos(this.slope /180*Math.PI));
                    this._camera.lookAt(0,0,0);
                    window.cancelAnimationFrame(this._animateRaf);
                    this.allLayerViews.forEach(function (item) {
                        item._render();
                    });
                } else {
                    this.slope += ratio*(delta - oldNow);
                    this._camera.position.set(0, -distance * Math.sin(this.slope/180*Math.PI), distance*Math.cos(this.slope /180*Math.PI));
                    this._camera.lookAt(0,0,0);
                    this.threeRender();
                    this._animateRaf = window.requestAnimationFrame(this._switchAnimation.bind(this, start, delta, ratio, distance));
                }
            },
            _mouseRotate: function (move) {
                if (this.rotateEnabled) {
                    var angle = move / 1080 * 180;
                    this.viewpoint.rotation = (this.viewpoint.rotation - angle) % 360;
                    this._group.rotateZ(angle / 180 * Math.PI);
                    topic.publish("mapRotateAngle", this.viewpoint.rotation);
                    this.threeRender();
                }
            },
            _stopMouseRotate: function () {
                if (this.rotateEnabled) {
                    this.setExtent(null, this.center);
                }
            },
            rotateMap: function (angle) {
                if (this.rotateEnabled) {
                    this.viewpoint.rotation = (this.viewpoint.rotation + angle) % 360;
                    this.viewpoint.rotateAngle = angle;
                    this._state = "rotate";
                    this.setExtent(null, this.center);
                    topic.publish("mapRotateAngle", this.viewpoint.rotation);
                }
            },
            _handleRotate: function() {
                this.allLayerViews.forEach(function (item) {
                    item._readyData();
                });
                this._rotateAnimation(null, this.viewpoint.rotateAngle / 180 * Math.PI, 0);
            },
            _rotateAnimation: function(start, rad, d) {
                if (!start) start = performance.now();
                var delta = performance.now() - start;
                if (delta >= 500) {
                    this._group.rotateZ(-rad * (500 - d) / 500);
                    window.cancelAnimationFrame(this._animateRaf);
                    this.allLayerViews.forEach(function (item) {
                        item._render();
                    });
                } else {
                    this._group.rotateZ(-rad * (delta - d) / 500);
                    this.threeRender();
                    this._animateRaf = window.requestAnimationFrame(this._rotateAnimation.bind(this, start, rad, delta));
                }
            },
            _screenToScene: function (x, y) {/*屏幕转3Dpoint*/
                var width = this._containerWidth,
                    height = this._containerHeight;
                x = ((x - this._offsetLeft) / width) * 2 - 1;
                y = -((y - this._offsetTop) / height) * 2 + 1;
                this._screenPoint.set(x, y, 0.5);
                var pos = new THREE.Vector3();
                var camera = this._camera;
                this._screenPoint.unproject(camera);
                this._screenPoint.sub(camera.position).normalize();
                var dis = -camera.position.z / this._screenPoint.z;
                pos.copy(camera.position).add(this._screenPoint.multiplyScalar(dis));
                pos.z = 0;
                pos.multiplyScalar(this.viewpoint.scale);
                return pos;
            },
            _sceneToScreen: function (x, y, z) {
                var vector = new THREE.Vector3(x, y, z);
                vector.project(this._camera);
                vector.x = (vector.x + 1) * this.width / 2;
                vector.y = -(vector.y - 1) * this.height / 2;
                vector.z = 0;
                return vector;
            },
            _sceneToGeometry: function (x, y, z) {
                var center = this.center;
                return new Point(
                    x * this.initResolution + center.x,
                    y * this.initResolution + center.y,
                    0
                )
            },
            _geometryToScene: function (x, y, z) {
                var center = this.center;
                return new Point(
                    (x - center.x) / this.initResolution,
                    (y - center.y) / this.initResolution,
                    0
                );
            },
            screenToGeometry: function (x, y) {/*3D转地理*/
                /*var pos = this._screenToScene(x, y);
                return this._sceneToGeometry(pos.x, pos.y, 0);*/

            },
            geometryToScreen: function (x, y) {/*地理转3D*/
                var pos = this._geometryToScene(x, y, 0);
                return this._sceneToScreen(pos.x, pos.y, pos.z);
            },
            centerAt: function (x, y) {/*x,y 为number类型*/
                var point = new Point(x, y);
                this.center = point;
                this.setExtent(null, point);
            },
            threeRender: function () {
                this._renderer.render(this._scene, this._camera);
            }
        });
    }
);
