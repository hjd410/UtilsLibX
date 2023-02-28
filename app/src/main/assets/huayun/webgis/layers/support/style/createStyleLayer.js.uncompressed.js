define("com/huayun/webgis/layers/support/style/createStyleLayer", [
  "./BackgroundStyleLayer",
  "./FillStyleLayer",
  "./LineStyleLayer",
  "./SymbolStyleLayer",
  "./FillExtrusionStyleLayer"
], function (BackgroundStyleLayer, FillStyleLayer, LineStyleLayer, SymbolStyleLayer, FillExtrusionStyleLayer) {
   function createStyleLayer(layer) {
    switch (layer.type) {
      case "fill":
        return new FillStyleLayer(layer);
      case "line":
        return new LineStyleLayer(layer);
      case "symbol":
        return new SymbolStyleLayer(layer);
      case "background":
        return new BackgroundStyleLayer(layer);
      case "fill-extrusion":
        return new FillExtrusionStyleLayer(layer);
      /*case "line-extrusion":
        return new LineExtrusionStyleLayer(layer);
      case "heatmap":
        return new HeatmapStyleLayer(layer);
      case "circle":
        return new CircleStyleLayer(layer);*/
    }
  }
  return createStyleLayer;
});