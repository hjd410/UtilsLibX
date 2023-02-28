/**
 *  @author :   JiGuangJie
 *  @date   :   2020/6/10
 *  @time   :   15:16
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/edit/components/EditPanel", [
    "dojo/request",
    "../../webgis/Map",
    "../../webgis/views/SceneView",
    "../../webgis/layers/EditFeatureLayer",
    "../../util/WKTGeometryFormater",
    "../../webgis/geometry/Point",
    "../../webgis/geometry/Polyline",
    "../../webgis/geometry/Extent"
], function (request, Map, SceneView, EditFeatureLayer, WKTGeometryFormater, Point, Polyline, Extent) {
    function EditPanel(params) {
        this.container = params.container;
        this.dataSourceVo = params.dataSourceVo;
        this.mapVo = params.mapVo;
        this.wktGeometryFormatter = new WKTGeometryFormater();
        var wokerSpace = this.mapVo.workspace;
        this.service = this.dataSourceVo.services[wokerSpace];
        this.token = params.token;
        this.filter = params.filter;
        this.currentEditTarget = params.currentEditTarget;
        this.editController = params.editController;
        this.mapId = params.mapId;
        this.addComplete = params.addComplete;
        this.selectedHook = params.selectedHook;
        this.lastEditTarget = null;
        this.editType = '';
        // debugger;
        var bgColor = params.bgColor;
        this.map = new Map();
        this.view = new SceneView({
            container: params.container,
            map: this.map,
            backgroundColor: 'rgb(' + bgColor + ')'
        });

        this.query = {
            url: this.service.description,
            filter: "map_id=" + this.filter.mapId,
            access_token: this.token
        };

        if (this.filter) {
            // console.log(this.service.description);
            var aUrl = this.service.description + "SCH_MAP_INSTANCE?filter=map_id=" + this.filter.mapId + "&access_token=" + this.token;
            request(aUrl, {handleAs: "json"}).then(function (dataJSON) {
                var shape = dataJSON.data[0]['SHAPE'];
                this.polygon = this.wktGeometryFormatter.toGeometry(shape);
                this.view.setExtent(this.polygon.extent);
                this.createEditFeatureLayer(this.mapVo.layerVoList);
                this.view.refresh();
            }.bind(this));
            // debugger;
        } else {
            var extent = new Extent(0, 0, this.container.clientWidth, this.container.clientHeight);
            this.view.setExtent(extent);
            this.createEditFeatureLayer(this.mapVo.layerVoList);
            this.view.refresh();
        }

        this.clickTimeId = null;

        this.view.domNode.addEventListener('click', function (evt) {
            var geometry = this.view.screenToGeometry(evt.clientX, evt.clientY);
            var result = this.view.queryGraphicsByGeometry(geometry, 8);
            if (result.length > 0) {
                var selectedGraphic = result[0];
                this.editController.currentEditLayer = selectedGraphic.layer.owner.owner;
                this.selectedHook.call(this, selectedGraphic);
            }
            // console.log(result);
            if (this.currentEditTarget === null) return;
            clearTimeout(this.clickTimeId);
            this.clickTimeId = setTimeout(function (evt) {
                var currentEditLayer = this._getCurrentEditFeatureLayer(this.currentEditTarget.name, this.currentEditTarget.viewId);
                this.editController.currentEditLayer = currentEditLayer;
                switch (this.editType) {
                    case 'add':
                        // console.log(this.currentEditTarget.attributes);
                        var attributes = this._createAttributes();
                        this._updateAttributes(attributes);
                        // debugger;
                        this.editController.add({
                            geoType: currentEditLayer.geoType,
                            currentEditLayer: currentEditLayer,
                            symbol: this.currentEditTarget.symbol,
                            attributes: attributes,
                            geometry: geometry
                        });
                        this.addComplete.call(this, attributes);
                        break;
                    case 'edit':
                        break;
                    case 'delete':
                        break;
                    case 'selected':
                        break;
                }
                this.lastEditTarget = this.currentEditTarget;
            }.bind(this, evt), 250);
        }.bind(this));

        this.view.domNode.addEventListener('dblclick', function (evt) {
            clearTimeout(this.clickTimeId);
            console.log('dblclick');
            this.editController.endDraw();
        }.bind(this));
        // this.view.threeRender();
    }

    /**
     * 根据配置文件创建可以编辑的要素图层
     * @param list
     */
    EditPanel.prototype.createEditFeatureLayer = function (list) {
        for (var i = 0, len = list.length; i < len; i++) {
            var aLayerVo = list[i];
            aLayerVo.id = "EditFeatureLayer_" + i;
            aLayerVo.query = this.query;
            // aLayerVo.currentRule = this.getCurrentRule(aLayerVo.rules);
            var layer = new EditFeatureLayer(aLayerVo, function (featureData) {
                // todo 图层创建成功后的回调函数
            });
            this.map.addLayer(layer);
        }
        // debugger;
    };

    /**
     * 更新编辑相关的属性
     * @param params
     */
    EditPanel.prototype.update = function (params) {
        this.currentEditTarget = params.currentEditTarget;
        this.editType = params.type;
    };

    EditPanel.prototype.delete = function (graphic) {
        this.editController.delete(graphic);
    };

    EditPanel.prototype._updateAttributes = function (attributes) {
        for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            if (attribute.name === 'map_id') {
                attribute.value = this.mapId;
            }

        }
    };

    /**
     * 根据图层名称和表名，获取当前编辑图形所在的图层
     * @param name
     * @param viewId
     * @returns {*}
     * @private
     */
    EditPanel.prototype._getCurrentEditFeatureLayer = function (name, viewId) {
        for (var i = 0; i < this.map.allLayers.length; i++) {
            var aLayer = this.map.allLayers[i];
            if (aLayer.name === name && aLayer.viewId === viewId) {
                return aLayer;
            }
        }
        return null;
    };

    EditPanel.prototype._createAttributes = function () {
        var result = [];
        for (var i = 0; i < this.currentEditTarget.attributes.length; i++) {
            var attribute = this.currentEditTarget.attributes[i];
            result[result.length] = {name: attribute.name, value: attribute.value};
        }
        return result;
    };

    return EditPanel;
});
