/**
 *
 */
define("com/huayun/webgis/data/CollisionFeature", [
    "../geometry/Point"
], function (Point) {

    /**
     * @ignore
     * @param collisionBoxArray
     * @param line
     * @param anchor
     * @param featureIndex
     * @param sourceLayerIndex
     * @param bucketIndex
     * @param shaped
     * @param boxScale
     * @param padding
     * @param alignLine
     * @param overscaling
     * @param rotate
     * @constructor
     */
    var CollisionFeature = function CollisionFeature(collisionBoxArray, line, anchor, featureIndex, sourceLayerIndex, bucketIndex,
                                                     shaped, boxScale, padding, alignLine, overscaling, rotate) {
        var y1 = shaped.top * boxScale - padding;
        var y2 = shaped.bottom * boxScale + padding;
        var x1 = shaped.left * boxScale - padding;
        var x2 = shaped.right * boxScale + padding;
        this.boxStartIndex = collisionBoxArray.length;
        if (alignLine) {
            var height = y2 - y1;
            var length = x2 - x1;
            if (height > 0) {
                height = Math.max(10 * boxScale, height);
                this._addLineCollisionCircles(collisionBoxArray, line, anchor, (anchor.segment), length, height, featureIndex, sourceLayerIndex, bucketIndex, overscaling);
            }
        } else {
            if (rotate) {
                var tl = new Point(x1, y1);
                var tr = new Point(x2, y1);
                var bl = new Point(x1, y2);
                var br = new Point(x2, y2);
                var rotateRadians = rotate * Math.PI / 180;
                tl._rotate(rotateRadians);
                tr._rotate(rotateRadians);
                bl._rotate(rotateRadians);
                br._rotate(rotateRadians);
                x1 = Math.min(tl.x, tr.x, bl.x, br.x);
                x2 = Math.max(tl.x, tr.x, bl.x, br.x);
                y1 = Math.min(tl.y, tr.y, bl.y, br.y);
                y2 = Math.max(tl.y, tr.y, bl.y, br.y);
            }
            collisionBoxArray.emplaceBack(anchor.x, anchor.y, x1, y1, x2, y2, featureIndex, sourceLayerIndex, bucketIndex, 0, 0);
        }
        this.boxEndIndex = collisionBoxArray.length;
    };

    CollisionFeature.prototype._addLineCollisionCircles = function _addLineCollisionCircles(collisionBoxArray, line, anchor, segment, labelLength,
                                                                                            boxSize, featureIndex, sourceLayerIndex, bucketIndex, overscaling) {
        var step = boxSize / 2;
        var nBoxes = Math.floor(labelLength / step) || 1;
        var overscalingPaddingFactor = 1 + .4 * Math.log(overscaling) / Math.LN2;
        var nPitchPaddingBoxes = Math.floor(nBoxes * overscalingPaddingFactor / 2);
        var firstBoxOffset = -boxSize / 2;
        var p = anchor;
        var index = segment + 1;
        var anchorDistance = firstBoxOffset;
        var labelStartDistance = -labelLength / 2;
        var paddingStartDistance = labelStartDistance - labelLength / 4;
        do {
            index--;
            if (index < 0) {
                if (anchorDistance > labelStartDistance) {
                    return;
                } else {
                    index = 0;
                    break;
                }
            } else {
                try {
                    anchorDistance -= line[index].dist(p);
                }catch (e) {
                    debugger;
                }
                p = line[index];
            }
        } while (anchorDistance > paddingStartDistance);
        var segmentLength = line[index].dist(line[index + 1]);
        for (var i = -nPitchPaddingBoxes; i < nBoxes + nPitchPaddingBoxes; i++) {
            var boxOffset = i * step;
            var boxDistanceToAnchor = labelStartDistance + boxOffset;
            if (boxOffset < 0) {
                boxDistanceToAnchor += boxOffset;
            }
            if (boxOffset > labelLength) {
                boxDistanceToAnchor += boxOffset - labelLength;
            }
            if (boxDistanceToAnchor < anchorDistance) {
                continue;
            }
            while (anchorDistance + segmentLength < boxDistanceToAnchor) {
                anchorDistance += segmentLength;
                index++;
                if (index + 1 >= line.length) {
                    return;
                }
                segmentLength = line[index].dist(line[index + 1]);
            }
            var segmentBoxDistance = boxDistanceToAnchor - anchorDistance;
            var p0 = line[index];
            var p1 = line[index + 1];
            var boxAnchorPoint = p1.sub(p0)._unit()._mult(segmentBoxDistance)._add(p0)._round();
            var paddedAnchorDistance = Math.abs(boxDistanceToAnchor - firstBoxOffset) < step ? 0 : (boxDistanceToAnchor - firstBoxOffset) * 0.8;
            collisionBoxArray.emplaceBack(boxAnchorPoint.x, boxAnchorPoint.y, -boxSize / 2, -boxSize / 2, boxSize / 2, boxSize / 2,
                featureIndex, sourceLayerIndex, bucketIndex, boxSize / 2, paddedAnchorDistance);
        }
    };

    return CollisionFeature;
});