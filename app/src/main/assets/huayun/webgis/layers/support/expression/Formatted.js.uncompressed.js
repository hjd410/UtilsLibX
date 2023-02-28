define("com/huayun/webgis/layers/support/expression/Formatted", [
    "./FormattedSection"
], function (FormattedSection) {

    var Formatted = function Formatted(sections) {
        this.sections = sections;
    };

    Formatted.fromString = function (unformatted) {
        return new Formatted([new FormattedSection(unformatted, null, null)]);
    };

    Formatted.prototype.toString = function () {
        return this.sections.map(function (section) {
            return section.text;
        }).join('');
    };

    Formatted.prototype.serialize = function () {
        var serialized = ["format"];
        for (var i = 0, list = this.sections; i < list.length; i += 1) {
            var section = list[i];
            serialized.push(section.text);
            var options = {};
            if (section.fontStack) {
                options["text-font"] = ["literal", section.fontStack.split(',')];
            }
            if (section.scale) {
                options["font-scale"] = section.scale;
            }
            serialized.push(options);
        }
        return serialized;
    };

    return Formatted;
});