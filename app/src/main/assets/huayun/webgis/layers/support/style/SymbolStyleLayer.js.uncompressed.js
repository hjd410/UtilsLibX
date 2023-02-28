define("com/huayun/webgis/layers/support/style/SymbolStyleLayer", [
  "./StyleLayer",
  "./Properties",
  "./DataConstantProperty",
  "./DataDrivenProperty",
  "./spec",
  "../../../data/bucket/SymbolBucket",
  "../expression/expressions"
], function (StyleLayer, Properties, DataConstantProperty, DataDrivenProperty, spec, SymbolBucket, expressions) {

  function resolveTokens(properties, text) {
    return text.replace(/{([^{}]+)}/g, function (match, key) {
      return key in properties ? String(properties[key]) : '';
    });
  }

  var layout$5 = new Properties({
    "symbol-placement": new DataConstantProperty(spec["layout_symbol"]["symbol-placement"]),
    "symbol-spacing": new DataConstantProperty(spec["layout_symbol"]["symbol-spacing"]),
    "symbol-avoid-edges": new DataConstantProperty(spec["layout_symbol"]["symbol-avoid-edges"]),
    "symbol-sort-key": new DataDrivenProperty(spec["layout_symbol"]["symbol-sort-key"]),
    "symbol-z-order": new DataConstantProperty(spec["layout_symbol"]["symbol-z-order"]),
    "icon-allow-overlap": new DataConstantProperty(spec["layout_symbol"]["icon-allow-overlap"]),
    "icon-ignore-placement": new DataConstantProperty(spec["layout_symbol"]["icon-ignore-placement"]),
    "icon-optional": new DataConstantProperty(spec["layout_symbol"]["icon-optional"]),
    "icon-rotation-alignment": new DataConstantProperty(spec["layout_symbol"]["icon-rotation-alignment"]),
    "icon-size": new DataDrivenProperty(spec["layout_symbol"]["icon-size"]),
    "icon-text-fit": new DataConstantProperty(spec["layout_symbol"]["icon-text-fit"]),
    "icon-text-fit-padding": new DataConstantProperty(spec["layout_symbol"]["icon-text-fit-padding"]),
    "icon-image": new DataDrivenProperty(spec["layout_symbol"]["icon-image"]),
    "icon-rotate": new DataDrivenProperty(spec["layout_symbol"]["icon-rotate"]),
    "icon-padding": new DataConstantProperty(spec["layout_symbol"]["icon-padding"]),
    "icon-keep-upright": new DataConstantProperty(spec["layout_symbol"]["icon-keep-upright"]),
    "icon-offset": new DataDrivenProperty(spec["layout_symbol"]["icon-offset"]),
    "icon-anchor": new DataDrivenProperty(spec["layout_symbol"]["icon-anchor"]),
    "icon-pitch-alignment": new DataConstantProperty(spec["layout_symbol"]["icon-pitch-alignment"]),
    "text-pitch-alignment": new DataConstantProperty(spec["layout_symbol"]["text-pitch-alignment"]),
    "text-rotation-alignment": new DataConstantProperty(spec["layout_symbol"]["text-rotation-alignment"]),
    "text-field": new DataDrivenProperty(spec["layout_symbol"]["text-field"]),
    "text-font": new DataDrivenProperty(spec["layout_symbol"]["text-font"]),
    "text-size": new DataDrivenProperty(spec["layout_symbol"]["text-size"]),
    "text-max-width": new DataDrivenProperty(spec["layout_symbol"]["text-max-width"]),
    "text-line-height": new DataConstantProperty(spec["layout_symbol"]["text-line-height"]),
    "text-letter-spacing": new DataDrivenProperty(spec["layout_symbol"]["text-letter-spacing"]),
    "text-justify": new DataDrivenProperty(spec["layout_symbol"]["text-justify"]),
    "text-radial-offset": new DataDrivenProperty(spec["layout_symbol"]["text-radial-offset"]),
    "text-variable-anchor": new DataConstantProperty(spec["layout_symbol"]["text-variable-anchor"]),
    "text-anchor": new DataDrivenProperty(spec["layout_symbol"]["text-anchor"]),
    "text-max-angle": new DataConstantProperty(spec["layout_symbol"]["text-max-angle"]),
    "text-rotate": new DataDrivenProperty(spec["layout_symbol"]["text-rotate"]),
    "text-padding": new DataConstantProperty(spec["layout_symbol"]["text-padding"]),
    "text-keep-upright": new DataConstantProperty(spec["layout_symbol"]["text-keep-upright"]),
    "text-transform": new DataDrivenProperty(spec["layout_symbol"]["text-transform"]),
    "text-offset": new DataDrivenProperty(spec["layout_symbol"]["text-offset"]),
    "text-allow-overlap": new DataConstantProperty(spec["layout_symbol"]["text-allow-overlap"]),
    "text-ignore-placement": new DataConstantProperty(spec["layout_symbol"]["text-ignore-placement"]),
    "text-optional": new DataConstantProperty(spec["layout_symbol"]["text-optional"])
  });

  var paint$7 = new Properties({
    "icon-opacity": new DataDrivenProperty(spec["paint_symbol"]["icon-opacity"]),
    "icon-color": new DataDrivenProperty(spec["paint_symbol"]["icon-color"]),
    "icon-halo-color": new DataDrivenProperty(spec["paint_symbol"]["icon-halo-color"]),
    "icon-halo-width": new DataDrivenProperty(spec["paint_symbol"]["icon-halo-width"]),
    "icon-halo-blur": new DataDrivenProperty(spec["paint_symbol"]["icon-halo-blur"]),
    "icon-translate": new DataConstantProperty(spec["paint_symbol"]["icon-translate"]),
    "icon-translate-anchor": new DataConstantProperty(spec["paint_symbol"]["icon-translate-anchor"]),
    "text-opacity": new DataDrivenProperty(spec["paint_symbol"]["text-opacity"]),
    "text-color": new DataDrivenProperty(spec["paint_symbol"]["text-color"]),
    "text-halo-color": new DataDrivenProperty(spec["paint_symbol"]["text-halo-color"]),
    "text-halo-width": new DataDrivenProperty(spec["paint_symbol"]["text-halo-width"]),
    "text-halo-blur": new DataDrivenProperty(spec["paint_symbol"]["text-halo-blur"]),
    "text-translate": new DataConstantProperty(spec["paint_symbol"]["text-translate"]),
    "text-translate-anchor": new DataConstantProperty(spec["paint_symbol"]["text-translate-anchor"])
  });

  var properties$6 = {paint: paint$7, layout: layout$5};

  function SymbolStyleLayer(layer) {
    StyleLayer.call(this, layer, properties$6);
  }

  if (StyleLayer) SymbolStyleLayer.__proto__ = StyleLayer;
  SymbolStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
  SymbolStyleLayer.prototype.constructor = SymbolStyleLayer;

  SymbolStyleLayer.prototype.recalculate = function recalculate(parameters) {
    StyleLayer.prototype.recalculate.call(this, parameters);
    if (this.layout.get('icon-rotation-alignment') === 'auto') {
      if (this.layout.get('symbol-placement') !== 'point') {
        this.layout._values['icon-rotation-alignment'] = 'map';
      } else {
        this.layout._values['icon-rotation-alignment'] = 'viewport';
      }
    }
    if (this.layout.get('text-rotation-alignment') === 'auto') {
      if (this.layout.get('symbol-placement') !== 'point') {
        this.layout._values['text-rotation-alignment'] = 'map';
      } else {
        this.layout._values['text-rotation-alignment'] = 'viewport';
      }
    }
    if (this.layout.get('text-pitch-alignment') === 'auto') {
      this.layout._values['text-pitch-alignment'] = this.layout.get('text-rotation-alignment');
    }
    if (this.layout.get('icon-pitch-alignment') === 'auto') {
      this.layout._values['icon-pitch-alignment'] = this.layout.get('icon-rotation-alignment');
    }
  };

  SymbolStyleLayer.prototype.getValueAndResolveTokens = function getValueAndResolveTokens(name, feature) {
    var value = this.layout.get(name).evaluate(feature, {});
    var unevaluated = this._unevaluatedLayout._values[name];
    if (!unevaluated.isDataDriven() && !expressions.isExpression(unevaluated.value)) {
      return resolveTokens(feature.properties, value);
    }
    return value;
  };

  SymbolStyleLayer.prototype.createBucket = function createBucket(parameters) {
    return new SymbolBucket(parameters);
  };

  SymbolStyleLayer.prototype.queryRadius = function queryRadius() {
    return 0;
  };

  SymbolStyleLayer.prototype.queryIntersectsFeature = function queryIntersectsFeature() {
    return false;
  };

  return SymbolStyleLayer;
});