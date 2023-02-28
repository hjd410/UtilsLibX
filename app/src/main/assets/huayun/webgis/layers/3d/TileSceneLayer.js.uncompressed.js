/**
 * Created by overfly on 2018/05/30.
 * 3d底图基类
 * @module com/huayun/webgis/layers
 * @see com.huayun.webgis.layers.3d.TileSceneLayer
 */
define("com/huayun/webgis/layers/3d/TileSceneLayer", [
    "dojo/_base/declare",
    "./SceneLayer",
    "../../request"
],function (declare,SceneLayer, request) {
    /**
     * @alias com.huayun.webgis.layers.3d.TileSceneLayer
     * @extends {SceneLayer}
     * @property {Array}  url  - 地址 
     * @property {Array}  tileInfo  - 切片信息 
     * @property {boolean}  fullExtent  - 范围是否填满 
     */
    return declare("com.huayun.webgis.layers.3d.TileSceneLayer",[SceneLayer],{
        url: null,
        //zindex: null,
        tileInfo: null,
        fullExtent: null,
        /**
         * 获取切片
         * @param url 
         */
        fetchTile: function(url) {
            return request(url,{responseType:"image",allowImageDataAccess:false});
        },
        /**
         * 刷新
         */
        refresh: function () {
        }
    })
});