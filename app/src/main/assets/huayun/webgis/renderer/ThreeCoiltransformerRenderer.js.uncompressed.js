define("com/huayun/webgis/renderer/ThreeCoiltransformerRenderer", [
    './LineRenderer',
    './CircleRenderer',
    '../geometry/Point',
    '../geometry/Polyline',
    '../utils/MathUtils',
    '../geometry/Multipoint'
], function (LineRenderer, CircleRenderer, Point, Polyline, MathUtils, Multipoint) {
    function ThreeCoiltransformerRenderer() {
        this.lineRenderer = new LineRenderer();
        this.circleRenderer = new CircleRenderer();
        this._rotationAngle = 0;
        this._rotationPoint = null;
        this.isX = true;
    }

    ThreeCoiltransformerRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        var points = geometry.points,
            hConnModePoint = points[0],
            mConnModePoint = points[1],
            lConnModePoint = points[2],
            halfmlConnDisx = (mConnModePoint.x + lConnModePoint.x) / 2,
            halfmlConnDisy = (mConnModePoint.y + lConnModePoint.y) / 2;

        var d = new Point(halfmlConnDisx, halfmlConnDisy);
        this._rotationPoint = new Point(hConnModePoint.x, hConnModePoint.y);

        if ((hConnModePoint.y - d.y) === 0) {
            if (hConnModePoint.x < d.x) {
                this._rotationAngle = 0;
            } else {
                this._rotationAngle = Math.PI;
            }
        } else {
            this._rotationAngle = Math.atan2((d.y - hConnModePoint.y), (d.x - hConnModePoint.x));
        }

        var aa = new Point(hConnModePoint.x, hConnModePoint.y),
            bb = this.getTranslateTarget(hConnModePoint, mConnModePoint, -this._rotationAngle),
            cc = this.getTranslateTarget(hConnModePoint, lConnModePoint, -this._rotationAngle),
            dd = this.getTranslateTarget(hConnModePoint, d, -this._rotationAngle),
            bbAfterScale = new Point(bb.x, bb.y),
            ccAfterScale = new Point(cc.x, cc.y),
            ddAfterScale = new Point(dd.x, dd.y);
        // scale = 0.9;
        // if(scale !== 1) {
        //     var dx = aa.dist(dd) * (scale - 1),
        //         dy = (scale - 1) * bb.dist(cc) /2;
        //     ddAfterScale.x += dx;
        //     ccAfterScale.x += dx;
        //     bbAfterScale.x += dx;
        //     if(bbAfterScale.y > ccAfterScale.y) {
        //         bbAfterScale.y += dy;
        //         ccAfterScale.y -= dy;
        //     } else {
        //         ccAfterScale.y += dy;
        //         bbAfterScale.y -= dy;
        //     }
        // }
        var length = bb.dist(cc),
            bottomAngle = this.checkDraw(aa, bbAfterScale, ccAfterScale),
            bbChanged,
            ccChanged,
            changeLength = 0;

        if (bottomAngle < 80) {
            changeLength = length / 8;
            bbChanged = new Point(bbAfterScale.x, bbAfterScale.y + changeLength);
            ccChanged = new Point(ccAfterScale.x, ccAfterScale.y - changeLength);
        } else {
            bbChanged = new Point(bbAfterScale.x, bbAfterScale.y - changeLength);
            ccChanged = new Point(ccAfterScale.x, ccAfterScale.y + changeLength);
        }
        ;

        var ddChanged = new Point(ddAfterScale.x, ddAfterScale.y),
            rotationAngle = this._rotationAngle,
            array2 = this.getpoints2(aa, bbChanged, ccChanged, graphic);

        var hlCenter = new Point((ddChanged.x + aa.x) / 2, (ddChanged.y + aa.y) / 2);
        graphic.drawCenter = hlCenter;
        graphic.bottomLen = bbChanged.dist(ccChanged);
        graphic.hlDis = aa.dist(ddChanged);
        graphic.hlRadian = aa.radian(ddChanged);


        // 反旋转
        var c1 = this.getTranslateTarget(hConnModePoint, array2[0], rotationAngle),
            c2 = this.getTranslateTarget(hConnModePoint, array2[1], rotationAngle),
            c3 = this.getTranslateTarget(hConnModePoint, array2[2], rotationAngle),
            link1 = this.getTranslateTarget(hConnModePoint, array2[3], rotationAngle),
            link2 = this.getTranslateTarget(hConnModePoint, array2[4], rotationAngle),
            link3 = this.getTranslateTarget(hConnModePoint, array2[5], rotationAngle),
            bb1 = this.getTranslateTarget(hConnModePoint, bbChanged, rotationAngle),
            cc1 = this.getTranslateTarget(hConnModePoint, ccChanged, rotationAngle),
            r = view.resolution;

        symbol.symbols[1].setRadius(graphic.circleRadius / r);
        symbol.symbols[1].setStrokeWidth(symbol.symbols[1].strokeWidth / r);
        this.circleRenderer.add(view, graphic, new Point(c1.x, c1.y), symbol.symbols[1]);
        symbol.symbols[2].setRadius(graphic.circleRadius / r);
        symbol.symbols[2].setStrokeWidth(symbol.symbols[2].strokeWidth / r);
        this.circleRenderer.add(view, graphic, new Point(c2.x, c2.y), symbol.symbols[2]);
        symbol.symbols[3].setRadius(graphic.circleRadius / r);
        symbol.symbols[3].setStrokeWidth(symbol.symbols[3].strokeWidth / r);
        this.circleRenderer.add(view, graphic, new Point(c3.x, c3.y), symbol.symbols[3]);

        var polyline = new Polyline([
            [
                aa,
                link1
            ],
            [
                bb1,
                link2
            ],
            [
                cc1,
                link3
            ]
        ]);
        var width = symbol.symbols[1].strokeWidth / r;
        symbol.symbols[0].setWidth(width);
        symbol.symbols[0].uniforms['u_width'] = 1;
        this.lineRenderer.add(view, graphic, polyline, symbol.symbols[0]);
        this.polyPaths = [];
        this.neturalPoint = [];

        if (symbol.hConnMode) {
            this.processCenter(symbol.hConnMode, array2[0], symbol, graphic, this.polyPaths, this.neturalPoint);
        }
        if (symbol.mConnMode) {
            this.processCenter(symbol.mConnMode, array2[1], symbol, graphic, this.polyPaths, this.neturalPoint);
        }
        if (symbol.lConnMode) {
            this.processCenter(symbol.lConnMode, array2[2], symbol, graphic, this.polyPaths, this.neturalPoint);
        }

        if (symbol.onLoad) {
            this.drawOnLoad(array2[0], graphic, this.polyPaths);
        }

        if (this.polyPaths.length > 0) {
            this.lineRenderer.add(view, graphic, new Polyline(this.polyPaths), symbol.symbols[0]);
        }

        if (this.neturalPoint.length > 0) {
            symbol.symbols[4].setRadius(graphic.circleRadius / (15 * r));
            symbol.symbols[4].setStrokeWidth(symbol.symbols[4].strokeWidth / r);
            this.circleRenderer.add(view, graphic, new Multipoint(this.neturalPoint), symbol.symbols[4]);
        }
    };

    ThreeCoiltransformerRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView) {
        var r = view.resolution;
        var width = symbol.symbols[1].strokeWidth / r;
        if (width < 1) width = 1;
        symbol.symbols[0].setWidth(width);
        this.lineRenderer.draw(view, graphic, geometry, symbol.symbols[0], layerView, 3);

        var radius = graphic.circleRadius / r;
        if (radius < 1) radius = 1;
        symbol.symbols[1].setRadius(radius);
        symbol.symbols[1].setStrokeWidth(symbol.symbols[1].strokeWidth / r);
        this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[1], layerView, 0, true);

        symbol.symbols[2].setRadius(radius);
        symbol.symbols[2].setStrokeWidth(symbol.symbols[2].strokeWidth / r);
        this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[2], layerView, 1, true);

        symbol.symbols[3].setRadius(radius);
        symbol.symbols[3].setStrokeWidth(symbol.symbols[3].strokeWidth / r);
        this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[3], layerView, 2, true);

        var color = symbol.symbols[1].color;
        symbol.symbols[1].color = [0, 0, 0, 0];
        this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[1], layerView, 0, true);
        symbol.symbols[1].color = color;

        color = symbol.symbols[2].color;
        symbol.symbols[2].color = [0, 0, 0, 0];
        this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[2], layerView, 1, true);
        symbol.symbols[2].color = color;

        color = symbol.symbols[3].color;
        symbol.symbols[3].color = [0, 0, 0, 0];
        this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[3], layerView, 2, true);
        symbol.symbols[3].color = color;

        if (this.polyPaths.length > 0) {
            this.lineRenderer.draw(view, graphic, geometry, symbol.symbols[0], layerView, 4);
        }

        if (this.neturalPoint.length > 0) {
            symbol.symbols[4].setRadius(graphic.circleRadius / (15 * r));
            symbol.symbols[4].setStrokeWidth(symbol.symbols[4].strokeWidth / r);
            this.circleRenderer.draw(view, graphic, geometry, symbol.symbols[4], layerView, 5, true);
        }
    };

    ThreeCoiltransformerRenderer.prototype.drawGlow = function (view, graphic, geometry, symbol, layerView) {
        var r = view.resolution;
        var width = symbol.symbols[1].strokeWidth / r;
        if (width < 1) width = 1;
        symbol.symbols[0].setWidth(width);
        this.lineRenderer.drawGlow(view, graphic, geometry, symbol.symbols[0], layerView, 3);

        var radius = graphic.circleRadius / r;
        if (radius < 1) radius = 1;
        symbol.symbols[1].setRadius(radius);
        symbol.symbols[1].setStrokeWidth(symbol.symbols[1].strokeWidth / r);
        this.circleRenderer.drawGlow(view, graphic, geometry, symbol.symbols[1], layerView, 0, true);


        symbol.symbols[2].setRadius(radius);
        symbol.symbols[2].setStrokeWidth(symbol.symbols[2].strokeWidth / r);
        this.circleRenderer.drawGlow(view, graphic, geometry, symbol.symbols[2], layerView, 1, true);

        symbol.symbols[3].setRadius(radius);
        symbol.symbols[3].setStrokeWidth(symbol.symbols[3].strokeWidth / r);
        this.circleRenderer.drawGlow(view, graphic, geometry, symbol.symbols[3], layerView, 2, true);

        var color = symbol.symbols[1].color;
        symbol.symbols[1].color = [0, 0, 0, 0];
        this.circleRenderer.drawGlow(view, graphic, geometry, symbol.symbols[1], layerView, 0, true);
        symbol.symbols[1].color = color;

        color = symbol.symbols[2].color;
        symbol.symbols[2].color = [0, 0, 0, 0];
        this.circleRenderer.drawGlow(view, graphic, geometry, symbol.symbols[2], layerView, 1, true);
        symbol.symbols[2].color = color;

        color = symbol.symbols[3].color;
        symbol.symbols[3].color = [0, 0, 0, 0];
        this.circleRenderer.drawGlow(view, graphic, geometry, symbol.symbols[3], layerView, 2, true);
        symbol.symbols[3].color = color;

        this.lineRenderer.drawGlow(view, graphic, geometry, symbol.symbols[0], layerView, 4);

        if (geometry.points.length > 0) {
            symbol.symbols[4].setRadius(graphic.circleRadius / (15 * r));
            symbol.symbols[4].setStrokeWidth(symbol.symbols[4].strokeWidth / r);
            this.circleRenderer.drawGlow(view, graphic, geometry, symbol.symbols[4], layerView, 5, true);
        }
    };

    ThreeCoiltransformerRenderer.prototype.processCenter = function (mode, center, symbol, graphic, polyPaths, neturalPoint) {
        mode = mode.toLowerCase();
        switch (mode) {
            case 'y':
                this.drawStar(center, graphic, polyPaths);
                break;
            case 'd':
                this.drawAngle(center, graphic, polyPaths);
                break;
            case 'z'://暂不实现；
                break;
            case 'yn':
                this.drawStar(center, graphic, polyPaths);
                this.drawNetural(center, symbol, graphic, polyPaths, neturalPoint);
                break;
            case 'zn'://暂不实现；
                break;
        }
    };

    ThreeCoiltransformerRenderer.prototype.drawOnLoad = function (c0, graphic, polyPaths) {
        var r = graphic.circleRadius,
            pOnX = new Point(c0.x + r, c0.y),
            distance = r * 2.4,
            rotationPoint = this._rotationPoint,
            rotationAngle = this._rotationAngle,
            startP = new Point(pOnX.x + distance * 0.5, c0.y + distance * Math.sqrt(3) / 2),
            endP = new Point(pOnX.x - distance * 0.5, c0.y - distance * Math.sqrt(3) / 2),
            dx = distance * 0.3 * Math.cos(Math.PI * 70 / 180),
            dy = distance * 0.3 * Math.sin(Math.PI * 70 / 180),
            left = new Point(endP.x + dx, endP.y + dy),
            dx1 = distance * 0.3 * Math.cos(Math.PI * 50 / 180),
            dy1 = distance * 0.3 * Math.sin(Math.PI * 50 / 180),
            right = new Point(endP.x + dx1, endP.y + dy1),
            startP1 = this.getTranslateTarget2(rotationPoint, startP, rotationAngle),
            endP1 = this.getTranslateTarget2(rotationPoint, endP, rotationAngle),
            left1 = this.getTranslateTarget2(rotationPoint, left, rotationAngle),
            right1 = this.getTranslateTarget2(rotationPoint, right, rotationAngle);
        polyPaths.push([startP1, endP1]);
        polyPaths.push([endP1, left1, right1, endP1]);
    };

    ThreeCoiltransformerRenderer.prototype.drawNetural = function (center, symbol, graphic, polyPaths, neturalPoint) {
        var r = graphic.circleRadius,
            rotationPoint = this._rotationPoint,
            rotationAngle = this._rotationAngle,
            ex = new Point(center.x, center.y + r / 3);
        var center1 = this.getTranslateTarget(rotationPoint, center, rotationAngle, r),
            ex1 = this.getTranslateTarget(rotationPoint, ex, rotationAngle, r);

        neturalPoint.push(new Point(center1.x, center1.y))
        polyPaths.push([center1, ex1]);
    };

    ThreeCoiltransformerRenderer.prototype.drawAngle = function (center, graphic, polyPaths) {
        var r = graphic.circleRadius,
            rotationPoint = this._rotationPoint,
            rotationAngle = this._rotationAngle,
            top = new Point(center.x - r / 2, center.y),
            left = this.getTranslateTarget(center, top, -Math.PI * 120 / 180),
            right = this.getTranslateTarget(center, top, Math.PI * 120 / 180),
            //反旋转
            top1 = this.getTranslateTarget(rotationPoint, top, rotationAngle),
            left1 = this.getTranslateTarget(rotationPoint, left, rotationAngle),
            right1 = this.getTranslateTarget(rotationPoint, right, rotationAngle);
        polyPaths.push([top1, left1, right1, top1]);
    };

    ThreeCoiltransformerRenderer.prototype.drawStar = function (center, graphic, polyPaths) {
        var r = graphic.circleRadius,
            rotationPoint = this._rotationPoint,
            rotationAngle = this._rotationAngle,
            top = new Point(center.x + r / 2, center.y),
            left = this.getTranslateTarget(center, top, -Math.PI * 120 / 180),
            right = this.getTranslateTarget(center, top, Math.PI * 120 / 180),
            //反旋转
            top1 = this.getTranslateTarget(rotationPoint, top, rotationAngle),
            left1 = this.getTranslateTarget(rotationPoint, left, rotationAngle),
            right1 = this.getTranslateTarget(rotationPoint, right, rotationAngle),
            center1 = this.getTranslateTarget(rotationPoint, center, rotationAngle);
        polyPaths.push([center1, top1]);
        polyPaths.push([center1, left1]);
        polyPaths.push([center1, right1]);
    };

    ThreeCoiltransformerRenderer.prototype.getTranslateTarget = function (center, source, radian) {
        var target = new Point(),
            angleSource = Math.atan2((source.y - center.y), (source.x - center.x)),
            newAngel = angleSource + radian,
            length = Math.sqrt(Math.pow((source.x - center.x), 2) + Math.pow((source.y - center.y), 2));
        target.x = center.x + length * Math.cos(newAngel);
        target.y = center.y + length * Math.sin(newAngel);
        return target;
    };

    ThreeCoiltransformerRenderer.prototype.getTranslateTarget2 = function (center, source, radian) {
        var target = new Point(),
            angleSource = Math.atan2((source.y - center.y), (source.x - center.x)),
            newAngel = angleSource - radian,
            length = Math.sqrt(Math.pow((source.x - center.x), 2) + Math.pow((source.y - center.y), 2));
        target.x = center.x + length * Math.cos(newAngel);
        target.y = center.y + length * Math.sin(-newAngel);
        return target;
    };

    // ThreeCoiltransformerRenderer.prototype.getTranslateTarget1 = function(center, source, radian, r) {
    //     var target = new Point(),angleSource, newAngel, length;
    //     angleSource = Math.atan2((source.y - center.y), (source.x - center.x));
    //     length = Math.sqrt(Math.pow((source.x - center.x), 2) + Math.pow((source.y - center.y), 2));
    //     if(Math.abs(angleSource) >= 0.3) {
    //         newAngel = radian + angleSource ;
    //         if(r > 1){
    //             target.x = center.x + length * Math.cos(newAngel);
    //             target.y = center.y + length * Math.sin(newAngel);
    //         } else {
    //             target.x = center.x + length * Math.cos(newAngel);
    //             target.y = center.y + length * Math.sin(newAngel);
    //         }
    //     } else {
    //         newAngel = angleSource - radian;
    //         target.x = center.x + length * Math.cos(newAngel);
    //         target.y = center.y + length * Math.sin(-newAngel);
    //     }
    //     return target;
    // };

    ThreeCoiltransformerRenderer.prototype.checkDraw = function (aa, bb, cc) {
        var ab = Math.sqrt(Math.pow(aa.x - bb.x, 2) + Math.pow(aa.y - bb.y, 2)),
            bc = Math.sqrt(Math.pow(bb.x - cc.x, 2) + Math.pow(bb.y - cc.y, 2)),
            bottomAngle = (Math.acos(bc / (2 * ab)) * 180 / Math.PI),
            linkPointAngle;
        if (bottomAngle < 76) {
            linkPointAngle = 76;
        } else {
            linkPointAngle = 80;
        }
        return linkPointAngle;
    };

    ThreeCoiltransformerRenderer.prototype.getpoints2 = function (aa, bb, cc, graphic) {
        var array = [],
            dd = new Point((bb.x + cc.x) / 2, (bb.y + cc.y) / 2),
            bottomLen = Math.abs(bb.y - cc.y),
            add = aa.dist(dd);
        graphic.circleRadius = bottomLen * 115 / 200;
        var r = graphic.circleRadius,
            rTemp = 2 * r + bottomLen * Math.sqrt(3) / 2,
            distance = (add - rTemp) / 2,
            link1, c1, link2, c2, link3, c3;
        if (distance > 0) {
            link1 = new Point(aa.x + distance, aa.y);
            c1 = new Point(aa.x + distance + r, aa.y);

            link2 = new Point(bb.x - distance, bb.y);
            c2 = new Point(bb.x - distance - r, bb.y);

            link3 = new Point(cc.x - distance, cc.y);
            c3 = new Point(cc.x - distance - r, cc.y);
            array = [c1, c2, c3, link1, link2, link3, r, distance];
        } else {
            r = add / (2 + (200 / 115) * Math.sqrt(3) / 2 - 0.193);
            distance = 0.15 * r;
            bottomLen = r * 40 / 23;
            link1 = new Point(aa.x + distance, aa.y);
            c1 = new Point(aa.x + distance + r, aa.y);
            c2 = new Point(c1.x + bottomLen * Math.sqrt(3) / 2, c1.y + bottomLen / 2);
            c3 = new Point(c1.x + bottomLen * Math.sqrt(3) / 2, c1.y - bottomLen / 2);
            link2 = new Point((c2.x + r), c2.y);
            link3 = new Point((c3.x + r), c3.y);
            array = [c1, c2, c3, link1, link2, link3, r, distance];
        }
        return array;
    };

    ThreeCoiltransformerRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result) {
        var circleRadius = graphic.circleRadius,
            halfhlDis = graphic.hlDis / 2,
            lmDis = graphic.bottomLen,
            halfhlRadian = graphic.hlRadian / 2;

        var points = [
            {
                x: halfhlDis,
                y: lmDis / 2 + circleRadius
            },
            {
                x: -halfhlDis,
                y: lmDis / 2 + circleRadius
            },
            {
                x: -halfhlDis,
                y: -(lmDis / 2 + circleRadius)
            },
            {
                x: halfhlDis,
                y: -(lmDis / 2 + circleRadius)
            }
        ]

        var extent = MathUtils.sizeAfterRotated(points, halfhlRadian);
        var drawCenter = graphic.drawCenter;

        result.push({
            id: graphic.id,
            g: graphic,
            minX: drawCenter.x + extent.xmin,
            minY: drawCenter.y + extent.ymin,
            maxX: drawCenter.x + extent.xmax,
            maxY: drawCenter.y + extent.ymax,
        });
    };

    return ThreeCoiltransformerRenderer;
});
