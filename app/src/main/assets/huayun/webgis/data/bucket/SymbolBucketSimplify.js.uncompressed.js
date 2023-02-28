/**
 *  @author :   wushengfei
 *  @date   :   2019/7/24
 *  @description : OK
 */
define("com/huayun/webgis/data/bucket/SymbolBucketSimplify", [
    "../ArrayType",
    "../../gl/SegmentVector",
    "../../gl/programConfig",
    "../../gl/dataTransfer",
    "../../gl/members",
    "../../geometry/Point2D",
    "../../layers/support/EvaluationParameters",
    "../../layers/support/expression/Formatted",
    "../../utils/utils",
    "../../utils/Constant"
], function (ArrayType, SegmentVector, programConfig, dataTransfer, members,Point,
             EvaluationParameters, Formatted, utils, Constant) {

    var SymbolBuffers = function SymbolBuffers() {
        this.layoutVertexArray = new ArrayType.StructArrayLayout4i4ui16();
        this.indexArray = new ArrayType.StructArrayLayout3ui6();
        this.segments = new SegmentVector();
        this.dynamicLayoutVertexArray = new ArrayType.StructArrayLayout3f12();
        this.opacityVertexArray = new ArrayType.StructArrayLayout1ul4();
        this.placedSymbolArray = new ArrayType.PlacedSymbolArray();
    };

    SymbolBuffers.prototype.upload = function upload(context, dynamicIndexBuffer, upload$1, update) {
        if (upload$1) {
            this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, members.symbolLayoutAttributes.members);
            this.indexBuffer = context.createIndexBuffer(this.indexArray, dynamicIndexBuffer);
            this.dynamicLayoutVertexBuffer = context.createVertexBuffer(this.dynamicLayoutVertexArray, members.dynamicLayoutAttributes.members, true);
            this.opacityVertexBuffer = context.createVertexBuffer(this.opacityVertexArray, members.shaderOpacityAttributes, true);
            this.opacityVertexBuffer.itemSize = 1;
        }
        if (upload$1 || update) {
            this.programConfigurations.upload(context);
        }
    };

    SymbolBuffers.prototype.destroy = function destroy() {
        if (!this.layoutVertexBuffer) {
            return;
        }
        this.layoutVertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.programConfigurations.destroy();
        this.segments.destroy();
        this.dynamicLayoutVertexBuffer.destroy();
        this.opacityVertexBuffer.destroy();
    };


    var CollisionBuffers = function CollisionBuffers(LayoutArray, layoutAttributes, IndexArray) {
        this.layoutVertexArray = new LayoutArray();
        this.layoutAttributes = layoutAttributes;
        this.indexArray = new IndexArray();
        this.segments = new SegmentVector();
        this.collisionVertexArray = new ArrayType.StructArrayLayout2ub2f12();
    };

    CollisionBuffers.prototype.upload = function upload(context) {
        this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, this.layoutAttributes);
        this.indexBuffer = context.createIndexBuffer(this.indexArray);
        this.collisionVertexBuffer = context.createVertexBuffer(this.collisionVertexArray, [
            {name: 'a_placed', components: 2, type: 'Uint8', offset: 0},
            {name: 'a_shift', components: 2, type: 'Float32', offset: 4}
        ], true);
    };

    CollisionBuffers.prototype.destroy = function destroy() {
        if (!this.layoutVertexBuffer) {
            return;
        }
        this.layoutVertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.segments.destroy();
        this.collisionVertexBuffer.destroy();
    };

    dataTransfer.register('SymbolBuffers', SymbolBuffers);
    dataTransfer.register('CollisionBuffers', CollisionBuffers);

    function transformText(text, layer, feature) {
        text.sections.forEach(function (section) {

            var transform = layer.layout.get('text-transform').evaluate(feature, {});
            if (transform === 'uppercase') {
                section.text = section.text.toLocaleUpperCase();
            } else if (transform === 'lowercase') {
                section.text = section.text.toLocaleLowerCase();
            }
        });
        return text;
    }

    function getSizeData(tileZoom, value) {
        var expression = value.expression;

        if (expression.kind === 'constant') {
            var layoutSize = expression.evaluate(new EvaluationParameters(tileZoom + 1));
            return {kind: 'constant', layoutSize: layoutSize};

        } else if (expression.kind === 'source') {
            return {kind: 'source'};

        } else {
            var zoomStops = expression.zoomStops;
            var interpolationType = expression.interpolationType;

            var lower = 0;
            while (lower < zoomStops.length && zoomStops[lower] <= tileZoom) {
                lower++;
            }
            lower = Math.max(0, lower - 1);
            var upper = lower;
            while (upper < zoomStops.length && zoomStops[upper] < tileZoom + 1) {
                upper++;
            }
            upper = Math.min(zoomStops.length - 1, upper);

            var minZoom = zoomStops[lower];
            var maxZoom = zoomStops[upper];

            if (expression.kind === 'composite') {
                return {kind: 'composite', minZoom: minZoom, maxZoom: maxZoom, interpolationType: interpolationType};
            }

            var minSize = expression.evaluate(new EvaluationParameters(minZoom));
            var maxSize = expression.evaluate(new EvaluationParameters(maxZoom));

            return {
                kind: 'camera',
                minZoom: minZoom,
                maxZoom: maxZoom,
                minSize: minSize,
                maxSize: maxSize,
                interpolationType: interpolationType
            };
        }
    }

    function addVertex(array, anchorX, anchorY, ox, oy, tx, ty, sizeVertex) {
        array.emplaceBack(anchorX, anchorY,// a_pos_offset
            Math.round(ox * 32), Math.round(oy * 32),
            tx, ty, // x, y coordinate of symbol on glyph atlas texture
            sizeVertex ? sizeVertex[0] : 0,
            sizeVertex ? sizeVertex[1] : 0
        );
    }

    function addDynamicAttributes(dynamicLayoutVertexArray, p, angle) {
        dynamicLayoutVertexArray.emplaceBack(p.x, p.y, angle);
        dynamicLayoutVertexArray.emplaceBack(p.x, p.y, angle);
        dynamicLayoutVertexArray.emplaceBack(p.x, p.y, angle);
        dynamicLayoutVertexArray.emplaceBack(p.x, p.y, angle);
    }

    function mergeLines(features) {
        var leftIndex = {};
        var rightIndex = {};
        var mergedFeatures = [];
        var mergedIndex = 0;

        function add(k) {
            mergedFeatures.push(features[k]);
            mergedIndex++;
        }

        function mergeFromRight(leftKey, rightKey, geom) {
            var i = rightIndex[leftKey];
            delete rightIndex[leftKey];
            rightIndex[rightKey] = i;

            mergedFeatures[i].geometry[0].pop();
            mergedFeatures[i].geometry[0] = mergedFeatures[i].geometry[0].concat(geom[0]);
            return i;
        }

        function mergeFromLeft(leftKey, rightKey, geom) {
            var i = leftIndex[rightKey];
            delete leftIndex[rightKey];
            leftIndex[leftKey] = i;

            mergedFeatures[i].geometry[0].shift();
            mergedFeatures[i].geometry[0] = geom[0].concat(mergedFeatures[i].geometry[0]);
            return i;
        }

        function getKey(text, geom, onRight) {
            var point = onRight ? geom[0][geom[0].length - 1] : geom[0][0];
            return (text + ":" + (point.x) + ":" + (point.y));
        }

        for (var k = 0; k < features.length; k++) {
            var feature = features[k];
            var geom = feature.geometry;
            var text = feature.text ? feature.text.toString() : null;

            if (!text) {
                add(k);
                continue;
            }

            var leftKey = getKey(text, geom),
                rightKey = getKey(text, geom, true);

            if ((leftKey in rightIndex) && (rightKey in leftIndex) && (rightIndex[leftKey] !== leftIndex[rightKey])) {
                // found lines with the same text adjacent to both ends of the current line, merge all three
                var j = mergeFromLeft(leftKey, rightKey, geom);
                var i = mergeFromRight(leftKey, rightKey, mergedFeatures[j].geometry);

                delete leftIndex[leftKey];
                delete rightIndex[rightKey];

                rightIndex[getKey(text, mergedFeatures[i].geometry, true)] = i;
                mergedFeatures[j].geometry = (null);

            } else if (leftKey in rightIndex) {
                // found mergeable line adjacent to the start of the current line, merge
                mergeFromRight(leftKey, rightKey, geom);

            } else if (rightKey in leftIndex) {
                // found mergeable line adjacent to the end of the current line, merge
                mergeFromLeft(leftKey, rightKey, geom);

            } else {
                // no adjacent lines, add as a new item
                add(k);
                leftIndex[leftKey] = mergedIndex - 1;
                rightIndex[rightKey] = mergedIndex - 1;
            }
        }
        return mergedFeatures.filter(function (f) {
            return f.geometry;
        });
    }

    var SymbolBucket = function SymbolBucket(options) {
        this.collisionBoxArray = options.collisionBoxArray;
        this.textSizeData = {kind: 'constant', layoutSize: layoutSize};
    };

    SymbolBucket.prototype.createArrays = function createArrays() {
        this.text = new SymbolBuffers(new programConfig.ProgramConfigurationSet(members.symbolLayoutAttributes.members, this.layers, this.zoom, function (property) {
            return /^text/.test(property);
        }));
        this.icon = new SymbolBuffers(new programConfig.ProgramConfigurationSet(members.symbolLayoutAttributes.members, this.layers, this.zoom, function (property) {
            return /^icon/.test(property);
        }));

        this.collisionBox = new CollisionBuffers(ArrayType.StructArrayLayout2i2i2i12, Constant.collisionBoxLayout, ArrayType.StructArrayLayout2ui4);
        this.collisionCircle = new CollisionBuffers(ArrayType.StructArrayLayout2i2i2i12, Constant.collisionCircleLayout, ArrayType.StructArrayLayout3ui6);

        this.glyphOffsetArray = new ArrayType.GlyphOffsetArray();
        this.lineVertexArray = new ArrayType.SymbolLineVertexArray();
        this.symbolInstances = new ArrayType.SymbolInstanceArray();
    };

    SymbolBucket.prototype.calculateGlyphDependencies = function calculateGlyphDependencies(text, stack, textAlongLine, doesAllowVerticalWritingMode) {
        for (var i = 0; i < text.length; i++) {
            stack[text.charCodeAt(i)] = true;
            if (textAlongLine && doesAllowVerticalWritingMode) {
                var verticalChar = Constant.verticalizedCharacterMap[text.charAt(i)];
                if (verticalChar) {
                    stack[verticalChar.charCodeAt(0)] = true;
                }
            }
        }
    };

    SymbolBucket.prototype.populate = function populate(features, options) {
        var layer = this.layers[0];
        var layout = layer.layout;

        var textFont = layout.get('text-font');
        var textField = layout.get('text-field');
        var iconImage = layout.get('icon-image');
        var hasText =
            (textField.value.kind !== 'constant' || textField.value.value.toString().length > 0 ) &&
            (textFont.value.kind !== 'constant' || textFont.value.value.length > 0)&&(!(textField.value.value.toString().startsWith("##")));
        var hasIcon = (iconImage.value.kind !== 'constant' || iconImage.value.value && iconImage.value.value.length > 0)&&(!(textField.value.value.toString().startsWith("##")));
        var symbolSortKey = layout.get('symbol-sort-key');

        this.features = [];

        if (!hasText && !hasIcon) {
            return;
        }

        var icons = options.iconDependencies;
        var stacks = options.glyphDependencies;
        var globalProperties = new EvaluationParameters(this.zoom);

        for (var i$1 = 0, list$1 = features; i$1 < list$1.length; i$1 += 1) {
            var ref = list$1[i$1];
            var feature = ref.feature;
            var index = ref.index;
            var sourceLayerIndex = ref.sourceLayerIndex;

            if (!layer._featureFilter(globalProperties, feature)) {
                continue;
            }

            var text = (void 0);
            if (hasText) {
                // Expression evaluation will automatically coerce to Formatted
                // but plain string token evaluation skips that pathway so do the
                // conversion here.
                var resolvedTokens = layer.getValueAndResolveTokens('text-field', feature);
                text = transformText(resolvedTokens instanceof Formatted ?
                    resolvedTokens :
                    Formatted.fromString(resolvedTokens),
                    layer, feature);
            }

            var icon = (void 0);
            if (hasIcon) {
                icon = layer.getValueAndResolveTokens('icon-image', feature);
            }

            if (!text && !icon) {
                continue;
            }

            var sortKey = this.sortFeaturesByKey ?
                symbolSortKey.evaluate(feature, {}) :
                undefined;

            var symbolFeature = {
                text: text,
                icon: icon,
                index: index,
                sourceLayerIndex: sourceLayerIndex,
                geometry: utils.loadGeometry(feature),
                properties: feature.properties,
                type: Constant.geometryTypes[feature.type],
                sortKey: sortKey
            };

            if (typeof feature.id !== 'undefined') {
                symbolFeature.id = feature.id;
            }
            this.features.push(symbolFeature);

            if (icon) {
                icons[icon] = true;
            }

            if (text) {
                var fontStack = textFont.evaluate(feature, {}).join(',');
                var textAlongLine = layout.get('text-rotation-alignment') === 'map' && layout.get('symbol-placement') !== 'point';
                for (var i = 0, list = text.sections; i < list.length; i += 1) {
                    var section = list[i];

                    var doesAllowVerticalWritingMode = utils.allowsVerticalWritingMode(text.toString());
                    var sectionFont = section.fontStack || fontStack;
                    var sectionStack = stacks[sectionFont] = stacks[sectionFont] || {};
                    this.calculateGlyphDependencies(section.text, sectionStack, textAlongLine, doesAllowVerticalWritingMode);
                }
            }
        }

        if (layout.get('symbol-placement') === 'line') {
            this.features = mergeLines(this.features);
        }

        if (this.sortFeaturesByKey) {
            this.features.sort(function (a, b) {
                return ((a.sortKey)) - ((b.sortKey));
            });
        }
    };

    SymbolBucket.prototype.update = function update(states, vtLayer, imagePositions) {
        if (!this.stateDependentLayers.length) {
            return;
        }
        this.text.programConfigurations.updatePaintArrays(states, vtLayer, this.layers, imagePositions);
        this.icon.programConfigurations.updatePaintArrays(states, vtLayer, this.layers, imagePositions);
    };

    SymbolBucket.prototype.isEmpty = function isEmpty() {
        return this.symbolInstances.length === 0;
    };

    SymbolBucket.prototype.uploadPending = function uploadPending() {
        return !this.uploaded || this.text.programConfigurations.needsUpload || this.icon.programConfigurations.needsUpload;
    };

    SymbolBucket.prototype.upload = function upload(context) {
        if (!this.uploaded) {
            this.collisionBox.upload(context);
            this.collisionCircle.upload(context);
        }
        this.text.upload(context, this.sortFeaturesByY, !this.uploaded, this.text.programConfigurations.needsUpload);
        this.icon.upload(context, this.sortFeaturesByY, !this.uploaded, this.icon.programConfigurations.needsUpload);
        this.uploaded = true;
    };

    SymbolBucket.prototype.destroy = function destroy() {
        this.text.destroy();
        this.icon.destroy();
        this.collisionBox.destroy();
        this.collisionCircle.destroy();
    };

    SymbolBucket.prototype.addToLineVertexArray = function addToLineVertexArray(anchor, line) {
        var lineStartIndex = this.lineVertexArray.length;
        if (anchor.segment !== undefined) {
            var sumForwardLength = anchor.dist(line[anchor.segment + 1]);
            var sumBackwardLength = anchor.dist(line[anchor.segment]);
            var vertices = {};
            for (var i = anchor.segment + 1; i < line.length; i++) {
                vertices[i] = {x: line[i].x, y: line[i].y, tileUnitDistanceFromAnchor: sumForwardLength};
                if (i < line.length - 1) {
                    sumForwardLength += line[i + 1].dist(line[i]);
                }
            }
            for (var i$1 = anchor.segment || 0; i$1 >= 0; i$1--) {
                vertices[i$1] = {x: line[i$1].x, y: line[i$1].y, tileUnitDistanceFromAnchor: sumBackwardLength};
                if (i$1 > 0) {
                    sumBackwardLength += line[i$1 - 1].dist(line[i$1]);
                }
            }
            for (var i$2 = 0; i$2 < line.length; i$2++) {
                var vertex = vertices[i$2];
                this.lineVertexArray.emplaceBack(vertex.x, vertex.y, vertex.tileUnitDistanceFromAnchor);
            }
        }
        return {
            lineStartIndex: lineStartIndex,
            lineLength: this.lineVertexArray.length - lineStartIndex
        };
    };

    SymbolBucket.prototype.addSymbols = function addSymbols(arrays, quads, sizeVertex, lineOffset, alongLine,
                                                            feature, writingMode, labelAnchor, lineStartIndex, lineLength) {
        var indexArray = arrays.indexArray;
        var layoutVertexArray = arrays.layoutVertexArray;
        var dynamicLayoutVertexArray = arrays.dynamicLayoutVertexArray;

        var segment = arrays.segments.prepareSegment(4 * quads.length, arrays.layoutVertexArray, arrays.indexArray, feature.sortKey);
        var glyphOffsetArrayStart = this.glyphOffsetArray.length;
        var vertexStartIndex = segment.vertexLength;

        for (var i = 0, list = quads; i < list.length; i += 1) {

            var symbol = list[i];

            var tl = symbol.tl,
                tr = symbol.tr,
                bl = symbol.bl,
                br = symbol.br,
                tex = symbol.tex;

            var index = segment.vertexLength;

            var y = symbol.glyphOffset[1];
            addVertex(layoutVertexArray, labelAnchor.x, labelAnchor.y, tl.x, y + tl.y, tex.x, tex.y, sizeVertex);
            addVertex(layoutVertexArray, labelAnchor.x, labelAnchor.y, tr.x, y + tr.y, tex.x + tex.w, tex.y, sizeVertex);
            addVertex(layoutVertexArray, labelAnchor.x, labelAnchor.y, bl.x, y + bl.y, tex.x, tex.y + tex.h, sizeVertex);
            addVertex(layoutVertexArray, labelAnchor.x, labelAnchor.y, br.x, y + br.y, tex.x + tex.w, tex.y + tex.h, sizeVertex);

            addDynamicAttributes(dynamicLayoutVertexArray, labelAnchor, 0);

            indexArray.emplaceBack(index, index + 1, index + 2);
            indexArray.emplaceBack(index + 1, index + 2, index + 3);

            segment.vertexLength += 4;
            segment.primitiveLength += 2;

            this.glyphOffsetArray.emplaceBack(symbol.glyphOffset[0]);
        }

        // debugger;
        arrays.placedSymbolArray.emplaceBack(labelAnchor.x, labelAnchor.y,
            glyphOffsetArrayStart, this.glyphOffsetArray.length - glyphOffsetArrayStart, vertexStartIndex,
            lineStartIndex, lineLength, (labelAnchor.segment),
            sizeVertex ? sizeVertex[0] : 0, sizeVertex ? sizeVertex[1] : 0,
            lineOffset[0], lineOffset[1],
            writingMode, (false),
            // The crossTileID is only filled/used on the foreground for dynamic text anchors
            0);

        arrays.programConfigurations.populatePaintArrays(arrays.layoutVertexArray.length, feature, feature.index, {});
    };

    SymbolBucket.prototype._addCollisionDebugVertex = function _addCollisionDebugVertex(layoutVertexArray, collisionVertexArray, point, anchorX, anchorY, extrude) {
        collisionVertexArray.emplaceBack(0, 0);
        return layoutVertexArray.emplaceBack(
            // pos
            point.x,
            point.y,
            // a_anchor_pos
            anchorX,
            anchorY,
            // extrude
            Math.round(extrude.x),
            Math.round(extrude.y));
    };


    SymbolBucket.prototype.addCollisionDebugVertices = function addCollisionDebugVertices(x1, y1, x2, y2, arrays, boxAnchorPoint, symbolInstance, isCircle) {
        var segment = arrays.segments.prepareSegment(4, arrays.layoutVertexArray, arrays.indexArray);
        var index = segment.vertexLength;

        var layoutVertexArray = arrays.layoutVertexArray;
        var collisionVertexArray = arrays.collisionVertexArray;

        var anchorX = symbolInstance.anchorX;
        var anchorY = symbolInstance.anchorY;

        this._addCollisionDebugVertex(layoutVertexArray, collisionVertexArray, boxAnchorPoint, anchorX, anchorY, new pointGeometry(x1, y1));
        this._addCollisionDebugVertex(layoutVertexArray, collisionVertexArray, boxAnchorPoint, anchorX, anchorY, new pointGeometry(x2, y1));
        this._addCollisionDebugVertex(layoutVertexArray, collisionVertexArray, boxAnchorPoint, anchorX, anchorY, new pointGeometry(x2, y2));
        this._addCollisionDebugVertex(layoutVertexArray, collisionVertexArray, boxAnchorPoint, anchorX, anchorY, new pointGeometry(x1, y2));

        segment.vertexLength += 4;
        if (isCircle) {
            var indexArray = (arrays.indexArray);
            indexArray.emplaceBack(index, index + 1, index + 2);
            indexArray.emplaceBack(index, index + 2, index + 3);

            segment.primitiveLength += 2;
        } else {
            var indexArray$1 = (arrays.indexArray);
            indexArray$1.emplaceBack(index, index + 1);
            indexArray$1.emplaceBack(index + 1, index + 2);
            indexArray$1.emplaceBack(index + 2, index + 3);
            indexArray$1.emplaceBack(index + 3, index);

            segment.primitiveLength += 4;
        }
    };

    SymbolBucket.prototype.addDebugCollisionBoxes = function addDebugCollisionBoxes(startIndex, endIndex, symbolInstance) {
        for (var b = startIndex; b < endIndex; b++) {
            var box = (this.collisionBoxArray.get(b));
            var x1 = box.x1;
            var y1 = box.y1;
            var x2 = box.x2;
            var y2 = box.y2;

            // If the radius > 0, this collision box is actually a circle
            // The data we add to the buffers is exactly the same, but we'll render with a different shader.
            var isCircle = box.radius > 0;
            this.addCollisionDebugVertices(x1, y1, x2, y2, isCircle ? this.collisionCircle : this.collisionBox, box.anchorPoint, symbolInstance, isCircle);
        }
    };

    SymbolBucket.prototype.generateCollisionDebugBuffers = function generateCollisionDebugBuffers() {
        for (var i = 0; i < this.symbolInstances.length; i++) {
            var symbolInstance = this.symbolInstances.get(i);
            this.addDebugCollisionBoxes(symbolInstance.textBoxStartIndex, symbolInstance.textBoxEndIndex, symbolInstance);
            this.addDebugCollisionBoxes(symbolInstance.iconBoxStartIndex, symbolInstance.iconBoxEndIndex, symbolInstance);
        }
    };

    // These flat arrays are meant to be quicker to iterate over than the source
    // CollisionBoxArray
    SymbolBucket.prototype._deserializeCollisionBoxesForSymbol = function _deserializeCollisionBoxesForSymbol(collisionBoxArray, textStartIndex, textEndIndex, iconStartIndex, iconEndIndex) {
        var collisionArrays = {};
        for (var k = textStartIndex; k < textEndIndex; k++) {
            var box = (collisionBoxArray.get(k));
            if (box.radius === 0) {
                collisionArrays.textBox = {
                    x1: box.x1,
                    y1: box.y1,
                    x2: box.x2,
                    y2: box.y2,
                    anchorPointX: box.anchorPointX,
                    anchorPointY: box.anchorPointY
                };
                collisionArrays.textFeatureIndex = box.featureIndex;
                break; // Only one box allowed per instance
            } else {
                if (!collisionArrays.textCircles) {
                    collisionArrays.textCircles = [];
                    collisionArrays.textFeatureIndex = box.featureIndex;
                }
                var used = 1; // May be updated at collision detection time
                collisionArrays.textCircles.push(box.anchorPointX, box.anchorPointY, box.radius, box.signedDistanceFromAnchor, used);
            }
        }
        for (var k$1 = iconStartIndex; k$1 < iconEndIndex; k$1++) {
            // An icon can only have one box now, so this indexing is a bit vestigial...
            var box$1 = (collisionBoxArray.get(k$1));
            if (box$1.radius === 0) {
                collisionArrays.iconBox = {
                    x1: box$1.x1,
                    y1: box$1.y1,
                    x2: box$1.x2,
                    y2: box$1.y2,
                    anchorPointX: box$1.anchorPointX,
                    anchorPointY: box$1.anchorPointY
                };
                collisionArrays.iconFeatureIndex = box$1.featureIndex;
                break; // Only one box allowed per instance
            }
        }
        return collisionArrays;
    };

    SymbolBucket.prototype.deserializeCollisionBoxes = function deserializeCollisionBoxes(collisionBoxArray) {
        this.collisionArrays = [];
        for (var i = 0; i < this.symbolInstances.length; i++) {
            var symbolInstance = this.symbolInstances.get(i);
            this.collisionArrays.push(this._deserializeCollisionBoxesForSymbol(
                collisionBoxArray,
                symbolInstance.textBoxStartIndex,
                symbolInstance.textBoxEndIndex,
                symbolInstance.iconBoxStartIndex,
                symbolInstance.iconBoxEndIndex
            ));
        }
    };

    SymbolBucket.prototype.hasTextData = function hasTextData() {
        return this.text.segments.get().length > 0;
    };

    SymbolBucket.prototype.hasIconData = function hasIconData() {
        return this.icon.segments.get().length > 0;
    };

    SymbolBucket.prototype.hasCollisionBoxData = function hasCollisionBoxData() {
        return this.collisionBox.segments.get().length > 0;
    };

    SymbolBucket.prototype.hasCollisionCircleData = function hasCollisionCircleData() {
        return this.collisionCircle.segments.get().length > 0;
    };

    SymbolBucket.prototype.addIndicesForPlacedTextSymbol = function addIndicesForPlacedTextSymbol(placedTextSymbolIndex) {
        var placedSymbol = this.text.placedSymbolArray.get(placedTextSymbolIndex);

        var endIndex = placedSymbol.vertexStartIndex + placedSymbol.numGlyphs * 4;
        for (var vertexIndex = placedSymbol.vertexStartIndex; vertexIndex < endIndex; vertexIndex += 4) {
            this.text.indexArray.emplaceBack(vertexIndex, vertexIndex + 1, vertexIndex + 2);
            this.text.indexArray.emplaceBack(vertexIndex + 1, vertexIndex + 2, vertexIndex + 3);
        }
    };

    SymbolBucket.prototype.getSortedSymbolIndexes = function getSortedSymbolIndexes(angle) {
        if (this.sortedAngle === angle && this.symbolInstanceIndexes !== undefined) {
            return this.symbolInstanceIndexes;
        }
        var sin = Math.sin(angle);
        var cos = Math.cos(angle);
        var rotatedYs = [];
        var featureIndexes = [];
        var result = [];

        for (var i = 0; i < this.symbolInstances.length; ++i) {
            result.push(i);
            var symbolInstance = this.symbolInstances.get(i);
            rotatedYs.push(Math.round(sin * symbolInstance.anchorX + cos * symbolInstance.anchorY) | 0);
            featureIndexes.push(symbolInstance.featureIndex);
        }

        result.sort(function (aIndex, bIndex) {
            return (rotatedYs[aIndex] - rotatedYs[bIndex]) ||
                (featureIndexes[bIndex] - featureIndexes[aIndex]);
        });

        return result;
    };

    SymbolBucket.prototype.sortFeatures = function sortFeatures(angle) {
        var this$1 = this;

        if (!this.sortFeaturesByY) {
            return;
        }
        if (this.sortedAngle === angle) {
            return;
        }

        // The current approach to sorting doesn't sort across segments so don't try.
        // Sorting within segments separately seemed not to be worth the complexity.
        if (this.text.segments.get().length > 1 || this.icon.segments.get().length > 1) {
            return;
        }

        // If the symbols are allowed to overlap sort them by their vertical screen position.
        // The index array buffer is rewritten to reference the (unchanged) vertices in the
        // sorted order.

        // To avoid sorting the actual symbolInstance array we sort an array of indexes.
        this.symbolInstanceIndexes = this.getSortedSymbolIndexes(angle);
        this.sortedAngle = angle;

        this.text.indexArray.clear();
        this.icon.indexArray.clear();

        this.featureSortOrder = [];

        for (var i$1 = 0, list = this.symbolInstanceIndexes; i$1 < list.length; i$1 += 1) {
            var i = list[i$1];

            var symbolInstance = this.symbolInstances.get(i);
            this.featureSortOrder.push(symbolInstance.featureIndex);

            [
                symbolInstance.rightJustifiedTextSymbolIndex,
                symbolInstance.centerJustifiedTextSymbolIndex,
                symbolInstance.leftJustifiedTextSymbolIndex
            ].forEach(function (index, i, array) {
                // Only add a given index the first time it shows up,
                // to avoid duplicate opacity entries when multiple justifications
                // share the same glyphs.
                if (index >= 0 && array.indexOf(index) === i) {
                    this$1.addIndicesForPlacedTextSymbol(index);
                }
            });

            if (symbolInstance.verticalPlacedTextSymbolIndex >= 0) {
                this.addIndicesForPlacedTextSymbol(symbolInstance.verticalPlacedTextSymbolIndex);
            }

            var placedIcon = this.icon.placedSymbolArray.get(i);
            if (placedIcon.numGlyphs) {
                var vertexIndex = placedIcon.vertexStartIndex;
                this.icon.indexArray.emplaceBack(vertexIndex, vertexIndex + 1, vertexIndex + 2);
                this.icon.indexArray.emplaceBack(vertexIndex + 1, vertexIndex + 2, vertexIndex + 3);
            }
        }

        if (this.text.indexBuffer) {
            this.text.indexBuffer.updateData(this.text.indexArray);
        }
    };

    SymbolBucket.MAX_GLYPHS = 65535;
    SymbolBucket.addDynamicAttributes = addDynamicAttributes;
    return SymbolBucket;
});