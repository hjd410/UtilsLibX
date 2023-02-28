define("com/huayun/webgis/datasource/JsonDataSource", [
    "exports",
    "require",
    "dojo/request",
    "../Feature",
    "../geometry/Point"
], function (exports, require, request, Feature, Point) {
    exports.getData = function (url) {
        return request.get(url, {handleAs: "json"}).then(function (data) {
            var fs = data.features;
            var result = [];
            for (var i = 0; i < fs.length; i++) {
                var f = fs[i];
                result.push(new Feature({
                    attribute: null,
                    geometry: new Point(f.point.x, f.point.y, f.point.z),
                    type: ""
                }));
            }
            return result;
        });
    };
});