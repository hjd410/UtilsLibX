define("com/huayun/webgis/renderer/LineRenderer", [
    "./Renderer",
    "../geometry/Point",
    "../data/bucket/LineBucketSimplify",
    "../gl/mode",
    "../gl/programAttributes",
    "../gl/programCache"
], function (Renderer, Point, LineBucket, mode, programAttributes, programCache) {

    function LineRenderer() {

    }

    if (Renderer) LineRenderer.__proto__ = Renderer;
    LineRenderer.prototype = Object.create(Renderer && Renderer.prototype);
    LineRenderer.prototype.constructor = LineRenderer;

    var lineUniformValues = function (view, graphic, symbol) {
        var uniform = symbol.uniforms;
        var position = graphic.position;
        uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0], position[1], false, false, position[2] || 0);
        uniform["u_units_to_pixels"] = [view.viewpoint.width / 2, -view.viewpoint.height / 2];
        uniform["u_ratio"] = 1 / view.viewpoint.resolution;
        return uniform;
    };

    var lineSDFUniformValues = function (view, graphic, symbol, dasharray) {
        var r = 1 / view.resolution;
        var uniform = symbol.uniforms;
        var position = graphic.position;
        var round = symbol.cap === "round";
        var posA = view.lineAtlas.getDash(dasharray.from, round);
        var posB = view.lineAtlas.getDash(dasharray.to, round);
        var widthA = posA.width * 2;
        var widthB = posB.width * 1;

        uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position[0], position[1], false, false, position[2] || 0);
        uniform["u_units_to_pixels"] = [view.viewpoint.width / 2, -view.viewpoint.height / 2];
        uniform["u_ratio"] = r;
        uniform["u_image"] = 0;
        uniform["u_patternscale_a"] = [r / widthA, -posA.height / 2];
        uniform["u_patternscale_b"] = [r / widthB, -posB.height / 2];
        uniform["u_sdfgamma"] = view.lineAtlas.width / (Math.min(widthA, widthB) * 256) / 2;
        uniform["u_tex_y_a"] = posA.y;
        uniform["u_tex_y_b"] = posB.y;
        return uniform;
    };

    LineRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        if (view.ground) {
            var ps = geometry.path[0];
            for (var j = 0; j < ps.length; j++) {
                var p = ps[j];
                /*if (p.base && !p.base.posMidified) {
                    graphic.needAdd = true;
                    return;
                } else {
                    p.z += p.base.position.z;
                    p.base = null;
                }*/
                if (p.base) {
                    if (p.base.posMidified) {
                        p.z += p.base.z;
                        p.base = null;
                    } else {
                        graphic.needAdd = true;
                        view.threeRender();
                        return;
                    }
                }
            }
        }
        graphic.needAdd = false;
        var center = graphic.position || view.viewpoint.center || [0, 0],
            cx = center[0],
            cy = center[1];
        if (geometry.type === 'multipolygon') {
            var buckets = [];
            for (var i = 0; i < geometry.polygons.length; i++) {
                var polygon = geometry.polygons[i];
                var bucket = this._addOnePathFeature(polygon, view, graphic, symbol, cx, cy);
                buckets.push(bucket);
            }
            graphic.buckets.push(buckets);
        } else {
            var bucket = this._addOnePathFeature(geometry, view, graphic, symbol, cx, cy);
            graphic.buckets.push(bucket);
        }
        graphic.position = [cx, cy, 0];
    };
    /**
     * 一个面的边线绘制
     * @param { any } geometry
     * @param { any } view
     * @param { any } graphic
     * @param { any } symbol
     * @param cx
     * @param cy
     * @private
     */
    LineRenderer.prototype._addOnePathFeature = function (geometry, view, graphic, symbol, cx, cy) {
        var points = geometry.path;
        var g = [];
        for (var i = 0; i < points.length; i++) {
            var line = points[i];
            var l = [];
            var oldP = new Point(-1, -1);
            for (var j = 0; j < line.length; j++) {
                var p = line[j];
                if (oldP.equals(p)) {
                    continue;
                }

                l.push(new Point(p.x - cx, p.y - cy, p.z));
                oldP = p;
            }
            g.push(l);
        }
        var bucket = new LineBucket();
        bucket.addFeature(g, symbol.join, symbol.cap, 2, 1.05);
        bucket.upload(view.context);
        return bucket;
    }

    LineRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index, sizeRight) {
        if (graphic.needAdd || graphic.buckets.length === 0) {
            this.add(view, graphic, geometry, symbol);
            if (graphic.needAdd) return;
        }
        if (index === undefined) index = 0;
        var context = view.context;
        var gl = context.gl;
        var depthMode;
        if (layerView) {
            depthMode = layerView.depthModeForSublayer(0, mode.DepthMode.ReadWrite);
        } else {
            depthMode = new mode.DepthMode(gl.LEQUAL, mode.DepthMode.ReadWrite, [0.9, 0.9]);
        }
        var colorMode = mode.ColorMode.alphaBlended;
        var buckets = graphic.buckets;
        var dasharray = symbol.dasharray;
        if (dasharray) {
            context.activeTexture.set(gl.TEXTURE0);
            view.lineAtlas.bind(context);
        }
        var programId = dasharray ? "basicLineSDF" : "myline"; // 判断是否是虚线
        var program = programCache.useProgramSimplify(context, programId, programAttributes.basicLine);
        var uniform = dasharray ? lineSDFUniformValues(view, graphic, symbol, dasharray) : lineUniformValues(view, graphic, symbol);
        // var tempV = this.getRealScale(symbol.fixed, view.scale, symbol.minScale);
        if (!sizeRight) {
            var w = symbol.width * this.getRealScale(symbol.fixed, view.scale, symbol.minScale);
            uniform['u_width'] = w < 1 ? 1 : w;
        }
        uniform['u_color'] = symbol.color;
        var bucket = buckets[index];
        if (geometry.type === "multipolygon") {
            bucket.forEach(function (bck, indice) {
                program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled, uniform,
                    graphic.id + "-line" + index + "-" + indice, bck.layoutVertexBuffer, bck.indexBuffer, bck.segments);
            });
        } else {
            program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled, uniform,
                graphic.id + "-line" + index, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
        }
    }

    LineRenderer.prototype.drawGlow = function (view, graphic, geometry, symbol, layerView, index, sizeRight) {
        var glow = graphic.glow;
        if (!glow) return;
        if (index === undefined) index = 0;
        var context = view.context;
        var gl = context.gl;
        var depthMode;
        if (layerView) {
            depthMode = layerView.depthModeForSublayer(0, mode.DepthMode.ReadWrite);
        } else {
            depthMode = new mode.DepthMode(gl.LEQUAL, mode.DepthMode.ReadWrite, [0.9, 0.9]);
        }
        var colorMode = mode.ColorMode.alphaBlended;
        var buckets = graphic.buckets;
        var dasharray = symbol.dasharray;
        if (dasharray) {
            context.activeTexture.set(gl.TEXTURE0);
            view.lineAtlas.bind(context);
        }
        var programId = dasharray ? "basicLineSDF" : "basicLine"; // 判断是否是虚线
        var program = programCache.useProgramSimplify(context, programId, programAttributes.basicLine);
        var uniform = dasharray ? lineSDFUniformValues(view, graphic, symbol, dasharray) : lineUniformValues(view, graphic, symbol);
        // var tempV = this.getRealScale(symbol.fixed, view.scale, symbol.minScale);
        if (!sizeRight) {
            var w = symbol.width * this.getRealScale(symbol.fixed, view.scale, symbol.minScale);
            uniform['u_width'] = w < 1 ? 1 : w;
        }
        var bucket = buckets[index];
        uniform['u_color'] = glow.color;
        program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled, uniform,
            graphic.id + "-line" + index, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
    }

    LineRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result, index) {
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

    return LineRenderer;
});
