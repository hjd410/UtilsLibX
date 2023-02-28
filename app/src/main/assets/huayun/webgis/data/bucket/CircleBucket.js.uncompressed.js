/**
 *  @author :   wushengfei
 *  @date   :   2019/7/24
 *  @description : OK
 */
define("com/huayun/webgis/data/bucket/CircleBucket", [
    "../ArrayType",
    "../../gl/SegmentVector",
    "../../gl/programConfig",
    "../../gl/members",
    "../../gl/dataTransfer",
    "com/huayun/webgis/layers/support/EvaluationParameters",
    "../../utils/utils",
    "../../utils/Constant"
], function (ArrayType, SegmentVector, programConfig, members, dataTransfer, EvaluationParameters, utils, Constant) {

    function addCircleVertex(layoutVertexArray, x, y, extrudeX, extrudeY) {
        layoutVertexArray.emplaceBack((x * 2) + ((extrudeX + 1) / 2), (y * 2) + ((extrudeY + 1) / 2));
    }

    var CircleBucket = function CircleBucket(options) {
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
        this.segments = new SegmentVector();
        this.programConfigurations = new programConfig.ProgramConfigurationSet(members.members, options.layers, options.zoom);
        this.stateDependentLayerIds = this.layers.filter(function (l) {
            return l.isStateDependent();
        }).map(function (l) {
            return l.id;
        });

    };

    CircleBucket.prototype.populate = function populate(features, options) {
        for (var i = 0, list = features; i < list.length; i += 1) {
            var ref = list[i];
            var feature = ref.feature;
            var index = ref.index;
            var sourceLayerIndex = ref.sourceLayerIndex;

            if (this.layers[0]._featureFilter(new EvaluationParameters(this.zoom), feature)) {
                var geometry = utils.loadGeometry(feature);
                this.addFeature(feature, geometry, index);
                options.featureIndex.insert(feature, geometry, index, sourceLayerIndex, this.index);
            }
        }
    };

    CircleBucket.prototype.update = function update(states, vtLayer, imagePositions) {
        if (!this.stateDependentLayers.length) {
            return;
        }
        this.programConfigurations.updatePaintArrays(states, vtLayer, this.stateDependentLayers, imagePositions);
    };

    CircleBucket.prototype.isEmpty = function isEmpty() {
        return this.layoutVertexArray.length === 0;
    };

    CircleBucket.prototype.uploadPending = function uploadPending() {
        return !this.uploaded || this.programConfigurations.needsUpload;
    };

    CircleBucket.prototype.upload = function upload(context) {
        if (!this.uploaded) {
            this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, members.members);
            this.indexBuffer = context.createIndexBuffer(this.indexArray);
        }
        this.programConfigurations.upload(context);
        this.uploaded = true;
    };

    CircleBucket.prototype.destroy = function destroy() {
        if (!this.layoutVertexBuffer) {
            return;
        }
        this.layoutVertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.programConfigurations.destroy();
        this.segments.destroy();
    };

    CircleBucket.prototype.addFeature = function addFeature(feature, geometry, index) {
        var EXTENT = Constant.layout.EXTENT;
        for (var i$1 = 0, list$1 = geometry; i$1 < list$1.length; i$1 += 1) {
            var ring = list$1[i$1];
            for (var i = 0, list = ring; i < list.length; i += 1) {
                var point = list[i];
                var x = point.x;
                var y = point.y;
                if (x < 0 || x >= EXTENT || y < 0 || y >= EXTENT) {
                    continue;
                }
                // this geometry will be of the Point type, and we'll derive
                // two triangles from it.
                //
                // ┌─────────┐
                // │ 3 2 │
                // │     │
                // │ 0 1 │
                // └─────────┘
                var segment = this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray);
                var index$1 = segment.vertexLength;

                addCircleVertex(this.layoutVertexArray, x, y, -1, -1);
                addCircleVertex(this.layoutVertexArray, x, y, 1, -1);
                addCircleVertex(this.layoutVertexArray, x, y, 1, 1);
                addCircleVertex(this.layoutVertexArray, x, y, -1, 1);

                this.indexArray.emplaceBack(index$1, index$1 + 1, index$1 + 2);
                this.indexArray.emplaceBack(index$1, index$1 + 3, index$1 + 2);

                segment.vertexLength += 4;
                segment.primitiveLength += 2;
            }
        }

        // debugger;
        this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, feature, index, {});
    };

    console.log("CircleBucket");
    dataTransfer.register('CircleBucket', CircleBucket, {omit: ['layers']});
    return CircleBucket;
});