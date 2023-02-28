/**
 * 文本标注图层
 * @see com.huayun.webgis.layers.LabelLayer
 */
define("com/huayun/webgis/layers/LabelLayer", [
    "./Layer",
    "./GraphicLayer",
    "../Graphic",
    "../Feature",
    "../symbols/TextSymbol",
    "../renderer/TextRenderer",
    "../views/3d/layers/LabelLayerView3D",
    "../geometry/Point",
    "../utils/MathUtils"
], function (Layer, GraphicLayer, Graphic, Feature, TextSymbol, TextRenderer, LabelLayerView3D, Point, MathUtils) {

    var labelValueReg = /\${(.*)}/g;
    var gap = 0.000001;

    /**
     * 文本标注图层
     * @constructor
     * @alias com.huayun.webgis.layers.LabelLayer
     * @extends {Layer}
     * @param {Object} params 构造函数参数
     * @param {string}  params.id  - 图层id
     * @property {string}  type  - 图层类型
     * @property {string}  id  - 图层id
     */
    function LabelLayer(params) {
        this.type = 'LabelLayer';
        this.id = params.id;
        this.renderer = new TextRenderer();
        this.graphicsLayer = new GraphicLayer({
            id: this.id,
            renderer: this.renderer
        });
        this.graphics = null;
        this._layers = params.layers;
        this.state = true;
    }

    if (Layer) LabelLayer.__proto__ = Layer;
    LabelLayer.prototype = Object.create(Layer && Layer.prototype);
    LabelLayer.prototype.constructor = LabelLayer;

    LabelLayer.prototype.addGraphic = function (graphic) {
        this.graphicsLayer.addGraphic(graphic);
    };

    LabelLayer.prototype.createLayerView = function (view) {
        var layerView = new LabelLayerView3D({
            visible: true,
            layer: this,
            view: view,
            graphicsLayerView: this.graphicsLayer.createLayerView(view)
        });
        this.layerView = layerView;
        layerView.transform = view.viewpoint;
        return layerView;
    };

    LabelLayer.prototype.handleGraphics = function () {
        this.graphics = [];

    };

    LabelLayer.prototype.addTextGraphics = function () {
        for (var i = 0, ii = this._layers.length; i < ii; i++) {
            var layer = this._layers[i];
            var currentRuleVo = layer.currentRule;
            if (layer.type === "FeatureLayer" && currentRuleVo && currentRuleVo.label && !layer.handleText) {
                layer.handleText = true;
                var graphics = layer.graphicsLayer.graphics;
                var label = currentRuleVo.label;
                if (label.showLabel) {
                    var textData = label.labelContent;
                    if (textData === undefined) continue;
                    // var symbolText = textData.symbol.symbolList[0].text;
                    var aLabel = textData['text'];
                    labelValueReg.lastIndex = 0;
                    if (labelValueReg.test(aLabel)) {
                        var attributeKey = RegExp.$1;
                        // for (var j = 0, jj = graphics.length; j < jj; j++) {
                        for (var j = graphics.length - 1; j > -1; j--) {
                            labelValueReg.lastIndex = 0;
                            var graphic = graphics[j];
                            var feature = graphic.feature;
                            if (graphic.feature.geometry.type === "line") ; // debugger;
                            var attribute = graphic.getAttribute(attributeKey);
                            if (typeof attribute === 'undefined') continue;
                            var textSymbol = new TextSymbol(textData.symbol);
                            textSymbol.fixed = {
                                isFixed: currentRuleVo.isFixed,
                                addratio: currentRuleVo.addratio
                            };
                            textSymbol.minScale = currentRuleVo.minScale;
                            var labelStr = attribute && attribute.value || '';
                            labelStr = aLabel.replace(labelValueReg, labelStr); // 把${name}替换成真正的文本
                            textSymbol.labelPlacement = label.labelPlacement;
                            textSymbol.fixed.isFixed = textSymbol.fixed.isFixed || currentRuleVo.label.fixedSize;
                            labelStr = this._formatLabel(textSymbol.fixed, currentRuleVo.minScale, this.layerView.view.scale, textSymbol.fontSize, labelStr, label.labelPlacement);
                            textSymbol.setText(labelStr.text);
                            textSymbol.rowNum = labelStr.rowNum;
                            textSymbol.oneW = labelStr.oneW;
                            var textGraphic = this._createGraphic(
                                graphic.feature,
                                textSymbol
                            );
                            textGraphic.relateGraphic = graphic;
                            this.graphics.push(textGraphic);
                            this.graphicsLayer.addGraphic(textGraphic)
                        }
                    }
                }
            }
        }
    }
    LabelLayer.prototype.zoomEnd = function (view) {
        this.addTextGraphics();
    };

    LabelLayer.prototype.filterGraphics = function () {
        this.graphicsLayer.graphics.forEach(function (graphic) {
            if (graphic.visible) {
                graphic.visible = !!graphic.relateGraphic.symbol;
            }
        });
    };

    LabelLayer.prototype._formatLabel = function (fixed, minScale, currentScale, fontSize, text, labelPlacement) {
        var realScale = this._getRealScale(fixed, currentScale, minScale);
        fontSize *= realScale;
        var baseFontW = text.length * 24;
        var result = '';

        if (labelPlacement === null) {
            return {
                text: text,
                rowNum: 1,
                oneW: baseFontW
            };
        } else {
            var stackLabel = labelPlacement.stackLabel;
            var rowNum = 1;
            if (stackLabel && stackLabel.autoWrap) {
                var wrapWidth = stackLabel.wrapWidth;
                var textW = baseFontW * fontSize / 24;
                rowNum = Math.ceil(textW / (wrapWidth * realScale));
                var oneW = wrapWidth * realScale; // 一行的文本宽度
                var insertData = {};     // 插入换行的index
                var tempOneW = 0;
                var tempIndex = 1;
                var split = false;
                for (var i = 0; i < text.length; i++) {
                    tempOneW = fontSize * tempIndex;
                    if (tempOneW === oneW || tempOneW > oneW || Math.abs(tempOneW - oneW) <= 0.000001) {   // 0.000001 是浮点计算的容差
                        insertData[i + 1] = '\r\n';
                        tempIndex = 0;
                        split = true;
                    }
                    tempIndex++;
                }
                result = this._insertTextAtIndices(text, insertData);
                if (split) {
                    baseFontW = Math.floor(oneW / fontSize) * 24;
                }
            } else {
                result = text;
            }
            return {
                text: result,
                rowNum: rowNum,
                oneW: baseFontW
            };
        }
    };

    LabelLayer.prototype._getRealScale = function (fixed, scale, minScale) {
        var realScale = 1;
        if (fixed.isFixed || minScale === 0) {
            return realScale;
        }
        if (fixed.addratio === 0) {
            return scale / minScale;
        } else if (fixed.addratio > 0) {
            return (1 + (scale / minScale) * fixed.addratio);
        }
    };
    // 在指定的索引处插入字符
    LabelLayer.prototype._insertTextAtIndices = function (text, insertData) {
        return text.replace(/./g, function (character, index) {
            return insertData[index] ? insertData[index] + character : character;
        });
    };

    LabelLayer.prototype._createGraphic = function (feature, symbol) {
        return new Graphic({
            feature: feature,
            symbol: symbol
        });
    };

    LabelLayer.prototype.queryGraphicsByGeometry = function (geometry, queryPadding) {
        return null;
    };

    LabelLayer.prototype.setVisible = function (visible) {
        this.visible = visible;
        this.graphicsLayer.visible = visible;
        this.layerView.setVisible(visible);
    };

    LabelLayer.prototype.revisePosition = function (view) {
        var self = this;
        this.graphicsLayer.graphics.forEach(function (graphic) {
            var relateGraphic = graphic.relateGraphic;
            if (relateGraphic && !relateGraphic.symbol) {
                graphic.visible = false;
                return;
            } else {
                graphic.visible = true;
            }
            var positionScreenList;
            var geometry = graphic.feature.geometry;
            var level;
            var symbol = graphic.symbol;
            var resolution = view.resolution;
            var realScale = self._getRealScale(symbol.fixed, self.layerView.view.scale, symbol.minScale);
            var fontSize = symbol.fontSize * realScale,
                width = symbol.oneW * fontSize / 24 * resolution,
                height = symbol.height * fontSize / 24 * resolution * symbol.rowNum;
            graphic.selectEnabled = false;
            var labelPlacement = symbol.labelPlacement,
                pos = labelPlacement && labelPlacement.position,
                layout = pos && pos.layout,
                distance = 0;// layout && layout._distance;
            if (!distance) {
                distance = 0;
            }
            distance *= realScale;
            if (layout) {
                layout = layout.toLowerCase();
            }
            switch (geometry.type) {
                case 'point':
                    positionScreenList = self.getGraphicSizeWithPoint(view, geometry, graphic);
                    if (layout && layout !== "best") {
                        level = self.getScreenLevelByOrientation(layout);
                    } else {
                        level = self.getBestScreenLevel(view, width, height, positionScreenList);
                    }
                    if (level < 0) {
                        graphic.visible = false;
                        return;
                    } else {
                        graphic.visible = true;
                        // var aDistance = 0;
                        var choosePoint = self.chooseBestScreenPoint(level, width, height, positionScreenList, distance);
                        var position = graphic.position;
                        var initPosition = graphic.initPosition;
                        if (typeof initPosition !== 'undefined') {
                            position[0] = initPosition[0] + choosePoint.x - geometry.x;
                            position[1] = initPosition[1] + choosePoint.y - geometry.y;
                            view.insertItems([{
                                id: graphic.id,
                                g: graphic,
                                minX: choosePoint.x - width / 2,
                                minY: choosePoint.y - height / 2,
                                maxX: choosePoint.x + width / 2,
                                maxY: choosePoint.y + height / 2
                            }]);
                        }
                    }
                    break;
                case 'multipoint':
                    var points = geometry.points;
                    geometry = self.getMultiPointOfCenter(graphic, points);
                    positionScreenList = self.getGraphicSizeWithPoint(view, geometry, graphic);
                    // level = self.getBestScreenLevel(view, width, height, positionScreenList);
                    if (layout && layout !== "best") {
                        level = self.getScreenLevelByOrientation(layout);
                    } else {
                        level = self.getBestScreenLevel(view, width, height, positionScreenList);
                    }
                    if (level < 0) {
                        graphic.visible = false;
                        return;
                    } else {
                        graphic.visible = true;
                        // var aDistance = 0;
                        var choosePoint = self.chooseBestScreenPoint(level, width, height, positionScreenList, distance);
                        var position = graphic.position;
                        var initPosition = graphic.initPosition;
                        var graphicGeometry = points[1];
                        position[0] = initPosition[0] + choosePoint.x - graphicGeometry.x;
                        position[1] = initPosition[1] + choosePoint.y - graphicGeometry.y;
                        view.insertItems([{
                            id: graphic.id,
                            g: graphic,
                            minX: choosePoint.x - width / 2,
                            minY: choosePoint.y - height / 2,
                            maxX: choosePoint.x + width / 2,
                            maxY: choosePoint.y + height / 2
                        }]);
                    }
                    break;
                case 'line':
                    var paths = geometry.path;
                    geometry = self.getLineCenterPoint(paths);
                    positionScreenList = self.getGraphicSizeWithPoint(view, geometry, graphic);
                    if (layout && layout !== "best") {
                        level = self.getScreenLevelByOrientation(layout);
                    } else {
                        level = self.getBestScreenLevel(view, width, height, positionScreenList);
                    }
                    // level = self.getBestScreenLevel(view, width, height, positionScreenList);
                    if (level < 0) {
                        graphic.visible = false;
                        return;
                    } else {
                        graphic.visible = true;
                        // var aDistance = 0;
                        var choosePoint = self.chooseBestScreenPoint(level, width, height, positionScreenList, distance);
                        var position = graphic.position;
                        var initPosition = graphic.initPosition;
                        position[0] = initPosition[0] + choosePoint.x - geometry.x;
                        position[1] = initPosition[1] + choosePoint.y - geometry.y;
                        view.insertItems([{
                            id: graphic.id,
                            g: graphic,
                            minX: choosePoint.x - width / 2,
                            minY: choosePoint.y - height / 2,
                            maxX: choosePoint.x + width / 2,
                            maxY: choosePoint.y + height / 2
                        }]);
                    }
                    break;
                case "polygon":
                    var paths = geometry.path;
                    geometry = MathUtils.calculateCoreOfPolygon(paths[0]);
                    var choosePoint;
                    if (layout === "inside") {
                        choosePoint = MathUtils.calculateCoreOfPolygon(paths[0]);
                    } else if (layout === "outside") {
                        positionScreenList = self.getGraphicSizeWithPoint(view, geometry, graphic, true);
                        // if (layout && layout !== "best") {
                        //     level = self.getScreenLevelByOrientation(layout);
                        // } else {
                        //     level = self.getBestScreenLevel(view, width, height, positionScreenList);
                        // }
                        level = self.getBestScreenLevel(view, width, height, positionScreenList);
                        if (level < 0) {
                            graphic.visible = false;
                            return;
                        } else {
                            graphic.visible = true;
                            choosePoint = self.chooseBestScreenPoint(level, width, height, positionScreenList, distance);
                        }
                    } else {
                        choosePoint = MathUtils.calculateCoreOfPolygon(paths[0]);
                    }
                    var position = graphic.position;
                    var initPosition = graphic.initPosition;
                    position[0] = initPosition[0] + choosePoint.x - geometry.x;
                    position[1] = initPosition[1] + choosePoint.y - geometry.y;
                    view.insertItems([{
                        id: graphic.id,
                        g: graphic,
                        minX: choosePoint.x - width / 2,
                        minY: choosePoint.y - height / 2,
                        maxX: choosePoint.x + width / 2,
                        maxY: choosePoint.y + height / 2
                    }]);
                    break;
                case "multipolygon":
                    var polygon = geometry.getMaxAreaPolygon();
                    var choosePoint = MathUtils.calculateCoreOfPolygon(polygon.path[0]);
                    var state = view.checkExtentState(choosePoint.x - width / 2, choosePoint.y - height / 2, choosePoint.x + width / 2, choosePoint.y + height / 2, false);
                    if (state) { // 碰撞
                        graphic.visible = false;
                        return;
                    } else {
                        graphic.visible = true;
                        geometry = MathUtils.calculateCoreOfPolygon(polygon.path[0]);
                        var position = graphic.position;
                        var initPosition = graphic.initPosition;
                        position[0] = initPosition[0] + choosePoint.x - geometry.x;
                        position[1] = initPosition[1] + choosePoint.y - geometry.y;
                        view.insertItems([{
                            id: graphic.id,
                            g: graphic,
                            minX: choosePoint.x - width / 2,
                            minY: choosePoint.y - height / 2,
                            maxX: choosePoint.x + width / 2,
                            maxY: choosePoint.y + height / 2
                        }]);
                    }
                    break;
            }
        });
    };

    LabelLayer.prototype.getScreenLevelByOrientation = function (orientaion) {
        orientaion = orientaion.toLowerCase();
        switch (orientaion) {
            case "south": {   // 下
                return 0;
            }
            case "north": {   // 上
                return 1;
            }
            case "east": {  // 右
                return 2;
            }
            case "west": {   // 左
                return 3;
            }
            case "southeast": {  // 右下
                return 4
            }
            case "southwest": {  // 左下
                return 5;
            }
            case "northeast": {  // 右上
                return 6;
            }
            case "northwest": {  // 左上
                return 7;
            }
            case "centered":
                return 8;
            default:
                return -1;
        }
    }

    LabelLayer.prototype.getMultiPointOfCenter = function (graphic, points) {
        return graphic.relateGraphic.drawCenterPoint || points[1];
    };

    LabelLayer.prototype.getLineCenterPoint = function (path) {
        return MathUtils.calculateCenterOfLine(path[0]).center;
    };

    LabelLayer.prototype.chooseBestScreenPoint = function (level, width, height, screenPriorityArray, distance) {
        if (!screenPriorityArray[level]) return null;
        let screenPoint = screenPriorityArray[level].position;
        let textPoint = new Point();
        switch (level) {
            case 0: { // 下
                textPoint.x = screenPoint.x;
                textPoint.y = screenPoint.y - (height * 0.5 + distance);
                break;
            }
            case 1: { // 上
                textPoint.x = screenPoint.x;
                textPoint.y = screenPoint.y + height * 0.5 + distance;
                break;
            }
            case 2: { // 右
                textPoint.x = screenPoint.x + width * 0.5 + distance;
                textPoint.y = screenPoint.y;
                break;
            }
            case 3: { // 左
                textPoint.x = screenPoint.x - width * 0.5 - distance;
                textPoint.y = screenPoint.y;
                break;
            }
            case 4: { // 右下
                textPoint.x = screenPoint.x + width * 0.5 + distance;
                textPoint.y = screenPoint.y - (height * 0.5 + distance);
                break;
            }
            case 5: { // 左下
                textPoint.x = screenPoint.x - width * 0.5 - distance;
                textPoint.y = screenPoint.y - (height * 0.5 + distance);
                break;
            }
            case 6: { // 右上
                textPoint.x = screenPoint.x + width * 0.5 + distance;
                textPoint.y = screenPoint.y + height * 0.5 + distance;
                break;
            }
            case 7: { // 左上
                textPoint.x = screenPoint.x - width * 0.5 - distance;
                textPoint.y = screenPoint.y + height * 0.5 + distance;
                break;
            }
            default:
                textPoint.x = screenPoint.x;
                textPoint.y = screenPoint.y;
                break;
        }
        return textPoint;
    };

    LabelLayer.prototype.getGraphicSizeWithPoint = function (view, point, graphic, computePolygon) {
        var size = view.queryGraphicSizeByPoint(point, computePolygon);
        if (size.width === Infinity || size.height === Infinity) {
            size = graphic.relateGraphic.extent;
        }
        var centerX = (size.xmin + size.xmax) / 2,
            centerY = (size.ymin + size.ymax) / 2;
        var southPoint = new Point(centerX, size.ymin),
            northPoint = new Point(centerX, size.ymax),
            eastPoint = new Point(size.xmax, centerY),
            westPoint = new Point(size.xmin, centerY),
            southEastPoint = new Point(size.xmax, size.ymin),
            southWestPoint = new Point(size.xmin, size.ymin),
            northEastPoint = new Point(size.xmax, size.ymax),
            northWestPoint = new Point(size.xmin, size.ymax),
            centerPoint = new Point(centerX, centerY);
        var result = [];
        result[0] = {position: southPoint, level: 0};
        result[1] = {position: northPoint, level: 1};
        result[2] = {position: eastPoint, level: 2};
        result[3] = {position: westPoint, level: 3};
        result[4] = {position: southEastPoint, level: 4};
        result[5] = {position: southWestPoint, level: 5};
        result[6] = {position: northEastPoint, level: 6};
        result[7] = {position: northWestPoint, level: 7};
        result[8] = {position: centerPoint, level: 8};
        return result;
    };

    LabelLayer.prototype.getBestScreenLevel = function (view, labelWidth, labelHeight, bestScreenArray) {
        for (var i = 0; i < bestScreenArray.length; i++) {
            if (!this._checkBestPositionState(view, bestScreenArray[i], labelWidth, labelHeight)) {
                return bestScreenArray[i].level;
            }
        }
        return -1;
    };

    LabelLayer.prototype._checkBestPositionState = function (view, pt, width, height) {
        var point = pt.position;
        if (!point) return true;
        return this._checkCellStateWithLevel(view, pt.level, point, width, height);
    };

    LabelLayer.prototype._checkCellStateWithLevel = function (view, level, point, width, height) {
        var xmin, xmax, ymin, ymax;
        switch (level) {
            case 0: {   // 下
                xmin = point.x - width * 0.5;
                xmax = point.x + width * 0.5;
                ymin = point.y - height - gap;
                ymax = point.y - gap;
                return view.checkExtentState(xmin, ymin, xmax, ymax);
            }
            case 1: {   // 上
                xmin = point.x - width * 0.5;
                xmax = point.x + width * 0.5;
                ymin = point.y + gap;
                ymax = point.y + height + gap;
                return view.checkExtentState(xmin, ymin, xmax, ymax);
            }
            case 2: {  // 右
                xmin = point.x + gap;
                xmax = point.x + width + gap;
                ymin = point.y - height * 0.5;
                ymax = point.y + height * 0.5;
                return view.checkExtentState(xmin, ymin, xmax, ymax);
            }
            case 3: {   // 左
                xmin = point.x - width - gap;
                xmax = point.x - gap;
                ymin = point.y - height * 0.5;
                ymax = point.y + height * 0.5;
                return view.checkExtentState(xmin, ymin, xmax, ymax);
            }
            case 4: {  // 右下
                xmin = point.x + gap;
                xmax = point.x + width + gap;
                ymin = point.y + gap;
                ymax = point.y + height + gap;
                return view.checkExtentState(xmin, ymin, xmax, ymax);
            }
            case 5: {  // 左下
                xmin = point.x - width - gap;
                xmax = point.x - gap;
                ymin = point.y - height - gap;
                ymax = point.y - gap;
                return view.checkExtentState(xmin, ymin, xmax, ymax);
            }
            case 6: {  // 右上
                xmin = point.x + gap;
                xmax = point.x + width + gap;
                ymin = point.y + gap;
                ymax = point.y + height + gap;
                return view.checkExtentState(xmin, ymin, xmax, ymax);
            }
            case 7: {  // 左上
                xmin = point.x - width - gap;
                xmax = point.x - gap;
                ymin = point.y + gap;
                ymax = point.y + height + gap;
                return view.checkExtentState(xmin, ymin, xmax, ymax);
            }
            case 8:
                return true;
        }
    };

    LabelLayer.prototype.clear = function () {
        this.graphicsLayer.clear();
    };

    return LabelLayer;
});
