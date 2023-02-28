define("com/huayun/vo/map/LabelVo", [
    "../../util/JSONFormatterUtil",
], function (JSONFormatterUtil) {

    /**
     *
     * @param props
     * @param type
     * @constructor
     */
    function Position(props, type) {
        this.type = type; // 图形的类型
        props.position = JSONFormatterUtil.formatterKey(props.position);
        if (props.position && props.position.hasOwnProperty('distance')) {
            const {distance, text} = props.position;
            this.distance = Number(distance); // 文本标注和图形的距离
            this.layout = text;  // 文本方位布局
        } else if (props.position) {
            const {position} = props;
            this.layout = position;
        }
    }

    function StackLabel(props, type) {
        this.autoWrap = JSONFormatterUtil.formatterKey(props).autoWrap.toString() === 'true';
        this.labelAlignment = props.labelAlignment;
        this.wrapWidth = Number(props.wrapWidth);
    }

    function LabelPlacement(props, type) {
        this.position = new Position(props, type);
        var stackLabel = props.stackLabel;
        if (typeof stackLabel !== 'undefined') {
            this.stackLabel = new StackLabel(stackLabel, type);
        }
    }

    var reg = /(.+)\.(.+)/;

    function LabelVo(params, type, styles) {
        this.fixedSize = params.fixedSize && JSONFormatterUtil.formatterKey(params.fixedSize).isFixed.toString() === "true";
        this.showLabel = params.showLabel.toString() === "true";
        this.labelContent = this.parseLabelContent(params.labelContent, styles);
        this.labelPlacement = params.labelPlacement ? new LabelPlacement(params.labelPlacement, type) : null;
    }

    LabelVo.prototype.parseLabelContent = function (labelContent, styles) {
        if (!this.showLabel) {
            return undefined;
        }
        var textString = JSONFormatterUtil.formatterKey(labelContent.textString);
        var symbol;
        var styleId = textString.styleid;
        if (textString && styleId && reg.test(styleId)) {
            for (var i = 0, len = styles.length; i < len; i++) {
                var aStyle = styles[i];
                if (styleId === aStyle.id) {
                    for (var j = 0; j < aStyle.symbols.length; j++) {
                        var style = aStyle.symbols[j];
                        if (this.hasOwnProperty('color')) {
                            style.color = this.color;
                        }
                    }
                    symbol = aStyle.symbols[0];
                    return {
                        "text": textString["text"] || textString["content"],
                        "symbol": symbol
                    }
                }
            }
        }
        /*if (textString && textString['_styleid'] && reg.test(textString['_styleid'])) {
            for (var i = 0, ii = styles[RegExp.$1].length; i < ii; i++) {
                if (!styles[RegExp.$1]) {
                    continue;
                }
                var styleElement = styles[RegExp.$1][i];
                if (!styleElement) {
                    continue;
                }
                if (RegExp.$2 === styleElement.id) {
                    for (var j = 0; j < styleElement.symbols.length; j++) {
                        var style = styleElement.symbols[j];
                        if (this.hasOwnProperty('color')) {
                            style.color = this.color;
                        }
                    }
                    symbol = styleElement.symbols[0];
                    return {
                        "__text": textString["__text"],
                        "symbol": symbol
                    }
                }
            }
        }*/
        return undefined;
    };

    return LabelVo;
});
