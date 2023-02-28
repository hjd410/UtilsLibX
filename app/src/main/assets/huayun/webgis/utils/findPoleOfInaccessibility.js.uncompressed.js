define("com/huayun/webgis/utils/findPoleOfInaccessibility", [
    "../core/TinyQueue",
    "../geometry/Point",
    "../geometry/intersection_tests"
], function (TinyQueue, Point, intersectionTests) {

    function compareMax(a, b) {
        return b.max - a.max;
    }

    function Cell(x, y, h, polygon) {
        this.p = new Point(x, y);
        this.h = h;
        this.d = pointToPolygonDist(this.p, polygon);
        this.max = this.d + this.h * Math.SQRT2;
    }

    function pointToPolygonDist(p, polygon) {
        var inside = false;
        var minDistSq = Infinity;
        for (var k = 0; k < polygon.length; k++) {
            var ring = polygon[k];
            for (var i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
                var a = ring[i];
                var b = ring[j];
                if ((a.y > p.y !== b.y > p.y) && (p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)) {
                    inside = !inside;
                }
                minDistSq = Math.min(minDistSq, intersectionTests.distToSegmentSquared(p, a, b));
            }
        }
        return (inside ? 1 : -1) * Math.sqrt(minDistSq);
    }

    function getCentroidCell(polygon) {
        var area = 0;
        var x = 0;
        var y = 0;
        var points = polygon[0];
        for (var i = 0, len = points.length, j = len - 1; i < len; j = i++) {
            var a = points[i];
            var b = points[j];
            var f = a.x * b.y - b.x * a.y;
            x += (a.x + b.x) * f;
            y += (a.y + b.y) * f;
            area += f * 3;
        }
        return new Cell(x / area, y / area, 0, polygon);
    }

    function findPoleOfInaccessibility(polygonRings, precision) {
        if (precision === void 0) precision = 1;
        var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        var outerRing = polygonRings[0];
        for (var i = 0; i < outerRing.length; i++) {
            var p = outerRing[i];
            if (!i || p.x < minX) {
                minX = p.x;
            }
            if (!i || p.y < minY) {
                minY = p.y;
            }
            if (!i || p.x > maxX) {
                maxX = p.x;
            }
            if (!i || p.y > maxY) {
                maxY = p.y;
            }
        }
        var width = maxX - minX;
        var height = maxY - minY;
        var cellSize = Math.min(width, height);
        var h = cellSize / 2;
        var cellQueue = new TinyQueue([], compareMax);
        if (cellSize === 0) {
            return new Point(minX, minY);
        }
        for (var x = minX; x < maxX; x += cellSize) {
            for (var y = minY; y < maxY; y += cellSize) {
                cellQueue.push(new Cell(x + h, y + h, h, polygonRings));
            }
        }
        var bestCell = getCentroidCell(polygonRings);
        var numProbes = cellQueue.length;

        while (cellQueue.length) {
            var cell = cellQueue.pop();
            if (cell.d > bestCell.d || !bestCell.d) {
                bestCell = cell;
            }
            if (cell.max - bestCell.d <= precision) {
                continue;
            }
            h = cell.h / 2;
            cellQueue.push(new Cell(cell.p.x - h, cell.p.y - h, h, polygonRings));
            cellQueue.push(new Cell(cell.p.x + h, cell.p.y - h, h, polygonRings));
            cellQueue.push(new Cell(cell.p.x - h, cell.p.y + h, h, polygonRings));
            cellQueue.push(new Cell(cell.p.x + h, cell.p.y + h, h, polygonRings));
            numProbes += 4;
        }
        return bestCell.p;
    }

    return findPoleOfInaccessibility;
})