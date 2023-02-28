define("com/huayun/webgis/symbols/support/lineDashTexture", [
    "exports",
    "../../gl/LineAtlas"
], function (exports, LineAtlas) {
    var lineAtlas = new LineAtlas(256, 256);
    // console.log("lineAtlas");
    exports.lineAtlas = lineAtlas;
});