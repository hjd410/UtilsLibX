define("com/huayun/webgis/symbols/ArcParticleSymbol", [
    "./BaseSymbol",
    "../utils/Color"
], function (BaseSymbol, Color) {
    var ArcParticleSymbol = function (params) {
        BaseSymbol.call(this, params);
        this.type = "arcParticle";
        var color = Color.parse(params.color||"#FF0000");
        this.uniforms = {
            'height': 1,
            'tilts': 0,
            'offset': 0,
            "color": [color.r, color.g, color.b, color.a]
        };
    };
    if (BaseSymbol) ArcParticleSymbol.__proto__ = BaseSymbol;
    ArcParticleSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
    ArcParticleSymbol.prototype.constructor = ArcParticleSymbol;

    return ArcParticleSymbol;
});