define("com/huayun/webgis/data/FeaturePositionMap", [
    "../utils/utils"
], function (utils) {
    var FeaturePositionMap = function FeaturePositionMap() {
        this.ids = [];
        this.positions = [];
        this.indexed = false;
    };

    FeaturePositionMap.prototype.add = function add(id, index, start, end) {
        this.ids.push(id);
        this.positions.push(index, start, end);
    };

    FeaturePositionMap.prototype.getPositions = function getPositions(id) {
        var i = 0;
        var j = this.ids.length - 1;
        while (i < j) {
            var m = (i + j) >> 1;
            if (this.ids[m] >= id) {
                j = m;
            } else {
                i = m + 1;
            }
        }
        var positions = [];
        while (this.ids[i] === id) {
            var index = this.positions[3 * i];
            var start = this.positions[3 * i + 1];
            var end = this.positions[3 * i + 2];
            positions.push({index: index, start: start, end: end});
            i++;
        }
        return positions;
    };

    FeaturePositionMap.serialize = function serialize(map, transferables) {
        var ids = new Float64Array(map.ids);
        var positions = new Uint32Array(map.positions);
        utils.sort(ids, positions, 0, ids.length - 1);
        transferables.push(ids.buffer, positions.buffer);
        return {ids: ids, positions: positions};
    };

    FeaturePositionMap.deserialize = function deserialize(obj) {
        var map = new FeaturePositionMap();
        map.ids = (obj.ids);
        map.positions = (obj.positions);
        map.indexed = true;
        return map;
    };

    return FeaturePositionMap;
});