/**
 * 静态切片图层的切片数据请求类
 * @see com.huayun.webgis.layers.support.RasterTileSource
 */
define("com/huayun/webgis/layers/support/RasterTileSource", [
    "../../facade/TileFacade",
    "../../gl/Texture"
], function (TileFacade, Texture) {
    /**
     * 静态切片图层的切片数据请求类
     * @ignore
     * @alias com.huayun.webgis.layers.support.RasterTileSource
     * @param id
     * @param options
     * @param url
     * @param layer
     * @constructor
     */
    function RasterTileSource(id, options, url, layer) {
        this.id = id;
        this.type = 'raster';
        this.minzoom = options.minzoom;
        this.maxzoom = options.maxzoom;
        this.roundZoom = true;
        this.scheme = 'xyz';
        this.tileSize = options.tileSize || 256;
        this.url = url;
        this.layer = layer;
    }

    RasterTileSource.prototype.hasTile = function hasTile(tileID) {
        // return !this.tileBounds || this.tileBounds.contains(tileID.canonical);
    };

    RasterTileSource.prototype.updateTileUrl = function (url) {
        this.url = url;
    };

    /**
     * 发起请求获取切片
     * @param tile
     * @param callback
     */
    RasterTileSource.prototype.loadTile = function loadTile(tile, callback) {
        var this$1 = this;
        var url = tile.tileID.canonical.url([this.url]);
        tile.request = TileFacade.loadTile(url, function (err, img) {
            delete tile.request;
            if (tile.aborted) {
                tile.state = 'unloaded';
                callback(null);
            } else if (err) {
                tile.state = 'errored';
                callback(err);
            } else if (img) {
                var context = this$1.layer.layerView.view.context;
                var gl = context.gl;
                tile.texture = this$1.layer.layerView.getTileTexture(img.width);
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
        })
    };

    /**
     * 放弃请求切片
     * @param tile
     * @param callback
     */
    RasterTileSource.prototype.abortTile = function abortTile(tile, callback) {
        if (tile.request) {
            tile.request.cancel();
            delete tile.request;
        }
        callback();
    };

    /**
     * 上传切片
     * @param tile
     * @param callback
     */
    RasterTileSource.prototype.unloadTile = function unloadTile(tile, callback) {
        if (tile.texture) {
            this.layer.layerView.saveTileTexture(tile.texture);
        }
        callback();
    };

    RasterTileSource.prototype.hasTransition = function hasTransition() {
        return false;
    };

    return RasterTileSource;
})