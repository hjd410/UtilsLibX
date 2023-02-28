/**
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.GraphicSceneLayer
 */
define("com/huayun/webgis/layers/3d/GraphicSceneLayer", [
    "dojo/_base/declare",
    "./SceneLayer",
    "../../Feature",
    "../../Graphic",
    "../../geometry/MapPoint"
], function (declare, SceneLayer) {
    /**
     * @alias com.huayun.webgis.layers.3d.GraphicSceneLayer
     * @extends {SceneLayer}
     * @property {Array}  _symbol  -  符号
     * @property {Array}  graphicArray  - 图形数组
     * @property {Array}  group  - 容纳3d模型, 将添加到3d的Scene中
     * @property {string}  id  - 图形id 
     * @property {string}  map  - 地图
     */
    return declare("com.huayun.webgis.layers.3d.GraphicSceneLayer", [SceneLayer], {
        _symbol: null,
        graphicArray: [],
        group: null,
        name: "Graphic图层",
        id: "Graphic",
        map: null,

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.group = new THREE.Group();
            this.graphicArray = [];
        },

        /**
         * 添加graphic到本图层中
         * @param graphic
         */
        addGraphic: function (graphic) {
            graphic.graphicLayer = this;
            graphic.draw();
        },

        /**
         * 删除本图层中的graphic
         * @param graphic
         */
        removeGraphic: function (graphic) {
            if (graphic && graphic.graphicLayer === this) {
                var mesh = graphic.mesh;
                if (mesh) {
                    mesh.geometry.dispose();
                    this.group.remove(mesh);
                }
            }
        },

        /**
         * 清空本图层
         */
        clear: function () {
            var children = this.group.children,
                item;
            for (var i = children.length - 1; i > -1; i--) {
                item = children[i];
                item.geometry.dispose();
                this.group.remove(item);
            }
            this.map.layerContainer.threeRender();
        },
        getGraphicArray: function () {
            return this.group.children;
        },
        setGraphicArray: function (graphics) {
            for (var i = 0; i < graphics.length - 1; i++) {
                this.addGraphic(graphics[i]);
            }
        },

        /*updateLayer: function() {
            this.draw();
        },

        draw: function() {

        },*/

        /**
         * 刷新图层
         */
        refresh: function () {
            this.readyData();
            this.startRender();
        },
        /**
         * 准备数据, 由子类实现
         */
        readyData: function () {
            if (this.visible) {
                this.fetchData();
            }
        },
        fetchData: function () {
        },

        /**
         * 开始渲染, 由子类实现
         */
        startRender: function () {
            if (this.group.visible) {
                this.render();
            }
        },
        render: function () {
            this.map.layerContainer.threeRender();
        },
        /**
         * 平移
         * @param xmove
         * @param ymove
         */
        pan: function (xmove, ymove) {
            this.group.position.x += xmove;
            this.group.position.y -= ymove;
        },

        /**
         * 设置可见性
         * @param visible
         */
        setVisible: function (visible) {
            this.visible = visible;
            this.group.visible = visible;
            if (this.visible) {
                this.refresh();
            }else {
                this.map.layerContainer.threeRender();
            }
        }
    })
});