define("com/huayun/webgis/renderer/FontRenderer", ["require", "exports", "./Renderer", "../data/bucket/FontBucketSimplify", "../geometry/Point", "../gl/mode", "../gl/Texture", "" +
    "custom/gl-matrix", "../gl/programCache", "../utils/MathUtils"],
    function (require, exports, Renderer, TextBucket, Point, mode, Texture, gl_matrix_1, programCache, MathUtils) {
        "use strict";

        function getLabelPlaneMatrix(posMatrix, pitchWithMap, rotateWithMap, labelPlaneMatrix, pixelsToTileUnits) {
            var m = gl_matrix_1.mat4.create();
            if (pitchWithMap) {
                gl_matrix_1.mat4.scale(m, m, [1 / pixelsToTileUnits, 1 / pixelsToTileUnits, 1]);
                if (!rotateWithMap) {
                    gl_matrix_1.mat4.rotateZ(m, m, 0);
                }
            } else {
                gl_matrix_1.mat4.multiply(m, labelPlaneMatrix, posMatrix);
            }
            return m;
        }

        function getGlCoordMatrix(posMatrix, pitchWithMap, rotateWithMap, glCoordMatrix, pixelsToTileUnits) {
            if (pitchWithMap) {
                var m = gl_matrix_1.mat4.clone(posMatrix);
                gl_matrix_1.mat4.scale(m, m, [pixelsToTileUnits, pixelsToTileUnits, 1]);
                if (!rotateWithMap) {
                    gl_matrix_1.mat4.rotateZ(m, m, -0);
                }
                return m;
            } else {
                return glCoordMatrix;
            }
        }

        function FontRenderer() {
        }

        if (Renderer) FontRenderer.__proto__ = Renderer;
        FontRenderer.prototype = Object.create(Renderer && Renderer.prototype);
        FontRenderer.prototype.constructor = FontRenderer;

        FontRenderer.prototype.add = function (view, graphic, geometry, symbol, index) {
            if (!index) index = 0;
            var bucket = new TextBucket();
            var center = graphic.position || view.viewpoint.center || [0, 0],
                cx = center[0], cy = center[1];
            if (symbol.glyphReady) {
                bucket.addFeature([[new Point(geometry.x - cx, geometry.y - cy)]], symbol.text, symbol.fontFamily, symbol.glyphMap, symbol.glyphAtlas.positions, [0, 0]);
                bucket.upload(view.context);
                // graphic.buckets.push(bucket);
                graphic.buckets[index] = bucket;
                graphic.ready = true;
                graphic.position = [cx, cy];
            } else {
                graphic.buckets[index] = undefined;
                symbol.finishRequest.push(function () {
                    bucket.addFeature([[new Point(geometry.x - cx, geometry.y - cy)]], symbol.text, symbol.fontFamily, symbol.glyphMap, symbol.glyphAtlas.positions, [0, 0]);
                    bucket.upload(view.context);
                    // graphic.buckets.push(bucket);
                    graphic.buckets[index] = bucket;
                    graphic.ready = true;
                    graphic.position = [cx, cy];
                    view.threeRender();
                });
            }
        };
        FontRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index) {
            if (!symbol.glyphReady) {
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
            var bucket = graphic.buckets[index];
            var program = programCache.useProgramSimplify(context, 'ztText', {
                layoutAttributes: [
                    {name: "a_pos", type: "Float32", components: 2, offset: 0},
                    {name: "a_data", type: "Int16", components: 4, offset: 8}
                ]
            });
            var uniform = symbol.uniforms;
            var position = graphic.position;
            var img = symbol.glyphAtlas.image;
            var texsize = [img.width, img.height];
            var realScale = this.getRealScale(symbol.fixed, view.scale, symbol.minScale);
            var resolution = view.resolution;
            uniform.u_texsize = texsize;
            if (symbol.markerSize) {    // 线符号，引用符号的外接矩形大小
                realScale = realScale * (graphic.markerScaleFactor || 1);
                uniform.u_size = this.calculateSize(symbol.markerSize * realScale, symbol.width, symbol.height);
            } else if (graphic.symbol.size) {   //点符号，定义符号外接矩形大小
                graphic.scaleFactor = graphic.scaleFactor || 1;
                realScale = realScale * graphic.scaleFactor;
                uniform.u_size = this.calculateSize(graphic.symbol.size * realScale, symbol.width, symbol.height);
            } else {
                graphic.scaleFactor = graphic.scaleFactor || 1;
                realScale = realScale * graphic.scaleFactor;
                uniform.u_size = symbol.fontSize * realScale;
            }
            context.activeTexture.set(gl.TEXTURE0);
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

            graphic["_fontOffset" + index] = {
                dx: offsetx,
                dy: offsety,
                size: uniform.u_size
            };
            var m = uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0] + offsetx, position[1] + offsety);
            uniform.u_camera_to_center_distance = view.viewpoint.cameraToCenterDistance;
            uniform.u_matrix = m;
            uniform.u_label_plane_matrix = getLabelPlaneMatrix(m, false, false, view.viewpoint.labelPlaneMatrix, 1);
            uniform.u_coord_matrix = getGlCoordMatrix(m, false, false, view.viewpoint.glCoordMatrix, 1);
            uniform.u_fill_color = symbol.fillColor;
            var texture = symbol.texture;
            if (!texture) {
                texture = symbol.texture = new Texture(context, img, gl.ALPHA);
            }
            texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled, uniform,
                graphic.id + "-font" + index, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
        };

        FontRenderer.prototype.drawGlow = function (view, graphic, geometry, symbol, layerView, index) {
            if (!symbol.glyphReady) {
                return;
            }
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
            var bucket = graphic.buckets[index];
            var program = programCache.useProgramSimplify(context, 'ztText', {
                layoutAttributes: [
                    {name: "a_pos", type: "Float32", components: 2, offset: 0},
                    {name: "a_data", type: "Int16", components: 4, offset: 8}
                ]
            });
            var uniform = symbol.uniforms;
            var position = graphic.position;
            var img = symbol.glyphAtlas.image;
            var texsize = [img.width, img.height];
            var realScale = this.getRealScale(symbol.fixed, view.scale, symbol.minScale);
            var resolution = view.resolution;
            uniform.u_texsize = texsize;
            if (symbol.markerSize) {    // 线符号，引用符号的外接矩形大小
                realScale = realScale * graphic.markerScaleFactor;
                uniform.u_size = this.calculateSize(symbol.markerSize * realScale, symbol.width, symbol.height);
            } else if (graphic.symbol.size) {   //点符号，定义符号外接矩形大小
                graphic.scaleFactor = graphic.scaleFactor || 1;
                realScale = realScale * graphic.scaleFactor;
                uniform.u_size = this.calculateSize(graphic.symbol.size * realScale, symbol.width, symbol.height);
            } else {
                graphic.scaleFactor = graphic.scaleFactor || 1;
                realScale = realScale * graphic.scaleFactor;
                uniform.u_size = symbol.fontSize * realScale;
            }
            context.activeTexture.set(gl.TEXTURE0);
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
            var m = uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0] + offsetx, position[1] + offsety);
            uniform.u_camera_to_center_distance = view.viewpoint.cameraToCenterDistance;
            uniform.u_matrix = m;
            uniform.u_label_plane_matrix = getLabelPlaneMatrix(m, false, false, view.viewpoint.labelPlaneMatrix, 1);
            uniform.u_coord_matrix = getGlCoordMatrix(m, false, false, view.viewpoint.glCoordMatrix, 1);

            var glowColor = glow.color;
            uniform.u_fill_color = glowColor;
            uniform.u_halo_color = glowColor;

            var texture = symbol.texture;
            if (!texture) {
                texture = symbol.texture = new Texture(context, img, gl.ALPHA);
            }
            texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled, uniform,
                graphic.id + "-font" + index, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
        };

        FontRenderer.prototype.calculateSize = function (size, width, height) {
            var temp = Math.min(size / width, size / height);
            return temp * 96;
        };

        FontRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result, index) {
            if (!index) index = 0;
            var dxdy = graphic["_fontOffset" + index];
            if (!dxdy) return;
            var size = dxdy.size;
            var x = geometry.x,
                y = geometry.y;
            var resolution = view.resolution;
            var w = symbol.width,
                h = symbol.height;
            var hw = size / 96 * w / 2,
                hh = size / 96 * h / 2;

            var radian;
            if (graphic.rotation) {
                radian = symbol.angle + graphic.rotation;
            } else {
                radian = symbol.angle
            }
            x += dxdy.dx;
            y += dxdy.dy;

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
                maxY: y + extent.ymax * resolution
            });
        };
        return FontRenderer;
    });
