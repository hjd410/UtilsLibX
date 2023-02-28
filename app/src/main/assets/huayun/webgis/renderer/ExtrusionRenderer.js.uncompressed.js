define("com/huayun/webgis/renderer/ExtrusionRenderer", [
    "../gl/mode",
    "../gl/programCache",
    "../geometry/Point",
    "../data/bucket/FillExtrusionBucketSimplify"
], function (mode, programCache, Point, FillExtrusionBucketSimplify) {

    function ExtrusionRenderer() {

    }

    ExtrusionRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        var center = graphic.position || view.viewpoint.center || [0, 0],
            cx = center[0],
            cy = center[1];
        var points = geometry.path;
        var g = [];
        for (var i = 0; i < points.length; i++) {
            var line = points[i];
            var l = [];
            for (var j = 0; j < line.length; j++) {
                var p = line[j];
                l.push(new Point(Math.round(p.x - cx), Math.round(p.y - cy), 0));
            }
            g.push(l);
        }
        var bucket = new FillExtrusionBucketSimplify();
        bucket.addFeature(g);
        bucket.upload(view.context);
        graphic.buckets.push(bucket);
        graphic.position = [cx, cy];
    }

    ExtrusionRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index) {
        if (index === undefined) index = 0;
        var colorMode = mode.ColorMode.alphaBlended;
        var context = view.context;
        var gl = context.gl;
        var depthMode;
        if (layerView) {
            depthMode = layerView.depthModeForSublayer(0, mode.DepthMode.ReadWrite);
        } else {
            depthMode = new mode.DepthMode(gl.LEQUAL, mode.DepthMode.ReadWrite, [0.9, 0.9]);
        }
        var program = programCache.useProgramSimplify(context, 'fillExtrusion2', {
            layoutAttributes: [
                {name: "a_pos", type: "Int16", components: 2, offset: 0},
                {name: "a_normal_ed", type: "Int16", components: 4, offset: 4}
            ],
            defines: [
                "#define HAS_UNIFORM_u_color",
                "#define HAS_UNIFORM_u_height",
                "#define HAS_UNIFORM_u_base"
            ]
        });
        var uniform = symbol.uniforms;
        var position = graphic.position;
        uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0], position[1], false, false, 20);
        var bucket = graphic.buckets[index];
        program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled,
            uniform, graphic.id + "-extrusion" + index, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
    }

    ExtrusionRenderer.prototype.calculateExtent = function () {

    }

    return ExtrusionRenderer;
})