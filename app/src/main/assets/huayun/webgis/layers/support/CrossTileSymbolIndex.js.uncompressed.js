define("com/huayun/webgis/layers/support/CrossTileSymbolIndex", [
    "com/huayun/webgis/utils/Constant"
], function (Constant) {
    var EXTENT = Constant.layout.EXTENT;
    var roundingFactor = 256/EXTENT/2;


    var TileLayerIndex = function TileLayerIndex(tileID, symbolInstances, bucketInstanceId) {
        this.tileID = tileID;
        this.indexedSymbolInstances = {};
        this.bucketInstanceId = bucketInstanceId;

        for (var i = 0; i < symbolInstances.length; i++) {
            var symbolInstance = symbolInstances.get(i);
            var key = symbolInstance.key;
            if (!this.indexedSymbolInstances[key]) {
                this.indexedSymbolInstances[key] = [];
            }
            // This tile may have multiple symbol instances with the same key
            // Store each one along with its coordinates
            this.indexedSymbolInstances[key].push({
                crossTileID: symbolInstance.crossTileID,
                coord: this.getScaledCoordinates(symbolInstance, tileID)
            });
        }
    };

    TileLayerIndex.prototype.getScaledCoordinates = function getScaledCoordinates(symbolInstance, childTileID) {
        var zDifference = childTileID.canonical.z - this.tileID.canonical.z;
        var scale = roundingFactor / Math.pow(2, zDifference);
        return {
            x: Math.floor((childTileID.canonical.x * EXTENT + symbolInstance.anchorX) * scale),
            y: Math.floor((childTileID.canonical.y * EXTENT + symbolInstance.anchorY) * scale)
        };
    };

    TileLayerIndex.prototype.findMatches = function findMatches(symbolInstances, newTileID, zoomCrossTileIDs) {
        var tolerance = this.tileID.canonical.z < newTileID.canonical.z ? 1 : Math.pow(2, this.tileID.canonical.z - newTileID.canonical.z);

        for (var i = 0; i < symbolInstances.length; i++) {
            var symbolInstance = symbolInstances.get(i);
            if (symbolInstance.crossTileID) {
                // already has a match, skip
                continue;
            }

            var indexedInstances = this.indexedSymbolInstances[symbolInstance.key];
            if (!indexedInstances) {
                // No symbol with this key in this bucket
                continue;
            }

            var scaledSymbolCoord = this.getScaledCoordinates(symbolInstance, newTileID);

            for (var i$1 = 0, list = indexedInstances; i$1 < list.length; i$1 += 1) {
                // Return any symbol with the same keys whose coordinates are within 1
                // grid unit. (with a 4px grid, this covers a 12px by 12px area)
                var thisTileSymbol = list[i$1];

                if (Math.abs(thisTileSymbol.coord.x - scaledSymbolCoord.x) <= tolerance &&
                    Math.abs(thisTileSymbol.coord.y - scaledSymbolCoord.y) <= tolerance &&
                    !zoomCrossTileIDs[thisTileSymbol.crossTileID]) {
                    // Once we've marked ourselves duplicate against this parent symbol,
                    // don't let any other symbols at the same zoom level duplicate against
                    // the same parent (see issue #5993)
                    zoomCrossTileIDs[thisTileSymbol.crossTileID] = true;
                    symbolInstance.crossTileID = thisTileSymbol.crossTileID;
                    break;
                }
            }
        }
    };

    var CrossTileIDs = function CrossTileIDs() {
        this.maxCrossTileID = 0;
    };
    CrossTileIDs.prototype.generate = function generate() {
        return ++this.maxCrossTileID;
    };

    var CrossTileSymbolLayerIndex = function CrossTileSymbolLayerIndex() {
        this.indexes = {};
        this.usedCrossTileIDs = {};
        this.lng = 0;
    };

    CrossTileSymbolLayerIndex.prototype.handleWrapJump = function handleWrapJump(lng) {
        /*var wrapDelta = Math.round((lng - this.lng) / 360);
        if (wrapDelta !== 0) {
            for (var zoom in this.indexes) {
                var zoomIndexes = this.indexes[zoom];
                var newZoomIndex = {};
                for (var key in zoomIndexes) {
                    // change the tileID's wrap and add it to a new index
                    var index = zoomIndexes[key];
                    index.tileID = index.tileID.unwrapTo(index.tileID.wrap + wrapDelta);
                    newZoomIndex[index.tileID.key] = index;
                }
                this.indexes[zoom] = newZoomIndex;
            }
        }
        this.lng = lng;*/
    };

    CrossTileSymbolLayerIndex.prototype.addBucket = function addBucket(tileID, bucket, crossTileIDs) {
        if (this.indexes[tileID.overscaledZ] &&
            this.indexes[tileID.overscaledZ][tileID.key]) {
            if (this.indexes[tileID.overscaledZ][tileID.key].bucketInstanceId ===
                bucket.bucketInstanceId) {
                return false;
            } else {
                this.removeBucketCrossTileIDs(tileID.overscaledZ,
                    this.indexes[tileID.overscaledZ][tileID.key]);
            }
        }

        for (var i = 0; i < bucket.symbolInstances.length; i++) {
            var symbolInstance = bucket.symbolInstances.get(i);
            symbolInstance.crossTileID = 0;
        }

        if (!this.usedCrossTileIDs[tileID.overscaledZ]) {
            this.usedCrossTileIDs[tileID.overscaledZ] = {};
        }
        var zoomCrossTileIDs = this.usedCrossTileIDs[tileID.overscaledZ];

        for (var zoom in this.indexes) {
            var zoomIndexes = this.indexes[zoom];
            if (Number(zoom) > tileID.overscaledZ) {
                for (var id in zoomIndexes) {
                    var childIndex = zoomIndexes[id];
                    if (childIndex.tileID.isChildOf(tileID)) {
                        childIndex.findMatches(bucket.symbolInstances, tileID, zoomCrossTileIDs);
                    }
                }
            } else {
                var parentCoord = tileID.scaledTo(Number(zoom));
                var parentIndex = zoomIndexes[parentCoord.key];
                if (parentIndex) {
                    parentIndex.findMatches(bucket.symbolInstances, tileID, zoomCrossTileIDs);
                }
            }
        }

        for (var i$1 = 0; i$1 < bucket.symbolInstances.length; i$1++) {
            var symbolInstance$1 = bucket.symbolInstances.get(i$1);
            if (!symbolInstance$1.crossTileID) {
                // symbol did not match any known symbol, assign a new id
                symbolInstance$1.crossTileID = crossTileIDs.generate();
                zoomCrossTileIDs[symbolInstance$1.crossTileID] = true;
            }
        }

        if (this.indexes[tileID.overscaledZ] === undefined) {
            this.indexes[tileID.overscaledZ] = {};
        }
        this.indexes[tileID.overscaledZ][tileID.key] = new TileLayerIndex(tileID, bucket.symbolInstances, bucket.bucketInstanceId);

        return true;
    };

    CrossTileSymbolLayerIndex.prototype.removeBucketCrossTileIDs = function removeBucketCrossTileIDs(zoom, removedBucket) {
        for (var key in removedBucket.indexedSymbolInstances) {
            for (var i = 0, list = removedBucket.indexedSymbolInstances[(key)]; i < list.length; i += 1) {
                var symbolInstance = list[i];

                delete this.usedCrossTileIDs[zoom][symbolInstance.crossTileID];
            }
        }
    };

    CrossTileSymbolLayerIndex.prototype.removeStaleBuckets = function removeStaleBuckets(currentIDs) {
        var tilesChanged = false;
        for (var z in this.indexes) {
            var zoomIndexes = this.indexes[z];
            for (var tileKey in zoomIndexes) {
                if (!currentIDs[zoomIndexes[tileKey].bucketInstanceId]) {
                    this.removeBucketCrossTileIDs(z, zoomIndexes[tileKey]);
                    delete zoomIndexes[tileKey];
                    tilesChanged = true;
                }
            }
        }
        return tilesChanged;
    };

    var CrossTileSymbolIndex = function CrossTileSymbolIndex() {
        this.layerIndexes = {};
        this.crossTileIDs = new CrossTileIDs();
        this.maxBucketInstanceId = 0;
        this.bucketsInCurrentPlacement = {};
    };

    CrossTileSymbolIndex.prototype.addLayer = function addLayer(styleLayer, tiles) {
        var layerIndex = this.layerIndexes[styleLayer.id];
        if (layerIndex === undefined) {
            layerIndex = this.layerIndexes[styleLayer.id] = new CrossTileSymbolLayerIndex();
        }
        var symbolBucketsChanged = false;
        var currentBucketIDs = {};
        // layerIndex.handleWrapJump(lng);
        for (var i = 0, list = tiles; i < list.length; i += 1) {
            var tile = list[i];
            var symbolBucket = ((tile.getBucket(styleLayer)));
            if (!symbolBucket || styleLayer.id !== symbolBucket.layerIds[0]) {
                continue;
            }
            if (!symbolBucket.bucketInstanceId) {
                symbolBucket.bucketInstanceId = ++this.maxBucketInstanceId;
            }
            if (layerIndex.addBucket(tile.tileID, symbolBucket, this.crossTileIDs)) {
                symbolBucketsChanged = true;
            }
            currentBucketIDs[symbolBucket.bucketInstanceId] = true;
        }
        if (layerIndex.removeStaleBuckets(currentBucketIDs)) {
            symbolBucketsChanged = true;
        }
        return symbolBucketsChanged;
    };

    CrossTileSymbolIndex.prototype.pruneUnusedLayers = function pruneUnusedLayers(usedLayers) {
        var usedLayerMap = {};
        usedLayers.forEach(function (usedLayer) {
            usedLayerMap[usedLayer] = true;
        });
        for (var layerId in this.layerIndexes) {
            if (!usedLayerMap[layerId]) {
                delete this.layerIndexes[layerId];
            }
        }
    };

    return CrossTileSymbolIndex;
});