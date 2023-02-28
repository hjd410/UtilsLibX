/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/20
 *  @time   :   13:54
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/thematicmap/thematicmap", [
        "exports",
        "dojo/Deferred",
        "dojo/request",
        "dojo/promise/all",
        "./tool/FileParse",
        "./tool/FileParseFromService",
        "../util/JSONFormatterUtil",
        "../util/WKTGeometryFormater",
        "../thematicmap/ThematicMapFactory",
        "../webgis/Map",
        "../webgis/Graphic",
        "../webgis/Feature",
        "../webgis/symbols/PointSymbol",
        "../webgis/symbols/LineSymbol",
        "../webgis/geometry/Point",
        "../webgis/geometry/Polyline",
        "../webgis/views/SceneView",
        "../webgis/layers/FeatureLayer"
    ], function (exports, Deferred, request, all, FileParse, FileParseFromService, JSONFormatterUtil, WKTGeometryFormater, ThematicMapFactory, Map, Graphic, Feature, PointSymbol, LineSymbol, Point, Polyline, SceneView, FeatureLayer
    ) {

        var wktGeometryFormatter = new WKTGeometryFormater();

        function createThematic(params, callback) {
            var ptmsService, query, type;
            var view, map, layers;
            var styleList = [];
            var fileParse, container, deviceParams;
            var tempParams;

            tempParams = params;
            type = params.type;
            container = params.container;
            ptmsService = params.ptmsService;
            deviceParams = params.deviceParams;
            var currentRule = null;
            if (params.config.hasOwnProperty('url')) {
                fileParse = new FileParseFromService();
            } else {
                fileParse = new FileParse();
            }

            // 所有配置文件加载完成
            fileParse.getAll(params.config, function (response) {
                var digram = new ThematicMapFactory({
                    ptmsService: ptmsService,
                    deviceParams: deviceParams,
                    diagramVo: response,
                    container: container,
                    antialias: params.antialias
                });
                digram.config = tempParams.config;
                digram.fileParse = fileParse;
                digram.createDiagram(type, function (data) {
                    if (callback) {
                        data.diagram = digram;
                        data.type = type;
                        callback(data);
                    }
                });
            });
        }

        /**
         * 地图更新
         * @param devId
         */
        function update(thematicMap, devId, newColor) {
            if (typeof (devId) === "string") {
                thematicMap.update({
                    devId: devId,
                    ptmsService: thematicMap.diagram.ptmsService,
                    type: thematicMap.type
                });
            } else {
                thematicMap.update({
                    graphic: devId,
                    newColor: newColor
                });
            }
        }

        /**
         * 五色图需求
         */
        function changeColor(thematicMap, graphic, flag) {
            thematicMap.changeColor(graphic, flag);
        }

        /**
         * 地图刷新
         */
        function refresh(thematicMap) {
            thematicMap.diagram.fileParse.getAll(thematicMap.diagram.config, function (response) {
                // response.diagramVo.mapVo.layerVoList[5].rules[0].styles[0].symbol[0].color = '0,0,255';
                thematicMap.diagramVo = response;
                thematicMap.refresh();
            });
        }

        /**
         * 地图清除
         */
        function clear(thematicMap) {
            thematicMap.clear();
        }

        function destroy(thematicMap) {
            thematicMap.destroy();
        }

        exports.createThematic = createThematic;
        exports.update = update;
        exports.changeColor = changeColor;
        exports.refresh = refresh;
        exports.clear = clear;
        exports.destroy = destroy;
        return exports;
    }
)
;
