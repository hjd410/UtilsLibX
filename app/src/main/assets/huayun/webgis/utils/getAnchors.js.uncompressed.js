define("com/huayun/webgis/utils/getAnchors", [
    "exports",
    "./utils",
    "../geometry/Anchor"
], function (exports, utils, Anchor) {

    function getAngleWindowSize(shapedText, glyphSize, boxScale) {
        return shapedText ? 3 / 5 * glyphSize * boxScale : 0;
    }

    function getShapedLabelLength(shapedText, shapedIcon) {
        return Math.max(shapedText ? shapedText.right - shapedText.left : 0, shapedIcon ? shapedIcon.right - shapedIcon.left : 0);
    }

    function getLineLength(line) {
        var lineLength = 0;
        for (var k = 0; k < line.length - 1; k++) {
            lineLength += line[k].dist(line[k + 1]);
        }
        return lineLength;
    }

    function checkMaxAngle(line, anchor, labelLength, windowSize, maxAngle) {
        if (anchor.segment === undefined) {
            return true;
        }

        var p = anchor;
        var index = anchor.segment + 1;
        var anchorDistance = 0;

        while (anchorDistance > -labelLength / 2) {
            index--;
            if (index < 0) {
                return false;
            }
            anchorDistance -= line[index].dist(p);
            p = line[index];
        }
        anchorDistance += line[index].dist(line[index + 1]);
        index++;
        var recentCorners = [];
        var recentAngleDelta = 0;
        while (anchorDistance < labelLength / 2) {
            var prev = line[index - 1];
            var current = line[index];
            var next = line[index + 1];
            if (!next) {
                return false;
            }
            var angleDelta = prev.angleTo(current) - current.angleTo(next);
            angleDelta = Math.abs(((angleDelta + 3 * Math.PI) % (Math.PI * 2)) - Math.PI);
            recentCorners.push({
                distance: anchorDistance,
                angleDelta: angleDelta
            });
            recentAngleDelta += angleDelta;
            while (anchorDistance - recentCorners[0].distance > windowSize) {
                recentAngleDelta -= recentCorners.shift().angleDelta;
            }
            if (recentAngleDelta > maxAngle) {
                return false;
            }
            index++;
            anchorDistance += current.dist(next);
        }
        return true;
    }

    function resample(line, offset, spacing, angleWindowSize, maxAngle, labelLength, isLineContinued, placeAtMiddle, tileExtent) {
        var halfLabelLength = labelLength / 2;
        var lineLength = getLineLength(line);
        var distance = 0, markedDistance = offset - spacing;
        var anchors = [];

        for (var i = 0; i < line.length - 1; i++) {
            var a = line[i], b = line[i + 1];
            var segmentDist = a.dist(b),
                angle = b.angleTo(a);
            while (markedDistance + spacing < distance + segmentDist) {
                markedDistance += spacing;
                var t = (markedDistance - distance) / segmentDist,
                    x = utils.number(a.x, b.x, t),
                    y = utils.number(a.y, b.y, t);
                if (x >= 0 && x < tileExtent && y >= 0 && y < tileExtent && markedDistance - halfLabelLength >= 0 &&
                    markedDistance + halfLabelLength <= lineLength) {
                    var anchor = new Anchor(x, y, angle, i);
                    anchor._round();
                    if (!angleWindowSize || checkMaxAngle(line, anchor, labelLength, angleWindowSize, maxAngle)) {
                        anchors.push(anchor);
                    }
                }
            }
            distance += segmentDist;
        }
        if (!placeAtMiddle && !anchors.length && !isLineContinued) {
            anchors = resample(line, distance / 2, spacing, angleWindowSize, maxAngle, labelLength, isLineContinued, true, tileExtent);
        }
        return anchors;
    }

    function getAnchors(line, spacing, maxAngle, shapedText, shapedIcon,
                        glyphSize, boxScale, overscaling, tileExtent) {
        var angleWindowSize = getAngleWindowSize(shapedText, glyphSize, boxScale);
        var shapedLabelLength = getShapedLabelLength(shapedText, shapedIcon);
        var labelLength = shapedLabelLength * boxScale;

        var isLineContinued = line[0].x === 0 || line[0].x === tileExtent || line[0].y === 0 || line[0].y === tileExtent;

        if (spacing - labelLength < spacing / 4) {
            spacing = labelLength + spacing / 4;
        }

        var fixedExtraOffset = glyphSize * 2;

        var offset = !isLineContinued ? ((shapedLabelLength / 2 + fixedExtraOffset) * boxScale * overscaling) % spacing :
            (spacing / 2 * overscaling) % spacing;

        return resample(line, offset, spacing, angleWindowSize, maxAngle, labelLength, isLineContinued, false, tileExtent);
    }

    function getCenterAnchor(line, maxAngle, shapedText, shapedIcon, glyphSize, boxScale) {
        var angleWindowSize = getAngleWindowSize(shapedText, glyphSize, boxScale);
        var labelLength = getShapedLabelLength(shapedText, shapedIcon) * boxScale;

        var prevDistance = 0;
        var centerDistance = getLineLength(line) / 2;

        for (var i = 0; i < line.length - 1; i++) {
            var a = line[i],
                b = line[i + 1];
            var segmentDistance = a.dist(b);
            if (prevDistance + segmentDistance > centerDistance) {
                var t = (centerDistance - prevDistance) / segmentDistance,
                    x = utils.number(a.x, b.x, t),
                    y = utils.number(a.y, b.y, t);
                var anchor = new Anchor(x, y, b.angleTo(a), i);
                anchor._round();
                if (!angleWindowSize || checkMaxAngle(line, anchor, labelLength, angleWindowSize, maxAngle)) {
                    return anchor;
                } else {
                    return;
                }
            }
            prevDistance += segmentDistance;
        }
    }

    exports.getAnchors = getAnchors;
    exports.getCenterAnchor = getCenterAnchor;
})