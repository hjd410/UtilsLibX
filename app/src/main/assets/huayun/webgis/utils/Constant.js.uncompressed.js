define("com/huayun/webgis/utils/Constant", [
  "exports"
], function (exports) {

  exports.ONE_EM = 24;
  exports.MAX_GLYPHS = 65535;


  // webgl常量
  exports.glConstant = {
    ALWAYS: 0x0207,
    LEQUAL: 515,
    BACK: 0x0405,
    CCW: 0x0901,
    ZERO: 0x0000,
    ONE: 0x0001,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    SRC_ALPHA: 770,
    KEEP: 0x1E00
  };

  exports.viewTypes = {
    'Int8': Int8Array,
    'Uint8': Uint8Array,
    'Int16': Int16Array,
    'Uint16': Uint16Array,
    'Int32': Int32Array,
    'Uint32': Uint32Array,
    'Float32': Float32Array
  };
  exports.AttributeType = {
    Int8: 'BYTE',
    Uint8: 'UNSIGNED_BYTE',
    Int16: 'SHORT',
    Uint16: 'UNSIGNED_SHORT',
    Int32: 'INT',
    Uint32: 'UNSIGNED_INT',
    Float32: 'FLOAT'
  };

  exports.types = {
    string: {kind: 'string'},
    number: {kind: 'number'},
    boolean: {kind: 'boolean'},
    object: {kind: 'object'}
  };

  exports.geometryTypes = ['Unknown', 'Point', 'LineString', 'Polygon'];

  exports.layout = {
    EXTENT: 8192,
    border: 3,
    EXTRUDE_SCALE: 63,
    LINE_DISTANCE_BUFFER_BITS: 15,
    LINE_DISTANCE_SCALE: 1 / 2,
    MAX_LINE_DISTANCE: Math.pow(2, 14) / 0.5,
    SHARP_CORNER_OFFSET: 15,
    COS_HALF_SHARP_CORNER: Math.cos(75 / 2 * (Math.PI / 180)),
    EARCUT_MAX_RINGS: 500,
    padding: 1
  };

  exports.collisionBoxLayout = [
    {name: 'a_pos', components: 2, type: 'Int16', offset: 0},
    {name: 'a_anchor_pos', components: 2, type: 'Int16', offset: 4},
    {name: 'a_extrude', components: 2, type: 'Int16', offset: 8}
  ];

  exports.collisionCircleLayout = [
    {name: 'a_pos', components: 2, type: 'Int16', offset: 0},
    {name: 'a_anchor_pos', components: 2, type: 'Int16', offset: 4},
    {name: 'a_extrude', components: 2, type: 'Int16', offset: 8}
  ];

  var whitespace = {};
  whitespace[0x09] = true;
  whitespace[0x0a] = true;
  whitespace[0x0b] = true;
  whitespace[0x0c] = true;
  whitespace[0x0d] = true;
  whitespace[0x20] = true;
  exports.whitespace = whitespace;

  exports.verticalizedCharacterMap = {
    '!': '︕',
    '#': '＃',
    '$': '＄',
    '%': '％',
    '&': '＆',
    '(': '︵',
    ')': '︶',
    '*': '＊',
    '+': '＋',
    ',': '︐',
    '-': '︲',
    '.': '・',
    '/': '／',
    ':': '︓',
    ';': '︔',
    '<': '︿',
    '=': '＝',
    '>': '﹀',
    '?': '︖',
    '@': '＠',
    '[': '﹇',
    '\\': '＼',
    ']': '﹈',
    '^': '＾',
    '_': '︳',
    '`': '｀',
    '{': '︷',
    '|': '―',
    '}': '︸',
    '~': '～',
    '¢': '￠',
    '£': '￡',
    '¥': '￥',
    '¦': '￤',
    '¬': '￢',
    '¯': '￣',
    '–': '︲',
    '—': '︱',
    '‘': '﹃',
    '’': '﹄',
    '“': '﹁',
    '”': '﹂',
    '…': '︙',
    '‧': '・',
    '₩': '￦',
    '、': '︑',
    '。': '︒',
    '〈': '︿',
    '〉': '﹀',
    '《': '︽',
    '》': '︾',
    '「': '﹁',
    '」': '﹂',
    '『': '﹃',
    '』': '﹄',
    '【': '︻',
    '】': '︼',
    '〔': '︹',
    '〕': '︺',
    '〖': '︗',
    '〗': '︘',
    '！': '︕',
    '（': '︵',
    '）': '︶',
    '，': '︐',
    '－': '︲',
    '．': '・',
    '：': '︓',
    '；': '︔',
    '＜': '︿',
    '＞': '﹀',
    '？': '︖',
    '［': '﹇',
    '］': '﹈',
    '＿': '︳',
    '｛': '︷',
    '｜': '―',
    '｝': '︸',
    '｟': '︵',
    '｠': '︶',
    '｡': '︒',
    '｢': '﹁',
    '｣': '﹂'
  };

  exports.unicodeBlockLookup = {
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
});