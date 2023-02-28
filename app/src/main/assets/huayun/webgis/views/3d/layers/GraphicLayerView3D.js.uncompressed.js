define("com/huayun/webgis/views/3d/layers/GraphicLayerView3D", [
    "dojo/_base/declare",
    "./LayerView3D",
    "com/huayun/webgis/gl/mode",
    "com/huayun/webgis/data/ArrayType",
    "com/huayun/webgis/gl/SegmentVector",
    "com/huayun/webgis/gl/glUtils"
], function (declare, LayerView3D, mode, ArrayType, SegmentVector, glUtils) {
    return declare("com.huayun.webgis.views.3d.layers.GraphicLayerView3D", [LayerView3D], {

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.visible = params.visible;
            this.renderer = params.renderer;
            this.glow = params.glow;
            var viewportArray = new ArrayType.StructArrayLayout4i8();
            viewportArray.emplaceBack(-1, -1, 0, 0);
            viewportArray.emplaceBack(1, -1, 1, 0);
            viewportArray.emplaceBack(-1, 1, 0, 1);
            viewportArray.emplaceBack(1, 1, 1, 1);
            this.viewportBuffer = this.view.context.createVertexBuffer(viewportArray, [
                {name: "aPos", type: "Int16", components: 4, offset: 0}
            ]);
            this.viewportSegments = SegmentVector.simpleSegment(0, 0, 4, 2);

            var quadTriangleIndices = new ArrayType.StructArrayLayout3ui6();
            quadTriangleIndices.emplaceBack(0, 1, 2);
            quadTriangleIndices.emplaceBack(2, 1, 3);
            this.quadTriangleIndexBuffer = this.view.context.createIndexBuffer(quadTriangleIndices);
        },

        _readyData: function () {
        },
        _render: function () {
            var level = this.view.viewpoint.targetZoom || this.view.viewpoint.level;
            var show = true;
            if (this.layer.minLevel && level < this.layer.minLevel) {
                show = false;
            }
            if (this.layer.maxLevel && level >= this.layer.maxLevel) {
                show = false;
            }

            if (this.visible && show) {
                this.view.currentLayer++;
                this.depthRangeFor3D = [0, 1 - ((1 + this.view.currentLayer) * this.view.numSublayers) * this.view.depthEpsilon];
                var graphics = this.layer.graphics;
                var graphic, symbol;
                var filterGraphic = [];
                for (var i = 0; i < graphics.length; i++) {
                    graphic = graphics[i];
                    if (graphic.glow && graphic.visible && graphic.symbol) {
                        filterGraphic.push(graphic);
                    }
                }
                try {
                    if (filterGraphic.length > 0) { // 绘制带滤镜的图形
                        var context = this.view.context;
                        var width = this.view.width,
                            height = this.view.height;
                        // 切换绘制目标是framebuffer
                        this.bindFramebuffer(context, "renderFBO", width, height);
                        var gl = context.gl;
                        gl.clearColor(0.0, 0.0, 0.0, 0.0);
                        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                        for (i = 0; i < filterGraphic.length; i++) {
                            graphic = filterGraphic[i];
                            symbol = graphic.symbol;
                            // graphic.renderer.draw[symbol.type](this, graphic, graphic.glow);
                            this.renderer.drawGlow(this.view, graphic, graphic.feature.geometry, symbol, this);
                        }
                        this.renderBlur(context, width, height); // 模糊化
                        context.bindFramebuffer.set(null);
                        context.viewport.set([0, 0, width, height]);
                        this.renderTextureToMap(context);
                        for (i = 0; i < graphics.length; i++) {
                            graphic = graphics[i];
                            symbol = graphic.symbol;
                            if (graphic.visible && symbol) {
                                this.renderer.draw(this.view, graphic, graphic.feature.geometry, symbol, this);
                                if (graphic.addHook) {
                                    graphic.addHook(graphic, this);
                                    graphic.addHook = null;
                                }
                            }
                        }
                    } else {
                        for (i = 0; i < graphics.length; i++) {
                            graphic = graphics[i];
                            symbol = graphic.symbol;
                            if (graphic.visible && symbol) {
                                this.renderer.draw(this.view, graphic, graphic.feature.geometry, symbol, this);
                                if (graphic.addHook) {
                                    graphic.addHook(graphic, this);
                                    graphic.addHook = null;
                                }
                            }
                        }
                    }
                }catch (e) {
                    console.log(e);
                }
            }
        },
        bindFramebuffer: function (context, targetFBOName, width, height) {
            var fbo = this[targetFBOName];

            if (!fbo || Math.abs((fbo.width - width)) > 1 || Math.abs(fbo.height - height) > 1) {
                fbo = this[targetFBOName] = glUtils.generateFBO(context, width, height);
            }
            context.bindFramebuffer.set(fbo.framebuffer);
        },

        renderBlur: function (context, width, height) {
            var gl = context.gl;
            var reductionRate = this.layer.glowRatio;
            // var reductionRate = 1; //this.layer.glowRatio;
            width = Math.ceil(width / reductionRate);
            height = Math.ceil(height / reductionRate);
            this.bindFramebuffer(context, "blurFBO", width, height);
            context.activeTexture.set(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.renderFBO.colorAttachment.get());

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            context.viewport.set([0, 0, width, height]);
            this.view.useProgramSimplify('gaussianBlur', {
                "layoutAttributes": {name: "aPos", type: "Int16", components: 4, offset: 0}
            }).draw(context, gl.TRIANGLES,
                mode.DepthMode.disabled, mode.StencilMode.disabled, mode.ColorMode.alphaBlended, mode.CullFaceMode.disabled,
                {
                    'uSize': [width, height],
                    'uTexture': 0,
                    'uHorizontal': 0,
                    'u_kernel': [0.8, 0.15, 0.1, 0.05, 0.01]
                },
                this.id, this.viewportBuffer, this.quadTriangleIndexBuffer,
                this.viewportSegments);

            this.bindFramebuffer(context, "blurFBO2", width, height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.bindTexture(gl.TEXTURE_2D, this.blurFBO.colorAttachment.get());
            this.view.useProgramSimplify('gaussianBlur', {
                "layoutAttributes": {name: "aPos", type: "Int16", components: 4, offset: 0}
            }).draw(context, gl.TRIANGLES,
                mode.DepthMode.disabled, mode.StencilMode.disabled, mode.ColorMode.alphaBlended, mode.CullFaceMode.disabled,
                {
                    'uSize': [width, height],
                    'uTexture': 0,
                    'uHorizontal': 1,
                    'u_kernel': [0.8, 0.15, 0.1, 0.05, 0.01]
                },
                this.id, this.viewportBuffer, this.quadTriangleIndexBuffer,
                this.viewportSegments);
        },

        renderTextureToMap: function (context) {
            var gl = context.gl;
            var fbo = this.blurFBO2;
            if (!fbo) {
                return;
            }
            context.activeTexture.set(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, fbo.colorAttachment.get());

            this.view.useProgramSimplify('screen', {
                "layoutAttributes": {name: "aPos", type: "Int16", components: 4, offset: 0}
            }).draw(context, gl.TRIANGLES,
                mode.DepthMode.disabled, mode.StencilMode.disabled, mode.ColorMode.alphaBlended, mode.CullFaceMode.disabled,
                {
                    uTexture: 0
                },
                this.id, this.viewportBuffer, this.quadTriangleIndexBuffer,
                this.viewportSegments);
        },

        refresh: function () {
            this.view.threeRender();
        },

        addGraphic: function (graphic) {
            if (!graphic.position) {
                graphic.position = this.view.viewpoint.center;
            }
            if (graphic.symbol) {
                graphic.added = true;
                this.renderer.add(this.view, graphic, graphic.feature.geometry, graphic.symbol);
                graphic.addHook = function (g, layerView) {
                    var items = [];
                    layerView.renderer.calculateExtent(layerView.view, g, g.feature.geometry, g.symbol, items);
                    layerView.view.insertItems(items);
                }
            }
        },

        zoom: function () {
            if (this.visible) {
                this._render();
            }
        },
        depthModeForSublayer: function (n, mask, func) {
            // var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
            // return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);
            return new mode.DepthMode(this.view.context.gl.LEQUAL, mask, this.view.depthRangeFor3D);
            // new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [0, 1]);
        },
        setVisible: function (value) {
            this.visible = value;
            this.view.threeRender();
        }

        /*remove:function(graphic){

        },



        _graphicRefresh: function () {

        },
        resize: function () {

        },

        */

    });
});
