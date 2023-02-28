define("com/huayun/webgis/layers/support/StyleLayerBackup", [
    "require",
    "exports",
    "../../core/extendsHelper",
    "./StyleDefinition",
    "./Filter",
    "./StyleProperty"
],function (e, f, extendsHelper, g, Filter, StyleProperty) {
    Object.defineProperty(f, "__esModule", {value: !0});
    e = function () {
        function StyleLayer(type, layer, index) {
            this.type = type;
            this.typeName = layer.type;
            this.id = layer.id;
            this.source = layer.source;
            this.sourceLayer = layer["source-layer"];
            this.minzoom = layer.minzoom;
            this.maxzoom = layer.maxzoom;
            this.filter = layer.filter;
            this.layout = layer.layout;
            this.paint = layer.paint;
            this.z = index;
            switch (type) {
                case 0:
                    this._layoutDefinition = g.StyleDefinition.backgroundLayoutDefinition;
                    this._paintDefinition = g.StyleDefinition.backgroundPaintDefinition;
                    break;
                case 1:
                    this._layoutDefinition = g.StyleDefinition.fillLayoutDefinition;
                    this._paintDefinition = g.StyleDefinition.fillPaintDefinition;
                    break;
                case 2:
                    this._layoutDefinition = g.StyleDefinition.lineLayoutDefinition;
                    this._paintDefinition = g.StyleDefinition.linePaintDefinition;
                    break;
                case 3:
                    this._layoutDefinition = g.StyleDefinition.symbolLayoutDefinition;
                    this._paintDefinition = g.StyleDefinition.symbolPaintDefinition;
                    break;
                case 4:
                    this._layoutDefinition = g.StyleDefinition.circleLayoutDefinition;
                    this._paintDefinition = g.StyleDefinition.circlePaintDefinition;
            }
            this._layoutProperties = this._parseLayout(this.layout);
            this._paintProperties = this._parsePaint(this.paint);
        }

        StyleLayer.prototype.getFeatureFilter = function () {
            return void 0 !== this._featureFilter ? this._featureFilter : this._featureFilter = Filter.createFilter(this.filter)
        };
        StyleLayer.prototype.getLayoutProperty = function (c) {
            var b = this._layoutProperties;
            if (b) return b[c]
        };
        StyleLayer.prototype.getPaintProperty = function (c) {
            var b = this._paintProperties;
            if (b) return b[c]
        };
        StyleLayer.prototype.getLayoutValue = function (c, b, a) {
            var d, e = this._layoutProperties;
            e && (e = e[c]) && (d = e.getValue(b, a));
            c = this._layoutDefinition[c];
            void 0 === d && (d = c["default"]);
            "enum" === c.type && (d = c.values.indexOf(d));
            return d
        };
        StyleLayer.prototype.getPaintValue = function (c, b, a) {
            var d, e = this._paintProperties;
            e && (e = e[c]) && (d = e.getValue(b, a));
            c = this._paintDefinition[c];
            void 0 === d && (d = c["default"]);
            "enum" === c.type && (d = c.values.indexOf(d));
            return d
        };
        StyleLayer.prototype._parseLayout = function (c) {
            var b = {}, a;
            for (a in c) {
                var d = this._layoutDefinition[a];
                d && (b[a] = new StyleProperty(a, d, c[a]))
            }
            return b
        };
        StyleLayer.prototype._parsePaint = function (c) {
            var b = {}, a;
            for (a in c) {
                var d = this._paintDefinition[a];
                d && (b[a] = new StyleProperty(a, d, c[a]))
            }
            return b
        };
        return StyleLayer
    }();
    f.StyleLayer = e;
    var styleLayer = function (d) {
        function c(b, a, c) {
            return d.call(this, b, a, c) || this
        }
        extendsHelper(c, d);
        return c
    }(e);
    f.BackgroundStyleLayer = styleLayer;
    styleLayer = function (d) {
        function c(b, a, c) {
            b = d.call(this, b, a, c) || this;
            a = b.getPaintProperty("fill-color");
            b.hasDataDrivenColor = a ? a.isDataDriven : !1;
            a = b.getPaintProperty("fill-opacity");
            b.hasDataDrivenOpacity = a ? a.isDataDriven : !1;
            b.hasDataDrivenFill = b.hasDataDrivenColor || b.hasDataDrivenOpacity;
            a = b.getPaintProperty("fill-outline-color");
            b.outlineUsesFillColor = !a;
            b.hasDataDrivenOutlineColor = a ? a.isDataDriven : !1;
            b.hasDataDrivenOutline = (a ? b.hasDataDrivenOutlineColor : b.hasDataDrivenColor) || b.hasDataDrivenOpacity;
            return b
        }
        extendsHelper(c, d);
        return c
    }(e);
    f.FillStyleLayer = styleLayer;
    styleLayer = function (d) {
        function c(b, a, c) {
            b = d.call(this, b, a, c) || this;
            a = b.getPaintProperty("line-color");
            b.hasDataDrivenColor = a ? a.isDataDriven : !1;
            a = b.getPaintProperty("line-opacity");
            b.hasDataDrivenOpacity = a ? a.isDataDriven : !1;
            a = b.getPaintProperty("line-width");
            b.hasDataDrivenWidth = a ? a.isDataDriven : !1;
            b.hasDataDrivenLine = b.hasDataDrivenColor || b.hasDataDrivenOpacity || b.hasDataDrivenWidth;
            return b
        }

        extendsHelper(c, d);
        return c
    }(e);
    f.LineStyleLayer = styleLayer;
    styleLayer = function (d) {
        function c(b, a, c) {
            b = d.call(this, b, a, c) || this;
            a = b.getPaintProperty("icon-color");
            b.hasDataDrivenIconColor = a ? a.isDataDriven : !1;
            a = b.getPaintProperty("icon-opacity");
            b.hasDataDrivenIconOpacity = a ? a.isDataDriven : !1;
            a = b.getLayoutProperty("icon-size");
            b.hasDataDrivenIconSize = a ? a.isDataDriven : !1;
            b.hasDataDrivenIcon = b.hasDataDrivenIconColor || b.hasDataDrivenIconOpacity || b.hasDataDrivenIconSize;
            a = b.getPaintProperty("text-color");
            b.hasDataDrivenTextColor = a ? a.isDataDriven : !1;
            a = b.getPaintProperty("text-opacity");
            b.hasDataDrivenTextOpacity = a ? a.isDataDriven : !1;
            a = b.getLayoutProperty("text-size");
            b.hasDataDrivenTextSize = a ? a.isDataDriven : !1;
            b.hasDataDrivenText = b.hasDataDrivenTextColor ||
                b.hasDataDrivenTextOpacity || b.hasDataDrivenTextSize;
            return b
        }

        extendsHelper(c, d);
        return c
    }(e);
    f.SymbolStyleLayer = styleLayer;
    e = function (d) {
        function c(b, a, c) {
            b = d.call(this, b, a, c) || this;
            a = b.getPaintProperty("circle-radius");
            b.hasDataDrivenRadius = a ? a.isDataDriven : !1;
            a = b.getPaintProperty("circle-color");
            b.hasDataDrivenColor = a ? a.isDataDriven : !1;
            a = b.getPaintProperty("circle-opacity");
            b.hasDataDrivenOpacity = a ? a.isDataDriven : !1;
            a = b.getPaintProperty("circle-stroke-width");
            b.hasDataDrivenStrokeWidth = a ? a.isDataDriven : !1;
            a = b.getPaintProperty("circle-stroke-color");
            b.hasDataDrivenStrokeColor = a ? a.isDataDriven : !1;
            a = b.getPaintProperty("circle-stroke-opacity");
            b.hasDataDrivenStrokeOpacity = a ? a.isDataDriven : !1;
            a = b.getPaintProperty("circle-blur");
            b.hasDataDrivenBlur = a ? a.isDataDriven : !1;
            return b
        }

        extendsHelper(c, d);
        return c
    }(e);
    f.CircleStyleLayer = e;
    e = function () {
        return function (d, c, b) {
            this.cap = d.getLayoutValue("line-cap", c, b);
            this.join = d.getLayoutValue("line-join", c, b);
            this.miterLimit = d.getLayoutValue("line-miter-limit", c, b);
            this.roundLimit = d.getLayoutValue("line-round-limit", c,
                b)
        }
    }();
    f.LineLayout = e;
    e = function () {
        return function (d, c, b, a) {
            this.allowOverlap = d.getLayoutValue("icon-allow-overlap", c, a);
            this.ignorePlacement = d.getLayoutValue("icon-ignore-placement", c, a);
            this.optional = d.getLayoutValue("icon-optional", c, a);
            this.rotationAlignment = d.getLayoutValue("icon-rotation-alignment", c, a);
            this.size = d.getLayoutValue("icon-size", c, a);
            this.rotate = d.getLayoutValue("icon-rotate", c, a);
            this.padding = d.getLayoutValue("icon-padding", c, a);
            this.keepUpright = d.getLayoutValue("icon-keep-upright",
                c, a);
            this.offset = d.getLayoutValue("icon-offset", c, a);
            2 === this.rotationAlignment && (this.rotationAlignment = b ? 0 : 1)
        }
    }();
    f.IconLayout = e;
    e = function () {
        return function (d, c, b, a) {
            this.allowOverlap = d.getLayoutValue("text-allow-overlap", c, a);
            this.ignorePlacement = d.getLayoutValue("text-ignore-placement", c, a);
            this.optional = d.getLayoutValue("text-optional", c, a);
            this.rotationAlignment = d.getLayoutValue("text-rotation-alignment", c, a);
            this.fontArray = d.getLayoutValue("text-font", c, a);
            this.maxWidth = d.getLayoutValue("text-max-width",
                c, a);
            this.lineHeight = d.getLayoutValue("text-line-height", c, a);
            this.letterSpacing = d.getLayoutValue("text-letter-spacing", c, a);
            this.justify = d.getLayoutValue("text-justify", c, a);
            this.anchor = d.getLayoutValue("text-anchor", c, a);
            this.maxAngle = d.getLayoutValue("text-max-angle", c, a);
            this.size = d.getLayoutValue("text-size", c, a);
            this.rotate = d.getLayoutValue("text-rotate", c, a);
            this.padding = d.getLayoutValue("text-padding", c, a);
            this.keepUpright = d.getLayoutValue("text-keep-upright", c, a);
            this.transform = d.getLayoutValue("text-transform",
                c, a);
            this.offset = d.getLayoutValue("text-offset", c, a);
            2 === this.rotationAlignment && (this.rotationAlignment = b ? 0 : 1)
        }
    }();
    f.TextLayout = e
});