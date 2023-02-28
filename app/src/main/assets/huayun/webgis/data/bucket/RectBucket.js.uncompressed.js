/**
 *  @author :   wushengfei
 *  @date   :   2019/7/24
 *  @description : 矩形符号三角形化
 */
define("com/huayun/webgis/data/bucket/RectBucket", [
    "../ArrayType",
    "../../gl/SegmentVector",
    "../../utils/earcut",
    "../../utils/utils",
    "../../utils/Constant"
], function (ArrayType, SegmentVector, earcut, utils, Constant) {

    function addCircleVertex(layoutVertexArray, x, y, w, h, ww, hw) {
        layoutVertexArray.emplaceBack(x,y, w, h, ww, hw);
    }

    function RectBucket() {
        this.layoutVertexArray = new ArrayType.StructArrayLayout6fb24();
        this.indexArray = new ArrayType.StructArrayLayout3ui6();
        this.segments = new SegmentVector();
    }

    RectBucket.prototype.destroy = function destroy() {
        if (!this.layoutVertexBuffer) {
            return;
        }
        this.layoutVertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.segments.destroy();
    };

    RectBucket.prototype.addFeature = function addFeature(geometry, symbol) {
        var width = symbol.width,
            height = symbol.height,
            widthWithStroke = symbol.widthWithStroke,
            heightWithStroke = symbol.heightWithStroke;
        for (var i$1 = 0, list$1 = geometry; i$1 < list$1.length; i$1 += 1) {
            var ring = list$1[i$1];
            for (var i = 0, list = ring; i < list.length; i += 1) {
                var point = list[i];
                var x = point.x;
                var y = point.y;
                var segment = this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray);
                var index$1 = segment.vertexLength;
                addCircleVertex(this.layoutVertexArray, x, y, -width, -height, -widthWithStroke, -heightWithStroke);
                addCircleVertex(this.layoutVertexArray, x, y, width, -height, widthWithStroke, -heightWithStroke);
                addCircleVertex(this.layoutVertexArray, x, y, width, height, widthWithStroke, heightWithStroke);
                addCircleVertex(this.layoutVertexArray, x, y, -width, height, -widthWithStroke, heightWithStroke);
                this.indexArray.emplaceBack(index$1, index$1 + 1, index$1 + 2);
                this.indexArray.emplaceBack(index$1, index$1 + 3, index$1 + 2);
                segment.vertexLength += 4;
                segment.primitiveLength += 2;
            }
        }
    };

    RectBucket.prototype.upload = function upload(context) {
        this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, [
            {name: "a_pos", type: "Float32", components: 2, offset: 0},
            {name: "a_size", type: "Float32", components: 4, offset: 8}
        ]);
        this.indexBuffer = context.createIndexBuffer(this.indexArray);
    };

    return RectBucket;
});