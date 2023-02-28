define("com/huayun/webgis/views/3d/LevelGraphicsView", [
  "exports",
  "custom/gl-matrix-min",
  "com/huayun/webgis/gl/mode",
  "com/huayun/webgis/geometry/Point",
  "com/huayun/webgis/data/bucket/MultiCircleBucketSimplify"
], function (exports, glMatrix, mode, Point, MultiCircleBucketSimplify) {

  var addPoint = function (graphic, view, layer) {
    var bucket = new MultiCircleBucketSimplify();
    var center = view.viewpoint.center,
      cx = center[0],
      cy = center[1];
    var g = graphic.feature.geometry;
    var colors = graphic.feature.attributes.colors;
    bucket.addFeature([g.points], colors);
    bucket.upload(view.context);
    graphic.bucket = bucket;
    graphic.position = [cx, cy];
  };

  var drawPoint = function (painter, graphic) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var stencilMode = mode.StencilMode.disabled;
    var colorMode = mode.ColorMode.srcBlended;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('multiCircles', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 2, offset: 0},
        {name: "a_color", type: "Float32", components: 4, offset: 8}
      ]
    });
    var symbol = graphic.symbol;
    var level = painter.transform.level;

    var uniform = symbol.uniforms;
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);

    uniform["u_camera_to_center_distance"] = painter.transform.cameraToCenterDistance;

    var resolution = painter.transform.resolution;
    var pitchWithMap = symbol.pitchWithMap;
    var fixedSize = symbol.fixedSize;
    if (pitchWithMap) {
      if (fixedSize) {
        uniform["u_extrude_scale"] = [resolution, resolution];
      } else {
        uniform["u_extrude_scale"] = [1, 1];
      }
    } else {
      uniform["u_extrude_scale"] = painter.transform.pixelsToGLUnits;
    }

    uniform["radius"] = symbol.levelRadius[Math.round(level)];

    program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
      uniform, graphic.id,
      bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
      null, level);
  };

  exports.draw = {
    point: drawPoint
  };

  exports.add = {
    point: addPoint
  }
});