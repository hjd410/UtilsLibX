define("com/huayun/webgis/views/3d/layers/VectorBuildingLayerView3D", [
    "dojo/_base/declare",
    "./LayerView3D",
    "com/huayun/webgis/data/ArrayType",
    "com/huayun/webgis/gl/draw",
    "com/huayun/webgis/gl/mode",
    "com/huayun/webgis/layers/support/funcUtils",
    "com/huayun/webgis/layers/support/CrossTileSymbolIndex",
    "com/huayun/webgis/layers/support/PauseablePlacement",
    "com/huayun/webgis/layers/support/EvaluationParameters",
    "com/huayun/webgis/gl/members",
    "com/huayun/webgis/gl/SegmentVector",
    "com/huayun/webgis/utils/Constant",
    "com/huayun/webgis/utils/utils",
    "../../../gl/draw/drawFillExtrusion"
], function (declare, LayerView3D, ArrayType,
             drawType, mode, funcUtils, CrossTileSymbolIndex, PauseablePlacement, EvaluationParameters, members, SegmentVector, Constant, utils, drawFillExtrusion) {
    return declare("com.huayun.webgis.views.3d.layers.VectorTileLayerView", [LayerView3D], {
        view: null,
        constructor: function (params) {
            declare.safeMixin(this, params);
            this.draw$1 = {
                'fill-extrusion': drawType.drawExtrusion,
                'line-extrusion': drawType.drawLineExtrusion,
                clipping: drawType.drawClipping
            };

            this.crossTileSymbolIndex = new CrossTileSymbolIndex();
            this.nextStencilID = 1;
            var viewportArray = new ArrayType.StructArrayLayout2i4();
            viewportArray.emplaceBack(0, 0);
            viewportArray.emplaceBack(1, 0);
            viewportArray.emplaceBack(0, 1);
            viewportArray.emplaceBack(1, 1);
            this.viewportBuffer = this.view.context.createVertexBuffer(viewportArray, members.posAttributes.members);
            this.viewportSegments = SegmentVector.simpleSegment(0, 0, 4, 2);

            var quadTriangleIndices = new ArrayType.StructArrayLayout3ui6();
            quadTriangleIndices.emplaceBack(0, 1, 2);
            quadTriangleIndices.emplaceBack(2, 1, 3);
            this.quadTriangleIndexBuffer = this.view.context.createIndexBuffer(quadTriangleIndices);

            var tileExtentArray = new ArrayType.StructArrayLayout2i4();
            tileExtentArray.emplaceBack(0, 0);
            tileExtentArray.emplaceBack(Constant.layout.EXTENT, 0);
            tileExtentArray.emplaceBack(0, Constant.layout.EXTENT);
            tileExtentArray.emplaceBack(Constant.layout.EXTENT, Constant.layout.EXTENT);
            this.tileExtentBuffer = this.view.context.createVertexBuffer(tileExtentArray, members.posAttributes.members);
            this.tileExtentSegments = SegmentVector.simpleSegment(0, 0, 4, 2);
            this.minLevel = params.minLevel || 11;
            this.callbackOnce = null;
        },
        /**
         * 刷新
         */
        refresh: function (callback) {
            if (callback) {
                this.callbackOnce = callback;
            }
            this._readyData();
            this.view.threeRender();
        },
        /**
         * 数据准备
         */
        _readyData: function () {
            var level;
            if (this.layer.maxLevel) {
                level = Math.min(this.transform.targetZoom || this.transform.level, this.layer.maxLevel);
            } else {
                level = this.transform.targetZoom || this.transform.level;
            }
            if (this.minLevel && level < this.minLevel) {
                return;
            }
            if (this.visible) {
                if (!this.layer.tileInfo) {
                    return;
                }
                var tileInfo = this.layer.tileInfo,
                    center = this.transform.center,
                    resolution = tileInfo.getResolution(level);
                var zoomedBounds = this.view._bound.map(function (item) {
                    return {
                        x: tileInfo.getColForX(item.x, resolution),
                        y: tileInfo.getRowForY(item.y, resolution)
                    }
                });
                var range = tileInfo.getColRange(resolution);
                var cx = tileInfo.getColForX(center[0], resolution),
                    cy = tileInfo.getRowForY(center[1], resolution);
                var layers = this.layer._layers;

                var para = new EvaluationParameters(level, {
                    now: funcUtils.now(),
                    fadeDuration: 500,
                    zoomHistory: this.view.zoomHistory,
                    transition: {
                        delay: 0,
                        duration: 500
                    }
                });
                for (var i = 0, list = this.layer._order; i < list.length; i++) {
                    var layer = layers[list[i]];
                    layer.recalculate(para);
                }

                this.layer.sourceCache.updateTile(level, zoomedBounds, range, cx, cy);
                this._sourcesDirty = true;
                this.zoomedBounds = zoomedBounds;
                this.range = range;
                this.cx = cx;
                this.cy = cy;
            }
        },
        /**
         * 渲染
         */
        _render: function () {
            if (this.visible) {
                if (!this.layer.tileInfo) {
                    return;
                }
                var sourceCache = this.layer.sourceCache;
                // var zoom = Math.min(this.transform.targetZoom || this.transform.level, this.layer.maxLevel);

                var zoom;
                if (this.layer.maxLevel) {
                    zoom = Math.min(this.transform.targetZoom || this.transform.level, this.layer.maxLevel);
                } else {
                    zoom = this.transform.targetZoom || this.transform.level;
                }
                if (this.minLevel && zoom < this.minLevel) {
                    return;
                }
                var currentTile;
                if (this._sourcesDirty) {
                    currentTile = sourceCache.update(zoom, this.zoomedBounds, this.range, this.cx, this.cy);
                }
                var coordsDescending = sourceCache.getVisibleCoordinates(false, this.transform).slice().reverse();
                sourceCache.prepare(this.view.context);
                // this.view.currentLayer++;

                // this.clearStencil();
                // this.depthRangeFor3D = [0, 1 - ((layerIds.length + 2) * 0.000213623046875)];
                this.depthRangeFor3D = [0, 1 - ((1 + this.view.currentLayer) * this.view.numSublayers) * this.view.depthEpsilon];
                this.renderPass = 'translucent';
                var layerIds = this.layer._order;
                for (this.currentLayer = 0; this.currentLayer < layerIds.length; this.currentLayer++) {
                    var layer$2 = this.layer._layers[layerIds[this.currentLayer]];
                    this._renderLayer(this, sourceCache, layer$2, coordsDescending, zoom);
                }
                if (currentTile.length === coordsDescending.length && this.callbackOnce) {
                    this.callbackOnce();
                    this.callbackOnce = null;
                }
            }
        },
        /**
         * 渲染图层
         * @param painter
         * @param sourceCache
         * @param layer
         * @param coords
         * @param level
         */
        _renderLayer: function (painter, sourceCache, layer, coords, level) {
            if (layer.isHidden(level)) {
                return;
            }
            if (!coords.length) {
                return;
            }
            this.id = layer.id;
            drawFillExtrusion(painter, sourceCache, layer, coords);
        },

        /**
         * 缩放
         */
        zoom: function () {
            if (this.visible) {
                var sourceCache = this.layer.sourceCache;
                // var zoom = this.view.viewpoint.targetZoom || this.view.viewpoint.level;
                var zoom;
                if (this.layer.maxLevel) {
                    zoom = Math.min(this.transform.targetZoom || this.transform.level, this.layer.maxLevel);
                } else {
                    zoom = this.transform.targetZoom || this.transform.level;
                }
                if (this.minLevel && zoom < this.minLevel) {
                    return;
                }
                var coordsDescending = sourceCache.updateTileMatrix(false, this.transform).slice().reverse();

                // this.view.currentLayer++;
                this.depthRangeFor3D = [0, 1 - ((1 + this.view.currentLayer) * this.view.numSublayers) * this.view.depthEpsilon];
                this.renderPass = 'translucent';
                var layerIds = this.layer._order;
                for (this.currentLayer = 0; this.currentLayer < layerIds.length; this.currentLayer++) {
                    var layer$2 = this.layer._layers[layerIds[this.currentLayer]];
                    this._renderLayer(this, sourceCache, layer$2, coordsDescending, zoom);
                }
            }
        },

        depthModeForSublayer: function (n, mask, func) {
            // var depth = 1 - this.currentLayer * 0.0000152587890625;
            // var depth = 0.9985984898265599 - this.currentLayer * 2.3283064365386963e-7;// + (91- this.currentLayer) * 2.3283064365386963e-7;
            // var depth = 1 - ((1 + 120) * 14 + n) * 0.0000152587890625;
            // var depth = 1 - ((1 + this.currentLayer) + n) * 0.0000152587890625;
            /*var depth = 0.9985984898265599 / 2 + 0.5;
            return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);*/
            // var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
            // return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);
            return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, this.view.depthRangeFor3D);
        },
        /**
         * 清空模板
         */
        clearStencil: function () {
            var context = this.view.context;
            var gl = context.gl;

            this.nextStencilID = 1;
            // this.currentStencilSource = undefined;

            var matrix = new Matrix4();
            matrix.ortho(0, this.view.width, this.view.height, 0, 0, 1);
            matrix.scale(gl.drawingBufferWidth, gl.drawingBufferHeight, 0);

            this.view.useProgram('clippingMask').draw(context, gl.TRIANGLES,
                mode.DepthMode.disabled, this.stencilClearMode, mode.ColorMode.disabled, mode.CullFaceMode.disabled,
                {
                    'u_matrix': matrix.elements
                },
                '$clipping', this.viewportBuffer,
                this.quadTriangleIndexBuffer, this.viewportSegments);

            // this.draw$1["clipping"](this, this.stencilClearMode, this.viewportBuffer, this.quadTriangleIndexBuffer, this.viewportSegments);
        },
        /**
         * 确定模板编码，以便以后的裁剪
         * @param tileID
         */
        stencilModeForClipping: function (tileID) {
            var gl = this.view.context.gl;
            return new mode.StencilMode({
                func: gl.EQUAL,
                mask: 0xFF
            }, this._tileClippingMaskIDs[tileID.key], 0x00, gl.KEEP, gl.KEEP, gl.REPLACE);
        },
        /**
         * 对3d模板进行编码
         */
        stencilModeFor3D: function () {
            if (this.nextStencilID + 1 > 256) {
                this.clearStencil();
            }

            var id = 1;
            var gl = this.view.context.gl;
            return new mode.StencilMode({func: gl.NOTEQUAL, mask: 0xFF}, id, 0xFF, gl.KEEP, gl.KEEP, gl.REPLACE);
        },

        setVisible: function (visible) {
            this.visible = visible;
            this.view.threeRender();
        }
    });
});