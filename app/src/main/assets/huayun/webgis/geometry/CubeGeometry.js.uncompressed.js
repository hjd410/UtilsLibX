define("com/huayun/webgis/geometry/CubeGeometry", [
    "../data/ArrayType",
    "../gl/SegmentVector"
], function (ArrayType, SegmentVector) {
    function CubeGeometry(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    CubeGeometry.createGeometry = function (geometry) {
        var vertices = new ArrayType.StructArrayLayout3f12();
        var indices = new ArrayType.StructArrayLayout3ui6();
        var x = geometry.x / 2,
            y = geometry.y / 2,
            z = geometry.z / 2;
        vertices.emplaceBack(-x, -y, -z);
        vertices.emplaceBack(x, -y, -z);
        vertices.emplaceBack(x, y, -z);
        vertices.emplaceBack(-x, y, -z);

        vertices.emplaceBack(-x, -y, z);
        vertices.emplaceBack(x, -y, z);
        vertices.emplaceBack(x, y, z);
        vertices.emplaceBack(-x, y, z);

        indices.emplaceBack(0, 1, 2);
        indices.emplaceBack(0, 2, 3);

        indices.emplaceBack(0, 1, 5);
        indices.emplaceBack(0, 5, 4);

        indices.emplaceBack(1, 2, 6);
        indices.emplaceBack(1, 6, 5);

        indices.emplaceBack(2, 3, 7);
        indices.emplaceBack(2, 7, 6);

        indices.emplaceBack(3, 0, 4);
        indices.emplaceBack(3, 4, 7);

        indices.emplaceBack(4, 5, 6);
        indices.emplaceBack(4, 6, 7);

        geometry.bucket = {
            layoutVertex: vertices,
            index: indices,
            segments: SegmentVector.simpleSegment(0, 0, 8, 12)
        };
        geometry.uploaded = false;
    }

    CubeGeometry.prototype.upload = function (context) {
        if (this.uploaded) {
            return;
        }
        this.uploaded = true;
        this.bucket.layoutVertexBuffer = context.createVertexBuffer(this.bucket.layoutVertex, [
            {name: "a_pos", type: "Float32", components: 3, offset: 0}
        ]);
        this.bucket.indexBuffer = context.createIndexBuffer(this.bucket.index);
    }

    return CubeGeometry;
})