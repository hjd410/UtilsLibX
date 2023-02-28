define("com/huayun/webgis/gl/draw/drawRaster", [
    "exports",
    "../mode",
    "../../geometry/Point",
    "../Texture",
    "../../utils/utils",
    "custom/gl-matrix-min"
], function (exports, mode, Point, Texture, utils, glMatrix) {

    var rasterUniformValues = function (matrix, parentTL, parentScaleBy, fade, layer) {
        return ({
            'u_matrix': matrix,
            'u_tl_parent': parentTL,
            'u_scale_parent': parentScaleBy,
            'u_buffer_scale': 1,
            'u_fade_t': fade.mix,
            'u_opacity': fade.opacity,
            'u_image0': 0,
            'u_image1': 1,
            'u_brightness_low': 0,
            'u_brightness_high': 1,
            'u_saturation_factor': -0,
            'u_contrast_factor': 1,
            'u_spin_weights': [1, 0, 0]
        });
    };

    /**
     * 获取数据
     * @param tile
     * @param parentTile
     * @param sourceCache
     * @param transform
     */
    function getFadeValues(tile, parentTile, sourceCache, transform) {
        var fadeDuration = 300;
        if (fadeDuration > 0) {
            var now = utils.now();
            var sinceTile = (now - tile.timeAdded) / fadeDuration;
            var sinceParent = parentTile ? (now - parentTile.timeAdded) / fadeDuration : -1;

            var source = sourceCache.getSource();
            var idealZ = transform.coveringZoomLevel({
                tileSize: source.tileSize,
                roundZoom: source.roundZoom
            });
            var fadeIn = !parentTile || Math.abs(parentTile.tileID.overscaledZ - idealZ) > Math.abs(tile.tileID.overscaledZ - idealZ);
            var childOpacity = (fadeIn && tile.refreshedUponExpiration) ? 1 : utils.clamp(fadeIn ? sinceTile : 1 - sinceParent, 0, 1);
            /*if (tile.refreshedUponExpiration && sinceTile >= 1) {
                tile.refreshedUponExpiration = false;
            }*/

            if (parentTile) {
                return {
                    opacity: 1,
                    mix: 1 - childOpacity
                };
            } else {
                return {
                    opacity: childOpacity,
                    mix: 0
                };
            }
        } else {
            return {
                opacity: 1,
                mix: 0
            };
        }
    }

    return function (painter, sourceCache, layer, coords) {
        var context = painter.view.context;
        var gl = context.gl;
        var source = sourceCache.getSource();
        var program = painter.view.useProgram('raster');

        var stencilMode = mode.StencilMode.disabled;
        var colorMode = mode.ColorMode.alphaBlended;
        var minTileZ = coords.length && coords[0].overscaledZ;
        var align = true;//!painter.options.moving;
        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            var depthMode = painter.depthModeForSublayer(coord.overscaledZ - minTileZ, mode.DepthMode.ReadWrite, gl.LESS);
            var tile = sourceCache.getTile(coord);
            var posMatrix = coord.posMatrix;
            tile.registerFadeDuration(300);

            var parentTile = sourceCache.findLoadedParent(coord, 0),
                fade = getFadeValues(tile, parentTile, sourceCache, painter.transform);
            if (fade.opacity < 1) {
                painter._fadeDirty = true;
            }
            var parentScaleBy = (void 0), parentTL = (void 0);

            var textureFilter = gl.LINEAR;

            context.activeTexture.set(gl.TEXTURE0);
            tile.texture.bind(textureFilter, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);

            context.activeTexture.set(gl.TEXTURE1);

            if (parentTile) {
                parentTile.texture.bind(textureFilter, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);
                parentScaleBy = Math.pow(2, parentTile.tileID.overscaledZ - tile.tileID.overscaledZ);
                parentTL = [tile.tileID.canonical.x * parentScaleBy % 1, tile.tileID.canonical.y * parentScaleBy % 1];

            } else {
                tile.texture.bind(textureFilter, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);
            }

            var uniformValues = rasterUniformValues(posMatrix, parentTL || [0, 0], parentScaleBy || 1, fade, layer);
            program.draw2(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                uniformValues, "tile", painter.rasterBoundsBuffer,
                painter.quadTriangleIndexBuffer, painter.rasterBoundsSegments);
        }
    };
});