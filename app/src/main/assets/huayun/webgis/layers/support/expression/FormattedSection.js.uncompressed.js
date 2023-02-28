define("com/huayun/webgis/layers/support/expression/FormattedSection", [], function () {

    var FormattedSection = function FormattedSection(text, scale, fontStack) {
        this.text = text;
        this.scale = scale;
        this.fontStack = fontStack;
    };

    return FormattedSection;
})