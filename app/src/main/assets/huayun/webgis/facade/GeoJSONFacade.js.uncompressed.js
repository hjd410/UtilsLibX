define(
    "com/huayun/webgis/facade/GeoJSONFacade", [
        "dojo/_base/declare",
        "dojo/request",
        "dojo/request/handlers",
        "dojo/request/script"
    ], function (declare, request, handlers, script) {

        var TILE_SIZE = 256;
        var originX = -5466274.966255;
        var originY = 10345174.966255;
        var resolution = 8669.8840064346805;

        _Pixel2ToXian80 = function (type, pixel, col, row, level) {
            var r = resolution / (1 << level);
            var polygonArr = [];
            for (var i = 0; i < pixel.length; i++) {
                var arr = [];
                if (i % 2 == 0) {
                    var x = Math.floor(((pixel[i] / TILE_SIZE / 16 + col) * r * TILE_SIZE + originX) * 100) / 100;//保留两位小数
                    var y = Math.floor((originY - (pixel[i + 1] / TILE_SIZE / 16 + row) * r * TILE_SIZE) * 100) / 100;//保留两位小数
                    arr.push(x);
                    arr.push(y);
                    polygonArr.push(arr);
                }
            }
            return polygonArr;
        };

        _getFeatureCollection = function (features) {
            return {
                "type": "FeatureCollection",
                "features": features
            }
        }

        _getFeature = function (coordinates,properties, type) {
            return {
                "type": "Feature",
                "geometry": _getGeometrys(coordinates, type),
                "properties":_getProperties(properties)
            }
        }
        _getGeometrys = function (coordinates, type) {
            return {
                "type": type,
                "coordinates":[coordinates]
            }
        }

        _getProperties = function (properties) {
            return properties;
        }

        return declare("com.huayun..webgis.facade.GeoJSONFacade", null, {
            _url: "",
            _reg: /{\w}/,

            constructor: function () {
                this._url = arguments[0].url;
            },
            getGeoJSON: function (level, col, row) {
                var url = this._url, obj = this;
                url = url.replace(this._reg, level).replace(this._reg, col).replace(this._reg, row);
                return new Promise(function (resolve, reject) {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", url);
                    xhr.responseType = "arraybuffer";
                    xhr.onload = function () {
                        var data = xhr.response;
                        var format = new ol.format.MVT();
                        var features = format.readFeatures(data);
                        var arrFeatures = [];
                        for (var i = 0; i < features.length; i++) {
                            var type = features[i].type_;
                            var pixel = features[i].flatCoordinates_;
                            var properties = features[i].properties_;
                            var geo = _Pixel2ToXian80(type, pixel, col, row, level);
                            arrFeatures.push(_getFeature(geo,properties, type));
                        }
                        resolve(_getFeatureCollection(arrFeatures));
                    };
                    xhr.send();
                });
            }
        });
    });