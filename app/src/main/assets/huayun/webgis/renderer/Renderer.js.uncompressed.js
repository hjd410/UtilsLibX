define("com/huayun/webgis/renderer/Renderer", [], function () {
    function Renderer() {
    }

    Renderer.prototype.getRealScale = function (fixed, scale, minScale) {
        var realScale = 1;
        if (fixed.isFixed || minScale === 0) {
            return realScale;
        }
        if (fixed.addratio === 0) {
            return scale / minScale;
        } else if (fixed.addratio > 0) {
            return (1 + (scale / minScale) * fixed.addratio);
        }
    };

    Renderer.prototype.calculateExtent = function () {};

    return Renderer;
});
