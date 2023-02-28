define("com/huayun/webgis/layers/support/HyQuantizedMeshTerrainData", [
    "../../data/IndexDatatype"
], function (IndexDatatype) {
    var arrayScratch = [];

    function sortIndicesIfNecessary(indices, sortFunction, vertexCount) {
        arrayScratch.length = indices.length;

        var needsSort = false;
        for (var i = 0, len = indices.length; i < len; ++i) {
            arrayScratch[i] = indices[i];
            needsSort = needsSort || (i > 0 && sortFunction(indices[i - 1], indices[i]) > 0);
        }

        if (needsSort) {
            arrayScratch.sort(sortFunction);
            return IndexDatatype.createTypedArray(vertexCount, arrayScratch);
        }
        return indices;
    }

    function HyQuantizedMeshTerrainData(options) {
        this._quantizedVertices = options.quantizedVertices;
        this._encodedNormals = options.encodedNormals;
        this._indices = options.indices;
        this._minimumHeight = options.minimumHeight;
        this._maximumHeight = options.maximumHeight;
        this._boundingSphere = options.boundingSphere;
        this._orientedBoundingBox = options.orientedBoundingBox;
        this._horizonOcclusionPoint = options.horizonOcclusionPoint;
        this._credits = options.credits;

        var vertexCount = this._quantizedVertices.length / 3;
        var uValues = this._uValues = this._quantizedVertices.subarray(0, vertexCount);
        var vValues = this._vValues = this._quantizedVertices.subarray(vertexCount, 2 * vertexCount);
        this._heightValues = this._quantizedVertices.subarray(2 * vertexCount, 3 * vertexCount);

        // We don't assume that we can count on the edge vertices being sorted by u or v.
        function sortByV(a, b) {
            return vValues[a] - vValues[b];
        }

        function sortByU(a, b) {
            return uValues[a] - uValues[b];
        }

        this._westIndices = sortIndicesIfNecessary(options.westIndices, sortByV, vertexCount);
        this._southIndices = sortIndicesIfNecessary(options.southIndices, sortByU, vertexCount);
        this._eastIndices = sortIndicesIfNecessary(options.eastIndices, sortByV, vertexCount);
        this._northIndices = sortIndicesIfNecessary(options.northIndices, sortByU, vertexCount);
        this._westSkirtHeight = options.westSkirtHeight;
        this._southSkirtHeight = options.southSkirtHeight;
        this._eastSkirtHeight = options.eastSkirtHeight;
        this._northSkirtHeight = options.northSkirtHeight;

        this._childTileMask = options.childTileMask || 15;

        this._createdByUpsampling = options.createdByUpsampling !== undefined && options.createdByUpsampling !== null ? options.createdByUpsampling:false;
        this._waterMask = options.waterMask;
        this._mesh = undefined;
    }

    return HyQuantizedMeshTerrainData;
})