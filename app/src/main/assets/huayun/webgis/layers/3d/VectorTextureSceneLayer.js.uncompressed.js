/**
 *  Created by WebStorm
 *  @Author: overfly
 *  @Date:  2019/4/11
 *  @Description: 3d纹理贴图前端成图基类
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.VectorTextureSceneLayer
 */
define("com/huayun/webgis/layers/3d/VectorTextureSceneLayer", [
    "dojo/_base/declare",
    "dojo/request",
    "./TextureSceneLayer"
],function (declare, request, TextureSceneLayer) {
    /**
     * @alias com.huayun.webgis.layers.3d.VectorTextureSceneLayer
     * @extends {TextureSceneLayer}
     */
    return declare("com.huayun.webgis.layers.3d.VectorTextureSceneLayer",[TextureSceneLayer],{
        constructor: function (params) {
            declare.safeMixin(this, params);
            var width = this.map.width,
                height = this.map.height;
            this.canvas = document.createElement("canvas");
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx = this.canvas.getContext("2d");
            this.ctx.imageSmoothingEnabled = false;

            this.group = new THREE.Group();
            var geometry = new THREE.PlaneBufferGeometry(width, height);
            this.texture = new THREE.CanvasTexture(this.canvas);
            this.texture.generateMipmaps = false;
            this.texture.magFilter = THREE.NearestFilter;
            this.texture.minFilter = THREE.NearestFilter;
            if (this.map.is3D) {
                this.texture.anisotropy = 16;
            }else {
                this.texture.anisotropy = 1;
            }
            var material = new THREE.MeshBasicMaterial({map: this.texture, transparent: true});
            this.plane = new THREE.Mesh(geometry, material);
            this.plane.position.set(0,0,0.5);
            this.group.add(this.plane);
            this.group.visible = this.visible;
        },
        /**
         * 获取数据
         */
        fetchData: function () {
        },
        /**
         * 渲染
         */
        render: function () {

        }
    })
});