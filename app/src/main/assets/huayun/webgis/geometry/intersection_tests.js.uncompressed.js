define("com/huayun/webgis/geometry/intersection_tests", [
    "exports",
    "../utils/utils",
    "./Point"
], function (exports, utils, Point) {
    /**
     * 获取数据的地理范围
     * @ignore
     * @param geometry
     * @return {{minY: number, minX: number, maxY: number, maxX: number}}
     */
    function getBounds(geometry) {
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        for (var i = 0, list = geometry; i < list.length; i += 1) {
            var p = list[i];
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }
        return {minX: minX, minY: minY, maxX: maxX, maxY: maxY};
    }

    /**
     * 检测某条线段是否和盒子相交, 两个步骤:
     * 1. 检测左上角和右下角与线段的关系
     * 2. 检测四个角是否在线段的同一侧
     * @ignore
     * @param e1 线段的端点
     * @param e2 线段的端点
     * @param corners 盒子的四个角坐标
     * @return {boolean}
     */
    function edgeIntersectsBox(e1, e2, corners) {
        var tl = corners[0];
        var br = corners[2];

        if (((e1.x < tl.x) && (e2.x < tl.x)) || ((e1.x > br.x) && (e2.x > br.x)) ||
            ((e1.y < tl.y) && (e2.y < tl.y)) || ((e1.y > br.y) && (e2.y > br.y))) {
            return false;
        }
        // 检测盒子的所有角是否在边缘的同一侧
        var dir = utils.isCounterClockwise(e1, e2, corners[0]);
        return dir !== utils.isCounterClockwise(e1, e2, corners[1]) ||
            dir !== utils.isCounterClockwise(e1, e2, corners[2]) ||
            dir !== utils.isCounterClockwise(e1, e2, corners[3]);
    }

    /**
     * 判断两条线段是否碰撞, 跨立试验: 若两线段相交, 则两线段必然相互跨立对方.
     * @private
     * @ignore
     * @param a0
     * @param a1
     * @param b0
     * @param b1
     * @return {boolean|boolean}
     */
    function lineSegmentIntersectsLineSegment(a0, a1, b0, b1) {
        return utils.isCounterClockwise(a0, b0, b1) !== utils.isCounterClockwise(a1, b0, b1) &&
            utils.isCounterClockwise(a0, a1, b0) !== utils.isCounterClockwise(a0, a1, b1);
    }

    /**
     * 判断点与线的关系
     * @param {Point} p
     * @param line
     * @param radius
     * @return {boolean}
     */
    function pointIntersectsBufferedLine(p, line, radius) {
        var radiusSquared = radius * radius;

        if (line.length === 1) {
            return p.distSqr(line[0]) < radiusSquared;
        }

        for (var i = 1; i < line.length; i++) {
            var v = line[i - 1], w = line[i];
            if (distToSegmentSquared(p, v, w) < radiusSquared) { // 若点到线段的最短距离平方小于线宽一半的平方
                return true;
            }
        }
        return false;
    }

    /**
     * 判断两条线是否相交, 考虑线的宽度
     * @private
     * @ignore
     * @param lineA
     * @param lineB
     * @param radius
     * @return {boolean}
     */
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

    /**
     * 判断多边形与线是否相交
     * @private
     * @ignore
     * @param polygon
     * @param multiLine
     * @param radius
     * @return {boolean}
     */
    function polygonIntersectsBufferedMultiLine(polygon, multiLine, radius) {
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

    /**
     * 检测多边形是否包含某个点
     * @ignore
     * @param ring 多边形坐标
     * @param p 点坐标
     * @return {boolean} 是否包含
     */
    function polygonContainsPoint(ring, p) {
        var c = false;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            var p1 = ring[i];
            var p2 = ring[j];
            // p1和p2组成的直线方程是: y - p1.y = (p2.y - p1.y)/(p2.x - p1.x)*(x - p1.x)
            // 水平/垂直交叉点判别法(适用于任意多边形): 从点P作水平向左的射线, 如果P在多边形内部, 则这条射线与多边形的交点必为奇数, 如果P在多边形外部, 则交点个数必为偶数.
            if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
                c = !c;
            }
        }
        return c;
    }


    /**
     * 检测多边形和盒子是否相交
     * 1. 判断多边形的每个点和盒子的关系
     * 2. 判断盒子的四个角点有没有在多边形内部的
     * 3. 判断多边形的每条边与盒子是否相交
     * @ignore
     * @param ring 多边形的坐标数组
     * @param boxX1 盒子的x1坐标
     * @param boxY1 盒子的y1坐标
     * @param boxX2 盒子的x2坐标
     * @param boxY2 盒子的y2坐标
     * @return {boolean}
     */
    function polygonIntersectsBox(ring, boxX1, boxY1, boxX2, boxY2) {
        for (var i$1 = 0, list = ring; i$1 < list.length; i$1 += 1) {
            var p = list[i$1];
            if (boxX1 <= p.x && boxY1 <= p.y && boxX2 >= p.x && boxY2 >= p.y) {
                return true;
            }
        }

        var corners = [new Point(boxX1, boxY1), new Point(boxX1, boxY2), new Point(boxX2, boxY2), new Point(boxX2, boxY1)];
        if (ring.length > 2) {
            for (var i$2 = 0, list$1 = corners; i$2 < list$1.length; i$2 += 1) {
                var corner = list$1[i$2];
                if (polygonContainsPoint(ring, corner)) {
                    return true;
                }
            }
        }

        for (var i = 0; i < ring.length - 1; i++) {
            var p1 = ring[i];
            var p2 = ring[i + 1];
            if (edgeIntersectsBox(p1, p2, corners)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 计算点到线段的最短距离
     * @private
     * @ignore
     * @param {Point} p
     * @param {Point} v
     * @param {Point} w
     * @return {*}
     */
    function distToSegmentSquared(p, v, w) {
        var l2 = v.distSqr(w);
        if (l2 === 0) {
            return p.distSqr(v);
        }
        // 若t<0或t>1, 说明最近点是端点, 否则最近点在两个端点之间
        // 向量vp点积向量vm为向量vp在向量vw上的投影
        var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        if (t < 0) {
            return p.distSqr(v);
        }
        if (t > 1) {
            return p.distSqr(w);
        }
        return p.distSqr(w.sub(v)._mult(t)._add(v));
    }

    /**
     * 多边形是否包含指定点
     * @param rings
     * @param p
     * @return {boolean}
     */
    function multiPolygonContainsPoint(rings, p) {
        var c = false,
            ring, p1, p2;

        for (var k = 0; k < rings.length; k++) {
            ring = rings[k];
            for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
                p1 = ring[i];
                p2 = ring[j];
                if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) { // 直线判断法
                    c = !c;
                }
            }
        }
        return c;
    }

    /**
     * 判断两条线是否碰撞, 不考虑线的宽度
     * @private
     * @ignore
     * @param lineA
     * @param lineB
     * @return {boolean}
     */
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

    /**
     * 多边形与多个多边形是否碰撞
     * @private
     * @ignore
     * @param polygon
     * @param multiPolygon
     * @return {boolean|*}
     */
    function polygonIntersectsMultiPolygon(polygon, multiPolygon) {
        if (polygon.length === 1) {
            return multiPolygonContainsPoint(multiPolygon, polygon[0]);
        }

        for (var m = 0; m < multiPolygon.length; m++) {
            var ring = multiPolygon[m];
            for (var n = 0; n < ring.length; n++) {
                if (polygonContainsPoint(polygon, ring[n])) {
                    return true;
                }
            }
        }

        for (var i = 0; i < polygon.length; i++) {
            if (multiPolygonContainsPoint(multiPolygon, polygon[i])) {
                return true;
            }
        }

        for (var k = 0; k < multiPolygon.length; k++) {
            if (lineIntersectsLine(polygon, multiPolygon[k])) {
                return true;
            }
        }

        return false;
    }

    // 统一导出
    exports.getBounds = getBounds;
    exports.edgeIntersectsBox = edgeIntersectsBox;
    exports.polygonContainsPoint = polygonContainsPoint;
    exports.polygonIntersectsBox = polygonIntersectsBox;
    exports.distToSegmentSquared = distToSegmentSquared;
    exports.polygonIntersectsMultiPolygon = polygonIntersectsMultiPolygon;
    exports.polygonIntersectsBufferedMultiLine = polygonIntersectsBufferedMultiLine;
})