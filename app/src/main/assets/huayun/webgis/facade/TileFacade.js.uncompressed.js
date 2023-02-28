define("com/huayun/webgis/facade/TileFacade", ["exports", "../utils/Resource"], function (exports, Resource) {
    exports.getTileInfoData = function (url, callback) {
        var token = dojoConfig.token;
        var headers = token ? {
            headers: {"access-key": token}
        } : undefined;
        Resource.loadJson(url, headers, callback)
    }

    exports.loadTile = function (url, callback) {
        var token = dojoConfig.token;
        var options = token ? {
            headers: {"access-key": token}
        } : undefined;
        return Resource.loadImage(url, options, callback);
    }
})