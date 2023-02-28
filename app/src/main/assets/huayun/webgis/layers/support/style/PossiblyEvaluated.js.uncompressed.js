define("com/huayun/webgis/layers/support/style/PossiblyEvaluated", [], function () {
  var PossiblyEvaluated = function PossiblyEvaluated(properties) {
    this._properties = properties;
    this._values = Object.create(properties.defaultPossiblyEvaluatedValues);
  };

  PossiblyEvaluated.prototype.get = function get(name) {
    return this._values[name];
  };

  return PossiblyEvaluated;
});