/**
 * 场景View, 负责与用户交互和渲染
 * @author 吴胜飞
 * @module com/huayun/webgis/views
 * @see com.huayun.webgis.views.SceneView
 */
define("com/huayun/webgis/views/EagleView", [
    "dojo/topic",
    "dojo/on",
    "./View",
    "../Viewpoint",
    "../geometry/Extent",
    "../geometry/Point",
    "../geometry/MapPoint",
    "../layers/GraphicLayer",
    "../handler/PanHandler",
    "com/huayun/webgis/gl/Context",
    "com/huayun/webgis/layers/support/ZoomHistory",
    "com/huayun/webgis/gl/VertexFragShader",
    "com/huayun/webgis/gl/programConfig",
    "com/huayun/webgis/gl/Program",
    "com/huayun/webgis/gl/ProgramSimplify",
    "../utils/utils",
    "../utils/Color",
    "../utils/TaskQueue",
    "com/huayun/webgis/gl/LineAtlas"
], function (topic, on, View, Viewpoint,
             Extent, Point, MapPoint, GraphicLayer, PanHandler, Context, ZoomHistory, VertexFragShader, programConfig, Program, ProgramSimplify, utils, Color, TaskQueue, LineAtlas) {
    /**
     * 构造函数
     * @constructor
     * @alias com.huayun.webgis.views.SceneView
     * @extends {View}
     * @property {number} width - 地图容器的宽度, 单位px
     * @property {number} height - 地图容器的高度, 单位px
     * @property {number} resolution - 地图分辨率
     * @property {number} level - 地图的层级
     * @property {Viewpoint} viewpoint - 地图视图
     * @property {boolean} _load - 地图坐标系的元数据是否加载
     * @property {number} _offsetLeft - 地图容器相对于屏幕左侧的距离, 屏幕坐标的修正
     * @property {number} _offsetTop - 地图容器相对于屏幕顶侧的距离, 屏幕坐标的修正
     * @property {Extent} extent - 地图当前范围
     */
    var SceneView = function (params) {
        View.call(this, params);
        this._offsetLeft = this.container.getBoundingClientRect().left;
        this._offsetTop = this.container.getBoundingClientRect().top;
        this._clearBit = 0 | 16384 | 256 | 1024; // WebGL清除标志位
        this._nochanging = true;
        this._extentDirty = true;

        this.numSublayers = SceneView.maxUnderzooming + SceneView.maxOverzooming + 1;
        this.depthEpsilon = 1 / Math.pow(2, 16);
        this.currentLayer = 0;
        this.viewStates = []; // 视图数组
        this.backViewStates = [];
        this.viewStatesLength = 10;

        var pitch = params.pitch ? params.pitch : params.is3DVision ? 50 : 0,
            angle = params.angle ? params.angle : 0,
            width = this.container.clientWidth,
            height = this.container.clientHeight;

        this._setupContainer(width, height);
        this._setupContext();
        this.viewpoint = new Viewpoint(width, height, pitch, angle, params.maxLevel, params.minLevel, 0, this);

        // todo
        this._tileTextures = {};
        this.zoomHistory = new ZoomHistory();
        this.panEnabled = true;
        this.zoomEnabled = true;
        this.rotateEnabled = true;
        this.selectEnabled = true;
        this.resizeEnabled = true;
        this.emptyProgramConfiguration = new programConfig.ProgramConfiguration();
        this.lineAtlas = new LineAtlas(256, 512);

        this._handleAddedLayer();
        this._handleTopic();

        if (params.center) { // 处理构造函数中心点设置
            if (params.level) {
                this.setCenter(params.center, params.level);
            } else if (params.resolution) {
                this.setCenter(params.center, null, params.resolution);
            } else {
                throw new Error("通过中心点设置初始状态必须包含层级或分辨率");
            }
        } else if (params.extent) { // 处理构造函数范围设置
            this.setExtent(params.extent);
        }

        this.numSublayers = 3 + 10 + 1;
        this.depthEpsilon = 1 / Math.pow(2, 16);
    };

    if (View) SceneView.__proto__ = View;
    SceneView.prototype = Object.create(View && View.prototype);
    SceneView.prototype.constructor = SceneView;

    var prototypeAccessors = {
        width: {configurable: true},
        height: {configurable: true},
        resolution: {configurable: true},
        level: {configurable: true},
        center: {configurable: true},
        is3DVision: {configurable: true},
        extent: {configurable: true}
    };

    prototypeAccessors.width.get = function () {
        return this.viewpoint.width;
    };

    prototypeAccessors.height.get = function () {
        return this.viewpoint.height;
    };

    prototypeAccessors.resolution.get = function () {
        return this.viewpoint.resolution;
    };
    /*prototypeAccessors.resolution.set = function(resolution) {
        this.viewpoint.resolution = resolution;
    };*/

    prototypeAccessors.level.get = function () {
        return this.viewpoint.level;
    };
    /*prototypeAccessors.level.set = function(level) {
        return this.view.level = level;
    };*/

    prototypeAccessors.center.get = function () {
        var center = this.viewpoint.center;
        return {
            x: center[0],
            y: center[1],
            z: 0
        };
    };
    /*prototypeAccessors.center.set = function(center) {
        return this.view.center = center;
    };*/

    prototypeAccessors.is3DVision.get = function() {
        return this.viewpoint.pitch !== 0;
    };

    prototypeAccessors.extent.get = function() {
        if (this._extentDirty) {
            var bound = this._bound;
            var xmin = Math.min(bound[0].x, bound[1].x, bound[2].x, bound[3].x),
                xmax = Math.max(bound[0].x, bound[1].x, bound[2].x, bound[3].x),
                ymin = Math.min(bound[0].y, bound[1].y, bound[2].y, bound[3].y),
                ymax = Math.max(bound[0].y, bound[1].y, bound[2].y, bound[3].y);
            this._extent = new Extent(xmin, ymin, xmax, ymax);
            this._extentDirty = false;
            return this._extent;
        } else {
            return this._extent;
        }
    };

    /**
     * 设置地图容器, 创建WebGL的绘图容器Canvas
     * @param {number} width - 地图容器的宽度
     * @param {number} height - 地图容器的高度
     * @private
     */
    SceneView.prototype._setupContainer = function (width, height) {
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
    };

    /**
     * 创建WebGL的Context, 进行基础设置
     * @private
     */
    SceneView.prototype._setupContext = function () {
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
    };

    /**
     * 为已加入地图中的图层创建LayerView
     * @private
     */
    SceneView.prototype._handleAddedLayer = function () {
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
    };

    /**
     * 处理View监听的事件
     * @private
     */
    SceneView.prototype._handleTopic = function () {
        // 监听地图添加事件
        topic.subscribe("addLayer", function (layerArray, id) {
            if (id !== this.map.id) {
                return;
            }

            if (this.allLayerViews.length === 0 && layerArray[0].tileInfo) { // 之前没有图层
                this.viewpoint.setTileInfo(layerArray[0].tileInfo);
                this._load = true;
            }
            for (var i = 0; i < layerArray.length; i++) {
                // todo
                /* if (!layerArray[i].maxLevel) {
                     layerArray[i].maxLevel = this.maxLevel;
                 }*/
                this.allLayerViews.push(layerArray[i].createLayerView(this));
            }
        }.bind(this));
    };

    SceneView.prototype.setTileInfo = function (tileInfo) {
        if (this._load) return;
        if (!this.viewpoint.tileInfo && tileInfo) { // 只取第一个图层的元数据
            this.viewpoint.setTileInfo(tileInfo);
            this._load = true;
            if (this.viewpoint.level || this.viewpoint.resolution) {
                this.setCenter(this.viewpoint.center, this.viewpoint.level, this.viewpoint.resolution);
            }
        } else {
            this.setCenter(this.center);
        }
    }

    /**
     * 设置地图中心点
     * @param {Array} center - 二元数组, 中心点坐标
     * @param {number} level - 地图层级, 可选
     * @param {number} resolution - 地图分辨率, 可选
     */
    SceneView.prototype.setCenter = function (center, level, resolution) {
        if (level) { // 根据层级设置
            this.viewpoint.setLevel(level);
            this.viewpoint.setCenter(center);
        } else if (resolution) {
            this.viewpoint.setResolution(resolution, this._load);
            this.viewpoint.setCenter(center);
        }
        this.refresh();
    };

    SceneView.prototype.setMapCenter = function (center) {
        this.viewpoint.setCenter(center);
        this.refresh();
    };

    /**
     * 设置地图范围
     * @param {Extent} extent - 地图范围
     */
    SceneView.prototype.setExtent = function (extent) {
        if (extent instanceof Extent) {
            var center = extent.getCenter();
            var w = extent.getWidth(),
                h = extent.getHeight(),
                width = this.viewpoint.width,
                height = this.viewpoint.height;
            this.viewpoint.setCenter([center.x, center.y]);
            this.viewpoint.setResolution(Math.max(w / width, h / height), true);
            this.refresh();
        }
    };

    SceneView.prototype.getExtent = function () {
        if (this._extentDirty) {
            var bound = this._bound;
            var xmin = Math.min(bound[0].x, bound[1].x, bound[2].x, bound[3].x),
                xmax = Math.max(bound[0].x, bound[1].x, bound[2].x, bound[3].x),
                ymin = Math.min(bound[0].y, bound[1].y, bound[2].y, bound[3].y),
                ymax = Math.max(bound[0].y, bound[1].y, bound[2].y, bound[3].y);
            this._extent = new Extent(xmin, ymin, xmax, ymax);
            this._extentDirty = false;
            return this._extent;
        } else {
            return this._extent;
        }

    };

    /**
     * 设置视图
     * @param {boolean} prev - 是否设置前一视图
     */
    SceneView.prototype.setView = function(prev) {
        var viewState;
        if (prev && this.viewStates.length > 1) {
            this.backViewStates.push(this.viewStates.pop());
            viewState = this.viewStates[this.viewStates.length-1];
            this.viewpoint.setView(viewState);
            this.refresh(true);
        } else if (!prev && this.backViewStates.length > 0) {
            this.viewStates.push(this.backViewStates.pop());
            viewState = this.viewStates[this.viewStates.length-1];
            this.viewpoint.setView(viewState);
            this.refresh(true);
        }

    };

    /**
     * 刷新地图
     */
    SceneView.prototype.refresh = function (noPushState) {
        if (!this._load) {
            return;
        }
        this.zoomHistory.update(this.viewpoint.level, utils.now());
        this.viewpoint.calcMatrix(true);
        this._bound = this.viewpoint.calcBounds();
        this._extentDirty = true;
        topic.publish("extentChangeEvent", this);
        if (!noPushState) {
            this.handlePushViewState();
        }
        this.allLayerViews.forEach(function (item) {
            item.refresh();
        });
        this.threeRender();
    };

    SceneView.prototype.handlePushViewState = function() {
        // 保存最大不超过10个视图
        if (this.viewStates.length < this.viewStatesLength) {
            this.viewStates.push({
                pitch: this.viewpoint.pitch,
                angle: this.viewpoint.angle,
                level: this.viewpoint.targetZoom||this.viewpoint.level,
                center: this.viewpoint.center
            });
        } else {
            this.viewStates.shift();
            this.viewStates.push({
                pitch: this.viewpoint.pitch,
                angle: this.viewpoint.angle,
                level: this.viewpoint.targetZoom||this.viewpoint.level,
                center: this.viewpoint.center
            });
        }
        this.backViewStates = [];
    };

    SceneView.prototype.centerAt = function(x, y, level) {
        if (level && level !== this.viewpoint.level) {
            this.viewpoint.setLevel(level);
        }
        this.viewpoint.setCenter([x, y]);
        this.viewpoint.calcMatrix(true);
        this.refresh();
    };

    // 功能函数
    /**
     * 根据LayerView的id获取对应的LayerView
     * @param {string} id - LayerView的id
     * @return {LayerView}
     */
    SceneView.prototype.findLayerViewById = function(id) {
        for (var i = this.allLayerViews.length - 1; i > -1; i--) {
            if (this.allLayerViews[i].id === id) {
                return this.allLayerViews[i];
            }
        }
    };

    /**
     * 屏幕坐标转化为地理坐标
     * @param {number} x - 屏幕坐标x
     * @param {number} y - 屏幕坐标y
     * @return {Point} 地理坐标
     */
    SceneView.prototype.screenToGeometry = function (x, y) {
        x = x - this._offsetLeft; // 修正屏幕坐标
        y = y - this._offsetTop;
        var p = this.viewpoint.screenToGeometry(x, y);
        return new Point(p.x, p.y, 0);
    };

    SceneView.prototype.getTileTexture = function getTileTexture(size) {
        var textures = this._tileTextures[size];
        return textures && textures.length > 0 ? textures.pop() : null;
    };

    SceneView.prototype.saveTileTexture = function (texture) {
        var textures = this._tileTextures[texture.size[0]];
        if (!textures) {
            this._tileTextures[texture.size[0]] = [texture];
        } else {
            textures.push(texture);
        }
    };


    SceneView.prototype.useProgram = function (name, programConfiguration) {
        if (programConfiguration === void 0) programConfiguration = this.emptyProgramConfiguration;
        this.cache = this.cache || {};
        var key = "" + name + (programConfiguration.cacheKey || '');
        if (!this.cache[key]) {
            this.cache[key] = new Program(this.context, VertexFragShader[name], programConfiguration, VertexFragShader.programUniforms[name]);
        }
        return this.cache[key];
    };

    SceneView.prototype.useProgramSimplify = function(name, programConfiguration) {
        this.simplifyCache = this.simplifyCache || {};
        if (!this.simplifyCache[name]) {
            this.simplifyCache[name] = new ProgramSimplify(this.context, VertexFragShader[name], programConfiguration, VertexFragShader.programUniforms[name]);
        }
        return this.simplifyCache[name];
    };

    SceneView.prototype.threeRender = function () {
        if (!this._renderRaf && this._nochanging) {
            this._renderRaf = requestAnimationFrame(function () {
                this._renderRaf = null;
                this._gl.clear(this._clearBit);
                this.currentLayer = 0;
                this.depthRangeFor3D = [0, 1 - ((1 + 2) * this.numSublayers * this.depthEpsilon)];
                this.context.setDefault();
                this.allLayerViews.forEach(function (item) {
                    item._render();
                });
                if (this.allLayerViews[0]._fadeDirty) { // 静态切片透明度变化效果, 待改进
                    this.allLayerViews[0]._fadeDirty = false;
                    this.threeRender();
                }
            }.bind(this));
        }
    };

    Object.defineProperties(SceneView.prototype, prototypeAccessors);

    // 待抽取功能
    // todo
    /**
     * 滚动缩放
     * @param e
     * @private
     */
    SceneView.prototype._zoomMap = function (e) {
        if (e.wheelDelta > 0) {
            this.zoomInWheel(e.clientX, e.clientY);
        } else if (e.wheelDelta < 0) {
            this.zoomOutWheel(e.clientX, e.clientY);
        }
    };
    SceneView.prototype.zoomInWheel = function (x, y) {
        if (this.zoomEnabled && this.viewpoint.level < this.viewpoint.maxLevel) {
            this.zoomEnabled = false;
            setTimeout(function () {
                this.zoomEnabled = true;
            }.bind(this), 400);
            this.viewpoint.startZoom = this.viewpoint.level;
            this.viewpoint.targetZoom = this.viewpoint.level + 1;
            var aroundPoint = this.screenToGeometry(x, y);
            var center = this.viewpoint.center;
            this.deltaX = aroundPoint.x - center[0];
            this.deltaY = aroundPoint.y - center[1];
            this.viewpoint.readyMatrix(center[0] + this.deltaX / 2, center[1] + this.deltaY / 2, this.viewpoint.targetZoom);
            this._bound = this.viewpoint.calcBounds();
            this._extentDirty = true;
            this._handleZoomWheel(true);
        }
    };

    SceneView.prototype.zoomOutWheel = function (x, y) {
        if (this.zoomEnabled && this.viewpoint.level > 1) {
            this.zoomEnabled = false;
            setTimeout(function () {
                this.zoomEnabled = true;
            }.bind(this), 400);
            this.viewpoint.startZoom = this.viewpoint.level;
            this.viewpoint.targetZoom = this.viewpoint.level - 1;
            var aroundPoint = this.screenToGeometry(x, y);
            var center = this.viewpoint.center;
            this.deltaX = aroundPoint.x - center[0];
            this.deltaY = aroundPoint.y - center[1];
            this.viewpoint.readyMatrix(center[0] - this.deltaX, center[1] - this.deltaY, this.viewpoint.targetZoom);
            this._bound = this.viewpoint.calcBounds();
            this._extentDirty = true;
            this._handleZoomWheel(false);
        }
    };

    SceneView.prototype.zoomIn = function () {
        if (this.zoomEnabled && this.viewpoint.level < this.viewpoint.maxLevel) {
            this.zoomEnabled = false;
            setTimeout(function () {
                this.zoomEnabled = true;
            }.bind(this), 300);
            this.viewpoint.startZoom = this.viewpoint.level;
            this.viewpoint.targetZoom = this.viewpoint.level + 1;
            var center = this.viewpoint.center;
            this.viewpoint.readyMatrix(center[0], center[1], this.viewpoint.targetZoom);
            this._bound = this.viewpoint.calcBounds();
            this._extentDirty = true;
            this._handleZoom(true);
        }
    };

    SceneView.prototype.zoomOut = function () {
        if (this.zoomEnabled && this.viewpoint.level > 1) {
            this.zoomEnabled = false;
            setTimeout(function () {
                this.zoomEnabled = true;
            }.bind(this), 300);
            this.viewpoint.startZoom = this.viewpoint.level;
            this.viewpoint.targetZoom = this.viewpoint.level - 1;
            var center = this.viewpoint.center;
            this.viewpoint.readyMatrix(center[0], center[1], this.viewpoint.targetZoom);
            this._bound = this.viewpoint.calcBounds();
            this._extentDirty = true;
            this._handleZoom(false);
        }
    };

    SceneView.prototype._handleZoom = function (isZoomIn) {
        this.allLayerViews.forEach(function (item) {
            item._readyData();
        });
        this._nochanging = false;
        if (isZoomIn) {
            this._zoomAnimateIn(null, 1);
        } else {
            this._zoomAnimateOut(null, 1);
        }
    };

    SceneView.prototype._handleZoomWheel = function (isZoomIn) {
        this.allLayerViews.forEach(function (item) {
            item._readyData();
        });
        this._nochanging = false;
        if (isZoomIn) {
            this._zoomWheelAnimateIn(null);
        } else {
            this._zoomWheelAnimateOut(null);
        }
    };

    SceneView.prototype._zoomWheelAnimateOut = function (start) {
        if (!start) start = performance.now();
        var delta = performance.now() - start;
        var center = this.viewpoint.center;
        if (delta >= 300) {
            window.cancelAnimationFrame(this._animateRaf);
            this._nochanging = true;
            this.viewpoint.setCenter([center[0] - this.deltaX, center[1] - this.deltaY]);
            this.viewpoint.setLevel(this.viewpoint.targetZoom);
            this.viewpoint.calcMatrix(true);
            this.handlePushViewState();
            this._renderRaf = null;
            this.threeRender();
        } else {
            var scale = delta / 300;
            var powScale = 1 / Math.pow(2, -scale) - 1;
            this.viewpoint.updateMatrix(center[0] - this.deltaX * powScale, center[1] - this.deltaY * powScale, this.viewpoint.startZoom - scale);
            this.animate();
            this._animateRaf = window.requestAnimationFrame(this._zoomWheelAnimateOut.bind(this, start));
        }
    };

    SceneView.prototype._zoomAnimateOut = function (start) {
        if (!start) start = performance.now();
        var delta = performance.now() - start;
        var center = this.viewpoint.center;
        if (delta >= 300) {
            window.cancelAnimationFrame(this._animateRaf);
            this._nochanging = true;
            this.viewpoint.setCenter([center[0], center[1]]);
            this.viewpoint.setLevel(this.viewpoint.targetZoom);
            this.viewpoint.calcMatrix(true);
            this.handlePushViewState();
            this._renderRaf = null;
            this.threeRender();
        } else {
            var scale = delta / 300;
            this.viewpoint.updateMatrix(center[0], center[1], this.viewpoint.startZoom - scale);
            this.animate();
            this._animateRaf = window.requestAnimationFrame(this._zoomAnimateOut.bind(this, start));
        }
    };

    SceneView.prototype._zoomWheelAnimateIn = function (start) {
        if (!start) start = performance.now();
        var delta = performance.now() - start;
        var center = this.viewpoint.center;
        if (delta >= 300) {
            window.cancelAnimationFrame(this._animateRaf);
            this._nochanging = true;
            this.viewpoint.setCenter([center[0] + this.deltaX / 2, center[1] + this.deltaY / 2]);
            this.viewpoint.setLevel(this.viewpoint.targetZoom);
            this.viewpoint.calcMatrix(true);
            this._renderRaf = null;
            this.handlePushViewState();
            this.threeRender();
        } else {
            var scale = delta / 300;
            var powScale = 1 - 1 / Math.pow(2, scale);
            this.viewpoint.updateMatrix(center[0] + this.deltaX * powScale, center[1] + this.deltaY * powScale, this.viewpoint.startZoom + scale);
            this.animate();
            this._animateRaf = window.requestAnimationFrame(this._zoomWheelAnimateIn.bind(this, start));
        }
    };

    SceneView.prototype._zoomAnimateIn = function (start) {
        if (!start) start = performance.now();
        var delta = performance.now() - start;
        var center = this.viewpoint.center;
        if (delta >= 300) {
            window.cancelAnimationFrame(this._animateRaf);
            this._nochanging = true;
            this.viewpoint.setCenter([center[0], center[1]]);
            this.viewpoint.setLevel(this.viewpoint.targetZoom);
            this.viewpoint.calcMatrix(true);
            this._renderRaf = null;
            this.handlePushViewState();
            this.threeRender();
        } else {
            var scale = delta / 300;
            this.viewpoint.updateMatrix(center[0], center[1], this.viewpoint.startZoom + scale);
            this.animate();
            this._animateRaf = window.requestAnimationFrame(this._zoomAnimateIn.bind(this, start));
        }
    };

    SceneView.prototype.mapMove = function (xmove, ymove) {
        if (this.panEnabled) {
            // todo 使用矩阵运算代替
            var theta = -this.viewpoint.angle / 180 * Math.PI,
                sina = Math.sin(theta),
                cosa = Math.cos(theta),
                resolution = this.viewpoint.resolution,
                center = this.viewpoint.center;
            var rxmove = xmove * cosa - ymove * sina,
                rymove = xmove * sina + ymove * cosa;
            var deltax = resolution * rxmove,
                deltay = resolution * rymove;
            this.viewpoint.setCenter([center[0] - deltax, center[1] + deltay]);
            this.viewpoint.calcMatrix(true);
            this.threeRender();
        }
    };

    SceneView.prototype.stopMove = function () {
        if (this.panEnabled) {
            this.refresh(true);
        }
    };

    SceneView.prototype.pan = function(x, y) {
        if (this.panEnabled) {
            var theta = -this.viewpoint.angle / 180 * Math.PI,
                sina = Math.sin(theta),
                cosa = Math.cos(theta),
                center = this.viewpoint.center;
            var deltax = x * cosa - y * sina,
                deltay = x * sina + y * cosa;
            this.viewpoint.setCenter([center[0] - deltax, center[1] + deltay]);
            this.viewpoint.calcMatrix(true);
            this.refresh(false);
        }
    };


    SceneView.prototype._mouseRotate = function (move) {
        if (this.rotateEnabled) {
            var angle = move / 1080 * 180;
            this.viewpoint.angle = (this.viewpoint.angle - angle) % 360;
            this.viewpoint.updateBaseMatrix();
            this.threeRender();
        }
    };

    SceneView.prototype._stopMouseRotate = function () {
        if (this.rotateEnabled) {
            this.refresh(true);
        }
    };

    SceneView.prototype.rotateMap = function (angle) {
        if (this.rotateEnabled) {
            this.viewpoint.oldAngle = this.viewpoint.angle;
            this.viewpoint.angle = (this.viewpoint.angle + angle) % 360;
            this.viewpoint.deltaAngle = angle;
            this.viewpoint.updateBaseMatrix();
            this._bound = this.viewpoint.calcBounds();
            this._extentDirty = true;
            this._handleRotate();
        }
    };

    SceneView.prototype._handleRotate = function () {
        this.allLayerViews.forEach(function (item) {
            item._readyData();
        });
        this._nochanging = false;
        this._rotateAnimation(null, this.viewpoint.deltaAngle, 0);
    };

    SceneView.prototype._rotateAnimation = function (start, rad, d) {
        if (!start) start = performance.now();
        var delta = performance.now() - start;
        var center = this.viewpoint.center;
        if (delta >= 500) {
            window.cancelAnimationFrame(this._animateRaf);
            this._nochanging = true;
            this.viewpoint.angle = this.viewpoint.oldAngle + rad;
            this.viewpoint.updateBaseMatrix();
            this.handlePushViewState();
            this.threeRender();
        } else {
            this.viewpoint.angle = this.viewpoint.oldAngle + rad * delta / 500;
            this.viewpoint.updateBaseMatrix();
            this.animate();
            this._animateRaf = window.requestAnimationFrame(this._rotateAnimation.bind(this, start, rad, delta));
        }
    };

    SceneView.prototype._mouseSwitchDip = function (ymove) {
        if (this.rotateEnabled) {
            this.viewpoint.updatePitch(-ymove / 20);
            this.threeRender();
        }
    };
    SceneView.prototype._stopSwitch = function () {
        if (this.rotateEnabled) {
            this.refresh(true);
        }
    };

    SceneView.prototype.setDimensions = function (d) {
        if (d === 2 && this.viewpoint.pitch !== 0) {
            this.viewpoint.oldPitch = this.viewpoint.pitch;
            this.viewpoint.pitch = 0;
            this.viewpoint.deltaPitch = this.viewpoint.pitch - this.viewpoint.oldPitch;
            this.viewpoint.updateBaseMatrix();
            this._bound = this.viewpoint.calcBounds();
            this._extentDirty = true;
            this._handleSwitch2D();
        } else if (d === 3 && this.viewpoint.pitch !== 50) {
            this.viewpoint.oldPitch = this.viewpoint.pitch;
            this.viewpoint.pitch = 50;
            this.viewpoint.deltaPitch = this.viewpoint.pitch - this.viewpoint.oldPitch;
            this.viewpoint.updateBaseMatrix();
            this._bound = this.viewpoint.calcBounds();
            this._extentDirty = true;
            this._handleSwitch3D();
        }
    };
    SceneView.prototype._handleSwitch2D = function () {
        this.allLayerViews.forEach(function (item) {
            item._readyData();
        });
        this._nochanging = false;
        this._switchAnimation(null, this.viewpoint.deltaPitch);
    };
    SceneView.prototype._handleSwitch3D = function () {
        this.allLayerViews.forEach(function (item) {
            item._readyData();
        });
        this._nochanging = false;
        this._switchAnimation(null, this.viewpoint.deltaPitch);
    };
    SceneView.prototype._switchAnimation = function (start, rad) {
        if (!start) start = performance.now();
        var delta = performance.now() - start;
        if (delta >= 500) {
            window.cancelAnimationFrame(this._animateRaf);
            this._nochanging = true;
            this.viewpoint.pitch = this.viewpoint.oldPitch + rad;
            this.viewpoint.updateBaseMatrix();
            this.handlePushViewState();
            this.threeRender();
        } else {
            this.viewpoint.pitch = this.viewpoint.oldPitch + rad * delta / 500;
            this.viewpoint.updateBaseMatrix();
            this.animate();
            this._animateRaf = window.requestAnimationFrame(this._switchAnimation.bind(this, start, rad));
        }
    };

    SceneView.prototype.animate = function () {
        if (!this._renderRaf) {
            this._renderRaf = requestAnimationFrame(function () {
                this._renderRaf = null;
                this._gl.clear(this._clearBit);
                this.currentLayer = 0;
                this.context.setDefault();
                this.allLayerViews.forEach(function (item) {
                    item.zoom();
                });
            }.bind(this));
        }
    };

    SceneView.prototype.setCustomLayerDefaults = function() {
        this.context.unbindVAO();
        this.context.cullFace.setDefault();
        this.context.activeTexture.setDefault();
        this.context.pixelStoreUnpack.setDefault();
        this.context.pixelStoreUnpackPremultiplyAlpha.setDefault();
        this.context.pixelStoreUnpackFlipY.setDefault();
    };

    SceneView.prototype.setBaseState = function setBaseState() {
        var gl = this.context.gl;
        this.context.cullFace.set(false);
        this.context.viewport.set([0, 0, this.width, this.height]);
        this.context.blendEquation.set(gl.FUNC_ADD);
    };

    SceneView.prototype.queryFeaturesByGeometry = function(geometry, queryPadding) {
        queryPadding = queryPadding;
        var layers = this.map.allLayers;
        var result = {};
        layers.forEach(function (layer) {
            if (layer.selectEnabled) {
                if (layer instanceof GraphicLayer) {
                    layer.createIndex();
                }
                result[layer.id] = layer.queryFeaturesByGeometry(geometry, 8);
            }
        });
        return result;
    };

    SceneView.prototype.addTask = function(callback) {
        this._renderRaf = requestAnimationFrame(function () {
            this._renderRaf = null;
            this._gl.clear(this._clearBit);
            this.currentLayer = 0;
            this.depthRangeFor3D = [0, 1 - ((1 + 2) * this.numSublayers * this.depthEpsilon)];
            this.context.setDefault();
            this.allLayerViews.forEach(function (item) {
                item._render();
            });
            if (this.allLayerViews[0]._fadeDirty) { // 静态切片透明度变化效果, 待改进
                this.allLayerViews[0]._fadeDirty = false;
                this.threeRender();
            } else {
                callback();
            }
        }.bind(this));
    };

    SceneView.prototype.calcBounds = function(xmin, xmax, ymin, ymax) {
        return this.viewpoint.calcBound(xmin, xmax, ymin, ymax);
    };

    SceneView.maxOverzooming = 10;
    SceneView.maxUnderzooming = 3;
    return SceneView;
});
