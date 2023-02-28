/**
 *  @author :   JiGuangJie
 *  @date   :   2020/6/10
 *  @time   :   15:16
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/edit/components/FeatureTemplatePanel", [
    "../../webgis/Viewpoint",
    "../../webgis/Graphic",
    "../../webgis/Feature",
    "../../webgis/gl/Context",
    "../../webgis/symbols/CompositeMarkSymbol",
    "../../webgis/symbols/CompositeLineSymbol",
    "../../webgis/symbols/CompositeFillSymbol",
    "../../webgis/symbols/CircleSymbol",
    "../../webgis/symbols/LineSymbol",
    "../../webgis/symbols/FontSymbol",
    "../../webgis/symbols/PolygonSymbol",
    "../../webgis/symbols/DecorationLineSymbol",
    "../../webgis/geometry/Point",
    "../../webgis/geometry/Polyline",
    "../../webgis/geometry/Polygon",
    "../../webgis/renderer/LineRenderer",
    "../../webgis/renderer/FontRenderer",
    "../../webgis/renderer/DecorationLineRenderer",
    "../../webgis/renderer/CompositeMarkerRenderer",
    "../../webgis/renderer/CompositeLineRenderer",
    "../../webgis/renderer/CompositeFillRenderer"
], function (Viewpoint, Graphic, Feature, Context, CompositeMarkSymbol, CompositeLineSymbol, CompositeFillSymbol, CircleSymbol, LineSymbol, FontSymbol, PolygonSymbol, DecorationLineSymbol,
             Point, Polyline, Polygon, LineRenderer, FontRenderer, DecorationLineRenderer, CompositeMarkerRenderer, CompositeLineRenderer, CompositeFillRenderer) {
    function FeatureTemplatePanel(params) {
        this.container = params.container;
        this.layers = params.layers;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.graphicList = [];

        this.selectedHook = params.selectedHook;

        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;

        this.webglContext = canvas.getContext('webgl');
        this.container.appendChild(canvas);

        this.liDiv = document.createElement('div');
        this.liDiv.id = 'feature-template-content';
        this.liDiv.style.width = (this.width - 50) + 'px';
        this.liDiv.style.height = this.height + 'px';
        this.container.appendChild(this.liDiv);

        this.labelUl = document.createElement('ul');
        this.liDiv.appendChild(this.labelUl);
        this.liDiv.addEventListener('click', function (evt) {
            this.selectedHook.call(this, {
                data: evt.target.data,
                type: 'add'
            });
        }.bind(this));

        var context = new Context(this.webglContext);
        this.view = {
            width: this.width,
            height: this.height,
            resolution: 1,
            scale: 1,
            context: context,
            threeRender: function () {
                this.graphicList.forEach(function (item) {
                    item.renderer.draw(this.view, item, item.feature.geometry, item.symbol);
                }.bind(this));
            }.bind(this)
        };
        var viewpoint = new Viewpoint(this.view.width, this.view.height, 0, 0, 0, 0, 0, this.view);
        this.view.viewpoint = viewpoint;
        viewpoint.center = [200, 450];
        viewpoint.resolution = 1;
        viewpoint.calcMatrix(false);

        this.createFeatureTemplate();
        this.view.threeRender();


    }

    /**
     * 创建编辑模板
     */
    FeatureTemplatePanel.prototype.createFeatureTemplate = function () {
        var tempIndex = 1;
        for (var i = 0, len = this.layers.length; i < len; i++) {
            // for (var i = 1, len = 2; i < len; i++) {
            var aLayerVo = this.layers[i];
            var rule = aLayerVo.rules[0];
            var styles = rule.styles;
            var propertyName = typeof rule.propertyName === 'undefined' ? "" : rule.propertyName.toLowerCase();
            var propertyNameList = this.getPropertyNameList(propertyName);
            var featureTemplates = this.getFeaturesTemplates(propertyNameList, aLayerVo.featureTemplates);
            var symbols = this.getSymbols(featureTemplates, styles);
            for (var j = 0; j < symbols.length; j++) {
                var style = symbols[j].style;
                var aSymbol = style.symbol;
                var fields = symbols[j].fields;
                var attributes = this.createAttributeFromFields(fields);
                // todo 需要根据size属性来定义点符号的大小
                if (aSymbol[0].baseid === "p_font_style") {
                    aSymbol[0]['font-size'] = 24;
                } else {
                    aSymbol[0]['r'] = 10;
                }
                aSymbol.isFixed = rule.isFixed;
                // var geometry = new Point(30, this.height - 40 * tempIndex);
                // debugger;
                var geometry = this.createGeometry(style.type, tempIndex);
                var compositeSymbol = this.createCompositeSymbol(style.type, aSymbol);  // 模板中使用的symbol
                // debugger
                var editCompositeSymbol = this.createCompositeSymbol(style.type, aSymbol);  // 在编辑中使用的symbol,因为在webgl中texture不能在多个webgl中共用
                var graphic = new Graphic({
                    feature: new Feature({
                        attributes: attributes,
                        geometry: geometry
                    }),
                    symbol: compositeSymbol
                });
                var renderer = this.createRenderer(style.type);
                renderer.add(this.view, graphic, geometry, compositeSymbol);
                graphic.renderer = renderer;
                this.graphicList.push(graphic);
                tempIndex++;
                this.createLabel({
                    name: aLayerVo.name,
                    attributes: graphic.feature.attributes,
                    viewId: aLayerVo.dataSource.viewId,
                    symbol: editCompositeSymbol,
                    fields: fields
                });
            }

        }
    };

    FeatureTemplatePanel.prototype.getPropertyNameList = function (propertyName) {
        return propertyName.split(',');
    };

    /**
     * 根据配置的propertyName属性获取对应的模板
     * @param propertyNameList
     * @param templates
     * @returns {Array}
     */
    FeatureTemplatePanel.prototype.getFeaturesTemplates = function (propertyNameList, templates) {
        var result = [];
        for (var i = 0; i < templates.length; i++) {
            var template = templates[i];
            var fields = template.fields;
            var values = [];
            for (var j = 0; j < fields.length; j++) {
                var field = fields[j];
                if (propertyNameList.indexOf(field.name) !== -1) {
                    if (values.indexOf(field.defaultValue) === -1) {
                        values.push(field.defaultValue);
                    }
                }
            }
            var propertyValue = values.toString();
            if (template.propertyValue === propertyValue) {
                result.push(template);
            }
        }
        return result;
    };
    /**
     * 根据propertyValue的值，获取对应模板中的symbols
     * @param templates    模板列表
     * @param styles    图层上的样式配置
     * @returns {Array} 返回的symbol的列表
     */
    FeatureTemplatePanel.prototype.getSymbols = function (templates, styles) {
        var result = [];
        for (var i = 0; i < templates.length; i++) {
            var template = templates[i];
            var tempPropertyValue = template.propertyValue === "" ? template.propertyValue = "DefaultValue" : template.propertyValue;
            for (var j = 0; j < styles.length; j++) {
                var style = styles[j];
                if (tempPropertyValue === style.propertyValue || style.propertyValue === '') {
                    result.push({
                        style: style,
                        fields: template.fields
                    });
                    break;
                }
            }
        }
        return result;
    };

    FeatureTemplatePanel.prototype.createAttributeFromFields = function (fields) {
        var result = [];
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            result.push({
                name: field.name,
                value: field.defaultValue
            });
        }
        return result;
    };

    FeatureTemplatePanel.prototype.createRenderer = function (type) {
        var result = null;
        switch (type) {
            case "point":
                result = new CompositeMarkerRenderer();
                break;
            case 'line':
                result = new CompositeLineRenderer();
                break;
            case 'polygon':
                result = new CompositeFillRenderer();
                break;
        }
        return result;
    };

    FeatureTemplatePanel.prototype.createCompositeSymbol = function (type, symbols) {
        var result = null;
        switch (type) {
            case "point":
                result = new CompositeMarkSymbol({
                    symbol: symbols
                });
                break;
            case 'line':
                result = new CompositeLineSymbol({
                    symbol: symbols
                });
                break;
            case 'polygon':
                result = new CompositeFillSymbol({
                    symbol: symbols
                });
                break;
        }
        return result;
    };

    FeatureTemplatePanel.prototype.createGeometry = function (type, index) {
        var result = null;
        switch (type) {
            case 'point':
                result = new Point(30, this.height - 40 * index);
                break;
            case 'line':
                result = new Polyline([
                    [
                        new Point(30, this.height - 40 * index),
                        new Point(50, this.height - 40 * index)
                    ]
                ]);
                break;
            case 'polygon':
                result = new Polygon([
                    [
                        new Point(30, this.height - 40 * index),
                        new Point(50, this.height - 40 * index),
                        new Point(50, this.height - 40 * index - 20),
                        new Point(30, this.height - 40 * index - 20),
                        new Point(30, this.height - 40 * index)
                    ]
                ]);
                break;
        }
        return result;
    };

    FeatureTemplatePanel.prototype.createLabel = function (params) {
        var li = document.createElement('li');
        li.innerText = params.name;
        li.data = params;
        this.labelUl.appendChild(li);
    };

    return FeatureTemplatePanel;
});
