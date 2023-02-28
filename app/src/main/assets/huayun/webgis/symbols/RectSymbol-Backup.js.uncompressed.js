/**
 * 矩形Symbol
 * @author 吴胜飞
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.RectSymbol
 */
define("com/huayun/webgis/symbols/RectSymbol-Backup", [
    "dojo/topic",
    "./BaseSymbol",
    "../utils/Color"
], function (topic, BaseSymbol, Color) {
    /**
     * 构造函数
     * @constructor
     * @alias com.huayun.webgis.symbols.RectSymbol
     * @extends {BaseSymbol}
     * @property {String} color  - 点的颜色
     * @property {number} opacity - 透明度
     */
    var RectSymbol = function (params) {
        BaseSymbol.call(this, params);
        this.type = "rect";
        var opacity = params.opacity === undefined?1: params.opacity;
        var color = Color.parse(params.color||"#FF0000");
        this.hasMap = params.map !== undefined;
        if (this.hasMap) {
            this.loaded = false;
            this.used = false;
            this.uniforms = {
                "u_opacity": opacity,
                "u_texture": 0
            };
            var image = new Image();
            image.setAttribute("crossorigin", 'anonymous');
            image.onload = function (e) {
                this.loaded = true;
                this.image = image;
                if (this.used) {
                    topic.publish("threeRender");
                }
            }.bind(this);
            image.src = params.map;
        } else {
            this.uniforms = {
                "u_opacity": opacity,
                "u_color": [color.r, color.g, color.b, color.a]
            };
        }
    };
    if (BaseSymbol) RectSymbol.__proto__ = BaseSymbol;
    RectSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
    RectSymbol.prototype.constructor = RectSymbol;

    return RectSymbol;
});