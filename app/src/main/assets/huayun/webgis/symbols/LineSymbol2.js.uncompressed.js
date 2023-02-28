/*
 * @ module: LineSymbol
 * @ Author: overfly
 * @ Date: 2019/5/16
 * @ Description: 线Symbol
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.LineSymbol2
 */
define(
    "com/huayun/webgis/symbols/LineSymbol2", [
        "dojo/_base/declare",
        "./BaseSymbol",
        "com/huayun/webgis/gl/VertexFragShader"
    ], function (declare, BaseSymbol, VertexFragShader) {
        /*
         * @alias com.huayun.webgis.symbols.LineSymbol2
         * @extends {BaseSymbol} 
         * @property {string} type   - 图标类型
         * @property {string} join   - 
         * @property {string} cap    - 
         * @property {string} color    - 图标颜色 
         * @property {number} width   - 图标宽度
         */
        return declare("com.huayun.webgis.symbols.LineSymbol2", [BaseSymbol], {
            constructor: function (params) {
                declare.safeMixin(this, params);
                this.type = "line";
                this.join = params.join||"miter";
                this.cap = params.cap||"butt";
                this.color = params.color.toArray();
                this.color.push(1);
                this.material = new THREE.RawShaderMaterial({
                    uniforms: {
                        "u_ratio": {value: 2},
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

            }
        });
    }
);