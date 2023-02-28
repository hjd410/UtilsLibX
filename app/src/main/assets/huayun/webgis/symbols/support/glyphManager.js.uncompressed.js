define("com/huayun/webgis/symbols/support/glyphManager", [
    "require",
    "exports",
    "dojo/request",
    "../../gl/TinySDF",
    "../../utils/image",
    "../../data/Pbf"
], function (require, exports, request, TinySDF, image, Pbf) {
    var entries = {};
    var urlTemplate = "font/{fontstack}/{range}.pbf";
    var border = 3;

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
                    width: width + 2 * border,
                    height: height + 2 * border
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

    function parseFont(stack) {
        var font = stack.split(" ");
        if (font.length === 1) {
            return {
                fontWeight: '400',
                fontFamily: stack
            };
        } else if (font.length === 2) {
            return {
                fontWeight: font[0],
                fontFamily: font[1]
            }
        }
    }

    function _tinySDF(entry, stack, id) {
        var parse = parseFont(stack);
        var family = parse.fontFamily;
        var tinySDF = entry.tinySDF;
        if (!tinySDF) {
            var fontWeight = parse.fontWeight;
            if (/bold/i.test(stack)) {
                fontWeight = '900';
            } else if (/medium/i.test(stack)) {
                fontWeight = '500';
            } else if (/light/i.test(stack)) {
                fontWeight = '200';
            }
            tinySDF = entry.tinySDF = new TinySDF(24, 1, 8, .25, family, fontWeight);
        }
        var str = String.fromCharCode(id);
        if (id < 255) {
            return {
                id: id,
                bitmap: new image.AlphaImage({width: 26, height: 26}, tinySDF.draw(str)),
                metrics: {
                    width: 24,
                    height: 24,
                    left: 0,
                    top: -8,
                    advance: tinySDF.measureText(str).width
                }
            };
        } else {
            return {
                id: id,
                bitmap: new image.AlphaImage({width: 26, height: 26}, tinySDF.draw(str)),
                metrics: {
                    width: 24,
                    height: 24,
                    left: 0,
                    top: -8,
                    advance: 24
                }
            };
        }
    }

    exports.getGlyphs = function (glyphs) {
        var result = {};
        for (var stack in glyphs) {
            result[stack] = {};
            for (var i = 0, list = glyphs[stack]; i < list.length; i++) {
                var id = list[i];
                var entry = entries[stack];
                if (!entry) {
                    entry = entries[stack] = {
                        glyphs: {}
                    }
                }
                var glyph = entry.glyphs[id];
                if (glyph) {
                    result[stack][id] = glyph;
                    continue;
                }
                glyph = _tinySDF(entry, stack, id);
                if (glyph) {
                    result[stack][id] = glyph;
                }
            }
        }
        return result;
    }

    function loadGlyphRange(fontstack, range, callback) {
        var begin = range * 256;
        var end = begin + 255;
        var url = urlTemplate.replace('{fontstack}', fontstack).replace('{range}', (begin + "-" + end));
        request(require.toUrl(url), {handleAs: "arraybuffer"}).then(function (data) {
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

    exports.getGlyphsFromPbf = function (glyphs, callback) {
        for (var stack in glyphs) {
            for (var i = 0, list = glyphs[stack]; i < list.length; i++) {
                var id = list[i];
                var entry = entries[stack];
                if (!entry) {
                    entry = entries[stack] = {
                        glyphs: {},
                        requests: {}
                    }
                }
                var glyph = entry.glyphs[id];
                if (glyph) {
                    callback(null, {stack: stack, id: id, glyph: glyph})
                    continue;
                }

                var range = Math.floor(id / 256);
                var requests = entry.requests[range];
                if (!requests) {
                    requests = entry.requests[range] = [];
                    loadGlyphRange(stack, range, function (err, response) {
                        if (response) {
                            for (var id in response) {
                                entry.glyphs[+id] = response[+id];
                            }
                        }
                        for (var i = 0, list = requests; i < list.length; i += 1) {
                            var cb = list[i];
                            cb(err, response)
                        }
                        delete entry.requests[range];
                    });
                }
                requests.push(function (err, result) {
                    if (err) {
                        callback(err);
                    } else if (result) {
                        callback(null, {stack: stack, id: id, glyph: result[id] || null})
                    }
                })
            }
        }
    }
});
