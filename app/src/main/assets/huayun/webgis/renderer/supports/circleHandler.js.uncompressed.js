define("com/huayun/webgis/renderer/supports/circleHandler", [
    "exports",
    "../../gl/mode",
    "../../data/bucket/CircleBucketSimplify",
    "../../geometry/Point"
], function (exports, mode, CircleBucket, Point) {
    exports.addCircle = function (graphic, view, geometry, symbol) {
        var bucket = new CircleBucket();
        var center = view.viewpoint.center,
            cx = center[0],
            cy = center[1];
        bucket.addFeature([[new Point(Math.round(geometry.x - cx), Math.round(geometry.y - cy))]]);
        bucket.upload(view.context);
        graphic.buckets.push(bucket)
        graphic.position = [cx, cy];
    }

    exports.drawCircle = function (painter, graphic, symbol, index, radius) {
        var context = painter.view.context;
        var gl = context.gl;
        var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
        var stencilMode = mode.StencilMode.disabled;
        var colorMode = mode.ColorMode.alphaBlended;

        var bucket = graphic.buckets[index];
        var program = painter.view.useProgramSimplify('circle', {
            layoutAttributes: [{name: "a_pos", type: "Float32", components: 2, offset: 0}]
        });

        var uniform = symbol.uniforms;
        var position = graphic.position;
        uniform["u_matrix"] = painter.transform.getMatrixForPoint(position[0], position[1]);
        uniform["u_camera_to_center_distance"] = painter.transform.cameraToCenterDistance;
        /*var resolution = painter.transform.resolution;
        var pitchWithMap = symbol.pitchWithMap;
        var fixedSize = symbol.fixedSize;
        if (pitchWithMap) {
            if (fixedSize) {
                uniform["u_extrude_scale"] = [resolution, resolution];
            } else {
                uniform["u_extrude_scale"] = [1, 1];
            }
        } else {

        }*/
        uniform["u_extrude_scale"] = painter.transform.pixelsToGLUnits;
        uniform["radius"] = radius;
        program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
            uniform, graphic.id + "-" + index,
            bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
            null, painter.transform.level);
    };
})