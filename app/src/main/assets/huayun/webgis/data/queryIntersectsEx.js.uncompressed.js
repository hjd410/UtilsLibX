define("com/huayun/webgis/data/queryIntersectsEx", ["exports"], function(exports) {

    /**
     * 多边形包含点
     * @param ring 
     * @param p 
     */
    function polygonContainsPointex(ring, p) {
        var c = false, points;
        var type = Array.isArray(ring) ? ring[0].type : ring.type;
        if(type === "point"){
            points = Array.isArray(ring) ? ring[0] : ring;
        }else {
            points = Array.isArray(ring) ? ring[0].path[0] : ring.path[0];
            for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
                var p1 = points[i];
                var p2 = points[j];
                p.y = Array.isArray(p) ? p[1] : p.y;
                p.x = Array.isArray(p) ? p[0] : p.x;
                if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
                    c = !c;
                }
            }
        }
        return c;
    }
    
    function pointToPointsDis (p1, p2, radius) {
        var pArr, pPoi;
        Array.isArray(p1) ? pArr = p1 : pPoi = p1;
        Array.isArray(p2) ? pArr = p2 : pPoi = p2;
        if(!(Array.isArray(p1) || Array.isArray(p2))) {
            pointToArrDis(p1, p2, radius);
        }
        if(distSqr(pPoi,pArr[0]) < radius*radius){
            return true;
        }else {
            return false;
        }
    }

    function pointToArrDis (p1, p2, radius) {
        if(Array.isArray(p1) || Array.isArray(p2)) {
            pointToPointsDis(p1, p2, radius);
        }
        if (disSqr(p1,p2) < radius * radius) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * 判断两条线段是否相交
     * @param a0  线段1的起点
     * @param a1  线段1的终点
     * @param b0  线段2的起点
     * @param b1  线段2的终点
     */
    function lineSegmentIntersectsLineSegmentex(a0, a1, b0, b1) {
        return isCounterClockwise(a0, b0, b1) !== isCounterClockwise(a1, b0, b1) &&
            isCounterClockwise(a0, a1, b0) !== isCounterClockwise(a0, a1, b1);
    }

    /**
     * 判断两条线是否相交
     * @param lineA  线1
     * @param lineB  线2
     */
    function lineIntersectsLineex(lineA, lineB) {
        if (lineA.length === 0 || lineB.length === 0) {
            return false;
        }
        for (var i = 0; i < lineA.length - 1; i++) {
            var a0 = lineA[i];
            var a1 = lineA[i + 1];
            for (var j = 0; j < lineB.length - 1; j++) {
                var b0 = lineB[j];
                var b1 = lineB[j + 1];
                if (lineSegmentIntersectsLineSegmentex(a0, a1, b0, b1)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 点距离线段的平方
     * @param p  点
     * @param v  线段的起点
     * @param w  线段的终点
     */
    function distToSegmentSquaredex(p, v, w) {
        var l2 = (v[0] - w[0]) * (v[0] - w[0]) + (v[1] - w[1]) * (v[1] - w[1]);
        if (l2 === 0) {
            return disSqr(p, v);
        }
        var t = ((p.x - v[0]) * (w[0] - v[0]) + (p.y - v[1]) * (w[1] - v[1])) / l2;
        if (t < 0) {
            return disSqr(p, v);
        }
        if (t > 1) {
            return disSqr(p, w);
        }
        return disSqr(p, mult(w, v, t));
    }
    /**
     * 两点距离的平方(一个是点，一个是数组)
     * @param p1 
     * @param p2 
     */
    function disSqr(p1,p2) {
        var dx = p1.x - p2[0],
            dy = p1.y - p2[1];
        return dx * dx + dy * dy;
    }
    /**
     * 两点距离的平方(都为点的形式)
     * @param p1 
     * @param p2 
     */
    function distSqr(p1,p2) {
        var dx = p1.x - p2.x,
            dy = p1.y - p2.y;
        return dx * dx + dy * dy;
    }
    /**
     * 按照顺时针进行判断点与线段的位置
     * @param a  线段的端点
     * @param b  线段的端点
     * @param c  线段的端点
     */
    function isCounterClockwise(a, b, c) {
        return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
    }
    /**
     * 重新计算点
     * @param w  线段的端点
     * @param v  线段的端点
     * @param t  倍数
     */
    function mult(w, v, t) {
        var m = [];
        m[0] = (w[0] - v[0]) * t + v[0];
        m[1] = (w[1] - v[1]) * t + v[1];
        return m;
    }

    /**
     * 点是否在已缓存的线上
     * @param p  已缓存的点
     * @param line    传入的图形
     * @param radius   误差半径
     */
    function pointIntersectsBufferedLineex(p, line, radius) {
        var radiusSquared = radius * radius;
        if (line.length === 1) {
            return distSqr(line[0],p) < radiusSquared;
        }
        for (var i = 1; i < line.length; i++) {
            var v = line[i - 1], w = line[i];
            if (distToSegmentSquaredex(p, v, w) < radiusSquared) {
                return true;
            }
        }
        return false;
    }

    /**
     * 传入点与缓存的点是否重合
     * @param polygon  传入点
     * @param point    有可能的缓存点
     * @param radius   误差半径
     */
    function polygonIntersectsBufferedPointex(polygon, point, radius) {
        if(pointToPointsDis(polygon,point,radius)) {return true; };
        if (polygonContainsPointex(polygon, point)) { return true; };
        if (pointIntersectsBufferedLineex(point, polygon, radius)) { return true; };
        return false;
    }

    /**
     * 判断线线是否相交
     * @param lineA  线1
     * @param lineB  线2
     * @param radius  误差半径
     */
    function lineIntersectsBufferedLineex(lineA, lineB, radius) {
        if (lineA.length > 1) {
            if (lineIntersectsLineex(lineA, lineB)) {
                return true;
            }
            for (var j = 0; j < lineB.length; j++) {
                if (pointIntersectsBufferedLineex(lineB[j], lineA, radius)) {
                    return true;
                }
            }
        }
        for (var k = 0; k < lineA.length; k++) {
            if (pointIntersectsBufferedLineex(lineA[k], lineB, radius)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 判断传入点是否在多边形的内部
     * @param rings  多边形的数据
     * @param p    传入点
     */
    function multiPolygonContainsPointex(rings, p) {
        var c = false,
            ring, p1, p2;
        for (var k = 0; k < rings.length; k++) {
            ring = rings[k];
            for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
                p1 = ring[i];
                p2 = ring[j];
                if (((p1[1] > p.y) !== (p2[1] > p.y)) && (p.x < (p2[0] - p1[0]) * (p.y - p1[1]) / (p2[1] - p1[1]) + p1[0])) {
                    c = !c;
                }
            }
        }
        return c;
    }

    function polygonIntersectsMultiPointex(polygon, multiPoints, symbol, resolution, radius) {
        var points = multiPoints.points;
        var inPoint = polygon[0];
        for(var i = 0; i < points.length; i++) {
            var pointItem = points[i];
            if(pointToArrDis(inPoint, pointItem, radius)) {return true};
            if(polygonContainsPointex(inPoint, pointItem, radius)) {return true};
        }   
        return false;
    }

    /**
     * 判断传入点与缓存中符合的设备是否重合
     * @param queryGeometry   传入的图形
     * @param geometry  符合范围的缓存点
     * @param symbol    图形，点的对比中用不到
     * @param resolution   分辨率
     * @param radius    误差半径
     * @param viewpoint   几率当前视图信息的变量
     */
    function polygonIntersectsPointex(queryGeometry, geometry, symbol, resolution, radius, viewpoint) {
        var transformedPolygon = queryGeometry;
        var transformedPoint = geometry;
        var transformedSize = radius * resolution;
        if(polygonIntersectsBufferedPointex(transformedPolygon, transformedPoint, transformedSize)) { return true; }
    }

    /**
     * 判断传入点是否在缓存中符合的设备上
     * @param polygon    传入的图形
     * @param multiLine   范围包含传入点的缓存线
     * @param symbol       图像，主要取其中的宽度
     * @param resolution    分辨率
     */
    function polygonIntersectsBufferedMultiLineex(polygon, multiLine, symbol, resolution) {
        multiLine = multiLine.paths;
        var radius = symbol.width * resolution / 2;
        for (var i = 0; i < multiLine.length; i++) {
            var line = multiLine[i];

            for (var k = 0; k < line.length; k++) {
                if (polygonContainsPointex(polygon, line[k])) {
                    return true;
                }
            }

            if (lineIntersectsBufferedLineex(polygon, line, radius)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 判断传入点是否在缓存中符合的多边形设备上
     * @param polygon    传入的图形
     * @param multiPolygon   范围包含传入点的缓存多边形
     */
    function polygonIntersectsMultiPolygonex(polygon, multiPolygon) {
        multiPolygon = multiPolygon.rings;
        if (polygon.length === 1) {
            return multiPolygonContainsPointex(multiPolygon, polygon[0]);
        }
        for (var m = 0; m < multiPolygon.length; m++) {
            var ring = multiPolygon[m];
            for (var n = 0; n < ring.length; n++) {
                if (polygonContainsPointex(polygon, ring[n])) {
                    return true;
                }
            }
        }
        for (var i = 0; i < polygon.length; i++) {
            if (multiPolygonContainsPointex(multiPolygon, polygon[i])) {
                return true;
            }
        }
        for (var k = 0; k < multiPolygon.length; k++) {
            if (lineIntersectsLineex(polygon, multiPolygon[k])) {
                return true;
            }
        }
        return false;
    }

   
    exports.lineex = polygonIntersectsBufferedMultiLineex;
    exports.polygonex = polygonIntersectsMultiPolygonex;
    exports.pointex = polygonIntersectsPointex;
    exports.multipointex = polygonIntersectsMultiPointex;
})