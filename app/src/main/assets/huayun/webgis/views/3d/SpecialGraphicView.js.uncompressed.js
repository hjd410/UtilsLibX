define("com/huayun/webgis/views/3d/SpecialGraphicView", [
  "exports",
  "custom/gl-matrix-min",
  "com/huayun/webgis/geometry/Point",
  "com/huayun/webgis/gl/mode",
  "com/huayun/webgis/data/bucket/CircleBucketSimplify"
], function (exports, glMatrix, Point, mode, CircleBucket) {
  var addTyphoon = function(graphic, view, layer) {
    var bucket = new CircleBucket();
    var center = view.viewpoint.center,
      cx = center[0],
      cy = center[1];
    var g = graphic.feature.geometry;
    bucket.addFeature([[new Point(Math.round(g.x - cx), Math.round(g.y - cy))]]);
    bucket.upload(view.context);
    graphic.bucket = bucket;
    graphic.position = [cx, cy];
  };

  var drawTyphoon = function(painter, graphic) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var stencilMode = mode.StencilMode.disabled;
    var colorMode = mode.ColorMode.alphaBlended;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('fan', {
      layoutAttributes: [{name: "a_pos", type: "Float32", components: 2, offset: 0}]
    });

    var symbol = graphic.symbol;
    symbol.subSymbols.forEach(function (subSymbol) {
      var uniform = subSymbol.uniforms;
      var position = graphic.position;
      uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
      uniform["u_camera_to_center_distance"] = painter.transform.cameraToCenterDistance;

      var resolution = painter.transform.resolution;
      var pitchWithMap = subSymbol.pitchWithMap;
      var fixedSize = subSymbol.fixedSize;
      uniform["stroke_width"] = subSymbol.strokeWidth * resolution;
      uniform["gap"] = subSymbol.strokeWidth * resolution / subSymbol.radius;
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
    }.bind(this));
  };

  exports.draw = {
    typhoon: drawTyphoon
  };

  exports.add = {
    typhoon: addTyphoon
  }
});