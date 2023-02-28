define("com/huayun/webgis/gl/MapGridIndex", [], function () {
    var GridIndex = function GridIndex(width, height, cellSize) {
        var boxCells = this.boxCells = [];
        var circleCells = this.circleCells = [];
        this.xCellCount = Math.ceil(width / cellSize);
        this.yCellCount = Math.ceil(height / cellSize);
        for (var i = 0; i < this.xCellCount * this.yCellCount; i++) {
            boxCells.push([]);
            circleCells.push([]);
        }
        this.circleKeys = [];
        this.boxKeys = [];
        this.bboxes = [];
        this.circles = [];
        this.width = width;
        this.height = height;
        this.xScale = this.xCellCount / width;
        this.yScale = this.yCellCount / height;
        this.boxUid = 0;
        this.circleUid = 0;
    };

    GridIndex.prototype.keysLength = function keysLength() {
        return this.boxKeys.length + this.circleKeys.length;
    };

    GridIndex.prototype.insert = function insert(key, x1, y1, x2, y2) {
        this._forEachCell(x1, y1, x2, y2, this._insertBoxCell, this.boxUid++);
        this.boxKeys.push(key);
        this.bboxes.push(x1);
        this.bboxes.push(y1);
        this.bboxes.push(x2);
        this.bboxes.push(y2);
    };

    GridIndex.prototype.insertCircle = function insertCircle(key, x, y, radius) {
        this._forEachCell(x - radius, y - radius, x + radius, y + radius, this._insertCircleCell, this.circleUid++);
        this.circleKeys.push(key);
        this.circles.push(x);
        this.circles.push(y);
        this.circles.push(radius);
    };

    GridIndex.prototype._insertBoxCell = function _insertBoxCell(x1, y1, x2, y2, cellIndex, uid) {
        this.boxCells[cellIndex].push(uid);
    };

    GridIndex.prototype._insertCircleCell = function _insertCircleCell(x1, y1, x2, y2, cellIndex, uid) {
        this.circleCells[cellIndex].push(uid);
    };

    GridIndex.prototype._query = function _query(x1, y1, x2, y2, hitTest, predicate) {
        if (x2 < 0 || x1 > this.width || y2 < 0 || y1 > this.height) {
            return hitTest ? false : [];
        }
        var result = [];
        if (x1 <= 0 && y1 <= 0 && this.width <= x2 && this.height <= y2) {
            if (hitTest) {
                return true;
            }
            for (var boxUid = 0; boxUid < this.boxKeys.length; boxUid++) {
                result.push({
                    key: this.boxKeys[boxUid],
                    x1: this.bboxes[boxUid * 4],
                    y1: this.bboxes[boxUid * 4 + 1],
                    x2: this.bboxes[boxUid * 4 + 2],
                    y2: this.bboxes[boxUid * 4 + 3]
                });
            }
            for (var circleUid = 0; circleUid < this.circleKeys.length; circleUid++) {
                var x = this.circles[circleUid * 3];
                var y = this.circles[circleUid * 3 + 1];
                var radius = this.circles[circleUid * 3 + 2];
                result.push({
                    key: this.circleKeys[circleUid],
                    x1: x - radius,
                    y1: y - radius,
                    x2: x + radius,
                    y2: y + radius
                });
            }
            return predicate ? result.filter(predicate) : result;
        } else {
            var queryArgs = {
                hitTest: hitTest,
                seenUids: {box: {}, circle: {}}
            };
            this._forEachCell(x1, y1, x2, y2, this._queryCell, result, queryArgs, predicate);
            return hitTest ? result.length > 0 : result;
        }
    };

    GridIndex.prototype._queryCircle = function _queryCircle(x, y, radius, hitTest, predicate) {
        var x1 = x - radius;
        var x2 = x + radius;
        var y1 = y - radius;
        var y2 = y + radius;
        if (x2 < 0 || x1 > this.width || y2 < 0 || y1 > this.height) {
            return hitTest ? false : [];
        }

        var result = [];
        var queryArgs = {
            hitTest: hitTest,
            circle: {x: x, y: y, radius: radius},
            seenUids: {box: {}, circle: {}}
        };
        this._forEachCell(x1, y1, x2, y2, this._queryCellCircle, result, queryArgs, predicate);
        return hitTest ? result.length > 0 : result;
    };

    GridIndex.prototype.query = function query(x1, y1, x2, y2, predicate) {
        return (this._query(x1, y1, x2, y2, false, predicate));
    };

    GridIndex.prototype.hitTest = function hitTest(x1, y1, x2, y2, predicate) {
        return (this._query(x1, y1, x2, y2, true, predicate));
    };

    GridIndex.prototype.hitTestCircle = function hitTestCircle(x, y, radius, predicate) {
        return (this._queryCircle(x, y, radius, true, predicate));
    };

    GridIndex.prototype._queryCell = function _queryCell(x1, y1, x2, y2, cellIndex, result, queryArgs, predicate) {
        var seenUids = queryArgs.seenUids;
        var boxCell = this.boxCells[cellIndex];
        if (boxCell !== null) {
            var bboxes = this.bboxes;
            for (var i = 0, list = boxCell; i < list.length; i += 1) {
                var boxUid = list[i];

                if (!seenUids.box[boxUid]) {
                    seenUids.box[boxUid] = true;
                    var offset = boxUid * 4;
                    if ((x1 <= bboxes[offset + 2]) &&
                        (y1 <= bboxes[offset + 3]) &&
                        (x2 >= bboxes[offset + 0]) &&
                        (y2 >= bboxes[offset + 1]) &&
                        (!predicate || predicate(this.boxKeys[boxUid]))) {
                        if (queryArgs.hitTest) {
                            result.push(true);
                            return true;
                        } else {
                            result.push({
                                key: this.boxKeys[boxUid],
                                x1: bboxes[offset],
                                y1: bboxes[offset + 1],
                                x2: bboxes[offset + 2],
                                y2: bboxes[offset + 3]
                            });
                        }
                    }
                }
            }
        }
        var circleCell = this.circleCells[cellIndex];
        if (circleCell !== null) {
            var circles = this.circles;
            for (var i$1 = 0, list$1 = circleCell; i$1 < list$1.length; i$1 += 1) {
                var circleUid = list$1[i$1];

                if (!seenUids.circle[circleUid]) {
                    seenUids.circle[circleUid] = true;
                    var offset$1 = circleUid * 3;
                    if (this._circleAndRectCollide(circles[offset$1], circles[offset$1 + 1], circles[offset$1 + 2], x1, y1, x2, y2) &&
                        (!predicate || predicate(this.circleKeys[circleUid]))) {
                        if (queryArgs.hitTest) {
                            result.push(true);
                            return true;
                        } else {
                            var x = circles[offset$1];
                            var y = circles[offset$1 + 1];
                            var radius = circles[offset$1 + 2];
                            result.push({
                                key: this.circleKeys[circleUid],
                                x1: x - radius,
                                y1: y - radius,
                                x2: x + radius,
                                y2: y + radius
                            });
                        }
                    }
                }
            }
        }
    };

    GridIndex.prototype._queryCellCircle = function _queryCellCircle(x1, y1, x2, y2, cellIndex, result, queryArgs, predicate) {
        var circle = queryArgs.circle;
        var seenUids = queryArgs.seenUids;
        var boxCell = this.boxCells[cellIndex];
        if (boxCell !== null) {
            var bboxes = this.bboxes;
            for (var i = 0, list = boxCell; i < list.length; i += 1) {
                var boxUid = list[i];

                if (!seenUids.box[boxUid]) {
                    seenUids.box[boxUid] = true;
                    var offset = boxUid * 4;
                    if (this._circleAndRectCollide(circle.x, circle.y, circle.radius, bboxes[offset + 0], bboxes[offset + 1], bboxes[offset + 2], bboxes[offset + 3]) &&
                        (!predicate || predicate(this.boxKeys[boxUid]))) {
                        result.push(true);
                        return true;
                    }
                }
            }
        }

        var circleCell = this.circleCells[cellIndex];
        if (circleCell !== null) {
            var circles = this.circles;
            for (var i$1 = 0, list$1 = circleCell; i$1 < list$1.length; i$1 += 1) {
                var circleUid = list$1[i$1];

                if (!seenUids.circle[circleUid]) {
                    seenUids.circle[circleUid] = true;
                    var offset$1 = circleUid * 3;
                    if (this._circlesCollide(circles[offset$1], circles[offset$1 + 1], circles[offset$1 + 2], circle.x, circle.y, circle.radius) &&
                        (!predicate || predicate(this.circleKeys[circleUid]))) {
                        result.push(true);
                        return true;
                    }
                }
            }
        }
    };

    GridIndex.prototype._forEachCell = function _forEachCell(x1, y1, x2, y2, fn, arg1, arg2, predicate) {
        var cx1 = this._convertToXCellCoord(x1);
        var cy1 = this._convertToYCellCoord(y1);
        var cx2 = this._convertToXCellCoord(x2);
        var cy2 = this._convertToYCellCoord(y2);

        for (var x = cx1; x <= cx2; x++) {
            for (var y = cy1; y <= cy2; y++) {
                var cellIndex = this.xCellCount * y + x;
                if (fn.call(this, x1, y1, x2, y2, cellIndex, arg1, arg2, predicate)) {
                    return;
                }
            }
        }
    };

    GridIndex.prototype._convertToXCellCoord = function _convertToXCellCoord(x) {
        return Math.max(0, Math.min(this.xCellCount - 1, Math.floor(x * this.xScale)));
    };

    GridIndex.prototype._convertToYCellCoord = function _convertToYCellCoord(y) {
        return Math.max(0, Math.min(this.yCellCount - 1, Math.floor(y * this.yScale)));
    };

    GridIndex.prototype._circlesCollide = function _circlesCollide(x1, y1, r1, x2, y2, r2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        var bothRadii = r1 + r2;
        return (bothRadii * bothRadii) > (dx * dx + dy * dy);
    };

    GridIndex.prototype._circleAndRectCollide = function _circleAndRectCollide(circleX, circleY, radius, x1, y1, x2, y2) {
        var halfRectWidth = (x2 - x1) / 2;
        var distX = Math.abs(circleX - (x1 + halfRectWidth));
        if (distX > (halfRectWidth + radius)) {
            return false;
        }

        var halfRectHeight = (y2 - y1) / 2;
        var distY = Math.abs(circleY - (y1 + halfRectHeight));
        if (distY > (halfRectHeight + radius)) {
            return false;
        }

        if (distX <= halfRectWidth || distY <= halfRectHeight) {
            return true;
        }

        var dx = distX - halfRectWidth;
        var dy = distY - halfRectHeight;
        return (dx * dx + dy * dy <= (radius * radius));
    };

    return GridIndex;
});