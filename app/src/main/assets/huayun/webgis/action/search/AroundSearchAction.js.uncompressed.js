define(
    "com/huayun/webgis/action/search/AroundSearchAction", [
        "dojo/_base/declare",
        "dojo/on",
        "dojo/dom-class",
        "../../../facades/AgsFacade",
        "../../symbols/ImageSymbol",
        "../../geometry/Point2D",
        "../../Graphic",
        "../../Feature",
        "../ActiveMapAction"
    ], function (declare, on, domClass, AgsFacade, ImageSymbol, Point2D, Graphic, Feature, ActiveMapAction) {
        return declare("com.huayun.webgis.action.search.AroundSearchAction", [ActiveMapAction], {

            constructor: function (params) {
                declare.safeMixin(params);
                this.isActive = true;
                this.view = params.view;
                this.drawLayer = this.view.map.findLayerById("drawLayer");
                this._agsFacade = new AgsFacade();
                // this._agsUrl = "http://ags.prod.cloud.zj.sgcc.com.cn/";
                this._agsUrl = "http://10.147.232.227:8188/";
                this._symbol = new ImageSymbol({
                    url: require.toUrl("com/huayun/webgis/css/images/blue.png"),
                    width: 21,
                    height: 33
                });
            },

            active: function () {
                if (!this.state) {    //当前Action处于激活状态下的时候，无需重复激活
                    this.state = true;
                    this.view.selectEnabled = true;
                    this._mouseClick = on(this.view.domNode, "click", this._onClick.bind(this));
                    domClass.add(this.view.domNode, "draw-cursor-style");
                }
            },
            invalid: function () {
                this.drawLayer.clear();
                this.state = false;
                if (this._mouseClick) {
                    this._mouseClick.remove();
                    this._mouseClick = null;
                }
            },
            _onClick: function (event) {
                event.preventDefault();
                event.stopPropagation();
                var geo = this.view.screenToGeometry(event.x, event.y);
                this.drawLayer.clear();
                this._agsFacade.getAroundPoints(this._agsUrl, geo, function (result) {
                    if (result.code === 0) { // 成功
                        var data = result.data;
                        var point_x = data.shapeX,
                            point_y = data.shapeY;
                        var startGeo = new Point2D(point_x, point_y);
                        var startFeature = new Feature({
                            attribute: data,
                            geometry: startGeo
                        });
                        var startGraphic = new Graphic({
                            feature: startFeature,
                            symbol: this._symbol
                        });
                        this.drawLayer.addGraphic(startGraphic);
                        this.view.threeRender();
                    }
                }.bind(this))
            }
        });
    }
);