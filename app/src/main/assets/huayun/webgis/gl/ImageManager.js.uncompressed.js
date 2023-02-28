define("com/huayun/webgis/gl/ImageManager", [
    "./ImagePosition",
    "./Texture",
    "./potpack",
    "../utils/image"
], function (ImagePosition, Texture, potpack, image) {
    var padding = 1;

    function renderStyleImage(image            ) {
        var userImage = image.userImage;
        if (userImage && userImage.render) {
            var updated = userImage.render();
            if (updated) {
                image.data.replace(new Uint8Array(userImage.data.buffer));
                return true;
            }
        }
        return false;
    }

    function ImageManager() {
        this.images = {};
        this.updatedImages = {};
        this.callbackDispatchedThisFrame = {};
        this.loaded = false;
        this.requestors = [];

        this.patterns = {};
        this.atlasImage = new image.RGBAImage({width: 1, height: 1});
        this.dirty = true;
    }

    ImageManager.prototype.isLoaded = function isLoaded() {
        return this.loaded;
    };

    ImageManager.prototype.setLoaded = function setLoaded(loaded) {
        if (this.loaded === loaded) {
            return;
        }
        this.loaded = loaded;
        if (loaded) {
            for (var i = 0, list = this.requestors; i < list.length; i += 1) {
                var ref = list[i];
                var ids = ref.ids;
                var callback = ref.callback;
                this._notify(ids, callback);
            }
            this.requestors = [];
        }
    };

    ImageManager.prototype.getImage = function getImage(id) {
        return this.images[id];
    };

    ImageManager.prototype.addImage = function addImage(id, image) {
        this.images[id] = image;
    };

    ImageManager.prototype.updateImage = function updateImage(id, image) {
        var oldImage = this.images[id];
        image.version = oldImage.version + 1;
        this.images[id] = image;
        this.updatedImages[id] = true;
    };

    ImageManager.prototype.removeImage = function removeImage(id) {
        var image = this.images[id];
        delete this.images[id];
        delete this.patterns[id];
        if (image.userImage && image.userImage.onRemove) {
            image.userImage.onRemove();
        }
    };

    ImageManager.prototype.listImages = function listImages() {
        return Object.keys(this.images);
    };

    ImageManager.prototype.getImages = function getImages(ids, callback) {
        var hasAllDependencies = true;
        if (!this.isLoaded()) {
            for (var i = 0, list = ids; i < list.length; i += 1) {
                var id = list[i];

                if (!this.images[id]) {
                    hasAllDependencies = false;
                }
            }
        }
        if (this.isLoaded() || hasAllDependencies) {
            this._notify(ids, callback);
        } else {
            this.requestors.push({ids: ids, callback: callback});
        }
    };

    ImageManager.prototype._notify = function _notify(ids, callback) {
        var response = {};

        for (var i = 0, list = ids; i < list.length; i += 1) {
            var id = list[i];
            var image = this.images[id];
            if (image) {
                response[id] = {
                    data: image.data.clone(),
                    pixelRatio: image.pixelRatio,
                    sdf: image.sdf,
                    version: image.version,
                    hasRenderCallback: Boolean(image.userImage && image.userImage.render)
                };
            }
        }
        callback(null, response);
    };

    ImageManager.prototype.getPixelSize = function getPixelSize() {
        var ref = this.atlasImage;
        var width = ref.width;
        var height = ref.height;
        return {width: width, height: height};
    };

    ImageManager.prototype.getPattern = function getPattern(id) {
        var pattern = this.patterns[id];

        var image = this.getImage(id);
        if (!image) {
            return null;
        }

        if (pattern && pattern.position.version === image.version) {
            return pattern.position;
        }

        if (!pattern) {
            var w = image.data.width + padding * 2;
            var h = image.data.height + padding * 2;
            var bin = {w: w, h: h, x: 0, y: 0};
            var position = new ImagePosition(bin, image);
            this.patterns[id] = {bin: bin, position: position};
        } else {
            pattern.position.version = image.version;
        }

        this._updatePatternAtlas();

        return this.patterns[id].position;
    };

    ImageManager.prototype.bind = function bind(context) {
        var gl = context.gl;
        if (!this.atlasTexture) {
            this.atlasTexture = new Texture(context, this.atlasImage, gl.RGBA);
        } else if (this.dirty) {
            this.atlasTexture.update(this.atlasImage);
            this.dirty = false;
        }
        this.atlasTexture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
    };

    ImageManager.prototype._updatePatternAtlas = function _updatePatternAtlas() {
        var bins = [];
        for (var id in this.patterns) {
            bins.push(this.patterns[id].bin);
        }

        var ref = potpack(bins);
        var w = ref.w;
        var h = ref.h;

        var dst = this.atlasImage;
        dst.resize({width: w || 1, height: h || 1});

        for (var id$1 in this.patterns) {
            var ref$1 = this.patterns[id$1];
            var bin = ref$1.bin;
            var x = bin.x + padding;
            var y = bin.y + padding;
            var src = this.images[id$1].data;
            var w$1 = src.width;
            var h$1 = src.height;

            image.RGBAImage.copy(src, dst, {x: 0, y: 0}, {x: x, y: y}, {width: w$1, height: h$1});
            image.RGBAImage.copy(src, dst, {x: 0, y: h$1 - 1}, {x: x, y: y - 1}, {width: w$1, height: 1}); // T
            image.RGBAImage.copy(src, dst, {x: 0, y: 0}, {x: x, y: y + h$1}, {width: w$1, height: 1}); // B
            image.RGBAImage.copy(src, dst, {x: w$1 - 1, y: 0}, {x: x - 1, y: y}, {width: 1, height: h$1}); // L
            image.RGBAImage.copy(src, dst, {x: 0, y: 0}, {x: x + w$1, y: y}, {width: 1, height: h$1}); // R
        }
        this.dirty = true;
    };
    ImageManager.prototype.beginFrame = function beginFrame() {
        this.callbackDispatchedThisFrame = {};
    };
    ImageManager.prototype.dispatchRenderCallbacks = function dispatchRenderCallbacks(ids) {
        for (var i = 0, list = ids; i < list.length; i += 1) {
            var id = list[i];
            if (this.callbackDispatchedThisFrame[id]) {
                continue;
            }
            this.callbackDispatchedThisFrame[id] = true;

            var image = this.images[id];
            var updated = renderStyleImage(image);
            if (updated) {
                this.updateImage(id, image);
            }
        }
    };

    return ImageManager;
});