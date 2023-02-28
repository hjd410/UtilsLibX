/**
 * 颜色空间, 包括lab和hcl两种颜色空间
 */
define("com/huayun/webgis/utils/colorSpaces", [
    "./utils",
    "./Color"
], function (utils, Color) {

    var Xn = 0.950470, // D65 standard referent
        Yn = 1,
        Zn = 1.088830,
        t0 = 4 / 29,
        t1 = 6 / 29,
        t2 = 3 * t1 * t1,
        t3 = t1 * t1 * t1,
        deg2rad = Math.PI / 180,
        rad2deg = 180 / Math.PI;

    function xyz2lab(t) {
        return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
    }

    function lab2xyz(t) {
        return t > t1 ? t * t * t : t2 * (t - t0);
    }

    function xyz2rgb(x) {
        return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
    }

    function rgb2xyz(x) {
        x /= 255;
        return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    }

    /**
     * RGB颜色空间转换到Lab颜色空间, 不能直接转, 必须借助XYZ颜色空间
     * @private
     * @ignore
     * @param rgbColor
     * @return {{a: number, b: number, alpha: *, l: number}}
     */
    function rgbToLab(rgbColor) {
        var b = rgb2xyz(rgbColor.r),
            a = rgb2xyz(rgbColor.g),
            l = rgb2xyz(rgbColor.b),
            x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
            y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
            z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);

        return {
            l: 116 * y - 16,
            a: 500 * (x - y),
            b: 200 * (y - z),
            alpha: rgbColor.a
        };
    }

    /**
     * lab颜色空间转换到rgb颜色空间
     * @private
     * @ignore
     * @param labColor
     * @return {*}
     */
    function labToRgb(labColor) {
        var y = (labColor.l + 16) / 116,
            x = isNaN(labColor.a) ? y : y + labColor.a / 500,
            z = isNaN(labColor.b) ? y : y - labColor.b / 200;
        y = Yn * lab2xyz(y);
        x = Xn * lab2xyz(x);
        z = Zn * lab2xyz(z);
        return new Color(
            xyz2rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
            xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
            xyz2rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
            labColor.alpha
        );
    }

    /**
     * lab颜色空间插值
     * @private
     * @ignore
     * @param from
     * @param to
     * @param t
     * @return {{a: number, b: number, alpha: number, l: number}}
     */
    function interpolateLab(from, to, t) {
        return {
            l: utils.number(from.l, to.l, t),
            a: utils.number(from.a, to.a, t),
            b: utils.number(from.b, to.b, t),
            alpha: utils.number(from.alpha, to.alpha, t)
        };
    }

    /**
     * rgb颜色空间转换到hcl颜色空间
     * @private
     * @ignore
     * @param rgbColor
     * @return {{c: number, alpha: *, h: number, l: number}}
     */
    function rgbToHcl(rgbColor) {
        var ref = rgbToLab(rgbColor);
        var l = ref.l;
        var a = ref.a;
        var b = ref.b;
        var h = Math.atan2(b, a) * rad2deg;
        return {
            h: h < 0 ? h + 360 : h,
            c: Math.sqrt(a * a + b * b),
            l: l,
            alpha: rgbColor.a
        };
    }

    /**
     * hcl颜色空间转换到rgb颜色空间
     * @private
     * @ignore
     * @param hclColor
     * @return {*}
     */
    function hclToRgb(hclColor) {
        var h = hclColor.h * deg2rad,
            c = hclColor.c,
            l = hclColor.l;
        return labToRgb({
            l: l,
            a: Math.cos(h) * c,
            b: Math.sin(h) * c,
            alpha: hclColor.alpha
        });
    }

    function interpolateHue(a, b, t) {
        var d = b - a;
        return a + t * (d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d);
    }

    /**
     * Hcl颜色空间插值
     * @private
     * @ignore
     * @param from
     * @param to
     * @param t
     * @return {{c: number, alpha: number, h: *, l: number}}
     */
    function interpolateHcl(from, to, t) {
        return {
            h: interpolateHue(from.h, to.h, t),
            c: utils.number(from.c, to.c, t),
            l: utils.number(from.l, to.l, t),
            alpha: utils.number(from.alpha, to.alpha, t)
        };
    }

    var lab = {
        forward: rgbToLab,
        reverse: labToRgb,
        interpolate: interpolateLab
    };

    var hcl = {
        forward: rgbToHcl,
        reverse: hclToRgb,
        interpolate: interpolateHcl
    };

    return Object.freeze({
        lab: lab,
        hcl: hcl
    });
});