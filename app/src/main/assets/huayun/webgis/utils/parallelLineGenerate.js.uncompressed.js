define("com/huayun/webgis/utils/parallelLineGenerate", [
    "exports",
    "./wktUtil"
], function (exports, wktUtil) {
    function handleOdd(currentVertex, joinNormal, miterLength, num, result) {
        var half = Math.floor(num / 2);
        for (var i = 0; i < num; i++) {
            result[i].push(currentVertex.add(joinNormal.mult(miterLength * (half - i))))
        }
    }

    function handleEven(currentVertex, joinNormal, miterLength, num, result) {
        var half = Math.floor(num / 2);
        for (var i = 0; i < num; i++) {
            result[i].push(currentVertex.add(joinNormal.mult(miterLength * (half - i - 0.5))))
        }
    }

    function angleOfVecs(a, b) {
        var x1 = a[0],
            y1 = a[1],
            x2 = b[0],
            y2 = b[1];
        var len1 = x1 * x1 + y1 * y1;

        if (len1 > 0) {
            //TODO: evaluate use of glm_invsqrt here?
            len1 = 1 / Math.sqrt(len1);
        }

        var len2 = x2 * x2 + y2 * y2;

        if (len2 > 0) {
            //TODO: evaluate use of glm_invsqrt here?
            len2 = 1 / Math.sqrt(len2);
        }

        var cosine = (x1 * x2 + y1 * y2) * len1 * len2;
        if (cosine > 1.0) {
            return 0;
        } else if (cosine < -1.0) {
            return Math.PI;
        } else {
            return Math.acos(cosine);
        }
    }

    function directionofVecs(a, b) {
        return a[0] * b[1] - a[1] * b[0];
    }

    function handleOrder(vertices, num, lines, result) {
        var vecParallel = [
            vertices[1].x - vertices[0].x,
            vertices[1].y - vertices[0].y
        ];
        var vecLines = [];
        for (var i = 0; i < num; i++) {
            var l = lines[i];
            var points = l.startPoints;
            var p = points[points.length - 1];
            vecLines.push([
                vertices[0].x - p.x,
                vertices[0].y - p.y
            ]);
        }
        var angles = vecLines.map(function (item, index) {
            var angle = angleOfVecs(vecParallel, item);
            var direction = directionofVecs(vecParallel, item);
            if (direction > 0) { // 逆时针
                angle = -angle;
            }
            return {
                angle: angle,
                index: index
            };
        });
        angles.sort(function (a, b) {
            return b.angle - a.angle;
        });
        for (i = 0; i < angles.length; i++) {
            var index = angles[i].index;
            lines[index].startPoints = lines[index].startPoints.concat(result[i]);
        }
    }

    function generateParallel(vertices, offset, num, lines) {
        var startOfLine = true;
        var currentVertex,
            prevVertex,
            nextVertex,
            prevNormal,
            nextNormal;
        // var result = handleOrder(vertices, num, lines);
        var result = [];
        for (var i = 0; i < num; i++) {
            result[i] = [];
        }
        var first = 0,
            len = vertices.length;
        var isEven = num % 2 === 0; // 是否偶数

        for (i = 0; i < len; i++) {
            nextVertex = vertices[i + 1]; // 下一个点位置
            if (nextNormal) {
                prevNormal = nextNormal;
            }
            if (currentVertex) {
                prevVertex = currentVertex;
            }
            currentVertex = vertices[i];
            nextNormal = nextVertex ? nextVertex.sub(currentVertex)._unit()._perp() : prevNormal;
            prevNormal = prevNormal || nextNormal;
            if (!prevNormal) {
                return result;
            }
            var joinNormal = prevNormal.add(nextNormal);
            if (joinNormal.x !== 0 || joinNormal.y !== 0) {
                joinNormal._unit();
            }
            var cosHalfAngle = joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y;
            var miterLength = cosHalfAngle !== 0 ? offset / cosHalfAngle : Infinity;
            if (isEven) {
                handleEven(currentVertex, joinNormal, miterLength, num, result);
            } else {
                handleOdd(currentVertex, joinNormal, miterLength, num, result);
            }
        }
        // handleOrder(vertices, num, lines, result);
        return result;
    }

    exports.generateParallel = generateParallel;
    exports.angleOfVecs = angleOfVecs;
    exports.directionofVecs = directionofVecs;

    function generateParallelGT(data, offset) {
        var lines = {};
        var parallelLines = {};
        data.forEach(function (line) {
            var id = line.ID;
            var lineTowers = line.lineTower;
            var OWNER = line.OWNER;
            var towerac = line.TOWERAC;
            var towers = {
                startPoints: [],
                endPoints: [],
                OWNER: OWNER
            };
            lines[id] = towers;
            var startTower = lineTowers[0];
            var startTowerCount = 0;
            // 开头
            for (var i = 0, ii = towerac.length; i < ii; i++) {
                var tower = towerac[i];
                if (tower.TOWER_ID === startTower.ID) {
                    break;
                } else {
                    startTowerCount++;
                    towers.startPoints.push(wktUtil.parse2Geometry(tower.SHAPE));
                }
            }
            // 多回
            var lineIds = null;
            var oldSize = 0;
            var oldTower;
            var fullPath, startShape;
            var oldFullPath;
            for (var j = 0, jj = lineTowers.length; j < jj; j++) {
                tower = lineTowers[j];
                size = tower.SIZE;
                /*if (size < 2) {
                    // break;
                    continue;
                    // towers.startPoints.push(wktUtil.parse2Geometry(tower.SHAPE));
                } else {*/
                lineIds = tower.LINE_ID;
                if (size !== oldSize) { // 开始新的一段
                    startShape = tower.SHAPE;
                }
                fullPath = size + "#" + startShape;
                var parallelItem = parallelLines[fullPath];
                if (parallelItem && parallelItem.addLine !== id) {
                    oldSize = size;
                    continue;
                } else {
                    tower.point = wktUtil.parse2Geometry(tower.SHAPE);
                    if (size !== oldSize) {
                        if (oldFullPath) {
                            parallelLines[oldFullPath].towers.push(tower);
                            parallelLines[oldFullPath].splitLast = true;
                        }
                    }
                    if (!parallelLines.hasOwnProperty(fullPath)) {
                        if (size !== oldSize && oldSize !== 0) {
                            parallelLines[fullPath] = {
                                size: size,
                                towers: [oldTower],
                                splitFirst: true,
                                addLine: id,
                                lineIds: lineIds
                            }
                        } else {
                            parallelLines[fullPath] = {
                                size: size,
                                towers: [],
                                addLine: id,
                                lineIds: lineIds
                            }
                        }
                    }
                    parallelLines[fullPath].towers.push(tower);
                    oldSize = size;
                    oldTower = tower;
                    oldFullPath = fullPath;
                }
                // }
            }
            // 结尾
            for (i = j + startTowerCount; i < ii; i++) {
                tower = towerac[i];
                tower.point = wktUtil.parse2Geometry(tower.SHAPE);
                towers.endPoints.push(tower.point);
            }
        });
        var paths = [];
        var hg = [];
        for (var key in parallelLines) {
            var item = parallelLines[key];
            var parallelId = item.lineIds;
            var size = item.size;
            if (size < 2) {
                var lineId = parallelId;
                var oneTower = item.towers;
                if (item.splitLast) {
                    oneTower.pop();
                }
                if (item.splitFirst) {
                    oneTower.shift();
                }
                for (var k = 0, kk = item.towers.length; k < kk; k++) {
                    lines[lineId].startPoints.push(item.towers[k].point);
                }
            } else {
                var towers = item.towers;
                var vecParallel = [
                    towers[1].point.x - towers[0].point.x,
                    towers[1].point.y - towers[0].point.y
                ];
                var lineIds = parallelId.split(",");
                var notOrder = true;
                lineIds.forEach(function (lid) {
                    // if (!lines[lid]) debugger;
                    notOrder = notOrder && (!!lines[lid].ordered);
                });
                if (notOrder) {
                    lineIds.sort(function (a, b) {
                        return lines[a].order - lines[b].order;
                    });
                    var points = [];
                    var IDS = [];
                    for (var k = 0, kk = item.towers.length; k < kk; k++) {
                        points.push(item.towers[k].point);
                        IDS.push(item.towers[k].ID);
                    }
                    var path = generateParallel(points, offset, item.size);
                    var len;
                    if (item.splitLast) {
                        len = path[0].length - 1;
                    } else {
                        len = path[0].length;
                    }
                    var start = 0;
                    if (item.splitFirst) {
                        start = 1;
                    }
                    for (var i = start; i < len; i++) {
                        var l = [];
                        l.push(path[0][i]);
                        l.push(path[size - 1][i]);
                        hg.push({
                            points: l,
                            towerId: IDS[i]
                        });
                    }
                    for (i = 0; i < lineIds.length; i++) {
                        var lds = lineIds[i];
                        if (item.splitLast) {
                            path[i].pop();
                        }
                        if (item.splitFirst) {
                            path[i].shift();
                        }
                        lines[lds].startPoints = lines[lds].startPoints.concat(path[i]);
                    }
                } else {
                    var vecLines = [];
                    for (var m = 0; m < lineIds.length; m++) {
                        var line = lines[lineIds[m]].startPoints;
                        var p = line[line.length - 1];
                        if (!p) {
                            p = {
                                x: 0, //towers[0].point.x,
                                y: 0 // towers[0].point.y
                            }
                        }
                        vecLines.push([
                            towers[0].point.x - p.x,
                            towers[0].point.y - p.y
                        ]);
                    }
                    var angles = vecLines.map(function (item, index) {
                        var angle = angleOfVecs(vecParallel, item);
                        var direction = directionofVecs(vecParallel, item);
                        if (direction > 0) { // 逆时针
                            angle = -angle;
                        }
                        return {
                            angle: angle,
                            index: index
                        };
                    });
                    angles.sort(function (a, b) {
                        return b.angle - a.angle;
                    });

                    var points = [];
                    var IDS = [];
                    for (var k = 0, kk = item.towers.length; k < kk; k++) {
                        points.push(item.towers[k].point);
                        IDS.push(item.towers[k].ID);
                    }
                    var path = generateParallel(points, offset, item.size);
                    var len;
                    if (item.splitLast) {
                        len = path[0].length - 1;
                    } else {
                        len = path[0].length;
                    }
                    var start = 0;
                    if (item.splitFirst) {
                        start = 1;
                    }
                    for (var i = start; i < len; i++) {
                        var l = [];
                        l.push(path[0][i]);
                        l.push(path[size - 1][i]);
                        hg.push({
                            points: l,
                            towerId: IDS[i]
                        });
                    }
                    for (i = 0; i < angles.length; i++) {
                        var index = angles[i].index;
                        if (item.splitLast) {
                            path[i].pop();
                        }
                        if (item.splitFirst) {
                            path[i].shift();
                        }
                        lines[lineIds[index]].startPoints = lines[lineIds[index]].startPoints.concat(path[i]);
                        lines[lineIds[index]].ordered = true;
                        lines[lineIds[index]].order = i;
                    }
                }
            }
        }
        for (var id in lines) {
            lines[id].startPoints = lines[id].startPoints.concat(lines[id].endPoints);
            paths.push({
                points: lines[id].startPoints,
                id: id,
                OWNER: lines[id].OWNER,
                order: lines[id].order
            });
        }

        return {
            gt: paths,
            hg: hg
        }
    }

    exports.generateParallelGT = generateParallelGT;

    exports.generateMultiParallel = function (data, offset) {
        var lines = data.LINE,
            towers = data.PHYSICTOWER;
        lines.forEach(function (line) {
            line.lineTower = [];
        });
        towers.forEach(function (tower) {
            var towerLineId = tower.LINE_ID;
            tower.SIZE = towerLineId.split(",").length || 1;
            for (var i = 0; i < lines.length; i++) {
                var l = lines[i];
                if (tower.LINE_ID.indexOf(l.ID) > -1) {
                    l.lineTower.push(tower)
                }
            }

        });
        try {
            var gt = generateParallelGT(lines, offset);
            var paths = gt.gt;
            var hg = gt.hg;
            var toweracs = [];
            var lineseg = [];
            paths.forEach(function (item) {
                var id = item.id;
                var OWNER = item.OWNER;
                var order = item.order;
                var line = lines.filter(function (l) {
                    return l.ID === id;
                });
                var TOWERAC = line[0].TOWERAC;
                var ps = item.points;
                for (var k = 0; k < TOWERAC.length; k++) {
                    var p = ps[k];
                    TOWERAC[k].SHAPE = "POINT (" + p.x + " " + p.y + ")";
                    TOWERAC[k].sameOrder = order;
                    toweracs.push(TOWERAC[k]);
                    if (k === TOWERAC.length - 1) {
                        continue;
                    }
                    var np = ps[k + 1];
                    lineseg.push({
                        "DEV_ID": "",
                        "ID": "",
                        "LINE_ID": id,
                        "NAME": "导线段" + k,
                        "OWNER": OWNER,
                        SHAPE: "LINESTRING (" + p.x + " " + p.y + "," + np.x + " " + np.y + ")",
                        nodeTower: [TOWERAC[k].TOWER_ID, TOWERAC[k + 1].TOWER_ID],
                        order: order
                    });
                }

            });
            var bisector = [];
            hg.forEach(function (bs) {
                var ps = bs.points;
                var str = ps.map(function (p) {
                    return p.x + " " + p.y
                });

                bisector.push({
                    SHAPE: "LINESTRING (" + str.join(",") + ")",
                    towerId: bs.towerId
                })
            });
            return {
                "TOWER": toweracs,
                "LINESEG": lineseg,
                "BISECTOR": bisector
            }
        } catch (e) {
            console.log("数据异常，无法同杆重设", e);
            return null;
            // throw new Error("数据异常，无法同杆重设");
        }
    }
})