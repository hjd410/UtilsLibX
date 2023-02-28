define("com/huayun/webgis/symbols/ImageFillSymbol", [
  "dojo/topic",
  "./BaseSymbol"
], function (topic, BaseSymbol) {
  var ImageFillSymbol = function (params) {
    BaseSymbol.call(this, params);
    this.type = "imageFill";
    var opacity = params.opacity === undefined?1:params.opacity;
    this.uniforms = {
      "u_pixel_coord_upper": [0, 0],
      "u_pixel_coord_lower": [0, 0],
      "u_scale": [1, 1, 2, 1],
      "u_opacity": opacity,
      "u_fade": 1,
      "u_image": 0
    };
    this.width = params.width;
    this.height = params.height;

    var image = new Image();
    image.setAttribute("crossorigin", 'anonymous');
    image.onload = function (e) {
      this.loaded = true;
      this.image = image;
      this.uniforms.u_texsize = [this.width, this.height];
      this.uniforms.u_pattern_from = [1, 1, this.width - 1, this.height-1];
      this.uniforms.u_pattern_to = [1, 1, this.width - 1, this.height-1];
      if (this.used) {
        topic.publish("threeRender");
      }
    }.bind(this);
    image.src = params.url;
  };

  if (BaseSymbol) ImageFillSymbol.__proto__ = BaseSymbol;
  ImageFillSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
  ImageFillSymbol.prototype.constructor = ImageFillSymbol;
  return ImageFillSymbol;
});