define("com/huayun/webgis/utils/MathUtils", [
    "exports"
], function (exports) {

    function difference(end, start, result) {
        if (!result) result = [];
        result[0] = end[0] - start[0];
        result[1] = end[1] - start[1];
        return result;
    }

    function radian2Angle(radian) {
        return (radian * 180) / Math.PI;
    }

    function angle2Radian(angle) {
        return (angle * Math.PI) / 180;
    }

    function getOrientation(fromV, toV, isRadian) {
        var diff = difference(toV, fromV);
        var radian = Math.atan2(diff[1], diff[0]);
        if (isRadian === false) {
            radian = radian2Angle(radian);
        }
        return radian;
    }

    exports.radian2Angle = radian2Angle;
    exports.angle2Radian = angle2Radian;
    exports.calculateCenterOfLine = function (line) {
        var halfLength,
            allLineLength = 0,
            lineLengthArray = [];
        for (var i = 0; i < line.length - 1; i++) {
            var currentPoint = line[i];
            var otherPoint = line[i + 1];
            var distance = currentPoint.dist(otherPoint);
            lineLengthArray[lineLengthArray.length] = distance;
            allLineLength += distance;
        }
        halfLength = allLineLength * 0.5;
        var tempLen = 0, index = 0;
        for (i = 0; i < lineLengthArray.length; i++) {
            tempLen += lineLengthArray[i];
            if (tempLen > halfLength) {
                index = i;
                break;
            }
        }
        var disLength = 0;
        for (i = 0; i < index; i++) {
            disLength += lineLengthArray[i];
        }
        var dis = halfLength - disLength;
        var v1 = [line[index].x, line[index].y];
        var v2 = [line[index + 1].x, line[index + 1].y];
        var radian = getOrientation(v1, v2, true);
        var center = line[index].calculateOtherPoint(dis, radian);
        return {
            length: allLineLength,
            center: center,
            radian: radian
        };
    };

    function rotatePoint(p, sin, cos) {
        var x = p.x * cos - p.y * sin;
        var y = p.x * sin + p.y * cos;
        return {
            x: x,
            y: y
        }
    }

    exports.sizeAfterRotated = function (points, radian) {
        var sin = Math.sin(radian);
        var cos = Math.cos(radian);
        var p1 = rotatePoint(points[0], sin, cos);
        var p2 = rotatePoint(points[1], sin, cos);
        var p3 = rotatePoint(points[2], sin, cos);
        var p4 = rotatePoint(points[3], sin, cos);

        var xmin = Math.min(p1.x, p2.x, p3.x, p4.x);
        var xmax = Math.max(p1.x, p2.x, p3.x, p4.x);
        var ymin = Math.min(p1.y, p2.y, p3.y, p4.y);
        var ymax = Math.max(p1.y, p2.y, p3.y, p4.y);

        return {
            xmin: xmin,
            xmax: xmax,
            ymin: ymin,
            ymax: ymax
        };
    }

    exports.calculateCoreOfPolygon = function (list) {
        let temp;
        let area = 0;
        let cx = 0, cy = 0;
        let len = list.length;
        for (let i = 0; i < len - 1; i++) {
            temp = list[i].x * list[i + 1].y - list[i].y * list[i + 1].x;
            area += temp;
            cx += temp * (list[i].x + list[i + 1].x);
            cy += temp * (list[i].y + list[i + 1].y);
        }
        temp = list[len - 1].x * list[0].y - list[len - 1].y * list[0].x;
        area += temp;
        cx += temp * (list[len - 1].x + list[0].x);
        cy += temp * (list[len - 1].y + list[0].y);
        area = area / 2;
        cx = cx / (6 * area);
        cy = cy / (6 * area);
        return {
            x: cx,
            y: cy
        };
    }

    exports.lerp = function (p, q, time) {
        return ((1.0 - time) * p) + (time * q);
    };
});
