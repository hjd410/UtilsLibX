define("com/huayun/webgis/gl/ImagePosition", [], function () {
    var padding = 1;

    var ImagePosition = function ImagePosition(paddedRect, ref) {
        var pixelRatio = ref.pixelRatio;
        var version = ref.version;
        this.paddedRect = paddedRect;
        this.pixelRatio = pixelRatio;
        this.version = version;
    };

    var prototypeAccessors = {
        tl: {configurable: true},
        br: {configurable: true},
        tlbr: {configurable: true},
        displaySize: {configurable: true}
    };

    prototypeAccessors.tl.get = function () {
        return [
            this.paddedRect.x + padding,
            this.paddedRect.y + padding
        ];
    };

    prototypeAccessors.br.get = function () {
        return [
            this.paddedRect.x + this.paddedRect.w - padding,
            this.paddedRect.y + this.paddedRect.h - padding
        ];
    };

    prototypeAccessors.tlbr.get = function () {
        return this.tl.concat(this.br);
    };

    prototypeAccessors.displaySize.get = function () {
        return [
            (this.paddedRect.w - padding * 2) / this.pixelRatio,
            (this.paddedRect.h - padding * 2) / this.pixelRatio
        ];
    };

    Object.defineProperties(ImagePosition.prototype, prototypeAccessors);

    return ImagePosition;
});