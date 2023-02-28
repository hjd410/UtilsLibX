/**
 * @ module: LineDashSymbol
 * @ Author: wushengfei
 * @ Date: 2019/5/16
 * @ Description: 线Symbol
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.LineDashSymbol
 */
define("com/huayun/webgis/symbols/LineDashSymbol", [
    "dojo/topic",
    "./BaseSymbol",
    "./lineDashTexture",
    "com/huayun/webgis/gl/VertexFragShader"
], function (topic, BaseSymbol, lineDashTexture, VertexFragShader) {
    return (function (BaseSymbol) {
        /**
         * @alias com.huayun.webgis.symbols.LineDashSymbol
         * @extends {BaseSymbol}
         * @property {string} type  - 图标类型
         * @property {string} join  - 
         * @property {string} cap   - 
         * @property {string} color  - 图标颜色
         * @property {boolean} isComputeSphere  - 是否计算球面
         */
        function LineDashSymbol(params) {
            BaseSymbol.call(this, params);
            this.type = "line";
            this.join = params.join||"miter";
            this.cap = params.cap||"butt";
            this.color = params.color.toArray();
            this.color.push(1);
            this.isComputeSphere = params.isComputeSphere || true;
            
            var dasharray = {
                from: params.dasharray,
                to: params.dasharray
            };
            var round = false;
            var posA = lineDashTexture.lineAtlas.getDash(dasharray.from, round);
            var posB = lineDashTexture.lineAtlas.getDash(dasharray.to, round);
            var widthA = posA.width * 2;
            var widthB = posB.width * 1;
            // var tileRatio = 0.25;
            this.tileRatio = 2 / params.resolution;
            var width = lineDashTexture.lineAtlas.width;

            this.material = new THREE.RawShaderMaterial({
                uniforms: {
                    "u_ratio": {value: 2/params.resolution},
                    "u_units_to_pixels": {value: params.wh},
                    "u_device_pixel_ratio": {value: 1.0},
                    "u_color": {value: this.color},
                    "u_opacity": {value: 1.0},
                    "u_gapwidth": {value: 0.0},
                    "u_width": {value: 10},
                    "u_image": {value: lineDashTexture.texture},
                    "u_blur": {value: 0.0},
                    "u_offset": {value: 0.0},
                    "u_floorwidth": {value: 1.0},
                    'u_patternscale_a': {value: [1 / params.resolution / widthA, -posA.height / 2]},
                    'u_patternscale_b': {value: [1 / params.resolution / widthB, -posB.height / 2]},
                    'u_sdfgamma': {value: width / (Math.min(widthA, widthB) * 256) / 2},
                    'u_tex_y_a': {value: posA.y},
                    'u_tex_y_b': {value: posB.y},
                    'u_mix': {value: 1}
                },
                vertexShader: VertexFragShader.basicLineDash.vertexSource,
                fragmentShader: VertexFragShader.basicLineDash.fragmentSource,
                transparent: false,
                side: THREE.DoubleSide,
                blending: THREE.CustomBlending,
                blendSrc: THREE.OneFactor,
                blendDst: THREE.OneMinusSrcAlphaFactor
            });

            /*topic.subscribe("zoomEnd", function (resolution) {
                this.material.uniforms["u_ratio"].value = 2/resolution;
                this.material.uniforms["u_patternscale_a"].value = [1/resolution /widthA, -posA.height / 2];
                this.material.uniforms["u_patternscale_b"].value = [1/resolution /widthB, -posB.height / 2];
            }.bind(this));*/
        }

        if (BaseSymbol) LineDashSymbol.__proto__ = BaseSymbol;
        LineDashSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
        LineDashSymbol.prototype.constructor = LineDashSymbol;
        return LineDashSymbol;
    }(BaseSymbol));
});