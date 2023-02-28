define("com/huayun/webgis/gl/Texture", [], function () {
    var Texture = function Texture(context, image, format, options) {
        this.context = context;
        this.format = format;
        this.texture = context.gl.createTexture();
        this.update(image, options);
    };

    Texture.prototype.update = function update(image, options, position) {
        var width = image.width;
        var height = image.height;
        var resize = (!this.size || this.size[0] !== width || this.size[1] !== height) && !position;
        var ref = this;
        var context = ref.context;
        var gl = context.gl;

        this.useMipmap = Boolean(options && options.useMipmap);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        context.pixelStoreUnpackFlipY.set(false);
        context.pixelStoreUnpack.set(1);
        context.pixelStoreUnpackPremultiplyAlpha.set(this.format === gl.RGBA && (!options || options.premultiply !== false));

        if (resize) {
            this.size = [width, height];
            if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement || image instanceof HTMLVideoElement || image instanceof ImageData) {
                gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.format, gl.UNSIGNED_BYTE, image);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, gl.UNSIGNED_BYTE, image.data);
            }
        } else {
            var ref$1 = position || {x: 0, y: 0};
            var x = ref$1.x;
            var y = ref$1.y;
            if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement || image instanceof HTMLVideoElement || image instanceof ImageData) {
                gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, gl.RGBA, gl.UNSIGNED_BYTE, image);
            } else {
                gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
            }
        }
        if (this.useMipmap && this.isSizePowerOfTwo()) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    };

    Texture.prototype.bind = function bind(filter, wrap, minFilter) {
        var ref = this;
        var context = ref.context;
        var gl = context.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        if (minFilter === gl.LINEAR_MIPMAP_NEAREST && !this.isSizePowerOfTwo()) {
            minFilter = gl.LINEAR;
        }
        if (filter !== this.filter) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter || filter);
            this.filter = filter;
        }
        if (wrap !== this.wrap) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
            this.wrap = wrap;
        }
    };

    Texture.prototype.isSizePowerOfTwo = function isSizePowerOfTwo() {
        return this.size[0] === this.size[1] && (Math.log(this.size[0]) / Math.LN2) % 1 === 0;
    };

    Texture.prototype.destroy = function destroy() {
        var ref = this.context;
        var gl = ref.gl;
        gl.deleteTexture(this.texture);
        this.texture = (null);
    };

    return Texture;
});