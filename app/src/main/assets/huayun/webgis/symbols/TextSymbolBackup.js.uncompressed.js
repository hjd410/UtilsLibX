/*
/!**
 * 文字符号
 * @author 吴胜飞
 * @module com/huayun/webgis/symbols
 * @see com.huayun.webgis.symbols.TextSymbol
 * 规范定义:
 * text: 文本内容
 * font-style:字体样式，比如斜体。italic,斜体；bold，粗体；plain，默认
 * font-size:字体大小。 -- 实现
 * font-family:字体类型。
 * color:字体颜色；-- 实现
 * dx: X方向偏移（可选）
 * dy:Y方向偏移（可选）
 * halo-color: halo颜色
 * halo-width: halo宽度
 // 以下未实现
 stroke：边框颜色。（可选）
 stroke-width：边框宽度（可选）
 cheek-shifting：边框偏移量，指边框与文字的距离。（可选）
 第一个值表示，水平方向左右侧与文本的间距
 第二个值表示，垂直方向上下侧与文本的间距。
 cheek-bgcolor：边框背景色（可选）。
 char-space:字间距（可选）
 rx：圆角矩形，圆角在X轴方向的圆弧半径（可选）
 ry：圆角矩形，圆角在Y轴方向的圆弧半径（可选）
 cheek：背景框形状，默认的rectangle（矩形），circle（圆）,ellipse（椭圆）。    cjk-char-orientation：true，表示竖直文字，false，表示正常文字，默认false。
 *!/
define("com/huayun/webgis/symbols/TextSymbolBackup", [
    "./BaseSymbol",
    "../utils/Color",
    "./support/glyphManager",
    "./support/GlyphAtlas"
], function (BaseSymbol, Color, glyphManager, GlyphAtlas) {

    var TextSymbol = function (params) {
        BaseSymbol.call(this, params);

        var color = Color.parse(params.color || "#FF0000"), // 字体颜色
            size = params["font-size"] === undefined ? 12 : params["font-size"], // 字体大小
            style = params["font-style"] === undefined ? "plain" : params["font-style"], // 字体样式
            family = params["font-family"] === undefined ? "sans-serif" : params["font-family"], // 字体类型
            dx = params.dx === undefined ? 0 : params.dx, // x方向偏移
            dy = params.dy === undefined ? 0 : params.dy, // y方向偏移
            haloColor = Color.parse(params["halo-color"] || "#FFF"), // halo颜色
            haloWidth = params["halo-width"] === undefined ? 0 : params["halo-width"];
        // todo 支持stroke, char-space, cjk-char-orientation等属性
        // todo 支持换行符

        this.type = "text"; // symbol类型
        this.offset = [dx/size, dy/size];
        this.text = params.text;
        this.font = family;

        // webgl绘制
        this.uniforms = {
            "u_size": size,
            "u_pitch_with_map": 0,
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

        /!*var isRotate = params.isRotate === undefined ? false : params.isRotate;
        var rotateRadian = params.rotateRadian === undefined ? 0 : params.rotateRadian;*!/

        /!*var offset = params.offset || [0, 0];
        this.offset = offset.map(function (item) {
            return item / size;
        });

        this.hasHalo = !!params.halo;
        var haloBlur, haloColor, haloWidth;

        if (this.hasHalo) {
            haloBlur = params.halo.blur || 0;
            haloColor = Color.parse(params.halo.color || "#FF0000");
            haloWidth = params.halo.width || 0;
        } else {
            haloBlur = 0;
            haloColor = Color.parse("#FFF");
            haloWidth = 0;
        }*!/



        var text = params.text;
        this.text = text;
        var font = params.font || "sans-serif";

        this.font = font;
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
    };

    if (BaseSymbol) TextSymbol.__proto__ = BaseSymbol;
    TextSymbol.prototype = Object.create(BaseSymbol && BaseSymbol.prototype);
    TextSymbol.prototype.constructor = TextSymbol;

    TextSymbol.prototype.setText = function (text, font) {
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

    TextSymbol.prototype.setOffset = function (offset) {
        var size = this.uniforms.u_size;
        this.offset = offset.map(function (item) {
            return item / size;
        });
    };

    return TextSymbol;
});*/
