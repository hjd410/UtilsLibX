define("com/huayun/webgis/symbols/ArcSymbol", [
    "./BaseSymbol",
    "../utils/Color"
], function (BaseSymbol, Color) {
    var ArcSymbol = function (params) {
        BaseSymbol.call(this, params);
        this.type = "arc";
        var color = Color.parse(params.color||"#FF0000");
        var width = params.width||2;
        this.length = params.length||6;
        this.uniforms = {
            'height': 1,
            'tilts': 0,
            'width': width,
            'u_device_pixel_ratio': 1,
            "color": [color.r, color.g, color.b, color.a],
            "opacity": 0.5,
            "u_ratio": 0.0
        };
    };
    if (BaseSymbol) ArcSymbol.__proto__ = BaseSymbol;
    ArcSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
    ArcSymbol.prototype.constructor = ArcSymbol;

    return ArcSymbol;
});