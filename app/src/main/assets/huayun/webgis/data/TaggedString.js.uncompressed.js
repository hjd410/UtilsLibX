define("com/huayun/webgis/data/TaggedString", [], function () {
    var TaggedString = function TaggedString() {
        this.text = "";
        this.sectionIndex = [];
        this.sections = [];
    };

    TaggedString.fromFeature = function fromFeature(text, defaultFontStack) {
        var result = new TaggedString();
        for (var i = 0; i < text.sections.length; i++) {
            var section = text.sections[i];
            result.sections.push({
                scale: section.scale || 1,
                fontStack: section.fontStack || defaultFontStack
            });
            result.text += section.text;
            for (var j = 0; j < section.text.length; j++) {
                result.sectionIndex.push(i);
            }
        }
        return result;
    };
    
    TaggedString.prototype.length = function length() {
        return this.text.length;
    };

    TaggedString.prototype.getSection = function getSection(index) {
        return this.sections[this.sectionIndex[index]];
    };

    TaggedString.prototype.getCharCode = function getCharCode(index) {
        return this.text.charCodeAt(index);
    };

    TaggedString.prototype.verticalizePunctuation = function verticalizePunctuation$1() {
        this.text = funcUtils.verticalizePunctuation(this.text);
    };

    TaggedString.prototype.trim = function trim() {
        var beginningWhitespace = 0;
        for (var i = 0;
             i < this.text.length && whitespace[this.text.charCodeAt(i)];
             i++) {
            beginningWhitespace++;
        }
        var trailingWhitespace = this.text.length;
        for (var i$1 = this.text.length - 1;
             i$1 >= 0 && i$1 >= beginningWhitespace && whitespace[this.text.charCodeAt(i$1)];
             i$1--) {
            trailingWhitespace--;
        }
        this.text = this.text.substring(beginningWhitespace, trailingWhitespace);
        this.sectionIndex = this.sectionIndex.slice(beginningWhitespace, trailingWhitespace);
    };

    TaggedString.prototype.substring = function substring(start, end) {
        var substring = new TaggedString();
        substring.text = this.text.substring(start, end);
        substring.sectionIndex = this.sectionIndex.slice(start, end);
        substring.sections = this.sections;
        return substring;
    };

    TaggedString.prototype.toString = function toString() {
        return this.text;
    };

    TaggedString.prototype.getMaxScale = function getMaxScale() {
        var this$1 = this;

        return this.sectionIndex.reduce(function (max, index) {
            return Math.max(max, this$1.sections[index].scale);
        }, 0);
    };

    return TaggedString;
});