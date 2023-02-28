define("com/huayun/webgis/utils/quads", [
    "exports",
    "./parseGlyphPbf",
    "../geometry/Point"
], function (exports, parseGlyphPbf, Point) {
    function getGlyphQuads(anchor, shaping, textOffset, layer, alongLine, feature, positions) {
        var textRotate = layer.layout.get('text-rotate').evaluate(feature, {}) * Math.PI / 180;
        var positionedGlyphs = shaping.positionedGlyphs;
        var quads = [];
        for (var k = 0; k < positionedGlyphs.length; k++) {
            var positionedGlyph = positionedGlyphs[k];
            var glyphPositions = positions[positionedGlyph.fontStack];
            var glyph = glyphPositions && glyphPositions[positionedGlyph.glyph];
            if (!glyph) {
                continue;
            }
            var rect = glyph.rect;
            if (!rect) {
                continue;
            }
            var glyphPadding = 1.0;
            var rectBuffer = parseGlyphPbf.GLYPH_PBF_BORDER + glyphPadding;
            var halfAdvance = glyph.metrics.advance * positionedGlyph.scale / 2;
            var glyphOffset = alongLine ? [positionedGlyph.x + halfAdvance, positionedGlyph.y] : [0, 0];
            var builtInOffset = alongLine ? [0, 0] : [positionedGlyph.x + halfAdvance + textOffset[0], positionedGlyph.y + textOffset[1]];
            var x1 = (glyph.metrics.left - rectBuffer) * positionedGlyph.scale - halfAdvance + builtInOffset[0];
            var y1 = (-glyph.metrics.top - rectBuffer) * positionedGlyph.scale + builtInOffset[1];
            var x2 = x1 + rect.w * positionedGlyph.scale;
            var y2 = y1 + rect.h * positionedGlyph.scale;
            var tl = new Point(x1, y1);
            var tr = new Point(x2, y1);
            var bl = new Point(x1, y2);
            var br = new Point(x2, y2);
            if (alongLine && positionedGlyph.vertical) {
                var center = new Point(-halfAdvance, halfAdvance);
                var verticalRotation = -Math.PI / 2;
                var xOffsetCorrection = new Point(5, 0);
                tl._rotateAround(verticalRotation, center)._add(xOffsetCorrection);
                tr._rotateAround(verticalRotation, center)._add(xOffsetCorrection);
                bl._rotateAround(verticalRotation, center)._add(xOffsetCorrection);
                br._rotateAround(verticalRotation, center)._add(xOffsetCorrection);
            }
            if (textRotate) {
                var sin = Math.sin(textRotate),
                    cos = Math.cos(textRotate),
                    matrix = [cos, -sin, sin, cos];
                tl._matMult(matrix);
                tr._matMult(matrix);
                bl._matMult(matrix);
                br._matMult(matrix);
            }
            quads.push({
                tl: tl,
                tr: tr,
                bl: bl,
                br: br,
                tex: rect,
                writingMode: shaping.writingMode,
                glyphOffset: glyphOffset
            });
        }
        return quads;
    }

    function getIconQuads(anchor, shapedIcon, layer, alongLine, shapedText, feature) {
        var image = shapedIcon.image;
        var layout = layer.layout;
        var border = 1;
        var top = shapedIcon.top - border / image.pixelRatio;
        var left = shapedIcon.left - border / image.pixelRatio;
        var bottom = shapedIcon.bottom + border / image.pixelRatio;
        var right = shapedIcon.right + border / image.pixelRatio;
        var tl, tr, br, bl;
        if (layout.get('icon-text-fit') !== 'none' && shapedText) {
            var iconWidth = (right - left),
                iconHeight = (bottom - top),
                size = layout.get('text-size').evaluate(feature, {}) / 24,
                textLeft = shapedText.left * size,
                textRight = shapedText.right * size,
                textTop = shapedText.top * size,
                textBottom = shapedText.bottom * size,
                textWidth = textRight - textLeft,
                textHeight = textBottom - textTop,
                padT = layout.get('icon-text-fit-padding')[0],
                padR = layout.get('icon-text-fit-padding')[1],
                padB = layout.get('icon-text-fit-padding')[2],
                padL = layout.get('icon-text-fit-padding')[3],
                offsetY = layout.get('icon-text-fit') === 'width' ? (textHeight - iconHeight) * 0.5 : 0,
                offsetX = layout.get('icon-text-fit') === 'height' ? (textWidth - iconWidth) * 0.5 : 0,
                width = layout.get('icon-text-fit') === 'width' || layout.get('icon-text-fit') === 'both' ? textWidth : iconWidth,
                height = layout.get('icon-text-fit') === 'height' || layout.get('icon-text-fit') === 'both' ? textHeight : iconHeight;
            tl = new Point(textLeft + offsetX - padL, textTop + offsetY - padT);
            tr = new Point(textLeft + offsetX + padR + width, textTop + offsetY - padT);
            br = new Point(textLeft + offsetX + padR + width, textTop + offsetY + padB + height);
            bl = new Point(textLeft + offsetX - padL, textTop + offsetY + padB + height);
        } else {
            tl = new Point(left, top);
            tr = new Point(right, top);
            br = new Point(right, bottom);
            bl = new Point(left, bottom);
        }
        var angle = layer.layout.get('icon-rotate').evaluate(feature, {}) * Math.PI / 180;
        if (angle) {
            var sin = Math.sin(angle),
                cos = Math.cos(angle),
                matrix = [cos, -sin, sin, cos];
            tl._matMult(matrix);
            tr._matMult(matrix);
            bl._matMult(matrix);
            br._matMult(matrix);
        }
        return [{tl: tl, tr: tr, bl: bl, br: br, tex: image.paddedRect, writingMode: undefined, glyphOffset: [0, 0]}];
    }

    exports.getGlyphQuads = getGlyphQuads;
    exports.getIconQuads = getIconQuads;
})