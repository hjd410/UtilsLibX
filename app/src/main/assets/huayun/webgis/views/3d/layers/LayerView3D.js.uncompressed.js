define("com/huayun/webgis/views/3d/layers/LayerView3D", [
    "../../layers/LayerView",
    "../../../utils/extendClazz"
], function (LayerView, extendClazz) {
    /**
     * @ignore
     * @param params
     * @constructor
     */
    function LayerView3D(params) {
        LayerView.call(this, params);
    }
    extendClazz(LayerView3D, LayerView);

    LayerView3D.prototype.resize = function () {

    }

    return LayerView3D;
});