define("com/huayun/webgis/views/3d/GraphicsView", [
  "exports",
  "custom/gl-matrix-min",
  "com/huayun/webgis/gl/mode",
  "com/huayun/webgis/gl/Texture",
  "../../gl/programAttributes",
  "com/huayun/webgis/gl/GlyphAtlas",
  "com/huayun/webgis/geometry/Point",
  "com/huayun/webgis/data/ArrayType",
  "com/huayun/webgis/utils/TinySDF",
  "com/huayun/webgis/utils/image",
  "com/huayun/webgis/data/bucket/CircleBucketSimplify",
  "com/huayun/webgis/data/bucket/FillBucketSimplify",
  "com/huayun/webgis/data/bucket/LineBucketSimplify2",
  "com/huayun/webgis/data/bucket/ImageBucketSimplify",
  "com/huayun/webgis/data/bucket/TextBucketSimplify",
  "com/huayun/webgis/data/bucket/PointsBucket",
  "com/huayun/webgis/data/commonVBO",
  "com/huayun/webgis/gl/SegmentVector"
], function (exports, glMatrix, mode, Texture, programAttributes, GlyphAtlas, Point, ArrayType, TinySDF, image,
             CircleBucket, FillBucket, LineBucket, ImageBucket, TextBucket, PointsBucket, commonVBO, SegmentVector) {

  /**
   * 普通实线的着色器使用的Uniform
   */
  var lineUniformValues = function (painter, graphic, symbol) {
    var uniform = symbol.uniforms;
    // uniform["u_matrix"] = painter.transform.centerMatrix;
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
    uniform["u_units_to_pixels"] = [painter.transform.width / 2, -painter.transform.height / 2];
    uniform["u_ratio"] = 1 / painter.transform.resolution;
    return uniform;
  };

  /**
   * 虚线的着色器使用的Uniform
   */
  var lineSDFUniformValues = function (painter, graphic, symbol) {
    var r = 1 / painter.view.resolution;

    var uniform = symbol.uniforms;
    // uniform["u_matrix"] = painter.transform.centerMatrix;
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
    uniform["u_units_to_pixels"] = [painter.transform.width / 2, -painter.transform.height / 2];
    uniform["u_ratio"] = r;
    uniform["u_image"] = 0;
    uniform["u_patternscale_a"] = [r / symbol.widthA, uniform["u_patternscale_a"][1]];
    uniform["u_patternscale_b"] = [r / symbol.widthB, uniform["u_patternscale_b"][1]];

    return uniform;
  };
  /**
   * 绘制线: 支持实线,虚线,带图标的线,渐变的线
   * @param {LayerView} painter - 图层View
   * @param {Graphic} graphic - 线图形
   */
  var drawLine = function (painter, graphic, glow) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var colorMode = mode.ColorMode.alphaBlended;
    var bucket = graphic.bucket;

    var symbol = graphic.highLightSymbol || graphic.symbol;
    var dasharray = symbol.dasharray;
    var programId = dasharray ? "basicLineSDF" : "basicLine"; // 判断是否是虚线
    var program = painter.view.useProgramSimplify(programId, programAttributes.basicLine);

    if (dasharray) {
      context.activeTexture.set(gl.TEXTURE0);
      symbol.lineAtlas.bind(context);
    }

    var uniform = dasharray ? lineSDFUniformValues(painter, graphic, symbol) : lineUniformValues(painter, graphic, symbol);
    var color;
    if (glow) {
      color = glow.color;
      uniform["u_color"] = color;
      uniform["u_opacity"] = glow.opacity;
      uniform["u_width"] = Math.max(symbol.width, 4);
    } else {
      color = graphic.feature.attributes.color;
      if (color) {
        uniform["u_color"] = color;
      } else {
        // color = symbol.color;
        // uniform["u_color"] = [color.r, color.g, color.b, color.a];
        uniform["u_color"] = symbol.color;
        uniform["u_opacity"] = symbol.opacity;
      }
      uniform["u_width"] = symbol.width;
    }

    program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled, uniform,
      graphic.id, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
      null, painter.view.viewpoint.level);
  };


  var drawCircles = function (painter, graphic) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var stencilMode = mode.StencilMode.disabled;
    var colorMode = mode.ColorMode.alphaBlended;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('circle', {
      layoutAttributes: [{name: "a_pos", type: "Float32", components: 2, offset: 0}]
    });

    var uniform = graphic.symbol.uniforms;
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
    var r = graphic.feature.geometry.radius || 1;
    uniform["u_camera_to_center_distance"] = painter.transform.cameraToCenterDistance;

    var resolution = painter.transform.resolution;
    var pitchWithMap = graphic.symbol.pitchWithMap;
    var fixedSize = graphic.symbol.fixedSize;
    if (pitchWithMap) {
      if (fixedSize) {
        uniform["u_extrude_scale"] = [resolution, resolution];
      } else {
        uniform["u_extrude_scale"] = [1, 1];
      }
    } else {
      uniform["u_extrude_scale"] = painter.transform.pixelsToGLUnits;
    }
    uniform["radius"] = r;
    program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
      uniform, graphic.id,
      bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
      null, painter.transform.level);
  };

  var drawFan = function (painter, graphic) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var stencilMode = mode.StencilMode.disabled;
    var colorMode = mode.ColorMode.alphaBlended;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('fan', {
      layoutAttributes: [{name: "a_pos", type: "Float32", components: 2, offset: 0}]
    });

    var uniform = graphic.symbol.uniforms;
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
    uniform["u_camera_to_center_distance"] = painter.transform.cameraToCenterDistance;
    var resolution = painter.transform.resolution;
    var pitchWithMap = graphic.symbol.pitchWithMap;
    var fixedSize = graphic.symbol.fixedSize;
    uniform["stroke_width"] = graphic.symbol.strokeWidth * resolution;
    uniform["gap"] = graphic.symbol.strokeWidth * resolution / graphic.symbol.radius;
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

  var drawPoint = function (painter, graphic, glow) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var stencilMode = mode.StencilMode.disabled;
    var colorMode = mode.ColorMode.alphaBlended;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('circle', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 2, offset: 0}
      ]
    });
    var symbol = graphic.highLightSymbol || graphic.symbol;

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

    var color;
    if (glow) {
      color = glow.color;
      uniform["color"] = color;
      uniform["opacity"] = glow.opacity;
      uniform['radius'] = symbol.radius + symbol.strokeWidth + 2;
    } else {
      color = symbol.color;
      uniform["color"] = [color.r, color.g, color.b, color.a];
      uniform["opacity"] = symbol.opacity;
      uniform['radius'] = symbol.radius;
    }

    program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
      uniform, graphic.id,
      bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
      null, painter.transform.level);
  };

  var drawFill = function (painter, graphic, glow) {
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

    var symbol = graphic.highLightSymbol || graphic.symbol;
    var uniform = symbol.uniforms;
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
    var color;
    if (glow) { // 发光, 绘制光的颜色
      color = glow.color;
      uniform["u_color"] = [color.r, color.g, color.b, color.a];
      uniform["u_opacity"] = glow.opacity;
    } else {
      color = symbol.color;
      uniform["u_color"] = color;
      uniform["u_opacity"] = symbol.opacity;
    }
    program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled,
      uniform, graphic.id, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
      null, painter.transform.level);
  };

  var drawMultiPoint = function (painter, graphic) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = new mode.DepthMode(gl.LEQUAL, mode.DepthMode.ReadOnly, [0, 0]);
    var colorMode = mode.ColorMode.alphaBlended;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('multiPoints', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 2, offset: 0}
      ]
    });

    var uniform = {};
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);

    program.draw2(context, gl.POINTS, depthMode, null, colorMode, mode.CullFaceMode.disabled, uniform,
      graphic.id, bucket.layoutVertexBuffer, bucket.length);
  };

  function getLabelPlaneMatrix(posMatrix, pitchWithMap, rotateWithMap, labelPlaneMatrix, pixelsToTileUnits) {
    var m = glMatrix.mat4.create();
    if (pitchWithMap) {
      glMatrix.mat4.scale(m, m, [1 / pixelsToTileUnits, 1 / pixelsToTileUnits, 1]);
      if (!rotateWithMap) {
        glMatrix.mat4.rotateZ(m, m, transform.angle);
      }
    } else {
      glMatrix.mat4.multiply(m, labelPlaneMatrix, posMatrix);
    }
    return m;
  }

  function getGlCoordMatrix(posMatrix, pitchWithMap, rotateWithMap, glCoordMatrix, pixelsToTileUnits) {
    if (pitchWithMap) {
      var m = __chunk_1.clone(posMatrix);
      __chunk_1.scale(m, m, [pixelsToTileUnits, pixelsToTileUnits, 1]);
      if (!rotateWithMap) {
        __chunk_1.rotateZ(m, m, -transform.angle);
      }
      return m;
    } else {
      return glCoordMatrix;
    }
  }


  var drawCanvas = function (painter, graphic) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var stencilMode = mode.StencilMode.disabled;
    var colorMode = mode.ColorMode.alphaBlended;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('images', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 2, offset: 0},
        {name: "a_data", type: "Int16", components: 4, offset: 8}
      ]
    });

    var uniform = graphic.symbol.uniforms;
    var position = graphic.position;
    var symbol = graphic.symbol;
    var texsize = [symbol.width, symbol.height];
    var m = painter.transform.getMatrixForPoint(position[0], position[1], null, null, position[2]);
    uniform.u_camera_to_center_distance = painter.transform.cameraToCenterDistance;
    uniform.u_matrix = m;
    uniform.u_label_plane_matrix = getLabelPlaneMatrix(m, false, false, painter.transform.labelPlaneMatrix, 1);
    uniform.u_coord_matrix = getGlCoordMatrix(m, false, false, painter.transform.glCoordMatrix, 1);
    uniform.u_texsize = texsize;
    context.activeTexture.set(gl.TEXTURE0);
    var texture = symbol.texture;
    var image = symbol.image;
    var data;
    if (!texture) {
      data = symbol.render();
      image.replace(new Uint8Array(data.buffer));
      texture = symbol.texture = new Texture(context, image, gl.RGBA, {useMipmap: true});
    } else {
      data = symbol.render();
      image.replace(new Uint8Array(data.buffer));
      symbol.texture.update(image, {useMipmap: true});
    }
    texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);

    program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
      uniform, graphic.id,
      bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
      null, painter.transform.level);
  };

  /**
   * line的数据处理
   * @param graphic
   * @param view
   */
  var addLine = function (graphic, view) {
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
        l.push(new Point(Math.round(p.x - cx), Math.round(p.y - cy), 0));
      }
      g.push(l);
    }

    var symbol = graphic.symbol;
    var bucket = new LineBucket();
    bucket.addFeature(g, symbol.join, symbol.cap, 2, 1.05);
    bucket.upload(view.context);
    graphic.bucket = bucket;
    graphic.position = [cx, cy];
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

  var addPoint = function (graphic, view, layer) {
    var bucket = new CircleBucket();
    var center = view.viewpoint.center,
      cx = center[0],
      cy = center[1];
    var g = graphic.feature.geometry;
    if (g.type === "multipoint") { // 多点
      var points = g.points;
      points = points.map(function (item) {
        return new Point(Math.round(item.x - cx), Math.round(item.y - cy))
      });
      bucket.addFeature([points]);
    } else{
      bucket.addFeature([[new Point(Math.round(g.x - cx), Math.round(g.y - cy))]]);
    }
    bucket.upload(view.context);
    graphic.bucket = bucket;
    graphic.position = [cx, cy];
    if (layer.queryPadding < graphic.symbol.uniforms.radius) {
      layer.queryPadding = graphic.symbol.uniforms.radius;
    }
  };

  var addFan = function (graphic, view, layer) {
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

  var addCircle = function (graphic, view, layer) {
    var bucket = new CircleBucket();
    var center = view.viewpoint.center,
      cx = center[0],
      cy = center[1];
    var p = graphic.feature.geometry.center;
    bucket.addFeature([[new Point(Math.round(p.x - cx), Math.round(p.y - cy))]]);
    bucket.upload(view.context);
    graphic.bucket = bucket;
    graphic.position = [cx, cy];
    var radius = graphic.feature.geometry.radius / view.resolution;
    if (layer.queryPadding < radius) {
      layer.queryPadding = radius;
    }
  };

  // -------------------------------------------Image的相关方法----------------------------------------------
  var addImage = function (graphic, view, layer) {
    var bucket = new ImageBucket();
    var center = view.viewpoint.center,
      cx = center[0],
      cy = center[1];
    var p = graphic.feature.geometry;
    var symbol = graphic.symbol;
    if (p.type === "point") {
      bucket.addFeature([[new Point(Math.round(p.x - cx), Math.round(p.y - cy))]], symbol.width, symbol.height, symbol.offset);
      bucket.upload(view.context);
      graphic.bucket = bucket;
      graphic.position = [cx, cy, p.z || 0];
    } else if (p.type === "multipoint") {
      var ps = p.points.map(function (item) {
        return new Point(Math.round(item.x - cx), Math.round(item.y - cy));
      });
      bucket.addFeature([ps], symbol.width, symbol.height, symbol.offset);
      bucket.upload(view.context);
      graphic.bucket = bucket;
      graphic.position = [cx, cy, p.z || 0];
    }
  };

  var drawImage = function (painter, graphic) {
    var uniform = graphic.symbol.uniforms;
    var position = graphic.position;
    var symbol = graphic.symbol;
    if (!symbol.loaded) {
      symbol.used = true;
      return;
    }
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var stencilMode = mode.StencilMode.disabled;
    var colorMode = mode.ColorMode.alphaBlended;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('images', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 2, offset: 0},
        {name: "a_data", type: "Int16", components: 4, offset: 8}
      ]
    });


    var texsize = [symbol.width, symbol.height];
    var m = painter.transform.getMatrixForPoint(position[0], position[1], null, null, position[2]);

    uniform.u_camera_to_center_distance = painter.transform.cameraToCenterDistance;
    uniform.u_matrix = m;
    uniform.u_label_plane_matrix = getLabelPlaneMatrix(m, false, false, painter.transform.labelPlaneMatrix, 1);
    uniform.u_coord_matrix = getGlCoordMatrix(m, false, false, painter.transform.glCoordMatrix, 1);
    uniform.u_texsize = texsize;

    context.activeTexture.set(gl.TEXTURE0);
    var texture = symbol.texture;
    if (!texture) {
      texture = symbol.texture = new Texture(context, symbol.image, gl.RGBA, {useMipmap: true});
    }
    texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
    if (graphic.radian) {
      uniform.u_radian = graphic.radian;
    }

    program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
      uniform, graphic.id,
      bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
      null, painter.transform.level);
  };

  //------------------------------------------------------------------sprite相关方法
  var addSprite = function (graphic, view, layer) {
    /*var p = graphic.feature.geometry;
    graphic.position = [p.x, p.y, 0];*/
  };

  var drawSprite = function (painter, graphic) {
    /*var uniform = graphic.symbol.uniforms;
    var position = graphic.position;
    var symbol = graphic.symbol;
    if (!symbol.loaded) {
      symbol.used = true;
      return;
    }
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var stencilMode = mode.StencilMode.disabled;
    var colorMode = mode.ColorMode.alphaBlended;


    var program = painter.view.useProgramSimplify('sprite', {
      layoutAttributes: [
        {name: "position", type: "Int16", components: 2, offset: 0},
        {name: "uv", type: "Int16", components: 2, offset: 4}
      ]
    });
    var distance = painter.transform.cameraToCenterDistance;
    // var m = painter.transform.getMatrixForPoint(position[0], position[1], null, null, position[2]);

    // uniform.modelViewMatrix
    // uniform.projectionMatrix
    uniform.scale = [symbol.width/distance, symbol.height/distance];

    context.activeTexture.set(gl.TEXTURE0);
    var texture = symbol.texture;
    if (!texture) {
      texture = symbol.texture = new Texture(context, symbol.image, gl.RGBA, {useMipmap: true});
    }
    texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);*/

    /*program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
      uniform, graphic.id,
      bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
      null, painter.transform.level);*/
  };

  //---------------------------------------------------------------------------------Arc部分
  var addArc = function (graphic, view, layer) {
    var NUM_SEGMENTS = 50;
    var rasterBoundsArray = new ArrayType.StructArrayLayout3f12();
    for (var i = 0; i < NUM_SEGMENTS; i++) {
      rasterBoundsArray.emplaceBack(i, -1, 0);
      rasterBoundsArray.emplaceBack(i, 1, 0);
    }
    var vertexBuffer = view.context.createVertexBuffer(rasterBoundsArray, [
      {name: "a_pos", type: "Float32", components: 3, offset: 0}
    ]);
    var segment = SegmentVector.simpleSegment(0, 0, 100, 2);

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

    var instanceBuffer = view.context.createVertexBuffer(positionArray,[
      {name: "source", type: "Float32", components: 3, offset: 0},
      {name: "target", type: "Float32", components: 3, offset: 12}
    ]);

    graphic.vertexBuffer = vertexBuffer;
    graphic.instanceBuffer = instanceBuffer;
    graphic.segment = segment;
    graphic.position = [cx, cy];
    graphic.count = count;
  };

  var drawArc = function (painter, graphic) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var colorMode = mode.ColorMode.alphaBlended;

    var symbol = graphic.symbol;
    var program = painter.view.useProgramSimplify('arc', {
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
    uniform["u_units_to_pixels"] =  [painter.transform.width, painter.transform.height];

    program.drawArraysInstancedANGLE(context, gl.TRIANGLE_STRIP, depthMode, null, colorMode, mode.CullFaceMode.disabled, uniform,
      graphic.id, graphic.vertexBuffer, null, graphic.segment, graphic.instanceBuffer, graphic.count);
  };

  /*var addImageFill = function() {

  };*/

  var drawImageFill = function(painter, graphic) {
    var symbol = graphic.symbol;
    if (!symbol.loaded) {
      symbol.used = true;
      return;
    }
    var colorMode = mode.ColorMode.alphaBlended;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);

    var context = painter.view.context;
    var gl = context.gl;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('imageFill', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 2, offset: 0}
      ]
    });

    var uniform = symbol.uniforms;
    var position = graphic.position;
    var level = Math.floor(painter.view.level);
    var r = painter.view.viewpoint.getResolution(level);
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
    uniform['u_scale'] = [1, 1/r, 2, 1]

    context.activeTexture.set(gl.TEXTURE0);
    var texture = symbol.texture;
    if (!texture) {
      texture = symbol.texture = new Texture(context, symbol.image, gl.RGBA, {useMipmap: true});
    }
    texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);

    program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled,
      uniform, graphic.id, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
      null, painter.transform.level);
  };


  // -------------------------------------------Text的相关方法----------------------------------------------
  /**
   * TextSymbol的数据处理
   * @param graphic
   * @param view
   */
  var addText = function (graphic, view) {
    var bucket = new TextBucket();
    var center = view.viewpoint.center,
        cx = center[0],
        cy = center[1];
    var p = graphic.feature.geometry;
    var symbol = graphic.symbol;
    var offset = symbol.offset;
    bucket.addFeature([[new Point(Math.round(p.x - cx), Math.round(p.y - cy))]], symbol.text, symbol.font, symbol.glyphMap, symbol.glyphAtlas.positions, offset);
    bucket.upload(view.context);
    graphic.bucket = bucket;
    graphic.position = [cx, cy];
  };

  var addZTText = function (graphic, view) {
    var bucket = new TextBucket();
    var center = view.viewpoint.center,
        cx = center[0],
        cy = center[1];
    var p = graphic.feature.geometry;
    var symbol = graphic.symbol;
    var offset = symbol.offset;
    graphic.ready = false;
    if (symbol.glyphReady) {
      bucket.addFeature([[new Point(Math.round(p.x - cx), Math.round(p.y - cy))]], symbol.text, symbol.font, symbol.glyphMap, symbol.glyphAtlas.positions, offset);
      bucket.upload(view.context);
      graphic.bucket = bucket;
      graphic.ready = true;
      graphic.position = [cx, cy];
      view.threeRender();
    } else {
      symbol.finishRequest = function () {
        bucket.addFeature([[new Point(Math.round(p.x - cx), Math.round(p.y - cy))]], symbol.text, symbol.font, symbol.glyphMap, symbol.glyphAtlas.positions, offset);
        bucket.upload(view.context);
        graphic.bucket = bucket;
        graphic.ready = true;
        graphic.position = [cx, cy];
        view.threeRender();
      };
    }
  };

  var drawText = function (painter, graphic) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var stencilMode = mode.StencilMode.disabled;
    var colorMode = mode.ColorMode.alphaBlended;
    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('text', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 2, offset: 0},
        {name: "a_data", type: "Int16", components: 4, offset: 8}
      ]
    });

    var uniform = graphic.symbol.uniforms;
    var position = graphic.position;
    var symbol = graphic.symbol,
        img = symbol.glyphAtlas.image;
    var texsize = [img.width, img.height];
    var m = painter.transform.getMatrixForPoint(position[0], position[1]);
    uniform.u_camera_to_center_distance = painter.transform.cameraToCenterDistance;
    uniform.u_matrix = m;
    uniform.u_label_plane_matrix = getLabelPlaneMatrix(m, false, false, painter.transform.labelPlaneMatrix, 1);
    uniform.u_coord_matrix = getGlCoordMatrix(m, false, false, painter.transform.glCoordMatrix, 1);
    uniform.u_texsize = texsize;

    context.activeTexture.set(gl.TEXTURE0);
    var texture = symbol.texture;
    if (!texture) {
      texture = symbol.texture = new Texture(context, img, gl.ALPHA);
    }
    texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);

    if (symbol.hasHalo) {
      uniform["u_is_halo"] = 1;
      program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
          uniform, graphic.id,
          bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
          null, painter.transform.level);
    }
    uniform["u_is_halo"] = 0;
    program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
        uniform, graphic.id,
        bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
        null, painter.transform.level);
    /**/
  };

  /**
   * 绘制Text
   * @param painter
   * @param graphic
   */
  var drawZTText = function (painter, graphic) {
    if (!graphic.ready) {
      return;
    }
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
    var stencilMode = mode.StencilMode.disabled;
    var colorMode = mode.ColorMode.alphaBlended;
    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('text', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 2, offset: 0},
        {name: "a_data", type: "Int16", components: 4, offset: 8}
      ]
    });

    var uniform = graphic.symbol.uniforms;
    var position = graphic.position;
    var symbol = graphic.symbol,
        img = symbol.glyphAtlas.image;
    var texsize = [img.width, img.height];
    var m = painter.transform.getMatrixForPoint(position[0], position[1]);
    uniform.u_camera_to_center_distance = painter.transform.cameraToCenterDistance;
    uniform.u_matrix = m;
    uniform.u_label_plane_matrix = getLabelPlaneMatrix(m, false, false, painter.transform.labelPlaneMatrix, 1);
    uniform.u_coord_matrix = getGlCoordMatrix(m, false, false, painter.transform.glCoordMatrix, 1);
    uniform.u_texsize = texsize;

    context.activeTexture.set(gl.TEXTURE0);
    var texture = symbol.texture;
    if (!texture) {
      texture = symbol.texture = new Texture(context, img, gl.ALPHA);
    }
    texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);

    if (symbol.hasHalo) {
      uniform["u_is_halo"] = 1;
      program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
          uniform, graphic.id,
          bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
          null, painter.transform.level);
    }
    uniform["u_is_halo"] = 0;
    program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
        uniform, graphic.id,
        bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
        null, painter.transform.level);
    /**/
  };

  var addRect = function (graphic, view) {
    var polygon = graphic.feature.geometry.path[0];
    var position = view.viewpoint.center;
    var symbol = graphic.symbol;
    var rasterBoundsArray;
    if (symbol.hasMap) { // 有图片
      rasterBoundsArray = new ArrayType.StructArrayLayout4f16()
      rasterBoundsArray.emplaceBack(polygon[0].x - position[0], polygon[0].y - position[1], 0, 0);
      rasterBoundsArray.emplaceBack(polygon[1].x - position[0], polygon[1].y - position[1], 1, 0);
      rasterBoundsArray.emplaceBack(polygon[2].x - position[0], polygon[2].y - position[1], 1, 1);
      rasterBoundsArray.emplaceBack(polygon[3].x - position[0], polygon[3].y - position[1], 0, 1);
      graphic.vertexBuffer = view.context.createVertexBuffer(rasterBoundsArray, [
        { name: "a_pos", type: "Float32", components: 4, offset: 0 }
      ]);
    } else { // 无图片
      rasterBoundsArray = new ArrayType.StructArrayLayout2f8()
      rasterBoundsArray.emplaceBack(polygon[0].x - position[0], polygon[0].y - position[1]);
      rasterBoundsArray.emplaceBack(polygon[1].x - position[0], polygon[1].y - position[1]);
      rasterBoundsArray.emplaceBack(polygon[2].x - position[0], polygon[2].y - position[1]);
      rasterBoundsArray.emplaceBack(polygon[3].x - position[0], polygon[3].y - position[1]);
      graphic.vertexBuffer = view.context.createVertexBuffer(rasterBoundsArray, [
        { name: "a_pos", type: "Float32", components: 2, offset: 0 }
      ]);
    }
    var quadTriangleIndices = new ArrayType.StructArrayLayout3ui6();
    quadTriangleIndices.emplaceBack(0, 1, 2);
    quadTriangleIndices.emplaceBack(2, 3, 0);
    graphic.indexBuffer = view.context.createIndexBuffer(quadTriangleIndices);
    graphic.segments = SegmentVector.simpleSegment(0, 0, 4, 2);
    graphic.position = [position[0], position[1]];
  };

  var drawRect = function(painter, graphic, glow) {
    var colorMode = mode.ColorMode.alphaBlended;
    var depthMode = painter.depthModeForSublayer(1, mode.DepthMode.ReadOnly);
    var context = painter.view.context;
    var gl = context.gl;
    var symbol = graphic.symbol;
    var program;
    if (symbol.hasMap) {
      if (!symbol.loaded) {
        symbol.use = true;
        return;
      }
      program = painter.view.useProgramSimplify('basicFillImage', {
        layoutAttributes: [
          {name: "a_pos", type: "Float32", components: 4, offset: 0}
        ]
      });
      context.activeTexture.set(gl.TEXTURE0);
      var texture = symbol.texture;
      if (!texture) {
        texture = symbol.texture = new Texture(context, symbol.image, gl.RGBA, {useMipmap: true});
      }
      texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
    } else {
      program = painter.view.useProgramSimplify('basicFill', {
        layoutAttributes: [
          {name: "a_pos", type: "Float32", components: 2, offset: 0}
        ]
      });
    }
    var uniform = symbol.uniforms;
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
    program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled,
        uniform, graphic.id, graphic.vertexBuffer, graphic.indexBuffer, graphic.segments,
        null, painter.transform.level);
  };

  var drawMultiPoint = function (painter, graphic) {
    var context = painter.view.context;
    var gl = context.gl;
    var depthMode = new mode.DepthMode(gl.LEQUAL, mode.DepthMode.ReadOnly, [0, 0]);
    var colorMode = mode.ColorMode.alphaBlended;

    var bucket = graphic.bucket;
    var program = painter.view.useProgramSimplify('multiPoints', {
      layoutAttributes: [
        {name: "a_pos", type: "Float32", components: 2, offset: 0}
      ]
    });

    var uniform = {};
    var position = graphic.position;
    uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);

    program.draw2(context, gl.POINTS, depthMode, null, colorMode, mode.CullFaceMode.disabled, uniform,
        graphic.id, bucket.layoutVertexBuffer, bucket.length);
  };


  exports.draw = {
    arc: drawArc,
    circle: drawCircles,
    polygon: drawFill,
    line: drawLine,
    point: drawPoint,
    multiPoints: drawMultiPoint,
    image: drawImage,
    text: drawText,
    zttext: drawZTText,
    canvas: drawCanvas,
    fan: drawFan,
    rect: drawRect,
    imageFill: drawImageFill/*,
    sprite: drawSprite*/
  };

  exports.add = {
    arc: addArc,
    line: addLine,
    polygon: addPolygon,
    point: addPoint,
    circle: addCircle,
    image: addImage,
    text: addText,
    zttext: addZTText,
    canvas: addImage,
    fan: addFan,
    rect: addRect,
    imageFill: addPolygon/*,
    sprite: addSprite*/
  }
});