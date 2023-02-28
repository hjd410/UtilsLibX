/**
 *  @author :   wushengfei
 *  @date   :   2019/7/24
 *  @description : OK
 */
define("com/huayun/webgis/data/bucket/PointsBucket", [
    "../ArrayType"
], function (ArrayType) {

    function addCircleVertex(layoutVertexArray, x, y) {
        layoutVertexArray.emplaceBack(x, y);
    }

    var PointsBucket = function PointsBucket(options) {
        this.layoutVertexArray = new ArrayType.StructArrayLayout2f8();
        this.length = 0;
    };

    PointsBucket.prototype.destroy = function destroy() {
        if (!this.layoutVertexBuffer) {
            return;
        }
        this.layoutVertexBuffer.destroy();
    };

    PointsBucket.prototype.addFeature = function addFeature(geometry) {
        this.length = 0;
        for (var i$1 = 0, list$1 = geometry; i$1 < list$1.length; i$1 += 1) {
            var ring = list$1[i$1];
            for (var i = 0, list = ring; i < list.length; i += 1) {
                var point = list[i];
                var x = point.x;
                var y = point.y;
                addCircleVertex(this.layoutVertexArray, x, y);
                this.length++;
            }
        }
    };

    PointsBucket.prototype.upload = function upload(context) {
        this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, [
            {name: "a_pos", type: "Float32", components: 2, offset: 0}
        ]);
    };
    return PointsBucket;
});