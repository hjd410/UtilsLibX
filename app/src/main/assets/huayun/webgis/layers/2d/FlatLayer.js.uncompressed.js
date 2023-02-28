require({cache:{
'url:com/huayun/webgis/templates/layer.html':"<div class=\"${baseClass}\">\r\n    <canvas width=\"${width}\" height=\"${height}\" id=\"${baseClass}Canvas\" data-dojo-attach-point=\"canvasNode\"></canvas>\r\n</div>"}});
/**
 * Created by overfly on 2018/05/30.
 * 2d图层基类
 * @module com/huayun/webgis/layers
 * @see com.huayun.webgis.layers.2d.FlatLayer
 */
define("com/huayun/webgis/layers/2d/FlatLayer", [
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/dom-style",
    "../Layer",
    "dojo/text!../../templates/layer.html"
],function (declare,_WidgetBase,_TemplatedMixin,domStyle,Layer, template) {
    /**
     * @alias com.huayun.webgis.layers.2d.FlatLayer
     * @extends {Layer}
     * @property {string}  templateString  - 模板字符串
     * @property {string}  baseClass  - 基类
     */
    return declare("com.huayun.webgis.layers.2d.FlatLayer",[_WidgetBase, _TemplatedMixin, Layer],{
        templateString: template,
        baseClass:"webgis-layer",
        /*dataReady: null,
        waittingRender: null,
        */
        refresh: function () {
        },
        setVisible: function (visible) {
            if (visible){
                domStyle.set(this.domNode,"display","block");
            }else {
                domStyle.set(this.domNode,"display","none");
            }
        }
    })
});