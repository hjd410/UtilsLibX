define("com/huayun/webgis/utils/coordinateTransform", [
    "exports"
], function (exports) {
    var wgs84Radius = 6378137;

    exports.lngLatToMercatorXY = function (lng, lat) {
        89.99999 < lat ? lat = 89.99999 : -89.99999 > lat && (lat = -89.99999);
        lat *= .017453292519943;
        var x = .017453292519943 * lng * wgs84Radius;
        var y = .5 * wgs84Radius * Math.log((1 + Math.sin(lat)) / (1 - Math.sin(lat)));
        return [x, y];
    };

    exports.mercatorXYToLngLat = function (x, y) {
        x = x / wgs84Radius * 57.29577951308232;
        y = 57.29577951308232 * (Math.PI / 2 - 2 * Math.atan(Math.exp(-1 * y / wgs84Radius)));
        return [x, y];
    }
});