define("com/huayun/webgis/renderer/TwoCoiltransformerRenderer", [
    "./LineRenderer",
    "./CircleRenderer",
    "../geometry/Point",
    "../geometry/Polyline",
    "../geometry/Multipoint",
    "../utils/MathUtils",
    "../gl/programCache"
], function (LineRenderer, CircleRenderer, Point, Polyline, Multipoint, MathUtils, programCache) {
    function TwoCoiltransformerRenderer() {
        this.lineRenderer = new LineRenderer();
        this.circleRenderer = new CircleRenderer();
    }

    TwoCoiltransformerRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = symbol.symbols[i];
            if (symbol.minScale) {
                s.minScale = symbol.minScale;
            }
            if (symbol.maxScale) {
                s.maxScale = symbol.maxScale;
            }
            if (symbol.isFixed !== undefined) {
                s.isFixed = symbol.isFixed;
            }
            if (symbol.fixed) {
                s.fixed = symbol.fixed;
            }
            if (symbol.markerSize) {
                s.markerSize = symbol.markerSize;
            }
        }
        var points = geometry.points,
            hConnModePoint = points[0], // 高压侧点
            lConnModePoint = points[1], // 低压侧点
            drawDistance = hConnModePoint.dist(lConnModePoint), // 高压侧到低压侧的线段长度
            countRefer = (0.3 + 1.5 - 0.3 + 1.5 + 0.3), // 根据图形标准计算出一个比例3.3
            ratio = drawDistance / countRefer,
            hlRadian = hConnModePoint.radian(lConnModePoint), // 以高压侧为角点到低压侧点所形成的夹角
            lhRadian = lConnModePoint.radian(hConnModePoint), // 以低压侧为角点到高压侧点所形成的夹角
            outer = 2,
            drawLConnModePoint = hConnModePoint.calculateOtherPoint(drawDistance, hlRadian),// 依据真实绘制线段长度计算出绘制低压侧点坐标
            drawCenterPoint = hConnModePoint.interpolate(drawLConnModePoint, 0.5);          // 依据真实绘制线段长度计算出中点坐标
        graphic.lhRadian = lhRadian;
        graphic.drawCenterPoint = drawCenterPoint;
        this.calculateDrawPointMethod(drawDistance, hConnModePoint, drawLConnModePoint, drawCenterPoint, hlRadian, lhRadian, ratio, view, graphic, geometry, symbol);

    };

    TwoCoiltransformerRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView) {
        var r = view.resolution;
        var ratio = graphic.ratio;
        var width = symbol.symbols[1].strokeWidth * ratio / r;
        if (width < 1) width = 1;

        symbol.symbols[0].setWidth(width);
        this.lineRenderer.draw(view, graphic, geometry, symbol.symbols[0], layerView, 2, true);

        var strokeWidth = graphic.circleRadius / r;
        if (strokeWidth < 1) strokeWidth = 1;
        symbol.symbols[1].setRadius(strokeWidth);
        symbol.symbols[1].setStrokeWidth(symbol.symbols[1].strokeWidth * ratio / r);
        this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[1], layerView, 0, true);

        symbol.symbols[2].setRadius(strokeWidth);
        symbol.symbols[2].setStrokeWidth(symbol.symbols[2].strokeWidth * ratio / r);
        this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[2], layerView, 1, true);

        /*var color = symbol.symbols[1].uniforms.color;
        symbol.symbols[1].uniforms.color = [0,0,0,0];*/
        var color = symbol.symbols[1].color;
        symbol.symbols[1].color = [0, 0, 0, 0];
        this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[1], layerView, 0, true);
        symbol.symbols[1].color = color;

        color = symbol.symbols[2].color;
        symbol.symbols[2].color = [0, 0, 0, 0];
        this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[2], layerView, 1, true);
        symbol.symbols[2].color = color;

        /*if(symbol.symbols[3].radius !== 10) {
            symbol.symbols[3].setRadius(graphic.circleRadius);
            symbol.symbols[3].setStrokeWidth(symbol.symbols[3].strokeWidth);
            this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[3], layerView, 4, true);
        }*/
        if(graphic.buckets.length > 3) {
            this.lineRenderer.draw(view, graphic, geometry, symbol.symbols[0], layerView, 3, true);
            symbol.symbols[3].setRadius(graphic.circleRadius/15);
            symbol.symbols[3].setStrokeWidth(symbol.symbols[3].strokeWidth);
            this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[3], layerView, 4, true);
        }
    };

    TwoCoiltransformerRenderer.prototype.drawGlow = function (view, graphic, geometry, symbol, layerView) {
        var glow = graphic.glow;
        if (!glow) return;
        var r = view.resolution;
        var ratio = graphic.ratio;
        var width = symbol.symbols[1].strokeWidth * ratio / r;
        if (width < 1) width = 1;

        symbol.symbols[0].setWidth(width);
        this.lineRenderer.drawGlow(view, graphic, geometry, symbol.symbols[0], layerView, 2, true);

        var strokeWidth = graphic.circleRadius / r;
        if (strokeWidth < 1) strokeWidth = 1;
        symbol.symbols[1].setRadius(strokeWidth);
        symbol.symbols[1].setStrokeWidth(symbol.symbols[1].strokeWidth * ratio / r);
        this.circleRenderer.drawGlow(view, graphic, geometry, symbol.symbols[1], layerView, 0, true);
        symbol.symbols[2].setRadius(strokeWidth);
        symbol.symbols[2].setStrokeWidth(symbol.symbols[2].strokeWidth * ratio / r);
        this.circleRenderer.drawGlow(view, graphic, geometry, symbol.symbols[2], layerView, 1, true);

        /*var color = symbol.symbols[1].uniforms.color;
        symbol.symbols[1].uniforms.color = [0,0,0,0];*/
        var color = symbol.symbols[1].color;
        symbol.symbols[1].color = [0, 0, 0, 0];
        this.circleRenderer.drawGlow(view, graphic, geometry, symbol.symbols[1], layerView, 0, true);
        symbol.symbols[1].color = color;

        color = symbol.symbols[2].color;
        symbol.symbols[2].color = [0, 0, 0, 0];
        this.circleRenderer.drawGlow(view, graphic, geometry, symbol.symbols[2], layerView, 1, true);
        symbol.symbols[2].color = color;

        this.lineRenderer.drawGlow(view, graphic, geometry, symbol.symbols[0], layerView, 3, true);
    };

    TwoCoiltransformerRenderer.prototype.calculateDrawPointMethod = function (hlConnDis, hConnModePoint, lConnModePoint, centerConnModePoint, hlRadian, lhRadian, ratio, view, graphic, geometry, symbol) {
        var circleRadius = ratio * 1.5 / 2,		// 计算出圆的半径
            nodeLineLength = 0.3 * ratio,	// 节点线的长度
            dis = 0.45 * ratio,		// 0.45 Y型线段长度
            lhConnCircleDis = 1.2 * ratio,		// 高压侧和低压侧圆心长度
            hConnNodePoint = hConnModePoint.calculateOtherPoint(nodeLineLength, hlRadian),	// 高压侧节点坐标
            hConnCirclePoint = hConnNodePoint.calculateOtherPoint(circleRadius, hlRadian),// 高压侧圆心
            lConnCirclePoint = hConnCirclePoint.calculateOtherPoint(lhConnCircleDis, hlRadian),	// 低压侧圆心
            lConnNodePoint = lConnCirclePoint.calculateOtherPoint(circleRadius, hlRadian);	// 低压侧节点坐标
        graphic.circleRadius = circleRadius;
        graphic.ratio = ratio;
        graphic.hlConnDis = hlConnDis;
        var r = view.resolution;
        symbol.symbols[2].setRadius(circleRadius / r);
        symbol.symbols[2].setStrokeWidth(symbol.symbols[2].strokeWidth * ratio / r);
        this.circleRenderer.add(view, graphic, new Point(hConnCirclePoint.x, hConnCirclePoint.y), symbol.symbols[2]);

        symbol.symbols[1].setRadius(circleRadius / r);
        symbol.symbols[1].setStrokeWidth(symbol.symbols[1].strokeWidth * ratio / r);
        this.circleRenderer.add(view, graphic, new Point(lConnCirclePoint.x, lConnCirclePoint.y), symbol.symbols[1]);
        // debugger;
        var polyline = new Polyline([
            [
                hConnModePoint, hConnNodePoint
            ],
            [
                lConnModePoint, lConnNodePoint
            ]
        ]);
        // debugger;
        this.lineRenderer.add(view, graphic, polyline, symbol.symbols[0]);
        var polyPaths = [];
        var neutralPointArr = [];
        this.drawConectionTypeMethod(symbol, polyPaths, hConnModePoint, hConnNodePoint, hConnCirclePoint, lConnModePoint, lConnCirclePoint, centerConnModePoint, circleRadius, hlRadian, lhRadian, dis, ratio, neutralPointArr);
        this.lineRenderer.add(view, graphic, new Polyline(polyPaths), symbol.symbols[0]);
        if(neutralPointArr.length > 0) {
            symbol.symbols[3].setRadius(graphic.circleRadius/r);
            symbol.symbols[3].setStrokeWidth(symbol.symbols[3].strokeWidth / r);
            this.circleRenderer.add(view, graphic, new Multipoint(neutralPointArr), symbol.symbols[3]);
        }
    };

    TwoCoiltransformerRenderer.prototype.drawConectionTypeMethod = function (symbol, polyPaths,
                                                                             hConnModePoint, hConnNodePoint, hConnCirclePoint, lConnModePoint, lConnCirclePoint,
                                                                             centerPoint, radius, hlRadian, lhRadian, dis, ratio, neutralPointArr
    ) {
        let hStartPoint, lStartPoint;
        // debugger;
        switch (symbol.hConnMode) {
            case 'Y':
                hStartPoint = lConnCirclePoint.calculateOtherPoint(radius, lhRadian);
                this.drawStarMethod(polyPaths, hConnCirclePoint, hStartPoint, hlRadian, lhRadian);
                break;
            case 'D': // polyPaths, circlePoint, radian, hlRadian, lhRadian
                this.drawTriangleMethod(polyPaths, hConnCirclePoint, radius, hlRadian, lhRadian);
                break;
            case 'Z':
                this.drawCirCuitousMethod(polyPaths, hConnCirclePoint, radius, hlRadian, lhRadian);
                break;
            case 'YN':
                hStartPoint = lConnCirclePoint.calculateOtherPoint(radius, lhRadian);
                this.drawStarMethod(polyPaths, hConnCirclePoint, hStartPoint, hlRadian, lhRadian);
                this.drawNeutralPointMethod(polyPaths, hConnModePoint, hConnCirclePoint, radius, neutralPointArr);
                break;
            case 'ZN':
                this.drawCirCuitousMethod(polyPaths, hConnCirclePoint, radius, hlRadian, lhRadian);
                this.drawNeutralPointMethod(polyPaths, hConnModePoint, hConnCirclePoint, radius, neutralPointArr);
                break;
        }
        switch (symbol.lConnMode) {
            case 'y':
                lStartPoint = lConnCirclePoint.calculateOtherPoint(dis, hlRadian);
                this.drawStarMethod(polyPaths, lConnCirclePoint, lStartPoint, hlRadian, lhRadian);
                break;
            case 'd':
                this.drawTriangleMethod(polyPaths, lConnCirclePoint, radius, hlRadian, lhRadian);
                break;
            case 'z':
                this.drawCirCuitousMethod(polyPaths, lConnCirclePoint, radius, hlRadian, lhRadian);
                break;
            case 'yn':
                lStartPoint = lConnCirclePoint.calculateOtherPoint(dis, hlRadian);
                this.drawStarMethod(polyPaths, lConnCirclePoint, lStartPoint, hlRadian, lhRadian);
                this.drawNeutralPointMethod(polyPaths, hConnModePoint, lConnCirclePoint, radius, neutralPointArr);
                break;
            case 'zn':
                this.drawCirCuitousMethod(polyPaths, lConnCirclePoint, radius, hlRadian, lhRadian);
                this.drawNeutralPointMethod(polyPaths, lConnModePoint, lConnCirclePoint, radius, neutralPointArr);
                break;
        }
        if (symbol.onLoad) { // 有载
            this.drawOnLoadMethod(polyPaths, centerPoint, radius, hlRadian, lhRadian, ratio);
        }
        if (symbol.tapSwitch) { // 有分接开关
            this.drawTapSwitchMethod(polyPaths, centerPoint, radius, hlRadian, lhRadian, ratio);
        }
    };

    TwoCoiltransformerRenderer.prototype.drawStarMethod = function (polyPaths, circlePoint, startPoint, hlRadian, lhRadian) {
        let r = circlePoint.dist(startPoint);
        let halfDis = r * Math.sqrt(3) / 2;	// 边长的一半
        let hCenterPoint = circlePoint.calculateOtherPoint(r * 0.5, lhRadian);	// 正三角形垂直底边点坐标
        let tempPoint = circlePoint.calculateOtherPoint2(hCenterPoint, halfDis);
        let rightPoint = tempPoint.calculateOtherPoint2(circlePoint, r * 0.5);
        let leftPoint = hCenterPoint.calculateOtherPoint2(circlePoint, halfDis);
        polyPaths.push([circlePoint, startPoint]);
        polyPaths.push([circlePoint, rightPoint]);
        polyPaths.push([circlePoint, leftPoint]);
    }

    TwoCoiltransformerRenderer.prototype.drawTriangleMethod = function (polyPaths, circlePoint, radian, hlRadian, lhRadian) {
        let r1 = radian * Math.sqrt(3) / 3;	// 等边三角形外接圆的半径
        let halfDis = r1 * Math.sqrt(3) / 2;	// 边长的一半
        let topPoint = circlePoint.calculateOtherPoint(r1, lhRadian);
        let hCenterPoint = circlePoint.calculateOtherPoint(r1 * 0.5, hlRadian);	// 正三角形垂直底边点坐标
        let rightPoint = hCenterPoint.calculateOtherPoint2(circlePoint, halfDis);	// 正三角形右底边点坐标
        let tempPoint = circlePoint.calculateOtherPoint2(hCenterPoint, halfDis);
        let leftPoint = tempPoint.calculateOtherPoint2(circlePoint, r1 * 0.5);	// 正三角形左底边点坐标
        polyPaths.push([
            topPoint, rightPoint, leftPoint, topPoint
        ]);
    };
    TwoCoiltransformerRenderer.prototype.drawNeutralPointMethod = function (polyPaths, connModePoint, circlePoint, radius, neutralPointArr) {
        let r2 = 2 * radius / 5;
        neutralPointArr.push(new Point(circlePoint.x, circlePoint.y));
        let neutralPoint = circlePoint.calculateOtherPoint2(connModePoint, r2);
        polyPaths.push([circlePoint, neutralPoint]);
    };

    TwoCoiltransformerRenderer.prototype.drawOnLoadMethod = function (polyPaths, centerPoint, radius, hlRadian, lhRadian, ratio) {
        let circleCenterLength = 1.35 * 0.5 * ratio;
        let r1 = radius * 3;
        let startPoint, endPoint, topLeftPoint, bottomRigntPoint;
        // let tempPoint1 = centerPoint.calculateOtherPoint(circleCenterLength, -hlRadian);
        // let tempPoint1 = centerPoint.calculateOtherPoint3(circleCenterLength, hlRadian);
        let tempPoint1 = centerPoint.calculateOtherPoint(circleCenterLength, 180 + hlRadian);
        let tempPoint2 = centerPoint.calculateOtherPoint2(tempPoint1, circleCenterLength * Math.sqrt(3));
        startPoint = tempPoint2.calculateOtherPoint2(centerPoint, circleCenterLength);
        // let tempPoint2 = centerPoint.calculateOtherPoint3(tempPoint1, circleCenterLength * Math.sqrt(3));
        // startPoint = tempPoint2.calculateOtherPoint3(centerPoint, circleCenterLength);
        let startEndRadians = startPoint.radian(centerPoint);	// 起点和终点的夹角
        let startCenterDis = circleCenterLength * 2;	// 起点和中点的距离
        endPoint = centerPoint.calculateOtherPoint(startCenterDis, startEndRadians);
        let tempPoint3 = centerPoint.calculateOtherPoint(startCenterDis * 0.7, startEndRadians);
        bottomRigntPoint = tempPoint3.calculateOtherPoint2(endPoint, startCenterDis * 0.04);
        let tempPoint4 = endPoint.calculateOtherPoint2(tempPoint3, startCenterDis * 0.04);
        topLeftPoint = tempPoint4.calculateOtherPoint2(endPoint, startCenterDis * 0.3);

        polyPaths.push([startPoint, endPoint]);
        polyPaths.push([endPoint, topLeftPoint, bottomRigntPoint, endPoint]);
        // polyPaths.push([startPoint, endPoint]);
        /*polyPaths.push([
            endPoint, topLeftPoint, bottomRigntPoint, endPoint
        ]);*/
    };

    TwoCoiltransformerRenderer.prototype.drawCirCuitousMethod = function (polyPaths, circlePoint, radius, hlRadian, lhRadian) {
        var circleToBreakPointDis = 2 * radius / 5,	// 圆心到折点的长度
            halfDis = circleToBreakPointDis * Math.sqrt(3) / 2,	// 边长的一半
            topPoint = circlePoint.calculateOtherPoint(circleToBreakPointDis, lhRadian),
            hCenterPoint = circlePoint.calculateOtherPoint(circleToBreakPointDis * 0.5, hlRadian),	// 正三角形垂直底边点坐标
            rightPoit = hCenterPoint.calculateOtherPoint3(circlePoint, halfDis),
            tempPoint = circlePoint.calculateOtherPoint3(hCenterPoint, halfDis),
            leftPoit = tempPoint.calculateOtherPoint3(circlePoint, circleToBreakPointDis * 0.5),
            tempPoint1 = circlePoint.calculateOtherPoint3(topPoint, halfDis),
            tempPoint2 = tempPoint1.calculateOtherPoint3(circlePoint, circleToBreakPointDis),
            topBreakPoint = tempPoint2.calculateOtherPoint3(topPoint, circleToBreakPointDis * 0.5),
            hCenterPoint1 = circlePoint.calculateOtherPoint(circleToBreakPointDis * 1.5, hlRadian),	// 正三角形垂直底边对称延长点坐标
            rightBreakPoint = hCenterPoint1.calculateOtherPoint3(hCenterPoint, halfDis),
            hcplpRadian = hCenterPoint.dist(leftPoit),
            tempPoint3 = leftPoit.calculateOtherPoint(halfDis, hcplpRadian),
            tempPoint4 = leftPoit.calculateOtherPoint2(tempPoint3, circleToBreakPointDis * 0.5),
            leftBreakPoint = tempPoint4.calculateOtherPoint3(leftPoit, halfDis);
        polyPaths.push([circlePoint, topPoint, topBreakPoint]);
        polyPaths.push([circlePoint, rightPoit, rightBreakPoint]);
        polyPaths.push([circlePoint, leftPoit, leftBreakPoint]);
    };

    TwoCoiltransformerRenderer.prototype.drawTapSwitchMethod = function (polyPaths, hConnNodePoint, radius, hlRadian, lhRadian, ratio) {
        let nodeStartPointVLen = 0.45 * ratio; // 垂直方向距离
        let nodeStartPointHLen = 1.65 * ratio; // 水平方向距离
        let nodeTwoPointVLen = 0.15 * ratio; // 垂直方向距离
        let nodeThreePointVLen = 0.3 * ratio; // 水平方向距离
        let tempPoint1 = hConnNodePoint.calculateOtherPoint(nodeStartPointVLen, -hlRadian);
        let startPoint = tempPoint1.calculateOtherPoint2(hConnNodePoint, nodeStartPointHLen);
        let twoPoint = startPoint.calculateOtherPoint(nodeTwoPointVLen, -hlRadian);
        let tempPoint2 = startPoint.calculateOtherPoint2(twoPoint, nodeThreePointVLen);
        let threePoint = tempPoint2.calculateOtherPoint2(startPoint, nodeTwoPointVLen);
        let fourPoint = threePoint.calculateOtherPoint(nodeTwoPointVLen, -hlRadian);
        let _startPoint = new Point(startPoint.x, fourPoint.y);
        let _fourPoint = new Point(fourPoint.x, startPoint.y);
        // polyPaths.push([
        //     startPoint, twoPoint, threePoint, fourPoint
        // ]);
        polyPaths.push([
            _startPoint, twoPoint, threePoint, _fourPoint
        ]);
    };

    TwoCoiltransformerRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result) {
        // debugger;
        var circleRadius = graphic.circleRadius,
            ratio = graphic.ratio,
            halfhlConnDis = graphic.hlConnDis / 2,
            lhRadian = graphic.lhRadian;

        var points = [
            {
                x: halfhlConnDis,
                y: circleRadius
            },
            {
                x: halfhlConnDis,
                y: -circleRadius
            },
            {
                x: -halfhlConnDis,
                y: -circleRadius
            },
            {
                x: -halfhlConnDis,
                y: circleRadius
            }
        ];
        var extent = MathUtils.sizeAfterRotated(points, lhRadian);
        var drawCenterPoint = graphic.drawCenterPoint;

        result.push({
            id: graphic.id,
            g: graphic,
            minX: drawCenterPoint.x + extent.xmin,
            minY: drawCenterPoint.y + extent.ymin,
            maxX: drawCenterPoint.x + extent.xmax,
            maxY: drawCenterPoint.y + extent.ymax,
        });
    };

    return TwoCoiltransformerRenderer;
});
