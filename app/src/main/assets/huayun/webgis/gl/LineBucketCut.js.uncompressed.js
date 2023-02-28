define("com/huayun/webgis/gl/LineBucketCut", [
    "../data/ArrayType",
    "./SegmentVector"
], function (ArrayType, SegmentVector) {
    var EXTRUDE_SCALE = 63;
    var LINE_DISTANCE_BUFFER_BITS = 15;
    var LINE_DISTANCE_SCALE = 1 / 2;
    var MAX_LINE_DISTANCE = Math.pow(2, LINE_DISTANCE_BUFFER_BITS - 1) / LINE_DISTANCE_SCALE;
    var COS_HALF_SHARP_CORNER = Math.cos(75 / 2 * (Math.PI / 180));

    function addLineVertex(layoutVertexBuffer, point, extrude, round, up, dir, linesofar) {
        layoutVertexBuffer.emplaceBack(
            // a_pos_normal
            // Encode round/up the least significant bits
            (point.x << 1) + (round ? 1 : 0),
            (point.y << 1) + (up ? 1 : 0),
            // a_data
            // add 128 to store a byte in an unsigned byte
            Math.round(EXTRUDE_SCALE * extrude.x) + 128,
            Math.round(EXTRUDE_SCALE * extrude.y) + 128,
            // Encode the -1/0/1 direction value into the first two bits of .z of a_data.
            // Combine it with the lower 6 bits of `linesofar` (shifted by 2 bites to make
            // room for the direction value). The upper 8 bits of `linesofar` are placed in
            // the `w` component. `linesofar` is scaled down by `LINE_DISTANCE_SCALE` so that
            // we can store longer distances while sacrificing precision.
            ((dir === 0 ? 0 : (dir < 0 ? -1 : 1)) + 1) | (((linesofar * LINE_DISTANCE_SCALE) & 0x3F) << 2),
            (linesofar * LINE_DISTANCE_SCALE) >> 6);
    }
    /**
     * 
     * @param options 
     */
    var LineBucketCut = function LineBucketCut(options) {
        this.layoutVertexArray = new ArrayType.StructArrayLayout2i4ub8();
        this.indexArray = new ArrayType.StructArrayLayout3ui6();
        this.segments = new SegmentVector();
    };

    LineBucketCut.prototype.addFeature = function addFeature(geometry,  join, cap, miterLimit, roundLimit) {
        for (var i = 0; i < geometry.length; i += 1) {
            var feature = geometry[i];
            this.addLine(feature, join, cap, miterLimit, roundLimit);
        }
    };

    LineBucketCut.prototype.addLine = function addLine(vertices, join, cap, miterLimit, roundLimit) {
        var lineDistances = null;
        var len = vertices.length;
        while (len >= 2 && vertices[len - 1].equals(vertices[len - 2])) {
            vertices.splice(len-1);
            len--;
        }
        var first = 0;
        while (first < len - 1 && vertices[first].equals(vertices[first + 1])) {
            first++;
        }

        if (join === 'bevel') {
            miterLimit = 1.05;
        }

        var sharpCornerOffset = 240;

        var firstVertex = vertices[first];
        var segment = this.segments.prepareSegment(len * 10, this.layoutVertexArray, this.indexArray);

        this.distance = 0;

        var beginCap = cap,
            endCap = cap;
        var startOfLine = true;
        var currentVertex;
        var prevVertex = ((undefined));
        var nextVertex = ((undefined));
        var prevNormal = ((undefined));
        var nextNormal = ((undefined));
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

            var isSharpCorner = cosHalfAngle < COS_HALF_SHARP_CORNER && prevVertex && nextVertex;

            if (isSharpCorner && i > first) {
                var prevSegmentLength = currentVertex.dist(prevVertex);
                if (prevSegmentLength > 2 * sharpCornerOffset) {
                    var newPrevVertex = currentVertex.sub(currentVertex.sub(prevVertex)._mult(sharpCornerOffset / prevSegmentLength)._round());
                    this.distance += newPrevVertex.dist(prevVertex);
                    this.addCurrentVertex(newPrevVertex, this.distance, prevNormal.mult(1), 0, 0, false, segment, lineDistances);
                    prevVertex = newPrevVertex;
                }
            }

            // The join if a middle vertex, otherwise the cap.
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
                // The maximum extrude length is 128 / 63 = 2 times the width of the line
                // so if miterLength >= 2 we need to draw a different type of bevel here.
                if (miterLength > 2) {
                    currentJoin = 'flipbevel';
                }

                // If the miterLength is really small and the line bevel wouldn't be visible,
                // just draw a miter join to save a triangle.
                if (miterLength < miterLimit) {
                    currentJoin = 'miter';
                }
            }

            // Calculate how far along the line the currentVertex is
            if (prevVertex) {
                this.distance += currentVertex.dist(prevVertex);
            }

            if (currentJoin === 'miter') {
                joinNormal._mult(miterLength);
                this.addCurrentVertex(currentVertex, this.distance, joinNormal, 0, 0, false, segment, lineDistances);

            } else if (currentJoin === 'flipbevel') {
                // miter is too big, flip the direction to make a beveled join

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

                // Close previous segment with a bevel
                if (!startOfLine) {
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, offsetA, offsetB, false, segment, lineDistances);
                }

                if (currentJoin === 'fakeround') {
                    // The join angle is sharp enough that a round join would be visible.
                    // Bevel joins fill the gap between segments with a single pie slice triangle.
                    // Create a round join by adding multiple pie slices. The join isn't actually round, but
                    // it looks like it is at the sizes we render lines at.

                    // Add more triangles for sharper angles.
                    // This math is just a good enough approximation. It isn't "correct".
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

                // Start next segment
                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, -offsetA, -offsetB, false, segment, lineDistances);
                }

            } else if (currentJoin === 'butt') {
                if (!startOfLine) {
                    // Close previous segment with a butt
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 0, 0, false, segment, lineDistances);
                }

                // Start next segment with a butt
                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, 0, 0, false, segment, lineDistances);
                }

            } else if (currentJoin === 'square') {

                if (!startOfLine) {
                    // Close previous segment with a square cap
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 1, 1, false, segment, lineDistances);

                    // The segment is done. Unset vertices to disconnect segments.
                    this.e1 = this.e2 = -1;
                }

                // Start next segment
                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, -1, -1, false, segment, lineDistances);
                }

            } else if (currentJoin === 'round') {

                if (!startOfLine) {
                    // Close previous segment with butt
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 0, 0, false, segment, lineDistances);

                    // Add round cap or linejoin at end of segment
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 1, 1, true, segment, lineDistances);

                    // The segment is done. Unset vertices to disconnect segments.
                    this.e1 = this.e2 = -1;
                }


                // Start next segment with a butt
                if (nextVertex) {
                    // Add round cap before first segment
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

    };

    LineBucketCut.prototype.addCurrentVertex = function addCurrentVertex(currentVertex,
                                                                      distance,
                                                                      normal,
                                                                      endLeft,
                                                                      endRight,
                                                                      round,
                                                                      segment,
                                                                      distancesForScaling) {
        var extrude;
        var layoutVertexArray = this.layoutVertexArray;
        var indexArray = this.indexArray;

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

        // There is a maximum "distance along the line" that we can store in the buffers.
        // When we get close to the distance, reset it to zero and add the vertex again with
        // a distance of zero. The max distance is determined by the number of bits we allocate
        // to `linesofar`.
        if (distance > MAX_LINE_DISTANCE / 2 && !distancesForScaling) {
            this.distance = 0;
            this.addCurrentVertex(currentVertex, this.distance, normal, endLeft, endRight, round, segment);
        }
    };

    /**
     * Add a single new vertex and a triangle using two previous vertices.
     * This adds a pie slice triangle near a join to simulate round joins
     *
     * @param currentVertex the line vertex to add buffer vertices for
     * @param distance the distance from the beginning of the line to the vertex
     * @param extrude the offset of the new vertex from the currentVertex
     * @param lineTurnsLeft whether the line is turning left or right at this angle
     * @private
     */
    LineBucketCut.prototype.addPieSliceVertex = function addPieSliceVertex(currentVertex,
                                                                        distance,
                                                                        extrude,
                                                                        lineTurnsLeft,
                                                                        segment,
                                                                        distancesForScaling) {
        extrude = extrude.mult(lineTurnsLeft ? -1 : 1);
        var layoutVertexArray = this.layoutVertexArray;
        var indexArray = this.indexArray;

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
     * Calculate the total distance, in tile units, of this tiled line feature
     *
     * @param {Array<Point>} vertices the full geometry of this tiled line feature
     * @param {number} first the index in the vertices array representing the first vertex we should consider
     * @param {number} len the count of vertices we should consider from `first`
     *
     * @private
     */
    return LineBucketCut;
});