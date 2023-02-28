define("com/huayun/webgis/symbols/LineParticleSymbol", [
    "./BaseSymbol",
    "../utils/Color"
], function (BaseSymbol, Color) {
    var LineParticleSymbol = function (params) {
        BaseSymbol.call(this, params);
        this.type = "lineParticle";
        this.segment = params.segment||10;
        var color = Color.parse(params.color||"#FF0000");
        this.uniforms = {
            "color": [color.r, color.g, color.b, color.a]
        };
    };
    if (BaseSymbol) LineParticleSymbol.__proto__ = BaseSymbol;
    LineParticleSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
    LineParticleSymbol.prototype.constructor = LineParticleSymbol;

    return LineParticleSymbol;
});