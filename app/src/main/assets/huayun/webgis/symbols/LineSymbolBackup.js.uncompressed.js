/**
 * @ module: LineSymbol
 * @ Author: wushengfei
 * @ Date: 2019/5/16
 * @ Description: 线Symbol
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.LineSymbol
 */
define("com/huayun/webgis/symbols/LineSymbolBackup", [
    "dojo/topic",
    "./BaseSymbol",
    "com/huayun/webgis/gl/VertexFragShader"
], function (topic, BaseSymbol, VertexFragShader) {
    /** 
     * @alias com.huayun.webgis.symbols.LineSymbol
     * @extends {BaseSymbol}
     * @property {string} type   - 图标类型
     * @property {string} join   - 
     * @property {string} cap    - 
     * @property {string} color  - 图标颜色
     * @property {boolean} isComputeSphere  - 是否计算球面
     */
    return (function (BaseSymbol) {
        function LineSymbol(params) {
            BaseSymbol.call(this, params);
            this.type = "line";
            this.join = params.join||"miter";
            this.cap = params.cap||"butt";
            this.color = params.color.toArray();
            this.color.push(1);
            this.isComputeSphere = params.isComputeSphere || true;
            this.material = new THREE.RawShaderMaterial({
                uniforms: {
                    "u_ratio": {value:  1/params.resolution},
                    "u_units_to_pixels": {value: params.wh},
                    "u_color": {value: this.color},
                    "u_blur": {value: 0.0},
                    "u_opacity": {value: 1.0},
                    "u_gapwidth": {value: 0.0},
                    "u_offset": {value: 0.0},
                    "u_width": {value: params.width}
                },
                vertexShader: VertexFragShader.basicLine.vertexSource,
                fragmentShader: VertexFragShader.basicLine.fragmentSource,
                transparent: false,
                side: THREE.DoubleSide,
                blending: THREE.CustomBlending,
                blendSrc: THREE.OneFactor,
                blendDst: THREE.OneMinusSrcAlphaFactor
            });

            topic.subscribe("zoomEnd", function (resolution) {
                this.material.uniforms["u_ratio"].value = 1/resolution;
            }.bind(this));
        }

        if (BaseSymbol) LineSymbol.__proto__ = BaseSymbol;
        LineSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
        LineSymbol.prototype.constructor = LineSymbol;
        return LineSymbol;
    }(BaseSymbol));
});