define("com/huayun/webgis/symbols/SpriteSymbol", [
  "dojo/topic",
  "./BaseSymbol"
], function (topic, BaseSymbol) {
  var SpriteSymbol = function (params) {
    BaseSymbol.call(this, params);
    this.type = "sprite";

    this.loaded = false;
    this.used = false;
    this.width = params.width;
    this.height = params.height;

    this.uniforms = {
      "center": [0.5, 0.5],
      "rotation": 0,
      "map": 0
    };

    var image = new Image();
    image.onload = function (e) {
      this.loaded = true;
      this.image = image;
      if (this.used) {
        topic.publish("threeRender");
      }
    }.bind(this);
    image.src = params.url;
  };
  if (BaseSymbol) SpriteSymbol.__proto__ = BaseSymbol;
  SpriteSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
  SpriteSymbol.prototype.constructor = SpriteSymbol;

  return SpriteSymbol;
});
