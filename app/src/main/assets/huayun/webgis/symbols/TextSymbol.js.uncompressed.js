/**
 * 文本Symbol
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.TextSymbol
 */
define("com/huayun/webgis/symbols/TextSymbol", [
    "./Symbol",
    "../utils/Color",
    "./support/glyphManager",
    "./support/CustomGlyphAtlas"
], function (BaseSymbol, Color, glyphManager, GlyphAtlas) {
    /**
     * 文本Symbol
     * @constructor
     * @alias com.huayun.webgis.symbols.TextSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {String} params.color 颜色
     * @param {Number} params.opacity 透明度
     * @param {Number} params.size 文本大小
     * @param {String} params.text 文本内容
     * @property {String} color 线的颜色
     * @property {Number} opacity 线的透明度
     * @property {Number} fontSize 文本大小
     * @property {String} text 文本内容
     */
    var TextSymbol = function (params) {
        BaseSymbol.call(this, params);

        var color = Color.parse(params.color || "#FF0000"),
            opacity = params.opacity === undefined ? 1 : params.opacity,
            size = Number(params.size || params['font-size']);
        this.fontSize = size;//size < 12 ? 12 : size;
        var isRotate = params.isRotate === undefined ? false : params.isRotate;
        var rotateRadian = params.rotateRadian === undefined ? 0 : params.rotateRadian;

        var offset = params.offset || [Number(params.dx), Number(params.dy)];
        this.offset = offset.map(function (item) {
            return item / size;
        });

        this.hasHalo = params["stroke"] || !!params.halo;
        var haloBlur, haloColor, haloWidth;

        if (this.hasHalo) {
            if (params.halo) {
                haloBlur = params.halo.blur || 0;
                haloColor = Color.parse(params.halo.color || "#FF0000");
                haloWidth = params.halo.width || Number(params["stroke-width"]);
            } else {
                haloBlur = 0;
                haloColor = Color.parse(params.stroke || "#FF0000");
                haloWidth = Number(params["stroke-width"]);
            }
        } else {
            haloBlur = 0;
            haloColor = Color.parse("#FFF");
            haloWidth = 0;
        }
        this.type = "text";
        this.uniforms = {
            "u_size": this.fontSize,
            "u_pitch_with_map": 0,
            "u_opacity": opacity,
            "u_texture": 0,
            "u_fill_color": [color.r, color.g, color.b, color.a],
            "u_gamma_scale": 1,
            "u_rotate_symbol": isRotate,
            "u_radian": rotateRadian,
            "u_halo_color": [haloColor.r, haloColor.g, haloColor.b, haloColor.a],
            "u_halo_width": haloWidth,
            "u_halo_blur": haloBlur,
            "u_is_halo": this.hasHalo ? 1 : 0
        };

        var text = params.text;
        var font = params.font || params["font-family"] || "sans-serif";
        this.font = font;
        if (text) {
            this.text = text;

            var stacks = {};
            stacks[font] = [];
            for (var i = 0, len = text.length; i < len; i++) {
                stacks[font].push(text.charCodeAt(i));
            }
            this.glyphMap = glyphManager.getGlyphs(stacks);
            this.glyphAtlas = new GlyphAtlas(this.glyphMap);

            var image = this.glyphAtlas.image;
            this.width = image.width;
            this.height = image.height;
            this.textWidth = this.glyphAtlas.textWidth;
        }
    };

    if (BaseSymbol) TextSymbol.__proto__ = BaseSymbol;
    TextSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
    TextSymbol.prototype.constructor = TextSymbol;

    TextSymbol.prototype.setText = function (text, font) {
        if (text === undefined || text.length === 0) return;
        // text = 'aaaa' +  '\n' + 'bbbb';
        this.text = text;
        if (!font) {
            font = this.font;
        }
        var stacks = {};
        stacks[font] = [];
        for (var i = 0, len = text.length; i < len; i++) {
            stacks[font].push(text.charCodeAt(i));
        }
        this.glyphMap = glyphManager.getGlyphs(stacks);
        this.glyphAtlas = new GlyphAtlas(this.glyphMap);
        var image = this.glyphAtlas.image;
        this.width = image.width;
        this.height = image.height;
        this.textWidth = 24 * text.length;
    };

    TextSymbol.prototype.setOffset = function (offset) {
        var size = this.uniforms.u_size;
        this.offset = offset.map(function (item) {
            return item / size;
        });
    };

    return TextSymbol;
});
