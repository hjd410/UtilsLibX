define("com/huayun/webgis/renderer/supports/lineHandler", [
    "exports",
    "../../gl/mode",
    "../../gl/programAttributes",
    "../../data/bucket/LineBucketSimplify",
    "../../geometry/Point"
], function (exports, mode, programAttributes, LineBucket, Point) {

    var lineUniformValues = function (painter, graphic, symbol) {
        var uniform = symbol.uniforms;
        // uniform["u_matrix"] = painter.transform.centerMatrix;
        var position = graphic.position;
        uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
        uniform["u_units_to_pixels"] = [painter.transform.width / 2, -painter.transform.height / 2];
        uniform["u_ratio"] = 1 / painter.transform.resolution;
        return uniform;
    };

    var lineSDFUniformValues = function (painter, graphic, symbol) {
        var r = 1 / painter.view.resolution;
        var uniform = symbol.uniforms;
        // uniform["u_matrix"] = painter.transform.centerMatrix;
        var position = graphic.position;
        uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
        uniform["u_units_to_pixels"] = [painter.transform.width / 2, -painter.transform.height / 2];
        uniform["u_ratio"] = r;
        uniform["u_image"] = 0;
        uniform["u_patternscale_a"] = [r / symbol.widthA, uniform["u_patternscale_a"][1]];
        uniform["u_patternscale_b"] = [r / symbol.widthB, uniform["u_patternscale_b"][1]];

        return uniform;
    };

    exports.addLine = function (graphic, view, geometry, symbol) {
        var center = view.viewpoint.center,
            cx = center[0],
            cy = center[1];
        var points = geometry.path;
        var g = [];
        for (var i = 0, ii = points.length; i < ii; i++) {
            var line = points[i];
            var l = [];
            for (var j = 0; j < line.length; j++) {
                var p = line[j];
                l.push(new Point(Math.round(p.x - cx), Math.round(p.y - cy), 0));
            }
            g.push(l);
        }
        var bucket = new LineBucket();
        bucket.addFeature(g, symbol.join, symbol.cap, 2, 1.05);
        bucket.upload(view.context);
        graphic.buckets.push(bucket);
        graphic.position = [cx, cy];
    };

    exports.drawLine = function (painter, graphic, symbol, index) {
        var context = painter.view.context;
        var gl = context.gl;
        var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
        var colorMode = mode.ColorMode.alphaBlended;
        var bucket = graphic.buckets[index];
        var dasharray = symbol.dasharray;
        var programId = dasharray ? "basicLineSDF" : "basicLine"; // 判断是否是虚线
        var program = painter.view.useProgramSimplify(programId, programAttributes.basicLine);

        if (dasharray) {
            context.activeTexture.set(gl.TEXTURE0);
            symbol.lineAtlas.bind(context);
        }

        var uniform = dasharray ? lineSDFUniformValues(painter, graphic, symbol) : lineUniformValues(painter, graphic, symbol);
        program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled, uniform,
            graphic.id + '-' + index, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
            null, painter.view.viewpoint.level);
    }
});