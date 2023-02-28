define("com/huayun/webgis/utils/shaping", [
    "exports",
    "./verticalizePunctuation",
    "./rtlTextPlugin",
    "./scriptDetection",
    "./Constant"
], function (exports, verticalizePunctuation, rtlTextPlugin, scriptDetection, Constant) {

    var WritingMode = {
        horizontal: 1,
        vertical: 2,
        horizontalOnly: 3
    };

    var whitespace = {};
    whitespace[0x09] = true;
    whitespace[0x0a] = true;
    whitespace[0x0b] = true;
    whitespace[0x0c] = true;
    whitespace[0x0d] = true;
    whitespace[0x20] = true;

    var breakable = {};
    breakable[0x0a] = true;
    breakable[0x20] = true;
    breakable[0x26] = true;
    breakable[0x28] = true;
    breakable[0x29] = true;
    breakable[0x2b] = true;
    breakable[0x2d] = true;
    breakable[0x2f] = true;
    breakable[0xad] = true;
    breakable[0xb7] = true;
    breakable[0x200b] = true;
    breakable[0x2010] = true;
    breakable[0x2013] = true;
    breakable[0x2027] = true;

    var TaggedString = function TaggedString() {
        this.text = "";
        this.sectionIndex = [];
        this.sections = [];
    };

    TaggedString.fromFeature = function (text, defaultFontStack) {
        var result = new TaggedString();
        for (var i = 0; i < text.sections.length; i++) {
            var section = text.sections[i];
            result.sections.push({
                scale: section.scale || 1,
                fontStack: section.fontStack || defaultFontStack
            });
            result.text += section.text;
            for (var j = 0; j < section.text.length; j++) {
                result.sectionIndex.push(i);
            }
        }
        return result;
    };

    TaggedString.prototype.length = function () {
        return this.text.length;
    };

    TaggedString.prototype.getSection = function (index) {
        return this.sections[this.sectionIndex[index]];
    };

    TaggedString.prototype.getCharCode = function (index) {
        return this.text.charCodeAt(index);
    };

    TaggedString.prototype.verticalizePunctuation = function () {
        this.text = verticalizePunctuation(this.text);
    };

    TaggedString.prototype.trim = function trim() {
        var beginningWhitespace = 0;
        for (var i = 0; i < this.text.length && whitespace[this.text.charCodeAt(i)]; i++) {
            beginningWhitespace++;
        }
        var trailingWhitespace = this.text.length;
        for (var i$1 = this.text.length - 1; i$1 >= 0 && i$1 >= beginningWhitespace && whitespace[this.text.charCodeAt(i$1)]; i$1--) {
            trailingWhitespace--;
        }
        this.text = this.text.substring(beginningWhitespace, trailingWhitespace);
        this.sectionIndex = this.sectionIndex.slice(beginningWhitespace, trailingWhitespace);
    };

    TaggedString.prototype.substring = function substring(start, end) {
        var substring = new TaggedString();
        substring.text = this.text.substring(start, end);
        substring.sectionIndex = this.sectionIndex.slice(start, end);
        substring.sections = this.sections;
        return substring;
    };

    TaggedString.prototype.toString = function toString() {
        return this.text;
    };

    TaggedString.prototype.getMaxScale = function getMaxScale() {
        var this$1 = this;
        return this.sectionIndex.reduce(function (max, index) {
            return Math.max(max, this$1.sections[index].scale);
        }, 0);
    };

    function determineAverageLineWidth(logicalInput, spacing, maxWidth, glyphMap) {
        var totalWidth = 0;
        for (var index = 0; index < logicalInput.length(); index++) {
            var section = logicalInput.getSection(index);
            var positions = glyphMap[section.fontStack];
            var glyph = positions && positions[logicalInput.getCharCode(index)];
            if (!glyph) {
                continue;
            }
            totalWidth += glyph.metrics.advance * section.scale + spacing;
        }
        var lineCount = Math.max(1, Math.ceil(totalWidth / maxWidth));
        return totalWidth / lineCount;
    }

    function calculateBadness(lineWidth, targetWidth, penalty, isLastBreak) {
        var raggedness = Math.pow(lineWidth - targetWidth, 2);
        if (isLastBreak) {
            if (lineWidth < targetWidth) {
                return raggedness / 2;
            } else {
                return raggedness * 2;
            }
        }
        return raggedness + Math.abs(penalty) * penalty;
    }

    function evaluateBreak(breakIndex, breakX, targetWidth, potentialBreaks, penalty, isLastBreak) {
        var bestPriorBreak = null;
        var bestBreakBadness = calculateBadness(breakX, targetWidth, penalty, isLastBreak);

        for (var i = 0, list = potentialBreaks; i < list.length; i += 1) {
            var potentialBreak = list[i];
            var lineWidth = breakX - potentialBreak.x;
            var breakBadness = calculateBadness(lineWidth, targetWidth, penalty, isLastBreak) + potentialBreak.badness;
            if (breakBadness <= bestBreakBadness) {
                bestPriorBreak = potentialBreak;
                bestBreakBadness = breakBadness;
            }
        }
        return {
            index: breakIndex,
            x: breakX,
            priorBreak: bestPriorBreak,
            badness: bestBreakBadness
        };
    }

    function leastBadBreaks(lastLineBreak) {
        if (!lastLineBreak) {
            return [];
        }
        return leastBadBreaks(lastLineBreak.priorBreak).concat(lastLineBreak.index);
    }

    function calculatePenalty(codePoint, nextCodePoint, penalizableIdeographicBreak) {
        var penalty = 0;
        if (codePoint === 0x0a) {
            penalty -= 10000;
        }
        if (penalizableIdeographicBreak) {
            penalty += 150;
        }
        if (codePoint === 0x28 || codePoint === 0xff08) {
            penalty += 50;
        }
        if (nextCodePoint === 0x29 || nextCodePoint === 0xff09) {
            penalty += 50;
        }
        return penalty;
    }

    function determineLineBreaks(logicalInput, spacing, maxWidth, glyphMap) {
        if (!maxWidth) {
            return [];
        }

        if (!logicalInput) {
            return [];
        }

        var potentialLineBreaks = [];
        var targetWidth = determineAverageLineWidth(logicalInput, spacing, maxWidth, glyphMap);
        var hasServerSuggestedBreakpoints = logicalInput.text.indexOf("\u200b") >= 0;
        var currentX = 0;

        for (var i = 0; i < logicalInput.length(); i++) {
            var section = logicalInput.getSection(i);
            var codePoint = logicalInput.getCharCode(i);
            var positions = glyphMap[section.fontStack];
            var glyph = positions && positions[codePoint];

            if (glyph && !whitespace[codePoint]) {
                currentX += glyph.metrics.advance * section.scale + spacing;
            }

            if (i < logicalInput.length() - 1) {
                var ideographicBreak = scriptDetection.charAllowsIdeographicBreaking(codePoint);
                if (breakable[codePoint] || ideographicBreak) {
                    potentialLineBreaks.push(
                        evaluateBreak(
                            i + 1,
                            currentX,
                            targetWidth,
                            potentialLineBreaks,
                            calculatePenalty(codePoint, logicalInput.getCharCode(i + 1), ideographicBreak && hasServerSuggestedBreakpoints),
                            false));
                }
            }
        }

        return leastBadBreaks(evaluateBreak(logicalInput.length(), currentX, targetWidth, potentialLineBreaks, 0, true));
    }

    function breakLines(input, lineBreakPoints) {
        var lines = [];
        var text = input.text;
        var start = 0;
        for (var i = 0, list = lineBreakPoints; i < list.length; i += 1) {
            var lineBreak = list[i];
            lines.push(input.substring(start, lineBreak));
            start = lineBreak;
        }
        if (start < text.length) {
            lines.push(input.substring(start, text.length));
        }
        return lines;
    }

    function justifyLine(positionedGlyphs, glyphMap, start, end, justify) {
        if (!justify) {
            return;
        }
        var lastPositionedGlyph = positionedGlyphs[end];
        var positions = glyphMap[lastPositionedGlyph.fontStack];
        var glyph = positions && positions[lastPositionedGlyph.glyph];
        if (glyph) {
            var lastAdvance = glyph.metrics.advance * lastPositionedGlyph.scale;
            var lineIndent = (positionedGlyphs[end].x + lastAdvance) * justify;

            for (var j = start; j <= end; j++) {
                positionedGlyphs[j].x -= lineIndent;
            }
        }
    }

    function getAnchorAlignment(anchor) {
        var horizontalAlign = 0.5, verticalAlign = 0.5;
        switch (anchor) {
            case 'right':
            case 'top-right':
            case 'bottom-right':
                horizontalAlign = 1;
                break;
            case 'left':
            case 'top-left':
            case 'bottom-left':
                horizontalAlign = 0;
                break;
        }
        switch (anchor) {
            case 'bottom':
            case 'bottom-right':
            case 'bottom-left':
                verticalAlign = 1;
                break;
            case 'top':
            case 'top-right':
            case 'top-left':
                verticalAlign = 0;
                break;
        }
        return {horizontalAlign: horizontalAlign, verticalAlign: verticalAlign};
    }

    function align$1(positionedGlyphs, justify, horizontalAlign, verticalAlign, maxLineLength, lineHeight, lineCount) {
        var shiftX = (justify - horizontalAlign) * maxLineLength;
        var shiftY = (-verticalAlign * lineCount + 0.5) * lineHeight;

        for (var j = 0; j < positionedGlyphs.length; j++) {
            positionedGlyphs[j].x += shiftX;
            positionedGlyphs[j].y += shiftY;
        }
    }

    function shapeLines(shaping, glyphMap, lines, lineHeight, textAnchor, textJustify, writingMode, spacing) {
        var yOffset = -17;
        var x = 0;
        var y = yOffset;
        var maxLineLength = 0;
        var positionedGlyphs = shaping.positionedGlyphs;

        var justify = textJustify === 'right' ? 1 : textJustify === 'left' ? 0 : 0.5;

        for (var i$1 = 0, list = lines; i$1 < list.length; i$1 += 1) {
            var line = list[i$1];
            line.trim();
            var lineMaxScale = line.getMaxScale();

            if (!line.length()) {
                y += lineHeight;
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

                if (!scriptDetection.charHasUprightVerticalOrientation(codePoint) || writingMode === WritingMode.horizontal) {
                    positionedGlyphs.push({
                        glyph: codePoint,
                        x: x,
                        y: y + baselineOffset,
                        vertical: false,
                        scale: section.scale,
                        fontStack: section.fontStack
                    });
                    x += glyph.metrics.advance * section.scale + spacing;
                } else {
                    positionedGlyphs.push({
                        glyph: codePoint,
                        x: x,
                        y: baselineOffset,
                        vertical: true,
                        scale: section.scale,
                        fontStack: section.fontStack
                    });
                    x += Constant.ONE_EM * section.scale + spacing;
                }
            }
            if (positionedGlyphs.length !== lineStartIndex) {
                var lineLength = x - spacing;
                maxLineLength = Math.max(lineLength, maxLineLength);
                justifyLine(positionedGlyphs, glyphMap, lineStartIndex, positionedGlyphs.length - 1, justify);
            }
            x = 0;
            y += lineHeight * lineMaxScale;
        }

        var ref = getAnchorAlignment(textAnchor);
        var horizontalAlign = ref.horizontalAlign;
        var verticalAlign = ref.verticalAlign;
        align$1(positionedGlyphs, justify, horizontalAlign, verticalAlign, maxLineLength, lineHeight, lines.length);

        var height = y - yOffset;
        shaping.top += -verticalAlign * height;
        shaping.bottom = shaping.top + height;
        shaping.left += -horizontalAlign * maxLineLength;
        shaping.right = shaping.left + maxLineLength;
    }

    /**
     * 修正文本位置
     * @private
     * @param text
     * @param glyphs
     * @param defaultFontStack
     * @param maxWidth
     * @param lineHeight
     * @param textAnchor
     * @param textJustify
     * @param spacing
     * @param translate
     * @param writingMode
     * @return {boolean|{top: *, left: *, bottom: *, positionedGlyphs: [], text: *, right: *, lineCount, writingMode: *}}
     */
    function shapeText(text, glyphs, defaultFontStack, maxWidth, lineHeight, textAnchor, textJustify,
                       spacing, translate, writingMode) {
        var logicalInput = TaggedString.fromFeature(text, defaultFontStack);
        if (writingMode === WritingMode.vertical) {
            logicalInput.verticalizePunctuation();
        }
        var lines;
        var processBidirectionalText = rtlTextPlugin.processBidirectionalText;
        var processStyledBidirectionalText = rtlTextPlugin.processStyledBidirectionalText;
        if (processBidirectionalText && logicalInput.sections.length === 1) {
            lines = [];
            var untaggedLines = processBidirectionalText(logicalInput.toString(), determineLineBreaks(logicalInput, spacing, maxWidth, glyphs));
            for (var i$1 = 0, list = untaggedLines; i$1 < list.length; i$1 += 1) {
                var line = list[i$1];
                var taggedLine = new TaggedString();
                taggedLine.text = line;
                taggedLine.sections = logicalInput.sections;
                for (var i = 0; i < line.length; i++) {
                    taggedLine.sectionIndex.push(0);
                }
                lines.push(taggedLine);
            }
        } else if (processStyledBidirectionalText) {
            lines = [];
            var processedLines = processStyledBidirectionalText(logicalInput.text, logicalInput.sectionIndex, determineLineBreaks(logicalInput, spacing, maxWidth, glyphs));
            for (var i$2 = 0, list$1 = processedLines; i$2 < list$1.length; i$2 += 1) {
                var line$1 = list$1[i$2];
                var taggedLine$1 = new TaggedString();
                taggedLine$1.text = line$1[0];
                taggedLine$1.sectionIndex = line$1[1];
                taggedLine$1.sections = logicalInput.sections;
                lines.push(taggedLine$1);
            }
        } else {
            lines = breakLines(logicalInput, determineLineBreaks(logicalInput, spacing, maxWidth, glyphs));
        }

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
        if (!positionedGlyphs.length) {
            return false;
        }
        return shaping;
    }

    function shapeIcon(image, iconOffset, iconAnchor) {
        var ref = getAnchorAlignment(iconAnchor);
        var horizontalAlign = ref.horizontalAlign;
        var verticalAlign = ref.verticalAlign;
        var dx = iconOffset[0];
        var dy = iconOffset[1];
        var x1 = dx - image.displaySize[0] * horizontalAlign;
        var x2 = x1 + image.displaySize[0];
        var y1 = dy - image.displaySize[1] * verticalAlign;
        var y2 = y1 + image.displaySize[1];
        return {image: image, top: y1, bottom: y2, left: x1, right: x2};
    }

    exports.WritingMode = WritingMode;
    exports.shapeText = shapeText;
    exports.shapeIcon = shapeIcon;
})