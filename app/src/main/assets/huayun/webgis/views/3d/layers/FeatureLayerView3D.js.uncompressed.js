define("com/huayun/webgis/views/3d/layers/FeatureLayerView3D", [
    "dojo/_base/declare",
    "./LayerView3D"
], function (declare, LayerView3D) {
    // FeatureLayer渲染器构造函数
    function FeatureLayerView3D(params) {
        this.visible = params.visible;
        this.layer = params.layer;
        this.scale = 0;
        // this.renderer = params.renderer;
        this.graphicsLayerView = params.graphicsLayerView;
    }

    // 类继承
    if (LayerView3D) FeatureLayerView3D.__proto__ = LayerView3D;
    FeatureLayerView3D.prototype = Object.create(LayerView3D && LayerView3D.prototype);
    FeatureLayerView3D.prototype.constructor = FeatureLayerView3D;

    FeatureLayerView3D.prototype.refresh = function () {
        this.graphicsLayerView.view.threeRender();
    };

    FeatureLayerView3D.prototype._readyData = function () {
        // console.log('_readyData');
        //
    };

    FeatureLayerView3D.prototype._render = function () {
        // debugger;
        if (this.visible) {
            var view = this.graphicsLayerView.view;
            if (this.scale !== view.scale) {
                this.layer.zoomEnd(this.graphicsLayerView.view);
            }
            this.graphicsLayerView._render();
            if (this.scale !== view.scale) {
                this._updateGraphicsIndex();
                this.scale = view.scale;
            }
        }
    };

    FeatureLayerView3D.prototype.zoom = function () {
        if (this.visible) {
            this.graphicsLayerView._render();
        }
    };

    FeatureLayerView3D.prototype._updateGraphicsIndex = function () {
        /*var items = [];
        var self = this;
        this.layer.graphicsLayer.graphics.forEach(function (graphic) {
            var symbol = graphic.symbol;
            if (symbol) {
                switch (symbol.type) {
                    case "compositeMark":
                        items.push(self._handleMark(graphic));
                        break;
                }
            }
        });
        this.graphicsLayerView.view.loadItem(items);*/
        var items = [];
        var gs = this.layer.graphicsLayer.graphics;
        for (var i = 0, ii = gs.length; i < ii; i++) {
            var g = gs[i];
            if (g.symbol) {
                this.graphicsLayerView.renderer.calculateExtent(this.graphicsLayerView.view, g, g.feature.geometry, g.symbol, items);
            }
        }
        this.graphicsLayerView.view.loadItem(items);
    };

    /*FeatureLayerView3D.prototype._handleMark = function (graphic) {
        var resolution = this.graphicsLayerView.view.resolution;
        var x = graphic.center.x,
            y = graphic.center.y,
            hw = graphic.width / 2,
            hh = graphic.height / 2;
        return {
            id: graphic.id,
            minX: x - hw * resolution,
            minY: y - hh * resolution,
            maxX: x + hw * resolution,
            maxY: y + hh * resolution,
            g: graphic
        }
    }*/

    return FeatureLayerView3D;
});
