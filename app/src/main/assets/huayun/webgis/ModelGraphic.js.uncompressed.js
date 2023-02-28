define("com/huayun/webgis/ModelGraphic", [
    "./utils/glTFLoader",
    "./gl/SegmentVector",
    "./gl/programCache",
    "./gl/mode",
    "custom/gl-matrix-min"
], function (glTFLoader, SegmentVector, programCache, mode, glMatrix) {
    var uniformValues = function (view, graphic) {
        var uniform = {};
        var position = graphic.position;
        if (view.ground && !position.posMidified) {
            var level = Math.min(view.viewpoint.targetZoom || view.viewpoint.level, view.ground.maxLevel);
            var resolution = view.viewpoint.tileInfo.getResolution(level);
            var col = view.viewpoint.tileInfo.getColForX(position.x, resolution),
                row = view.viewpoint.tileInfo.getRowForY(position.y, resolution),
                deltaCol = col - Math.floor(col),
                deltaRow = row - Math.floor(row);
            var targetTile = view.ground.sourceCache.getTileByID(level + "/" + Math.floor(col) + "/" + Math.floor(row));
            if (targetTile && targetTile.fbo) {
                position.posMidified = true;
                var gl = view.context.gl;
                view.context.bindFramebuffer.set(targetTile.fbo.framebuffer);
                var pixels = new Float32Array(4);
                var c = Math.round(deltaCol * 256);
                var d = Math.round(deltaRow * 256);
                gl.readPixels(c === 0 ? c : c - 1, d === 0 ? d : d - 1, 1, 1, gl.RGBA, gl.FLOAT, pixels);
                var min = targetTile.minimumHeight,
                    delta = targetTile.maximumHeight - targetTile.minimumHeight
                position.z = pixels[0] * delta + min;
                graphic.posMidified = true;
            } else {
                position.z = 0;
                position.posMidified = false;
            }
        }
        var m = view.viewpoint.getMatrixForPoint(position.x, position.y, false, false, position.z);
        /*m = glMatrix.mat4.rotateX(m, m, Math.PI / 2);
        m = glMatrix.mat4.rotateY(m, m, Math.PI / 2);
        uniform["u_matrix"] = glMatrix.mat4.scale(m, m, [3, 3, 3]);*/
        // uniform["u_matrix"] = m;
        uniform["u_matrix"] = glMatrix.mat4.multiply(m, m, graphic.modelMatrix);
        return uniform;
    };


    function uniformValuesCylinder(view, graphic, uniform) {
        var position = graphic.position;
        if (view.ground && !position.posMidified) {
            var level = Math.min(view.viewpoint.targetZoom || view.viewpoint.level, view.ground.maxLevel);
            var resolution = view.viewpoint.tileInfo.getResolution(level);
            var col = view.viewpoint.tileInfo.getColForX(position.x, resolution),
                row = view.viewpoint.tileInfo.getRowForY(position.y, resolution),
                deltaCol = col - Math.floor(col),
                deltaRow = row - Math.floor(row);
            var targetTile = view.ground.sourceCache.getTileByID(level + "/" + Math.floor(col) + "/" + Math.floor(row));
            if (targetTile && targetTile.fbo) {
                position.posMidified = true;
                var gl = view.context.gl;
                view.context.bindFramebuffer.set(targetTile.fbo.framebuffer);
                var pixels = new Float32Array(4);
                var c = Math.round(deltaCol * 256);
                var d = Math.round(deltaRow * 256);
                gl.readPixels(c === 0 ? c : c - 1, d === 0 ? d : d - 1, 1, 1, gl.RGBA, gl.FLOAT, pixels);
                var min = targetTile.minimumHeight,
                    delta = targetTile.maximumHeight - targetTile.minimumHeight
                position.z = pixels[0] * delta + min;
                graphic.posMidified = true;
            } else {
                position.z = 0;
                position.posMidified = false;
            }
        }
        uniform["u_matrix"] = view.viewpoint.getMatrixForPoint(position.x, position.y, false, false, position.z);
    }

    var uid = 0;

    function ModelGraphic(params) {
        this.model = params.model;
        this.position = params.position;
        this.id = "modelGraphic" + (uid++);
        this.selectEnabled = params.selectEnabled === undefined ? true : params.selectEnabled;
        this.useFallback = false;
        this.fallback = params.fallback;

        this.rotateX = params.rotateX;
        this.rotateY = params.rotateY;
        this.rotateZ = params.rotateZ;

        this.scale = params.scale;
        var m = glMatrix.mat4.create();
        if (this.rotateX) {
            glMatrix.mat4.rotateX(m, m, this.rotateX);
        }
        if (this.rotateY) {
            glMatrix.mat4.rotateY(m, m, this.rotateY);
        }
        if (this.rotateZ) {
            glMatrix.mat4.rotateY(m, m, this.rotateZ);
        }
        if (this.scale) {
            glMatrix.mat4.scale(m, m, this.scale);
        }

        this.modelMatrix = m;
    }

    ModelGraphic.prototype.add = function (view) {
        this.model.load(view, function () {
            view.threeRender();
        });
    }

    ModelGraphic.prototype.render = function (painter, fallbackSymbol) {
        if (!this.model.loaded) {
            return;
        }
        var context = painter.view.context;
        var gl = context.gl;

        var stencilMode = mode.StencilMode.disabled;
        var colorMode = mode.ColorMode.alphaBlended;
        var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadWrite);

        if (this.useFallback) {
            if (!this.fallback.uploaded) {
                this.fallback.upload(context);
            }
            var program = programCache.useProgramSimplify(context, 'cylinder', {
                layoutAttributes: [
                    {name: "a_pos", type: "Float32", components: 3, offset: 0}
                ]
            });
            var uniforms = fallbackSymbol.uniforms;
            uniformValuesCylinder(painter.view, this, uniforms);
            var bucket = this.fallback.bucket;
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                uniforms, this.model.id + "-cylinder",
                bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
        } else {
            var program = programCache.useProgramSimplify(context, 'mesh', {
                layoutAttributes: [
                    {name: "position", type: "Float32", components: 3, offset: 0}
                ]
            });
            var uniform = uniformValues(painter.view, this);
            var buckets = this.model.buckets;

            /*context.setDepthMode(depthMode);
            // context.setStencilMode(stencilMode);
            context.setColorMode(colorMode);
            context.setCullFace(mode.CullFaceMode.disabled);*/

            for (var i = 0; i < buckets.length; i++) {
                var bucket = buckets[i];
                uniform["u_model"] = bucket.modelMatrix;
                uniform["u_color"] = bucket.material.color;
                program.draw(context, gl.TRIANGLES, depthMode, null, colorMode, mode.CullFaceMode.disabled, uniform,
                    this.model.id + "-" + i, bucket.vertexBuffer, bucket.indexBuffer, bucket.segments);
            }
        }
    }

    ModelGraphic.prototype.renderSubstation = function (painter, fallbackSymbol) {
        var context = painter.view.context;
        var gl = context.gl;

        var stencilMode = mode.StencilMode.disabled;
        var colorMode = mode.ColorMode.alphaBlended;
        var depthMode = painter.depthModeForSublayer(0, mode.DepthMode.ReadWrite);

        if (this.useFallback) {
            if (!this.fallback.uploaded) {
                this.fallback.upload(context);
            }
            var program = programCache.useProgramSimplify(context, 'cylinder', {
                layoutAttributes: [
                    {name: "a_pos", type: "Float32", components: 3, offset: 0}
                ]
            });
            var uniforms = fallbackSymbol.uniforms;
            uniformValuesCylinder(painter.view, this, uniforms);
            var bucket = this.fallback.bucket;
            program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, mode.CullFaceMode.disabled,
                uniforms, this.model.id + "-cylinder",
                bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments);
        }
    }

    return ModelGraphic;
})