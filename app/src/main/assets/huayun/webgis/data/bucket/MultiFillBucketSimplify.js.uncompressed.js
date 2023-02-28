/**
 *  @author :   wushengfei
 *  @date   :   2019/7/24
 *  @description : OK
 */
define("com/huayun/webgis/data/bucket/MultiFillBucketSimplify", [
    "../ArrayType",
    "../../gl/SegmentVector",
    "../../utils/earcut",
    "../../utils/utils",
    "../../utils/Constant"
], function (ArrayType, SegmentVector, earcut, utils, Constant) {

    function FillBucket() {
        // this.layoutVertexArray = new ArrayType.StructArrayLayout5fb20();
        this.layoutVertexArray = new ArrayType.StructArrayLayout6fb24();
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

    FillBucket.prototype.addFeature = function addFeature(geometry, colors) {
        for (var i$4 = 0, list$2 = utils.classifyRings(geometry, Constant.layout.EARCUT_MAX_RINGS); i$4 < list$2.length; i$4 += 1) {
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
            var color = colors[i$4];

            if (color.length < 4) {
                color.push(1.0);
            }

            for (var i$3 = 0, list$1 = polygon; i$3 < list$1.length; i$3 += 1) {
                var ring$1 = list$1[i$3];

                if (ring$1.length === 0) {
                    continue;
                }

                if (ring$1 !== polygon[0]) {
                    holeIndices.push(flattened.length / 2);
                }
                this.layoutVertexArray.emplaceBack(ring$1[0].x, ring$1[0].y, color[0], color[1], color[2], color[3]);
                flattened.push(ring$1[0].x);
                flattened.push(ring$1[0].y);

                for (var i = 1; i < ring$1.length; i++) {
                    this.layoutVertexArray.emplaceBack(ring$1[i].x, ring$1[i].y, color[0], color[1], color[2], color[3]);
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
            {name: "a_pos", type: "Float32", components: 2, offset: 0},
            {name: "a_color", type: "Float32", components: 4, offset: 8}
        ]);
        this.indexBuffer = context.createIndexBuffer(this.indexArray);
    };

    return FillBucket;
});