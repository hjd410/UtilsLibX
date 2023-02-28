define("com/huayun/webgis/gl/constantBinder", [
    "exports",
    "./uniform",
    "./dataTransfer",
    "../layers/support/EvaluationParameters",
    "../utils/utils"
], function (exports, uniform, dataTransfer, EvaluationParameters, utils) {

    var ConstantBinder = function ConstantBinder(value, names, type) {
        this.value = value;
        this.names = names;
        this.uniformNames = this.names.map(function (name) {
            return ("u_" + name);
        });
        this.type = type;
        this.maxValue = -Infinity;
    };

    ConstantBinder.prototype.defines = function defines() {
        return this.names.map(function (name) {
            return ("#define HAS_UNIFORM_u_" + name);
        });
    };
    ConstantBinder.prototype.setConstantPatternPositions = function setConstantPatternPositions() {
    };
    ConstantBinder.prototype.populatePaintArray = function populatePaintArray() {
    };
    ConstantBinder.prototype.updatePaintArray = function updatePaintArray() {
    };
    ConstantBinder.prototype.upload = function upload() {
    };
    ConstantBinder.prototype.destroy = function destroy() {
    };

    ConstantBinder.prototype.setUniforms = function setUniforms(context, uniform, globals,
                                                                currentValue) {
        uniform.set(currentValue.constantOr(this.value));
    };

    ConstantBinder.prototype.setUniform = function setUniform(context, uniform, value) {
        uniform.set(value);
    };

    ConstantBinder.prototype.getBinding = function getBinding(context, location) {
        return (this.type === 'color') ?
            new uniform.UniformColor(context, location) :
            new uniform.Uniform1f(context, location);
    };

    ConstantBinder.serialize = function serialize$1(binder) {
        var value = binder.value;
        var names = binder.names;
        var type = binder.type;
        return {value: dataTransfer.serialize(value), names: names, type: type};
    };

    ConstantBinder.deserialize = function deserialize$1(serialized) {
        var value = serialized.value;
        var names = serialized.names;
        var type = serialized.type;
        return new ConstantBinder(dataTransfer.deserialize(value), names, type);
    };

    var CrossFadedConstantBinder = function CrossFadedConstantBinder(value, names, type) {
        this.value = value;
        this.names = names;
        this.uniformNames = this.names.map(function (name) {
            return ("u_" + name);
        });
        this.type = type;
        this.maxValue = -Infinity;
        this.patternPositions = {patternTo: null, patternFrom: null};
    };

    CrossFadedConstantBinder.prototype.defines = function defines() {
        return this.names.map(function (name) {
            return ("#define HAS_UNIFORM_u_" + name);
        });
    };

    CrossFadedConstantBinder.prototype.populatePaintArray = function populatePaintArray() {
    };
    CrossFadedConstantBinder.prototype.updatePaintArray = function updatePaintArray() {
    };
    CrossFadedConstantBinder.prototype.upload = function upload() {
    };
    CrossFadedConstantBinder.prototype.destroy = function destroy() {
    };

    CrossFadedConstantBinder.prototype.setConstantPatternPositions = function setConstantPatternPositions(posTo, posFrom) {
        this.patternPositions.patternTo = posTo.tlbr;
        this.patternPositions.patternFrom = posFrom.tlbr;
    };

    CrossFadedConstantBinder.prototype.setUniforms = function setUniforms(context, uniform, globals,
                                                                          currentValue, uniformName) {
        var pos = this.patternPositions;
        if (uniformName === "u_pattern_to" && pos.patternTo) {
            uniform.set(pos.patternTo);
        }
        if (uniformName === "u_pattern_from" && pos.patternFrom) {
            uniform.set(pos.patternFrom);
        }
    };

    CrossFadedConstantBinder.prototype.getBinding = function getBinding(context, location) {
        return new uniform.Uniform4f(context, location);
    };

    var SourceExpressionBinder = function SourceExpressionBinder(expression, names, type, PaintVertexArray) {
        this.expression = expression;
        this.names = names;
        this.type = type;
        this.uniformNames = this.names.map(function (name) {
            return ("a_" + name);
        });
        this.maxValue = -Infinity;
        this.paintVertexAttributes = names.map(function (name) {
                return ({
                    name: ("a_" + name),
                    type: 'Float32',
                    components: type === 'color' ? 2 : 1,
                    offset: 0
                });
            }
        );
        this.paintVertexArray = new PaintVertexArray();
    };

    SourceExpressionBinder.prototype.defines = function defines() {
        return [];
    };

    SourceExpressionBinder.prototype.setConstantPatternPositions = function setConstantPatternPositions() {
    };

    SourceExpressionBinder.prototype.populatePaintArray = function populatePaintArray(newLength, feature) {
        var paintArray = this.paintVertexArray;

        var start = paintArray.length;
        paintArray.reserve(newLength);

        var value = this.expression.evaluate(new EvaluationParameters(0), feature, {});

        if (this.type === 'color') {
            var color = utils.packColor(value);
            for (var i = start; i < newLength; i++) {
                paintArray.emplaceBack(color[0], color[1]);
            }
        } else {
            for (var i$1 = start; i$1 < newLength; i$1++) {
                paintArray.emplaceBack(value);
            }

            this.maxValue = Math.max(this.maxValue, value);
        }
    };

    SourceExpressionBinder.prototype.updatePaintArray = function updatePaintArray(start, end, feature, featureState) {
        var paintArray = this.paintVertexArray;
        var value = this.expression.evaluate({zoom: 0}, feature, featureState);

        if (this.type === 'color') {
            var color = utils.packColor(value);
            for (var i = start; i < end; i++) {
                paintArray.emplace(i, color[0], color[1]);
            }
        } else {
            for (var i$1 = start; i$1 < end; i$1++) {
                paintArray.emplace(i$1, value);
            }

            this.maxValue = Math.max(this.maxValue, value);
        }
    };

    SourceExpressionBinder.prototype.upload = function upload(context) {
        if (this.paintVertexArray && this.paintVertexArray.arrayBuffer) {
            if (this.paintVertexBuffer && this.paintVertexBuffer.buffer) {
                this.paintVertexBuffer.updateData(this.paintVertexArray);
            } else {
                this.paintVertexBuffer = context.createVertexBuffer(this.paintVertexArray, this.paintVertexAttributes, this.expression.isStateDependent);
            }
        }
    };

    SourceExpressionBinder.prototype.destroy = function destroy() {
        if (this.paintVertexBuffer) {
            this.paintVertexBuffer.destroy();
        }
    };

    SourceExpressionBinder.prototype.setUniforms = function setUniforms(context, uniform) {
        uniform.set(0);
    };

    SourceExpressionBinder.prototype.getBinding = function getBinding(context, location) {
        return new uniform.Uniform1f(context, location);
    };

    var CompositeExpressionBinder = function CompositeExpressionBinder(expression, names, type, useIntegerZoom, zoom, layout) {
        this.expression = expression;
        this.names = names;
        this.uniformNames = this.names.map(function (name) {
            return ("u_" + name + "_t");
        });
        this.type = type;
        this.useIntegerZoom = useIntegerZoom;
        this.zoom = zoom;
        this.maxValue = -Infinity;
        var PaintVertexArray = layout;
        this.paintVertexAttributes = names.map(function (name) {
            return {
                name: ("a_" + name),
                type: 'Float32',
                components: type === 'color' ? 4 : 2,
                offset: 0
            };
        });
        this.paintVertexArray = new PaintVertexArray();
    };

    CompositeExpressionBinder.prototype.defines = function defines() {
        return [];
    };

    CompositeExpressionBinder.prototype.setConstantPatternPositions = function setConstantPatternPositions() {
    };

    CompositeExpressionBinder.prototype.populatePaintArray = function populatePaintArray(newLength, feature) {
        var paintArray = this.paintVertexArray;

        var start = paintArray.length;
        paintArray.reserve(newLength);

        var min = this.expression.evaluate(new EvaluationParameters(this.zoom), feature, {});
        var max = this.expression.evaluate(new EvaluationParameters(this.zoom + 1), feature, {});

        if (this.type === 'color') {
            var minColor = utils.packColor(min);
            var maxColor = utils.packColor(max);
            for (var i = start; i < newLength; i++) {
                paintArray.emplaceBack(minColor[0], minColor[1], maxColor[0], maxColor[1]);
            }
        } else {
            for (var i$1 = start; i$1 < newLength; i$1++) {
                paintArray.emplaceBack(min, max);
            }
            this.maxValue = Math.max(this.maxValue, min, max);
        }
    };

    CompositeExpressionBinder.prototype.updatePaintArray = function updatePaintArray(start, end, feature, featureState) {
        var paintArray = this.paintVertexArray;

        var min = this.expression.evaluate({zoom: this.zoom}, feature, featureState);
        var max = this.expression.evaluate({zoom: this.zoom + 1}, feature, featureState);

        if (this.type === 'color') {
            var minColor = utils.packColor(min);
            var maxColor = utils.packColor(max);
            for (var i = start; i < end; i++) {
                paintArray.emplace(i, minColor[0], minColor[1], maxColor[0], maxColor[1]);
            }
        } else {
            for (var i$1 = start; i$1 < end; i$1++) {
                paintArray.emplace(i$1, min, max);
            }
            this.maxValue = Math.max(this.maxValue, min, max);
        }
    };

    CompositeExpressionBinder.prototype.upload = function upload(context) {
        if (this.paintVertexArray && this.paintVertexArray.arrayBuffer) {
            if (this.paintVertexBuffer && this.paintVertexBuffer.buffer) {
                this.paintVertexBuffer.updateData(this.paintVertexArray);
            } else {
                this.paintVertexBuffer = context.createVertexBuffer(this.paintVertexArray, this.paintVertexAttributes, this.expression.isStateDependent);
            }
        }
    };

    CompositeExpressionBinder.prototype.destroy = function destroy() {
        if (this.paintVertexBuffer) {
            this.paintVertexBuffer.destroy();
        }
    };

    CompositeExpressionBinder.prototype.interpolationFactor = function interpolationFactor(currentZoom) {
        if (this.useIntegerZoom) {
            return this.expression.interpolationFactor(Math.floor(currentZoom), this.zoom, this.zoom + 1);
        } else {
            return this.expression.interpolationFactor(currentZoom, this.zoom, this.zoom + 1);
        }
    };

    CompositeExpressionBinder.prototype.setUniforms = function setUniforms(context, uniform,
                                                                           globals) {
        uniform.set(this.interpolationFactor(globals.zoom));
    };

    CompositeExpressionBinder.prototype.getBinding = function getBinding(context, location) {
        return new uniform.Uniform1f(context, location);
    };

    var CrossFadedCompositeBinder = function CrossFadedCompositeBinder(expression, names, type, useIntegerZoom, zoom, PaintVertexArray, layerId) {

        this.expression = expression;
        this.names = names;
        this.type = type;
        this.uniformNames = this.names.map(function (name) {
            return ("u_" + name + "_t");
        });
        this.useIntegerZoom = useIntegerZoom;
        this.zoom = zoom;
        this.maxValue = -Infinity;
        this.layerId = layerId;

        this.paintVertexAttributes = names.map(function (name) {
                return ({
                    name: ("a_" + name),
                    type: 'Uint16',
                    components: 4,
                    offset: 0
                });
            }
        );

        this.zoomInPaintVertexArray = new PaintVertexArray();
        this.zoomOutPaintVertexArray = new PaintVertexArray();
    };

    CrossFadedCompositeBinder.prototype.defines = function defines() {
        return [];
    };

    CrossFadedCompositeBinder.prototype.setConstantPatternPositions = function setConstantPatternPositions() {
    };

    CrossFadedCompositeBinder.prototype.populatePaintArray = function populatePaintArray(length, feature, imagePositions) {
        // We populate two paint arrays because, for cross-faded properties, we don't know which direction
        // we're cross-fading to at layout time. In order to keep vertex attributes to a minimum and not pass
        // unnecessary vertex data to the shaders, we determine which to upload at draw time.

        var zoomInArray = this.zoomInPaintVertexArray;
        var zoomOutArray = this.zoomOutPaintVertexArray;
        var ref = this;
        var layerId = ref.layerId;
        var start = zoomInArray.length;

        zoomInArray.reserve(length);
        zoomOutArray.reserve(length);

        if (imagePositions && feature.patterns && feature.patterns[layerId]) {
            var ref$1 = feature.patterns[layerId];
            var min = ref$1.min;
            var mid = ref$1.mid;
            var max = ref$1.max;

            var imageMin = imagePositions[min];
            var imageMid = imagePositions[mid];
            var imageMax = imagePositions[max];

            if (!imageMin || !imageMid || !imageMax) {
                return;
            }

            for (var i = start; i < length; i++) {
                zoomInArray.emplaceBack(
                    imageMid.tl[0], imageMid.tl[1], imageMid.br[0], imageMid.br[1],
                    imageMin.tl[0], imageMin.tl[1], imageMin.br[0], imageMin.br[1]
                );

                zoomOutArray.emplaceBack(
                    imageMid.tl[0], imageMid.tl[1], imageMid.br[0], imageMid.br[1],
                    imageMax.tl[0], imageMax.tl[1], imageMax.br[0], imageMax.br[1]
                );
            }
        }
    };

    CrossFadedCompositeBinder.prototype.updatePaintArray = function updatePaintArray(start, end, feature, featureState, imagePositions) {
        // We populate two paint arrays because, for cross-faded properties, we don't know which direction
        // we're cross-fading to at layout time. In order to keep vertex attributes to a minimum and not pass
        // unnecessary vertex data to the shaders, we determine which to upload at draw time.

        var zoomInArray = this.zoomInPaintVertexArray;
        var zoomOutArray = this.zoomOutPaintVertexArray;
        var ref = this;
        var layerId = ref.layerId;

        if (imagePositions && feature.patterns && feature.patterns[layerId]) {
            var ref$1 = feature.patterns[layerId];
            var min = ref$1.min;
            var mid = ref$1.mid;
            var max = ref$1.max;
            var imageMin = imagePositions[min];
            var imageMid = imagePositions[mid];
            var imageMax = imagePositions[max];

            if (!imageMin || !imageMid || !imageMax) {
                return;
            }
            for (var i = start; i < end; i++) {
                zoomInArray.emplace(i,
                    imageMid.tl[0], imageMid.tl[1], imageMid.br[0], imageMid.br[1],
                    imageMin.tl[0], imageMin.tl[1], imageMin.br[0], imageMin.br[1]
                );

                zoomOutArray.emplace(i,
                    imageMid.tl[0], imageMid.tl[1], imageMid.br[0], imageMid.br[1],
                    imageMax.tl[0], imageMax.tl[1], imageMax.br[0], imageMax.br[1]
                );
            }
        }
    };

    CrossFadedCompositeBinder.prototype.upload = function upload(context) {
        if (this.zoomInPaintVertexArray && this.zoomInPaintVertexArray.arrayBuffer && this.zoomOutPaintVertexArray && this.zoomOutPaintVertexArray.arrayBuffer) {
            this.zoomInPaintVertexBuffer = context.createVertexBuffer(this.zoomInPaintVertexArray, this.paintVertexAttributes, this.expression.isStateDependent);
            this.zoomOutPaintVertexBuffer = context.createVertexBuffer(this.zoomOutPaintVertexArray, this.paintVertexAttributes, this.expression.isStateDependent);
        }
    };

    CrossFadedCompositeBinder.prototype.destroy = function destroy() {
        if (this.zoomOutPaintVertexBuffer) {
            this.zoomOutPaintVertexBuffer.destroy();
        }
        if (this.zoomInPaintVertexBuffer) {
            this.zoomInPaintVertexBuffer.destroy();
        }

    };

    CrossFadedCompositeBinder.prototype.setUniforms = function setUniforms(context, uniform) {
        uniform.set(0);
    };

    CrossFadedCompositeBinder.prototype.getBinding = function getBinding(context, location) {
        return new uniform.Uniform1f(context, location);
    };

    console.log('ConstantBinder');
    dataTransfer.register('ConstantBinder', ConstantBinder);
    dataTransfer.register('CrossFadedConstantBinder', CrossFadedConstantBinder);
    dataTransfer.register('SourceExpressionBinder', SourceExpressionBinder);
    dataTransfer.register('CrossFadedCompositeBinder', CrossFadedCompositeBinder);
    dataTransfer.register('CompositeExpressionBinder', CompositeExpressionBinder);

    exports.ConstantBinder = ConstantBinder;
    exports.CrossFadedConstantBinder = CrossFadedConstantBinder;
    exports.SourceExpressionBinder = SourceExpressionBinder;
    exports.CrossFadedCompositeBinder = CrossFadedCompositeBinder;
    exports.CompositeExpressionBinder = CompositeExpressionBinder;



});