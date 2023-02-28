define("com/huayun/webgis/renderer/RectRenderer", [
    "./Renderer",
    "../gl/mode",
    "../data/bucket/RectBucket",
    "../geometry/Point",
    "../gl/programCache",
    "../utils/MathUtils"
], function (Renderer, mode, RectBucket, Point, programCache, MathUtils) {
    function RectRenderer() {

    }

    if (Renderer) RectRenderer.__proto__ = Renderer;
    RectRenderer.prototype = Object.create(Renderer && Renderer.prototype);
    RectRenderer.prototype.constructor = RectRenderer;

    RectRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        var bucket = new RectBucket();
        var center = graphic.position || view.viewpoint.center || [0, 0],
            cx = center[0],
            cy = center[1];
        bucket.addFeature([[new Point(geometry.x - cx, geometry.y - cy, 0)]], symbol);
        bucket.upload(view.context);
        graphic.buckets.push(bucket);
        graphic.position = [cx, cy];
        graphic.center = geometry;
    };

    RectRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index) {
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
        var program = programCache.useProgramSimplify(context, 'rect', {
            layoutAttributes: [
                {name: "a_pos", type: "Float32", components: 2, offset: 0},
                {name: "a_size", type: "Float32", components: 4, offset: 8}
            ]
        });
        var uniform = symbol.uniforms;
        var position = graphic.position;

        uniform["u_camera_to_center_distance"] = view.viewpoint.cameraToCenterDistance;
        uniform["u_extrude_scale"] = view.viewpoint.pixelsToGLUnits;

        var buckets = graphic.buckets;
        var bucket = buckets[index];
        var realScale = this.getRealScale(symbol.fixed, view.scale, symbol.minScale);
        var tempW = 1;
        var resolution = view.resolution;
        // debugger
        if (symbol.markerSize) {    // 线符号，引用符号的外接矩形大小
            realScale = realScale * (graphic.markerScaleFactor || 1);
            // todo 优化, 将此计算移到symbol
            tempW = Math.min(symbol.markerSize / symbol.widthWithStroke, symbol.markerSize / symbol.heightWithStroke);
            realScale = realScale * tempW;
        } else if (graphic.symbol.size) {   //点符号，定义符号外接矩形大小
            graphic.scaleFactor = graphic.scaleFactor || 1;
            realScale = realScale * graphic.scaleFactor;
            tempW = Math.min(graphic.symbol.size / symbol.widthWithStroke, graphic.symbol.size / symbol.heightWithStroke);
            realScale = realScale * tempW;
        }else {
            graphic.scaleFactor = graphic.scaleFactor || 1;
            realScale = realScale * graphic.scaleFactor;
        }
        uniform["u_size"] = realScale;
        if (graphic.rotation) {
            uniform.u_radian = symbol.angle + graphic.rotation;
        } else {
            uniform.u_radian = symbol.angle
        }
        var dx = symbol.dx * realScale * resolution,
            dy = symbol.dy * realScale * resolution;
        var sina = Math.sin(uniform.u_radian),
            cosa = Math.cos(uniform.u_radian);
        var offsetx = dx *  cosa - dy * sina,
            offsety = dy * cosa + dx * sina;
        /*var offsetx = dx,
            offsety = dy;*/
        uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0] + offsetx, position[1] + offsety);
        if (symbol.strokeWidth > 0 && symbol.stroke[3] !== 0) {
            uniform["u_color"] = symbol.stroke;
            uniform["u_is_stroke"] = 1;
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                uniform, graphic.id + "-rect" + index,
                bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
        }
        uniform["u_is_stroke"] = 0;
        uniform["u_color"] = symbol.color;
        graphic["_rectOffset" + index] = {
            dx: offsetx,
            dy: offsety,
            size: symbol.uniforms.u_size
        };
        program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
            uniform, graphic.id + "-rect" + index,
            bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
    };

    RectRenderer.prototype.drawGlow = function(view, graphic, geometry, symbol, layerView, index) {
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
        var program = programCache.useProgramSimplify(context, 'rect', {
            layoutAttributes: [
                {name: "a_pos", type: "Float32", components: 2, offset: 0},
                {name: "a_size", type: "Float32", components: 4, offset: 8}
            ]
        });
        var uniform = symbol.uniforms;
        var position = graphic.position;

        uniform["u_camera_to_center_distance"] = view.viewpoint.cameraToCenterDistance;
        uniform["u_extrude_scale"] = view.viewpoint.pixelsToGLUnits;

        var buckets = graphic.buckets;
        var bucket = buckets[index];
        var realScale = this.getRealScale(symbol.fixed, view.scale, symbol.minScale);
        var tempW = 1;
        var resolution = view.resolution;
        // debugger
        if (symbol.markerSize) {    // 线符号，引用符号的外接矩形大小
            realScale = realScale * graphic.markerScaleFactor;
            // todo 优化, 将此计算移到symbol
            tempW = Math.min(symbol.markerSize / symbol.widthWithStroke, symbol.markerSize / symbol.heightWithStroke);
            realScale = realScale * tempW;
        } else if (graphic.symbol.size) {   //点符号，定义符号外接矩形大小
            graphic.scaleFactor = graphic.scaleFactor || 1;
            realScale = realScale * graphic.scaleFactor;
            tempW = Math.min(graphic.symbol.size / symbol.widthWithStroke, graphic.symbol.size / symbol.heightWithStroke);
            realScale = realScale * tempW;
        }else {
            graphic.scaleFactor = graphic.scaleFactor || 1;
            realScale = realScale * graphic.scaleFactor;
        }
        uniform["u_size"] = realScale;
        if (graphic.rotation) {
            uniform.u_radian = symbol.angle + graphic.rotation;
        } else {
            uniform.u_radian = symbol.angle
        }
        var dx = symbol.dx * realScale * resolution,
            dy = symbol.dy * realScale * resolution;
        var sina = Math.sin(uniform.u_radian),
            cosa = Math.cos(uniform.u_radian);
        var offsetx = dx *  cosa - dy * sina,
            offsety = dy * cosa + dx * sina;
        /*var offsetx = dx,
            offsety = dy;*/
        var glowColor = glow.color;
        uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0] + offsetx, position[1] + offsety);
        if (symbol.strokeWidth > 0 && symbol.stroke[3] !== 0) {
            uniform["u_color"] = glowColor;
            uniform["u_is_stroke"] = 1;
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                uniform, graphic.id + "-rect" + index,
                bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
        }
        uniform["u_is_stroke"] = 0;
        uniform["u_color"] = glowColor;
        program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
            uniform, graphic.id + "-rect" + index,
            bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
    };

    RectRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result, index) {
        if (!index) index = 0;
        var dxdy = graphic["_rectOffset" + index];
        var size = dxdy.size;
        var x = geometry.x,
            y = geometry.y;
        var resolution = view.resolution;
        var w, h;
        if (symbol.strokeWidth > 0) {
            w = symbol.widthWithStroke;
            h = symbol.heightWithStroke;
        } else {
            w = symbol.width;
            h = symbol.height;
        }
        var hw = w / 2 * size,
            hh = h / 2 * size;
        var radian;
        if (graphic.rotation) {
            radian = symbol.angle + graphic.rotation;
        } else {
            radian = symbol.angle
        }

        x += dxdy.dx;
        y += dxdy.dy;

        // 旋转修正
        var points = [
            {
                x: hw,
                y: hh
            },
            {
                x: hw,
                y: -hh
            },
            {
                x: -hw,
                y: -hh
            },
            {
                x: -hw,
                y: hh
            }
        ];
        var extent = MathUtils.sizeAfterRotated(points, radian);

        result.push({
            id: graphic.id,
            g: graphic,
            minX: x + extent.xmin * resolution,
            minY: y + extent.ymin * resolution,
            maxX: x + extent.xmax * resolution,
            maxY: y + extent.ymax * resolution,
            type: "rect"
        });
    };

    return RectRenderer;
});
