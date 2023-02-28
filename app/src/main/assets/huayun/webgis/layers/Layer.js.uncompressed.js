/**
 * 图层基类
 * @see com.huayun.webgis.layers.Layer
 */
define("com/huayun/webgis/layers/Layer", [], function () {
    /**
     * 图层基类
     * @constructor
     * @alias com.huayun.webgis.layers.Layer
     * @param {Object} params
     * @property {string} id  - 图层id
     * @property {number} opacity  - 透明度
     * @property {boolean} selectEnabled  - 选择开启
     * @property {boolean} controlEnabled  - 控制开启
     * @property {boolean} visible  - 可视化
     */
    function Layer(params) {
        params = params === undefined ? {}: params;
        this.id = params.id || "layer";
        this.opacity = params.opacity === undefined ? 1 : params.opacity;
        this.visible = params.visible === undefined ? true : params.visible;
        this.selectEnabled = params.selectEnabled === undefined ? true : params.selectEnabled;
        this.controlEnabled = params.controlEnabled === undefined ? true : params.controlEnabled;
    }

    Layer.prototype.createLayerView = function (view, option) {
        throw new Error("不能调用基类的createLayerView方法");
    };

    Layer.prototype.refresh = function () {

    };
    Layer.prototype.setVisible = function () {

    }

    return Layer;
});