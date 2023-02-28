define("com/huayun/webgis/views/3d/layers/LabelLayerView3D", [
    "./LayerView3D"
], function (LayerView3D) {
    function LabelLayerView3D(params) {
        this.visible = params.visible;
        this.layer = params.layer;
        this.graphicsLayerView = params.graphicsLayerView;
        this.view = params.view;
    }

    // 类继承
    if (LayerView3D) LabelLayerView3D.__proto__ = LayerView3D;
    LabelLayerView3D.prototype = Object.create(LayerView3D && LayerView3D.prototype);
    LabelLayerView3D.prototype.constructor = LabelLayerView3D;

    LabelLayerView3D.prototype.refresh = function () {
        this._readyData();
        this.view.threeRender();
    };

    LabelLayerView3D.prototype._readyData = function () {
        if (!this.layer.graphics) {
            this.layer.handleGraphics();
        }
    };

    LabelLayerView3D.prototype._render = function () {
        var view = this.graphicsLayerView.view;
        if (this.scale !== view.scale || this.layer.graphics.length === 0) {
            this.scale = view.scale;
            this.layer.zoomEnd(view);
            this.layer.revisePosition(view);
            this.layer.filterGraphics();
        }
        this.graphicsLayerView._render();
    };

    LabelLayerView3D.prototype.zoom = function () {
        if (this.visible) {
            this.graphicsLayerView._render();
        }
    };

    LabelLayerView3D.prototype.setVisible = function (visible) {
        this.visible = visible;
        this.graphicsLayerView.setVisible(visible);
    };

    LabelLayerView3D.prototype.getGraphicSizeWithPoint = function (point) {
    };

    return LabelLayerView3D;
})
