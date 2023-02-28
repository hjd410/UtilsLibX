define("com/huayun/webgis/gl/SegmentVector", [], function () {
    var SegmentVector = function SegmentVector(segments) {
        if (segments === void 0) segments = [];
        this.segments = segments;
    };
    SegmentVector.prototype.prepareSegment = function prepareSegment(numVertices, layoutVertexArray, indexArray, sortKey) {
        var segment = this.segments[this.segments.length - 1];
        if (numVertices > SegmentVector.MAX_VERTEX_ARRAY_LENGTH) {
           console.log("Max vertices per segment is " + (SegmentVector.MAX_VERTEX_ARRAY_LENGTH) + ": bucket requested " + numVertices);
        }
        if (!segment || segment.vertexLength + numVertices > SegmentVector.MAX_VERTEX_ARRAY_LENGTH || segment.sortKey !== sortKey) {
            segment = {
                vertexOffset: layoutVertexArray.length,
                primitiveOffset: indexArray.length,
                vertexLength: 0,
                primitiveLength: 0
            };
            if (sortKey !== undefined) {
                segment.sortKey = sortKey;
            }
            this.segments.push(segment);
        }
        return segment;
    };

    SegmentVector.prototype.get = function get() {
        return this.segments;
    };

    SegmentVector.prototype.destroy = function destroy() {
        for (var i = 0, list = this.segments; i < list.length; i += 1) {
            var segment = list[i];

            for (var k in segment.vaos) {
                segment.vaos[k].destroy();
            }
        }
    };

    SegmentVector.simpleSegment = function simpleSegment(vertexOffset, primitiveOffset, vertexLength, primitiveLength) {
        return new SegmentVector([{
            vertexOffset: vertexOffset,
            primitiveOffset: primitiveOffset,
            vertexLength: vertexLength,
            primitiveLength: primitiveLength,
            vaos: {},
            sortKey: 0
        }]);
    };

    SegmentVector.MAX_VERTEX_ARRAY_LENGTH = Math.pow(2, 16) - 1;
    return SegmentVector;
});