define("com/huayun/webgis/Viewpoint", [
    "dojo/topic",
    "./utils/utils",
    "./utils/Constant",
    "custom/gl-matrix-min",
    "./data/ArrayType",
    "./gl/SegmentVector"
], function (topic, utils, Constant, glMatrix, ArrayType, SegmentVector) {
    var calMaxPitch = 52;

    var Viewpoint = function (width, height, pitch, angle, maxLevel, minLevel, maxPitch, view) {
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.pitch = pitch;
        this.center = [0, 0];

        this.level = null;
        this.maxLevel = maxLevel || 15;
        this.minLevel = minLevel || 1;
        this.resolution = 0;
        this.tileInfo = null;
        this.scale = 1;

        this._fov = 0.6435011087932844; // 透视相机的角度, 定值
        this._posMatrixCache = {};      // 当前地图范围包含的每张切片的变换矩阵
        this.pixelsToGLUnits = [2 / width, -2 / height]; // 当前地图像素和WebGL单位的转换


        this._tilePixelRatio = 0.0625;  // 当前地图所使用切片的转换系数 ?
        this.view = view; // ?
        this.oldAngle = angle; // ?

        this.maxPitch = maxPitch;

        if (width === 0 || height === 0) {
            this.matrixDirty = true;
        }

        this.cameraToCenterDistance = 0.5 / Math.tan(this._fov / 2) * height; // 相机到场景中心的距离, 单位像素
        var halfFov = this._fov / 2,
            degreeToRad = Math.PI / 180,
            groundAngle = Math.PI / 2 + pitch * degreeToRad,    // 相机和场景中心连线与x平面(地面)的夹角
            topHalfSurfaceDistance = Math.sin(halfFov) * this.cameraToCenterDistance / Math.sin(Math.PI - groundAngle - halfFov),
            furthestDistance = Math.cos(Math.PI / 2 - pitch * degreeToRad) * topHalfSurfaceDistance + this.cameraToCenterDistance;
        // var farZ = furthestDistance * 1.01;
        var farZ = 10000;

        this._projectionMatrix = glMatrix.mat4.perspective(new Float64Array(16), this._fov, width / height, 1, farZ); // 投影矩阵

        var m = glMatrix.mat4.create();
        glMatrix.mat4.translate(m, m, [0, 0, -this.cameraToCenterDistance]);
        glMatrix.mat4.rotateX(m, m, -this.pitch * degreeToRad);
        glMatrix.mat4.rotateZ(m, m, -this.angle * degreeToRad);
        this._baseMatrix = m; // 基础的视图变换矩阵

        m = glMatrix.mat4.create();
        glMatrix.mat4.scale(m, m, [width / 2, -height / 2, 1]);
        glMatrix.mat4.translate(m, m, [1, -1, 0]);
        this.labelPlaneMatrix = m; // 标注变换矩阵

        m = glMatrix.mat4.create();
        glMatrix.mat4.scale(m, m, [1, -1, 1]);
        glMatrix.mat4.translate(m, m, [-1, -1, 0]);
        glMatrix.mat4.scale(m, m, [2 / width, 2 / height, 1]);
        this.glCoordMatrix = m; // WebGL坐标变换矩阵

        this.frogHeight = 0;

        var quadTriangleIndices = new ArrayType.StructArrayLayout3ui6();
        quadTriangleIndices.emplaceBack(0, 1, 2);
        quadTriangleIndices.emplaceBack(2, 1, 3);
        this.quadTriangleIndexBuffer = view.context.createIndexBuffer(quadTriangleIndices);
        this.rasterBoundsSegments = SegmentVector.simpleSegment(0, 0, 4, 2);
    };

    var prototypeAccessors = {
        zoom: {configurable: true}
    };

    prototypeAccessors.zoom.get = function () {
        return this.level;
    };
    prototypeAccessors.zoom.set = function (level) {
        return this.level = level;
    };

    Viewpoint.prototype.resize = function (width, height) {
        this.width = width;
        this.height = height;
        var pitch = this.pitch;
        this.pixelsToGLUnits = [2 / width, -2 / height]; // 当前地图像素和WebGL单位的转换
        this.cameraToCenterDistance = 0.5 / Math.tan(this._fov / 2) * height; // 相机到场景中心的距离, 单位像素
        var halfFov = this._fov / 2,
            degreeToRad = Math.PI / 180,
            groundAngle = Math.PI / 2 + pitch * degreeToRad,    // 相机和场景中心连线与x平面(地面)的夹角
            topHalfSurfaceDistance = Math.sin(halfFov) * this.cameraToCenterDistance / Math.sin(Math.PI - groundAngle - halfFov),
            furthestDistance = Math.cos(Math.PI / 2 - pitch * degreeToRad) * topHalfSurfaceDistance + this.cameraToCenterDistance;
        // var farZ = furthestDistance * 1.01;
        var farZ = 10000;
        this._projectionMatrix = glMatrix.mat4.perspective(new Float64Array(16), this._fov, width / height, 1, farZ); // 投影矩阵
        var m = glMatrix.mat4.create();
        glMatrix.mat4.translate(m, m, [0, 0, -this.cameraToCenterDistance]);
        glMatrix.mat4.rotateX(m, m, -this.pitch * degreeToRad);
        glMatrix.mat4.rotateZ(m, m, -this.angle * degreeToRad);
        this._baseMatrix = m; // 基础的视图变换矩阵

        m = glMatrix.mat4.create();
        glMatrix.mat4.scale(m, m, [width / 2, -height / 2, 1]);
        glMatrix.mat4.translate(m, m, [1, -1, 0]);
        this.labelPlaneMatrix = m; // 标注变换矩阵

        m = glMatrix.mat4.create();
        glMatrix.mat4.scale(m, m, [1, -1, 1]);
        glMatrix.mat4.translate(m, m, [-1, -1, 0]);
        glMatrix.mat4.scale(m, m, [2 / width, 2 / height, 1]);
        this.glCoordMatrix = m; // WebGL坐标变换矩阵
    };

    Viewpoint.prototype.setTileInfo = function (tileInfo) {
        this.tileInfo = tileInfo;
        this._tilePixelRatio = tileInfo.size / Constant.layout.EXTENT;
        this.zoomPixelRatio = (tileInfo.size + 1) / Constant.layout.EXTENT;
    };

    Viewpoint.prototype.readyMatrix = function (x, y, level, clearCache, resolution) {
        if (!resolution) {
            resolution = this.tileInfo.getResolution(level);
        }
        var m = glMatrix.mat4.scale(new Float64Array(16), this._baseMatrix, [1 / resolution, 1 / resolution, 1 / resolution]);
        m = glMatrix.mat4.translate(m, m, [-x, -y, 0]); // 视图中心平移, 矩阵变换

        this._viewMatrix = glMatrix.mat4.clone(m);

        this.matrix = glMatrix.mat4.multiply(m, this._projectionMatrix, m); // 生成综合变换矩阵, 将地理坐标转换为WebGL坐标, 最终通过WebGL转换为屏幕坐标
        this.pixelMatrix = glMatrix.mat4.multiply(new Float64Array(16), this.labelPlaneMatrix, this.matrix);
        this.pixelMatrixInverse = glMatrix.mat4.invert(new Float64Array(16), this.pixelMatrix);

        // 静态切片的特殊性, 为防止其模糊化, 需保证其最终转化出来的坐标不含小数, 矩阵需特殊处理.
        x = x / resolution;
        y = y / resolution;
        var xShift = (this.width % 2) / 2,
            yShift = (this.height % 2) / 2,
            angleCos = Math.cos(this.angle),
            angleSin = Math.sin(this.angle),
            dx = x - Math.round(x) + angleCos * xShift + angleSin * yShift,
            dy = y - Math.round(y) + angleCos * yShift + angleSin * xShift;
        var alignedM = new Float64Array(this.matrix);
        glMatrix.mat4.translate(alignedM, alignedM, [(dx > 0.5 ? dx - 1 : dx) * resolution, (dy > 0.5 ? dy - 1 : dy) * resolution, 0]);
        this.alignedProjMatrix = alignedM;

        if (clearCache) {
            this._posMatrixCache = {};
            this._alignedPosMatrixCache = {};
        }
    };

    Viewpoint.prototype.calcMatrix = function (clearCache) {
        var x = this.center[0],
            y = this.center[1],
            resolution = this.resolution;
        var m = glMatrix.mat4.scale(new Float64Array(16), this._baseMatrix, [1 / resolution, 1 / resolution, 1 / resolution]);
        m = glMatrix.mat4.translate(m, m, [-x, -y, 0]); // 视图中心平移, 矩阵变换

        this._viewMatrix = glMatrix.mat4.clone(m);

        this.matrix = glMatrix.mat4.multiply(m, this._projectionMatrix, m); // 生成综合变换矩阵, 将地理坐标转换为WebGL坐标, 最终通过WebGL转换为屏幕坐标
        this.pixelMatrix = glMatrix.mat4.multiply(new Float64Array(16), this.labelPlaneMatrix, this.matrix);
        this.pixelMatrixInverse = glMatrix.mat4.invert(new Float64Array(16), this.pixelMatrix);

        m = glMatrix.mat4.set(new Float32Array(16),
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, 0, 1);
        glMatrix.mat4.multiply(m, this.matrix, m);
        this.centerMatrix = m;

        // 静态切片的特殊性, 为防止其模糊化, 需保证其最终转化出来的坐标不含小数, 矩阵需特殊处理.
        x = x / resolution;
        y = y / resolution;
        var xShift = (this.width % 2) / 2,
            yShift = (this.height % 2) / 2,
            angleCos = Math.cos(this.angle),
            angleSin = Math.sin(this.angle),
            dx = x - Math.round(x) + angleCos * xShift + angleSin * yShift,
            dy = y - Math.round(y) + angleCos * yShift + angleSin * xShift;
        var alignedM = new Float64Array(this.matrix);
        glMatrix.mat4.translate(alignedM, alignedM, [(dx > 0.5 ? dx - 1 : dx) * resolution, (dy > 0.5 ? dy - 1 : dy) * resolution, 0]);
        this.alignedProjMatrix = alignedM;

        if (clearCache) {
            this._posMatrixCache = {};
            this._alignedPosMatrixCache = {};
        }
        topic.publish("frameUpdate");
    };

    Viewpoint.prototype.setView = function (view) {
        this.pitch = view.pitch;
        this.angle = view.angle;
        this.setLevel(view.level);
        this.setCenter([view.center[0], view.center[1]]);
        var m = glMatrix.mat4.create();
        glMatrix.mat4.translate(m, m, [0, 0, -this.cameraToCenterDistance]);
        glMatrix.mat4.rotateX(m, m, -this.pitch / 180 * Math.PI);
        glMatrix.mat4.rotateZ(m, m, -this.angle / 180 * Math.PI);
        this._baseMatrix = m;
        // this.calcMatrix(true);
    };

    Viewpoint.prototype.updateBaseMatrix = function () {
        var m = glMatrix.mat4.create();
        glMatrix.mat4.translate(m, m, [0, 0, -this.cameraToCenterDistance]);
        glMatrix.mat4.rotateX(m, m, -this.pitch / 180 * Math.PI);
        glMatrix.mat4.rotateZ(m, m, -this.angle / 180 * Math.PI);
        this._baseMatrix = m;
        this.calcMatrix(true);
    };

    Viewpoint.prototype.updateMatrix = function (x, y, level, resolution) {
        if (level) {
            this.setLevel(level);
            resolution = this.resolution;
        }
        var m = glMatrix.mat4.scale(new Float64Array(16), this._baseMatrix, [1 / resolution, 1 / resolution, 1 / resolution]);
        m = glMatrix.mat4.translate(m, m, [-x, -y, 0]); // 视图中心平移, 矩阵变换

        this._viewMatrix = glMatrix.mat4.clone(m);

        this.matrix = glMatrix.mat4.multiply(m, this._projectionMatrix, m); // 生成综合变换矩阵, 将地理坐标转换为WebGL坐标, 最终通过WebGL转换为屏幕坐标
        this.pixelMatrix = glMatrix.mat4.multiply(new Float64Array(16), this.labelPlaneMatrix, this.matrix);
        this.pixelMatrixInverse = glMatrix.mat4.invert(new Float64Array(16), this.pixelMatrix);

        // 静态切片的特殊性, 为防止其模糊化, 需保证其最终转化出来的坐标不含小数, 矩阵需特殊处理.
        x = x / resolution;
        y = y / resolution;
        var xShift = (this.width % 2) / 2,
            yShift = (this.height % 2) / 2,
            angleCos = Math.cos(this.angle),
            angleSin = Math.sin(this.angle),
            dx = x - Math.round(x) + angleCos * xShift + angleSin * yShift,
            dy = y - Math.round(y) + angleCos * yShift + angleSin * xShift;
        var alignedM = new Float64Array(this.matrix);
        glMatrix.mat4.translate(alignedM, alignedM, [(dx > 0.5 ? dx - 1 : dx) * resolution, (dy > 0.5 ? dy - 1 : dy) * resolution, 0]);
        this.alignedProjMatrix = alignedM;

        this._posMatrixCache = {};
        this._alignedPosMatrixCache = {};

        topic.publish("frameUpdate");
    };

    Viewpoint.prototype.updatePitch = function (deltaPitch) {
        var oldPitch = this.pitch;
        this.pitch += deltaPitch;
        this.pitch = this.pitch < 0 ? 0 : this.pitch > this.maxPitch ? this.maxPitch : this.pitch; // 倾斜程度不能大于50, 不能小于0
        if (oldPitch === 0 && this.pitch > 0) {
            topic.publish("mapSwitchDimension", 3);
        }
        if (oldPitch > 0 && this.pitch === 0) {
            topic.publish("mapSwitchDimension", 2);
        }

        var m = glMatrix.mat4.create();
        glMatrix.mat4.translate(m, m, [0, 0, -this.cameraToCenterDistance]);
        glMatrix.mat4.rotateX(m, m, -this.pitch / 180 * Math.PI);
        glMatrix.mat4.rotateZ(m, m, -this.angle / 180 * Math.PI);
        this._baseMatrix = m;
        this.calcMatrix(true);
    };

    Viewpoint.prototype.screenToGeometry = function (x, y) {
        var targetZ = 0;
        var coord0 = [x, y, 0, 1];
        var coord1 = [x, y, 1, 1];
        glMatrix.vec4.transformMat4(coord0, coord0, this.pixelMatrixInverse);
        glMatrix.vec4.transformMat4(coord1, coord1, this.pixelMatrixInverse);
        var w0 = coord0[3];
        var w1 = coord1[3];
        var x0 = coord0[0] / w0;
        var x1 = coord1[0] / w1;
        var y0 = coord0[1] / w0;
        var y1 = coord1[1] / w1;
        var z0 = coord0[2] / w0;
        var z1 = coord1[2] / w1;
        var t = z0 === z1 ? 0 : (targetZ - z0) / (z1 - z0);
        return {
            x: utils.number(x0, x1, t),
            y: utils.number(y0, y1, t),
            z: 0
        }
    };

    Viewpoint.prototype.geometryToScreen = function (x, y) {
        var coord = [x, y, 0, 1];
        glMatrix.vec4.transformMat4(coord, coord, this.pixelMatrix);
        var w = coord[3],
            a = coord[0] / w,
            b = coord[1] / w;
        return {
            x: Math.round(a),
            y: Math.round(b)
        };
    };

    Viewpoint.prototype.calcBounds = function () {
        if (this.pitch < calMaxPitch) {
            this.rasterBoundsBuffer = null;
            return [
                this.screenToGeometry(0, 0),
                this.screenToGeometry(this.width, 0),
                this.screenToGeometry(this.width, this.height),
                this.screenToGeometry(0, this.height)
            ]
        } else {
            var ratio = calMaxPitch / this.pitch;
            var sh = (1 - ratio) * this.height;
            ratio -= 0.2;
            var rasterBoundsArray = new ArrayType.StructArrayLayout4f16();
            rasterBoundsArray.emplaceBack(-1, 2 * ratio - 1, 0, 1);
            rasterBoundsArray.emplaceBack(1, 2 * ratio - 1, 1, 1);
            rasterBoundsArray.emplaceBack(-1, 1, 0, ratio/2);
            rasterBoundsArray.emplaceBack(1, 1, 1, ratio/2);
            this.rasterBoundsBuffer = this.view.context.createVertexBuffer(rasterBoundsArray, [
                {name: "a_pos", type: "Float32", components: 4, offset: 0}
            ]);

            return [
                this.screenToGeometry(0, sh),
                this.screenToGeometry(this.width, sh),
                this.screenToGeometry(this.width, this.height),
                this.screenToGeometry(0, this.height)
            ]
        }
    };

    Viewpoint.prototype.calcBound = function (xmin, xmax, ymin, ymax) {
        return [
            this.screenToGeometry(xmin, ymin),
            this.screenToGeometry(xmax, ymin),
            this.screenToGeometry(xmax, ymax),
            this.screenToGeometry(xmin, ymax)
        ]
    };

    Viewpoint.prototype.calculatePosMatrix = function (unwrappedTileID, geometry, aligned) {
        var posMatrixKey = unwrappedTileID.key;
        var cache = aligned ? this._alignedPosMatrixCache : this._posMatrixCache;
        if (cache[posMatrixKey]) {
            return cache[posMatrixKey];
        }

        var canonical = unwrappedTileID.canonical;
        var scale = Math.pow(2, this.level - canonical.z);
        var resolution = this.tileInfo.getResolution(this.level);
        var x = geometry[0],
            y = geometry[1];
        if (aligned) {
            x = Math.round(x / resolution);
            y = Math.round(y / resolution);
            x = x * resolution;
            y = y * resolution; // 保证转换后的切片的坐标是整数, 否则切片模糊化.
        }
        // 切片的最终变换矩阵
        var mMatrix = glMatrix.mat4.set(new Float64Array(16),
            this._tilePixelRatio * resolution, 0, 0, 0,
            0, -this._tilePixelRatio * resolution, 0, 0,
            0, 0, 1, 0,
            x, y, 0, 1);
        glMatrix.mat4.multiply(mMatrix, aligned ? this.alignedProjMatrix : this.matrix, mMatrix);
        glMatrix.mat4.scale(mMatrix, mMatrix, [scale, scale, 1]);
        cache[posMatrixKey] = new Float32Array(mMatrix);
        return cache[posMatrixKey];
    };

    Viewpoint.prototype.getMatrixForPoint = function (x, y, aligned, flip, z) {
        z = z ? z : 0;
        var resolution = this.resolution;
        flip = flip ? -1 : 1;
        if (aligned) {
            x = Math.round(x / resolution);
            y = Math.round(y / resolution);
            x = x * resolution;
            y = y * resolution; // 保证转换后的切片的坐标是整数, 否则切片模糊化.
        }
        // new Float32Array(16),
        var mMatrix = glMatrix.mat4.set(new Float64Array(16),
            1, 0, 0, 0,
            0, flip, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1);
        glMatrix.mat4.multiply(mMatrix, aligned ? this.alignedProjMatrix : this.matrix, mMatrix);
        mMatrix = new Float32Array(mMatrix);
        return mMatrix;
    };

    Viewpoint.prototype.getModelViewMatrix = function (x, y) {

    };

    Viewpoint.prototype.getMatrixForModel = function (x, y, aligned, flip) {
        var resolution = this.resolution;
        flip = flip ? -1 : 1;
        if (aligned) {
            x = Math.round(x / resolution);
            y = Math.round(y / resolution);
            x = x * resolution;
            y = y * resolution; // 保证转换后的切片的坐标是整数, 否则切片模糊化.
        }
        var mMatrix = glMatrix.mat4.set(new Float32Array(16),
            resolution, 0, 0, 0,
            0, flip * resolution, 0, 0,
            0, 0, resolution, 0,
            x, y, 0, 1);
        glMatrix.mat4.multiply(mMatrix, aligned ? this.alignedProjMatrix : this.matrix, mMatrix);
        return mMatrix;
    };

    Viewpoint.prototype.updatePosMatrix = function (unwrappedTileID, geometry, aligned) {
        var posMatrixKey = unwrappedTileID.key;
        var cache = aligned ? this._alignedPosMatrixCache : this._posMatrixCache;
        if (cache[posMatrixKey]) {
            return cache[posMatrixKey];
        }

        var canonical = unwrappedTileID.canonical;
        var scale = Math.pow(2, this.level - canonical.z);
        var resolution = this.tileInfo.getResolution(this.level);
        var x = geometry[0],
            y = geometry[1];
        if (aligned) {
            x = Math.round(x / resolution);
            y = Math.round(y / resolution);
            x = x * resolution;
            y = y * resolution; // 保证转换后的切片的坐标是整数, 否则切片模糊化.
        }
        // 切片的最终变换矩阵
        var mMatrix = glMatrix.mat4.set(new Float64Array(16),
            this.zoomPixelRatio * resolution, 0, 0, 0,
            0, -this.zoomPixelRatio * resolution, 0, 0,
            0, 0, 1, 0,
            x, y, 0, 1);
        glMatrix.mat4.multiply(mMatrix, aligned ? this.alignedProjMatrix : this.matrix, mMatrix);
        glMatrix.mat4.scale(mMatrix, mMatrix, [scale, scale, 1]);
        cache[posMatrixKey] = new Float32Array(mMatrix);
        return cache[posMatrixKey];
    };

    Viewpoint.prototype.setLevel = function (level) {
        if (level < this.minLevel) {
            level = this.minLevel;
        }
        if (level > this.maxLevel) {
            level = this.maxLevel;
        }
        this.level = level;
        if (this.tileInfo) {
            this.resolution = this.tileInfo.getResolution(level);
        }
    };

    Viewpoint.prototype.setResolution = function (resolution, round) {
        if (this.tileInfo) {
            if (round) {
                var res = this.tileInfo.findNestZoom(resolution);
                this.resolution = res.resolution;
                this.level = res.level;
            } else {
                this.resolution = resolution;
                this.level = this.tileInfo.getLevel(resolution);
            }
        } else {
            this.resolution = resolution;
        }
    };

    Viewpoint.prototype.getResolution = function (level) {
        return this.tileInfo.getResolution(level);
    };

    Viewpoint.prototype.setCenter = function (center) {
        if (center instanceof Array) {
            this.center = center;
        } else if (center.x && center.y) {
            this.center = [center.x, center.y];
        }
    };

    Viewpoint.prototype.coveringZoomLevel = function (options) {
        return (options.roundZoom ? Math.round : Math.floor)(
            this.level
        );
    };

    // Viewpoint.prototype.zoomScale = function (level) {
    //     return Math.pow(2, level);
    // };
    //
    // /**
    //  * 设置地图的中心点
    //  * @param {Point} center 地图目标中心点
    //  * @param {number} resolution 地图分辨率
    //  */
    // Viewpoint.prototype.setLocationAtPoint = function (center, resolution) {
    //     this.calcMatrix(center.x / resolution, center.y / resolution, resolution, true);
    // };
    //

    //
    Viewpoint.prototype.maxPitchScaleFactor = function () {
        if (!this.pixelMatrixInverse) {
            return 1;
        }

        var coord = this.screenToGeometry(0, 0);
        var p = [coord.x, coord.y, 0, 1];
        var topPoint = glMatrix.vec4.transformMat4(p, p, this.pixelMatrix);
        return topPoint[3] / this.cameraToCenterDistance;
    };

    Object.defineProperties(Viewpoint.prototype, prototypeAccessors);
    return Viewpoint;
});
