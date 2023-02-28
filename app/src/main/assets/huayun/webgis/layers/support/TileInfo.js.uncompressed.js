define("com/huayun/webgis/layers/support/TileInfo", ["dojo/_base/declare", "../../geometry/MapPoint", "./LOD", "../../geometry/Extent"], function (declare, MapPoint, LOD, Extent) {
    return declare("com.huayun.webgis.layers.support.TileInfo", [], {
        size: 256,
        dpi: 96,
        format: "PNG8",
        origin: null,
        lods: [],
        fullExtent: null,

        constructor: function (params) {
            this.lods = params.lods;
            this.origin = params.origin;
            this.size = params.size ? params.size : 256;
            this.dpi = params.dpi ? params.dpi : 96;
            this.fullExtent = params.fullExtent;
            // this.baseResolution =
            this.lods.forEach(function (item) {
                if (item.level === 0) {
                    this.baseResolution = item.resolution;
                }
            }.bind(this))
        },

        toString: function () {
            return "size: " + this.size + " dpi: " + this.dpi;
        },

        /**
         * 根据层级获取分辨率
         * @param {number} zoom - 层级
         * @return {number} - 分辨率
         */
        getResolution: function (zoom) {
            return this.baseResolution / Math.pow(2, zoom);
        },

        /**
         * 根据分辨率获取层级
         * @param {number} resolution - 分辨率
         */
        getLevel: function (resolution) {
            return Math.log2(this.baseResolution / resolution);
        },

        /**
         * 获取最接近给定数值的分辨率和层级
         * @param {number} tempResolution - 给定数值
         * @return {Object} 返回分辨率和层级
         */
        findNestZoom: function (tempResolution) {
            var lods = this.lods,
                len = lods.length, ratio = 0;
            for (var j = len - 1; j > -1; j--) {
                ratio = lods[j].resolution / tempResolution;
                if (ratio < 1.9 && ratio > 0.95) {
                    return {
                        resolution: lods[j].resolution,
                        level: j
                    };
                }
            }
            return {
                level: len - 1,
                resolution: lods[len - 1].resolution
            };
        },


        getColForX: function (x, resolution) {
            return (x - this.origin.x) / (resolution * this.size);
        },

        getRowForY: function (y, resolution) {
            return (this.origin.y - y) / (resolution * this.size);
        },
        getColRange: function (resolution) {
            var ymin = this.fullExtent.miny,
                ymax = this.fullExtent.maxy;
            return [
                Math.floor((this.origin.y - ymax) / (resolution * this.size)),
                Math.ceil((this.origin.y - ymin) / (resolution * this.size))
            ]
        },
        getXForCol: function (x, resolution) {
            // return (x - this.origin.x) / (resolution * this.size);
            return (resolution * this.size) * x + this.origin.x;
        },
        getYForRow: function (y, resolution) {
            // return (this.origin.y - y) / (resolution * this.size);
            return this.origin.y - (resolution * this.size) * y;
        },
        getColForSceneX: function (x, resolution) {
            // return (x - this.origin.x) / (resolution * this.size);
            return (x - this.origin.x / resolution) / this.size;
        },
        getRowForSceneY: function (y, resolution) {
            return (this.origin.y / resolution - y) / this.size;
        },
        getSceneXForCol: function (x, resolution) {
            return this.size * x + this.origin.x / resolution;
        },
        getSceneYForRow: function (y, resolution) {
            // return (this.origin.y - y) / (resolution * this.size);
            return this.origin.y / resolution - this.size * y;
        },

        getSceneXForCol2: function (x, oldR, r) {
            // return this.size * x + this.origin.x / resolution;
            return (this.size * oldR * x + this.origin.x) / r;
        },

        getSceneYForRow2: function (y, oldR, r) {
            // return (this.origin.y - y) / (resolution * this.size);
            // return this.origin.y / resolution -  this.size * y;
            return (this.origin.y - this.size * oldR * y) / r;
        },
        getGeometry: function (unwrappedTileID, zoom) {
            var canonical = unwrappedTileID.canonical;
            var r = this.getResolution(zoom|| canonical.z);
            var x = this.getXForCol(canonical.x, r),
                y = this.getYForRow(canonical.y, r);
            return [x, y];
        },
        getSceneXForX: function (x, zoom) {
            return x / this.getResolution(zoom);
        },
        getSceneYForY: function (y, zoom) {
            return y / this.getResolution(zoom);
        },
        tileXYToRectangle: function (x, y, level) {
            var resolution = this.getResolution(level);
            var west = this.getXForCol(x, resolution);
            var east = this.getXForCol(x + 1, resolution);
            var north = this.getYForRow(y, resolution);
            var south = this.getYForRow(y + 1, resolution);
            return {
                west: west,
                east: east,
                north: north,
                south: south
            }
        }
    })
});