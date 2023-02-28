/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/25
 *  @time   :   14:17
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/util/SymbolFactory", [
    "../webgis/symbols/CompositeMarkSymbol",
    "../webgis/symbols/CompositeLineSymbol",
    "../webgis/symbols/CompositeFillSymbol"
], function (CompositeMarkSymbol, CompositeLineSymbol, CompositeFillSymbol) {
    return (function () {
        function SymbolFactory() {
            this._propertyName = 'DefaultValue';
        }

        SymbolFactory.prototype.createSymbols = function (rules, feature) {

        };

        SymbolFactory.prototype.createSymbol = function (rule) {
            if (rule === null)
                return null;
            /*if (rule.style && typeof rule.styleGroup === 'undefined') {
                rule.styles = [rule.style];
                rule.propertyName = undefined;
            }
            if (rule.styleGroup && typeof rule.style === 'undefined') {
                rule.propertyName = rule.styleGroup._propertyName;
                // debugger;
                var style = rule.styleGroup.style;
                var tempArr = [];
                style.forEach(function (element) {
                    tempArr.push(element);
                });
                rule.styles = tempArr;
            }*/
            this.getPropertyName(rule.propertyName);
            return this.getSymbol(rule);
        };
        SymbolFactory.prototype.getPropertyName = function (value) {
            /*if (typeof value === 'undefined') return;
            var propertyList = value.split(',');
            var nameArr = [];
            for (var i = 0, len = propertyList.length; i < len; i++) {
                var property = propertyList[i];
                for (var j = 0, len2 = attributes.length; j < len2; j++) {
                    var item = attributes[j];
                    if (item.name && property.toUpperCase() === item.name.toUpperCase()) {
                        this._propertyName = item.value !== '' ? item.value : 'DefaultValue';
                        nameArr.push(this._propertyName);
                    }
                }
            }
            this._propertyName = nameArr.toString();*/
            this._propertyName = value;
        };

        SymbolFactory.prototype.getSymbol = function (rule) {
            var list = rule.styles, type = rule.geoType, minScale = rule.minScale, maxScale = rule.maxScale;
            if (list.length === 1) {
                // todo只有一个样式
                var aStyle = list[0];
                return this.createCompositeSymbol(type, aStyle, minScale, maxScale, rule);
                // debugger;
            } else if (list.length > 1) {
                /// todo有多个样式，需要根据featture中的attributes来匹配出样式
                var styleGroup = {};
                for (var i = 0; i < list.length; i++) {
                    var aStyleVo = list[i];
                    /*if (aStyleVo.propertyValue === this._propertyName) {
                        return this.createCompositeSymbol(type, aStyleVo, minScale, maxScale);
                    }*/

                    if (aStyleVo.maxPropertyValue && aStyleVo.minPropertyValue) {
                        styleGroup[aStyleVo.maxPropertyValue + "-" + aStyleVo.minPropertyValue] = this.createCompositeSymbol(type, aStyleVo, minScale, maxScale, rule);
                    } else {
                        styleGroup[aStyleVo.propertyValue] = this.createCompositeSymbol(type, aStyleVo, minScale, maxScale, rule);
                    }
                }
                return styleGroup;
            }
            return null;
        };
        SymbolFactory.prototype.createCompositeSymbol = function (type, styleVo, minScale, maxScale, rule) {
            var result;
            switch (type) {
                case 'point':
                    styleVo.addratio = rule.addratio;
                    styleVo.isFixed = rule.isFixed;
                    styleVo.minScale = minScale;
                    styleVo.maxScale = maxScale;
                    result = new CompositeMarkSymbol(styleVo);
                    result.minScale = minScale;
                    result.maxScale = maxScale;
                    return result;
                case 'line':
                    styleVo.addratio = rule.addratio;
                    styleVo.isFixed = rule.isFixed;
                    styleVo.minScale = minScale;
                    styleVo.maxScale = maxScale;
                    result = new CompositeLineSymbol(styleVo);
                    result.minScale = minScale;
                    result.maxScale = maxScale;
                    return result;
                case 'polygon':
                    styleVo.addratio = rule.addratio;
                    styleVo.isFixed = rule.isFixed;
                    styleVo.minScale = minScale;
                    styleVo.maxScale = maxScale;
                    result = new CompositeFillSymbol(styleVo);
                    result.minScale = minScale;
                    result.maxScale = maxScale;
                    return result;
            }
            return null;
        };

        SymbolFactory.prototype._getStylesFromStyleList = function (id, list, type) {
            var reg = /(\w+)\.(\w+)/;
            if (reg.test(id)) {
                var tempStyles = null;
                out:for (var i = 0; i < list.length; i++) {
                    var aStyle1 = list[i];
                    if (aStyle1.name === RegExp.$1) {
                        tempStyles = aStyle1.styles;
                        break out;
                    }
                }
                if (tempStyles) {
                    // debugger;
                    var style = tempStyles[type].style;
                    if (Array.isArray(style)) {
                        for (var j = 0; j < style.length; j++) {
                            var aStyle = style[j];
                            if (aStyle._id === RegExp.$2) {
                                for (var symbolKey in aStyle) {
                                    // debugger;
                                    if (aStyle.hasOwnProperty(symbolKey)) {
                                        var tempObj = aStyle[symbolKey];
                                        if (Object.prototype.toString.call(tempObj) === '[object Object]') {
                                            // debugger;
                                            return [tempObj];
                                        } else if (Array.isArray(tempObj)) {
                                            // debugger;
                                            return tempObj;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        // todo 只配置一个样式的时候
                        for (var symbolKey1 in style) {
                            if (style.hasOwnProperty(symbolKey1)) {
                                var tempObj1 = style[symbolKey1];
                                if (Object.prototype.toString.call(tempObj1) === '[object Object]') {
                                    return [tempObj1];
                                }
                            }
                        }
                    }
                }
            }
        };
        return SymbolFactory;
    }());
});
