define("com/huayun/webgis/symbols/ZTTextSymbol", [
    "./BaseSymbol",
    "../utils/Color",
    "./support/glyphManager",
    "./support/GlyphAtlas"
], function (BaseSymbol, Color, glyphManager, GlyphAtlas) {
    var ZTTextSymbol = function (params) {
        BaseSymbol.call(this, params);

        var color = Color.parse(params.color || "#FF0000"),
            opacity = params.opacity === undefined ? 1 : params.opacity,
            size = params.size === undefined ? 12 : params.size;
        var isRotate = params.isRotate === undefined?false:params.isRotate;
        var rotateRadian = params.rotateRadian === undefined?0:params.rotateRadian;
        var offset = params.offset || [0, 0];
        this.offset = offset.map(function (item) {
            return item/size;
        });
        this.hasHalo = !!params.halo;
        var haloBlur,haloColor, haloWidth;
        if (this.hasHalo) {
            haloBlur = params.halo.blur || 0;
            haloColor = Color.parse(params.halo.color || "#FF0000");
            haloWidth = params.halo.width || 0;
        } else {
            haloBlur = 0;
            haloColor = Color.parse("#FFF");
            haloWidth =0;
        }

        this.type = "zttext";
        this.uniforms = {
            "u_size": size,
            "u_pitch_with_map": 0,
            "u_opacity": opacity,
            "u_texture": 0,
            "u_fill_color": [color.r, color.g, color.b, color.a],
            "u_gamma_scale": 2,
            "u_rotate_symbol": isRotate,
            "u_radian": rotateRadian,
            "u_halo_color": [haloColor.r, haloColor.g, haloColor.b, haloColor.a],
            "u_halo_width": haloWidth,
            "u_halo_blur": haloBlur,
            "u_is_halo": this.hasHalo?1:0
        };

        var text = params.text;
        this.text = text;
        var font = params.font||"sans-serif";

        this.font = font;
        var stacks = {};
        stacks[font] = [];
        var count = 0;
        for (var i = 0, len = text.length; i < len; i++) {
            count++;
            stacks[font].push(text.charCodeAt(i));
        }
        this.glyphMap = {};
        this.glyphReady = false;
        /*this.glyphMap = glyphManager.getGlyphsFromPbf(stacks);
        */
        glyphManager.getGlyphsFromPbf(stacks, function (err, result) {
            count--;
            if (result) {
                if (!this.glyphMap[result.stack]) {
                    this.glyphMap[result.stack] = {};
                }
                this.glyphMap[result.stack][result.id] = result.glyph;
            }
            if (count < 1) {
                this.glyphAtlas = new GlyphAtlas(this.glyphMap);
                var image = this.glyphAtlas.image;
                this.width = image.width;
                this.height = image.height;
                if (this.finishRequest) {
                    this.glyphReady = true;
                    this.finishRequest();
                } else {
                    this.glyphReady = true;
                }
            }
        }.bind(this));

    };

    if (BaseSymbol) ZTTextSymbol.__proto__ = BaseSymbol;
    ZTTextSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
    ZTTextSymbol.prototype.constructor = ZTTextSymbol;

    /*ZTTextSymbol.prototype.setText = function (text, font) {
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
    };

    ZTTextSymbol.prototype.setOffset = function (offset) {
        var size = this.uniforms.u_size;
        this.offset = offset.map(function (item) {
            return item/size;
        });
    };*/

    return ZTTextSymbol;
});