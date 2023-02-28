define("com/huayun/webgis/facade/tiffTerrainFacade2", [
    "exports",
    "dojo/request",
    "../data/TiffTerrainData",
    "./TiffTagEnum"
], function (exports, request, TiffTerrainData, TiffTagEnum) {
    var typeFunc = {
        4: {
            func: "getUint32",
            bytes: 4
        },
        12: {
            func: "getFloat64",
            bytes: 8
        },
        2: {
            func: "getUint8",
            bytes: 1
        },
        3: {
            func: "getUint16",
            bytes: 2
        }
    }

    function loadTifTerrain(url, success, error) {
        request.get(url, {handleAs: "arraybuffer"}).then(function (buffer) {
            var view = new DataView(buffer);
            var pos = 0;
            var start = view.getUint16(pos, true);
            pos += 2;
            var version = view.getUint16(pos, true);
            pos += 2;
            // IFD数据的偏移
            var IFDOffset = view.getUint32(pos, true);
            pos = IFDOffset;
            var deNum = view.getUint16(pos, true); // IFD的数目
            pos += 2;
            var tags = {};
            var offsetTags = [];
            for (var i = 0; i < deNum; i++) {
                var tag = view.getUint16(pos, true)
                pos += 2;
                var type = view.getUint16(pos, true);
                pos += 2;
                var len = view.getUint32(pos, true);
                pos += 4;
                if (len === 1) {
                    var value = view.getUint32(pos, true);
                    tags[TiffTagEnum[tag]] = {
                        type: type,
                        len: len,
                        value: value
                    }
                } else {
                    var offset = view.getUint32(pos, true);
                    tags[TiffTagEnum[tag]] = {
                        type: type,
                        len: len,
                        offset: offset
                    }
                    offsetTags.push(TiffTagEnum[tag]);
                }
                pos += 4;
            }
            offsetTags.forEach(function (t) {
                var item = tags[t];
                pos = item.offset;
                var len = item.len;
                var type = item.type;
                var result = [];
                var handleFun = typeFunc[type].func;
                var bytes = typeFunc[type].bytes;
                for (i = 0; i < len; i++) {
                    result.push(view[handleFun](pos, true));
                    pos += bytes;
                }
                if (t === "GeoAsciiParamsTag" || t === "GdalMetadata" || t === "GdalNoData") {
                    var str = "";
                    result.forEach(function (code) {
                        str += String.fromCharCode(code);
                    });
                    item.value = str;
                } else {
                    item.value = result;
                }
            });

            debugger;
            // 地形数据解析
            var noData = tags.GdalNoData.value.trim();
            noData = parseFloat(noData);
            console.log(noData);
            var tileWidth = tags.TileWidth.value,
                tileHeight = tags.TileHeight.value,
                imageWidth = tags.ImageWidth.value,
                imageHeight = tags.ImageHeight.value;
            var tiles = [];
            var colCount = Math.ceil(imageWidth / tileWidth);
            var rowCount = Math.ceil(imageHeight / tileHeight);
            for (i = 0; i < imageWidth; i++) {
                var heights = [];
                var row = Math.floor(i / tileHeight);
                var count = 0;
                var posOffset = (i % tileHeight) * tileWidth * 4;
                for (var j = 0; j < colCount; j++) {
                    var tileIndex = row * rowCount + j;
                    pos = tags.TileOffsets.value[tileIndex] + posOffset;
                    for (var k = 0; k < tileWidth; k++) {
                        var h = view.getFloat32(pos, true);
                        if (h < -3.3e+38){
                            h = 0;
                        }
                        heights[count++] = h;
                        pos += 4;
                    }
                }
                tiles.push(heights);
            }
            // 坐标系字符串解析

            // gdalmetadata字符串解析

            //Test
            /*var tile = tiles["0-0"];
            for (var m = 0; m < 10; m++) {
                for (var n = 0; n < 2; n++) {
                    var arrayIndex = m * 128 + n;
                    console.log(tile[arrayIndex]);
                }
            }*/
            var result = {
                version: version,
                imageWidth: imageWidth,
                imageHeight: imageHeight,
                reference: tags.GeoreferenceTag.value,
                resolutions: tags.ModelPixelScaleTag.value,
                tileWidth: tileWidth,
                tileHeight: tileHeight,
                tiles: tiles
            }
            success(new TiffTerrainData(result));
        }).catch(error)
    }

    exports.loadTifTerrain = loadTifTerrain;
})