define("com/huayun/webgis/gl/draw/drawWater", [
    "exports",
    "../mode",
    "../../geometry/Point",
    "../Texture",
    "../../utils/utils",
    "../programCache",
    "custom/gl-matrix-min"
], function (exports, mode, Point, Texture, utils, programCache, glMatrix) {

    var waterUniformValues = function (matrix, depth) {
        return {
            'u_matrix': matrix,
            'u_water_depth': depth
        };
    };

    var drawWater = function (painter, sourceCache, layer, coords) {
        debugger;
        var context = painter.view.context;
        var gl = context.gl;
        var stencilMode = mode.StencilMode.disabled;
        var colorMode = mode.ColorMode.alphaBlended;
        var minTileZ = coords.length && coords[0].overscaledZ;
        var program = programCache.useProgramSimplify(context, 'water', {
            layoutAttributes: [
                {name: "a_pos", type: "Int16", components: 3, offset: 0}
            ]
        });
        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            var depthMode = painter.depthModeForSublayer(coord.overscaledZ - minTileZ, mode.DepthMode.ReadWrite, gl.LESS);
            var tile = sourceCache.getTile(coord);
            var posMatrix = coord.posMatrix;
            var bucket = tile.waterBucket;
            if (!bucket) {
                continue;
            }
            var uniformValues = waterUniformValues(posMatrix, painter.view.depth||0);
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                uniformValues, "water", bucket.layoutVertexBuffer,
                bucket.indexBuffer, bucket.segments);
        }
    };

    return drawWater;
});