define("com/huayun/webgis/data/utils", [
    "exports"
], function (exports) {
    function addLineVertex(layoutVertexBuffer, point, extrude, round, up, dir, linesofar) {
        layoutVertexBuffer.emplaceBack(
            (point.x << 1) + (round ? 1 : 0),
            (point.y << 1) + (up ? 1 : 0),// a_pos_normal
            Math.round(EXTRUDE_SCALE * extrude.x) + 128,
            Math.round(EXTRUDE_SCALE * extrude.y) + 128,// a_data
            ((dir === 0 ? 0 : (dir < 0 ? -1 : 1)) + 1) | (((linesofar * LINE_DISTANCE_SCALE) & 0x3F) << 2),
            (linesofar * LINE_DISTANCE_SCALE) >> 6);
    }

    exports.addLineVertex = addLineVertex;
});