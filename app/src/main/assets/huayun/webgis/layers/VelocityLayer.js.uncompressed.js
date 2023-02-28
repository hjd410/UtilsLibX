define("com/huayun/webgis/layers/VelocityLayer", [
  "./Layer",
  "../views/3d/layers/VelocityLayerView3D"
], function (Layer, VelocityLayerView3D) {
  var VelocityLayer = function (params) {
    Layer.call(this, params);
    this.id = params.id === undefined ? "velocity" : params.id;
    this.opacity = params.opacity === undefined ? 1 : params.opacity;
    this.visible = params.visible === undefined ? true : params.visible;
    this.data = null;
  };
  if (Layer) VelocityLayer.__proto__ = Layer;
  VelocityLayer.prototype = Object.create(Layer && Layer.prototype);
  VelocityLayer.prototype.constructor = VelocityLayer;

  VelocityLayer.prototype.createLayerView = function (view, option) {
    var layerView = new VelocityLayerView3D({
      visible: this.visible,
      view: view,
      id: this.id,
      opacity: this.opacity,
      layer: this
    });
    this.layerView = layerView;
    layerView.transform = view.viewpoint;
    return layerView;
  };

  VelocityLayer.prototype.setData = function (data) {
    this.data = data;
    this._buildGrid(data);
  };

  VelocityLayer.prototype._buildGrid = function (data) {
    this.builder = this._createBuilder(data);
    var header = this.builder.header;
    this.lonMin = header.lo1;
    this.latMax = header.la1;
    this.dx = header.dx;
    this.dy = header.dy;
    this.nx = header.nx;
    this.ny = header.ny;

    this.date = new Date(header.refTime);
    this._grid = [];
    var p = 0;
    for (var j = 0; j < this.ny; j++) {
      var row = [];
      for (var i = 0; i < this.nx; i++, p++) {
        row[i] = this.builder.data(p);
      }
      this._grid[j] = row;
    }
    this.interpolateGrid = {
      date: this.date,
      interpolate: this.interpolate
    };
  };

  VelocityLayer.prototype._createBuilder = function (data) {
    var uComp = null,
      vComp = null,
      scalar = null;
    data.forEach(function (record) {
      switch (record.header.parameterCategory + "," + record.header.parameterNumber) {
        case "1,2":
        case "2,2":
          uComp = record; // 水平方向数据
          break;
        case "1,3":
        case "2,3":
          vComp = record; // 竖直方向数据
          break;
        default:
          scalar = record;
      }
    });
    var uData = uComp.data,
      vData = vComp.data;
    return {
      header: uComp.header,
      data: function data(i) {
        return [uData[i], vData[i]];
      },
      interpolate: this._bilinearInterpolateVector
    }
  };

  VelocityLayer.prototype._bilinearInterpolateVector = function (x, y, g00, g10, g01, g11) {
    var rx = 1 - x;
    var ry = 1 - y;
    var a = rx * ry,
      b = x * ry,
      c = rx * y,
      d = x * y;
    var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
    var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
    return [u, v, Math.sqrt(u * u + v * v)];
  };

  VelocityLayer.prototype.repaint = function() {
    this.layerView.repaint();
  };

  VelocityLayer.prototype.interpolate = function (x, y) {
    if (!this._grid) return null;

    var i = (x - this.lonMin) / this.dx,
      j = (this.latMax - y) / this.dy;

    //计算网格点在从上到下，从左到右，以最小刻度为0的第几个经纬度格点上
    var fi = Math.floor(i), //格点的上一行
      ci = fi + 1; //格点的下一行
    var fj = Math.floor(j), //格点的前一列
      cj = fj + 1; //格点的后一列
    var row = this._grid[fj];
    if (row) {
      var g00 = row[fi];
      var g10 = row[ci];
      if (this._isValue(g00) && this._isValue(g10) && (row = this._grid[cj])) {
        var g01 = row[fi];
        var g11 = row[ci];
        //计算出格点周围4个点
        if (this._isValue(g01) && this._isValue(g11)) {
          return this.builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
        }
      }
    }
    return null;
  };

  VelocityLayer.prototype._isValue = function (x) {
    return x !== null && x !== undefined;
  };

  VelocityLayer.prototype.stop = function () {
    this.layerView.stop();
  };

  VelocityLayer.prototype.setVisible = function (visible) {
    this.visible = visible;
    this.layerView.setVisible(visible);
  };


  return VelocityLayer;
});