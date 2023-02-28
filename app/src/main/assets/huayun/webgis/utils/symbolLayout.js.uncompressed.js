/**
 * Symbol符号位置处理
 */
define("com/huayun/webgis/utils/symbolLayout", [
    "exports",
    "./Constant",
    "./scriptDetection",
    "./shaping",
    "./clipLine",
    "./getAnchors",
    "./classifyRings",
    "./findPoleOfInaccessibility",
    "./murmurhashJs",
    "./quads",
    "./symbolSize",
    "../layers/support/style/EvaluationParameters",
    "../geometry/Anchor",
    "../data/CollisionFeature"
], function (exports, Constant, scriptDetection, shapingUtils, clipLine, getAnchors, classifyRings, findPoleOfInaccessibility,murmurhashJs,quads,symbolSize,
             EvaluationParameters, Anchor, CollisionFeature) {

    var MAX_PACKED_SIZE = 65535;
    var baselineOffset = 7;
    var WritingMode = shapingUtils.WritingMode;
    var EXTENT = Constant.layout.EXTENT;
    var ONE_EM = Constant.ONE_EM;

    function evaluateRadialOffset(anchor, radialOffset) {
        var x = 0, y = 0;
        var hypotenuse = radialOffset / Math.sqrt(2);
        switch (anchor) {
            case 'top-right':
            case 'top-left':
                y = hypotenuse - baselineOffset;
                break;
            case 'bottom-right':
            case 'bottom-left':
                y = -hypotenuse + baselineOffset;
                break;
            case 'bottom':
                y = -radialOffset + baselineOffset;
                break;
            case 'top':
                y = radialOffset - baselineOffset;
                break;
        }
        switch (anchor) {
            case 'top-right':
            case 'bottom-right':
                x = -hypotenuse;
                break;
            case 'top-left':
            case 'bottom-left':
                x = hypotenuse;
                break;
            case 'left':
                x = radialOffset;
                break;
            case 'right':
                x = -radialOffset;
                break;
        }
        return [x, y];
    }

    /**
     * 选择与文本锚点的方向匹配的对齐方式
     * @private
     * @param anchor 文本锚点
     * @return {string}
     */
    function getAnchorJustification(anchor) {
        switch (anchor) {
            case 'right':
            case 'top-right':
            case 'bottom-right':
                return 'right';
            case 'left':
            case 'top-left':
            case 'bottom-left':
                return 'left';
        }
        return 'center';
    }

    function getDefaultHorizontalShaping(horizontalShaping) {
        for (var justification in horizontalShaping) {
            return horizontalShaping[justification];
        }
        return null;
    }

    function anchorIsTooClose(bucket, text, repeatDistance, anchor) {
        var compareText = bucket.compareText;
        if (!(text in compareText)) {
            compareText[text] = [];
        } else {
            var otherAnchors = compareText[text];
            for (var k = otherAnchors.length - 1; k >= 0; k--) {
                if (anchor.dist(otherAnchors[k]) < repeatDistance) {
                    return true;
                }
            }
        }
        compareText[text].push(anchor);
        return false;
    }

    /**
     * 添加图形
     * @private
     * @param bucket
     * @param feature
     * @param shapedTextOrientations
     * @param shapedIcon
     * @param glyphPositionMap
     * @param sizes
     * @param textOffset
     */
    function addFeature(bucket, feature, shapedTextOrientations, shapedIcon, glyphPositionMap, sizes, textOffset) {
        var layoutTextSize = sizes.layoutTextSize.evaluate(feature, {});
        var layoutIconSize = sizes.layoutIconSize.evaluate(feature, {});
        var textMaxSize = sizes.textMaxSize.evaluate(feature, {});
        if (textMaxSize === undefined) {
            textMaxSize = layoutTextSize;
        }
        var layout = bucket.layers[0].layout;
        var iconOffset = layout.get('icon-offset').evaluate(feature, {});
        var defaultHorizontalShaping = getDefaultHorizontalShaping(shapedTextOrientations.horizontal);
        var glyphSize = 24,
            fontScale = layoutTextSize / glyphSize,
            textBoxScale = bucket.tilePixelRatio * fontScale,
            textMaxBoxScale = bucket.tilePixelRatio * textMaxSize / glyphSize,
            iconBoxScale = bucket.tilePixelRatio * layoutIconSize,
            symbolMinDistance = bucket.tilePixelRatio * layout.get('symbol-spacing'),// text-repeat
            textPadding = layout.get('text-padding') * bucket.tilePixelRatio,
            iconPadding = layout.get('icon-padding') * bucket.tilePixelRatio,
            textMaxAngle = layout.get('text-max-angle') / 180 * Math.PI,
            textAlongLine = layout.get('text-rotation-alignment') === 'map' && layout.get('symbol-placement') !== 'point',
            iconAlongLine = layout.get('icon-rotation-alignment') === 'map' && layout.get('symbol-placement') !== 'point',
            symbolPlacement = layout.get('symbol-placement'),
            textRepeatDistance = symbolMinDistance / 2;

        var addSymbolAtAnchor = function (line, anchor) {
            if (anchor.x < 0 || anchor.x >= EXTENT || anchor.y < 0 || anchor.y >= EXTENT) {
                return;
            }

            addSymbol(bucket, anchor, line, shapedTextOrientations, shapedIcon, bucket.layers[0],
                bucket.collisionBoxArray, feature.index, feature.sourceLayerIndex, bucket.index,
                textBoxScale, textPadding, textAlongLine, textOffset,
                iconBoxScale, iconPadding, iconAlongLine, iconOffset,
                feature, glyphPositionMap, sizes);
        };

        if (symbolPlacement === 'line') {
            for (var i$1 = 0, list$1 = clipLine(feature.geometry, 0, 0, EXTENT, EXTENT); i$1 < list$1.length; i$1 += 1) {
                var line = list$1[i$1];
                var anchors = getAnchors.getAnchors(line, symbolMinDistance, textMaxAngle, shapedTextOrientations.vertical || defaultHorizontalShaping,
                    shapedIcon, glyphSize, textMaxBoxScale, bucket.overscaling, EXTENT);
                for (var i = 0, list = anchors; i < list.length; i += 1) {
                    var anchor = list[i];
                    var shapedText = defaultHorizontalShaping;
                    if (!shapedText || !anchorIsTooClose(bucket, shapedText.text, textRepeatDistance, anchor)) {
                        addSymbolAtAnchor(line, anchor);
                    }
                }
            }
        } else if (symbolPlacement === 'line-center') {
            for (var i$2 = 0, list$2 = feature.geometry; i$2 < list$2.length; i$2 += 1) {
                var line$1 = list$2[i$2];
                if (line$1.length > 1) {
                    var anchor$1 = getAnchors.getCenterAnchor(line$1, textMaxAngle, shapedTextOrientations.vertical || defaultHorizontalShaping,
                        shapedIcon, glyphSize, textMaxBoxScale);
                    if (anchor$1) {
                        addSymbolAtAnchor(line$1, anchor$1);
                    }
                }
            }
        } else if (feature.type === 'Polygon') {
            for (var i$3 = 0, list$3 = classifyRings(feature.geometry, 0); i$3 < list$3.length; i$3 += 1) {
                var polygon = list$3[i$3];
                var poi = findPoleOfInaccessibility(polygon, 16);
                addSymbolAtAnchor(polygon[0], new Anchor(poi.x, poi.y, 0));
            }
        } else if (feature.type === 'LineString') {
            for (var i$4 = 0, list$4 = feature.geometry; i$4 < list$4.length; i$4 += 1) {
                var line$2 = list$4[i$4];
                addSymbolAtAnchor(line$2, new Anchor(line$2[0].x, line$2[0].y, 0));
            }
        } else if (feature.type === 'Point') {
            for (var i$6 = 0, list$6 = feature.geometry; i$6 < list$6.length; i$6 += 1) {
                var points = list$6[i$6];
                for (var i$5 = 0, list$5 = points; i$5 < list$5.length; i$5 += 1) {
                    var point = list$5[i$5];
                    addSymbolAtAnchor([point], new Anchor(point.x, point.y, 0));
                }
            }
        }
    }

    /**
     * 将文本的三角化坐标放入缓存
     * @private
     * @param bucket
     * @param anchor
     * @param shapedText
     * @param layer
     * @param textAlongLine
     * @param feature
     * @param textOffset
     * @param lineArray
     * @param writingMode
     * @param placementTypes
     * @param placedTextSymbolIndices
     * @param glyphPositionMap
     * @param sizes
     * @return {number}
     */
    function addTextVertices(bucket, anchor, shapedText, layer, textAlongLine, feature, textOffset, lineArray,
                             writingMode, placementTypes, placedTextSymbolIndices, glyphPositionMap, sizes) {
        var glyphQuads = quads.getGlyphQuads(anchor, shapedText, textOffset, layer, textAlongLine, feature, glyphPositionMap);
        var sizeData = bucket.textSizeData;
        var textSizeData = null;
        if (sizeData.kind === 'source') {
            textSizeData = [
                symbolSize.SIZE_PACK_FACTOR * layer.layout.get('text-size').evaluate(feature, {})
            ];
            if (textSizeData[0] > MAX_PACKED_SIZE) {
                console.warn(bucket.layerIds[0] + ": Value for \"text-size\" is >= 256. Reduce your \"text-size\".");
            }
        } else if (sizeData.kind === 'composite') {
            textSizeData = [
                symbolSize.SIZE_PACK_FACTOR * sizes.compositeTextSizes[0].evaluate(feature, {}),
                symbolSize.SIZE_PACK_FACTOR * sizes.compositeTextSizes[1].evaluate(feature, {})
            ];
            if (textSizeData[0] > MAX_PACKED_SIZE || textSizeData[1] > MAX_PACKED_SIZE) {
                console.warn(bucket.layerIds[0] + ": Value for \"text-size\" is >= 256. Reduce your \"text-size\".");
            }
        }
        bucket.addSymbols(bucket.text, glyphQuads, textSizeData, textOffset, textAlongLine,
            feature, writingMode, anchor, lineArray.lineStartIndex, lineArray.lineLength);

        for (var i = 0, list = placementTypes; i < list.length; i += 1) {
            var placementType = list[i];
            placedTextSymbolIndices[placementType] = bucket.text.placedSymbolArray.length - 1;
        }
        return glyphQuads.length * 4;
    }

    /**
     * @private
     * @param bucket
     * @param anchor
     * @param line
     * @param shapedTextOrientations
     * @param shapedIcon
     * @param layer
     * @param collisionBoxArray
     * @param featureIndex
     * @param sourceLayerIndex
     * @param bucketIndex
     * @param textBoxScale
     * @param textPadding
     * @param textAlongLine
     * @param textOffset
     * @param iconBoxScale
     * @param iconPadding
     * @param iconAlongLine
     * @param iconOffset
     * @param feature
     * @param glyphPositionMap
     * @param sizes
     */
    function addSymbol(bucket, anchor, line, shapedTextOrientations, shapedIcon, layer, collisionBoxArray, featureIndex, sourceLayerIndex, bucketIndex, textBoxScale, textPadding, textAlongLine, textOffset,
                       iconBoxScale, iconPadding, iconAlongLine, iconOffset, feature, glyphPositionMap, sizes) {
        var lineArray = bucket.addToLineVertexArray(anchor, line);
        var textCollisionFeature, iconCollisionFeature;
        var numIconVertices = 0;
        var numHorizontalGlyphVertices = 0;
        var numVerticalGlyphVertices = 0;
        var placedTextSymbolIndices = {};
        var key = murmurhashJs.murmur3('');
        var radialTextOffset = (layer.layout.get('text-radial-offset').evaluate(feature, {}) || 0) * ONE_EM;
        for (var justification in shapedTextOrientations.horizontal) {
            var shaping = shapedTextOrientations.horizontal[justification];
            if (!textCollisionFeature) {
                key = murmurhashJs.murmur3(shaping.text);
                var textRotate = layer.layout.get('text-rotate').evaluate(feature, {});
                textCollisionFeature = new CollisionFeature(collisionBoxArray, line, anchor, featureIndex, sourceLayerIndex, bucketIndex, shaping, textBoxScale, textPadding, textAlongLine, bucket.overscaling, textRotate);
            }
            var singleLine = shaping.lineCount === 1;
            numHorizontalGlyphVertices += addTextVertices(bucket, anchor, shaping, layer, textAlongLine, feature, textOffset, lineArray,
                shapedTextOrientations.vertical ? WritingMode.horizontal : WritingMode.horizontalOnly,
                singleLine ? (Object.keys(shapedTextOrientations.horizontal)) : [justification], placedTextSymbolIndices, glyphPositionMap, sizes);
            if (singleLine) {
                break;
            }
        }

        if (shapedTextOrientations.vertical) {
            numVerticalGlyphVertices += addTextVertices(bucket, anchor, shapedTextOrientations.vertical, layer, textAlongLine, feature,
                textOffset, lineArray, WritingMode.vertical, ['vertical'], placedTextSymbolIndices, glyphPositionMap, sizes);
        }
        var textBoxStartIndex = textCollisionFeature ? textCollisionFeature.boxStartIndex : bucket.collisionBoxArray.length;
        var textBoxEndIndex = textCollisionFeature ? textCollisionFeature.boxEndIndex : bucket.collisionBoxArray.length;
        if (shapedIcon) {
            var iconQuads = quads.getIconQuads(anchor, shapedIcon, layer, iconAlongLine, getDefaultHorizontalShaping(shapedTextOrientations.horizontal), feature);
            var iconRotate = layer.layout.get('icon-rotate').evaluate(feature, {});
            iconCollisionFeature = new CollisionFeature(collisionBoxArray, line, anchor, featureIndex, sourceLayerIndex, bucketIndex, shapedIcon, iconBoxScale, iconPadding, false, bucket.overscaling, iconRotate);
            numIconVertices = iconQuads.length * 4;
            var sizeData = bucket.iconSizeData;
            var iconSizeData = null;
            if (sizeData.kind === 'source') {
                iconSizeData = [
                    symbolSize.SIZE_PACK_FACTOR * layer.layout.get('icon-size').evaluate(feature, {})
                ];
                if (iconSizeData[0] > MAX_PACKED_SIZE) {
                    console.warn(bucket.layerIds[0] + ": Value for \"icon-size\" is >= 256. Reduce your \"icon-size\".");
                }
            } else if (sizeData.kind === 'composite') {
                iconSizeData = [
                    symbolSize.SIZE_PACK_FACTOR * sizes.compositeIconSizes[0].evaluate(feature, {}),
                    symbolSize.SIZE_PACK_FACTOR * sizes.compositeIconSizes[1].evaluate(feature, {})
                ];
                if (iconSizeData[0] > MAX_PACKED_SIZE || iconSizeData[1] > MAX_PACKED_SIZE) {
                    console.warn(bucket.layerIds[0] + ": Value for \"icon-size\" is >= 256. Reduce your \"icon-size\".");
                }
            }
            bucket.addSymbols(bucket.icon, iconQuads, iconSizeData, iconOffset, iconAlongLine,
                feature, false, anchor, lineArray.lineStartIndex, lineArray.lineLength);
        }
        var iconBoxStartIndex = iconCollisionFeature ? iconCollisionFeature.boxStartIndex : bucket.collisionBoxArray.length;
        var iconBoxEndIndex = iconCollisionFeature ? iconCollisionFeature.boxEndIndex : bucket.collisionBoxArray.length;
        if (bucket.glyphOffsetArray.length >= Constant.MAX_GLYPHS) {
            console.warn("Too many glyphs being rendered in a tile");
        }
        bucket.symbolInstances.emplaceBack(anchor.x, anchor.y,
            placedTextSymbolIndices.right >= 0 ? placedTextSymbolIndices.right : -1,
            placedTextSymbolIndices.center >= 0 ? placedTextSymbolIndices.center : -1,
            placedTextSymbolIndices.left >= 0 ? placedTextSymbolIndices.left : -1,
            placedTextSymbolIndices.vertical || -1,
            key,
            textBoxStartIndex,
            textBoxEndIndex,
            iconBoxStartIndex,
            iconBoxEndIndex,
            featureIndex,
            numHorizontalGlyphVertices,
            numVerticalGlyphVertices,
            numIconVertices,
            0,
            textBoxScale,
            radialTextOffset);
    }

    /**
     * 处理Symbol类型的数据
     * @private
     * @param bucket SymbolBucket
     * @param glyphMap 字体Map
     * @param glyphPositions 字体的位置
     * @param imageMap 图像Map
     * @param imagePositions 图像的位置
     * @param showCollisionBoxes 是否展示碰撞盒
     */
    function performSymbolLayout(bucket, glyphMap, glyphPositions, imageMap, imagePositions, showCollisionBoxes) {
        bucket.createArrays();
        const tileSize = 512 * bucket.overscaling;
        bucket.tilePixelRatio = EXTENT / tileSize;
        bucket.compareText = {};
        bucket.iconsNeedLinear = false;

        var layout = bucket.layers[0].layout;
        var unevaluatedLayoutValues = bucket.layers[0]._unevaluatedLayout._values;
        var sizes = {};

        if (bucket.textSizeData.kind === 'composite') {
            var ref = bucket.textSizeData;
            var minZoom = ref.minZoom;
            var maxZoom = ref.maxZoom;
            sizes.compositeTextSizes = [
                unevaluatedLayoutValues['text-size'].possiblyEvaluate(new EvaluationParameters(minZoom)),
                unevaluatedLayoutValues['text-size'].possiblyEvaluate(new EvaluationParameters(maxZoom))
            ];
        }

        if (bucket.iconSizeData.kind === 'composite') {
            var ref$1 = bucket.iconSizeData;
            var minZoom$1 = ref$1.minZoom;
            var maxZoom$1 = ref$1.maxZoom;
            sizes.compositeIconSizes = [
                unevaluatedLayoutValues['icon-size'].possiblyEvaluate(new EvaluationParameters(minZoom$1)),
                unevaluatedLayoutValues['icon-size'].possiblyEvaluate(new EvaluationParameters(maxZoom$1))
            ];
        }

        sizes.layoutTextSize = unevaluatedLayoutValues['text-size'].possiblyEvaluate(new EvaluationParameters(bucket.zoom + 1));
        sizes.layoutIconSize = unevaluatedLayoutValues['icon-size'].possiblyEvaluate(new EvaluationParameters(bucket.zoom + 1));
        sizes.textMaxSize = unevaluatedLayoutValues['text-size'].possiblyEvaluate(new EvaluationParameters(18));

        var lineHeight = layout.get('text-line-height') * ONE_EM;
        var textAlongLine = layout.get('text-rotation-alignment') === 'map' && layout.get('symbol-placement') !== 'point';
        var keepUpright = layout.get('text-keep-upright');

        for (var i$1 = 0, list = bucket.features; i$1 < list.length; i$1 += 1) {
            var feature = list[i$1];
            var fontstack = layout.get('text-font').evaluate(feature, {}).join(',');
            var glyphPositionMap = glyphPositions;
            var shapedTextOrientations = {
                horizontal: {},
                vertical: undefined
            };
            var text = feature.text;
            var textOffset = [0, 0];
            if (text) {
                var unformattedText = text.toString(); // 文本内容
                var spacing = layout.get('text-letter-spacing').evaluate(feature, {}) * ONE_EM;
                var spacingIfAllowed = scriptDetection.allowsLetterSpacing(unformattedText) ? spacing : 0;

                var textAnchor = layout.get('text-anchor').evaluate(feature, {});
                var variableTextAnchor = layout.get('text-variable-anchor');
                var radialOffset = layout.get('text-radial-offset').evaluate(feature, {});

                if (!variableTextAnchor) {
                    if (radialOffset) {
                        // 当text-offset和text-radial-offset一起配置时, 使用radial offset
                        textOffset = evaluateRadialOffset(textAnchor, radialOffset * ONE_EM);
                    } else {
                        textOffset = (layout.get('text-offset').evaluate(feature, {}).map(function (t) {
                            return t * ONE_EM;
                        }));
                    }
                }

                var textJustify = textAlongLine ? "center" : layout.get('text-justify').evaluate(feature, {});
                var maxWidth = layout.get('symbol-placement') === 'point' ? layout.get('text-max-width').evaluate(feature, {}) * ONE_EM : 0;
                if (!textAlongLine && variableTextAnchor) {
                    var justifications = textJustify === "auto" ?
                        variableTextAnchor.map(function (a) {
                            return getAnchorJustification(a);
                        }) : [textJustify];

                    var singleLine = false;
                    for (var i = 0; i < justifications.length; i++) {
                        var justification = justifications[i];
                        if (shapedTextOrientations.horizontal[justification]) {
                            continue;
                        }
                        if (singleLine) {
                            shapedTextOrientations.horizontal[justification] = shapedTextOrientations.horizontal[0];
                        } else {
                            var shaping = shapingUtils.shapeText(text, glyphMap, fontstack, maxWidth, lineHeight, 'center', justification, spacingIfAllowed, textOffset, WritingMode.horizontal);
                            if (shaping) {
                                shapedTextOrientations.horizontal[justification] = shaping;
                                singleLine = shaping.lineCount === 1;
                            }
                        }
                    }
                } else {
                    if (textJustify === "auto") {
                        textJustify = getAnchorJustification(textAnchor);
                    }
                    var shaping$1 = shapingUtils.shapeText(text, glyphMap, fontstack, maxWidth, lineHeight, textAnchor, textJustify, spacingIfAllowed, textOffset, WritingMode.horizontal);
                    if (shaping$1) {
                        shapedTextOrientations.horizontal[textJustify] = shaping$1;
                    }

                    if (scriptDetection.allowsVerticalWritingMode(unformattedText) && textAlongLine && keepUpright) {
                        shapedTextOrientations.vertical = shapingUtils.shapeText(text, glyphMap, fontstack, maxWidth, lineHeight, textAnchor, textJustify,
                            spacingIfAllowed, textOffset, WritingMode.vertical);
                    }
                }
            }

            var shapedIcon = (void 0);
            if (feature.icon) {
                var image = imageMap[feature.icon];
                if (image) {
                    shapedIcon = shapingUtils.shapeIcon(imagePositions[feature.icon], layout.get('icon-offset').evaluate(feature, {}), layout.get('icon-anchor').evaluate(feature, {}));
                    if (bucket.sdfIcons === undefined) {
                        bucket.sdfIcons = image.sdf;
                    } else if (bucket.sdfIcons !== image.sdf) {
                        console.warn('Style sheet warning: Cannot mix SDF and non-SDF icons in one buffer');
                    }
                    if (image.pixelRatio !== bucket.pixelRatio) {
                        bucket.iconsNeedLinear = true;
                    } else if (layout.get('icon-rotate').constantOr(1) !== 0) {
                        bucket.iconsNeedLinear = true;
                    }
                }
            }
            if (Object.keys(shapedTextOrientations.horizontal).length || shapedIcon) {
                addFeature(bucket, feature, shapedTextOrientations, shapedIcon, glyphPositionMap, sizes, textOffset);
            }
        }

        if (showCollisionBoxes) {
            bucket.generateCollisionDebugBuffers();
        }
    }
    exports.performSymbolLayout = performSymbolLayout;
})