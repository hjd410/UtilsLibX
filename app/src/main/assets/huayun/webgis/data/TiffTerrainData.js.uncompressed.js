define("com/huayun/webgis/data/TiffTerrainData", [
    "./ArrayType",
    "../gl/SegmentVector",
    "../gl/dataTransfer",
], function (ArrayType, SegmentVector, dataTransfer) {
    function TiffTerrainData(params) {
        this.version = params.version;
        this.imageWidth = params.imageWidth;
        this.imageHeight = params.imageHeight;
        var reference = params.reference || [];
        this.originX = reference[3];
        this.originY = reference[4];
        this.resolutionX = params.resolutions[0];
        this.resolutionY = params.resolutions[1];
        this.tileWidth = params.tileWidth;
        this.tileHeight = params.tileHeight;
        this.tiles = params.tiles;
    }

    /*TiffTerrainData.prototype.getTileColRow = function (x, y) {
        var col = (x - this.originX) / this.resolutionX / this.tileWidth;
        var row = (this.originY - y) / this.resolutionY / this.tileHeight;
        return {
            col: Math.floor(col),
            row: Math.floor(row)
        }
    }*/

    TiffTerrainData.prototype.createTerrainVertice = function (rectangle, mapResolution) {
        var sx = rectangle.west,
            sy = rectangle.north;
        var ex = rectangle.east,
            ey = rectangle.south;
        var vertices = new ArrayType.StructArrayLayout3f12();
        var indices = new ArrayType.StructArrayLayout3ui6();
        var segments = new SegmentVector();

        var segment = segments.prepareSegment(cellCountX * cellCountX, vertices, indices);
        var sxpixels = Math.floor((sx - this.originX) / this.resolutionX);
        var sypixels = Math.floor((this.originY - sy) / this.resolutionY);
        var expixels = Math.ceil((ex - this.originX) / this.resolutionX);
        var eypixels = Math.ceil((this.originY - ey) / this.resolutionY);
        var cellCountX = expixels - sxpixels;
        var cellCountY = eypixels - sypixels;
        var minH = Infinity,
            maxH = -Infinity;
        for (var n = sypixels; n <= eypixels; n++) {
            for (var m = sxpixels; m <= expixels; m++) {
                var height = this.tiles[n][m];
                if (height > maxH) {
                    maxH = height;
                }
                if (height < minH) {
                    minH = height;
                }
                var xpixelGeometry = m * this.resolutionX + this.originX;
                var ypixelGeometry = this.originY - n * this.resolutionY;
                var deltaGeometryX = xpixelGeometry - sx;
                var deltaGeometryY = sy - ypixelGeometry;
                var textureS = deltaGeometryX / mapResolution / 256;
                var textureT = deltaGeometryY / mapResolution / 256;
                vertices.emplaceBack(textureS, textureT, height);
            }
        }
        var patchX = cellCountX + 1;
        for (n = 0; n < cellCountY; n++) {
            for (m = 0; m < cellCountX; m++) {
                var one = n * patchX + m;
                var two = (n + 1) * patchX + m;
                var three = (n + 1) * patchX + m + 1;
                var four = n * patchX + m + 1;
                indices.emplaceBack(one, two, three);
                indices.emplaceBack(four, one, three);
            }
        }
        segment.vertexLength += (cellCountX + 1) * (cellCountX + 1);
        segment.primitiveLength += indices.length;

        return {
            vertices: vertices,
            indices: indices,
            segments: segments,
            maxH: maxH,
            minH: minH
        }
    }

    /*TiffTerrainData.prototype.createTerrainVertice = function (rectangle, mapResolution) {
        var westNorth = this.getTileColRow(rectangle.west, rectangle.north);
        var eastSouth = this.getTileColRow(rectangle.east, rectangle.south);
        var sx = rectangle.west,
            sy = rectangle.north;
        var ex = rectangle.east,
            ey = rectangle.south;
        var vertices = new ArrayType.StructArrayLayout3f12();
        var indices = new ArrayType.StructArrayLayout3ui6();
        var segments = new SegmentVector();
        var maxH = -Infinity;
        var segment = segments.prepareSegment(cellCountX*cellCountX, vertices, indices);
        for (var j = westNorth.row; j <= eastSouth.row; j++) {
            for (var i = westNorth.col; i <= eastSouth.col; i++) {
                var tile = this.tiles[i + "-" + j];
                var sxpixels = Math.floor((sx - this.originX) / this.resolutionX);
                var sypixels = Math.floor((this.originY - sy) / this.resolutionY);
                var expixels = Math.ceil((ex - this.originX) / this.resolutionX);
                var eypixels = Math.ceil((this.originY - ey) / this.resolutionY);
                var cellCountX = expixels - sxpixels + 1;
                var cellCountY = eypixels - sypixels + 1;
                for (var n = sypixels; n <= eypixels; n++) {
                    for (var m = sxpixels; m <= expixels; m++) {
                        var deltaX = m - (i * this.tileWidth);
                        var deltaY = n - (j * this.tileHeight);
                        var height = tile[deltaY * this.tileWidth + deltaX];
                        if (height > maxH) {
                            maxH = height;
                        }
                        var xpixelGeometry = m * this.resolutionX + this.originX;
                        var ypixelGeometry = this.originY - n * this.resolutionY;
                        var deltaGeometryX = xpixelGeometry - sx;
                        var deltaGeometryY = sy - ypixelGeometry;
                        var textureS = deltaGeometryX / mapResolution / 256;
                        var textureT = deltaGeometryY / mapResolution / 256;
                        vertices.emplaceBack(textureS, textureT, height);
                        /!*vertices[dstOffset++] = height;
                        vertices[dstOffset++] = textureS;
                        vertices[dstOffset++] = textureT;*!/
                    }
                }
                console.log(maxH);

                for (n = 0; n < cellCountY; n++) {
                    for (m = 0; m < cellCountX; m++) {
                        var one = n * cellCountX + m;
                        var two = (n + 1) * cellCountX + m;
                        var three = (n + 1) * cellCountX + m + 1;
                        var four = n * cellCountX + m + 1;
                        indices.emplaceBack(one, two, three);
                        indices.emplaceBack(four, one, three);
                        /!*indices[indiceOffset++] = one;
                        indices[indiceOffset++] = two;
                        indices[indiceOffset++] = three;

                        indices[indiceOffset++] = four;
                        indices[indiceOffset++] = one;
                        indices[indiceOffset++] = three;*!/
                    }
                }
                segment.vertexLength += cellCountX * cellCountX;
                segment.primitiveLength += indices.length;
            }
        }
        return {
            vertices: vertices,
            indices: indices,
            segments: segments
        }
    }*/
    dataTransfer.register('TiffTerrainData', TiffTerrainData, {omit: ['version', 'imageWidth', 'imageHeight']});
    return TiffTerrainData;
})