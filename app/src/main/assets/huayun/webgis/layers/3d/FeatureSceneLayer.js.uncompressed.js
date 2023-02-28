/**
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.FeatureSceneLayer
 */
define("com/huayun/webgis/layers/3d/FeatureSceneLayer", [
    "dojo/_base/declare",
    "dojo/request",
    "./GraphicSceneLayer",
    "../../Feature",
    "../../Graphic",
    "../../geometry/MapPoint"
],function (declare, request, GraphicSceneLayer, Feature, Graphic, MapPoint) {
    /**
     * @alias com.huayun.webgis.layers.3d.FeatureSceneLayer
     * @extends {GraphicSceneLayer}
     * @property {number}  layerLv  -  样式层级
     * @property {Array}  _symbols  - 符号数组
     * @property {number}  switchLayer  - 开关层级
     */
    return declare("com.huayun.webgis.layers.3d.FeatureSceneLayer",[GraphicSceneLayer],{
        featureSet: null,
        name: "Feature图层",
        id: "Feature",
        layerLv: 13,
        _symbols: [],
        switchLayer: 17,

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.group = new THREE.Group();
            this._symbol = this._symbols[0];
        },
        /**
         * 准备数据
         */
        readyData: function() {
            var level = this.map.level;
            if (level > this.layerLv) {
                if (this.visible) {
                    if (!this.group.visible) {
                        this.group.visible = true;
                    }
                    this.fetchData();
                } else {
                    if (this.group.visible) {
                        this.group.visible = false;
                    }
                }
            }else {
                this.group.visible = false;
            }
        },
        /**
         * 开始渲染
         */
        startRender: function() {
            if (this.group.visible) {
                var level = this.map.level;
                if (level > this.switchLayer) {
                    this._symbol = this._symbols[1];
                }else {
                    this._symbol = this._symbols[0];
                    var scaleCount = Math.pow(2, this.map.initLevel - this.map.level);
                    this._symbol.meshs.forEach(function (item) {
                        item.scale.set(scaleCount, scaleCount, 1);
                    });
                    this._symbol.scale = scaleCount;
                }
                this.render();
            }

        },
        /**
         * 渲染
         */
        render: function () {
            var obj = this;
            if (this.loadPromise) {
                this.loadPromise.then(function (result) {
                    obj.clear();
                    var data = result.data, p, px, py, index, point;
                    for (var i = 0; i < data.length; i++) {
                        p = data[i].geom;
                        index = p.indexOf(' ');
                        px = p.substring(6, index);
                        py = p.substring(index+1, p.length-1);
                        point = obj.map.geometryTo3DXY(px, py);
                        var feature = new Feature({
                            id: data[i]["dev_id"],
                            attributes: {
                                "num": data[i]["photo_num"]
                            },
                            _geometry: new MapPoint(point.x, point.y, 0.05)
                        });
                        var graphic = new Graphic({
                            feature: feature,
                            symbol: obj._symbol,
                            graphicLayer: obj
                        });
                        obj.addGraphic(graphic);
                    }
                    obj.map.layerContainer.threeRender();
                });
            }
        },
        /**
         * 获取数据
         */
        fetchData: function() {
            var extent = this.map.extent;
            if (extent) {
                var level = this.map.level;
                // bbox=517950.3673376513,%203346775.720186691,%20521095.74029506394,%203348348.406665397&level=10&time=2019-02-28
                var url = this.url + "?bbox=" + extent.minx + "," + extent.miny + "," + extent.maxx + "," + extent.maxy + "&level=" + level + "&photo_num_min=1";
                this.loadPromise = request(url, {
                    handleAs: "json"
                });
            } else {
                this.loadPromise = null;
            }
        }
    })
});