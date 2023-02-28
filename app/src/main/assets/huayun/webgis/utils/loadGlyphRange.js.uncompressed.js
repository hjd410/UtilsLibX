define("com/huayun/webgis/utils/loadGlyphRange", [
    "dojo/request",
    "../data/Pbf",
    "./Constant",
    "./image"
], function (request, Pbf, Constant, image) {

    function readGlyph(tag, glyph, pbf) {
        if (tag === 1) {
            glyph.id = pbf.readVarint();
        } else if (tag === 2) {
            glyph.bitmap = pbf.readBytes();
        } else if (tag === 3) {
            glyph.width = pbf.readVarint();
        } else if (tag === 4) {
            glyph.height = pbf.readVarint();
        } else if (tag === 5) {
            glyph.left = pbf.readSVarint();
        } else if (tag === 6) {
            glyph.top = pbf.readSVarint();
        } else if (tag === 7) {
            glyph.advance = pbf.readVarint();
        }
    }

    function readFontstack(tag, glyphs, pbf) {
        if (tag === 3) {
            var ref = pbf.readMessage(readGlyph, {});
            var id = ref.id;
            var bitmap = ref.bitmap;
            var width = ref.width;
            var height = ref.height;
            var left = ref.left;
            var top = ref.top;
            var advance = ref.advance;
            glyphs.push({
                id: id,
                bitmap: new image.AlphaImage({
                    width: width + 2 * Constant.layout.border,
                    height: height + 2 * Constant.layout.border
                }, bitmap),
                metrics: {width: width, height: height, left: left, top: top, advance: advance}
            });
        }
    }

    function readFontstacks(tag, glyphs, pbf) {
        if (tag === 1) {
            pbf.readMessage(readFontstack, glyphs);
        }
    }

    function parseGlyphPBF(data) {
        return new Pbf(data).readFields(readFontstacks, []);
    }

    function loadGlyphRange(fontstack, range, urlTemplate, callback) {
        var begin = range * 256;
        var end = begin + 255;

        request(urlTemplate.replace('{fontstack}', fontstack).replace('{range}', (begin + "-" + end)), {handleAs: "arraybuffer"}).then(function (data) {
            var glyphs = {};
            for (var i = 0, list = parseGlyphPBF(data); i < list.length; i += 1) {
                var glyph = list[i];
                glyphs[glyph.id] = glyph;
            }
            callback(null, glyphs);
        }).catch(function (err) {
            callback(err);
        })
    }

    return loadGlyphRange;
});