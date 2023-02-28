define("com/huayun/webgis/data/bucket/LineExtrusionBucket", [
  "../ArrayType",
  "../../gl/SegmentVector",
  "../../utils/earcut",
  "../../gl/programConfig",
  "../../gl/members",
  "../../gl/dataTransfer",
  "com/huayun/webgis/layers/support/EvaluationParameters",
  "../../utils/Constant",
  "../../utils/utils"
], function (ArrayType, SegmentVector, earcut, programConfig, members, dataTransfer, EvaluationParameters, Constant, utils) {

  var vectorTileFeatureTypes = ['Unknown', 'Point', 'LineString', 'Polygon'];

  function addVertex(vertexArray, x, y, height) {
    vertexArray.emplaceBack(x, y, height);
  }

  var LineExtrusionBucket = function LineExtrusionBucket(options) {
    this.zoom = options.zoom;
    this.overscaling = options.overscaling;
    this.layers = options.layers;
    this.layerIds = this.layers.map(function (layer) {
      return layer.id;
    });
    this.index = options.index;
    this.hasPattern = false;

    this.layoutVertexArray = new ArrayType.StructArrayLayout3i6();
    this.indexArray = new ArrayType.StructArrayLayout2ui4();
    this.programConfigurations = new programConfig.ProgramConfigurationSet(members.members$4, options.layers, options.zoom);
    this.segments = new SegmentVector();
    this.start = 0;
    this.subIndex = 0;
    this.stateDependentLayerIds = this.layers.filter(function (l) {
      return l.isStateDependent();
    }).map(function (l) {
      return l.id;
    });

  };

  LineExtrusionBucket.prototype.populate = function populate(features, options) {
    this.features = [];
    this.hasPattern = false;

    this.start = 0;
    this.subIndex = 0;

    for (var i = 0, list = features; i < list.length; i += 1) {
    // for (var i = 0, list = features; i < 1; i += 1) {
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
      options.featureIndex.insert(feature, geometry, index, sourceLayerIndex, this.index, true);
    }
  };

  LineExtrusionBucket.prototype.addFeatures = function addFeatures(options, imagePositions) {
    this.start = 0;
    this.subIndex = 0;
    for (var i = 0, list = this.features; i < list.length; i += 1) {
      var feature = list[i];
      var geometry = feature.geometry;
      this.addFeature(feature, geometry, feature.index, imagePositions);
    }
  };

  LineExtrusionBucket.prototype.update = function update(states, vtLayer, imagePositions) {
    if (!this.stateDependentLayers.length) {
      return;
    }
    this.programConfigurations.updatePaintArrays(states, vtLayer, this.stateDependentLayers, imagePositions);
  };

  LineExtrusionBucket.prototype.isEmpty = function isEmpty() {
    return this.layoutVertexArray.length === 0;
  };

  LineExtrusionBucket.prototype.uploadPending = function uploadPending() {
    return !this.uploaded || this.programConfigurations.needsUpload;
  };

  LineExtrusionBucket.prototype.upload = function upload(context) {
    if (!this.uploaded) {
      this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, members.members$4);
      this.indexBuffer = context.createIndexBuffer(this.indexArray);
    }
    this.programConfigurations.upload(context);
    this.uploaded = true;
  };

  LineExtrusionBucket.prototype.destroy = function destroy() {
    if (!this.layoutVertexBuffer) {
      return;
    }
    this.layoutVertexBuffer.destroy();
    this.indexBuffer.destroy();
    this.programConfigurations.destroy();
    this.segments.destroy();
  };

  LineExtrusionBucket.prototype.addFeature = function addFeature(feature, geometry, index, imagePositions) {
    for (var i$4 = 0, list$3 = utils.classifyRings(geometry, Constant.layout.EARCUT_MAX_RINGS); i$4 < list$3.length; i$4 += 1) {
      var polygon = list$3[i$4];

      var numVertices = 0;
      for (var i$1 = 0, list = polygon; i$1 < list.length; i$1 += 1) {
        var ring = list[i$1];

        numVertices += ring.length;
      }
      var segment = this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray);

      this.start = this.subIndex;
      for (var i$2 = 0, list$1 = polygon; i$2 < list$1.length; i$2 += 1) {
        var ring$1 = list$1[i$2];

        if (ring$1.length === 0) {
          continue;
        }

        if (utils.isEntirelyOutside(ring$1)) {
          continue;
        }

        for (var p = 0; p < ring$1.length - 1; p++) {
          var p1 = ring$1[p];
          addVertex(this.layoutVertexArray, p1.x, p1.y, -1); // bottom
          addVertex(this.layoutVertexArray, p1.x, p1.y, 1); // height
          if (!(p1.x === 8256 || p1.y === 8256 || p1.x === -64 || p1.y === -64)) {
            this.indexArray.emplaceBack(this.subIndex, this.subIndex + 1);
            segment.vertexLength += 2;
            segment.primitiveLength += 1;
          }
          if (p > 0) {
            var p2 = ring$1[p-1];
            if (!((p1.x === p2.x && (p1.x === 8256 || p1.x < -10)) || (p1.y === p2.y && (p1.y === 8256 || p1.y < -10)))) {
              this.indexArray.emplaceBack(this.subIndex - 2, this.subIndex);
              this.indexArray.emplaceBack(this.subIndex - 1, this.subIndex + 1);
              segment.vertexLength += 4;
              segment.primitiveLength += 2;
            }
          }
          this.subIndex += 2;
        }
        // 最后一个点连接起点
        p1 = ring$1[p];
        p2 = ring$1[0];
        if (!((p1.x === p2.x && (p1.x === 8256 || p1.x < -10)) || (p1.y === p2.y && (p1.y === 8256 || p1.y < -10)))) {
          this.indexArray.emplaceBack(this.subIndex - 2, this.start);
          this.indexArray.emplaceBack(this.subIndex - 1, this.start+1);
          segment.vertexLength += 4;
          segment.primitiveLength += 2;
        }
      }

      if (segment.vertexLength + numVertices > SegmentVector.MAX_VERTEX_ARRAY_LENGTH) {
        segment = this.segments.prepareSegment(numVertices, this.layoutVertexArray, this.indexArray);
      }

      //Only triangulate and draw the area of the feature if it is a polygon
      //Other feature types (e.g. LineString) do not have area, so triangulation is pointless / undefined
      /*if (vectorTileFeatureTypes[feature.type] !== 'Polygon') {
        continue;
      }*/
    }
    this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, feature, index, imagePositions);
  };
  dataTransfer.register('LineExtrusionBucket', LineExtrusionBucket, {omit: ['layers', 'features']});
  return LineExtrusionBucket;
});