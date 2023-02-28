define("com/huayun/webgis/layers/support/style/EvaluationParameters", [
  "../ZoomHistory"
], function (ZoomHistory) {
  var EvaluationParameters = function EvaluationParameters(zoom, options) {
    this.zoom = zoom;
    if (options) {
      this.now = options.now;
      this.fadeDuration = options.fadeDuration;
      this.zoomHistory = options.zoomHistory;
      this.transition = options.transition;
    } else {
      this.now = 0;
      this.fadeDuration = 0;
      this.zoomHistory = new ZoomHistory();
      this.transition = {};
    }
  };

  EvaluationParameters.prototype.isSupportedScript = function isSupportedScript(str) {
    // todo
    // return isStringInSupportedScript(str, plugin.isLoaded());
  };

  EvaluationParameters.prototype.crossFadingFactor = function crossFadingFactor() {
    if (this.fadeDuration === 0) {
      return 1;
    } else {
      return Math.min((this.now - this.zoomHistory.lastIntegerZoomTime) / this.fadeDuration, 1);
    }
  };

  EvaluationParameters.prototype.getCrossfadeParameters = function getCrossfadeParameters() {
    var z = this.zoom;
    var fraction = z - Math.floor(z);
    var t = this.crossFadingFactor();

    return z > this.zoomHistory.lastIntegerZoom ?
      {fromScale: 2, toScale: 1, t: fraction + (1 - fraction) * t} :
      {fromScale: 0.5, toScale: 1, t: 1 - (1 - t) * fraction};
  };

  return EvaluationParameters;
});