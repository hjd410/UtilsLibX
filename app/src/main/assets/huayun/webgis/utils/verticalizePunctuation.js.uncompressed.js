define("com/huayun/webgis/utils/verticalizePunctuation", [
    "./scriptDetection"
], function (scriptDetection) {
    var verticalizedCharacterMap = {
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

    function verticalizePunctuation(input) {
        var output = '';
        for (var i = 0; i < input.length; i++) {
            var nextCharCode = input.charCodeAt(i + 1) || null;
            var prevCharCode = input.charCodeAt(i - 1) || null;

            var canReplacePunctuation = (!nextCharCode || !scriptDetection.charHasRotatedVerticalOrientation(nextCharCode) || verticalizedCharacterMap[input[i + 1]]) &&
                (!prevCharCode || !scriptDetection.charHasRotatedVerticalOrientation(prevCharCode) || verticalizedCharacterMap[input[i - 1]]);

            if (canReplacePunctuation && verticalizedCharacterMap[input[i]]) {
                output += verticalizedCharacterMap[input[i]];
            } else {
                output += input[i];
            }
        }
        return output;
    }

    return verticalizePunctuation;
})