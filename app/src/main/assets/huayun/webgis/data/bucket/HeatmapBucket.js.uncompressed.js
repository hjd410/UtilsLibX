/**
 *  @author :   wushengfei
 *  @date   :   2019/7/24
 *  @description : OK
 */
define("com/huayun/webgis/data/bucket/HeatmapBucket", [
    "./CircleBucket",
    "../../gl/dataTransfer"
], function (CircleBucket, dataTransfer) {
    var HeatmapBucket = (function (CircleBucket) {
        function HeatmapBucket() {
            CircleBucket.apply(this, arguments);
        }

        if (CircleBucket) HeatmapBucket.__proto__ = CircleBucket;
        HeatmapBucket.prototype = Object.create(CircleBucket && CircleBucket.prototype);
        HeatmapBucket.prototype.constructor = HeatmapBucket;
        return HeatmapBucket;
    }(CircleBucket));

    dataTransfer.register('HeatmapBucket', HeatmapBucket, {omit: ['layers']});

    return HeatmapBucket;
});