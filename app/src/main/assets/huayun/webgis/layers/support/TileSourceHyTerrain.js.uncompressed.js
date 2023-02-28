define("com/huayun/webgis/layers/support/TileSourceHyTerrain", [
    "exports",
    "dojo/request",
    "../../request",
    "../../utils/utils",
    "../../gl/Texture",
    "./terrainUtils",
    "../../data/ArrayType",
    "../../gl/SegmentVector"
], function (exports, dojoRequest, request, utils, Texture, terrainUtils, ArrayType, SegmentVector) {

    var TiffTerrainWorkerSource = function TiffTerrainWorkerSource(actor, layerIndex) {
        this.actor = actor;
        this.loading = {};
        this.loaded = {};
    };

    function VectorTileSource(id, options, dispatcher, url, layer) {
        this.id = id;
        this.dispatcher = dispatcher;
        this.type = 'vector';
        this.minzoom = 0;
        this.maxzoom = 16;
        this.scheme = 'xyz';
        this.reparseOverscaled = true;
        this.isTileClipped = true;
        utils.extend(this, utils.pick(options, ['scheme', 'tileSize']));
        this._options = utils.extend({type: 'vector'}, options);
        this._collectResourceTiming = options.collectResourceTiming;
        this.url = url;
        this.layer = layer;
    }

    VectorTileSource.prototype.constructor = VectorTileSource;

    VectorTileSource.prototype.load = function load() {
        /*var this$1 = this;

        this.fire(new __chunk_1.Event('dataloading', {dataType: 'source'}));
        this._tileJSONRequest = loadTileJSON(this._options, this.map._requestManager, function (err, tileJSON) {
            this$1._tileJSONRequest = null;
            if (err) {
                this$1.fire(new __chunk_1.ErrorEvent(err));
            } else if (tileJSON) {
                __chunk_1.extend(this$1, tileJSON);
                if (tileJSON.bounds) {
                    this$1.tileBounds = new TileBounds(tileJSON.bounds, this$1.minzoom, this$1.maxzoom);
                }

                __chunk_1.postTurnstileEvent(tileJSON.tiles);
                __chunk_1.postMapLoadEvent(tileJSON.tiles, this$1.map._getMapId(), this$1.map._requestManager._skuToken);

                // `content` is included here to prevent a race condition where `Style#_updateSources` is called
                // before the TileJSON arrives. this makes sure the tiles needed are loaded once TileJSON arrives
                // ref: https://github.com/mapbox/mapbox-gl-js/pull/4347#discussion_r104418088
                this$1.fire(new __chunk_1.Event('data', {dataType: 'source', sourceDataType: 'metadata'}));
                this$1.fire(new __chunk_1.Event('data', {dataType: 'source', sourceDataType: 'content'}));
            }
        });*/
    };

    VectorTileSource.prototype.hasTile = function hasTile(tileID) {
        // return !this.tileBounds || this.tileBounds.contains(tileID.canonical);
        return true;
    };

    VectorTileSource.prototype.onAdd = function onAdd(map) {
        this.map = map;
        this.load();
    };

    VectorTileSource.prototype.setSize = function (size) {
        this.tileSize = size;
    };

    VectorTileSource.prototype.onRemove = function onRemove() {
        /*if (this._tileJSONRequest) {
            this._tileJSONRequest.cancel();
            this._tileJSONRequest = null;
        }*/
    };

    VectorTileSource.prototype.serialize = function serialize() {
        return utils.extend({}, this._options);
    };

    VectorTileSource.prototype.updateTileUrl = function (url) {
        this.url = [url];
    };

    VectorTileSource.prototype.loadTile = function loadTile(tile, callback) {
        var url = tile.tileID.canonical.url(this.url, this.scheme);
        // var url = tile.tileID.canonical.url("http://10.136.33.95:8090/hygis/basic_bak/VectorTileServer/tile/{z}/{x}/{y}.pbf", this.scheme);
        var params = {
            request: {
                url: url
            },
            uid: tile.uid,
            tileID: tile.tileID,
            zoom: tile.tileID.overscaledZ,
            tileSize: this.tileSize,
            type: this.type,
            source: this.id,
            pixelRatio: 1,
            showCollisionBoxes: false
        };

        if (tile.workerID === undefined || tile.state === 'expired') {
            tile.workerID = this.dispatcher.send('loadTile', params, done.bind(this));
        } else if (tile.state === 'loading') {
            tile.reloadCallback = callback;
        } else {
            this.dispatcher.send('reloadTile', params, done.bind(this), tile.workerID);
        }

        function done(err, data) {
            // debugger;
            if (tile.aborted) {
                return callback(null);
            }

            if (err && err.status !== 404) {
                return callback(err);
            }

            if (data) {
                tile.setExpiryData(data);
            }
            tile.loadVectorData(data, this.layer);

            // __chunk_1.cacheEntryPossiblyAdded(this.dispatcher);
            callback(null);

            if (tile.reloadCallback) {
                this.loadTile(tile, tile.reloadCallback);
                tile.reloadCallback = null;
            }
        }
    };

    VectorTileSource.prototype.abortTile = function abortTile(tile) {
        this.dispatcher.send('abortTile', {uid: tile.uid, type: this.type, source: this.id}, undefined, tile.workerID);
    };

    VectorTileSource.prototype.unloadTile = function unloadTile(tile) {
        tile.unloadVectorData();
        this.dispatcher.send('removeTile', {uid: tile.uid, type: this.type, source: this.id}, undefined, tile.workerID);
    };

    VectorTileSource.prototype.hasTransition = function hasTransition() {
        return false;
    };

    exports.VectorTileSource = VectorTileSource;

    function RasterTileSource(id, options, url, view) {
        this.id = id;
        this.type = 'raster';
        this.minzoom = 0;
        this.maxzoom = 22;
        this.roundZoom = true;
        this.scheme = 'xyz';
        this.tileSize = options.tileSize || 256;
        this.url = url;
        this.view = view;
    }

    RasterTileSource.prototype.constructor = RasterTileSource;
    RasterTileSource.prototype.load = function load() {
        /*var this$1 = this;

        this._tileJSONRequest = loadTileJSON(this._options, this.map._requestManager, function (err, tileJSON) {
            this$1._tileJSONRequest = null;
            if (err) {
                this$1.fire(new __chunk_1.ErrorEvent(err));
            } else if (tileJSON) {
                __chunk_1.extend(this$1, tileJSON);
                if (tileJSON.bounds) {
                    this$1.tileBounds = new TileBounds(tileJSON.bounds, this$1.minzoom, this$1.maxzoom);
                }

                __chunk_1.postTurnstileEvent(tileJSON.tiles);
                __chunk_1.postMapLoadEvent(tileJSON.tiles, this$1.map._getMapId(), this$1.map._requestManager._skuToken);

                // `content` is included here to prevent a race condition where `Style#_updateSources` is called
                // before the TileJSON arrives. this makes sure the tiles needed are loaded once TileJSON arrives
                // ref: https://github.com/mapbox/mapbox-gl-js/pull/4347#discussion_r104418088
                this$1.fire(new __chunk_1.Event('data', {dataType: 'source', sourceDataType: 'metadata'}));
                this$1.fire(new __chunk_1.Event('data', {dataType: 'source', sourceDataType: 'content'}));
            }
        });*/
    };

    RasterTileSource.prototype.hasTile = function hasTile(tileID) {
        // return !this.tileBounds || this.tileBounds.contains(tileID.canonical);
    };

    RasterTileSource.prototype.updateTileUrl = function (url) {
        this.url = url;
    };

    RasterTileSource.prototype.loadTile = function loadTile(tile, callback) {
        var this$1 = this;
        var url = tile.tileID.canonical.url([this.url]);
        tile.request = request(url, {responseType: "image"}).then(function (resp) {
            return resp.data;
        }).then(function (img) {
            delete tile.request;
            if (tile.aborted) {
                tile.state = 'unloaded';
                callback(null);
            } else if (img) {
                var context = this$1.view.context;
                var gl = context.gl;
                tile.texture = this$1.view.getTileTexture(img.width);
                if (tile.texture) {
                    tile.texture.update(img, {useMipmap: true});
                } else {
                    tile.texture = new Texture(context, img, gl.RGBA, {useMipmap: true});
                    tile.texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);
                    if (context.extTextureFilterAnisotropic) {
                        gl.texParameterf(gl.TEXTURE_2D, context.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, context.extTextureFilterAnisotropicMax);
                    }
                }
                tile.state = 'loaded';
                callback(null);
            }
        }).catch(function (err) {
            tile.state = 'errored';
            callback(err);
        })
    };
    RasterTileSource.prototype.abortTile = function abortTile(tile, callback) {
        if (tile.request) {
            tile.request.cancel();
            delete tile.request;
        }
        callback();
    };
    RasterTileSource.prototype.unloadTile = function unloadTile(tile, callback) {
        if (tile.texture) {
            this.view.saveTileTexture(tile.texture);
        }
        callback();
    };
    RasterTileSource.prototype.hasTransition = function hasTransition() {
        return false;
    };
    exports.RasterTileSource = RasterTileSource;


    function TerrainSourceCache(id, options, dispatcher, url, view, layer) {
        this.id = id;
        this.type = 'terrain';
        this.minzoom = 0;
        this.maxzoom = 22;
        this.roundZoom = true;
        this.scheme = 'xyz';
        this.tileSize = options.tileSize || 256;
        this.url = url;
        this.view = view;
        this.layer = layer;
        this.dispatcher = dispatcher;
    }

    TerrainSourceCache.prototype.constructor = TerrainSourceCache;
    TerrainSourceCache.prototype.load = function load() {
        /*var this$1 = this;

        this._tileJSONRequest = loadTileJSON(this._options, this.map._requestManager, function (err, tileJSON) {
            this$1._tileJSONRequest = null;
            if (err) {
                this$1.fire(new __chunk_1.ErrorEvent(err));
            } else if (tileJSON) {
                __chunk_1.extend(this$1, tileJSON);
                if (tileJSON.bounds) {
                    this$1.tileBounds = new TileBounds(tileJSON.bounds, this$1.minzoom, this$1.maxzoom);
                }

                __chunk_1.postTurnstileEvent(tileJSON.tiles);
                __chunk_1.postMapLoadEvent(tileJSON.tiles, this$1.map._getMapId(), this$1.map._requestManager._skuToken);

                // `content` is included here to prevent a race condition where `Style#_updateSources` is called
                // before the TileJSON arrives. this makes sure the tiles needed are loaded once TileJSON arrives
                // ref: https://github.com/mapbox/mapbox-gl-js/pull/4347#discussion_r104418088
                this$1.fire(new __chunk_1.Event('data', {dataType: 'source', sourceDataType: 'metadata'}));
                this$1.fire(new __chunk_1.Event('data', {dataType: 'source', sourceDataType: 'content'}));
            }
        });*/
    };

    TerrainSourceCache.prototype.hasTile = function hasTile(tileID) {
        // return !this.tileBounds || this.tileBounds.contains(tileID.canonical);
    };

    TerrainSourceCache.prototype.updateTileUrl = function (url) {
        this.url = url;
    };

    TerrainSourceCache.prototype.loadTile = function loadTile(tile, callback) {
        var this$1 = this;
        var image = this.layer.imageUrl;
        var url = tile.tileID.canonical.url([this.url], this.scheme);
        var imageUrl = tile.tileID.canonical.url([image]);
        request(imageUrl, {responseType: "image"}).then(function (resp) {
            return resp.data;
        }).then(function (img) {
            delete tile.request;
            if (tile.aborted) {
                tile.state = 'unloaded';
                callback(null);
            } else if (img) {
                var id = tile.tileID.canonical;
                tile.state = 'loaded';
                var context = this$1.view.context;
                var gl = context.gl;
                tile.texture = this$1.view.getTileTexture(img.width);
                if (tile.texture) {
                    tile.texture.update(img, {useMipmap: true});
                } else {
                    tile.texture = new Texture(context, img, gl.RGBA, {useMipmap: true});
                    tile.texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);
                    if (context.extTextureFilterAnisotropic) {
                        gl.texParameterf(gl.TEXTURE_2D, context.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, context.extTextureFilterAnisotropicMax);
                    }
                }
                var canonical = tile.tileID.canonical;
                var rectangle = this$1.view.viewpoint.tileInfo.tileXYToRectangle(canonical.x, canonical.y, canonical.z);
                tile.rectangle = rectangle;
                if (tile.tileID.canonical.z < this$1.layer.changeLevel) {
                    callback("没有地形切片");
                } else {
                    var level = Math.min(this$1.view.viewpoint.targetZoom || this$1.view.viewpoint.level, this$1.layer.maxLevel);
                    var resolution = this$1.view.viewpoint.tileInfo.getResolution(level);
                    var params = {
                        rectangle: rectangle,
                        resolution: resolution,
                        type: "terrain",
                        uid: tile.uid,
                        url: url
                    }
                    if (tile.workerID === undefined || tile.state === 'expired') {
                        tile.workerID = this$1.dispatcher.send('loadTerrain', params, done);
                    } else if (tile.state === 'loading') {
                        tile.reloadCallback = callback;
                    } else {
                        this$1.dispatcher.send('reloadTerrain', params, done, tile.workerID);
                    }
                }

                function done(err, terrainData) {
                    if (err) {
                        return;
                    }
                    callback(null, terrainData);
                }

                // callback(null);
            }
            /*fetch(url).then(function (response) {
                return response.arrayBuffer()
            }).then(function (buffer) {
                request(imageUrl, {responseType: "image"}).then(function (resp) {
                    return resp.data;
                }).then(function (img) {
                    delete tile.request;
                    if (tile.aborted) {
                        tile.state = 'unloaded';
                        callback(null);
                    } else if (img && buffer) {
                        var id = tile.tileID.canonical;
                        tile.state = 'loaded';
                        var canonical = tile.tileID.canonical;
                        var rectangle = this$1.view.viewpoint.tileInfo.tileXYToRectangle(canonical.x, canonical.y, canonical.z);
                        tile.rectangle = rectangle;
                        var level = this$1.view.viewpoint.targetZoom || this$1.view.viewpoint.level;
                        var resolution = this$1.view.viewpoint.tileInfo.getResolution(level);
                        var terrainData = terrainUtils.createHyTerrainData(buffer, rectangle, resolution);
                        var context = this$1.view.context;
                        var gl = context.gl;
                        tile.texture = this$1.view.getTileTexture(img.width);
                        if (tile.texture) {
                            tile.texture.update(img, {useMipmap: true});
                        } else {
                            tile.texture = new Texture(context, img, gl.RGBA, {useMipmap: true});
                            tile.texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);
                            if (context.extTextureFilterAnisotropic) {
                                gl.texParameterf(gl.TEXTURE_2D, context.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, context.extTextureFilterAnisotropicMax);
                            }
                        }
                        callback(null, terrainData);
                    }
                })*/
        })
        /*tile.request = Promise.all([fetch(url).then(function (response) {
            return response.arrayBuffer()
        }), request(imageUrl, {responseType: "image"}).then(function (resp) {
            return resp.data;
        })]).then(function (results) {
            delete tile.request;
            var buffer = results[0],
                img = results[1];
            if (tile.aborted) {
                tile.state = 'unloaded';
                callback(null);
            } else if (img && buffer) {
                var id = tile.tileID.canonical;
                tile.state = 'loaded';
                var canonical = tile.tileID.canonical;
                var rectangle = this$1.view.viewpoint.tileInfo.tileXYToRectangle(canonical.x, canonical.y, canonical.z);
                tile.rectangle = rectangle;
                var terrainData = terrainUtils.createHyTerrainData(buffer, rectangle, this$1.view.resolution);
                var context = this$1.view.context;
                var gl = context.gl;
                tile.texture = this$1.view.getTileTexture(img.width);
                if (tile.texture) {
                    tile.texture.update(img, {useMipmap: true});
                } else {
                    tile.texture = new Texture(context, img, gl.RGBA, {useMipmap: true});
                    tile.texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);
                    if (context.extTextureFilterAnisotropic) {
                        gl.texParameterf(gl.TEXTURE_2D, context.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, context.extTextureFilterAnisotropicMax);
                    }
                }
                callback(null, terrainData);
            }
        });*/
        /*tile.request = fetch(url).then(function (response) {
            return response.arrayBuffer();
        }).then(function (buffer) {
            delete tile.request;
            if (tile.aborted) {
                tile.state = 'unloaded';
                callback(null);
            } else if (buffer) {
                var id = tile.tileID.canonical;
                var terrainData = terrainUtils.createQuantizedMeshTerrainData(buffer, id.z, id.x, id.y);
                tile.state = 'loaded';
                callback(null, terrainData);
            }
        }).catch(function (err) {
            tile.state = 'errored';
            callback(err);
        })*/
    };
    TerrainSourceCache.prototype.abortTile = function abortTile(tile, callback) {
        if (tile.request) {
            tile.request.cancel();
            delete tile.request;
        }
        callback();
    };
    TerrainSourceCache.prototype.unloadTile = function unloadTile(tile, callback) {
        if (tile.texture) {
            this.view.saveTileTexture(tile.texture);
        }
        callback();
    };
    TerrainSourceCache.prototype.hasTransition = function hasTransition() {
        return false;
    };
    exports.TerrainSourceCache = TerrainSourceCache;
});