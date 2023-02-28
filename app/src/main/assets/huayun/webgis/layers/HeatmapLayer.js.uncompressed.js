/**
 * 热力图图层
 * @see com.huayun.webgis.layers.HeatmapLayer
 */
define("com/huayun/webgis/layers/HeatmapLayer", [
    "dojo/_base/declare",
    "dojo/request",
    "./Layer",
    "custom/kdbush.min",
    "com/huayun/webgis/views/3d/layers/HeatmapLayerView3D"
], function (declare, request, Layer, KDBush, HeatmapLayerView3D) {
    /**
     * 热力图图层
     * @constructor
     * @alias com.huayun.webgis.layers.HeatmapLayer
     * @extends {Layer}
     * @param {Object} params 构造函数参数
     * @param {string}  params.id  - 图层id
     * @property {string}  type  - 图层类型
     * @property {string}  id  - 图层id
     * @example
     * var heatmap = new HeatmapLayer({
     *      id: "heatmap",
     *      visible: true,
     * });
     */
    return declare("com.huayun.webgis.layers.HeatmapLayer", [Layer], {
        url: null,
        name: "热力图",

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.layerViews = [];
            this.spatialReference = params.options.spatialReference;
            this.data = null;
            this.max = params.options.max;
            this.radius = params.options.radius;
            this.blur = params.options.blur;
            this.opacity = params.options.opacity;
            this.index = null;
            this.filter = params.filter;
            this.dataDirty = true;
            if (params.options.gradient) {
                var gradient = params.options.gradient;
                this.gradient = {};
                for (var i = 0; i <gradient.length; i = i + 2) {
                    this.gradient[gradient[i]] = gradient[i+1];
                }
            }
        },
        createLayerView: function (view, option) {
            var layerView = new HeatmapLayerView3D({
                width: view.width,
                height: view.height,
                opacity: this.opacity,
                visible: this.visible,
                radius: this.radius,
                blur: this.blur,
                view: view,
                id: this.id,
                layer: this,
                gradient: this.gradient
            });
            this.layerView = layerView;
            layerView.transform = view.viewpoint;
            return layerView;
        },
        setData: function (data) {
            this.data = data;
            this.dataDirty = true;
            this.index = new KDBush(data, function (p) {
                return p.point.x
            }, function (p) {
                return p.point.y
            });
            this.layerView.view.threeRender();
        },
        refresh: function () {
            this.layerView.view.threeRender();
        },
        setVisible: function (visible) {
            this.visible = visible;
            this.layerView.setVisible(visible);
        },
        setFilter:function(filter) {
            this.dataDirty = true;
            this.filter = filter;
        },
        setOpacity: function (opacity) {
            this.layerView.setVisible(opacity);
        },

        filterData: function(extent) {
            var res = this.index.range(extent.xmin, extent.ymin, extent.xmax, extent.ymax).map(function (id) {
                return this.data[id];
            }.bind(this));
            if (this.filter) {
                res = res.filter(this.filter);
            }
            return res;
        },

        queryFeaturesByGeometry: function (geometry, queryPadding) {
            var bounds = this.getBounds(geometry);
            var radius = queryPadding || this.options.queryRadius || this.radius;
            radius = radius * this.layerView.view.resolution;
            return this.filterData({
                xmin: bounds.xmin - radius,
                ymin: bounds.ymin - radius,
                xmax: bounds.xmax + radius,
                ymax: bounds.ymax + radius
            });
        },

        getBounds: function (geometry) {
            if (geometry.type === "point") {
                return {xmin: geometry.x, ymin: geometry.y, xmax: geometry.x, ymax: geometry.y};
            } else {
                return geometry.extent;
            }
        }
    })
});