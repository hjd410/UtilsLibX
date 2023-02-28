define("com/huayun/webgis/utils/classifyRings", [
    "./utils",
    "./quickselect"
], function (utils, quickselect) {
    function compareAreas(a, b) {
        return b.area - a.area;
    }

    function classifyRings(rings, maxRings) {
        var len = rings.length;
        if (len <= 1) {
            return [rings];
        }

        var polygons = [];
        var polygon, ccw;
        for (var i = 0; i < len; i++) {
            var area = utils.calculateSignedArea(rings[i]);
            if (area === 0) {
                continue;
            }
            rings[i].area = Math.abs(area);
            if (ccw === undefined) {
                ccw = area < 0;
            }
            if (ccw === area < 0) {
                if (polygon) {
                    polygons.push(polygon);
                }
                polygon = [rings[i]];
            } else {
                polygon.push(rings[i]);
            }
        }
        if (polygon) {
            polygons.push(polygon);
        }
        if (maxRings > 1) {
            for (var j = 0; j < polygons.length; j++) {
                if (polygons[j].length <= maxRings) {
                    continue;
                }
                quickselect(polygons[j], maxRings, 1, polygons[j].length - 1, compareAreas);
                polygons[j] = polygons[j].slice(0, maxRings);
            }
        }
        return polygons;
    }

    return classifyRings;
})