/**
 * 圆柱符号样式
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.CylinderSymbol
 */
define("com/huayun/webgis/symbols/CubeSymbol", [
    "../utils/Color"
], function (Color) {

    function CubeSymbol(props) {
        var color = Color.parse(props.color||"#FFF");
        this.color = [color.r, color.g, color.b, color.a];

        this.uniforms = {
            "u_device_pixel_ratio": 1,
            "u_size": 1,
            "u_opacity": 1.0,
            "u_color": this.color
        };
    }

    return CubeSymbol;
})