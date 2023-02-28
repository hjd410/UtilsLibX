define("com/huayun/webgis/views/3d/BloomGraphicsView", [
  "exports",
  "custom/gl-matrix-min",
  "com/huayun/webgis/gl/mode",
  "com/huayun/webgis/data/bucket/FillBucketSimplify"
], function (exports, glMatrix, mode, FillBucket) {

  var drawFill = function (painter, graphic) {
    var colorMode = mode.ColorMode.alphaBlended;
    var depthMode = painter.depthModeForSublayer(1, mode.DepthMode.ReadOnly);

    var context = painter.view.context;
    var gl = context.gl;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('basicFill', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 2, offset: 0}
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

  var addPolygon = function (graphic, view) {
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
        l.push(new Point(p.x - cx, p.y - cy, 0));
      }
      g.push(l);
    }
    var bucket = new FillBucket();
    bucket.addFeature(g);
    bucket.upload(view.context);
    graphic.bucket = bucket;
    graphic.position = [cx, cy];
  };

  exports.draw = {
    polygon: drawFill
  };

  exports.add = {
    polygon: addPolygon
  }
});