/**
 * View基类
 * @see com.huayun.webgis.views.View
 */
define("com/huayun/webgis/views/View", [], function () {
    /**
     * View基类
     * @constructor
     * @alias com.huayun.webgis.views.View
     * @param {Object} params 参数
     * @param {String} params.id view的id
     * @param {HTMLDivElement} params.container view挂载的节点
     * @param {Map} params.map view关联的地图
     * @param {Extent} params.extent view当前的地图范围
     * @property {String} id view的id
     * @property {Map} map 地图对象
     * @property {HTMLDivElement} container view挂载的节点
     * @property {EXTENT} extent 地图的当前范围
     * @property {Array} allLayerViews - 地图所有图层对应的LayerView
     */
    var View = function (params) {
        this.id = params.id?params.id:"sceneView";
        this.container = params.container;
        this.map = params.map;
        this.extent = params.extent;
        this.allLayerViews = [];
    };

    /**
     * 刷新地图
     */
    View.prototype.refresh = function () {
        throw new Error("无法调用基类View的refresh")
    };
    return View;
});