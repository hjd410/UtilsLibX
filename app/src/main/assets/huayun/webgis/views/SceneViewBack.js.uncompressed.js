/**
 * 场景View, 负责与用户交互和渲染
 * @author 吴胜飞
 * @module com/huayun/webgis/views
 * @see com.huayun.webgis.views.SceneView
 */
define("com/huayun/webgis/views/SceneViewBack", [
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/on",
    "../Viewpoint",
    "../geometry/Extent",
    "../geometry/Point",
    "../geometry/MapPoint",
    "../views/View",
    "../handler/PanHandler",
    "com/huayun/webgis/gl/Context",
    "com/huayun/webgis/layers/support/ZoomHistory",
    "com/huayun/webgis/gl/VertexFragShader",
    "com/huayun/webgis/gl/programConfig",
    "com/huayun/webgis/gl/Program",
    "../utils/utils",
    "../utils/Color",
    "../utils/TaskQueue",
    "com/huayun/webgis/gl/LineAtlas"
], function (declare, topic, on, Viewpoint, Extent, Point, MapPoint, View, PanHandler, Context, ZoomHistory, VertexFragShader, programConfig, Program, utils, Color, TaskQueue, LineAtlas) {
    /**
     * 场景View
     * @class com.huayun.webgis.views.SceneView
     * @extends {View}
     * @property {number} width - 地图容器的宽度, 单位px
     * @property {number} height - 地图容器的高度, 单位px
     * @property {number} resolution - 地图分辨率
     * @property {number} level - 地图的层级
     * @property {number} maxLevel - 地图的最大层级 以上属性考虑移到Viewpoint上
     * @property {Viewpoint} viewpoint - 地图视图
     * @property {Array} allLayerViews - 地图所有图层对应的LayerView
     * @property {Extent} extent - 地图的当前范围
     * @property {HTMLDivElement} container - 地图容器
     * @property {Map} map - View关联的地图
     * @property {boolean} _load - 地图坐标系的元数据是否加载
     * @property {number} _offsetLeft - 地图容器相对于屏幕左侧的距离, 屏幕坐标的修正
     * @property {number} _offsetTop - 地图容器相对于屏幕顶侧的距离, 屏幕坐标的修正
     */
    return declare("com.huayun.webgis.views.SceneView", [View], {
        // todo
        width: 0,
        height: 0,
        resolution: 0,
        level: 0,
        maxLevel: 0,

        viewpoint: null,
        allLayerViews: [],
        extent: null,
        container: null,
        map: null,

        panEnabled: true,
        zoomEnabled: true,
        rotateEnabled: true,
        resizeEnabled: true,

        _load: false,
        _offsetLeft: 0,
        _offsetTop: 0,

        /**
         *
         * @param {Object} params
         */
        constructor: function (params) {
            this.container = params.container;
            this.map = params.map;
            this.allLayerViews = [];
            this._offsetLeft = this.container.getBoundingClientRect().left;
            this._offsetTop = this.container.getBoundingClientRect().top;
            this._extentDirty = true;
            this._clearBit = 0 | 16384 | 256 | 1024; // WebGL清除标志位

            var pitch = params.pitch ? params.pitch : params.is3DVision ? 50 : 0,
                angle = params.angle ? params.angle : 0;

            // todo
            this.width = this.container.clientWidth;
            this.height = this.container.clientHeight;
            this.viewpoint = new Viewpoint(this.width, this.height, pitch, angle, this);

            this._setupContainer(this.width, this.height);
            this._setupContext();

            // todo
            this.zoomHistory = new ZoomHistory();
            this.panEnabled = true;
            this.zoomEnabled = true;
            this.rotateEnabled = true;
            this.selectEnabled = true;
            this.resizeEnabled = true;
            this.emptyProgramConfiguration = new programConfig.ProgramConfiguration();
            this.lineAtlas = new LineAtlas(256, 512);
            this.nochanging = true;
            var pan = new PanHandler(this); // 绑定拖动事件


            this._handleAddedLayer();
            this._handleTopic();
            this._handleEvent();

            // 处理初始化中心点和层级设置
        },

        /**
         * 设置地图容器, 创建WebGL的绘图容器Canvas
         * @param {number} width - 地图容器的宽度
         * @param {number} height - 地图容器的高度
         * @private
         */
        _setupContainer: function(width, height) {
            this.domNode = document.createElement("div");
            this.domNode.classList.add('webgis-root');
            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            this._canvas = canvas;
            this._canvas.setAttribute('tabindex', '0');
            this._canvas.setAttribute('aria-label', 'Map');
            this.domNode.appendChild(canvas);
            this.container.appendChild(this.domNode);
            // this._canvas.addEventListener('webglcontextlost', this._contextLost, false);
            // this._canvas.addEventListener('webglcontextrestored', this._contextRestored, false);

        },

        /**
         * 创建WebGL的Context, 进行基础设置
         * @private
         */
        _setupContext: function () {
            var attr = {
                alpha: true,
                antialias: false,
                depth: true,
                failIfMajorPerformanceCaveat: false,
                preserveDrawingBuffer: false,
                stencil: true
            };
            this._gl = this._canvas.getContext('webgl', attr) || this._canvas.getContext('experimental-webgl', attr);
            this.context = new Context(this._gl);
        },

        /**
         * 为已加入地图中的图层创建LayerView
         * @private
         */
        _handleAddedLayer: function () {
            if (this.map.allLayers.length > 0) {
                var tileInfo = this.map.allLayers[0].tileInfo;
                if (tileInfo) { // 若第一个图层已加载元数据, 其作为地图的元数据
                    this.viewpoint.setTileInfo(tileInfo);
                    this._load = true;
                }
                this.map.allLayers.forEach(function (item) {
                    this.allLayerViews.push(item.createLayerView(this));
                }.bind(this));
            }
        },

        /**
         * 处理View监听的事件
         * @private
         */
        _handleTopic: function () {
            // 监听地图添加事件
            topic.subscribe("addLayer", function (layerArray) {
                if (this.allLayerViews.length === 0 && layerArray[0].tileInfo) { // 之前没有图层
                    this.viewpoint.setTileInfo(layerArray[0].tileInfo);
                    this._load = true;
                }
                for (var i = 0; i < layerArray.length; i++) {
                    if (!layerArray[i].maxLevel) {
                        layerArray[i].maxLevel = this.maxLevel;
                    }
                    this.allLayerViews.push(layerArray[i].createLayerView(this));
                }
            }.bind(this));
            // 监听地图元数据加载事件
            topic.subscribe("tileInfoComplete", function () {
                var tileInfo = this.map.allLayers[0].tileInfo;
                if (!this.viewpoint.tileInfo && tileInfo) { // 只取第一个图层的元数据
                    this.viewpoint.setTileInfo(tileInfo);
                    this._load = true;
                    var lods = tileInfo.lods;
                    if (!this.maxLevel) { // 未设置最大层级, 以元数据的最大层级为准
                        this.maxLevel = lods[lods.length - 1].level;
                    }
                     // todo
                    /*for (var i = 0; i < this.map.allLayers.length; i++) {
                        var layer = this.map.allLayers[i];
                        if (!layer.maxLevel) {
                            layer.maxLevel = this.maxLevel;
                        }
                    }*/
                    if (this.center) {
                        this.setCenter(this.center);
                    }
                    topic.publish("mapLoadComplete");
                } else if (this._load && this.center) { // 其他情况正常渲染
                    this.setCenter(this.center);
                }
            }.bind(this));
            // 渲染事件
            topic.subscribe("threeRender", function () {
                this.threeRender();
            }.bind(this));
        },

        /**
         * 处理DOM事件
         * @private
         */
        _handleEvent: function () {
            // todo
            /*on(this.domNode, "mousewheel", this._zoomMap.bind(this));
            on(this.container, "click", this._onClick.bind(this));
            // on(this.container, "mousemove", this._onMouseMove.bind(this));
            on(window, "resize", this._onResize.bind(this));*/
        },
        
        setExtent: function (extent) {
            var center = extent.getCenter();
            this.extent = extent;
            if (!this.initCenter) {
                this.initCenter = center;
                this.center = center;
            }
            if (!this._calResolution(extent) && !this.resolution) {
                return;
            }
            this.setCenter(center);
        },

        getExtent: function () {
            if (this._extentDirty) {
                var bound = this._bound;
                // var r = this.targetResolution || this.resolution;
                var xmin = Math.min(bound[0].x, bound[1].x, bound[2].x, bound[3].x),
                    xmax = Math.max(bound[0].x, bound[1].x, bound[2].x, bound[3].x),
                    ymin = Math.min(bound[0].y, bound[1].y, bound[2].y, bound[3].y),
                    ymax = Math.max(bound[0].y, bound[1].y, bound[2].y, bound[3].y);
                this.extent = new Extent(xmin, ymin, xmax, ymax);
                this._extentDirty = false;
                return this.extent;
            } else {
                return this.extent;
            }

        },

        setCenter: function (center) {
            if (!this.level && !this._calLevel()) {
                this.center = center;
                return
            }
            this.center = center;
            this.refresh();
        },

        mapMove: function (xmove, ymove) {
            if (this.panEnabled) {
                // todo 使用矩阵运算代替
                var theta = -this.viewpoint.angle / 180 * Math.PI,
                    sina = Math.sin(theta),
                    cosa = Math.cos(theta);
                var rxmove = xmove * cosa - ymove * sina,
                    rymove = xmove * sina + ymove * cosa;
                var deltax = this.resolution * rxmove,
                    deltay = this.resolution * rymove;

                this.center.x -= deltax;
                this.center.y += deltay;
                // this.viewpoint.calcMatrix(this.center.x / this.resolution, this.center.y / this.resolution);
                this.viewpoint.calcMatrix(this.center.x, this.center.y, this.resolution);
                this.threeRender();
            }
        },
        stopMove: function () {
            if (this.panEnabled) {
                this.setCenter(this.center);
            }
        },

        _mouseRotate: function (move) {
            if (this.rotateEnabled) {
                var angle = move / 1080 * 180;
                this.viewpoint.angle = (this.viewpoint.angle - angle) % 360;
                this.viewpoint.updateBaseMatrix(this.center.x, this.center.y, this.resolution);
                this.threeRender();
                topic.publish("mapRotateAngle", this.viewpoint.angle);
            }
        },
        _stopMouseRotate: function () {
            if (this.rotateEnabled) {
                this.setCenter(this.center);
            }
        },

        _mouseSwitchDip: function (ymove) {
            if (this.rotateEnabled) {
                this.viewpoint.updatePitch(-ymove / 20, this.center.x, this.center.y, this.resolution);
                this.threeRender();
            }
        },
        _stopSwitch: function () {
            this.setCenter(this.center);
        },

        _calResolution: function (extent) {
            var xRange = extent.getWidth(),
                yRange = extent.getHeight(),
                width = this.viewpoint.width,
                height = this.viewpoint.height;
            if (this._tileInfo && this._tileInfo.lods.length > 0) {
                this.resolution = this._findNestZoom(Math.max(xRange / width, yRange / height));
                return true;
            } else {
                this.resolution = Math.max(xRange / width, yRange / height);
                return false;
            }
        },
        _calLevel: function () {
            if (this._tileInfo && this._tileInfo.lods.length > 0) {
                this.resolution = this._findNestZoom(this.resolution);
                return true;
            } else {
                return false;
            }
        },

        _onClick: function (e) {
            if (this.selectEnabled) {
                /*debugger;
                var x = e.clientX,
                    y = e.clientY,
                    width = this.viewpoint.width,
                    height = this.viewpoint.height;
                x = ((x - this._offsetLeft) / width) * 2 - 1;
                y = -((y - this._offsetTop) / height) * 2 + 1;
                var m = this.viewpoint.matrixWorld;
                var origin = new THREE.Vector3(m[12], m[13], m[14]);
                var direction = new THREE.Vector3(x, y, 0.5);
                direction.unproject(this._camera).sub(origin).normalize();
                this._raycaster.set(origin, direction);
                var result = {};
                var layers = this.allLayerViews;
                for (var i = 0, ii = layers.length; i < ii; i++) {
                    if (layers[i]._group) {
                        var intersects = this._raycaster.intersectObject(layers[i]._group, true);
                        if (intersects.length > 0) {
                            result[layers[i].id] = intersects;
                        }
                    }

                }
                console.log(result);*/
                // topic.publish("mapOnClick", result, x, y);
            }
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
                // this.zoomIn();
                this.zoomInWheel(e.clientX - this._offsetLeft, e.clientY - this._offsetTop);
            } else if (e.wheelDelta < 0) {
                // this.zoomOut();
                this.zoomOutWheel(e.clientX  - this._offsetLeft, e.clientY - this._offsetTop);
            }
        },
        zoomInWheel: function (x, y) {
            if (this.zoomEnabled && this.viewpoint.zoom < this.maxLevel) {
                this.zoomEnabled = false;
                setTimeout(function () {
                    this.viewpoint.zoom = this.viewpoint.targetZoom;
                    this.resolution = this.targetResolution;
                    this.zoomEnabled = true;
                }.bind(this), 400);
                this.viewpoint.startZoom = this.viewpoint.zoom;
                this.viewpoint.targetZoom = this.viewpoint.zoom + 1;
                this.targetResolution = this._tileInfo.lods[this.viewpoint.targetZoom].resolution;
                /*this.level -= 1;
                this.resolution = this._tileInfo.lods[this.level].resolution;*/
                // this._state = "zoomIn";

                /*this.viewpoint.zoom = this.viewpoint.targetZoom;
                this.resolution = this.targetResolution;*/
                var aroundPoint = this.screenToGeometry(x, y);
                /*var deltaX = (aroundPoint.x - this.center.x) / 2,
                    deltaY = (aroundPoint.y - this.center.y) / 2;
                this.setCenter({
                    x: this.center.x + deltaX,
                    y: this.center.y + deltaY
                });*/
                this.deltaX = 0;//aroundPoint.x - this.center.x;
                this.deltaY = 0; //aroundPoint.y - this.center.y;

                this.viewpoint.readyMatrix(this.center.x + this.deltaX / 2, this.center.y + this.deltaY / 2, this.targetResolution);
                this._bound = this.viewpoint.calcBounds(this.targetResolution);
                this._extentDirty = true;
                this._handleZoomWheel(true);
                // this.viewpoint.readyMatrix(this.center.x, this.center.y, this.targetResolution);
                /*this._bound = this.viewpoint.calcBounds(this.targetResolution);
                this._extentDirty = true;
                this._handleZoom(true);*/
                /*this.setCenter(this.center);
                topic.publish("changeLevel", {level: this.viewpoint.targetZoom});*/
            }
        },

        zoomOutWheel: function(x, y) {
            if (this.zoomEnabled && this.viewpoint.zoom > 1) {
                this.zoomEnabled = false;
                setTimeout(function () {
                    this.viewpoint.zoom = this.viewpoint.targetZoom;
                    this.resolution = this.targetResolution;
                    this.zoomEnabled = true;
                }.bind(this), 400);
                this.viewpoint.startZoom = this.viewpoint.zoom;
                this.viewpoint.targetZoom = this.viewpoint.zoom - 1;
                this.targetResolution = this._tileInfo.lods[this.viewpoint.targetZoom].resolution;
                var aroundPoint = this.screenToGeometry(x, y);
                this.deltaX = 0; //aroundPoint.x - this.center.x;
                this.deltaY = 0; //aroundPoint.y - this.center.y;

                this.viewpoint.readyMatrix(this.center.x - this.deltaX, this.center.y - this.deltaY, this.targetResolution);
                this._bound = this.viewpoint.calcBounds(this.targetResolution);
                this._extentDirty = true;
                this._handleZoomWheel(false);
            }
        },

        _handleZoomWheel: function (isZoomIn) {
            this.allLayerViews.forEach(function (item) {
                item._readyData();
            });
            this.nochanging = false;
            if (isZoomIn) {
                this._zoomWheelAnimateIn(null);
            } else {
                this._zoomWheelAnimateOut(null);
            }
        },

        _zoomWheelAnimateOut: function (start) {
            if (!start) start = performance.now();
            var delta = performance.now() - start;
            if (delta >= 300) {
                this.viewpoint.zoom = this.viewpoint.targetZoom;
                this.resolution = this.targetResolution;
                window.cancelAnimationFrame(this._animateRaf);
                this.nochanging = true;
                topic.publish("zoomEnd", this.resolution);
                // this.viewpoint.updateCamera(this.center.x / this.resolution, this.center.y / this.resolution);
                this.center.x = this.center.x - this.deltaX;
                this.center.y = this.center.y - this.deltaY;
                this.viewpoint.updateCamera(this.center.x, this.center.y, this.resolution);
                this.threeRender();
            } else {
                var scale = delta / 300;
                // var scale = 1;
                var powScale = Math.pow(2, -scale);
                this.viewpoint.zoom = this.viewpoint.startZoom - scale;
                var resolution = this._tileInfo.getResolution(this.viewpoint.zoom);
                this.resolution = resolution;
                // this.viewpoint.updateCamera(this.center.x / resolution, this.center.y / resolution);
                // console.log(powScale);
                powScale = 1 / powScale - 1;
                this.viewpoint.updateCamera(this.center.x - this.deltaX * powScale, this.center.y - this.deltaY * powScale, resolution);
                this.animate(Math.pow(2, -scale));
                this._animateRaf = window.requestAnimationFrame(this._zoomWheelAnimateOut.bind(this, start));
            }
        },


        _zoomWheelAnimateIn: function (start) {
            if (!start) start = performance.now();
            var delta = performance.now() - start;
            if (delta >= 300) {
                this.viewpoint.zoom = this.viewpoint.targetZoom;
                this.resolution = this.targetResolution;
                window.cancelAnimationFrame(this._animateRaf);
                this.nochanging = true;
                topic.publish("zoomEnd", this.resolution);
                // this.viewpoint.updateCamera(this.center.x / this.resolution, this.center.y / this.resolution);
                this.center.x = this.center.x + this.deltaX / 2;
                this.center.y = this.center.y + this.deltaY / 2;
                this.viewpoint.updateCamera(this.center.x, this.center.y, this.resolution);
                this.threeRender();
            } else {
                var scale = delta / 300;
                // var scale = 0.5;
                var powScale = Math.pow(2, scale);
                this.viewpoint.zoom = this.viewpoint.startZoom + scale;
                var resolution = this._tileInfo.getResolution(this.viewpoint.zoom);
                this.resolution = resolution;
                // this.viewpoint.updateCamera(this.center.x / resolution, this.center.y / resolution);
                // console.log(powScale);
                powScale = 1 - 1 / powScale;
                this.viewpoint.updateCamera(this.center.x + this.deltaX * powScale, this.center.y + this.deltaY * powScale, resolution);
                this.animate(Math.pow(2, scale));
                this._animateRaf = window.requestAnimationFrame(this._zoomWheelAnimateIn.bind(this, start));
            }
        },
        /**
         * 放大
         */
        zoomIn: function () {
            if (this.zoomEnabled && this.viewpoint.zoom < this.maxLevel) {
                this.zoomEnabled = false;
                setTimeout(function () {
                    this.viewpoint.zoom = this.viewpoint.targetZoom;
                    this.resolution = this.targetResolution;
                    this.zoomEnabled = true;
                }.bind(this), 400);
                this.viewpoint.startZoom = this.viewpoint.zoom;
                this.viewpoint.targetZoom = this.viewpoint.zoom + 1;
                this.targetResolution = this._tileInfo.lods[this.viewpoint.targetZoom].resolution;
                /*this.level -= 1;
                this.resolution = this._tileInfo.lods[this.level].resolution;*/
                this._state = "zoomIn";
                this.setCenter(this.center);
                topic.publish("changeLevel", {level: this.viewpoint.targetZoom});
            }
        },

        /**
         * 缩小
         */
        getZoom: function () {
            return this.viewpoint.zoom;
        },
        getBearing: function () {
            return this.viewpoint.angle;
        },
        getPitch: function () {
            return this.viewpoint._pitch;
        },

        zoomOut: function (options, eventData) {
            if (this.zoomEnabled && this.viewpoint.zoom > 1) {
                this.zoomEnabled = false;
                setTimeout(function () {
                    this.viewpoint.zoom = this.viewpoint.targetZoom;
                    this.resolution = this.targetResolution;
                    this.zoomEnabled = true;
                }.bind(this), 400);
                this.viewpoint.startZoom = this.viewpoint.zoom;
                this.viewpoint.targetZoom = this.viewpoint.zoom - 1;
                this.targetResolution = this._tileInfo.lods[this.viewpoint.targetZoom].resolution;
                /*this.level -= 1;
                this.resolution = this._tileInfo.lods[this.level].resolution;*/
                this._state = "zoomOut";
                this.setCenter(this.center);
                topic.publish("changeLevel", {level: this.viewpoint.targetZoom});
                // this.zoomTo(this.getZoom() - 1, options, eventData);
            }
        },
        _handleZoom: function (isZoomIn) {
            // 开始动画前准备数据
            this.allLayerViews.forEach(function (item) {
                item._readyData();
            });
            this.nochanging = false;
            if (isZoomIn) {
                this._zoomAnimateIn(null, 1);
            } else {
                this._zoomAnimateOut(null, 1);
            }
        },
        _zoomAnimateIn: function (start) {
            if (!start) start = performance.now();
            var delta = performance.now() - start;
            if (delta >= 300) {
                this.viewpoint.zoom = this.viewpoint.targetZoom;
                this.resolution = this.targetResolution;
                window.cancelAnimationFrame(this._animateRaf);
                this.nochanging = true;
                topic.publish("zoomEnd", this.resolution);
                // this.viewpoint.updateCamera(this.center.x / this.resolution, this.center.y / this.resolution);
                this.viewpoint.updateCamera(this.center.x, this.center.y, this.resolution);
                this.threeRender();
            } else {
                var scale = delta / 300;
                this.viewpoint.zoom = this.viewpoint.startZoom + scale;
                var resolution = this._tileInfo.getResolution(this.viewpoint.zoom);
                this.resolution = resolution;
                // this.viewpoint.updateCamera(this.center.x / resolution, this.center.y / resolution);
                this.viewpoint.updateCamera(this.center.x, this.center.y, resolution);
                this.animate(Math.pow(2, scale));
                this._animateRaf = window.requestAnimationFrame(this._zoomAnimateIn.bind(this, start));
            }
        },
        _zoomAnimateOut: function (start, oldDelta) {
            if (!start) start = performance.now();
            var delta = performance.now() - start;
            if (delta >= 300) {
                this.viewpoint.zoom = this.viewpoint.targetZoom;
                this.resolution = this.targetResolution;
                window.cancelAnimationFrame(this._animateRaf);
                this.nochanging = true;
                topic.publish("zoomEnd", this.resolution);
                // this.viewpoint.updateCamera(this.center.x / this.resolution, this.center.y / this.resolution);
                this.viewpoint.updateCamera(this.center.x, this.center.y, this.resolution);
                this.threeRender();
            } else {
                var scale = delta / 300;
                this.viewpoint.zoom = this.viewpoint.startZoom - scale;
                var resolution = this._tileInfo.getResolution(this.viewpoint.zoom);
                this.resolution = resolution;
                // this.viewpoint.updateCamera(this.center.x / resolution, this.center.y / resolution);
                this.viewpoint.updateCamera(this.center.x, this.center.y, resolution);
                this.animate(Math.pow(2, -scale));
                this._animateRaf = window.requestAnimationFrame(this._zoomAnimateOut.bind(this, start, (1 + delta / 300)));
            }
        },


        zoomTo: function (zoom, options, eventData) {
            return this.easeTo(utils.extend({
                zoom: zoom
            }, options), eventData);
        },

        _renderFrameCallback: function (view) {
            var t = Math.min((utils.now() - view._easeStart) / view._easeOptions.duration, 1);
            view._onEaseFrame(view._easeOptions.easing(t));
            if (t < 1) {
                view._easeFrameId = view._requestRenderFrame(view._renderFrameCallback);
            } else {
                view.stop();
            }
        },

        _ease: function (frame, finish, options) {
            if (options.animate === false || options.duration === 0) {
                frame(1);
                finish();
            } else {
                this._easeStart = utils.now();
                this._easeOptions = options;
                this._onEaseFrame = frame;
                this._onEaseEnd = finish;
                this._easeFrameId = this._requestRenderFrame(this._renderFrameCallback);
            }
        },

        _requestRenderFrame: function (callback) {
            // this._update();
            this.threeRender();
            return this._renderTaskQueue.add(callback);
        },

        /*_update: function() {
            this._styleDirty = undefined;
            this._sourcesDirty = true;
            this.triggerRepaint();

            return this;
        },

        triggerRepaint: function() {
            var this$1 = this;
            if (!this._frame) {
                this._frame = requestAnimationFrame(function () {
                    this$1._frame = null;
                    this$1._render();
                });
            }
        },*/

        easeTo: function (options, eventData) {
            var this$1 = this;
            this.stop();
            options = utils.extend({
                offset: [0, 0],
                duration: 500,
                easing: utils.ease
            }, options);

            if (options.animate === false) {
                options.duration = 0;
            }

            var tr = this.viewpoint,
                startZoom = this.getZoom(),
                startBearing = this.getBearing(),
                startPitch = this.getPitch(),
                zoom = 'zoom' in options ? +options.zoom : startZoom,
                bearing = 'bearing' in options ? this._normalizeBearing(options.bearing, startBearing) : startBearing,
                pitch = 'pitch' in options ? +options.pitch : startPitch;

            /*var pointAtOffset = tr.centerPoint.add(__chunk_1.Point.convert(options.offset));
            var locationAtOffset = tr.pointLocation(pointAtOffset);
            var center = __chunk_1.LngLat.convert(options.center || locationAtOffset);
            this._normalizeCenter(center);

            var from = tr.project(locationAtOffset);
            var delta = tr.project(center).sub(from);*/
            var finalScale = tr.zoomScale(zoom - startZoom);
            var around, aroundPoint;

            if (options.around) {
                around = __chunk_1.LngLat.convert(options.around);
                aroundPoint = tr.locationPoint(around);
            }

            this._zooming = (zoom !== startZoom);
            this._rotating = (startBearing !== bearing);
            this._pitching = (pitch !== startPitch);

            // this._prepareEase(eventData, options.noMoveStart);
            clearTimeout(this._easeEndTimeoutID);
            this._ease(function (k) {
                if (this$1._zooming) {
                    tr.zoom = utils.number(startZoom, zoom, k);
                }
                if (this$1._rotating) {
                    tr.bearing = utils.number(startBearing, bearing, k);
                }
                if (this$1._pitching) {
                    tr.pitch = utils.number(startPitch, pitch, k);
                }

                if (around) {
                    tr.setLocationAtPoint(around, aroundPoint);
                } else {
                    var scale = tr.zoomScale(tr.zoom - startZoom);
                    var base = zoom > startZoom ?
                        Math.min(2, finalScale) :
                        Math.max(0.5, finalScale);
                    var speedup = Math.pow(base, 1 - k);
                    /*var newCenter = tr.unproject(from.add(delta.mult(k * speedup)).mult(scale));
                    tr.setLocationAtPoint(tr.renderWorldCopies ? newCenter.wrap() : newCenter, pointAtOffset);*/
                    tr.setLocationAtPoint(this.center, this._tileInfo.getResolution(tr.zoom));

                }
                // this$1._fireMoveEvents(eventData);
                this.threeRender();
            }, function () {
                if (options.delayEndEvents) {
                    this$1._easeEndTimeoutID = setTimeout(function () {
                        return this$1._afterEase(eventData);
                    }, options.delayEndEvents);
                } else {
                    this$1._afterEase(eventData);
                }
            }, options);

            return this;
        },
        stop: function () {
            if (this._easeFrameId) {
                this._cancelRenderFrame(this._easeFrameId);
                delete this._easeFrameId;
                delete this._onEaseFrame;
            }
            if (this._onEaseEnd) {
                var onEaseEnd = this._onEaseEnd;
                delete this._onEaseEnd;
                onEaseEnd.call(this);
            }
            return this;
        },
        _cancelRenderFrame: function (id) {
            this._renderTaskQueue.remove(id);
        },

        _afterEase: function (eventData) {
            var wasZooming = this._zooming;
            var wasRotating = this._rotating;
            var wasPitching = this._pitching;
            this._moving = false;
            this._zooming = false;
            this._rotating = false;
            this._pitching = false;

            /*if (wasZooming) {
                this.fire(new __chunk_1.Event('zoomend', eventData));
            }
            if (wasRotating) {
                this.fire(new __chunk_1.Event('rotateend', eventData));
            }
            if (wasPitching) {
                this.fire(new __chunk_1.Event('pitchend', eventData));
            }*/
            // this.fire(new __chunk_1.Event('moveend', eventData));
        },

        threeRender: function () {
            if (!this._renderRaf && this.nochanging) {
                this._renderRaf = requestAnimationFrame(function () {
                    this._renderRaf = null;
                    // this._renderTaskQueue.run(this);
                    /*this.context.clear({
                        color: Color.black,
                        depth: 1
                    });*/
                    this._gl.clear(this._clearBit);
                    this.context.setDefault();
                    this.allLayerViews.forEach(function (item) {
                        if (!item.is3D) {
                            item._render();
                        }
                    });
                    this.context.setDefault();
                    this._renderer.state.reset();
                    // this._renderer.resetGLState();
                    this._gl.enable(this._gl.BLEND);
                    this._renderer.render(this._scene, this._camera);

                    this.allLayerViews.forEach(function (item) {
                        if (item.is3D) {
                            item._render();
                        }
                    });

                    if (this.allLayerViews[0]._fadeDirty) {
                        this.allLayerViews[0]._fadeDirty = false;
                        this.threeRender();
                    }
                    // this._gl.enable(this._gl.BLEND);
                    //
                    /*if (this.vectorLayerView) {
                        // this.context.bindFramebuffer.set(null);

                        this.vectorLayerView._renderVector();
                        this._renderer.state.reset();
                    }*/


                    // this._renderer.render(this._scene, this._camera);
                }.bind(this));
            }
        },

        animate: function () {
            if (!this._renderRaf) {
                this._renderRaf = requestAnimationFrame(function () {
                    this._renderRaf = null;
                    this._gl.clear(this._clearBit);
                    this.context.setDefault();
                    this.allLayerViews.forEach(function (item) {
                        if (!item.is3D) {
                            item.zoom();
                        }
                    });
                    this._renderer.state.reset();
                    this._gl.enable(this._gl.BLEND);
                    this._renderer.render(this._scene, this._camera);
                    this.allLayerViews.forEach(function (item) {
                        if (item.is3D) {
                            item.zoom();
                        }
                    });
                }.bind(this));
            }
        },

        getTileTexture: function getTileTexture(size) {
            var textures = this._tileTextures[size];
            return textures && textures.length > 0 ? textures.pop() : null;
        },
        saveTileTexture: function (texture) {
            var textures = this._tileTextures[texture.size[0]];
            if (!textures) {
                this._tileTextures[texture.size[0]] = [texture];
            } else {
                textures.push(texture);
            }
        },

        /**
         * 旋转动画
         * @param angle
         */
        rotateMap: function (angle) {
            if (this.rotateEnabled) {
                this.viewpoint.oldAngle = this.viewpoint.angle;
                this.viewpoint.angle = (this.viewpoint.angle + angle) % 360;
                this.viewpoint.deltaAngle = angle;
                topic.publish("mapRotateAngle", this.viewpoint.angle);
                this._state = "rotate";
                this.setCenter(this.center);
            }
        },
        _handleRotate: function () {
            this.allLayerViews.forEach(function (item) {
                item._readyData();
            });
            this.nochanging = false;
            this._rotateAnimation(null, this.viewpoint.deltaAngle, 0);
        },
        _rotateAnimation: function (start, rad, d) {
            if (!start) start = performance.now();
            var delta = performance.now() - start;
            if (delta >= 500) {
                // this._group.rotateZ(-rad * (500 - d) / 500);
                this.viewpoint.angle = this.viewpoint.oldAngle + rad;
                this.viewpoint.updateBaseMatrix(this.center.x / this.resolution, this.center.y / this.resolution);
                window.cancelAnimationFrame(this._animateRaf);
                this.nochanging = true;
                this.allLayerViews.forEach(function (item) {
                    item._render();
                });
            } else {
                this.viewpoint.angle = this.viewpoint.oldAngle + rad * delta / 500;
                this.viewpoint.updateBaseMatrix(this.center.x / this.resolution, this.center.y / this.resolution);
                this.animate(1);
                this._animateRaf = window.requestAnimationFrame(this._rotateAnimation.bind(this, start, rad, delta));
            }
        },

        setDimensions: function (d) {
            if (d === 2 && this.is3DVision) {
                this.viewpoint.oldPitch = this.viewpoint._pitch;
                this.viewpoint._pitch = 0;
                this.viewpoint.deltaPitch = this.viewpoint._pitch - this.viewpoint.oldPitch;
                this.is3DVision = false;
                this._state = "switch2D";
                this.allLayerViews.forEach(function (item) {
                    item.resize();
                });
                this.setCenter(this.center);
                topic.publish("mapSwitchDimension", 2);
            } else if (d === 3 && !this.is3DVision) {
                this.viewpoint.oldPitch = this.viewpoint._pitch;
                this.viewpoint._pitch = 60;
                this.viewpoint.deltaPitch = this.viewpoint._pitch - this.viewpoint.oldPitch;
                this.is3DVision = true;
                this._state = "switch3D";
                this.allLayerViews.forEach(function (item) {
                    item.resize();
                });
                this.setCenter(this.center);
                topic.publish("mapSwitchDimension", 3);
            }
        },
        _handleSwitch2D: function () {
            this.allLayerViews.forEach(function (item) {
                item._readyData();
            });
            this.nochanging = false;
            this._switchAnimation(null, this.viewpoint.deltaPitch);
        },
        _handleSwitch3D: function () {
            this.allLayerViews.forEach(function (item) {
                item._readyData();
            });
            this.nochanging = false;
            this._switchAnimation(null, this.viewpoint.deltaPitch);
        },
        _switchAnimation: function (start, rad) {
            if (!start) start = performance.now();
            var delta = performance.now() - start;
            if (delta >= 500) {
                this.viewpoint._pitch = this.viewpoint.oldPitch + rad;
                this.viewpoint.updateBaseMatrix(this.center.x / this.resolution, this.center.y / this.resolution);
                window.cancelAnimationFrame(this._animateRaf);
                this.nochanging = true;
                this.allLayerViews.forEach(function (item) {
                    item._render();
                });
            } else {
                this.viewpoint._pitch = this.viewpoint.oldPitch + rad * delta / 500;
                this.viewpoint.updateBaseMatrix(this.center.x / this.resolution, this.center.y / this.resolution);
                this.animate(1);
                this._animateRaf = window.requestAnimationFrame(this._switchAnimation.bind(this, start, rad));
            }
        },

        //-----------------------------------------------------------------------------------------------------------todo

        refresh: function () {
            // todo
            if (this._load) {
                this.zoomHistory.update(this.level, utils.now());
                switch (this._state) {
                    case "zoomIn":
                        this.viewpoint.readyMatrix(this.center.x, this.center.y, this.targetResolution);
                        this._bound = this.viewpoint.calcBounds(this.targetResolution);
                        this._extentDirty = true;
                        this._handleZoom(true);
                        this._state = "default";
                        break;
                    case "zoomOut":
                        this.viewpoint.readyMatrix(this.center.x, this.center.y, this.targetResolution);
                        this._bound = this.viewpoint.calcBounds(this.targetResolution);
                        this._extentDirty = true;
                        this._handleZoom(false);
                        this._state = "default";
                        break;
                    case "rotate":
                        this.viewpoint.updateBaseMatrix(this.center.x, this.center.y, this.resolution);
                        this._bound = this.viewpoint.calcBounds(this.resolution);
                        this._extentDirty = true;
                        this._handleRotate();
                        this._state = "default";
                        break;
                    case "switch2D":
                        this.viewpoint.updateBaseMatrix(this.center.x / this.resolution, this.center.y / this.resolution);
                        this._bound = this.viewpoint.calcBounds(this.resolution);
                        this._extentDirty = true;
                        this.viewpoint.zoom = this.level;
                        this._handleSwitch2D();
                        this._state = "default";
                        break;
                    case "switch3D":
                        this.viewpoint.updateBaseMatrix(this.center.x / this.resolution, this.center.y / this.resolution);
                        this._bound = this.viewpoint.calcBounds(this.resolution);
                        this._extentDirty = true;
                        this.viewpoint.zoom = this.level;
                        this._handleSwitch3D();
                        this._state = "default";
                        break;
                    default:
                        this.viewpoint.calcMatrix(this.center.x, this.center.y, this.resolution);
                        this._bound = this.viewpoint.calcBounds(this.resolution);
                        this._extentDirty = true;
                        this.allLayerViews.forEach(function (item) {
                            item.refresh();
                        });
                    /*this.resolution = this._tileInfo.getResolution(this.viewpoint.zoom);
                    this.viewpoint.calcMatrix(this.center.x/this.resolution, this.center.y/this.resolution);
                    this._bound = this.viewpoint.calcBounds(this.resolution);
                    this._extentDirty = true;
                    this.allLayerViews.forEach(function (item) {
                        item.refresh();
                    });*/

                }
            }
        },







        _onResize: function (e) {
            if (this.resizeEnabled) {
                var width = this.container.clientWidth,
                    height = this.container.clientHeight;
                height = height % 2 === 0 ? height : height + 1;
                this.resizeEnabled = false;
                setTimeout(function () {
                    this.resizeEnabled = true;
                }.bind(this), 100);
                this._containerWidth = width;
                this._containerHeight = height;
                this._camera.aspect = width / height;
                var fov = this._angle / 180 * Math.PI;
                var angle = this._angle;
                var distance = 0.5 / Math.tan(fov / 2) * height;
                this._distance = distance;
                this._camera.position.set(0, -distance * Math.sin(this.slope / 180 * Math.PI), distance * Math.cos(this.slope / 180 * Math.PI));
                this.halfUpHeight = distance * Math.sin(fov / 2) / Math.sin((180 - angle / 2 - this.slope - 90) / 180 * Math.PI);
                this.halfDownHeight = distance * Math.sin(fov / 2) / Math.sin((180 - angle / 2 - (90 - this.slope)) / 180 * Math.PI);
                this.halfUpWidth = this.halfUpHeight * width / height;
                this.halfDownWidth = this.halfDownHeight * width / height;
                this.width = this.halfUpWidth + this.halfDownWidth;
                this.height = this.halfUpHeight + this.halfDownHeight;

                this._camera.updateProjectionMatrix();
                this._renderer.setSize(width, height);
                this.setExtent(null, this.center);
            }
        },


        selectObj: function (x, y) {
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
                            topic.publish("mapMovePOI", intersects[i].object.uuid, x, y);
                            return;
                        }
                    }
                }
                topic.publish("mapMovePOI", false, x, y);
            }
        },

        _findNestZoom: function (tempResolution) {
            var lods = this._tileInfo.lods,
                len = lods.length, ratio = 0;
            for (var j = len - 1; j > -1; j--) {
                ratio = lods[j].resolution / tempResolution;
                if (ratio < 1.9 && ratio > 0.95) {
                    this.level = j;
                    this.viewpoint.zoom = j;
                    return lods[j].resolution;
                }
            }
            this.level = len - 1;
            this.viewpoint.zoom = len - 1;
            return lods[len - 1].resolution;
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
        findLayerViewById: function (id) {
            for (var i = this.allLayerViews.length - 1; i > -1; i--) {
                if (this.allLayerViews[i].id === id) {
                    return this.allLayerViews[i];
                }
            }
        },


        /**
         * 指定缩放的地图层级
         * @param level
         * @param center
         */
        setLevel: function (level) {
            // console.log(this.name);
            this.level = level;
            if (!this._tileInfo) {
                this._tileInfo = this.map.allLayers[0].tileInfo;
            }
            this.resolution = this._tileInfo.lods[level].resolution;
            var center = this.extent.getCenter(),
                width = this.width,
                height = this.height;
            // console.log(width, height);
            var halfx = this.resolution * width * 0.5;
            var halfy = this.resolution * height * 0.5;
            var newMinx = center.x - halfx;
            var newMaxx = center.x + halfx;
            var newMiny = center.y - halfy;
            var newMaxy = center.y + halfy;
            var newExtent = new Extent(newMinx, newMiny, newMaxx, newMaxy);
            // console.log(newExtent);
            // this._calExtent(newExtent.getCenter());
            // this.refresh();
            /* this._calExtent(newExtent.getCenter());
             topic.publish("extentChangeEvent", this.extent);
             this.refresh();*/
            this.setExtent(null, newExtent.getCenter());
        },


        _calExtent: function (point, x, y) {
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

            console.log(resolution);

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

            console.log(this.extent);

            // console.log(this.extent);
        },

        resetExtent: function () {
            var a = this.viewpoint.rotation;
            topic.publish("mapRotateAngle", 0);
            this._group.rotateZ(a / 180 * Math.PI);
            this.viewpoint.rotation = 0;
            var distance = this._distance;
            var fov = 0.6435011087932844;
            var angle = this._angle;
            if (this.init3D) {
                this.slope = this.maxSlope;
                this.is3DVision = true;
            } else {
                this.slope = 0;
                this.is3DVision = false;
            }
            this._camera.position.set(0, -distance * Math.sin(this.slope / 180 * Math.PI), distance * Math.cos(this.slope / 180 * Math.PI));
            this._camera.lookAt(0, 0, 0);
            this.halfUpHeight = distance * Math.sin(fov / 2) / Math.sin((180 - angle / 2 - this.slope - 90) / 180 * Math.PI);
            this.halfDownHeight = distance * Math.sin(fov / 2) / Math.sin((180 - angle / 2 - (90 - this.slope)) / 180 * Math.PI);
            this.halfUpWidth = this.halfUpHeight * this._ratio;
            this.halfDownWidth = this.halfDownHeight * this._ratio;

            this.width = this.halfUpWidth + this.halfDownWidth;
            this.height = this.halfUpHeight + this.halfDownHeight;

            this.resolution = this.startResolution;
            this.level = this.startLevel;
            this.setExtent(null, new MapPoint(this.initCenter.x, this.initCenter.y, this.initCenter.z));

        },


        // 坐标变换  屏幕<===>Scene场景<===>地理
        /**
         *
         * @param x
         * @param y
         * @returns {exports}
         * @private
         */
        _screenToScene: function (x, y) {
            /*var width = this._containerWidth,
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
            var theta = this.viewpoint.rotation / 180 * Math.PI;
            pos.multiplyScalar(this.viewpoint.scale);
            var cos = Math.cos(theta),
                sin = Math.sin(theta);
            return new Point(pos.x * cos - pos.y * sin, pos.y * cos + pos.x * sin, 0);*/

            var p = this.viewpoint.screenToGeometry(x, y);
            return new Point(p.x, p.y, 0);
        },

        /**
         * 场景坐标转屏幕坐标
         * @param x
         * @param y
         * @param z
         * @returns
         * @private
         */
        _sceneToScreen: function (x, y, z) {
            var vector = glMatrix.vec4.fromValues(x, y, z, 1);
            glMatrix.vec4.transformMat4(vector, vector, this.viewpoint.matrix);
            var w = vector[3];
            return {
                x: (vector[0] / w + 1) * this.viewpoint.width / 2,
                y: -(vector[1] / w - 1) * this.viewpoint.height / 2
            };
            /*var vector = new THREE.Vector3(x, y, z);
            vector.project(this._camera).applyMatrix4(this._group.matrixWorld);
            vector.x = (vector.x + 1) * this.width / 2;
            vector.y = -(vector.y - 1) * this.height / 2;
            vector.z = 0;
            return vector;*/
        },
        _sceneToGeometry: function (x, y, z) {
            return new Point(
                x * this.resolution,
                y * this.resolution,
                0
            )
        },
        _geometryToScene: function (x, y, z) {
            return new Point(
                x / this.resolution,
                y / this.resolution,
                0
            );
        },


        screenToGeometry: function (x, y) {/*屏幕转地理*/
            /*var pos = this._screenToScene(x, y);
            return this._sceneToGeometry(pos.x, pos.y, 0);*/

            var p = this.viewpoint.screenToGeometry(x, y);
            return new Point(p.x, p.y, 0);
        },
        geometryToScreen: function (x, y) {/*地理转屏幕*/
            /*var pos = this._geometryToScene(x, y, 0);
            return this._sceneToScreen(pos.x, pos.y, pos.z);*/
            var vector = glMatrix.vec4.fromValues(x, y, 0, 1);
            glMatrix.vec4.transformMat4(vector, vector, this.viewpoint.matrix);
            var w = vector[3];
            return {
                x: (vector[0] / w + 1) * this.viewpoint.width / 2,
                y: -(vector[1] / w - 1) * this.viewpoint.height / 2
            };
        },
        centerAt: function (x, y) {/*x,y 为number类型*/
            var point = new Point(x, y);
            this.center = point;
            this.setExtent(null, point);
        },

        useProgram: function (name, programConfiguration) {
            if (programConfiguration === void 0) programConfiguration = this.emptyProgramConfiguration;
            this.cache = this.cache || {};
            var key = "" + name + (programConfiguration.cacheKey || '');
            if (!this.cache[key]) {
                this.cache[key] = new Program(this.context, VertexFragShader[name], programConfiguration, VertexFragShader.programUniforms[name]);
            }
            return this.cache[key];
        }
    });
});
