/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   14:30
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/thematicmap/ThematicMapFactory", [
    "dojo/request",
    "./modules/SingleLineMap",
    "./modules/InternalMapPD",
    "./modules/InternalMapBD",
    "./modules/SystemMapDistrict",
    "./modules/SystemMapPSC",
    "./modules/DdSystemMap",
    "./modules/RegionMap",
    "../util/JSONFormatterUtil"
], function (request, SingleLineMap, InternalMapPD, InternalMapBD, SystemMapDistrict, SystemMapPSC, DdSystemMap, RegionMap, JSONFormatterUtil) {
    function ThematicMapFactory(params) {
        this.ptmsService = params.ptmsService;
        this.deviceParams = params.deviceParams;
        this.diagramVo = params.diagramVo;
        this.container = params.container;
        this.antialias = params.antialias;
    }

    ThematicMapFactory.prototype.createDiagram = function (type, result) {
        switch (type) {
            case "SingleLineMap":
                this._createSingleLineMap(type, result);
                break;
            case "InternalMapPD":
                this._createInternalMapPD(type, result);
                break;
            case "InternalMapBD":
                this._createInternalMapBD(type, result);
                break;
            case "SystemMapDistrict":
                this._createSystemMapDistrict(type, result);
                break;
            case "SystemMapPSC":
                this._createSystemMapPSC(type, result);
                break;
            case "DdSystemMap":
                this._createDdSystemMap(type, result);
                break;
            case "RegionMap":
                this._createRegionMap(type, result);
                break;
            case "InternalMapDY":
                this._createInternalMapDY(type, result);
                break;
        }
    };
    ThematicMapFactory.prototype._createSingleLineMap = function (type, result) {
        var aUrl = this.ptmsService.ptmsUrl + type + "?filter=DEV_ID=" + this.deviceParams.devId + "&access_token=" + this.ptmsService.accessToken;
        request(aUrl, {handleAs: "json"}).then(function (dataJSON) {
            var singleMap = new SingleLineMap({
                dataJSON: dataJSON,
                diagramVo: this.diagramVo,
                container: this.container,
                token: this.ptmsService.accessToken
            }, function () {
                result(singleMap);
                // debugger;
            });
            // debugger;
        }.bind(this));

    };

    ThematicMapFactory.prototype._createInternalMapPD = function (type, result) {
        var aUrl = this.ptmsService.ptmsUrl + type + "?filter=DEV_ID=" + this.deviceParams.devId + "&access_token=" + this.ptmsService.accessToken;
        request(aUrl).then.call(this, function (data) {
            var dataJSON = JSONFormatterUtil.string2Json(data);
            var internalMapPD = new InternalMapPD({
                dataJSON: dataJSON,
                diagramVo: this.diagramVo,
                container: this.container,
                token: this.ptmsService.accessToken
            }, function () {
                result(internalMapPD);
            });
            // debugger;
        }.bind(this));
    };

    ThematicMapFactory.prototype._createInternalMapBD = function (type, result) {
        var aUrl = this.ptmsService.ptmsUrl + type + "?filter=DEV_ID=" + this.deviceParams.devId + "&access_token=" + this.ptmsService.accessToken;
        request(aUrl).then.call(this, function (data) {
            var dataJSON = JSONFormatterUtil.string2Json(data);
            var internalMapBD = new InternalMapBD({
                dataJSON: dataJSON,
                diagramVo: this.diagramVo,
                container: this.container,
                token: this.ptmsService.accessToken
            }, function () {
                result(internalMapBD);
            });
            // debugger;
        }.bind(this));
    };

    ThematicMapFactory.prototype._createSystemMapDistrict = function (type, result) {
        var aUrl = this.ptmsService.ptmsUrl + type + "?filter=DEV_ID=" + this.deviceParams.devId + "&access_token=" + this.ptmsService.accessToken;
        request(aUrl).then.call(this, function (data) {
            var dataJSON = JSONFormatterUtil.string2Json(data);
            var systemMapDistrict = new SystemMapDistrict({
                dataJSON: dataJSON,
                diagramVo: this.diagramVo,
                container: this.container,
                token: this.ptmsService.accessToken
            }, function () {
                result(systemMapDistrict);
            });
        }.bind(this));
    };

    ThematicMapFactory.prototype._createSystemMapPSC = function (type, result) {
        var aUrl = this.ptmsService.ptmsUrl + type + "?filter=DEV_ID=" + this.deviceParams.devId + "&access_token=" + this.ptmsService.accessToken;
        request(aUrl).then.call(this, function (data) {
            var dataJSON = JSONFormatterUtil.string2Json(data);
            var systemMapPSC = new SystemMapPSC({
                dataJSON: dataJSON,
                diagramVo: this.diagramVo,
                container: this.container,
                token: this.ptmsService.accessToken
            }, function () {
                result(systemMapPSC);
            });
        }.bind(this));
    };

    ThematicMapFactory.prototype._createDdSystemMap = function (type, result) {
        var aUrl = this.ptmsService.ptmsUrl + type + "?filter=MAP_ID=" + this.deviceParams.mapId + "&access_token=" + this.ptmsService.accessToken;
        request(aUrl).then.call(this, function (data) {
            var dataJSON = JSONFormatterUtil.string2Json(data);
            var ddSystemMap = new DdSystemMap({
                dataJSON: dataJSON,
                diagramVo: this.diagramVo,
                container: this.container,
                token: this.ptmsService.accessToken,
                antialias: this.antialias
            }, function () {
                result(ddSystemMap);
            });
        }.bind(this));
    };

    ThematicMapFactory.prototype._createRegionMap = function (type, result) {
        var aUrl = this.ptmsService.ptmsUrl + type + "?filter=ORG_NO=" + this.deviceParams.devId + "&access_token=" + this.ptmsService.accessToken;
        request(aUrl).then.call(this, function (data) {
            var dataJSON = JSONFormatterUtil.string2Json(data);
            var regionMap = new RegionMap({
                dataJSON: dataJSON,
                diagramVo: this.diagramVo,
                container: this.container,
                token: this.ptmsService.accessToken
            }, function () {
                result(regionMap);
            });
        }.bind(this));
    };

    ThematicMapFactory.prototype._createInternalMapDY = function (type, result) {
        var aUrl = this.ptmsService.ptmsUrl + type + "?filter=DEV_ID=" + this.deviceParams.devId + "&access_token=" + this.ptmsService.accessToken;
        request(aUrl).then.call(this, function (data) {
            var dataJSON = JSONFormatterUtil.string2Json(data);
            var internalMapBD = new InternalMapBD({
                dataJSON: dataJSON,
                diagramVo: this.diagramVo,
                container: this.container,
                token: this.ptmsService.accessToken
            }, function () {
                result(internalMapBD);
            });
            // debugger;
        }.bind(this));
    }

    return ThematicMapFactory;
});
