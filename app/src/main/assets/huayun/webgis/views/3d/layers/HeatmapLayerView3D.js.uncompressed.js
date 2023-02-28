define("com/huayun/webgis/views/3d/layers/HeatmapLayerView3D", [
    "dojo/_base/declare",
    "custom/heatmap",
    "./LayerView3D",
    "../../../gl/Texture",
    "../../../gl/draw",
    "../../../geometry/Extent",
    "com/huayun/webgis/gl/mode",
    "com/huayun/webgis/data/ArrayType",
    "com/huayun/webgis/utils/Constant",
    "com/huayun/webgis/gl/members",
    "com/huayun/webgis/gl/SegmentVector"
], function (declare, h337, LayerView3D, Texture, draw, Extent, mode, ArrayType, Constant, members, SegmentVector) {
    return declare("com.huayun.webgis.views.3d.layers.HeatmapLayerView3D", [LayerView3D], {
        constructor: function (params) {
            declare.safeMixin(this, params);

            this.visible = params.visible;
            this.view = params.view;
            this.opacity = params.opacity;
            var div = document.createElement("div");
            div.style.width = params.width + "px";
            div.style.height = params.height + "px";
            this.heatmap = h337.create({
                container: div,
                maxOpacity: 1,
                radius: params.radius,
                blur: params.blur,
                gradient: params.gradient,
                width: params.width,
                height: params.height
            });
            var quadTriangleIndices = new ArrayType.StructArrayLayout3ui6();
            quadTriangleIndices.emplaceBack(0, 1, 2);
            quadTriangleIndices.emplaceBack(2, 1, 3);
            this.quadTriangleIndexBuffer = this.view.context.createIndexBuffer(quadTriangleIndices);
            this.viewportSegments = SegmentVector.simpleSegment(0, 0, 4, 2);
            this.extent = new Extent(0, 0, 0, 0);
        },
        resize: function () {
            var width = this.view.viewpoint.width,
                height = this.view.viewpoint.height;
            this.width = width;
            this.height = height;
            var renderer = this.heatmap._renderer;
            renderer._width = width;
            renderer.canvas.width = width;
            renderer.canvas.height = height;
        },
        setVisible: function (visible) {
            this.visible = visible;
            this.view.threeRender();
        },
        setOpacity: function (opacity) {
            this.opacity = opacity;
            this.view.threeRender();
        },

        refresh: function () {
            this._readyData();
            this.view.threeRender();
        },
        _readyData: function () {
        },
        _render: function () {
            if (this.visible && this.layer.data) {
                var extent = this.view.extent;
                var zoom = this.view.viewpoint.level;
                var context = this.view.context;
                var gl = context.gl;
                if (!this.extent.equals(extent) || this.layer.dataDirty) {
                    var heatMapData = this._formatData(this.layer.filterData(extent), this.view);
                    this.layer.dataDirty = false;
                    this.heatmap.setData(heatMapData);
                    this.heatmap.repaint();
                    this.extent = extent;
                    if (this.texture) {
                        this.texture.update(this.heatmap._renderer.canvas, {useMipmap: true});
                    } else {
                        this.texture = new Texture(context, this.heatmap._renderer.canvas, gl.RGBA, {useMipmap: true});
                        this.texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);
                        if (context.extTextureFilterAnisotropic) {
                            gl.texParameterf(gl.TEXTURE_2D, context.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, context.extTextureFilterAnisotropicMax);
                        }
                    }
                }
                this.texture.zoom = zoom;
                this._drawLayer();
            }
        },

        _drawLayer: function () {
            this.view.currentLayer++;
            var extent = this.view.getExtent(),
                position = this.view.viewpoint.center;
            this.position = position;
            var EXTENT = Constant.layout.EXTENT;
            var rasterBoundsArray = new ArrayType.StructArrayLayout4f16();
            rasterBoundsArray.emplaceBack(extent.minx - position[0], position[1] - extent.maxy, 0, 0);
            rasterBoundsArray.emplaceBack(extent.maxx - position[0], position[1] - extent.maxy, EXTENT, 0);
            rasterBoundsArray.emplaceBack(extent.minx - position[0], position[1] - extent.miny, 0, EXTENT);
            rasterBoundsArray.emplaceBack(extent.maxx - position[0], position[1] - extent.miny, EXTENT, EXTENT);
            this.viewportBuffer = this.view.context.createVertexBuffer(rasterBoundsArray, [
                {name: "a_pos", type: "Float32", components: 2, offset: 0},
                {name: "a_texture_pos", type: "Float32", components: 2, offset: 8}
            ]);
            draw.drawImageLayer(this);
        },

        _formatData: function (res, view) {
            var points = [];
            var max = 0;
            var hw = this.width / 2,
                hh = this.height / 2,
                center = view.center,
                cx = center.x,
                cy = center.y,
                resolution = view.resolution;
            var len = res.length, item, p;
            for (var i = 0; i < len; i++) {
                item = res[i];
                p = item.point;
                item = this._geoToHeatmapData(p.x, p.y, item.value * 1, hw, hh, cx, cy, resolution);
                max = item.value > max ? item.value : max;
                points.push(item);
            }
            return {
                max: max,
                data: points
            };
        },
        _geoToHeatmapData: function (x, y, value, hw, hh, cx, cy, resolution) {
            return {
                x: ((x - cx) / resolution + hw + 0.5) | 0,
                y: (hh - (y - cy) / resolution + 0.5) | 0,
                value: value
            }
        },
        zoom: function () {
            if (this.visible) {
                draw.drawImageLayer(this);
            }
        },
        depthModeForSublayer: function (n, mask, func) {
            var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
            return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);
        }
    });
});