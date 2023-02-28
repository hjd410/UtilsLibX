define("com/huayun/webgis/renderer/CircleRenderer", [
    "./Renderer",
    "../gl/mode",
    "../data/bucket/CircleBucketSimplify",
    "../geometry/Point",
    "../gl/programCache"
], function (Renderer, mode, CircleBucket, Point, programCache) {
    function CircleRenderer() {
    }

    if (Renderer) CircleRenderer.__proto__ = Renderer;
    CircleRenderer.prototype = Object.create(Renderer && Renderer.prototype);
    CircleRenderer.prototype.constructor = CircleRenderer;

    CircleRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        var bucket = new CircleBucket();
        var center = graphic.position || view.viewpoint.center || [0, 0],
            cx = center[0],
            cy = center[1];
        if (geometry.type === "multipoint") {
            var p = [];
            for (var i = 0; i < geometry.points.length; i++) {
                p.push(new Point(geometry.points[i].x - cx, geometry.points[i].y - cy, 0));
            }
            bucket.addFeature([p]);
        } else if (geometry.type === "point") {
            bucket.addFeature([[new Point(geometry.x - cx, geometry.y - cy, 0)]]); // 三角形化处理
        }
        bucket.upload(view.context); // 处理成Buffer, 供WebGL使用
        graphic.buckets.push(bucket);
        graphic.position = [cx, cy];
    };


    CircleRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index, sizeRight) {
        if (index === undefined) index = 0;
        var context = view.context;
        var gl = context.gl;
        var depthMode;
        if (layerView) {
            depthMode = layerView.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
        } else {
            depthMode = new mode.DepthMode(gl.LEQUAL, mode.DepthMode.ReadOnly, [0.9, 0.9]);
        }
        var stencilMode = mode.StencilMode.disabled;
        var colorMode = mode.ColorMode.alphaBlended;
        var program = programCache.useProgramSimplify(context, 'circle', {
            layoutAttributes: [{name: "a_pos", type: "Float32", components: 2, offset: 0},
                {name: "a_data", type: "Int16", components: 2, offset: 8}]
        });

        var uniform = symbol.uniforms;
        var position = graphic.position;
        var realScale = this.getRealScale(symbol.fixed, view.scale, symbol.minScale);
        var tempW = undefined;
        var resolution = view.resolution;
        // debugger;
        if (symbol.markerSize) {    // 线符号，引用符号的外接矩形大小
            realScale = realScale * (graphic.markerScaleFactor || 1);
            tempW = symbol.markerSize / symbol.radius;
            realScale = realScale * tempW;
        } else if (graphic.symbol.size && graphic.symbol.tempW === undefined) {   //点符号，定义符号外接矩形大小
            graphic.scaleFactor = graphic.scaleFactor || 1;
            realScale = realScale * graphic.scaleFactor;
            tempW = graphic.symbol.size / symbol.radius;
            graphic.symbol.tempW = tempW;
            realScale = realScale * tempW;
        } else if (graphic.symbol.size && graphic.symbol.tempW !== undefined) {
            realScale = realScale * graphic.symbol.tempW;
        } else {
            graphic.scaleFactor = graphic.scaleFactor || 1;
            realScale = realScale * graphic.scaleFactor;
        }
        if (!sizeRight) {
            uniform["radius"] = symbol.radius * realScale;
        }
        if (graphic.rotation) {
            uniform.u_radian = symbol.angle + graphic.rotation;
        } else {
            uniform.u_radian = symbol.angle
        }

        var dx = symbol.dx * realScale * resolution,
            dy = symbol.dy * realScale * resolution;
        var sina = Math.sin(uniform.u_radian),
            cosa = Math.cos(uniform.u_radian);
        var offsetx = dx * cosa - dy * sina,
            offsety = dy * cosa + dx * sina;
        uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0] + offsetx, position[1] + offsety);

        var w = symbol.strokeWidth * realScale;
        uniform["stroke_width"] = w < 1 ? 1 : w;
        uniform["u_camera_to_center_distance"] = view.viewpoint.cameraToCenterDistance;
        uniform["u_extrude_scale"] = view.viewpoint.pixelsToGLUnits;
        graphic["_circleOffset" + index] = {
            dx: offsetx,
            dy: offsety,
            size: symbol.uniforms["radius"] + symbol.uniforms["stroke_width"]
        };
        uniform['color'] = symbol.color;
        uniform['stroke_color'] = symbol.strokeColor;
        var buckets = graphic.buckets;
        var bucket = buckets[index];
        program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
            uniform, graphic.id + "-circle" + index,
            bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
            null);
    };

    CircleRenderer.prototype.drawGlow = function (view, graphic, geometry, symbol, layerView, index, sizeRight) {
        var glow = graphic.glow;
        if (!glow) return;
        if (index === undefined) index = 0;
        var context = view.context;
        var gl = context.gl;
        var depthMode;
        if (layerView) {
            depthMode = layerView.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
        } else {
            depthMode = new mode.DepthMode(gl.LEQUAL, mode.DepthMode.ReadOnly, [0.9, 0.9]);
        }
        var stencilMode = mode.StencilMode.disabled;
        var colorMode = mode.ColorMode.alphaBlended;
        var program = programCache.useProgramSimplify(context, 'circle', {
            layoutAttributes: [{name: "a_pos", type: "Float32", components: 2, offset: 0},
                {name: "a_data", type: "Int16", components: 2, offset: 8}]
        });

        var uniform = symbol.uniforms;
        var position = graphic.position;
        var realScale = this.getRealScale(symbol.fixed, view.scale, symbol.minScale);
        var tempW = 1;
        var resolution = view.resolution;
        // debugger;
        if (symbol.markerSize) {    // 线符号，引用符号的外接矩形大小
            realScale = realScale * graphic.markerScaleFactor;
            tempW = symbol.markerSize / symbol.radius;
            realScale = realScale * tempW;
        } else if (graphic.symbol.size) {   //点符号，定义符号外接矩形大小
            graphic.scaleFactor = graphic.scaleFactor || 1;
            realScale = realScale * graphic.scaleFactor;
            tempW = graphic.symbol.size / symbol.radius;
            realScale = realScale * tempW;
        } else {
            graphic.scaleFactor = graphic.scaleFactor || 1;
            realScale = realScale * graphic.scaleFactor;
        }
        if (!sizeRight) {
            uniform["radius"] = symbol.radius * realScale;
        }
        if (graphic.rotation) {
            uniform.u_radian = symbol.angle + graphic.rotation;
        } else {
            uniform.u_radian = symbol.angle
        }

        var dx = symbol.dx * realScale * resolution,
            dy = symbol.dy * realScale * resolution;
        var sina = Math.sin(uniform.u_radian),
            cosa = Math.cos(uniform.u_radian);
        var offsetx = dx * cosa - dy * sina,
            offsety = dy * cosa + dx * sina;
        uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0] + offsetx, position[1] + offsety);

        var w = symbol.strokeWidth * realScale;
        uniform["stroke_width"] = w < 1 ? 1 : w;
        uniform["u_camera_to_center_distance"] = view.viewpoint.cameraToCenterDistance;
        uniform["u_extrude_scale"] = view.viewpoint.pixelsToGLUnits;
        var glowColor = glow.color;
        uniform['color'] = glowColor;
        uniform['stroke_color'] = glowColor;
        var buckets = graphic.buckets;
        var bucket = buckets[index];
        program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
            uniform, graphic.id + "-circle" + index,
            bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
            null);
    };

    CircleRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result, index) {
        if (!index) index = 0;
        var resolution = view.resolution;
        var dxdy = graphic["_circleOffset" + index];
        var size = dxdy.size;
        var x = geometry.x,
            y = geometry.y;
        // 偏移修正

        var dx = dxdy.dx,
            dy = dxdy.dy;
        x = x + dx;
        y = y + dy;

        result.push({
            id: graphic.id,
            g: graphic,
            minX: x - size * resolution,
            minY: y - size * resolution,
            maxX: x + size * resolution,
            maxY: y + size * resolution,
        });
    };

    return CircleRenderer;
})
