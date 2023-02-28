/**
 *  @author :   吴胜飞
 *  @date   :   2019/7/22
 *  @description : 矢量切片图层View
 */
define("com/huayun/webgis/views/3d/layers/VectorTileLayerView3D-backup", [
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
    "com/huayun/webgis/utils/utils"
], function (declare, LayerView3D, ArrayType,
             drawType, mode, funcUtils, CrossTileSymbolIndex, PauseablePlacement, EvaluationParameters, members, SegmentVector, Constant, utils) {
    return declare("com.huayun.webgis.views.3d.layers.VectorTileLayerView3D", [LayerView3D], {
        view: null,
        constructor: function (params) {
            declare.safeMixin(this, params);
            this.visible = params.visible;

            this.draw$1 = {
                fill: drawType.drawFill,
                line: drawType.drawLine,
                symbol: drawType.drawSymbols,
                background: drawType.drawBackground,
                'fill-extrusion': drawType.drawExtrusion,
                clipping: drawType.drawClipping,
                heatmap: drawType.drawHeatmap
            };

            this.crossTileSymbolIndex = new CrossTileSymbolIndex();
            this.nextStencilID = 1;
            var gl = this.view._gl;
            this.stencilClearMode = new mode.StencilMode({
                func: gl.ALWAYS,
                mask: 0
            }, 0x0, 0xFF, gl.ZERO, gl.ZERO, gl.ZERO);


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
        },
        /**
         * 刷新
         */
        refresh: function () {
            this._readyData();
            this.view.threeRender();
        },
        
        _readyData: function () {
            if (this.visible) {
                var tileInfo = this.layer.tileInfo,
                    level = this.view.viewpoint.targetZoom || this.view.viewpoint.level,
                    center = this.view.viewpoint.center,
                    resolution = tileInfo.getResolution(level);
                if (!tileInfo) {
                    return;
                }
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

                var sourceCaches = this.layer.sourceCaches;
                for (var id in sourceCaches) {
                    this.tileIDs = sourceCaches[id].updateTile(level, zoomedBounds, range, cx, cy);
                }
                this._sourcesDirty = true;
                this.zoomedBounds = zoomedBounds;
                this.range = range;
                this.cx = cx;
                this.cy = cy;
            }
        },

        _render: function () {
            this._renderVector();
        },
        /**
         * 元数据渲染
         */
        _renderVector: function () {
            if (this.visible) {
                var sourceCaches = this.layer.sourceCaches;
                var zoom = this.view.viewpoint.targetZoom||this.view.viewpoint.level;
                if (this._sourcesDirty) {
                    for (var id in sourceCaches) {
                        this.tileIDs = sourceCaches[id].update(zoom, this.zoomedBounds, this.range, this.cx, this.cy);
                    }
                }
                // this._placementDirty = this._updatePlacement(this.painter.transform, this.showCollisionBoxes, this._fadeDuration, this._crossSourceCollisions);
                var layerIds = this.layer._order;
                var coordsAscending = {};
                var coordsDescending = {};
                var coordsDescendingSymbol = {};
                for (var id$1 in sourceCaches) {
                    var sourceCache$1 = sourceCaches[id$1];
                    coordsAscending[id$1] = sourceCache$1.getVisibleCoordinates(false, this.transform);
                    coordsDescending[id$1] = coordsAscending[id$1].slice().reverse();
                    coordsDescendingSymbol[id$1] = sourceCache$1.getVisibleCoordinates(true, this.transform).reverse();
                }

                this._placementDirty = this._updatePlacement(0);

                for (var id in sourceCaches) {
                    var sourceCache = sourceCaches[id];
                    sourceCache.prepare(this.view.context);
                }


                /*this.context.clear({
                    color: {r: 0.5686274509803921, g: 0.6941176470588235, b: 0.807843137254902, a: 1},
                    // color: {r: 1, g: 1, b: 1, a: 1},
                    depth: 1
                });
                */
                // this.view.context.bindFramebuffer.set(null);
                // this.clearStencil();
                var zoom = this.transform.level;
                // this.depthRangeFor3D = [0, 1 - ((layerIds.length + 2) * 0.000213623046875)];
                this.renderPass = "opaque";
                for (this.currentLayer = layerIds.length - 1; this.currentLayer >= 0; this.currentLayer--) {
                    var layer$1 = this.layer._layers[layerIds[this.currentLayer]];
                    if (layer$1.type !== "fill" && layer$1.type != "background") {
                        continue;
                    }
                    var sourceCache$3 = sourceCaches[layer$1.source];
                    var coords$1 = coordsAscending[layer$1.source];
                    // this._renderTileClippingMasks(layer$1, coords$1);
                    this.renderLayer(this, sourceCache$3, layer$1, coords$1, zoom);
                }

                this.renderPass = 'translucent';
                for (this.currentLayer = 0; this.currentLayer < layerIds.length; this.currentLayer++) {
                    var layer$2 = this.layer._layers[layerIds[this.currentLayer]];
                    if (layer$2.type === "fill" || layer$2.type === "background") {
                        continue;
                    }
                    var sourceCache$4 = sourceCaches[layer$2.source];
                    var coords$2 = (layer$2.type === 'symbol' ? coordsDescendingSymbol : coordsDescending)[layer$2.source];

                    // this._renderTileClippingMasks(layer$2, coordsAscending[layer$2.source]);
                    this.renderLayer(this, sourceCache$4, layer$2, coords$2, zoom);
                }
            }
        },
        /**
         * 缩放
         */
        zoom: function () {
            if (this.visible) {
                this.transform = this.view.viewpoint;
                // this._placementDirty = this._updatePlacement(0);
                //
                var layerIds = this.layer._order;
                var coordsAscending = {};
                var coordsDescending = {};
                var coordsDescendingSymbol = {};
                var sourceCaches = this.layer.sourceCaches;

                for (var id$1 in sourceCaches) {
                    var sourceCache$1 = sourceCaches[id$1];
                    coordsAscending[id$1] = sourceCache$1.updateTileMatrix(false, this.transform);
                    coordsDescending[id$1] = coordsAscending[id$1].slice().reverse();
                    coordsDescendingSymbol[id$1] = sourceCache$1.updateTileMatrix(true, this.transform).reverse();
                }
                // this._placementDirty = this._zoomPlacement(0, this.view.viewpoint.zoom);

                for (var id in sourceCaches) {
                    var sourceCache = sourceCaches[id];
                    // sourceCache.prepare(this.view.context);
                    this.tileIDs = sourceCache.currentCoords;
                }

                this.depthRangeFor3D = [0, 1 - ((layerIds.length + 2) * 0.000213623046875)];
                this.renderPass = "opaque";
                var zoom = this.view.viewpoint.zoom;
                for (this.currentLayer = layerIds.length - 1; this.currentLayer >= 0; this.currentLayer--) {
                    var layer$1 = this.layer._layers[layerIds[this.currentLayer]];
                    if (layer$1.type !== "fill" && layer$1.type != "background") {
                        continue;
                    }
                    var sourceCache$3 = sourceCaches[layer$1.source];
                    var coords$1 = coordsAscending[layer$1.source];
                    // this._renderTileClippingMasks(layer$1, coords$1);
                    this.renderLayer(this, sourceCache$3, layer$1, coords$1, zoom);
                }

                this.renderPass = 'translucent';
                for (this.currentLayer = 0; this.currentLayer < layerIds.length; this.currentLayer++) {
                    var layer$2 = this.layer._layers[layerIds[this.currentLayer]];
                    if (layer$2.type === "fill" || layer$2.type === "background") {
                        continue;
                    }
                    var sourceCache$4 = sourceCaches[layer$2.source];
                    var coords$2 = (layer$2.type === 'symbol' ? coordsDescendingSymbol : coordsDescending)[layer$2.source];

                    // this._renderTileClippingMasks(layer$2, coordsAscending[layer$2.source]);
                    this.renderLayer(this, sourceCache$4, layer$2, coords$2, zoom);
                }
                this.view.context.setDefault();
            }
        },
        /**
         * 图层渲染
         * @param painter 
         * @param sourceCache 
         * @param layer 
         * @param coords 
         * @param level 
         */
        renderLayer: function (painter, sourceCache, layer, coords, level) {
            if (layer.isHidden(level)) {
                return;
            }
            if (!coords.length) {
                return;
            }
            this.id = layer.id;
            this.draw$1[layer.type](painter, sourceCache, layer, coords);
        },

        /**
         * 标注碰撞检测
         * @param fadeDuration
         * @returns {boolean|*}
         * @private
         */
        _updatePlacement: function (fadeDuration) {
            var symbolBucketsChanged = false;
            var placementCommitted = false;

            var layerTiles = {};

            for (var i = 0, list = this.layer._order; i < list.length; i += 1) {
                var layerID = list[i];
                var styleLayer = this.layer._layers[layerID];
                if (styleLayer.type !== 'symbol') {
                    continue;
                }

                var source = styleLayer.source;
                if (!layerTiles[source]) {
                    var sourceCache = this.layer.sourceCaches[source];
                    layerTiles[source] = sourceCache.getRenderableIds(true).map(function (id) {
                        return sourceCache.getTileByID(id);
                    }).sort(function (a, b) {
                        return (b.tileID.overscaledZ - a.tileID.overscaledZ) || (a.tileID.isLessThan(b.tileID) ? -1 : 1);
                    });
                }

                var layerBucketsChanged = this.crossTileSymbolIndex.addLayer(styleLayer, layerTiles[source]);
                symbolBucketsChanged = symbolBucketsChanged || layerBucketsChanged;
            }
            this.crossTileSymbolIndex.pruneUnusedLayers(this.layer._order);

            var forceFullPlacement = this._layerOrderChanged || fadeDuration === 0;

            if (forceFullPlacement) {
                this.pauseablePlacement = new PauseablePlacement(this.transform, this.layer._order, forceFullPlacement, false, fadeDuration, true, this.placement);
                this._layerOrderChanged = false;
            }

            if (this.pauseablePlacement.isDone()) {
                this.placement.setStale();
            } else {
                this.pauseablePlacement.continuePlacement(this.layer._order, this.layer._layers, layerTiles);
                if (this.pauseablePlacement.isDone()) {
                    this.placement = this.pauseablePlacement.commit(funcUtils.now());
                    placementCommitted = true;
                }

                if (symbolBucketsChanged) {
                    this.pauseablePlacement.placement.setStale();
                }
            }

            if (placementCommitted || symbolBucketsChanged) {
                for (var i$1 = 0, list$1 = this.layer._order; i$1 < list$1.length; i$1 += 1) {
                    var layerID$1 = list$1[i$1];

                    var styleLayer$1 = this.layer._layers[layerID$1];
                    if (styleLayer$1.type !== 'symbol') {
                        continue;
                    }
                    this.placement.updateLayerOpacities(styleLayer$1, layerTiles[styleLayer$1.source]);
                }
            }

            // needsRender is false when we have just finished a placement that didn't change the visibility of any symbols
            var needsRerender = !this.pauseablePlacement.isDone() || this.placement.hasTransitions(funcUtils.now());
            return needsRerender;
        },
        /**
         * 缩放设置
         * @param fadeDuration 
         * @param zoom 
         */
        _zoomPlacement: function (fadeDuration, zoom) {
            var symbolBucketsChanged = false;
            var placementCommitted = false;

            var layerTiles = {};

            for (var i = 0, list = this.layer._order; i < list.length; i += 1) {
                var layerID = list[i];
                var styleLayer = this.layer._layers[layerID];
                if (styleLayer.type !== 'symbol') {
                    continue;
                }

                var source = styleLayer.source;
                if (!layerTiles[source]) {
                    var sourceCache = this.layer.sourceCaches[source];
                    layerTiles[source] = sourceCache.zoomRenderableIds(true).map(function (id) {
                        return sourceCache.getTileByID(id);
                    }).filter(function (item) {
                        return item.tileID.overscaledZ === zoom;
                    }).sort(function (a, b) {
                        return (b.tileID.overscaledZ - a.tileID.overscaledZ) || (a.tileID.isLessThan(b.tileID) ? -1 : 1);
                    });
                }

                var layerBucketsChanged = this.crossTileSymbolIndex.addLayer(styleLayer, layerTiles[source]);
                symbolBucketsChanged = symbolBucketsChanged || layerBucketsChanged;
            }

            this.crossTileSymbolIndex.pruneUnusedLayers(this.layer._order);

            var forceFullPlacement = this._layerOrderChanged || fadeDuration === 0;

            if (forceFullPlacement) {
                this.pauseablePlacement = new PauseablePlacement(this.transform, this.layer._order, forceFullPlacement, false, fadeDuration, true, this.placement);
                this._layerOrderChanged = false;
            }

            if (this.pauseablePlacement.isDone()) {
                this.placement.setStale();
            } else {
                this.pauseablePlacement.continuePlacement(this.layer._order, this.layer._layers, layerTiles);
                if (this.pauseablePlacement.isDone()) {
                    this.placement = this.pauseablePlacement.commit(funcUtils.now());
                    placementCommitted = true;
                }

                if (symbolBucketsChanged) {
                    this.pauseablePlacement.placement.setStale();
                }
            }

            if (placementCommitted || symbolBucketsChanged) {
                for (var i$1 = 0, list$1 = this.layer._order; i$1 < list$1.length; i$1 += 1) {
                    var layerID$1 = list$1[i$1];

                    var styleLayer$1 = this.layer._layers[layerID$1];
                    if (styleLayer$1.type !== 'symbol') {
                        continue;
                    }
                    this.placement.updateLayerOpacities(styleLayer$1, layerTiles[styleLayer$1.source]);
                }
            }

            // needsRender is false when we have just finished a placement that didn't change the visibility of any symbols
            var needsRerender = !this.pauseablePlacement.isDone() || this.placement.hasTransitions(funcUtils.now());
            return needsRerender;
        },
        /**
         * 切片编码进行渲染
         * @param layer 
         * @param tileIDs 
         */
        _renderTileClippingMasks: function (layer, tileIDs) {
            if (this.currentStencilSource === layer.source || !layer.isTileClipped() || !tileIDs || !tileIDs.length) { return; }

            this.currentStencilSource = layer.source;

            var context = this.view.context;
            var gl = context.gl;

            if (this.nextStencilID + tileIDs.length > 256) {
                this.clearStencil();
            }

            context.setColorMode(mode.ColorMode.disabled);
            context.setDepthMode(mode.DepthMode.disabled);

            var program = this.view.useProgram('clippingMask');

            this._tileClippingMaskIDs = {};

            for (var i = 0, list = tileIDs; i < list.length; i += 1) {
                var tileID = list[i];

                var id = this._tileClippingMaskIDs[tileID.key] = this.nextStencilID++;

                program.draw(context, gl.TRIANGLES, mode.DepthMode.disabled,
                    new mode.StencilMode({func: gl.ALWAYS, mask: 0}, id, 0xFF, gl.KEEP, gl.KEEP, gl.REPLACE),
                    mode.ColorMode.disabled, mode.CullFaceMode.disabled, {"u_matrix": tileID.posMatrix},
                    '$clipping', this.tileExtentBuffer,
                    this.quadTriangleIndexBuffer, this.tileExtentSegments);
            }
        },
        /**
         * 
         * @param n 
         * @param mask 
         * @param func 
         */
        depthModeForSublayer: function (n, mask, func) {
            // var depth = 1 - this.currentLayer * 0.0000152587890625;
            // var depth = 0.9985984898265599 - this.currentLayer * 2.3283064365386963e-7;// + (91- this.currentLayer) * 2.3283064365386963e-7;
            // var depth = 1 - ((1 + 120) * 14 + n) * 0.0000152587890625;
            // var depth = 1 - ((1 + this.currentLayer) + n) * 0.0000152587890625;
            var depth = 0.9985984898265599 / 2 + 0.5;
            return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);
        },
        /**
         * 清空模板
         */
        clearStencil: function () {
            var context = this.view.context;
            var gl = context.gl;

            this.nextStencilID = 1;
            this.currentStencilSource = undefined;

            var matrix = glMatrix.mat4.create();
            glMatrix.mat4.ortho(matrix, 0, this.transform.width, this.transform.height, 0, 0, 1);
            glMatrix.mat4.scale(matrix, matrix, [gl.drawingBufferWidth, gl.drawingBufferHeight, 0]);

            this.view.useProgram('clippingMask').draw(context, gl.TRIANGLES,
                mode.DepthMode.disabled, this.stencilClearMode, mode.ColorMode.disabled, mode.CullFaceMode.disabled,
                {
                    'u_matrix': matrix
                },
                '$clipping', this.viewportBuffer,
                this.quadTriangleIndexBuffer, this.viewportSegments);
            // this.draw$1["clipping"](this, this.stencilClearMode, this.viewportBuffer, this.quadTriangleIndexBuffer, this.viewportSegments);
        },
        /**
         * 模板编码以方便裁剪
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
         * 3d模板编码
         */
        stencilModeFor3D: function () {
            if (this.nextStencilID + 1 > 256) {
                this.clearStencil();
            }

            var id = 1;
            var gl = this.view.context.gl;
            return new mode.StencilMode({func: gl.NOTEQUAL, mask: 0xFF}, id, 0xFF, gl.KEEP, gl.KEEP, gl.REPLACE);
        },
        /**
         * 缩放结束
         * @param scale 
         */
        zoomEnd: function (scale) {
            return;
            this.transform = this.view.viewpoint;
            this._placementDirty = this._updatePlacement(0);
            //
            var layerIds = this.layer._order;
            var coordsAscending = {};
            var coordsDescending = {};
            var coordsDescendingSymbol = {};
            var sourceCaches = this.layer.sourceCaches;
            this.scale = scale;

            for (var id$1 in sourceCaches) {
                var sourceCache$1 = sourceCaches[id$1];
                coordsAscending[id$1] = sourceCache$1.updateTileMatrix(false, this.transform, scale);
                coordsDescending[id$1] = coordsAscending[id$1].slice().reverse();
                coordsDescendingSymbol[id$1] = sourceCache$1.updateTileMatrix(true, this.transform, scale).reverse();
            }
            // this._placementDirty = this._zoomPlacement(0, this.view.viewpoint.zoom);

            for (var id in sourceCaches) {
                var sourceCache = sourceCaches[id];
                sourceCache.prepare(this.view.context);
                this.tileIDs = sourceCache.currentCoords;
            }

            this.renderPass = "opaque";
            for (this.currentLayer = layerIds.length - 1; this.currentLayer >= 0; this.currentLayer--) {
                var layer$1 = this.layer._layers[layerIds[this.currentLayer]];
                if (layer$1.type !== "fill" && layer$1.type != "background") {
                    continue;
                }
                var sourceCache$3 = sourceCaches[layer$1.source];
                var coords$1 = coordsAscending[layer$1.source];
                // this._renderTileClippingMasks(layer$1, coords$1);
                this.renderLayer(this, sourceCache$3, layer$1, coords$1, this.view.level);
            }

            this.renderPass = 'translucent';
            for (this.currentLayer = 0; this.currentLayer < layerIds.length; this.currentLayer++) {
                var layer$2 = this.layer._layers[layerIds[this.currentLayer]];
                if (layer$2.type === "fill" || layer$2.type === "background") {
                    continue;
                }
                var sourceCache$4 = sourceCaches[layer$2.source];
                var coords$2 = (layer$2.type === 'symbol' ? coordsDescendingSymbol : coordsDescending)[layer$2.source];

                // this._renderTileClippingMasks(layer$2, coordsAscending[layer$2.source]);
                this.renderLayer(this, sourceCache$4, layer$2, coords$2, this.view.level);
            }
            this._sourcesDirty = true;
            this.view.context.setDefault();
        },
        /**
         * 获取渲染后特征数据
         * @param queryGeometry 
         */
        queryRenderedFeatures: function (queryGeometry) {
            var includedSources = {};
            var sourceResults = [];
            /*for (var id in this.layer.sourceCaches) {
                sourceResults.push(
                    this.queryFeatures(
                        this.layer.sourceCaches[id],
                        this.layer._layers,
                        queryGeometry,
                        {},
                        this.transform)
                );
            }*/
            if (this.placement) {
                sourceResults.push(
                    this.queryRenderedSymbols(
                        this.layer._layers,
                        this.layer.sourceCaches,
                        queryGeometry,
                        {},
                        this.placement.collisionIndex,
                        this.placement.retainedQueryData)
                );
            }
            return sourceResults;
        },
        /**
         * 获取渲染后的符号
         * @param styleLayers 
         * @param sourceCaches 
         * @param queryGeometry 
         * @param params 
         * @param collisionIndex 
         * @param retainedQueryData 
         */
        queryRenderedSymbols: function (styleLayers, sourceCaches, queryGeometry, params, collisionIndex, retainedQueryData) {
            var result = {};
            var renderedSymbols = collisionIndex.queryRenderedSymbols(queryGeometry);
            var bucketQueryData = [];
            for (var i = 0, list = Object.keys(renderedSymbols).map(Number); i < list.length; i += 1) {
                var bucketInstanceId = list[i];

                bucketQueryData.push(retainedQueryData[bucketInstanceId]);
            }
            bucketQueryData.sort(utils.sortTilesIn);

            var loop = function () {
                var queryData = list$2[i$2];

                var bucketSymbols = queryData.featureIndex.lookupSymbolFeatures(
                    renderedSymbols[queryData.bucketInstanceId],
                    queryData.bucketIndex,
                    queryData.sourceLayerIndex,
                    params.filter,
                    params.layers,
                    styleLayers);

                for (var layerID in bucketSymbols) {
                    var resultFeatures = result[layerID] = result[layerID] || [];
                    var layerSymbols = bucketSymbols[layerID];
                    layerSymbols.sort(function (a, b) {
                        var featureSortOrder = queryData.featureSortOrder;
                        if (featureSortOrder) {
                            var sortedA = featureSortOrder.indexOf(a.featureIndex);
                            var sortedB = featureSortOrder.indexOf(b.featureIndex);
                            return sortedB - sortedA;
                        } else {
                            return b.featureIndex - a.featureIndex;
                        }
                    });
                    for (var i$1 = 0, list$1 = layerSymbols; i$1 < list$1.length; i$1 += 1) {
                        var symbolFeature = list$1[i$1];
                        resultFeatures.push(symbolFeature);
                    }
                }
            };

            for (var i$2 = 0, list$2 = bucketQueryData; i$2 < list$2.length; i$2 += 1) loop();

            var loop$1 = function (layerName) {
                result[layerName].forEach(function (featureWrapper) {
                    var feature = featureWrapper.feature;
                    var layer = styleLayers[layerName];
                    var sourceCache = sourceCaches[layer.source];
                    var state = sourceCache.getFeatureState(feature.layer['source-layer'], feature.id);
                    feature.source = feature.layer.source;
                    if (feature.layer['source-layer']) {
                        feature.sourceLayer = feature.layer['source-layer'];
                    }
                    feature.state = state;
                });
            };

            for (var layerName in result) loop$1(layerName);
            return result;
        },
        /**
         * 管理渲染后的特征图层
         * @param tiles 
         */
        mergeRenderedFeatureLayers: function (tiles) {
            var result = {};
            var wrappedIDLayerMap = {};
            for (var i$1 = 0, list$1 = tiles; i$1 < list$1.length; i$1 += 1) {
                var tile = list$1[i$1];

                var queryResults = tile.queryResults;
                var wrappedID = tile.wrappedTileID;
                var wrappedIDLayers = wrappedIDLayerMap[wrappedID] = wrappedIDLayerMap[wrappedID] || {};
                for (var layerID in queryResults) {
                    var tileFeatures = queryResults[layerID];
                    var wrappedIDFeatures = wrappedIDLayers[layerID] = wrappedIDLayers[layerID] || {};
                    var resultFeatures = result[layerID] = result[layerID] || [];
                    for (var i = 0, list = tileFeatures; i < list.length; i += 1) {
                        var tileFeature = list[i];

                        if (!wrappedIDFeatures[tileFeature.featureIndex]) {
                            wrappedIDFeatures[tileFeature.featureIndex] = true;
                            resultFeatures.push(tileFeature);
                        }
                    }
                }
            }
            return result;
        },
        /**
         * 获取特征数据
         * @param sourceCache 
         * @param styleLayers 
         * @param queryGeometry 
         * @param params 
         * @param transform 
         */
        queryFeatures: function (sourceCache, styleLayers, queryGeometry, params, transform) {
            var zoom = this.view.viewpoint.targetZoom || this.view.viewpoint.zoom;
            var maxPitchScaleFactor = transform.maxPitchScaleFactor();
            var tilesIn = sourceCache.tilesIn(queryGeometry, maxPitchScaleFactor, false, this.view.resolution, zoom);

            // tilesIn.sort(sortTilesIn);

            var renderedFeatureLayers = [];
            for (var i = 0, list = tilesIn; i < list.length; i += 1) {
                var tileIn = list[i];
                renderedFeatureLayers.push({
                    wrappedTileID: tileIn.tileID.wrapped().key,
                    queryResults: tileIn.tile.queryRenderedFeatures(
                        styleLayers,
                        sourceCache._state,
                        tileIn.queryGeometry,
                        tileIn.cameraQueryGeometry,
                        tileIn.scale,
                        params,
                        transform,
                        maxPitchScaleFactor,
                        utils.getPixelPosMatrix(sourceCache.transform, tileIn.tileID))
                });
            }

            var result = this.mergeRenderedFeatureLayers(renderedFeatureLayers);

            // Merge state from SourceCache into the results
            for (var layerID in result) {
                result[layerID].forEach(function (featureWrapper) {
                    var feature = featureWrapper.feature;
                    var state = sourceCache.getFeatureState(feature.layer['source-layer'], feature.id);
                    feature.source = feature.layer.source;
                    if (feature.layer['source-layer']) {
                        feature.sourceLayer = feature.layer['source-layer'];
                    }
                    feature.state = state;
                });
            }
            return result;
        },
        intersectPoi: function (queryGeometry) {
            return this.intersectRenderedSymbols(
                this.layer._layers,
                this.layer.sourceCaches,
                queryGeometry,
                {},
                this.placement.collisionIndex,
                this.placement.retainedQueryData)
        },
        intersectRenderedSymbols: function (styleLayers, sourceCaches, queryGeometry, params, collisionIndex, retainedQueryData) {
            var renderedSymbols = collisionIndex.queryRenderedSymbols(queryGeometry);
            /*var bucketQueryData = [];
            for (var i = 0, list = Object.keys(renderedSymbols).map(Number); i < list.length; i += 1) {
                var bucketInstanceId = list[i];
                bucketQueryData.push(retainedQueryData[bucketInstanceId]);
            }
            bucketQueryData.sort(utils.sortTilesIn);
            return bucketQueryData.length > 0;*/
            return Object.keys(renderedSymbols).length > 0;
        }
    });
});