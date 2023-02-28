define("com/huayun/webgis/views/3d/layers/WaterTileLayerView3D", [
    "dojo/_base/declare",
    "./LayerView3D",
    "com/huayun/webgis/layers/support/Tile",
    "../../../utils/utils",
    "com/huayun/webgis/gl/draw/drawWater",
    "com/huayun/webgis/gl/mode",
    "com/huayun/webgis/data/ArrayType",
    "com/huayun/webgis/utils/Constant",
    "com/huayun/webgis/gl/members",
    "com/huayun/webgis/gl/SegmentVector"
], function (declare, LayerView3D, Tile, utils, drawWater, mode, ArrayType, Constant, members, SegmentVector) {
    return declare("com.huayun.webgis.views.3d.layers.WaterTileLayerView3D", [LayerView3D], {

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.visible = params.visible;

            this.id = params.id;
            this.layer = params.layer;
            this.view = params.view;
        },
        /**
         * 刷新
         */
        refresh: function () {
            this.view.threeRender();
        },
        _readyData: function () {
        },
        /**
         * 渲染
         */
        _render: function () {
            if (this.visible) {
                // this.view.currentLayer++;
                var level = this.view.viewpoint.level;
                var sourceCache$1 = this.view.ground.sourceCache;
                var coordsDescending = sourceCache$1.getVisibleCoordinates(false, this.transform).slice().reverse();
                this.renderPass = 'translucent';
                this.depthRangeFor3D = [0, 1 - ((1 + this.view.currentLayer) * this.view.numSublayers) * this.view.depthEpsilon];
                this.renderLayer(this, sourceCache$1, null, coordsDescending);
            }
        },
        /**
         * 渲染图层
         * @param painter
         * @param sourceCache
         * @param layer
         * @param coords
         * @param level
         */
        renderLayer: function (painter, sourceCache, layer, coords, level) {
            if (!coords.length) {
                return;
            }
            drawWater(painter, sourceCache, layer, coords);
        },
        /**
         * 可视化设置
         * @param visible
         */
        setVisible: function (visible) {
            this.visible = visible;
            if (visible) {
                this.refresh();
            } else {
                this.view.threeRender();
            }
        },
        /**
         * 缩放
         */
        zoom: function () {
            if (this.visible) {
                // this.view.currentLayer++;
                var sourceCache$1 = this.view.ground.sourceCache;
                var coordsDescending = sourceCache$1.updateTileMatrix(false, this.view.viewpoint).slice().reverse();
                this.renderPass = 'translucent';
                this.depthRangeFor3D = [0, 1 - ((1 + this.view.currentLayer) * this.view.numSublayers) * this.view.depthEpsilon];
                this.renderLayer(this, sourceCache$1, null, coordsDescending);
            }
        },
        depthModeForSublayer: function (n, mask, func) {
            /*var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
            return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);*/
            // return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, this.depthRangeFor3D);
            /*var depth = 1 - ((1 + this.view.currentLayer) * this.view.numSublayers + n) * this.view.depthEpsilon;
            return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, [depth, depth]);*/
            return new mode.DepthMode(func || this.view.context.gl.LEQUAL, mask, this.depthRangeFor3D);
        }
    });
});