define("com/huayun/webgis/views/3d/AnimateGraphicsView", [
  "exports",
  "custom/gl-matrix-min",
  "com/huayun/webgis/gl/mode",
  "com/huayun/webgis/data/ArrayType",
  "com/huayun/webgis/gl/SegmentVector",
  "com/huayun/webgis/geometry/Point"
], function (exports, glMatrix, mode, ArrayType, SegmentVector, Point) {

  var addLine = function (graphic, view, layer) {
    var quadTriangleIndices = new ArrayType.StructArrayLayout3ui6();
    quadTriangleIndices.emplaceBack(0, 1, 2);
    quadTriangleIndices.emplaceBack(1, 3, 2);

    var rasterBoundsArray = new ArrayType.StructArrayLayout3f12();
    rasterBoundsArray.emplaceBack(0, 1, 0);
    rasterBoundsArray.emplaceBack(0, -1, 0);
    rasterBoundsArray.emplaceBack(1, 1, 1);
    rasterBoundsArray.emplaceBack(1, -1, 1);

    var geometry = graphic.feature.geometry;
    var center = view.viewpoint.center,
      cx = center[0],
      cy = center[1];

    var paths = geometry.path;
    var count = 0;
    var positionArray = new ArrayType.StructArrayLayout6fb24();
    for (var i = 0; i < paths.length; i++) {
      var line = paths[i];
      var p1 = line[0],
        p2 = line[1],
        p3 = line[2];
      positionArray.emplaceBack(
        Math.round(p1.x - cx), Math.round(p1.y - cy),
        Math.round(p2.x - cx), Math.round(p2.y - cy),
        Math.round(p3.x - cx), Math.round(p3.y - cy)
      );
      count++;
    }

    var instanceBuffer = view.context.createVertexBuffer(positionArray, [
      {name: "source", type: "Float32", components: 2, offset: 0},
      {name: "middle", type: "Float32", components: 2, offset: 8},
      {name: "target", type: "Float32", components: 2, offset: 16}
    ]);

    graphic.vertexBuffer = view.context.createVertexBuffer(rasterBoundsArray, [
      {name: "a_data", type: "Float32", components: 3, offset: 0}
    ]);
    graphic.indexBuffer = view.context.createIndexBuffer(quadTriangleIndices);
    graphic.instanceBuffer = instanceBuffer;
    graphic.segment = SegmentVector.simpleSegment(0, 0, 4, 2);
    graphic.position = [cx, cy];
    graphic.count = count;
  };

  var drawLine = function (painter, graphic) {
    var colorMode = mode.ColorMode.srcBlended;
    var depthMode = painter.depthModeForSublayer();
    var context = painter.view.context;
    var stencilMode = mode.StencilMode.disabled;
    var gl = context.gl;

    var program = painter.view.useProgramSimplify('moveLine', {
      layoutAttributes: [
        {name: "a_data", type: "Float32", components: 3, offset: 0},
        {name: "source", type: "Float32", components: 2, offset: 0},
        {name: "middle", type: "Float32", components: 2, offset: 8},
        {name: "target", type: "Float32", components: 2, offset: 16}
      ]
    });

    var symbol = graphic.symbol;
    var uniform = symbol.uniforms;
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
    uniform["segment"] = 50;
    uniform["u_len"] = symbol.length * painter.view.resolution;

    program.drawInstancedANGLE(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled, uniform,
      graphic.id, graphic.vertexBuffer, graphic.indexBuffer, graphic.segment, graphic.instanceBuffer, graphic.count);
  };

  //---------------------------------------------------------------------------------Arc部分
  var addArc = function (graphic, view, layer) {

    var quadTriangleIndices = new ArrayType.StructArrayLayout3ui6();
    quadTriangleIndices.emplaceBack(0, 1, 2);
    quadTriangleIndices.emplaceBack(1, 3, 2);

    var rasterBoundsArray = new ArrayType.StructArrayLayout3f12();
    rasterBoundsArray.emplaceBack(-1, 1, 0);
    rasterBoundsArray.emplaceBack(-1, -1, 0);
    rasterBoundsArray.emplaceBack(1, 1, 1);
    rasterBoundsArray.emplaceBack(1, -1, 1);

    var geometry = graphic.feature.geometry;
    var center = view.viewpoint.center,
      cx = center[0],
      cy = center[1];

    var paths = geometry.path;
    var count = 0;
    var positionArray = new ArrayType.StructArrayLayout6fb24();
    for (var i = 0; i < paths.length; i++) {
      var line = paths[i];
      var p1 = line[0],
        p2 = line[1];
      positionArray.emplaceBack(
        Math.round(p1.x - cx), Math.round(p1.y - cy), 0,
        Math.round(p2.x - cx), Math.round(p2.y - cy), 0
      );
      count++;
    }

    var instanceBuffer = view.context.createVertexBuffer(positionArray, [
      {name: "source", type: "Float32", components: 3, offset: 0},
      {name: "target", type: "Float32", components: 3, offset: 12}
    ]);

    graphic.vertexBuffer = view.context.createVertexBuffer(rasterBoundsArray, [
      {name: "a_pos", type: "Float32", components: 3, offset: 0}
    ]);
    graphic.indexBuffer = view.context.createIndexBuffer(quadTriangleIndices);
    graphic.instanceBuffer = instanceBuffer;
    graphic.segment = SegmentVector.simpleSegment(0, 0, 4, 2);
    graphic.position = [cx, cy];
    graphic.count = count;
  };

  var drawArc = function (painter, graphic) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var colorMode = mode.ColorMode.srcBlended;

    var symbol = graphic.symbol;
    var program = painter.view.useProgramSimplify('moveArc', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 3, offset: 0},
        {name: "source", type: "Float32", components: 3, offset: 0},
        {name: "target", type: "Float32", components: 3, offset: 12}
      ]
    });

    var uniform = symbol.uniforms;
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
    uniform["numSegments"] = 50;
    uniform["u_len"] = symbol.length * painter.view.resolution;

    program.drawInstancedANGLE(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled, uniform,
      graphic.id, graphic.vertexBuffer, graphic.indexBuffer, graphic.segment, graphic.instanceBuffer, graphic.count);
  };

  //--------------------------------------------------------------------------------------------------arcParticle
  var addArcParticle = function (graphic, view, layer) {
    var NUM_SEGMENTS = 50;
    var rasterBoundsArray = new ArrayType.StructArrayLayout1f4();
    for (var i = 0; i < NUM_SEGMENTS; i++) {
      rasterBoundsArray.emplaceBack(i / NUM_SEGMENTS);
    }
    var geometry = graphic.feature.geometry;
    var center = view.viewpoint.center,
      cx = center[0],
      cy = center[1];

    var paths = geometry.path;
    var count = 0;
    var positionArray = new ArrayType.StructArrayLayout6fb24();
    for (i = 0; i < paths.length; i++) {
      var line = paths[i];
      var p1 = line[0],
        p2 = line[1];
      positionArray.emplaceBack(
        Math.round(p1.x - cx), Math.round(p1.y - cy), 0,
        Math.round(p2.x - cx), Math.round(p2.y - cy), 0
      );
      count++;
    }

    graphic.vertexBuffer = view.context.createVertexBuffer(rasterBoundsArray, [
      {name: "a_ratio", type: "Float32", components: 1, offset: 0}
    ]);
    graphic.instanceBuffer = view.context.createVertexBuffer(positionArray, [
      {name: "source", type: "Float32", components: 3, offset: 0},
      {name: "target", type: "Float32", components: 3, offset: 12}
    ]);
    graphic.segment = SegmentVector.simpleSegment(0, 0, NUM_SEGMENTS, 1);
    graphic.position = [cx, cy];
    graphic.count = count;
  };

  var drawArcParticle = function (painter, graphic) {
    var colorMode = mode.ColorMode.srcBlended;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var context = painter.view.context;
    var gl = context.gl;

    var program = painter.view.useProgramSimplify('arcParticle', {
      layoutAttributes: [
        {name: "a_ratio", type: "Float32", components: 1, offset: 0},
        {name: "source", type: "Float32", components: 3, offset: 0},
        {name: "target", type: "Float32", components: 3, offset: 12}
      ]
    });

    var symbol = graphic.symbol;
    var uniform = symbol.uniforms;
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
    program.drawArraysInstancedANGLE(context, gl.POINTS, depthMode, null, colorMode, mode.CullFaceMode.disabled, uniform,
      graphic.id, graphic.vertexBuffer, null, graphic.segment, graphic.instanceBuffer, graphic.count)
  };

  exports.draw = {
    line: drawLine,
    arc: drawArc,
    arcParticle: drawArcParticle
  };

  exports.add = {
    line: addLine,
    arc: addArc,
    arcParticle: addArcParticle
  }
});