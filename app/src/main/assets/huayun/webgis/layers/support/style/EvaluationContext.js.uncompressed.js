define("com/huayun/webgis/layers/support/style/EvaluationContext", [
  "../../../utils/Color"
], function (Color) {
  var EvaluationContext = function EvaluationContext() {
    this.globals = null;
    this.feature = null;
    this.featureState = null;
    this._parseColorCache = {};
  };

  EvaluationContext.prototype.id = function id() {
    return this.feature && 'id' in this.feature ? this.feature.id : null;
  };

  EvaluationContext.prototype.geometryType = function geometryType() {
    return this.feature ? typeof this.feature.type === 'number' ? geometryTypes[this.feature.type] : this.feature.type : null;
  };

  EvaluationContext.prototype.properties = function properties() {
    return this.feature && this.feature.properties || {};
  };

  EvaluationContext.prototype.parseColor = function parseColor(input) {
    var cached = this._parseColorCache[input];
    if (!cached) {
      cached = this._parseColorCache[input] = Color.parse(input);
    }
    return cached;
  };

  return EvaluationContext;
});