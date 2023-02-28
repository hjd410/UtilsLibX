define("com/huayun/webgis/layers/support/TerrainSourceCacheTerrain", [
    "./TileSource",
    "./funcUtils",
    "./TileCache",
    "./Tile",
    "./SourceFeatureState",
    "com/huayun/webgis/layers/support/tileCover",
    "com/huayun/webgis/geometry/Point2D",
    "../../utils/utils",
    "../../work/createVerticesFromQuantizedTerrainMesh",
    "../../data/IndexDatatype",
    "../../gl/SegmentVector",
    "./TerrainMesh"
], function (TileSource, funcUtils, TileCache, Tile, SourceFeatureState, tileCover, Point2D,
             utils, createVerticesFromQuantizedTerrainMesh, IndexDatatype, SegmentVector, TerrainMesh) {

    function createVertexArrayForMesh(context, mesh, vertexCount) {
        var typedArray = mesh.vertices;
        var vertexBuffer = context.createVertexBuffer({
            length: typedArray.length / 7,
            bytesPerElement: 28,
            arrayBuffer: typedArray
        }, [
            {name: "position3DAndHeight", type: "Float32", components: 4, offset: 0},
            {name: "textureCoordAndEncodedNormals", type: "Float32", components: 3, offset: 16}
        ]);
        var indices = mesh.indices;
        var indexBuffer = context.createIndexBuffer({
            arrayBuffer: indices
        });
        var segments = SegmentVector.simpleSegment(0, 0, vertexCount, indices.length / 3);
        return {
            vertexBuffer: vertexBuffer,
            indexBuffer: indexBuffer,
            segments: segments
        }
    }

    function TerrainSourceCache(id, options, width, height, url, layer, view) {
        this.id = id;
        this._source = new TileSource.TerrainSourceCache(id, options, url, view);
        this._tiles = {};
        this._cache = new TileCache(0, this._unloadTile.bind(this));
        this._timers = {};
        this._cacheTimers = {};
        this._maxTileCacheSize = null;
        this._coveredTiles = {};
        this.updateCacheSize(width, height);
        this.layer = layer;
        this.view = view;
    }

    TerrainSourceCache.prototype.constructor = TerrainSourceCache;
    TerrainSourceCache.prototype.updateTileSize = function (size) {
        this._source.setSize(size);
    };
    TerrainSourceCache.prototype.onRemove = function onRemove(map) {
        if (this._source && this._source.onRemove) {
            this._source.onRemove(map);
        }
    };

    TerrainSourceCache.prototype.loaded = function loaded() {
        if (this._sourceErrored) {
            return true;
        }
        if (!this._sourceLoaded) {
            return false;
        }
        for (var t in this._tiles) {
            var tile = this._tiles[t];
            if (tile.state !== 'loaded' && tile.state !== 'errored') {
                return false;
            }
        }
        return true;
    };

    TerrainSourceCache.prototype.getSource = function getSource() {
        return this._source;
    };

    TerrainSourceCache.prototype.pause = function pause() {
        this._paused = true;
    };

    TerrainSourceCache.prototype.resume = function resume() {
        if (!this._paused) {
            return;
        }
        var shouldReload = this._shouldReloadOnResume;
        this._paused = false;
        this._shouldReloadOnResume = false;
        if (shouldReload) {
            this.reload();
        }
        if (this.transform) {
            this.update(this.transform);
        }
    };

    TerrainSourceCache.prototype._loadTile = function _loadTile(tile, callback) {
        return this._source.loadTile(tile, callback);
    };

    TerrainSourceCache.prototype._unloadTile = function _unloadTile(tile) {
        if (this._source.unloadTile) {
            return this._source.unloadTile(tile, function () {
            });
        }
    };

    TerrainSourceCache.prototype._abortTile = function _abortTile(tile) {
        if (this._source.abortTile) {
            return this._source.abortTile(tile, function () {
            });
        }
    };

    TerrainSourceCache.prototype.serialize = function serialize() {
        return this._source.serialize();
    };

    TerrainSourceCache.prototype.getIds = function getIds() {
        var tileIDs = [];
        for (var key in this._tiles) {
            tileIDs.push(this._tiles[key].tileID);
        }
        return tileIDs;
    };

    TerrainSourceCache.prototype.getRenderableIds = function getRenderableIds() {
        var ids = [];
        for (var id in this._tiles) {
            if (this._isIdRenderable(id)) {
                ids.push(id);
            }
        }
        return ids.sort(utils.compareKeyZoom);
    };

    TerrainSourceCache.prototype.hasRenderableParent = function hasRenderableParent(tileID) {
        var parentTile = this.findLoadedParent(tileID, 0);
        if (parentTile) {
            return this._isIdRenderable(parentTile.tileID.key);
        }
        return false;
    };

    TerrainSourceCache.prototype._isIdRenderable = function _isIdRenderable(id) {
        return this._tiles[id] && this._tiles[id].hasData() &&
            !this._coveredTiles[id] && (!this._tiles[id].holdingForFade());
    };

    TerrainSourceCache.prototype.reload = function reload() {
        if (this._paused) {
            this._shouldReloadOnResume = true;
            return;
        }

        this._cache.reset();

        for (var i in this._tiles) {
            if (this._tiles[i].state !== "errored") {
                this._reloadTile(i, 'reloading');
            }
        }
    };

    TerrainSourceCache.prototype._reloadTile = function _reloadTile(id, state) {
        var tile = this._tiles[id];
        if (!tile) {
            return;
        }
        if (tile.state !== 'loading') {
            tile.state = state;
        }

        this._loadTile(tile, this._tileLoaded.bind(this, tile, id, state));
    };

    TerrainSourceCache.prototype.updateTileUrl = function (url) {
        this._source.updateTileUrl(url);
    };

    TerrainSourceCache.prototype._tileLoaded = function _tileLoaded(tile, id, previousState, err, terrainData) {
        if (err) {
            tile.state = 'errored';
            if (err.status === 404) {
                this.update(this.transform);
            }
            return;
        }
        var canonical = tile.tileID.canonical;
        var rectangle = this.layer.tileInfo.tileXYToRectangle(canonical.x, canonical.y, canonical.z);
        tile.rectangle = rectangle;
        var result = createVerticesFromQuantizedTerrainMesh({
            minimumHeight: terrainData._minimumHeight,
            maximumHeight: terrainData._maximumHeight,
            quantizedVertices: terrainData._quantizedVertices,
            octEncodedNormals: terrainData._encodedNormals,
            includeWebMercatorT: true,
            indices: terrainData._indices,
            westIndices: terrainData._westIndices,
            southIndices: terrainData._southIndices,
            eastIndices: terrainData._eastIndices,
            northIndices: terrainData._northIndices,
            westSkirtHeight: terrainData._westSkirtHeight,
            southSkirtHeight: terrainData._southSkirtHeight,
            eastSkirtHeight: terrainData._eastSkirtHeight,
            northSkirtHeight: terrainData._northSkirtHeight,
            rectangle: rectangle,
            relativeToCenter: terrainData._boundingSphere.center,
            ellipsoid: null,
            exaggeration: 1
        });
        var vertexCountWithoutSkirts = terrainData._quantizedVertices.length / 3;
        var vertexCount = vertexCountWithoutSkirts + terrainData._westIndices.length + terrainData._southIndices.length + terrainData._eastIndices.length + terrainData._northIndices.length;
        var indicesTypedArray = IndexDatatype.createTypedArray(vertexCount, result.indices);

        var vertices = new Float32Array(result.vertices);
        var rtc = result.center;
        var minimumHeight = result.minimumHeight;
        var maximumHeight = result.maximumHeight;
        var boundingSphere = terrainData._boundingSphere;
        var obb = terrainData._orientedBoundingBox;
        var occludeePointInScaledSpace = terrainData._horizonOcclusionPoint;
        var stride = result.vertexStride;

        var mesh = new TerrainMesh(
            rtc,
            vertices,
            indicesTypedArray,
            result.indexCountWithoutSkirts,
            vertexCountWithoutSkirts,
            minimumHeight,
            maximumHeight,
            boundingSphere,
            occludeePointInScaledSpace,
            stride,
            obb,
            undefined,
            1,
            result.westIndicesSouthToNorth,
            result.southIndicesEastToWest,
            result.eastIndicesNorthToSouth,
            result.northIndicesWestToEast);
        tile.minimumHeight = mesh.minimumHeight;
        tile.maximumHeight = mesh.maximumHeight;
        tile.bucket = createVertexArrayForMesh(this.view.context, mesh, vertexCount);
        this.layer.layerView.drawHeightMap(this.layer.layerView, tile);
        this.layer.layerView._sourcesDirty = true;
        this.view.threeRender();
    };

    TerrainSourceCache.prototype.getTile = function getTile(tileID) {
        return this.getTileByID(tileID.key);
    };

    TerrainSourceCache.prototype.getTileByID = function getTileByID(id) {
        return this._tiles[id];
    };

    TerrainSourceCache.prototype.getZoom = function getZoom(transform) {
        return transform.level + transform.scaleZoom(transform.tileSize / this._source.tileSize);
    };

    TerrainSourceCache.prototype._retainLoadedChildren = function _retainLoadedChildren(idealTiles, zoom, maxCoveringZoom, retain) {
        for (var id in this._tiles) {
            var tile = this._tiles[id];
            if (retain[id] ||
                !tile.hasData() ||
                tile.tileID.overscaledZ <= zoom ||
                tile.tileID.overscaledZ > maxCoveringZoom
            ) {
                continue;
            }

            var topmostLoadedID = tile.tileID;
            while (tile && tile.tileID.overscaledZ > zoom + 1) {
                var parentID = tile.tileID.scaledTo(tile.tileID.overscaledZ - 1);

                tile = this._tiles[parentID.key];

                if (tile && tile.hasData()) {
                    topmostLoadedID = parentID;
                }
            }

            var tileID = topmostLoadedID;
            while (tileID.overscaledZ > zoom) {
                tileID = tileID.scaledTo(tileID.overscaledZ - 1);

                if (idealTiles[tileID.key]) {
                    retain[topmostLoadedID.key] = topmostLoadedID;
                    break;
                }
            }
        }
    };

    TerrainSourceCache.prototype.findLoadedParent = function findLoadedParent(tileID, minCoveringZoom) {
        for (var z = tileID.overscaledZ - 1; z >= minCoveringZoom; z--) {
            var parent = tileID.scaledTo(z);
            if (!parent) {
                return;
            }
            var id = String(parent.key);
            var tile = this._tiles[id];
            if (tile && tile.hasData()) {
                return tile;
            }
            if (this._cache.has(parent)) {
                return this._cache.get(parent);
            }
        }
    };

    TerrainSourceCache.prototype.updateCacheSize = function updateCacheSize(width, height) {
        var widthInTiles = Math.ceil(width / this._source.tileSize) + 1;
        var heightInTiles = Math.ceil(height / this._source.tileSize) + 1;
        var approxTilesInView = widthInTiles * heightInTiles;
        var commonZoomRange = 3;

        var viewDependentMaxSize = Math.floor(approxTilesInView * commonZoomRange);
        var maxSize = typeof this._maxTileCacheSize === 'number' ? Math.min(this._maxTileCacheSize, viewDependentMaxSize) : viewDependentMaxSize;
        this._cache.setMaxSize(maxSize);
    };

    TerrainSourceCache.prototype.update = function update(level, zoomedBounds, range, cx, cy) {
        this._coveredTiles = {};
        var idealTileIDs = tileCover.tileCover(level, zoomedBounds, range);
        idealTileIDs = idealTileIDs.sort(function (a, b) {
            a = a.canonical;
            b = b.canonical;
            return Math.sqrt((cx - a.x) * (cx - a.x) + (cy - a.y) * (cy - a.y)) - Math.sqrt((cx - b.x) * (cx - b.x) + (cy - b.y) * (cy - b.y));
        });

        var retain = this._updateRetainedTiles(idealTileIDs, level);

        for (var retainedId in retain) {
            this._tiles[retainedId].clearFadeHold();
        }

        // Remove the tiles we don't need anymore.
        var remove = utils.keysDifference(this._tiles, retain);
        for (var i$1 = 0, list$1 = remove; i$1 < list$1.length; i$1 += 1) {
            var tileID$1 = list$1[i$1];
            this._removeTile(tileID$1);
        }
    };


    TerrainSourceCache.prototype.updateTile = function updateTile(level, zoomedBounds, range, cx, cy) {
        this._coveredTiles = {};
        var idealTileIDs = tileCover.tileCover(level, zoomedBounds, range, "tms");

        idealTileIDs = idealTileIDs.sort(function (a, b) {
            a = a.canonical;
            b = b.canonical;
            return Math.sqrt((cx - a.x) * (cx - a.x) + (cy - a.y) * (cy - a.y)) - Math.sqrt((cx - b.x) * (cx - b.x) + (cy - b.y) * (cy - b.y));
        });
        this._updateRetainedTiles(idealTileIDs, level);
        return idealTileIDs;
    };

    TerrainSourceCache.prototype.releaseSymbolFadeTiles = function releaseSymbolFadeTiles() {
        for (var id in this._tiles) {
            if (this._tiles[id].holdingForFade()) {
                this._removeTile(id);
            }
        }
    };

    TerrainSourceCache.prototype._updateRetainedTiles = function _updateRetainedTiles(idealTileIDs, zoom) {
        var retain = {};
        var checked = {};
        var minCoveringZoom = Math.max(zoom - TerrainSourceCache.maxOverzooming, this._source.minzoom);
        var maxCoveringZoom = Math.max(zoom + TerrainSourceCache.maxUnderzooming, this._source.minzoom);

        var missingTiles = {};
        // countTile
        for (var i = 0, list = idealTileIDs; i < list.length; i += 1) {
            // for (var i = 20, list = idealTileIDs; i < 24; i += 1) {
            var tileID = list[i];
            var tile = this._addTile(tileID);
            retain[tileID.key] = tileID;
            if (tile.hasData()) {
                continue;
            }
            if (zoom < this._source.maxzoom) {
                missingTiles[tileID.key] = tileID;
            }
        }

        this._retainLoadedChildren(missingTiles, zoom, maxCoveringZoom, retain);

        for (var i$1 = 0, list$1 = idealTileIDs; i$1 < list$1.length; i$1 += 1) {
            // for (var i$1 = 20, list$1 = idealTileIDs; i$1 < 24; i$1 += 1) {
            var tileID$1 = list$1[i$1];

            var tile$1 = this._tiles[tileID$1.key];

            if (tile$1.hasData()) {
                continue;
            }

            // The tile we require is not yet loaded or does not exist;
            // Attempt to find children that fully cover it.

            if (zoom + 1 > this._source.maxzoom) {
                // We're looking for an overzoomed child tile.
                var childCoord = tileID$1.children(this._source.maxzoom)[0];
                var childTile = this.getTile(childCoord);
                if (!!childTile && childTile.hasData()) {
                    retain[childCoord.key] = childCoord;
                    continue; // tile is covered by overzoomed child
                }
            } else {
                // check if all 4 immediate children are loaded (i.e. the missing ideal tile is covered)
                var children = tileID$1.children(this._source.maxzoom);

                if (retain[children[0].key] &&
                    retain[children[1].key] &&
                    retain[children[2].key] &&
                    retain[children[3].key]) {
                    continue;
                } // tile is covered by children
            }

            // We couldn't find child tiles that entirely cover the ideal tile; look for parents now.

            // As we ascend up the tile pyramid of the ideal tile, we check whether the parent
            // tile has been previously requested (and errored because we only loop over tiles with no data)
            // in order to determine if we need to request its parent.
            var parentWasRequested = tile$1.wasRequested();

            for (var overscaledZ = tileID$1.overscaledZ - 1; overscaledZ >= minCoveringZoom; --overscaledZ) {
                var parentId = tileID$1.scaledTo(overscaledZ);

                // Break parent tile ascent if this route has been previously checked by another child.
                if (checked[parentId.key]) {
                    break;
                }
                checked[parentId.key] = true;

                tile$1 = this.getTile(parentId);
                if (!tile$1 && parentWasRequested) {
                    tile$1 = this._addTile(parentId);
                }
                if (tile$1) {
                    retain[parentId.key] = parentId;
                    // Save the current values, since they're the parent of the next iteration
                    // of the parent tile ascent loop.
                    parentWasRequested = tile$1.wasRequested();
                    if (tile$1.hasData()) {
                        break;
                    }
                }
            }
        }

        return retain;
    };

    TerrainSourceCache.prototype._reAddTile = function _reAddTile(tileID) {
        var tile = new Tile(tileID, this._source.tileSize * tileID.overscaleFactor());
        this._loadTile(tile, this._tileReAddLoaded.bind(this, tile, tileID.key, tile.state));
    };

    TerrainSourceCache.prototype._tileReAddLoaded = function _tileLoaded(tile, id, previousState, err) {
        this._removeTile(id);
        this._tiles[tile.tileID.key] = tile;
        if (err) {
            tile.state = 'errored';
            if (err.status === 404) {
                this.update(this.transform);
            }
            return;
        }
        tile.timeAdded = utils.now();
        this._setTileReloadTimer(id, tile);
        this.layer.layerViews[0]._sourcesDirty = true;
        this.view.threeRender();
    };

    TerrainSourceCache.prototype._addTile = function _addTile(tileID) {
        var tile = this._tiles[tileID.key];
        if (tile) {
            return tile;
        }
        tile = this._cache.getAndRemove(tileID);
        if (tile) {
            this._setTileReloadTimer(tileID.key, tile);
            tile.tileID = tileID;
            if (this._cacheTimers[tileID.key]) {
                clearTimeout(this._cacheTimers[tileID.key]);
                delete this._cacheTimers[tileID.key];
                this._setTileReloadTimer(tileID.key, tile);
            }
        }

        var cached = Boolean(tile);
        if (!cached) {
            tile = new Tile(tileID, this._source.tileSize * tileID.overscaleFactor());
            this._loadTile(tile, this._tileLoaded.bind(this, tile, tileID.key, tile.state));
        }
        if (!tile) {
            return (null);
        }

        tile.uses++;
        this._tiles[tileID.key] = tile;
        return tile;
    };

    TerrainSourceCache.prototype._setTileReloadTimer = function _setTileReloadTimer(id, tile) {
        var this$1 = this;

        if (id in this._timers) {
            clearTimeout(this._timers[id]);
            delete this._timers[id];
        }

        var expiryTimeout = tile.getExpiryTimeout();
        if (expiryTimeout) {
            this._timers[id] = setTimeout(function () {
                this$1._reloadTile(id, 'expired');
                delete this$1._timers[id];
            }, expiryTimeout);
        }
    };

    TerrainSourceCache.prototype._removeTile = function _removeTile(id) {
        var tile = this._tiles[id];
        if (!tile) {
            return;
        }
        tile.uses--;
        delete this._tiles[id];
        if (this._timers[id]) {
            clearTimeout(this._timers[id]);
            delete this._timers[id];
        }

        if (tile.uses > 0) {
            return;
        }

        if (tile.hasData()) {
            // this._cache.add(tile.tileID, tile, tile.getExpiryTimeout());
        } else {
            tile.aborted = true;
            this._abortTile(tile);
            this._unloadTile(tile);
        }
    };

    TerrainSourceCache.prototype.clearTiles = function clearTiles() {
        this._shouldReloadOnResume = false;
        this._paused = false;
        for (var id in this._tiles) {
            this._removeTile(id);
        }
        this._cache.reset();
    };

    TerrainSourceCache.prototype.clearOtherLevel = function clearOtherLevel(level) {
        this._shouldReloadOnResume = false;
        this._paused = false;
        for (var id in this._tiles) {
            var tile = this._tiles[id];
            if (tile.tileID.canonical.z !== level) {
                this._removeTile(id);
            }
        }
        // this._cache.reset();
    };

    TerrainSourceCache.prototype.tilesIn = function tilesIn(pointQueryGeometry, maxPitchScaleFactor, has3DLayer) {
        var this$1 = this;


        var tileResults = [];

        var transform = this.transform;
        if (!transform) {
            return tileResults;
        }

        var cameraPointQueryGeometry = has3DLayer ?
            transform.getCameraQueryGeometry(pointQueryGeometry) :
            pointQueryGeometry;

        var queryGeometry = pointQueryGeometry.map(function (p) {
            return transform.pointCoordinate(p);
        });
        var cameraQueryGeometry = cameraPointQueryGeometry.map(function (p) {
            return transform.pointCoordinate(p);
        });

        var ids = this.getIds();

        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;

        for (var i$1 = 0, list = cameraQueryGeometry; i$1 < list.length; i$1 += 1) {
            var p = list[i$1];

            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }

        var loop = function (i) {
            var tile = this$1._tiles[ids[i]];
            if (tile.holdingForFade()) {
                // Tiles held for fading are covered by tiles that are closer to ideal
                return;
            }
            var tileID = tile.tileID;
            var scale = Math.pow(2, transform.level - tile.tileID.overscaledZ);
            var queryPadding = maxPitchScaleFactor * tile.queryPadding * __chunk_1.EXTENT / tile.tileSize / scale;

            var tileSpaceBounds = [
                tileID.getTilePoint(new __chunk_1.MercatorCoordinate(minX, minY)),
                tileID.getTilePoint(new __chunk_1.MercatorCoordinate(maxX, maxY))
            ];

            if (tileSpaceBounds[0].x - queryPadding < __chunk_1.EXTENT && tileSpaceBounds[0].y - queryPadding < __chunk_1.EXTENT &&
                tileSpaceBounds[1].x + queryPadding >= 0 && tileSpaceBounds[1].y + queryPadding >= 0) {

                var tileSpaceQueryGeometry = queryGeometry.map(function (c) {
                    return tileID.getTilePoint(c);
                });
                var tileSpaceCameraQueryGeometry = cameraQueryGeometry.map(function (c) {
                    return tileID.getTilePoint(c);
                });

                tileResults.push({
                    tile: tile,
                    tileID: tileID,
                    queryGeometry: tileSpaceQueryGeometry,
                    cameraQueryGeometry: tileSpaceCameraQueryGeometry,
                    scale: scale
                });
            }
        };

        for (var i = 0; i < ids.length; i++) loop(i);

        return tileResults;
    };

    TerrainSourceCache.prototype.getVisibleCoordinates = function getVisibleCoordinates(symbolLayer, transform) {
        var this$1 = this;
        var coords = this.getRenderableIds().map(function (id) {
            return this$1._tiles[id].tileID;
        });
        this.currentCoords = [];
        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            var wrap = coord.toUnwrapped();
            if (!coord.geometry) {
                coord.geometry = this.layer.tileInfo.getGeometry(wrap, transform.level);
            }
            coord.posMatrix = transform.calculatePosMatrix(wrap, coord.geometry, true);
            this.currentCoords.push(coord);
        }
        return coords;
    };

    TerrainSourceCache.prototype.updateTileMatrix = function updateTileMatrix(symbolLayer, transform) {
        var coords = this.currentCoords;
        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            coord.posMatrix = transform.updatePosMatrix(coord.toUnwrapped(), coord.geometry, true);
        }
        return coords;
    };

    TerrainSourceCache.prototype.hasTransition = function hasTransition() {
        if (this._source.hasTransition()) {
            return true;
        }
        for (var id in this._tiles) {
            var tile = this._tiles[id];
            if (tile.fadeEndTime !== undefined && tile.fadeEndTime >= utils.now()) {
                return true;
            }
        }
        return false;
    };

    TerrainSourceCache.maxOverzooming = 10;
    TerrainSourceCache.maxUnderzooming = 3;
    return TerrainSourceCache;
});
