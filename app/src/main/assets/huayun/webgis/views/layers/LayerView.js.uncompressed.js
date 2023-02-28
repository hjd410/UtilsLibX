/**
 * 图层渲染器
 * @see com.huayun.webgis.views.layers.LayerView
 */
define("com/huayun/webgis/views/layers/LayerView", [], function () {
    /**
     * 图层渲染器基类, 包含渲染图层的基本方法
     * * @constructor
     * @alias com.huayun.webgis.views.layers.LayerView
     * @param {Object} props 方法参数
     * @param {String} props.id 图层渲染器id
     * @param {Layer} props.layer 图层渲染器对应的图层
     * @param {View} props.view 图层渲染器所属的渲染容器
     */
    function LayerView(props) {
        this.id = props && props.id ? props.id : "layerView";
        this.layer = props.layer;
        this.view = props.view;
    }

    /**
     * 刷新图层渲染器
     */
    LayerView.prototype.refresh = function () {}

    return LayerView;
});