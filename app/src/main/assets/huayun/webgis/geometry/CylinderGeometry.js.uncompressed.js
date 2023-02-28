define("com/huayun/webgis/geometry/CylinderGeometry", [
    "./Point",
    "../data/ArrayType",
    "../gl/SegmentVector"
], function (Point, ArrayType, SegmentVector) {

    const DEFAULT_RADIUS = 1;
    const DEFAULT_LENGTH = 1;
    const DEFAULT_SLICES = 30;

    function CylinderGeometry(props) {
        this.position = props.position || new Point(0, 0, 0);
        this.topRadius = props.topRadius || props.radius || DEFAULT_RADIUS;
        this.bottomRadius = props.bottomRadius || props.radius || DEFAULT_RADIUS;
        this.length = props.length || DEFAULT_LENGTH;
        this.slices = props.slices || DEFAULT_SLICES;
    }

    CylinderGeometry.createGeometry = function (geometry) {
        var topLength = geometry.length,
            bottomLength = 0,
            slices = geometry.slices,
            radianStep = Math.PI * 2 / slices,
            bottomRadius = geometry.bottomRadius,
            topRadius = geometry.topRadius;
        var radian, cos, sin;

        var vertices = new ArrayType.StructArrayLayout3f12();
        var indices = new ArrayType.StructArrayLayout3ui6();
        for (var i = 0; i < geometry.slices; i++) {
            radian = radian = i * radianStep;
            cos = Math.cos(radian);
            sin = Math.sin(radian);
            vertices.emplaceBack(bottomRadius * cos, bottomRadius * sin, bottomLength);
            vertices.emplaceBack(topRadius * cos, topRadius * sin, topLength);
        }

        // 底面
        for (i = 1; i < slices - 1; i++) {
            indices.emplaceBack(0, 2 * i, 2 * (i + 1));
        }

        // 侧面
        for (i = 0; i < slices; i++) {
            if (i === slices - 1) {
                indices.emplaceBack(i * 2, 0, 1);
                indices.emplaceBack(i * 2, 1, i * 2 + 1);
            } else {
                indices.emplaceBack(i * 2, (i + 1) * 2, (i + 1) * 2 + 1);
                indices.emplaceBack(i * 2, (i + 1) * 2 + 1, i * 2 + 1);
            }
        }

        // 顶面
        for (i = 1; i < slices - 1; i++) {
            indices.emplaceBack(1, 2 * i + 1, 2 * (i + 1) + 1);
        }

        geometry.bucket = {
            layoutVertex: vertices,
            index: indices,
            segments: SegmentVector.simpleSegment(0, 0, slices * 2, slices * 2 + (slices - 2) * 2)
        };
        geometry.uploaded = false;
    }

    CylinderGeometry.prototype.upload = function (context) {
        if (this.uploaded) {
            return;
        }
        this.uploaded = true;
        this.bucket.layoutVertexBuffer = context.createVertexBuffer(this.bucket.layoutVertex, [
            {name: "a_pos", type: "Float32", components: 3, offset: 0}
        ]);
        this.bucket.indexBuffer = context.createIndexBuffer(this.bucket.index);
    }

    return CylinderGeometry;
})