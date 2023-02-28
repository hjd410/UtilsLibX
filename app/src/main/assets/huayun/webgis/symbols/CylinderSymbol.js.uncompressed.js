/**
 * 圆柱符号样式
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.CylinderSymbol
 */
define("com/huayun/webgis/symbols/CylinderSymbol", [
    "../utils/Color"
], function (Color) {

    /**
     * 圆柱符号样式
     * @param {object} props 构造参数
     * @param {object} props.bottomPattern
     * @param {object} props.topPattern
     * @param {object} props.sidePattern
     * @param {boolean} props.topVisible
     * @param {boolean} props.bottomVisible
     * @alias com.huayun.webgis.symbols.CylinderSymbol
     * @constructor
     * @property {object} bottomPattern
     * @property {object} topPattern
     * @property {object} sidePattern
     * @property {boolean} topVisible
     * @property {boolean} bottomVisible
     */
    function CylinderSymbol(props) {
        this.bottomPattern = props.bottomPattern;
        this.topPattern = props.topPattern;
        this.topVisible = props.topVisible;
        this.bottomVisible = props.bottomVisible;
        this.sidePattern = props.sidePattern;
        var color =Color.parse(props.color||"#FFF");
        this.color = [color.r, color.g, color.b, color.a];

        if (this.topPattern || this.bottomPattern || this.sidePattern) {
            this.uniforms = {
                "u_device_pixel_ratio": 1,
                "u_texture": 0,
                "u_size": 1,
                "u_opacity": 1.0,
                "u_color": this.color
            };
        } else {
            this.uniforms = {
                "u_device_pixel_ratio": 1,
                "u_size": 1,
                "u_opacity": 1.0,
                "u_color": this.color
            };
        }
    }

    return CylinderSymbol;
})