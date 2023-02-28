define("com/huayun/webgis/views/3d/MultiGraphicsView", [
  "exports",
  "custom/gl-matrix-min",
  "com/huayun/webgis/geometry/Point2D",
  "com/huayun/webgis/gl/mode",
  "com/huayun/webgis/data/bucket/MultiCircleBucketSimplify",
  "com/huayun/webgis/data/bucket/MultiFillBucketSimplify"
], function (exports, glMatrix, Point2D, mode, MultiCircleBucketSimplify, MultiFillBucket) {

  var addPoint = function(graphic, view, layer) {
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

  var drawPoint = function(painter, graphic) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var stencilMode = mode.StencilMode.disabled;
    var colorMode = mode.ColorMode.alphaBlended;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('multiCircles', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 2, offset: 0},
        {name: "a_color", type: "Float32", components: 3, offset: 8}
      ]
    });
    var symbol = graphic.symbol;

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
    program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
      uniform, graphic.id,
      bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
      null, painter.transform.level);
  };

  var addPolygon = function(graphic, view, layer) {
    var geometry = graphic.feature.geometry;
    var center = view.viewpoint.center,
      cx = center[0],
      cy = center[1];
    // 地理坐标点的转换 todo 抽取方法
    var points = geometry.path;
    var g = [];
    for (var i = 0; i < points.length; i++) {
      var line = points[i];
      var l = [];
      for (var j = 0; j < line.length; j++) {
        var p = line[j];
        l.push(new Point2D(p.x - cx, p.y - cy, 0));
      }
      g.push(l);
    }
    var bucket = new MultiFillBucket();
    bucket.addFeature(g, graphic.feature.attributes.colors);
    bucket.upload(view.context);
    graphic.bucket = bucket;
    graphic.position = [cx, cy];
  };

  var drawPolygon = function(painter, graphic) {
    var colorMode = mode.ColorMode.srcBlended;
    var depthMode = painter.depthModeForSublayer(1, mode.DepthMode.ReadOnly);

    var context = painter.view.context;
    var gl = context.gl;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('multiPolygon', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 2, offset: 0},
        {name: "a_color", type: "Float32", components: 4, offset: 8}
      ]
    });

    var symbol = graphic.symbol;
    var uniform = symbol.uniforms;
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
    program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled,
      uniform, graphic.id, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
      null, painter.transform.level);
  };

  exports.draw = {
    point: drawPoint,
    polygon: drawPolygon
  };

  exports.add = {
    point: addPoint,
    polygon: addPolygon
  }
});