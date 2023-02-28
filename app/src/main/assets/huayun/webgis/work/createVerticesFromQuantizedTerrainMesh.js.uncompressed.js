define("com/huayun/webgis/work/createVerticesFromQuantizedTerrainMesh", [
    "../utils/MathUtils",
    "../data/IndexDatatype"
], function (MathUtils, IndexDatatype) {
    var maxShort = 32767;

    var cartographicScratch = {
        longitude: 0,
        latitude: 0,
        height: 0
    };

    var toPack = {
        x: 0,
        y: 0
    };

    function defined(value) {
        return value !== undefined && value !== null;
    }

    function encode(vertexBuffer, bufferIndex, position, uv, height, normalToPack, webMercatorT) {
        var u = uv.x;
        var v = uv.y;

        // Cartesian2.Cartesian3.subtract(position, this.center, cartesian3Scratch);

        /*vertexBuffer[bufferIndex++] = cartesian3Scratch.x;
        vertexBuffer[bufferIndex++] = cartesian3Scratch.y;
        vertexBuffer[bufferIndex++] = cartesian3Scratch.z;*/
        vertexBuffer[bufferIndex++] = 0;
        vertexBuffer[bufferIndex++] = 0;
        vertexBuffer[bufferIndex++] = 0;
        vertexBuffer[bufferIndex++] = height;
        vertexBuffer[bufferIndex++] = u;
        vertexBuffer[bufferIndex++] = v;
        vertexBuffer[bufferIndex++] = webMercatorT;
        return bufferIndex;
    }

    function copyAndSort(typedArray, comparator) {
        var copy;
        if (typeof typedArray.slice === 'function') {
            copy = typedArray.slice();
            if (typeof copy.sort !== 'function') {
                copy = undefined;
            }
        }

        if (!defined(copy)) {
            copy = Array.prototype.slice.call(typedArray);
        }

        copy.sort(comparator);

        return copy;
    }

    function findMinMaxSkirts(edgeIndices, edgeHeight, heights, uvs, rectangle) {
        var hMin = Number.POSITIVE_INFINITY;
        var north = rectangle.north;
        var south = rectangle.south;
        var east = rectangle.east;
        var west = rectangle.west;

        var length = edgeIndices.length;
        for (var i = 0; i < length; ++i) {
            var index = edgeIndices[i];
            var h = heights[index];
            var uv = uvs[index];

            cartographicScratch.longitude = MathUtils.lerp(west, east, uv.x);
            cartographicScratch.latitude = MathUtils.lerp(south, north, uv.y);
            cartographicScratch.height = h - edgeHeight;
            hMin = Math.min(hMin, cartographicScratch.height);
        }
        return hMin;
    }

    function addSkirt(vertexBuffer, vertexBufferIndex, edgeVertices, heights, uvs, octEncodedNormals, rectangle, skirtLength, exaggeration, longitudeOffset, latitudeOffset) {
        var hasVertexNormals = false;
        var north = rectangle.north;
        var south = rectangle.south;
        var east = rectangle.east;
        var west = rectangle.west;
        var length = edgeVertices.length;
        for (var i = 0; i < length; ++i) {
            var index = edgeVertices[i];
            var h = heights[index];
            var uv = uvs[index];

            cartographicScratch.longitude = MathUtils.lerp(west, east, uv.x) + longitudeOffset;
            cartographicScratch.latitude = MathUtils.lerp(south, north, uv.y) + latitudeOffset;
            cartographicScratch.height = h - skirtLength;

            var position = cartographicScratch;

            var webMercatorT = 0;
            vertexBufferIndex = encode(vertexBuffer, vertexBufferIndex, position, uv, cartographicScratch.height, toPack, webMercatorT);
        }
    }

    function terrainProviderAddSkirtIndices(westIndicesSouthToNorth, southIndicesEastToWest, eastIndicesNorthToSouth, northIndicesWestToEast, vertexCount, indices, offset) {
        var vertexIndex = vertexCount;
        offset = addSkirtIndices(westIndicesSouthToNorth, vertexIndex, indices, offset);
        vertexIndex += westIndicesSouthToNorth.length;
        offset = addSkirtIndices(southIndicesEastToWest, vertexIndex, indices, offset);
        vertexIndex += southIndicesEastToWest.length;
        offset = addSkirtIndices(eastIndicesNorthToSouth, vertexIndex, indices, offset);
        vertexIndex += eastIndicesNorthToSouth.length;
        addSkirtIndices(northIndicesWestToEast, vertexIndex, indices, offset);
    }

    function addSkirtIndices(edgeIndices, vertexIndex, indices, offset) {
        var previousIndex = edgeIndices[0];

        var length = edgeIndices.length;
        for (var i = 1; i < length; ++i) {
            var index = edgeIndices[i];

            indices[offset++] = previousIndex;
            indices[offset++] = index;
            indices[offset++] = vertexIndex;

            indices[offset++] = vertexIndex;
            indices[offset++] = index;
            indices[offset++] = vertexIndex + 1;

            previousIndex = index;
            ++vertexIndex;
        }

        return offset;
    }

    function createVerticesFromQuantizedTerrainMesh(parameters) {
        var quantizedVertices = parameters.quantizedVertices;
        var quantizedVertexCount = quantizedVertices.length / 3;
        var octEncodedNormals = parameters.octEncodedNormals;
        var edgeVertexCount = parameters.westIndices.length + parameters.eastIndices.length +
            parameters.southIndices.length + parameters.northIndices.length;
        var includeWebMercatorT = parameters.includeWebMercatorT;

        var rectangle = parameters.rectangle;
        var west = rectangle.west;
        var south = rectangle.south;
        var east = rectangle.east;
        var north = rectangle.north;
        var exaggeration = parameters.exaggeration;
        var minimumHeight = parameters.minimumHeight * exaggeration;
        var maximumHeight = parameters.maximumHeight * exaggeration;

        var uBuffer = quantizedVertices.subarray(0, quantizedVertexCount);
        var vBuffer = quantizedVertices.subarray(quantizedVertexCount, 2 * quantizedVertexCount);
        var heightBuffer = quantizedVertices.subarray(quantizedVertexCount * 2, 3 * quantizedVertexCount);
        var hasVertexNormals = false;

        var uvs = new Array(quantizedVertexCount);
        var heights = new Array(quantizedVertexCount);
        var positions = new Array(quantizedVertexCount);
        var webMercatorTs = includeWebMercatorT ? new Array(quantizedVertexCount) : [];

        var minimum = {
            x: Number.POSITIVE_INFINITY,
            y: Number.POSITIVE_INFINITY,
            z: Number.POSITIVE_INFINITY
        }

        var maximum = {
            x: Number.NEGATIVE_INFINITY,
            y: Number.NEGATIVE_INFINITY,
            z: Number.NEGATIVE_INFINITY
        };

        var minLongitude = Number.POSITIVE_INFINITY;
        var maxLongitude = Number.NEGATIVE_INFINITY;
        var minLatitude = Number.POSITIVE_INFINITY;
        var maxLatitude = Number.NEGATIVE_INFINITY;

        for (var i = 0; i < quantizedVertexCount; ++i) {
            var rawU = uBuffer[i];
            var rawV = vBuffer[i];

            var u = rawU / maxShort;
            var v = rawV / maxShort;
            var height = MathUtils.lerp(minimumHeight, maximumHeight, heightBuffer[i] / maxShort);

            cartographicScratch.longitude = MathUtils.lerp(west, east, u);
            cartographicScratch.latitude = MathUtils.lerp(south, north, v);
            cartographicScratch.height = height;

            minLongitude = Math.min(cartographicScratch.longitude, minLongitude);
            maxLongitude = Math.max(cartographicScratch.longitude, maxLongitude);
            minLatitude = Math.min(cartographicScratch.latitude, minLatitude);
            maxLatitude = Math.max(cartographicScratch.latitude, maxLatitude);

            uvs[i] = {
                x: u,
                y: v
            };
            heights[i] = height;
            positions[i] = cartographicScratch;
            webMercatorTs[i] = 0;

            /*if (includeWebMercatorT) {
                webMercatorTs[i] = (WebMercatorProjection.WebMercatorProjection.geodeticLatitudeToMercatorAngle(cartographicScratch.latitude) - southMercatorY) * oneOverMercatorHeight;
            }

            Transforms.Matrix4.multiplyByPoint(toENU, position, cartesian3Scratch);

            Cartesian2.Cartesian3.minimumByComponent(cartesian3Scratch, minimum, minimum);
            Cartesian2.Cartesian3.maximumByComponent(cartesian3Scratch, maximum, maximum);*/
        }

        var westIndicesSouthToNorth = copyAndSort(parameters.westIndices, function (a, b) {
            return uvs[a].y - uvs[b].y;
        });
        var eastIndicesNorthToSouth = copyAndSort(parameters.eastIndices, function (a, b) {
            return uvs[b].y - uvs[a].y;
        });
        var southIndicesEastToWest = copyAndSort(parameters.southIndices, function (a, b) {
            return uvs[b].x - uvs[a].x;
        });
        var northIndicesWestToEast = copyAndSort(parameters.northIndices, function (a, b) {
            return uvs[a].x - uvs[b].x;
        });

        var orientedBoundingBox;
        var boundingSphere;
        var occludeePointInScaledSpace;

        var hMin = minimumHeight;
        hMin = Math.min(hMin, findMinMaxSkirts(parameters.westIndices, parameters.westSkirtHeight, heights, uvs, rectangle));
        hMin = Math.min(hMin, findMinMaxSkirts(parameters.southIndices, parameters.southSkirtHeight, heights, uvs, rectangle));
        hMin = Math.min(hMin, findMinMaxSkirts(parameters.eastIndices, parameters.eastSkirtHeight, heights, uvs, rectangle));
        hMin = Math.min(hMin, findMinMaxSkirts(parameters.northIndices, parameters.northSkirtHeight, heights, uvs, rectangle));

        var vertexStride = 7;
        var size = quantizedVertexCount * vertexStride + edgeVertexCount * vertexStride;
        var vertexBuffer = new Float32Array(size);

        var bufferIndex = 0;
        for (var j = 0; j < quantizedVertexCount; ++j) {
            bufferIndex = encode(vertexBuffer, bufferIndex, positions[j], uvs[j], heights[j], toPack, webMercatorTs[j]);
        }

        var edgeTriangleCount = Math.max(0, (edgeVertexCount - 4) * 2);
        var indexBufferLength = parameters.indices.length + edgeTriangleCount * 3;
        var indexBuffer = IndexDatatype.createTypedArray(quantizedVertexCount + edgeVertexCount, indexBufferLength);
        indexBuffer.set(parameters.indices, 0);

        var percentage = 0.0001;
        var lonOffset = (maxLongitude - minLongitude) * percentage;
        var latOffset = (maxLatitude - minLatitude) * percentage;
        var westLongitudeOffset = -lonOffset;
        var westLatitudeOffset = 0.0;
        var eastLongitudeOffset = lonOffset;
        var eastLatitudeOffset = 0.0;
        var northLongitudeOffset = 0.0;
        var northLatitudeOffset = latOffset;
        var southLongitudeOffset = 0.0;
        var southLatitudeOffset = -latOffset;

        // Add skirts.
        var vertexBufferIndex = quantizedVertexCount * vertexStride;
        addSkirt(vertexBuffer, vertexBufferIndex, westIndicesSouthToNorth, heights, uvs, octEncodedNormals, rectangle, parameters.westSkirtHeight, exaggeration, westLongitudeOffset, westLatitudeOffset);
        vertexBufferIndex += parameters.westIndices.length * vertexStride;
        addSkirt(vertexBuffer, vertexBufferIndex, southIndicesEastToWest, heights, uvs, octEncodedNormals, rectangle, parameters.southSkirtHeight, exaggeration, southLongitudeOffset, southLatitudeOffset);
        vertexBufferIndex += parameters.southIndices.length * vertexStride;
        addSkirt(vertexBuffer, vertexBufferIndex, eastIndicesNorthToSouth, heights, uvs, octEncodedNormals, rectangle, parameters.eastSkirtHeight, exaggeration, eastLongitudeOffset, eastLatitudeOffset);
        vertexBufferIndex += parameters.eastIndices.length * vertexStride;
        addSkirt(vertexBuffer, vertexBufferIndex, northIndicesWestToEast, heights, uvs, octEncodedNormals, rectangle, parameters.northSkirtHeight, exaggeration, northLongitudeOffset, northLatitudeOffset);

        terrainProviderAddSkirtIndices(westIndicesSouthToNorth, southIndicesEastToWest, eastIndicesNorthToSouth, northIndicesWestToEast, quantizedVertexCount, indexBuffer, parameters.indices.length);


        return {
            vertices: vertexBuffer.buffer,
            indices: indexBuffer.buffer,
            westIndicesSouthToNorth: westIndicesSouthToNorth,
            southIndicesEastToWest: southIndicesEastToWest,
            eastIndicesNorthToSouth: eastIndicesNorthToSouth,
            northIndicesWestToEast: northIndicesWestToEast,
            vertexStride: vertexStride,
            center: undefined,
            minimumHeight: minimumHeight,
            maximumHeight: maximumHeight,
            boundingSphere: boundingSphere,
            orientedBoundingBox: orientedBoundingBox,
            occludeePointInScaledSpace: occludeePointInScaledSpace,
            encoding: undefined,
            indexCountWithoutSkirts: parameters.indices.length
        };
    }

    return createVerticesFromQuantizedTerrainMesh;
})