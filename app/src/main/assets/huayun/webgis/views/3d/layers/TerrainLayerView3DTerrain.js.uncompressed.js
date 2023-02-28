define("com/huayun/webgis/views/3d/layers/TerrainLayerView3DTerrain", [
    "./LayerView3D",
    "../../../gl/draw/drawTerrain",
    "../../../gl/draw/drawHeightMap",
    "../../../gl/mode",
    "../../../data/ArrayType",
    "../../../gl/members",
    "../../../gl/SegmentVector"
], function (LayerView3D, drawTifTerrain, drawHeightMap, mode, ArrayType, members, SegmentVector) {
    var TerrainLayerView3D = function (params) {
        LayerView3D.call(this, params);
        this.view = params.view;
        this.visible = params.visible;
        this.layer = params.layer;

        var quadTriangleIndices = new ArrayType.StructArrayLayout3ui6();
        quadTriangleIndices.emplaceBack(0, 1, 2);
        quadTriangleIndices.emplaceBack(2, 1, 3);
        this.quadTriangleIndexBuffer = this.view.context.createIndexBuffer(quadTriangleIndices);

        var EXTENT = 8192;
        var rasterBoundsArray = new ArrayType.StructArrayLayout4i8();
        rasterBoundsArray.emplaceBack(0, 0, 0, 0);
        rasterBoundsArray.emplaceBack(EXTENT, 0, EXTENT, 0);
        rasterBoundsArray.emplaceBack(0, EXTENT, 0, EXTENT);
        rasterBoundsArray.emplaceBack(EXTENT, EXTENT, EXTENT, EXTENT);
        this.rasterBoundsBuffer = this.view.context.createVertexBuffer(rasterBoundsArray, members.rasterBoundsAttributes.members);
        this.rasterBoundsSegments = SegmentVector.simpleSegment(0, 0, 4, 2);
    };
    if (LayerView3D) TerrainLayerView3D.__proto__ = LayerView3D;
    TerrainLayerView3D.prototype = Object.create(LayerView3D && LayerView3D.prototype);
    TerrainLayerView3D.prototype.constructor = TerrainLayerView3D;

    TerrainLayerView3D.prototype.refresh = function () {
        this._readyData();
        this.view.threeRender();
    };

    TerrainLayerView3D.prototype._readyData = function () {
        this._promises = {};
        // 计算本次加载的切片
        if (this.visible) {
            var tileInfo = this.layer.tileInfo,
                level = this.view.viewpoint.targetZoom || this.view.viewpoint.level,
                center = this.view.viewpoint.center,
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
            this.layer.sourceCache.updateTile(level, zoomedBounds, range, cx, cy);
            this._sourcesDirty = true;
            this.zoomedBounds = zoomedBounds;
            this.range = range;
            this.cx = cx;
            this.cy = cy;
        }
    };

    TerrainLayerView3D.prototype._render = function () {
        if (this.visible && this.zoomedBounds) {
            this.view.currentLayer++;
            var level = this.view.viewpoint.level;
            var sourceCache$1 = this.layer.sourceCache;
            if (this._sourcesDirty) {
                this.layer.sourceCache.update(level, this.zoomedBounds, this.range, this.cx, this.cy);
                this._sourcesDirty = false;
                this._fadeDirty = false;
            }
            var coordsDescending = sourceCache$1.getVisibleCoordinates(false, this.transform).slice().reverse();
            this.renderPass = 'translucent';
            debugger;
            this.renderLayer(this, sourceCache$1, null, coordsDescending);
        }
    };

    TerrainLayerView3D.prototype.renderLayer = function (painter, sourceCache, layer, coords, level) {
        if (!coords.length) {
            return;
        }
        drawTifTerrain(painter, sourceCache, layer, coords);
    }

    TerrainLayerView3D.prototype.zoom = function () {
        if (this.visible) {
            this.view.currentLayer++;
            var sourceCache$1 = this.layer.sourceCache;
            var coordsDescending = sourceCache$1.updateTileMatrix(false, this.view.viewpoint).slice().reverse();
            this.renderPass = 'translucent';
            this.renderLayer(this, sourceCache$1, null, coordsDescending);
        }
    }

    TerrainLayerView3D.prototype.depthModeForSublayer = function (n, mask, func) {
        var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
        return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);
        // var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
        // return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);
    }

    TerrainLayerView3D.prototype.drawHeightMap = function (painter, tile) {
        if (!tile.heightTexture) {
            drawHeightMap(painter, null, null, tile);
        }
    }

    return TerrainLayerView3D;
});