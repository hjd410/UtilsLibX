define("com/huayun/webgis/renderer/FillRenderer", [
    "../geometry/Point",
    "../data/bucket/FillBucketSimplify",
    "../gl/mode",
    "../gl/programCache"
], function (Point, FillBucket, mode, programCache) {
    function FillRenderer() {

    }

    FillRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        var center = graphic.position || view.viewpoint.center || [0, 0],
            cx = center[0],
            cy = center[1];
        if (geometry.type === "multipolygon") {
            var buckets = [];
            for (var i = 0; i < geometry.polygons.length; i++) {
                var polygon = geometry.polygons[i];
                var bucket = this._addOnePathFeature(polygon, view, cx, cy);
                buckets.push(bucket);
            }
            graphic.buckets.push(buckets);
        } else {
            var bucket = this._addOnePathFeature(geometry, view, cx, cy);
            graphic.buckets.push(bucket);
        }
        graphic.position = [cx, cy];
    };
    /**
     *
     * @param { any } geometry
     * @param { any } view
     * @param cx
     * @param cy
     * @private
     */
    FillRenderer.prototype._addOnePathFeature = function (geometry, view, cx, cy) {
        var points = geometry.path;
        var g = [];
        for (var i = 0; i < points.length; i++) {
            var line = points[i];
            var l = [];
            for (var j = 0; j < line.length; j++) {
                var p = line[j];
                l.push(new Point(p.x - cx, p.y - cy, 0));
            }
            g.push(l);
        }
        var bucket = new FillBucket();
        bucket.addFeature(g);
        bucket.upload(view.context);
        return bucket;
    }

    FillRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index) {
        if (index === undefined) index = 0;
        var colorMode = mode.ColorMode.alphaBlended;
        var context = view.context;
        var gl = context.gl;
        var depthMode;
        if (layerView) {
            depthMode = layerView.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
        } else {
            depthMode = new mode.DepthMode(gl.LEQUAL, mode.DepthMode.ReadOnly, [0.9, 0.9]);
        }
        var program = programCache.useProgramSimplify(context, 'basicFill', {
            layoutAttributes: [
                {name: "a_pos", type: "Float32", components: 2, offset: 0}
            ]
        });
        var uniform = symbol.uniforms;
        var position = graphic.position;
        uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0], position[1]);
        uniform['u_color'] = symbol.color;
        var bucket = graphic.buckets[index];
        if (geometry.type === "multipolygon") {
            bucket.forEach(function (bck, indice) {
                program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled,
                    uniform, graphic.id + "-fill" + index + "-" + indice, bck.layoutVertexBuffer, bck.indexBuffer, bck.segments);
            });
        } else {
            program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled,
                uniform, graphic.id + "-fill" + index, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
        }
    };

    FillRenderer.prototype.drawGlow = function (view, graphic, geometry, symbol, layerView, index) {
        var glow = graphic.glow;
        if (!glow) return;
        if (index === undefined) index = 0;
        var colorMode = mode.ColorMode.alphaBlended;
        var context = view.context;
        var gl = context.gl;
        var depthMode;
        if (layerView) {
            depthMode = layerView.depthModeForSublayer(0, mode.DepthMode.ReadOnly);
        } else {
            depthMode = new mode.DepthMode(gl.LEQUAL, mode.DepthMode.ReadOnly, [0.9, 0.9]);
        }
        var program = programCache.useProgramSimplify(context, 'basicFill', {
            layoutAttributes: [
                {name: "a_pos", type: "Float32", components: 2, offset: 0}
            ]
        });
        var uniform = symbol.uniforms;
        var position = graphic.position;
        uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0], position[1]);
        uniform['u_color'] = glow.color;
        var bucket = graphic.buckets[index];
        program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled,
            uniform, graphic.id + "-fill" + index, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
    };

    FillRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result) {
        var extent = geometry.extent;
        result.push({
            id: graphic.id,
            g: graphic,
            minX: extent.xmin,
            minY: extent.ymin,
            maxX: extent.xmax,
            maxY: extent.ymax,
            symbol: symbol
        });
    };

    return FillRenderer;
})
