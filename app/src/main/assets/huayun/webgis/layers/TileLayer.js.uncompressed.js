/**
 * 静态切片图层
 * @see com.huayun.webgis.layers.TileLayer
 */
define("com/huayun/webgis/layers/TileLayer", [
    "./Layer",
    "../geometry/Extent",
    "../views/3d/layers/TileLayerView3D",
    "../geometry/Point",
    "./support/TileSourceCache",
    "./support/LOD",
    "./support/TileInfo",
    "../facade/TileFacade"
], function (Layer, Extent, TileLayerView3D, Point, TileSourceCache, LOD, TileInfo, TileFacade) {
    // 获取地图元数据的接口地址的正则
    var reg = /(\/tile\/.+)/;
    // 获取token的正则
    // var tokenReg = /access_token=([\d+|\w+]-?)+/;

    /**
     * 静态切片图层
     * @constructor
     * @alias com.huayun.webgis..layers.TileLayer
     * @extends {layer}
     * @param {Object} params 构造函数参数
     * @param {string}  params.id  图层id
     * @param {String} params.url 切片服务地址
     * @property {string}  type  图层类型
     * @property {string}  id  图层id
     * @property {string}  url 切片服务地址
     * @example
     * var layer = new TileLayer({
     *  id: "tile",
     *  visible: true,
     *  url: "xxx"
     * });
     */
    var TileLayer = function (params) {
        Layer.call(this, params);
        this.id = params.id || "tileLayer";
        this.type = "Tile";
        this.name = params.name || "静态背景图";
        this.url = params.url;
        this.visible = params.visible === undefined ? true : params.visible;
        this.selectEnabled = false;
        this.loaded = false;
        this.tileInfo = null;
        this.layerView = null;
        this.sourceCache = null;
        this.maxLevel = params.maxLevel;
    };
    if (Layer) TileLayer.__proto__ = Layer;
    TileLayer.prototype = Object.create(Layer && Layer.prototype);
    TileLayer.prototype.constructor = TileLayer;

    /**
     * 创建静态切片的LayerView
     * @private
     * @param view
     * @param option
     * @return {exports}
     */
    TileLayer.prototype.createLayerView = function (view, option) {
        var layerView = new TileLayerView3D({
            width: view.width,
            height: view.height,
            opacity: this.opacity,
            visible: this.visible,
            view: view,
            id: this.id,
            layer: this
        });
        this._load(view);
        this.layerView = layerView;
        layerView.transform = view.viewpoint;
        return layerView;
    };

    /**
     * 加载地图坐标系的元数据TileInfo
     * @ignore
     * @param view
     * @private
     */
    TileLayer.prototype._load = function (view) {
        var serverUrl = this.url.replace(reg, "");
        var index = this.url.indexOf("?");
        if (index > -1) { // 已有参数
            var args = this.url.substring(index);
            serverUrl = serverUrl + args + "&f=json";
        } else { // 没有参数
            serverUrl = serverUrl + "?f=json";
        }
        var self = this;
        TileFacade.getTileInfoData(serverUrl, function (err, resp) {
            if (err) {
                TileFacade.getTileInfoData(require.toUrl("com/huayun/webgis/layers/support/tileInfoData2385.json"), function (e, response) {
                    if (e) throw new Error(e.message);
                    self._resolve(view, response);
                });
            } else {
                self._resolve(view, resp);
            }

        });
    };

    TileLayer.prototype._resolve = function (view, resp) {
        var tileInfo = resp.tileInfo;
        var theOrigin = tileInfo.origin;
        theOrigin = new Point(theOrigin.x, theOrigin.y);
        var lodList = [];
        resp.lods.forEach(function (item) {
            lodList.push(new LOD({
                level: item.level,
                scale: item.scale,
                resolution: item.resolution
            }));
        });
        // this.maxLevel = lodList[];
        var extent = resp.fullExtent;
        var fullExtent = new Extent(Number(extent.xmin), Number(extent.ymin), Number(extent.xmax), Number(extent.ymax));
        this.tileInfo = new TileInfo({
            lods: lodList,
            origin: theOrigin,
            size: tileInfo.cols,
            fullExtent: fullExtent
        });
        var options = {
            tileSize: this.tileInfo.size,
            type: "raster",
            minzoom: this.tileInfo.lods[0].level,
            maxzoom: this.tileInfo.lods[lodList.length - 1].level
        };
        this.sourceCache = new TileSourceCache(this.id, options, view.width, view.height, this.url, this);
        view.setTileInfo(this.tileInfo);
    }


    TileLayer.prototype.refresh = function () {
        this.layerView.view.threeRender();
    };

    TileLayer.prototype.setVisible = function (visible) {
        this.visible = visible;
        this.layerView.setVisible(visible);
    };

    TileLayer.prototype.setUrl = function (url) {
        this.url = url;
        this.sourceCache.updateTileUrl(url);
        var ids = this.sourceCache.getIds();
        var sourceCache = this.sourceCache;
        sourceCache.clearOtherLevel(this.layerView.view.viewpoint.level);
        for (var i = 0, list = ids; i < list.length; i += 1) {
            var tileID = list[i];
            sourceCache._reAddTile(tileID);
        }
    };

    return TileLayer;
});