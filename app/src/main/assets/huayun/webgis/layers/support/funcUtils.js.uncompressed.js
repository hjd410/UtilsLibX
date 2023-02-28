define("com/huayun/webgis/layers/support/funcUtils", [
    "exports",
    "com/huayun/webgis/geometry/Point2D",
    "./expression/Interpolate",
    "custom/gl-matrix-min"
], function (exports, pointGeometry, Interpolate, glMatrix) {

    exports.pick = function (src, properties) {
        var result = {};
        for (var i = 0; i < properties.length; i++) {
            var k = properties[i];
            if (k in src) {
                result[k] = src[k];
            }
        }
        return result;
    };

    exports.bindAll = function (fns, context) {
        fns.forEach(function (fn) {
            if (!context[fn]) {
                return;
            }
            context[fn] = context[fn].bind(context);
        });
    };

    exports.asyncAll = function (array, fn, callback) {
        if (!array.length) {
            return callback(null, []);
        }
        var remaining = array.length;
        var results = new Array(array.length);
        var error = null;
        array.forEach(function (item, i) {
            fn(item, function (err, result) {
                if (err) {
                    error = err;
                }
                results[i] = ((result));
                if (--remaining === 0) {
                    callback(error, results);
                }
            });
        });
    };

    exports.calculateKey = function (wrap, z, x, y) {
        /*wrap *= 2;
        if (wrap < 0) {
            wrap = wrap * -1 - 1;
        }
        var dim = 1 << z;
        return ((dim * dim * wrap + dim * y + x) * 32) + z;*/
        return z+"/"+x+"/"+y;
    };

    exports.now = self.performance && self.performance.now ?
        self.performance.now.bind(self.performance) :
        Date.now.bind(Date);

    var unicodeBlockLookup = {
        // 'Basic Latin': (ch) => ch >= 0x0000 && ch <= 0x007F,
        'Latin-1 Supplement': function (ch) {
            return ch >= 0x0080 && ch <= 0x00FF;
        },
        // 'Latin Extended-A': (ch) => ch >= 0x0100 && ch <= 0x017F,
        // 'Latin Extended-B': (ch) => ch >= 0x0180 && ch <= 0x024F,
        // 'IPA Extensions': (ch) => ch >= 0x0250 && ch <= 0x02AF,
        // 'Spacing Modifier Letters': (ch) => ch >= 0x02B0 && ch <= 0x02FF,
        // 'Combining Diacritical Marks': (ch) => ch >= 0x0300 && ch <= 0x036F,
        // 'Greek and Coptic': (ch) => ch >= 0x0370 && ch <= 0x03FF,
        // 'Cyrillic': (ch) => ch >= 0x0400 && ch <= 0x04FF,
        // 'Cyrillic Supplement': (ch) => ch >= 0x0500 && ch <= 0x052F,
        // 'Armenian': (ch) => ch >= 0x0530 && ch <= 0x058F,
        //'Hebrew': (ch) => ch >= 0x0590 && ch <= 0x05FF,
        'Arabic': function (ch) {
            return ch >= 0x0600 && ch <= 0x06FF;
        },
        //'Syriac': (ch) => ch >= 0x0700 && ch <= 0x074F,
        'Arabic Supplement': function (ch) {
            return ch >= 0x0750 && ch <= 0x077F;
        },
        // 'Thaana': (ch) => ch >= 0x0780 && ch <= 0x07BF,
        // 'NKo': (ch) => ch >= 0x07C0 && ch <= 0x07FF,
        // 'Samaritan': (ch) => ch >= 0x0800 && ch <= 0x083F,
        // 'Mandaic': (ch) => ch >= 0x0840 && ch <= 0x085F,
        // 'Syriac Supplement': (ch) => ch >= 0x0860 && ch <= 0x086F,
        'Arabic Extended-A': function (ch) {
            return ch >= 0x08A0 && ch <= 0x08FF;
        },
        // 'Devanagari': (ch) => ch >= 0x0900 && ch <= 0x097F,
        // 'Bengali': (ch) => ch >= 0x0980 && ch <= 0x09FF,
        // 'Gurmukhi': (ch) => ch >= 0x0A00 && ch <= 0x0A7F,
        // 'Gujarati': (ch) => ch >= 0x0A80 && ch <= 0x0AFF,
        // 'Oriya': (ch) => ch >= 0x0B00 && ch <= 0x0B7F,
        // 'Tamil': (ch) => ch >= 0x0B80 && ch <= 0x0BFF,
        // 'Telugu': (ch) => ch >= 0x0C00 && ch <= 0x0C7F,
        // 'Kannada': (ch) => ch >= 0x0C80 && ch <= 0x0CFF,
        // 'Malayalam': (ch) => ch >= 0x0D00 && ch <= 0x0D7F,
        // 'Sinhala': (ch) => ch >= 0x0D80 && ch <= 0x0DFF,
        // 'Thai': (ch) => ch >= 0x0E00 && ch <= 0x0E7F,
        // 'Lao': (ch) => ch >= 0x0E80 && ch <= 0x0EFF,
        // 'Tibetan': (ch) => ch >= 0x0F00 && ch <= 0x0FFF,
        // 'Myanmar': (ch) => ch >= 0x1000 && ch <= 0x109F,
        // 'Georgian': (ch) => ch >= 0x10A0 && ch <= 0x10FF,
        'Hangul Jamo': function (ch) {
            return ch >= 0x1100 && ch <= 0x11FF;
        },
        // 'Ethiopic': (ch) => ch >= 0x1200 && ch <= 0x137F,
        // 'Ethiopic Supplement': (ch) => ch >= 0x1380 && ch <= 0x139F,
        // 'Cherokee': (ch) => ch >= 0x13A0 && ch <= 0x13FF,
        'Unified Canadian Aboriginal Syllabics': function (ch) {
            return ch >= 0x1400 && ch <= 0x167F;
        },
        // 'Ogham': (ch) => ch >= 0x1680 && ch <= 0x169F,
        // 'Runic': (ch) => ch >= 0x16A0 && ch <= 0x16FF,
        // 'Tagalog': (ch) => ch >= 0x1700 && ch <= 0x171F,
        // 'Hanunoo': (ch) => ch >= 0x1720 && ch <= 0x173F,
        // 'Buhid': (ch) => ch >= 0x1740 && ch <= 0x175F,
        // 'Tagbanwa': (ch) => ch >= 0x1760 && ch <= 0x177F,
        'Khmer': function (ch) {
            return ch >= 0x1780 && ch <= 0x17FF;
        },
        // 'Mongolian': (ch) => ch >= 0x1800 && ch <= 0x18AF,
        'Unified Canadian Aboriginal Syllabics Extended': function (ch) {
            return ch >= 0x18B0 && ch <= 0x18FF;
        },
        // 'Limbu': (ch) => ch >= 0x1900 && ch <= 0x194F,
        // 'Tai Le': (ch) => ch >= 0x1950 && ch <= 0x197F,
        // 'New Tai Lue': (ch) => ch >= 0x1980 && ch <= 0x19DF,
        // 'Khmer Symbols': (ch) => ch >= 0x19E0 && ch <= 0x19FF,
        // 'Buginese': (ch) => ch >= 0x1A00 && ch <= 0x1A1F,
        // 'Tai Tham': (ch) => ch >= 0x1A20 && ch <= 0x1AAF,
        // 'Combining Diacritical Marks Extended': (ch) => ch >= 0x1AB0 && ch <= 0x1AFF,
        // 'Balinese': (ch) => ch >= 0x1B00 && ch <= 0x1B7F,
        // 'Sundanese': (ch) => ch >= 0x1B80 && ch <= 0x1BBF,
        // 'Batak': (ch) => ch >= 0x1BC0 && ch <= 0x1BFF,
        // 'Lepcha': (ch) => ch >= 0x1C00 && ch <= 0x1C4F,
        // 'Ol Chiki': (ch) => ch >= 0x1C50 && ch <= 0x1C7F,
        // 'Cyrillic Extended-C': (ch) => ch >= 0x1C80 && ch <= 0x1C8F,
        // 'Georgian Extended': (ch) => ch >= 0x1C90 && ch <= 0x1CBF,
        // 'Sundanese Supplement': (ch) => ch >= 0x1CC0 && ch <= 0x1CCF,
        // 'Vedic Extensions': (ch) => ch >= 0x1CD0 && ch <= 0x1CFF,
        // 'Phonetic Extensions': (ch) => ch >= 0x1D00 && ch <= 0x1D7F,
        // 'Phonetic Extensions Supplement': (ch) => ch >= 0x1D80 && ch <= 0x1DBF,
        // 'Combining Diacritical Marks Supplement': (ch) => ch >= 0x1DC0 && ch <= 0x1DFF,
        // 'Latin Extended Additional': (ch) => ch >= 0x1E00 && ch <= 0x1EFF,
        // 'Greek Extended': (ch) => ch >= 0x1F00 && ch <= 0x1FFF,
        'General Punctuation': function (ch) {
            return ch >= 0x2000 && ch <= 0x206F;
        },
        // 'Superscripts and Subscripts': (ch) => ch >= 0x2070 && ch <= 0x209F,
        // 'Currency Symbols': (ch) => ch >= 0x20A0 && ch <= 0x20CF,
        // 'Combining Diacritical Marks for Symbols': (ch) => ch >= 0x20D0 && ch <= 0x20FF,
        'Letterlike Symbols': function (ch) {
            return ch >= 0x2100 && ch <= 0x214F;
        },
        'Number Forms': function (ch) {
            return ch >= 0x2150 && ch <= 0x218F;
        },
        // 'Arrows': (ch) => ch >= 0x2190 && ch <= 0x21FF,
        // 'Mathematical Operators': (ch) => ch >= 0x2200 && ch <= 0x22FF,
        'Miscellaneous Technical': function (ch) {
            return ch >= 0x2300 && ch <= 0x23FF;
        },
        'Control Pictures': function (ch) {
            return ch >= 0x2400 && ch <= 0x243F;
        },
        'Optical Character Recognition': function (ch) {
            return ch >= 0x2440 && ch <= 0x245F;
        },
        'Enclosed Alphanumerics': function (ch) {
            return ch >= 0x2460 && ch <= 0x24FF;
        },
        // 'Box Drawing': (ch) => ch >= 0x2500 && ch <= 0x257F,
        // 'Block Elements': (ch) => ch >= 0x2580 && ch <= 0x259F,
        'Geometric Shapes': function (ch) {
            return ch >= 0x25A0 && ch <= 0x25FF;
        },
        'Miscellaneous Symbols': function (ch) {
            return ch >= 0x2600 && ch <= 0x26FF;
        },
        // 'Dingbats': (ch) => ch >= 0x2700 && ch <= 0x27BF,
        // 'Miscellaneous Mathematical Symbols-A': (ch) => ch >= 0x27C0 && ch <= 0x27EF,
        // 'Supplemental Arrows-A': (ch) => ch >= 0x27F0 && ch <= 0x27FF,
        // 'Braille Patterns': (ch) => ch >= 0x2800 && ch <= 0x28FF,
        // 'Supplemental Arrows-B': (ch) => ch >= 0x2900 && ch <= 0x297F,
        // 'Miscellaneous Mathematical Symbols-B': (ch) => ch >= 0x2980 && ch <= 0x29FF,
        // 'Supplemental Mathematical Operators': (ch) => ch >= 0x2A00 && ch <= 0x2AFF,
        'Miscellaneous Symbols and Arrows': function (ch) {
            return ch >= 0x2B00 && ch <= 0x2BFF;
        },
        // 'Glagolitic': (ch) => ch >= 0x2C00 && ch <= 0x2C5F,
        // 'Latin Extended-C': (ch) => ch >= 0x2C60 && ch <= 0x2C7F,
        // 'Coptic': (ch) => ch >= 0x2C80 && ch <= 0x2CFF,
        // 'Georgian Supplement': (ch) => ch >= 0x2D00 && ch <= 0x2D2F,
        // 'Tifinagh': (ch) => ch >= 0x2D30 && ch <= 0x2D7F,
        // 'Ethiopic Extended': (ch) => ch >= 0x2D80 && ch <= 0x2DDF,
        // 'Cyrillic Extended-A': (ch) => ch >= 0x2DE0 && ch <= 0x2DFF,
        // 'Supplemental Punctuation': (ch) => ch >= 0x2E00 && ch <= 0x2E7F,
        'CJK Radicals Supplement': function (ch) {
            return ch >= 0x2E80 && ch <= 0x2EFF;
        },
        'Kangxi Radicals': function (ch) {
            return ch >= 0x2F00 && ch <= 0x2FDF;
        },
        'Ideographic Description Characters': function (ch) {
            return ch >= 0x2FF0 && ch <= 0x2FFF;
        },
        'CJK Symbols and Punctuation': function (ch) {
            return ch >= 0x3000 && ch <= 0x303F;
        },
        'Hiragana': function (ch) {
            return ch >= 0x3040 && ch <= 0x309F;
        },
        'Katakana': function (ch) {
            return ch >= 0x30A0 && ch <= 0x30FF;
        },
        'Bopomofo': function (ch) {
            return ch >= 0x3100 && ch <= 0x312F;
        },
        'Hangul Compatibility Jamo': function (ch) {
            return ch >= 0x3130 && ch <= 0x318F;
        },
        'Kanbun': function (ch) {
            return ch >= 0x3190 && ch <= 0x319F;
        },
        'Bopomofo Extended': function (ch) {
            return ch >= 0x31A0 && ch <= 0x31BF;
        },
        'CJK Strokes': function (ch) {
            return ch >= 0x31C0 && ch <= 0x31EF;
        },
        'Katakana Phonetic Extensions': function (ch) {
            return ch >= 0x31F0 && ch <= 0x31FF;
        },
        'Enclosed CJK Letters and Months': function (ch) {
            return ch >= 0x3200 && ch <= 0x32FF;
        },
        'CJK Compatibility': function (ch) {
            return ch >= 0x3300 && ch <= 0x33FF;
        },
        'CJK Unified Ideographs Extension A': function (ch) {
            return ch >= 0x3400 && ch <= 0x4DBF;
        },
        'Yijing Hexagram Symbols': function (ch) {
            return ch >= 0x4DC0 && ch <= 0x4DFF;
        },
        'CJK Unified Ideographs': function (ch) {
            return ch >= 0x4E00 && ch <= 0x9FFF;
        },
        'Yi Syllables': function (ch) {
            return ch >= 0xA000 && ch <= 0xA48F;
        },
        'Yi Radicals': function (ch) {
            return ch >= 0xA490 && ch <= 0xA4CF;
        },
        // 'Lisu': (ch) => ch >= 0xA4D0 && ch <= 0xA4FF,
        // 'Vai': (ch) => ch >= 0xA500 && ch <= 0xA63F,
        // 'Cyrillic Extended-B': (ch) => ch >= 0xA640 && ch <= 0xA69F,
        // 'Bamum': (ch) => ch >= 0xA6A0 && ch <= 0xA6FF,
        // 'Modifier Tone Letters': (ch) => ch >= 0xA700 && ch <= 0xA71F,
        // 'Latin Extended-D': (ch) => ch >= 0xA720 && ch <= 0xA7FF,
        // 'Syloti Nagri': (ch) => ch >= 0xA800 && ch <= 0xA82F,
        // 'Common Indic Number Forms': (ch) => ch >= 0xA830 && ch <= 0xA83F,
        // 'Phags-pa': (ch) => ch >= 0xA840 && ch <= 0xA87F,
        // 'Saurashtra': (ch) => ch >= 0xA880 && ch <= 0xA8DF,
        // 'Devanagari Extended': (ch) => ch >= 0xA8E0 && ch <= 0xA8FF,
        // 'Kayah Li': (ch) => ch >= 0xA900 && ch <= 0xA92F,
        // 'Rejang': (ch) => ch >= 0xA930 && ch <= 0xA95F,
        'Hangul Jamo Extended-A': function (ch) {
            return ch >= 0xA960 && ch <= 0xA97F;
        },
        // 'Javanese': (ch) => ch >= 0xA980 && ch <= 0xA9DF,
        // 'Myanmar Extended-B': (ch) => ch >= 0xA9E0 && ch <= 0xA9FF,
        // 'Cham': (ch) => ch >= 0xAA00 && ch <= 0xAA5F,
        // 'Myanmar Extended-A': (ch) => ch >= 0xAA60 && ch <= 0xAA7F,
        // 'Tai Viet': (ch) => ch >= 0xAA80 && ch <= 0xAADF,
        // 'Meetei Mayek Extensions': (ch) => ch >= 0xAAE0 && ch <= 0xAAFF,
        // 'Ethiopic Extended-A': (ch) => ch >= 0xAB00 && ch <= 0xAB2F,
        // 'Latin Extended-E': (ch) => ch >= 0xAB30 && ch <= 0xAB6F,
        // 'Cherokee Supplement': (ch) => ch >= 0xAB70 && ch <= 0xABBF,
        // 'Meetei Mayek': (ch) => ch >= 0xABC0 && ch <= 0xABFF,
        'Hangul Syllables': function (ch) {
            return ch >= 0xAC00 && ch <= 0xD7AF;
        },
        'Hangul Jamo Extended-B': function (ch) {
            return ch >= 0xD7B0 && ch <= 0xD7FF;
        },
        // 'High Surrogates': (ch) => ch >= 0xD800 && ch <= 0xDB7F,
        // 'High Private Use Surrogates': (ch) => ch >= 0xDB80 && ch <= 0xDBFF,
        // 'Low Surrogates': (ch) => ch >= 0xDC00 && ch <= 0xDFFF,
        'Private Use Area': function (ch) {
            return ch >= 0xE000 && ch <= 0xF8FF;
        },
        'CJK Compatibility Ideographs': function (ch) {
            return ch >= 0xF900 && ch <= 0xFAFF;
        },
        // 'Alphabetic Presentation Forms': (ch) => ch >= 0xFB00 && ch <= 0xFB4F,
        'Arabic Presentation Forms-A': function (ch) {
            return ch >= 0xFB50 && ch <= 0xFDFF;
        },
        // 'Variation Selectors': (ch) => ch >= 0xFE00 && ch <= 0xFE0F,
        'Vertical Forms': function (ch) {
            return ch >= 0xFE10 && ch <= 0xFE1F;
        },
        // 'Combining Half Marks': (ch) => ch >= 0xFE20 && ch <= 0xFE2F,
        'CJK Compatibility Forms': function (ch) {
            return ch >= 0xFE30 && ch <= 0xFE4F;
        },
        'Small Form Variants': function (ch) {
            return ch >= 0xFE50 && ch <= 0xFE6F;
        },
        'Arabic Presentation Forms-B': function (ch) {
            return ch >= 0xFE70 && ch <= 0xFEFF;
        },
        'Halfwidth and Fullwidth Forms': function (ch) {
            return ch >= 0xFF00 && ch <= 0xFFEF;
        }
        // 'Specials': (ch) => ch >= 0xFFF0 && ch <= 0xFFFF,
        // 'Linear B Syllabary': (ch) => ch >= 0x10000 && ch <= 0x1007F,
        // 'Linear B Ideograms': (ch) => ch >= 0x10080 && ch <= 0x100FF,
        // 'Aegean Numbers': (ch) => ch >= 0x10100 && ch <= 0x1013F,
        // 'Ancient Greek Numbers': (ch) => ch >= 0x10140 && ch <= 0x1018F,
        // 'Ancient Symbols': (ch) => ch >= 0x10190 && ch <= 0x101CF,
        // 'Phaistos Disc': (ch) => ch >= 0x101D0 && ch <= 0x101FF,
        // 'Lycian': (ch) => ch >= 0x10280 && ch <= 0x1029F,
        // 'Carian': (ch) => ch >= 0x102A0 && ch <= 0x102DF,
        // 'Coptic Epact Numbers': (ch) => ch >= 0x102E0 && ch <= 0x102FF,
        // 'Old Italic': (ch) => ch >= 0x10300 && ch <= 0x1032F,
        // 'Gothic': (ch) => ch >= 0x10330 && ch <= 0x1034F,
        // 'Old Permic': (ch) => ch >= 0x10350 && ch <= 0x1037F,
        // 'Ugaritic': (ch) => ch >= 0x10380 && ch <= 0x1039F,
        // 'Old Persian': (ch) => ch >= 0x103A0 && ch <= 0x103DF,
        // 'Deseret': (ch) => ch >= 0x10400 && ch <= 0x1044F,
        // 'Shavian': (ch) => ch >= 0x10450 && ch <= 0x1047F,
        // 'Osmanya': (ch) => ch >= 0x10480 && ch <= 0x104AF,
        // 'Osage': (ch) => ch >= 0x104B0 && ch <= 0x104FF,
        // 'Elbasan': (ch) => ch >= 0x10500 && ch <= 0x1052F,
        // 'Caucasian Albanian': (ch) => ch >= 0x10530 && ch <= 0x1056F,
        // 'Linear A': (ch) => ch >= 0x10600 && ch <= 0x1077F,
        // 'Cypriot Syllabary': (ch) => ch >= 0x10800 && ch <= 0x1083F,
        // 'Imperial Aramaic': (ch) => ch >= 0x10840 && ch <= 0x1085F,
        // 'Palmyrene': (ch) => ch >= 0x10860 && ch <= 0x1087F,
        // 'Nabataean': (ch) => ch >= 0x10880 && ch <= 0x108AF,
        // 'Hatran': (ch) => ch >= 0x108E0 && ch <= 0x108FF,
        // 'Phoenician': (ch) => ch >= 0x10900 && ch <= 0x1091F,
        // 'Lydian': (ch) => ch >= 0x10920 && ch <= 0x1093F,
        // 'Meroitic Hieroglyphs': (ch) => ch >= 0x10980 && ch <= 0x1099F,
        // 'Meroitic Cursive': (ch) => ch >= 0x109A0 && ch <= 0x109FF,
        // 'Kharoshthi': (ch) => ch >= 0x10A00 && ch <= 0x10A5F,
        // 'Old South Arabian': (ch) => ch >= 0x10A60 && ch <= 0x10A7F,
        // 'Old North Arabian': (ch) => ch >= 0x10A80 && ch <= 0x10A9F,
        // 'Manichaean': (ch) => ch >= 0x10AC0 && ch <= 0x10AFF,
        // 'Avestan': (ch) => ch >= 0x10B00 && ch <= 0x10B3F,
        // 'Inscriptional Parthian': (ch) => ch >= 0x10B40 && ch <= 0x10B5F,
        // 'Inscriptional Pahlavi': (ch) => ch >= 0x10B60 && ch <= 0x10B7F,
        // 'Psalter Pahlavi': (ch) => ch >= 0x10B80 && ch <= 0x10BAF,
        // 'Old Turkic': (ch) => ch >= 0x10C00 && ch <= 0x10C4F,
        // 'Old Hungarian': (ch) => ch >= 0x10C80 && ch <= 0x10CFF,
        // 'Hanifi Rohingya': (ch) => ch >= 0x10D00 && ch <= 0x10D3F,
        // 'Rumi Numeral Symbols': (ch) => ch >= 0x10E60 && ch <= 0x10E7F,
        // 'Old Sogdian': (ch) => ch >= 0x10F00 && ch <= 0x10F2F,
        // 'Sogdian': (ch) => ch >= 0x10F30 && ch <= 0x10F6F,
        // 'Elymaic': (ch) => ch >= 0x10FE0 && ch <= 0x10FFF,
        // 'Brahmi': (ch) => ch >= 0x11000 && ch <= 0x1107F,
        // 'Kaithi': (ch) => ch >= 0x11080 && ch <= 0x110CF,
        // 'Sora Sompeng': (ch) => ch >= 0x110D0 && ch <= 0x110FF,
        // 'Chakma': (ch) => ch >= 0x11100 && ch <= 0x1114F,
        // 'Mahajani': (ch) => ch >= 0x11150 && ch <= 0x1117F,
        // 'Sharada': (ch) => ch >= 0x11180 && ch <= 0x111DF,
        // 'Sinhala Archaic Numbers': (ch) => ch >= 0x111E0 && ch <= 0x111FF,
        // 'Khojki': (ch) => ch >= 0x11200 && ch <= 0x1124F,
        // 'Multani': (ch) => ch >= 0x11280 && ch <= 0x112AF,
        // 'Khudawadi': (ch) => ch >= 0x112B0 && ch <= 0x112FF,
        // 'Grantha': (ch) => ch >= 0x11300 && ch <= 0x1137F,
        // 'Newa': (ch) => ch >= 0x11400 && ch <= 0x1147F,
        // 'Tirhuta': (ch) => ch >= 0x11480 && ch <= 0x114DF,
        // 'Siddham': (ch) => ch >= 0x11580 && ch <= 0x115FF,
        // 'Modi': (ch) => ch >= 0x11600 && ch <= 0x1165F,
        // 'Mongolian Supplement': (ch) => ch >= 0x11660 && ch <= 0x1167F,
        // 'Takri': (ch) => ch >= 0x11680 && ch <= 0x116CF,
        // 'Ahom': (ch) => ch >= 0x11700 && ch <= 0x1173F,
        // 'Dogra': (ch) => ch >= 0x11800 && ch <= 0x1184F,
        // 'Warang Citi': (ch) => ch >= 0x118A0 && ch <= 0x118FF,
        // 'Nandinagari': (ch) => ch >= 0x119A0 && ch <= 0x119FF,
        // 'Zanabazar Square': (ch) => ch >= 0x11A00 && ch <= 0x11A4F,
        // 'Soyombo': (ch) => ch >= 0x11A50 && ch <= 0x11AAF,
        // 'Pau Cin Hau': (ch) => ch >= 0x11AC0 && ch <= 0x11AFF,
        // 'Bhaiksuki': (ch) => ch >= 0x11C00 && ch <= 0x11C6F,
        // 'Marchen': (ch) => ch >= 0x11C70 && ch <= 0x11CBF,
        // 'Masaram Gondi': (ch) => ch >= 0x11D00 && ch <= 0x11D5F,
        // 'Gunjala Gondi': (ch) => ch >= 0x11D60 && ch <= 0x11DAF,
        // 'Makasar': (ch) => ch >= 0x11EE0 && ch <= 0x11EFF,
        // 'Tamil Supplement': (ch) => ch >= 0x11FC0 && ch <= 0x11FFF,
        // 'Cuneiform': (ch) => ch >= 0x12000 && ch <= 0x123FF,
        // 'Cuneiform Numbers and Punctuation': (ch) => ch >= 0x12400 && ch <= 0x1247F,
        // 'Early Dynastic Cuneiform': (ch) => ch >= 0x12480 && ch <= 0x1254F,
        // 'Egyptian Hieroglyphs': (ch) => ch >= 0x13000 && ch <= 0x1342F,
        // 'Egyptian Hieroglyph Format Controls': (ch) => ch >= 0x13430 && ch <= 0x1343F,
        // 'Anatolian Hieroglyphs': (ch) => ch >= 0x14400 && ch <= 0x1467F,
        // 'Bamum Supplement': (ch) => ch >= 0x16800 && ch <= 0x16A3F,
        // 'Mro': (ch) => ch >= 0x16A40 && ch <= 0x16A6F,
        // 'Bassa Vah': (ch) => ch >= 0x16AD0 && ch <= 0x16AFF,
        // 'Pahawh Hmong': (ch) => ch >= 0x16B00 && ch <= 0x16B8F,
        // 'Medefaidrin': (ch) => ch >= 0x16E40 && ch <= 0x16E9F,
        // 'Miao': (ch) => ch >= 0x16F00 && ch <= 0x16F9F,
        // 'Ideographic Symbols and Punctuation': (ch) => ch >= 0x16FE0 && ch <= 0x16FFF,
        // 'Tangut': (ch) => ch >= 0x17000 && ch <= 0x187FF,
        // 'Tangut Components': (ch) => ch >= 0x18800 && ch <= 0x18AFF,
        // 'Kana Supplement': (ch) => ch >= 0x1B000 && ch <= 0x1B0FF,
        // 'Kana Extended-A': (ch) => ch >= 0x1B100 && ch <= 0x1B12F,
        // 'Small Kana Extension': (ch) => ch >= 0x1B130 && ch <= 0x1B16F,
        // 'Nushu': (ch) => ch >= 0x1B170 && ch <= 0x1B2FF,
        // 'Duployan': (ch) => ch >= 0x1BC00 && ch <= 0x1BC9F,
        // 'Shorthand Format Controls': (ch) => ch >= 0x1BCA0 && ch <= 0x1BCAF,
        // 'Byzantine Musical Symbols': (ch) => ch >= 0x1D000 && ch <= 0x1D0FF,
        // 'Musical Symbols': (ch) => ch >= 0x1D100 && ch <= 0x1D1FF,
        // 'Ancient Greek Musical Notation': (ch) => ch >= 0x1D200 && ch <= 0x1D24F,
        // 'Mayan Numerals': (ch) => ch >= 0x1D2E0 && ch <= 0x1D2FF,
        // 'Tai Xuan Jing Symbols': (ch) => ch >= 0x1D300 && ch <= 0x1D35F,
        // 'Counting Rod Numerals': (ch) => ch >= 0x1D360 && ch <= 0x1D37F,
        // 'Mathematical Alphanumeric Symbols': (ch) => ch >= 0x1D400 && ch <= 0x1D7FF,
        // 'Sutton SignWriting': (ch) => ch >= 0x1D800 && ch <= 0x1DAAF,
        // 'Glagolitic Supplement': (ch) => ch >= 0x1E000 && ch <= 0x1E02F,
        // 'Nyiakeng Puachue Hmong': (ch) => ch >= 0x1E100 && ch <= 0x1E14F,
        // 'Wancho': (ch) => ch >= 0x1E2C0 && ch <= 0x1E2FF,
        // 'Mende Kikakui': (ch) => ch >= 0x1E800 && ch <= 0x1E8DF,
        // 'Adlam': (ch) => ch >= 0x1E900 && ch <= 0x1E95F,
        // 'Indic Siyaq Numbers': (ch) => ch >= 0x1EC70 && ch <= 0x1ECBF,
        // 'Ottoman Siyaq Numbers': (ch) => ch >= 0x1ED00 && ch <= 0x1ED4F,
        // 'Arabic Mathematical Alphabetic Symbols': (ch) => ch >= 0x1EE00 && ch <= 0x1EEFF,
        // 'Mahjong Tiles': (ch) => ch >= 0x1F000 && ch <= 0x1F02F,
        // 'Domino Tiles': (ch) => ch >= 0x1F030 && ch <= 0x1F09F,
        // 'Playing Cards': (ch) => ch >= 0x1F0A0 && ch <= 0x1F0FF,
        // 'Enclosed Alphanumeric Supplement': (ch) => ch >= 0x1F100 && ch <= 0x1F1FF,
        // 'Enclosed Ideographic Supplement': (ch) => ch >= 0x1F200 && ch <= 0x1F2FF,
        // 'Miscellaneous Symbols and Pictographs': (ch) => ch >= 0x1F300 && ch <= 0x1F5FF,
        // 'Emoticons': (ch) => ch >= 0x1F600 && ch <= 0x1F64F,
        // 'Ornamental Dingbats': (ch) => ch >= 0x1F650 && ch <= 0x1F67F,
        // 'Transport and Map Symbols': (ch) => ch >= 0x1F680 && ch <= 0x1F6FF,
        // 'Alchemical Symbols': (ch) => ch >= 0x1F700 && ch <= 0x1F77F,
        // 'Geometric Shapes Extended': (ch) => ch >= 0x1F780 && ch <= 0x1F7FF,
        // 'Supplemental Arrows-C': (ch) => ch >= 0x1F800 && ch <= 0x1F8FF,
        // 'Supplemental Symbols and Pictographs': (ch) => ch >= 0x1F900 && ch <= 0x1F9FF,
        // 'Chess Symbols': (ch) => ch >= 0x1FA00 && ch <= 0x1FA6F,
        // 'Symbols and Pictographs Extended-A': (ch) => ch >= 0x1FA70 && ch <= 0x1FAFF,
        // 'CJK Unified Ideographs Extension B': (ch) => ch >= 0x20000 && ch <= 0x2A6DF,
        // 'CJK Unified Ideographs Extension C': (ch) => ch >= 0x2A700 && ch <= 0x2B73F,
        // 'CJK Unified Ideographs Extension D': (ch) => ch >= 0x2B740 && ch <= 0x2B81F,
        // 'CJK Unified Ideographs Extension E': (ch) => ch >= 0x2B820 && ch <= 0x2CEAF,
        // 'CJK Unified Ideographs Extension F': (ch) => ch >= 0x2CEB0 && ch <= 0x2EBEF,
        // 'CJK Compatibility Ideographs Supplement': (ch) => ch >= 0x2F800 && ch <= 0x2FA1F,
        // 'Tags': (ch) => ch >= 0xE0000 && ch <= 0xE007F,
        // 'Variation Selectors Supplement': (ch) => ch >= 0xE0100 && ch <= 0xE01EF,
        // 'Supplementary Private Use Area-A': (ch) => ch >= 0xF0000 && ch <= 0xFFFFF,
        // 'Supplementary Private Use Area-B': (ch) => ch >= 0x100000 && ch <= 0x10FFFF,
    };

    exports.isChar = unicodeBlockLookup;

    function allowsLetterSpacing(chars) {
        for (var i = 0, list = chars; i < list.length; i += 1) {
            var ch = list[i];

            if (!charAllowsLetterSpacing(ch.charCodeAt(0))) {
                return false;
            }
        }
        return true;
    }

    function charAllowsLetterSpacing(ch) {
        if (unicodeBlockLookup['Arabic'](ch)) {
            return false;
        }
        if (unicodeBlockLookup['Arabic Supplement'](ch)) {
            return false;
        }
        if (unicodeBlockLookup['Arabic Extended-A'](ch)) {
            return false;
        }
        if (unicodeBlockLookup['Arabic Presentation Forms-A'](ch)) {
            return false;
        }
        if (unicodeBlockLookup['Arabic Presentation Forms-B'](ch)) {
            return false;
        }

        return true;
    }

    function charHasUprightVerticalOrientation(ch) {
        if (ch === 0x02EA /* modifier letter yin departing tone mark */ ||
            ch === 0x02EB /* modifier letter yang departing tone mark */) {
            return true;
        }

        // Return early for characters outside all ranges whose characters remain
        // upright in vertical writing mode.
        if (ch < 0x1100) {
            return false;
        }

        if (unicodeBlockLookup['Bopomofo Extended'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Bopomofo'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['CJK Compatibility Forms'](ch)) {
            if (!((ch >= 0xFE49 /* dashed overline */ && ch <= 0xFE4F) /* wavy low line */)) {
                return true;
            }
        }
        if (unicodeBlockLookup['CJK Compatibility Ideographs'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['CJK Compatibility'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['CJK Radicals Supplement'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['CJK Strokes'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['CJK Symbols and Punctuation'](ch)) {
            if (!((ch >= 0x3008 /* left angle bracket */ && ch <= 0x3011) /* right black lenticular bracket */) &&
                !((ch >= 0x3014 /* left tortoise shell bracket */ && ch <= 0x301F) /* low double prime quotation mark */) &&
                ch !== 0x3030 /* wavy dash */) {
                return true;
            }
        }
        if (unicodeBlockLookup['CJK Unified Ideographs Extension A'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['CJK Unified Ideographs'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Enclosed CJK Letters and Months'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Hangul Compatibility Jamo'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Hangul Jamo Extended-A'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Hangul Jamo Extended-B'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Hangul Jamo'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Hangul Syllables'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Hiragana'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Ideographic Description Characters'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Kanbun'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Kangxi Radicals'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Katakana Phonetic Extensions'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Katakana'](ch)) {
            if (ch !== 0x30FC /* katakana-hiragana prolonged sound mark */) {
                return true;
            }
        }
        if (unicodeBlockLookup['Halfwidth and Fullwidth Forms'](ch)) {
            if (ch !== 0xFF08 /* fullwidth left parenthesis */ &&
                ch !== 0xFF09 /* fullwidth right parenthesis */ &&
                ch !== 0xFF0D /* fullwidth hyphen-minus */ &&
                !((ch >= 0xFF1A /* fullwidth colon */ && ch <= 0xFF1E) /* fullwidth greater-than sign */) &&
                ch !== 0xFF3B /* fullwidth left square bracket */ &&
                ch !== 0xFF3D /* fullwidth right square bracket */ &&
                ch !== 0xFF3F /* fullwidth low line */ &&
                !(ch >= 0xFF5B /* fullwidth left curly bracket */ && ch <= 0xFFDF) &&
                ch !== 0xFFE3 /* fullwidth macron */ &&
                !(ch >= 0xFFE8 /* halfwidth forms light vertical */ && ch <= 0xFFEF)) {
                return true;
            }
        }
        if (unicodeBlockLookup['Small Form Variants'](ch)) {
            if (!((ch >= 0xFE58 /* small em dash */ && ch <= 0xFE5E) /* small right tortoise shell bracket */) &&
                !((ch >= 0xFE63 /* small hyphen-minus */ && ch <= 0xFE66) /* small equals sign */)) {
                return true;
            }
        }
        if (unicodeBlockLookup['Unified Canadian Aboriginal Syllabics'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Unified Canadian Aboriginal Syllabics Extended'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Vertical Forms'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Yijing Hexagram Symbols'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Yi Syllables'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Yi Radicals'](ch)) {
            return true;
        }

        return false;
    }



    exports.allowsLetterSpacing = allowsLetterSpacing;
    exports.charHasUprightVerticalOrientation = charHasUprightVerticalOrientation;

    function sort(ids, positions, left, right) {
        if (left >= right) {
            return;
        }

        var pivot = ids[(left + right) >> 1];
        var i = left - 1;
        var j = right + 1;

        while (true) {
            do {
                i++;
            } while (ids[i] < pivot);
            do {
                j--;
            } while (ids[j] > pivot);
            if (i >= j) {
                break;
            }
            swap(ids, i, j);
            swap(positions, 3 * i, 3 * j);
            swap(positions, 3 * i + 1, 3 * j + 1);
            swap(positions, 3 * i + 2, 3 * j + 2);
        }

        sort(ids, positions, left, j);
        sort(ids, positions, j + 1, right);
    }

    function swap(arr, i, j) {
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    exports.sort = sort;
    exports.swap = swap;

    function supportsPropertyExpression(spec) {
        return spec['property-type'] === 'data-driven' || spec['property-type'] === 'cross-faded-data-driven';
    }

    exports.supportsPropertyExpression = supportsPropertyExpression;

    function paintAttributeNames(property, type) {
        var attributeNameExceptions = {
            'text-opacity': ['opacity'],
            'icon-opacity': ['opacity'],
            'text-color': ['fill_color'],
            'icon-color': ['fill_color'],
            'text-halo-color': ['halo_color'],
            'icon-halo-color': ['halo_color'],
            'text-halo-blur': ['halo_blur'],
            'icon-halo-blur': ['halo_blur'],
            'text-halo-width': ['halo_width'],
            'icon-halo-width': ['halo_width'],
            'line-gap-width': ['gapwidth'],
            'line-pattern': ['pattern_to', 'pattern_from'],
            'fill-pattern': ['pattern_to', 'pattern_from'],
            'fill-extrusion-pattern': ['pattern_to', 'pattern_from']
        };

        return attributeNameExceptions[property] ||
            [property.replace((type + "-"), '').replace(/-/g, '_')];
    }

    exports.paintAttributeNames = paintAttributeNames;


    function quickselect(arr, k, left, right, compare) {
        quickselectStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
    }

    function quickselectStep(arr, k, left, right, compare) {

        while (right > left) {
            if (right - left > 600) {
                var n = right - left + 1;
                var m = k - left + 1;
                var z = Math.log(n);
                var s = 0.5 * Math.exp(2 * z / 3);
                var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
                var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
                var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
                quickselectStep(arr, k, newLeft, newRight, compare);
            }

            var t = arr[k];
            var i = left;
            var j = right;

            swap$1(arr, left, k);
            if (compare(arr[right], t) > 0) {
                swap$1(arr, left, right);
            }

            while (i < j) {
                swap$1(arr, i, j);
                i++;
                j--;
                while (compare(arr[i], t) < 0) {
                    i++;
                }
                while (compare(arr[j], t) > 0) {
                    j--;
                }
            }

            if (compare(arr[left], t) === 0) {
                swap$1(arr, left, j);
            } else {
                j++;
                swap$1(arr, j, right);
            }

            if (j <= k) {
                left = j + 1;
            }
            if (k <= j) {
                right = j - 1;
            }
        }
    }

    function swap$1(arr, i, j) {
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    function defaultCompare(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }














    function charHasNeutralVerticalOrientation(ch) {
        if (unicodeBlockLookup['Latin-1 Supplement'](ch)) {
            if (ch === 0x00A7 /* section sign */ ||
                ch === 0x00A9 /* copyright sign */ ||
                ch === 0x00AE /* registered sign */ ||
                ch === 0x00B1 /* plus-minus sign */ ||
                ch === 0x00BC /* vulgar fraction one quarter */ ||
                ch === 0x00BD /* vulgar fraction one half */ ||
                ch === 0x00BE /* vulgar fraction three quarters */ ||
                ch === 0x00D7 /* multiplication sign */ ||
                ch === 0x00F7 /* division sign */) {
                return true;
            }
        }
        if (unicodeBlockLookup['General Punctuation'](ch)) {
            if (ch === 0x2016 /* double vertical line */ ||
                ch === 0x2020 /* dagger */ ||
                ch === 0x2021 /* double dagger */ ||
                ch === 0x2030 /* per mille sign */ ||
                ch === 0x2031 /* per ten thousand sign */ ||
                ch === 0x203B /* reference mark */ ||
                ch === 0x203C /* double exclamation mark */ ||
                ch === 0x2042 /* asterism */ ||
                ch === 0x2047 /* double question mark */ ||
                ch === 0x2048 /* question exclamation mark */ ||
                ch === 0x2049 /* exclamation question mark */ ||
                ch === 0x2051 /* two asterisks aligned vertically */) {
                return true;
            }
        }
        if (unicodeBlockLookup['Letterlike Symbols'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Number Forms'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Miscellaneous Technical'](ch)) {
            if ((ch >= 0x2300 /* diameter sign */ && ch <= 0x2307 /* wavy line */) ||
                (ch >= 0x230C /* bottom right crop */ && ch <= 0x231F /* bottom right corner */) ||
                (ch >= 0x2324 /* up arrowhead between two horizontal bars */ && ch <= 0x2328 /* keyboard */) ||
                ch === 0x232B /* erase to the left */ ||
                (ch >= 0x237D /* shouldered open box */ && ch <= 0x239A /* clear screen symbol */) ||
                (ch >= 0x23BE /* dentistry symbol light vertical and top right */ && ch <= 0x23CD /* square foot */) ||
                ch === 0x23CF /* eject symbol */ ||
                (ch >= 0x23D1 /* metrical breve */ && ch <= 0x23DB /* fuse */) ||
                (ch >= 0x23E2 /* white trapezium */ && ch <= 0x23FF)) {
                return true;
            }
        }
        if (unicodeBlockLookup['Control Pictures'](ch) && ch !== 0x2423 /* open box */) {
            return true;
        }
        if (unicodeBlockLookup['Optical Character Recognition'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Enclosed Alphanumerics'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Geometric Shapes'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Miscellaneous Symbols'](ch)) {
            if (!((ch >= 0x261A /* black left pointing index */ && ch <= 0x261F) /* white down pointing index */)) {
                return true;
            }
        }
        if (unicodeBlockLookup['Miscellaneous Symbols and Arrows'](ch)) {
            if ((ch >= 0x2B12 /* square with top half black */ && ch <= 0x2B2F /* white vertical ellipse */) ||
                (ch >= 0x2B50 /* white medium star */ && ch <= 0x2B59 /* heavy circled saltire */) ||
                (ch >= 0x2BB8 /* upwards white arrow from bar with horizontal bar */ && ch <= 0x2BEB)) {
                return true;
            }
        }
        if (unicodeBlockLookup['CJK Symbols and Punctuation'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Katakana'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Private Use Area'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['CJK Compatibility Forms'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Small Form Variants'](ch)) {
            return true;
        }
        if (unicodeBlockLookup['Halfwidth and Fullwidth Forms'](ch)) {
            return true;
        }

        if (ch === 0x221E /* infinity */ ||
            ch === 0x2234 /* therefore */ ||
            ch === 0x2235 /* because */ ||
            (ch >= 0x2700 /* black safety scissors */ && ch <= 0x2767 /* rotated floral heart bullet */) ||
            (ch >= 0x2776 /* dingbat negative circled digit one */ && ch <= 0x2793 /* dingbat negative circled sans-serif number ten */) ||
            ch === 0xFFFC /* object replacement character */ ||
            ch === 0xFFFD /* replacement character */) {
            return true;
        }

        return false;
    }

    function charHasRotatedVerticalOrientation(ch) {
        return !(charHasUprightVerticalOrientation(ch) ||
            charHasNeutralVerticalOrientation(ch));
    }

    function getLabelPlaneMatrix(posMatrix, pitchWithMap, rotateWithMap, transform, pixelsToTileUnits) {
        var m = glMatrix.mat4.create();
        if (pitchWithMap) {
            glMatrix.mat4.scale(m, m, [1 / pixelsToTileUnits, 1 / pixelsToTileUnits, 1]);
            if (!rotateWithMap) {
                glMatrix.mat4.rotateZ(m, m, transform.angle);
            }
        } else {
            glMatrix.mat4.multiply(m, transform.labelPlaneMatrix, posMatrix);
        }
        return m;
    }

    exports.getLabelPlaneMatrix = getLabelPlaneMatrix;

    function getGlCoordMatrix(posMatrix, pitchWithMap, rotateWithMap, transform, pixelsToTileUnits) {
        if (pitchWithMap) {
            var m = glMatrix.mat4.clone(posMatrix);
            glMatrix.mat4.scale(m, m, [pixelsToTileUnits, pixelsToTileUnits, 1]);
            if (!rotateWithMap) {
                glMatrix.mat4.rotateZ(m, m, -transform.angle);
            }
            return m;
        } else {
            return transform.glCoordMatrix;
        }
    }

    exports.getGlCoordMatrix = getGlCoordMatrix;

    function translate$3(out, a, v) {
        var x = v[0],
            y = v[1],
            z = v[2];
        var a00, a01, a02, a03;
        var a10, a11, a12, a13;
        var a20, a21, a22, a23;

        if (a === out) {
            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        } else {
            a00 = a[0];
            a01 = a[1];
            a02 = a[2];
            a03 = a[3];
            a10 = a[4];
            a11 = a[5];
            a12 = a[6];
            a13 = a[7];
            a20 = a[8];
            a21 = a[9];
            a22 = a[10];
            a23 = a[11];
            out[0] = a00;
            out[1] = a01;
            out[2] = a02;
            out[3] = a03;
            out[4] = a10;
            out[5] = a11;
            out[6] = a12;
            out[7] = a13;
            out[8] = a20;
            out[9] = a21;
            out[10] = a22;
            out[11] = a23;
            out[12] = a00 * x + a10 * y + a20 * z + a[12];
            out[13] = a01 * x + a11 * y + a21 * z + a[13];
            out[14] = a02 * x + a12 * y + a22 * z + a[14];
            out[15] = a03 * x + a13 * y + a23 * z + a[15];
        }

        return out;
    }

    function translatePosMatrix(matrix, tile, translate, translateAnchor, inViewportPixelUnitsUnits, rotate, zoom) {
        if (!translate[0] && !translate[1]) {
            return matrix;
        }

        var angle = inViewportPixelUnitsUnits ?
            (translateAnchor === 'map' ? rotate : 0) :
            (translateAnchor === 'viewport' ? -rotate : 0);

        if (angle) {
            var sinA = Math.sin(angle);
            var cosA = Math.cos(angle);
            translate = [
                translate[0] * cosA - translate[1] * sinA,
                translate[0] * sinA + translate[1] * cosA
            ];
        }

        var translation = [
            inViewportPixelUnitsUnits ? translate[0] : pixelsToTileUnits(tile, translate[0], zoom),
            inViewportPixelUnitsUnits ? translate[1] : pixelsToTileUnits(tile, translate[1], zoom),
            0
        ];

        var translatedMatrix = new Float32Array(16);
        translate$3(translatedMatrix, matrix, translation);
        return translatedMatrix;
    }
    exports.translatePosMatrix = translatePosMatrix;

    function clamp(n, min, max) {
        return Math.min(max, Math.max(min, n));
    }

    function evaluateSizeForZoom(sizeData, zoom) {
        var uSizeT = 0;
        var uSize = 0;

        if (sizeData.kind === 'constant') {
            uSize = sizeData.layoutSize;

        } else if (sizeData.kind !== 'source') {
            var interpolationType = sizeData.interpolationType;
            var minZoom = sizeData.minZoom;
            var maxZoom = sizeData.maxZoom;

            // Even though we could get the exact value of the camera function
            // at z = tr.zoom, we intentionally do not: instead, we interpolate
            // between the camera function values at a pair of zoom stops covering
            // [tileZoom, tileZoom + 1] in order to be consistent with this
            // restriction on composite functions
            var t = !interpolationType ? 0 : clamp(
                Interpolate.interpolationFactor(interpolationType, zoom, minZoom, maxZoom), 0, 1);

            if (sizeData.kind === 'camera') {
                uSize = number(sizeData.minSize, sizeData.maxSize, t);
            } else {
                uSizeT = t;
            }
        }

        return {uSizeT: uSizeT, uSize: uSize};
    }

    exports.evaluateSizeForZoom = evaluateSizeForZoom;

    function xyTransformMat4(out, a, m) {
        var x = a[0], y = a[1];
        out[0] = m[0] * x + m[4] * y + m[12];
        out[1] = m[1] * x + m[5] * y + m[13];
        out[3] = m[3] * x + m[7] * y + m[15];
        return out;
    }

    exports.xyTransformMat4 = xyTransformMat4;

    var SIZE_PACK_FACTOR = 256;

    function number(a, b, t) {
        return (a * (1 - t)) + (b * t);
    }

    function evaluateSizeForFeature(sizeData,
                                    ref,
                                    ref$1) {
        var uSize = ref.uSize;
        var uSizeT = ref.uSizeT;
        var lowerSize = ref$1.lowerSize;
        var upperSize = ref$1.upperSize;

        if (sizeData.kind === 'source') {
            return lowerSize / SIZE_PACK_FACTOR;
        } else if (sizeData.kind === 'composite') {
            return number(lowerSize / SIZE_PACK_FACTOR, upperSize / SIZE_PACK_FACTOR, uSizeT);
        }
        return uSize;
    }

    exports.evaluateSizeForFeature = evaluateSizeForFeature;

    function transformMat4(out, a, m) {
        var x = a[0],
            y = a[1],
            z = a[2],
            w = a[3];
        out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
        out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
        out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
        out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
        return out;
    }

    exports.transformMat4 = transformMat4;

    var WritingMode = {
        horizontal: 1,
        vertical: 2,
        horizontalOnly: 3
    };

    function requiresOrientationChange(writingMode, firstPoint, lastPoint, aspectRatio) {
        if (writingMode === WritingMode.horizontal) {
            // On top of choosing whether to flip, choose whether to render this version of the glyphs or the alternate
            // vertical glyphs. We can't just filter out vertical glyphs in the horizontal range because the horizontal
            // and vertical versions can have slightly different projections which could lead to angles where both or
            // neither showed.
            var rise = Math.abs(lastPoint.y - firstPoint.y);
            var run = Math.abs(lastPoint.x - firstPoint.x) * aspectRatio;
            if (rise > run) {
                return {useVertical: true};
            }
        }

        if (writingMode === WritingMode.vertical ? firstPoint.y < lastPoint.y : firstPoint.x > lastPoint.x) {
            // Includes "horizontalOnly" case for labels without vertical glyphs
            return {needsFlipping: true};
        }

        return null;
    }

    function project(point, matrix) {
        var pos = [point.x, point.y, 0, 1];
        xyTransformMat4(pos, pos, matrix);
        var w = pos[3];
        return {
            point: new pointGeometry(pos[0] / w, pos[1] / w),
            signedDistanceFromCamera: w
        };
    }

    function placeGlyphAlongLine(offsetX,
                                 lineOffsetX,
                                 lineOffsetY,
                                 flip,
                                 anchorPoint,
                                 tileAnchorPoint,
                                 anchorSegment,
                                 lineStartIndex,
                                 lineEndIndex,
                                 lineVertexArray,
                                 labelPlaneMatrix,
                                 projectionCache,
                                 returnTileDistance) {

        var combinedOffsetX = flip ?
            offsetX - lineOffsetX :
            offsetX + lineOffsetX;

        var dir = combinedOffsetX > 0 ? 1 : -1;

        var angle = 0;
        if (flip) {
            // The label needs to be flipped to keep text upright.
            // Iterate in the reverse direction.
            dir *= -1;
            angle = Math.PI;
        }

        if (dir < 0) {
            angle += Math.PI;
        }

        var currentIndex = dir > 0 ?
            lineStartIndex + anchorSegment :
            lineStartIndex + anchorSegment + 1;

        var initialIndex = currentIndex;
        var current = anchorPoint;
        var prev = anchorPoint;
        var distanceToPrev = 0;
        var currentSegmentDistance = 0;
        var absOffsetX = Math.abs(combinedOffsetX);

        while (distanceToPrev + currentSegmentDistance <= absOffsetX) {
            currentIndex += dir;

            // offset does not fit on the projected line
            if (currentIndex < lineStartIndex || currentIndex >= lineEndIndex) {
                return null;
            }

            prev = current;

            current = projectionCache[currentIndex];
            if (current === undefined) {
                var currentVertex = new pointGeometry(lineVertexArray.getx(currentIndex), lineVertexArray.gety(currentIndex));
                var projection = project(currentVertex, labelPlaneMatrix);
                if (projection.signedDistanceFromCamera > 0) {
                    current = projectionCache[currentIndex] = projection.point;
                } else {
                    // The vertex is behind the plane of the camera, so we can't project it
                    // Instead, we'll create a vertex along the line that's far enough to include the glyph
                    var previousLineVertexIndex = currentIndex - dir;
                    var previousTilePoint = distanceToPrev === 0 ?
                        tileAnchorPoint :
                        new pointGeometry(lineVertexArray.getx(previousLineVertexIndex), lineVertexArray.gety(previousLineVertexIndex));
                    // Don't cache because the new vertex might not be far enough out for future glyphs on the same segment
                    current = projectTruncatedLineSegment(previousTilePoint, currentVertex, prev, absOffsetX - distanceToPrev + 1, labelPlaneMatrix);
                }
            }

            distanceToPrev += currentSegmentDistance;
            currentSegmentDistance = prev.dist(current);
        }

        // The point is on the current segment. Interpolate to find it.
        var segmentInterpolationT = (absOffsetX - distanceToPrev) / currentSegmentDistance;
        var prevToCurrent = current.sub(prev);
        var p = prevToCurrent.mult(segmentInterpolationT)._add(prev);

        // offset the point from the line to text-offset and icon-offset
        p._add(prevToCurrent._unit()._perp()._mult(lineOffsetY * dir));

        var segmentAngle = angle + Math.atan2(current.y - prev.y, current.x - prev.x);

        return {
            point: p,
            angle: segmentAngle,
            tileDistance: returnTileDistance ?
                {
                    prevTileDistance: (currentIndex - dir) === initialIndex ? 0 : lineVertexArray.gettileUnitDistanceFromAnchor(currentIndex - dir),
                    lastSegmentViewportDistance: absOffsetX - distanceToPrev
                } : null
        };
    }

    function projectTruncatedLineSegment(previousTilePoint, currentTilePoint, previousProjectedPoint, minimumLength, projectionMatrix) {
        // We are assuming "previousTilePoint" won't project to a point within one unit of the camera plane
        // If it did, that would mean our label extended all the way out from within the viewport to a (very distant)
        // point near the plane of the camera. We wouldn't be able to render the label anyway once it crossed the
        // plane of the camera.
        var projectedUnitVertex = project(previousTilePoint.add(previousTilePoint.sub(currentTilePoint)._unit()), projectionMatrix).point;
        var projectedUnitSegment = previousProjectedPoint.sub(projectedUnitVertex);

        return previousProjectedPoint.add(projectedUnitSegment._mult(minimumLength / projectedUnitSegment.mag()));
    }

    function addDynamicAttributes(dynamicLayoutVertexArray, p, angle) {
        dynamicLayoutVertexArray.emplaceBack(p.x, p.y, angle);
        dynamicLayoutVertexArray.emplaceBack(p.x, p.y, angle);
        dynamicLayoutVertexArray.emplaceBack(p.x, p.y, angle);
        dynamicLayoutVertexArray.emplaceBack(p.x, p.y, angle);
    }


    function placeFirstAndLastGlyph(fontScale, glyphOffsetArray, lineOffsetX, lineOffsetY, flip, anchorPoint, tileAnchorPoint, symbol, lineVertexArray, labelPlaneMatrix, projectionCache, returnTileDistance) {
        var glyphEndIndex = symbol.glyphStartIndex + symbol.numGlyphs;
        var lineStartIndex = symbol.lineStartIndex;
        var lineEndIndex = symbol.lineStartIndex + symbol.lineLength;

        var firstGlyphOffset = glyphOffsetArray.getoffsetX(symbol.glyphStartIndex);
        var lastGlyphOffset = glyphOffsetArray.getoffsetX(glyphEndIndex - 1);

        var firstPlacedGlyph = placeGlyphAlongLine(fontScale * firstGlyphOffset, lineOffsetX, lineOffsetY, flip, anchorPoint, tileAnchorPoint, symbol.segment,
            lineStartIndex, lineEndIndex, lineVertexArray, labelPlaneMatrix, projectionCache, returnTileDistance);
        if (!firstPlacedGlyph) {
            return null;
        }

        var lastPlacedGlyph = placeGlyphAlongLine(fontScale * lastGlyphOffset, lineOffsetX, lineOffsetY, flip, anchorPoint, tileAnchorPoint, symbol.segment,
            lineStartIndex, lineEndIndex, lineVertexArray, labelPlaneMatrix, projectionCache, returnTileDistance);
        if (!lastPlacedGlyph) {
            return null;
        }

        return {first: firstPlacedGlyph, last: lastPlacedGlyph};
    }

    function placeGlyphsAlongLine(symbol, fontSize, flip, keepUpright, posMatrix, labelPlaneMatrix, glCoordMatrix, glyphOffsetArray, lineVertexArray, dynamicLayoutVertexArray, anchorPoint, tileAnchorPoint, projectionCache, aspectRatio) {
        var fontScale = fontSize / 24;
        var lineOffsetX = symbol.lineOffsetX * fontScale;
        var lineOffsetY = symbol.lineOffsetY * fontScale;

        var placedGlyphs;
        if (symbol.numGlyphs > 1) {
            var glyphEndIndex = symbol.glyphStartIndex + symbol.numGlyphs;
            var lineStartIndex = symbol.lineStartIndex;
            var lineEndIndex = symbol.lineStartIndex + symbol.lineLength;

            // Place the first and the last glyph in the label first, so we can figure out
            // the overall orientation of the label and determine whether it needs to be flipped in keepUpright mode
            var firstAndLastGlyph = placeFirstAndLastGlyph(fontScale, glyphOffsetArray, lineOffsetX, lineOffsetY, flip, anchorPoint, tileAnchorPoint, symbol, lineVertexArray, labelPlaneMatrix, projectionCache, false);
            if (!firstAndLastGlyph) {
                return {notEnoughRoom: true};
            }
            var firstPoint = project(firstAndLastGlyph.first.point, glCoordMatrix).point;
            var lastPoint = project(firstAndLastGlyph.last.point, glCoordMatrix).point;

            if (keepUpright && !flip) {
                var orientationChange = requiresOrientationChange(symbol.writingMode, firstPoint, lastPoint, aspectRatio);
                if (orientationChange) {
                    return orientationChange;
                }
            }

            placedGlyphs = [firstAndLastGlyph.first];
            for (var glyphIndex = symbol.glyphStartIndex + 1; glyphIndex < glyphEndIndex - 1; glyphIndex++) {
                // Since first and last glyph fit on the line, we're sure that the rest of the glyphs can be placed
                // $FlowFixMe
                placedGlyphs.push(placeGlyphAlongLine(fontScale * glyphOffsetArray.getoffsetX(glyphIndex), lineOffsetX, lineOffsetY, flip, anchorPoint, tileAnchorPoint, symbol.segment,
                    lineStartIndex, lineEndIndex, lineVertexArray, labelPlaneMatrix, projectionCache, false));
            }
            placedGlyphs.push(firstAndLastGlyph.last);
        } else {
            // Only a single glyph to place
            // So, determine whether to flip based on projected angle of the line segment it's on
            if (keepUpright && !flip) {
                var a = project(tileAnchorPoint, posMatrix).point;
                var tileVertexIndex = (symbol.lineStartIndex + symbol.segment + 1);
                // $FlowFixMe
                var tileSegmentEnd = new pointGeometry(lineVertexArray.getx(tileVertexIndex), lineVertexArray.gety(tileVertexIndex));
                var projectedVertex = project(tileSegmentEnd, posMatrix);
                // We know the anchor will be in the viewport, but the end of the line segment may be
                // behind the plane of the camera, in which case we can use a point at any arbitrary (closer)
                // point on the segment.
                var b = (projectedVertex.signedDistanceFromCamera > 0) ?
                    projectedVertex.point :
                    projectTruncatedLineSegment(tileAnchorPoint, tileSegmentEnd, a, 1, posMatrix);


                var orientationChange$1 = requiresOrientationChange(symbol.writingMode, a, b, aspectRatio);
                if (orientationChange$1) {
                    return orientationChange$1;
                }
            }
            // $FlowFixMe
            var singleGlyph = placeGlyphAlongLine(fontScale * glyphOffsetArray.getoffsetX(symbol.glyphStartIndex), lineOffsetX, lineOffsetY, flip, anchorPoint, tileAnchorPoint, symbol.segment,
                symbol.lineStartIndex, symbol.lineStartIndex + symbol.lineLength, lineVertexArray, labelPlaneMatrix, projectionCache, false);
            if (!singleGlyph) {
                return {notEnoughRoom: true};
            }

            placedGlyphs = [singleGlyph];
        }

        for (var i = 0, list = placedGlyphs; i < list.length; i += 1) {
            var glyph = list[i];

            addDynamicAttributes(dynamicLayoutVertexArray, glyph.point, glyph.angle);
        }
        return {};
    }

    exports.placeGlyphsAlongLine = placeGlyphsAlongLine;
});