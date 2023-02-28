define("com/huayun/webgis/renderer/ConeRenderer", [
    "../data/ArrayType",
    "../gl/SegmentVector",
    "../gl/mode",
    "../gl/programCache"
], function (ArrayType, SegmentVector, mode, programCache) {
    function ConeRenderer() {

    }

    ConeRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        var position = geometry.position;
        var radius = geometry.radius,
            length = geometry.length,
            slices = geometry.slices,
            radianStep = Math.PI * 2 / slices;
        var context = view.context;
        var vertices = new ArrayType.StructArrayLayout7fb28();
        var indices = new ArrayType.StructArrayLayout3ui6();
        var topColor = symbol.topColor,
            bottomColor = symbol.bottomColor;

        vertices.emplaceBack(0, 0, 0, bottomColor[0], bottomColor[1], bottomColor[2], bottomColor[3]);
        var i, radian, cos, sin;
        for (i = 0; i < slices; i++) {
            radian = i * radianStep;
            cos = Math.cos(radian);
            sin = Math.sin(radian);
            vertices.emplaceBack(radius * cos, radius * sin, length, topColor[0], topColor[1], topColor[2], topColor[3]);
        }

        for (i = 1; i <= slices; i++) {
            if (i === slices) {
                indices.emplaceBack(0, 1, i);
            } else {
                indices.emplaceBack(0, i + 1, i);
            }
        }

        for (i = 1; i < slices - 1; i++) {
            indices.emplaceBack(i, i + 1, slices);
        }

        graphic.buckets.push({
            layoutVertexBuffer: context.createVertexBuffer(vertices, [
                {name: "a_pos", type: "Float32", components: 3, offset: 0},
                {name: "a_color", type: "Float32", components: 4, offset: 12},
            ]),
            indexBuffer: context.createIndexBuffer(indices),
            segments: SegmentVector.simpleSegment(0, 0, slices + 1, slices + 2)
        });
        graphic.position = [position.x, position.y, position.z];
    }

    ConeRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index) {
        if (index === undefined) index = 0;
        var context = view.context;
        var gl = context.gl;
        var depthMode;
        if (layerView) {
            depthMode = layerView.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
        } else {
            depthMode = new mode.DepthMode(gl.LEQUAL, mode.DepthMode.ReadOnly, [0.9, 0.9]);
        }
        var stencilMode = mode.StencilMode.disabled;
        var colorMode = mode.ColorMode.alphaBlended;
        var program = programCache.useProgramSimplify(context, 'cone', {
            layoutAttributes: [
                {name: "a_pos", type: "Float32", components: 3, offset: 0}
            ]
        });

        var uniform = symbol.uniforms;
        var position = graphic.position;
        uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0], position[1], false, false, position[2]);
        var buckets = graphic.buckets;
        var bucket = buckets[0];
        program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
            uniform, graphic.id + "-cone",
            bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
    }

    ConeRenderer.prototype.calculateExtent = function () {

    }

    return ConeRenderer;
})