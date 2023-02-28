define("com/huayun/webgis/layers/ArcParticleLayer", [
    "dojo/_base/declare",
    "./Layer",
    "../views/3d/layers/ArcParticleLayerView3D"
], function (declare, Layer, LayerView) {
    return declare("com.huayun.webgis.layers.ArcParticleLayer", [Layer], {

        constructor: function (params) {
            this.type = "arc";
            this.id = "arclayer";
            this.opacity = 1;
            this.symbol = params.symbol;
            this.setData(params.data||[]);
            declare.safeMixin(this, params);
        },

        createLayerView: function (view, option) {
            var layerView = new LayerView({
                opacity: this.opacity,
                visible: this.visible,
                view: view,
                id: this.id,
                layer: this
            });
            this.layerView = layerView;
            layerView.transform = view.viewpoint;

            /*var obj = this;
            setInterval(function () {
                // obj.symbol.uniforms.offset += 0.05;
                obj.symbol.uniforms.offset = (obj.symbol.uniforms.offset + 0.005) %1;
                view.threeRender();
            }, 100);*/

            return layerView;
        },

        setData: function(data) {
            for (var i = 0, ii = data.length; i < ii; i++) {
                var item = data[i];
                var source = item.source,
                  target = item.target;
                item.deltaPos = [];
                for (var j = 0; j < source.length; j++) {
                    item.deltaPos[j] = target[j] - source[j];
                }
            }
        },

        setVisible: function (visible) {

        },

        refresh: function () {
            this.layerView.view.threeRender();
        }
    });
});