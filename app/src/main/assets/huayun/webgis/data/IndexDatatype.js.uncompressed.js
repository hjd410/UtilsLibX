define("com/huayun/webgis/data/IndexDatatype", [
    "exports"
], function (exports) {
    var SIXTY_FOUR_KILOBYTES = 64 * 1024;
    exports.createTypedArray = function(numberOfVertices, indicesLengthOrArray) {
        if (numberOfVertices >= SIXTY_FOUR_KILOBYTES) {
            return new Uint32Array(indicesLengthOrArray);
        }

        return new Uint16Array(indicesLengthOrArray);
    };
})