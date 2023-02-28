define("com/huayun/webgis/geometry/queryVectorFeatures", [
    "exports",
    "../utils/utils"
], function (exports, utils) {

    function mergeRenderedFeatureLayers(tiles) {
        var result = {};
        var wrappedIDLayerMap = {};
        for (var i$1 = 0, list$1 = tiles; i$1 < list$1.length; i$1 += 1) {
            var tile = list$1[i$1];

            var queryResults = tile.queryResults;
            var wrappedID = tile.wrappedTileID;
            var wrappedIDLayers = wrappedIDLayerMap[wrappedID] = wrappedIDLayerMap[wrappedID] || {};
            for (var layerID in queryResults) {
                var tileFeatures = queryResults[layerID];
                var wrappedIDFeatures = wrappedIDLayers[layerID] = wrappedIDLayers[layerID] || {};
                var resultFeatures = result[layerID] = result[layerID] || [];
                for (var i = 0, list = tileFeatures; i < list.length; i += 1) {
                    var tileFeature = list[i];

                    if (!wrappedIDFeatures[tileFeature.featureIndex]) {
                        wrappedIDFeatures[tileFeature.featureIndex] = true;
                        resultFeatures.push(tileFeature);
                    }
                }
            }
        }
        return result;
    }

    function queryRenderedFeatures(sourceCache, styleLayers, queryGeometry, params, transform, has3DLayer,resolution, zoom) {
        var maxPitchScaleFactor = transform.maxPitchScaleFactor();
        var tilesIn = sourceCache.tilesIn(queryGeometry, maxPitchScaleFactor, has3DLayer, resolution, zoom);

        // tilesIn.sort(sortTilesIn);


        var renderedFeatureLayers = [];
        for (var i = 0, list = tilesIn; i < list.length; i += 1) {
            var tileIn = list[i];

            renderedFeatureLayers.push({
                wrappedTileID: tileIn.tileID.wrapped().key,
                queryResults: tileIn.tile.queryRenderedFeatures(
                    styleLayers,
                    sourceCache._state,
                    tileIn.queryGeometry,
                    tileIn.cameraQueryGeometry,
                    tileIn.scale,
                    params,
                    transform,
                    maxPitchScaleFactor,
                    utils.getPixelPosMatrix(sourceCache.transform, tileIn.tileID))
            });
        }

        var result = mergeRenderedFeatureLayers(renderedFeatureLayers);

        // Merge state from SourceCache into the results
        /*for (var layerID in result) {
            result[layerID].forEach(function (featureWrapper) {
                var feature = featureWrapper.feature;
                var state = sourceCache.getFeatureState(feature.layer['source-layer'], feature.id);
                feature.source = feature.layer.source;
                if (feature.layer['source-layer']) {
                    feature.sourceLayer = feature.layer['source-layer'];
                }
                feature.state = state;
            });
        }*/
        return result;
    }

    exports.queryRenderedFeatures = queryRenderedFeatures;
})