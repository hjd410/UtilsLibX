define("com/huayun/webgis/layers/support/TerrainMesh", [], function () {
    function TerrainMesh(
        center, vertices, indices, indexCountWithoutSkirts, vertexCountWithoutSkirts, minimumHeight,
        maximumHeight, boundingSphere3D, occludeePointInScaledSpace,
        vertexStride, orientedBoundingBox, encoding, exaggeration,
        westIndicesSouthToNorth, southIndicesEastToWest, eastIndicesNorthToSouth, northIndicesWestToEast) {

        this.center = center;
        this.vertices = vertices;
        this.stride = vertexStride || 6;

        this.indices = indices;

        this.indexCountWithoutSkirts = indexCountWithoutSkirts;

        this.vertexCountWithoutSkirts = vertexCountWithoutSkirts;
        this.minimumHeight = minimumHeight;

        this.maximumHeight = maximumHeight;

        this.boundingSphere3D = boundingSphere3D;

        this.occludeePointInScaledSpace = occludeePointInScaledSpace;

        this.orientedBoundingBox = orientedBoundingBox;

        this.encoding = encoding;

        this.exaggeration = exaggeration;

        this.westIndicesSouthToNorth = westIndicesSouthToNorth;

        this.southIndicesEastToWest = southIndicesEastToWest;

        this.eastIndicesNorthToSouth = eastIndicesNorthToSouth;

        this.northIndicesWestToEast = northIndicesWestToEast;
    }

    return TerrainMesh;
})