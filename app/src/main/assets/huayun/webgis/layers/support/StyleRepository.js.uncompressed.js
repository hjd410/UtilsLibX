define("com/huayun/webgis/layers/support/StyleRepository", [
    "./StyleLayer"
],function (StyleLayer) {
    function StyleRepository(b, c) {
        this._layerByName = {};
        this.styleJSON = b;
        this.version = parseFloat(b.version);
        this.sprite = c ? c.spriteUrl:b.sprite;
        this.glyphs = c ? c.glyphsUrl: b.glyphs;
        this.layers = b.layers || [];
        this.layerFamily = {};
        // this.layers.map(StyleRepository._create);
        b = this.layers.length;
        for (var i = 0; i < b; i++) {
            this.layers[i] = StyleRepository._create(this.layers[i], i, b);
        }
        var sourceLayer;
        for (c = 0; c < this.layers.length; c++) {
            b = this.layers[c];
            sourceLayer = b.sourceLayer.toLowerCase();
            if (!this.layerFamily[sourceLayer]) {
                this.layerFamily[sourceLayer] = [];
            }
            this.layerFamily[sourceLayer].push(b);
            this._layerByName[b.id.toLowerCase()] = b;
        }
        this._identifyRefLayers();
    }
    StyleRepository.prototype.getStyleLayerId = function (b) {
        return b >= this.layers.length ? null : this.layers[b].id;
    };
    StyleRepository.prototype.getLayoutProperties = function (b) {
        return (b = this._layerByName[b.toLowerCase()]) ? b.layout : null;
    };
    StyleRepository.prototype.getPaintProperties = function (b) {
        return (b = this._layerByName[b.toLowerCase()]) ? b.paint : null;
    };
    StyleRepository.prototype.setPaintProperties = function (b, c) {
        b = this._layerByName[b.toLowerCase()];
        if (!b) return "";
        var n = this.layers.indexOf(b);
        this.styleJSON.layers[n].paint = c;
        c = a._recreateLayer({
            id: b.id,
            type: b.typeName,
            source: b.source,
            sourceLayer: b["source-layer"],
            minzoom: b.minzoom,
            maxzoom: b.maxzoom,
            filter: b.filter,
            layout: b.layout,
            paint: c
        }, b);
        this.layers[n] = c;
        this._layerByName[b.id.toLowerCase()] = c;
        return b.id
    };
    StyleRepository.prototype.setLayoutProperties = function (b, c) {
        b = this._layerByName[b.toLowerCase()];
        if (!b) return "";
        var n = this.layers.indexOf(b);
        this.styleJSON.layers[n].layout = c;
        c = a._recreateLayer({
            id: b.id,
            type: b.typeName,
            source: b.source,
            sourceLayer: b["source-layer"],
            minzoom: b.minzoom,
            maxzoom: b.maxzoom,
            filter: b.filter,
            layout: c,
            paint: b.paint
        }, b);
        this.layers[n] = c;
        this._layerByName[b.id.toLowerCase()] = c;
        return b.id
    };
    StyleRepository.prototype._identifyRefLayers = function () {
        for (var b = [], c = [], a = 0, p = 0, h = this.layers; p < h.length; p++) {
            var d = h[p];
            if (1 === d.type) {
                var f = d, e = d.sourceLayer, e = e + ("|" + JSON.stringify(d.minzoom)),
                    e = e + ("|" + JSON.stringify(d.maxzoom)),
                    e = e + ("|" + JSON.stringify(d.filter));
                if (f.hasDataDrivenFill || f.hasDataDrivenOutline) e += "|" + JSON.stringify(a);
                b.push({key: e, layer: d})
            }
            2 === d.type && (f = d, e = d.sourceLayer, e += "|" + JSON.stringify(d.minzoom), e += "|" + JSON.stringify(d.maxzoom), e += "|" + JSON.stringify(d.filter), e += "|" + JSON.stringify(d.layout && d.layout["line-cap"]), e += "|" + JSON.stringify(d.layout && d.layout["line-join"]), f.hasDataDrivenLine && (e += "|" + JSON.stringify(a)), c.push({
                key: e,
                layer: d
            }));
            ++a
        }
        this._assignRefLayers(b);
        this._assignRefLayers(c)
    };
    StyleRepository.prototype._assignRefLayers = function (b) {
        b.sort(function (d, b) {
            return d.key < b.key ? -1 : d.key > b.key ? 1 : 0
        });
        for (var c, a, p = b.length, h = 0; h < p; h++) {
            var d = b[h];
            if (d.key === c) d.layer.refLayerId = a; else if (c = d.key, a = d.layer.id, 1 === d.layer.type && !d.layer.getPaintProperty("fill-outline-color")) for (var f = h + 1; f < p; f++) {
                var e = b[f];
                if (e.key === c) {
                    if (e.layer.getPaintProperty("fill-outline-color")) {
                        b[h] = e;
                        b[f] = d;
                        a = e.layer.id;
                        break
                    }
                } else break
            }
        }
    };

    StyleRepository._create = function (b, a, n) {
        a = 1 - 1/(n + 1) * (1 + a);
        switch (b.type) {
            case "background":
                return new StyleLayer.BackgroundStyleLayer(0, b, a);
            case "fill":
                return new StyleLayer.FillStyleLayer(1, b, a);
            case "line":
                return new StyleLayer.LineStyleLayer(2, b, a);
            case "symbol":
                return new StyleLayer.SymbolStyleLayer(3, b, a);
        }
        throw new Error("Unknown vector tile layer");
    };

    StyleRepository._recreateLayer = function (b, a) {
        switch (b.type) {
            case "background":
                return new StyleLayer.BackgroundStyleLayer(0, b, a.z);
            case "fill":
                return new StyleLayer.FillStyleLayer(1, b, a.z);
            case "line":
                return new StyleLayer.LineStyleLayer(2,
                    b, a.z);
            case "symbol":
                return new StyleLayer.SymbolStyleLayer(3, b, a.z);
            case "raster":
                throw Error("Unsupported vector tile raster layer");
        }
    };
    return StyleRepository;
});