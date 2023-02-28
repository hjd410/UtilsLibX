 define("com/huayun/webgis/gl/draw/drawArc", [
    "custom/gl-matrix-min",
    "../mode"
], function (glMatrix, mode) {
    var drawArc = function (painter, sourcePos, targetPos, deltaPos) {
        var colorMode = mode.ColorMode.alphaBlended;
        var depthMode = painter.depthModeForSublayer();
        var context = painter.view.context;
        var gl = context.gl;

        var program = painter.view.useProgramSimplify('arc', {
            layoutAttributes: [
                {name: "a_pos", type: "Float32", components: 3, offset: 0}
            ]
        });

        var symbol = painter.layer.symbol;
        var uniform = symbol.uniforms;
        var position = painter.transform.center;
        uniform["u_matrix"] = painter.transform.getMatrixForPoint(sourcePos[0], sourcePos[1]);
        uniform["u_source_position"] = [0,0,0];
        uniform["u_target_position"] = deltaPos;
        uniform["numSegments"] = 50;
        uniform["u_units_to_pixels"] =  [painter.transform.width, painter.transform.height];
        program.drawArray(context, gl.TRIANGLE_STRIP, depthMode, null, colorMode, mode.CullFaceMode.disabled,
            uniform, "arc", painter.layoutVertexArray, null, painter.rasterBoundsSegments);
    };

    return drawArc;
});