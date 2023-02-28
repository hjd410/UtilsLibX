/**
 * 矢量切片图形索引
 * @see com.huayun.webgis.data.FeatureIndex
 */
define("com/huayun/webgis/data/FeatureIndex", [
    "../gl/GridIndex",
    "../data/ArrayType",
    "../utils/utils",
    "../layers/support/readTile",
    "./Pbf",
    "../gl/dataTransfer",
    "../layers/support/style/expressionFactory",
    "../layers/support/EvaluationParameters",
    "./GeoJSONFeature",
    "../utils/Constant",
    "../utils/DictionaryCoder",
    "../geometry/intersection_tests"
], function (gridIndex, ArrayType, utils, readTile, Pbf,
             dataTransfer, expressionFactory, EvaluationParameters, GeoJSONFeature, Constant, DictionaryCoder, intersectionTests) {

    /**
     * 矢量切片图形索引
     * @ignore
     * @alias com.huayun.webgis.data.FeatureIndex
     * @param tileID 切片的id
     * @param grid 网格
     * @param featureIndexArray 图形索引数组
     * @property {Number} x 切片的行坐标
     * @property {Number} y 切片的列坐标
     * @property {Number} z 切片的层级
     * @property grid 碰撞网格
     * @property grid3D 3D碰撞网格
     * @property featureIndexArray 图形索引数组
     * @constructor
     */
    var FeatureIndex = function FeatureIndex(tileID, grid, featureIndexArray) {
        this.tileID = tileID;
        this.x = tileID.canonical.x;
        this.y = tileID.canonical.y;
        this.z = tileID.canonical.z;
        this.grid = grid || new gridIndex(Constant.layout.EXTENT, 16, 0);
        this.grid3D = new gridIndex(Constant.layout.EXTENT, 16, 0);
        this.featureIndexArray = featureIndexArray || new ArrayType.FeatureIndexArray();
    };

    /**
     * 在碰撞网格中插入图形
     * @param feature 要插入的图形
     * @param geometry 图形的坐标数据
     * @param featureIndex 图形索引
     * @param sourceLayerIndex 图层索引
     * @param bucketIndex bucket索引
     * @param is3D 是否是3D数据
     */
    FeatureIndex.prototype.insert = function insert(feature, geometry, featureIndex, sourceLayerIndex, bucketIndex, is3D) {
        var key = this.featureIndexArray.length;
        this.featureIndexArray.emplaceBack(featureIndex, sourceLayerIndex, bucketIndex);

        var grid = this.grid;//is3D ? this.grid3D : this.grid;
        for (var r = 0; r < geometry.length; r++) {
            var ring = geometry[r];
            var bbox = [Infinity, Infinity, -Infinity, -Infinity];
            for (var i = 0; i < ring.length; i++) {
                var p = ring[i];
                bbox[0] = Math.min(bbox[0], p.x);
                bbox[1] = Math.min(bbox[1], p.y);
                bbox[2] = Math.max(bbox[2], p.x);
                bbox[3] = Math.max(bbox[3], p.y);
            }

            if (bbox[0] < Constant.layout.EXTENT && bbox[1] < Constant.layout.EXTENT && bbox[2] >= 0 && bbox[3] >= 0) {
                grid.insert(key, bbox[0], bbox[1], bbox[2], bbox[3]);
            }
        }
    };

    /**
     * 加载矢量切片数据
     */
    FeatureIndex.prototype.loadVTLayers = function loadVTLayers() {
        if (!this.vtLayers) {
            this.vtLayers = new Pbf(this.rawTileData).readFields(readTile, {}, undefined);
            this.sourceLayerCoder = new DictionaryCoder(this.vtLayers ? Object.keys(this.vtLayers).sort() : ['_geojsonTileLayer']);
        }
        return this.vtLayers;
    };

    /**
     * 查询
     * @param args
     * @param styleLayers
     * @param sourceFeatureState
     * @return {{}}
     */
    FeatureIndex.prototype.query = function query(args, styleLayers, sourceFeatureState) {
        var this$1 = this;
        this.loadVTLayers();
        var params = args.params || {},
            pixelsToTileUnits = Constant.layout.EXTENT / args.tileSize / args.scale,
            filter = expressionFactory.createFilter(params.filter);

        var queryGeometry = args.queryGeometry;
        var queryPadding = args.queryPadding * pixelsToTileUnits;

        var bounds = intersectionTests.getBounds(queryGeometry);
        var matching = this.grid.query(bounds.minX - queryPadding, bounds.minY - queryPadding, bounds.maxX + queryPadding, bounds.maxY + queryPadding);

        /*var cameraBounds = intersectionTests.getBounds(args.cameraQueryGeometry);
        var matching3D = this.grid3D.query(cameraBounds.minX - queryPadding, cameraBounds.minY - queryPadding, cameraBounds.maxX + queryPadding, cameraBounds.maxY + queryPadding,
            function (bx1, by1, bx2, by2) {
                return intersectionTests.polygonIntersectsBox(args.cameraQueryGeometry, bx1 - queryPadding, by1 - queryPadding, bx2 + queryPadding, by2 + queryPadding);
            });

        for (var i = 0, list = matching3D; i < list.length; i += 1) {
            var key = list[i];
            matching.push(key);
        }*/
        matching.sort(utils.topDownFeatureComparator);

        var result = {};
        var previousIndex;
        for (var k = 0; k < matching.length; k++) {
            var index = matching[k];
            if (index === previousIndex) {
                continue;
            }
            previousIndex = index;

            var match = this$1.featureIndexArray.get(index);
            var featureGeometry = null;
            this$1.loadMatchingFeature(
                result,
                match.bucketIndex,
                match.sourceLayerIndex,
                match.featureIndex,
                filter,
                params.layers,
                styleLayers,
                function (feature, styleLayer) {
                    if (!featureGeometry) {
                        featureGeometry = utils.loadGeometry(feature);
                    }
                    var featureState = {};
                    if (feature.id) {
                        featureState = sourceFeatureState.getState(styleLayer.sourceLayer || '_geojsonTileLayer', feature.id);
                    }
                    return styleLayer.queryIntersectsFeature(queryGeometry, feature, featureState, featureGeometry, this$1.z, args.transform, pixelsToTileUnits, args.pixelPosMatrix);
                }
            );
        }
        return result;
    };

    /**
     * 加载匹配到的图形
     * @param result
     * @param bucketIndex
     * @param sourceLayerIndex
     * @param featureIndex
     * @param filter
     * @param filterLayerIDs
     * @param styleLayers
     * @param intersectionTest
     */
    FeatureIndex.prototype.loadMatchingFeature = function loadMatchingFeature(result, bucketIndex, sourceLayerIndex, featureIndex,
                                                                              filter, filterLayerIDs, styleLayers, intersectionTest) {

        var layerIDs = this.bucketLayerIDs[bucketIndex];
        if (filterLayerIDs && !utils.arraysIntersect(filterLayerIDs, layerIDs)) {
            return;
        }

        var sourceLayerName = this.sourceLayerCoder.decode(sourceLayerIndex);
        var sourceLayer = this.vtLayers[sourceLayerName];
        var feature = sourceLayer.feature(featureIndex);

        if (!filter(new EvaluationParameters(this.tileID.overscaledZ), feature)) {
            return;
        }

        for (var l = 0; l < layerIDs.length; l++) {
            var layerID = layerIDs[l];

            if (filterLayerIDs && filterLayerIDs.indexOf(layerID) < 0) {
                continue;
            }

            var styleLayer = styleLayers[layerID];
            if (!styleLayer) {
                continue;
            }

            var intersectionZ = !intersectionTest || intersectionTest(feature, styleLayer);
            if (!intersectionZ) {
                continue;
            }

            var geojsonFeature = new GeoJSONFeature(feature, this.z, this.x, this.y);
            geojsonFeature.layer = styleLayer.serialize();
            var layerResult = result[layerID];
            if (layerResult === undefined) {
                layerResult = result[layerID] = [];
            }
            layerResult.push({featureIndex: featureIndex, feature: geojsonFeature, intersectionZ: intersectionZ});
        }
    };

    /**
     * 查询Symbol图形
     * @param symbolFeatureIndexes
     * @param bucketIndex
     * @param sourceLayerIndex
     * @param filterSpec
     * @param filterLayerIDs
     * @param styleLayers
     * @return {{}}
     */
    FeatureIndex.prototype.lookupSymbolFeatures = function lookupSymbolFeatures(symbolFeatureIndexes, bucketIndex, sourceLayerIndex,
                                                                                filterSpec, filterLayerIDs, styleLayers) {
        var result = {};
        this.loadVTLayers();
        var filter = expressionFactory.createFilter(filterSpec);
        for (var i = 0, list = symbolFeatureIndexes; i < list.length; i += 1) {
            var symbolFeatureIndex = list[i];
            this.loadMatchingFeature(
                result,
                bucketIndex,
                sourceLayerIndex,
                symbolFeatureIndex,
                filter,
                filterLayerIDs,
                styleLayers
            );
        }
        return result;
    };

    /**
     * 是否包含图层
     * @param id
     * @return {boolean}
     */
    FeatureIndex.prototype.hasLayer = function hasLayer(id) {
        for (var i$1 = 0, list$1 = this.bucketLayerIDs; i$1 < list$1.length; i$1 += 1) {
            var layerIDs = list$1[i$1];

            for (var i = 0, list = layerIDs; i < list.length; i += 1) {
                var layerID = list[i];
                if (id === layerID) {
                    return true;
                }
            }
        }

        return false;
    };

    // 注册FeatureIndex, 以便可以进行序列化
    dataTransfer.register('FeatureIndex', FeatureIndex, {omit: ['rawTileData', 'sourceLayerCoder']});

    return FeatureIndex;
});