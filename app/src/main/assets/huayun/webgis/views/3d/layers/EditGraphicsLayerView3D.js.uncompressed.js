define("com/huayun/webgis/views/3d/layers/EditGraphicsLayerView3D", [
    "dojo/_base/declare",
    "./LayerView3D"
], function (declare, LayerView3D) {
    // FeatureLayer渲染器构造函数
    function EditGraphicsLayerView3D(params) {
        this.visible = params.visible;
        this.layer = params.layer;
        this.scale = 0;
        // this.renderer = params.renderer;
        this.graphicsLayerView = params.graphicsLayerView;
    }

    // 类继承
    if (LayerView3D) EditGraphicsLayerView3D.__proto__ = LayerView3D;
    EditGraphicsLayerView3D.prototype = Object.create(LayerView3D && LayerView3D.prototype);
    EditGraphicsLayerView3D.prototype.constructor = EditGraphicsLayerView3D;

    EditGraphicsLayerView3D.prototype.refresh = function () {
        this.graphicsLayerView.view.threeRender();
    };

    /**
     * 对需要多次请求数据的图层。
     * @private
     */
    EditGraphicsLayerView3D.prototype._readyData = function () {
        // console.log('_readyData');
        //
    };

    EditGraphicsLayerView3D.prototype._render = function () {
        var view = this.graphicsLayerView.view;
        if (this.scale !== view.scale) {
            this.scale = view.scale;
            this.layer.zoomEnd(this.graphicsLayerView.view);
        }
        this.graphicsLayerView._render();
    };

    EditGraphicsLayerView3D.prototype.zoom = function () {
        if (this.visible) {
            this.graphicsLayerView._render();
        }
    };

    return EditGraphicsLayerView3D;
});
