define("com/huayun/webgis/views/3d/layers/MapImageLayerView3D", [
    "dojo/_base/declare",
    "./LayerView3D",
    "../../../gl/Texture",
    "../../../gl/draw",
    "com/huayun/webgis/gl/mode",
    "com/huayun/webgis/data/ArrayType",
    "com/huayun/webgis/utils/Constant",
    "com/huayun/webgis/gl/members",
    "com/huayun/webgis/gl/SegmentVector"
], function (declare, LayerView3D, Texture, draw, mode, ArrayType, Constant, members, SegmentVector) {
    return declare("com.huayun.webgis.views.3d.layers.MapImageLayerView3D", [LayerView3D], {
        _promise: null,
        _dataChange: null,
        view: null,

        constructor: function (params) {
            declare.safeMixin(this, params);
            var quadTriangleIndices = new ArrayType.StructArrayLayout3ui6();
            quadTriangleIndices.emplaceBack(0, 1, 2);
            quadTriangleIndices.emplaceBack(2, 1, 3);
            this.quadTriangleIndexBuffer = this.view.context.createIndexBuffer(quadTriangleIndices);
            this.viewportSegments = SegmentVector.simpleSegment(0, 0, 4, 2);
            this._matrixDirty = true;
            this._promiseHandled = false;
        },
        /**
         * 可视化设置
         * @param visible
         */
        setVisible: function (visible) {
            this.visible = visible;
            this.view.threeRender();
        },
        /**
         * 调整尺寸
         */
        resize: function () {
        },
        /**
         * 刷新
         */
        refresh: function () {
            this._readyData();
            this.view.threeRender();
        },
        _readyData: function () {
            var level = this.view.viewpoint.targetZoom || this.view.viewpoint.level;
            var visible = this.visible;
            if (this.layer.maxLevel) {
                if (level >= this.layer.maxLevel) {
                    visible = false;
                }
            }
            if (visible) {
                var extent = this.view.getExtent();
                if (extent) {
                    var resolution = this.view.viewpoint.tileInfo.getResolution(level);
                    if (this._promise && !this._promise.isResolved()) {
                        this._promise.cancel();
                    }
                    this._promise = this.layer.fetchImage(extent, Math.round(extent.getWidth() / resolution), Math.round(extent.getHeight() / resolution));
                    this._promiseHandled = false;
                    if (this._dataChange && !this._dataChange.isResolved()) {
                        this._dataChange.cancel();
                    }
                    this._dataChange = this.layer.getMSCdata(extent);
                }
            }
        },
        /**
         * 渲染
         */
        _render: function () {
            var zoom = this.view.viewpoint.targetZoom || this.view.viewpoint.level;
            var visible = this.visible;
            if (this.layer.maxLevel) {
                if (zoom >= this.layer.maxLevel) {
                    visible = false;
                }
            }
            if (visible) {
                var extent = this.view.getExtent();
                if (!this._promiseHandled && this._promise && extent) {
                    this._promiseHandled = true;
                    this._promise.then(function (image) {
                        this._promise = null;
                        this._promiseHandled = false;
                        if (image) {
                            this.position = this.view.viewpoint.center;
                            this.extent = extent;
                            this._matrixDirty = true;
                            var context = this.view.context;
                            var gl = context.gl;
                            if (this.texture) {
                                this.texture.update(image, {useMipmap: true});
                            } else {
                                this.texture = new Texture(context, image, gl.RGBA, {useMipmap: true});
                                this.texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);
                                if (context.extTextureFilterAnisotropic) {
                                    gl.texParameterf(gl.TEXTURE_2D, context.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, context.extTextureFilterAnisotropicMax);
                                }
                            }
                            this.texture.zoom = zoom;
                        }
                        this.view.threeRender();
                    }.bind(this));
                    // this._promise = null;
                }
                this._drawLayer();
            }
        },
        /**
         * 绘制图层
         */
        _drawLayer: function () {
            if (this.extent) {
                this.view.currentLayer++;
                if (this._matrixDirty) {
                    var extent = this.extent,
                        position = this.position;
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
                    this._matrixDirty = false;
                }
                this.depthRangeFor3D = [0, 1 - ((1 + this.view.currentLayer) * this.view.numSublayers) * this.view.depthEpsilon];
                draw.drawImageLayer(this);
            }
        },
        /**
         * 缩放
         */
        zoom: function () {
            var zoom = this.view.viewpoint.targetZoom || this.view.viewpoint.level;
            var visible = this.visible;
            if (this.layer.maxLevel) {
                if (zoom >= this.layer.maxLevel) {
                    visible = false;
                }
            }
            if (visible) {
                this.view.currentLayer++;
                draw.drawImageLayer(this);
            }
        },
        /**
         * 深度子层编码
         * @param {number} n
         * @param {string} mask  掩码
         * @param {func} func    函数
         */
        depthModeForSublayer: function (n, mask, func) {
            var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
            return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);
            // return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, this.view.depthRangeFor3D);
        }
    });
});