define("com/huayun/webgis/gl/draw/drawHeightMap", [
    "exports",
    "../mode",
    "../../geometry/Point",
    "../Texture",
    "../../utils/utils",
    "../programCache",
    "../glUtils",
    "custom/gl-matrix-min"
], function (exports, mode, Point, Texture, utils, programCache, glUtils, glMatrix) {

    var heightMapUniformValues = function (tile) {
        return {
            'u_min_height': tile.minimumHeight,
            'u_delta_height': tile.maximumHeight - tile.minimumHeight
        };
    };

    var drawHeightMap = function (painter, sourceCache, layer, tile) {
        var context = painter.view.context;
        var gl = context.gl;
        var program = programCache.useProgramSimplify(context, 'heightMap', {
            layoutAttributes: [
                {name: "a_pos", type: "Float32", components: 3, offset: 0}
                /*{name: "position3DAndHeight", type: "Float32", components: 4, offset: 0},
                {name: "textureCoordAndEncodedNormals", type: "Float32", components: 3, offset: 16}*/
                /*{name: 'a_pos', type: 'Int16', components: 2, offset: 0},
                {name: 'a_texture_pos', type: 'Int16', components: 2, offset: 4}*/
            ]
        });

        var stencilMode = mode.StencilMode.disabled;
        var colorMode = mode.ColorMode.alphaBlended;
        var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadWrite, gl.LESS);
        var bucket = tile.bucket;
        var fbo = tile.fbo;
        var width = painter.view.width,
            height = painter.view.height;
        if (!fbo) {
            fbo = tile.fbo = glUtils.generateFBO(context, 256, 256);
        }
        context.bindFramebuffer.set(fbo.framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        context.viewport.set([0, 0, 256, 256]);
        var uniformValues = heightMapUniformValues(tile);
        program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
            uniformValues, "tile", bucket.layoutVertexBuffer,
            bucket.indexBuffer, bucket.segments);
        context.bindFramebuffer.set(null);
        context.viewport.set([0, 0, width, height]);
        tile.heightTexture = fbo.colorAttachment.get();
    };

    return drawHeightMap;
});