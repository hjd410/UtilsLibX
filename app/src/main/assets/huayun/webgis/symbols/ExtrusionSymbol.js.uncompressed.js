define("com/huayun/webgis/symbols/ExtrusionSymbol", [
    "../utils/Color"
], function (Color) {

    function ExtrusionSymbol(params) {
        this.type = "extrusion";

        var lightPos = [0.12347, -0.56158, 0.9959292143521045];
        var lightColor = {
            r: 1,
            g: 1,
            b: 1,
            a: 1
        };
        var height = params.height === undefined ? 0 : params.height;
        var color = Color.parse(params.color || "#F00");
        var opacity = params.opacity === undefined ? 1.0: Number(params.opacity);

        this.uniforms = {
            'u_lightpos': lightPos,
            'u_lightintensity': 0.3,
            'u_lightcolor': [lightColor.r, lightColor.g, lightColor.b],
            'u_vertical_gradient': 0,
            'u_opacity': opacity,
            'u_color': [color.r, color.g, color.b, color.a],
            'u_height': height,
            'u_base': 0
        };
    }

    return ExtrusionSymbol;
})