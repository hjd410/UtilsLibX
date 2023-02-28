/**
 * @module com/huayun/webgis/layers
 * @see com.huayun.webgis.layers.BuildingLayer
 */
define("com/huayun/webgis/layers/BuildingLayer", [
    "dojo/_base/declare",
    "dojo/request",
    "./Layer",
    "../views/3d/layers/BuildingLayerView3D"
], function (declare, request, Layer, LayerView) {
    /**
     * @alias com.huayun.webgis.layers.BuildingLayer
     * @extends {Layer}
     * @property {string}  type  - 图层类型
     * @property {Array}  graphics  - 图形数组
     * @property {Array}  _features  - 图形特征数组
     * @property {string}  id  - 图层id
     * @property {number}  maxLevel  - 最大层级
     * @property {number}  minLevel  - 最小层级
     * @property {number}  opacity  - 图形透明度
     * @property {null}  symbol  - 字符
     * @property {null}  url  - 图形url
     */
    return declare("com.huayun.webgis.layers.BuildingLayer", [Layer], {
        type: "Feature",
        graphics: [],
        _features: [],
        id: "feature",
        maxLevel: 0,
        minLevel: 0,
        opacity: 1,
        symbol: null,
        url: null,

        constructor: function(params) {
            declare.safeMixin(this, params);
            this.layerViews = [];
            this.format = new format.MVT();
        },
        /**
         * 创建图层视图
         * @param view 
         * @param option 
         */
        createLayerView: function (view, option) {
            var layerView = new LayerView({
                opacity: this.opacity,
                visible: this.visible,
                view: view,
                id: this.id,
                layer: this
            });
            this.layerViews.push(layerView);
            view._scene.add(layerView._group);
            return layerView;
        },
        /**
         * 加载建筑物切片
         * @param level 
         * @param col 
         * @param row 
         */
        fetchTile: function (level, col, row) {
            var obj = this;
            return request(this.url + "/"+level +"/" + col + "/" + row + ".pbf", {handleAs: "arraybuffer"}).then(function (resp) {
                return obj.format.readFeatures(resp).hz_building;
            });
        },
        setVisible: function (visible) {
            this.visible = visible;
            this.layerViews.forEach(function (item) {
                item.setVisible(visible);
            });
        }
    });
});