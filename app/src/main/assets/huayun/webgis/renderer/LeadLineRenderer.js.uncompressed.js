define("com/huayun/webgis/renderer/LeadLineRenderer", [
    "./Renderer",
    "./LineRenderer",
    "./FontRenderer",
    "./RectRenderer",
    "../utils/MathUtils"
], function (Renderer, LineRenderer, FontRenderer, RectRenderer, MathUtils) {
    function LeadLineRenderer(LineRenderer) {
        this.markerSize = null;
        this.markerRotation = null;
        this.markerScaleFactor = null;
        this.renderers = {};
    }

    if (Renderer) LeadLineRenderer.__proto__ = Renderer;
    LeadLineRenderer.prototype = Object.create(Renderer && Renderer.prototype);
    LeadLineRenderer.prototype.constructor = LeadLineRenderer;

    LeadLineRenderer.prototype.add = function (view, graphic, geometry, symbol, index) {
        this.markerSize = symbol.markerSize;
        this.markerRotation = graphic.markerRotation;
        this.markerScaleFactor = graphic.markerScaleFactor;
        if (!index) index = 0;
        if (!this.renderers.hasOwnProperty('lineSymbol')) {
            this.renderers['lineSymbol'] = new LineRenderer();
        }

        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = symbol.symbols[i];
            switch (s.type) {
                case "fontSymbol":
                    if (!this.renderers.hasOwnProperty('fontSymbol')) {
                        this.renderers['fontSymbol'] = new FontRenderer();
                    }
                    break;
                case "rect":
                    if (!this.renderers.hasOwnProperty('rect')) {
                        this.renderers['rect'] = new RectRenderer();
                    }
                    break;
            }
        }
        this.renderers['lineSymbol'].add(view, graphic, geometry, symbol.lineSymbol, index);
        var paths = geometry.path[0];
        var markerPosition = paths[1];
        graphic.rotation = graphic.markerRotation;
        graphic.markerPoint = markerPosition;

        for (i = 0; i < symbol.symbols.length; i++) {
            s = symbol.symbols[i];
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
            this.renderers[s.type].add(view, graphic, markerPosition, s, index + i + 1);
        }
    };

    LeadLineRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index) {
        if (!index) index = 0;
        this.renderers['lineSymbol'].draw(view, graphic, geometry, symbol.lineSymbol, layerView, index);
        for (var i = symbol.symbols.length - 1; i >= 0; i--) {
            var s = symbol.symbols[i];
            if (s.hasOwnProperty('fontFamily') && s.fontFamily !== 'FontSymbol') {
                s.markerSize = undefined;
            }
            s.setRadian(graphic.rotation);
            this.renderers[s.type].draw(view, graphic, geometry, s, layerView, i + index + 1);
        }
    };

    LeadLineRenderer.prototype.drawGlow = function (view, graphic, geometry, symbol, layerView, index) {
        if (!index) index = 0;
        this.renderers['lineSymbol'].drawGlow(view, graphic, geometry, symbol.lineSymbol, layerView, index);
        for (var i = symbol.symbols.length - 1; i >= 0; i--) {
            var s = symbol.symbols[i];
            if (s.hasOwnProperty('fontFamily') && s.fontFamily !== 'FontSymbol') {
                s.markerSize = undefined;
            }
            s.setRadian(graphic.rotation);
            this.renderers[s.type].drawGlow(view, graphic, geometry, s, layerView, i + index + 1);
        }
    };

    LeadLineRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result, index) {
        if (!index) index = 0;
        this.renderers['lineSymbol'].calculateExtent(view, graphic, geometry, symbol.lineSymbol, result, index);
        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = symbol.symbols[i];
            this.renderers[s.type].calculateExtent(view, graphic, graphic.markerPoint, s, result, i + index + 1);
        }
    };

    return LeadLineRenderer;
});
