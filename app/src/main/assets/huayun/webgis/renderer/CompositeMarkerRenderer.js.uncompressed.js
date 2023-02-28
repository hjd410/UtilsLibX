define("com/huayun/webgis/renderer/CompositeMarkerRenderer", [
    "./CircleRenderer",
    "./FontRenderer",
    "./TwoCoiltransformerRenderer",
    "./ThreeCoiltransformerRenderer",
    "./RectRenderer",
    "./AutotransformerRenderer"
], function (CircleRenderer, FontRenderer, TwoCoiltransformerRenderer, ThreeCoiltransformerRenderer, RectRenderer, AutotransformerRenderer) {
    function CompositeMarkerRenderer() {
        this.renderers = [];
    }

    CompositeMarkerRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        if (this.renderers.length === 0) {
            for (var j = 0; j < symbol.symbols.length; j++) {
                var aSymbol = symbol.symbols[j];
                switch (aSymbol.type) {
                    case "twoCoiltransformer":
                        this.renderers.push(new TwoCoiltransformerRenderer());
                        break;
                    case "fontSymbol":
                        this.renderers.push(new FontRenderer());
                        break;
                    case "circle":
                        this.renderers.push(new CircleRenderer());
                        break;
                    case "threeCoiltransformer":
                        this.renderers.push(new ThreeCoiltransformerRenderer());
                        break;
                    case "rect":
                        this.renderers.push(new RectRenderer());
                        break;
                    case "autotransformer":
                        this.renderers.push(new AutotransformerRenderer());
                        break;
                }
            }
        }
        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = graphic.symbol.symbols[i];
            var tempS = symbol.symbols[i];
            if (symbol.minScale) {
                s.minScale = symbol.minScale;
                tempS.minScale = symbol.minScale;
            }
            if (symbol.maxScale) {
                s.maxScale = symbol.maxScale;
                tempS.maxScale = symbol.maxScale;
            }
            if (symbol.isFixed !== undefined) {
                s.isFixed = symbol.isFixed;
                tempS.isFixed = symbol.isFixed;
            }
            if (symbol.fixed) {
                s.fixed = symbol.fixed;
                tempS.fixed = symbol.fixed;
            }
            if (symbol.markerSize) {
                s.markerSize = symbol.markerSize;
            }
            this.renderers[i].add(view, graphic, geometry, s, i);
        }
    };

    CompositeMarkerRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView) {
        // debugger;
        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = symbol.symbols[i];
            this.renderers[i].draw(view, graphic, geometry, s, layerView, i);
        }
    };

    CompositeMarkerRenderer.prototype.drawGlow = function(view, graphic, geometry, symbol, layerView) {
        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = symbol.symbols[i];
            this.renderers[i].drawGlow(view, graphic, geometry, s, layerView, i);
        }
    };

    CompositeMarkerRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result) {
        var extents = [];
        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = symbol.symbols[i];
            this.renderers[i].calculateExtent(view, graphic, geometry, s, extents, i);
        }
        var xmin = Infinity,
            ymin = Infinity,
            xmax = -Infinity,
            ymax = -Infinity;
        extents.forEach(function (item) {
            if (item.minX < xmin) {
                xmin = item.minX;
            }
            if (item.minY < ymin) {
                ymin = item.minY;
            }
            if (item.maxX > xmax) {
                xmax = item.maxX;
            }
            if (item.maxY > ymax) {
                ymax = item.maxY;
            }
            result.push(item);
        });
        graphic.extent = {
            xmin: xmin,
            ymin: ymin,
            xmax: xmax,
            ymax: ymax
        };
    };

    return CompositeMarkerRenderer;
});
