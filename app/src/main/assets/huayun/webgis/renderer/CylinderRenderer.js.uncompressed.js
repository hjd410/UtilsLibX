define("com/huayun/webgis/renderer/CylinderRenderer", [
    "../data/ArrayType",
    "../gl/SegmentVector",
    "../gl/mode",
    "../gl/programCache",
    "../gl/Texture"
], function (ArrayType, SegmentVector, mode, programCache, Texture) {

    function uniformValues(view, graphic, uniform) {
        var position = graphic.position;
        if (view.ground && !position.posMidified) {
            var level = Math.min(view.viewpoint.targetZoom || view.viewpoint.level, view.ground.maxLevel);
            var resolution = view.viewpoint.tileInfo.getResolution(level);
            var col = view.viewpoint.tileInfo.getColForX(position.x, resolution),
                row = view.viewpoint.tileInfo.getRowForY(position.y, resolution),
                deltaCol = col - Math.floor(col),
                deltaRow = row - Math.floor(row);
            var targetTile = view.ground.sourceCache.getTileByID(level + "/" + Math.floor(col) + "/" + Math.floor(row));
            if (targetTile && targetTile.fbo) {
                position.posMidified = true;
                var gl = view.context.gl;
                view.context.bindFramebuffer.set(targetTile.fbo.framebuffer);
                var pixels = new Float32Array(4);
                var c = Math.round(deltaCol * 256);
                var d = Math.round(deltaRow * 256);
                gl.readPixels(c === 0 ? c : c - 1, d === 0 ? d : d - 1, 1, 1, gl.RGBA, gl.FLOAT, pixels);
                var min = targetTile.minimumHeight,
                    delta = targetTile.maximumHeight - targetTile.minimumHeight
                position.z = pixels[0] * delta + min;
            } else {
                position.z = 0;
                position.posMidified = false;
            }
        }
        uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position.x, position.y, false, false, position.z);
    }

    function CylinderRenderer() {

    }

    /**
     *
     * @param view
     * @param graphic
     * @param geometry
     * @param {CylinderSymbol} symbol
     */
    CylinderRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        debugger;
        var position = geometry.position;
        var /*topLength = geometry.length / 2,
            bottomLength = -topLength,*/
            topLength = geometry.length,
            bottomLength = 0,
            slices = geometry.slices,
            radianStep = Math.PI * 2 / slices,
            bottomRadius = geometry.bottomRadius,
            topRadius = geometry.topRadius;
        var context = view.context;

        var vertices,
            indices,
            i, radian, cos, sin, j;

        if ((symbol.topVisible && symbol.topPattern) ||
            (symbol.bottomVisible && symbol.bottomPattern)) {

            if (symbol.bottomVisible && symbol.bottomPattern) {
                vertices = new ArrayType.StructArrayLayout5fb20();
                indices = new ArrayType.StructArrayLayout3ui6();

                vertices.emplaceBack(0, 0, bottomLength, 0.5, 0.5);
                for (i = 0; i < slices; i++) {
                    radian = i * radianStep;
                    cos = Math.cos(radian);
                    sin = Math.sin(radian);
                    vertices.emplaceBack(bottomRadius * cos, bottomRadius * sin, bottomLength,
                        0.5 + 0.5 * cos, 0.5 + 0.5 * sin);
                }
                for (i = 1; i <= slices; i++) {
                    if (i === slices) {
                        indices.emplaceBack(0, i, 1);
                    } else {
                        indices.emplaceBack(0, i, i + 1);
                    }
                }
                graphic.buckets.push({
                    layoutVertexBuffer: context.createVertexBuffer(vertices, [
                        {name: "a_pos", type: "Float32", components: 3, offset: 0},
                        {name: "a_uv", type: "Float32", components: 2, offset: 12}
                    ]),
                    indexBuffer: context.createIndexBuffer(indices),
                    segments: SegmentVector.simpleSegment(0, 0, slices + 1, slices)
                });
            }

            if (symbol.sidePattern) {
                vertices = new ArrayType.StructArrayLayout5fb20();
                indices = new ArrayType.StructArrayLayout3ui6();

                for (i = 0; i < slices; i++) {
                    radian = i * radianStep;
                    cos = Math.cos(radian);
                    sin = Math.sin(radian);
                    vertices.emplaceBack(bottomRadius * cos, bottomRadius * sin, bottomLength,
                        i / slices, 0);
                    vertices.emplaceBack(topRadius * cos, topRadius * sin, topLength,
                        i / slices, 1);
                }
                for (i = 0; i < slices; i++) {
                    j = i * 2;
                    if (i === slices - 1) {
                        indices.emplaceBack(j, 0, j + 1);
                        indices.emplaceBack(0, 1, j + 1);
                    } else {
                        indices.emplaceBack(j, j + 2, j + 1);
                        indices.emplaceBack(j + 2, j + 3, j + 1);
                    }
                }
                graphic.buckets.push({
                    layoutVertexBuffer: context.createVertexBuffer(vertices, [
                        {name: "a_pos", type: "Float32", components: 3, offset: 0},
                        {name: "a_uv", type: "Float32", components: 2, offset: 12}
                    ]),
                    indexBuffer: context.createIndexBuffer(indices),
                    segments: SegmentVector.simpleSegment(0, 0, slices * 2, slices * 2)
                });
            }

            if (symbol.topVisible && symbol.topPattern) {

            }
        } else {
            vertices = new ArrayType.StructArrayLayout3f12();
            indices = new ArrayType.StructArrayLayout3ui6();
            for (i = 0; i < slices; i++) {
                radian = radian = i * radianStep;
                cos = Math.cos(radian);
                sin = Math.sin(radian);
                vertices.emplaceBack(bottomRadius * cos, bottomRadius * sin, bottomLength);
                vertices.emplaceBack(topRadius * cos, topRadius * sin, topLength);
            }

            // 底面
            for (i = 1; i < slices - 1; i++) {
                indices.emplaceBack(0, 2 * i, 2 * (i + 1));
            }

            // 侧面
            for (i = 0; i < slices; i++) {
                if (i === slices - 1) {
                    indices.emplaceBack(i * 2, 0, 1);
                    indices.emplaceBack(i * 2, 1, i * 2 + 1);
                } else {
                    indices.emplaceBack(i * 2, (i + 1) * 2, (i + 1) * 2 + 1);
                    indices.emplaceBack(i * 2, (i + 1) * 2 + 1, i * 2 + 1);
                }
            }

            // 顶面
            for (i = 1; i < slices - 1; i++) {
                indices.emplaceBack(1, 2 * i + 1, 2 * (i + 1) + 1);
            }

            graphic.buckets.push({
                layoutVertexBuffer: context.createVertexBuffer(vertices, [
                    {name: "a_pos", type: "Float32", components: 3, offset: 0}
                ]),
                indexBuffer: context.createIndexBuffer(indices),
                segments: SegmentVector.simpleSegment(0, 0, slices * 2, slices * 2 + (slices - 2) * 2)
            });
        }
        graphic.position = position;
    };

    CylinderRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index) {
        debugger;
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
        if ((symbol.topVisible && symbol.topPattern) ||
            (symbol.bottomVisible && symbol.bottomPattern)) {
            var program = programCache.useProgramSimplify(context, 'cylinder', {
                layoutAttributes: [
                    {name: "a_pos", type: "Float32", components: 3, offset: 0},
                    {name: "a_uv", type: "Float32", components: 2, offset: 12}
                ],
                defines: ["#define HAS_PATTERN"]
            });

            var uniform = symbol.uniforms;
            var position = graphic.position;
            // uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0], position[1], false, false, position[2]);
            uniformValues(view, graphic, uniform);
            var buckets = graphic.buckets;
            var texture, bucket;
            context.activeTexture.set(gl.TEXTURE0);
            if (symbol.bottomVisible && symbol.bottomPattern) {
                texture = symbol.bottomTexture;
                bucket = buckets[0];
                if (!texture) {
                    texture = symbol.bottomTexture = new Texture(context, symbol.bottomPattern, gl.RGBA, {useMipmap: true});
                }
                texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
                program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                    uniform, graphic.id + "-cylinder-bottom",
                    bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
            }

            texture = symbol.sideTexture;
            bucket = buckets[1];
            if (!texture) {
                texture = symbol.sideTexture = new Texture(context, symbol.sidePattern, gl.RGBA, {useMipmap: true});
            }
            texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                uniform, graphic.id + "-cylinder-side",
                bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
        } else {
            var program = programCache.useProgramSimplify(context, 'cylinder', {
                layoutAttributes: [
                    {name: "a_pos", type: "Float32", components: 3, offset: 0},
                    {name: "a_uv", type: "Float32", components: 2, offset: 12}
                ]
            });

            var uniform = symbol.uniforms;
            // var position = graphic.position;
            // uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0], position[1], false, false, position[2]);
            uniformValues(view, graphic, uniform);
            var buckets = graphic.buckets;
            var bucket = buckets[0];
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                uniform, graphic.id + "-cylinder",
                bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
        }
    }

    CylinderRenderer.prototype.calculateExtent = function () {

    }

    return CylinderRenderer;
})