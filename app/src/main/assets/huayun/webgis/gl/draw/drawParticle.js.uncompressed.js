define("com/huayun/webgis/gl/draw/drawParticle", [
  "custom/gl-matrix-min",
  "../mode"
], function (glMatrix, mode) {
  var drawParticle = function (painter, sourcePos, targetPos, deltaPos) {
    var colorMode = mode.ColorMode.srcBlended;
    var depthMode = painter.depthModeForSublayer();
    var context = painter.view.context;
    var gl = context.gl;

    var program = painter.view.useProgramSimplify('arcParticle', {
      layoutAttributes: [
        {name: "a_ratio", type: "Float32", components: 1, offset: 0}
      ]
    });

    var symbol = painter.layer.symbol;
    var uniform = symbol.uniforms;
    var position = painter.transform.center;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(sourcePos[0], sourcePos[1]);
    uniform["u_source_position"] = [0,0,0];
    uniform["u_target_position"] = deltaPos;

    program.drawArray(context, gl.POINTS, depthMode, null, colorMode, mode.CullFaceMode.disabled,
      uniform, "arcParticle", painter.layoutVertexArray, null, painter.rasterBoundsSegments);
  };

  return drawParticle;
});