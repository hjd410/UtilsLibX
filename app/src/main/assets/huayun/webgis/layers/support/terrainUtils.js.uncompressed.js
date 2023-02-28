define("com/huayun/webgis/layers/support/terrainUtils", [
    "exports",
    "../../geometry/Point",
    "./AttributeCompression",
    "./HyQuantizedMeshTerrainData",
    "../../data/ArrayType",
    "../../gl/SegmentVector",
], function (exports, Point, AttributeCompression, HyQuantizedMeshTerrainData, ArrayType, SegmentVector) {

    var SIXTY_FOUR_KILOBYTES = 64 * 1024;
    var _levelZeroMaximumGeometricError = 77067.33977995862;
    var littleEndianExtensionSize = 1;

    function createTypedArrayFromArrayBuffer(numberOfVertices, sourceArray, byteOffset, length) {
        if (numberOfVertices >= SIXTY_FOUR_KILOBYTES) {
            return new Uint32Array(sourceArray, byteOffset, length);
        }
        return new Uint16Array(sourceArray, byteOffset, length);
    }

    function createQuantizedMeshTerrainData(buffer, level, x, y) {
        var pos = 0;
        var cartesian3Elements = 3;
        var boundingSphereElements = cartesian3Elements + 1;
        var cartesian3Length = Float64Array.BYTES_PER_ELEMENT * cartesian3Elements;
        var boundingSphereLength = Float64Array.BYTES_PER_ELEMENT * boundingSphereElements;
        var encodedVertexElements = 3;
        var encodedVertexLength = Uint16Array.BYTES_PER_ELEMENT * encodedVertexElements;
        var triangleElements = 3;
        var bytesPerIndex = Uint16Array.BYTES_PER_ELEMENT;
        var triangleLength = bytesPerIndex * triangleElements;
        var view = new DataView(buffer);
        var center = new Point(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true));
        pos += cartesian3Length;

        var minimumHeight = view.getFloat32(pos, true);
        pos += Float32Array.BYTES_PER_ELEMENT;
        var maximumHeight = view.getFloat32(pos, true);
        pos += Float32Array.BYTES_PER_ELEMENT;

        var boundingSphere = {
            center: new Point(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true)),
            radius: view.getFloat64(pos + cartesian3Length, true)
        };
        pos += boundingSphereLength;

        var horizonOcclusionPoint = new Point(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true));
        pos += cartesian3Length;

        var vertexCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        var encodedVertexBuffer = new Uint16Array(buffer, pos, vertexCount * 3);
        pos += vertexCount * encodedVertexLength;

        if (vertexCount > 64 * 1024) {
            // More than 64k vertices, so indices are 32-bit.
            bytesPerIndex = Uint32Array.BYTES_PER_ELEMENT;
            triangleLength = bytesPerIndex * triangleElements;
        }

        // Decode the vertex buffer.
        var uBuffer = encodedVertexBuffer.subarray(0, vertexCount);
        var vBuffer = encodedVertexBuffer.subarray(vertexCount, 2 * vertexCount);
        var heightBuffer = encodedVertexBuffer.subarray(vertexCount * 2, 3 * vertexCount);

        AttributeCompression.zigZagDeltaDecode(uBuffer, vBuffer, heightBuffer);

        // skip over any additional padding that was added for 2/4 byte alignment
        if (pos % bytesPerIndex !== 0) {
            pos += (bytesPerIndex - (pos % bytesPerIndex));
        }

        var triangleCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        var indices = createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, triangleCount * triangleElements);
        pos += triangleCount * triangleLength;

        // High water mark decoding based on decompressIndices_ in webgl-loader's loader.js.
        // https://code.google.com/p/webgl-loader/source/browse/trunk/samples/loader.js?r=99#55
        // Copyright 2012 Google Inc., Apache 2.0 license.
        var highest = 0;
        var length = indices.length;
        for (var i = 0; i < length; ++i) {
            var code = indices[i];
            indices[i] = highest - code;
            if (code === 0) {
                ++highest;
            }
        }

        var westVertexCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        var westIndices = createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, westVertexCount);
        pos += westVertexCount * bytesPerIndex;

        var southVertexCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        var southIndices = createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, southVertexCount);
        pos += southVertexCount * bytesPerIndex;

        var eastVertexCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        var eastIndices = createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, eastVertexCount);
        pos += eastVertexCount * bytesPerIndex;

        var northVertexCount = view.getUint32(pos, true);
        pos += Uint32Array.BYTES_PER_ELEMENT;
        var northIndices = createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, northVertexCount);
        pos += northVertexCount * bytesPerIndex;

        var encodedNormalBuffer;
        var waterMaskBuffer;
        while (pos < view.byteLength) {
            var extensionId = view.getUint8(pos, true);
            pos += Uint8Array.BYTES_PER_ELEMENT;
            var extensionLength = view.getUint32(pos, littleEndianExtensionSize);
            pos += Uint32Array.BYTES_PER_ELEMENT;

            /*if (extensionId === QuantizedMeshExtensionIds.OCT_VERTEX_NORMALS && provider._requestVertexNormals) {
                encodedNormalBuffer = new Uint8Array(buffer, pos, vertexCount * 2);
            } else if (extensionId === QuantizedMeshExtensionIds.WATER_MASK && provider._requestWaterMask) {
                waterMaskBuffer = new Uint8Array(buffer, pos, extensionLength);
            } else if (extensionId === QuantizedMeshExtensionIds.METADATA && provider._requestMetadata) {
                var stringLength = view.getUint32(pos, true);
                if (stringLength > 0) {
                    var jsonString =
                        getStringFromTypedArray(new Uint8Array(buffer), pos + Uint32Array.BYTES_PER_ELEMENT, stringLength);
                    var metadata = JSON.parse(jsonString);
                    var availableTiles = metadata.available;
                    if (defined(availableTiles)) {
                        for (var offset = 0; offset < availableTiles.length; ++offset) {
                            var availableLevel = level + offset + 1;
                            var rangesAtLevel = availableTiles[offset];
                            var yTiles = provider._tilingScheme.getNumberOfYTilesAtLevel(availableLevel);

                            for (var rangeIndex = 0; rangeIndex < rangesAtLevel.length; ++rangeIndex) {
                                var range = rangesAtLevel[rangeIndex];
                                var yStart = yTiles - range.endY - 1;
                                var yEnd = yTiles - range.startY - 1;
                                provider.availability.addAvailableTileRange(availableLevel, range.startX, yStart, range.endX, yEnd);
                                layer.availability.addAvailableTileRange(availableLevel, range.startX, yStart, range.endX, yEnd);
                            }
                        }
                    }
                }
                layer.availabilityTilesLoaded.addAvailableTileRange(level, x, y, x, y);
            }*/
            pos += extensionLength;
        }

        var skirtHeight = 0; //_levelZeroMaximumGeometricError / (1 << level) * 5.0;

        // The skirt is not included in the OBB computation. If this ever
        // causes any rendering artifacts (cracks), they are expected to be
        // minor and in the corners of the screen. It's possible that this
        // might need to be changed - just change to `minimumHeight - skirtHeight`
        // A similar change might also be needed in `upsampleQuantizedTerrainMesh.js`.
        // var rectangle = provider.tileInfo.tileXYToRectangle(x, y, level);
        /*
        var orientedBoundingBox = OrientedBoundingBox.fromRectangle(rectangle, minimumHeight, maximumHeight, provider._tilingScheme.ellipsoid);*/

        return new HyQuantizedMeshTerrainData({
            center: center,
            minimumHeight: minimumHeight,
            maximumHeight: maximumHeight,
            boundingSphere: boundingSphere,
            orientedBoundingBox: null, //orientedBoundingBox,
            horizonOcclusionPoint: horizonOcclusionPoint,
            quantizedVertices: encodedVertexBuffer,
            encodedNormals: encodedNormalBuffer,
            indices: indices,
            westIndices: westIndices,
            southIndices: southIndices,
            eastIndices: eastIndices,
            northIndices: northIndices,
            westSkirtHeight: skirtHeight,
            southSkirtHeight: skirtHeight,
            eastSkirtHeight: skirtHeight,
            northSkirtHeight: skirtHeight,
            // childTileMask: provider.availability.computeChildMaskForTile(level, x, y),
            waterMask: waterMaskBuffer,
            // credits: provider._tileCredits
        });
    }

    exports.createQuantizedMeshTerrainData = createQuantizedMeshTerrainData;

    exports.createHyTerrainData = function (buffer, rectangle, mapResolution) {
        var view = new DataView(buffer);
        var pos = 0;
        var geometryX = view.getFloat64(pos, true);
        pos += 8;
        var geometryY = view.getFloat64(pos, true);
        pos += 8;
        var gapx = view.getFloat64(pos, true);
        pos += 8;
        var gapy = view.getFloat64(pos, true);
        pos += 8;
        /*var gapx = 31.3688566551768,
            gapy = 31.370313384726387*/

        var countY = view.getUint8(pos, true);
        pos += 1;
        var countX = view.getUint8(pos, true);
        pos += 1;
        // console.log(geometryX, geometryY, countX, countY);
        /*var heights = [];
        var index = 0;
        for (var i = 0; i < countY; i++) {
            for (var j = 0; j < countX; j++) {
                heights[index++] = view.getInt16(pos, true);
                pos += 2;
            }
        }*/
        var sx = rectangle.west,
            sy = rectangle.north;
        var ex = rectangle.east,
            ey = rectangle.south;

        var vertices = new ArrayType.StructArrayLayout3f12();
        var indices = new ArrayType.StructArrayLayout3ui6();
        var segments = new SegmentVector();
        var sampleCount = countX * countY;

        var segment = segments.prepareSegment(sampleCount, vertices, indices);
        var resolutionX = gapx;
        var resolutionY = gapy;
        var minH = Infinity,
            maxH = -Infinity;
        for (var n = 0; n < countY; n++) {
            for (var m = 0; m < countX; m++) {
                var height = view.getInt16(pos, true);
                pos += 2;
                if (height > maxH) {
                    maxH = height;
                }
                if (height < minH) {
                    minH = height;
                }
                var currentX = geometryX + m * resolutionX;
                var currentY = geometryY - n * resolutionY;
                var textureS = (currentX - sx) / mapResolution / 256;
                var textureT = (sy - currentY) / mapResolution / 256;
                vertices.emplaceBack(textureS, textureT, height);
            }
        }
        for (n = 0; n < countY - 1; n++) {
            for (m = 0; m < countX - 1; m++) {
                var one = n * countX + m;
                var two = (n + 1) * countX + m;
                var three = (n + 1) * countX + m + 1;
                var four = n * countX + m + 1;
                indices.emplaceBack(one, two, three);
                indices.emplaceBack(four, one, three);
            }
        }
        segment.vertexLength += sampleCount;
        segment.primitiveLength += indices.length;
        return {
            vertices: vertices,
            indices: indices,
            segments: segments,
            maxH: maxH,
            minH: minH
        }

        /*var pos = 0;
        var byteLength = view.byteLength;
        var sampleCount = byteLength / 2;
        console.log(sampleCount);
        var colCount = Math.sqrt(sampleCount);
        var rowCount = colCount;
        /!*var heights = [];
        for (var i = 0; i < sampleCount; i++) {
            h.push();
            pos += 2;
        }*!/
        var vertices = new ArrayType.StructArrayLayout3f12();
        var indices = new ArrayType.StructArrayLayout3ui6();
        var segments = new SegmentVector();

        var segment = segments.prepareSegment(sampleCount, vertices, indices);
        var minH = Infinity,
            maxH = -Infinity;
        for (var n = 0; n < rowCount; n++) {
            for (var m = 0; m < colCount; m++) {
                var height = view.getInt16(pos, true);
                pos += 2;
                if (height > maxH) {
                    maxH = height;
                }
                if (height < minH) {
                    minH = height;
                }
                vertices.emplaceBack(m/(colCount-1), n/(rowCount-1), height);
            }
        }
        for (n = 0; n < rowCount; n++) {
            for (m = 0; m < colCount; m++) {
                var one = n * colCount + m;
                var two = (n + 1) * colCount + m;
                var three = (n + 1) * colCount + m + 1;
                var four = n * colCount + m + 1;
                indices.emplaceBack(one, two, three);
                indices.emplaceBack(four, one, three);
            }
        }
        segment.vertexLength += sampleCount;
        segment.primitiveLength += indices.length;
        return {
            vertices: vertices,
            indices: indices,
            segments: segments,
            maxH: maxH,
            minH: minH
        }*/
    }
})