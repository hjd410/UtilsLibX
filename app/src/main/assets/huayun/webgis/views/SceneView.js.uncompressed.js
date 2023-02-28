/**
 * 场景View, 负责与用户交互和渲染
 * @see com.huayun.webgis.views.SceneView
 */
define("com/huayun/webgis/views/SceneView", [
    "dojo/topic",
    "dojo/on",
    "dojo/DeferredList",
    "dojo/promise/Promise",
    "dojo/dom-construct",
    "./View",
    "../Viewpoint",
    "../geometry/Extent",
    "../geometry/Point",
    "../geometry/Polygon",
    "../geometry/MapPoint",
    "../layers/GraphicLayer",
    "../handler/PanHandler",
    "../handler/TouchHandler",
    "com/huayun/webgis/gl/Context",
    "com/huayun/webgis/layers/support/ZoomHistory",
    "com/huayun/webgis/gl/VertexFragShader",
    "com/huayun/webgis/gl/programConfig",
    "com/huayun/webgis/gl/Program",
    "com/huayun/webgis/gl/ProgramSimplify",
    "../utils/utils",
    "../utils/Color",
    "../utils/TaskQueue",
    "com/huayun/webgis/gl/LineAtlas",
    "../data/GraphicsIndex",
    "../data/queryIntersects",
    "../gl/draw/drawBackground",
    "../utils/Resource",
    "../gl/Texture"
], function (topic, on, DeferredList, Promise, domConstruct, View, Viewpoint,
             Extent, Point, Polygon, MapPoint, GraphicLayer, PanHandler, TouchHandler, Context, ZoomHistory, VertexFragShader,
             programConfig, Program, ProgramSimplify, utils, Color, TaskQueue, LineAtlas, GraphicsIndex, queryIntersects,
             drawBackground, Resource, Texture) {
    /**
     * 场景View, 管理所有图层的LayerView, 负责与用户的交互, 如平移、缩放、旋转等操作, 并包含地理坐标和屏幕坐标转换方法
     * @constructor
     * @alias com.huayun.webgis.views.SceneView
     * @extends {View}
     * @param {Object} params 参数
     * @param {String} params.backgroundColor 背景色, 支持CSS格式
     * @param {number} params.pitch 地图倾角
     * @param {number} params.angle 地图旋转角度
     * @param {number} params.maxPitch 地图的最大倾角
     * @param {number} params.minLevel 地图的最小层级
     * @param {number} params.maxLevel 地图的最大层级
     * @param {number} params.rotateEnabled 地图能否旋转和倾斜
     * @param {number} params.is3DVision 是否是3D视角
     * @param {number} params.level 当前地图层级
     * @param {Array} params.center 当前地图的中心点
     * @property {number} width 地图容器的宽度, 单位px
     * @property {number} height 地图容器的高度, 单位px
     * @property {number} resolution 地图分辨率
     * @property {number} level 地图的层级
     * @property {number} scale 地图的比例尺
     * @property {Point} center 地图的中心点
     * @property {Viewpoint} viewpoint 地图视图
     * @property {Extent} extent 地图当前范围
     * @property {boolean} panEnabled 是否允许平移
     * @property {boolean} zoomEnabled 是否允许缩放
     * @property {boolean} rotateEnabled 是否旋转和倾斜
     * @property {Array<Function>} zoomEnd 缩放结束的钩子函数
     * @property {HTMLDivElement} domNode 地图在dom树上的根节点
     * @example
     * var view = new SceneView({
     *     container: container,
     *     map: map,
     *     level: 13,
     *     maxPitch: 85,
     *     maxLevel: 14,
     *     minLevel: 11,
     *     is3DVision: false,
     *     center: [511766.2805660013, 3350826.79176667]
     * });
     */
    var SceneView = function (params) {
        View.call(this, params);
        this._offsetLeft = this.container.getBoundingClientRect().left;
        this._offsetTop = this.container.getBoundingClientRect().top;
        this._clearBit = 0 | 16384 | 256 | 1024; // WebGL清除标志位
        this._nochanging = true;
        this._extentDirty = true;

        var backgroundColor = params.backgroundColor || "#FFFFFF";
        this.backgroundColor = Color.parse(backgroundColor);

        this.numSublayers = SceneView.maxUnderzooming + SceneView.maxOverzooming + 1;
        this.depthEpsilon = 1 / Math.pow(2, 16);
        this.currentLayer = 0;
        this.viewStates = []; // 视图数组
        this.backViewStates = [];
        this.viewStatesLength = 10;
        this._initState = null;
        this.antialias = !!params.antialias;

        var pitch = params.pitch ? params.pitch : params.is3DVision ? 50 : 0,
            angle = params.angle ? params.angle : 0,
            width = this.container.clientWidth,
            height = this.container.clientHeight;
        var maxPitch = params.maxPitch || 50;
        this._setupContainer(width, height);
        this._setupContext();
        this.viewpoint = new Viewpoint(width, height, pitch, angle, params.maxLevel, params.minLevel, maxPitch, this);


        // todo
        this._tileTextures = {};
        this.zoomHistory = new ZoomHistory();
        this.panEnabled = true;
        this.zoomEnabled = true;
        this.rotateEnabled = params.rotateEnabled === undefined ? true : params.rotateEnabled;
        this.selectEnabled = true;
        this.resizeEnabled = true;
        this.emptyProgramConfiguration = new programConfig.ProgramConfiguration();
        this.lineAtlas = new LineAtlas(256, 512);

        this._offsetLeft = this.container.getBoundingClientRect().left;
        this._offsetTop = this.container.getBoundingClientRect().top;
        this.graphicsIndex = new GraphicsIndex();

        var pan = new PanHandler(this); // 绑定拖动事件
        new TouchHandler(this);

        this._handleAddedLayer();
        this._handleEvent();

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

        var self = this;
        if (params.backgroundImage) {
            Resource.loadImage(params.backgroundImage, function (err, img) {
                if (img) {
                    var context = self.context;
                    var gl = context.gl;
                    self._backgroundTexture = new Texture(context, img, gl.RGBA, {useMipmap: true});
                    self._backgroundTexture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);
                    if (context.extTextureFilterAnisotropic) {
                        gl.texParameterf(gl.TEXTURE_2D, context.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, context.extTextureFilterAnisotropicMax);
                    }
                    self.threeRender();
                }
            })
        }

        // 缩放结束的钩子函数
        this.zoomEnd = [];


        this._renderTaskQueue = new TaskQueue();
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
        extent: {configurable: true},
        nearestResolution: {configurable: true},
        scale: {configurable: true}
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

    prototypeAccessors.scale.get = function () {
        return 0.0254000508001016 / (this.resolution * 96);
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
        return new Point(center[0], center[1], 0);
    };
    /*prototypeAccessors.center.set = function(center) {
        return this.view.center = center;
    };*/

    prototypeAccessors.is3DVision.get = function () {
        return this.viewpoint.pitch !== 0;
    };

    prototypeAccessors.extent.get = function () {
        if (this._extentDirty) {
            var bound = this._bound;
            if (this._bound) {
                var xmin = Math.min(bound[0].x, bound[1].x, bound[2].x, bound[3].x),
                    xmax = Math.max(bound[0].x, bound[1].x, bound[2].x, bound[3].x),
                    ymin = Math.min(bound[0].y, bound[1].y, bound[2].y, bound[3].y),
                    ymax = Math.max(bound[0].y, bound[1].y, bound[2].y, bound[3].y);
                this._extent = new Extent(xmin, ymin, xmax, ymax);
                this._extentDirty = false;
                return this._extent;
            } else {
                return null;
            }
        } else {
            return this._extent;
        }
    };

    // 设置地图容器, 创建WebGL的绘图容器Canvas
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

    // 创建WebGL的Context, 进行基础设置
    SceneView.prototype._setupContext = function () {
        var attr = {
            alpha: true,
            antialias: this.antialias,
            depth: true,
            failIfMajorPerformanceCaveat: false,
            preserveDrawingBuffer: false,
            stencil: true
        };
        this._gl = this._canvas.getContext('webgl', attr) || this._canvas.getContext('experimental-webgl', attr);
        // this._gl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a);
        // this._gl.clearColor(1.0, 1.0, 0.0, 1.0);
        this.context = new Context(this._gl);
    };

    // 为已加入地图中的图层创建LayerView
    SceneView.prototype._handleAddedLayer = function () {
        if (this.map.allLayers.length > 0) {
            var type = this.map.allLayers[0].type;
            if (!type || type.indexOf("Tile") < 0) {
                this._load = true;
            } else {
                var tileInfo = this.map.allLayers[0].tileInfo;
                if (tileInfo) { // 若第一个图层已加载元数据, 其作为地图的元数据
                    this.viewpoint.setTileInfo(tileInfo);
                    this._load = true;
                }
            }
            this.map.allLayers.forEach(function (item) {
                this.allLayerViews.push(item.createLayerView(this));
            }.bind(this));
        }
    };


    /**
     * 设置地图元数据
     */
    SceneView.prototype.setTileInfo = function () {
        var tileInfo = this.map.allLayers[0].tileInfo;
        if (!tileInfo) return;
        if (!this.viewpoint.tileInfo) { // 只取第一个图层的元数据
            this.viewpoint.setTileInfo(tileInfo);
            this._load = true;
            if (this.viewpoint.level || this.viewpoint.resolution) {
                this.setCenter(this.viewpoint.center, this.viewpoint.level, this.viewpoint.resolution);
            }
            topic.publish("mapLoadComplete");
        } else {
            this.setCenter(this.center);
        }
    }

    /**
     * 绑定View监听的事件
     * @ignore
     * @private
     */
    SceneView.prototype._handleEvent = function () {
        // 地图添加图层事件
        this.map.on("addLayers", function (layerArray, beforeLayerId, targetIndex) {
            var type = this.map.allLayers[0].type;
            if (!type || type.indexOf("Tile") < 0) { // 第一个图层不是切片类型时, 无需加载地图元数据
                this._load = true;
            } else {
                var tileInfo = this.map.allLayers[0].tileInfo;
                if (tileInfo) { // 若第一个图层已加载元数据, 其作为地图的元数据
                    this.viewpoint.setTileInfo(tileInfo);
                    this._load = true;
                }
            }
            for (var i = 0; i < layerArray.length; i++) {
                if (beforeLayerId) {
                    this.allLayerViews.splice(targetIndex, 0, layerArray[i].createLayerView(this));
                } else {
                    this.allLayerViews.push(layerArray[i].createLayerView(this));
                }
            }
        }.bind(this));

        this.map.on("removeLayers", function (layerIds) {
            for (var j = 0; j < layerIds.length; j++) {
                var layerId = layerIds[j];
                for (var i = this.allLayerViews.length - 1; i > -1; i--) {
                    if (this.allLayerViews[i].id === layerId) {
                        this.allLayerViews.splice(i, 1);
                        break;
                    }
                }
            }
        }.bind(this));

        // todo 待抽取
        on(this.domNode, "mousewheel", this._zoomMap.bind(this));
        on(window, "resize", this._onResize.bind(this));
        /*
        on(this.container, "click", this._onClick.bind(this));
        // on(this.container, "mousemove", this._onMouseMove.bind(this));
        on(window, "resize", this._onResize.bind(this));*/
    };

    /**
     * 地图容器大小改变, 调用以适配新的容器大小
     */
    SceneView.prototype._onResize = function () {
        if (this.resizeEnabled) {
            var width = this.container.clientWidth,
                height = this.container.clientHeight;
            if (width && height) {
                this.resizeEnabled = false;
                setTimeout(function () {
                    this.resizeEnabled = true;
                }.bind(this), 100);

                this._canvas.width = width;
                this._canvas.height = height;
                this._canvas.style.width = width + 'px';
                this._canvas.style.height = height + 'px';
                this.context.viewport.set([0, 0, this._canvas.width, this._canvas.height]);
                this.viewpoint.resize(width, height);
                this._offsetLeft = this.container.getBoundingClientRect().left;
                this._offsetTop = this.container.getBoundingClientRect().top;
                this.allLayerViews.forEach(function (item) {
                    item.resize();
                });
                this.refresh();
            }
        }
    };

    /**
     * 范围的扩大/缩小
     * @param factor  缩放倍数
     * @return
     *
     */
    SceneView.prototype.expand = function (factor) {
        // var dvalue = (1 - factor) / 2;
        // var newWidth = this.width * dvalue;
        // var newHeight = this.height * dvalue;
        // this._extentDirty = true;
        // return new Extent(this.extent.minx + newWidth,this.extent.miny + newHeight,this.extent.maxx - newWidth,this.extent.maxy - newHeight);
        var newWidth = this.width / 2 * factor * this.resolution,
            newHeight = this.height / 2 * factor * this.resolution;
        var newExtent = new Extent(
            this.center.x - newWidth,
            this.center.y - newHeight,
            this.center.x + newWidth,
            this.center.y + newHeight
        );
        this.setExtent(newExtent);
    }


    /**
     * 设置地图中心点和层级
     * @param {Array} center 二元数组, 中心点坐标
     * @param {number} level 地图层级, 可选
     * @param {number} resolution 地图分辨率, 可选
     * @example
     * sceneView.setCenter([511766, 3350826], 10)
     */
    SceneView.prototype.setCenter = function (center, level, resolution) {
        if (level) { // 根据层级设置
            var oldLevel = this.viewpoint.level;
            this.viewpoint.setLevel(level);
            this.viewpoint.setCenter(center);
            var newLevel = this.viewpoint.level;
            if (oldLevel !== newLevel) {
                topic.publish("changeLevel", {level: this.viewpoint.level});
            }
        } else if (resolution) {
            var oldLevel = this.viewpoint.level;
            this.viewpoint.setResolution(resolution, this._load);
            this.viewpoint.setCenter(center);
            var newLevel = this.viewpoint.level;
            if (oldLevel !== newLevel) {
                topic.publish("changeLevel", {level: this.viewpoint.level});
            }
        } else {
            this.viewpoint.setCenter(center);
        }
        this.refresh();
    };

    /**
     * 设置地图范围
     * @param {Extent} extent 地图范围
     */
    SceneView.prototype.setExtent = function (extent, callback) {
        if (extent instanceof Extent) {
            var center = extent.getCenter();
            var w = extent.getWidth(),
                h = extent.getHeight(),
                width = this.viewpoint.width,
                height = this.viewpoint.height;
            var oldLevel = this.viewpoint.level;
            this.viewpoint.setCenter([center.x, center.y]);
            this.viewpoint.setResolution(Math.max(w / width, h / height), true);
            this._extentDirty = true;
            var newLevel = this.viewpoint.level;
            if (oldLevel !== newLevel) {
                topic.publish("changeLevel", {level: this.viewpoint.level});
            }
            this.refresh(false, callback);
        }
    };

    /**
     * 获取地图范围
     * @return {Extent|null}
     */
    SceneView.prototype.getExtent = function () {
        if (this._extentDirty) {
            var bound = this._bound;
            if (this._bound) {
                var xmin = Math.min(bound[0].x, bound[1].x, bound[2].x, bound[3].x),
                    xmax = Math.max(bound[0].x, bound[1].x, bound[2].x, bound[3].x),
                    ymin = Math.min(bound[0].y, bound[1].y, bound[2].y, bound[3].y),
                    ymax = Math.max(bound[0].y, bound[1].y, bound[2].y, bound[3].y);
                this._extent = new Extent(xmin, ymin, xmax, ymax);
                this._extentDirty = false;
                return this._extent;
            } else {
                return null;
            }
        } else {
            return this._extent;
        }

    };

    /**
     * 设置视图
     * @param {Object} view 设置视图
     * @param {number} view.pitch 视图的倾角
     * @param {number} view.angle 视图的旋转角
     * @param {number} view.level 视图的层级
     * @param {Array} view.center 视图的中心点
     * @example
     * sceneView.setView({
     *     pitch: 0,
     *     angle: 0,
     *     level: 10,
     *     center: [511766, 3350826]
     * })
     */
    SceneView.prototype.setView = function (view) {
        var viewState;
        if (prev instanceof Object) {
            if (prev.level !== this.level) {
                topic.publish("changeLevel", {level: prev.level});
            }
            this.viewpoint.setView(prev);
            this.refresh(true);
        } else {
            if (prev && this.viewStates.length > 1) {
                this.backViewStates.push(this.viewStates.pop());
                viewState = this.viewStates[this.viewStates.length - 1];
                this.viewpoint.setView(viewState);
                this.refresh(true);
            } else if (!prev && this.backViewStates.length > 0) {
                this.viewStates.push(this.backViewStates.pop());
                viewState = this.viewStates[this.viewStates.length - 1];
                this.viewpoint.setView(viewState);
                this.refresh(true);
            }
        }
    };

    /**
     * 刷新地图
     */
    SceneView.prototype.refresh = function (noPushState, callback) {
        if (!this._load) {
            return;
        }
        if (this.viewpoint.matrixDirty) {
            var width = this.container.clientWidth,
                height = this.container.clientHeight;
            if (width === 0 || height === 0) {
                return;
            }
            this.viewpoint.resize(width, height);
            this.viewpoint.matrixDirty = false;
        }
        this.zoomHistory.update(this.viewpoint.level, utils.now());
        this.viewpoint.calcMatrix(true);
        this._bound = this.viewpoint.calcBounds();
        this._extentDirty = true;
        topic.publish("extentChangeEvent", this);
        if (!this._initState) {
            this._initState = {
                level: this.viewpoint.level,
                center: [this.viewpoint.center[0], this.viewpoint.center[1]],
                pitch: this.viewpoint.pitch,
                angle: this.viewpoint.angle
            }
        }
        if (!noPushState) {
            this.handlePushViewState();
        }
        // this.graphicsIndex.clear();
        this.allLayerViews.forEach(function (item) {
            item.refresh(callback);
        });
        this.threeRender();
    };

    SceneView.prototype.handlePushViewState = function () {
        // 保存最大不超过10个视图
        if (this.viewStates.length < this.viewStatesLength) {
            this.viewStates.push({
                pitch: this.viewpoint.pitch,
                angle: this.viewpoint.angle,
                level: this.viewpoint.targetZoom || this.viewpoint.level,
                center: this.viewpoint.center
            });
        } else {
            this.viewStates.shift();
            this.viewStates.push({
                pitch: this.viewpoint.pitch,
                angle: this.viewpoint.angle,
                level: this.viewpoint.targetZoom || this.viewpoint.level,
                center: this.viewpoint.center
            });
        }
        this.backViewStates = [];
    };

    SceneView.prototype.centerAt = function (x, y, level) {
        if (level && level !== this.viewpoint.level) {
            this.viewpoint.setLevel(level);
        }
        this.viewpoint.setCenter([x, y]);
        this.refresh();
    };

    /**
     * 设置地图的层级并刷新
     * @param {number} level 目标地图层级
     */
    SceneView.prototype.setLevel = function (level) {
        this.viewpoint.setLevel(level);
        this.viewpoint.calcMatrix(true);
        this.refresh();
    };

    /**
     * 根据LayerView的id获取对应的LayerView
     * @param {string} id - LayerView的id
     * @return {LayerView}
     */
    SceneView.prototype.findLayerViewById = function (id) {
        for (var i = this.allLayerViews.length - 1; i > -1; i--) {
            if (this.allLayerViews[i].id === id) {
                return this.allLayerViews[i];
            }
        }
    };

    /**
     * 屏幕坐标转化为地理坐标
     * @param {number} x 屏幕坐标x
     * @param {number} y 屏幕坐标y
     * @return {Point} 地理坐标
     */
    SceneView.prototype.screenToGeometry = function (x, y) {
        x = x - this._offsetLeft; // 修正屏幕坐标
        y = y - this._offsetTop;
        var p = this.viewpoint.screenToGeometry(x, y);
        return new Point(p.x, p.y, 0);
    };

    /**
     * 地理坐标转化为屏幕坐标
     * @param {number} x 地理坐标x
     * @param {number} y 地理坐标y
     * @return {Point} 屏幕坐标
     */
    SceneView.prototype.geometryToScreen = function (x, y) {
        var screen = this.viewpoint.geometryToScreen(x, y);
        x = screen.x + this._offsetLeft;
        y = screen.y + this._offsetTop;
        return new Point(x, y);
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

    SceneView.prototype.useProgram = function (name, programConfiguration, customDefine) {
        if (programConfiguration === void 0) programConfiguration = this.emptyProgramConfiguration;
        this.cache = this.cache || {};
        var key = "" + name + (programConfiguration.cacheKey || '');
        if (!this.cache[key]) {
            this.cache[key] = new Program(this.context, VertexFragShader[name], programConfiguration, VertexFragShader.programUniforms[name], customDefine);
        }
        return this.cache[key];
    };

    SceneView.prototype.useProgramSimplify = function (name, programConfiguration) {
        this.simplifyCache = this.simplifyCache || {};
        if (!this.simplifyCache[name]) {
            this.simplifyCache[name] = new ProgramSimplify(this.context, VertexFragShader[name], programConfiguration, VertexFragShader.programUniforms[name]);
        }
        return this.simplifyCache[name];
    };

    SceneView.prototype._drawBackgroundImage = function () {
        if (this._backgroundTexture && this.viewpoint.rasterBoundsBuffer) {
            drawBackground(this);
        }
    }

    Object.defineProperties(SceneView.prototype, prototypeAccessors);

    // 待抽取功能
    // todo
    // 滚动缩放
    SceneView.prototype._zoomMap = function (e) {
        if (e.wheelDelta > 0) {
            this.zoomInWheel(e.clientX, e.clientY);
        } else if (e.wheelDelta < 0) {
            this.zoomOutWheel(e.clientX, e.clientY);
        }
    };

    SceneView.prototype.zoomInWheel = function (x, y) {
        if (this.zoomEnabled) {
            if (this.viewpoint.level !== null && this.viewpoint.level < this.viewpoint.maxLevel) { // 有层级
                this.zoomEnabled = false;
                setTimeout(function () {
                    this.zoomEnabled = true;
                }.bind(this), 400);
                this.viewpoint.startZoom = this.viewpoint.level;
                this.viewpoint.targetZoom = this.viewpoint.level + 1;
                this.viewpoint.level = this.viewpoint.targetZoom;

                var aroundPoint = this.screenToGeometry(x, y);
                var center = this.viewpoint.center;
                this.deltaX = aroundPoint.x - center[0];
                this.deltaY = aroundPoint.y - center[1];
                this.viewpoint.readyMatrix(center[0] + this.deltaX / 2, center[1] + this.deltaY / 2, this.viewpoint.targetZoom);
                this._bound = this.viewpoint.calcBounds();
                this._extentDirty = true;
                topic.publish("changeLevel", {level: this.viewpoint.targetZoom});
                topic.publish("extentChangeEvent", this);
                this._handleZoomWheel(true);
            } else if (this.viewpoint.level === null) { // 无层级
                this.zoomEnabled = false;
                this.graphicsIndex.clear();
                setTimeout(function () {
                    this.zoomEnabled = true;
                }.bind(this), 400);

                this.viewpoint.targetResolution = this.viewpoint.resolution;
                var aroundPoint = this.screenToGeometry(x, y);
                var center = this.viewpoint.center;
                this.deltaX = aroundPoint.x - center[0];
                this.deltaY = aroundPoint.y - center[1];
                this.viewpoint.readyMatrix(center[0] + this.deltaX / 2, center[1] + this.deltaY / 2, null, null, this.viewpoint.resolution / 2);
                this._bound = this.viewpoint.calcBounds();
                this._extentDirty = true;
                topic.publish("extentChangeEvent", this);
                this._handleZoomWheel(true);
            }
        }
    };

    SceneView.prototype.zoomOutWheel = function (x, y) {
        if (this.zoomEnabled) {
            if (this.viewpoint.level !== null && this.viewpoint.level > this.viewpoint.minLevel) {
                this.zoomEnabled = false;
                setTimeout(function () {
                    this.zoomEnabled = true;
                }.bind(this), 400);
                this.viewpoint.startZoom = this.viewpoint.level;
                this.viewpoint.targetZoom = this.viewpoint.level - 1;
                this.viewpoint.level = this.viewpoint.targetZoom;
                var aroundPoint = this.screenToGeometry(x, y);
                var center = this.viewpoint.center;
                this.deltaX = aroundPoint.x - center[0];
                this.deltaY = aroundPoint.y - center[1];
                this.viewpoint.readyMatrix(center[0] - this.deltaX, center[1] - this.deltaY, this.viewpoint.targetZoom);
                this._bound = this.viewpoint.calcBounds();
                this._extentDirty = true;
                topic.publish("changeLevel", {level: this.viewpoint.targetZoom});
                topic.publish("extentChangeEvent", this);
                this._handleZoomWheel(false);
            } else if (this.viewpoint.level === null) {
                this.zoomEnabled = false;
                this.graphicsIndex.clear();
                setTimeout(function () {
                    this.zoomEnabled = true;
                }.bind(this), 400);
                this.viewpoint.targetResolution = this.viewpoint.resolution;
                var aroundPoint = this.screenToGeometry(x, y);
                var center = this.viewpoint.center;
                this.deltaX = aroundPoint.x - center[0];
                this.deltaY = aroundPoint.y - center[1];
                this.viewpoint.readyMatrix(center[0] + this.deltaX / 2, center[1] + this.deltaY / 2, null, null, this.viewpoint.resolution * 2);
                this._bound = this.viewpoint.calcBounds();
                this._extentDirty = true;
                topic.publish("extentChangeEvent", this);
                this._handleZoomWheel(false);
            }
        }
    };

    /**
     * 保持地图中心点不变放大
     */
    SceneView.prototype.zoomIn = function () {
        if (this.zoomEnabled && this.viewpoint.level < this.viewpoint.maxLevel) {
            this.zoomEnabled = false;
            setTimeout(function () {
                this.zoomEnabled = true;
            }.bind(this), 300);
            this.viewpoint.startZoom = this.viewpoint.level;
            this.viewpoint.targetZoom = this.viewpoint.level + 1;
            this.viewpoint.level = this.viewpoint.targetZoom;

            var center = this.viewpoint.center;
            this.viewpoint.readyMatrix(center[0], center[1], this.viewpoint.targetZoom);
            this._bound = this.viewpoint.calcBounds();
            this._extentDirty = true;
            topic.publish("extentChangeEvent", this);
            topic.publish("changeLevel", {level: this.viewpoint.targetZoom});
            this._handleZoom(true);
        }
    };
    /**
     * 保持地图中心点布标缩小
     */
    SceneView.prototype.zoomOut = function () {
        if (this.zoomEnabled && this.viewpoint.level > this.viewpoint.minLevel) {
            this.zoomEnabled = false;
            setTimeout(function () {
                this.zoomEnabled = true;
            }.bind(this), 300);
            this.viewpoint.startZoom = this.viewpoint.level;
            this.viewpoint.targetZoom = this.viewpoint.level - 1;
            this.viewpoint.level = this.viewpoint.targetZoom;

            var center = this.viewpoint.center;
            this.viewpoint.readyMatrix(center[0], center[1], this.viewpoint.targetZoom);
            this._bound = this.viewpoint.calcBounds();
            this._extentDirty = true;
            topic.publish("changeLevel", {level: this.viewpoint.targetZoom});
            topic.publish("extentChangeEvent", this);
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
            this._zoomWheelAnimateIn(null, this.viewpoint.level !== null);
        } else {
            this._zoomWheelAnimateOut(null, this.viewpoint.level !== null);
        }
    };

    SceneView.prototype._zoomWheelAnimateOut = function (start, hasLevel) {
        if (!start) start = performance.now();
        var delta = performance.now() - start;
        var center = this.viewpoint.center;
        if (delta >= 300) {
            window.cancelAnimationFrame(this._animateRaf);
            this._nochanging = true;
            this.viewpoint.setCenter([center[0] - this.deltaX, center[1] - this.deltaY]);
            if (hasLevel) {
                this.viewpoint.setLevel(this.viewpoint.targetZoom);
                this.viewpoint.targetZoom = null;
            } else {
                this.viewpoint.resolution = this.viewpoint.targetResolution * 2;
                this.viewpoint.targetResolution = null;
            }
            this.viewpoint.calcMatrix(true);
            this.handlePushViewState();
            this._renderRaf = null;
            this.callHooks("zoomEnd");
            this.threeRender();
        } else {
            var scale = delta / 300;
            var powScale;
            if (hasLevel) {
                powScale = 1 / Math.pow(2, -scale) - 1;
                this.viewpoint.updateMatrix(center[0] - this.deltaX * powScale, center[1] - this.deltaY * powScale, this.viewpoint.startZoom - scale);
            } else {
                powScale = scale;
                this.viewpoint.resolution = this.viewpoint.targetResolution * (1 + scale);
                this.viewpoint.updateMatrix(center[0] - this.deltaX * powScale, center[1] - this.deltaY * powScale, null, this.viewpoint.resolution);
            }
            this.animate();
            this._animateRaf = window.requestAnimationFrame(this._zoomWheelAnimateOut.bind(this, start, hasLevel));
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
            this.viewpoint.targetZoom = null;
            this.handlePushViewState();
            this._renderRaf = null;
            this.callHooks("zoomEnd");
            this.threeRender();
        } else {
            var scale = delta / 300;
            this.viewpoint.updateMatrix(center[0], center[1], this.viewpoint.startZoom - scale);
            this.animate();
            this._animateRaf = window.requestAnimationFrame(this._zoomAnimateOut.bind(this, start));
        }
    };

    SceneView.prototype._zoomWheelAnimateIn = function (start, hasLevel) {
        if (!start) start = performance.now();
        var delta = performance.now() - start;
        var center = this.viewpoint.center;
        if (delta >= 300) {
            window.cancelAnimationFrame(this._animateRaf);
            this._nochanging = true;
            this.viewpoint.setCenter([center[0] + this.deltaX / 2, center[1] + this.deltaY / 2]);
            if (hasLevel) {
                this.viewpoint.setLevel(this.viewpoint.targetZoom);
                this.viewpoint.targetZoom = null;
            } else {
                this.viewpoint.resolution = this.viewpoint.targetResolution / 2;
                this.viewpoint.targetResolution = null;
            }
            this.viewpoint.calcMatrix(true);
            this._renderRaf = null;
            this.callHooks("zoomEnd");
            this.handlePushViewState();
            this.threeRender();
        } else {
            var scale = delta / 300;
            var powScale;
            if (hasLevel) {
                powScale = 1 - 1 / Math.pow(2, scale);
                this.viewpoint.updateMatrix(center[0] + this.deltaX * powScale, center[1] + this.deltaY * powScale, this.viewpoint.startZoom + scale);
            } else {
                powScale = 1 - 1 / (1 + scale);
                this.viewpoint.resolution = this.viewpoint.targetResolution / (1 + scale);
                this.viewpoint.updateMatrix(center[0] + this.deltaX * powScale, center[1] + this.deltaY * powScale, null, this.viewpoint.resolution);
            }
            this.animate();
            this._animateRaf = window.requestAnimationFrame(this._zoomWheelAnimateIn.bind(this, start, hasLevel));
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
            this.viewpoint.targetZoom = null;
            this.handlePushViewState();
            this.callHooks("zoomEnd");
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

    /**
     * 平移地图
     * @param {number} x x方向平移的地理距离
     * @param {number} y y方向平移的地理距离
     */
    SceneView.prototype.pan = function (x, y) {
        var center = this.viewpoint.center;
        this.viewpoint.setCenter([center[0] + x, center[1] + y]);
        this.viewpoint.calcMatrix(true);
        this.zoomHistory.update(this.viewpoint.level, utils.now());
        this.viewpoint.calcMatrix(true);
        this._bound = this.viewpoint.calcBounds();
        this._extentDirty = true;
        this.allLayerViews.forEach(function (item) {
            item.refresh();
        });
        this.threeRender();
    };

    SceneView.prototype._mouseRotate = function (move) {
        if (this.rotateEnabled) {
            var angle = move / 1080 * 180;
            this.viewpoint.angle = (this.viewpoint.angle - angle) % 360;
            this.viewpoint.updateBaseMatrix();
            this.threeRender();
            topic.publish("mapRotateAngle", this.viewpoint.angle);
        }
    };

    SceneView.prototype._stopMouseRotate = function () {
        if (this.rotateEnabled) {
            this.refresh(true);
        }
    };

    /**
     * 旋转地图
     * @param {number} angle 旋转角度, 以度为单位
     */
    SceneView.prototype.rotateMap = function (angle) {
        if (this.rotateEnabled) {
            this.viewpoint.oldAngle = this.viewpoint.angle;
            this.viewpoint.angle = (this.viewpoint.angle + angle) % 360;
            this.viewpoint.deltaAngle = angle;
            topic.publish("mapRotateAngle", this.viewpoint.angle);
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
        if (delta >= 300) {
            window.cancelAnimationFrame(this._animateRaf);
            this._nochanging = true;
            this.viewpoint.angle = this.viewpoint.oldAngle + rad;
            this.viewpoint.updateBaseMatrix();
            this.handlePushViewState();
            this.threeRender();
        } else {
            this.viewpoint.angle = this.viewpoint.oldAngle + rad * delta / 300;
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

    /**
     * 设置2维视角还是3维视角
     * @param {number} d 2维还是3维
     */
    SceneView.prototype.setDimensions = function (d) {
        if (d === 2 && this.viewpoint.pitch !== 0) {
            this.viewpoint.oldPitch = this.viewpoint.pitch;
            this.viewpoint.pitch = 0;
            this.viewpoint.deltaPitch = this.viewpoint.pitch - this.viewpoint.oldPitch;
            topic.publish("mapSwitchDimension", 2);
            this.viewpoint.updateBaseMatrix();
            this._bound = this.viewpoint.calcBounds();
            this._extentDirty = true;
            this._handleSwitch2D();
        } else if (d === 3 && this.viewpoint.pitch !== 50) {
            this.viewpoint.oldPitch = this.viewpoint.pitch;
            this.viewpoint.pitch = 50;
            this.viewpoint.deltaPitch = this.viewpoint.pitch - this.viewpoint.oldPitch;
            topic.publish("mapSwitchDimension", 3);
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
                this._gl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a);
                this._gl.clear(this._clearBit);
                this.currentLayer = 0;
                this.context.setDefault();
                this._drawBackgroundImage();
                this.allLayerViews.forEach(function (item) {
                    item.zoom();
                });
            }.bind(this));
        }
    };

    SceneView.prototype.setCustomLayerDefaults = function () {
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

    SceneView.prototype.queryFeaturesByGeometry = function (geometry, queryPadding, callback) {
        var layers = this.map.allLayers;
        var promises = [];
        var result = {};
        var promiseLayer = [];
        layers.forEach(function (layer) {
            if (layer.selectEnabled) {
                var features = layer.queryFeaturesByGeometry(geometry, queryPadding);
                if (features instanceof Promise) { // 异步
                    promises.push(features);
                    promiseLayer.push(layer.id);
                } else {
                    result[layer.id] = features;
                }
            }
        });
        if (promises.length > 0) {
            new DeferredList(promises).then(function (resp) {
                resp.forEach(function (response, index) {
                    if (response[0]) {
                        result[promiseLayer[index]] = response[1].results;
                    }
                });
                if (callback) callback(result);
            });
        } else {
            if (callback) callback(result);
        }
    };

    SceneView.prototype.queryRenderFeaturesByGeometry = function (geometry, queryPadding, callback) {
        var layers = this.map.allLayers;
        var promises = [];
        var result = {};
        var promiseLayer = [];
        layers.forEach(function (layer) {
            if (layer.selectEnabled) {
                var features = layer.queryRenderFeaturesByGeometry(geometry, queryPadding);
                if (features instanceof Promise) { // 异步
                    promises.push(features);
                    promiseLayer.push(layer.id);
                } else {
                    result[layer.id] = features;
                }
            }
        });
        if (promises.length > 0) {
            new DeferredList(promises).then(function (resp) {
                resp.forEach(function (response, index) {
                    if (response[0]) {
                        result[promiseLayer[index]] = response[1].results;
                    }
                });
                if (callback) callback(result);
            });
        } else {
            if (callback) callback(result);
        }
    };

    /**
     * 地图绘制过程中添加任务
     * @param {Function} callback 任务
     */
    SceneView.prototype.addTask = function (callback) {
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

    /**
     * 地图复位, 回到初始化状态
     */
    SceneView.prototype.resetExtent = function () {
        if (this._initState) {
            this.viewpoint.setView(this._initState);
            this.refresh(true);
        }
    };

    SceneView.prototype.calcBounds = function (xmin, xmax, ymin, ymax) {
        return this.viewpoint.calcBound(xmin, xmax, ymin, ymax);
    };

    SceneView.prototype.callHooks = function (type) {
        var hooks = this[type];
        hooks.forEach(function (item) {
            item();
        });
    };

    SceneView.prototype.loadItem = function (items) {
        this.graphicsIndex.load(items);
    };

    SceneView.prototype.insertItems = function (items) {
        for (var i = 0, ii = items.length; i < ii; i++) {
            this.graphicsIndex.insert(items[i]);
        }
    };

    /**
     * 根据给定的形状, 查询当前形状内的图形
     * @param {Geometry} geometry 查询的形状, 支持点线面
     * @param {number} queryPadding 查询的容差
     * @return {Array} 查询到的图形
     */
    SceneView.prototype.queryGraphicsByGeometry = function (geometry, queryPadding) {
        queryPadding = queryPadding || 0;
        switch (geometry.type) {
            case "point":
                geometry = [geometry];
                break;
        }
        var obj = {};
        var items = this.graphicsIndex.query(geometry, queryPadding, this.resolution);
        var results = [];
        for (var i = 0, ii = items.length; i < ii; i++) {
            var item = items[i];
            if (!item.g.selectEnabled) { // 过滤文本等不可选中的图形
                continue;
            }
            if (item.hasOwnProperty('symbol')) { // 过滤空间检索的结果
                var g = item.g;
                var geo = g.feature.geometry;
                if (geo.type === "multipolygon") {
                    var polygons = geo.polygons;
                    for (var k = 0; k < polygons.length; k++) {
                        var polygon = polygons[k];
                        if (queryIntersects[item.symbol.type](geometry, polygon, item.symbol, this.resolution, g.feature.geometry.radius, this.viewpoint)) {
                            if (!obj.hasOwnProperty(item.id)) {
                                results.push(item.g);
                                obj[item.id] = true;
                            }
                            break;
                        }
                    }
                } else {
                    if (queryIntersects[item.symbol.type](geometry, item.g.feature.geometry, item.symbol, this.resolution, g.feature.geometry.radius, this.viewpoint)) {
                        if (!obj.hasOwnProperty(item.id)) {
                            results.push(item.g);
                            obj[item.id] = true;
                        }
                    }
                }
            } else {
                if (!obj.hasOwnProperty(item.id)) {
                    results.push(item.g);
                    obj[item.id] = true;
                }
            }
        }
        return results;
    };

    SceneView.prototype.queryGraphicByDevId = function (devId) {
        var graphicIsOk;
        for (var i = 0, ii = this.allLayerViews; i < ii.length; i++) {
            if (ii[i].layer.graphics.length > 0 && ii[i].graphicsLayerView.id !== "labelLayer") {
                for (var j = 0, jj = ii[i].layer.graphics; j < jj.length; j++) {
                    jj[j].feature.attributes.forEach(element => {
                        if (element.name === "dev_id") {
                            if (element.value === devId) {
                                graphicIsOk = jj[j];
                            }
                        }
                    });
                }
            }
        }
        if (graphicIsOk !== undefined) {
            return graphicIsOk;
        } else {
            return null;
        }
    }

    SceneView.prototype.queryGraphicSizeByPoint = function (point, computePolygon) {
        var items = this.graphicsIndex.query([point], 0, this.resolution);
        var xmin = Infinity,
            ymin = Infinity,
            xmax = -Infinity,
            ymax = -Infinity;
        var filterPolygon = !computePolygon;
        for (var i = 0, ii = items.length; i < ii; i++) {
            var item = items[i];
            if (item.symbol && filterPolygon) continue;
            if (item.minX < xmin) {
                xmin = item.minX;
            }
            if (item.minY < ymin) {
                ymin = item.minY;
            }
            if (item.maxX > xmax) {
                xmax = item.maxX;
            }
            if (item.maxY > ymax) {
                ymax = item.maxY;
            }
        }
        return {
            xmin: xmin,
            ymin: ymin,
            xmax: xmax,
            ymax: ymax,
            width: Math.abs(xmax - xmin),
            height: Math.abs(ymax - ymin)
        };
    };

    SceneView.prototype.checkExtentState = function (xmin, ymin, xmax, ymax, intersectLine) {
        if (intersectLine === undefined) intersectLine = true;
        var items = this.graphicsIndex.checkExtentState(xmin, ymin, xmax, ymax);
        /*for (var i = 0, ii = items.length; i < ii; i++) {
            var item = items[i];
            if (item.hasOwnProperty('symbol')) { // 过滤空间检索的结果
                var g = item.g;
                if (queryIntersects[item.symbol.type](new Point((xmin+xmax)/2, (ymin + ymax)/2), g.feature.geometry, item.symbol, this.resolution, g.feature.geometry.radius, this.viewpoint)) {
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;*/
        var polygon = [
            new Point(xmin, ymax),
            new Point(xmax, ymax),
            new Point(xmax, ymin),
            new Point(xmin, ymin),
        ];
        for (var i = 0, ii = items.length; i < ii; i++) {
            var item = items[i];
            if (!item.hasOwnProperty('symbol')) { // 过滤空间检索的结果
                return true;
            } else {
                var g = item.g;
                // 不与多边形的边界相交
                if (intersectLine && queryIntersects["line"](polygon, g.feature.geometry, item.symbol, this.resolution, g.feature.geometry.radius, this.viewpoint)) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * 清除地图中所有绘制内容
     */
    SceneView.prototype.clear = function () {
        this.graphicsIndex.clear();
        this.map.clear();
        this.allLayerViews = [];
        this.threeRender();
    }

    SceneView.prototype.setBackgroundColor = function (newColor) {
        this.backgroundColor = Color.parse(newColor);
        this.threeRender();
    }

    SceneView.prototype.destroy = function () {
        this.graphicsIndex.clear();
        this.map.clear();
        this.allLayerViews = [];
        domConstruct.destroy(this.domNode);
    }


    SceneView.prototype.requestRenderFrame = function (callback) {
        return this._renderTaskQueue.add(callback);
    }

    SceneView.prototype.cancelRenderFrame = function (id) {
        this._renderTaskQueue.remove(id);
    }

    /**
     * 渲染地图
     */
    SceneView.prototype.threeRender = function () {
        if (!this._renderRaf && this._nochanging && !this.viewpoint.matrixDirty) {
            this._renderRaf = requestAnimationFrame(function () {
                this._renderRaf = null;
                if (!this._nochanging) {
                    return;
                }
                this._renderTaskQueue.run(this);


                this._gl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a);
                this._gl.clear(this._clearBit);
                this.context.setDefault();

                this.currentLayer = 0;
                this.depthRangeFor3D = [0, 1 - ((1 + 2) * this.numSublayers * this.depthEpsilon)];
                this.allLayerViews.forEach(function (item) {
                    item._render();
                });
                this._drawBackgroundImage();
                if (this.allLayerViews.length > 0) {
                    if (this.allLayerViews[0]._fadeDirty) { // 静态切片透明度变化效果, 待改进
                        this.allLayerViews[0]._fadeDirty = false;
                        this.threeRender();
                    }
                }
            }.bind(this));
        }
    };

    SceneView.maxOverzooming = 10;
    SceneView.maxUnderzooming = 3;
    return SceneView;
});
