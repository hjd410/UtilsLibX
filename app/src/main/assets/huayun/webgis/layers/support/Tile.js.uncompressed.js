define("com/huayun/webgis/layers/support/Tile", [
    "com/huayun/webgis/data/bucket/SymbolBucket",
    "com/huayun/webgis/gl/Texture",
    "../../utils/utils",
    "./EvaluationParameters",
    "com/huayun/webgis/data/GeoJSONFeature"
], function (SymbolBucket, Texture, utils, EvaluationParameters, GeoJSONFeature) {

    function parseCacheControl(cacheControl) {
        // Taken from [Wreck](https://github.com/hapijs/wreck)
        var re = /(?:^|(?:\s*\,\s*))([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)(?:\=(?:([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)|(?:\"((?:[^"\\]|\\.)*)\")))?/g;

        var header = {};
        cacheControl.replace(re, function ($0, $1, $2, $3) {
            var value = $2 || $3;
            header[$1] = value ? value.toLowerCase() : true;
            return '';
        });

        if (header['max-age']) {
            var maxAge = parseInt(header['max-age'], 10);
            if (isNaN(maxAge)) {
                delete header['max-age'];
            } else {
                header['max-age'] = maxAge;
            }
        }

        return header;
    }

    function deserialize(input, style) {
        var output = {};
        for (var i$1 = 0, list$1 = input; i$1 < list$1.length; i$1 += 1) {
            var bucket = list$1[i$1];

            var layers = bucket.layerIds
                .map(function (id) {
                    return style[id];
                })
                .filter(Boolean);
            if (layers.length === 0) {
                return;
            }
            // look up StyleLayer objects from layer ids (since we don't
            // want to waste time serializing/copying them from the worker)
            (bucket).layers = layers;
            if ((bucket).stateDependentLayerIds) {
                (bucket).stateDependentLayers = (bucket).stateDependentLayerIds.map(function (lId) {
                    return layers.filter(function (l) {
                        return l.id === lId;
                    })[0];
                });
            }
            for (var i = 0, list = layers; i < list.length; i += 1) {
                var layer = list[i];

                output[layer.id] = bucket;
            }
        }
        return output;
    }

    var id = 1;

    var CLOCK_SKEW_RETRY_TIMEOUT = 30000;

    var Tile = function Tile(tileID, size) {
        this.tileID = tileID;
        this.uid = id++;
        this.uses = 0;
        this.tileSize = 256; //size;
        this.buckets = {};
        this.expirationTime = null;
        this.queryPadding = 0;
        this.hasSymbolBuckets = false;
        this.expiredRequestCount = 0;
        this.state = 'loading';
    };

    Tile.prototype.wasRequested = function wasRequested() {
        return this.state === 'errored' || this.state === 'loaded' || this.state === 'reloading';
    };

    /**
     * 设置切片的超时时间, 根据响应头中的字段进行设置
     * @param data
     */
    Tile.prototype.setExpiryData = function setExpiryData(data) {
        // data.cacheControl = "max-age=43200,s-maxage=300";
        var prior = this.expirationTime;
        if (data.cacheControl) {
            var parsedCC = parseCacheControl(data.cacheControl);
            if (parsedCC['max-age']) {
                this.expirationTime = Date.now() + parsedCC['max-age'] * 1000;
            }
        }
        if (this.expirationTime) {
            var now = Date.now();
            var isExpired = false;
            if (this.expirationTime > now) {
                isExpired = false;
            } else if (!prior) {
                isExpired = true;
            } else if (this.expirationTime < prior) {
                isExpired = true;
            } else {
                var delta = this.expirationTime - prior;
                if (!delta) {
                    isExpired = true;
                } else {
                    this.expirationTime = now + Math.max(delta, CLOCK_SKEW_RETRY_TIMEOUT);
                }
            }
            if (isExpired) {
                this.expiredRequestCount++;
                this.state = 'expired';
            } else {
                this.expiredRequestCount = 0;
            }
        }
    };

    /**
     * 获取切片的超时时间
     * @return {number}
     */
    Tile.prototype.getExpiryTimeout = function getExpiryTimeout() {
        if (this.expirationTime) {
            if (this.expiredRequestCount) {
                return 1000 * (1 << Math.min(this.expiredRequestCount - 1, 31));
            } else {
                return Math.min(this.expirationTime - new Date().getTime(), Math.pow(2, 31) - 1);
            }
        }
    };


    Tile.prototype.registerFadeDuration = function registerFadeDuration(duration) {
        var fadeEndTime = duration + this.timeAdded;
        if (fadeEndTime < utils.now()) {
            return;
        }
        if (this.fadeEndTime && fadeEndTime < this.fadeEndTime) {
            return;
        }

        this.fadeEndTime = fadeEndTime;
    };



    Tile.prototype.loadVectorData = function loadVectorData(data, layer, justReloaded) {
        if (this.hasData()) {
            this.unloadVectorData();
        }

        this.state = 'loaded';

        // empty GeoJSON tile
        if (!data) {
            this.collisionBoxArray = new CollisionBoxArray();
            return;
        }

        if (data.featureIndex) {
            this.latestFeatureIndex = data.featureIndex;
            if (data.rawTileData) {
                // Only vector tiles have rawTileData, and they won't update it for
                // 'reloadTile'
                this.latestRawTileData = data.rawTileData;
                this.latestFeatureIndex.rawTileData = data.rawTileData;
            } else if (this.latestRawTileData) {
                // If rawTileData hasn't updated, hold onto a pointer to the last
                // one we received
                this.latestFeatureIndex.rawTileData = this.latestRawTileData;
            }
        }
        this.collisionBoxArray = data.collisionBoxArray;
        this.buckets = deserialize(data.buckets, layer._layers);

        this.hasSymbolBuckets = false;
        for (var id in this.buckets) {
            var bucket = this.buckets[id];
            if (bucket instanceof SymbolBucket) {
                this.hasSymbolBuckets = true;
                if (justReloaded) {
                    bucket.justReloaded = true;
                } else {
                    break;
                }
            }
        }

        this.queryPadding = 0;
        for (var id$1 in this.buckets) {
            var bucket$1 = this.buckets[id$1];
            this.queryPadding = Math.max(this.queryPadding, layer._layers[id$1].queryRadius(bucket$1));
        }

        if (data.imageAtlas) {
            this.imageAtlas = data.imageAtlas;
        }
        if (data.glyphAtlasImage) {
            this.glyphAtlasImage = data.glyphAtlasImage;
        }
    };

    /**
     * Release any data or WebGL resources referenced by this tile.
     * @returns {undefined}
     * @private
     */
    Tile.prototype.unloadVectorData = function unloadVectorData() {
        for (var id in this.buckets) {
            this.buckets[id].destroy();
        }
        this.buckets = {};

        if (this.imageAtlasTexture) {
            this.imageAtlasTexture.destroy();
        }

        if (this.imageAtlas) {
            this.imageAtlas = null;
        }

        if (this.glyphAtlasTexture) {
            this.glyphAtlasTexture.destroy();
        }

        this.latestFeatureIndex = null;
        this.state = 'unloaded';
    };

    Tile.prototype.getBucket = function getBucket(layer) {
        return this.buckets[layer.id];
    };

    Tile.prototype.upload = function upload(context) {
        for (var id in this.buckets) {
            var bucket = this.buckets[id];
            if (bucket.uploadPending()) {
                bucket.upload(context);
            }
        }

        var gl = context.gl;
        if (this.imageAtlas && !this.imageAtlas.uploaded) {
            this.imageAtlasTexture = new Texture(context, this.imageAtlas.image, gl.RGBA);
            this.imageAtlas.uploaded = true;
        }

        if (this.glyphAtlasImage) {
            this.glyphAtlasTexture = new Texture(context, this.glyphAtlasImage, gl.ALPHA);
            this.glyphAtlasImage = null;
        }
    };

    Tile.prototype.prepare = function prepare(imageManager) {
        if (this.imageAtlas) {
            this.imageAtlas.patchUpdatedImages(imageManager, this.imageAtlasTexture);
        }
    };

// Queries non-symbol features rendered for this tile.
// Symbol features are queried globally
    Tile.prototype.queryRenderedFeatures = function (layers, sourceFeatureState, queryGeometry, cameraQueryGeometry, scale, params, transform, maxPitchScaleFactor, pixelPosMatrix) {
        if (!this.latestFeatureIndex || !this.latestFeatureIndex.rawTileData) {
            return {};
        }

        return this.latestFeatureIndex.query({
            queryGeometry: queryGeometry,
            cameraQueryGeometry: cameraQueryGeometry,
            scale: scale,
            tileSize: this.tileSize,
            pixelPosMatrix: pixelPosMatrix,
            transform: transform,
            params: params,
            queryPadding: this.queryPadding * maxPitchScaleFactor
        }, layers, sourceFeatureState);
    };

    Tile.prototype.querySourceFeatures = function querySourceFeatures(result, params) {
        if (!this.latestFeatureIndex || !this.latestFeatureIndex.rawTileData) {
            return;
        }

        var vtLayers = this.latestFeatureIndex.loadVTLayers();

        var sourceLayer = params ? params.sourceLayer : '';
        var layer = vtLayers._geojsonTileLayer || vtLayers[sourceLayer];

        if (!layer) {
            return;
        }

        var filter = createFilter(params && params.filter);
        var ref = this.tileID.canonical;
        var z = ref.z;
        var x = ref.x;
        var y = ref.y;
        var coord = {z: z, x: x, y: y};

        for (var i = 0; i < layer.length; i++) {
            var feature = layer.feature(i);
            if (filter(new EvaluationParameters(this.tileID.overscaledZ), feature)) {
                var geojsonFeature = new GeoJSONFeature(feature, z, x, y);
                geojsonFeature.tile = coord;
                result.push(geojsonFeature);
            }
        }
    };

    Tile.prototype.clearMask = function clearMask() {
        if (this.segments) {
            this.segments.destroy();
            delete this.segments;
        }
        if (this.maskedBoundsBuffer) {
            this.maskedBoundsBuffer.destroy();
            delete this.maskedBoundsBuffer;
        }
        if (this.maskedIndexBuffer) {
            this.maskedIndexBuffer.destroy();
            delete this.maskedIndexBuffer;
        }
    };

    Tile.prototype.setMask = function setMask(mask, context) {

        // don't redo buffer work if the mask is the same;
        if (deepEqual(this.mask, mask)) {
            return;
        }

        this.mask = mask;
        this.clearMask();

        // We want to render the full tile, and keeping the segments/vertices/indices empty means
        // using the global shared buffers for covering the entire tile.
        if (deepEqual(mask, {'0': true})) {
            return;
        }

        var maskedBoundsArray = new StructArrayLayout4i8();
        var indexArray = new StructArrayLayout3ui6();

        this.segments = new SegmentVector();
        // Create a new segment so that we will upload (empty) buffers even when there is nothing to
        // draw for this tile.
        this.segments.prepareSegment(0, maskedBoundsArray, indexArray);

        var maskArray = Object.keys(mask);
        for (var i = 0; i < maskArray.length; i++) {
            var maskCoord = mask[+maskArray[i]];
            var vertexExtent = EXTENT >> maskCoord.z;
            var tlVertex = new pointGeometry(maskCoord.x * vertexExtent, maskCoord.y * vertexExtent);
            var brVertex = new pointGeometry(tlVertex.x + vertexExtent, tlVertex.y + vertexExtent);

            // not sure why flow is complaining here because it doesn't complain at L401
            var segment = (this.segments).prepareSegment(4, maskedBoundsArray, indexArray);

            maskedBoundsArray.emplaceBack(tlVertex.x, tlVertex.y, tlVertex.x, tlVertex.y);
            maskedBoundsArray.emplaceBack(brVertex.x, tlVertex.y, brVertex.x, tlVertex.y);
            maskedBoundsArray.emplaceBack(tlVertex.x, brVertex.y, tlVertex.x, brVertex.y);
            maskedBoundsArray.emplaceBack(brVertex.x, brVertex.y, brVertex.x, brVertex.y);

            var offset = segment.vertexLength;
            // 0, 1, 2
            // 1, 2, 3
            indexArray.emplaceBack(offset, offset + 1, offset + 2);
            indexArray.emplaceBack(offset + 1, offset + 2, offset + 3);

            segment.vertexLength += 4;
            segment.primitiveLength += 2;
        }

        this.maskedBoundsBuffer = context.createVertexBuffer(maskedBoundsArray, rasterBoundsAttributes.members);
        this.maskedIndexBuffer = context.createIndexBuffer(indexArray);
    };

    Tile.prototype.hasData = function hasData() {
        return this.state === 'loaded' || this.state === 'reloading' || this.state === 'expired';
    };

    Tile.prototype.patternsLoaded = function patternsLoaded() {
        return this.imageAtlas && !!Object.keys(this.imageAtlas.patternPositions).length;
    };



    Tile.prototype.setFeatureState = function setFeatureState(states, painter) {
        if (!this.latestFeatureIndex ||
            !this.latestFeatureIndex.rawTileData ||
            Object.keys(states).length === 0) {
            return;
        }

        var vtLayers = this.latestFeatureIndex.loadVTLayers();

        for (var id in this.buckets) {
            var bucket = this.buckets[id];
            // Buckets are grouped by common source-layer
            var sourceLayerId = bucket.layers[0]['sourceLayer'] || '_geojsonTileLayer';
            var sourceLayer = vtLayers[sourceLayerId];
            var sourceLayerStates = states[sourceLayerId];
            if (!sourceLayer || !sourceLayerStates || Object.keys(sourceLayerStates).length === 0) {
                continue;
            }

            bucket.update(sourceLayerStates, sourceLayer, this.imageAtlas && this.imageAtlas.patternPositions || {});
            if (painter && painter.style) {
                this.queryPadding = Math.max(this.queryPadding, painter.style.getLayer(id).queryRadius(bucket));
            }
        }
    };

    Tile.prototype.holdingForFade = function holdingForFade() {
        return this.symbolFadeHoldUntil !== undefined;
    };

    Tile.prototype.symbolFadeFinished = function symbolFadeFinished() {
        return !this.symbolFadeHoldUntil || this.symbolFadeHoldUntil < utils.now();
    };

    Tile.prototype.clearFadeHold = function clearFadeHold() {
        this.symbolFadeHoldUntil = undefined;
    };

    Tile.prototype.setHoldDuration = function setHoldDuration(duration) {
        this.symbolFadeHoldUntil = exported.now() + duration;
    };

    return Tile;
});