/**
 *  Created by WebStorm
 *  @Author: overfly
 *  @Date:  2019/4/11
 *  @Description: 3d纹理贴图基类
 * @module com/huayun/webgis/layers
 * @see com.huayun.webgis.layers.3d.TextureSceneLayer
 */
define("com/huayun/webgis/layers/3d/TextureSceneLayer", [
    "dojo/_base/declare",
    "./SceneLayer"
],function (declare, SceneLayer) {
    /**
     * @alias com.huayun.webgis.layers.3d.TextureSceneLayer
     * @extends {SceneLayer}
     * @property {null}  texture  - 纹理 
     * @property {number}  movex  - 横坐标平移 
     * @property {number}  movey  - 纵坐标平移 
     * @property {string}  url  - 地址 
     */
    return declare("com.huayun.webgis.layers.3d.TextureSceneLayer",[SceneLayer],{
        texture: null,
        canvas: null,
        ctx: null,
        movex: 0,
        movey: 0,
        url: null,
        loadPromise: null,
        plane: null,
        /**
         * 移动
         * @param xmove  横坐标平移
         * @param ymove  纵坐标平移
         * @param needsRefresh  是否需要刷新
         */
        pan: function (xmove, ymove, needsRefresh) {
            this.group.position.x += xmove;
            this.group.position.y -= ymove;
            this.movex += xmove;
            this.movey += ymove;
            if (needsRefresh) {
                this.refresh();
            }
        },
        /**
         * 刷新
         */
        refresh: function () {
            this.readyData();
            this.startRender();
        },
        /**
         * 准备数据
         */
        readyData: function () {
            if (this.visible) {
                this.fetchData();
            }
        },
        /**
         * 开始渲染
         */
        startRender: function () {
            if (this.visible) {
                this.render();
            }
        },
        /**
         * 是否可视化
         * @param visible 
         */
        setVisible: function (visible) {
            this.visible = visible;
            this.group.visible = visible;
            if (visible) {
                this.refresh();
            }else {
                this.map.layerContainer.threeRender();
            }
        }
    })
});