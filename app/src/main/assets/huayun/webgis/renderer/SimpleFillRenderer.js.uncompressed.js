define("com/huayun/webgis/renderer/SimpleFillRenderer", [
    "./Renderer",
    "./LineRenderer",
    "./FillRenderer"
], function (Renderer, LineRenderer, FillRenderer) {
    function SimpleFillRenderer() {
        this.lineRenderer = new LineRenderer();
        this.fillRenderer = new FillRenderer();
    }

    if (Renderer) SimpleFillRenderer.__proto__ = Renderer;
    SimpleFillRenderer.prototype = Object.create(Renderer && Renderer.prototype);
    SimpleFillRenderer.prototype.constructor = SimpleFillRenderer;

    SimpleFillRenderer.prototype.add = function (view, graphic, geometry, symbol) {
        debugger;
        if (symbol.lineSymbol) {
            if (symbol.minScale) {
                symbol.lineSymbol.minScale = symbol.minScale;
                symbol.fillSymbol.minScale = symbol.minScale;
            }
            if (symbol.maxScale) {
                symbol.lineSymbol.maxScale = symbol.maxScale;
                symbol.fillSymbol.maxScale = symbol.maxScale;
            }
            if (symbol.isFixed !== undefined) {
                symbol.lineSymbol.isFixed = symbol.isFixed;
                symbol.fillSymbol.isFixed = symbol.isFixed;
            }
            if (symbol.fixed) {
                symbol.lineSymbol.fixed = symbol.fixed;
                symbol.fillSymbol.fixed = symbol.fixed;
            }
        } else {
            if (symbol.minScale) {
                symbol.fillSymbol.minScale = symbol.minScale;
            }
            if (symbol.maxScale) {
                symbol.fillSymbol.maxScale = symbol.maxScale;
            }
            if (symbol.isFixed !== undefined) {
                symbol.fillSymbol.isFixed = symbol.isFixed;
            }
            if (symbol.fixed) {
                symbol.fillSymbol.fixed = symbol.fixed;
            }
        }
        if (symbol.lineSymbol) {
            this.lineRenderer.add(view, graphic, geometry, symbol.lineSymbol);
        }
        this.fillRenderer.add(view, graphic, geometry, symbol.fillSymbol);
    };

    SimpleFillRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView) {
        var index = 0;
        if (symbol.lineSymbol) {
            this.lineRenderer.draw(view, graphic, geometry, symbol.lineSymbol, layerView, index);
            index++;
        }
        this.fillRenderer.draw(view, graphic, geometry, symbol.fillSymbol, layerView, index);
    };

    SimpleFillRenderer.prototype.drawGlow = function (view, graphic, geometry, symbol, layerView) {
        var index = 0;
        if (symbol.lineSymbol) {
            this.lineRenderer.drawGlow(view, graphic, geometry, symbol.lineSymbol, layerView, index);
            index++;
        }
        this.fillRenderer.drawGlow(view, graphic, geometry, symbol.fillSymbol, layerView, index);
    };

    SimpleFillRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result, index) {
        if (!index) index = 0;
        if (symbol.lineSymbol) {
            this.lineRenderer.calculateExtent(view, graphic, geometry, symbol.lineSymbol, result, index);
            index++;
        }
        this.fillRenderer.calculateExtent(view, graphic, geometry, symbol.fillSymbol, result, index);
    };

    return SimpleFillRenderer;
})
