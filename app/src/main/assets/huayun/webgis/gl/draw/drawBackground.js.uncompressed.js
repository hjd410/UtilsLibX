define("com/huayun/webgis/gl/draw/drawBackground", [
    "../mode",
    "../programCache"
], function (mode, programCache) {

    function drawBackground(view) {
        var context = view.context;
        var gl = context.gl;
        var program = programCache.useProgramSimplify(context, 'bg', {
            layoutAttributes: [
                {name: "a_pos", type: "Float32", components: 3, offset: 0}
            ]
        });

        var textureFilter = gl.LINEAR;
        context.activeTexture.set(gl.TEXTURE0);
        view._backgroundTexture.bind(textureFilter, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);

        var stencilMode = mode.StencilMode.disabled;
        var depthMode = new mode.DepthMode(gl.LEQUAL, mode.DepthMode.ReadWrite, [0, 1]);
        var colorMode = mode.ColorMode.alphaBlended;

        program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
            {}, "background", view.viewpoint.rasterBoundsBuffer,
            view.viewpoint.quadTriangleIndexBuffer, view.viewpoint.rasterBoundsSegments);
    }

    return drawBackground;
})