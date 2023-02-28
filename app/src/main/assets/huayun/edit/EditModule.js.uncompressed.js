/**
 *  @author :   JiGuangJie
 *  @date   :   2020/6/8
 *  @time   :   17:51
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/edit/EditModule", [
    "dojo/promise/first",
    "./ConfigLoader",
    "../util/JSONFormatterUtil",
    "../vo/DataSourceVo",
    "../vo/DiagramVo",
    "./components/ToolBarPanel",
    "./components/FeatureTemplatePanel",
    "./components/EditPanel",
    "./components/PropertyPanel",
    "./tool/EditController"
], function (first, ConfigLoader, JSONFormatterUtil, DataSourceVo, DiagramVo, ToolBarPanel, FeatureTemplatePanel, EditPanel, PropertyPanel, EditController) {

    function EditModule(params) {
        this.configLoader = new ConfigLoader(params);
        this.container = params.container;
        this.token = params.accessToken;
        this.filter = params.deviceParams;
        this.mapId = params.deviceParams.mapId;

        this.toolBarWarp = document.createElement('div');
        this.toolBarWarp.id = 'tool-bar-wrap';
        this.featureTemplateWrap = document.createElement('div');
        this.featureTemplateWrap.id = 'feature-template-wrap';
        this.editMapWrap = document.createElement('div');
        this.editMapWrap.id = 'edit-map-wrap';
        this.propertyWrap = document.createElement('div');
        this.propertyWrap.id = 'property-wrap';

        this.container.appendChild(this.toolBarWarp);
        this.container.appendChild(this.featureTemplateWrap);
        this.container.appendChild(this.editMapWrap);
        this.container.appendChild(this.propertyWrap);

        this.currentSelected = null;
        this.editPanel = null;
        this.propertyPanel = null;
        this.currentSelectedGraphic = null;
        this.currentEditState = '';

        this.editController = new EditController();
    }


    EditModule.prototype.creationComplete = function () {
        return this.configLoader.load().then(function (results) {
            // 所有配置文件都已经加载完成,按照baseStyle.xml\dataSource.xml\map.xml\[style.xml] 顺序异步请求加载
            // 通过 x2js转换成了json数据格式
            var baseStyleJSON = results[0].data;
            var dataSourceJSON = results[1].data;
            var mapJSON = results[2].data;
            var styleArr = results.slice(3, results.length);
            for (var i = 0; i < styleArr.length; i++) {
                var styleData = styleArr[i].data;
                for (var j = 0; j < styleData.length; j++) {
                    if (!styleData[j]) {
                        continue;
                    }
                    var symbols = styleData[j].symbols;
                    if (!symbols) continue;
                    for (var k = 0; k < symbols.length; k++) {
                        var item = symbols[k];
                        JSONFormatterUtil.merge(baseStyleJSON, item);     // 把style和baseStyle属性合并
                    }
                }
            }
            var dataSourceVo = new DataSourceVo(dataSourceJSON);
            var diagramVo = new DiagramVo(mapJSON, styleArr);
            var bgColor = diagramVo.environmentVo.bgColor;
            this.createToolBarPanel();
            this.createFeatureTemplate(diagramVo.mapVo.layerVoList);
            this.createEidtPanel(dataSourceVo, diagramVo.mapVo, bgColor)
            this.createPropertyPanel();

            // debugger;
        }.bind(this));
    };

    EditModule.prototype.createToolBarPanel = function () {
        new ToolBarPanel({
            container: this.toolBarWarp,
            buttonSelectedHook: this.buttonSelectedHook.bind(this)
        });
    };

    EditModule.prototype.createFeatureTemplate = function (params) {
        new FeatureTemplatePanel({
            container: this.featureTemplateWrap,
            layers: params,
            selectedHook: this.selectedHook.bind(this)
        });
        // debugger;
    };
    EditModule.prototype.createEidtPanel = function (dataSourceVo, mapVo, bgColor) {
        this.editPanel = new EditPanel({
            container: this.editMapWrap,
            dataSourceVo: dataSourceVo,
            mapVo: mapVo,
            token: this.token,
            bgColor: bgColor,
            filter: this.filter,
            currentEditTarget: this.currentSelected,
            editController: this.editController,
            mapId: this.mapId,
            addComplete: this.addComplete.bind(this),
            selectedHook: this.selectedHookOfEditPanel.bind(this)
        });
    };

    EditModule.prototype.createPropertyPanel = function () {
        this.propertyPanel = new PropertyPanel({
            container: this.propertyWrap,
            currentEditTarget: this.currentSelected
        });
    };


    EditModule.prototype.selectedHook = function (data) {
        this.currentSelected = data.data;
        this.editPanel.update({
            currentEditTarget: this.currentSelected,
            type: data.type
        });
        this.propertyPanel.currentEditTarget = this.currentSelected;
    };

    EditModule.prototype.selectedHookOfEditPanel = function (data) {
        this.currentSelectedGraphic = data;
        this.propertyPanel.update(data.feature.attributes);
    };

    EditModule.prototype.buttonSelectedHook = function (type) {
        this.currentEditState = type;
        switch (type) {
            case '开始':

                break;
            case '选择':
                this.currentSelected = null;
                this.editPanel.currentEditTarget = null;
                break;
            case '删除':
                this.propertyPanel.update(null);
                this.editPanel.delete(this.currentSelectedGraphic);
                break;
        }
    };
    EditModule.prototype.addComplete = function (params) {
        this.propertyPanel.update(params);
    };

    return EditModule;
});
