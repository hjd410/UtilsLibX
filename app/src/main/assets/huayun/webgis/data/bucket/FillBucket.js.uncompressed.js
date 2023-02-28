/**
 *  @author :   wushengfei
 *  @date   :   2019/7/24
 *  @description : OK
 */
define("com/huayun/webgis/data/bucket/FillBucket", [
    "../ArrayType",
    "../../gl/SegmentVector",
    "../../utils/earcut",
    "../../gl/programConfig",
    "../../gl/members",
    "../../gl/dataTransfer",
    "com/huayun/webgis/layers/support/EvaluationParameters",
    "../../utils/utils",
    "../../utils/classifyRings",
    "../../utils/Constant"
], function (ArrayType, SegmentVector, earcut, programConfig, members, dataTransfer, EvaluationParameters, utils, classifyRings, Constant) {

    function FillBucket(options) {
        this.zoom = options.zoom;
        this.overscaling = options.overscaling;
        this.layers = options.layers;
        this.layerIds = this.layers.map(function (layer) {
            return layer.id;
        });
        this.index = options.index;
        this.hasPattern = false;

        this.layoutVertexArray = new ArrayType.StructArrayLayout2i4();
        this.indexArray = new ArrayType.StructArrayLayout3ui6();
        this.indexArray2 = new ArrayType.StructArrayLayout2ui4();
        this.programConfigurations = new programConfig.ProgramConfigurationSet(members.members$1, options.layers, options.zoom);
        this.segments = new SegmentVector();
        this.segments2 = new SegmentVector();
        this.stateDependentLayerIds = this.layers.filter(function (l) {
            return l.isStateDependent();
        }).map(function (l) {
            return l.id;
        });
    }

    FillBucket.prototype.populate = function populate(features, options) {
        this.features = [];
        this.hasPattern = false;

        for (var i = 0, list = features; i < list.length; i += 1) {
            var ref = list[i];
            var feature = ref.feature;
            var index = ref.index;
            var sourceLayerIndex = ref.sourceLayerIndex;

            if (!this.layers[0]._featureFilter(new EvaluationParameters(this.zoom), feature)) {
                continue;
            }

            var geometry = utils.loadGeometry(feature);

            var patternFeature = {
                sourceLayerIndex: sourceLayerIndex,
                index: index,
                geometry: geometry,
                properties: feature.properties,
                type: feature.type,
                patterns: {}
            };

            if (typeof feature.id !== 'undefined') {
                patternFeature.id = feature.id;
            }

            this.addFeature(patternFeature, geometry, index, {});

            options.featureIndex.insert(feature, geometry, index, sourceLayerIndex, this.index);
        }
    };

    FillBucket.prototype.update = function update(states, vtLayer, imagePositions) {
        if (!this.stateDependentLayers.length) {
            return;
        }
        this.programConfigurations.updatePaintArrays(states, vtLayer, this.stateDependentLayers, imagePositions);
    };

    FillBucket.prototype.addFeatures = function addFeatures(options, imagePositions) {
        for (var i = 0, list = this.features; i < list.length; i += 1) {
            var feature = list[i];

            var geometry = feature.geometry;
            this.addFeature(feature, geometry, feature.index, imagePositions);
        }
    };

    FillBucket.prototype.isEmpty = function isEmpty() {
        return this.layoutVertexArray.length === 0;
    };

    FillBucket.prototype.uploadPending = function uploadPending() {
        return !this.uploaded || this.programConfigurations.needsUpload;
    };
    FillBucket.prototype.upload = function upload(context) {
        // debugger;
        if (!this.uploaded) {
            this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, members.members$1);
            this.indexBuffer = context.createIndexBuffer(this.indexArray);
            this.indexBuffer2 = context.createIndexBuffer(this.indexArray2);
        }
        this.programConfigurations.upload(context);
        this.uploaded = true;
    };

    FillBucket.prototype.destroy = function destroy() {
        if (!this.layoutVertexBuffer) {
            return;
        }
        this.layoutVertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.indexBuffer2.destroy();
        this.programConfigurations.destroy();
        this.segments.destroy();
        this.segments2.destroy();
    };

    FillBucket.prototype.addFeature = function addFeature(feature, geometry, index, imagePositions) {
        for (var i$4 = 0, list$2 = classifyRings(geometry, Constant.layout.EARCUT_MAX_RINGS); i$4 < list$2.length; i$4 += 1) {
            var polygon = list$2[i$4];

            var numVertices = 0;
            for (var i$2 = 0, list = polygon; i$2 < list.length; i$2 += 1) {
                var ring = list[i$2];

                numVertices += ring.length;
            }

            var triangleSegment = this.segments.prepareSegment(numVertices, this.layoutVertexArray, this.indexArray);
            var triangleIndex = triangleSegment.vertexLength;

            var flattened = [];
            var holeIndices = [];

            for (var i$3 = 0, list$1 = polygon; i$3 < list$1.length; i$3 += 1) {
                var ring$1 = list$1[i$3];

                if (ring$1.length === 0) {
                    continue;
                }

                if (ring$1 !== polygon[0]) {
                    holeIndices.push(flattened.length / 2);
                }

                var lineSegment = this.segments2.prepareSegment(ring$1.length, this.layoutVertexArray, this.indexArray2);
                var lineIndex = lineSegment.vertexLength;

                this.layoutVertexArray.emplaceBack(ring$1[0].x, ring$1[0].y);
                this.indexArray2.emplaceBack(lineIndex + ring$1.length - 1, lineIndex);
                flattened.push(ring$1[0].x);
                flattened.push(ring$1[0].y);

                for (var i = 1; i < ring$1.length; i++) {
                    this.layoutVertexArray.emplaceBack(ring$1[i].x, ring$1[i].y);
                    this.indexArray2.emplaceBack(lineIndex + i - 1, lineIndex + i);
                    flattened.push(ring$1[i].x);
                    flattened.push(ring$1[i].y);
                }

                lineSegment.vertexLength += ring$1.length;
                lineSegment.primitiveLength += ring$1.length;
            }

            var indices = earcut.earcut(flattened, holeIndices);

            for (var i$1 = 0; i$1 < indices.length; i$1 += 3) {
                this.indexArray.emplaceBack(
                    triangleIndex + indices[i$1],
                    triangleIndex + indices[i$1 + 1],
                    triangleIndex + indices[i$1 + 2]);
            }

            triangleSegment.vertexLength += numVertices;
            triangleSegment.primitiveLength += indices.length / 3;
        }
        this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, feature, index, imagePositions);
    };

    console.log("FillBucket");
    dataTransfer.register('FillBucket', FillBucket, {omit: ['layers', 'features']});
    return FillBucket;
});