/**
 *  Created by WebStorm
 *  @Author: overfly
 *  @Date:  2019/4/11
 *  @Description: 3d纹理贴图后端成图基类
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.DynamicTextureSceneLayer
 */
define("com/huayun/webgis/layers/3d/DynamicTextureSceneLayer", [
    "dojo/_base/declare",
    "../../request",
    "./TextureSceneLayer"
],function (declare, request, TextureSceneLayer) {
    /**
     * @alias com.huayun.webgis.layers.3d.DynamicTextureSceneLayer
     * @extends {TextureSceneLayer}
     * @property {null}  texture  -  纹理
     * @property {null}  group  - 代表图层
     */
    return declare("com.huayun.webgis.layers.3d.DynamicTextureSceneLayer",[TextureSceneLayer],{
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
            var material = new THREE.MeshBasicMaterial({map: this.texture, transparent: true, opacity: this.opacity});
            this.plane = new THREE.Mesh(geometry, material);
            this.plane.renderOrder = 2;
            this.group.renderOrder = 2;
            this.group.add(this.plane);
            this.group.visible = this.visible;
        },
        /**
         * 调整尺寸
         */
        resize: function() {
            this.plane.geometry.dispose();
            this.plane.material.dispose();
            this.texture.dispose();
            this.group.remove(this.plane);

            var width = this.map.width,
                height = this.map.height;
            this.canvas = document.createElement("canvas");
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx = this.canvas.getContext("2d");
            this.ctx.imageSmoothingEnabled = false;
            var geometry = new THREE.PlaneBufferGeometry(width, height);
            this.texture = new THREE.CanvasTexture(this.canvas);
            this.texture.magFilter = THREE.NearestFilter;
            this.texture.minFilter = THREE.NearestFilter;
            var material = new THREE.MeshBasicMaterial({map: this.texture, transparent: true});
            this.plane = new THREE.Mesh(geometry, material);
            this.plane.position.set(0, 0, 0.01);
            this.plane.renderOrder = 2;
            this.group.add(this.plane);
            this.refresh();
        },
        /**
         * 获取数据
         */
        fetchData: function () {
            if (this.map.extent) {
                var url = this.fetchUrl(this);
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
         * 获取url
         * @return {string}  
         */
        fetchUrl: function () {
            return this.url;
        },
        /**
         * 渲染
         */
        render: function () {
            var obj = this;
            var width = this.map.width,
                height = this.map.height;
            var halfW = (this.map.width - this.map.realWidth)/2,
                halfH = (this.map.height - this.map.realHeight)/2;
            var theta = this.map.rotationAngela,
                cos = Math.abs(Math.cos(theta/180*Math.PI)),
                sin = Math.abs(Math.sin(theta/180*Math.PI));
            var offsetw = Math.round(halfW*cos + halfH * sin),
                offseth = Math.round(halfW*sin + halfH * cos);
            this.ctx.clearRect(0, 0, this.map.width, this.map.height);
            this.texture.needsUpdate = true;
            this.map.layerContainer.threeRender();
            if (this.loadPromise) {
                this.loadPromise.then(function (image) {
                    if (image.data) {
                        var scaleCount = Math.pow(2, obj.map.initLevel - obj.map.level);
                        obj.group.scale.set(scaleCount, scaleCount, 1);
                        obj.ctx.save();
                        var angle = obj.map.rotationAngela,
                            deltaAngela = obj.deltaAngela;
                        var theta = Math.PI*angle/180,
                            deltaTheta = Math.PI*deltaAngela/180,
                            sina = Math.abs(Math.sin(theta)),
                            cosa = Math.abs(Math.cos(theta)),
                            px = width/2,
                            py = height/2;
                        obj.group.rotateZ(deltaTheta);
                        obj.deltaAngela = 0;
                        obj.ctx.translate(px, py);
                        obj.ctx.rotate(theta);
                        var tx = - px*cosa - py*sina,
                            ty = - py*cosa - px*sina;
                        obj.ctx.translate(tx, ty);
                        obj.ctx.drawImage(image.data, offsetw, offseth);
                        obj.texture.needsUpdate = true;
                        obj.ctx.restore();
                        obj.group.position.x = 0;
                        obj.group.position.y = 0;
                        obj.movex = 0;
                        obj.movey = 0;
                        obj.map.layerContainer.threeRender();
                    }
                });
            }
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