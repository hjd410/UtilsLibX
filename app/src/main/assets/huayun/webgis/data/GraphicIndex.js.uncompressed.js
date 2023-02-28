define("com/huayun/webgis/data/GraphicIndex", [
    "custom/rbush",
    "./queryIntersects",
    "./queryIntersectsEx",
    "./captureIntersects"
], function (rbush, queryIntersects, queryIntersectsEx, captureIntersects) {

    function getBounds(geometry) {
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        for (var i = 0, list = geometry; i < list.length; i += 1) {
            var p = list[i];
            if(p.type === "point"){
                minX = Math.min(minX, p.x);
                minY = Math.min(minY, p.y);
                maxX = Math.max(maxX, p.x);
                maxY = Math.max(maxY, p.y);
            } else if(p.type === "polygon") {
                for (var j = 0, point = p.path[0]; j < point.length; j++) {
                    minX = Math.min(minX, point[j].x);
                    minY = Math.min(minY, point[j].y);
                    maxX = Math.max(maxX, point[j].x);
                    maxY = Math.max(maxY, point[j].y);  
                }
            }
        }
        return {minx: minX, miny: minY, maxx: maxX, maxy: maxY};
    }

    var GraphicIndex = function () {
        this.tree = new rbush;
    };

    GraphicIndex.prototype.insert = function (geometry, graphicId) {
        var items = [];
        for (var i = 0; i < geometry.length; i++) {
            var ring = geometry[i];
            var bbox = [Infinity, Infinity, -Infinity, -Infinity];
            for (var j = 0; j < ring.length; j++) {
                var p = ring[j];
                bbox[0] = Math.min(bbox[0], p.x);
                bbox[1] = Math.min(bbox[1], p.y);
                bbox[2] = Math.max(bbox[2], p.x);
                bbox[3] = Math.max(bbox[3], p.y);
            }
            items.push({
                minX: bbox[0],
                minY: bbox[1],
                maxX: bbox[2],
                maxY: bbox[3],
                id: graphicId
            });
        }
        this.tree.load(items);
    };

    GraphicIndex.prototype.insertMsc = function (geometry, graphicId) {
        var items = [];
        for (var i = 0; i < geometry.length; i++) {
            var ring = geometry[i];
            var bbox = [Infinity, Infinity, -Infinity, -Infinity];
            for (var j = 0; j < ring.length; j++) {
                var p = ring[j];
                bbox[0] = Math.min(bbox[0], p.x);
                bbox[1] = Math.min(bbox[1], p.y);
                bbox[2] = Math.max(bbox[2], p.x);
                bbox[3] = Math.max(bbox[3], p.y);
            }
            items.push({
                minX: bbox[0],
                minY: bbox[1],
                maxX: bbox[2],
                maxY: bbox[3],
                id: graphicId
            });
        }
        this.tree.load(items);
    };

    GraphicIndex.prototype.query = function (geometry, queryPadding, graphics, resolution, viewpoint) {
        var bounds = getBounds(geometry);
        var matching = this.tree.search({
            minX: bounds.minx - queryPadding * resolution,
            minY: bounds.miny - queryPadding * resolution,
            maxX: bounds.maxx + queryPadding * resolution,
            maxY: bounds.maxy + queryPadding * resolution
        });
        var g;
        var result = [];
        for (var i = 0; i < matching.length; i++) {
            for (var j = 0; j < graphics.length; j++) {
                if (matching[i].id === graphics[j].id) {
                    g = graphics[j];
                    if (g.feature.geometry.type === "multipoint") {
                        for (var k = 0, kk = g.feature.geometry.points.length; k < kk ; k++) {
                            var p = g.feature.geometry.points[k];
                            if (queryIntersects[g.symbol.type](geometry, p, g.symbol, resolution, g.feature.geometry.radius, viewpoint)) {
                                result.push(g);
                                break;
                            }
                        }
                    } else {
                        if (queryIntersects[g.symbol.type](geometry, g.feature.geometry, g.symbol, resolution, g.feature.geometry.radius, viewpoint)) {
                            result.push(g);
                        }
                    }
                }
            }
        }
        return result;
    };

    GraphicIndex.prototype.roughQuery = function (geometry, queryPadding, graphics, resolution, viewpoint) {
        var bounds = getBounds(geometry);
        var matching = this.tree.search({
            minX: bounds.minx - queryPadding * resolution,
            minY: bounds.miny - queryPadding * resolution,
            maxX: bounds.maxx + queryPadding * resolution,
            maxY: bounds.maxy + queryPadding * resolution
        });
        var g;
        var result = [];
        for (var i = 0; i < matching.length; i++) {
            for (var j = 0; j < graphics.length; j++) {
                if (matching[i].id === graphics[j].id) {
                    g = graphics[j];
                    result.push(g);
                }
            }
        }
        return result;
    };

    GraphicIndex.prototype.captureQuery = function (geometry, queryPadding, graphics, resolution, viewpoint) {
        var bounds = getBounds(geometry);
        var matching = this.tree.search({
            minX: bounds.minx - queryPadding * resolution,
            minY: bounds.miny - queryPadding * resolution,
            maxX: bounds.maxx + queryPadding * resolution,
            maxY: bounds.maxy + queryPadding * resolution
        });
        var g;
        var result = [];
        for (var i = 0; i < matching.length; i++) {
            for (var j = 0; j < graphics.length; j++) {
                if (matching[i].id === graphics[j].id) {
                    g = graphics[j];
                    if (captureIntersects[g.symbol.type](geometry, g.feature.geometry, g.symbol, resolution, g.feature.geometry.radius, viewpoint, queryPadding)) {
                        result.push(g);
                    }
                }
            }
        }
        return result;
    };

    GraphicIndex.prototype.queryMsc = function (geometry, queryPadding, resolution, viewpoint) {
        var bounds = getBounds(geometry);
        var matching = this.tree.search({
            minX: bounds.minx - queryPadding * resolution,
            minY: bounds.miny - queryPadding * resolution,
            maxX: bounds.maxx + queryPadding * resolution,
            maxY: bounds.maxy + queryPadding * resolution
        });
        var g;
        var result = [];
        var symbol = {
            width: 5
        };
        var type;
        for (var i = 0; i < matching.length; i++) {
            g = matching[i];
            type = g.id.feature.type + "ex";
            if (result.indexOf(g.id) === -1 && queryIntersectsEx[type](geometry, g.id.geometry, symbol, resolution, 5, viewpoint)) {
                result.push(g.id);
            }
        }
        return result;
    };

    GraphicIndex.prototype.queryRender = function (geometry, queryPadding, graphics, resolution, viewpoint) {
        var bounds = getBounds(geometry);
        var matching = this.tree.search({
            minX: bounds.minx - queryPadding * resolution,
            minY: bounds.miny - queryPadding * resolution,
            maxX: bounds.maxx + queryPadding * resolution,
            maxY: bounds.maxy + queryPadding * resolution
        });
        var g;
        var result = [];
        for (var i = 0; i < matching.length; i++) {
            for (var j = 0; j < graphics.length; j++) {
                if (matching[i].id === graphics[j].id) {
                    g = graphics[j];
                    if (g.visible && queryIntersects[g.symbol.type](geometry, g.feature.geometry, g.symbol, resolution, g.feature.geometry.radius, viewpoint)) {
                        result.push(g);
                    }
                }
            }
        }
        return result;
    };

    GraphicIndex.prototype.clear = function () {
        this.tree.clear();
    };

    return GraphicIndex;
});
