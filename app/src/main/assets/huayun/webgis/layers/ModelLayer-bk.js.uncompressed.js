define("com/huayun/webgis/layers/ModelLayer-bk", [
    "dojo/_base/declare",
    "./Layer",
    "../views/3d/layers/ModelLayerView3D"
], function(declare, Layer, ModelLayerView3D) {
    return declare("com.huayun.webgis.layers.ModelLayer", [Layer], {
        constructor: function(params) {
            declare.safeMixin(this, params);
            this.layerView = null;
            this.models = [];
            this.loader = params.loader||new THREE.GLTFLoader();
            this.lights = params.lights||[];

            this.rotate = 0; // todo 待删除
        },

        createLayerView: function(view, option) {
            var layerView = new ModelLayerView3D({
                width: view.width,
                height: view.height,
                opacity: this.opacity,
                visible: this.visible,
                view: view,
                id: this.id,
                layer: this,
                lights: this.lights
            });
            layerView.transform = view.viewpoint;
            this.layerView = layerView;
            this.models.forEach(function (item) {
                item.loaded = false;
                this.layerView.addModel(item);
            }.bind(this));
            return layerView;
        },

        addModel: function (model, callback) {
            model.loaded = false;
            this.models.push(model);
            if (this.layerView) {
                this.layerView.addModel(model, callback);
            }
        },
        removeModel: function (model) {

        }
    });
});