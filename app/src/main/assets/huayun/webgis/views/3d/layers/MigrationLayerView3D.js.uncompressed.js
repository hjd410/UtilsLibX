define("com/huayun/webgis/views/3d/layers/MigrationLayerView3D", [
    "./LayerView3D",
    "../GraphicsView",
    "com/huayun/webgis/gl/mode"
], function (LayerView3D, GraphicsView, mode) {
    var MigrationLayerView3D = function (params) {
        LayerView3D.call(this, params);
        this.view = params.view;
        this.visible = params.visible;
        this.layer = params.layer;
    };
    if (LayerView3D) MigrationLayerView3D.__proto__ = LayerView3D;
    MigrationLayerView3D.prototype = Object.create(LayerView3D && LayerView3D.prototype);
    MigrationLayerView3D.prototype.constructor = MigrationLayerView3D;


    MigrationLayerView3D.prototype.setVisible = function (visible) {
        this.visible = visible;
        this.view.threeRender();
    };

    MigrationLayerView3D.prototype.refresh = function () {
        this._readyData();
        this.view.threeRender();
    };
    MigrationLayerView3D.prototype._readyData = function () {
    };

    MigrationLayerView3D.prototype._render = function () {
        if (this.visible) {
            this.view.currentLayer++;
            var graphics = this.layer.graphics;
            var graphic, symbol;
            for (var i = 0; i < graphics.length; i++) {
                graphic = graphics[i];
                if (graphic.visible) {
                    symbol = graphic.symbol;
                    graphic.renderer.draw[symbol.type](this, graphic);
                }
            }
            graphics = this.layer.iconGraphics;
            for (i = 0; i < graphics.length; i++) {
                graphic = graphics[i];
                if (graphic.visible) {
                    symbol = graphic.symbol;
                    graphic.renderer.draw[symbol.type](this, graphic);
                }
            }
        }
    };

    MigrationLayerView3D.prototype.addGraphic = function (graphic) {
        var type = graphic.symbol.type;
        if (!graphic.renderer) {
            graphic.renderer = GraphicsView;
        }
        graphic.renderer.add[type](graphic, this.view, this.layer);
    };

    MigrationLayerView3D.prototype.zoom = function () {
        if (this.visible) {
            this._render();
        }
    };
    MigrationLayerView3D.prototype.depthModeForSublayer = function (n, mask, func) {
        var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
        return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);
        // return new mode.DepthMode(this.view.context.gl.LEQUAL, mode.DepthMode.ReadWrite, this.view.depthRangeFor3D);
    };
    return MigrationLayerView3D;
});