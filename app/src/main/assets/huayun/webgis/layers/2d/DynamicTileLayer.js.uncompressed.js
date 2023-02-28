/**
 * Created by DELL on 2017/11/21.
 * @module com/huayun/webgis/layers
 * @see com.huayun.webgis.layers.2d.DynamicTileLayer
 */
define("com/huayun/webgis/layers/2d/DynamicTileLayer", [
    "dojo/_base/declare",
    "dojo/topic",
    "./FlatLayer",
    "../../geometry/Extent",
    "../../geometry/MapPoint",
    "../../geometry/Point",
    "../../request",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom",
    "dojo/when"
], function (declare, topic, Layer, Extent, MapPoint, Point, request, domConstruct, domStyle, dom, when) {
    /**
     * @alias com.huayun.webgis.layers.2d.DynamicTileLayer
     * @extends {Layer}
     * @property {null}  _animateRaf  - 动画
     */
    return declare("com.huayun.webgis.layers.2d.DynamicTileLayer", [Layer], {
        _animateRaf: null,              //动画

        constructor: function (params) {
        },
        postCreate: function () {
            this.inherited(arguments);
            this.canvasNode.width = this.map.width;
            this.canvasNode.height = this.map.height;
            this.ctx = this.canvasNode.getContext("2d");
            this.ctx.imageSmoothingEnabled = false;
        },
        /**
         * 由extent变引起的刷新
         */
        refresh: function () {
            if (this.map.zoomined) {//放大
                this._zoomStart("zoomIn");
            } else if (this.map.zoomouted) {//缩小
                this._zoomStart("zoomOut");
            } else {
                this.ctx.clearRect(0, 0, this.map.width, this.map.height);
            }

            if (!this.map.isPanning) {
                var url = this._getLoaderUrl();
                this._load(url);
            } else {
                /*                domStyle.set(this.domNode, "left", this.map.moveX + "px");
                                domStyle.set(this.domNode, "top", this.map.moveY + "px");
                                this.ctx.translate(xmove, ymove);*/
            }
        },
        /**
         *  获取电网图请求url
         * @returns {string}
         * @private
         */
        _getLoaderUrl: function () {
            var extent = this.map.extent;
            var width = this.map.width;
            var height = this.map.height;
            var box = "&bbox=" + extent.minx + "," + extent.miny + "," + extent.maxx + "," + extent.maxy;
            var size = "&size=" + width + "," + height;
            // var tokenString = "&access_token=";
            return this.url + box + size;
        },
        /**
         * 加载电网图
         * @param url
         * @private
         */
        _load: function (url) {
            request(url, {responseType: "image", allowImageDataAccess: false}).then(function (resp) {
                this._draw(resp.data);
            }.bind(this), function (err) {
                console.log(err);
            });
        },

        _draw: function (image) {
            this.ctx.drawImage(image, 0, 0, this.map.width, this.map.height);
        },
        _zoomStart: function (type) {
            var node = domConstruct.toDom("<img id='powerImg' style='position: fixed;top: 0px'/>");
            node.src = this.canvasNode.toDataURL("image/png");
            domConstruct.place(node, this.id);
            this.ctx.clearRect(0, 0, this.map.width, this.map.height);
            if (type === "zoomIn") {    //放大
                // this._animateZoomIn.bind(this, null, x, y);
                this._animateZoomIn(null, 0, 0, node);
            } else if (type === "zoomOut") {    //缩小
                // this._animateZoomOut.bind(this, null, x, y);
                this._animateZoomOut(null, 0, 0, node);
            }
        },
        _zoomEnd: function (node) {
            domConstruct.destroy(node.id);
            window.cancelAnimationFrame(this._animateRaf);
        },
        _animateZoomOut: function (start, x, y, node) {
            if (!start) start = performance.now();
            var delta = performance.now() - start;
            if (delta >= 500) {
                this._zoomEnd(node);
            } else {
                domStyle.set(node, "transform", "linear");
                domStyle.set(node, "-webkit-transform", "scale(0.8)");
                // fx.fadeIn({node:node}).play();
                this._animateRaf = window.requestAnimationFrame(this._animateZoomOut.bind(this, start, x, y, node));
            }
        },
        _animateZoomIn: function (start, x, y, node) {
            if (!start) start = performance.now();
            var delta = performance.now() - start;
            if (delta >= 500) {
                this._zoomEnd(node);
            } else {
                domStyle.set(node, "transform", "linear");
                domStyle.set(node, "-webkit-transform", "scale(1.2)");
                this._animateRaf = window.requestAnimationFrame(this._animateZoomIn.bind(this, start, x, y, node));
            }
        }
    })
});