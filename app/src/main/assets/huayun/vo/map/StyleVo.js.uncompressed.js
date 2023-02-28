/**
 *  @author :   JiGuangJie
 *  @date   :   2020/5/27
 *  @time   :   19:57
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/vo/map/StyleVo", [
    "../../util/JSONFormatterUtil",
    "../../webgis/utils/utils"
], function (JSONFormatterUtil, utils) {
    var reg = /(.+)\.(.+)/;

    function StyleVo(params, styles) {
        this.styleId = '';
        this.type = params.type;    // 点、线、面不同的时候，对于显示样式rule的子元素，表示数据展现的一些参数不同。
        // debugger;
        // this.rotation
        var temp = JSONFormatterUtil.formatterKey(params);
        for (var key in temp) {
            if (temp.hasOwnProperty(key)) {
                this.parseStyle(key, temp[key]);
            }
        }
        for (var j = 0, len = styles.length; j < len; j++) {
            var aSymbol = styles[j];
            if (aSymbol.type === 'point' || aSymbol.type === 'line' || aSymbol.type === '1001' || aSymbol.type === '1002') {
                // affectlayers 颜色对于复合符号的有效设置，默认为最上面的符号，如果不配置则为1
                if (!aSymbol.hasOwnProperty('affectlayers')) {
                    aSymbol['affectlayers'] = "1";
                }
            }
        }
        for (var i = 0, len = styles.length; i < len; i++) {
            var aSymbol = styles[i];
            if (aSymbol.id === this.styleId) {
                this.symbol = utils.clone(aSymbol.symbols);
                for (var j = 0; j < this.symbol.length; j++) {
                    var style = this.symbol[j];
                    if (aSymbol['affectlayers'] !== undefined) {
                        var affectLayers = aSymbol['affectlayers'].split(',');
                        this.parseAffectLayers(affectLayers, this.symbol);
                    }
                    var markerFlag = style.hasOwnProperty('marker');
                    if (markerFlag) {
                        if (typeof style['marker'] === "string") {
                            style['marker'] = this.findStyleById(style['marker'], styles);
                        }
                    }
                    var outlineFlag = style.hasOwnProperty('outline');
                    if (outlineFlag) {
                        if (typeof style['outline'] === "string") {
                            style['outline'] = this.findStyleById(style['outline'], styles);
                        } /*else {
                            style['outline'] = this.findStyleById(style['outline'], styles);
                        }*/
                    }
                }
            }
        }
    }

    StyleVo.prototype.parseAffectLayers = function (affectLayers, symbols) {
        for (var i = 0; i < affectLayers.length; i++) {
            var index = affectLayers[i] - 1;
            var aSymbol = symbols[index];
            if (aSymbol && aSymbol.hasOwnProperty('color')) {
                aSymbol['color'] = this.color || aSymbol['color'];
            }
            if (aSymbol && aSymbol.hasOwnProperty('fill')) {
                aSymbol['fill'] = this.color || aSymbol['fill'];
            }
            if (aSymbol && (aSymbol.hasOwnProperty('fill-one') || aSymbol.hasOwnProperty('fill-two'))) {
                aSymbol['fill-one'] = this['fill-one'] || aSymbol['fill-one'];
                aSymbol['fill-two'] = this['fill-two'] || aSymbol['fill-two'];
            }
            if (aSymbol && aSymbol.hasOwnProperty('stroke')) {
                aSymbol['stroke'] = this.stroke || aSymbol['stroke'];
            }
        }
    };

    StyleVo.prototype.parseStyle = function (key, params) {
        if (Object.prototype.toString.call(params) === "[object String]") {
            this[key] = params;
        } else if (Object.prototype.toString.call(params) === "[object Number]") {
            this[key] = params.toString();
        } else if (Object.prototype.toString.call(params) === "[object Object]") {
            this[key] = JSONFormatterUtil.formatterKey(params);
        }
    };

    StyleVo.prototype.findStyleById = function (id, list) {
        var result = null;
        for (var i = 0; i < list.length; i++) {
            var listElement = list[i];
            if (id === listElement.id) {
                var symbols = listElement.symbols;
                var affectLayers = listElement['affectlayers'].split(',');
                this.parseAffectLayers(affectLayers, symbols);
                result = listElement;
                break;
            }
        }
        return result;
    };
    return StyleVo;
});
