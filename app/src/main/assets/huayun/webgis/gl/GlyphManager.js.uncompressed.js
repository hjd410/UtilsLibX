define("com/huayun/webgis/gl/GlyphManager", [
    "../utils/utils",
    "../utils/image",
    "../utils/Constant",
    "../utils/loadGlyphRange",
    "../utils/TinySDF"
], function (utils, image, Constant, loadGlyphRange, TinySDF) {

    var GlyphManager = function GlyphManager(localIdeographFontFamily) {
        this.localIdeographFontFamily = localIdeographFontFamily;
        this.entries = {};
    };

    GlyphManager.prototype.setURL = function setURL(url) {
        this.url = url;
    };

    GlyphManager.prototype.getGlyphs = function getGlyphs(glyphs, callback) {
        var this$1 = this;
        var all = [];

        for (var stack in glyphs) {
            for (var i = 0, list = glyphs[stack]; i < list.length; i += 1) {
                var id = list[i];
                all.push({stack: stack, id: id});
            }
        }

        utils.asyncAll(all, function (ref, callback) {
            var stack = ref.stack;
            var id = ref.id;

            var entry = this$1.entries[stack];
            if (!entry) {
                entry = this$1.entries[stack] = {
                    glyphs: {},
                    requests: {}
                };
            }
            var glyph = entry.glyphs[id];
            if (glyph !== undefined) {
                callback(null, {stack: stack, id: id, glyph: glyph});
                return;
            }
            glyph = this$1._tinySDF(entry, stack, id);
            if (glyph) {
                callback(null, {stack: stack, id: id, glyph: glyph});
                return;
            }

            var range = Math.floor(id / 256);
            if (range * 256 > 65535) {
                callback(new Error('glyphs > 65535 not supported'));
                return;
            }

            var requests = entry.requests[range];
            if (!requests) {
                requests = entry.requests[range] = [];
                GlyphManager.loadGlyphRange(stack, range, this$1.url, function (err, response) {
                    if (response) {
                        for (var id in response) {
                            entry.glyphs[+id] = response[+id];
                        }
                    }
                    for (var i = 0, list = requests; i < list.length; i += 1) {
                        var cb = list[i];
                        cb(err, response);
                    }
                    delete entry.requests[range];
                });
            }

            requests.push(function (err, result) {
                if (err) {
                    callback(err);
                } else if (result) {
                    callback(null, {stack: stack, id: id, glyph: result[id] || null});
                }
            });
        }, function (err, glyphs) {
            if (err) {
                callback(err);
            } else if (glyphs) {
                var result = {};
                for (var i = 0, list = glyphs; i < list.length; i += 1) {
                    var ref = list[i];
                    var stack = ref.stack;
                    var id = ref.id;
                    var glyph = ref.glyph;
                    (result[stack] || (result[stack] = {}))[id] = glyph && {
                        id: glyph.id,
                        bitmap: glyph.bitmap.clone(),
                        metrics: glyph.metrics
                    };
                }
                callback(null, result);
            }
        });
    };

    GlyphManager.prototype._tinySDF = function _tinySDF(entry, stack, id) {
        var family = this.localIdeographFontFamily;
        if (!family) {
            return;
        }
        if (!Constant.unicodeBlockLookup['CJK Unified Ideographs'](id) && !Constant.unicodeBlockLookup['Hangul Syllables'](id) &&
            !Constant.unicodeBlockLookup['Hiragana'](id) && !Constant.unicodeBlockLookup['Katakana'](id)) {
            return;
        }

        var tinySDF = entry.tinySDF;
        if (!tinySDF) {
            var fontWeight = '400';
            if (/bold/i.test(stack)) {
                fontWeight = '900';
            } else if (/medium/i.test(stack)) {
                fontWeight = '500';
            } else if (/light/i.test(stack)) {
                fontWeight = '200';
            }
            tinySDF = entry.tinySDF = new TinySDF(24, 3, 8, .25, family, fontWeight);
        }

        return {
            id: id,
            bitmap: new image.AlphaImage({width: 30, height: 30}, tinySDF.draw(String.fromCharCode(id))),
            metrics: {
                width: 24,
                height: 24,
                left: 0,
                top: -8,
                advance: 24
            }
        };
    };

    GlyphManager.loadGlyphRange = loadGlyphRange;
    GlyphManager.TinySDF = TinySDF;
    return GlyphManager;
});