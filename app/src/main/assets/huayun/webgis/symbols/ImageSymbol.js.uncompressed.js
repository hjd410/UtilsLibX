define("com/huayun/webgis/symbols/ImageSymbol", [
  "dojo/topic",
  "custom/gl-matrix-min",
  "./BaseSymbol"
], function (topic, glMatrix, BaseSymbol) {
  var ImageSymbol = function (params) {
    BaseSymbol.call(this, params);
    this.type = "image";
    var opacity = params.opacity || 1;
    var size = params.size || 1;
    var isRotate = params.isRotate === undefined?false:params.isRotate;
    var rotateRadian = params.rotateRadian === undefined?0:params.rotateRadian;
    this.loaded = false;
    this.used = false;
    this.width = params.width;
    this.height = params.height;
    this.angle = params.angle || 0;
    this.dx = params.dx || 0;
    this.dy = params.dy || 0;

    this.offset = params.offset === undefined ? [0, 0] : params.offset;

    var matrix = glMatrix.mat4.create();
    // glMatrix.mat4.rotateX(matrix, matrix, 45/180*Math.PI);

    this.uniforms = {
      "u_size": size,
      "u_pitch_with_map": 0,
      "u_opacity": opacity,
      "u_texture": 0,
      "u_rotate_symbol": isRotate,
      "u_radian": rotateRadian,
      "u_modelMatrix": matrix
    };

    var image = new Image();
    image.setAttribute("crossorigin", 'anonymous');
    image.onload = function (e) {
      this.loaded = true;
      this.image = image;
      this.uniforms.u_texsize = [this.width, this.height];
      if (this.used) {
        topic.publish("threeRender");
      }
    }.bind(this);
    image.src = params.url;
  };
  if (BaseSymbol) ImageSymbol.__proto__ = BaseSymbol;
  ImageSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
  ImageSymbol.prototype.constructor = ImageSymbol;

  return ImageSymbol;
});
