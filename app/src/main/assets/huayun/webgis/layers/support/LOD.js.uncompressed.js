/**
 * LOD类
 */
define("com/huayun/webgis/layers/support/LOD", [], function () {
    /**
     * @ignore
     * @param params
     * @alias com.huayun.webgis.layer.support.LOD
     * @constructor
     */
    function LOD(params) {
        this.level = params.level;
        this.scale = params.scale;
        this.resolution = params.resolution;
    }

    LOD.prototype.toString = function () {
        return "level: " + this.level + " scale: " + this.scale + " resolution: " + this.resolution;
    }

    return LOD;
});