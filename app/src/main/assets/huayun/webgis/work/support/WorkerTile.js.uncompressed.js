/**
 * 子线程中矢量切片的封装类
 * @see com.huayun.webgis.work.support.WorkerTile
 */
define("com/huayun/webgis/work/support/WorkerTile", [
    "com/huayun/webgis/layers/support/OverscaledTileID",
    "com/huayun/webgis/data/ArrayType",
    "com/huayun/webgis/data/FeatureIndex",
    "com/huayun/webgis/gl/GlyphAtlas",
    "com/huayun/webgis/gl/ImageAtlas",
    "com/huayun/webgis/data/bucket/SymbolBucket",
    "com/huayun/webgis/data/bucket/LineBucket",
    "com/huayun/webgis/data/bucket/FillBucket",
    "com/huayun/webgis/data/bucket/FillExtrusionBucket",
    "com/huayun/webgis/layers/support/EvaluationParameters",
    "../../utils/DictionaryCoder",
    "../../utils/utils",
    "../../utils/symbolLayout"
], function (OverscaledTileID, ArrayType, FeatureIndex, GlyphAtlas, ImageAtlas, SymbolBucket, LineBucket, FillBucket, FillExtrusionBucket, EvaluationParameters,
             DictionaryCoder, utils, symbolLayout) {

    /**
     * 子线程中矢量切片的封装类
     * @ignore
     * @alias com.huayun.webgis.work.support.WorkerTile
     * @param {Object} params 参数
     * @param params.tileID 切片ID
     * @param {String} params.uid 切片的uid
     * @param {Number} params.zoom 切片的层级
     * @param {Number} params.pixelRatio 切片的像素比
     * @param {Number} params.tileSize 切片的大小
     * @param {String} params.source 切片的来源
     * @property {String} status 矢量切片的状态
     * @property {Object} data 矢量切片的数据
     * @property collisionBoxArray 碰撞盒
     * @constructor
     */
    var WorkerTile = function WorkerTile(params) {
        debugger;

        this.tileID = new OverscaledTileID(params.tileID.overscaledZ, params.tileID.wrap, params.tileID.canonical.z, params.tileID.canonical.x, params.tileID.canonical.y);
        this.uid = params.uid;
        this.zoom = params.zoom;
        this.pixelRatio = params.pixelRatio;
        this.tileSize = params.tileSize;
        this.source = params.source;
        this.overscaling = this.tileID.overscaleFactor();
        this.showCollisionBoxes = params.showCollisionBoxes;
        this.collectResourceTiming = !!params.collectResourceTiming;
        this.returnDependencies = !!params.returnDependencies;
    };

    /**
     * 解析矢量切片
     * @param data
     * @param layerIndex
     * @param actor
     * @param callback
     */
    WorkerTile.prototype.parse = function parse(data, layerIndex, actor, callback) {
        var this$1 = this;
        this.status = 'parsing';
        this.data = data;
        this.collisionBoxArray = new ArrayType.CollisionBoxArray();
        var sourceLayerCoder = new DictionaryCoder(Object.keys(data.layers).sort());
        var featureIndex = new FeatureIndex(this.tileID);
        featureIndex.bucketLayerIDs = [];

        debugger;
        var buckets = {};
        var options = {
            featureIndex: featureIndex,
            iconDependencies: {},
            patternDependencies: {},
            glyphDependencies: {}
        };
        var layerFamilies = layerIndex.familiesBySource[this.source];
        for (var sourceLayerId in layerFamilies) {
            var sourceLayer = data.layers[sourceLayerId];
            if (!sourceLayer) {
                continue;
            }
            var sourceLayerIndex = sourceLayerCoder.encode(sourceLayerId);
            var features = [];
            for (var index = 0; index < sourceLayer.length; index++) {
            // for (var index = 0; index < 1; index++) {
                var feature = sourceLayer.feature(index);
                features.push({feature: feature, index: index, sourceLayerIndex: sourceLayerIndex});
            }
            for (var i = 0, list = layerFamilies[sourceLayerId]; i < list.length; i += 1) {
                var family = list[i];
                var layer = family[0];

                if (layer.minzoom && this.zoom < layer.minzoom) {
                    continue;
                }
                if (layer.maxzoom && this.zoom >= layer.maxzoom) {
                    continue;
                }
                if (layer.visibility === 'none') {
                    continue;
                }

                recalculateLayers(family, this.zoom);

                var bucket = buckets[layer.id] = layer.createBucket({
                    index: featureIndex.bucketLayerIDs.length,
                    layers: family,
                    zoom: this.zoom,
                    pixelRatio: this.pixelRatio,
                    overscaling: this.overscaling,
                    collisionBoxArray: this.collisionBoxArray,
                    sourceLayerIndex: sourceLayerIndex,
                    sourceID: this.source
                });
                bucket.populate(features, options);
                featureIndex.bucketLayerIDs.push(family.map(function (l) {
                    return l.id;
                }));
            }
        }

        var error;
        var glyphMap;
        var iconMap;
        var patternMap;

        var stacks = utils.mapObject(options.glyphDependencies, function (glyphs) {
            return Object.keys(glyphs).map(Number);
        });
        if (Object.keys(stacks).length) { // 需要获取字体, 发送给主线程获取字体
            actor.send('getGlyphs', {uid: this.uid, stacks: stacks}, function (err, result) {
                if (!error) {
                    error = err;
                    glyphMap = result;
                    maybePrepare.call(this$1);
                }
            });
        } else {
            glyphMap = {};
        }

        var icons = Object.keys(options.iconDependencies);
        if (icons.length) { // 需要获取图标, 发送给主线程获取图标
            actor.send('getImages', {icons: icons}, function (err, result) {
                if (!error) {
                    error = err;
                    iconMap = result;
                    maybePrepare.call(this$1);
                }
            });
        } else {
            iconMap = {};
        }

        var patterns = Object.keys(options.patternDependencies);
        if (patterns.length) { // 需要获取填充模式, 发送给主线程获取填充模式
            actor.send('getImages', {icons: patterns}, function (err, result) {
                if (!error) {
                    error = err;
                    patternMap = result;
                    maybePrepare.call(this$1);
                }
            });
        } else {
            patternMap = {};
        }

        maybePrepare.call(this);

        function maybePrepare() {
            if (error) {
                return callback(error);
            } else if (glyphMap && iconMap && patternMap) {
                var glyphAtlas = new GlyphAtlas(glyphMap);
                var imageAtlas = new ImageAtlas(iconMap, patternMap);
                for (var key in buckets) {
                    var bucket = buckets[key];
                    if (bucket instanceof SymbolBucket) {
                        recalculateLayers(bucket.layers, this.zoom);
                        symbolLayout.performSymbolLayout(bucket, glyphMap, glyphAtlas.positions, iconMap, imageAtlas.iconPositions, this.showCollisionBoxes);
                    } else if (bucket.hasPattern && (bucket instanceof LineBucket || bucket instanceof FillBucket || bucket instanceof FillExtrusionBucket)) {
                        recalculateLayers(bucket.layers, this.zoom);
                        bucket.addFeatures(options, imageAtlas.patternPositions);
                    }
                }
                this.status = 'done';
                callback(null, {
                    buckets: utils.values(buckets).filter(function (b) {
                        return !b.isEmpty();
                    }),
                    featureIndex: featureIndex,
                    collisionBoxArray: this.collisionBoxArray,
                    glyphAtlasImage: glyphAtlas.image,
                    imageAtlas: imageAtlas,
                    glyphMap: this.returnDependencies ? glyphMap : null,
                    iconMap: this.returnDependencies ? iconMap : null,
                    glyphPositions: this.returnDependencies ? glyphAtlas.positions : null
                });
            }
        }
    };

    function recalculateLayers(layers, zoom) {
        var parameters = new EvaluationParameters(zoom);
        for (var i = 0, list = layers; i < list.length; i += 1) {
            var layer = list[i];
            layer.recalculate(parameters);
        }
    }

    return WorkerTile;
});