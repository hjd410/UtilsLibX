define("com/huayun/webgis/gl/ImageAtlas", [
    "./potpack",
    "./ImagePosition",
    "../utils/image",
    "../utils/Constant"
], function (potpack, ImagePosition, images, Constant) {

    var ImageAtlas = function ImageAtlas(icons, patterns) {
        var iconPositions = {}, patternPositions = {};
        this.haveRenderCallbacks = [];
        var bins = [];
        this.addImages(icons, iconPositions, bins);
        this.addImages(patterns, patternPositions, bins);

        var ref = potpack(bins);
        var w = ref.w;
        var h = ref.h;
        var image = new images.RGBAImage({width: w || 1, height: h || 1});

        for (var id in icons) {
            var src = icons[id];
            var bin = iconPositions[id].paddedRect;
            images.RGBAImage.copy(src.data, image, {x: 0, y: 0}, {
                x: bin.x + Constant.layout.padding,
                y: bin.y + Constant.layout.padding
            }, src.data);
        }

        for (var id$1 in patterns) {
            var src$1 = patterns[id$1];
            var bin$1 = patternPositions[id$1].paddedRect;
            var x = bin$1.x + Constant.layout.padding,
                y = bin$1.y + Constant.layout.padding,
                w$1 = src$1.data.width,
                h$1 = src$1.data.height;

            images.RGBAImage.copy(src$1.data, image, {x: 0, y: 0}, {x: x, y: y}, src$1.data);
            images.RGBAImage.copy(src$1.data, image, {x: 0, y: h$1 - 1}, {x: x, y: y - 1}, {width: w$1, height: 1}); // T
            images.RGBAImage.copy(src$1.data, image, {x: 0, y: 0}, {x: x, y: y + h$1}, {width: w$1, height: 1}); // B
            images.RGBAImage.copy(src$1.data, image, {x: w$1 - 1, y: 0}, {x: x - 1, y: y}, {width: 1, height: h$1}); // L
            images.RGBAImage.copy(src$1.data, image, {x: 0, y: 0}, {x: x + w$1, y: y}, {width: 1, height: h$1}); // R
        }

        this.image = image;
        this.iconPositions = iconPositions;
        this.patternPositions = patternPositions;
    };

    ImageAtlas.prototype.addImages = function addImages(images, positions, bins) {
        for (var id in images) {
            var src = images[id];
            var bin = {
                x: 0,
                y: 0,
                w: src.data.width + 2 * Constant.layout.padding,
                h: src.data.height + 2 * Constant.layout.padding
            };
            bins.push(bin);
            positions[id] = new ImagePosition(bin, src);

            if (src.hasRenderCallback) {
                this.haveRenderCallbacks.push(id);
            }
        }
    };

    ImageAtlas.prototype.patchUpdatedImages = function patchUpdatedImages(imageManager, texture) {
        imageManager.dispatchRenderCallbacks(this.haveRenderCallbacks);
        for (var name in imageManager.updatedImages) {
            this.patchUpdatedImage(this.iconPositions[name], imageManager.getImage(name), texture);
            this.patchUpdatedImage(this.patternPositions[name], imageManager.getImage(name), texture);
        }
    };

    ImageAtlas.prototype.patchUpdatedImage = function patchUpdatedImage(position, image, texture) {
        if (!position || !image) {
            return;
        }

        if (position.version === image.version) {
            return;
        }

        position.version = image.version;
        var ref = position.tl;
        var x = ref[0];
        var y = ref[1];
        texture.update(image.data, undefined, {x: x, y: y});
    };

    // dataTransfer.register('ImageAtlas', ImageAtlas);

    return ImageAtlas;
});