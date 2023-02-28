define("com/huayun/webgis/gl/draw/drawFillExtrusion", [
    "../mode"
], function (mode) {
    function create$1() {
        var out = new Float32Array(9);
        out[0] = 1;
        out[4] = 1;
        out[8] = 1;
        return out;
    }

    function fromRotation(out, rad) {
        var s = Math.sin(rad),
            c = Math.cos(rad);
        out[0] = c;
        out[1] = s;
        out[2] = 0;
        out[3] = -s;
        out[4] = c;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    }

    function transformMat3(out, a, m) {
        var x = a[0],
            y = a[1],
            z = a[2];
        out[0] = x * m[0] + y * m[3] + z * m[6];
        out[1] = x * m[1] + y * m[4] + z * m[7];
        out[2] = x * m[2] + y * m[5] + z * m[8];
        return out;
    }

    var fillExtrusionUniformValues = function (matrix, painter, shouldUseVerticalGradient, opacity, hasTerrain, groundTile) {
        var lightPos = [
            // 0.2875, -0.4979646071760521, 0.9959292143521045
            // 0.9959292143521045, -0.9959292143521045, 0.9959292143521045
            0.12347, -0.56158, 0.9959292143521045
        ];
        var lightMat = create$1();
        fromRotation(lightMat, -0);
        transformMat3(lightPos, lightPos, lightMat);

        var lightColor = {
            r: 1,
            g: 1,
            b: 1,
            a: 1
        };

        if (hasTerrain) {
            return {
                'u_matrix': matrix,
                'u_lightpos': lightPos,
                'u_lightintensity': 0.3,
                'u_lightcolor': [lightColor.r, lightColor.g, lightColor.b],
                'u_vertical_gradient': +shouldUseVerticalGradient,
                'u_opacity': opacity,
                'u_height_image': 0,
                'u_min_height': groundTile.minimumHeight,
                'u_delta_height': groundTile.maximumHeight - groundTile.minimumHeight
            };
        } else {
            return {
                'u_matrix': matrix,
                'u_lightpos': lightPos,
                'u_lightintensity': 0.3,
                'u_lightcolor': [lightColor.r, lightColor.g, lightColor.b],
                'u_vertical_gradient': +shouldUseVerticalGradient,
                'u_opacity': opacity
            };
        }
    };

    function colorModeForRenderPass(renderPass) {
        if (renderPass === 'opaque') {
            return mode.ColorMode.unblended;
        } else {
            return mode.ColorMode.alphaBlended;
        }
    }

    /**
     *
     * @param painter
     * @param source
     * @param layer
     * @param coords
     * @param depthMode
     * @param stencilMode
     * @param colorMode
     */
    function drawExtrusionTiles(painter, source, layer, coords, depthMode, stencilMode, colorMode) {
        var context = painter.view.context;
        var gl = context.gl;
        var opacity = layer.paint.get('fill-extrusion-opacity');
        var terrain = layer.paint.get('fill-extrusion-terrain');
        var groundSource;
        if (terrain) {
            groundSource = painter.view.ground.sourceCache;
        }

        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            var tile = source.getTile(coord);
            var bucket = tile.getBucket(layer);
            if (!bucket) {
                continue;
            }
            var programConfiguration = bucket.programConfigurations.get(layer.id);
            var program = painter.view.useProgram("fillExtrusion", programConfiguration, terrain ? ["#define HAS_TERRAIN"]:[]);

            if (terrain) {
                if (!tile.groundTile) {
                    tile.groundTile = groundSource.getTile(coord);
                }
                if (!tile.groundTile || !tile.groundTile.heightTexture) {
                    continue;
                }
                var textureFilter = gl.LINEAR;
                context.activeTexture.set(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, tile.groundTile.heightTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, textureFilter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, textureFilter);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }

            var matrix = coord.posMatrix;

            var shouldUseVerticalGradient = layer.paint.get('fill-extrusion-vertical-gradient');
            var uniformValues = fillExtrusionUniformValues(matrix, painter, shouldUseVerticalGradient, opacity, terrain, tile.groundTile);
            program.draw(context, context.gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.backCCW,
                uniformValues, layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer,
                bucket.segments, layer.paint, painter.transform.level,
                programConfiguration);
        }
    }

     function drawExtrusion(painter, source, layer, coords) {
        var opacity = layer.paint.get('fill-extrusion-opacity');
        if (opacity === 0) {
            return;
        }

        if (painter.renderPass === 'translucent') {
            // var depthMode = new mode.DepthMode(painter.view.context.gl.LEQUAL, mode.DepthMode.ReadWrite, painter.depthRangeFor3D);
            var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadWrite);

            if (opacity === 1 && !layer.paint.get('fill-extrusion-pattern').constantOr((1))) {
                var colorMode = colorModeForRenderPass();
                drawExtrusionTiles(painter, source, layer, coords, depthMode, mode.StencilMode.disabled, colorMode);
            } else {
                // Draw transparent buildings in two passes so that only the closest surface is drawn.
                // First draw all the extrusions into only the depth buffer. No colors are drawn.
                drawExtrusionTiles(painter, source, layer, coords, depthMode,
                    mode.StencilMode.disabled,
                    mode.ColorMode.disabled);

                // Then draw all the extrusions a second type, only coloring fragments if they have the
                // same depth value as the closest fragment in the previous pass. Use the stencil buffer
                // to prevent the second draw in cases where we have coincident polygons.
                drawExtrusionTiles(painter, source, layer, coords, depthMode,
                    painter.stencilModeFor3D(),
                    colorModeForRenderPass());
            }
        }
    }

    return drawExtrusion;
})