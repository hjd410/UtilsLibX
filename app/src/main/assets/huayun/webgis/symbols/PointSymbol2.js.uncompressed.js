/**
 * @ module: LineSymbol
 * @ Author: overfly
 * @ Date: 2019/5/16
 * @ Description: 线Symbol
 */
define(
    "com/huayun/webgis/symbols/PointSymbol2", [
        "dojo/_base/declare",
        "./BaseSymbol"
    ], function (declare, BaseSymbol) {
        return declare("com.huayun.webgis.symbols.PointSymbol", [BaseSymbol], {

            constructor: function (params) {
                declare.safeMixin(this, params);
                this.color = params.color;
                this.type = "point";
                this.outline = params.outline;
                this.canvas = document.createElement("canvas");
                this.radius = params.radius;
                var w = this.outline?this.outline.width: 0;
                this.canvas.width = (this.radius+w)*2;
                this.canvas.height = (this.radius+w)*2;
                this.ctx = this.canvas.getContext("2d");
                this.size = this.radius + w;
                if (this.outline) {
                    this.ctx.strokeStyle = this.outline.color;
                    this.ctx.lineWidth = this.outline.width;
                    this.ctx.fillStyle = this.color;
                    this.ctx.beginPath();
                    this.ctx.arc(this.size, this.size, this.radius, 0, 2 * Math.PI);
                    this.ctx.fill();
                    this.ctx.stroke();
                } else {
                    this.ctx.globalAlpha = this.opacity;
                    this.ctx.fillStyle = this.color;
                    this.ctx.beginPath();
                    this.ctx.arc(this.size, this.size, this.radius, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
                var spriteMap = new THREE.CanvasTexture(this.canvas);
                spriteMap.magFilter = THREE.NearestFilter;
                spriteMap.minFilter = THREE.NearestFilter;
                this.material = new THREE.SpriteMaterial({
                    map: spriteMap,
                    sizeAttenuation: false,
                    depthTest:false
                });
            }
        });
    }
);