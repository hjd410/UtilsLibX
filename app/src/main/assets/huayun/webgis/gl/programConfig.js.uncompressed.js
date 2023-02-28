define("com/huayun/webgis/gl/programConfig", [
    "exports",
    "../data/FeaturePositionMap",
    "../layers/support/style/PossiblyEvaluatedPropertyValue",
    "./constantBinder",
    "./dataTransfer",
    "../utils/utils"
], function (exports, FeaturePositionMap, PossiblyEvaluatedPropertyValue, constantBinder, dataTransfer, utils) {
    var ProgramConfiguration = function ProgramConfiguration() {
        this.binders = {};
        this.cacheKey = '';
        this._buffers = [];
        this._featureMap = new FeaturePositionMap();
        this._bufferOffset = 0;
    };

    ProgramConfiguration.createDynamic = function createDynamic(layer, zoom, filterProperties) {
        var self = new ProgramConfiguration();
        var keys = [];

        for (var property in layer.paint._values) {
            if (!filterProperties(property)) {
                continue;
            }
            var value = layer.paint.get(property);
            if (!(value instanceof PossiblyEvaluatedPropertyValue) || !utils.supportsPropertyExpression(value.property.specification)) {
                continue;
            }
            var names = utils.paintAttributeNames(property, layer.type);
            var type = value.property.specification.type;
            var useIntegerZoom = value.property.useIntegerZoom;
            var isCrossFaded = value.property.specification['property-type'] === 'cross-faded' ||
                value.property.specification['property-type'] === 'cross-faded-data-driven';

            if (isCrossFaded) {
                if (value.value.kind === 'constant') {
                    self.binders[property] = new constantBinder.CrossFadedConstantBinder(value.value.value, names, type);
                    keys.push(("/u_" + property));
                } else {
                    var StructArrayLayout = utils.layoutType(property, type, 'source');
                    self.binders[property] = new constantBinder.CrossFadedCompositeBinder(value.value, names, type, useIntegerZoom, zoom, StructArrayLayout, layer.id);
                    keys.push(("/a_" + property));
                }
            } else if (value.value.kind === 'constant') {
                self.binders[property] = new constantBinder.ConstantBinder(value.value.value, names, type);
                keys.push(("/u_" + property));
            } else if (value.value.kind === 'source') {
                var StructArrayLayout$1 = utils.layoutType(property, type, 'source');
                self.binders[property] = new constantBinder.SourceExpressionBinder(value.value, names, type, StructArrayLayout$1);
                keys.push(("/a_" + property));
            } else {
                var StructArrayLayout$2 = utils.layoutType(property, type, 'composite');
                self.binders[property] = new constantBinder.CompositeExpressionBinder(value.value, names, type, useIntegerZoom, zoom, StructArrayLayout$2);
                keys.push(("/z_" + property));
            }
        }
        self.cacheKey = keys.sort().join('');
        return self;
    };

    ProgramConfiguration.prototype.populatePaintArrays = function populatePaintArrays(newLength, feature, index, imagePositions) {
        for (var property in this.binders) {
            var binder = this.binders[property];
            binder.populatePaintArray(newLength, feature, imagePositions);
        }
        if (feature.id !== undefined) {
            this._featureMap.add(+feature.id, index, this._bufferOffset, newLength);
        }
        this._bufferOffset = newLength;
    };
    ProgramConfiguration.prototype.setConstantPatternPositions = function setConstantPatternPositions(posTo, posFrom) {
        for (var property in this.binders) {
            var binder = this.binders[property];
            binder.setConstantPatternPositions(posTo, posFrom);
        }
    };

    ProgramConfiguration.prototype.updatePaintArrays = function updatePaintArrays(featureStates, vtLayer, layer, imagePositions) {
        var dirty = false;
        for (var id in featureStates) {
            var positions = this._featureMap.getPositions(+id);
            for (var i = 0, list = positions; i < list.length; i += 1) {
                var pos = list[i];
                var feature = vtLayer.feature(pos.index);
                for (var property in this.binders) {
                    var binder = this.binders[property];
                    if (binder instanceof constantBinder.ConstantBinder || binder instanceof constantBinder.CrossFadedConstantBinder) {
                        continue;
                    }
                    if ((binder).expression.isStateDependent === true) {
                        var value = layer.paint.get(property);
                        (binder).expression = value.value;
                        binder.updatePaintArray(pos.start, pos.end, feature, featureStates[id], imagePositions);
                        dirty = true;
                    }
                }
            }
        }
        return dirty;
    };

    ProgramConfiguration.prototype.defines = function defines() {
        var result = [];
        for (var property in this.binders) {
            result.push.apply(result, this.binders[property].defines());
        }
        return result;
    };

    ProgramConfiguration.prototype.getPaintVertexBuffers = function getPaintVertexBuffers() {
        return this._buffers;
    };

    ProgramConfiguration.prototype.getUniforms = function getUniforms(context, locations) {
        var uniforms = [];
        for (var property in this.binders) {
            var binder = this.binders[property];
            for (var i = 0, list = binder.uniformNames; i < list.length; i += 1) {
                var name = list[i];
                if (locations[name]) {
                    var binding = binder.getBinding(context, locations[name]);
                    uniforms.push({name: name, property: property, binding: binding});
                }
            }
        }
        return uniforms;
    };

    ProgramConfiguration.prototype.setUniforms = function setUniforms(context, binderUniforms, properties, globals) {
        for (var i = 0, list = binderUniforms; i < list.length; i += 1) {
            var ref = list[i];
            var name = ref.name;
            var property = ref.property;
            var binding = ref.binding;
            this.binders[property].setUniforms(context, binding, globals, properties.get(property), name);
        }
    };

    ProgramConfiguration.prototype.setUniform = function setUniforms(context, property, binding, value) {
        this.binders[property].setUniform(context, binding, value);
    };

    ProgramConfiguration.prototype.updatePatternPaintBuffers = function updatePatternPaintBuffers(crossfade) {
        var buffers = [];
        for (var property in this.binders) {
            var binder = this.binders[property];
            if (binder instanceof constantBinder.CrossFadedCompositeBinder) {
                var patternVertexBuffer = crossfade.fromScale === 2 ? binder.zoomInPaintVertexBuffer : binder.zoomOutPaintVertexBuffer;
                if (patternVertexBuffer) {
                    buffers.push(patternVertexBuffer);
                }
            } else if ((binder instanceof constantBinder.SourceExpressionBinder ||
                binder instanceof constantBinder.CompositeExpressionBinder) &&
                binder.paintVertexBuffer
            ) {
                buffers.push(binder.paintVertexBuffer);
            }
        }

        this._buffers = buffers;
    };

    ProgramConfiguration.prototype.upload = function upload(context) {
        for (var property in this.binders) {
            this.binders[property].upload(context);
        }
        var buffers = [];
        for (var property$1 in this.binders) {
            var binder = this.binders[property$1];
            if ((binder instanceof constantBinder.SourceExpressionBinder ||
                binder instanceof constantBinder.CompositeExpressionBinder) &&
                binder.paintVertexBuffer
            ) {
                buffers.push(binder.paintVertexBuffer);
            }
        }
        this._buffers = buffers;
    };

    ProgramConfiguration.prototype.destroy = function destroy() {
        for (var property in this.binders) {
            this.binders[property].destroy();
        }
    };

    var ProgramConfigurationSet = function ProgramConfigurationSet(layoutAttributes, layers, zoom, filterProperties) {
        if (filterProperties === void 0) filterProperties = function () {
            return true;
        };
        this.programConfigurations = {};
        for (var i = 0, list = layers; i < list.length; i += 1) {
            var layer = list[i];
            this.programConfigurations[layer.id] = ProgramConfiguration.createDynamic(layer, zoom, filterProperties);
            this.programConfigurations[layer.id].layoutAttributes = layoutAttributes;
        }
        this.needsUpload = false;
    };

    ProgramConfigurationSet.prototype.populatePaintArrays = function populatePaintArrays(length, feature, index, imagePositions) {
        for (var key in this.programConfigurations) {
            this.programConfigurations[key].populatePaintArrays(length, feature, index, imagePositions);
        }
        this.needsUpload = true;
    };

    ProgramConfigurationSet.prototype.updatePaintArrays = function updatePaintArrays(featureStates, vtLayer, layers, imagePositions) {
        for (var i = 0, list = layers; i < list.length; i += 1) {
            var layer = list[i];
            this.needsUpload = this.programConfigurations[layer.id].updatePaintArrays(featureStates, vtLayer, layer, imagePositions) || this.needsUpload;
        }
    };

    ProgramConfigurationSet.prototype.get = function get(layerId) {
        return this.programConfigurations[layerId];
    };

    ProgramConfigurationSet.prototype.upload = function upload(context) {
        if (!this.needsUpload) {
            return;
        }
        for (var layerId in this.programConfigurations) {
            this.programConfigurations[layerId].upload(context);
        }
        this.needsUpload = false;
    };

    ProgramConfigurationSet.prototype.destroy = function destroy() {
        for (var layerId in this.programConfigurations) {
            this.programConfigurations[layerId].destroy();
        }
    };

    exports.ProgramConfiguration = ProgramConfiguration;
    exports.ProgramConfigurationSet = ProgramConfigurationSet;

    console.log('FeaturePositionMap');
    dataTransfer.register('FeaturePositionMap', FeaturePositionMap);
    dataTransfer.register('ProgramConfiguration', ProgramConfiguration, {omit: ['_buffers']});
    dataTransfer.register('ProgramConfigurationSet', ProgramConfigurationSet);

});