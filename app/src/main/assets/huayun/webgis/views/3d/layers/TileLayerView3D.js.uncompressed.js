define("com/huayun/webgis/views/3d/layers/TileLayerView3D", [
    "./LayerView3D",
    "../../../utils/utils",
    "../../../utils/extendClazz",
    "../../../gl/draw/drawRaster",
    "../../../gl/mode",
    "../../../data/ArrayType",
    "../../../utils/Constant",
    "../../../gl/members",
    "../../../gl/SegmentVector"
], function (LayerView3D, utils, extendClazz, drawRaster, mode, ArrayType, Constant, members, SegmentVector) {

    /**
     * @ignore
     * @param params
     * @constructor
     */
    function TileLayerView3D(params) {
        LayerView3D.call(this, params);
        this.visible = params.visible;
        this.id = params.id;
        this.layer = params.layer;
        this.view = params.view;
        this._tileTextures = {};

        this._sourcesDirty = true;
        this._fadeDirty = true;
        var quadTriangleIndices = new ArrayType.StructArrayLayout3ui6();
        quadTriangleIndices.emplaceBack(0, 1, 2);
        quadTriangleIndices.emplaceBack(2, 1, 3);
        this.quadTriangleIndexBuffer = this.view.context.createIndexBuffer(quadTriangleIndices);

        var EXTENT = Constant.layout.EXTENT;
        var rasterBoundsArray = new ArrayType.StructArrayLayout4i8();
        rasterBoundsArray.emplaceBack(0, 0, 0, 0);
        rasterBoundsArray.emplaceBack(EXTENT, 0, EXTENT, 0);
        rasterBoundsArray.emplaceBack(0, EXTENT, 0, EXTENT);
        rasterBoundsArray.emplaceBack(EXTENT, EXTENT, EXTENT, EXTENT);
        this.rasterBoundsBuffer = this.view.context.createVertexBuffer(rasterBoundsArray, members.rasterBoundsAttributes.members);
        this.rasterBoundsSegments = SegmentVector.simpleSegment(0, 0, 4, 2);
    }

    extendClazz(TileLayerView3D, LayerView3D);

    TileLayerView3D.prototype.refresh = function () {
        this._readyData();
        this.view.threeRender();
    };

    /**
     * 计算并请求本次渲染需要的切片
     * @private
     */
    TileLayerView3D.prototype._readyData = function () {
        if (this.visible) {
            var tileInfo = this.layer.tileInfo,
                level = this.layer.maxLevel ? Math.min(this.view.viewpoint.targetZoom || this.view.viewpoint.level, this.layer.maxLevel):
                    this.view.viewpoint.targetZoom || this.view.viewpoint.level,
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
    }

    TileLayerView3D.prototype._render = function () {
        if (this.visible && this.zoomedBounds) {
            this.view.currentLayer++;
            var level = this.layer.maxLevel ? Math.min(this.view.viewpoint.level, this.layer.maxLevel): this.view.viewpoint.level;
            if (this._sourcesDirty) {
                this.layer.sourceCache.update(level, this.zoomedBounds, this.range, this.cx, this.cy);
                this._sourcesDirty = false;
                this._fadeDirty = false;
            }
            this.renderPass = 'translucent';
            var coords$2 = this.layer.sourceCache.getVisibleCoordinates(false, this.transform).slice().reverse();
            this.renderLayer(this, this.layer.sourceCache, null, coords$2);
        }
    }

    TileLayerView3D.prototype.renderLayer = function (painter, sourceCache, layer, coords, level) {
        if (!coords.length) {
            return;
        }
        drawRaster(painter, sourceCache, layer, coords);
    }

    TileLayerView3D.prototype.setVisible = function (visible) {
        this.visible = visible;
        if (visible) {
            this.refresh();
        } else {
            this.view.threeRender();
        }
    }

    TileLayerView3D.prototype.zoom = function () {
        if (this.visible) {
            this.transform = this.view.viewpoint;
            this.renderPass = 'translucent';
            var coords$2 = this.layer.sourceCache.updateTileMatrix(false, this.transform).slice().reverse();
            this.renderLayer(this, this.layer.sourceCache, null, coords$2);
        }
    };

    TileLayerView3D.prototype.depthModeForSublayer = function (n, mask, func) {
        var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
        return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);
    }

    TileLayerView3D.prototype.getTileTexture = function getTileTexture(size) {
        var textures = this._tileTextures[size];
        return textures && textures.length > 0 ? textures.pop() : null;
    };

    TileLayerView3D.prototype.saveTileTexture = function (texture) {
        var textures = this._tileTextures[texture.size[0]];
        if (!textures) {
            this._tileTextures[texture.size[0]] = [texture];
        } else {
            textures.push(texture);
        }
    };

    return TileLayerView3D;
});