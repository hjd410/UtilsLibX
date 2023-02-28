define("com/huayun/webgis/symbols/ConeSymbol", [
    "../utils/Color"
], function (Color) {
    function ConeSymbol(props) {
        let c = Color.parse(props.topColor);
        this.topColor = [c.r, c.g, c.b, c.a];
        c = Color.parse(props.bottomColor);
        this.bottomColor = [c.r, c.g, c.b, c.a];

        this.uniforms = {
        };
    }

    return ConeSymbol;
})