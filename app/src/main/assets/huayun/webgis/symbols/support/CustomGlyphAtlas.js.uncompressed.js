define("com/huayun/webgis/symbols/support/CustomGlyphAtlas", [
    "../../gl/potpack",
    "../../utils/image"
], function (potpack, images) {
    var padding = 1;
    return function (stacks) {
        var positions = {};
        var totalW = 0,
            totalH = -Infinity;
        var textWidth = 0;
        for (var stack in stacks) {
            var glyphs = stacks[stack];
            var stackPositions = positions[stack] = {};
            for (var id in glyphs) {
                var src = glyphs[+id];
                if (!src || src.bitmap.width === 0 || src.bitmap.height === 0) {
                    continue;
                }
                var bin = {
                    x: totalW,
                    y: 0,
                    w: src.bitmap.width + 2 * padding,
                    h: src.bitmap.height + 2 * padding
                };
                totalW += bin.w;
                textWidth += src.metrics.advance;
                if (bin.h > totalH) {
                    totalH = bin.h;
                }
                stackPositions[id] = {rect: bin, metrics: src.metrics};
            }
        }

        /*var ref = potpack(bins);
        var w = ref.w;
        var h = ref.h;*/
        var w = totalW,
            h = totalH;
        var image = new images.AlphaImage({width: w || 1, height: h || 1});

        for (var stack$1 in stacks) {
            var glyphs$1 = stacks[stack$1];
            for (var id$1 in glyphs$1) {
                var src$1 = glyphs$1[+id$1];
                if (!src$1 || src$1.bitmap.width === 0 || src$1.bitmap.height === 0) {
                    continue;
                }
                var bin$1 = positions[stack$1][id$1].rect;
                images.AlphaImage.copy(src$1.bitmap, image, {x: 0, y: 0}, {
                    x: bin$1.x + padding,
                    y: bin$1.y + padding
                }, src$1.bitmap);
            }
        }
        this.image = image;
        this.positions = positions;
        this.textWidth = textWidth;
    };
});