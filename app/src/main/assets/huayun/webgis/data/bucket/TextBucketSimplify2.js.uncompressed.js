define("com/huayun/webgis/data/bucket/TextBucketSimplify2", [
    "../ArrayType",
    "../../gl/SegmentVector",
    "../../geometry/Anchor",
    "../../geometry/Point2D",
    "../../gl/TaggedString"
], function (ArrayType, SegmentVector, Anchor, Point, TaggedString) {
    var SHAPING_DEFAULT_OFFSET = -28;
    var ONE_EM = 96;
    var GLYPH_PBF_BORDER = 0;
    var WritingMode = {
        horizontal: 1,
        vertical: 2,
        horizontalOnly: 3
    };


    function addVertex$1(array, anchorX, anchorY, ox, oy, tx, ty) {
        array.emplaceBack(
            anchorX,
            anchorY, // a_pos
            Math.round(ox * 32),
            Math.round(oy * 32),
            tx, // x coordinate of symbol on glyph atlas texture
            ty // y coordinate of symbol on glyph atlas texture // a_pos_offset
        );
    }

    function justifyLine(positionedGlyphs, start, end, justify, lineOffset) {
        if (!justify && !lineOffset) {
            return;
        }
        var lastPositionedGlyph = positionedGlyphs[end];
        var lastAdvance = lastPositionedGlyph.metrics.advance * lastPositionedGlyph.scale;
        var lineIndent = (positionedGlyphs[end].x + lastAdvance) * justify;
        for (var j = start; j <= end; j++) {
            positionedGlyphs[j].x -= lineIndent;
            positionedGlyphs[j].y += lineOffset;
        }
    }

    function align$1(positionedLines, justify, horizontalAlign, verticalAlign, maxLineLength, maxLineHeight,
                     lineHeight, blockHeight, lineCount) {
        var shiftX = (justify - horizontalAlign) * maxLineLength;
        var shiftY = 0;
        if (maxLineHeight !== lineHeight) {
            shiftY = -blockHeight * verticalAlign - SHAPING_DEFAULT_OFFSET;
        } else {
            shiftY = (-verticalAlign * lineCount + 0.5) * lineHeight;
        }
        for (var i$1 = 0, list$1 = positionedLines; i$1 < list$1.length; i$1 += 1) {
            var line = list$1[i$1];
            for (var i = 0, list = line.positionedGlyphs; i < list.length; i += 1) {
                var positionedGlyph = list[i];
                positionedGlyph.x += shiftX;
                positionedGlyph.y += shiftY;
            }
        }
    }

    function shapeLines(shaping, glyphMap, glyphPositions, lines, lineHeight, spacing) {
        var x = 0;
        var y = SHAPING_DEFAULT_OFFSET;
        var maxLineLength = 0;
        var maxLineHeight = 0;
        var justify = 0.5;
        var lineIndex = 0;
        for (var i$1 = 0, list = lines; i$1 < list.length; i$1 += 1) {
            var line = list[i$1];
            var lineMaxScale = 1;
            var maxLineOffset = 0;
            var positionedLine = {positionedGlyphs: [], lineOffset: 0};
            shaping.positionedLines[lineIndex] = positionedLine;
            var positionedGlyphs = positionedLine.positionedGlyphs;
            var lineOffset = 0.0;
            if (!line.length()) {
                y += lineHeight;
                ++lineIndex;
                continue;
            }
            for (var i = 0; i < line.length(); i++) {
                var section = line.getSection(i);
                var sectionIndex = line.getSectionIndex(i);
                var codePoint = line.getCharCode(i);
                var baselineOffset = 0.0;
                var metrics = null;
                var rect = null;
                var imageName = null;
                var vertical = false;

                var positions = glyphPositions[section.fontStack];
                var glyphPosition = positions && positions[codePoint];
                if (glyphPosition && glyphPosition.rect) {
                    rect = glyphPosition.rect;
                    metrics = glyphPosition.metrics;
                }
                baselineOffset = (lineMaxScale - section.scale) * ONE_EM;
                positionedGlyphs.push({
                    glyph: codePoint,
                    imageName: imageName,
                    x: x,
                    y: y + baselineOffset,
                    vertical: vertical,
                    scale: section.scale,
                    fontStack: section.fontStack,
                    sectionIndex: sectionIndex,
                    metrics: metrics,
                    rect: rect
                });
                x += metrics.advance * section.scale + spacing;
            }

            if (positionedGlyphs.length !== 0) {
                var lineLength = x - spacing;
                maxLineLength = Math.max(lineLength, maxLineLength);
                justifyLine(positionedGlyphs, 0, positionedGlyphs.length - 1, justify, lineOffset);
            }

            x = 0;
            var currentLineHeight = lineHeight * lineMaxScale + lineOffset;
            positionedLine.lineOffset = Math.max(lineOffset, maxLineOffset);
            y += currentLineHeight;
            maxLineHeight = Math.max(currentLineHeight, maxLineHeight);
            ++lineIndex;
        }

        var height = y - SHAPING_DEFAULT_OFFSET;
        var horizontalAlign = 0.5;
        var verticalAlign = 0.5;
        align$1(shaping.positionedLines, justify, horizontalAlign, verticalAlign, maxLineLength, maxLineHeight, lineHeight, height, lines.length);
        shaping.top += -verticalAlign * height;
        shaping.bottom = shaping.top + height;
        shaping.left += -horizontalAlign * maxLineLength;
        shaping.right = shaping.left + maxLineLength;
    }

    function shapeText(text, fontFamily, glyphMap, glyphPositions, lineHeight, spacing, writingMode, translate) {
        var logicalInput = TaggedString.fromFeature({
            sections: [
                {
                    fontStack: fontFamily,
                    scale: null,
                    text: text
                }
            ],
            toString: function () {
                return this.sections[0].text;
            }
        }, fontFamily);
        var lines = [logicalInput];
        var positionedLines = [];
        var shaping = {
            positionedLines: positionedLines,
            text: logicalInput.toString(),
            top: translate[1],
            bottom: translate[1],
            left: translate[0],
            right: translate[0],
            writingMode: writingMode,
            iconsInText: false,
            verticalizable: false
        };
        shapeLines(shaping, glyphMap, glyphPositions, lines, lineHeight, spacing);
        return shaping;
    }

    function getGlyphQuads(anchor, shaping, textOffset) {
        var quads = [];
        for (var i$1 = 0, list$1 = shaping.positionedLines; i$1 < list$1.length; i$1 += 1) {
            var line = list$1[i$1];
            for (var i = 0, list = line.positionedGlyphs; i < list.length; i += 1) {
                var positionedGlyph = list[i];
                if (!positionedGlyph.rect) {
                    continue;
                }
                var textureRect = positionedGlyph.rect || {};
                var glyphPadding = 1.0;
                var rectBuffer = GLYPH_PBF_BORDER + glyphPadding;
                var pixelRatio = 1.0;
                var lineOffset = 0.0;
                var halfAdvance = positionedGlyph.metrics.advance * positionedGlyph.scale / 2;
                var builtInOffset = [positionedGlyph.x + halfAdvance + textOffset[0], positionedGlyph.y + textOffset[1]];
                var x1 = (positionedGlyph.metrics.left - rectBuffer) * positionedGlyph.scale - halfAdvance + builtInOffset[0];
                var y1 = (-positionedGlyph.metrics.top - rectBuffer) * positionedGlyph.scale + builtInOffset[1];
                var x2 = x1 + textureRect.w * positionedGlyph.scale / pixelRatio;
                var y2 = y1 + textureRect.h * positionedGlyph.scale / pixelRatio;
                var tl = new Point(x1, y1);
                var tr = new Point(x2, y1);
                var bl = new Point(x1, y2);
                var br = new Point(x2, y2);
                quads.push({
                    tl: tl,
                    tr: tr,
                    bl: bl,
                    br: br,
                    tex: textureRect,
                    isSDF: true
                });
            }
        }
        return quads;
    }

    var TextBucket = function TextBucket() {
        this.layoutVertexArray = new ArrayType.StructArrayLayout2f4ib16();
        this.indexArray = new ArrayType.StructArrayLayout3ui6();
        this.segments = new SegmentVector();
    };

    TextBucket.prototype.destroy = function destroy() {
        if (!this.layoutVertexBuffer) {
            return;
        }
        this.layoutVertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.segments.destroy();
    };

    TextBucket.prototype.addFeature = function (geometry, text, fontFamily, glyphMap, glyphPositions, offset) {
        var lineHeight = 96;
        var shapedTextOrientations = {
            horizontal: {},
            vertical: undefined
        };
        var spacingIfAllowed = 0.24;
        var textJustify = "center";
        offset = offset.map(function (t) {
            return t * 24;
        });
        var shaping$1 = shapeText(text, fontFamily, glyphMap, glyphPositions, lineHeight, spacingIfAllowed, WritingMode.horizontal, offset);
        if (shaping$1) {
            shapedTextOrientations.horizontal[textJustify] = shaping$1;
        }

        for (var i = 0; i < geometry.length; i++) {
            var points = geometry[i];
            for (var j = 0; j < points.length; j++) {
                var point = points[i];
                var anchor = new Anchor(point.x, point.y, 0);
                var shaping = shapedTextOrientations.horizontal.center;
                var glyphQuads = getGlyphQuads(anchor, shaping, offset);
                this.addSymbols(glyphQuads, anchor);
            }
        }
    };

    TextBucket.prototype.addSymbols = function addSymbols(quads, labelAnchor) {
        var indexArray = this.indexArray;
        var layoutVertexArray = this.layoutVertexArray;
        var segment = this.segments.prepareSegment(4 * quads.length, this.layoutVertexArray, this.indexArray);

        for (var i = 0, list = quads; i < list.length; i += 1) {
            var symbol = list[i];
            var tl = symbol.tl, tr = symbol.tr, bl = symbol.bl, br = symbol.br, tex = symbol.tex;
            var index = segment.vertexLength;
            addVertex$1(layoutVertexArray, labelAnchor.x, labelAnchor.y, tl.x, tl.y, tex.x, tex.y);
            addVertex$1(layoutVertexArray, labelAnchor.x, labelAnchor.y, tr.x, tr.y, tex.x + tex.w, tex.y);
            addVertex$1(layoutVertexArray, labelAnchor.x, labelAnchor.y, bl.x, bl.y, tex.x, tex.y + tex.h);
            addVertex$1(layoutVertexArray, labelAnchor.x, labelAnchor.y, br.x, br.y, tex.x + tex.w, tex.y + tex.h);
            indexArray.emplaceBack(index, index + 1, index + 2);
            indexArray.emplaceBack(index + 1, index + 2, index + 3);
            segment.vertexLength += 4;
            segment.primitiveLength += 2;
        }
    };

    TextBucket.prototype.upload = function upload(context) {
        this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, [
            {name: "a_pos", type: "Float32", components: 2, offset: 0},
            {name: "a_data", type: "Int16", components: 4, offset: 8}
        ]);
        this.indexBuffer = context.createIndexBuffer(this.indexArray);
    };

    return TextBucket;
});