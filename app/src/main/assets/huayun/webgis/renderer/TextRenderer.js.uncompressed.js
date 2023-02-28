define("com/huayun/webgis/renderer/TextRenderer", [
    "custom/gl-matrix-min",
    "./Renderer",
    "../gl/mode",
    "../gl/Texture",
    "../data/bucket/TextBucketSimplify",
    "../geometry/Point",
    "../gl/programCache",
    "../utils/MathUtils"
], function (glMatrix, Renderer, mode, Texture, TextBucket, Point, programCache, MathUtils) {
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

    function TextRenderer() {

    }

    if (Renderer) TextRenderer.__proto__ = Renderer;
    TextRenderer.prototype = Object.create(Renderer && Renderer.prototype);
    TextRenderer.prototype.constructor = TextRenderer;

    TextRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        if (typeof symbol.text === 'undefined') return;
        if (view.ground) {
            if (graphic.base && !graphic.base.posMidified) {
                graphic.needAdd = true;
                return;
            }
        }
        graphic.needAdd = false;

        var p;
        switch (geometry.type) {
            case "point":
                p = geometry;
                break;
            case "multipoint":
                p = this.getMultiPointOfCenter(geometry.points);
                break;
            case "line":
                p = this.getLineCenterPoint(geometry.path);
                break;
            case "polygon":
                p = MathUtils.calculateCoreOfPolygon(geometry.path[0]);
                break;
            case "multipolygon":
                p = geometry.getMaxAreaPolygon();
                p = MathUtils.calculateCoreOfPolygon(p.path[0]);
        }

        if (view.ground && graphic.base && graphic.base.posMidified) {
            if (graphic.baseZ) {
                p.z = graphic.baseZ + graphic.base.z;
            } else {
                p.z += graphic.base.z;
            }
            graphic.base = null;
        }
        // console.log(p);
        var bucket = new TextBucket();
        var center = graphic.position || view.viewpoint.center || [0, 0],
            cx = center[0],
            cy = center[1];
        bucket.addFeature([[new Point(p.x - cx, p.y - cy)]], symbol.text, symbol.font, symbol.glyphMap, symbol.glyphAtlas.positions, symbol.offset);
        bucket.upload(view.context);
        graphic.buckets.push(bucket);
        graphic.position = [cx, cy, p.z];
        graphic.initPosition = [cx, cy, p.z];
    };

    TextRenderer.prototype.getMultiPointOfCenter = function (points) {
        return points[1];
    };

    TextRenderer.prototype.getLineCenterPoint = function (path) {
        return MathUtils.calculateCenterOfLine(path[0]).center;
    }

    TextRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index) {
        if (typeof symbol.text === 'undefined') return;
        if (graphic.needAdd || graphic.buckets.length === 0) {
            this.add(view, graphic, geometry, symbol);
            if (graphic.needAdd) return;
        }
        if (index === undefined) index = 0;
        var context = view.context;
        var gl = context.gl;
        var depthMode;
        if (layerView) {
            depthMode = layerView.depthModeForSublayer(0, mode.DepthMode.ReadWrite);
        } else {
            depthMode = new mode.DepthMode(gl.LEQUAL, mode.DepthMode.ReadWrite, [0.9, 0.9]);
        }
        var stencilMode = mode.StencilMode.disabled;
        var colorMode = mode.ColorMode.alphaBlended;
        var program = programCache.useProgramSimplify(context, 'text', {
            layoutAttributes: [
                {name: "a_pos", type: "Float32", components: 2, offset: 0},
                {name: "a_data", type: "Int16", components: 4, offset: 8}
            ]
        });
        var uniform = graphic.symbol.uniforms;
        var position = graphic.position;
        var img = symbol.glyphAtlas.image;
        var buckets = graphic.buckets;
        var bucket = buckets[index];
        var texsize = [img.width, img.height];
        var m = view.viewpoint.getMatrixForPoint(position[0], position[1], false, false, position[2]);
        uniform.u_camera_to_center_distance = view.viewpoint.cameraToCenterDistance;
        uniform.u_matrix = m;
        uniform.u_label_plane_matrix = getLabelPlaneMatrix(m, false, false, view.viewpoint.labelPlaneMatrix, 1);
        uniform.u_coord_matrix = getGlCoordMatrix(m, false, false, view.viewpoint.glCoordMatrix, 1);
        uniform.u_texsize = texsize;
        // this.getRealScale(symbol.fixed, layerView.view.scale, symbol.minScale);
        if (symbol.markerSize) {    // 线符号，引用符号的外接矩形大小
            var markerScale = this.getRealScale(symbol.fixed, view.scale, symbol.minScale) * graphic.markerScaleFactor;
            // var tempSize = this.calculateSize(symbol.markerSize * markerScale, symbol.width, symbol.height);
            // debugger;
            uniform.u_size = this.calculateSize(symbol.markerSize * markerScale, symbol.width, symbol.height);
        } else if (graphic.symbol.size) {   //点符号，定义符号外接矩形大小
            graphic.scaleFactor = graphic.scaleFactor || 1;
            var sizeScale = this.getRealScale(symbol.fixed, view.scale, symbol.minScale) * graphic.scaleFactor;
            uniform.u_size = this.calculateSize(graphic.symbol.size * sizeScale, symbol.width, symbol.height);
        } else {
            uniform.u_size = symbol.fontSize * this.getRealScale(symbol.fixed, view.scale, symbol.minScale);
        }
        context.activeTexture.set(gl.TEXTURE0);
        var texture = symbol.texture;
        if (!texture) {
            texture = symbol.texture = new Texture(context, img, gl.ALPHA);
        }
        texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);

        if (symbol.hasHalo) {
            uniform["u_is_halo"] = 1;
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                uniform, graphic.id + "-text-halo" + index,
                bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
                null, view.viewpoint.level);
        }
        uniform["u_is_halo"] = 0;
        program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
            uniform, graphic.id + "-text" + index,
            bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
    };

    TextRenderer.prototype.calculateSize = function (size, width, height) {
        var temp = Math.min(size / width, size / height);
        return temp * 96;
    };

    return TextRenderer;
});
