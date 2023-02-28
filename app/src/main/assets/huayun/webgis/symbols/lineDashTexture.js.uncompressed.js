define("com/huayun/webgis/symbols/lineDashTexture", [
    "exports",
    "../gl/LineAtlas"
], function (exports, LineAtlas) {
    var lineAtlas = new LineAtlas(256, 256);
    var texture = new THREE.DataTexture(lineAtlas.data, lineAtlas.width, lineAtlas.height, THREE.RGBAFormat);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    console.log("lineAtlas");
    exports.lineAtlas = lineAtlas;
    exports.texture = texture;
});