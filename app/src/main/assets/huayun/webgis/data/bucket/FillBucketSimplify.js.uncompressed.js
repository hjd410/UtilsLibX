/**
 *  @author :   wushengfei
 *  @date   :   2019/7/24
 *  @description : OK
 */
define("com/huayun/webgis/data/bucket/FillBucketSimplify", [
    "../ArrayType",
    "../../gl/SegmentVector",
    "../../utils/earcut",
    "../../utils/utils",
    "../../utils/Constant",
    "../../utils/classifyRings"
], function (ArrayType, SegmentVector, earcut, utils, Constant,classifyRings) {

    function FillBucket() {
        this.layoutVertexArray = new ArrayType.StructArrayLayout2f8();
        this.indexArray = new ArrayType.StructArrayLayout3ui6();
        this.segments = new SegmentVector();
    }

    FillBucket.prototype.addFeatures = function addFeatures(options, imagePositions) {
        for (var i = 0, list = this.features; i < list.length; i += 1) {
            var feature = list[i];

            var geometry = feature.geometry;
            this.addFeature(feature, geometry, feature.index, imagePositions);
        }
    };

    FillBucket.prototype.destroy = function destroy() {
        if (!this.layoutVertexBuffer) {
            return;
        }
        this.layoutVertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.segments.destroy();
    };

    FillBucket.prototype.addFeature = function addFeature(geometry) {
        for (var i$4 = 0, list$2 = classifyRings(geometry, Constant.layout.EARCUT_MAX_RINGS); i$4 < list$2.length; i$4 += 1) {
            var polygon = list$2[i$4];

            var numVertices = 0;
            for (var i$2 = 0, list = polygon; i$2 < list.length; i$2 += 1) {
                var ring = list[i$2];

                numVertices += ring.length;
            }

            var triangleSegment = this.segments.prepareSegment(numVertices, this.layoutVertexArray, this.indexArray);
            var triangleIndex = triangleSegment.vertexLength;

            var flattened = [];
            var holeIndices = [];

            for (var i$3 = 0, list$1 = polygon; i$3 < list$1.length; i$3 += 1) {
                var ring$1 = list$1[i$3];

                if (ring$1.length === 0) {
                    continue;
                }

                if (ring$1 !== polygon[0]) {
                    holeIndices.push(flattened.length / 2);
                }
                this.layoutVertexArray.emplaceBack(ring$1[0].x, ring$1[0].y);
                flattened.push(ring$1[0].x);
                flattened.push(ring$1[0].y);

                for (var i = 1; i < ring$1.length; i++) {
                    this.layoutVertexArray.emplaceBack(ring$1[i].x, ring$1[i].y);
                    flattened.push(ring$1[i].x);
                    flattened.push(ring$1[i].y);
                }
            }

            var indices = earcut.earcut(flattened, holeIndices);

            for (var i$1 = 0; i$1 < indices.length; i$1 += 3) {
                this.indexArray.emplaceBack(
                    triangleIndex + indices[i$1],
                    triangleIndex + indices[i$1 + 1],
                    triangleIndex + indices[i$1 + 2]);
            }
            triangleSegment.vertexLength += numVertices;
            triangleSegment.primitiveLength += indices.length / 3;
        }
    };

    FillBucket.prototype.upload = function upload(context) {
        this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, [
            {name: "a_pos", type: "Float32", components: 2, offset: 0}
        ]);
        this.indexBuffer = context.createIndexBuffer(this.indexArray);
    };

    return FillBucket;
});