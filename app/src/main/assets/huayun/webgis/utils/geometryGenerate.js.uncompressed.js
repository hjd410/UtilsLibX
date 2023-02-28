define("com/huayun/webgis/utils/geometryGenerate", [
  "exports",
  "../geometry/Point",
  "../geometry/Polyline"
], function (exports, Point, Polyline) {
  function generateBezierCurve(sp, mp, ep, segment) {
    segment = segment || 50;
    var delta = 1 / segment;
    var points = [];
    var left;
    for (var i = 0; i <= 1; i += delta) {
      left = 1 - i;
      points.push(new Point(
        left * left * sp.x + 2 * i * left * mp.x + i * i * ep.x,
        left * left * sp.y + 2 * i * left * mp.y + i * i * ep.y
      ))
    }
    left = 0;
    i = 1;
    points.push(new Point(
      left * left * sp.x + 2 * i * left * mp.x + i * i * ep.x,
      left * left * sp.y + 2 * i * left * mp.y + i * i * ep.y
    ));
    return new Polyline([points]);
  }

  function generateBezierCurvePoints(sp, mp, ep, segment) {
    segment = segment || 50;
    var delta = 1 / segment;
    var points = [];
    var left;
    for (var i = 0; i < 1; i += delta) {
      left = 1 - i;
      points.push(new Point(
        left * left * sp.x + 2 * i * left * mp.x + i * i * ep.x,
        left * left * sp.y + 2 * i * left * mp.y + i * i * ep.y
      ));
    }
    left = 0;
    i = 1;
    points.push(new Point(
      left * left * sp.x + 2 * i * left * mp.x + i * i * ep.x,
      left * left * sp.y + 2 * i * left * mp.y + i * i * ep.y
    ));
    return points;
  }

  exports.generateBezierCurve = generateBezierCurve;

  exports.generateBezierPointsByTwoPoints = function (sp, ep, segment) {
    segment = segment || 50;
    var len = sp.dist(ep) / 4;
    var normal = sp.sub(ep)._perp()._unit()._mult(len);
    var cx = (sp.x + ep.x) / 2 + normal.x,
      cy = (sp.y + ep.y) / 2 + normal.y;
    return generateBezierCurvePoints(sp, {x:cx, y: cy}, ep, segment);
  };

  exports.generateBezierCurveByTwoPoints = function (sp, ep, segment, curvature) {
    segment = segment || 50;
    curvature = curvature||4;
    var len = sp.dist(ep) / curvature;
    var unitNormal= sp.sub(ep)._perp()._unit();
    var normal = unitNormal.mult(len);
    var cx = (sp.x + ep.x) / 2 + normal.x,
      cy = (sp.y + ep.y) / 2 + normal.y;
    return {
      line: generateBezierCurve(sp, {x:cx, y: cy}, ep, segment),
      normal: unitNormal,
      middle: new Point(cx, cy)
    }
  }
});