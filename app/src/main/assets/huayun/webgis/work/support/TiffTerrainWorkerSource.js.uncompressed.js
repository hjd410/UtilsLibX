define("com/huayun/webgis/work/support/TiffTerrainWorkerSource", [
    "../../utils/Resource",
    "../../layers/support/terrainUtils"
], function (Resource, terrainUtils) {

    /*var vertices = new ArrayType.StructArrayLayout3f12();
    var indices = new ArrayType.StructArrayLayout3ui6();
    vertices.emplaceBack(0, 0, 0);
    vertices.emplaceBack(1, 0, 0);
    vertices.emplaceBack(0, 1, 0);
    vertices.emplaceBack(1, 1, 0);

    indices.emplaceBack(0, 1, 2);
    indices.emplaceBack(2, 1, 3);

    var segments = SegmentVector.simpleSegment(0, 0, 4, 2);
    var defaultTerrain = {
        vertices: vertices,
        indices: indices,
        segments: segments,
        maxH: 0,
        minH: 0
    };*/

    var TiffTerrainWorkerSource = function TiffTerrainWorkerSource(actor, layerIndex) {
        this.actor = actor;
        this.loading = {};
        this.loaded = {};
    };

    TiffTerrainWorkerSource.prototype.loadTerrain = function loadTerrain(params, callback) {
        // var this$1 = this;
        // var uid = params.uid;
        var r = Resource.loadArrayBuffer(params.url, function (err, buffer) {
            if (err) { // 发生错误
                callback(err);
            } else if (buffer) {
                var terrainData = terrainUtils.createHyTerrainData(buffer, params.rectangle, params.resolution);
                callback(null, terrainData);
            }
        });
        return function () {
            r.cancel();
            callback();
        };
        /*var verticesIndices = groundData.createTerrainVertice(params.rectangle, params.resolution);
        var bucket = {
            layoutVertexArray: verticesIndices.vertices,
            indexArray: verticesIndices.indices,
            segments: verticesIndices.segments
        };
        callback(null, {
            bucket: bucket,
            minimumHeight: verticesIndices.minH,
            maximumHeight: verticesIndices.maxH
        });*/
    };

    TiffTerrainWorkerSource.prototype.reloadTile = function reloadTile(params, callback) {
        var loaded = this.loaded,
            uid = params.uid,
            vtSource = this;
        if (loaded && loaded[uid]) {
            var workerTile = loaded[uid];
            workerTile.showCollisionBoxes = params.showCollisionBoxes;

            var done = function (err, data) {
                var reloadCallback = workerTile.reloadCallback;
                if (reloadCallback) {
                    delete workerTile.reloadCallback;
                    workerTile.parse(workerTile.vectorTile, vtSource.layerIndex, vtSource.actor, reloadCallback);
                }
                callback(err, data);
            };

            if (workerTile.status === 'parsing') {
                workerTile.reloadCallback = done;
            } else if (workerTile.status === 'done') {
                // if there was no vector tile data on the initial load, don't try and re-parse tile
                if (workerTile.vectorTile) {
                    workerTile.parse(workerTile.vectorTile, this.layerIndex, this.actor, done);
                } else {
                    done();
                }
            }
        }
    };

    TiffTerrainWorkerSource.prototype.abortTile = function abortTile(params, callback) {
        var loading = this.loading,
            uid = params.uid;
        if (loading && loading[uid] && loading[uid].abort) {
            loading[uid].abort();
            delete loading[uid];
        }
        callback();
    };

    TiffTerrainWorkerSource.prototype.removeTile = function removeTile(params, callback) {
        var loaded = this.loaded,
            uid = params.uid;
        if (loaded && loaded[uid]) {
            delete loaded[uid];
        }
        callback();
    };

    return TiffTerrainWorkerSource;
});