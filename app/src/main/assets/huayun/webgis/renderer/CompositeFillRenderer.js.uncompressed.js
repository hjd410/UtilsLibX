define("com/huayun/webgis/renderer/CompositeFillRenderer", [
    "./SimpleFillRenderer"
], function (SimpleFillRenderer) {
    function CompositeFillRenderer() {
        this.renderers = null;
    }

    CompositeFillRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        // debugger;
        if (!this.renderers) {
            this.renderers = [];
            for (var i = 0; i < symbol.symbols.length; i++) {
                var s = symbol.symbols[i];
                switch (s.type) {
                    case "simpleFill":
                        this.renderers.push(new SimpleFillRenderer());
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
            this.renderers[i].add(view, graphic, geometry, s);
        }
    };

    CompositeFillRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView) {
        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = symbol.symbols[i];
            this.renderers[i].draw(view, graphic, geometry, s, layerView, i);
        }
    };

    CompositeFillRenderer.prototype.drawGlow = function (view, graphic, geometry, symbol, layerView) {
        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = symbol.symbols[i];
            this.renderers[i].drawGlow(view, graphic, geometry, s, layerView, i);
        }
    };

    CompositeFillRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result) {
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
    }

    return CompositeFillRenderer;
});
