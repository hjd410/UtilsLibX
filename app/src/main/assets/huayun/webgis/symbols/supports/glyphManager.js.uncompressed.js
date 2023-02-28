define("com/huayun/webgis/symbols/supports/glyphManager", ["require", "exports", "dojo/Deferred", "dojo/promise/all", "dojo/request", "com/huayun/webgis/utils/image", "../../gl/TinySDF"],
    function (require, exports, Deferred, all, request, images, TinySDF) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {value: true});
        var entries = {};
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var fontData = {
            chars: null,
            json: null
        };

        function loadImage(fontFamily) {
            var deferred = new Deferred();
            var image = new Image();
            image.setAttribute("crossorigin", 'anonymous');
            image.onload = function () {
                deferred.resolve(image);
            };
            // @ts-ignore
            image.src = require.toUrl("font/" + fontFamily + "/" + fontFamily + ".png");
            return deferred.promise;
        }

        function loadJson(fontFamily) {
            // @ts-ignore
            return request.get(require.toUrl("font/" + fontFamily + "/" + fontFamily + ".json"), {handleAs: "json"});
        }

        function loadGlyphs(fontFamily, callback) {
            all([loadImage(fontFamily), loadJson(fontFamily)]).then(function (results) {
                var image = results[0], json = results[1];

                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0, image.width, image.height);
                // debugger;
                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                var chars = json.chars;
                fontData.chars = chars;
                fontData.json = json;
                var char;
                var glyphs = {};
                for (var i = 0, ii = chars.length; i < ii; i++) {
                    char = chars[i];
                    var id = char.id;
                    var width = char.width;
                    var height = char.height;
                    var advance = char.xadvance;
                    var x = char.x;
                    var y = char.y;
                    var xoffset = char.xoffset;
                    var yoffset = char.yoffset;
                    var len = width * height;
                    var bitmap = new Uint8Array(len);
                    var count = 0;
                    for (var i_1 = y; i_1 < y + height; i_1++) {
                        for (var j = x; j < x + width; j++) {
                            var pos = i_1 * image.width + j;
                            bitmap[count++] = imageData[4 * pos];
                        }
                    }
                    glyphs[id] = {
                        id: id,
                        bitmap: new images.AlphaImage({
                            width: width,
                            height: height
                        }, bitmap),
                        metrics: {width: width, height: height, left: xoffset - 1, top: yoffset, advance: advance}
                    };
                }
                callback(glyphs);
            });
        }

        function getGlyphsFromImage(fontFamily, chars, callback) {
            var entry = entries[fontFamily];
            if (!entry) {
                entry = entries[fontFamily] = {};
            }
            if (entry.glyphs) { // 元数据已返回
                var result = {};
                for (var i = 0, ii = chars.length; i < ii; i++) {
                    var id = chars[i];
                    result[id] = entry.glyphs[id];
                }
                callback(result);
            } else { // 元数据未返回
                var requests_1 = entry.requests;
                if (!requests_1) { // 未发请求
                    requests_1 = entry.requests = [];
                    loadGlyphs(fontFamily, function (response) {
                        entry.glyphs = {};
                        entries[fontFamily].glyphs = {};
                        for (var id in response) {
                            entry.glyphs[+id] = response[+id];
                        }
                        for (var i = 0, list = requests_1; i < list.length; i += 1) {
                            var cb = list[i];
                            cb(response);
                        }
                    });
                }
                requests_1.push(function (response) {
                    var result = {};
                    for (var i = 0, ii = chars.length; i < ii; i++) {
                        var id = chars[i];
                        result[id] = response[id];
                    }
                    callback(result);
                });
            }
        }

        exports.getGlyphsFromImage = getGlyphsFromImage;

        function _tinySDF(entry, stack, id) {
            var family = stack;
            var tinySDF = entry.tinySDF;
            if (!tinySDF) {
                var fontWeight = 400;
                if (/bold/i.test(stack)) {
                    fontWeight = '900';
                } else if (/medium/i.test(stack)) {
                    fontWeight = '500';
                } else if (/light/i.test(stack)) {
                    fontWeight = '200';
                }
                tinySDF = entry.tinySDF = new TinySDF(96, 0, 8, .25, family, fontWeight);
            }
            var str = String.fromCharCode(id);
            if (id < 255) {
                return {
                    id: id,
                    bitmap: new images.AlphaImage({width: 96, height: 96}, tinySDF.draw(str)),
                    metrics: {
                        width: 96,
                        height: 96,
                        left: 0,
                        top: 0,
                        advance: tinySDF.measureText(str).width
                    }
                };
            } else {
                return {
                    id: id,
                    bitmap: new images.AlphaImage({width: 96, height: 96}, tinySDF.draw(str)),
                    metrics: {
                        width: 96,
                        height: 96,
                        left: 0,
                        top: 0,
                        advance: tinySDF.measureText(str).width
                    }
                };
            }
        }

        exports.getGlyphs = function (fontFamily, glyphs, callback) {
            var entry = entries[fontFamily];
            if (!entry) {
                entry = entries[fontFamily] = {
                    glyphs: {}
                }
            }
            var result = {};
            for (var i = 0, ii = glyphs.length; i < ii; i++) {
                var id = glyphs[i];
                var glyph = entry.glyphs[id];
                if (glyph) {
                    result[id] = glyph;
                    continue;
                }
                glyph = _tinySDF(entry, fontFamily, id);
                if (glyph) {
                    result[id] = glyph;
                    entry.glyphs[id] = glyph;
                }
            }
            callback(result);
        }

        function updateOffset(params) {
            var entry = entries[params.fontFamily];
            var glyph = entry.glyphs[params.id];
            var metrics = glyph.metrics;
            metrics.left = Number(params.xOffset);
            metrics.top = Number(params.yOffset);
        }

        exports.updateOffset = updateOffset;

        exports.fontData = fontData;
    });
