define("com/huayun/webgis/layers/support/style/styleUtils", [
    "exports",
    "../expression/Formatted",
    "../expression/Var",
    "../../../utils/utils",
    "../../../utils/Color",
    "../../../geometry/Point"
], function (exports, Formatted, Var, utils, Color, Point) {

    var valueMemberTypes = [
        {kind: 'null'},
        {kind: 'number'},
        {kind: 'string'},
        {kind: 'boolean'},
        {kind: 'color'},
        {kind: 'formatted'},
        {kind: 'object'},
        {
            kind: 'array',
            itemType: {kind: 'value'},
            N: undefined
        }
    ];

    /**
     * 是否插值
     * @private
     * @ignore
     * @param spec
     * @return {boolean|*}
     */
    function supportsInterpolation(spec) {
        return !!spec.expression && spec.expression.interpolated;
    }

    exports.supportsInterpolation = supportsInterpolation;

    /**
     * 查找stops中小于或等于input的下标
     * @private
     * @ignore
     * @param stops
     * @param input
     * @return {number}
     */
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

    /**
     * 指数插值
     * @private
     * @ignore
     * @param input
     * @param base
     * @param lowerValue
     * @param upperValue
     * @return {number}
     */
    function interpolationFactor(input, base, lowerValue, upperValue) {
        var difference = upperValue - lowerValue;
        var progress = input - lowerValue;
        if (difference === 0) {
            return 0;
        } else if (base === 1) {
            return progress / difference;
        } else {
            return (Math.pow(base, progress) - 1) / (Math.pow(base, difference) - 1);
        }
    }

    exports.interpolationFactor = interpolationFactor;

    /**
     * RGB颜色空间插值
     * @private
     * @ignore
     * @param from
     * @param to
     * @param t
     * @return {Color|exports}
     */
    function color(from, to, t) {
        return new Color(
            utils.number(from.r, to.r, t),
            utils.number(from.g, to.g, t),
            utils.number(from.b, to.b, t),
            utils.number(from.a, to.a, t)
        );
    }

    function array$1(from, to, t) {
        return from.map(function (d, i) {
            return utils.number(d, to[i], t);
        });
    }

    /**
     * 三种插值方式
     * @ignore
     * @private
     * @type {Readonly<{number: (function(*, *, *): number), color: (function(*, *, *=): Color|exports), array: (function(*, *, *=): *)}>}
     */
    exports.interpolate = Object.freeze({
        number: utils.number,
        color: color,
        array: array$1
    });

    function toString(type) {
        if (type.kind === 'array') {
            var itemType = toString(type.itemType);
            return typeof type.N === 'number' ?
                ("array<" + itemType + ", " + (type.N) + ">") :
                type.itemType.kind === 'value' ? 'array' : ("array<" + itemType + ">");
        } else {
            return type.kind;
        }
    }

    exports.toString = toString;

    /**
     * 如果t是expected的子类型, 则返回null, 否则返回一个错误信息
     * @private
     * @ignore
     * @param expected
     * @param t
     * @return {string|null}
     */
    function checkSubtype(expected, t) {
        if (t.kind === 'error') { // 错误是任何类型的子类型
            return null;
        } else if (expected.kind === 'array') {
            if (t.kind === 'array'
                && ((t.N === 0 && t.itemType.kind === 'value') || !checkSubtype(expected.itemType, t.itemType))
                && (typeof expected.N !== 'number' || expected.N === t.N)) {
                return null;
            }
        } else if (expected.kind === t.kind) {
            return null;
        } else if (expected.kind === 'value') {
            for (var i = 0, list = valueMemberTypes; i < list.length; i += 1) {
                var memberType = list[i];
                if (!checkSubtype(memberType, t)) {
                    return null;
                }
            }
        }
        return ("Expected " + (toString(expected)) + " but found " + (toString(t)) + " instead.");
    }

    exports.checkSubtype = checkSubtype;

    /**
     * 是否是支持的属性表达式
     * @private
     * @ignore
     * @param spec
     * @return {boolean}
     */
    function supportsPropertyExpression(spec) {
        return spec['property-type'] === 'data-driven' || spec['property-type'] === 'cross-faded-data-driven';
    }

    exports.supportsPropertyExpression = supportsPropertyExpression;

    /**
     * 是否支持层级表达式
     * @param spec
     * @return {boolean|boolean}
     */
    function supportsZoomExpression(spec) {
        return !!spec.expression && spec.expression.parameters.indexOf('zoom') > -1;
    }

    exports.supportsZoomExpression = supportsZoomExpression;

    /**
     * 计算偏移后的geometry
     * @private
     * @ignore
     * @param queryGeometry
     * @param translate
     * @param translateAnchor
     * @param bearing
     * @param pixelsToTileUnits
     * @return {[]|*}
     */
    function translate(queryGeometry, translate, translateAnchor, bearing, pixelsToTileUnits) {
        if (!translate[0] && !translate[1]) {
            return queryGeometry;
        }
        var pt = Point.convert(translate)._mult(pixelsToTileUnits);

        if (translateAnchor === "viewport") {
            pt._rotate(-bearing);
        }

        var translated = [];
        for (var i = 0; i < queryGeometry.length; i++) {
            var point = queryGeometry[i];
            translated.push(point.sub(pt));
        }
        return translated;
    }

    exports.translate = translate;

    /**
     * 获取paint配置中, 某个属性的最大可取值
     * @private
     * @ignore
     * @param property
     * @param layer
     * @param bucket
     * @return {number|*}
     */
    function getMaximumPaintValue(property, layer, bucket) {
        var value = layer.paint.get(property).value;
        if (value.kind === 'constant') {
            return value.value;
        } else {
            var binders = bucket.programConfigurations.get(layer.id).binders;
            return binders[property].maxValue;
        }
    }

    exports.getMaximumPaintValue = getMaximumPaintValue;

    /**
     * 转换成内部类型
     * @private
     * @ignore
     * @param value
     * @return {{itemType: ({kind: string}|{kind: string}|{kind: string}|{kind: string}|{kind: string}|{kind: string}), kind: string, N: *}|{kind: string}}
     */
    function typeOf(value) {
        if (value === null) {
            return {kind: 'null'};
        } else if (typeof value === 'string') {
            return {kind: 'string'};
        } else if (typeof value === 'boolean') {
            return {kind: 'boolean'};
        } else if (typeof value === 'number') {
            return {kind: 'number'};
        } else if (Array.isArray(value)) {
            var length = value.length;
            var itemType;
            for (var i = 0, list = value; i < list.length; i += 1) {
                var item = list[i];
                var t = typeOf(item);
                if (!itemType) {
                    itemType = t;
                } else if (itemType === t) {
                    continue;
                } else {
                    itemType = {kind: 'value'};
                    break;
                }
            }
            return {
                kind: 'array',
                itemType: itemType || {kind: 'value'},
                N: length,
            };
        } else {
            return {kind: 'object'};
        }
    }

    exports.typeOf = typeOf;

    /**
     * 是否是value
     * @private
     * @ignore
     * @param mixed
     * @return {boolean}
     */
    function isValue(mixed) {
        if (mixed === null) {
            return true;
        } else if (typeof mixed === 'string') {
            return true;
        } else if (typeof mixed === 'boolean') {
            return true;
        } else if (typeof mixed === 'number') {
            return true;
        } else if (Array.isArray(mixed)) {
            for (var i = 0, list = mixed; i < list.length; i += 1) {
                var item = list[i];
                if (!isValue(item)) {
                    return false;
                }
            }
            return true;
        } else if (typeof mixed === 'object') {
            for (var key in mixed) {
                if (!isValue(mixed[key])) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }

    exports.isValue = isValue;

    exports.toString$1 = function (value) {
        var type = typeof value;
        if (value === null) {
            return '';
        } else if (type === 'string' || type === 'number' || type === 'boolean') {
            return String(value);
        } else if (value instanceof Color || value instanceof Formatted) {
            return value.toString();
        } else {
            return JSON.stringify(value);
        }
    };



    function array(itemType, N) {
        return {
            kind: 'array',
            itemType: itemType,
            N: N
        };
    }

    exports.array = array;


    function success(value) {
        return {result: 'success', value: value};
    }

    function error(value) {
        return {result: 'error', value: value};
    }

    exports.success = success;
    exports.error = error;

    exports.emitValidationErrors = function (emitter, errors) {
        var hasErrors = false;
        if (errors && errors.length) {
            for (var i = 0, list = errors; i < list.length; i += 1) {
                var error = list[i];
                hasErrors = true;
            }
        }
        return hasErrors;
    };

    exports.translateDistance = function (translate) {
        return Math.sqrt(translate[0] * translate[0] + translate[1] * translate[1]);
    };


});