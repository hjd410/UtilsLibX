/**
 *  @author :   JiGuangJie
 *  @date   :   2020/7/16
 *  @time   :   9:23
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/webgis/widget/components/SymbolWidget", [
    "../../Viewpoint",
    "../../Graphic",
    "../../Feature",
    "../../gl/Context",
    "../../symbols/CompositeMarkSymbol",
    "../../symbols/CompositeLineSymbol",
    "../../symbols/CompositeFillSymbol",
    "../../symbols/CircleSymbol",
    "../../symbols/LineSymbol",
    "../../symbols/FontSymbol",
    "../../symbols/PolygonSymbol",
    "../../symbols/DecorationLineSymbol",
    "../../geometry/Point",
    "../../geometry/Multipoint",
    "../../geometry/Polyline",
    "../../geometry/Polygon",
    "../../renderer/LineRenderer",
    "../../renderer/FontRenderer",
    "../../renderer/DecorationLineRenderer",
    "../../renderer/CompositeMarkerRenderer",
    "../../renderer/CompositeLineRenderer",
    "../../renderer/CompositeFillRenderer"
], function (Viewpoint, Graphic, Feature, Context, CompositeMarkSymbol, CompositeLineSymbol, CompositeFillSymbol, CircleSymbol, LineSymbol, FontSymbol, PolygonSymbol, DecorationLineSymbol,
             Point, Multipoint, Polyline, Polygon, LineRenderer, FontRenderer, DecorationLineRenderer, CompositeMarkerRenderer, CompositeLineRenderer, CompositeFillRenderer) {
    // webglContext=null;
    var canvas = document.createElement('canvas');
    canvas.id = 'graphic-item';
    var webglContext = canvas.getContext('webgl');

    // 1001 点 1002 线 1003 面 1004字体
    function SymbolWidget(params) {
        this.el = params.el;
        this.data = params.data;
        this.size = params.data.size;
        this.symbol = params.data.symbol;
        this.type = this.symbol.type;
        this.id = this.symbol.id;
        this.name = this.symbol.name;
        this.symbols = this.symbol.symbols;

        webglContext.canvas.width = this.size;
        webglContext.canvas.height = this.size;
        webglContext.viewport(0, 0, this.size, this.size);

        var colors;
        if (params.data.bgColor) {
            colors = params.data.bgColor.split(',');
        } else {
            colors = [0, 0, 0, 1];
        }
        webglContext.clearColor(colors[0], colors[1], colors[2], colors[3]);

        this._initViewPoint();
        this.graphicList = [];
        this._createGraphic();
    }

    SymbolWidget.prototype.update = function (data) {
        this.data = data.data;
        this.size = this.data.size || this.size;
        this.symbol = this.data.symbol || this.symbol;
        this.symbols = this.symbol.symbols;

        for (var i = 0; i < this.graphicList.length; i++) {
            var graphicListElement = this.graphicList[i];
            if (graphicListElement.id === this.id) {
                graphicListElement.graphic.symbol = this._createCompositeSymbol(this.symbols);
                break;
            }
        }
        this.view.threeRender();
    };

    SymbolWidget.prototype._initViewPoint = function () {
        var context = new Context(webglContext);
        this.view = {
            width: this.size,
            height: this.size,
            resolution: 1,
            scale: 1,
            context: context,
            geometryToScreen: function (x, y) {
                return new Point(x, y);
            },
            threeRender: function () {
                this.graphicList.forEach(function (item) {
                    var graphic = item.graphic;
                    if (graphic.renderer) {
                        var cvs = item.canvas;
                        var ctx = cvs.getContext('2d');
                        ctx.clearRect(0, 0, cvs.width, cvs.height);
                        webglContext.clear(webglContext.COLOR_BUFFER_BIT);
                        graphic.renderer.draw(this.view, graphic, graphic.feature.geometry, graphic.symbol);
                        ctx.drawImage(canvas, 0, 0);
                    }
                }.bind(this));
            }.bind(this)
        };
        var viewpoint = new Viewpoint(this.view.width, this.view.height, 0, 0, 0, 0, 0, this.view);
        this.view.viewpoint = viewpoint;
        viewpoint.center = [this.size * 0.5, this.size * 0.5];
        viewpoint.resolution = 1;
        viewpoint.calcMatrix(false);
    };

    SymbolWidget.prototype._createGraphic = function () {
        var geometry = this._createGeometry();
        var compositeSymbol = this._createCompositeSymbol(this.symbols);
        var graphic = new Graphic({
            feature: new Feature({
                attributes: null,
                geometry: geometry
            }),
            symbol: compositeSymbol
        });
        this.el.width = this.size;
        this.el.height = this.size;
        this.graphicList.push({
            id: this.id,
            graphic: graphic,
            canvas: this.el
        });

        var renderer = this._createRenderer();
        if (renderer !== null) {
            renderer.add(this.view, graphic, geometry, compositeSymbol);
            graphic.renderer = renderer;
            this.view.threeRender();
        }
    };

    SymbolWidget.prototype._createRenderer = function () {
        var result = null;
        switch (this.type) {
            case "1001":
                result = new CompositeMarkerRenderer();
                break;
            case '1002':
                result = new CompositeLineRenderer();
                break;
            case '1003':
                result = new CompositeFillRenderer();
                break;
            case '1004':
                result = null;
                break;
        }
        return result;
    };

    SymbolWidget.prototype._createCompositeSymbol = function (symbols) {
        var result = null;
        switch (this.type) {
            case "1001":
                result = new CompositeMarkSymbol({
                    symbol: symbols,
                    size: this.size * 0.40
                });
                break;
            case '1002':
                result = new CompositeLineSymbol({
                    symbol: symbols
                });
                break;
            case '1003':
                result = new CompositeFillSymbol({
                    symbol: symbols
                });
                break;
        }
        return result;
    };

    SymbolWidget.prototype._createGeometry = function () {
        var result = null;
        // debugger
        switch (this.type) {
            case '1001':
                result = this._getPointGeometry();
                break;
            case '1002':
                result = this._getLineGeometry();
                break;
            case '1003':
                result = new Polygon([
                    [
                        new Point(this.size/4, this.size/4),
                        new Point(this.size*3/4, this.size/4),
                        new Point(this.size*3/4, this.size*3/4),
                        new Point(this.size/4, this.size*3/4),
                        new Point(this.size/4, this.size/4)
                    ]
                ]);
                break;
        }
        return result;
    };
    //
    SymbolWidget.prototype._getPointGeometry = function () {
        // debugger
        if (this.symbols.length === 1) {
            if (this.symbols[0]['baseid'] === 'p_twocoiltransformer_style') {
                return new Multipoint([
                    new Point(this.size * 0.5, this.size),
                    new Point(this.size * 0.5, 0)
                ]);
            } else if (this.symbols[0]['baseid'] === 'p_threecoiltransformer_style') {
                var r = 0.75, d = 1.5, lp = 0.3;
                var vl = lp + d + r + r * 0.5 + lp;
                var tempW = Math.cos(30 * Math.PI / 180) * r * this.size / vl;
                var lw = this.size * 0.5 - tempW;
                var rw = this.size * 0.5 + tempW;
                return new Multipoint([
                    new Point(this.size * 0.5, this.size),
                    new Point(lw, 0),
                    new Point(rw, 0)
                ]);
            } else if (this.symbols[0]['baseid'] === 'p_autotransformer_style') {
                var tap = this.symbols[0]['tap'];
                if (tap === "true") {
                    return new Multipoint([
                        new Point(this.size * 0.5, this.size),
                        new Point(this.size * 0.5, this.size * 0.5),
                        new Point(this.size * 0.5, 0)
                    ]);
                } else {
                    return new Multipoint([
                        new Point(this.size * 0.5, this.size),
                        new Point(this.size * 0.5, 0)
                    ]);
                }
            } else {
                return new Point(this.size * 0.5, this.size * 0.5);
            }
        } else {
            return new Point(this.size * 0.5, this.size * 0.5);
        }
    };
    SymbolWidget.prototype._getLineGeometry = function () {
        if (this.symbols[0]['baseid'] === 'l_leadlinesymbol_style') {
            // debugger
            return new Polyline([
                [
                    new Point(0, this.size * 0.5),
                    new Point(this.size * 0.5, this.size * 0.5),
                    new Point(this.size, this.size * 0.5)
                ]
            ]);
        } else if (this.symbols[0]['baseid'] === 'l_multileadlinesymbol_style') {
            return new Polyline([
                [
                    new Point(0, this.size * 0.5),
                    new Point(this.size * 0.5, this.size * 0.5),
                    new Point(this.size, this.size * 0.5)
                ]
            ]);
        } else {
            return new Polyline([
                [
                    new Point(0, this.size * 0.5),
                    new Point(this.size, this.size * 0.5)
                ]
            ]);
        }
    };
    return SymbolWidget;
});
