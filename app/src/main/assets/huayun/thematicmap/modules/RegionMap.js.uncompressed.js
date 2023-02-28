define("com/huayun/thematicmap/modules/RegionMap", [
    'dojo/Deferred',
    'dojo/request',
    'dojo/promise/all',
    '../../webgis/Map',
    '../../util/JSONFormatterUtil',
    '../../webgis/views/SceneView',
    '../../webgis/layers/FeatureLayer',
    '../../util/WKTGeometryFormater',
    '../../webgis/layers/LabelLayer',
    '../../webgis/utils/Color'
], function(Deferred, request, all, Map, JSONFormatterUtil, SceneView, FeatureLayer, WKTGeometryFormater, LabelLayer, Color) {
    function RegionMap(params, backFun) {
        this.backFun = backFun;
        this.color = null;
        this.wktGeometryFormater = new WKTGeometryFormater();
        var shape = params.dataJSON.data[0]['SHAPE'];
        this.mapId = params.dataJSON.data[0]['ORG_TYPE'];
        var bgColor = params.diagramVo.diagramVo.environmentVo.bgColor;
        this.polygon = this.wktGeometryFormater.toGeometry(shape);
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

    RegionMap.prototype.createLayer = function (list) {
        for (var i = list.length - 1; i > -1; i--) {
            var aLayerVo = list[i];
            aLayerVo.id = "FeatureLayer_" + i;
            var query = {
                url: this.service.description,
                filter: "ORG_TYPE=" + this.mapId,
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
    }

    RegionMap.prototype.getCurrentRule = function (rule) {
        for(var i = 0; i < rule.length; i++) {
            var aRule = rule[i];
            if(this.currentRule >= aRule.minScale && this.currentRule <= aRule.maxScale) {
                return aRule;
            }
        }
        return null;
    }

    RegionMap.prototype.update = function (id, ptmsService, type) {
        function extentRequest() {
            var aUrl = ptmsService.ptmsUrl + type + "?filter=ORG_NO=" + id + "&access_token=" + ptmsService.accessToken;
            var deferred = new Deferred();
            request(aUrl).then(function (data) {
                deferred.resolve(data);
            });
            return deferred.promise;
        }
        all([extentRequest()]).then(function (results) {
            this.view.clear();
            this.wktGeometryFormater = new WKTGeometryFormater();
            var request = JSONFormatterUtil.string2Json(results[0]);
            if(request.data[0]['ORG_TYPE'] === "02") {
                this.list[0].dataSource.whereFilter = "org_type=03";
                var mapId = request.data[0]['ORG_TYPE'];
                this.query = {
                    url: this.service.description,
                    filter: "ORG_TYPE=" + mapId,
                    access_token: this.token
                };
            } else if (request.data[0]['ORG_TYPE'] === "03"){
                this.list[0].dataSource.whereFilter = "org_type=04";
                var mapId = request.data[0]['SUBBURO'];
                this.query = {
                    url: this.service.description,
                    filter: "P_ORG_NO=" + mapId,
                    access_token: this.token
                };
            }
            var shape = request.data[0]['SHAPE'];
            this.polygon = this.wktGeometryFormater.toGeometry(shape);
            this.view.setExtent(this.polygon.extent);
            this.currentRule = this.view.scale;
            this.createLayer(this.list);
        }.bind(this));
    };

    RegionMap.prototype.changeColor = function (graphic, flag) {
        if(flag === "0") {
            this.color = graphic.symbol.symbols[0].fillSymbol.color;
            var symbol = JSON.parse(JSON.stringify(graphic.symbol));
            var c = Color.parse("#0F0");
            symbol.symbols[0].fillSymbol.color = [c.r, c.g, c.b, c.a];
            symbol.symbols[0].fillSymbol.uniforms["u_color"] =  symbol.symbols[0].fillSymbol.color;
            symbol.symbols[0].fillSymbol.opacity = 1.0;
            symbol.symbols[0].fillSymbol.uniforms["u_opacity"] =  symbol.symbols[0].fillSymbol.opacity
            graphic.symbol = symbol;
        }else {
            var symbol = JSON.parse(JSON.stringify(graphic.symbol));
            var c = Color.parse(this.color);
            symbol.symbols[0].fillSymbol.color = [c.r, c.g, c.b, c.a];
            symbol.symbols[0].fillSymbol.uniforms["u_color"] =  symbol.symbols[0].fillSymbol.color;
            symbol.symbols[0].fillSymbol.opacity = 1.0;
            symbol.symbols[0].fillSymbol.uniforms["u_opacity"] =  symbol.symbols[0].fillSymbol.opacity
            graphic.symbol = symbol;
            this.color = null;
        }
        this.view.threeRender();
    };

    return RegionMap;
});
