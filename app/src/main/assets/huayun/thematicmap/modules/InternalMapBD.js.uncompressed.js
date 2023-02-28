define("com/huayun/thematicmap/modules/InternalMapBD", [
    'dojo/Deferred',
    'dojo/request',
    'dojo/promise/all',
    '../../webgis/Map',
    '../../util/JSONFormatterUtil',
    '../../webgis/views/SceneView',
    '../../webgis/layers/FeatureLayer',
    '../../util/WKTGeometryFormater',
    "../../webgis/layers/LabelLayer"
], function(Deferred, request, all, Map, JSONFormatterUtil, SceneView, FeatureLayer, WKTGeometryFormater, LabelLayer) {
    function InternalMapBD(params, backFun) {
        this.backFun = backFun;
        this.wktGeometryFormatter = new WKTGeometryFormater();
        var shape = params.dataJSON.data[0]['SHAPE'];
        this.mapId = params.dataJSON.data[0]['BLOCK_ID'];
        this.diagramVo = params.diagramVo;
        var bgColor = params.diagramVo.diagramVo.environmentVo.bgColor;
        this.polygon = this.wktGeometryFormatter.toGeometry(shape);
        var wokerSpace = params.diagramVo.diagramVo.mapVo.workspace;
        this.service = params.diagramVo.dataSourceVo.services[wokerSpace];
        this.token = params.token;
        this.map = new Map();
        this.view = new SceneView({
            container: params.container,
            map: this.map,
            backgroundColor: 'rgb(' + bgColor + ')',
            rotateEnabled: false
        });
        this.view.setExtent(this.polygon.extent);
        this.currentRule = this.view.scale;
        this.list = params.diagramVo.diagramVo.mapVo.layerVoList;
        this.createLayer(this.list);
    }

    InternalMapBD.prototype.createLayer = function (list) {
        for (var i = list.length - 1; i > -1; i--) {
            var aLayerVo = list[i];
            aLayerVo.id = "FeatureLayer_" + i;
            var query = {
                url: this.service.description,
                filter: "block_id=" + this.mapId,
                access_token: this.token
            };
            if (query.filter !== "") {
                if (aLayerVo.dataSource.whereFilter !== "") {
                    query.filter = query.filter + "%26" + aLayerVo.dataSource.whereFilter;
                }
            } else {
                if (aLayerVo.dataSource.whereFilter !== "") {
                    query.filter = aLayerVo.dataSource.whereFilter;
                }
            }
            aLayerVo.query = query;
            aLayerVo.currentRule = this.getCurrentRule(aLayerVo.rules);
            var layer = new FeatureLayer(aLayerVo, function (featureData) {
                //todo 图层创建成功后的回调函数
            });
            this.map.addLayer(layer);
        }
        var labelLayer= new LabelLayer({
            id: "labelLayer",
            layers: this.map.allLayers
        });
        this.map.addLayer(labelLayer);
        var requestAnimationFrameId;

        var that = this;
        function _checkState() {
            requestAnimationFrameId = requestAnimationFrame(_checkState);
            var flag = true;
            for(var index in that.map.allLayers) {
                var layer = that.map.allLayers[index];
                flag = flag && layer.state;
            }
            if(flag) {
                cancelAnimationFrame(requestAnimationFrameId);
                that.view.setExtent(that.polygon.extent);
                that.backFun();
            }
        }
        _checkState.call(this);
    };

    InternalMapBD.prototype.getCurrentRule = function (rule) {
        for(var i = 0; i < rule.length; i++) {
            var aRule = rule[i];
            if(this.currentRule >= aRule.minScale && this.currentRule <= aRule.maxScale) {
                return aRule;
            }
        }
        return null;
    };

    InternalMapBD.prototype.update = function (params) {
        function extentRequest() {
            var aUrl = params.ptmsService.ptmsUrl + params.type + "?filter=DEV_ID=" + params.devId + "&access_token=" + params.ptmsService.accessToken;
            var deferred = new Deferred();
            request(aUrl).then(function (data) {
                deferred.resolve(data);
            });
            return deferred.promise;
        }
        all([extentRequest()]).then(function (results) {
            this.view.clear();
            this.wktGeometryFormatter = new WKTGeometryFormater();
            var request = JSONFormatterUtil.string2Json(results[0]);
            var shape = request.data[0]['SHAPE'];
            this.mapId = request.data[0]['BLOCK_ID'];
            this.polygon = this.wktGeometryFormatter.toGeometry(shape);
            this.view.setExtent(this.polygon.extent);
            this.currentRule = this.view.scale;

            this.createLayer(this.list);
        }.bind(this));
    };

    InternalMapBD.prototype.refresh = function () {
        this.view.clear();
        this.list = this.diagramVo.diagramVo.mapVo.layerVoList;
        this.createLayer(this.list);
    };

    InternalMapBD.prototype.clear = function () {
        this.view.clear();
        this.view.threeRender();
    }
    return InternalMapBD;
});
