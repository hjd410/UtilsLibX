/**
 *  Created by WebStorm
 *  @Author: overfly
 *  @Date:  2019/4/11
 *  @Description: msc成图
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.MSCTextureSceneLayer
 */
define("com/huayun/webgis/layers/3d/MSCTextureSceneLayer", [
    "dojo/_base/declare",
    "../../request",
    "./DynamicTextureSceneLayer"
],function (declare, request, DynamicTextureSceneLayer) {
    /**
     * @alias com.huayun.webgis.layers.3d.MSCTextureSceneLayer
     * @extends {DynamicTextureSceneLayer}
     */
    return declare("com.huayun.webgis.layers.3d.MSCTextureSceneLayer",[DynamicTextureSceneLayer],{
        /**
         * 获取数据
         */
        fetchData: function () {
            var extent = this.map.extent,
                resolution = this.map.resolution;
            if (extent) {
                var width = Math.round(extent.getWidth()/resolution), //this.map.width,
                    height = Math.round(extent.getHeight()/resolution); //this.map.height,
                var url = this.fetchUrl(this);
                console.log(url);
                if (this.loadPromise && !this.loadPromise.isResolved()) {
                    this.loadPromise.cancel();
                }
                this.loadPromise = request(url, {
                    responseType: "image",
                    allowImageDataAccess: false
                });
            } else {
                this.loadPromise = null;
            }
        },
        /**
         * 获取Url
         * @type {string}
         */
        fetchUrl: function () {
            return this.url;
        },
        /**
         * 设置透明度
         * @param value 
         */
        setOpacity: function (value) {
            this.opacity = value;
            this.plane.material.opacity = value;
            this.map.layerContainer.threeRender();
        }
    })
});