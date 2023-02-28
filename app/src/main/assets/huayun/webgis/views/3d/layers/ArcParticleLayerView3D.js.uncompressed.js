define("com/huayun/webgis/views/3d/layers/ArcParticleLayerView3D", [
    "dojo/_base/declare",
    "./LayerView3D",
    "com/huayun/webgis/gl/mode",
    "com/huayun/webgis/gl/SegmentVector",
    "com/huayun/webgis/gl/draw/drawParticle",
    "com/huayun/webgis/data/ArrayType"
], function (declare, LayerView3D, mode, SegmentVector, drawParticle, ArrayType) {
    return declare("com.huayun.webgis.views.3d.layers.ArcParticleLayerView3D", [LayerView3D], {

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.visible = params.visible;
            this.layer = params.layer;
            this.view = params.view;
            this.id = params.id;
            var NUM_SEGMENTS = 20;
            var rasterBoundsArray = new ArrayType.StructArrayLayout1f4();
            for (var i = 0; i < NUM_SEGMENTS; i++) {
                rasterBoundsArray.emplaceBack(i / NUM_SEGMENTS);
            }
            this.layoutVertexArray = this.view.context.createVertexBuffer(rasterBoundsArray, [
                {name: "a_ratio", type: "Float32", components: 1, offset: 0}
            ]);
            this.rasterBoundsSegments = SegmentVector.simpleSegment(0, 0, NUM_SEGMENTS, 1);
        },

        setData: function (data) {
            /*var NUM_SEGMENTS = 500;
            var rasterBoundsArray = new ArrayType.StructArrayLayout1f4();
            for (var i = 0; i < NUM_SEGMENTS; i++) {
                rasterBoundsArray.emplaceBack(i, -1, 0);
                rasterBoundsArray.emplaceBack(i, 1, 0);
            }
            this.layoutVertexArray = this.view.context.createVertexBuffer(rasterBoundsArray, [
                {name: "a_pos", type: "Float32", components: 3, offset: 0}
            ]);
            this.rasterBoundsSegments = SegmentVector.simpleSegment(0, 0, 100, 2);*/
        },

        _readyData: function () {
        },
        _render: function () {
            this.view.currentLayer++;
            var data = this.layer.data;
            for (var i = 0, ii = data.length; i < ii; i++) {
                var item = data[i];
                drawParticle(this, item.source, item.target, item.deltaPos);
            }
        },

        refresh: function () {
            this._readyData();
            this.view.threeRender();
        },


        zoom: function () {
            if (this.visible) {
                this._render();
            }
        },
        depthModeForSublayer: function (n, mask, func) {
            // return new mode.DepthMode(this.view.context.gl.LEQUAL, mode.DepthMode.ReadWrite, this.view.depthRangeFor3D);
            var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
            return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);
        }

    });
});