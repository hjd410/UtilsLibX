/**
 * Created by overfly on 2018/05/30.
 * 3d图层基类
 *  @module com/huayun/webgis/layers
 *  @see com.huayun.webgis.layers.3d.SceneLayer
 */
define("com/huayun/webgis/layers/3d/SceneLayer", [
    "dojo/_base/declare",
    "../Layer"
],function (declare, Layer) {
    /**
     * @alias com.huayun.webgis.layers.3d.SceneLayer
     * @extends {Layer}
     */
    return declare("com.huayun.webgis.layers.3d.SceneLayer",[Layer],{
        group: null
    })
});