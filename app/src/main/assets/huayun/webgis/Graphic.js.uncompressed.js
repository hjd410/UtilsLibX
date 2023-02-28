/**
 * 图形类
 * @module com/huayun/webgis
 * @see com.huayun.webgis.Graphic
 */
define("com/huayun/webgis/Graphic", [
    "./utils/Color"
], function (Color) {
    var u = 0;

    /**
     * 图形类, 代表地图中的某个图形
     * @constructor
     * @alias com.huayun.webgis.Graphic
     * @param {Object} params 图形类参数
     * @param {Feature} params.feature 图形的特征
     * @param {Symbol} params.symbol 图形的样式
     * @param {Boolean} params.visible 图形可见性
     * @param {Boolean} params.selectEnabled 图形能否被选择
     * @property {number} id 图形id
     * @property {Feature} feature 图形特征
     * @property {Layer} layer 图形所在的图层
     * @property {Symbol} symbol 图形样式
     * @property {Boolean} visible 图形可见性
     * @property {Boolean} selectEnabled 图形能否被选择
     * @property {Object} glow 发光效果
     */
    function Graphic(params) {
        this.id = params.id === undefined ? u++ : params.id;
        this.feature = params.feature;
        this.layer = params.layer;
        this.symbol = params.symbol;
        this.position = null;
        this.visible = params.visible === undefined ? true : params.visible;
        this.selectEnabled = params.selectEnabled === undefined ? true : params.selectEnabled;
        this._glow = null;
        this.buckets = [];
        this.isChangeSymbol = true;

        this.renderer = params.renderer?params.renderer:null;
    }

    /**
     * 设置是否可见
     * @params {Boolean} visible  - 是否可见
     */
    Graphic.prototype.setVisible = function (visible) {
        this.visible = value;
    };
    /**
     * 更新图形位置
     * @params {number} dx 地理坐标水平方向的差值
     * @params {number} dy 地理坐标竖直方向的差值
     * @params {number} dz 三维坐标第三分量差值
     */
    Graphic.prototype.updatePosition = function (dx, dy, dz) {
        this.position[0] += dx;
        this.position[1] += dy;
        if (dz) {
            this.position[2] += dz;
        }
    };

    Graphic.prototype.updateGeometry = function (dx, dy) {
        this.layer.indexNeedUpdate = true;
        this.feature.geometry.update(dx, dy);
    };

    Graphic.prototype.getAttribute = function (name) {
        return this.feature.attributes.find(function (item) {
            return item.name && item.name.toLowerCase() === name.toLowerCase();
        });
    };

    Graphic.prototype.updateSymbol = function (symbol) {
        this.symbol = symbol;
        this.layer.layerView.view.threeRender();
    };

    Graphic.prototype.reset = function () {
        var buckets = this.buckets;
        if (buckets) {
            buckets.forEach(function (bucket) {
                bucket.destroy();
            });
        }
        this.buckets = [];
    }

    Graphic.prototype.destroy = function () {
        this.buckets.forEach(function (item) {
            item.destroy();
        });
        this.buckets = [];
    }

    var prototypeAccessors = {
        glow: {configurable: true}
    };
    prototypeAccessors.glow.set = function (prop) {
        if (prop && prop.color) {
            this._glow = prop;
            var color = Color.parse(prop.color);
            this._glow.color = [color.r, color.g, color.b, color.a]
        } else {
            this._glow = null;
        }
    };
    prototypeAccessors.glow.get = function () {
        return this._glow;
    };

    Object.defineProperties(Graphic.prototype, prototypeAccessors);
    return Graphic;
});
