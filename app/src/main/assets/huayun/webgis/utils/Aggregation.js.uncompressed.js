define("com/huayun/webgis/utils/Aggregation", [
    "../geometry/Point",
    "custom/kdbush.min"
], function (Point, KDBush) {
    function Aggregation(data) {
        this.data = data;
        this.index = new KDBush(data, function (p) {
            return p["point_x"]
        }, function (p) {
            return p["point_y"]
        });
    }

    Aggregation.prototype.filter = function(view, extent, col, row) {
        var self = this;
        var targetData = this.index.range(extent.xmin, extent.ymin, extent.xmax, extent.ymax).map(function (id) {
            return self.data[id];
        });

        var colr = view.width / col,
            rowr = view.height / row,
            level = view.targetZoom || view.level,
            tileInfo = view.viewpoint.tileInfo;
        if (!tileInfo) {
            return null;
        }
        var resolution = tileInfo.getResolution(level);
        /*var xw = extent.xmax - extent.xmin,
            yh = extent.ymax - extent.ymin;
        console.log(xw / resolution, yh / resolution);*/
        var result = [];
        for (var i = 0; i < row+1; i++) {
            result[i] = [];
            for (var j = 0; j < col+1; j++) {
                result[i][j] = {
                    value: 0,
                    x: 0,
                    y: 0,
                    len: 0,
                    list: []
                };
            }
        }
        targetData.forEach(function (item) {
            var x = item.point_x,
                y = item.point_y;
            var deltaX = x - extent.xmin,
                deltaY = y - extent.ymin;
            var colIndex = Math.floor(deltaX / resolution / colr),
                rowIndex = Math.floor(deltaY / resolution / rowr);
            result[rowIndex][colIndex].value += item.value;
            result[rowIndex][colIndex].x += x;
            result[rowIndex][colIndex].y += y;
            result[rowIndex][colIndex].len += 1;
            result[rowIndex][colIndex].list.push(item);
        });
        for (i = 0; i < row; i++) {
            for (j = 0; j < col; j++) {
                if (result[i][j].value > 0) {
                    var len = result[i][j].len;
                    result[i][j].position = new Point(result[i][j].x/len, result[i][j].y/len);
                }
            }
        }

        return result;
    }

    return Aggregation;
})