define("com/huayun/webgis/renderer/ImageRenderer", [
    "custom/gl-matrix-min",
    "./Renderer",
    "../data/bucket/ImageBucketSimplify",
    "../geometry/Point",
    "../gl/mode",
    "../gl/Texture",
    "../gl/programCache"
], function (glMatrix, Renderer, ImageBucket, Point, mode, Texture, programCache) {

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

    function ImageRenderer() {}

    if (Renderer) ImageRenderer.__proto__ = Renderer;
    ImageRenderer.prototype = Object.create(Renderer && Renderer.prototype);
    ImageRenderer.prototype.constructor = ImageRenderer;

    ImageRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        debugger;
        var bucket = new ImageBucket();
        var center = graphic.position || view.viewpoint.center || [0, 0],
            cx = center[0],
            cy = center[1];
        if (geometry.type === "multipoint") {
            var p = [];
            for (var i = 0; i < geometry.points.length; i++) {
                p.push(new Point(geometry.points[i].x - cx, geometry.points[i].y - cy, 0));
            }
            bucket.addFeature([p], symbol.width, symbol.height, symbol.offset);
        } else if (geometry.type === "point") {
            bucket.addFeature([[new Point(geometry.x - cx, geometry.y - cy, 0)]], symbol.width, symbol.height, symbol.offset); // 三角形化处理
        }
        bucket.upload(view.context); // 处理成Buffer, 供WebGL使用
        graphic.buckets.push(bucket);
        graphic.position = [cx, cy];
    };


    ImageRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index) {
        if (!symbol.loaded) {
            symbol.used = true;
            return;
        }
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
        var program = programCache.useProgramSimplify(context, 'images', {
            layoutAttributes: [
                {name: "a_pos", type: "Float32", components: 2, offset: 0},
                {name: "a_data", type: "Int16", components: 4, offset: 8}
            ]
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

        var texsize = [symbol.width, symbol.height];
        uniform.u_camera_to_center_distance = view.viewpoint.cameraToCenterDistance;
        uniform.u_label_plane_matrix = getLabelPlaneMatrix(uniform["u_matrix"], false, false, view.viewpoint.labelPlaneMatrix, 1);
        uniform.u_coord_matrix = getGlCoordMatrix(uniform["u_matrix"], false, false, view.viewpoint.glCoordMatrix, 1);
        uniform.u_texsize = texsize;

        context.activeTexture.set(gl.TEXTURE0);
        var texture = symbol.texture;
        if (!texture) {
            texture = symbol.texture = new Texture(context, symbol.image, gl.RGBA, {useMipmap: true});
        }
        texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
        graphic["_imageOffset" + index] = {
            dx: offsetx,
            dy: offsety,
            size: texsize
        };

        var buckets = graphic.buckets;
        var bucket = buckets[index];
        program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
            uniform, graphic.id + "-image" + index,
            bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
            null);
    };

    ImageRenderer.prototype.drawGlow = function (view, graphic, geometry, symbol, layerView, index, sizeRight) {
        this.draw(view, graphic, geometry, symbol, layerView, index, sizeRight)
    };

    ImageRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result, index) {
        if (!index) index = 0;
        if (!symbol.loaded) {
            return;
        }
        var resolution = view.resolution;
        var dxdy = graphic["_imageOffset" + index];
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
            minX: x - size[0] * resolution / 2,
            minY: y - size[1] * resolution / 2,
            maxX: x + size[0] * resolution / 2,
            maxY: y + size[1] * resolution / 2
        });
    };

    return ImageRenderer;
})