define("com/huayun/webgis/data/GraphicsIndex", [
    "custom/rbush"
], function (Rbush) {

    function getBounds(geometry) {
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        for (var i = 0, list = geometry; i < list.length; i += 1) {
            var p = list[i];
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }
        return {minx: minX, miny: minY, maxx: maxX, maxy: maxY};
    }

    function GraphicsIndex() {
        this.tree = new Rbush();
    }

    GraphicsIndex.prototype.load = function (indexs) {
        this.tree.load(indexs);
    };

    GraphicsIndex.prototype.insert = function(index) {
        this.tree.insert(index);
    };

    GraphicsIndex.prototype.query = function (geometry, queryPadding, resolution) {
        var bounds = getBounds(geometry);
        var extent = {
            minX: bounds.minx - queryPadding * resolution,
            minY: bounds.miny - queryPadding * resolution,
            maxX: bounds.maxx + queryPadding * resolution,
            maxY: bounds.maxy + queryPadding * resolution
        };
        var matching = this.tree.search(extent);
        return matching;
    };

    GraphicsIndex.prototype.checkExtentState = function(xmin, ymin, xmax, ymax) {
        var extent = {
            minX: xmin,
            minY: ymin,
            maxX: xmax,
            maxY: ymax
        };
        var matching = this.tree.search(extent);
        return matching;
    };

    GraphicsIndex.prototype.clear = function () {
        this.tree.clear();
    };

    return GraphicsIndex;
});
