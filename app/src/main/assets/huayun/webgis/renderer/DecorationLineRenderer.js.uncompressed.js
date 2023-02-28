define("com/huayun/webgis/renderer/DecorationLineRenderer", [
    "./Renderer",
    "./LineRenderer",
    "./FontRenderer",
    "./RectRenderer",
    "../geometry/Point",
    "../utils/MathUtils"
], function (Renderer, LineRenderer, FontRenderer, RectRenderer, Point, MathUtils) {
    function DecorationLineRenderer() {
        // debugger;
    }

    if (Renderer) DecorationLineRenderer.__proto__ = Renderer;
    DecorationLineRenderer.prototype = Object.create(Renderer && Renderer.prototype);
    DecorationLineRenderer.prototype.constructor = DecorationLineRenderer;

    DecorationLineRenderer.prototype.add = function (view, graphic, geometry, symbol, index) {
        if (!index) index = 0;
        var sP = view.geometryToScreen(geometry.path[0][0].x, geometry.path[0][0].y);
        var eP = view.geometryToScreen(geometry.path[0][1].x, geometry.path[0][1].y);
        var dx = sP.x - eP.x;
        var dy = sP.y - eP.y;
        // console.log(view.scale, symbol.minScale);
        var markerSize = Math.sqrt(dx * dx + dy * dy) * symbol.minScale / view.scale;
        // debugger
        if (!this.renderers) {
            this.renderers = [];
            this.renderers.push(new LineRenderer());
            for (var i = 0; i < symbol.symbols.length; i++) {
                var s = symbol.symbols[i];
                s.markerSize = symbol.adaptratio === 0 ? markerSize : symbol.adaptratio * markerSize;
                switch (s.type) {
                    case "fontSymbol":
                        this.renderers.push(new FontRenderer());
                        break;
                    case "rect":
                        this.renderers.push(new RectRenderer());
                        break;
                }
            }
        } else {
            for (var j = 0; j < symbol.symbols.length; j++) {
                var aSymbol = symbol.symbols[j];
                aSymbol.markerSize = symbol.adaptratio === 0 ? undefined : symbol.adaptratio * markerSize;
            }
        }

        this.renderers[0].add(view, graphic, geometry, symbol.lineSymbol, index);

        var paths = geometry.path[0];
        var markerPoint = MathUtils.calculateCenterOfLine(paths);
        markerPoint = markerPoint.center;
        graphic.rotation = paths[0].radian(paths[1]);  // 线方向角度
        graphic.markerPoint = markerPoint;

        for (j = 0; j < symbol.symbols.length; j++) {
            s = symbol.symbols[j];
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
            this.renderers[j + 1].add(view, graphic, markerPoint, s, index + j + 1);
        }
    };

    DecorationLineRenderer.prototype.draw = function (view, graphic, geometry, symbol, layerView, index) {
        if (!index) index = 0;
        this.renderers[0].draw(view, graphic, geometry, symbol.lineSymbol, layerView, index);
        // debugger;
        for (var i = symbol.symbols.length - 1; i > -1; i--) {
            var s = symbol.symbols[i];
            s.setRadian(graphic.markerAngle);
            this.renderers[i + 1].draw(view, graphic, geometry, s, layerView, i + index + 1);
        }
    };

    DecorationLineRenderer.prototype.drawGlow = function (view, graphic, geometry, symbol, layerView, index) {
        if (!index) index = 0;
        this.renderers[0].drawGlow(view, graphic, geometry, symbol.lineSymbol, layerView, index);
        // debugger;
        for (var i = symbol.symbols.length - 1; i > -1; i--) {
            var s = symbol.symbols[i];
            s.setRadian(graphic.markerAngle);
            this.renderers[i + 1].drawGlow(view, graphic, geometry, s, layerView, i + index + 1);
        }
    };

    DecorationLineRenderer.prototype.calculateExtent = function (view, graphic, geometry, symbol, result, index) {
        if (!index) index = 0;
        this.renderers[0].calculateExtent(view, graphic, geometry, symbol.lineSymbol, result, index);
        for (var i = 0; i < symbol.symbols.length; i++) {
            var s = symbol.symbols[i];
            this.renderers[i + 1].calculateExtent(view, graphic, graphic.markerPoint, s, result, i + index + 1);
        }
    };

    return DecorationLineRenderer;
})
