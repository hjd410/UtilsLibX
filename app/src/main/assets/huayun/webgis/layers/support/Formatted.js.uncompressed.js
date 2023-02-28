define("com/huayun/webgis/layers/support/Formatted", [], function () {
  var FormattedSection = function FormattedSection(text, scale, fontStack) {
    this.text = text;
    this.scale = scale;
    this.fontStack = fontStack;
  };

  var Formatted = function Formatted(sections) {
    this.sections = sections;
  };

  Formatted.fromString = function fromString(unformatted) {
    return new Formatted([new FormattedSection(unformatted, null, null)]);
  };

  Formatted.prototype.toString = function toString() {
    return this.sections.map(function (section) {
      return section.text;
    }).join('');
  };

  Formatted.prototype.serialize = function serialize() {
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