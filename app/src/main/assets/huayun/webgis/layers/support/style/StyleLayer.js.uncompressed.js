/**
 * 矢量切片样式图层基类
 * layout属性和paint属性定义如何呈现空间数据.
 * layout属性定义渲染位置和可见性, 在渲染过程的早期使用, 包括可见性, line-cap和symbol-placement
 * paint属性定义更精细的渲染样式, 渲染过程的后期使用, 包括fill-color, background-pattern, line-opacity
 */
define("com/huayun/webgis/layers/support/style/StyleLayer", [
    "./Layout",
    "./Transitionable",
    "./PossiblyEvaluatedPropertyValue",
    "./styleUtils",
    "../../../utils/utils"
], function (Layout, Transitionable, PossiblyEvaluatedPropertyValue, styleUtils, utils) {
    var TRANSITION_SUFFIX = '-transition';

    function filterObject(input, iterator, context) {
        var output = {};
        for (var key in input) {
            if (iterator.call(context || this, input[key], key, input)) {
                output[key] = input[key];
            }
        }
        return output;
    }

    /**
     * 矢量切片样式图层基类
     * @private
     * @ignore
     * @param layer 样式文件中某一图层的配置
     * @param properties 该图层的默认属性配置
     * @constructor
     * @property {string} id 图层id
     * @property {string} type 图层类型, 可取值为: fill, line, symbol, fill-extrusion, custom
     * @property {Object} metadata 图层额外数据
     * @property {number} minzoom 图层最小显示层级
     * @property {number} maxzoom 图层最大显示层级
     * @property {string} source 图层来源
     * @property {string} sourceLayer 图层数据来源
     * @property {object} filter 图层过滤条件
     */
    var StyleLayer = function (layer, properties) {
        this.id = layer.id;
        this.type = layer.type;
        this._featureFilter = function () {
            return true;
        };
        if (layer.type === 'custom') {
            return;
        }

        this.metadata = layer.metadata;
        this.minzoom = layer.minzoom;
        this.maxzoom = layer.maxzoom;
        this.source = layer.source;

        if (layer.type !== 'background') {
            this.sourceLayer = layer['source-layer'];
            this.filter = layer.filter;
        }

        // 解析layout属性
        if (properties.layout) {
            this._unevaluatedLayout = new Layout(properties.layout);
        }

        // 解析paint属性
        if (properties.paint) {
            this._transitionablePaint = new Transitionable(properties.paint);
            for (var property in layer.paint) {
                this.setPaintProperty(property, layer.paint[property], {validate: false});
            }
            for (var property$1 in layer.layout) {
                this.setLayoutProperty(property$1, layer.layout[property$1], {validate: false});
            }

            this._transitioningPaint = this._transitionablePaint.untransitioned();
        }
    };

    StyleLayer.prototype.getPaintProperty = function (name) {
        if (utils.endsWith(name, TRANSITION_SUFFIX)) {
            return this._transitionablePaint.getTransition(name.slice(0, -TRANSITION_SUFFIX.length));
        } else {
            return this._transitionablePaint.getValue(name);
        }
    };

    StyleLayer.prototype.setPaintProperty = function (name, value, options) {
        if (options === void 0) options = {};

        // 暂时不验证配置正确性
        /*if (value !== null && value !== undefined) {
            var key = "layers." + this.id + ".paint." + name;
            if (this._validate(validatePaintProperty$1, key, name, value, options)) {
                return false;
            }
        }*/

        if (utils.endsWith(name, TRANSITION_SUFFIX)) {
            this._transitionablePaint.setTransition(name.slice(0, -TRANSITION_SUFFIX.length), value || undefined);
            return false;
        } else {
            var transitionable = this._transitionablePaint._values[name];
            var isCrossFadedProperty = transitionable.property.specification["property-type"] === 'cross-faded-data-driven';
            var wasDataDriven = transitionable.value.isDataDriven();
            this._transitionablePaint.setValue(name, value);
            this._handleSpecialPaintPropertyUpdate(name);
            var isDataDriven = this._transitionablePaint._values[name].value.isDataDriven();
            return isDataDriven || wasDataDriven || isCrossFadedProperty;
        }
    };

    StyleLayer.prototype._handleSpecialPaintPropertyUpdate = function (_) {
        // 子类实现, 处理特殊的paint属性
    };

    StyleLayer.prototype.getLayoutProperty = function (name) {
        if (name === 'visibility') {
            return this.visibility;
        }
        return this._unevaluatedLayout.getValue(name);
    };

    StyleLayer.prototype.setLayoutProperty = function (name, value, options) {
        if (options === void 0) options = {};

        // 暂时不验证layout的配置是否正确
        /*if (value !== null && value !== undefined) {
            var key = "layers." + this.id + ".layout." + name;
            if (this._validate(validateLayoutProperty$1, key, name, value, options)) {
                return;
            }
        }*/

        if (name === 'visibility') {
            this.visibility = value;
            return;
        }
        this._unevaluatedLayout.setValue(name, value);
    };

    StyleLayer.prototype.getCrossfadeParameters = function getCrossfadeParameters() {
        return this._crossfadeParameters;
    };

    /**
     * 是否隐藏, 只有当zoom>=minzoom且zoom<maxzoom时, 才显示, 其他隐藏
     * @param zoom
     * @return {boolean}
     */
    StyleLayer.prototype.isHidden = function (zoom) {
        if (this.minzoom && zoom < this.minzoom) {
            return true;
        }
        if (this.maxzoom && zoom >= this.maxzoom) {
            return true;
        }
        return this.visibility === 'none';
    };

    StyleLayer.prototype.updateTransitions = function (parameters) {
        this._transitioningPaint = this._transitionablePaint.transitioned(parameters, this._transitioningPaint);
    };

    StyleLayer.prototype.hasTransition = function hasTransition() {
        return this._transitioningPaint.hasTransition();
    };

    /**
     * 根据当前参数计算layout和paint的属性值
     * @param parameters
     */
    StyleLayer.prototype.recalculate = function recalculate(parameters) {
        if (parameters.getCrossfadeParameters) {
            this._crossfadeParameters = parameters.getCrossfadeParameters();
        }

        if (this._unevaluatedLayout) {
            this.layout = this._unevaluatedLayout.possiblyEvaluate(parameters);
        }

        this.paint = this._transitioningPaint.possiblyEvaluate(parameters);
    };

    /**
     * 序列化当前实例, 用于线程之间传递
     * @return {{}}
     */
    StyleLayer.prototype.serialize = function serialize() {
        var output = {
            'id': this.id,
            'type': this.type,
            'source': this.source,
            'source-layer': this.sourceLayer,
            'metadata': this.metadata,
            'minzoom': this.minzoom,
            'maxzoom': this.maxzoom,
            'filter': this.filter,
            'layout': this._unevaluatedLayout && this._unevaluatedLayout.serialize(),
            'paint': this._transitionablePaint && this._transitionablePaint.serialize()
        };

        if (this.visibility) {
            output.layout = output.layout || {};
            output.layout.visibility = this.visibility;
        }
        // 过滤无效值
        return filterObject(output, function (value, key) {
            return value !== undefined &&
                !(key === 'layout' && !Object.keys(value).length) &&
                !(key === 'paint' && !Object.keys(value).length);
        });
    };

    /**
     * 验证配置, 暂时不实现
     * @param validate
     * @param key
     * @param name
     * @param value
     * @param options
     * @return {boolean}
     * @private
     */
    StyleLayer.prototype._validate = function (validate, key, name, value, options) {
        /*if (options === void 0) options = {};

        if (options && options.validate === false) {
          return false;
        }
        return styleUtils.emitValidationErrors(this, validate.call(validateStyle, {
          key: key,
          layerType: this.type,
          objectKey: name,
          value: value,
          styleSpec: spec,
          style: {glyphs: true, sprite: true}
        }));*/
    };

    StyleLayer.prototype.is3D = function () {
        return false;
    };

    StyleLayer.prototype.isTileClipped = function () {
        return false;
    };

    StyleLayer.prototype.hasOffscreenPass = function () {
        return false;
    };

    StyleLayer.prototype.resize = function () {};

    StyleLayer.prototype.isStateDependent = function () {
        for (var property in this.paint._values) {
            var value = this.paint.get(property);
            if (!(value instanceof PossiblyEvaluatedPropertyValue) || !styleUtils.supportsPropertyExpression(value.property.specification)) {
                continue;
            }
            if ((value.value.kind === 'source' || value.value.kind === 'composite')
                && value.value.isStateDependent) {
                return true;
            }
        }
        return false;
    };

    return StyleLayer;
});