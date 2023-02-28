define("com/huayun/webgis/layers/support/TileHandler", [
    "exports",
    "require"
], function (exports, require) {
    var tileQueue = {};
    var workerPool = [];
    var w;
    var views = [];
    for (var i = 0; i < 4; i++) {
        w = new Worker(require.toUrl("com/huayun/webgis/work/webworker.js"));
        w.onmessage = function (evt) {
            var data = evt.data,
                tile = tileQueue[data.url];
            if (tile) {
                tile.data = data;
                tile.load = true;
                if (tile.render) {
                    views.forEach(function (item) {
                        item._renderWorker(data);
                    });
                }
            }
        };
        workerPool.push(w)
    }

    exports.getTile = function (url) {
        var tile = tileQueue[url];
        tile.render = true;
        if (tile.load) {
            return tile;
        }
    };

    exports.removeTile = function(url) {
        delete tileQueue[url];
    };

    exports.requestTile = function(url, level, col, row){
        if (!tileQueue.hasOwnProperty(url)) {
            var worker = (level + col + row)%4;
            worker = workerPool[worker];
            worker.postMessage({
                type: "getTile",
                data: url,
                level: level,
                col: col,
                row: row
            });
            tileQueue[url] = {
                load: false,
                render: false
            }
        }
    };

    exports.getAll = function () {
        return tileQueue;
    };

    exports.addView = function (view) {
        views.push(view)
    };

    exports.send = function (type, data) {
        for (var i = 0; i < 4; i++) {
            workerPool[i].postMessage({
                type: type,
                data: JSON.stringify(data.layerFamily)
            })
        }
    }
});