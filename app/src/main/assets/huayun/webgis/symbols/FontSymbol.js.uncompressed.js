/**
 * 自定义字体符号样式类
 * @module com/huayun/webgis/FontSymbol
 * @see com.huayun.webgis.symbols.FontSymbol
 */
define("com/huayun/webgis/symbols/FontSymbol", [
    "./Symbol",
    "com/huayun/webgis/utils/Color",
    "./support/GlyphAtlas",
    "./supports/glyphManager",
    "../../util/FontUnicodeUtil"
], function (Symbol, Color, GlyphAtlas, glyphManager_1, FontUnicodeUtil) {
    /**
     * 复合点符号的样式
     * @constructor
     * @alias com.huayun.webgis.symbols.FontSymbol
     * @extends {Symbol}
     * @param {Object} params 构造函数参数
     * @param {String} params.color 字体符号颜色,支持CSS格式
     * @param {String} params.font-family 字体符号字体
     * @param {number} params.font-size 字体符号的大小
     * @param {String} params.font-style 字体符号的样式
     * @param {number} params.dx 字体符号的x方向偏移
     * @param {number} params.dy 字体符号的y方向偏移
     * @param {number} params.angle 字体符号的旋转角度
     * @param {String} params.text 字体符号的内容
     * @property {String} type 符号类别
     * @property {String} color 字体符号颜色
     * @property {String} fontFamily 字体符号字体
     * @property {number} fontSize 字体符号大小
     * @property {String} fontStyle 字体符号样式
     * @property {number} dx 字体符号的x方向偏移
     * @property {number} dy 字体符号的y方向偏移
     * @property {number} angle 字体符号的旋转角度
     * @property {String} text 字体符号的内容
     */
    function FontSymbol(params) {
        var _this = Symbol.call(this, params) || this;
        _this.type = "fontSymbol";
        _this.isFixed = params.isFixed;
        _this.fixed = {
            isFixed: _this.isFixed,
            addratio: 0
        };
        _this.glyphReady = false;
        _this.width = 0;
        _this.height = 0;
        _this.color = Color.parse(params.color || "#ff0000");
        _this.fontFamily = params["font-family"];
        _this.fontSize = Number(params["font-size"]);
        _this.fontStyle = params["font-style"];
        _this.dx = Number(params.dx || 0);
        _this.dy = Number(params.dy || 0);
        _this.angle = Number(params.angle || 0) / 180 * Math.PI;
        _this.fillColor = [_this.color.r, _this.color.g, _this.color.b, _this.color.a];
        _this.uniforms = {
            "u_size": _this.fontSize,
            "u_pitch_with_map": 0,
            "u_opacity": 1,
            "u_texture": 0,
            "u_fill_color": [_this.color.r, _this.color.g, _this.color.b, _this.color.a],
            "u_gamma_scale": 1,
            "u_rotate_symbol": 1,
            "u_radian": _this.angle,
            "u_halo_color": [1, 1, 1, 1],
            "u_halo_width": 0,
            "u_halo_blur": 0,
            "u_is_halo": 0
        };
        _this.glyphMap = {};
        _this.glyphReady = false;
        _this.finishRequest = [];
        // debugger;
        if (FontUnicodeUtil.getUnicode(params.text) === undefined) {
            _this.text = params.text;
        } else {
            _this.text = FontUnicodeUtil.getUnicode(params.text);
        }
        return _this;
    }

    if (Symbol) FontSymbol.__proto__ = Symbol;
    FontSymbol.prototype = Object.create(Symbol && Symbol.prototype);
    FontSymbol.prototype.constructor = FontSymbol;

    Object.defineProperty(FontSymbol.prototype, "text", {
        get: function () {
            return this._text;
        },
        set: function (str) {
            var _this = this;
            this._text = str;
            var chars = [];
            for (var i = 0; i < str.length; i++) {
                chars.push(str.charCodeAt(i));
            }
            if (_this.fontFamily === 'FontSymbol') {
                glyphManager_1.getGlyphsFromImage(this.fontFamily, chars, function (result) {
                    _this.glyphMap[_this.fontFamily] = result;
                    _this.glyphAtlas = new GlyphAtlas(_this.glyphMap);
                    _this.uniforms.u_buff = 0.45;
                    var image = _this.glyphAtlas.image;
                    _this.width = image.width;
                    _this.height = image.height;
                    if (_this.finishRequest.length > 0) {
                        _this.glyphReady = true;
                        for (var i = 0; i < _this.finishRequest.length; i++) {
                            _this.finishRequest[i]();
                        }
                        _this.finishRequest = [];
                    } else {
                        _this.glyphReady = true;
                    }
                });
            } else {
                glyphManager_1.getGlyphs(this.fontFamily, chars, function (result) {
                    _this.glyphMap[_this.fontFamily] = result;
                    _this.glyphAtlas = new GlyphAtlas(_this.glyphMap);
                    _this.uniforms.u_buff = 0.75;
                    var image = _this.glyphAtlas.image;
                    _this.width = image.width;
                    _this.height = image.height;
                    if (_this.finishRequest.length > 0) {
                        _this.glyphReady = true;
                        for (var i = 0; i < _this.finishRequest.length; i++) {
                            _this.finishRequest[i]();
                        }
                        _this.finishRequest = [];
                    } else {
                        _this.glyphReady = true;
                    }
                });
            }
        },
        enumerable: true,
        configurable: true
    });

    FontSymbol.prototype.setRadian = function (radian) {
        this.uniforms["u_rotate_symbol"] = 1;
        this.uniforms["u_radian"] = radian;
    }

    FontSymbol.prototype.getFontOffsetValue = function (id) {
        var result = null;
        glyphManager_1.fontData.chars.forEach(function (item) {
            if (item.id === id) {
                result = {
                    xOffset: item.xoffset,
                    yOffset: item.yoffset
                };
                return result;
            }
        });
        return result;
    }

    FontSymbol.prototype.updateOffset = function (params) {
        /*params.fontFamily = this.fontFamily;
        glyphManager_1.updateOffset(params);
        this.text = this._text;*/
    }

    FontSymbol.prototype.getFontInfo = function (){
        return glyphManager_1.fontData;
    }

    return FontSymbol;
});
