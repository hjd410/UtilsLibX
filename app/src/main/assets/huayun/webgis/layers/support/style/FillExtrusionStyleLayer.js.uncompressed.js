define("com/huayun/webgis/layers/support/style/FillExtrusionStyleLayer", [
  "./StyleLayer",
  "./Properties",
  "./DataConstantProperty",
  "./DataDrivenProperty",
  "./CrossFadedDataDrivenProperty",
  "./spec",
  "../../../data/bucket/FillExtrusionBucket",
  "./styleUtils",
  "../../../geometry/intersection_tests"
], function (StyleLayer, Properties, DataConstantProperty, DataDrivenProperty, CrossFadedDataDrivenProperty, spec, FillExtrusionBucket, styleUtils, intersectionTests) {

  var paint$5 = new Properties({
    "fill-extrusion-opacity": new DataConstantProperty(spec["paint_fill-extrusion"]["fill-extrusion-opacity"]),
    "fill-extrusion-color": new DataDrivenProperty(spec["paint_fill-extrusion"]["fill-extrusion-color"]),
    "fill-extrusion-translate": new DataConstantProperty(spec["paint_fill-extrusion"]["fill-extrusion-translate"]),
    "fill-extrusion-translate-anchor": new DataConstantProperty(spec["paint_fill-extrusion"]["fill-extrusion-translate-anchor"]),
    "fill-extrusion-pattern": new CrossFadedDataDrivenProperty(spec["paint_fill-extrusion"]["fill-extrusion-pattern"]),
    "fill-extrusion-height": new DataDrivenProperty(spec["paint_fill-extrusion"]["fill-extrusion-height"]),
    "fill-extrusion-base": new DataDrivenProperty(spec["paint_fill-extrusion"]["fill-extrusion-base"]),
    "fill-extrusion-vertical-gradient": new DataConstantProperty(spec["paint_fill-extrusion"]["fill-extrusion-vertical-gradient"]),
    "fill-extrusion-terrain": new DataConstantProperty(spec["paint_fill-extrusion"]["fill-extrusion-terrain"])
  });

  var properties$4 = {paint: paint$5};

  function FillExtrusionStyleLayer(layer) {
    StyleLayer.call(this, layer, properties$4);
  }

  if (StyleLayer) FillExtrusionStyleLayer.__proto__ = StyleLayer;
  FillExtrusionStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
  FillExtrusionStyleLayer.prototype.constructor = FillExtrusionStyleLayer;

  FillExtrusionStyleLayer.prototype.createBucket = function createBucket(parameters) {
    return new FillExtrusionBucket(parameters);
  };

  FillExtrusionStyleLayer.prototype.queryRadius = function queryRadius() {
    return styleUtils.translateDistance(this.paint.get('fill-extrusion-translate'));
  };

  FillExtrusionStyleLayer.prototype.is3D = function is3D() {
    return true;
  };

  FillExtrusionStyleLayer.prototype.queryIntersectsFeature = function queryIntersectsFeature(queryGeometry, feature, featureState, geometry,
                                                                                             zoom, transform, pixelsToTileUnits, pixelPosMatrix) {

    var translatedPolygon = styleUtils.translate(queryGeometry,
      this.paint.get('fill-extrusion-translate'),
      this.paint.get('fill-extrusion-translate-anchor'),
      transform.angle, pixelsToTileUnits);

    /*var height = this.paint.get('fill-extrusion-height').evaluate(feature, featureState);
    var base = this.paint.get('fill-extrusion-base').evaluate(feature, featureState);

    var projectedQueryGeometry = projectQueryGeometry$1(translatedPolygon, pixelPosMatrix, transform, 0);

    var projected = projectExtrusion(geometry, base, height, pixelPosMatrix);
    var projectedBase = projected[0];
    var projectedTop = projected[1];
    return checkIntersection(projectedBase, projectedTop, projectedQueryGeometry);*/
    return intersectionTests.polygonIntersectsMultiPolygon(translatedPolygon, geometry);
  };

  return FillExtrusionStyleLayer;
});