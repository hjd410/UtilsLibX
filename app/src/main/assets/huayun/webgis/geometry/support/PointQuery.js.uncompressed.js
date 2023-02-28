define("com/huayun/webgis/geometry/support/PointQuery", [
  "custom/kdbush.min"
], function (KDBush) {
  function PointQuery() {
    this._data = null;
    this._index = null;
  }

  PointQuery.prototype.createIndex = function (data) {
    this._data = data || [];
    this._index = new KDBush(data, function (p) {
      return p.point.x
    }, function (p) {
      return p.point.y
    });
  };

  PointQuery.prototype.query = function (extent) {
    if (this._index) {
      return this._index.range(extent.minx, extent.miny, extent.maxx, extent.maxy).map(function (id) {
        return this._data[id];
      }.bind(this));
    } else {
      return [];
    }
  };

  return PointQuery;
});