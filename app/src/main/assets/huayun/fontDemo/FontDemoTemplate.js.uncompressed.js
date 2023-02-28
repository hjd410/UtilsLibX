define("com/huayun/fontDemo/FontDemoTemplate", [
    '../webgis/Viewpoint',
    '../webgis/Graphic',
    '../webgis/Feature',
    '../webgis/gl/Context',
    '../webgis/symbols/FontSymbol',
    '../webgis/geometry/Point',
    '../webgis/renderer/FontRenderer'
], function(Viewpoint, Graphic, Feature, Context,FontSymbol, Point, FontRenderer) {
    function FontDemoTemplate(params){
        this.size = params.size;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size.width;
        this.canvas.height = this.size.height;
        this.webglContext = this.canvas.getContext('webgl');
        this.webglContext.clearColor(0, 0, 0, 1);

        this._initViewPoint();
        this.graphicList = [];
        this.callBack = null;
    };

    FontDemoTemplate.prototype._initViewPoint = function () {
        var context = new Context(this.webglContext);
        this.view = {
            width: this.size.width,
            height: this.size.height,
            resolution: 1,
            scale: 1,
            context: context,
            threeRender: function () {
                this.graphicList.forEach(function (item) {
                    var graphic = item.graphic;
                    if (graphic.renderer) {
                        var cvs = item.canvas;
                        var ctx = cvs.getContext('2d');
                        ctx.clearRect(0, 0, cvs.width, cvs.height);
                        this.webglContext.clear(this.webglContext.COLOR_BUFFER_BIT);
                        graphic.renderer.draw(this.view, graphic, graphic.feature.geometry,graphic.symbol);
                        ctx.drawImage(this.canvas, 0, 0);
                        this.callBack({
                            canvas:cvs,
                            container:item.container
                        });
                    }
                }.bind(this));
            }.bind(this)
        };
        var viewpoint = new Viewpoint(this.view.width, this.view.height, 0, 0, 0, 0, 0, this.view);
        this.view.viewpoint = viewpoint;
        viewpoint.center = [this.size.width * 0.5, this.size.height * 0.5];
        viewpoint.resolution = 1;
        viewpoint.calcMatrix(false);
    }

    FontDemoTemplate.prototype.clear = function() {
        this.graphicList = [];
    }

    FontDemoTemplate.prototype.initFontSymbol = function (params, callBack) {
        this.callBack = callBack;
        this.symbol = params.symbol;

        var geometry = new Point(this.size.width * 0.5, this.size.height * 0.5);
        var fontSymbol = new FontSymbol(this.symbol);
        var graphic = new Graphic({
            feature: new Feature({
                attributes: null,
                geometry: geometry
            }),
            symbol: fontSymbol
        });
        var cvs = document.createElement("canvas");
        cvs.setAttribute("id",`canvas_${new Date().getTime()}`);
        cvs.width = this.size.width;
        cvs.height = this.size.height;
        cvs.graphic = this.symbol["text"];
        this.graphicList.push({
            graphic: graphic,
            canvas: cvs,
            container:params.container
        });

        var renderer = new FontRenderer();
        if( renderer !== null) {
            renderer.add(this.view, graphic, geometry, fontSymbol);
            graphic.renderer = renderer;
            this.view.threeRender();
        }
    };
    
    return FontDemoTemplate;
});