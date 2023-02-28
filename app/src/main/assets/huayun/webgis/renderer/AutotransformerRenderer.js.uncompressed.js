define("com/huayun/webgis/renderer/AutotransformerRenderer", [
    './LineRenderer',
    './CircleRenderer',
    '../geometry/Point',
    '../geometry/Polyline',
    '../utils/MathUtils',
    '../geometry/Multipoint',
    '../utils/geometryGenerate'
], function(LineRenderer, CircleRenderer, Point, Polyline, MathUtils, Multipoint, geometryGenerate) {
    function AutotransformerRenderer() {
        this.lineRenderer = new LineRenderer();
        this.circleRenderer = new CircleRenderer();
        this._newP = new Point();
    }

    AutotransformerRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        var points = geometry.points, hConnModePoint, mConnModePoint, lConnModePoint, centerPoint;
        if(symbol.tap === true) {
            hConnModePoint = points[0];
            mConnModePoint = points[1];
            lConnModePoint = points[2];
            centerPoint = points[3];
        } else {
            hConnModePoint = points[0];
            mConnModePoint = new Point();
            lConnModePoint = points[1];
            centerPoint = points[2];
        }
        var hlRadian = hConnModePoint.radian(lConnModePoint),
            lhRadian = lConnModePoint.radian(hConnModePoint),
            hlConnDis = hConnModePoint.dist(lConnModePoint),
            lConnNodePoint, lConnCirclePoint, hConnNodePoint, hConnCirclePoint,
            radiusCountRefer, radius, lhConnCircleDis, hConnNodeLineLength,
            countRefer = (0.3 + 0.6 + 1.5 + 1.5 - 0.3 + 0.3),
            lConnNodeLineLength = hlConnDis * 0.3 / countRefer,
            dis = 0.45 * hlConnDis / countRefer;
        graphic.hlDis = hlConnDis;
        graphic.hlRadian = hlRadian;
        graphic.lhRadian = lhRadian;

        if(symbol.subtype === '100') {
            var ratio = hlConnDis / countRefer;
            radiusCountRefer = 1.5 / 2;    // 半径计算标准0.75
            graphic.ratio = ratio;
            radius = ratio * radiusCountRefer;     // 计算半径
            graphic.circleRadius = radius;
            lhConnCircleDis = 1.2 * ratio;		// 高压侧和低压侧圆心长度
            hConnNodeLineLength = 1.35 * ratio;
            lConnNodePoint = lConnModePoint.calculateOtherPoint(lConnNodeLineLength, lhRadian);	// 低压侧节点坐标
            lConnCirclePoint = lConnNodePoint.calculateOtherPoint(radius, lhRadian);	// 低压侧圆心
            hConnCirclePoint = lConnCirclePoint.calculateOtherPoint(lhConnCircleDis, lhRadian);// 高压侧圆心
            hConnNodePoint = hConnCirclePoint.calculateOtherPoint(hConnNodeLineLength, lhRadian);	// 高压侧节点坐标
            var hlCenter = new Point((lConnNodePoint.x + hConnNodePoint.x)/2, (lConnNodePoint.y + hConnNodePoint.y)/2);
            graphic.hlCenter = hlCenter;
            var r = view.resolution;

            symbol.symbols[1].setRadius(radius);
            symbol.symbols[1].setStrokeWidth(symbol.symbols[1].strokeWidth * ratio / r);
            this.circleRenderer.add(view, graphic, new Point(lConnCirclePoint.x, lConnCirclePoint.y), symbol.symbols[1]);

            var hTangencyPoint = hConnCirclePoint.calculateOtherPoint3(hConnModePoint, radius);        // 高压侧切点坐标
            var htCenterPoint = hConnNodePoint.interpolate(hTangencyPoint, 0.5);              // 高压侧节点和切点的中点坐标
            var anchorPoint = htCenterPoint.calculateOtherPoint3(hConnNodePoint, radius * 0.6);      // 锚点

            var graphicPath = geometryGenerate.generateBezierCurve(hTangencyPoint, anchorPoint, hConnNodePoint, 100);

            var polyline = new Polyline([
                [
                    hConnModePoint,
                    hConnNodePoint
                ],
                [
                    lConnModePoint,
                    lConnNodePoint
                ],
                graphicPath.path[0]
            ]);

            var width = symbol.symbols[1].strokeWidth * ratio / r;
            symbol.symbols[0].setWidth(width);
            this.lineRenderer.add(view, graphic, polyline, symbol.symbols[0]);

            symbol.symbols[2].setRadius(radius);
            symbol.symbols[2].setStrokeWidth(symbol.symbols[2].strokeWidth * ratio / r);
            this.circleRenderer.add(view, graphic, new Point(hConnCirclePoint.x, hConnCirclePoint.y), symbol.symbols[2]);
            var polyPaths = [];
            var neutralPointArr = [];

            var centerPoint = hConnCirclePoint.interpolate(lConnCirclePoint, 0.5);
            if(symbol.tap === true ) {
                var newPoint =  htCenterPoint.interpolate(anchorPoint, 0.5);
                // var arcCircle = this.getArcCircle(hConnNodePoint, hTangencyPoint, newPoint);
                // var arcRadius = Math.sqrt((hConnNodePoint.x - arcCircle.x) * (hConnNodePoint.x - arcCircle.x) + (hConnNodePoint.y - arcCircle.y) * (hConnNodePoint.y - arcCircle.y));
                // this._newP = this.getIntersection(mConnModePoint, htCenterPoint, arcCircle, arcRadius);
                this._newP = newPoint;
            }
            this.drawConectionTypeMethod(symbol, hConnModePoint, hConnCirclePoint, lConnCirclePoint, centerPoint, radius, hlRadian, lhRadian, ratio, polyPaths, neutralPointArr);
            if(symbol.tap === true) {
                this.drawTapMethod(mConnModePoint, this._newP, ratio, polyPaths);
            }
            this.lineRenderer.add(view, graphic, new Polyline(polyPaths), symbol.symbols[0]);
            if(neutralPointArr.length > 0) {
                symbol.symbols[3].setRadius(graphic.circleRadius/r);
                symbol.symbols[3].setStrokeWidth(symbol.symbols[3].strokeWidth / r);
                this.circleRenderer.add(view, graphic, new Multipoint(neutralPointArr), symbol.symbols[3]);
            }
        } else if (symbol.subtype === '101') {
            // debugger;
            countRefer -= 1.2;
            var ratio = hlConnDis / countRefer;
            graphic.ratio = ratio;
            radiusCountRefer = 1.5 / 2;	// 半径计算标准0.75
            radius = ratio * radiusCountRefer;		// 计算半径
            graphic.circleRadius = radius;
            lConnNodePoint = lConnModePoint.calculateOtherPoint(lConnNodeLineLength, lhRadian);	// 低压侧节点坐标
            lConnCirclePoint = lConnNodePoint.calculateOtherPoint(radius, lhRadian);	// 低压侧圆心
            hConnNodeLineLength = 1.35 * ratio;
            hConnNodePoint = lConnCirclePoint.calculateOtherPoint(hConnNodeLineLength, lhRadian);	// 高压侧节点坐标
            var hlCenter = new Point((lConnNodePoint.x + hConnNodePoint.x)/2, (lConnNodePoint.y + hConnNodePoint.y)/2);
            graphic.hlCenter = hlCenter;
            var r = view.resolution;

            symbol.symbols[1].setRadius(radius);
            symbol.symbols[1].setStrokeWidth(symbol.symbols[1].strokeWidth * ratio / r);
            this.circleRenderer.add(view, graphic, new Point(lConnCirclePoint.x, lConnCirclePoint.y), symbol.symbols[1]);

            var lTangencyPoint = lConnCirclePoint.calculateOtherPoint3(hConnModePoint, radius);
            var htCenterPoint = hConnNodePoint.interpolate(lTangencyPoint, 0.5);
            var anchorPoint = htCenterPoint.calculateOtherPoint3(hConnNodePoint, radius * 0.6);

            var graphicPath = geometryGenerate.generateBezierCurve(lTangencyPoint, anchorPoint, hConnNodePoint, 100)

            var polyline = new Polyline([
                [
                    hConnModePoint,
                    hConnNodePoint
                ],
                [
                    lConnModePoint,
                    lConnNodePoint
                ],
                graphicPath.path[0]
            ]);

            var width = symbol.symbols[1].strokeWidth * ratio / r;
            symbol.symbols[0].setWidth(width);
            this.lineRenderer.add(view, graphic, polyline, symbol.symbols[0]);
            var polyPaths = [];
            var neutralPointArr = [];

            var lStartPoint;
            switch (symbol.lConnMode) {
                case 'y':
                    lStartPoint = lConnCirclePoint.calculateOtherPoint2(dis, hlRadian);
                    this.drawStarMethod(lConnCirclePoint, lStartPoint, lhRadian, ratio, polyPaths);
                    break;
                case 'd':
                    this.drawTriangleMethod(lConnCirclePoint, radius, hlRadian, lhRadian, ratio, polyPaths);
                    break;
                case 'z':
                    this.drawCirCuitousMethod(lConnCirclePoint, radius, hlRadian, lhRadian, ratio, polyPaths);
                    break;
                case 'yn':
                    lStartPoint = lConnCirclePoint.calculateOtherPoint(dis, hlRadian);
                    this.drawStarMethod(lConnCirclePoint, lStartPoint, lhRadian, ratio, polyPaths);
                    this.drawNeutralPointMethod(hConnModePoint, lConnCirclePoint, radius, ratio, polyPaths, neutralPointArr);
                    break;
                case 'zn':
                    this.drawCirCuitousMethod(lConnCirclePoint, radius, hlRadian, lhRadian, ratio, polyPaths);
                    this.drawNeutralPointMethod(hConnModePoint, lConnCirclePoint, radius, ratio, polyPaths, neutralPointArr);
                    break;
            }
            if(symbol.onLoad === true) {
                this.drawOnLoadMethod(lConnCirclePoint, radius, ratio, hlRadian, lhRadian, polyPaths);
            }
            this.lineRenderer.add(view, graphic, new Polyline(polyPaths), symbol.symbols[0]);
            if(neutralPointArr.length > 0) {
                symbol.symbols[3].setRadius(graphic.circleRadius/r);
                symbol.symbols[3].setStrokeWidth(symbol.symbols[3].strokeWidth / r);
                this.circleRenderer.add(view, graphic, new Multipoint(neutralPointArr), symbol.symbols[3]);
            }
        } else if (symbol.subtype === '102') {
            var ratio = hlConnDis / countRefer;
            radiusCountRefer = 1.2 / 2;	// 半径计算标准0.6
            graphic.ratio = ratio;
            radius = ratio * radiusCountRefer;		// 计算半径
            graphic.circleRadius = radius;
            lhConnCircleDis = 0.9 * ratio;		// 高压侧和低压侧圆心长度
            hConnNodeLineLength = 1.2 * ratio;
            lConnNodePoint = lConnModePoint.calculateOtherPoint(lConnNodeLineLength, lhRadian);// 低压侧节点坐标
            // 低压侧点到低压侧圆心的距离
            var lConnModeLCircleLength = 1.5 * ratio;
            lConnCirclePoint = lConnModePoint.calculateOtherPoint(lConnModeLCircleLength, lhRadian);// 低压侧圆心
            hConnCirclePoint = lConnCirclePoint.calculateOtherPoint(lhConnCircleDis, lhRadian);// 高压侧圆心
            hConnNodePoint = hConnCirclePoint.calculateOtherPoint(hConnNodeLineLength, lhRadian);	// 高压侧节点坐标
            var hlCenter = new Point((lConnNodePoint.x + hConnNodePoint.x)/2, (lConnNodePoint.y + hConnNodePoint.y)/2);
            graphic.hlCenter = hlCenter;
            var r = view.resolution;

            symbol.symbols[1].setRadius(radius);
            symbol.symbols[1].setStrokeWidth(symbol.symbols[1].strokeWidth * ratio / r);
            this.circleRenderer.add(view, graphic, new Point(hConnCirclePoint.x, hConnCirclePoint.y), symbol.symbols[1]);

            var hTangencyPoint = hConnCirclePoint.calculateOtherPoint3(hConnModePoint, radius);
            var lTangencyPoint = lConnCirclePoint.calculateOtherPoint3(hConnModePoint, radius);
            var centerPoint = hConnModePoint.interpolate(lConnModePoint, 0.5);
            var htCenterPoint = hConnModePoint.interpolate(hTangencyPoint, 0.5);
            var ltCenterPoint = lConnModePoint.interpolate(lTangencyPoint, 0.5);
            var hAnchorPoint = htCenterPoint.calculateOtherPoint3(hConnNodePoint, radius * 0.6);
            var lAnchorPoint = ltCenterPoint.calculateOtherPoint3(lConnNodePoint, radius * 0.6);

            var graphicPath = geometryGenerate.generateBezierCurve(hTangencyPoint, hAnchorPoint, hConnNodePoint, 100);
            var graphicPath1 = geometryGenerate.generateBezierCurve(lTangencyPoint, lAnchorPoint, lConnNodePoint, 100);

            var polyline = new Polyline([
                [
                    hConnModePoint,
                    hConnNodePoint
                ],
                [
                    lConnModePoint,
                    lConnNodePoint
                ],
                graphicPath.path[0],
                graphicPath1.path[0]
            ]);

            var width = symbol.symbols[1].strokeWidth * ratio / r;
            symbol.symbols[0].setWidth(width);
            this.lineRenderer.add(view, graphic, polyline,symbol.symbols[0]);

            symbol.symbols[2].setRadius(radius);
            symbol.symbols[2].setStrokeWidth(symbol.symbols[2].strokeWidth * ratio / r);
            this.circleRenderer.add(view, graphic, new Point(lConnCirclePoint.x, lConnCirclePoint.y), symbol.symbols[2]);
            var polyPaths = [];
            var neutralPointArr = [];

            this.drawConectionTypeMethod(symbol, hConnModePoint, hConnCirclePoint, lConnCirclePoint, centerPoint, radius, hlRadian, lhRadian, ratio, polyPaths, neutralPointArr);
            this.lineRenderer.add(view, graphic, new Polyline(polyPaths), symbol.symbols[0]);
            if(neutralPointArr.length > 0) {
                symbol.symbols[3].setRadius(graphic.circleRadius/r);
                symbol.symbols[3].setStrokeWidth(symbol.symbols[3].strokeWidth / r);
                this.circleRenderer.add(view, graphic, new Multipoint(neutralPointArr), symbol.symbols[3]);
            }
        }
    };

    AutotransformerRenderer.prototype.draw = function(view, graphic, geometry, symbol, layerView) {
        var r = view.resolution;
        var ratio = graphic.ratio;
        var width = symbol.symbols[1].strokeWidth * ratio / r;
        if(width < 1) width = 1;

        symbol.symbols[0].setWidth(width);
        this.lineRenderer.draw(view, graphic, geometry, symbol.symbols[0], layerView, 1);

        var radius = graphic.circleRadius / r;
        if(radius < 1) radius = 1;
        symbol.symbols[1].setRadius(radius);
        symbol.symbols[1].setStrokeWidth(symbol.symbols[1].strokeWidth * ratio / r);
        this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[1], layerView, 0, true);

        if(graphic.buckets.length > 3) {
            symbol.symbols[2].setRadius(radius);
            symbol.symbols[2].setStrokeWidth(symbol.symbols[2].strokeWidth *ratio / r);
            this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[2], layerView, 2, true);
        }

        var color = symbol.symbols[1].uniforms.color;
        symbol.symbols[1].uniforms.color = [0,0,0,0];
        this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[1], layerView, 0, true);
        symbol.symbols[1].uniforms.color = color;

        if(graphic.buckets.length > 4){
            var color = symbol.symbols[2].uniforms.color;
            symbol.symbols[2].uniforms.color = [0,0,0,0];
            this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[2], layerView, 2, true);
            symbol.symbols[2].uniforms.color = color;
        }
        if(graphic.buckets.length > 3) {
            this.lineRenderer.draw(view, graphic, geometry, symbol.symbols[0], layerView, 3);
            if(symbol.symbols[3].radius !== 10) {
                symbol.symbols[3].setRadius(graphic.circleRadius);
                symbol.symbols[3].setStrokeWidth(symbol.symbols[3].strokeWidth);
                this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[3], layerView, 4, true);
            }
        } else {
            this.lineRenderer.draw(view, graphic, geometry, symbol.symbols[0], layerView, 2);
            if(symbol.symbols[3].radius !== 10) {
                symbol.symbols[3].setRadius(graphic.circleRadius);
                symbol.symbols[3].setStrokeWidth(symbol.symbols[3].strokeWidth);
                this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[3], layerView, 3, true);
            }
        }
    };

    AutotransformerRenderer.prototype.drawGlow = function() {};

    AutotransformerRenderer.prototype.getIntersection = function(p1, p2, circlePoint, radius) {
        var result,
            k = (p2.y - p1.y) / (p2.x - p1.x),
            b = p2.y - k * p2.x,
            x1, y1, x2, y2,
            cx = circlePoint.x,
            cy = circlePoint.y,
            c = cx * cx + (b - cy) * (b - cy) - radius * radius,
            a = (1 + k * k),
            b1 = (2 * cx - 2 * k * (b - cy)),
            tmp = Math.sqrt(b1 * b1 - 4 * a * c);
        x1 = (b1 + tmp) / (2 * a);
        y1 = k * x1 + b;
        x2 = (b1 - tmp) / (2 * a);
        y2 = k * x2 + b;

        if ((x1 > p2.x && x1 < p1.x) || (y1 > p1.y && y1 < p2.y)) {
            result = new Point(x1, y1);
        } else {
            result = new Point(x2, y2);
        }
        return result;
    };

    AutotransformerRenderer.prototype.getArcCircle = function(p1, p2, p3) {
        var x1 = p1.x, x2 = p2.x, x3 = p3.x,
            y1 = p1.y, y2 = p2.y, y3 = p3.y,
            a = x1 - x2, b = y1 - y2,
            c = x1 - x3, d = y1 - y3,
            e = ((x1 * x1 - x2 * x2) + (y1 * y1 - y2 * y2)) / 2,
            f = ((x1 * x1 - x3 * x3) + (y1 * y1 - y3 * y3)) / 2,
            det = b * c - a * d;
            result,
            cx = -(d * e - b * f) / det,
            cy = -(a * f - c * e) / det;

        result = new Point(cx, cy);
        return result;
    };

    AutotransformerRenderer.prototype.drawConectionTypeMethod = function(symbol, hConnModePoint, hConnCirclePoint, lConnCirclePoint, centerPoint,
                                                                        radius, hlRadian, lhRadian, ratio, polyPaths, neutralPointArr) {
        var hStartPoint, lStartPoint, tempPoint, tempDis;
        switch (symbol.hConnMode) {
            case 'Y':
                hStartPoint = lConnCirclePoint.calculateOtherPoint(radius, lhRadian);
                this.drawStarMethod(hConnCirclePoint, hStartPoint, lhRadian, ratio, polyPaths);
                break;
            case 'D':
                this.drawTriangleMethod(hConnCirclePoint, radius, hlRadian, lhRadian, ratio, polyPaths);
                break;
            case 'Z':
                this.drawCirCuitousMethod(hConnCirclePoint, radius, hlRadian, lhRadian, ratio, polyPaths);
                break;
            case 'YN':
                hStartPoint = lConnCirclePoint.calculateOtherPoint(radius, lhRadian);
                this.drawStarMethod(hConnCirclePoint, hStartPoint, lhRadian, ratio, polyPaths);
                this.drawNeutralPointMethod(hConnModePoint, hConnCirclePoint, radius, ratio, polyPaths, neutralPointArr);
                break;
            case 'ZN':
                this.drawCirCuitousMethod(hConnCirclePoint, radius, hlRadian, lhRadian, ratio, polyPaths);
                this.drawNeutralPointMethod(hConnModePoint, hConnCirclePoint, radius, ratio, polyPaths, neutralPointArr);
                break;
        }

        switch (symbol.lConnMode) {
            case 'y':
                tempPoint = hConnCirclePoint.calculateOtherPoint(radius, hlRadian);
                tempDis = tempPoint.dist(lConnCirclePoint);
                lStartPoint = lConnCirclePoint.calculateOtherPoint(tempDis, hlRadian);
                this.drawStarMethod(lConnCirclePoint, lStartPoint, lhRadian, ratio, polyPaths);
                break;
            case 'd':
                this.drawTriangleMethod(lConnCirclePoint, radius, hlRadian, lhRadian, ratio, polyPaths);
                break;
            case 'z':
                this.drawCirCuitousMethod(lConnCirclePoint, radius, hlRadian, lhRadian, ratio, polyPaths);
                break;
            case 'yn':
                tempPoint = hConnCirclePoint.calculateOtherPoint(radius, hlRadian);
                tempDis = tempPoint.dist(lConnCirclePoint);
                lStartPoint = lConnCirclePoint.calculateOtherPoint(tempDis, hlRadian);
                this.drawStarMethod(lConnCirclePoint, lStartPoint, lhRadian, ratio, polyPaths);
                this.drawNeutralPointMethod(hConnModePoint, lConnCirclePoint, radius, ratio, polyPaths, neutralPointArr);
                break;
            case 'zn':
                this.drawCirCuitousMethod(lConnCirclePoint, radius, hlRadian, lhRadian, ratio, polyPaths);
                this.drawNeutralPointMethod(hConnModePoint, lConnCirclePoint, radius, ratio, polyPaths, neutralPointArr);
                break;
        }
        if (symbol.onLoad === true) { // 有载
            this.drawOnLoadMethod(centerPoint, radius, ratio, hlRadian, lhRadian, polyPaths);
        }
    };

    AutotransformerRenderer.prototype.drawStarMethod = function(circlePoint, startPoint, lhRadian, ratio, polyPaths) {
        var r = circlePoint.dist(startPoint),
            halfDis = r * Math.sqrt(3) / 2,	// 边长的一半
            hCenterPoint = circlePoint.calculateOtherPoint(r * 0.5, lhRadian),	// 正三角形垂直底边点坐标
            tempPoint = circlePoint.calculateOtherPoint2(hCenterPoint, halfDis),
            rightPoit = tempPoint.calculateOtherPoint2(circlePoint, r * 0.5),
            leftPoit = hCenterPoint.calculateOtherPoint2(circlePoint, halfDis);
        polyPaths.push([circlePoint, startPoint]);
        polyPaths.push([circlePoint, rightPoit]);
        polyPaths.push([circlePoint, leftPoit]);
    };

    AutotransformerRenderer.prototype.drawTriangleMethod = function(circlePoint, radius, hlRadian, lhRadian, ratio, polyPaths) {
        var r1 = radius * Math.sqrt(3) / 3,	// 等边三角形外接圆的半径
            halfDis = r1 * Math.sqrt(3) / 2,	// 边长的一半
            topPoint = circlePoint.calculateOtherPoint(r1, lhRadian),
            hCenterPoint = circlePoint.calculateOtherPoint(r1 * 0.5, hlRadian),	// 正三角形垂直底边点坐标
            rightPoit = hCenterPoint.calculateOtherPoint2(circlePoint, halfDis),	// 正三角形右底边点坐标
            tempPoint = circlePoint.calculateOtherPoint2(hCenterPoint, halfDis),
            leftPoit = tempPoint.calculateOtherPoint2(circlePoint, r1 * 0.5);	// 正三角形左底边点坐标
        polyPaths.push([topPoint, rightPoit, leftPoit, topPoint]);
    };

    AutotransformerRenderer.prototype.drawCirCuitousMethod = function(circlePoint, radius, hlRadian, lhRadian, ratio, polyPaths) {
        var circleToBreakPointDis = 2 * radius / 5,	// 圆心到折点的长度
            halfDis = circleToBreakPointDis * Math.sqrt(3) / 2,	// 边长的一半
            topPoint = circlePoint.calculateOtherPoint(circleToBreakPointDis, lhRadian),
            hCenterPoint = circlePoint.calculateOtherPoint(circleToBreakPointDis * 0.5, hlRadian),	// 正三角形垂直底边点坐标
            rightPoit = hCenterPoint.calculateOtherPoint2(circlePoint, halfDis),
            tempPoint = circlePoint.calculateOtherPoint2(hCenterPoint, halfDis),
            leftPoit = tempPoint.calculateOtherPoint2(circlePoint, circleToBreakPointDis * 0.5),
            tempPoint1 = circlePoint.calculateOtherPoint2(topPoint, halfDis),
            tempPoint2 = tempPoint1.calculateOtherPoint2(circlePoint, circleToBreakPointDis),
            topBreakPoint = tempPoint2.calculateOtherPoint2(topPoint, circleToBreakPointDis * 0.5),
            hCenterPoint1 = circlePoint.calculateOtherPoint(circleToBreakPointDis * 1.5, hlRadian),	// 正三角形垂直底边对称延长点坐标
            rightBreakPoint = hCenterPoint1.calculateOtherPoint2(hCenterPoint, halfDis),
            hcplpRadian = hCenterPoint.dist(leftPoit),
            tempPoint3 = leftPoit.calculateOtherPoint(halfDis, hcplpRadian),
            tempPoint4 = leftPoit.calculateOtherPoint2(tempPoint3, circleToBreakPointDis * 0.5),
            leftBreakPoint = tempPoint4.calculateOtherPoint2(leftPoit, halfDis);
        polyPaths.push([circlePoint, topPoint, topBreakPoint]);
        polyPaths.push([circlePoint, rightPoit, rightBreakPoint]);
        polyPaths.push([circlePoint, leftPoit, leftBreakPoint]);
    };

    AutotransformerRenderer.prototype.drawNeutralPointMethod = function(connModePoint, circlePoint, radius, ratio, polyPaths, neutralPointArr) {
        var r2 = 2 * radius / 5;
        neutralPointArr.push(new Point(circlePoint.x, circlePoint.y));
        var neutralPoint = circlePoint.calculateOtherPoint2(connModePoint, r2);
        polyPaths.push([circlePoint, neutralPoint]);
    };

    AutotransformerRenderer.prototype.drawOnLoadMethod = function(centerPoint, radius, ratio, hlRadian, lhRadian, polyPaths) {
        var circleCenterLength = 1.35 * 0.5 * ratio,
            startPoint, endPoint, topLeftPoint, bottomRigntPoint,
            tempPoint1 = centerPoint.calculateOtherPoint(circleCenterLength, hlRadian),
            tempPoint2 = centerPoint.calculateOtherPoint3(tempPoint1, circleCenterLength * Math.sqrt(3));
        startPoint = tempPoint2.calculateOtherPoint3(centerPoint, circleCenterLength);
        var startEndRadians = startPoint.radian(centerPoint),	// 起点和终点的夹角
            startCenterDis = circleCenterLength * 2;	// 起点和中点的距离
        endPoint = centerPoint.calculateOtherPoint(startCenterDis, startEndRadians);
        var tempPoint3 = centerPoint.calculateOtherPoint(startCenterDis * 0.7, startEndRadians);
        bottomRigntPoint = tempPoint3.calculateOtherPoint3(endPoint, startCenterDis * 0.04);
        var tempPoint4 = endPoint.calculateOtherPoint3(tempPoint3, startCenterDis * 0.04);
        topLeftPoint = tempPoint4.calculateOtherPoint3(endPoint, startCenterDis * 0.3);
        polyPaths.push([startPoint, endPoint]);
        polyPaths.push([endPoint, topLeftPoint, bottomRigntPoint, endPoint]);
    };

    AutotransformerRenderer.prototype.drawTapMethod = function(hTangencyPoint, htCenterPoint, ratio, polyPaths) {
        polyPaths.push([hTangencyPoint, htCenterPoint]);
    };

    AutotransformerRenderer.prototype.calculateExtent = function(view, graphic, geometry, symbol, result) {
        var circleRadius = graphic.circleRadius,
            hlHalfDis = graphic.hlDis / 2,
            halfhlRadian = graphic.hlRadian / 2;
        var points = [
            {
                x: hlHalfDis,
                y: circleRadius
            },
            {
                x: -hlHalfDis,
                y: circleRadius
            },
            {
                x: -hlHalfDis,
                y: -circleRadius
            },
            {
                x: hlHalfDis,
                y: -circleRadius
            }
        ]

        var extent = MathUtils.sizeAfterRotated(points, halfhlRadian);
        var drawCenter = graphic.hlCenter;

        result.push({
            id: graphic.id,
            g: graphic,
            minX: drawCenter.x + extent.xmin,
            minY: drawCenter.y + extent.ymin,
            maxX: drawCenter.x + extent.xmax,
            maxY: drawCenter.y + extent.ymax,
        });
    };

    return AutotransformerRenderer;
});
