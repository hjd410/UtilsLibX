define("com/huayun/webgis/layers/support/VectorBuildSourceCache", [
    "./TileSource",
    "./funcUtils",
    "./TileCache",
    "./Tile",
    "./SourceFeatureState",
    "com/huayun/webgis/layers/support/tileCover",
    "com/huayun/webgis/geometry/Point2D",
    "../../utils/utils",
    "../../utils/Constant"
], function (TileSource, funcUtils, TileCache, Tile, SourceFeatureState, tileCover, Point2D, utils, Constant) {

    function keysDifference(obj, other) {
        var difference = [];
        for (var i in obj) {
            if (!(i in other)) {
                difference.push(i);
            }
        }
        return difference;
    }

    var sourceTypes = {
        vector: TileSource.VectorTileSource,
        raster: TileSource.RasterTileSource
    };

    var now = self.performance && self.performance.now ?
        self.performance.now.bind(self.performance) :
        Date.now.bind(Date);

    function compareKeyZoom(a, b) {
        return ((a % 32) - (b % 32)) || (b - a);
    }

    function isRasterType(type) {
        return type === 'raster' || type === 'image' || type === 'video';
    }

    var create = function (id, specification, dispatcher, eventedParent, url, layer) {
        var source = new sourceTypes[specification.type](id, (specification), dispatcher, url, layer);

        if (source.id !== id) {
            throw new Error(("Expected Source id to be " + id + " instead of " + (source.id)));
        }

        funcUtils.bindAll(['load', 'abort', 'unload', 'serialize', 'prepare'], source);
        return source;
    };

    function SourceCache(id, options, dispatcher, width, height, url, layer) {
        this.id = id;
        this.dispatcher = dispatcher;
        this._source = create(id, options, dispatcher, this, url, layer);
        this._tiles = {};
        this._cache = new TileCache(0, this._unloadTile.bind(this));
        this._timers = {};
        this._cacheTimers = {};
        this._maxTileCacheSize = null;
        this._coveredTiles = {};
        this._state = new SourceFeatureState();
        this.updateCacheSize(width, height);
        this.layer = layer;
    }

    SourceCache.prototype.constructor = SourceCache;

    SourceCache.prototype.onAdd = function onAdd(map) {
        /*this.map = map;
        this._maxTileCacheSize = map ? map._maxTileCacheSize : null;
        if (this._source && this._source.onAdd) {
            this._source.onAdd(map);
        }*/
    };

    SourceCache.prototype.updateTileSize = function (size) {
        this._source.setSize(size);
    };

    SourceCache.prototype.onRemove = function onRemove(map) {
        if (this._source && this._source.onRemove) {
            this._source.onRemove(map);
        }
    };

    SourceCache.prototype.loaded = function loaded() {
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

    SourceCache.prototype.getSource = function getSource() {
        return this._source;
    };

    SourceCache.prototype.pause = function pause() {
        this._paused = true;
    };

    SourceCache.prototype.resume = function resume(view) {
        if (!this._paused) {
            return;
        }
        var shouldReload = this._shouldReloadOnResume;
        this._paused = false;
        this._shouldReloadOnResume = false;
        if (shouldReload) {
            this.reload();
        }
        /*if (this.transform) {
            this.update(this.transform.level, view.zoomedBounds, view.range, view.cx, view.cy);
        }*/
    };

    SourceCache.prototype._loadTile = function _loadTile(tile, callback) {
        return this._source.loadTile(tile, callback);
    };

    SourceCache.prototype._unloadTile = function _unloadTile(tile) {
        if (this._source.unloadTile) {
            return this._source.unloadTile(tile, function () {
            });
        }
    };

    SourceCache.prototype._abortTile = function _abortTile(tile) {
        if (this._source.abortTile) {
            return this._source.abortTile(tile, function () {
            });
        }
    };

    SourceCache.prototype.serialize = function serialize() {
        return this._source.serialize();
    };

    SourceCache.prototype.prepare = function prepare(context) {
        if (this._source.prepare) {
            this._source.prepare();
        }

        this._state.coalesceChanges(this._tiles, this.map ? this.map.painter : null);
        for (var i in this._tiles) {
            var tile = this._tiles[i];
            tile.upload(context);
        }
    };

    SourceCache.prototype.getIds = function getIds() {
        var tileIDs = [];
        for (var key in this._tiles) {
            tileIDs.push(this._tiles[key].tileID);
        }
        return tileIDs;
    };

    SourceCache.prototype.getRenderableIds = function getRenderableIds(symbolLayer) {
        var this$1 = this;

        var ids = [];
        for (var id in this._tiles) {
            if (this._isIdRenderable(id, symbolLayer)) {
                ids.push(id);
            }
        }
        if (symbolLayer) {
            return ids.sort(function (a_, b_) {
                var a = this$1._tiles[a_].tileID;
                var b = this$1._tiles[b_].tileID;
                var rotatedA = (new Point2D(a.canonical.x, a.canonical.y))._rotate(0);
                var rotatedB = (new Point2D(b.canonical.x, b.canonical.y))._rotate(0);
                return a.overscaledZ - b.overscaledZ || rotatedB.y - rotatedA.y || rotatedB.x - rotatedA.x;
            });
        }
        return ids.sort(compareKeyZoom);
    };

    SourceCache.prototype.zoomRenderableIds = function zoomRenderableIds(symbolLayer) {
        var this$1 = this;

        var ids = [];
        for (var id in this._tiles) {
            if (this._isIdRenderable(+id, symbolLayer)) {
                ids.push(+id);
            }
        }
        if (symbolLayer) {
            return ids.sort(function (a_, b_) {
                var a = this$1._tiles[a_].tileID;
                var b = this$1._tiles[b_].tileID;
                var rotatedA = (new Point2D(a.canonical.x, a.canonical.y))._rotate(0);
                var rotatedB = (new Point2D(b.canonical.x, b.canonical.y))._rotate(0);
                return a.overscaledZ - b.overscaledZ || rotatedB.y - rotatedA.y || rotatedB.x - rotatedA.x;
            });
        }
        return ids.sort(compareKeyZoom);
    };

    SourceCache.prototype.hasRenderableParent = function hasRenderableParent(tileID) {
        var parentTile = this.findLoadedParent(tileID, 0);
        if (parentTile) {
            return this._isIdRenderable(parentTile.tileID.key);
        }
        return false;
    };

    SourceCache.prototype._isIdRenderable = function _isIdRenderable(id, symbolLayer) {
        return this._tiles[id] && this._tiles[id].hasData() &&
            !this._coveredTiles[id] && (symbolLayer || !this._tiles[id].holdingForFade());
    };

    SourceCache.prototype.reload = function reload() {
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

    SourceCache.prototype.updateTileUrl = function (url) {
        this._source.updateTileUrl(url);
    };

    SourceCache.prototype._reloadTile = function _reloadTile(id, state) {
        var tile = this._tiles[id];

        // this potentially does not address all underlying
        // issues https://github.com/mapbox/mapbox-gl-js/issues/4252
        // - hard to tell without repro steps
        if (!tile) {
            return;
        }

        // The difference between "loading" tiles and "reloading" or "expired"
        // tiles is that "reloading"/"expired" tiles are "renderable".
        // Therefore, a "loading" tile cannot become a "reloading" tile without
        // first becoming a "loaded" tile.
        if (tile.state !== 'loading') {
            tile.state = state;
        }

        this._loadTile(tile, this._tileLoaded.bind(this, tile, id, state));
    };

    SourceCache.prototype._tileLoaded = function _tileLoaded(tile, id, previousState, err) {
        if (err) {
            tile.state = 'errored';
            console.log(err);
            return;
        }
        tile.timeAdded = now();
        if (previousState === 'expired') {
            tile.refreshedUponExpiration = true;
        }
        this._setTileReloadTimer(id, tile);
        if (this.getSource().type === 'raster-dem' && tile.dem) {
            this._backfillDEM(tile);
        }
        this._state.initializeTileState(tile, this.map ? this.map.painter : null);
        this.layer.layerView._sourcesDirty = true;
        this.layer.layerView.view.threeRender();
        // this._source.fire(new __chunk_1.Event('data', {dataType: 'source', tile: tile, coord: tile.tileID}));
    };

    /**
     * For raster terrain source, backfill DEM to eliminate visible tile boundaries
     * @private
     */
    SourceCache.prototype._backfillDEM = function _backfillDEM(tile) {
        var renderables = this.getRenderableIds();
        for (var i = 0; i < renderables.length; i++) {
            var borderId = renderables[i];
            if (tile.neighboringTiles && tile.neighboringTiles[borderId]) {
                var borderTile = this.getTileByID(borderId);
                fillBorder(tile, borderTile);
                fillBorder(borderTile, tile);
            }
        }

        function fillBorder(tile, borderTile) {
            tile.needsHillshadePrepare = true;
            var dx = borderTile.tileID.canonical.x - tile.tileID.canonical.x;
            var dy = borderTile.tileID.canonical.y - tile.tileID.canonical.y;
            var dim = Math.pow(2, tile.tileID.canonical.z);
            var borderId = borderTile.tileID.key;
            if (dx === 0 && dy === 0) {
                return;
            }

            if (Math.abs(dy) > 1) {
                return;
            }
            if (Math.abs(dx) > 1) {
                // Adjust the delta coordinate for world wraparound.
                if (Math.abs(dx + dim) === 1) {
                    dx += dim;
                } else if (Math.abs(dx - dim) === 1) {
                    dx -= dim;
                }
            }
            if (!borderTile.dem || !tile.dem) {
                return;
            }
            tile.dem.backfillBorder(borderTile.dem, dx, dy);
            if (tile.neighboringTiles && tile.neighboringTiles[borderId]) {
                tile.neighboringTiles[borderId].backfilled = true;
            }
        }
    };
    /**
     * Get a specific tile by TileID
     */
    SourceCache.prototype.getTile = function getTile(tileID) {
        return this.getTileByID(tileID.key);
    };

    /**
     * Get a specific tile by id
     */
    SourceCache.prototype.getTileByID = function getTileByID(id) {
        return this._tiles[id];
    };

    /**
     * get the zoom level adjusted for the difference in map and source tilesizes
     */
    SourceCache.prototype.getZoom = function getZoom(transform) {
        return transform.level + transform.scaleZoom(transform.tileSize / this._source.tileSize);
    };

    /**
     * For a given set of tiles, retain children that are loaded and have a zoom
     * between `zoom` (exclusive) and `maxCoveringZoom` (inclusive)
     */
    SourceCache.prototype._retainLoadedChildren = function _retainLoadedChildren(
        idealTiles,
        zoom,
        maxCoveringZoom,
        retain
    ) {
        for (var id in this._tiles) {
            var tile = this._tiles[id];

            // only consider renderable tiles up to maxCoveringZoom
            if (retain[id] ||
                !tile.hasData() ||
                tile.tileID.overscaledZ <= zoom ||
                tile.tileID.overscaledZ > maxCoveringZoom
            ) {
                continue;
            }

            // loop through parents and retain the topmost loaded one if found
            var topmostLoadedID = tile.tileID;
            while (tile && tile.tileID.overscaledZ > zoom + 1) {
                var parentID = tile.tileID.scaledTo(tile.tileID.overscaledZ - 1);

                tile = this._tiles[parentID.key];

                if (tile && tile.hasData()) {
                    topmostLoadedID = parentID;
                }
            }

            // loop through ancestors of the topmost loaded child to see if there's one that needed it
            var tileID = topmostLoadedID;
            while (tileID.overscaledZ > zoom) {
                tileID = tileID.scaledTo(tileID.overscaledZ - 1);

                if (idealTiles[tileID.key]) {
                    // found a parent that needed a loaded child; retain that child
                    retain[topmostLoadedID.key] = topmostLoadedID;
                    break;
                }
            }
        }
    };

    /**
     * Find a loaded parent of the given tile (up to minCoveringZoom)
     */
    SourceCache.prototype.findLoadedParent = function findLoadedParent(tileID, minCoveringZoom) {
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

    /**
     * Resizes the tile cache based on the current viewport's size
     * or the maxTileCacheSize option passed during map creation
     *
     * Larger viewports use more tiles and need larger caches. Larger viewports
     * are more likely to be found on devices with more memory and on pages where
     * the map is more important.
     */
    SourceCache.prototype.updateCacheSize = function updateCacheSize(width, height) {
        var widthInTiles = Math.ceil(width / this._source.tileSize) + 1;
        var heightInTiles = Math.ceil(height / this._source.tileSize) + 1;
        var approxTilesInView = widthInTiles * heightInTiles;
        var commonZoomRange = 5;

        var viewDependentMaxSize = Math.floor(approxTilesInView * commonZoomRange);
        var maxSize = typeof this._maxTileCacheSize === 'number' ? Math.min(this._maxTileCacheSize, viewDependentMaxSize) : viewDependentMaxSize;

        this._cache.setMaxSize(maxSize);
    };

    SourceCache.prototype.handleWrapJump = function handleWrapJump(lng) {
        var prevLng = this._prevLng === undefined ? lng : this._prevLng;
        var lngDifference = lng - prevLng;
        var worldDifference = lngDifference / 360;
        var wrapDelta = Math.round(worldDifference);
        this._prevLng = lng;

        if (wrapDelta) {
            var tiles = {};
            for (var key in this._tiles) {
                var tile = this._tiles[key];
                tile.tileID = tile.tileID.unwrapTo(tile.tileID.wrap + wrapDelta);
                tiles[tile.tileID.key] = tile;
            }
            this._tiles = tiles;

            // Reset tile reload timers
            for (var id in this._timers) {
                clearTimeout(this._timers[id]);
                delete this._timers[id];
            }
            for (var id$1 in this._tiles) {
                var tile$1 = this._tiles[id$1];
                this._setTileReloadTimer(id$1, tile$1);
            }
        }
    };

    /**
     * Removes tiles that are outside the viewport and adds new tiles that
     * are inside the viewport.
     */
    SourceCache.prototype.update = function update(level, zoomedBounds, range, cx, cy) {
        this._coveredTiles = {};

        var idealTileIDs = tileCover(level, zoomedBounds, range);
        idealTileIDs = idealTileIDs.sort(function (a, b) {
            a = a.canonical;
            b = b.canonical;
            return Math.sqrt((cx - a.x) * (cx - a.x) + (cy - a.y) * (cy - a.y)) - Math.sqrt((cx - b.x) * (cx - b.x) + (cy - b.y) * (cy - b.y));
        });

        // debugger;
        var retain = this._updateRetainedTiles(idealTileIDs, level);

        var zoom = level;
        var minCoveringZoom = 0;
        var maxCoveringZoom = 15;

        if (isRasterType(this._source.type)) {
            var parentsForFading = {};
            var fadingTiles = {};
            var ids = Object.keys(retain);
            for (var i = 0, list = ids; i < list.length; i += 1) {
                var id = list[i];

                var tileID = retain[id];

                var tile = this._tiles[id];
                if (!tile || tile.fadeEndTime && tile.fadeEndTime <= utils.now()) {
                    continue;
                }

                // if the tile is loaded but still fading in, find parents to cross-fade with it
                var parentTile = this.findLoadedParent(tileID, minCoveringZoom);
                if (parentTile) {
                    this._addTile(parentTile.tileID);
                    parentsForFading[parentTile.tileID.key] = parentTile.tileID;
                }

                fadingTiles[id] = tileID;
            }

            // for tiles that are still fading in, also find children to cross-fade with
            this._retainLoadedChildren(fadingTiles, zoom, maxCoveringZoom, retain);

            for (var id$1 in parentsForFading) {
                if (!retain[id$1]) {
                    // If a tile is only needed for fading, mark it as covered so that it isn't rendered on it's own.
                    this._coveredTiles[id$1] = true;
                    retain[id$1] = parentsForFading[id$1];
                }
            }
        }

        for (var retainedId in retain) {
            // Make sure retained tiles always clear any existing fade holds
            // so that if they're removed again their fade timer starts fresh.
            this._tiles[retainedId].clearFadeHold();
        }

        // Remove the tiles we don't need anymore.
        var remove = keysDifference(this._tiles, retain);
        for (var i$1 = 0, list$1 = remove; i$1 < list$1.length; i$1 += 1) {
            var tileID$1 = list$1[i$1];

            var tile$1 = this._tiles[tileID$1];
            /*if (tile$1.hasSymbolBuckets && !tile$1.holdingForFade()) {
                tile$1.setHoldDuration(300);
            } else if (!tile$1.hasSymbolBuckets || tile$1.symbolFadeFinished()) {
                this._removeTile(tileID$1);
            }*/
            this._removeTile(tileID$1);
        }
        return idealTileIDs;
    };


    SourceCache.prototype.updateTile = function updateTile(level, zoomedBounds, range, cx, cy) {
        this._coveredTiles = {};

        var idealTileIDs = tileCover(level, zoomedBounds, range);

        idealTileIDs = idealTileIDs.sort(function (a, b) {
            a = a.canonical;
            b = b.canonical;
            return Math.sqrt((cx - a.x) * (cx - a.x) + (cy - a.y) * (cy - a.y)) - Math.sqrt((cx - b.x) * (cx - b.x) + (cy - b.y) * (cy - b.y));
        });
        this._updateRetainedTiles(idealTileIDs, level);
        return idealTileIDs;
    };

    SourceCache.prototype.releaseSymbolFadeTiles = function releaseSymbolFadeTiles() {
        for (var id in this._tiles) {
            if (this._tiles[id].holdingForFade()) {
                this._removeTile(id);
            }
        }
    };

    SourceCache.prototype._updateRetainedTiles = function _updateRetainedTiles(idealTileIDs, zoom) {
        var retain = {};
        var checked = {};
        var minCoveringZoom = Math.max(zoom - SourceCache.maxOverzooming, this._source.minzoom);
        var maxCoveringZoom = Math.max(zoom + SourceCache.maxUnderzooming, this._source.minzoom);

        var missingTiles = {};

        // countTile
        for (var i = 0, list = idealTileIDs; i < list.length; i += 1) {
            // for (var i = 0, list = idealTileIDs; i < 1; i += 1) {
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
            // for (var i$1 = 0, list$1 = idealTileIDs; i$1 < 1; i$1 += 1) {
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

    SourceCache.prototype._addTile = function _addTile(tileID) {
        var tile = this._tiles[tileID.key];
        if (tile) {
            return tile;
        }
        tile = this._cache.getAndRemove(tileID);
        if (tile) {
            this._setTileReloadTimer(tileID.key, tile);
            tile.tileID = tileID;
            this._state.initializeTileState(tile, this.map ? this.map.painter : null);
            if (this._cacheTimers[tileID.key]) {
                clearTimeout(this._cacheTimers[tileID.key]);
                delete this._cacheTimers[tileID.key];
                this._setTileReloadTimer(tileID.key, tile);
            }
        }

        var cached = Boolean(tile);
        if (!cached) {
            // console.log(Object.keys(this._tiles).length);
            tile = new Tile(tileID, this._source.tileSize * tileID.overscaleFactor());
            this._loadTile(tile, this._tileLoaded.bind(this, tile, tileID.key, tile.state));
        }

        // Impossible, but silence flow.
        if (!tile) {
            return (null);
        }

        tile.uses++;
        this._tiles[tileID.key] = tile;
        if (!cached) {
            /*this._source.fire(new __chunk_1.Event('dataloading', {
                tile: tile,
                coord: tile.tileID,
                dataType: 'source'
            }));*/
        }

        return tile;
    };

    SourceCache.prototype._reAddTile = function _reAddTile(tileID) {
        var tile = new Tile(tileID, this._source.tileSize * tileID.overscaleFactor());
        this._loadTile(tile, this._tileReAddLoaded.bind(this, tile, tileID.key, tile.state));
    };

    SourceCache.prototype._tileReAddLoaded = function _tileLoaded(tile, id, previousState, err) {
        this._removeTile(id);
        this._tiles[tile.tileID.key] = tile;
        if (err) {
            tile.state = 'errored';
            if ((err).status !== 404) {
                this._source.fire(new __chunk_1.ErrorEvent(err, {tile: tile}));
            }
            // continue to try loading parent/children tiles if a tile doesn't exist (404)
            else {
                this.update(this.transform);
            }
            return;
        }

        tile.timeAdded = now();
        if (previousState === 'expired') {
            tile.refreshedUponExpiration = true;
        }
        this._setTileReloadTimer(id, tile);
        this._state.initializeTileState(tile, this.map ? this.map.painter : null);
        this.layer.layerView._sourcesDirty = true;
        this.layer.layerView.view.threeRender();
        // this._source.fire(new __chunk_1.Event('data', {dataType: 'source', tile: tile, coord: tile.tileID}));
    };

    SourceCache.prototype._setTileReloadTimer = function _setTileReloadTimer(id, tile) {
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

    /**
     * Remove a tile, given its id, from the pyramid
     * @private
     */
    SourceCache.prototype._removeTile = function _removeTile(id) {
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
            this._cache.add(tile.tileID, tile, tile.getExpiryTimeout());
        } else {
            tile.aborted = true;
            this._abortTile(tile);
            this._unloadTile(tile);
        }
    };

    /**
     * Remove all tiles from this pyramid
     */
    SourceCache.prototype.clearTiles = function clearTiles() {
        this._shouldReloadOnResume = false;
        this._paused = false;

        for (var id in this._tiles) {
            this._removeTile(id);
        }

        this._cache.reset();
    };


    SourceCache.prototype._getTilePoint = function(coord, tileID, resolution) {
        var col = this.layer.tileInfo.getColForX(coord.x, resolution);
        var row = this.layer.tileInfo.getRowForY(coord.y, resolution);
        var x = tileID.canonical.x,
            y = tileID.canonical.y;
        return new Point2D((col - x) * Constant.layout.EXTENT, (row - y) * Constant.layout.EXTENT);
    };

    SourceCache.prototype.tilesIn = function(pointQueryGeometry, maxPitchScaleFactor, has3DLayer, resolution, zoom) {
        var tileResults = [];
        var self = this;
        var transform = this.transform;
        if (!transform) {
            return tileResults;
        }

        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        for (var i$1 = 0, list = pointQueryGeometry; i$1 < list.length; i$1 += 1) {
            var p = list[i$1];
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }

        // 查询范围包含的切片
        var colRange = [minX, maxX].map(function (item) {
            return Math.floor(self.layer.tileInfo.getColForX(item, resolution));
        });
        var rowRange = [maxY, minY].map(function (item) {
            return Math.floor(self.layer.tileInfo.getRowForY(item, resolution));
        });
        for (var i = colRange[0]; i <= colRange[1]; i++) {
            for (var j = rowRange[0]; j <= rowRange[1]; j++) {
                var tile = this._tiles[zoom+"/"+i+"/"+j];
                var tileID = tile.tileID;
                var tileSpaceQueryGeometry = pointQueryGeometry.map(function (c) {
                    return self._getTilePoint(c, tileID, resolution);
                });
                tileResults.push({
                    tile: tile,
                    tileID: tile.tileID,
                    queryGeometry: tileSpaceQueryGeometry,
                    cameraQueryGeometry: tileSpaceQueryGeometry,
                    scale: 1
                });
            }
        }
        return tileResults;

        /*var cameraPointQueryGeometry = pointQueryGeometry;

        var queryGeometry = pointQueryGeometry.map(function (p) {
            return transform.screenToScene(p.x, p.y);
        });
        var cameraQueryGeometry = cameraPointQueryGeometry.map(function (p) {
            return transform.screenToScene(p.x, p.y);
        });
*/
        /*var ids = this.getIds();

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
            debugger;
            var tile = this$1._tiles[ids[i]];
            if (tile.holdingForFade()) {
                // Tiles held for fading are covered by tiles that are closer to ideal
                return;
            }
            var tileID = tile.tileID;
            var scale = Math.pow(2, transform.level - tile.tileID.overscaledZ);
            var queryPadding = maxPitchScaleFactor * tile.queryPadding * Constant.layout.EXTENT / tile.tileSize / scale;

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

        return tileResults;*/
        /*var x = this.layer.tileInfo.getColForSceneX(cameraQueryGeometry[0].x,resolution),
            y = this.layer.tileInfo.getRowForSceneY(cameraQueryGeometry[0].y,resolution);*/

        /*var x = this.layer.tileInfo.getColForX(cameraQueryGeometry[0].x, resolution),
            y = this.layer.tileInfo.getRowForY(cameraQueryGeometry[0].y, resolution);
        var col = Math.floor(x),
            row = Math.floor(y);
        var deltaX = x - col,
            deltaY = y - row;
        var tile = this$1._tiles[zoom+"/"+col+"/"+row];
        /!*var tileSpaceQueryGeometry = queryGeometry.map(function (c) {
            return tileID.getTilePoint(c);
        });
        var tileSpaceCameraQueryGeometry = cameraQueryGeometry.map(function (c) {
            return tileID.getTilePoint(c);
        });*!/
        var tileSpaceQueryGeometry = [{
            x: Constant.layout.EXTENT * deltaX,
            y: Constan/t.layout.EXTENT * deltaY
        }];

        var tileSpaceCameraQueryGeometry = tileSpaceQueryGeometry;

        tileResults.push({
            tile: tile,
            tileID: tile.tileID,
            queryGeometry: tileSpaceQueryGeometry,
            cameraQueryGeometry: tileSpaceCameraQueryGeometry,
            scale: 1
        });
        return tileResults;*/
    };

    SourceCache.prototype.getVisibleCoordinates = function getVisibleCoordinates(symbolLayer, transform) {
        var this$1 = this;
        var coords = this.getRenderableIds().map(function (id) {
            return this$1._tiles[id].tileID;
        });
        this.currentCoords = [];
        this.transform = transform;
        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            var wrap = coord.toUnwrapped();
            if (!coord.geometry) {
                coord.geometry = this.layer.tileInfo.getGeometry(wrap);
            }
            coord.posMatrix = transform.calculatePosMatrix(wrap, coord.geometry);
            this.currentCoords.push(coord);
        }
        return coords;
    };

    SourceCache.prototype.updateTileMatrix = function updateTileMatrix(symbolLayer, transform) {

        var coords = this.currentCoords;
        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            coord.posMatrix = transform.calculatePosMatrix(coord.toUnwrapped(), coord.geometry);
        }
        return coords;
    };

    SourceCache.prototype.hasTransition = function hasTransition() {
        if (this._source.hasTransition()) {
            return true;
        }

        if (isRasterType(this._source.type)) {
            for (var id in this._tiles) {
                var tile = this._tiles[id];
                if (tile.fadeEndTime !== undefined && tile.fadeEndTime >= __chunk_1.browser.now()) {
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * Set the value of a particular state for a feature
     * @private
     */
    SourceCache.prototype.setFeatureState = function setFeatureState(sourceLayer, features, state) {
        sourceLayer = sourceLayer || '_geojsonTileLayer';
        this._state.updateState(sourceLayer, features, state);
    };

    /**
     * Resets the value of a particular state key for a feature
     * @private
     */
    SourceCache.prototype.removeFeatureState = function removeFeatureState(sourceLayer, feature, key) {
        sourceLayer = sourceLayer || '_geojsonTileLayer';
        this._state.removeFeatureState(sourceLayer, feature, key);
    };

    /**
     * Get the entire state object for a feature
     * @private
     */
    SourceCache.prototype.getFeatureState = function getFeatureState(sourceLayer, feature) {
        sourceLayer = sourceLayer || '_geojsonTileLayer';
        return this._state.getState(sourceLayer, feature);
    };

    SourceCache.maxOverzooming = 10;
    SourceCache.maxUnderzooming = 3;

    return SourceCache;
});