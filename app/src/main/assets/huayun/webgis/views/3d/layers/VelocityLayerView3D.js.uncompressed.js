define("com/huayun/webgis/views/3d/layers/VelocityLayerView3D", [
    "./LayerView3D",
    "../../../gl/draw",
    "../../../gl/Texture",
    "../../../gl/SegmentVector",
    "../../../geometry/Extent",
    "com/huayun/webgis/data/ArrayType",
    "com/huayun/webgis/utils/Constant"
], function (LayerView3D, draw, Texture, SegmentVector, Extent, ArrayType, Constant) {
    var VelocityLayerView3D = function (params) {
        LayerView3D.call(this, params);
        this.id = params.id === undefined ? "velocity" : params.id;
        this.opacity = params.opacity === undefined ? 1 : params.opacity;
        this.visible = params.visible === undefined ? true : params.visible;
        this.layer = params.layer;
        this.view = params.view;

        this._vscale = 0.005;
        this.NULL_WIND_VECTOR = [NaN, NaN, null]; //没有风的情况
        this._defaultColorScale = ["rgb(36,104, 180)", "rgb(60,157, 194)", "rgb(128,205,193 )", "rgb(151,218,168 )", "rgb(198,231,181)", "rgb(238,247,217)", "rgb(255,238,159)", "rgb(252,217,125)", "rgb(255,182,100)", "rgb(252,150,75)", "rgb(250,112,52)", "rgb(245,64,32)", "rgb(237,45,28)", "rgb(220,24,32)", "rgb(180,0,35)"];
        this._colorScale = params.colorScale || this._defaultColorScale;

        this._grid = []; //定义网格数组
        this.MIN_VELOCITY_INTENSITY = params.minVeclocity || 0; //最小风速
        this.MAX_VELOCITY_INTENSITY = params.maxVeclocity || 10; //最大风速
        this.PARTICLE_MULTIPLIER = 1 / 300; //粒子数量参数，默认1/300，可以根据实际调
        this.MAX_PARTICLE_AGE = params.particleAge || 90;       //粒子的生命周期
        this.PARTICLE_LINE_WIDTH = params.lineWidth || 1;

        this._canvas = document.createElement("canvas");
        this._canvas.id = "velocity";
        this._canvas.width = this.view.width;
        this._canvas.height = this.view.height;
        this._ctx = this._canvas.getContext("2d");

        this.colorStyles = this.windIntensityColorScale(this.MIN_VELOCITY_INTENSITY, this.MAX_VELOCITY_INTENSITY);
        this.buckets = this.colorStyles.map(function () {
            return [];
        });
        this.extent = new Extent(0, 0, 0, 0);

        var NULL_WIND_VECTOR = this.NULL_WIND_VECTOR;

        function field(x, y, columns) {
            var column = columns[Math.round(x)];
            return column && column[Math.round(y)] || NULL_WIND_VECTOR;
        }

        field.randomize = function (o, bounds, columns) {
            var x, y;
            var safetyNet = 0;
            do {
                x = Math.round(Math.floor(Math.random() * bounds.width) + bounds.x);
                y = Math.round(Math.floor(Math.random() * bounds.height) + bounds.y);
            } while (field.call(this, x, y, columns)[2] === null && safetyNet++ < 30);
            o.x = x;
            o.y = y;
            return o;
        };
        this.field = field;

        this.FRAME_RATE = 15; //定义每秒执行的次数
        this.FRAME_TIME = 1000 / this.FRAME_RATE;

        var quadTriangleIndices = new ArrayType.StructArrayLayout3ui6();
        quadTriangleIndices.emplaceBack(0, 1, 2);
        quadTriangleIndices.emplaceBack(2, 1, 3);
        this.quadTriangleIndexBuffer = this.view.context.createIndexBuffer(quadTriangleIndices);
        this.viewportSegments = SegmentVector.simpleSegment(0, 0, 4, 2);

        var obj = this;
        this.intervalFlag = setInterval(function () {
            obj.repaint();
        }, this.FRAME_TIME);

    };
    if (LayerView3D) VelocityLayerView3D.__proto__ = LayerView3D;
    VelocityLayerView3D.prototype = Object.create(LayerView3D && LayerView3D.prototype);
    VelocityLayerView3D.prototype.constructor = VelocityLayerView3D;


    VelocityLayerView3D.prototype.setVisible = function (visible) {
        this.visible = visible;
        if (visible) { // 可见
            var obj = this;
            this.extent = new Extent(0, 0, 0, 0);
            this.intervalFlag = setInterval(function () {
                obj.repaint();
            }, this.FRAME_TIME);
        } else { // 不可见
            this.stop();
        }
        this.view.threeRender();
    };

    VelocityLayerView3D.prototype._interpolateColumn = function (x, y, yMax, projection, velocityScale, extent) {
        var column = [];
        for (; y <= yMax; y += 2) {
            var coord = this._invert(x, y, extent); // 屏幕坐标转地理坐标
            if (coord) {
                var lo = coord[0], //经度
                    la = coord[1]; //纬度
                if (isFinite(lo)) {
                    var wind = this.layer.interpolateGrid.interpolate.call(this.layer, lo, la); // 计算地理坐标为(lo, la)处的风场数据
                    //每一个格点的uv和风速大小
                    if (wind) {
                        wind = this._distort(projection, lo, la, x, y, velocityScale, wind, extent);
                        //wind 表示粒子x方向的像素速度，y方向上的像素速度和风速
                        column[y + 1] = column[y] = wind;
                    }
                }
            }
        }
        return column;
    };

    VelocityLayerView3D.prototype._distort = function (projection, lo, la, x, y, scale, wind, windy) {
        //projection是一个空的对象
        // λ, φ格点的经纬度
        //x, y格点所在的像素点
        //格点的风向风速
        //windy
        //scale 一个参数，每次粒子运动的距离
        var u = wind[0] * scale;
        var v = wind[1] * scale;
        var d = this._distortion(projection, lo, la, x, y, windy);

        // Scale distortion vectors by u and v, then add.
        wind[0] = d[0] * u + d[2] * v;
        wind[1] = d[1] * u + d[3] * v;
        return wind;
    };

    VelocityLayerView3D.prototype._distortion = function (projection, λ, φ, x, y, windy) {
        var H = this.view.resolution;
        var hλ = λ < 0 ? H : -H;
        var hφ = φ < 0 ? H : -H;

        var pλ = this._getProject(φ, λ + hλ, windy);
        var pφ = this._getProject(φ + hφ, λ, windy);

        return [(pλ[0] - x) / hλ, (pλ[1] - y) / hλ, (pφ[0] - x) / hφ, (pφ[1] - y) / hφ];
    };

    VelocityLayerView3D.prototype._getProject = function (lat, lon, windy) {
        var ymin = windy.south;
        var ymax = windy.north;
        var xFactor = windy.width / (windy.east - windy.west);
        var yFactor = windy.height / (ymax - ymin);

        var y = lat;
        var x = (lon - windy.west) * xFactor;
        y = (ymax - y) * yFactor; // y points south
        return [x, y];
    };

    VelocityLayerView3D.prototype._invert = function (x, y, windy) {
        var r = this.view.resolution;
        var lon = windy.west + x * r,
            lat = windy.north - y * r;
        return [lon, lat];
    };

    VelocityLayerView3D.prototype.refresh = function () {
        this._readyData();
        this.view.threeRender();
    };
    VelocityLayerView3D.prototype._readyData = function () {
    };

    VelocityLayerView3D.prototype._render = function () {
        if (this.visible && this.layer.data) {
            var extent = this.view.extent;
            var zoom = this.view.viewpoint.level;
            var context = this.view.context;
            var gl = context.gl;
            if (!this.extent.equals(extent)) { // 范围改变, 重新计算界面需要绘制的点
                this.extent = extent;
                var width = this.view.width,
                    height = this.view.height;
                var minx = extent.minx,
                    miny = extent.miny,
                    maxx = extent.maxx,
                    maxy = extent.maxy;
                var mapBounds = {
                    south: miny, // 左下纬度
                    north: maxy, // 右上纬度
                    east: maxx, // 右上经度
                    west: minx, // 左下经度
                    width: width,
                    height: height
                };

                var upperLeft = [0, 0];  //左上 [0,0]
                var lowerRight = [width, height]; //右下 [1920,970]
                var x = Math.round(upperLeft[0]);
                var y = Math.max(Math.floor(upperLeft[1], 0), 0);
                var xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1);
                var yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);

                var bounds = {
                    x: x,
                    y: y,
                    xMax: width,
                    yMax: yMax,
                    width: width,
                    height: height
                };
                this.bounds = bounds;

                var projection = {};
                var mapArea = (mapBounds.south - mapBounds.north) * (mapBounds.west - mapBounds.east);
                var velocityScale = this._vscale * Math.pow(mapArea, 0.4);

                var columns = [];
                // 根据当前地理范围构建一个2*2px的网格
                while (x < xMax) {
                    columns[x + 1] = columns[x] = this._interpolateColumn(x, y, yMax, projection, velocityScale, mapBounds);
                    x += 2;
                }
                this.columns = columns;
                var particleCount = Math.round(bounds.width * bounds.height * this.PARTICLE_MULTIPLIER); // 绘制的粒子数
                var fadeFillStyle = "rgba(0, 0, 0, 0.97)";
                var particles = [];
                // 创建待绘制粒子的坐标和age
                for (var i = 0; i < particleCount; i++) {
                    particles.push(this.field.randomize.call(this, {
                        age: Math.floor(Math.random() * this.MAX_PARTICLE_AGE)
                    }, bounds, columns));
                }
                this.particles = particles;
                this._ctx.lineWidth = this.PARTICLE_LINE_WIDTH;
                this._ctx.fillStyle = fadeFillStyle;
                this._ctx.globalAlpha = 0.6;
                this._drawCanvas(bounds, columns, this.buckets, this.particles);
                if (this.texture) {
                    this.texture.update(this._canvas, {useMipmap: true});
                } else {
                    this.texture = new Texture(context, this._canvas, gl.RGBA, {useMipmap: true});
                    this.texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);
                    if (context.extTextureFilterAnisotropic) {
                        gl.texParameterf(gl.TEXTURE_2D, context.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, context.extTextureFilterAnisotropicMax);
                    }
                }
            }
            this.texture.zoom = zoom;
            this._drawLayer();
        }
    };

    VelocityLayerView3D.prototype.repaint = function () {
        if (!this.particles) return;
        this._drawCanvas(this.bounds, this.columns, this.buckets, this.particles);
        this.texture.update(this._canvas, {useMipmap: true});
        this.view.threeRender();
    };

    VelocityLayerView3D.prototype.windIntensityColorScale = function (min, max) {
        this._colorScale.indexFor = function (m) {
            return Math.max(0, Math.min(this._colorScale.length - 1, Math.round((m - min) / (max - min) * (this._colorScale.length - 1))));
        }.bind(this);
        return this._colorScale;
    };

    VelocityLayerView3D.prototype._drawCanvas = function (bounds, columns, buckets, particles) {
        buckets.forEach(function (bucket) { // 清空之前数据
            bucket.length = 0;
        });
        particles.forEach(function (particle) {
            if (particle.age > this.MAX_PARTICLE_AGE) {
                this.field.randomize.call(this, particle, bounds, columns).age = 0;
            }
            var x = particle.x;
            var y = particle.y;
            var v = this.field.call(this, x, y, columns); // 获取屏幕坐标是(x,y)处的风场数据

            var m = v[2];
            if (m === null) {
                particle.age = this.MAX_PARTICLE_AGE;
            } else {
                var xt = x + v[0]; // 水平方向风速
                var yt = y + v[1]; // 竖直方向风速

                if (this.field.call(this, xt, yt, columns)[2] !== null) {
                    particle.xt = xt;
                    particle.yt = yt;
                    buckets[this.colorStyles.indexFor(m)].push(particle); // 根据实际风速确定待绘制的颜色, 并放入buckets中.
                } else {
                    particle.xt = xt;
                    particle.yt = yt;
                }
            }
            particle.age += 1;
        }.bind(this));

        var prev = "lighter";
        this._ctx.globalCompositeOperation = "destination-in";
        this._ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        this._ctx.globalCompositeOperation = prev;
        this._ctx.globalAlpha = 0.9;

        // buckets是一个二维数组, 第一维是绘制的线颜色, 第二维是每种线颜色对应的需要绘制的风场线
        buckets.forEach(function (bucket, i) {
            if (bucket.length > 0) {
                this._ctx.beginPath();
                this._ctx.strokeStyle = this.colorStyles[i];
                bucket.forEach(function (particle) {
                    this._ctx.moveTo(particle.x, particle.y);
                    this._ctx.lineTo(particle.xt, particle.yt);
                    particle.x = particle.xt;
                    particle.y = particle.yt;
                }.bind(this));
                this._ctx.stroke();
            }
        }.bind(this));
    };

    VelocityLayerView3D.prototype._drawLayer = function () {
        this.view.currentLayer++;
        var extent = this.view.getExtent(),
            position = this.view.viewpoint.center;
        this.position = position;
        var EXTENT = Constant.layout.EXTENT;
        var rasterBoundsArray = new ArrayType.StructArrayLayout4f16();
        rasterBoundsArray.emplaceBack(extent.minx - position[0], position[1] - extent.maxy, 0, 0);
        rasterBoundsArray.emplaceBack(extent.maxx - position[0], position[1] - extent.maxy, EXTENT, 0);
        rasterBoundsArray.emplaceBack(extent.minx - position[0], position[1] - extent.miny, 0, EXTENT);
        rasterBoundsArray.emplaceBack(extent.maxx - position[0], position[1] - extent.miny, EXTENT, EXTENT);
        this.viewportBuffer = this.view.context.createVertexBuffer(rasterBoundsArray, [
            {name: "a_pos", type: "Float32", components: 2, offset: 0},
            {name: "a_texture_pos", type: "Float32", components: 2, offset: 8}
        ]);
        draw.drawImageLayer(this);
    };

    VelocityLayerView3D.prototype.zoom = function () {
        if (this.visible) {
            draw.drawImageLayer(this);
        }
    };

    VelocityLayerView3D.prototype.stop = function () {
        this.columns = [];
        if (this.intervalFlag) clearInterval(this.intervalFlag);
    };

    return VelocityLayerView3D;
});