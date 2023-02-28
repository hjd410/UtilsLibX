define("com/huayun/webgis/layers/ModelLayer", [
    "dojo/_base/declare",
    "./Layer",
    "../views/3d/layers/ModelLayerView3D",
    "../Model"
], function (declare, Layer, ModelLayerView3D, Model) {
    return declare("com.huayun.webgis.layers.ModelLayer", [Layer], {
        constructor: function (params) {
            declare.safeMixin(this, params);
            this.layerView = null;
            this.modelGraphics = [];
            this.minLevel = params.minLevel;
            this.model = new Model({
                url: params.model
            });
        },

        createLayerView: function (view, option) {
            var layerView = new ModelLayerView3D({
                width: view.width,
                height: view.height,
                opacity: this.opacity,
                visible: this.visible,
                view: view,
                id: this.id,
                layer: this
            });
            layerView.transform = view.viewpoint;
            this.layerView = layerView;
            this.model.load(view, function () {
                view.threeRender();
            });
            return layerView;
        },

        addModel: function (model) {
            /*this.models.push(model);
            if (this.layerView) {
                this.layerView.addModel(model, callback);
            }
            this.indexNeedUpdate = true;*/
            this.modelGraphics.push(model);
        },
        removeModel: function (model) {

        },
        /*queryModelsByGeometry: function (geometry, queryPadding) {
            if (this.indexNeedUpdate) {
                this.modelIndex.clear();
                this.models.forEach(function (item) {
                    if (item.selectEnabled) {
                        var geometry;
                        switch (item.position.type) {
                            case "point":
                                geometry = [[item.position]];
                                break;
                            default:
                                geometry = [[]];
                        }
                        this.modelIndex.insert(geometry, item.id);
                    }
                }.bind(this));
                this.indexNeedUpdate = false;
            }
            queryPadding = queryPadding || this.queryPadding;
            switch (geometry.type) {
                case "point":
                    geometry = [geometry];
                    break;
                case "polygon":
                    geometry = geometry.path[0];
            }
            return this.modelIndex.roughQuery(geometry, queryPadding, this.models, this.layerView.view.resolution, this.layerView.view.viewpoint);
        }*/
    });
});