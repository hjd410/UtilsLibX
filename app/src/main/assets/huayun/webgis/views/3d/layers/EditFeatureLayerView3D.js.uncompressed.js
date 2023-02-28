define(
    "com/huayun/webgis/views/3d/layers/EditFeatureLayerView3D", [
        "dojo/_base/declare",
        "./LayerView3D"
    ], function (declare, LayerView3D) {
        // FeatureLayer渲染器构造函数
        function EditFeatureLayerView3D(params) {
            this.visible = params.visible;
            this.layer = params.layer;
            this.scale = 0;
            // this.renderer = params.renderer;
            this.graphicsLayerView = params.graphicsLayerView;
        }

        // 类继承
        if (LayerView3D) EditFeatureLayerView3D.__proto__ = LayerView3D;
        EditFeatureLayerView3D.prototype = Object.create(LayerView3D && LayerView3D.prototype);
        EditFeatureLayerView3D.prototype.constructor = EditFeatureLayerView3D;

        EditFeatureLayerView3D.prototype.refresh = function () {
            this.graphicsLayerView.view.threeRender();
        };

        EditFeatureLayerView3D.prototype._readyData = function () {
            console.log('_readyData');
            //
        };

        EditFeatureLayerView3D.prototype._render = function () {
            var view = this.graphicsLayerView.view;
            if (this.scale !== view.scale) {
                this.layer.zoomEnd(this.graphicsLayerView.view);
            }
            this.graphicsLayerView._render();
            if (this.scale !== view.scale) {
                this._updateGraphicsIndex();
                this.scale = view.scale;
            }
        };

        EditFeatureLayerView3D.prototype.zoom = function () {
            if (this.visible) {
                this.graphicsLayerView._render();
            }
        };

        EditFeatureLayerView3D.prototype._updateGraphicsIndex = function () {
            var items = [];
            var gs = this.layer.editGraphicsLayer.graphics;
            for (var i = 0, ii = gs.length; i < ii; i++) {
                var g = gs[i];
                if (g.symbol) {
                    this.graphicsLayerView.renderer.calculateExtent(this.graphicsLayerView.view, g, g.feature.geometry, g.symbol, items);
                }
            }
            this.graphicsLayerView.view.loadItem(items);
        };

        return EditFeatureLayerView3D;
    });
