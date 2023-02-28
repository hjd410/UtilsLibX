define("com/huayun/webgis/data/bucket/FillExtrusionBucketSimplify", [
    "../ArrayType",
    "../../gl/SegmentVector",
    "../../utils/earcut",
    "../../gl/programConfig",
    "../../gl/members",
    "../../gl/dataTransfer",
    "com/huayun/webgis/layers/support/EvaluationParameters",
    "../../utils/Constant",
    "../../utils/utils",
    "../../utils/classifyRings"
], function (ArrayType, SegmentVector, earcut, programConfig, members, dataTransfer, EvaluationParameters, Constant, utils, classifyRings) {

    var vectorTileFeatureTypes = ['Unknown', 'Point', 'LineString', 'Polygon'];
    var FACTOR = Math.pow(2, 13);

    function addVertex(vertexArray, x, y, nx, ny, nz, t, e) {
        vertexArray.emplaceBack(
            // a_pos
            x,
            y,
            // a_normal_ed: 3-component normal and 1-component edgedistance
            Math.floor(nx * FACTOR) * 2 + t,
            ny * FACTOR * 2,
            nz * FACTOR * 2,
            // edgedistance (used for wrapping patterns around extrusion sides)
            Math.round(e)
        );
    }

    var FillExtrusionBucket = function FillExtrusionBucket() {
        this.layoutVertexArray = new ArrayType.StructArrayLayout2i4i12();
        this.indexArray = new ArrayType.StructArrayLayout3ui6();
        this.segments = new SegmentVector();
    };

    FillExtrusionBucket.prototype.isEmpty = function isEmpty() {
        return this.layoutVertexArray.length === 0;
    };


    FillExtrusionBucket.prototype.upload = function upload(context) {
        this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, [
            {name: "a_pos", type: "Int16", components: 2, offset: 0},
            {name: "a_normal_ed", type: "Int16", components: 4, offset: 4}
        ]);
        this.indexBuffer = context.createIndexBuffer(this.indexArray);
    };

    FillExtrusionBucket.prototype.destroy = function destroy() {
        if (!this.layoutVertexBuffer) {
            return;
        }
        this.layoutVertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.segments.destroy();
    };

    FillExtrusionBucket.prototype.addFeature = function addFeature(geometry) {
        for (var i$4 = 0, list$3 = classifyRings(geometry, Constant.layout.EARCUT_MAX_RINGS); i$4 < list$3.length; i$4 += 1) {
            var polygon = list$3[i$4];

            var numVertices = 0;
            for (var i$1 = 0, list = polygon; i$1 < list.length; i$1 += 1) {
                var ring = list[i$1];

                numVertices += ring.length;
            }
            var segment = this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray);

            for (var i$2 = 0, list$1 = polygon; i$2 < list$1.length; i$2 += 1) {
                var ring$1 = list$1[i$2];

                if (ring$1.length === 0) {
                    continue;
                }

                var edgeDistance = 0;

                for (var p = 0; p < ring$1.length; p++) {
                    var p1 = ring$1[p];

                    if (p >= 1) {
                        var p2 = ring$1[p - 1];

                        if (segment.vertexLength + 4 > SegmentVector.MAX_VERTEX_ARRAY_LENGTH) {
                            segment = this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray);
                        }

                        var perp = p1.sub(p2)._perp()._unit();
                        var dist = p2.dist(p1);
                        if (edgeDistance + dist > 32768) {
                            edgeDistance = 0;
                        }

                        addVertex(this.layoutVertexArray, p1.x, p1.y, perp.x, perp.y, 0, 0, edgeDistance);
                        addVertex(this.layoutVertexArray, p1.x, p1.y, perp.x, perp.y, 0, 1, edgeDistance);

                        edgeDistance += dist;

                        addVertex(this.layoutVertexArray, p2.x, p2.y, perp.x, perp.y, 0, 0, edgeDistance);
                        addVertex(this.layoutVertexArray, p2.x, p2.y, perp.x, perp.y, 0, 1, edgeDistance);

                        var bottomRight = segment.vertexLength;

                        // ┌──────┐
                        // │ 0  1 │ Counter-clockwise winding order.
                        // │  │ Triangle 1: 0 => 2 => 1
                        // │ 2  3 │ Triangle 2: 1 => 2 => 3
                        // └──────┘
                        this.indexArray.emplaceBack(bottomRight, bottomRight + 2, bottomRight + 1);
                        this.indexArray.emplaceBack(bottomRight + 1, bottomRight + 2, bottomRight + 3);

                        segment.vertexLength += 4;
                        segment.primitiveLength += 2;
                    }
                }
            }

            if (segment.vertexLength + numVertices > SegmentVector.MAX_VERTEX_ARRAY_LENGTH) {
                segment = this.segments.prepareSegment(numVertices, this.layoutVertexArray, this.indexArray);
            }

            var flattened = [];
            var holeIndices = [];
            var triangleIndex = segment.vertexLength;

            for (var i$3 = 0, list$2 = polygon; i$3 < list$2.length; i$3 += 1) {
                var ring$2 = list$2[i$3];

                if (ring$2.length === 0) {
                    continue;
                }

                if (ring$2 !== polygon[0]) {
                    holeIndices.push(flattened.length / 2);
                }

                for (var i = 0; i < ring$2.length; i++) {
                    var p$1 = ring$2[i];

                    addVertex(this.layoutVertexArray, p$1.x, p$1.y, 0, 0, 1, 1, 0);

                    flattened.push(p$1.x);
                    flattened.push(p$1.y);
                }
            }

            var indices = earcut.earcut(flattened, holeIndices);

            for (var j = 0; j < indices.length; j += 3) {
                // Counter-clockwise winding order.
                this.indexArray.emplaceBack(
                    triangleIndex + indices[j],
                    triangleIndex + indices[j + 2],
                    triangleIndex + indices[j + 1]);
            }

            segment.primitiveLength += indices.length / 3;
            segment.vertexLength += numVertices;
        }
    };

    return FillExtrusionBucket;
});