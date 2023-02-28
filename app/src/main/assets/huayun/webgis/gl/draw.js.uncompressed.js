define("com/huayun/webgis/gl/draw", [
    "exports",
    "../utils/Color",
    "../utils/Constant",
    "../utils/utils",
    "./mode",
    "../geometry/Point2D",
    "../layers/support/funcUtils",
    "./Texture",
    "custom/gl-matrix-min"
], function (exports, Color, Constant, utils, mode, Point, funcUtils, Texture, glMatrix) {

    //------------------------------------------------------------------------------------------------------------------绘制background类型
    var backgroundUniformValues = function (matrix, opacity, color) {
        return ({
            'u_matrix': matrix,
            'u_opacity': opacity,
            'u_color': color
        });
    };

    exports.drawBackground = function (painter, sourceCache, layer, coords) {
        var color = layer.paint.get('background-color');
        var opacity = layer.paint.get('background-opacity');
        if (opacity === 0) {
            return;
        }
        var context = painter.view.context;
        var gl = context.gl;
        var transform = painter.transform;
        var tileSize = painter.tileSize;
        var image = layer.paint.get('background-pattern');
        var pass = (!image && color.a === 1 && opacity === 1) ? 'opaque' : 'translucent';
        if (painter.renderPass !== pass) {
            return;
        }

        var stencilMode = mode.StencilMode.disabled;
        var depthMode = painter.depthModeForSublayer(0, pass === 'opaque' ? mode.DepthMode.ReadWrite : mode.DepthMode.ReadOnly);
        var colorMode = colorModeForRenderPass(painter.renderPass);

        var program = painter.view.useProgram(image ? 'backgroundPattern' : 'background');

        // var tileIDs = painter.tileIDs || [];

        var crossfade = layer.getCrossfadeParameters();
        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            var matrix = coord.posMatrix;
            var uniformValues = image ?
                backgroundPatternUniformValues(matrix, opacity, painter, image, {
                    tileID: tileID,
                    tileSize: tileSize
                }, crossfade) :
                backgroundUniformValues(matrix, opacity, color);
            program.draw2(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                uniformValues, layer.id, painter.tileExtentBuffer,
                painter.quadTriangleIndexBuffer, painter.tileExtentSegments);
        }
    };

    //-----------------------------------------------------------------------绘制fill类型
    var fillUniformValues = function (matrix) {
        return ({
            'u_matrix': matrix
            // 'iz': iz
        });
    };
    exports.drawFill = function (painter, sourceCache, layer, coords) {
        var colorMode = mode.ColorMode.unblended;
        var depthMode = painter.depthModeForSublayer(1, mode.DepthMode.ReadWrite);

        var gl = painter.view._gl;
        var indexBuffer, segments, uniformValues;
        var zoom = painter.view.viewpoint.level;

        // var z = painter.currentLayer * 0.04;
        var programName = 'fill';
        var drawMode = gl.TRIANGLES;

        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            var tile = sourceCache.getTile(coord);
            if (tile) {
                var bucket = (tile.getBucket(layer));
                if (!bucket) {
                    continue;
                }
                var programConfiguration = bucket.programConfigurations.get(layer.id);
                var program = painter.view.useProgram(programName, programConfiguration);
                indexBuffer = bucket.indexBuffer;
                segments = bucket.segments;
                uniformValues = fillUniformValues(coord.posMatrix);

                /*program.draw(painter.view.context, drawMode, depthMode,
                    painter.stencilModeForClipping(coord), colorMode, mode.CullFaceMode.disabled, uniformValues,
                    layer.id, bucket.layoutVertexBuffer, indexBuffer, segments,
                    layer.paint, painter.transform.level, programConfiguration);*/
                program.draw2(painter.view.context, drawMode, depthMode,
                    null, colorMode, mode.CullFaceMode.disabled, uniformValues,
                    layer.id, bucket.layoutVertexBuffer, indexBuffer, segments,
                    layer.paint, zoom, programConfiguration);
            }
        }
    };

    //-----------------------------------------------------------------------绘制line类型
    function pixelsToTileUnits(tile, pixelValue, z) {
        return pixelValue * (Constant.layout.EXTENT / tile.tileSize);
    }

    var lineUniformValues = function (painter, tile, layer, coord, level, wh) {
        return {
            'u_matrix': coord.posMatrix,
            'u_ratio': 1 / pixelsToTileUnits(tile, 1, level),
            'u_device_pixel_ratio': 1.0,
            'u_units_to_pixels': wh
        };
    };

    var lineSDFUniformValues = function (painter, tile, layer, coord, level, wh, dasharray, crossfade) {
        var lineAtlas = painter.view.lineAtlas;
        var tileRatio = 1 / pixelsToTileUnits(tile, 1, level);

        var round = layer.layout.get('line-cap') === 'round';

        var posA = lineAtlas.getDash(dasharray.from, round);
        var posB = lineAtlas.getDash(dasharray.to, round);

        var widthA = posA.width * crossfade.fromScale;
        var widthB = posB.width * crossfade.toScale;

        return {
            'u_matrix': coord.posMatrix,
            'u_ratio': 1 / pixelsToTileUnits(tile, 1, level),
            'u_device_pixel_ratio': 1.0,
            'u_units_to_pixels': wh,
            'u_patternscale_a': [tileRatio / widthA, -posA.height / 2],
            'u_patternscale_b': [tileRatio / widthB, -posB.height / 2],
            'u_sdfgamma': lineAtlas.width / (Math.min(widthA, widthB) * 256) / 2,
            'u_image': 0,
            'u_tex_y_a': posA.y,
            'u_tex_y_b': posB.y,
            'u_mix': crossfade.t
        };
    };
    exports.drawLine = function (painter, sourceCache, layer, coords) {
        var opacity = layer.paint.get('line-opacity').constantOr(1);
        var width = layer.paint.get('line-width').constantOr(1);
        if (opacity === 0 || width === 0) {
            return;
        }

        var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
        var colorMode = mode.ColorMode.alphaBlended;

        var dasharray = layer.paint.get('line-dasharray');
        var crossfade = layer.getCrossfadeParameters();

        var zoom = painter.view.viewpoint.level;

        var programId = dasharray ? 'lineSDF' : 'line';
        var context = painter.view.context;
        var gl = context.gl;

        var firstTile = true;
        var wh = [painter.view.viewpoint.width / 2, -painter.view.viewpoint.height / 2];

        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            var tile = sourceCache.getTile(coord);

            if (tile) {
                var bucket = (tile.getBucket(layer));
                if (!bucket) {
                    continue;
                }
                var programConfiguration = bucket.programConfigurations.get(layer.id);
                var prevProgram = painter.view.context.program.get();
                var program = painter.view.useProgram(programId, programConfiguration);
                var programChanged = firstTile || program.program !== prevProgram;

                var uniformValues = dasharray ? lineSDFUniformValues(painter, tile, layer, coord, zoom, wh, dasharray, crossfade)
                    : lineUniformValues(painter, tile, layer, coord, zoom, wh);

                if (dasharray && (programChanged || painter.view.lineAtlas.dirty)) {
                    context.activeTexture.set(gl.TEXTURE0);
                    painter.view.lineAtlas.bind(context);
                }

                /*program.draw(context, gl.TRIANGLES, depthMode,
                    painter.stencilModeForClipping(coord), colorMode, mode.CullFaceMode.disabled, uniformValues,
                    layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
                    layer.paint, painter.view.level, programConfiguration);*/
                program.draw2(context, gl.TRIANGLES, depthMode,
                    null, colorMode, mode.CullFaceMode.disabled, uniformValues,
                    layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
                    layer.paint, zoom, programConfiguration);

                firstTile = false;
            }
        }
    };

    var WritingMode = {
        horizontal: 1,
        vertical: 2,
        horizontalOnly: 3
    };

    function colorModeForRenderPass(renderPass) {
        if (renderPass === 'opaque') {
            return mode.ColorMode.unblended;
        } else {
            return mode.ColorMode.alphaBlended;
        }
    }

    function isVisible(anchorPos,
                       clippingBuffer) {
        var x = anchorPos[0] / anchorPos[3];
        var y = anchorPos[1] / anchorPos[3];
        var inPaddedViewport = (
            x >= -clippingBuffer[0] &&
            x <= clippingBuffer[0] &&
            y >= -clippingBuffer[1] &&
            y <= clippingBuffer[1]);
        return inPaddedViewport;
    }

    function identity$3(out) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }

    var identityMat4 = glMatrix.mat4.create();

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

    var fillExtrusionUniformValues = function (matrix, painter, shouldUseVerticalGradient, opacity, groundTile) {
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
    };


    var hiddenGlyphAttributes = new Float32Array([-Infinity, -Infinity, 0, -Infinity, -Infinity, 0, -Infinity, -Infinity, 0, -Infinity, -Infinity, 0]);

    function hideGlyphs(num, dynamicLayoutVertexArray) {
        for (var i = 0; i < num; i++) {
            var offset = dynamicLayoutVertexArray.length;
            dynamicLayoutVertexArray.resize(offset + 4);
            // Since all hidden glyphs have the same attributes, we can build up the array faster with a single call to Float32Array.set
            // for each set of four vertices, instead of calling addDynamicAttributes for each vertex.
            dynamicLayoutVertexArray.float32.set(hiddenGlyphAttributes, offset * 3);
        }
    }

    function project(point, matrix) {
        var pos = [point.x, point.y, 0, 1];
        funcUtils.xyTransformMat4(pos, pos, matrix);
        var w = pos[3];
        return {
            point: new Point(pos[0] / w, pos[1] / w),
            signedDistanceFromCamera: w
        };
    }

    /**
     * 更新沿线标注位置
     * @param bucket
     * @param posMatrix
     * @param painter
     * @param isText
     * @param labelPlaneMatrix
     * @param glCoordMatrix
     * @param pitchWithMap
     * @param keepUpright
     * @param level
     */
    function updateLineLabels(bucket,
                              posMatrix,
                              painter,
                              isText,
                              labelPlaneMatrix,
                              glCoordMatrix,
                              pitchWithMap,
                              keepUpright,
                              level) {
        var sizeData = isText ? bucket.textSizeData : bucket.iconSizeData;
        var partiallyEvaluatedSize = funcUtils.evaluateSizeForZoom(sizeData, level);

        var transform = painter.view.viewpoint;

        var clippingBuffer = [256 / transform.width * 2 + 1, 256 / transform.height * 2 + 1];

        var dynamicLayoutVertexArray = isText ?
            bucket.text.dynamicLayoutVertexArray :
            bucket.icon.dynamicLayoutVertexArray;
        dynamicLayoutVertexArray.clear();

        var lineVertexArray = bucket.lineVertexArray;
        var placedSymbols = isText ? bucket.text.placedSymbolArray : bucket.icon.placedSymbolArray;

        var aspectRatio = painter.transform.width / painter.transform.height;

        var useVertical = false;

        for (var s = 0; s < placedSymbols.length; s++) {
            var symbol = placedSymbols.get(s);
            if (symbol.hidden || symbol.writingMode === WritingMode.vertical && !useVertical) {
                hideGlyphs(symbol.numGlyphs, dynamicLayoutVertexArray);
                continue;
            }

            useVertical = false;
            var anchorPos = [symbol.anchorX, symbol.anchorY, 0, 1];
            funcUtils.transformMat4(anchorPos, anchorPos, posMatrix);

            // Don't bother calculating the correct point for invisible labels.
            if (!isVisible(anchorPos, clippingBuffer)) {
                hideGlyphs(symbol.numGlyphs, dynamicLayoutVertexArray);
                continue;
            }

            var cameraToAnchorDistance = anchorPos[3];
            var perspectiveRatio = 0.5 + 0.5 * (cameraToAnchorDistance / painter.transform.cameraToCenterDistance);

            var fontSize = funcUtils.evaluateSizeForFeature(sizeData, partiallyEvaluatedSize, symbol);
            var pitchScaledFontSize = pitchWithMap ?
                fontSize * perspectiveRatio :
                fontSize / perspectiveRatio;

            var tileAnchorPoint = new Point(symbol.anchorX, symbol.anchorY);
            var anchorPoint = project(tileAnchorPoint, labelPlaneMatrix).point;
            var projectionCache = {};

            var placeUnflipped = funcUtils.placeGlyphsAlongLine(symbol, pitchScaledFontSize, false /*unflipped*/, keepUpright, posMatrix, labelPlaneMatrix, glCoordMatrix,
                bucket.glyphOffsetArray, lineVertexArray, dynamicLayoutVertexArray, anchorPoint, tileAnchorPoint, projectionCache, aspectRatio);

            useVertical = placeUnflipped.useVertical;

            if (placeUnflipped.notEnoughRoom || useVertical ||
                (placeUnflipped.needsFlipping &&
                    funcUtils.placeGlyphsAlongLine(symbol, pitchScaledFontSize, true /*flipped*/, keepUpright, posMatrix, labelPlaneMatrix, glCoordMatrix,
                        bucket.glyphOffsetArray, lineVertexArray, dynamicLayoutVertexArray, anchorPoint, tileAnchorPoint, projectionCache, aspectRatio).notEnoughRoom)) {
                hideGlyphs(symbol.numGlyphs, dynamicLayoutVertexArray);
            }
        }

        if (isText) {
            bucket.text.dynamicLayoutVertexBuffer.updateData(dynamicLayoutVertexArray);
        } else {
            bucket.icon.dynamicLayoutVertexBuffer.updateData(dynamicLayoutVertexArray);
        }
    }

    /**
     * 更新易变的锚点
     * @param bucket
     * @param rotateWithMap
     * @param pitchWithMap
     * @param variableOffsets
     * @param symbolSize
     * @param transform
     * @param labelPlaneMatrix
     * @param posMatrix
     * @param tileScale
     * @param size
     */
    function updateVariableAnchors(bucket, rotateWithMap, pitchWithMap, variableOffsets, symbolSize,
                                   transform, labelPlaneMatrix, posMatrix, tileScale, size) {
        var placedSymbols = bucket.text.placedSymbolArray;
        var dynamicLayoutVertexArray = bucket.text.dynamicLayoutVertexArray;
        dynamicLayoutVertexArray.clear();
        for (var s = 0; s < placedSymbols.length; s++) {
            var symbol = placedSymbols.get(s);
            var variableOffset = (!symbol.hidden && symbol.crossTileID) ? variableOffsets[symbol.crossTileID] : null;
            if (!variableOffset) {
                // These symbols are from a justification that is not being used, or a label that wasn't placed
                // so we don't need to do the extra math to figure out what incremental shift to apply.
                hideGlyphs(symbol.numGlyphs, dynamicLayoutVertexArray);
            } else {
                var tileAnchor = new __chunk_1.Point(symbol.anchorX, symbol.anchorY);
                var projectedAnchor = project(tileAnchor, pitchWithMap ? posMatrix : labelPlaneMatrix);
                var perspectiveRatio = 0.5 + 0.5 * (transform.cameraToCenterDistance / projectedAnchor.signedDistanceFromCamera);
                var renderTextSize = symbolSize.evaluateSizeForFeature(bucket.textSizeData, size, symbol) * perspectiveRatio / __chunk_1.ONE_EM;
                if (pitchWithMap) {
                    // Go from size in pixels to equivalent size in tile units
                    renderTextSize *= bucket.tilePixelRatio / tileScale;
                }

                var width = variableOffset.width;
                var height = variableOffset.height;
                var radialOffset = variableOffset.radialOffset;
                var textBoxScale = variableOffset.textBoxScale;

                var shift = calculateVariableRenderShift(
                    variableOffset.anchor, width, height, radialOffset, textBoxScale, renderTextSize);

                // Usual case is that we take the projected anchor and add the pixel-based shift
                // calculated above. In the (somewhat weird) case of pitch-aligned text, we add an equivalent
                // tile-unit based shift to the anchor before projecting to the label plane.
                var shiftedAnchor = pitchWithMap ?
                    project(tileAnchor.add(shift), labelPlaneMatrix).point :
                    projectedAnchor.point.add(rotateWithMap ?
                        shift.rotate(-transform.angle) :
                        shift);

                for (var g = 0; g < symbol.numGlyphs; g++) {
                    __chunk_1.addDynamicAttributes(dynamicLayoutVertexArray, shiftedAnchor, 0);
                }
            }
        }
        bucket.text.dynamicLayoutVertexBuffer.updateData(dynamicLayoutVertexArray);
    }

    /**
     * 图像标识与数据一致
     * @param functionType
     * @param size
     * @param rotateInShader
     * @param pitchWithMap
     * @param painter
     * @param matrix
     * @param labelPlaneMatrix
     * @param glCoordMatrix
     * @param isText
     * @param texSize
     */
    var symbolIconUniformValues = function (functionType, size, rotateInShader, pitchWithMap, painter, matrix, labelPlaneMatrix, glCoordMatrix, isText, texSize) {
        return {
            'u_is_size_zoom_constant': +(functionType === 'constant' || functionType === 'source'),
            'u_is_size_feature_constant': +(functionType === 'constant' || functionType === 'camera'),
            'u_size_t': size ? size.uSizeT : 0,
            'u_size': size ? size.uSize : 0,
            'u_camera_to_center_distance': painter.transform.cameraToCenterDistance,
            'u_pitch': painter.transform.pitch / 180 * Math.PI,
            'u_rotate_symbol': +rotateInShader,
            'u_aspect_ratio': painter.view.viewpoint.width / painter.view.viewpoint.height,
            'u_fade_change': 1,
            'u_matrix': matrix,
            'u_label_plane_matrix': labelPlaneMatrix,
            'u_coord_matrix': glCoordMatrix,
            'u_is_text': +isText,
            'u_pitch_with_map': +pitchWithMap,
            'u_texsize': texSize,
            'u_texture': 0
        };
    };
    /**
     * 标识语法图解形式与数值一致
     * @param functionType
     * @param size
     * @param rotateInShader
     * @param pitchWithMap
     * @param painter
     * @param matrix
     * @param labelPlaneMatrix
     * @param glCoordMatrix
     * @param isText
     * @param texSize
     * @param isHalo
     */
    var symbolSDFUniformValues = function (functionType, size, rotateInShader, pitchWithMap, painter, matrix, labelPlaneMatrix, glCoordMatrix, isText, texSize, isHalo) {
        return utils.extend(symbolIconUniformValues(functionType, size,
            rotateInShader, pitchWithMap, painter, matrix, labelPlaneMatrix,
            glCoordMatrix, isText, texSize), {
            'u_gamma_scale': (pitchWithMap ? Math.cos(painter.view.viewpoint.pitch / 180 * Math.PI) * painter.view.viewpoint.cameraToCenterDistance : 1),
            'u_device_pixel_ratio': 1,
            'u_is_halo': +isHalo
        });
    };

    /**
     *
     * @param painter
     * @param sourceCache
     * @param layer
     * @param coords
     * @param isText
     * @param translate
     * @param translateAnchor
     * @param rotationAlignment
     * @param pitchAlignment
     * @param keepUpright
     * @param stencilMode
     * @param colorMode
     * @param variableOffsets
     */
    function drawLayerSymbols(painter, sourceCache, layer, coords, isText, translate, translateAnchor,
                              rotationAlignment, pitchAlignment, keepUpright, stencilMode, colorMode, variableOffsets) {
        var context = painter.view.context;
        var gl = context.gl;
        var rotateWithMap = rotationAlignment === 'map';
        var pitchWithMap = pitchAlignment === 'map';
        var alongLine = rotateWithMap && layer.layout.get('symbol-placement') !== 'point';
        var rotateInShader = rotateWithMap && !pitchWithMap && !alongLine;

        var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);

        var program;
        var size;
        var variablePlacement = layer.layout.get('text-variable-anchor');

        var tileRenderState = [];

        var zoom = painter.view.viewpoint.level;

        var rotate = painter.view.viewpoint.angle;

        for (var i$1 = 0, list$1 = coords; i$1 < list$1.length; i$1 += 1) {
            var coord = list$1[i$1];

            var tile = sourceCache.getTile(coord);
            if (tile) {
                var bucket = (tile.getBucket(layer));
                if (!bucket) {
                    continue;
                }

                // debugger;
                var buffers = isText ? bucket.text : bucket.icon;
                if (!buffers || !buffers.segments.get().length) {
                    continue;
                }

                var programConfiguration = buffers.programConfigurations.get(layer.id);

                var isSDF = isText || bucket.sdfIcons;

                var sizeData = isText ? bucket.textSizeData : bucket.iconSizeData;

                if (!program) {
                    program = painter.view.useProgram(isSDF ? 'symbolSDF' : 'symbolIcon', programConfiguration);
                    size = funcUtils.evaluateSizeForZoom(sizeData, zoom);
                }

                context.activeTexture.set(gl.TEXTURE0);
                // context.pixelStoreUnpackFlipY.setDefault();

                var texSize = (void 0);
                var atlasTexture = (void 0);
                var atlasInterpolation = (void 0);
                if (isText) {
                    atlasTexture = tile.glyphAtlasTexture;
                    atlasInterpolation = gl.LINEAR;
                    texSize = tile.glyphAtlasTexture.size;

                } else {
                    var iconScaled = layer.layout.get('icon-size').constantOr(0) !== 1 || bucket.iconsNeedLinear;
                    var iconTransformed = pitchWithMap || false;

                    atlasTexture = tile.imageAtlasTexture;
                    // atlasInterpolation = isSDF || painter.options.rotating || painter.options.zooming || iconScaled || iconTransformed ?
                    atlasInterpolation = isSDF || false || false || iconScaled || iconTransformed ?
                        gl.LINEAR :
                        gl.NEAREST;
                    texSize = tile.imageAtlasTexture.size;
                }

                var s = pixelsToTileUnits(tile, 1, painter.transform.level);
                var labelPlaneMatrix = funcUtils.getLabelPlaneMatrix(coord.posMatrix, pitchWithMap, rotateWithMap, painter.transform, s);
                var glCoordMatrix = funcUtils.getGlCoordMatrix(coord.posMatrix, pitchWithMap, rotateWithMap, painter.transform, s);

                if (alongLine) {
                    updateLineLabels(bucket, coord.posMatrix, painter, isText, labelPlaneMatrix, glCoordMatrix, pitchWithMap, keepUpright, zoom);
                } else if (isText && size && variablePlacement) {
                    var tileScale = Math.pow(2, tr.zoom - tile.tileID.overscaledZ);
                    updateVariableAnchors(bucket, rotateWithMap, pitchWithMap, variableOffsets, __chunk_1.symbolSize,
                        tr, labelPlaneMatrix, coord.posMatrix, tileScale, size);
                }
                var matrix = funcUtils.translatePosMatrix(coord.posMatrix, tile, translate, translateAnchor, undefined, rotate, zoom),
                    uLabelPlaneMatrix = (alongLine || (isText && variablePlacement)) ? identityMat4 : labelPlaneMatrix,
                    uglCoordMatrix = funcUtils.translatePosMatrix(glCoordMatrix, tile, translate, translateAnchor, true, rotate, zoom);

                var hasHalo = isSDF && layer.paint.get(isText ? 'text-halo-width' : 'icon-halo-width').constantOr(1) !== 0;

                var uniformValues = (void 0);
                if (isSDF) {
                    uniformValues = symbolSDFUniformValues(sizeData.kind,
                        size, rotateInShader, pitchWithMap, painter, matrix,
                        uLabelPlaneMatrix, uglCoordMatrix, isText, texSize, true);

                } else {
                    uniformValues = symbolIconUniformValues(sizeData.kind,
                        size, rotateInShader, pitchWithMap, painter, matrix,
                        uLabelPlaneMatrix, uglCoordMatrix, isText, texSize);
                }

                var state = {
                    program: program,
                    buffers: buffers,
                    uniformValues: uniformValues,
                    atlasTexture: atlasTexture,
                    atlasInterpolation: atlasInterpolation,
                    isSDF: isSDF,
                    hasHalo: hasHalo
                };

                tileRenderState.push({
                    segments: buffers.segments,
                    sortKey: 0,
                    state: state
                });
            }
        }


        for (var i$2 = 0, list$2 = tileRenderState; i$2 < list$2.length; i$2 += 1) {
            var segmentState = list$2[i$2];

            var state$1 = segmentState.state;

            state$1.atlasTexture.bind(state$1.atlasInterpolation, gl.CLAMP_TO_EDGE);

            if (state$1.isSDF) {
                var uniformValues$1 = ((state$1.uniformValues));
                if (state$1.hasHalo) {
                    uniformValues$1['u_is_halo'] = 1;
                    drawSymbolElements(state$1.buffers, segmentState.segments, layer, painter, state$1.program, depthMode, stencilMode, colorMode, uniformValues$1);
                }
                uniformValues$1['u_is_halo'] = 0;
            }
            drawSymbolElements(state$1.buffers, segmentState.segments, layer, painter, state$1.program, depthMode, stencilMode, colorMode, state$1.uniformValues);
        }
    }

    /**
     *
     * @param buffers
     * @param segments
     * @param layer
     * @param painter
     * @param program
     * @param depthMode
     * @param stencilMode
     * @param colorMode
     * @param uniformValues
     */
    function drawSymbolElements(buffers, segments, layer, painter, program, depthMode, stencilMode, colorMode, uniformValues) {
        var context = painter.view.context;
        var gl = context.gl;
        program.draw2(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
            uniformValues, layer.id, buffers.layoutVertexBuffer,
            buffers.indexBuffer, segments, layer.paint,
            painter.view.viewpoint.level, buffers.programConfigurations.get(layer.id),
            buffers.dynamicLayoutVertexBuffer, buffers.opacityVertexBuffer);
    }


    /**
     * 绘制Symbol
     * @param painter
     * @param sourceCache
     * @param layer
     * @param coords
     * @param variableOffsets
     */
    exports.drawSymbols = function (painter, sourceCache, layer, coords, variableOffsets) {
        if (painter.renderPass !== 'translucent') {
            return;
        }
        var colorMode = colorModeForRenderPass(painter.renderPass);
        var stencilMode = mode.StencilMode.disabled;


        if (layer.paint.get('icon-opacity').constantOr(1) !== 0) {
            drawLayerSymbols(painter, sourceCache, layer, coords, false,
                layer.paint.get('icon-translate'),
                layer.paint.get('icon-translate-anchor'),
                layer.layout.get('icon-rotation-alignment'),
                layer.layout.get('icon-pitch-alignment'),
                layer.layout.get('icon-keep-upright'),
                // stencilMode, colorMode, variableOffsets
                null, colorMode, variableOffsets
            );
        }

        if (layer.paint.get('text-opacity').constantOr(1) !== 0) {
            drawLayerSymbols(painter, sourceCache, layer, coords, true,
                layer.paint.get('text-translate'),
                layer.paint.get('text-translate-anchor'),
                layer.layout.get('text-rotation-alignment'),
                layer.layout.get('text-pitch-alignment'),
                layer.layout.get('text-keep-upright'),
                // stencilMode, colorMode, variableOffsets
                null, colorMode, variableOffsets
            );
        }
    };

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
        var patternProperty = layer.paint.get('fill-extrusion-pattern');
        var image = patternProperty.constantOr((1));
        var crossfade = layer.getCrossfadeParameters();
        var opacity = layer.paint.get('fill-extrusion-opacity');
        var groundSource = painter.view.ground.sourceCache;
        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            var tile = source.getTile(coord);
            if (!tile.groundTile) {
                tile.groundTile = groundSource.getTile(coord);
            }

            var bucket = (tile.getBucket(layer));
            if (!bucket) {
                continue;
            }
            var programConfiguration = bucket.programConfigurations.get(layer.id);
            var program = painter.view.useProgram("fillExtrusion", programConfiguration);
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

            var matrix = coord.posMatrix;

            var shouldUseVerticalGradient = layer.paint.get('fill-extrusion-vertical-gradient');
            var uniformValues = fillExtrusionUniformValues(matrix, painter, shouldUseVerticalGradient, opacity, tile.groundTile);

            program.draw2(context, context.gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.backCCW,
                uniformValues, layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer,
                bucket.segments, layer.paint, painter.transform.level,
                programConfiguration);
        }
    }

    exports.drawExtrusion = function (painter, source, layer, coords) {
        var opacity = layer.paint.get('fill-extrusion-opacity');
        if (opacity === 0) {
            return;
        }

        if (painter.renderPass === 'translucent') {
            var depthMode = new mode.DepthMode(painter.view.context.gl.LEQUAL, mode.DepthMode.ReadWrite, painter.depthRangeFor3D);
            // var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);

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
    };

    var lineExtrusionUniformValues = function (matrix, painter, shouldUseVerticalGradient, opacity) {
        return {
            'u_matrix': matrix,
            'u_opacity': opacity
        };
    };

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
    function drawLineExtrusionTiles(painter, source, layer, coords, depthMode, stencilMode, colorMode) {
        var context = painter.view.context;
        var gl = context.gl;
        var patternProperty = layer.paint.get('fill-extrusion-pattern');
        var image = patternProperty.constantOr((1));
        var opacity = layer.paint.get('fill-extrusion-opacity');

        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            var tile = source.getTile(coord);
            var bucket = (tile.getBucket(layer));
            if (!bucket) {
                continue;
            }
            var programConfiguration = bucket.programConfigurations.get(layer.id);

            var program = painter.view.useProgram("lineExtrusion", programConfiguration);

            var matrix = coord.posMatrix;

            var shouldUseVerticalGradient = layer.paint.get('fill-extrusion-vertical-gradient');
            var uniformValues = lineExtrusionUniformValues(matrix, painter, shouldUseVerticalGradient, opacity);

            program.draw(context, context.gl.LINES, depthMode, stencilMode, colorMode, mode.CullFaceMode.backCCW,
                uniformValues, layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer,
                bucket.segments, layer.paint, painter.transform.level,
                programConfiguration);
        }
    }

    exports.drawLineExtrusion = function (painter, source, layer, coords) {
        var opacity = layer.paint.get('fill-extrusion-opacity');
        if (opacity === 0) {
            return;
        }

        if (painter.renderPass === 'translucent') {
            var depthMode = new mode.DepthMode(painter.view.context.gl.LEQUAL, mode.DepthMode.ReadWrite, painter.depthRangeFor3D);

            /*if (opacity === 1 && !layer.paint.get('fill-extrusion-pattern').constantOr((1))) {
                var colorMode = colorModeForRenderPass();
                drawLineExtrusionTiles(painter, source, layer, coords, depthMode, mode.StencilMode.disabled, colorMode);

            } else {
                // Draw transparent buildings in two passes so that only the closest surface is drawn.
                // First draw all the extrusions into only the depth buffer. No colors are drawn.
                drawLineExtrusionTiles(painter, source, layer, coords, depthMode,
                  mode.StencilMode.disabled,
                  mode.ColorMode.disabled);

                // Then draw all the extrusions a second type, only coloring fragments if they have the
                // same depth value as the closest fragment in the previous pass. Use the stencil buffer
                // to prevent the second draw in cases where we have coincident polygons.
                drawLineExtrusionTiles(painter, source, layer, coords, depthMode,
                  painter.stencilModeFor3D(),
                  colorModeForRenderPass());
            }*/
            var colorMode = colorModeForRenderPass();
            drawLineExtrusionTiles(painter, source, layer, coords, depthMode, mode.StencilMode.disabled, colorMode);
        }
    };

    exports.drawClipping = function (painter, stencilClearMode, viewportBuffer, quadTriangleIndexBuffer, viewportSegments) {
        var context = painter.view.context;
        var gl = context.gl;

        var matrix = new Matrix4();
        matrix.ortho(0, painter.view.width, painter.view.height, 0, 0, 1);
        matrix.scale(gl.drawingBufferWidth, gl.drawingBufferHeight, 0);

        painter.view.useProgram('clippingMask').draw(context, gl.TRIANGLES,
            mode.DepthMode.disabled, stencilClearMode, mode.ColorMode.disabled, mode.CullFaceMode.disabled,
            {
                "u_matrix": matrix.elements
            },
            '$clipping', viewportBuffer,
            quadTriangleIndexBuffer, viewportSegments);
    };

    /**
     *
     * @param context
     * @param painter
     * @param texture
     * @param fbo
     */
    function bindTextureToFramebuffer(context, painter, texture, fbo) {
        var gl = context.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, painter.width / 4, painter.height / 4, 0, gl.RGBA,
            context.extTextureHalfFloat ? context.extTextureHalfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE, null);

        fbo.colorAttachment.set(texture);

        if (context.extTextureHalfFloat && gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            context.extTextureHalfFloat = null;
            fbo.colorAttachment.setDirty();
            bindTextureToFramebuffer(context, painter, texture, fbo);
        }
    }

    /**
     *
     * @param context
     * @param painter
     * @param layer
     */
    function bindFramebuffer(context, painter, layer) {
        var gl = context.gl;
        context.activeTexture.set(gl.TEXTURE1);

        context.viewport.set([0, 0, painter.width / 4, painter.height / 4]);

        var fbo = layer.heatmapFbo;

        if (!fbo) {
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            fbo = layer.heatmapFbo = context.createFramebuffer(painter.width / 4, painter.height / 4);

            bindTextureToFramebuffer(context, painter, texture, fbo);

        } else {
            gl.bindTexture(gl.TEXTURE_2D, fbo.colorAttachment.get());
            context.bindFramebuffer.set(fbo.framebuffer);
        }
    }

    /**
     *
     * @param matrix
     * @param tile
     * @param zoom
     * @param intensity
     */
    var heatmapUniformValues = function (matrix, tile, zoom, intensity) {
        return ({
            'u_matrix': matrix,
            'u_extrude_scale': pixelsToTileUnits(tile, 1, zoom),
            'u_intensity': intensity
        });
    };
    /**
     *
     * @param painter
     * @param layer
     * @param textureUnit
     * @param colorRampUnit
     */
    var heatmapTextureUniformValues = function (painter, layer, textureUnit, colorRampUnit) {
        var viewpoint = painter.view.viewpoint;
        var matrix = glMatrix.mat4.create();
        glMatrix.mat4.ortho(matrix, 0, viewpoint.width, viewpoint.height, 0, 0, 1);
        var gl = painter.view.context.gl;
        return {
            'u_matrix': matrix,
            'u_world': [gl.drawingBufferWidth, gl.drawingBufferHeight],
            'u_image': textureUnit,
            'u_color_ramp': colorRampUnit,
            'u_opacity': layer.paint.get('heatmap-opacity')
        };
    };

    /**
     * 渲染地图
     * @param painter
     * @param layer
     */
    function renderTextureToMap(painter, layer) {
        var context = painter.view.context;
        var gl = context.gl;

        var fbo = layer.heatmapFbo;
        if (!fbo) {
            return;
        }
        context.activeTexture.set(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fbo.colorAttachment.get());

        context.activeTexture.set(gl.TEXTURE1);
        var colorRampTexture = layer.colorRampTexture;
        if (!colorRampTexture) {
            colorRampTexture = layer.colorRampTexture = new Texture(context, layer.colorRamp, gl.RGBA);
        }
        colorRampTexture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);

        painter.view.useProgram('heatmapTexture').draw(context, gl.TRIANGLES,
            mode.DepthMode.disabled, mode.StencilMode.disabled, mode.ColorMode.alphaBlended, mode.CullFaceMode.disabled,
            heatmapTextureUniformValues(painter, layer, 0, 1),
            layer.id, painter.viewportBuffer, painter.quadTriangleIndexBuffer,
            painter.viewportSegments, layer.paint, painter.transform.level);
    }

    exports.drawHeatmap = function (painter, sourceCache, layer, coords) {
        if (layer.paint.get('heatmap-opacity') === 0) {
            return;
        }

        if (painter.renderPass === 'offscreen') {
            var context = painter.view.context;
            var gl = context.gl;

            var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
            var stencilMode = mode.StencilMode.disabled;
            var colorMode = new mode.ColorMode([gl.ONE, gl.ONE], Color.transparent, [true, true, true, true]);

            bindFramebuffer(context, painter, layer);

            context.clear({color: Color.transparent});

            for (var i = 0; i < coords.length; i++) {
                var coord = coords[i];
                if (sourceCache.hasRenderableParent(coord)) {
                    continue;
                }
                var tile = sourceCache.getTile(coord);
                var bucket = (tile.getBucket(layer));
                if (!bucket) {
                    continue;
                }
                var programConfiguration = bucket.programConfigurations.get(layer.id);
                var program = painter.view.useProgram('heatmap', programConfiguration);
                var ref = painter.transform;
                var zoom = ref.zoom;

                program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                    heatmapUniformValues(coord.posMatrix,
                        tile, zoom, layer.paint.get('heatmap-intensity')),
                    layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer,
                    bucket.segments, layer.paint, painter.transform.level,
                    programConfiguration);
            }
            context.viewport.set([0, 0, painter.width, painter.height]);
        } else if (painter.renderPass === 'translucent') {
            painter.view.context.setColorMode(mode.ColorMode.alphaBlended);
            renderTextureToMap(painter, layer);
        }
    };

    /**
     * 获取数据
     * @param tile
     * @param parentTile
     * @param sourceCache
     * @param transform
     */
    function getFadeValues(tile, parentTile, sourceCache, transform) {
        var fadeDuration = 300;//layer.paint.get('raster-fade-duration');

        if (fadeDuration > 0) {
            var now = utils.now();
            var sinceTile = (now - tile.timeAdded) / fadeDuration;
            var sinceParent = parentTile ? (now - parentTile.timeAdded) / fadeDuration : -1;

            var source = sourceCache.getSource();
            var idealZ = transform.coveringZoomLevel({
                tileSize: source.tileSize,
                roundZoom: source.roundZoom
            });

            // if no parent or parent is older, fade in; if parent is younger, fade out
            var fadeIn = !parentTile || Math.abs(parentTile.tileID.overscaledZ - idealZ) > Math.abs(tile.tileID.overscaledZ - idealZ);
            var childOpacity = (fadeIn && tile.refreshedUponExpiration) ? 1 : utils.clamp(fadeIn ? sinceTile : 1 - sinceParent, 0, 1);
            /*// we don't crossfade tiles that were just refreshed upon expiring:
            // once they're old enough to pass the crossfading threshold
            // (fadeDuration), unset the `refreshedUponExpiration` flag so we don't
            // incorrectly fail to crossfade them when zooming
            if (tile.refreshedUponExpiration && sinceTile >= 1) {
                tile.refreshedUponExpiration = false;
            }*/

            if (parentTile) {
                return {
                    opacity: 1,
                    mix: 1 - childOpacity
                };
            } else {
                return {
                    opacity: childOpacity,
                    mix: 0
                };
            }
        } else {
            return {
                opacity: 1,
                mix: 0
            };
        }
    }

    /**
     * 图片与数据一致
     * @param painter
     * @param textureUnit
     */
    var imageTextureUniformValues = function (painter, textureUnit) {
        var viewpoint = painter.view.viewpoint;
        var position = painter.position;
        var matrix = viewpoint.getMatrixForPoint(position[0], position[1], null, true);
        return {
            'u_matrix': matrix,
            'u_image': textureUnit,
            'u_opacity': painter.opacity
        };
    };
    exports.drawImageLayer = function (painter) {
        if (!painter.texture) {
            return;
        }
        // console.log(painter.view);
        painter.view.context.setColorMode(mode.ColorMode.alphaBlended);
        renderImageTextureToMap(painter);
    };

    /**
     * 渲染图片到地图上
     * @param painter
     */
    function renderImageTextureToMap(painter) {
        var context = painter.view.context;
        var gl = context.gl;
        var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadWrite, gl.LESS);
        var textureFilter = gl.LINEAR;
        context.activeTexture.set(gl.TEXTURE0);
        painter.texture.bind(textureFilter, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);

        painter.view.useProgram('image').draw2(context, gl.TRIANGLES,
            depthMode, mode.StencilMode.disabled, mode.ColorMode.alphaBlended, mode.CullFaceMode.disabled,
            imageTextureUniformValues(painter, 0),
            "image", painter.viewportBuffer, painter.quadTriangleIndexBuffer,
            painter.viewportSegments, null, painter.transform.level);
    }

    /**
     *
     * @param painter
     * @param coord
     * @param tile
     * @param layer
     */
    var circleUniformValues = function (painter, coord, tile, layer) {
        var transform = painter.transform;
        var pitchWithMap, extrudeScale;
        if (layer.paint.get('circle-pitch-alignment') === 'map') {
            var pixelRatio = pixelsToTileUnits(tile, 1, transform.level);
            pitchWithMap = true;
            extrudeScale = [pixelRatio, pixelRatio];
        } else {
            pitchWithMap = false;
            extrudeScale = transform.pixelsToGLUnits;
        }

        return {
            'u_camera_to_center_distance': transform.cameraToCenterDistance,
            'u_scale_with_map': +(layer.paint.get('circle-pitch-scale') === 'map'),
            'u_matrix': coord.posMatrix,
            'u_pitch_with_map': +(pitchWithMap),
            'u_device_pixel_ratio': 1.0,
            'u_extrude_scale': extrudeScale
        };
    };

    exports.drawCircles = function (painter, sourceCache, layer, coords) {
        if (painter.renderPass !== 'translucent') {
            return;
        }

        var opacity = layer.paint.get('circle-opacity');
        var strokeWidth = layer.paint.get('circle-stroke-width');
        var strokeOpacity = layer.paint.get('circle-stroke-opacity');

        if (opacity.constantOr(1) === 0 && (strokeWidth.constantOr(1) === 0 || strokeOpacity.constantOr(1) === 0)) {
            return;
        }

        var context = painter.view.context;
        var gl = context.gl;

        var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
        var stencilMode = mode.StencilMode.disabled;
        var colorMode = colorModeForRenderPass(painter.renderPass);

        for (var i = 0; i < coords.length; i++) {
            var coord = coords[i];
            var tile = sourceCache.getTile(coord);
            var bucket = (tile.getBucket(layer));
            if (!bucket) {
                continue;
            }
            var programConfiguration = bucket.programConfigurations.get(layer.id);
            var program = painter.view.useProgram('circles', programConfiguration);
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                circleUniformValues(painter, coord, tile, layer), layer.id,
                bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
                layer.paint, painter.transform.level, programConfiguration);
        }
    }
});