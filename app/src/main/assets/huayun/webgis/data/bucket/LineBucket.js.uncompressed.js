define("com/huayun/webgis/data/bucket/LineBucket", [
    "../ArrayType",
    "../../gl/SegmentVector",
    "../../gl/members",
    "../../gl/programConfig",
    "../../gl/dataTransfer",
    "com/huayun/webgis/layers/support/EvaluationParameters",
    "../../utils/utils",
    "../../utils/Constant"
], function (ArrayType, SegmentVector, members, programConfig, dataTransfer, EvaluationParameters, utils, Constant) {

    var LineBucket = function LineBucket(options) {
        this.zoom = options.zoom;
        this.overscaling = options.overscaling;
        this.layers = options.layers;
        this.layerIds = this.layers.map(function (layer) {
            return layer.id;
        });
        this.index = options.index;
        this.features = [];
        this.hasPattern = false;

        this.layoutVertexArray = new ArrayType.StructArrayLayout2i4ub8();
        this.indexArray = new ArrayType.StructArrayLayout3ui6();
        this.programConfigurations = new programConfig.ProgramConfigurationSet(members.members$3, options.layers, options.zoom);
        this.segments = new SegmentVector();

        this.stateDependentLayerIds = this.layers.filter(function (l) {
            return l.isStateDependent();
        }).map(function (l) {
            return l.id;
        });
    };

    LineBucket.prototype.populate = function populate(features, options) {
        this.features = [];
        this.hasPattern = false;

        for (var i = 0, list = features; i < list.length; i += 1) {
            var ref = list[i];
            var feature = ref.feature;
            var index = ref.index;
            var sourceLayerIndex = ref.sourceLayerIndex;
            if (!this.layers[0]._featureFilter(new EvaluationParameters(this.zoom), feature)) {
                continue;
            }

            var geometry = utils.loadGeometry(feature);

            var patternFeature = {
                sourceLayerIndex: sourceLayerIndex,
                index: index,
                geometry: geometry,
                properties: feature.properties,
                type: feature.type,
                patterns: {}
            };

            if (typeof feature.id !== 'undefined') {
                patternFeature.id = feature.id;
            }

            this.addFeature(patternFeature, geometry, index, {});

            options.featureIndex.insert(feature, geometry, index, sourceLayerIndex, this.index);
        }
    };

    LineBucket.prototype.update = function update(states, vtLayer, imagePositions) {
        if (!this.stateDependentLayers.length) {
            return;
        }
        this.programConfigurations.updatePaintArrays(states, vtLayer, this.stateDependentLayers, imagePositions);
    };

    LineBucket.prototype.addFeatures = function addFeatures(options, imagePositions) {
        for (var i = 0, list = this.features; i < list.length; i += 1) {
            var feature = list[i];

            var geometry = feature.geometry;
            this.addFeature(feature, geometry, feature.index, imagePositions);
        }
    };

    LineBucket.prototype.isEmpty = function isEmpty() {
        return this.layoutVertexArray.length === 0;
    };

    LineBucket.prototype.uploadPending = function uploadPending() {
        return !this.uploaded || this.programConfigurations.needsUpload;
    };

    LineBucket.prototype.upload = function upload(context) {
        if (!this.uploaded) {
            this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, members.members$3);
            this.indexBuffer = context.createIndexBuffer(this.indexArray);
        }
        this.programConfigurations.upload(context);
        this.uploaded = true;
    };

    LineBucket.prototype.destroy = function destroy() {
        if (!this.layoutVertexBuffer) {
            return;
        }
        this.layoutVertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.programConfigurations.destroy();
        this.segments.destroy();
    };

    LineBucket.prototype.addFeature = function addFeature(feature, geometry, index, imagePositions) {
        var layout = this.layers[0].layout;
        var join = layout.get('line-join').evaluate(feature, {});
        var cap = layout.get('line-cap');
        var miterLimit = layout.get('line-miter-limit');
        var roundLimit = layout.get('line-round-limit');

        for (var i = 0, list = geometry; i < list.length; i += 1) {
            var line = list[i];

            this.addLine(line, feature, join, cap, miterLimit, roundLimit, index, imagePositions);
        }
    };

    LineBucket.prototype.addLine = function addLine(vertices, feature, join, cap, miterLimit, roundLimit, index, imagePositions) {
        var lineDistances = null;
        var len = vertices.length;
        while (len >= 2 && vertices[len - 1].equals(vertices[len - 2])) {
            len--;
        }
        var first = 0;
        while (first < len - 1 && vertices[first].equals(vertices[first + 1])) {
            first++;
        }
        if (join === 'bevel') {
            miterLimit = 1.05;
        }

        var sharpCornerOffset = Constant.layout.SHARP_CORNER_OFFSET * 16;
        var segment = this.segments.prepareSegment(len * 10, this.layoutVertexArray, this.indexArray);

        this.distance = 0;

        var beginCap = cap,
            endCap = cap;
        var startOfLine = true;
        var currentVertex;
        var prevVertex;
        var nextVertex;
        var prevNormal;
        var nextNormal;
        var offsetA;
        var offsetB;

        // the last three vertices added
        this.e1 = this.e2 = this.e3 = -1;

        for (var i = first; i < len; i++) {
            nextVertex = vertices[i + 1]; // just the next vertex
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
                return;
            }

            var joinNormal = prevNormal.add(nextNormal);
            if (joinNormal.x !== 0 || joinNormal.y !== 0) {
                joinNormal._unit();
            }
            /*  joinNormal prevNormal
            *         ↖  ↑
            *            .________. prevVertex
            *            |
            * nextNormal  ←  |  currentVertex
            *            |
            * nextVertex !
            *
            */
            var cosHalfAngle = joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y;
            var miterLength = cosHalfAngle !== 0 ? 1 / cosHalfAngle : Infinity;

            var isSharpCorner = cosHalfAngle < Constant.layout.COS_HALF_SHARP_CORNER && prevVertex && nextVertex;

            if (isSharpCorner && i > first) {
                var prevSegmentLength = currentVertex.dist(prevVertex);
                if (prevSegmentLength > 2 * sharpCornerOffset) {
                    var newPrevVertex = currentVertex.sub(currentVertex.sub(prevVertex)._mult(sharpCornerOffset / prevSegmentLength)._round());
                    this.distance += newPrevVertex.dist(prevVertex);
                    this.addCurrentVertex(newPrevVertex, this.distance, prevNormal.mult(1), 0, 0, false, segment, lineDistances);
                    prevVertex = newPrevVertex;
                }
            }
            var middleVertex = prevVertex && nextVertex;
            var currentJoin = middleVertex ? join : nextVertex ? beginCap : endCap;

            if (middleVertex && currentJoin === 'round') {
                if (miterLength < roundLimit) {
                    currentJoin = 'miter';
                } else if (miterLength <= 2) {
                    currentJoin = 'fakeround';
                }
            }

            if (currentJoin === 'miter' && miterLength > miterLimit) {
                currentJoin = 'bevel';
            }

            if (currentJoin === 'bevel') {
                if (miterLength > 2) {
                    currentJoin = 'flipbevel';
                }
                if (miterLength < miterLimit) {
                    currentJoin = 'miter';
                }
            }
            if (prevVertex) {
                this.distance += currentVertex.dist(prevVertex);
            }

            if (currentJoin === 'miter') {
                joinNormal._mult(miterLength);
                this.addCurrentVertex(currentVertex, this.distance, joinNormal, 0, 0, false, segment, lineDistances);

            } else if (currentJoin === 'flipbevel') {
                if (miterLength > 100) {
                    // Almost parallel lines
                    joinNormal = nextNormal.clone().mult(-1);

                } else {
                    var direction = prevNormal.x * nextNormal.y - prevNormal.y * nextNormal.x > 0 ? -1 : 1;
                    var bevelLength = miterLength * prevNormal.add(nextNormal).mag() / prevNormal.sub(nextNormal).mag();
                    joinNormal._perp()._mult(bevelLength * direction);
                }
                this.addCurrentVertex(currentVertex, this.distance, joinNormal, 0, 0, false, segment, lineDistances);
                this.addCurrentVertex(currentVertex, this.distance, joinNormal.mult(-1), 0, 0, false, segment, lineDistances);

            } else if (currentJoin === 'bevel' || currentJoin === 'fakeround') {
                var lineTurnsLeft = (prevNormal.x * nextNormal.y - prevNormal.y * nextNormal.x) > 0;
                var offset = -Math.sqrt(miterLength * miterLength - 1);
                if (lineTurnsLeft) {
                    offsetB = 0;
                    offsetA = offset;
                } else {
                    offsetA = 0;
                    offsetB = offset;
                }

                if (!startOfLine) {
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, offsetA, offsetB, false, segment, lineDistances);
                }

                if (currentJoin === 'fakeround') {
                    var n = Math.floor((0.5 - (cosHalfAngle - 0.5)) * 8);
                    var approxFractionalJoinNormal = (void 0);

                    for (var m = 0; m < n; m++) {
                        approxFractionalJoinNormal = nextNormal.mult((m + 1) / (n + 1))._add(prevNormal)._unit();
                        this.addPieSliceVertex(currentVertex, this.distance, approxFractionalJoinNormal, lineTurnsLeft, segment, lineDistances);
                    }

                    this.addPieSliceVertex(currentVertex, this.distance, joinNormal, lineTurnsLeft, segment, lineDistances);

                    for (var k = n - 1; k >= 0; k--) {
                        approxFractionalJoinNormal = prevNormal.mult((k + 1) / (n + 1))._add(nextNormal)._unit();
                        this.addPieSliceVertex(currentVertex, this.distance, approxFractionalJoinNormal, lineTurnsLeft, segment, lineDistances);
                    }
                }

                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, -offsetA, -offsetB, false, segment, lineDistances);
                }

            } else if (currentJoin === 'butt') {
                if (!startOfLine) {
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 0, 0, false, segment, lineDistances);
                }
                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, 0, 0, false, segment, lineDistances);
                }

            } else if (currentJoin === 'square') {

                if (!startOfLine) {
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 1, 1, false, segment, lineDistances);
                    this.e1 = this.e2 = -1;
                }

                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, -1, -1, false, segment, lineDistances);
                }

            } else if (currentJoin === 'round') {

                if (!startOfLine) {
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 0, 0, false, segment, lineDistances);
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 1, 1, true, segment, lineDistances);
                    this.e1 = this.e2 = -1;
                }

                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, -1, -1, true, segment, lineDistances);
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, 0, 0, false, segment, lineDistances);
                }
            }

            if (isSharpCorner && i < len - 1) {
                var nextSegmentLength = currentVertex.dist(nextVertex);
                if (nextSegmentLength > 2 * sharpCornerOffset) {
                    var newCurrentVertex = currentVertex.add(nextVertex.sub(currentVertex)._mult(sharpCornerOffset / nextSegmentLength)._round());
                    this.distance += newCurrentVertex.dist(currentVertex);
                    this.addCurrentVertex(newCurrentVertex, this.distance, nextNormal.mult(1), 0, 0, false, segment, lineDistances);
                    currentVertex = newCurrentVertex;
                }
            }

            startOfLine = false;
        }

        // debugger;
        this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, feature, index, imagePositions);
    };

    /**
     * @param currentVertex
     * @param distance
     * @param normal
     * @param endLeft
     * @param endRight
     * @param round
     * @param segment
     * @param distancesForScaling
     */
    LineBucket.prototype.addCurrentVertex = function addCurrentVertex(currentVertex, distance, normal, endLeft, endRight,
                                                                      round, segment, distancesForScaling) {
        var extrude;
        var layoutVertexArray = this.layoutVertexArray;
        var indexArray = this.indexArray;

        if (distancesForScaling) {
            distance = scaleDistance(distance, distancesForScaling);
        }

        extrude = normal.clone();
        if (endLeft) {
            extrude._sub(normal.perp()._mult(endLeft));
        }
        addLineVertex(layoutVertexArray, currentVertex, extrude, round, false, endLeft, distance);
        this.e3 = segment.vertexLength++;
        if (this.e1 >= 0 && this.e2 >= 0) {
            indexArray.emplaceBack(this.e1, this.e2, this.e3);
            segment.primitiveLength++;
        }
        this.e1 = this.e2;
        this.e2 = this.e3;

        extrude = normal.mult(-1);
        if (endRight) {
            extrude._sub(normal.perp()._mult(endRight));
        }
        addLineVertex(layoutVertexArray, currentVertex, extrude, round, true, -endRight, distance);
        this.e3 = segment.vertexLength++;
        if (this.e1 >= 0 && this.e2 >= 0) {
            indexArray.emplaceBack(this.e1, this.e2, this.e3);
            segment.primitiveLength++;
        }
        this.e1 = this.e2;
        this.e2 = this.e3;

        if (distance > Constant.layout.MAX_LINE_DISTANCE / 2 && !distancesForScaling) {
            this.distance = 0;
            this.addCurrentVertex(currentVertex, this.distance, normal, endLeft, endRight, round, segment);
        }
    };

    /**
     * @param currentVertex
     * @param distance
     * @param extrude
     * @param lineTurnsLeft
     * @param segment
     * @param distancesForScaling
     */
    LineBucket.prototype.addPieSliceVertex = function addPieSliceVertex(currentVertex, distance, extrude, lineTurnsLeft,
                                                                        segment,
                                                                        distancesForScaling) {
        extrude = extrude.mult(lineTurnsLeft ? -1 : 1);
        var layoutVertexArray = this.layoutVertexArray;
        var indexArray = this.indexArray;
        if (distancesForScaling) {
            distance = scaleDistance(distance, distancesForScaling);
        }
        addLineVertex(layoutVertexArray, currentVertex, extrude, false, lineTurnsLeft, 0, distance);
        this.e3 = segment.vertexLength++;
        if (this.e1 >= 0 && this.e2 >= 0) {
            indexArray.emplaceBack(this.e1, this.e2, this.e3);
            segment.primitiveLength++;
        }
        if (lineTurnsLeft) {
            this.e2 = this.e3;
        } else {
            this.e1 = this.e3;
        }
    };

    /**
     * @param layoutVertexBuffer
     * @param point
     * @param extrude
     * @param round
     * @param up
     * @param dir
     * @param linesofar
     */
    function addLineVertex(layoutVertexBuffer, point, extrude, round, up, dir, linesofar) {
        layoutVertexBuffer.emplaceBack(
            (point.x << 1) + (round ? 1 : 0),// a_pos_normal
            (point.y << 1) + (up ? 1 : 0),// Encode round/up the least significant bits
            Math.round(Constant.layout.EXTRUDE_SCALE * extrude.x) + 128,// a_data
            Math.round(Constant.layout.EXTRUDE_SCALE * extrude.y) + 128,// add 128 to store a byte in an unsigned byte
            ((dir === 0 ? 0 : (dir < 0 ? -1 : 1)) + 1) | (((linesofar * Constant.layout.LINE_DISTANCE_SCALE) & 0x3F) << 2),
            (linesofar * Constant.layout.LINE_DISTANCE_SCALE) >> 6);
    }

    /**
     * @param {number} tileDistance
     * @param {Object} stats
     * @param {number} stats.start
     * @param {number} stats.end
     * @param {number} stats.tileTotal
     *
     * @private
     */
    function scaleDistance(tileDistance, stats) {
        return ((tileDistance / stats.tileTotal) * (stats.end - stats.start) + stats.start) * (Constant.layout.MAX_LINE_DISTANCE - 1);
    }

    /**
     * 计算线段总长
     *
     * @param {Array<Point>} vertices 线段坐标数组
     * @param {number} first 第一个点在数组中下标
     * @param {number} len 线段需要计算的点数量
     *
     * @private
     */
    function calculateFullDistance(vertices, first, len) {
        var currentVertex, nextVertex;
        var total = 0;
        for (var i = first; i < len - 1; i++) {
            currentVertex = vertices[i];
            nextVertex = vertices[i + 1];
            total += currentVertex.dist(nextVertex);
        }
        return total;
    }

    console.log("LineBucket");
    dataTransfer.register('LineBucket', LineBucket, {omit: ['layers', 'features']});
    return LineBucket;
});