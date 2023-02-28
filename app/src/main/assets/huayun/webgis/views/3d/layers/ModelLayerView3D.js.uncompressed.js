define("com/huayun/webgis/views/3d/layers/ModelLayerView3D", [
    "dojo/_base/declare",
    "./LayerView3D",
    "../../../gl/mode",
    "../../../geometry/Polygon",
    "../../../geometry/Point",
], function (declare, LayerView3D, mode, Polygon, Point) {
    return declare("com.huayun.webgis.views.3d.layers.ModelLayerView3D", [LayerView3D], {
        constructor: function (params) {
            this.visible = params.visible;
            this.layer = params.layer;
            this.id = params.id;
            this.view = params.view;
        },

        /*addModel: function (model) {
            model.add(this.view)
        },*/

        refresh: function () {
            this.view.threeRender();
        },
        _readyData: function () {
        },
        _render: function () {
            var level = this.view.viewpoint.targetZoom || this.view.viewpoint.level;
            var visible = this.visible;
            if (this.layer.minLevel && level < this.layer.minLevel) {
                visible = false;
            }
            if (visible) {
                var self = this;
                /*
                this.depthRangeFor3D = [0, 1 - ((1 + this.view.currentLayer) * this.view.numSublayers) * this.view.depthEpsilon];
                var extent = this.view.getExtent();
                var models = this.layer.queryModelsByGeometry(new Polygon([
                    [
                        new Point(extent.xmin, extent.ymin),
                        new Point(extent.xmax, extent.ymin),
                        new Point(extent.xmax, extent.ymax),
                        new Point(extent.xmin, extent.ymax),
                        new Point(extent.xmin, extent.ymin)
                    ]
                ]), 0);
                models.forEach(function (item) {
                    item.render(self);
                });*/
                this.depthRangeFor3D = [0, 1 - ((1 + this.view.currentLayer) * this.view.numSublayers) * this.view.depthEpsilon];
                this.layer.modelGraphics.forEach(function (item) {
                    item.render(self);
                });
            }
        },
        colorModeForRenderPass: function () {
            return mode.ColorMode.alphaBlended;
        },
        depthModeForSublayer: function (n, mask, func) {
            // var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
            return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask,  this.view.depthRangeFor3D);
            // return new mode.DepthMode(this.view.context.gl.LEQUAL, mode.DepthMode.ReadWrite, this.view.depthRangeFor3D);
        },

        zoom: function () {
            this._render();
        }
    });
});