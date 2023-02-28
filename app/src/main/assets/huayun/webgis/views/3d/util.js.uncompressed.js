define("com/huayun/webgis/views/3d/util", [
    "exports",
    "com/huayun/webgis/data/TaggedString",
    "com/huayun/webgis/gl/CollisionFeature"
], function (exports, TaggedString, CollisionFeature) {

    var WritingMode = {
        horizontal: 1,
        vertical: 2,
        horizontalOnly: 3
    };

    function align$1(positionedGlyphs,
                     justify,
                     horizontalAlign,
                     verticalAlign,
                     maxLineLength,
                     lineHeight,
                     lineCount) {
        var shiftX = (justify - horizontalAlign) * maxLineLength;
        var shiftY = (-verticalAlign * lineCount + 0.5) * lineHeight;

        for (var j = 0; j < positionedGlyphs.length; j++) {
            positionedGlyphs[j].x += shiftX;
            positionedGlyphs[j].y += shiftY;
        }
    }

    function shapeLines(shaping,
                        glyphMap,
                        lines,
                        lineHeight,
                        textAnchor,
                        textJustify,
                        writingMode,
                        spacing) {
        var yOffset = -17;
        var x = 0;
        var y = yOffset;
        var maxLineLength = 0;
        var positionedGlyphs = shaping.positionedGlyphs;

        var justify = 0.5;

        for (var i$1 = 0, list = lines; i$1 < list.length; i$1 += 1) {
            var line = list[i$1];

            line.trim();

            var lineMaxScale = line.getMaxScale();

            if (!line.length()) {
                y += lineHeight; // Still need a line feed after empty line
                continue;
            }

            var lineStartIndex = positionedGlyphs.length;
            for (var i = 0; i < line.length(); i++) {
                var section = line.getSection(i);
                var codePoint = line.getCharCode(i);
                var baselineOffset = (lineMaxScale - section.scale) * 24;
                var positions = glyphMap[section.fontStack];
                var glyph = positions && positions[codePoint];

                if (!glyph) {
                    continue;
                }

                positionedGlyphs.push({
                    glyph: codePoint,
                    x: x,
                    y: y + baselineOffset,
                    vertical: false,
                    scale: section.scale,
                    fontStack: section.fontStack
                });
                x += glyph.metrics.advance * section.scale + spacing;
            }
            x = 0;
            y += lineHeight * lineMaxScale;
        }

        var horizontalAlign = 0.5;
        var verticalAlign = 0.5;
        align$1(positionedGlyphs, justify, horizontalAlign, verticalAlign, maxLineLength, lineHeight, lines.length);

        // Calculate the bounding box
        var height = y - yOffset;

        shaping.top += -verticalAlign * height;
        shaping.bottom = shaping.top + height;
        shaping.left += -horizontalAlign * maxLineLength;
        shaping.right = shaping.left + maxLineLength;
    }

    function shapeText(text, glyphs, defaultFontStack, maxWidth,
                       lineHeight,
                       textAnchor,
                       textJustify,
                       spacing,
                       translate,
                       writingMode) {
        var logicalInput = TaggedString.fromFeature(text, defaultFontStack);

        if (writingMode === WritingMode.vertical) {
            logicalInput.verticalizePunctuation();
        }

        var lines = [logicalInput];

        var positionedGlyphs = [];
        var shaping = {
            positionedGlyphs: positionedGlyphs,
            text: logicalInput.toString(),
            top: translate[1],
            bottom: translate[1],
            left: translate[0],
            right: translate[0],
            writingMode: writingMode,
            lineCount: lines.length
        };

        shapeLines(shaping, glyphs, lines, lineHeight, textAnchor, textJustify, writingMode, spacing);
        return shaping;
    }

    function murmurhashJs(key, seed) {
        var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

        remainder = key.length & 3; // key.length % 4
        bytes = key.length - remainder;
        h1 = seed;
        c1 = 0xcc9e2d51;
        c2 = 0x1b873593;
        i = 0;

        while (i < bytes) {
            k1 =
                ((key.charCodeAt(i) & 0xff)) |
                ((key.charCodeAt(++i) & 0xff) << 8) |
                ((key.charCodeAt(++i) & 0xff) << 16) |
                ((key.charCodeAt(++i) & 0xff) << 24);
            ++i;

            k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

            h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
            h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
            h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
        }

        k1 = 0;

        switch (remainder) {
            case 3:
                k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
            case 2:
                k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
            case 1:
                k1 ^= (key.charCodeAt(i) & 0xff);

                k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
                h1 ^= k1;
        }

        h1 ^= key.length;

        h1 ^= h1 >>> 16;
        h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
        h1 ^= h1 >>> 16;

        return h1 >>> 0;
    }

    function addTextVertices(bucket,
                             anchor,
                             shapedText,
                             textAlongLine,
                             feature,
                             textOffset,
                             lineArray,
                             writingMode,
                             placementTypes,
                             placedTextSymbolIndices,
                             glyphPositionMap) {
        var glyphQuads = getGlyphQuads(anchor, shapedText, textOffset, textAlongLine, feature, glyphPositionMap);

        var sizeData = {
            kind: "constant",
            layoutSize: 18
        };
        var textSizeData = null;

        if (sizeData.kind === 'source') {
        } else if (sizeData.kind === 'composite') {
            textSizeData = [
                4608,
                4608
            ];
            if (textSizeData[0] > MAX_PACKED_SIZE || textSizeData[1] > MAX_PACKED_SIZE) {
                console.log("Value for \"text-size\" is >= 256. Reduce your \"text-size\".");
            }
        }

        bucket.addSymbols(
            bucket.text,
            glyphQuads,
            textSizeData,
            textOffset,
            textAlongLine,
            feature,
            writingMode,
            anchor,
            lineArray.lineStartIndex,
            lineArray.lineLength);

        // The placedSymbolArray is used at render time in drawTileSymbols
        // These indices allow access to the array at collision detection time
        for (var i = 0, list = placementTypes; i < list.length; i += 1) {
            var placementType = list[i];

            placedTextSymbolIndices[placementType] = bucket.text.placedSymbolArray.length - 1;
        }

        return glyphQuads.length * 4;
    }

    function addSymbol(bucket,
                       anchor,
                       line,
                       shapedTextOrientations,
                       shapedIcon,
                       collisionBoxArray,
                       featureIndex,
                       sourceLayerIndex,
                       bucketIndex,
                       textBoxScale,
                       textPadding,
                       textAlongLine,
                       textOffset,
                       iconBoxScale,
                       iconPadding,
                       iconAlongLine,
                       iconOffset,
                       feature,
                       glyphPositionMap,
                       sizes) {
        var lineArray = {
            lineStartIndex: 0,
            lineLength: 0
        };

        var textCollisionFeature, iconCollisionFeature;

        var numIconVertices = 0;
        var numHorizontalGlyphVertices = 0;
        var numVerticalGlyphVertices = 0;
        var placedTextSymbolIndices = {};
        var key = murmurhashJs('');
        var radialTextOffset = 0;

        for (var justification      in shapedTextOrientations.horizontal) {
            var shaping = shapedTextOrientations.horizontal[justification];

            if (!textCollisionFeature) {
                key = murmurhashJs(shaping.text);
                var textRotate = 0;
                // As a collision approximation, we can use either the vertical or any of the horizontal versions of the feature
                // We're counting on all versions having similar dimensions
                textCollisionFeature = new CollisionFeature(collisionBoxArray, line, anchor, featureIndex, sourceLayerIndex, bucketIndex, shaping, textBoxScale, textPadding, textAlongLine, bucket.overscaling, textRotate);
            }

            numHorizontalGlyphVertices += addTextVertices(
                bucket, anchor, shaping, textAlongLine, feature, textOffset, lineArray,
                shapedTextOrientations.vertical ? WritingMode.horizontal : WritingMode.horizontalOnly,
                singleLine ? (Object.keys(shapedTextOrientations.horizontal)) : [justification],
                placedTextSymbolIndices, glyphPositionMap);

            break;
        }

        var textBoxStartIndex = textCollisionFeature ? textCollisionFeature.boxStartIndex : bucket.collisionBoxArray.length;
        var textBoxEndIndex = textCollisionFeature ? textCollisionFeature.boxEndIndex : bucket.collisionBoxArray.length;

        bucket.symbolInstances.emplaceBack(
            anchor.x,
            anchor.y,
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

    function addFeature(bucket,
                        feature,
                        shapedTextOrientations,
                        shapedIcon,
                        glyphPositionMap,
                        sizes,
                        textOffset) {
        var layoutTextSize = 12;
        var textMaxSize = 12;

        var defaultHorizontalShaping = shapedTextOrientations.horizontal.center;
        var glyphSize = 24,
            fontScale = layoutTextSize / glyphSize,
            textBoxScale = bucket.tilePixelRatio * fontScale,
            textMaxBoxScale = bucket.tilePixelRatio * textMaxSize / glyphSize,
            symbolMinDistance = bucket.tilePixelRatio * 250,
            textPadding = 2 * bucket.tilePixelRatio,
            textMaxAngle = 45 / 180 * Math.PI,
            textAlongLine = false,
            symbolPlacement = "point",
            textRepeatDistance = symbolMinDistance / 2;

        var addSymbolAtAnchor = function (line, anchor) {
            addSymbol(bucket, anchor, line, shapedTextOrientations, shapedIcon,
                bucket.collisionBoxArray, feature.index, feature.sourceLayerIndex, bucket.index,
                textBoxScale, textPadding, textAlongLine, textOffset,
                iconBoxScale, iconPadding, iconAlongLine, iconOffset,
                feature, glyphPositionMap, sizes);
        };

        for (var i$6 = 0, list$6 = feature.geometry; i$6 < list$6.length; i$6 += 1) {
            var points = list$6[i$6];

            for (var i$5 = 0, list$5 = points; i$5 < list$5.length; i$5 += 1) {
                var point = list$5[i$5];

                addSymbolAtAnchor([point], new Anchor(point.x, point.y, 0));
            }
        }
    }

    exports.performSymbolLayout = function (bucket, glyphMap, glyphPositions, imageMap, imagePositions, showCollisionBoxes) {
        bucket.createArrays();
        bucket.tilePixelRatio = 16;
        bucket.compareText = {};
        bucket.iconsNeedLinear = false;


        var sizes = {};

        sizes.layoutTextSize = 12;
        sizes.textMaxSize = 12;
        var lineHeight = 28.8;
        var textAlongLine = false;
        var keepUpright = true;

        for (var i$1 = 0, list = bucket.features; i$1 < list.length; i$1 += 1) {
            var feature = list[i$1];

            var fontstack = "DIN Offc Pro Medium,Arial Unicode MS Regular";
            var glyphPositionMap = glyphPositions;

            var shapedTextOrientations = {
                horizontal: {},
                vertical: undefined
            };
            var text = feature.text;
            var textOffset = [0, 0];
            if (text) {
                var unformattedText = text.toString();
                var spacing = 0;
                var spacingIfAllowed = 0;

                var textAnchor = "center";
                var variableTextAnchor = undefined;
                var radialOffset = 0;

                textOffset = [0, 0];

                var textJustify = "center";

                var maxWidth = 240;

                var shaping$1 = shapeText(text, glyphMap, fontstack, maxWidth, lineHeight, textAnchor, textJustify, spacingIfAllowed,
                    textOffset, WritingMode.horizontal);
                if (shaping$1) {
                    shapedTextOrientations.horizontal[textJustify] = shaping$1;
                }
            }

            if (Object.keys(shapedTextOrientations.horizontal).length) {
                addFeature(bucket, feature, shapedTextOrientations, (void 0), glyphPositionMap, sizes, textOffset);
            }
        }

        if (showCollisionBoxes) {
            bucket.generateCollisionDebugBuffers();
        }
    }
});