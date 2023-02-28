define("com/huayun/webgis/data/captureIntersects", ["exports", "../utils/utils", "custom/gl-matrix-min"], function (exports, utils, glMatrix) {

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

    function distToSegmentSquared(p, v, w) {
        var l2 = v.distSqr(w);
        if (l2 === 0) {
            return p.distSqr(v);
        }
        var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        if (t < 0) {
            return p.distSqr(v);
        }
        if (t > 1) {
            return p.distSqr(w);
        }
        return p.distSqr(w.sub(v)._mult(t)._add(v));
    }

    function pointIntersectsBufferedLine(p, line, radius) {
        var radiusSquared = radius * radius;
        if (line.length === 1) {
            return p.distSqr(line[0]) < radiusSquared;
        }
        for (var i = 1; i < line.length; i++) {
            var v = line[i - 1], w = line[i];
            if (distToSegmentSquared(p, v, w) < radiusSquared) {
                return true;
            }
        }
        return false;
    }

    function getPixelPosMatrix(transform, matrix) {
        var t = glMatrix.mat4.identity([]);
        glMatrix.mat4.translate(t, t, [1, 1, 0]);
        glMatrix.mat4.scale(t, t, [transform.width * 0.5, transform.height * 0.5, 1]);
        return glMatrix.mat4.multiply(t, t, matrix);
    }

    function polygonIntersectsBufferedPoint(polygon, point, radius) {
        if (polygonContainsPoint(polygon, point)) { return true; }
        if (pointIntersectsBufferedLine(point, polygon, radius)) { return true; }
        return false;
    }

    function polygonIntersectsPoint(queryGeometry, geometry, symbol, resolution, radius, viewpoint) {
        var pixelPosMatrix = getPixelPosMatrix(viewpoint, symbol.uniforms.u_matrix);
        var stroke = symbol.strokeWidth || 0;
        radius = symbol.captureRadius||15;
        var size  = radius + stroke;
        var alignWithMap = symbol.pitchWithMap;
        var transformedPolygon = alignWithMap ? queryGeometry : utils.projectQueryGeometry(queryGeometry, pixelPosMatrix);
        // var transformedSize = alignWithMap ? size * resolution : size;
        var transformedSize = (radius + stroke);// * resolution;
        var point = geometry;
        var transformedPoint = alignWithMap ? point : utils.projectPoint(point, pixelPosMatrix);

        var adjustedSize = transformedSize;
        var projectedCenter = glMatrix.vec4.transformMat4([], [point.x, point.y, 0, 1], pixelPosMatrix);
        if (!symbol.scaleWithPitch && alignWithMap) {
            adjustedSize *= projectedCenter[3] / viewpoint.cameraToCenterDistance;
        } else if (symbol.scaleWithPitch && !alignWithMap) {
            adjustedSize *= viewpoint.cameraToCenterDistance / projectedCenter[3];
        }
        if (polygonIntersectsBufferedPoint(transformedPolygon, transformedPoint, adjustedSize)) { return true; }
    }
    exports.point = polygonIntersectsPoint;


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

    function lineIntersectsBufferedLine(lineA, lineB, radius) {
        if (lineA.length > 1) {
            if (lineIntersectsLine(lineA, lineB)) {
                return true;
            }
            for (var j = 0; j < lineB.length; j++) {
                if (pointIntersectsBufferedLine(lineB[j], lineA, radius)) {
                    return true;
                }
            }
        }
        for (var k = 0; k < lineA.length; k++) {
            if (pointIntersectsBufferedLine(lineA[k], lineB, radius)) {
                return true;
            }
        }
        return false;
    }

    function polygonIntersectsBufferedMultiLine(polygon, multiLine, symbol, resolution, radius, viewpoint, captureWidth) {
        multiLine = multiLine.path;
        var radius = (symbol.width + captureWidth||4) * resolution / 2;
        for (var i = 0; i < multiLine.length; i++) {
            var line = multiLine[i];

            if (polygon.length >= 3) {
                for (var k = 0; k < line.length; k++) {
                    if (polygonContainsPoint(polygon, line[k])) {
                        return true;
                    }
                }
            }

            if (lineIntersectsBufferedLine(polygon, line, radius)) {
                return true;
            }
        }
        return false;
    }

    exports.line = polygonIntersectsBufferedMultiLine;

});