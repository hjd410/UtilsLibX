define("com/huayun/webgis/gl/draw/drawTerrain", [
    "exports",
    "../mode",
    "../../geometry/Point",
    "../Texture",
    "../../utils/utils",
    "../programCache",
    "custom/gl-matrix-min"
], function (exports, mode, Point, Texture, utils, programCache, glMatrix) {

    var terrainUniformValues = function (matrix, rectangle, resolution) {
        var color = Math.random();
        return {
            'u_matrix': matrix,
            'u_tileRectangle': [0,  0, 8192, 8192],
            // 'u_color': [1.0, 0.0, 0.0, 1.0]
            'u_color': [color, color, color, 1.0],
            'u_image': 0
        };
    };

    var drawTerrain = function (painter, sourceCache, layer, coords) {
        var context = painter.view.context;
        var gl = context.gl;
        var program = programCache.useProgramSimplify(context, 'terrain', {
            layoutAttributes: [
                {name: "position3DAndHeight", type: "Float32", components: 4, offset: 0},
                {name: "textureCoordAndEncodedNormals", type: "Float32", components: 3, offset: 16}
                /*{name: 'a_pos', type: 'Int16', components: 2, offset: 0},
                {name: 'a_texture_pos', type: 'Int16', components: 2, offset: 4}*/
            ]
        });

        var stencilMode = mode.StencilMode.disabled;
        var colorMode = mode.ColorMode.alphaBlended;
        var minTileZ = coords.length && coords[0].overscaledZ;
        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            var depthMode = painter.depthModeForSublayer(coord.overscaledZ - minTileZ, mode.DepthMode.ReadWrite, gl.LESS);
            var tile = sourceCache.getTile(coord);
            var posMatrix = coord.posMatrix;
            var bucket = tile.bucket;

            var textureFilter = gl.LINEAR;
            context.activeTexture.set(gl.TEXTURE0);
            tile.texture.bind(textureFilter, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);

            /*gl.bindTexture(gl.TEXTURE_2D, tile.heightTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, textureFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, textureFilter);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);*/

            debugger;
            var uniformValues = terrainUniformValues(posMatrix, tile.rectangle, painter.view.resolution);
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
               uniformValues, "tile", bucket.vertexBuffer,
                bucket.indexBuffer, bucket.segments);
        }
    };

    return drawTerrain;
});