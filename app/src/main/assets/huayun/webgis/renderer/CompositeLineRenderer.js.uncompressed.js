define("com/huayun/webgis/renderer/CompositeLineRenderer", [
    "./LineRenderer",
    "./DecorationLineRenderer",
    "./LeadLineRenderer",
    "./MultileadLineRenderer"
], function (LineRenderer, DecorationLineRenderer, LeadLineRenderer, MultiLeadLineRenderer) {
    function CompositeLineRenderer() {
        this.renderers = null;
    }

    CompositeLineRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        if (!this.renderers) {
            this.renderers = [];
            for (var i = 0; i < symbol.symbols.length; i++) {
                var s = symbol.symbols[i];
                switch (s.type) {
                    case "line":
                        this.renderers.push(new LineRenderer());
                        break;
                    case "decorationLine":
                        this.renderers.push(new DecorationLineRenderer());
                        break;
                    case "leadLine":
                        this.renderers.push(new LeadLineRenderer());
                        break;
                    case "multiLeadLine":
                        this.renderers.push(new MultiLeadLineRenderer());
                        break;
                }
            }
        }
        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = symbol.symbols[i];
            if (symbol.minScale) {
                s.minScale = symbol.minScale;
            }
            if (symbol.maxScale) {
                s.maxScale = symbol.maxScale;
            }
            if (symbol.isFixed !== undefined) {
                s.isFixed = symbol.isFixed;
            }
            if (symbol.fixed) {
                s.fixed = symbol.fixed;
            }
            if (symbol.markerSize) {
                s.markerSize = symbol.markerSize;
            }
            this.renderers[i].add(view, graphic, geometry, s, i);
        }
    };

    CompositeLineRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView) {
        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = symbol.symbols[i];
            this.renderers[i].draw(view, graphic, geometry, s, layerView, i);
        }
    };

    CompositeLineRenderer.prototype.drawGlow = function(view, graphic, geometry, symbol, layerView) {
        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = symbol.symbols[i];
            this.renderers[i].drawGlow(view, graphic, geometry, s, layerView, i);
        }
    };

    CompositeLineRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result) {
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
    return CompositeLineRenderer;
});
