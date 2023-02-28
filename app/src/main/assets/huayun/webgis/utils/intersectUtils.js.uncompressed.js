define("com/huayun/webgis/utils/intersectUtils", [
    "exports",
    "./utils"
], function (exports, utils) {

    function polygonContainsPoint(ring, p) {
        var c = false;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            var p1 = ring[i];
            var p2 = ring[j];
            if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
                c = !c;
            }
        }
        return c;
    }

    function lineSegmentIntersectsLineSegment(a0, a1, b0, b1) {
        return utils.isCounterClockwise(a0, b0, b1) !== utils.isCounterClockwise(a1, b0, b1) &&
            utils.isCounterClockwise(a0, a1, b0) !== utils.isCounterClockwise(a0, a1, b1);
    }

    function lineIntersectsLine(lineA, lineB) {
        if (lineA.length === 0 || lineB.length === 0) {
            return false;
        }
        for (var i = 0; i < lineA.length - 1; i++) {
            var a0 = lineA[i];
            var a1 = lineA[i + 1];
            for (var j = 0; j < lineB.length - 1; j++) {
                var b0 = lineB[j];
                var b1 = lineB[j + 1];
                if (lineSegmentIntersectsLineSegment(a0, a1, b0, b1)) {
                    return true;
                }
            }
        }
        return false;
    }

    function polygonIntersectsPolygon(polygonA, polygonB) {
        for (var i = 0; i < polygonA.length; i++) {
            if (polygonContainsPoint(polygonB, polygonA[i])) {
                return true;
            }
        }

        for (var i$1 = 0; i$1 < polygonB.length; i$1++) {
            if (polygonContainsPoint(polygonA, polygonB[i$1])) {
                return true;
            }
        }

        if (lineIntersectsLine(polygonA, polygonB)) {
            return true;
        }

        return false;
    }

    exports.polygonIntersectsPolygon = polygonIntersectsPolygon;
});