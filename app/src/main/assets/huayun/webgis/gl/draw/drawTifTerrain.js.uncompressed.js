define("com/huayun/webgis/gl/draw/drawTifTerrain", [
    "exports",
    "../mode",
    "../../geometry/Point",
    "../Texture",
    "../../utils/utils",
    "../programCache",
    "custom/gl-matrix-min"
], function (exports, mode, Point, Texture, utils, programCache, glMatrix) {

    var terrainUniformValues = function (matrix) {
        return {
            'u_matrix': matrix,
            'u_image': 0
        };
    };

    var drawTerrain = function (painter, sourceCache, layer, coords) {
        var context = painter.view.context;
        var gl = context.gl;
        var program = programCache.useProgramSimplify(context, 'tifTerrain', {
            layoutAttributes: [
                {name: "a_pos", type: "Float32", components: 3, offset: 0}
            ]
        });
        var stencilMode = mode.StencilMode.disabled;
        var colorMode = mode.ColorMode.alphaBlended;
        var minTileZ = coords.length && coords[0].overscaledZ;

        // var depthMode = new mode.DepthMode(painter.view.context.gl.LESS, mode.DepthMode.ReadWrite, painter.depthRangeFor3D);
        var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadWrite);
        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            // var depthMode = painter.depthModeForSublayer(coord.overscaledZ - minTileZ, mode.DepthMode.ReadWrite, gl.LESS);
            var tile = sourceCache.getTile(coord);
            var posMatrix = coord.posMatrix;
            var bucket = tile.bucket;
            if (!bucket) {
                continue;
            }
            var textureFilter = gl.LINEAR;
            context.activeTexture.set(gl.TEXTURE0);
            tile.texture.bind(textureFilter, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);

            /*gl.bindTexture(gl.TEXTURE_2D, tile.heightTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);*/

            var uniformValues = terrainUniformValues(posMatrix);
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                uniformValues, "terrain", bucket.layoutVertexBuffer,
                bucket.indexBuffer, bucket.segments);
        }
        /*program = programCache.useProgramSimplify(context, 'water', {
            layoutAttributes: [
                {name: "a_pos", type: "Int16", components: 3, offset: 0}
            ]
        });*/
    };

    return drawTerrain;
});