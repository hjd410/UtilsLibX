/**
 *  @author :   wushengfei
 *  @date   :   2019/7/24
 *  @description : OK
 */
define("com/huayun/webgis/data/bucket/CircleBucketSimplify", [
    "../ArrayType",
    "../../gl/SegmentVector"
], function (ArrayType, SegmentVector) {

    function addCircleVertex(layoutVertexArray, x, y, extrudeX, extrudeY) {
        // layoutVertexArray.emplaceBack((x * 2) + ((extrudeX + 1) / 2), (y * 2) + ((extrudeY + 1) / 2));
        layoutVertexArray.emplaceBack(x, y, extrudeX, extrudeY);
    }

    var CircleBucket = function CircleBucket(options) {
        this.layoutVertexArray = new ArrayType.StructArrayLayout2f2ib12();
        this.indexArray = new ArrayType.StructArrayLayout3ui6();
        this.segments = new SegmentVector();
    };

    CircleBucket.prototype.destroy = function destroy() {
        if (!this.layoutVertexBuffer) {
            return;
        }
        this.layoutVertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.segments.destroy();
    };

    CircleBucket.prototype.addFeature = function addFeature(geometry) {
        for (var i$1 = 0, list$1 = geometry; i$1 < list$1.length; i$1 += 1) {
            var ring = list$1[i$1];
            for (var i = 0, list = ring; i < list.length; i += 1) {
                var point = list[i];
                var x = point.x;
                var y = point.y;
                var segment = this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray);
                var index$1 = segment.vertexLength;
                addCircleVertex(this.layoutVertexArray, x, y, -1, -1);
                addCircleVertex(this.layoutVertexArray, x, y, 1, -1);
                addCircleVertex(this.layoutVertexArray, x, y, 1, 1);
                addCircleVertex(this.layoutVertexArray, x, y, -1, 1);
                this.indexArray.emplaceBack(index$1, index$1 + 1, index$1 + 2);
                this.indexArray.emplaceBack(index$1, index$1 + 3, index$1 + 2);
                segment.vertexLength += 4;
                segment.primitiveLength += 2;
            }
        }
    };

    CircleBucket.prototype.upload = function upload(context) {
        this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, [
            {name: "a_pos", type: "Float32", components: 2, offset: 0},
            {name: "a_data", type: "Int16", components: 2, offset: 8}
        ]);
        this.indexBuffer = context.createIndexBuffer(this.indexArray);
    };
    return CircleBucket;
});