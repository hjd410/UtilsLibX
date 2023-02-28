define("com/huayun/webgis/data/commonVBO", [
  "exports",
  "com/huayun/webgis/gl/SegmentVector",
  "com/huayun/webgis/data/ArrayType"
], function (exports, SegmentVector, ArrayType) {
  var NUM_SEGMENTS = 50;
  var rasterBoundsArray = new ArrayType.StructArrayLayout3f12();
  for (var i = 0; i < NUM_SEGMENTS; i++) {
    rasterBoundsArray.emplaceBack(i, -1, 0);
    rasterBoundsArray.emplaceBack(i, 1, 0);
  }

  exports.arcVBO = {
    layoutVertexArray: [
      {name: "a_pos", type: "Float32", components: 3, offset: 0}
    ],
    segments: SegmentVector.simpleSegment(0, 0, 100, 2)
  }
});