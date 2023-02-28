define(
    "com/huayun/webgis/action/ActionManager", [
        "dojo/_base/declare",
        "./zooms/ZoomIn",
        "./zooms/ZoomOut",
        "./ResetView",
        "./history/PreView",
        "./history/NextView",
        "./draws/PointDraw",
        "./draws/LineDraw",
        "./draws/PolygonDraw",
        "./draws/CircleDraw",
        "./draws/SphereDraw",
        "./draws/ClearDraw",
        "./selectZoom/SelectZoomIn",
        "./selectZoom/SelectZoomOut",
        "./measurements/LengthMeasurement",
        "./measurements/AngleMeasurement",
        "./measurements/AreaMeasurement",
        "./measurements/MeasurementDelete",
        "./Screenshot",
        "./MapPanAction",
        "./SwitchViewAction",
        "./select/PointSelected",
        "./select/RectSelected",
        "./select/CircleSelected",
        "./select/PolygonSelected",
        "./search/PathSearchAction",
        "./search/NameSearchAction",
        "./search/ReactionSearch",
        "./search/PointSearchAction",
        "./search/PolygonSearchAction",
        "./search/RectSearchAction",
        "./LayerControllerAction",
        "./location/CoordinatePosition",
        "./location/SpatialPosition",
        "./location/BoroughPosition",
        "./powerModule/DeviceTreeAction",
        "./powerModule/DeviceSearchAction",
        "./search/AroundSearchAction"
    ], function (declare, ZoomIn, ZoomOut, ResetView, PreView, NextView, PointDraw, LineDraw, PolygonDraw, CircleDraw, SphereDraw, ClearDraw, SelectZoomIn, SelectZoomOut, LengthMeasurement, AngleMeasurement, AreaMeasurement, MeasurementDelete, Screenshot,
                 MapPanAction, SwitchViewAction, PointSelected, RectSelected, CircleSelected, PolygonSelected, PathSearchAction, NameSearchAction, ReactionSearch, PointSearchAction, PolygonSearchAction, RectSearchAction, LayerControllerAction, CoordinatePosition,
                 SpatialPosition, BoroughPosition, DeviceTreeAction, DeviceSearchAction, AroundSearchAction) {
        var _instance = null;
        var currentAction = null;   //当前行为，对有持续行为的一个存储
        var lastAction = null;  //上一行为
        var actionHash = null;  //一个全局的对象，用来保存已经创建的行为，当行为已经存在的情况下无需再次创建，只要依据key查找就可以获得
        var _actionClazz = {};

        return declare("com.huayun.webgis.action.ActionManager", null, {

            constructor: function () {
                if (_instance === null) {
                    currentAction = null;
                    lastAction = null;
                    actionHash = {};
                    _instance = this;
                    _actionClazz = {
                        "ZoomIn": ZoomIn,
                        "ZoomOut": ZoomOut,
                        "ResetView": ResetView,
                        "PreView":PreView,
                        "NextView":NextView,
                        "PointDraw": PointDraw,
                        "LineDraw": LineDraw,
                        "PolygonDraw": PolygonDraw,
                        "CircleDraw": CircleDraw,
                        "SphereDraw": SphereDraw,
                        "ClearDraw": ClearDraw,
                        "SelectZoomIn": SelectZoomIn,
                        "SelectZoomOut": SelectZoomOut,
                        "LengthMeasurement": LengthMeasurement,
                        "AngleMeasurement": AngleMeasurement,
                        "AreaMeasurement": AreaMeasurement,
                        "MeasurementDelete": MeasurementDelete,
                        "Screenshot": Screenshot,
                        "SwitchViewAction": SwitchViewAction,
                        "MapPanAction": MapPanAction,
                        "PointSelected": PointSelected,
                        "RectSelected": RectSelected,
                        "CircleSelected": CircleSelected,
                        "PolygonSelected": PolygonSelected,
                        "PathSearchAction": PathSearchAction,
                        "NamesSearch": NameSearchAction,
                        "ReactionSearchAction": ReactionSearch,
                        "PointSearchAction": PointSearchAction,
                        "PolygonSearchAction": PolygonSearchAction,
                        "RectSearchAction": RectSearchAction,
                        "LayerController": LayerControllerAction,
                        "CoordinatePosition":CoordinatePosition,
                        "SpatialPosition":SpatialPosition,
                        "BoroughPosition":BoroughPosition,
                        "DeviceTreeAction": DeviceTreeAction,
                        "DeviceSearchAction": DeviceSearchAction,
                        "AroundSearchAction": AroundSearchAction
                    }
                    ;
                }
            },

            getInstance: function () {
                return _instance;
            },

            getCurrentAction: function () {
                return currentAction;
            },

            /**
             * 创建一个Action
             * @param params
             * @returns {result}
             */
            createAction: function (params) {
                if (!actionHash[params.action]) {
                    actionHash[params.action] = new _actionClazz[params.action](params);
                }
                return actionHash[params.action];
            },

            doAction: function (action) {
                action.doAction();
            },

            /**
             * 激活某个行为
             * @param action
             */
            activeAction: function (action) {
                currentAction = action;
                action.active();
            },

            /**
             * 使某个行为失效
             * @param action
             */
            invalidAction: function (action) {
                if (action !== null) {
                    action.invalid();
                    currentAction = null;
                }
            }
        }).call(this);
    }
);

