define("com/huayun/webgis/symbols/CanvasSymbol", [
    "dojo/topic",
    "custom/gl-matrix-min",
    "./BaseSymbol",
    "../utils/image"
], function (topic, glMatrix, BaseSymbol, image) {
    var CanvasSymbol = function (params) {
        BaseSymbol.call(this, params);
        this.type = "canvas";
        var opacity = params.opacity || 1;
        var size = params.size || 1;
        var isRotate = params.isRotate === undefined ? false : params.isRotate;
        var rotateRadian = params.rotateRadian === undefined ? 0 : params.rotateRadian;

        var matrix = glMatrix.mat4.create();

        this.loaded = false;
        this.offset = params.offset === undefined ? [0, 0] : params.offset;
        this.uniforms = {
            "u_size": size,
            "u_pitch_with_map": 0,
            "u_opacity": opacity,
            "u_texture": 0,
            "u_rotate_symbol": isRotate,
            "u_radian": rotateRadian,
            "u_modelMatrix": matrix
        };
        this.width = params.width;
        this.height = params.height;
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        this.ctx = canvas.getContext("2d");
        this.uniforms.u_texsize = [this.width, this.height];
        this.render = params.render;

        this.image = new image.RGBAImage({
            width: this.width,
            height: this.height
        }, new Uint8Array(this.width * this.height * 4));
        /*request(params.url, {responseType: "image"}).then(function (image) {
            image = image.data;
            this.loaded = true;
            this.image = image;
            this.width = image.width;
            this.height = image.height;

        }.bind(this));*/
    };
    if (BaseSymbol) CanvasSymbol.__proto__ = BaseSymbol;
    CanvasSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
    CanvasSymbol.prototype.constructor = CanvasSymbol;

    return CanvasSymbol;
});