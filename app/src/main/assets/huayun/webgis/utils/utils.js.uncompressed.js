define("com/huayun/webgis/utils/utils", [
    "exports",
    "custom/gl-matrix-min",
    "./Constant",
    "./Color",
    "../layers/support/expression/Formatted",
    "../data/ArrayType",
    "../layers/support/UnitBezier",
    "../geometry/Point"
], function (exports, glMatrix, Constant, Color, Formatted, ArrayType, UnitBezier, pointGeometry) {

    var EXTENT = Constant.layout.EXTENT;

    /**
     * 当前时间
     * @private
     * @ignore
     * @type {any}
     */
    exports.now = self.performance && self.performance.now ? self.performance.now.bind(self.performance) : Date.now.bind(Date);

    /**
     * 浅拷贝
     * @private
     * @ignore
     * @param dest
     * @return {*}
     */
    exports.extend = Object.assign ? Object.assign : function (dest) {
        var sources = [], len = arguments.length - 1;
        while (len-- > 0) sources[len] = arguments[len + 1];
        for (var i = 0, list = sources; i < list.length; i += 1) {
            var src = list[i];
            for (var k in src) {
                dest[k] = src[k];
            }
        }
        return dest;
    };

    /**
     * 是否是函数
     * @private
     * @ignore
     * @param value
     * @return {boolean}
     */
    exports.isFunction = function (value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    };

    /**
     * 克隆
     * @ignore
     * @private
     * @param input
     * @return {*}
     */
    function clone(input) {
        if (Array.isArray(input)) {
            return input.map(clone);
        } else if (typeof input === 'object' && input) {
            return ((mapObject(input, clone)));
        } else {
            return input;
        }
    }

    exports.clone = clone;

    /**
     * @ignore
     * @private
     * 调用异步函数后的回调, 所有调用结果完成后调用callback
     * @param array 输入到异步函数的调用组成的数组
     * @param fn 异步函数, 函数签名是(data, callback)
     * @param callback 所有异步工作完成后执行的回调
     * @return {*}
     */
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
                results[i] = result;
                if (--remaining === 0) {
                    callback(error, results);
                }
            });
        });
    };

    /**
     * 对象的键值对的值组成的数组
     * @private
     * @ignore
     * @param {Object} obj 对象
     * @return {[]}
     */
    exports.values = function (obj) {
        var result = [];
        for (var k in obj) {
            result.push(obj[k]);
        }
        return result;
    }

    /**
     * 三个点是否是逆时针方向
     * @private
     * @ignore
     * @param a
     * @param b
     * @param c
     * @return {boolean}
     */
    exports.isCounterClockwise = function isCounterClockwise(a, b, c) {
        return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
    };

    /**
     * 插值
     * @private
     * @ignore
     * @param a
     * @param b
     * @param t
     * @return {number}
     */
    exports.number = function (a, b, t) {
        return (a * (1 - t)) + (b * t);
    };

    /**
     * 获取变量类型
     * @private
     * @ignore
     * @param val
     * @return {string|"undefined"|"object"|"boolean"|"number"|"string"|"function"|"symbol"|"bigint"}
     */
    exports.getType = function (val) {
        if (val instanceof Number) {
            return 'number';
        } else if (val instanceof String) {
            return 'string';
        } else if (val instanceof Boolean) {
            return 'boolean';
        } else if (Array.isArray(val)) {
            return 'array';
        } else if (val === null) {
            return 'null';
        } else {
            return typeof val;
        }
    };

    /**
     * 获取参数中第一个非undefined值
     * @private
     * @ignore
     * @return {*}
     */
    exports.coalesce = function () {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] !== undefined) {
                return arguments[i];
            }
        }
    };

    /**
     * @private
     * @param t
     * @return {number}
     */
    function easeCubicInOut(t) {
        if (t <= 0) {
            return 0;
        }
        if (t >= 1) {
            return 1;
        }
        var t2 = t * t,
            t3 = t2 * t;
        return 4 * (t < 0.5 ? t3 : 3 * (t - t2) + t3 - 0.75);
    }

    exports.easeCubicInOut = easeCubicInOut;

    /**
     * 判断字符串是否以指定后缀结尾
     * @private
     * @ignore
     * @param string
     * @param suffix
     * @return {boolean}
     */
    exports.endsWith = function (string, suffix) {
        return string.indexOf(suffix, string.length - suffix.length) !== -1;
    };

    /**
     * 验证rgba值
     * @private
     * @ignore
     * @param r
     * @param g
     * @param b
     * @param a
     * @return {*}
     */
    function validateRGBA(r, g, b, a) {
        if (!(
            typeof r === 'number' && r >= 0 && r <= 255 &&
            typeof g === 'number' && g >= 0 && g <= 255 &&
            typeof b === 'number' && b >= 0 && b <= 255
        )) {
            var value = typeof a === 'number' ? [r, g, b, a] : [r, g, b];
            return ("Invalid rgba value [" + (value.join(', ')) + "]: 'r', 'g', and 'b' must be between 0 and 255.");
        }
        if (!(typeof a === 'undefined' || (typeof a === 'number' && a >= 0 && a <= 1))) {
            return ("Invalid rgba value [" + ([r, g, b, a].join(', ')) + "]: 'a' must be between 0 and 1.");
        }
        return null;
    }

    exports.validateRGBA = validateRGBA;

    function bezier(p1x, p1y, p2x, p2y) {
        var bezier = new UnitBezier(p1x, p1y, p2x, p2y);
        return function (t) {
            return bezier.solve(t);
        };
    }
    exports.bezier = bezier;

    //---------------------------------------------

    exports.topDownFeatureComparator = function (a, b) {
        return b - a;
    }

    /**
     * 加载矢量切片图形的坐标
     * @param feature 矢量切片图形
     * @return {[]}
     */
    exports.loadGeometry = function (feature) {
        var scale = EXTENT / feature.extent;
        var geometry = feature.loadGeometry();
        for (var r = 0; r < geometry.length; r++) {
            var ring = geometry[r];
            for (var p = 0; p < ring.length; p++) {
                var point = ring[p];
                // 四舍五入是因为使用整数表示点
                point.x = Math.round(point.x * scale);
                point.y = Math.round(point.y * scale);
            }
        }
        return geometry;
    };

    /**
     * 判断两个数组是否有相同元素
     * @param {Array} a 数组
     * @param {Array} b 数组
     * @return {Boolean} 有没有相同元素
     */
    exports.arraysIntersect = function (a, b) {
        for (var i = 0; i < a.length; i++) {
            if (b.indexOf(a[i]) >= 0) return true;
        }
        return false;
    }

    /**
     * 映射对象
     * @private
     * @param input 待映射对象
     * @param iterator 键值对处理函数
     * @param context
     * @return {{}}
     */
    function mapObject(input, iterator, context) {
        var output = {};
        for (var key in input) {
            output[key] = iterator.call(context || this, input[key], key, input);
        }
        return output;
    }

    exports.mapObject = mapObject;


    /**
     * @private
     * @param ring
     * @return {number}
     */

    exports.calculateSignedArea = function (ring) {
        var sum = 0;
        for (var i = 0, len = ring.length, j = len - 1, p1 = (void 0), p2 = (void 0); i < len; j = i++) {
            p1 = ring[i];
            p2 = ring[j];
            sum += (p2.x - p1.x) * (p1.y + p2.y);
        }
        return sum;
    }

    exports.keysDifference = function (obj, other) {
        var difference = [];
        for (var i in obj) {
            if (!(i in other)) {
                difference.push(i);
            }
        }
        return difference;
    }


    function projectQueryGeometry(queryGeometry, pixelPosMatrix) {
        return queryGeometry.map(function (p) {
            return projectPoint(p, pixelPosMatrix);
        });
    }

    function projectPoint(p, pixelPosMatrix) {
        var point = glMatrix.vec4.transformMat4([], [p.x, p.y, 0, 1], pixelPosMatrix);
        return new pointGeometry(point[0] / point[3], point[1] / point[3]);
    }

    exports.projectPoint = projectPoint;

    exports.projectQueryGeometry = projectQueryGeometry;



    exports.bindAll = function (fns, context) {
        fns.forEach(function (fn) {
            if (!context[fn]) {
                return;
            }
            context[fn] = context[fn].bind(context);
        });
    };

    exports.getPixelPosMatrix = function (transform, tileID) {
        var t = glMatrix.mat4.identity([]);
        glMatrix.mat4.translate(t, t, [1, 1, 0]);
        glMatrix.mat4.scale(t, t, [transform.width * 0.5, transform.height * 0.5, 1]);
        return glMatrix.mat4.multiply(t, t, transform.calculatePosMatrix(tileID.toUnwrapped()));
    };

    function pointIntersectsBufferedLine(p, line, radius) {
        var radiusSquared = radius * radius;
        if (line.length === 1) {
            return p.distSqr(line[0]) < radiusSquared;
        }
        for (var i = 1; i < line.length; i++) {
            var v = line[i - 1], w = line[i];
            if (distToSegmentSquared(p, v, w) < radiusSquared) {
                return true;
            }
        }
        return false;
    }

    function distToSegmentSquared(p, v, w) {
        var l2 = v.distSqr(w);
        if (l2 === 0) {
            return p.distSqr(v);
        }
        var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        if (t < 0) {
            return p.distSqr(v);
        }
        if (t > 1) {
            return p.distSqr(w);
        }
        return p.distSqr(w.sub(v)._mult(t)._add(v));
    }

    function polygonContainsPoint(ring, p) {
        var c = false;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            var p1 = ring[i];
            var p2 = ring[j];
            if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
                c = !c;
            }
        }
        return c;
    }

    function polygonIntersectsBufferedPoint(polygon, point, radius) {
        if (polygonContainsPoint(polygon, point)) {
            return true;
        }
        if (pointIntersectsBufferedLine(point, polygon, radius)) {
            return true;
        }
        return false;
    }

    exports.polygonIntersectsBufferedPoint = polygonIntersectsBufferedPoint;
    exports.polygonContainsPoint = polygonContainsPoint;


    function sortTilesIn(a, b) {
        var idA = a.tileID;
        var idB = b.tileID;
        return (idA.overscaledZ - idB.overscaledZ) || (idA.canonical.y - idB.canonical.y) || (idA.wrap - idB.wrap) || (idA.canonical.x - idB.canonical.x);
    }


    exports.sortTilesIn = sortTilesIn;

    exports.ease = bezier(0.25, 0.1, 0.25, 1);


    exports.isEntirelyOutside = function (ring) {
        return ring.every(function (p) {
                return p.x < 0;
            }) ||
            ring.every(function (p) {
                return p.x > EXTENT;
            }) ||
            ring.every(function (p) {
                return p.y < 0;
            }) ||
            ring.every(function (p) {
                return p.y > EXTENT;
            });
    };

    exports.isBoundaryEdge = function (p1, p2) {
        return (p1.x === p2.x && (p1.x < 0 || p1.x > EXTENT)) ||
            (p1.y === p2.y && (p1.y < 0 || p1.y > EXTENT));
    };

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

    exports.align = function (offset, size) {
        return Math.ceil(offset / size) * size;
    };

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

    function deepEqual(a, b) {
        if (Array.isArray(a)) {
            if (!Array.isArray(b) || a.length !== b.length) {
                return false;
            }
            for (var i = 0; i < a.length; i++) {
                if (!deepEqual(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }
        if (typeof a === 'object' && a !== null && b !== null) {
            if (!(typeof b === 'object')) {
                return false;
            }
            var keys = Object.keys(a);
            if (keys.length !== Object.keys(b).length) {
                return false;
            }
            for (var key in a) {
                if (!deepEqual(a[key], b[key])) {
                    return false;
                }
            }
            return true;
        }
        return a === b;
    }

    exports.deepEqual = deepEqual;


    function supportsPropertyExpression(spec) {
        return spec['property-type'] === 'data-driven' || spec['property-type'] === 'cross-faded-data-driven';
    }

    exports.supportsPropertyExpression = supportsPropertyExpression;

    function supportsZoomExpression(spec) {
        return !!spec.expression && spec.expression.parameters.indexOf('zoom') > -1;
    }

    exports.supportsZoomExpression = supportsZoomExpression;

    function supportsInterpolation(spec) {
        return !!spec.expression && spec.expression.interpolated;
    }

    exports.supportsInterpolation = supportsInterpolation;


    function findStopLessThanOrEqualTo(stops, input) {
        var lastIndex = stops.length - 1;
        var lowerIndex = 0;
        var upperIndex = lastIndex;
        var currentIndex = 0;
        var currentValue, nextValue;

        while (lowerIndex <= upperIndex) {
            currentIndex = Math.floor((lowerIndex + upperIndex) / 2);
            currentValue = stops[currentIndex];
            nextValue = stops[currentIndex + 1];

            if (currentValue <= input) {
                if (currentIndex === lastIndex || input < nextValue) { // Search complete
                    return currentIndex;
                }

                lowerIndex = currentIndex + 1;
            } else if (currentValue > input) {
                upperIndex = currentIndex - 1;
            } else {
                throw new Error('Input is not a number.');
            }
        }

        return 0;
    }

    exports.findStopLessThanOrEqualTo = findStopLessThanOrEqualTo;


    exports.pixelsToTileUnits = function (tile, pixelValue, z) {
        return pixelValue * (Constant.layout.EXTENT / (tile.tileSize * Math.pow(2, z - tile.tileID.overscaledZ)));
    };

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
        return attributeNameExceptions[property] || [property.replace((type + "-"), '').replace(/-/g, '_')];
    }

    exports.paintAttributeNames = paintAttributeNames;

    function getLayoutException(property) {
        var propertyExceptions = {
            'line-pattern': {
                'source': ArrayType.StructArrayLayout8ui16,
                'composite': ArrayType.StructArrayLayout8ui16
            },
            'fill-pattern': {
                'source': ArrayType.StructArrayLayout8ui16,
                'composite': ArrayType.StructArrayLayout8ui16
            },
            'fill-extrusion-pattern': {
                'source': ArrayType.StructArrayLayout8ui16,
                'composite': ArrayType.StructArrayLayout8ui16
            }
        };

        return propertyExceptions[property];
    }

    exports.getLayoutException = getLayoutException;

    function layoutType(property, type, binderType) {
        var defaultLayouts = {
            'color': {
                'source': ArrayType.StructArrayLayout2f8,
                'composite': ArrayType.StructArrayLayout4f16
            },
            'number': {
                'source': ArrayType.StructArrayLayout1f4,
                'composite': ArrayType.StructArrayLayout2f8
            }
        };

        var layoutException = getLayoutException(property);
        return layoutException && layoutException[binderType] ||
            defaultLayouts[type][binderType];
    }

    exports.layoutType = layoutType;

    function clamp(n, min, max) {
        return Math.min(max, Math.max(min, n));
    }

    exports.clamp = clamp;

    function packUint8ToFloat(a, b) {
        // coerce a and b to 8-bit ints
        a = clamp(Math.floor(a), 0, 255);
        b = clamp(Math.floor(b), 0, 255);
        return 256 * a + b;
    }

    exports.packUint8ToFloat = packUint8ToFloat;

    function packColor(color) {
        return [
            packUint8ToFloat(255 * color.r, 255 * color.g),
            packUint8ToFloat(255 * color.b, 255 * color.a)
        ];
    }

    exports.packColor = packColor;


    function charHasUprightVerticalOrientation(ch) {
        if (ch === 0x02EA || ch === 0x02EB) {
            return true;
        }
        if (ch < 0x1100) {
            return false;
        }

        if (Constant.unicodeBlockLookup['Bopomofo Extended'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Bopomofo'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['CJK Compatibility Forms'](ch)) {
            if (!((ch >= 0xFE49 /* dashed overline */ && ch <= 0xFE4F) /* wavy low line */)) {
                return true;
            }
        }
        if (Constant.unicodeBlockLookup['CJK Compatibility Ideographs'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['CJK Compatibility'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['CJK Radicals Supplement'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['CJK Strokes'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['CJK Symbols and Punctuation'](ch)) {
            if (!((ch >= 0x3008 /* left angle bracket */ && ch <= 0x3011) /* right black lenticular bracket */) &&
                !((ch >= 0x3014 /* left tortoise shell bracket */ && ch <= 0x301F) /* low double prime quotation mark */) &&
                ch !== 0x3030 /* wavy dash */) {
                return true;
            }
        }
        if (Constant.unicodeBlockLookup['CJK Unified Ideographs Extension A'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['CJK Unified Ideographs'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Enclosed CJK Letters and Months'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Hangul Compatibility Jamo'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Hangul Jamo Extended-A'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Hangul Jamo Extended-B'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Hangul Jamo'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Hangul Syllables'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Hiragana'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Ideographic Description Characters'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Kanbun'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Kangxi Radicals'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Katakana Phonetic Extensions'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Katakana'](ch)) {
            if (ch !== 0x30FC /* katakana-hiragana prolonged sound mark */) {
                return true;
            }
        }
        if (Constant.unicodeBlockLookup['Halfwidth and Fullwidth Forms'](ch)) {
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
        if (Constant.unicodeBlockLookup['Small Form Variants'](ch)) {
            if (!((ch >= 0xFE58 /* small em dash */ && ch <= 0xFE5E) /* small right tortoise shell bracket */) &&
                !((ch >= 0xFE63 /* small hyphen-minus */ && ch <= 0xFE66) /* small equals sign */)) {
                return true;
            }
        }
        if (Constant.unicodeBlockLookup['Unified Canadian Aboriginal Syllabics'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Unified Canadian Aboriginal Syllabics Extended'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Vertical Forms'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Yijing Hexagram Symbols'](ch)) {
            return true;
        }
        if (Constant.unicodeBlockLookup['Yi Syllables'](ch)) {
            return true;
        }
        return !!Constant.unicodeBlockLookup['Yi Radicals'](ch);
    }

    exports.charHasUprightVerticalOrientation = charHasUprightVerticalOrientation;

    function allowsVerticalWritingMode(chars) {
        for (var i = 0, list = chars; i < list.length; i += 1) {
            var ch = list[i];

            if (charHasUprightVerticalOrientation(ch.charCodeAt(0))) {
                return true;
            }
        }
        return false;
    }

    exports.allowsVerticalWritingMode = allowsVerticalWritingMode;


    function compareKeyZoom(a, b) {
        return ((a % 32) - (b % 32)) || (b - a);
    }

    exports.compareKeyZoom = compareKeyZoom;
});