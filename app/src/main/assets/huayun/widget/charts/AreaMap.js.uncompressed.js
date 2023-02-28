/**
 *  @author :   JiGuangJie
 *  @date   :   2020/8/20
 *  @time   :   8:56
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/widget/charts/AreaMap", [
    "dojo/request",
    "../../thematicmap/tool/FileParse",
    "../../webgis/Map",
    "../../webgis/views/SceneView",
    "../../webgis/layers/FeatureLayer",
    "../../webgis/layers/LabelLayer",
    "../../util/JSONFormatterUtil",
    "../../util/WKTGeometryFormater",
    "../../core/Application"
], function (request, FileParse, Map, SceneView, FeatureLayer, LabelLayer, JSONFormatterUtil, WKTGeometryFormater, Application) {

    function AreaMap(params) {

        this.onClick = null;

        this.container = params.container;
        this.config = params.config;
        this.regNo = params.regNo;
        this.accessToken = params.accessToken;

        this.wktGeometryFormater = new WKTGeometryFormater();
        this.fileParse = new FileParse();
        this.map = new Map();
        this.view = new SceneView({
            container: this.container,
            map: this.map,
            rotateEnabled: false
        });

        Application.call(this, this.view._canvas);

        this.list = [];

        this._loadFile();
    }

    if (Application) AreaMap.__proto__ = Application;
    AreaMap.prototype = Object.create(Application && Application.prototype);
    AreaMap.prototype.constructor = AreaMap;

    AreaMap.prototype._loadFile = function () {
        // 所有配置文件加载完成
        this.fileParse.getAll(this.config, function (response) {
            var dataSourceVo = response.dataSourceVo;
            var mapVo = response.diagramVo.mapVo;
            var wokerSpace = mapVo.workspace;
            var description = dataSourceVo.services[wokerSpace].description.split(',');
            this.service = description[0];
            this.table = description[1];
            this.list = mapVo.layerVoList;
            this._queryData();
        }.bind(this));
    }

    AreaMap.prototype._queryData = function () {
        var aUrl = this.service + this.table + "?filter=reg_no=" + this.regNo + "&access_token=" + this.accessToken;
        request(aUrl).then.call(this, function (data) {
            console.time('t1');
            var dataJSON = JSONFormatterUtil.string2Json(data);
            var shape = dataJSON.data[0]['SHAPE'];
            this.polygon = this.wktGeometryFormater.toGeometry(shape);
            console.timeEnd('t1');
            this.view.setExtent(this.polygon.extent);
            this.currentRule = this.view.scale;
            this._createLayer(this.list);
        }.bind(this));
    }

    AreaMap.prototype._createLayer = function (list) {
        for (var i = list.length - 1; i > -1; i--) {
            var aLayerVo = list[i];
            aLayerVo.id = "FeatureLayer_" + i;
            var query = {
                url: this.service,
                filter: "",
                access_token: this.accessToken
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
            aLayerVo.currentRule = this._getCurrentRule(aLayerVo.rules);
            var layer = new FeatureLayer(aLayerVo, function (featureData) {
                //todo 图层创建成功后的回调函数
            });
            this.map.addLayer(layer);
        }
        var labelLayer = new LabelLayer({
            id: "labelLayer",
            layers: this.map.allLayers
        });
        this.map.addLayer(labelLayer);
        var requestAnimationFrameId;

        var that = this;

        function _checkState() {
            requestAnimationFrameId = requestAnimationFrame(_checkState);
            var flag = true;
            for (var index in that.map.allLayers) {
                var layer = that.map.allLayers[index];
                flag = flag && layer.state;
            }
            if (flag) {
                cancelAnimationFrame(requestAnimationFrameId);
                that.view.setExtent(that.polygon.extent);
                // that.backFun();
            }
        }

        _checkState.call(this);
    }

    AreaMap.prototype._getCurrentRule = function (rule) {
        for (var i = 0; i < rule.length; i++) {
            var aRule = rule[i];
            if (this.currentRule >= aRule.minScale && this.currentRule <= aRule.maxScale) {
                return aRule;
            }
        }
        return null;
    }

    /**
     * 鼠标按下
     * @param { CanvasMouseEvent } evt
     */
    AreaMap.prototype.onMouseDown = function (evt) {

    }
    /**
     * 鼠标弹起
     * @param { CanvasMouseEvent } evt
     */
    AreaMap.prototype.onMouseUp = function (evt) {
        var geometry = this.view.screenToGeometry(evt.canvasPosition[0], evt.canvasPosition[1]);
        var result = this.view.queryGraphicsByGeometry(geometry, 0.01);
        if (result.length === 0) return;
        evt.target = result[0];
        if (this.onClick) {
            this.onClick.call(this, evt);
            return undefined;
        }
        var attributes = evt.target.feature.attributes;
        var lvl = '';
        attributes.forEach(function (item) {
            if (item.name === "reg_no") {
                this.regNo = item.value;
            }
            if (item.name === "reg_lvl") {
                lvl = item.value;
            }
        }.bind(this));
        if (lvl === '05') return;   // 镇层级 跳出下转
        this.update();
    }

    AreaMap.prototype.created = function () {

    }

    AreaMap.prototype.update = function () {
        this.view.clear();
        for (var i = 0; i < this.list.length; i++) {
            var aLayerVo = this.list[i];
            aLayerVo.dataSource.whereFilter = 'p_reg_no=' + this.regNo;
        }
        this._queryData();
    }

    return AreaMap;
});
