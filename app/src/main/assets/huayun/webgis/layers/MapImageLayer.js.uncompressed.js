/**
 * 后端出图图层
 * @see com.huayun.webgis.layers.MapImageLayer
 */
define("com/huayun/webgis/layers/MapImageLayer", [
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/request",
    "../data/GraphicIndex",
    "./Layer",
    "../request",
    "../facade/PowerFacade",
    "../geometry/Point",
    "../geometry/Polyline",
    "../geometry/Multipoint",
    "../geometry/Polygon",
    "../views/3d/layers/MapImageLayerView3D",
    "../utils/Resource"
], function (declare, topic, dojoRequest, GraphicIndex, Layer, request, PowerFacade, Point, Polyline, Multipoint, Polygon, LayerView, Resource) {
    /**
     * 后端出图图层
     * @constructor
     * @alias com.huayun.webgis.layers.MapImageLayer
     * @extends {Layer}
     * @param {Object} params 构造函数参数
     * @param {string}  params.id  图层id
     * @param {String} params.url 后端出图服务地址
     * @property {string}  type  图层类型
     * @property {string}  id  图层id
     * @property {string}  url 后端出图服务地址
     * @example
     * var powerLayer = new MapImageLayer({
     *      id: "power",
     *      visible: true,
     *      url: "xxx"
     * });
     */
    return declare("com.huayun.webgis.layers.MapImageLayer", [Layer], {
        type: "Image",
        name: "动态图层",
        spatialReference: null,
        sublayers: null,
        _powerFacade: null,
        _results: null,

        constructor: function (params) {
            declare.safeMixin(this, params);
            // this.filter = params.filterLayer?params.filterLayer:params.options.filterLayer;
            if (params.filterLayer) {
                this.filter = params.filterLayer;
            } else if (params.options && params.options.filterLayer) {
                this.filter = params.options.filterLayer;
            } else {
                this.filter = null;
            }
            this.id = params.id ? params.id : "power";
            this.selectEnabled = true;
            this.url = params.url;
            this.initUrl = this.url;
            this._initUrl = this.url.substring(0, this.url.indexOf("?"));
            this._initUrl = this._initUrl.substring(0, this._initUrl.lastIndexOf("/"));
            this.token = RegExp(/access[\u0000-\u00ff]+(&|$)/g).exec(this.url) === null ? "" : RegExp(/access[\u0000-\u00ff]+(&|$)/g).exec(this.url)[0];
            this.sublayers = [];
            this.layerData = {};
            this.tolerance = params.tolerance ? params.tolerance : 5;
            this.identifyType = "visible";
            // var infoUrl = this.url + "?f=json";
            this._powerFacade = new PowerFacade({
                url: this.url
            });
            this._getMapInfoMethod();
            this.graphicIndex = new GraphicIndex();
            this.indexNeedUpdate = true;
            this._filterUse = false;
            this.maxLevel = params.maxLevel;
            this.getFilterData();
        },

        createLayerView: function (view, option) {
            var layerView = new LayerView({
                width: view.width,
                height: view.height,
                opacity: this.opacity,
                visible: this.visible,
                view: view,
                id: this.id,
                layer: this
            });
            this.layerView = layerView;
            layerView.transform = view.viewpoint;
            return layerView;
        },

        _getMapInfoMethod: function () {
            this._powerFacade.getMapInfoData(function (resp) {
                this.sublayers = resp["layers"];
            }.bind(this), function (error) {
                console.log(error.message);
            }.bind(this));
        },

        _setVisibleAttr: function (value) {
            this.layerView.setVisible(value);
        },

        fetchImage: function (extent, width, height) {
            width = this.getImageUrl(extent, width, height);
            var token = dojoConfig.token;
            var headers = token ? {
                headers: {
                    "access-key": token
                }
            } : undefined;
            /*return request(width, {responseType: "image", headers: headers}).then(function (resp) {
                return resp.data;
            });*/
            return Resource.loadImagePromise(width, headers);
        },

        getFilterData: function () {
            if (this.filter) {
                dojoRequest.get(this.filter, {handleAs: "json"}).then(function (resp) {
                    for (var i = 0; i < resp.data.length; i++) {
                        var key = resp.data[i].level;
                        var value = resp.data[i].layers.join();
                        this.layerData[key] = value;
                    }
                    if (this._filterUse) {
                        this.getMSCdata(this.layerView.view.getExtent());
                    }
                }.bind(this));
            }
        },

        getMSCdata: function (extent) {
            if (this.filter) {
                if (!this._filterUse) {
                    this._filterUse = true;
                    return;
                }
                this._filterUse = true;
                var level = this.layerView.view.level
                var identifyLayers = this.layerData[level];

                if (identifyLayers) {
                    if (identifyLayers.length === 0) {
                        this._results = null;
                    } else {
                        var url = this._initUrl + "/identify?layers=" + identifyLayers + "&" + this.token + "&f=json&geometryType=esriGeometryEnvelope&geometry=" + extent.minx + "," + extent.miny + "," + extent.maxx + "," + extent.maxy + "&tolerance=" + this.tolerance;
                        return dojoRequest.get(url, {handleAs: "json"}).then(function (resp) {
                            this.indexNeedUpdate = true;
                            this._results = resp.results;
                        }.bind(this));
                    }
                }
            }
        },

        queryFeaturesByGeometry: function (geometry, queryPadding) {
            if (this._results) {
                if (this.indexNeedUpdate) {
                    this.graphicIndex.clear();
                    this._results.forEach(function (item) {
                        var geometry;
                        switch (item.geometryType) {
                            case "esriGeometryPoint":
                                geometry = item.geometry;
                                item.feature = new Point(geometry.x, geometry.y);
                                geometry = [[item.feature]];
                                break;
                            case "esriGeometryMultipoint":
                                var points = item.geometry.points.map(function (item) {
                                    return new Point(item[0], item[1]);
                                });
                                item.feature = new Multipoint(points);
                                geometry = [item.feature.points];
                                break;
                            case "esriGeometryPolyline":
                                var path = item.geometry.paths.map(function (item) {
                                    return item.map(function (p) {
                                        return new Point(p[0], p[1]);
                                    });
                                });
                                item.feature = new Polyline(path);
                                geometry = item.feature.path;
                                break;
                            default:
                                geometry = new Polygon(item.geometry.rings).path;
                                item.feature = new Polygon(item.geometry.rings);
                        }
                        this.graphicIndex.insertMsc(geometry, item);
                    }.bind(this));
                    this.indexNeedUpdate = false;
                }
                queryPadding = queryPadding || this.tolerance;
                switch (geometry.type) {
                    case "point":
                        geometry = [geometry];
                        break;
                    case "polygon":
                        geometry = [geometry];
                        break;
                }
                return this.graphicIndex.queryMsc(geometry, queryPadding, this.layerView.view.resolution, this.layerView.view.viewpoint);
            }
            return null;
        },

        getImageUrl: function (extent, width, height) {
            var minXReg = /\{minx\}/;
            var minYReg = /\{miny\}/;
            var maxXReg = /\{maxx\}/;
            var maxYReg = /\{maxy\}/;
            var widthReg = /\{w\}/;
            var heightReg = /\{h\}/;
            var requestUrl = this.url.replace(minXReg, extent.minx);
            requestUrl = requestUrl.replace(minYReg, extent.miny);
            requestUrl = requestUrl.replace(maxXReg, extent.maxx);
            requestUrl = requestUrl.replace(maxYReg, extent.maxy);
            requestUrl = requestUrl.replace(widthReg, width);
            requestUrl = requestUrl.replace(heightReg, height);
            return requestUrl;
        },

        setUrl: function (url) {
            this.url = url;
            this._initUrl = this.url.substring(0, this.url.indexOf("?"));
            this._initUrl = this._initUrl.substring(0, this._initUrl.lastIndexOf("/"));
        },

        setFilter: function (filter) {
            if (filter) {
                if (filter instanceof Object) {
                    for (var key in filter) {
                        if (this.initUrl.indexOf("?") > 0) {
                            this.url = this.initUrl + "&" + key + "=" + filter[key];
                        } else {
                            this.url = this.initUrl + "?" + key + "=" + filter[key];
                        }
                    }
                } else {
                    this.url = this.initUrl + filter;
                }
            } else {
                this.url = this.initUrl;
            }
        },

        refresh: function () {
            this.layerView.refresh();
        },
        setVisible: function (visible) {
            topic.publish("mapImageLayerVisibleChange", visible, this.id);
            this.layerView.setVisible(visible);
        },
        setOpacity: function (opacity) {
            this.layerView.setOpacity(opacity);
        },
        // queryFeaturesByGeometry: function (geometry, queryPadding) {
        //   queryPadding = queryPadding || this.tolerance;
        //   var url = this._initUrl + "/identify?layers=" + this.identifyType + "&access_token=0be7febd-8366-4b4e-bb41-313f416b4c86&f=json";
        //   switch (geometry.type) {
        //     case "point":
        //       url += "&geometryType=esriGeometryPoint&geometry=" + geometry.x + "," + geometry.y;
        //       break;
        //     default:
        //       geometry = this.getBounds(geometry);
        //       url += "&geometryType=esriGeometryEnvelope&geometry=" + geometry.minx + "," + geometry.miny + "," + geometry.maxx + "," + geometry.maxy;
        //   }
        //   url += "&tolerance=" + (queryPadding * this.layerView.view.resolution);
        //   return dojoRequest.get(url, { handleAs: "json" });
        // },
        getBounds: function (geometry) {
            if (geometry.type === "point") {
                return {xmin: geometry.x, ymin: geometry.y, xmax: geometry.x, ymax: geometry.y};
            } else {
                return geometry.extent;
            }
        }
    })
});