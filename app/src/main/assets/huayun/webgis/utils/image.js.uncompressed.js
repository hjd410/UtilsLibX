define("com/huayun/webgis/utils/image", [
    "exports"
], function (exports) {
    function createImage(image, ref, channels, data) {
        var width = ref.width;
        var height = ref.height;

        if (!data) {
            data = new Uint8Array(width * height * channels);
        } else if (data instanceof Uint8ClampedArray) {
            data = new Uint8Array(data.buffer);
        } else if (data.length !== width * height * channels) {
            throw new RangeError('mismatched image size');
        }
        image.width = width;
        image.height = height;
        image.data = data;
        return image;
    }

    function resizeImage(image, ref, channels) {
        var width = ref.width;
        var height = ref.height;

        if (width === image.width && height === image.height) {
            return;
        }

        var newImage = createImage({}, {width: width, height: height}, channels);

        copyImage(image, newImage, {x: 0, y: 0}, {x: 0, y: 0}, {
            width: Math.min(image.width, width),
            height: Math.min(image.height, height)
        }, channels);
        image.width = width;
        image.height = height;
        image.data = newImage.data;
    }

    function copyImage(srcImg, dstImg, srcPt, dstPt, size, channels) {
        if (size.width === 0 || size.height === 0) {
            return dstImg;
        }

        if (size.width > srcImg.width ||
            size.height > srcImg.height ||
            srcPt.x > srcImg.width - size.width ||
            srcPt.y > srcImg.height - size.height) {
            throw new RangeError('out of range source coordinates for image copy');
        }

        if (size.width > dstImg.width ||
            size.height > dstImg.height ||
            dstPt.x > dstImg.width - size.width ||
            dstPt.y > dstImg.height - size.height) {
            throw new RangeError('out of range destination coordinates for image copy');
        }

        var srcData = srcImg.data;
        var dstData = dstImg.data;

        for (var y = 0; y < size.height; y++) {
            var srcOffset = ((srcPt.y + y) * srcImg.width + srcPt.x) * channels;
            var dstOffset = ((dstPt.y + y) * dstImg.width + dstPt.x) * channels;
            for (var i = 0; i < size.width * channels; i++) {
                dstData[dstOffset + i] = srcData[srcOffset + i];
            }
        }

        return dstImg;
    }

    var AlphaImage = function AlphaImage(size, data) {
        createImage(this, size, 1, data);
    };

    AlphaImage.prototype.resize = function resize(size) {
        resizeImage(this, size, 1);
    };

    AlphaImage.prototype.clone = function clone() {
        return new AlphaImage({width: this.width, height: this.height}, new Uint8Array(this.data));
    };

    AlphaImage.copy = function copy(srcImg, dstImg, srcPt, dstPt, size) {
        copyImage(srcImg, dstImg, srcPt, dstPt, size, 1);
    };

    exports.AlphaImage = AlphaImage;

    var RGBAImage = function RGBAImage(size, data) {
        createImage(this, size, 4, data);
    };

    RGBAImage.prototype.resize = function resize(size) {
        resizeImage(this, size, 4);
    };

    RGBAImage.prototype.replace = function replace(data, copy) {
        if (copy) {
            this.data.set(data);
        } else if (data instanceof Uint8ClampedArray) {
            this.data = new Uint8Array(data.buffer);
        } else {
            this.data = data;
        }
    };

    RGBAImage.prototype.clone = function clone() {
        return new RGBAImage({width: this.width, height: this.height}, new Uint8Array(this.data));
    };

    RGBAImage.copy = function copy(srcImg, dstImg, srcPt, dstPt, size) {
        copyImage(srcImg, dstImg, srcPt, dstPt, size, 4);
    };

    exports.RGBAImage = RGBAImage;

    function renderColorRamp(expression, colorRampEvaluationParameter) {
        var colorRampData = new Uint8Array(256 * 4);
        var evaluationGlobals = {};
        for (var i = 0, j = 0; i < 256; i++, j += 4) {
            evaluationGlobals[colorRampEvaluationParameter] = i / 255;
            var pxColor = expression.evaluate(evaluationGlobals);
            colorRampData[j + 0] = Math.floor(pxColor.r * 255 / pxColor.a);
            colorRampData[j + 1] = Math.floor(pxColor.g * 255 / pxColor.a);
            colorRampData[j + 2] = Math.floor(pxColor.b * 255 / pxColor.a);
            colorRampData[j + 3] = Math.floor(pxColor.a * 255);
        }

        return new RGBAImage({width: 256, height: 1}, colorRampData);
    }

    exports.renderColorRamp = renderColorRamp;
});