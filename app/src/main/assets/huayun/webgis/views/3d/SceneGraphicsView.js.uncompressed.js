define("com/huayun/webgis/views/3d/SceneGraphicsView", [
  "exports",
  "custom/gl-matrix-min",
  "com/huayun/webgis/gl/mode",
  "com/huayun/webgis/data/ArrayType",
  "com/huayun/webgis/gl/SegmentVector",
  "com/huayun/webgis/geometry/Point"
], function (exports, glMatrix, mode, ArrayType, SegmentVector, Point) {

  var addLineParticle = function (graphic, view, layer) {
    var geometry = graphic.feature.geometry;
    var center = view.viewpoint.center,
      cx = center[0],
      cy = center[1];
    var points = geometry.path;
    var g = [];
    for (var i = 0; i < points.length; i++) {
      var line = points[i];
      var l = [];
      for (var j = 0; j < line.length; j++) {
        var p = line[j];
        l.push([Math.round(p.x - cx), Math.round(p.y - cy), Math.round(p.z - 0)]);
      }
      g.push(l);
    }
    graphic.position = [cx, cy];
    graphic.lines = g;

    var NUM_SEGMENTS = graphic.symbol.segment;
    var rasterBoundsArray = new ArrayType.StructArrayLayout1f4();
    for (i = 0; i < NUM_SEGMENTS; i++) {
      rasterBoundsArray.emplaceBack(i / NUM_SEGMENTS);
    }
    graphic.layoutVertexArray = view.context.createVertexBuffer(rasterBoundsArray, [
      {name: "a_ratio", type: "Float32", components: 1, offset: 0}
    ]);
    graphic.rasterBoundsSegments = SegmentVector.simpleSegment(0, 0, NUM_SEGMENTS, 1);
  };

  var drawLineParticle = function (painter, graphic) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var colorMode = mode.ColorMode.srcBlended;

    var symbol = graphic.symbol;

    var program = painter.view.useProgramSimplify("lineParticle", {
      layoutAttributes: [
        {name: "a_ratio", type: "Float32", components: 1, offset: 0}
      ]
    });

    var uniform = symbol.uniforms;
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);

    var lines = graphic.lines;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      uniform["u_source_position"] = line[0];
      uniform["u_target_position"] = line[1];
      program.drawArray(context, gl.POINTS, depthMode, null, colorMode, mode.CullFaceMode.disabled,
        uniform, "arcParticle", graphic.layoutVertexArray, null, graphic.rasterBoundsSegments);
    }
  };

  exports.draw = {
    "lineParticle": drawLineParticle
  };

  exports.add = {
    "lineParticle": addLineParticle
  }
});