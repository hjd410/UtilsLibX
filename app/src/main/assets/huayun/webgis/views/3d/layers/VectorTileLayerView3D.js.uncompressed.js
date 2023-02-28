define("com/huayun/webgis/views/3d/layers/VectorTileLayerView3D", [
  "./LayerView3D",
  "../../../utils/utils",
  "../../../utils/Constant",
  "../../../layers/support/EvaluationParameters",
  "../../../layers/support/CrossTileSymbolIndex",
  "../../../layers/support/PauseablePlacement",
  "../../../gl/draw",
  "../../../gl/mode",
  "../../../gl/SegmentVector",
  "../../../gl/members",
  "../../../data/ArrayType"
], function (LayerView3D, utils, Constant, EvaluationParameters, CrossTileSymbolIndex, PauseablePlacement,
             drawTypereturn, mode, SegmentVector, members, ArrayType) {
  var VectorTileLayerView3D = function (params) {
    LayerView3D.call(this, params);
    this.view = params.view;
    this.visible = params.visible;
    this.layer = params.layer;

    this.crossTileSymbolIndex = new CrossTileSymbolIndex();
    this.draw$1 = {
      fill: drawType.drawFill,
      line: drawType.drawLine,
      symbol: drawType.drawSymbols,
      background: drawType.drawBackground
    };

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
  };

  if (LayerView3D) VectorTileLayerView3D.__proto__ = LayerView3D;
  VectorTileLayerView3D.prototype = Object.create(LayerView3D && LayerView3D.prototype);
  VectorTileLayerView3D.prototype.constructor = VectorTileLayerView3D;

  VectorTileLayerView3D.prototype.refresh = function () {
    this._readyData();
    this.view.threeRender();
  };

  /**
   * 计算当前地图范围内的切片, 如果缓存内没有, 发送请求向服务器获取切片.
   * @private
   */
  VectorTileLayerView3D.prototype._readyData = function () {
    if (this.visible) {
      var tileInfo = this.layer.tileInfo,
        level = this.view.viewpoint.level,
        center = this.view.viewpoint.center,
        resolution = tileInfo.getResolution(level);
      if (!tileInfo) return; // 如果元数据未准备就绪就调用refresh, 不继续执行
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
        now: utils.now(),
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

      this.tileIDs = this.layer.sourceCache.updateTile(level, zoomedBounds, range, cx, cy);
      this._sourcesDirty = true;
      this.zoomedBounds = zoomedBounds;
      this.range = range;
      this.cx = cx;
      this.cy = cy;
    }
  };

  VectorTileLayerView3D.prototype._render = function () {
    if (this.visible) {
      var zoom = this.view.viewpoint.level;
      var sourceCache = this.layer.sourceCache;

      if (this._sourcesDirty) {
        this.tileIDs = sourceCache.update(zoom, this.zoomedBounds, this.range, this.cx, this.cy);
      }
      // this._placementDirty = this._updatePlacement(this.painter.transform, this.showCollisionBoxes, this._fadeDuration, this._crossSourceCollisions);
      var layerIds = this.layer._order;

      var coordsAscending = sourceCache.getVisibleCoordinates(false, this.transform);
      var coordsDescending = coordsAscending.slice().reverse();
      var coordsDescendingSymbol = sourceCache.getVisibleCoordinates(true, this.transform).reverse();

      this._placementDirty = this._updatePlacement(0);

      sourceCache.prepare(this.view.context);
      this.renderPass = "opaque";
      for (this.currentLayer = layerIds.length - 1; this.currentLayer >= 0; this.currentLayer--) {
        var layer$1 = this.layer._layers[layerIds[this.currentLayer]];
        if (layer$1.type !== "fill" && layer$1.type !== "background") {
          continue;
        }
        this._renderLayer(this, sourceCache, layer$1, coordsAscending, zoom);
      }

      this.renderPass = 'translucent';
      for (this.currentLayer = 0; this.currentLayer < layerIds.length; this.currentLayer++) {
        var layer$2 = this.layer._layers[layerIds[this.currentLayer]];
        if (layer$2.type === "fill" || layer$2.type === "background") {
          continue;
        }
        var coords$2 = layer$2.type === 'symbol' ? coordsDescendingSymbol : coordsDescending;
        this._renderLayer(this, sourceCache, layer$2, coords$2, zoom);
      }
      this.view.currentLayer += layerIds.length;
    }
  };

  VectorTileLayerView3D.prototype._renderLayer = function (painter, sourceCache, layer, coords, level) {
    if (layer.isHidden(level)) {
      return;
    }
    if (!coords.length) {
      return;
    }
    // this.id = layer.id;
    this.draw$1[layer.type](painter, sourceCache, layer, coords);
  };

  VectorTileLayerView3D.prototype._updatePlacement = function (fadeDuration) {
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
        var sourceCache = this.layer.sourceCache;
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
        this.placement = this.pauseablePlacement.commit(utils.now());
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
    return !this.pauseablePlacement.isDone() || this.placement.hasTransitions(utils.now());
  };

  VectorTileLayerView3D.prototype.depthModeForSublayer = function (n, mask, func) {
    var depth = 1 - ((1 + this.view.currentLayer + this.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
    return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);
  };

  VectorTileLayerView3D.prototype.zoom = function () {
    if (this.visible) {
      this.transform = this.view.viewpoint;
      var layerIds = this.layer._order;
      var sourceCache = this.layer.sourceCache;
      var zoom = this.view.viewpoint.zoom;

      var coordsAscending = sourceCache.updateTileMatrix(false, this.transform);
      var coordsDescending = coordsAscending.slice().reverse();
      var coordsDescendingSymbol = sourceCache.updateTileMatrix(true, this.transform).reverse();

      this.tileIDs = sourceCache.currentCoords;

      this.renderPass = "opaque";
      for (this.currentLayer = layerIds.length - 1; this.currentLayer >= 0; this.currentLayer--) {
        var layer$1 = this.layer._layers[layerIds[this.currentLayer]];
        if (layer$1.type !== "fill" && layer$1.type !== "background") {
          continue;
        }
        this._renderLayer(this, sourceCache, layer$1, coordsAscending, zoom);
      }

      this.renderPass = 'translucent';
      for (this.currentLayer = 0; this.currentLayer < layerIds.length; this.currentLayer++) {
        var layer$2 = this.layer._layers[layerIds[this.currentLayer]];
        if (layer$2.type === "fill" || layer$2.type === "background") {
          continue;
        }
        var coords$2 = layer$2.type === 'symbol' ? coordsDescendingSymbol : coordsDescending;
        this._renderLayer(this, sourceCache, layer$2, coords$2, zoom);
      }
      this.view.currentLayer += layerIds.length;
    }
  };

  return VectorTileLayerView3D;
});